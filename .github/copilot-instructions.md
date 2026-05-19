# ClassWall — Copilot Instructions

> 5 小時「AI 程式開發實戰」課程的成品 starter。教學優先：**程式碼好讀、好拆解、好用 Copilot 改造**。
> 規範 source of truth 是專案根目錄的 `AGENTS.md`；本檔是給 GitHub Copilot 的衍生簡化版，兩邊不一致時以 `AGENTS.md` 為準。

## Tech stack

- Next.js 16（App Router）+ React 19
- Tailwind CSS v4（**inline `@theme` 在 `globals.css`，沒有 `tailwind.config.js`**）
- shadcn/ui（`base-nova` style preset）
- Supabase（PostgreSQL + Realtime；`@supabase/supabase-js` v2，前端只用 anon key）
- TypeScript strict、ESLint flat config、Prettier

## Critical rules（這些一定要遵守）

### Tailwind v4

- 用 `bg-linear-to-r` / `bg-linear-to-b`，**不要**用 `bg-gradient-to-r`（v4 已改名）
- Theme tokens 寫在 `src/app/globals.css` 的 `@theme inline {}` + `:root {}`
- **不要新增 `tailwind.config.js`**——本專案使用 v4 inline theme

### Server vs Client components

- 預設是 Server Component
- 用到 `useState` / `useEffect` / event handler 必須在檔頂寫 `"use client"`
- `src/lib/supabase.ts` 是 browser-only client；要在 server 端用就明確改寫成 server client，不要混用

### Supabase

- 前端**只能**用 `anon` key，never `service_role`
- 表名 `questions` / `answers`，schema 在 `supabase/migrations/0001_init.sql`
- 改 schema 一律新增 `supabase/migrations/000N_xxx.sql`，**不要改舊的 migration**
- 加新表/欄位記得補 RLS policy + `alter publication supabase_realtime add table`
- `useEffect` 訂閱 channel 時務必 cleanup `supabase.removeChannel(channel)`

### shadcn 元件

- 加新元件用 `npx shadcn@latest add <name>`，會放到 `src/components/ui/`
- **不要**手改 `components.json` 的 `style` 欄位（preset 是 `base-nova`）
- 不要自己刻 button / card / textarea，用 shadcn 既有元件

### 命名與註解

- UI 文案保持中文（學生看的是中文教材）
- 註解用繁體中文，但變數名/函式名用英文
- 不要把 page / component 改成英文命名

## Code style

- Prettier: `semi: true, singleQuote: false, printWidth: 80, tabWidth: 2`
- 表單 `onSubmit` handler 先 `event.preventDefault()` 再 await Supabase
- 寫 `useEffect` 必加 cleanup（特別是 Supabase channel）
- 不要過度抽象——教學專案，淺顯易懂優先

## File map

| 路徑                                | 用途                                           |
| ----------------------------------- | ---------------------------------------------- |
| `src/app/page.tsx`                  | 首頁：列表 + 表單 + Realtime（`"use client"`） |
| `src/app/layout.tsx`                | 根 layout + Geist fonts + metadata             |
| `src/app/globals.css`               | Tailwind v4 + shadcn theme tokens              |
| `src/components/question-form.tsx`  | 發問表單                                       |
| `src/components/question-card.tsx`  | 問題卡 + 按讚                                  |
| `src/components/ui/`                | shadcn 元件（button、card、textarea）          |
| `src/lib/supabase.ts`               | browser-side Supabase client                   |
| `src/lib/utils.ts`                  | `cn()` helper                                  |
| `src/types/database.ts`             | Question / Answer types                        |
| `supabase/migrations/0001_init.sql` | schema + RLS + Realtime + seed                 |
| `.env.example`                      | 環境變數範本                                   |

## Verification before commit

```bash
npm run lint
npm run format:check
npm run build
```

## When unsure

- 看 `AGENTS.md` 取得完整規範
- Next.js 16 行為差異請讀 `node_modules/next/dist/docs/`
- 路徑特化規則參考 `.github/instructions/*.instructions.md`
- 常見任務（加元件、加頁面、加 migration）參考 `.github/prompts/*.prompt.md`
