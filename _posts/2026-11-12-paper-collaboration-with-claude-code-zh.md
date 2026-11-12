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
series: missing-semester
series_episode: overleaf
---

本文翻译自[英文版]({% post_url 2026-11-12-paper-collaboration-with-claude-code %})。

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

我自己的画图风格放在 [zedong-skill](https://github.com/zedong-peng/zedong-skill) 的 `zedong-html-fig` 里。

## 表格

脚本把每次实验的结果收进一个数据文件，另一个脚本从它生成所有 LaTeX 表格，没有一个数字是手填的。这些脚本由 Claude Code 来写，数据分析也交给它，分析图用同一份数据在 HTML 里画。

## 分发

PDF 存进 repo，把合作者邀请进 repo。

## 导师只用 Overleaf

1. 见标题。把这篇 blog 发给导师，推荐导师切换工作流。
2. 让 Claude Code 打开浏览器，你来登录，它自己拿到 Overleaf 的 cookie，把资料同步进 repo。
