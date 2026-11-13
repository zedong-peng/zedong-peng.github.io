---
layout: post
title: "Writing a conversation into LoRA weights"
date: 2025-03-30 12:00:00 +0800
lang: en
translation_key: lora-parametric-memory
description: "An early try at continual learning: fine-tune a LoRA adapter on a conversation so the model answers from its weights. F1 on LoCoMo went from 6.7 to 7.2. Doubling the rank changed little, so I blame the rule that wrote to the weights, next-token loss."
categories: research
related_posts: false
toc:
  beginning: true
---

This is an early try at [continual learning]({% post_url 2026-10-20-where-experience-goes %}): keep a conversation in the model's weights instead of in text. I fine-tuned a LoRA adapter on a conversation and asked questions about it with nothing in the context. It did not work. F1 on LoCoMo went from 6.7 to 7.2, where mem0 reports more than 40. Doubling the rank changed little, so I think the fault is in the rule that wrote to the weights, next-token loss, and not in how much the weights can hold.

## Weights as the store

Every mainstream memory system (ChatGPT Memory, Claude Code's MEMORY.md, mem0, A-Mem) keeps experience as text: extract key facts, store them outside the model, retrieve them and put them in the context at inference time. None of them touches the model weights.

I wanted to try the other store: fine-tune a LoRA adapter on a conversation so the facts are written into the parameters. No retrieval, no vector database, no context injection. Ask the question, and the model answers from its weights.

## Setup

**Model**: Qwen2.5-1.5B-Instruct. **Benchmark**: [LoCoMo](https://github.com/snap-research/locomo), 10 long conversations (~20k tokens each) and 1,540 QA pairs across SingleHop, MultiHop, Temporal, and OpenDomain categories. **Write rule**: next-token loss on the raw conversation text.

## Results

| Method            | SingleHop | MultiHop | OpenDom | Temporal | Avg F1 |
| ----------------- | --------- | -------- | ------- | -------- | ------ |
| Base (no context) | 8.56      | 5.50     | 9.67    | 3.03     | 6.69   |
| LoRA-Mem (r=4)    | 9.16      | 6.72     | 8.87    | 2.30     | 6.76   |
| LoRA-Mem (r=8)    | 10.44     | 7.05     | 8.64    | 2.54     | 7.17   |

The best result is **7.17%**, barely above the base model's 6.69% with no fine-tuning. Doubling the rank made no meaningful difference. For reference, [mem0](https://arxiv.org/abs/2504.19413), the industrial benchmark for memory agents, reports Avg F1 > 40% on the same dataset.

## Two failure modes

**Hallucination.** The model doesn't say "I don't know." It confidently generates plausible but wrong answers:

> Q: What is Caroline's identity?
> Model: _Caroline is an AI language model created by Anthropic..._
> Reference: Transgender woman

The model falls back to pretraining knowledge instead of conversation facts. LoRA training did not overwrite these priors.

**Temporal collapse.** Temporal F1 is the lowest category across all variants (~2%). The model cannot anchor events in time:

> Q: When did Caroline go to the LGBTQ support group?
> Model: _June 15th_. Reference: 7 May 2023
>
> Q: When did Melanie paint a sunrise?
> Model: _2015-07-14_. Reference: 2022

Raw conversation text has no explicit timestamps. The model has no signal to learn when things happened.

## The write rule

Next-token loss decided what was written, and it was fixed before any question was asked. It trains the model to continue the conversation. The model never sees a question during training, so nothing pushes it to keep facts in a form that a question can reach.

## What I took from it

When I presented these results, my advisor and I agreed that the approach was too crude. Parametric memory by continued pretraining of a LoRA adapter does not work for conversation QA at this scale. The project was archived.

The experiment tested one write rule, and the rank made no difference, so it says little about weights as a store. What it does suggest is that the rule should be learned rather than designed in advance. [MemAgent](https://arxiv.org/abs/2507.02259) (ICLR 2026) does that for notes: it uses RL to teach a memory agent what to write down and how to organize it. I come back to the same question for weights in [Continual learning: where experience goes]({% post_url 2026-10-20-where-experience-goes %}).

Code: [LoRA-Mem](https://github.com/zedong-peng/LoRA-Mem).
