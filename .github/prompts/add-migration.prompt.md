---
description: "新增一個 Supabase migration 檔（含 RLS + Realtime + idempotent 套版）"
---

# 任務：新增 Supabase migration

請幫我在 `supabase/migrations/` 新增一個 migration 檔。

## 步驟

1. 看 `supabase/migrations/` 現有檔案，找出下一個編號（例如已有 `0001_init.sql` → 新檔是 `0002_*.sql`）
2. 詢問我這次要做什麼（加表？加欄位？加 view？）並命名 `<purpose>` (snake_case)
3. 產出 `supabase/migrations/000N_<purpose>.sql`，內容須 idempotent（可重跑）
4. 提醒我到 Supabase Dashboard → SQL Editor 貼上整個檔案 → Run
5. 若有新表要 Realtime，README troubleshooting 補一行說明

## 必含區塊（依需要）

```sql
-- Schema
create table if not exists public.<table> (
  id uuid primary key default gen_random_uuid(),
  -- columns...
  created_at timestamptz not null default now()
);

-- Index
create index if not exists <table>_<col>_idx on public.<table> (<col>);

-- RLS
alter table public.<table> enable row level security;

drop policy if exists "<table>_select_anon" on public.<table>;
create policy "<table>_select_anon" on public.<table>
  for select to anon using (true);

drop policy if exists "<table>_insert_anon" on public.<table>;
create policy "<table>_insert_anon" on public.<table>
  for insert to anon with check (length(content) > 0);

-- Realtime
alter publication supabase_realtime add table public.<table>;

-- Seed (可選)
insert into public.<table> (...) values (...) on conflict do nothing;
```

## 規範

- **不要**修改 `0001_init.sql`
- 編號**遞增不跳號**
- 所有 DDL 用 `if not exists` / `drop ... if exists; create ...` 確保可重跑
- anon 寫入欄位記得在 RLS `with check` 加合理約束
