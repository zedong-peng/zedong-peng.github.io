---
layout: post
title: "Linear Attention 在 GPU 上到底慢在哪"
date: 2026-03-01 12:00:00 +0800
description: "Linear attention 在 GPU 上表现不好是直觉，不是结论。我们做了一组实验，然后被学长推翻了一半。这篇文章记录这个过程。"
tags: linear-attention gpu cuda benchmarking research
categories: research
related_posts: false
toc:
  beginning: true
---

# Linear Attention 在 GPU 上慢在哪, 能否开发专用加速器

"Linear attention 在 GPU 上表现不好"——这句话在圈子里流传很广，但它是直觉，不是结论。我们决定把它变成一个可以被证伪的问题，做了一组实验，然后被学长推翻了一半。这篇文章记录这个过程。

---

## 实验设计

问题拆成两个：

1. FLA 的 chunk-wise Triton kernel 相对于朴素实现优化了多少？
2. 即使是最优 linear attention，和 FlashAttention 的差距在哪？

在开始之前，需要明确一个术语：LLM 推理分两个阶段——**Prefill**（一次性处理整段输入 prompt，建立 KV cache 或 state）和 **Decode**（每步只处理 1 个新 token，逐步生成）。下面所有实验都是 prefill benchmark，decode 尚未覆盖。这个区分很重要，因为 linear attention 在两个阶段的瓶颈性质不同。

三条对照线：

| 实现 | 说明 |
|---|---|
| FlashAttention (SDPA) | softmax attention 当前最优实现，基线 |
| GLA (chunk_gla, FLA 0.4.2) | 带 gating 的 Triton chunk kernel，当前最优 linear attention 实现 |
| Naive linear attention | `Q(K^T V)` causal recurrence，纯 PyTorch，理论下界 |

测试环境：RTX 4090，CUDA 12.2，bf16，H=16，D=128，causal。Shape sweep：B ∈ {1, 4, 16}，T ∈ {2K, 4K, 8K, 16K}。

---

## 实验结果

### Latency（prefill，单位 ms）

| impl | B=1 T=4K | B=1 T=16K | B=4 T=16K | B=16 T=4K | B=16 T=16K |
|---|---:|---:|---:|---:|---:|
| FlashAttn | 0.54 | 7.17 | 27.98 | 7.09 | 111.68 |
| GLA | 0.47 | 2.17 | 8.28 | 7.90 | 32.97 |

GLA 在长序列下确实更快：T=16K 时约快 **3.3–3.4×**。但在大 batch 短序列（B=16，T=4K）下反而慢 1.1×。

### Peak Memory（单位 MB）

| impl | B=1 T=4K | B=1 T=16K | B=16 T=16K |
|---|---:|---:|---:|
| FlashAttn | 72 | 265 | 4120 |
| GLA | 168 | 648 | 10248 |

GLA 的 peak memory 在所有 shape 下均约为 FlashAttn 的 **2.4–2.5×**。这和直觉相反——GLA 理论上是 O(T) memory，但 chunk-wise 实现需要存储中间 chunk states 和 intra-chunk attention 矩阵，实际 peak memory 反而更高。**"linear attention 更省内存"在 chunk_gla 实现下不成立。**

### Kernel Profiling（3 个代表点）

GLA 的计算分散到 5 个独立 kernel：`chunk_gla_fwd_kernel_o`（35%）、`chunk_fwd_kernel_h`（23%）、`intra_sub_inter`（17%）、`intra_sub_intra`（16%）、`cumsum`（7%）。FlashAttn 同 shape 只有 1 个 kernel。

`chunk_fwd_kernel_h`（state update / recurrence）稳定占 22–23%，是 GLA 相对于 FlashAttn 的额外开销来源。瓶颈类型是**多 kernel 分散执行 + state update 开销**，不是 launch overhead 或 occupancy 不足。

---

## 学长的反馈：实验方向有误

把结果发给学长，得到的回复是：这个实验测的不是真正的瓶颈。

Linear attention 的 state update 是：

```
h ← h · g + k^T v    # h 是 D×D 矩阵，D=128
```

这是一个 **128×128 的矩阵乘法**。GPU 的 TensorCore 是为大矩阵设计的，128×128 的小矩阵无法填满计算流水线，大量计算单元空转。更关键的是，recurrence 步与步之间有数据依赖，**无法通过增大 batch 或并行化来补救**。

两个问题叠加：单步计算量太小 → TensorCore 利用率低；步间串行依赖 → 无法并行化填满。

在 H200/Blackwell 上这个问题更突出：这些卡的 TensorCore 算力占比更高、CUDA core 相对更弱，linear attention 的 recurrence 既用不满 TensorCore 又跑不快，mismatch 更严重。

**4090 上的实验观察到的是 prefill 场景下的 O(T) vs O(T²) 复杂度差异，不是 GPU 利用率问题。** 这个结果本身没错，但没有触及真正的瓶颈。

真正需要测的是：在 H200 上，linear attention 的 TensorCore 利用率是多少？用 `ncu` 的 `sm__pipe_tensor_cycles_active` 指标可以直接看到。

学长还补充了一点：GPU 的 CUDA core / TensorCore 分离设计对 linear attention 不友好，但其实对 softmax attention 也不是天然友好的——FlashAttention 4 就是在解决这个问题。所以不是"GPU 为 softmax 设计所以对 linear 不好"，而是 **GPU 对两者都有 mismatch，只是程度不同**。

---

## 另一种声音

同级做加速器的同学提出了不同看法：

> Linear attention 的核心 idea 是把 QK 先算改成先算 KV，把 O(n²d) 变成 O(nd²)，因为 d<<n 所以称为线性。但 d 本身也不小，TensorCore 的 tile 是 4×4×4，理论上应该能跑满。CUDA core 是否真的是瓶颈还不确定——要看具体实现里对 K/V 用了什么非线性变换。直觉上，如果 linear attention 的计算本身没有稀疏性，现有 GPU 架构是能跑的，只是工程上没有实现好。做加速器的价值可能一般——能靠讲故事发论文，但 GPU kernel 一更新可能就没有优势了。

这个观点和学长的判断存在真实分歧，核心争议是：

- D×D state update 到底能不能跑满 TensorCore？（理论上 tile 够大，实践上 recurrence 串行依赖是否导致利用率低？）
- 加速器的价值是否只是学术上的，还是有真实部署场景？

**这正是需要在 H200 上用 `ncu` 实测来回答的问题。**

---

## 正确的 baseline 和下一步

基于学长的反馈，baseline 需要修正。完整的 baseline 层级是：

| Level | 实现 | 作用 |
|---|---|---|
| L0 | naive PyTorch recurrence / `torch.einsum` | 正确性 oracle，small-shape 单元测试 |
| L1 | `torch.compile` | 最基础自动优化层，证明"自动优化本身不够" |
| L2 | FLA (flash-linear-attention) | Triton-level 性能参考，社区事实标准 |
| L3 | **cuLA** | CUDA/CUTLASS 手写内核，当前 GPU 优化上限 |
| L4 | FlexLinearAttention / Forge | compiler-generated kernel 的近上限参考 |

关键修正：**主性能 baseline 从 FLA 升级为 cuLA**。cuLA 专门为 Hopper (SM90) 和 Blackwell (SM10X) 手写 CUDA/CUTLASS 内核，在 Blackwell 上 KDA modular forward 平均 1.45x、Lightning Attention prefill 最高 1.86x 于 FLA Triton 实现。FLA 退为 L2 参考层。

测试平台也需要换：H200 或 Blackwell，不是 4090。测量指标除 latency/memory 外，必须加 `ncu` 的 `sm__pipe_tensor_cycles_active`（TensorCore 利用率）。

如果 `ncu` 数据显示 cuLA 在 H200 上 TensorCore 利用率仍然很低，那么学长的判断成立：问题是结构性的，正确方向是设计专用加速器（DSA），使其计算单元、片上 SRAM 分配和数据流专门针对 D×D 的连续 state update 优化。如果利用率接近上限，那么同学的判断更接近真相：工程问题，不是架构问题。

**如果只选一个 target architecture 做系统论文**，优先级是：

1. **GLA**：gated linear-attention 主线，最贴近"linear attention kernel/runtime"这个标题
2. **Mamba-2**：SSD / semiseparable 统一后的强系统块，覆盖更广义的 recurrent-state model infrastructure

Griffin / RecurrentGemma 更适合拿来证明 hybrid demand 是真实的，但它们混入了 local attention，不适合作为 kernel abstraction 的第一目标。

---

## 更大的图景

这个实验之外，还有一个值得单独说的 framing 问题。

"Linear attention 会取代 softmax attention"这个 thesis 风险很高。当前证据更支持的说法是：**hybrid recurrent / linear-attention 模型已经成为真实模型设计空间**——Jamba、Kimi Linear、MiniMax-M1、Granite 4.0 都在用某种 hybrid 架构——因此它们需要像 FlashAttention 之于 softmax attention 那样成熟的 kernel / compiler stack。

这个 framing 更稳，因为它不依赖"linear attention 一定更快"这个还没被证明的前提，而是从真实的工业需求出发。

以下几个 thesis 风险很高，应该避免：

- "`O(n)` 一定比 FlashAttention 更快"——wall-clock 取决于 state update 的 arithmetic intensity，不由复杂度直接决定
- "只要把 recurrence 写进 Triton，问题就解决了"——register pressure 和中间 state materialization 是核心瓶颈，不是边角问题
- "pure linear attention 会自然成为主流生产架构"——当前证据支持的是 hybrid demand，不是 pure replacement story