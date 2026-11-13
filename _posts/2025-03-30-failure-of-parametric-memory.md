---
layout: post
title: "Reading a conversation is not remembering it"
date: 2025-03-30 12:00:00 +0800
lang: en
translation_key: lora-parametric-memory
description: "I fine-tuned a LoRA adapter on a conversation and asked the model about it with nothing in the context. F1 on LoCoMo went from 6.7 to 7.2. Next-token loss teaches a model to continue a conversation, not to answer questions about it."
categories: research
related_posts: false
toc:
  beginning: true
---

I fine-tuned a LoRA adapter on a conversation, then asked the model questions about it with nothing in the context. It could not answer them. F1 on LoCoMo went from 6.7 to 7.2, where mem0 reports more than 40. Next-token loss teaches a model to continue a conversation, not to answer questions about it.

## Memory in the weights

Every mainstream memory system (ChatGPT Memory, Claude Code's MEMORY.md, mem0, A-Mem) works the same way: extract key facts, store them outside the model, retrieve them and put them in the context at inference time. None of them touches the model weights.

I wanted to try the opposite: fine-tune a LoRA adapter on a conversation so the facts are written into the parameters. No retrieval, no vector database, no context injection. Ask the question, and the model answers from its weights.

## Setup

**Model**: Qwen2.5-1.5B-Instruct. **Benchmark**: [LoCoMo](https://github.com/snap-research/locomo), 10 long conversations (~20k tokens each) and 1,540 QA pairs across SingleHop, MultiHop, Temporal, and OpenDomain categories. **Training**: next-token loss on the raw conversation text.

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

## The training objective

The training objective does not match the task. Next-token loss trains the model to predict the next token of the conversation. The model never sees a question during training, so nothing pushes it to keep facts in a form that a question can reach. It has read the conversation; it has not learned to recall it.

## Takeaway

When I presented these results, my advisor and I agreed that the approach was too crude. Parametric memory by continued pretraining of a LoRA adapter does not work for conversation QA at this scale. The project was archived.

For a more promising direction, [MemAgent](https://arxiv.org/abs/2507.02259) (ICLR 2026) uses RL to teach a memory agent how to take notes, which lets it learn what to remember and how to organize it.

Code: [LoRA-Mem](https://github.com/zedong-peng/LoRA-Mem).
