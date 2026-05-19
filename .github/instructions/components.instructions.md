---
applyTo: "src/components/**/*.tsx,src/app/**/*.tsx"
description: "React component / page 撰寫規範"
---

# Component / Page 規範

## Server vs Client

- 預設都是 Server Component
- 用到以下任一個就必須在檔頂寫 `"use client";`：
  - `useState` / `useEffect` / `useMemo` / `useReducer` / `useRef` 等 hooks
  - `onClick` / `onSubmit` / `onChange` 等 event handler
  - `window` / `document` / `localStorage` / `navigator`
  - 直接 import `@/lib/supabase`（browser client）

## 用 shadcn 元件，不要自己刻

- Button → `import { Button } from "@/components/ui/button"`
- Card → `import { Card, CardHeader, CardContent } from "@/components/ui/card"`
- Textarea → `import { Textarea } from "@/components/ui/textarea"`
- 要新元件先跑 `npx shadcn@latest add <name>`，**不要**自己寫一個 `<input className="...">`

## className 合併

用 `cn()` from `@/lib/utils`：

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />;
```

不要用 `${}` template string 拼 className。

## UI 文案

- **保持中文**（學生讀的是中文教材）
- 例：「發問」「按讚」「載入中...」「還沒有人發問，你來當第一個！」

## A11y

- 互動元素加 `aria-label`（特別是只有 emoji / icon 的按鈕）
- `<section>` 加 `aria-label` 標明區塊用途
- form 的 `<label>` 對應 `htmlFor`

## 表單慣例

```tsx
async function handleSubmit(event: React.FormEvent) {
  event.preventDefault();
  // ... await supabase.from("...").insert(...)
}
```

務必先 `preventDefault()` 再 await。

## 不要做的事

- 不要把 component 命名改成英文（例如 `QuestionForm` 是 OK 的，但 UI 文案不要英文化）
- 不要過度抽象——教學專案，三行類似程式碼直接寫出來比抽 helper 好讀
- 不要加沒必要的 error boundary / fallback / loading skeleton（除非設計明確要求）
