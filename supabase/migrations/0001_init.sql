-- ClassWall 匿名問答牆 schema（含按讚硬化）
-- 整檔冪等：可重複執行不會 mutate data / 不會重複 grant
-- 在 Supabase Dashboard → SQL Editor 貼整段，或 `supabase db push` 自動套用

-- 1. questions 表
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 500),
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists questions_likes_created_idx
  on public.questions (likes desc, created_at desc);

-- 2. answers 表（一對多：一個 question 有多個 answers）
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists answers_question_id_idx
  on public.answers (question_id);

-- 3. 按讚去重表：一個 anon_id 對一題只能 +1 一次（DB 端強制）
create table if not exists public.question_likes (
  question_id uuid not null references public.questions (id) on delete cascade,
  anon_id text not null,
  created_at timestamptz not null default now(),
  primary key (question_id, anon_id)
);

create index if not exists question_likes_question_id_idx
  on public.question_likes (question_id);

-- 4. 開啟 Realtime（idempotent：判斷表是否已在 publication 內再加）
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'questions'
  ) then
    execute 'alter publication supabase_realtime add table public.questions';
  end if;
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'answers'
  ) then
    execute 'alter publication supabase_realtime add table public.answers';
  end if;
end $$;

-- 5. RLS
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.question_likes enable row level security;
-- ⚠️ question_likes 故意「不給任何 policy」→ anon 完全摸不到，
--    只有下方 SECURITY DEFINER 函式以 owner (postgres) 身份能寫入

drop policy if exists "anyone can read questions" on public.questions;
create policy "anyone can read questions"
  on public.questions for select
  using (true);

drop policy if exists "anyone can insert questions" on public.questions;
create policy "anyone can insert questions"
  on public.questions for insert
  with check (true);

-- ⚠️ 不再給 anon UPDATE 權限 — 按讚一律走下方 RPC
drop policy if exists "anyone can like questions" on public.questions;

drop policy if exists "anyone can read answers" on public.answers;
create policy "anyone can read answers"
  on public.answers for select
  using (true);

drop policy if exists "anyone can insert answers" on public.answers;
create policy "anyone can insert answers"
  on public.answers for insert
  with check (true);

-- 6. RPC：原子地寫去重 row + bump likes
-- SECURITY DEFINER → 以 owner (postgres) 身份執行，能寫 question_likes（anon 無 policy）
-- set search_path 鎖死 → 防 search_path injection（SECURITY DEFINER 必備）
create or replace function public.increment_question_like(
  qid uuid,
  anon text
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_likes integer;
begin
  insert into public.question_likes (question_id, anon_id)
  values (qid, anon)
  on conflict do nothing;

  if found then
    update public.questions
       set likes = likes + 1
     where id = qid
    returning likes into new_likes;
  else
    select likes into new_likes
      from public.questions
     where id = qid;
  end if;

  return new_likes;
end;
$$;

revoke all on function public.increment_question_like(uuid, text) from public;
grant execute on function public.increment_question_like(uuid, text) to anon, authenticated;

comment on function public.increment_question_like(uuid, text) is
  'Atomically insert dedup row + increment questions.likes. Anon-callable via supabase.rpc().';

-- 7. seed：一筆示範資料
insert into public.questions (content, likes)
values ('歡迎來到 ClassWall！按下「我也想問 +1」試試看 🎉', 0)
on conflict do nothing;
