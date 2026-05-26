---
description: "打包「加一個小功能」的完整流程：plan → code → verify → commit → PR"
---

# 任務：完整功能上線流程

請幫我從規劃到提 PR 一條龍上線一個小功能。輸入：

```
/ship-feature <一句話描述功能>
```

例如：

- `/ship-feature 首頁加依讚數排序按鈕`
- `/ship-feature 問題卡顯示建立時間`
- `/ship-feature 加 /about 頁面`

## 使用方式

只需給我**一句話**描述想做什麼，我會自動走完 6 個步驟：

| 範例                                  | 說明                            |
| ------------------------------------- | ------------------------------- |
| `/ship-feature 首頁加依讚數排序按鈕`  | 在 questions 列表上方加排序選項 |
| `/ship-feature 問題卡顯示 created_at` | 問題卡上顯示「2 小時前」        |
| `/ship-feature 加 /about 頁面`        | 新增 `/about` 路由頁面          |

## 步驟

### 1️⃣ 讀規範 + 確認業務範圍

- 讀 `AGENTS.md` 全文
- 讀所有相關的 `.github/instructions/*.instructions.md`（根據功能性質挑 glob match 的）
- **列出 3-5 條相關規則**（例如：「Tailwind v4 用 `bg-linear-*` 不是 `bg-gradient-*`」）
- 確認功能有沒有超出 ClassWall 教學範疇（教學為先，不做過度複雜功能）

### 2️⃣ 查 schema + 資料現況

- 用 Supabase MCP 查現有 schema（表、欄位、RLS）
- 查資料量（SELECT 統計 row count，只用 SELECT 指令，禁止寫）
- 列出**需要改什麼 schema**（如果需要）或**只改代碼**

  ⚠️ **只准 SELECT，禁止 INSERT/UPDATE/DELETE** — 如果沒裝 Supabase MCP，請使用者：
  - 要嘛自己貼 schema（從 `supabase/migrations/0001_init.sql` 複製）
  - 要嘛我改用 `read_file` 讀 migration 檔

### 3️⃣ 提計畫（暫停等回應）

提一份計畫，包括：

- **📋 檔案清單**（新增/修改哪些檔案、路徑、行數）
- **🗄️ Schema 補丁**（如果需要改 `0001_init.sql`）
- **⚠️ 風險**（有沒有 RLS 漏洞、性能問題、相依性）
- **💬 Commit message**（例：`feat: add sorting by likes on homepage`）
- **🔗 PR title**（例：`Add sorting by likes on homepage`）

**🛑 停下來，等使用者回「OK 開始動」才能繼續**

### 4️⃣ 動 code（遵守規則，不超出計畫範圍）

- 建新分支：`git checkout -b <feat|fix|chore>/<slug>`（slug 要 kebab-case）
- 依計畫**不超出範圍**一個個改檔
- 遵守規範：
  - **Tailwind v4**：用 `bg-linear-to-r` / `bg-linear-to-b`，**不要**用 `bg-gradient-to-r`
  - **Schema 改動**：**全部寫進** `supabase/migrations/0001_init.sql`，保持冪等（`if not exists` / `drop ... if exists` 套版）
  - **按讚機制**：走 `increment_question_like(qid, anon_id)` RPC，**不要**直接 UPDATE `questions.likes`
  - **中文文案**，英文變數名
  - **useEffect cleanup**：Supabase channel 必須 `supabase.removeChannel(channel)`
  - **useEffect 加 dependency array**

### 5️⃣ 驗證（依序跑，任一失敗停下來修）

依序執行，**任何一個失敗就停下來，不准 `--no-verify` / `--force`**：

```bash
pnpm lint
pnpm format:check
pnpm build
```

如果有一個失敗：

- 印出完整錯誤訊息
- 問使用者：「要修嗎？還是回頭改計畫？」
- 不准跳過驗證直接 commit

### 6️⃣ Commit + 開 PR

只有驗證全過後才能做：

```bash
git add .
git commit -m "feat: <描述>"
git push -u origin HEAD
gh pr create --title "..." --body "..."
```

PR body 用 heredoc，包括：

- **Summary** bullet（做了什麼、為什麼）
- **Test plan** checklist（怎麼驗證功能正常）

## 規範

- ✅ **必讀計畫**：永遠不跳過第 3 步（plan）
- ✅ **先開分支**：永遠不在 `main` 直接 commit
- ✅ **通過檢查**：失敗不准 `--no-verify` / `--force`
- ✅ **不 commit 垃圾**：`node_modules` / `.next` / `.env.local` 已在 `.gitignore`，double-check 別手誤 add
- ✅ **RLS 必須加**：改表就必須補 RLS policy，改 Realtime 就補 `alter publication`
- ✅ **格式一致**：跟現有代碼風格一致（imports 順序、空行、引號用 double）

## 常見卡關

### Supabase MCP 沒裝

- **症狀**：「Supabase tools 不可用」
- **解法**：使用者在終端跑 `npx skills add supabase/agent-skills`，或直接貼 schema 給我

### `gh` 沒登入

- **症狀**：第 6 步 `gh pr create` 失敗
- **解法**：使用者跑 `gh auth login` 並選 GitHub CLI 登入方式，再重試

### lint / format / build 失敗

- **症狀**：第 5 步有任何一個 fail
- **解法**：
  1. 印完整錯誤訊息（不要摘要）
  2. 問使用者「修代碼還是改計畫」
  3. 等使用者確認後重新驗證

### 忘記在檔案頂加 `"use client"`

- **症狀**：用了 `useState` / `useEffect` 但沒 `"use client"`，build fail
- **解法**：檢查有沒有 hooks + event handler，有的話檔頂加 `"use client";`

### Realtime channel 沒 cleanup

- **症狀**：useEffect 沒有 cleanup function，導致重複訂閱
- **解法**：檢查 `useEffect` 末尾一定要 `return () => supabase.removeChannel(channel)`

### Schema 改了但沒加 RLS

- **症狀**：新表沒 RLS，anon 用戶無法 SELECT/INSERT
- **解法**：檢查 `migrations/0001_init.sql`，新表下面一定要有 `alter table enable row level security` + `create policy`
