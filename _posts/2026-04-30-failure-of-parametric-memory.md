---
layout: post
title: "LoRA as Parametric Memory: a failed experiment"
date: 2026-04-30 12:00:00 +0800
lang: en
translation_key: lora-parametric-memory
description: "I tried writing conversation facts into model weights via LoRA fine-tuning. The accuracy was dismal and temporal questions were completely unanswerable."
categories: research
related_posts: false
toc:
  beginning: true
---

Every mainstream memory system — ChatGPT Memory, Claude Code's MEMORY.md, mem0, A-Mem — works the same way: extract key facts, store them externally, retrieve and inject into context at inference time. None of them touch the model weights.

I wanted to try the opposite: fine-tune a LoRA adapter on a conversation so the facts get written directly into the model parameters. No retrieval, no vector database, no context injection. Just ask the question, and the model answers from its weights.

It didn't work.

## Setup

**Model**: Qwen2.5-1.5B-Instruct. **Benchmark**: [LOCOMO](https://github.com/snap-research/locomo) — 10 long conversations (~20k tokens each), 1,540 QA pairs across SingleHop, MultiHop, Temporal, and OpenDomain categories.

## Results

| Method            | SingleHop | MultiHop | OpenDom | Temporal | Avg F1 |
| ----------------- | --------- | -------- | ------- | -------- | ------ |
| Base (no context) | 8.56      | 5.50     | 9.67    | 3.03     | 6.69   |
| LoRA-Mem (r=4)    | 9.16      | 6.72     | 8.87    | 2.30     | 6.76   |
| LoRA-Mem (r=8)    | 10.44     | 7.05     | 8.64    | 2.54     | 7.17   |

The best result is **7.17%** — barely above the base model's 6.69% without any fine-tuning. Doubling the rank made no meaningful difference. For reference, [mem0](https://arxiv.org/abs/2504.19413), the industrial benchmark for memory agents, reports Avg F1 > 40% on the same dataset.

## Two failure modes

**Hallucination.** The model doesn't say "I don't know." It confidently generates plausible but wrong answers:

> Q: What is Caroline's identity?
> Model: _Caroline is an AI language model created by Anthropic..._
> Reference: Transgender woman

The model falls back to pretraining knowledge instead of conversation facts. LoRA training did not overwrite these priors.

**Temporal collapse.** Temporal F1 is the lowest category across all variants (~2%). The model cannot anchor events in time:

> Q: When did Caroline go to the LGBTQ support group?
> Model: _June 15th_ — Reference: 7 May 2023
>
> Q: When did Melanie paint a sunrise?
> Model: _2015-07-14_ — Reference: 2022

Raw conversation text has no explicit timestamps. The model has no signal to learn when things happened.

## Why

The training objective is fundamentally misaligned with the inference task. LM loss trains the model to predict the next token in conversation text. It never sees a question during training, so it has no reason to organize facts in a way that supports QA.

## Takeaway

After presenting these results, the consensus with my advisor was clear: the approach was too crude. Parametric memory via LoRA continual pretraining does not work for conversation QA at this scale. The project was archived.

For a more promising direction, [MemAgent](https://arxiv.org/abs/2507.02259) (ICLR 2026) uses RL to teach memory agents how to take notes — a much better way to learn what to remember and how to organize it.

Code: [LoRA-Mem](https://github.com/zedong-peng/LoRA-Mem).
