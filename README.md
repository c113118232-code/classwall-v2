# 🎮 AI 程式開發實戰 — ClassWall 匿名問答牆

5 小時，從 0 到上線，用 GitHub Copilot 帶你做出一個可以給全班用的網站 —— **ClassWall 匿名問答牆**。

> 完整課程（Notion）：[🎮 AI 程式開發實戰](https://www.notion.so/AI-2fdad1e31336800ea9a1efb7069d7659)

這個 repo 是課程的**完整成品 starter**：clone 下來、設好 `.env.local`、跑 SQL，就能立刻看到課程最後的樣子（含 Realtime + 按讚）。學生上課時建議用 **Use this template** 建立自己的 repo，搭配 Notion 教材一步一步做。

---

## 🎯 課程目標

學完之後，你會擁有：

- **一個自己的網站**掛在網路上，可以用手機打開
- 一個 **GitHub repo**，裡面有完整的開發歷程
- 學會和 **AI 協作寫程式**的基本能力
- 把資料庫正課學的知識**真的用出來**

## 🛠️ 技術棧

- **前端**：Next.js 16（App Router）+ Tailwind CSS v4 + shadcn/ui
- **後端 / 資料庫**：Supabase（PostgreSQL + Realtime）
- **部署**：Vercel
- **版本控制**：Git + GitHub
- **AI 助手**：GitHub Copilot

---

## 📚 課程大綱

對照 Notion 子頁面：

### 📖 基礎知識

- [前言](https://www.notion.so/2fdad1e3133680eeb434f8ef4aa390df)
- [課前準備](https://www.notion.so/34aad1e313368104b9dedf9edc39f681) — 註冊 GitHub / Supabase / Vercel、安裝 Node、Git、VS Code + Copilot
- [今天要做什麼：ClassWall 匿名問答牆](https://www.notion.so/ClassWall-34aad1e313368112bd65f911e5e881da)

### 🧱 核心工具

- [Git 教學](https://www.notion.so/Git-2fdad1e3133680448352c0749d5a579d)
- [AI 開發基本知識](https://www.notion.so/AI-2fdad1e3133680b58451eed065a63200)
- [開發工具介紹](https://www.notion.so/34aad1e31336816309e92cfac4b4e12c0)

### 🚀 實戰演練：從 0 到上線

- [Step 1：建立 GitHub Repo](https://www.notion.so/34aad1e3133681649ee2e0bec0dde993) — _本 starter 已建好；學生用 Use this template 取代_
- [Step 1.5：Git + PR 深入教學](https://www.notion.so/2fdad1e3133680448352c0749d5a579d) — _branch + 完整 PR 流程，Step 4 起會反覆用到_
- [Step 2：Supabase 建資料庫](https://www.notion.so/34aad1e3133681378631d3d180f37c13) — _跑 `supabase/migrations/0001_init.sql`_
- [Step 3：部署到 Vercel + 環境變數](https://www.notion.so/34aad1e31336818c8126f69176ea4896) — _前移：第一個小時就拿到上線網址_
- [Step 4：本地實機驗證 + 第一次 PR](https://www.notion.so/34aad1e3133681c9a572dedcc5ad0a52) — _對應 `npm install` / `.env.local` / 走完整 branch → PR → merge_
- [Step 5：Realtime 拆解 — 為什麼不用 F5 也會更新？](https://www.notion.so/34aad1e3133681fda623e60a62b8fa32) — _對應 `src/app/page.tsx` 的 channel subscribe + `0001_init.sql` 的 publication_
- [Step 6：用 Copilot Coding Agent 派工加新功能](https://www.notion.so/34aad1e3133681559aacf0dd576d6de7) — _進階：issue → @copilot → PR → review → merge_

### 🎓 總結與延伸

- [課後挑戰 & 延伸](https://www.notion.so/34aad1e3133681019944cf942c5c75a0)

---

## 🚀 Quick Start

對應 Notion 的 **Step 1 → Step 2 → Step 3 → Step 4** 流程（雲端優先：先拿到上線網址，再回頭碰本地）。

### 1. 拿到專案（對應 [Step 1](https://www.notion.so/34aad1e3133681649ee2e0bec0dde993)）

選一種：

- **學生（推薦）**：在 GitHub 按 [Use this template](https://github.com/) → 建你自己的 `classwall` repo → clone
- **直接 clone**：
  ```bash
  git clone https://github.com/<你的帳號>/classwall.git
  cd classwall
  ```

> Git / PR 流程不熟？先看 [Step 1.5：Git + PR 深入教學](https://www.notion.so/2fdad1e3133680448352c0749d5a579d)，後面會反覆用到。

### 2. 建 Supabase 專案（對應 [Step 2](https://www.notion.so/34aad1e3133681378631d3d180f37c13)）

到 [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → 命名 `classwall` → 地區選 **Tokyo / Singapore** → 建立。

等專案 ready：

1. 左側 `SQL Editor` → New query → 把 `supabase/migrations/0001_init.sql` **整個檔案**內容貼進去 → **Run**。
   - 會建好 `questions`、`answers` 表
   - 開啟 Realtime publication
   - 套用 RLS（讓匿名使用者可讀、可發問、可按讚）
   - 插入一筆 seed
2. 左側 `Project Settings → API`，記下：
   - **Project URL**（`https://xxx.supabase.co`）
   - **`anon` `public` key**

> ⚠️ 千萬不要用 `service_role` key —— 它是後台 admin 權限，不能放前端、不能 commit。

### 3. 部署到 Vercel + 設環境變數（對應 [Step 3](https://www.notion.so/34aad1e31336818c8126f69176ea4896)）

**這步直接拿到上線網址，不用先碰本地。**

到 [vercel.com/new](https://vercel.com/new) → Import Git Repository → 選你的 `classwall` repo → 在 **Environment Variables** 區塊填上：

- `NEXT_PUBLIC_SUPABASE_URL` = 上一步的 Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 上一步的 anon key

按 **Deploy**，1～2 分鐘後拿到 `https://classwall-<你的名字>.vercel.app`，手機就打得開！

> 之後每次 `git push` 進 main，Vercel 都會**自動重新部署**。

### 4. 本地實機 + 第一次 PR（對應 [Step 4](https://www.notion.so/34aad1e3133681c9a572dedcc5ad0a52)）

本地短暫驗證 + 跑一次完整 `branch → PR → merge → auto-deploy` 工程師日常流程。

```bash
nvm use                     # 讀 .nvmrc 切到 Node 20.18+
npm install                 # 30~60 秒
cp .env.example .env.local  # 填上 Step 2 拿到的兩個值
npm run dev                 # → http://localhost:3000
```

打開 localhost:3000 應該看到：

- 🎯 ClassWall 漸層標題
- 發問表單
- Seed 那筆問題
- 按 +1 → likes 即時 +1（[Step 5](https://www.notion.so/34aad1e3133681fda623e60a62b8fa32) 會拆解為什麼）
- 開另一個分頁發問 → 第一個分頁即時跳出

接著走完整 PR 流程：

```bash
git switch -c feat/my-title
# 改個標題或顏色
git add . && git commit -m "feat: 改首頁標題"
git push -u origin feat/my-title
```

到 GitHub 開 PR → self-review → squash merge → 等 Vercel auto-deploy → 線上看效果。

> 本地裝不起來？走 **GitHub Codespaces**：repo → Code → Codespaces → Create。瀏覽器版 VS Code，環境都裝好了。

### 5. 後面還有什麼？

- [Step 5：Realtime 拆解](https://www.notion.so/34aad1e3133681fda623e60a62b8fa32) — 為什麼網站不用 F5 也會更新？拆 Postgres publication + Realtime Server + 前端 channel
- [Step 6：Coding Agent 派工](https://www.notion.so/34aad1e3133681559aacf0dd576d6de7) — 寫 issue → `@copilot` → 自動開 PR → review → merge

---

## 📁 專案結構

```
src/
├── app/
│   ├── layout.tsx          # 根 layout + metadata
│   ├── page.tsx            # 首頁：列表 + 表單 + Realtime channel/subscribe ← Step 5 拆解
│   └── globals.css         # Tailwind v4 + shadcn 主題
├── components/
│   ├── question-form.tsx   # 發問表單（form onSubmit + supabase.insert）
│   ├── question-card.tsx   # 單張問題卡 + 按讚（無 optimistic update）   ← Step 5 小亮點
│   └── ui/                 # shadcn 元件 (button, card, textarea)
├── lib/
│   ├── supabase.ts         # Supabase browser client（anon key + RLS）   ← Step 5
│   └── utils.ts            # cn() helper
└── types/
    └── database.ts         # Question / Answer types

supabase/
└── migrations/
    └── 0001_init.sql       # DB schema + RLS + Realtime publication + seed ← Step 2 跑 / Step 5 拆解
```

---

## 🛠️ Scripts

```bash
npm run dev           # 開發伺服器
npm run build         # production build
npm run start         # 跑 production build
npm run lint          # ESLint
npm run format        # Prettier 自動格式化
npm run format:check  # 檢查格式
```

---

## 🤖 GitHub Copilot 用法

這個 repo 預先設好 Copilot 規則，clone 下來打開 VS Code（≥ 1.95）就能用：

- **Repo-wide 規範**：`.github/copilot-instructions.md` 會自動附加到每次 Copilot Chat 請求（會教 Copilot 用 Tailwind v4 的 `bg-linear-*`、Supabase RLS、shadcn 規範等）
- **路徑特化規則**：`.github/instructions/*.instructions.md` 在你編輯特定路徑時自動套用
  - `tailwind.instructions.md` → 改 `*.tsx` / `*.css` 時生效
  - `supabase.instructions.md` → 改 `src/lib/supabase.ts` / Supabase 相關檔時生效
  - `components.instructions.md` → 改 `src/components/**` 時生效
  - `migrations.instructions.md` → 改 `supabase/migrations/**` 時生效
- **預先寫好的 slash prompt**（在 Copilot Chat 輸入 `/`）：
  - `/add-shadcn` — 加 shadcn 元件
  - `/add-page` — 加新頁面
  - `/add-migration` — 加 Supabase migration
  - `/add-feature-likes-rank` — 課後挑戰：本週熱門排行榜
  - `/fix-copilot-suggestion` — 對照專案規範重新檢查 Copilot 給的程式碼

### 確認 Copilot 有讀到 instructions

問 Copilot Chat「幫我加一個 input 元件到問答表單」——如果回應提到 `npx shadcn@latest add input`，代表 instructions 有生效。如果回應自己寫 `<input className="...">`，請到 VS Code 設定確認：

- `github.copilot.chat.codeGeneration.useInstructionFiles: true`
- `chat.promptFiles: true`

（這兩個 key 已經寫在 `.vscode/settings.json`，用 VS Code ≥ 1.95 開啟才會生效）

> ⚠️ **GitHub.com 網頁版 Copilot**（PR review、Coding Agent）只會讀 `.github/copilot-instructions.md`，**不會**處理 `.github/instructions/*.instructions.md` 的 `applyTo` glob——路徑特化規則僅在 VS Code / JetBrains 編輯器內生效。

---

## 🐛 Troubleshooting

**`npm run dev` 啟動但 console 跳「缺少 Supabase 環境變數」**
→ `.env.local` 沒建好，或改完沒重啟。`Ctrl+C` 後重跑 `npm run dev`。

**頁面打開噴錯 / 看不到 seed 資料**
→ 檢查 Supabase 專案 SQL 是否跑成功（Table Editor 應看到 `questions` 表有 1 筆）；確認 `.env.local` 的 URL/key 跟 Dashboard 對得起來。

**發問成功但別的分頁沒即時更新**
→ Realtime 沒打開。在 Supabase Dashboard `Database → Replication` 看 `questions` 的 Realtime 開關，或重跑一次 `0001_init.sql` 中 `alter publication` 那兩行。

**按 +1 沒反應 / console 噴 `function ... does not exist`**
→ 舊 schema 沒升級。重跑一次 `supabase/migrations/0001_init.sql`（SQL Editor 整段貼上，或 `supabase db push`）即可——整檔已寫成冪等，重跑不會掉資料。

**按 +1 沒效果但 Network 看到 PATCH `/rest/v1/questions?id=eq...` 200**
→ 你還沒升級到含 RPC 的版本：升級後 anon 的 UPDATE policy 已被移除，PATCH 會回 200 但 row 不變（PostgREST 用 RLS filter，過不去就靜默丟掉）。前端要改走 `supabase.rpc('increment_question_like', ...)`。

**部署到 Vercel 後線上版壞掉**
→ 大部分是忘記設環境變數。Vercel Project → Settings → Environment Variables 加上兩把 key → Redeploy。

**Supabase 顯示專案 paused**
→ 免費方案 7 天無人活動會 pause，到 Dashboard 點 Restore 即可。

---

## 🎓 課後挑戰

對應 Notion [課後挑戰 & 延伸](https://www.notion.so/34aad1e3133681019944cf942c5c75a0)，可以試試看：

- **更嚴格的防刷**（目前已用 DB 端 `question_likes` 去重 + SECURITY DEFINER RPC 鎖死數字；想再嚴格可接 Supabase Anonymous Auth 把 dedup key 換成 `auth.uid()`）
- **加上「答案」功能**（已預先建好 `answers` 表，練習一對多 join）
- **本週熱門問題榜**
- **加入主題切換**（已預備 dark mode tokens）
- **發問字數限制 / 不雅字過濾**
