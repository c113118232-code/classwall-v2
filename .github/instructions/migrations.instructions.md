---
applyTo: "supabase/migrations/**"
description: "Supabase migration 檔案規範"
---

# Migration 規範

## 檔名

- 格式：`000N_<purpose>.sql`
- 編號**遞增不跳號**：`0001_init.sql` → `0002_add_answers_likes.sql` → `0003_xxx.sql`
- `<purpose>` 用英文 snake_case，描述這次 migration 做什麼

## **不要改 `0001_init.sql`**

那是基準 schema，學生在 Supabase SQL Editor 第一次跑的就是它。要改 schema 一律新增 `0002_xxx.sql`。

## 必含區塊

每個 migration 檔依需要包含：

```sql
-- 1. Schema 變更（idempotent）
create table if not exists public.<table> (
  id uuid primary key default gen_random_uuid(),
  -- ...
  created_at timestamptz not null default now()
);

-- 2. Index
create index if not exists <table>_<col>_idx on public.<table> (<col>);

-- 3. RLS
alter table public.<table> enable row level security;

drop policy if exists "<policy_name>" on public.<table>;
create policy "<policy_name>" on public.<table>
  for select to anon
  using (true);

-- 4. Realtime publication（如需即時更新）
alter publication supabase_realtime add table public.<table>;

-- 5. Seed（可選）
insert into public.<table> (...) values (...) on conflict do nothing;
```

## Idempotent 原則

學生可能會重跑同一份 migration——所有語句都要能重複執行不出錯：

- `create table if not exists`
- `create index if not exists`
- `drop policy if exists ... ; create policy ...`
- `insert ... on conflict do nothing`
- `alter publication supabase_realtime add table` 若已加過會報錯，可先 `drop publication ...` 再 `add` 或用 `do $$ ... exception when others ...$$`

## RLS 起手式

- `for select to anon using (true)` — 公開讀
- `for insert to anon with check (length(content) > 0)` — anon 可發問但內容不為空
- `for update to anon using (true) with check (id = old.id)` — 只允許 update 特定欄位（搭配 column-level grant）

## Realtime 提醒

加新表後若要在前端訂閱 `postgres_changes`，記得：

1. SQL 加 `alter publication supabase_realtime add table public.<table>;`
2. README troubleshooting 同步補一行說明
