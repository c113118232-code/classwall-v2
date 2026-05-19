---
description: "新增一個 Next.js App Router 頁面"
---

# 任務：新增頁面

請幫我在 `src/app/<route>/page.tsx` 建立一個新頁面。

## 步驟

1. 詢問我這個頁面的 route 路徑（例如 `/ranking`、`/about`）和用途
2. 在 `src/app/<route>/page.tsx` 建立 page component
3. 視需要在 `src/app/<route>/layout.tsx` 加 metadata
4. 連結到首頁的話，從 `src/app/page.tsx` 加 `<Link>`

## 規範

- 預設是 Server Component；用到 hooks / event handler / Supabase browser client，就在檔頂寫 `"use client";`
- metadata 範例：
  ```tsx
  export const metadata = {
    title: "頁面標題 · ClassWall",
    description: "...",
  };
  ```
- UI 文案保持**中文**
- 用 shadcn 元件（`@/components/ui/*`），不要自己刻
- Tailwind v4：用 `bg-linear-*` 不是 `bg-gradient-*`
- 用 `cn()` from `@/lib/utils` 合併 className

## 範本（client page）

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyPage() {
  // ...
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold">頁面標題</h1>
      {/* ... */}
    </main>
  );
}
```
