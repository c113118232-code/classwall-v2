---
applyTo: "src/lib/supabase.ts,src/app/**/*.tsx,src/components/**/*.tsx,supabase/**"
description: "Supabase client / RLS / Realtime / migration 規範"
---

# Supabase 規範

## Client

- `src/lib/supabase.ts` 是 **browser-only** client，預設只能在 `"use client"` 元件 import
- 要在 Server Component / Route Handler 用 Supabase，請另寫 server client（用 `cookies()` + `createServerClient`），**不要**直接 import 現有那支
- 前端**永遠**用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，**禁止**在前端用 `service_role` key

## Realtime channel

訂閱 `postgres_changes` 時務必 cleanup，pattern 參考 `src/app/page.tsx`：

```ts
useEffect(() => {
  const channel = supabase
    .channel("xxx-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "questions" },
      (payload) => {
        /* ... */
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

漏掉 `removeChannel` 會導致重複訂閱、記憶體洩漏。

## 改 schema 流程

- **絕對不要**修改 `supabase/migrations/0001_init.sql`
- 新增改動寫成 `supabase/migrations/000N_<purpose>.sql`，編號遞增不跳號
- 任何新表 / 新欄位都要：
  1. `create table if not exists ...`
  2. 必要的 index
  3. `alter table ... enable row level security;`
  4. RLS policies（anon select / insert / update 視需求）
  5. `alter publication supabase_realtime add table <new_table>;`（如需 Realtime）

## RLS 預設策略

- anon 可 SELECT
- anon 可 INSERT（content 不為空）
- anon 可 UPDATE 特定欄位（例如 `likes`），其他欄位 deny
- 加新欄位若要 anon 寫入，記得更新 update policy 的 `with check` 條件

## Tables

| Table       | 欄位重點                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------- |
| `questions` | `id uuid pk`、`content text`、`likes int default 0`、`created_at timestamptz`                |
| `answers`   | `id`、`question_id uuid references questions(id) on delete cascade`、`content`、`created_at` |
