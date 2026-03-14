# Synapse Capital "Masterpiece" Report Template Documentation

This document defines the professional financial media report format for `synapsecapital.net`. All future reports must adhere to this structure to ensure consistent UI rendering.

## 1. Visual Layout
The report page (`/ja/reports/[id]/page.tsx`) uses a structured, multi-section layout:
- **Header**: Aspect ratio 21:10, Solid Black (`bg-slate-950`) with subtle radial gradient. Title font size: `text-2xl md:text-3xl lg:text-4xl`.
- **TL;DR**: Gray box summary with 3 key points.
- **Section 1: Market Fundamentals**: Light gray background, bolded keywords (e.g., "日銀", "雇用統計").
- **Section 2: AI Multi-point Analysis**: 3-column grid card.
- **Section 3: Technical Analysis**: 2-column layout with textual analysis on the left and a chart image on the right. Shows an RSI progress bar.
- **Section 4: Trading Action Card**: Dark theme (`bg-slate-900`) showing Target Price and Stop Loss in large fonts.
- **AI Conclusion**: Emerald green box with "AI 結論 & アクションプラン".

## 2. Required Frontmatter (Markdown)
Every report `.md` file in `content/reports/` MUST have these fields:
```yaml
---
title: "Article Title"
date: "YYYY-MM-DD"
genre: "FX" | "CRYPTO" | "STOCKS"
target_pair: "USD/JPY" etc.
prediction_direction: "UP" | "DOWN" | "FLAT"
recommended_broker: "dmm-fx" etc.
tldr_points: ["Point A", "Point B", "Point C"]
chart_image: "/images/chart-path.png"
excerpt: "120 character meta description"
---
```

## 3. AI Generation Rules (generate-reports.js)
- **Voice**: Professional, analytical, "AntiGravity" persona.
- **Constraint**: NEVER use the word "検証隊".
- **Structure**: Must use H2 headers in the exact order:
  1. `## 1. 市場環境とファンダメンタルズ`
  2. `## 2. AI多角分析（シナプス解析）`
  3. `## 3. テクニカル分析`
  4. `## 4. プロ・トレーディング戦略`
- **Output**: Markdown content + a JSON block for `latest-signals.json` integration.

## 4. Automation & Limits
- **Mechanism**: GitHub Actions (Cron) triggers the build.
- **Safe Daily Posts**: Max 4 runs per day (~3 genres per run = 12 reports) to stay within Cloudflare Pages Free build limits (500/month).
- **API**: Gemini 2.0 Flash (Free tier) provides ample RPD (1,500).
