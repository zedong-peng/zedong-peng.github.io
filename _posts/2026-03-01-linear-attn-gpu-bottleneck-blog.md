---
layout: post
title: "Where Is Linear Attention Actually Slow on GPUs?"
date: 2026-03-01 12:01:00 +0800
lang: en
translation_key: linear-attention-gpu
description: "Poor GPU performance for linear attention is an intuition, not a conclusion. We ran experiments, then had half of our interpretation overturned. This post records that process."
categories: research
related_posts: false
toc:
  beginning: true
---

# Where Is Linear Attention Slow on GPUs, and Can a Specialized Accelerator Help?

"Linear attention performs poorly on GPUs" is a common claim, but it is an intuition rather than a conclusion. We decided to turn it into a falsifiable question and ran a set of experiments. A senior colleague then overturned half of our interpretation. This post records that process.

---

## Experimental Design

We split the question into two parts:

1. How much does FLA's chunk-wise Triton kernel improve over a naive implementation?
2. Even with an optimized implementation, where does linear attention fall behind FlashAttention?

First, one term needs clarification. LLM inference has two phases: **prefill**, which processes the entire input prompt at once and constructs a KV cache or state; and **decode**, which processes one new token per step during generation. All experiments below benchmark prefill. Decode is not yet covered. This distinction matters because the bottlenecks of linear attention differ between the two phases.

We used three reference implementations:

| Implementation               | Description                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| FlashAttention (SDPA)        | State-of-the-art softmax attention implementation; our baseline            |
| GLA (`chunk_gla`, FLA 0.4.2) | Gated Triton chunk kernel; a leading linear-attention implementation       |
| Naive linear attention       | Causal `Q(K^T V)` recurrence in pure PyTorch; a theoretical lower baseline |

Test environment: RTX 4090, CUDA 12.2, bf16, H=16, D=128, causal. Shape sweep: B in {1, 4, 16}, T in {2K, 4K, 8K, 16K}.

---

## Results

### Latency (prefill, ms)

| impl      | B=1 T=4K | B=1 T=16K | B=4 T=16K | B=16 T=4K | B=16 T=16K |
| --------- | -------: | --------: | --------: | --------: | ---------: |
| FlashAttn |     0.54 |      7.17 |     27.98 |      7.09 |     111.68 |
| GLA       |     0.47 |      2.17 |      8.28 |      7.90 |      32.97 |

GLA is indeed faster on long sequences: at T=16K, it is about **3.3-3.4x** faster. With a large batch and shorter sequence (B=16, T=4K), however, it is 1.1x slower.

### Peak Memory (MB)

| impl      | B=1 T=4K | B=1 T=16K | B=16 T=16K |
| --------- | -------: | --------: | ---------: |
| FlashAttn |       72 |       265 |       4120 |
| GLA       |      168 |       648 |      10248 |

GLA's peak memory is about **2.4-2.5x** that of FlashAttention across all tested shapes. This contradicts the usual intuition. Although GLA has O(T) theoretical memory complexity, the chunk-wise implementation must store intermediate chunk states and intra-chunk attention matrices, leading to higher peak memory in practice. **The claim that "linear attention uses less memory" does not hold for this `chunk_gla` implementation.**

### Kernel Profiling at Three Representative Points

GLA distributes its computation across five separate kernels: `chunk_gla_fwd_kernel_o` (35%), `chunk_fwd_kernel_h` (23%), `intra_sub_inter` (17%), `intra_sub_intra` (16%), and `cumsum` (7%). FlashAttention uses only one kernel at the same shape.

`chunk_fwd_kernel_h`, which performs the state update or recurrence, consistently accounts for 22-23% of execution time. This is overhead that GLA has relative to FlashAttention. The observed bottleneck is **execution spread across multiple kernels plus state-update cost**, rather than kernel-launch overhead or insufficient occupancy.

---

## Feedback from a Senior Colleague: We Measured the Wrong Thing

After seeing the results, a senior colleague pointed out that the experiment did not measure the real bottleneck.

The linear-attention state update is:

```text
h <- h * g + k^T v    # h is a D x D matrix, D=128
```

This is a **128 x 128 matrix operation**. GPU Tensor Cores are designed for large matrices, and an operation at this size may not fill the compute pipeline, leaving many units idle. More importantly, consecutive recurrence steps have data dependencies, so **increasing the batch size or parallelism cannot necessarily hide the underutilization**.

Two problems may therefore compound each other: each step has too little work to utilize Tensor Cores fully, and sequential dependencies between steps prevent parallel execution from filling the machine.

The problem may be more pronounced on H200 and Blackwell GPUs. Tensor Core throughput represents a larger share of these architectures' compute capacity, while relative CUDA-core performance is weaker. The linear-attention recurrence may neither utilize the Tensor Cores nor run efficiently elsewhere, making the mismatch more severe.

**Our RTX 4090 experiment primarily observed the O(T) versus O(T^2) complexity difference during prefill, not GPU utilization.** The result itself is valid, but it does not reach the actual bottleneck.

The right measurement is Tensor Core utilization for linear attention on an H200. The `sm__pipe_tensor_cycles_active` metric in `ncu` can show this directly.

The colleague added one more qualification: the separation between CUDA cores and Tensor Cores is unfriendly to linear attention, but it is not naturally ideal for softmax attention either. FlashAttention 4 also addresses this mismatch. The claim should therefore not be "GPUs are designed for softmax and bad for linear attention." GPUs have architectural mismatches with both, but to different degrees.

---

## A Different View

A classmate working on accelerators offered a different interpretation:

> The central idea of linear attention is to compute KV before QK, reducing O(n^2 d) to O(n d^2). It is called linear because d is much smaller than n, but d itself is not tiny. Tensor Core tiles are 4 x 4 x 4, so in principle the operation should be able to utilize them. It remains unclear whether CUDA cores are truly the bottleneck; that depends on the nonlinear transformations applied to K and V in the specific implementation. Intuitively, if the linear-attention computation is not sparse, existing GPU architectures should be capable of running it, and the main problem may simply be an immature implementation. A specialized accelerator may have limited practical value: it might support a paper, but a new GPU kernel could erase its advantage.

This view genuinely conflicts with the senior colleague's diagnosis. The central questions are:

- Can the D x D state update actually saturate Tensor Cores? The tile size is theoretically sufficient, but do sequential recurrence dependencies reduce utilization in practice?
- Is a specialized accelerator useful only as an academic exercise, or does it serve a real deployment need?

**These questions need direct `ncu` measurements on an H200.**

---

## Correct Baselines and Next Steps

Based on the feedback, the baseline hierarchy needs to be revised:

| Level | Implementation                            | Purpose                                                                           |
| ----- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| L0    | Naive PyTorch recurrence / `torch.einsum` | Correctness oracle and small-shape unit tests                                     |
| L1    | `torch.compile`                           | Basic automatic optimization, showing that automatic optimization is insufficient |
| L2    | FLA (flash-linear-attention)              | Triton-level performance reference and community standard                         |
| L3    | **cuLA**                                  | Handwritten CUDA/CUTLASS kernels and the current upper bound for GPU optimization |
| L4    | FlexLinearAttention / Forge               | Approximate upper-bound reference for compiler-generated kernels                  |

The key correction is to promote **cuLA to the primary performance baseline**. cuLA provides handwritten CUDA/CUTLASS kernels for Hopper (SM90) and Blackwell (SM10X). On Blackwell, its KDA modular forward pass averages 1.45x the performance of FLA's Triton implementation, while Lightning Attention prefill reaches up to 1.86x. FLA moves down to the L2 reference layer.

The test platform must also change from the RTX 4090 to H200 or Blackwell. In addition to latency and memory, measurements must include the `sm__pipe_tensor_cycles_active` Tensor Core utilization metric from `ncu`.

If `ncu` shows that cuLA still has low Tensor Core utilization on H200, the senior colleague's diagnosis is supported: the problem is structural. A specialized accelerator would then be a plausible direction, with compute units, on-chip SRAM allocation, and dataflow designed specifically for repeated D x D state updates. If utilization is already near the hardware limit, the classmate's diagnosis is more likely: this is an engineering problem, not an architectural one.

**If only one target architecture can be selected for a systems paper**, the priorities are:

1. **GLA**: the main gated linear-attention family, and the closest match to a "linear-attention kernel/runtime" framing
2. **Mamba-2**: a strong systems block after the SSD/semiseparable unification, covering the broader recurrent-state-model infrastructure

Griffin and RecurrentGemma are useful evidence that demand for hybrid architectures is real, but both mix in local attention. They are therefore less suitable as the first target for a kernel abstraction.

---

## The Bigger Picture

Beyond this experiment, the framing deserves separate attention.

The thesis that "linear attention will replace softmax attention" is risky. Current evidence supports a narrower claim: **hybrid recurrent and linear-attention models are now a real model-design space**. Jamba, Kimi Linear, MiniMax-M1, and Granite 4.0 all use some form of hybrid architecture. They therefore need a mature kernel and compiler stack analogous to what FlashAttention provides for softmax attention.

This framing is more defensible because it does not depend on the unproven premise that linear attention must be faster. It starts from demonstrated industry demand.

Several risky claims should be avoided:

- "O(n) must be faster than FlashAttention." Wall-clock performance depends on the arithmetic intensity of the state update, not complexity alone.
- "Writing the recurrence in Triton solves the problem." Register pressure and intermediate-state materialization are central bottlenecks, not minor implementation details.
- "Pure linear attention will naturally become the dominant production architecture." Current evidence supports demand for hybrid models, not a pure-replacement story.

---

> Translated from the original Chinese with AI assistance.
