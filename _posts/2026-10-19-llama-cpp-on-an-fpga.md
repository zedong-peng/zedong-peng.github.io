---
layout: post
title: "llama.cpp on an FPGA: Work in Progress"
date: 2026-10-19 12:00:00 +0800
lang: en
description: "A llama.cpp backend that runs LLM inference on an AMD Alveo U280 FPGA card, and how fast it decodes today."
categories: research
related_posts: false
---

I'm building a backend for [llama.cpp](https://github.com/ggml-org/llama.cpp) that runs LLM inference on an FPGA card, an AMD Alveo U280. It is work in progress, and the code is private for now. This post records how fast it is today.

## Why an FPGA

When a model writes text, each new token needs all of the model's weights read from memory once. So decode speed, the speed at which words appear, is set mostly by how fast the hardware reads memory, not by how fast it computes. The U280 carries 8 GB of HBM, stacked high-bandwidth memory, rated at 460 GB/s. The goal is to decode as fast as that memory allows, for any model that fits, at any context length.

## Where it stands

The card works as an ordinary llama.cpp backend: models come from the usual GGUF files, and speed is measured with llama.cpp's own `llama-bench`. Twelve models from four families run on it, with outputs checked against llama.cpp's CPU backend. Decode speed, in tokens per second:

| Model        | Size (GB) | FPGA | CPU | RTX 4090 |
| ------------ | --------- | ---- | --- | -------- |
| Qwen3 0.6B   | 0.42      | 302  | 111 | 776      |
| Qwen3 4B     | 2.49      | 72   | 17  | 260      |
| Qwen3 8B     | 5.02      | 45   | 11  | 165      |
| Llama 3.2 1B | 0.80      | 202  | 51  | 717      |
| Llama 3.2 3B | 2.01      | 93   | 23  | 330      |
| Llama 3.1 8B | 4.91      | 48   | 11  | 172      |
| Gemma 3 270M | 0.23      | 529  | 112 | 879      |
| Gemma 3 1B   | 0.71      | 240  | 58  | 515      |
| Gemma 3 4B   | 2.52      | 84   | 21  | 240      |
| GPT-2 Small  | 0.11      | 959  | 206 | 1837     |
| GPT-2 Medium | 0.27      | 403  | 64  | 940      |
| GPT-2 Large  | 0.55      | 219  | 47  | 583      |

Measured with `llama-bench`'s default settings (tg128: 128 tokens generated from an empty context), version 1.1.0, October 2026. All models are 4-bit quantized. CPU is the same host's two Xeon Gold 5218, 32 cores. Qwen3 4B's FPGA number comes from a later build of the same version.

Decoding Llama 3.1 8B, the card reads 224 GB of weights a second, against the memory's rated 460 GB/s. An RTX 4090 is still faster on every model; its memory is rated at 1,008 GB/s. Reading the prompt (prefill) is also still slower on the card than on the CPU; this work is about decode.

## Next

Keeping this speed as the context grows, up to the longest context the card's memory holds.
