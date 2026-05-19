---
description: "課後挑戰：本週熱門問題榜（join + Realtime 範例）"
---

# 任務：本週熱門問題榜

請幫我在 `/ranking` 新增一個頁面，顯示本週（最近 7 天）按讚數最多的前 10 題。

## 步驟

1. 在 `src/app/ranking/page.tsx` 建立 client page
2. 從 Supabase 撈：
   ```ts
   const sevenDaysAgo = new Date(
     Date.now() - 7 * 24 * 60 * 60 * 1000
   ).toISOString();
   const { data } = await supabase
     .from("questions")
     .select("*")
     .gte("created_at", sevenDaysAgo)
     .order("likes", { ascending: false })
     .limit(10);
   ```
3. 訂閱 Realtime UPDATE 事件，likes 變化時重新排序
4. 用 shadcn `Card` 顯示，前三名加 🥇🥈🥉
5. 從首頁加 `<Link href="/ranking">本週熱門</Link>`

## 規範

- `"use client";`
- Realtime channel 一定要 cleanup（`supabase.removeChannel(channel)`）
- 用 `bg-linear-*`（Tailwind v4），不是 `bg-gradient-*`
- 用 `cn()` from `@/lib/utils`
- 文案中文

## 進階（選做）

- 加切換按鈕：本週 / 本月 / 全部
- 用 `useMemo` 算前三名套用特殊樣式
- 加 SSR 版本：改成 server client + `revalidate` ISR
