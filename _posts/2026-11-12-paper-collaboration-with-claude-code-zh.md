---
layout: post
title: "还在用 Overleaf，你就落后了。用 Claude Code + GitHub repo"
date: 2026-11-12 20:30:00 +0800
lang: zh-CN
translation_key: paper-collaboration-with-claude-code
description: "论文的图、表格和 PDF 都放进一个 GitHub private repo，交给 Claude Code 来做。"
categories: life
hidden: true
related_posts: false
---

论文的图、表格和 PDF 都放进一个 GitHub private repo，交给 Claude Code 来做。

只适用于 Opus 5.5 high 及更高的 effort，或 Fable 5.2。

## Repo 结构

```
paper/
├── main.tex  refs.bib       正文
├── figs/     <name>.html    图的源文件，导出成 <name>.pdf
├── data/     *.csv *.json   实验结果
├── tables/   *.py           从 data/ 生成 LaTeX 表格
└── tools/    build.sh       导出图、编译 PDF
```

## 图

让 Claude Code 先读你研究的代码，再去搜 Anthropic 的 blog 和论文里的图，还有 DeepSeek 开源报告里的图。它了解了前沿论文的图是什么风格，再用 HTML 画。

还在用 PowerPoint 或 draw.io，你就落后了。

改图用截图加口述：截下不舒服的地方，说一句怎么改。迭代很快。

HTML 用无头 Chrome 打印成 PDF：

```bash
chrome --headless --no-pdf-header-footer \
  --print-to-pdf="$PWD/figs/overview.pdf" "file://$PWD/figs/overview.html"
pdfcrop --margins 2 figs/overview.pdf figs/overview.pdf
```

我自己的画图风格放在 [zedong-skill](https://github.com/zedong-peng/zedong-skill) 的 `zedong-html-fig` 里。

## 表格

数据直接来自代码，表格由代码生成。数据分析交给 Claude Code 做，分析图也可以让它用 HTML 画。

## 分发

PDF 存进 repo，把合作者邀请进 repo。

## 导师只用 Overleaf

1. 见标题。把这篇 blog 发给导师，推荐导师切换工作流。
2. 让 Claude Code 打开浏览器，你来登录，它自己拿到 Overleaf 的 cookie，把资料同步进 repo。
