---
title: 範例文章（隱藏）
description: 顯示基本結構的參考範本。要寫新文章時，從這個檔案複製一份。
publish: false
publishDate: 2026-05-01
tags: [meta]
status: seedling
lang: zh-TW
translationKey: example-post
created: 2026-05-01 20:21:30
updated: 2026-05-02 01:44:19
---

這個檔案 `publish: false`，所以正式環境永遠看不到，但 `bun run dev`
可以預覽。複製這個檔、改檔名、設 `publish: true`，就可以開始寫了。

跟英文版共用同一個 `translationKey: example-post`，文章頂端會自動出現
「Also available in: English / 繁體中文」切換橫條。

## 行內格式

純文字段落。**粗體**、*斜體*、~~刪除線~~、==螢光==、`行內 code`。

## Callout

> [!tip] 直接用就好
> 五種類型可選 — `note`、`tip`、`important`、`warning`、`caution`。
> 完整對應表見 `AUTHORING.md`。

## 程式碼

```ts
function ping(): string {
	return "pong";
}
```

## 數學

行內 $E = mc^2$，或區塊：

$$
\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

## 跨連結

連到其他已發佈文章的 wikilink 會自動解析：`[[other-post-slug]]`。
找不到目標的會 fallback 成純文字 — 沒有壞連結，沒有檔名外洩。
