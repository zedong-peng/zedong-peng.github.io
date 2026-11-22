---
layout: post
title: "Train a coding agent in one harness, and the gain shows up in the others"
date: 2026-11-22 14:00:00 +0800
lang: en
description: "RL in pi alone made a 9B coding agent better on unseen repositories in OpenCode and Claude Code too. Training in two harnesses at once added nothing on top."
categories: better-ml
related_posts: false
---

RL that teaches a coding agent to fix bugs in one harness makes it better in harnesses it never trained in, and training in several harnesses at once adds nothing on top.

[Harness Hub](https://huggingface.co/harness-hub) trains one LoRA per harness: a pi adapter for pi, an OpenCode adapter for OpenCode. We wanted a single adapter for every harness, so we first ran the controlled version on Qwen3.5-9B. Three LoRAs got the same recipe, tasks and compute. One trained in pi only, one in OpenCode only, and one in both. We then evaluated each in pi, in OpenCode, and in Claude Code, which none of them trained in.

| Evaluated in | Base | Trained in pi | Trained in OpenCode | Trained in both |
|---|---|---|---|---|
| pi | 40.0 | 50.0 | 43.3 | 53.3 |
| OpenCode | 38.3 | 45.0 | 45.0 | 50.0 |
| Claude Code (never trained in) | 43.3 | 56.7 | 55.0 | 51.7 |
| **All three harnesses, change vs base** | | **+10.0 ± 6.2** | **+7.2 ± 6.4** | **+11.1 ± 5.9** |
| All 160 held-out tasks, all three harnesses, change vs base | | +3.3 ± 4.3 | +2.3 ± 4.4 | +3.8 ± 4.3 |

Pass@1 (%) on 60 bug-fix tasks per harness, drawn from four repositories that were not in training, with one attempt per task. Differences are paired by task, with 95% intervals. A single cell has only 60 tasks, so read the pooled rows. The last row adds 100 held-out terminal tasks (TermGrade), on which none of the adapters gained.

The adapter trained only in pi gains as much in Claude Code (+13 points) as in pi (+10). In OpenCode it matches the adapter that trained there, 45.0 against 45.0. Training in both harnesses is no better than training in one. In the two harnesses the pi-only adapter never saw, the both-harness adapter is +0.0 ± 5.0 points ahead of it. In each specialist's own harness, it is +1.2 and −0.6 points against that specialist.

The gain is not the model learning a harness's tool format, because tool calls the harness rejected did not become rarer. On the unseen repositories, the both-harness adapter solved 20 more tasks than the base, net. Eleven of them were runs that used to run out of the 50-call budget or the 30-minute limit. Ten were runs whose patch used to be wrong. Rejected tool calls cost one.

The base model already scored about the same in all three harnesses (38.1, 37.5 and 38.8 on all held-out tasks), so there was no harness gap for multi-harness training to close. A NeurIPS 2026 workshop paper reaches the same conclusion with Qwen3-8B, four other harnesses and SWE-bench Verified: "Cross-harness credit yields configuration adaptation and no more portable capability than within-harness credit."[^1]

The main limitation is scale. Each adapter had only 16 RL steps, and the pooled intervals are about ±4 points.

[^1]: Chenqian Le, Jiayi Cheng, Qijia He, Runhao Li, Yinghao Li and Xupeng Chen, [What Does Multi-Harness RL Learn? Credit Assignment and Portability in Coding Agents](https://openreview.net/forum?id=OTIi2ucXEA), NeurIPS 2026 ELLIS Workshop on the Foundations of LLM Post-Training in Changing Environments. In their runs, the evaluation harness moves the mean solve rate by a factor of 4.3, and the training recipe by 1.16.
