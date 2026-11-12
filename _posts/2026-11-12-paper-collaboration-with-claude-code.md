---
layout: post
title: "If you still use Overleaf, you are behind. Use Claude Code + GitHub repo"
date: 2026-11-12 20:31:00 +0800
lang: en
description: "A paper's figures, tables and PDF go in one private GitHub repo, and Claude Code does the work."
categories: life
related_posts: false
---

A paper's figures, tables and PDF go in one private GitHub repo, and Claude Code does the work.

Only for Opus 5.5 high or a higher effort, or Fable 5.2.

## Repo layout

```
paper/
├── main.tex  refs.bib       the text
├── figs/     <name>.html    figure sources, exported to <name>.pdf
├── data/     *.csv *.json   experiment results
├── tables/   *.py           LaTeX tables generated from data/
└── tools/    build.sh       exports figures, compiles the PDF
```

## Figures

Have Claude Code read your research code first. Then have it search for the figures in Anthropic's blog and papers and in DeepSeek's open-source reports. Once it knows what figures in frontier papers look like, it draws yours in HTML.

If you use PowerPoint or draw.io, you are behind.

Revise with a screenshot and a spoken note: capture the part that bothers you and say how to change it. Iteration is fast.

My own figure style is in `zedong-html-fig`, in [zedong-skill](https://github.com/zedong-peng/zedong-skill).

## Tables

Scripts collect each experiment run into one data file, and another script writes every LaTeX table from it, so no number is typed by hand. Claude Code writes those scripts, does the analysis, and draws the analysis charts in HTML from the same data.

## Distribution

Store the PDF in the repo and invite your collaborators to the repo.

## An advisor who only uses Overleaf

1. See the title. Send your advisor this post and recommend switching workflow.
2. Have Claude Code open a browser. You log in, it takes the Overleaf cookie itself and syncs the material into the repo.
