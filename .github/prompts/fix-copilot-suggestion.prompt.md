---
description: "請 Copilot 對照專案 instructions 重新檢查 / 改寫剛剛的建議"
---

# 任務：對照專案規範重新檢查

我剛貼了一段你給的程式碼 / 建議。請對照本專案的規範重新檢查並指出問題：

## Checklist

請逐項檢查並指出哪裡違反、給出修正：

1. **Tailwind v4**：是否用 `bg-linear-*` 而非 `bg-gradient-*`？是否誤建 `tailwind.config.js`？
2. **Server vs Client**：用 hooks / event handler / `window` / `localStorage` / Supabase browser client 的檔案有沒有 `"use client";`？
3. **Supabase**：
   - 前端是否誤用 `service_role` key？
   - Realtime channel 有沒有 cleanup（`removeChannel`）？
   - 改 schema 是否誤改 `0001_init.sql`？應該新增 `0002_*.sql`
   - 新表 / 欄位有沒有補 RLS + publication？
4. **shadcn**：是否自己刻 button / card / input，而非用 `@/components/ui/*`？
5. **命名 / 文案**：UI 文案是不是中文？有沒有不小心英文化？
6. **Code style**：表單 `onSubmit` 是否先 `event.preventDefault()`？`useEffect` cleanup 完整？

## 輸出

逐項列出 ✅ / ⚠️，⚠️ 的給出具體修正後的程式碼片段。
