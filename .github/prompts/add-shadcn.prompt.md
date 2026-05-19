---
description: "新增一個 shadcn/ui 元件並示範如何 import 使用"
---

# 任務：新增 shadcn 元件

請幫我新增一個 shadcn/ui 元件到 `src/components/ui/`。

## 步驟

1. 詢問我要加哪一個元件（例如 `input`、`dialog`、`badge`、`dropdown-menu`）
2. 提示我跑指令：
   ```bash
   npx shadcn@latest add <name>
   ```
3. 跑完後，幫我在現有的某個 page 或 component 中示範 import + 基本用法
4. **不要**手改 `components.json`（preset 是 `base-nova`）

## 規範

- 元件檔會自動放到 `src/components/ui/<name>.tsx`
- import path：`import { X } from "@/components/ui/<name>"`
- 文案保持中文
- 互動元件記得確認所在檔案有 `"use client"` directive
