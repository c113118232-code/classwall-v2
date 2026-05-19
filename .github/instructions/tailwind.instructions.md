---
applyTo: "**/*.{tsx,css}"
description: "Tailwind CSS v4 規範（inline @theme，沒有 tailwind.config.js）"
---

# Tailwind v4 規範

本專案使用 **Tailwind CSS v4**，與 v3 有 breaking changes。寫 className 時請遵守：

## v3 → v4 改名清單

| v3（過時）          | v4（正確）        |
| ------------------- | ----------------- |
| `bg-gradient-to-r`  | `bg-linear-to-r`  |
| `bg-gradient-to-b`  | `bg-linear-to-b`  |
| `bg-gradient-to-br` | `bg-linear-to-br` |

寫漸層一律用 `bg-linear-*`。

## Theme tokens

- 所有色票、字型、間距 token 都在 `src/app/globals.css` 的 `@theme inline {}` 裡
- 對應的 CSS 變數定義在 `:root {}` 與 `.dark {}`
- **不要新增 `tailwind.config.js`**——本專案完全用 inline theme

## 加新色票流程

1. 在 `:root {}` 與 `.dark {}` 各加一個 `--xxx: <顏色>;`
2. 在 `@theme inline {}` 加 `--color-xxx: var(--xxx);`
3. 之後就能用 `bg-xxx`、`text-xxx`、`border-xxx`

## 不要做的事

- 不要寫 `@apply` 包一大串現成 utility（重複又難維護）
- 不要直接寫 hex 色（用 theme token）
- 不要新建 `tailwind.config.js` / `tailwind.config.ts`
