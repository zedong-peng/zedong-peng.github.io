---
layout: post
title: "ForgeHLS and DiffHLS: why I built them, and why HLS still feels like a trap"
date: 2026-04-14 20:50:00 +0800
description: "A personal note on building a large-scale HLS dataset, pushing DiffHLS forward, and why I remain skeptical about HLS as a long-term research direction in 2026."
tags: HLS ForgeHLS DiffHLS EDA LLM FPGA
categories: research
citation: true
related_posts: false
toc:
  beginning: true
---

On April 14, 2026, I finally decided to write down the real story behind **ForgeHLS** and **DiffHLS**. From the outside, they look like a dataset paper and an algorithm paper. From the inside, they were the result of more than a year of friction, stubbornness, infrastructure work, and repeated doubts about whether HLS was even a direction worth staying in.

For readers outside this area, **HLS (High-Level Synthesis)** is supposed to let you write hardware in a language like C or C++, and then use a toolchain to translate that program into FPGA-oriented RTL such as Verilog or VHDL. In the abstract, that sounds convenient. In practice, it often means writing software-shaped code while constantly worrying about hardware constraints that the source language does not express well.

## Why HLS caught my attention in 2024

In 2024, the scaling-law story had already shown its force. GPT had demonstrated that once data, compute, and model size cross certain thresholds, capabilities can emerge in ways that smaller systems simply cannot match. That logic was impossible to ignore.

At the same time, my advisor, [Prof. Jieru Zhao](https://zjru.github.io), is an HLS expert. Prof. Qiang Xu, one of my collaborators at the National Center of Technology Innovation for EDA in Nanjing, was leading a large circuit model effort. Put those pieces together and a natural question appeared:

> If large models benefit from large-scale training corpora everywhere else, why does HLS still not have a dataset at that scale?

That question became the starting point of ForgeHLS.

## Why ForgeHLS was hard

The difficulty was not conceptual. The difficulty was operational.

HLS is not like collecting plain code from GitHub and calling it a dataset. To build something useful, I had to process designs, normalize sources, generate variants, launch synthesis flows, collect QoR signals, and keep the entire workflow from collapsing under version mismatches and toolchain instability.

Part of the deeper problem is that HLS lives in an awkward semantic gap. C and C++ were designed for programmers, not for expressing precise hardware structure. They contain abstractions that do not map cleanly to RTL, and they hide decisions that hardware designers often need to control directly. Dynamic pointers are an obvious example: they are natural in software, but much harder to realize in synthesizable hardware. Meanwhile, many of the things hardware engineers actually care about such as pipelining, unrolling, partitioning, interface protocols, memory layout, and scheduling are not ordinary C constructs at all. In HLS, those controls re-enter the codebase through pragmas, vendor directives, and domain-specific boilerplate.

That is why HLS can feel worse than either side of the stack. If you want the ergonomics of software, HLS keeps dragging you back toward hardware constraints. If you want the control of hardware design, HLS makes you express that control indirectly through a translation layer. A lot of the work ends up being not "write C and get hardware," but "write C in a very non-idiomatic way, then add tool-specific annotations until the compiler produces something acceptable."

What made it worse was timing. When I started, tools like Cursor and Claude Code were already appearing, but they were nowhere near as capable as they are now in 2026. There was no reliable "agentic coding" setup that could just take over an industrial-scale data construction pipeline. A lot of the work still had to be designed, debugged, and pushed manually.

For someone who was still relatively new to HLS, this was painful. Building the dataset meant not only writing automation, but also learning the quirks of the HLS ecosystem while being judged by them. Even basic reproducibility was fragile because the result depends on the exact compiler, the exact version, and often the exact environment.

I relied on a mixture of handwritten automation and scripts scaffolded with Cursor. The Nanjing EDA center provided serious compute resources, including three machines with 8x A800 GPUs and 128-core CPUs, but in practice the core bottleneck was not GPU throughput. **Vitis HLS is mostly a CPU story**, so a large portion of the ForgeHLS pipeline ran on CPUs rather than accelerators.

The uncomfortable truth is that simply upgrading and stabilizing the workflow consumed the better part of half a year. Looking back, this was my first clear signal that HLS research is unusually labor-intensive relative to its eventual payoff.

## ForgeHLS solved a real problem, but not one the community urgently wanted

After the dataset was finally in shape, I expected the paper to have a clearer path. It did not.

One reason is structural: the HLS community is small. The number of groups actively pushing methodology is limited, and the demand for a large open dataset is much weaker than in mainstream ML fields. A dataset can be technically correct and still not be something the field is ready to reward.

Another reason is ecosystem fragmentation. In HLS, you do not work against one clean baseline. You work against multiple versions of Vitis, multiple optimization settings, and in some cases non-public or hard-to-use academic compilers. UCLA's compiler work is an example of how important baselines can be while still being difficult to reproduce in practice. This makes fair comparison expensive and replication even more expensive.

So ForgeHLS ran into an awkward reality: it offered scale to a field that still struggles to agree on what should be standardized.

## What repeated rejections taught me

ForgeHLS was not just difficult to build. It was also difficult to publish.

The paper was rejected by **ICCAD**, then **DAC**, and then **AAAI**. By the time it reached AAAI, I had already spent a long time refining the framing, experiments, and presentation. What made that stage especially frustrating was not simply the rejection itself, but the quality of some of the criticism.

Some reviewer comments, in my view, were not merely unconvinced. They were careless, insular, and at times plainly indefensible. The stated weaknesses did not hold up under close reading of the paper, and some criticisms were aimed at assumptions that were never made in the first place. Worse, one line of attack effectively suggested that the data underlying the paper was wrong, which was an especially absurd accusation given how much of the work had gone into building, checking, and stabilizing that dataset in the first place.

I do not think every negative review is malicious. Many are simply rushed. But in a small field, it is hard to ignore the possibility that community size and reviewer overlap create a distorted evaluation environment. When a research area is narrow, a small number of people can end up implicitly setting the tone for what is considered legitimate, useful, or worth accepting. That is a bad setup for any work that tries to expand the scope of the field.

This experience did not just make me more skeptical of HLS as a topic. It also made me more skeptical of spending too much emotional energy trying to "win over" the wrong review cycle.

## Why I built DiffHLS anyway

By the time ForgeHLS was built, I had already spent too much time on the infrastructure to walk away without trying to extract an actual modeling contribution from it.

The observation behind DiffHLS was simple. A single HLS codebase can lead to very different QoR outcomes under different pragma settings. In practice, the pragma is not just a small annotation. It is a control interface that changes how the eventual FPGA design is shaped. If you want to predict QoR, it is not enough to read the source code alone. You need to model the **difference induced by pragmas**.

That became the core idea of [DiffHLS](https://arxiv.org/abs/2604.09240): treat QoR prediction as a differential problem rather than a single-instance regression problem, and combine structural representations with code-aware embeddings.

DiffHLS, in that sense, was my way of forcing one more useful idea out of a dataset that had already cost too much to abandon.

## The limitation I could not eliminate

I do not think it is intellectually honest to discuss HLS prediction without acknowledging a central problem: **different HLS tools and different tool versions can synthesize materially different designs from the same source**.

That means there is no single timeless QoR target floating in the air. There is only QoR under a specific toolchain, version, configuration, and backend assumption.

ForgeHLS and DiffHLS are therefore unavoidably bounded by the environment they were built on. My data does not span every Vitis version, let alone every HLS tool. I was not going to exhaustively cover that space, and realistically no single PhD student should try. So although I believe the work is meaningful, I also think it is fair to say that part of it remains an academic artifact: useful for research, but not a universal answer to the real-world variability of HLS flows.

## Why I became skeptical of HLS as a research direction

The longer I worked on this, the more I felt that HLS occupies an awkward middle ground.

It sits between C/C++ and FPGA implementation, but often inherits the frustrations of both. If someone truly needs top-end hardware performance, they may still prefer direct FPGA design. If someone wants fast-moving practical acceleration in 2026, the center of gravity is overwhelmingly on the GPU side. GPUs are improving quickly, absorbing talent, money, software infrastructure, and industrial attention at a pace that FPGA and HLS simply are not matching.

The most frustrating part is that HLS is often sold as an abstraction win, while in reality it frequently behaves like an abstraction tax. You do not fully get to write normal software, because "normal" software constructs may synthesize badly or not at all. But you also do not get to write hardware directly, because the crucial low-level control is filtered through compiler behavior, pragmas, and tool heuristics. In many projects, that leaves you paying both costs at once.

That does not mean HLS has no value. It has had real commercial and engineering value in some settings. But my personal view, as of April 14, 2026, is that **HLS now feels much closer to a narrow academic niche than to a frontier direction for a graduate student who wants broad impact**.

The costs are easy to feel:

- the community is small;
- the paper network is tight and often familiarity-driven;
- reproducibility is expensive;
- toolchains are brittle;
- the practical upside is often weaker than the engineering pain required to demonstrate it.

That combination is not impossible to survive, but it is a poor bargain.

## What I still take from this project

Even with all of that skepticism, I do not think the time was wasted.

ForgeHLS taught me how hard it is to build infrastructure when a field lacks standardization. DiffHLS taught me that a good modeling question can still be extracted from a bad ecosystem if the data is rich enough. More importantly, the whole experience clarified something I now take seriously: **some research directions are not blocked by lack of ideas, but by bad interfaces, weak incentives, and missing scale**.

That is exactly why large-model research became so powerful. Once the interface is unified and the scale is there, progress compounds. HLS rarely feels like that. It feels like every experiment has to renegotiate the ground beneath it.

Another lesson is more practical, and I think it is worth stating explicitly for graduate students: **do not spend too much of your life trying to rescue a single piece of work**.

It is reasonable to revise a paper, tighten experiments, and give it another serious shot. It is not reasonable to let one project consume your momentum for too long just because you have already paid a high sunk cost. Research punishes attachment. Sometimes the correct move is to finish the revision, submit it cleanly, accept the outcome, and move on to the next problem.

That is not cynicism. It is resource allocation.

If a project keeps colliding with a tiny community, unstable baselines, weak demand, and unproductive review dynamics, then the expected return on additional effort drops sharply. At that point, continuing is often less about science and more about refusing to admit that the environment itself is low leverage.

For me, this was one of the clearest takeaways from ForgeHLS: building something hard is admirable, but staying trapped inside the same hard thing for too long is not.

## Papers

- [ForgeHLS: A Large-Scale, Open-Source Dataset for High-Level Synthesis](https://arxiv.org/abs/2507.03255)
- [DiffHLS: Differential Learning for High-Level Synthesis QoR Prediction with GNNs and LLM Code Embeddings](https://arxiv.org/abs/2604.09240)

## Closing note

If I had to summarize this journey in one sentence, it would be this:

I built ForgeHLS because HLS needed scale, and I built DiffHLS because after paying the price of building that scale, I needed at least one serious algorithmic answer on top of it. But after living through the entire process, I came away more impressed by the importance of infrastructure than by the future of HLS itself.
