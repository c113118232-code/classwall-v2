<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# ClassWall — Agents Guide

5 小時「AI 程式開發實戰」課程的成品 starter。教學用途優先：**程式碼要好讀、好拆解、好用 Copilot 改造**。

> 給 GitHub Copilot 學生使用者：等價規則放在 `.github/copilot-instructions.md` 與 `.github/instructions/`。兩邊內容若不一致，**以本檔為準**（source of truth）。

## Tech stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4（**inline `@theme` in `globals.css`，沒有 `tailwind.config.js`**）
- shadcn/ui (`base-nova` style，`components.json` 已設好)
- Supabase（PostgreSQL + Realtime；`@supabase/supabase-js` v2）
- TypeScript strict, ESLint flat config, Prettier

## File map

```
src/app/page.tsx              首頁：列表 + 表單 + Realtime（"use client"）
src/app/layout.tsx            根 layout + Geist fonts + metadata
src/app/globals.css           Tailwind v4 + shadcn theme tokens
src/components/question-form.tsx   發問表單（"use client"）
src/components/question-card.tsx   問題卡 + 按讚（"use client"）
src/components/ui/            shadcn elements（button, card, textarea）
src/lib/supabase.ts           browser-side client，env 缺失時 console.error
src/lib/utils.ts              cn() helper
src/lib/anon-id.ts            localStorage UUID（按讚 dedup key）
src/lib/liked-store.ts        已按讚題目 (localStorage)
src/types/database.ts         Question / Answer types
supabase/migrations/0001_init.sql   schema + RLS + Realtime + 按讚 RPC + seed
.env.example                  環境變數範本（NEXT_PUBLIC_SUPABASE_URL/ANON_KEY）
```

## Conventions

### Tailwind v4

- 用 `bg-linear-to-r` **不要**用 `bg-gradient-to-r`（v4 已改名）
- Theme tokens 在 `src/app/globals.css` 的 `@theme inline {}` + `:root {}`
- 加新色票：在 `:root`/`.dark` 補 `--xxx`，再到 `@theme inline` 加 `--color-xxx: var(--xxx)`

### Server vs Client components

- 預設是 Server Component；用到 `useState` / `useEffect` / event handler 必須在檔案頂寫 `"use client"`
- Supabase client（`src/lib/supabase.ts`）目前是 browser-only：在 Server Component import 它**不會** throw（會用 placeholder URL），但實際呼叫會失敗。要在 Server 端用就改成 server client 模式。

### Supabase

- 表名：`questions`、`answers`、`question_likes`（schema 定義在 `supabase/migrations/0001_init.sql`）
- RLS 政策：anon 只能 `SELECT` / `INSERT` questions/answers。**按讚一律走 `increment_question_like(qid, anon)` RPC**（SECURITY DEFINER），anon 對 `questions.likes` 沒有直接 UPDATE 權限，`question_likes` 表更是完全摸不到（避免被 PATCH 偽造 likes 數字）
- Realtime publication 已加 `questions`、`answers` 兩張表
- 教學情境一張 `0001_init.sql` 走到底，**所有 schema 變動冪等寫進 0001**（`create if not exists` / `drop if exists` / `create or replace`），學生用 Supabase SQL Editor 或 `supabase db push` 重跑即可

### shadcn 元件

- 加新元件：`npx shadcn@latest add <name>`，會放到 `src/components/ui/`
- 風格 preset 是 `base-nova`，**不要**手動修改 `components.json` 的 style 欄位

### Code style

- 註解用繁體中文（教學受眾），但變數名/函式名用英文
- Prettier: `semi: true, singleQuote: false, printWidth: 80`
- 寫 `useEffect` 時務必加 cleanup（特別是 Supabase channel `removeChannel`）
- 表單 onSubmit handler 加 `event.preventDefault()` 後再 await Supabase

## Don'ts

- **不要 commit `.env.local`** — `.gitignore` 已擋，但 review 時還是要看
- **不要在前端用 `service_role` key** — 只能用 `anon` key
- **不要新增 `tailwind.config.js`** — 此專案使用 Tailwind v4 inline theme
- **不要把 ClassWall 的核心邏輯重構成過度抽象**（教學用，淺顯易懂優先）
- **不要把 page/component 命名改成英文** — 學生看的是中文教材，UI 文案保持中文
- **不要還原 anon UPDATE 權限** — 按讚一律走 RPC，否則 `likes` 會被前端任意 PATCH 偽造

## Common tasks

| 想做什麼         | 怎麼做                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------- |
| 加新 shadcn 元件 | `npx shadcn@latest add <name>`                                                            |
| 加新環境變數     | 同步更新 `.env.example` + README troubleshooting + Vercel 設定提醒                        |
| 改 schema        | 改 `supabase/migrations/0001_init.sql`（保持冪等），`supabase db push` 或 SQL Editor 重跑 |
| 加新頁面         | `src/app/<route>/page.tsx`，用到 hooks 記得 `"use client"`                                |
| 跑驗證           | `npm run lint && npm run format:check && npm run build`                                   |

## Verification before commit

```bash
npm run lint
npm run format:check   # 沒過就跑 npm run format
npm run build          # 確保 prerender 不掛（缺 env 時也要能 build）
```
