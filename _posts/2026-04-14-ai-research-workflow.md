---
layout: post
title: "AI as Research Copilot"
date: 2026-04-14 23:35:00 +0800
description: "How AI evolved from coding assistant to research partner in my workflow."
tags: AI research-workflow Claude-Code
categories: research
related_posts: false
---

By 2026, AI is no longer just a coding tool for me. It's part of the research loop: discussing ideas, iterating experiments, writing reports, and reflecting on feedback.

## The tools I tried

In 2024, I tested **Trae**, **Cursor**, and **Copilot**. Cursor was the first that felt genuinely useful during ForgeHLS development. **Codex** became my go-to for straightforward coding—cheap, reliable, no quota anxiety.

## Claude Code: the real shift

**Claude Code** changed everything. It can sustain long chains of work: research ideas → scope → implement → analyze → deliverables. I use it in [`auto-research-single`](https://github.com/zedong-peng/auto-research-single) for literature research and [`benchmark-grinder`](https://github.com/zedong-peng/benchmark-grinder) for experiment iteration.

The weakness is cost. But it's the first tool that feels like a research copilot, not just a code generator.

## My workflow now

I use AI across the full research pipeline:

- **Idea scouting**: Pressure-test ideas, find baselines, expose assumptions
- **Experiment iteration**: Modify experiments, compare outputs, debug—the biggest gain
- **Deliverables**: Turn work into reports and papers
- **Meeting reflection**: Unpack feedback and plan next steps

I formalized this into reusable agent skills like [`autonomous-benchmark-optimizer`](https://github.com/zedong-peng/autoresearch/tree/main/skills/autonomous-benchmark-optimizer) and [`benchmark-grinder`](https://github.com/zedong-peng/benchmark-grinder/tree/main/skills/benchmark-grinder).

## What I pay for

- **Codex**: ~$20/month for straightforward coding
- **Cursor**: ~$20/month
- **Claude Code**: main workhorse via third-party relay (official is too expensive)
- **OpenRouter**: for LLM experiments

## The real change

AI didn't just make me code faster. It made my research process externally runnable. Parts that lived only in my head—idea formation, experiment iteration, report writing—now happen in an interactive loop.

The uncomfortable truth: more research work looks automatable than I expected. Literature mapping, baseline design, experiment iteration, technical writing—AI already handles much of this. From where I stand, research feels less like a safe exception to automation and more like a domain being quietly reorganized by it.

AGI may arrive not as a dramatic event, but as a steady collapse of tasks that once defined skilled intellectual work.
