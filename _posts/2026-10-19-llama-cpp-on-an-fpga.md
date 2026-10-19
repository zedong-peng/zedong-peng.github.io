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

The card works as an ordinary llama.cpp backend: models come from the usual GGUF files, and speed is measured with llama.cpp's own `llama-bench`. Twelve models from four families run on it, with outputs checked against llama.cpp's CPU backend. The same GGUF files on three llama.cpp backends:

<style>
.fpga-t1 { overflow-x: auto; margin: 1.2rem 0; }
.fpga-t1 table { border-collapse: collapse; font-size: 0.85rem; margin: 0 auto; }
.fpga-t1 th, .fpga-t1 td { padding: 0.3rem 0.65rem; text-align: right; white-space: nowrap; }
.fpga-t1 th:first-child, .fpga-t1 td:first-child { text-align: left; }
.fpga-t1 thead tr + tr th { text-align: right; border-bottom: 1px solid var(--global-divider-color); }
.fpga-t1 thead th[rowspan] { vertical-align: bottom; border-bottom: 1px solid var(--global-divider-color); }
.fpga-t1 th.grp { text-align: center; padding-bottom: 0; }
.fpga-t1 th.grp span { display: block; border-bottom: 1px solid var(--global-divider-color); padding-bottom: 3px; }
.fpga-t1 .us { background: color-mix(in srgb, var(--global-theme-color) 13%, transparent); }
.fpga-t1 tbody + tbody tr:first-child td { border-top: 1px solid var(--global-divider-color); }
.fpga-t1 tr.fam td { text-align: left; font-weight: 600; font-size: 0.75rem; opacity: 0.6; padding-top: 0.6rem; }
.fpga-t1 tfoot td { text-align: left; font-size: 0.8rem; opacity: 0.7; white-space: normal; }
</style>
<div class="fpga-t1"><table>
<thead><tr><th rowspan="2">model</th><th rowspan="2">size<br>GiB</th><th class="grp" colspan="3"><span>tg128, t/s</span></th><th class="grp" colspan="3"><span>pp512, t/s</span></th></tr>
<tr><th class="us">FPGA</th><th>CPU</th><th>RTX 4090</th><th class="us">FPGA</th><th>CPU</th><th>RTX 4090</th></tr></thead>
<tbody><tr class="fam"><td colspan="8">Qwen3</td></tr>
<tr><td><a href="https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF/blob/main/Qwen3-0.6B-Q4_0.gguf">ggml-org/Qwen3-0.6B-Q4_0.gguf</a></td><td>0.39</td><td class="us">302.3</td><td>111.0</td><td>776.4</td><td class="us">272</td><td>1,261</td><td>46,094</td></tr>
<tr><td><a href="https://huggingface.co/ggml-org/Qwen3-4B-GGUF/blob/main/Qwen3-4B-Q4_K_M.gguf">ggml-org/Qwen3-4B-Q4_K_M.gguf</a></td><td>2.32</td><td class="us">72.5<sup>†</sup></td><td>17.5</td><td>259.7</td><td class="us">83<sup>†</sup></td><td>230</td><td>15,905</td></tr>
<tr><td><a href="https://huggingface.co/Qwen/Qwen3-8B-GGUF/blob/main/Qwen3-8B-Q4_K_M.gguf">Qwen/Qwen3-8B-Q4_K_M.gguf</a></td><td>4.68</td><td class="us">44.9</td><td>10.9</td><td>165.2</td><td class="us">52</td><td>163</td><td>11,418</td></tr>
</tbody>
<tbody><tr class="fam"><td colspan="8">Llama</td></tr>
<tr><td><a href="https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/blob/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf">bartowski/Llama-3.2-1B-Instruct-Q4_K_M.gguf</a></td><td>0.74</td><td class="us">202.4</td><td>50.9</td><td>716.6</td><td class="us">275</td><td>923</td><td>38,219</td></tr>
<tr><td><a href="https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/blob/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf">bartowski/Llama-3.2-3B-Instruct-Q4_K_M.gguf</a></td><td>1.87</td><td class="us">92.7</td><td>22.6</td><td>329.5</td><td class="us">114</td><td>318</td><td>20,065</td></tr>
<tr><td><a href="https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/blob/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf">bartowski/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf</a></td><td>4.58</td><td class="us">47.7</td><td>11.2</td><td>171.6</td><td class="us">54</td><td>163</td><td>11,462</td></tr>
</tbody>
<tbody><tr class="fam"><td colspan="8">Gemma 3</td></tr>
<tr><td><a href="https://huggingface.co/ggml-org/gemma-3-270m-it-qat-GGUF/blob/main/gemma-3-270m-it-qat-Q4_0.gguf">ggml-org/gemma-3-270m-it-qat-Q4_0.gguf</a></td><td>0.22</td><td class="us">529.4</td><td>112.4</td><td>878.8</td><td class="us">1,642</td><td>3,081</td><td>57,202</td></tr>
<tr><td><a href="https://huggingface.co/ggml-org/gemma-3-1b-it-qat-GGUF/blob/main/gemma-3-1b-it-qat-Q4_0.gguf">ggml-org/gemma-3-1b-it-qat-Q4_0.gguf</a></td><td>0.66</td><td class="us">239.8</td><td>58.4</td><td>515.1</td><td class="us">488</td><td>795</td><td>34,729</td></tr>
<tr><td><a href="https://huggingface.co/ggml-org/gemma-3-4b-it-qat-GGUF/blob/main/gemma-3-4b-it-qat-Q4_0.gguf">ggml-org/gemma-3-4b-it-qat-Q4_0.gguf</a></td><td>2.35</td><td class="us">84.4</td><td>21.0</td><td>240.5</td><td class="us">118</td><td>243</td><td>18,292</td></tr>
</tbody>
<tbody><tr class="fam"><td colspan="8">GPT-2</td></tr>
<tr><td><a href="https://huggingface.co/mradermacher/gpt2-GGUF/blob/main/gpt2.Q4_K_M.gguf">mradermacher/gpt2.Q4_K_M.gguf</a></td><td>0.10</td><td class="us">959.1</td><td>206.0</td><td>1,836.6</td><td class="us">1,213</td><td>5,435</td><td>94,267</td></tr>
<tr><td><a href="https://huggingface.co/mradermacher/gpt2-medium-GGUF/blob/main/gpt2-medium.Q4_K_M.gguf">mradermacher/gpt2-medium.Q4_K_M.gguf</a></td><td>0.25</td><td class="us">402.6</td><td>63.5</td><td>939.9</td><td class="us">415</td><td>2,112</td><td>57,861</td></tr>
<tr><td><a href="https://huggingface.co/mradermacher/gpt2-large-GGUF/blob/main/gpt2-large.Q4_K_M.gguf">mradermacher/gpt2-large.Q4_K_M.gguf</a></td><td>0.51</td><td class="us">218.6</td><td>47.3</td><td>582.6</td><td class="us">213</td><td>931</td><td>35,498</td></tr>
</tbody><tfoot><tr><td colspan="8">† From a later build of the same version.</td></tr></tfoot></table></div>

<p class="caption"><code>llama-bench</code> with its defaults, version 1.1.0, October 2026. tg128 is 128 tokens generated from an empty cache (decode); pp512 is a 512-token prompt (prefill). Tokens per second, the mean of five runs. Size is <code>llama-bench</code>'s model size; all models are 4-bit quantized. The CPU is the same host's two Xeon Gold 5218, 32 cores. The FPGA columns are shaded.</p>

Decoding Llama 3.1 8B, the card reads 224 GB of weights a second, against the memory's rated 460 GB/s. An RTX 4090 is still faster on every model; its memory is rated at 1,008 GB/s. Prefill is still slower on the card than on the CPU; this work is about decode.

## Next

Keeping this speed as the context grows, up to the longest context the card's memory holds.
