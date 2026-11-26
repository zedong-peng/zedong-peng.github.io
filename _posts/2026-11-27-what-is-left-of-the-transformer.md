---
layout: post
title: "What is left of the 2017 Transformer"
date: 2026-11-27 07:00:00 +0800
lang: en
description: "A frontier model in 2026 is still called a Transformer, though nearly every part of the 2017 design has been replaced. Each replacement with its paper, grouped by the bottleneck that forced it."
categories: better-ml
related_posts: false
---

<style>
  .tf-table { display: table; width: 100%; min-width: 600px; }
  .tf-b { width: 27%; color: var(--muted); }
  .tf-a { width: 28%; }
  .tf-grp td { padding-top: 32px; font-weight: 600; color: var(--fg) !important; border-bottom-color: var(--fg); }
  .tf-grp span { font-weight: 400; color: var(--muted); margin-left: 6px; }
  .tf-fig { width: min(940px, calc(100vw - 40px)); position: relative; left: 50%; transform: translateX(-50%); margin: 48px 0; font-family: var(--sans); }
  .tf-title { font-weight: 600; font-size: var(--size-text); margin-bottom: 12px; }
  .tf-grid { display: grid; grid-template-columns: 44px repeat(6, minmax(112px, 1fr)); gap: 3px; min-width: 740px; font-size: var(--size-small); line-height: 1.4; }
  .tf-h { font-weight: 500; padding: 0 8px 8px; align-self: end; }
  .tf-y { color: var(--muted); padding: 8px 0; font-variant-numeric: tabular-nums; position: sticky; left: 0; background: var(--bg); }
  .tf-c { background: var(--wash); border-radius: 4px; padding: 8px; }
  .tf-fig figcaption { margin-top: 12px; }
  .prose .footnotes { font-family: var(--sans); }
  @media (max-width: 600px) {
    .tf-table { min-width: 0; }
    .tf-table thead { display: none; }
    .tf-table, .tf-table tbody, .tf-table tr, .tf-table td { display: block; width: auto; }
    .tf-table td { border: 0; padding: 0 0 6px; }
    .tf-table tr { padding: 14px 0 8px; border-bottom: 1px solid var(--line); }
    .tf-table tr.tf-grp { padding-top: 32px; border-bottom-color: var(--fg); }
    .tf-grp td { padding: 0; }
    .tf-a::before { content: "→ "; color: var(--muted); }
  }
  .tf-c span { display: block; }
  .tf-c span + span { margin-top: 3px; }
</style>

A frontier language model in 2026 is still called a Transformer. Set it beside the architecture of the [2017 paper](https://arxiv.org/abs/1706.03762), though, and little is left but the idea of self-attention and the residual backbone. Nearly every other part has been replaced.

The table lists the replacements in the order that a Douyin video by PaperMark (in Chinese) walks through them, grouped by the six engineering bottlenecks that forced them.<sup>1</sup>

<div class="scroll" markdown="0">
<table class="tf-table">
  <thead><tr><th>Before</th><th>After</th><th>How it works</th></tr></thead>
  <tbody>
    <tr class="tf-grp"><td colspan="3">Backbone and depth <span>2017–2020</span></td></tr>
    <tr><td class="tf-b">Encoder–decoder, built for translation</td><td class="tf-a">Decoder-only: <a href="https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf">GPT</a>, 2018; <a href="https://arxiv.org/abs/2005.14165">GPT-3</a>, 2020</td><td>Every task becomes continuing a prefix, and every position is a next-token target. <a href="https://arxiv.org/abs/1810.04805">BERT</a> kept only the encoder; <a href="https://arxiv.org/abs/1910.10683">T5</a> kept both.</td></tr>
    <tr><td class="tf-b">Post-LN: LayerNorm after the residual add</td><td class="tf-a">Pre-LN, analyzed by <a href="https://arxiv.org/abs/2002.04745">Xiong et al.</a>, 2020</td><td>The norm moves inside the residual branch, leaving an identity path from the top layer to the bottom. Deep stacks then train without a learning-rate warmup.</td></tr>
    <tr class="tf-grp"><td colspan="3">Inside the layer <span>2019–2023</span><sup>2</sup></td></tr>
    <tr><td class="tf-b">LayerNorm</td><td class="tf-a"><a href="https://arxiv.org/abs/1910.07467">RMSNorm</a>, 2019</td><td>No mean subtraction: activations are scaled by their root mean square alone.</td></tr>
    <tr><td class="tf-b">ReLU feed-forward, hidden width 4<i>d</i></td><td class="tf-a"><a href="https://arxiv.org/abs/2002.05202">SwiGLU</a>, 2020</td><td>Two projections, one passed through Swish as a gate, multiplied elementwise. The hidden width drops to about 8<i>d</i>/3 to keep the parameter count.</td></tr>
    <tr><td class="tf-b">Sinusoidal positions added to the embeddings</td><td class="tf-a"><a href="https://arxiv.org/abs/2104.09864">RoPE</a>, 2021; <a href="https://arxiv.org/abs/2309.00071">YaRN</a>, 2023</td><td>Each pair of dimensions in Q and K is rotated by an angle proportional to position, so their dot product depends only on the offset. NTK-aware scaling and YaRN rescale the angles to extend the context.</td></tr>
    <tr><td class="tf-b">Unnormalized Q and K</td><td class="tf-a"><a href="https://arxiv.org/abs/2010.04245">QK-Norm</a>, 2020</td><td>Q and K are normalized before their dot product. <a href="https://arxiv.org/abs/2302.05442">ViT-22B</a> used it to stop attention logits from growing until training diverged.</td></tr>
    <tr class="tf-grp"><td colspan="3">Memory wall <span>2022–2024</span></td></tr>
    <tr><td class="tf-b">The full <i>N</i>×<i>N</i> score matrix written to and read from HBM</td><td class="tf-a"><a href="https://arxiv.org/abs/2205.14135">FlashAttention</a>, 2022; <a href="https://arxiv.org/abs/2407.08608">FlashAttention-3</a>, 2024</td><td>Q, K and V are tiled into on-chip SRAM and the softmax is computed online, so the score matrix never leaves the chip and the result is exact. FlashAttention-3 adds Hopper's asynchronous copies and FP8.</td></tr>
    <tr><td class="tf-b">Multi-head attention: one K and V per head in the cache</td><td class="tf-a"><a href="https://arxiv.org/abs/1911.02150">MQA</a>, 2019; <a href="https://arxiv.org/abs/2305.13245">GQA</a>, 2023; <a href="https://arxiv.org/abs/2405.04434">MLA</a> in DeepSeek-V2, 2024</td><td>MQA shares one K and V across all heads, and GQA one per group of heads, as in Llama 2 70B and Llama 3. MLA caches one low-rank latent per token from which K and V are recovered; the up-projections are absorbed into the query and output weights, and a small separate part carries RoPE.</td></tr>
    <tr class="tf-grp"><td colspan="3">Sparse experts <span>2020–2025</span></td></tr>
    <tr><td class="tf-b">A dense feed-forward layer: every parameter runs for every token</td><td class="tf-a">Mixture of experts: <a href="https://arxiv.org/abs/2006.16668">GShard</a>, 2020; <a href="https://arxiv.org/abs/2101.03961">Switch Transformer</a>, 2021; <a href="https://arxiv.org/abs/2401.04088">Mixtral</a>, 2023; <a href="https://ai.meta.com/blog/llama-4-multimodal-intelligence/">Llama 4</a>, 2025</td><td>The feed-forward layer is split into many experts and a router sends each token to a few, so total parameters grow while compute per token stays fixed.</td></tr>
    <tr><td class="tf-b">A few large experts</td><td class="tf-a"><a href="https://arxiv.org/abs/2401.06066">DeepSeekMoE</a>, 2024</td><td>Many small experts, plus shared experts that every token passes through. The shared experts hold common knowledge, so the routed ones need not each relearn it.</td></tr>
    <tr><td class="tf-b">An auxiliary loss to balance expert load</td><td class="tf-a"><a href="https://arxiv.org/abs/2408.15664">Auxiliary-loss-free balancing</a>, 2024</td><td>A bias on each expert's routing score is raised or lowered according to its recent load, with no loss term pulling against quality.</td></tr>
    <tr><td class="tf-b">Next-token prediction only</td><td class="tf-a"><a href="https://arxiv.org/abs/2412.19437">Multi-token prediction</a> in DeepSeek-V3, 2024</td><td>Extra modules predict tokens further ahead, which densifies the training signal. At inference they can draft tokens for speculative decoding.</td></tr>
    <tr class="tf-grp"><td colspan="3">Serving <span>2022–2026</span></td></tr>
    <tr><td class="tf-b">Static batching: a batch ends with its longest reply</td><td class="tf-a">Continuous batching, <a href="https://www.usenix.org/conference/osdi22/presentation/yu">Orca</a>, 2022</td><td>Scheduling happens every iteration: finished requests leave and new ones join between steps.</td></tr>
    <tr><td class="tf-b">A contiguous KV region reserved for each request</td><td class="tf-a"><a href="https://arxiv.org/abs/2309.06180">PagedAttention</a> in vLLM, 2023</td><td>The cache is split into fixed-size blocks allocated on demand, like pages of virtual memory.</td></tr>
    <tr><td class="tf-b">Shared prefixes recomputed for every request</td><td class="tf-a"><a href="https://arxiv.org/abs/2312.07104">RadixAttention</a> in SGLang, 2023</td><td>Cached prefixes live in a radix tree, so multi-turn chats and shared system prompts skip repeated prefill.</td></tr>
    <tr><td class="tf-b">Prefill and decode on the same GPUs</td><td class="tf-a">Disaggregation, <a href="https://arxiv.org/abs/2401.09670">DistServe</a>, 2024</td><td>Prefill, bound by compute, and decode, bound by memory bandwidth, run on separate GPUs, so a long prompt no longer stalls replies in progress.</td></tr>
    <tr><td class="tf-b">One token per forward pass</td><td class="tf-a"><a href="https://arxiv.org/abs/2211.17192">Speculative decoding</a>, 2022</td><td>A small draft model, or the model's own MTP modules, proposes several tokens and the large model checks them in one pass. The output distribution is unchanged.</td></tr>
    <tr><td class="tf-b">INT8 and INT4 quantization</td><td class="tf-a">Native <a href="https://arxiv.org/abs/2209.05433">FP8</a> on Hopper, FP4 on Blackwell</td><td>Low-precision floating-point formats that the hardware computes in directly.</td></tr>
    <tr class="tf-grp"><td colspan="3">Foundations <span>2025–2026</span></td></tr>
    <tr><td class="tf-b" rowspan="3">Full O(<i>N</i>²) attention in every layer</td><td class="tf-a">Hybrid linear attention: <a href="https://arxiv.org/abs/2501.08313">MiniMax-01</a>; <a href="https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct">Qwen3-Next</a> with <a href="https://arxiv.org/abs/2412.06464">Gated DeltaNet</a>; <a href="https://arxiv.org/abs/2510.26692">Kimi Linear</a>; all 2025</td><td>Most layers compress the history into a fixed-size state and run in O(<i>N</i>); the full-attention layers between them keep exact recall. Qwen3-Next uses three linear layers per full one, and Kimi Linear's KDA gives each feature channel its own decay.</td></tr>
    <tr><td class="tf-a">Sparse attention: <a href="https://arxiv.org/abs/2512.02556">DSA</a> in DeepSeek-V3.2, 2025</td><td>A lightweight indexer picks the most relevant earlier tokens for each query, and attention runs over those alone.</td></tr>
    <tr><td class="tf-a">Interleaved layers: iRoPE in <a href="https://ai.meta.com/blog/llama-4-multimodal-intelligence/">Llama 4</a>, 2025</td><td>Local-window layers with RoPE alternate with global layers that use no positional encoding.</td></tr>
    <tr><td class="tf-b">Attention output passed straight to the output projection</td><td class="tf-a"><a href="https://arxiv.org/abs/2505.06708">Gated attention</a>, 2025</td><td>A query-dependent sigmoid gate on each head's output adds non-linearity and sparsity, and removes attention sinks and massive activations. Qwen3-Next uses it; it won a NeurIPS 2025 best paper award.</td></tr>
    <tr><td class="tf-b">A single residual stream</td><td class="tf-a"><a href="https://arxiv.org/abs/2512.24880">mHC</a>, 2025</td><td>The residual widens into several streams mixed by matrices constrained to be doubly stochastic, which restores the identity mapping of a plain residual and lets wide streams train at scale.</td></tr>
    <tr><td class="tf-b">Facts and set phrases stored only in the weights</td><td class="tf-a"><a href="https://arxiv.org/abs/2601.07372">Engram</a>, 2026</td><td>A hashed <i>n</i>-gram memory read in O(1) takes over static patterns, a sparsity axis beside MoE. Its addresses depend only on the input tokens, so the table can be prefetched from host memory.</td></tr>
  </tbody>
</table>
</div>

<figure class="tf-fig" markdown="0">
<div class="tf-title">When each part changed</div>
<div class="scroll">
<div class="tf-grid">
  <div class="tf-h"></div>
  <div class="tf-h">Backbone and depth</div>
  <div class="tf-h">Inside the layer</div>
  <div class="tf-h">Memory wall</div>
  <div class="tf-h">Sparse experts</div>
  <div class="tf-h">Serving</div>
  <div class="tf-h">Foundations</div>
  <div class="tf-y">2017</div>
  <div class="tf-c"><span>Transformer</span></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div class="tf-y">2018</div>
  <div class="tf-c"><span>BERT</span><span>GPT</span></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div class="tf-y">2019</div>
  <div class="tf-c"><span>T5</span></div>
  <div class="tf-c"><span>RMSNorm</span></div>
  <div class="tf-c"><span>MQA</span></div>
  <div></div>
  <div></div>
  <div></div>
  <div class="tf-y">2020</div>
  <div class="tf-c"><span>GPT-3</span><span>Pre-LN</span></div>
  <div class="tf-c"><span>SwiGLU</span><span>QK-Norm</span></div>
  <div></div>
  <div class="tf-c"><span>GShard</span></div>
  <div></div>
  <div></div>
  <div class="tf-y">2021</div>
  <div></div>
  <div class="tf-c"><span>RoPE</span></div>
  <div></div>
  <div class="tf-c"><span>Switch</span></div>
  <div></div>
  <div></div>
  <div class="tf-y">2022</div>
  <div></div>
  <div></div>
  <div class="tf-c"><span>FlashAttention</span></div>
  <div></div>
  <div class="tf-c"><span>Orca</span><span>Speculative decoding</span><span>FP8</span></div>
  <div></div>
  <div class="tf-y">2023</div>
  <div></div>
  <div class="tf-c"><span>YaRN</span><span>LLaMA</span></div>
  <div class="tf-c"><span>GQA</span></div>
  <div class="tf-c"><span>Mixtral</span></div>
  <div class="tf-c"><span>vLLM</span><span>SGLang</span></div>
  <div></div>
  <div class="tf-y">2024</div>
  <div></div>
  <div></div>
  <div class="tf-c"><span>MLA</span><span>FlashAttention-3</span></div>
  <div class="tf-c"><span>DeepSeekMoE</span><span>Loss-free balancing</span><span>MTP</span></div>
  <div class="tf-c"><span>DistServe</span><span>FP4</span></div>
  <div></div>
  <div class="tf-y">2025</div>
  <div></div>
  <div></div>
  <div></div>
  <div class="tf-c"><span>Llama 4</span></div>
  <div></div>
  <div class="tf-c"><span>MiniMax-01</span><span>Gated attention</span><span>Llama 4 iRoPE</span><span>Qwen3-Next</span><span>DSA</span><span>Kimi Linear</span><span>mHC</span></div>
  <div class="tf-y">2026</div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div class="tf-c"><span>Engram</span></div>
</div>
</div>
<figcaption>Each name sits in the year its paper or release appeared.</figcaption>
</figure>

The video ends on why the name stuck. Two things have held since 2017: the architecture maps well onto parallel hardware, and attention gives one framework for routing information between the positions of a sequence. In its reading, every change in the table pushed the engineering frontier out a little among four constraints: expressiveness, memory bandwidth, computational complexity and training stability.

<div class="footnotes" markdown="0">
  <div class="title">Footnotes</div>
  <p><sup>1</sup> The grouping and most of the details follow the video. The links go to the paper or release that introduced each change.</p>
  <p><sup>2</sup> <a href="https://arxiv.org/abs/2302.13971">LLaMA</a> (2023) used RMSNorm, SwiGLU and RoPE together, and the combination became the standard layer.</p>
</div>
