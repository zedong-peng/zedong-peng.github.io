---
layout: post
title: "How Much of Post-Training Is an Input?"
date: 2026-10-23 12:00:00 +0800
lang: en
description: "No text gives a DPO stage back, at 1B, 8B or 32B, while one learned input vector gives back half. Even when a sentence produced the preferences, training on sampled answers does not land on that sentence; distilling it does."
categories: research
related_posts: false
---

A sentence in the prompt can change a language model's output completely. I correct my AI agents this way every day, which raises a question: is a correction in words the same kind of change as post-training, only cheaper? We measured it. For a stage that turns a model P into a model T, the share of the stage that an input c to P gives back is

$$R(c) = 1 - \frac{\mathrm{KL}(T\,\Vert\,P_c)}{\mathrm{KL}(T\,\Vert\,P)},$$

with both KL divergences taken on T's own answers to held-out prompts. R = 1 means the input reproduces the stage, 0 means it does nothing, and below 0 means it moves P away from T.

**No text gives a DPO stage back; one learned vector gives back half.** On the DPO stages of OLMo 2 at 1B and 32B and Tulu 3 at 8B, we tried hand-written instructions, 96 prompts a 27B model wrote while seeing their scores, tokens optimized by gradient, and T's own answers as examples. Learned inputs were fitted on T's answers to 3,000 other prompts.

|                                         |    1B |    8B |  32B |
| --------------------------------------- | ----: | ----: | ---: |
| Best text                               | −0.04 | −0.15 | 0.02 |
| One learned vector in the system prompt |  0.51 |     – |    – |
| Sixteen learned vectors                 |  0.64 |  0.66 | 0.55 |
| LoRA, rank 64 (what the data supports)  |  0.89 |  0.74 |    – |

At 8B, the sixteen vectors bring the reward model's score and IFEval, GSM8K and MATH accuracy to T's level; the text that does best moves the reward a third of the way. Scaling a text's effect up or down does not help, because the change it makes is close to orthogonal to the stage's.

**Even when a sentence produced the preferences, training does not land on the sentence.** Maybe what DPO learns from human or AI preferences just cannot be said. To test that, we built stages whose answer is a sentence w. For each prompt, an answer from P with w in the system prompt is preferred over an answer from P without it. DPO on these pairs has $$P_w$$, P with the sentence, as its exact optimum at β = 1, and so do fine-tuning on the preferred answers and distilling $$P_w$$ token by token. We ran all three on the same 2,800 prompts with the same adapter and steps:

<figure class="path-fig" role="img" aria-label="Two panels, one per text, with the share of each run's change that the text gives back against the run's distance from P. Distillation climbs to 0.9 and 0.8 and stops at or before the star marking P with the text. Fine-tuning on the text's answers reaches 0.5 and 0.35, then falls as it moves past the star. DPO stays at 0.24 or below.">
<svg viewBox="0 0 680 330" xmlns="http://www.w3.org/2000/svg">
<style>
.path-fig svg { width: 100%; height: auto; display: block; color: var(--global-text-color); font-family: inherit; }
.path-fig .grid { stroke: currentColor; stroke-opacity: 0.15; stroke-width: 1; }
.path-fig .tick { fill: currentColor; fill-opacity: 0.6; font-size: 12px; }
.path-fig .ttl { fill: currentColor; font-size: 13.5px; font-weight: 600; }
.path-fig .lab { fill: currentColor; font-size: 13px; }
.path-fig .dist { stroke: var(--global-theme-color); fill: var(--global-theme-color); }
.path-fig .sft { stroke: var(--global-theme-color); fill: var(--global-bg-color); stroke-dasharray: 5 3; }
.path-fig .sft-m { stroke: var(--global-theme-color); fill: var(--global-bg-color); stroke-width: 2; }
.path-fig .dpo { stroke: currentColor; stroke-opacity: 0.55; fill: currentColor; fill-opacity: 0.55; }
.path-fig .line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.path-fig .ring { stroke: var(--global-bg-color); stroke-width: 2; }
.path-fig .star { fill: currentColor; }
</style>
<line x1="56" y1="22" x2="78" y2="22" stroke="var(--global-theme-color)" stroke-width="2"/>
<text class="lab" x="84" y="26">distillation</text>
<line x1="222" y1="22" x2="244" y2="22" stroke="var(--global-theme-color)" stroke-width="2" stroke-dasharray="5 3"/>
<text class="lab" x="250" y="26">fine-tuning</text>
<line x1="379" y1="22" x2="401" y2="22" stroke="currentColor" stroke-opacity="0.55" stroke-width="2"/>
<text class="lab" x="407" y="26">DPO</text>
<path class="star" d="M472.0,15.0 l2.4,4.9 5.4,0.8 -3.9,3.8 0.9,5.4 -4.8,-2.5 -4.8,2.5 0.9,-5.4 -3.9,-3.8 5.4,-0.8z"/>
<text class="lab" x="486" y="26">P with the text (target)</text>
<text class="ttl" x="56" y="54">“Answer as briefly as possible.”</text>
<line class="grid" x1="56" y1="270.0" x2="316" y2="270.0"/>
<text class="tick" x="48" y="274.0" text-anchor="end">0</text>
<line class="grid" x1="56" y1="170.0" x2="316" y2="170.0"/>
<text class="tick" x="48" y="174.0" text-anchor="end">0.5</text>
<line class="grid" x1="56" y1="70.0" x2="316" y2="70.0"/>
<text class="tick" x="48" y="74.0" text-anchor="end">1</text>
<text class="tick" x="56.0" y="288" text-anchor="middle">0</text>
<text class="tick" x="108.0" y="288" text-anchor="middle">2</text>
<text class="tick" x="160.0" y="288" text-anchor="middle">4</text>
<text class="tick" x="212.0" y="288" text-anchor="middle">6</text>
<text class="tick" x="264.0" y="288" text-anchor="middle">8</text>
<text class="tick" x="316.0" y="288" text-anchor="middle">10</text>
<text class="tick" x="186.0" y="308" text-anchor="middle">distance from P, D (nats)</text>
<path class="star" d="M167.8,62.0 l2.4,4.9 5.4,0.8 -3.9,3.8 0.9,5.4 -4.8,-2.5 -4.8,2.5 0.9,-5.4 -3.9,-3.8 5.4,-0.8z"/>
<polyline class="dpo line" points="82.0,242.0 131.4,236.0 162.6,240.0 199.0,232.0 225.0,222.0"/>
<circle class="ring" cx="82.0" cy="242.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="82.0" cy="242.0" r="4"/>
<circle class="ring" cx="131.4" cy="236.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="131.4" cy="236.0" r="4"/>
<circle class="ring" cx="162.6" cy="240.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="162.6" cy="240.0" r="4"/>
<circle class="ring" cx="199.0" cy="232.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="199.0" cy="232.0" r="4"/>
<circle class="ring" cx="225.0" cy="222.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="225.0" cy="222.0" r="4"/>
<polyline class="sft line" points="108.0,222.0 149.6,190.0 204.2,170.0 251.0,180.0 295.2,192.0"/>
<rect class="sft-m" x="104.0" y="218.0" width="8" height="8"/>
<rect class="sft-m" x="145.6" y="186.0" width="8" height="8"/>
<rect class="sft-m" x="200.2" y="166.0" width="8" height="8"/>
<rect class="sft-m" x="247.0" y="176.0" width="8" height="8"/>
<rect class="sft-m" x="291.2" y="188.0" width="8" height="8"/>
<polyline class="dist line" points="128.8,174.0 162.6,122.0 165.2,98.0 167.8,92.0 167.8,90.0"/>
<circle class="ring" cx="128.8" cy="174.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="128.8" cy="174.0" r="4"/>
<circle class="ring" cx="162.6" cy="122.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="162.6" cy="122.0" r="4"/>
<circle class="ring" cx="165.2" cy="98.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="165.2" cy="98.0" r="4"/>
<circle class="ring" cx="167.8" cy="92.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="167.8" cy="92.0" r="4"/>
<circle class="ring" cx="167.8" cy="90.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="167.8" cy="90.0" r="4"/>
<text class="ttl" x="386" y="54">“Your answers are too thin. …” (a paragraph)</text>
<line class="grid" x1="386" y1="270.0" x2="646" y2="270.0"/>
<text class="tick" x="378" y="274.0" text-anchor="end">0</text>
<line class="grid" x1="386" y1="170.0" x2="646" y2="170.0"/>
<text class="tick" x="378" y="174.0" text-anchor="end">0.5</text>
<line class="grid" x1="386" y1="70.0" x2="646" y2="70.0"/>
<text class="tick" x="378" y="74.0" text-anchor="end">1</text>
<text class="tick" x="386.0" y="288" text-anchor="middle">0</text>
<text class="tick" x="451.0" y="288" text-anchor="middle">6</text>
<text class="tick" x="516.0" y="288" text-anchor="middle">12</text>
<text class="tick" x="581.0" y="288" text-anchor="middle">18</text>
<text class="tick" x="646.0" y="288" text-anchor="middle">24</text>
<text class="tick" x="516.0" y="308" text-anchor="middle">distance from P, D (nats)</text>
<path class="star" d="M551.8,62.0 l2.4,4.9 5.4,0.8 -3.9,3.8 0.9,5.4 -4.8,-2.5 -4.8,2.5 0.9,-5.4 -3.9,-3.8 5.4,-0.8z"/>
<polyline class="dpo line" points="402.2,260.0 446.7,232.0 501.9,228.0 507.3,226.0 519.2,226.0"/>
<circle class="ring" cx="402.2" cy="260.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="402.2" cy="260.0" r="4"/>
<circle class="ring" cx="446.7" cy="232.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="446.7" cy="232.0" r="4"/>
<circle class="ring" cx="501.9" cy="228.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="501.9" cy="228.0" r="4"/>
<circle class="ring" cx="507.3" cy="226.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="507.3" cy="226.0" r="4"/>
<circle class="ring" cx="519.2" cy="226.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dpo" cx="519.2" cy="226.0" r="4"/>
<polyline class="sft line" points="415.2,232.0 491.1,200.0 533.3,200.0 599.4,202.0 628.7,216.0"/>
<rect class="sft-m" x="411.2" y="228.0" width="8" height="8"/>
<rect class="sft-m" x="487.1" y="196.0" width="8" height="8"/>
<rect class="sft-m" x="529.3" y="196.0" width="8" height="8"/>
<rect class="sft-m" x="595.4" y="198.0" width="8" height="8"/>
<rect class="sft-m" x="624.7" y="212.0" width="8" height="8"/>
<polyline class="dist line" points="444.5,206.0 480.2,156.0 503.0,128.0 504.1,114.0 504.1,110.0"/>
<circle class="ring" cx="444.5" cy="206.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="444.5" cy="206.0" r="4"/>
<circle class="ring" cx="480.2" cy="156.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="480.2" cy="156.0" r="4"/>
<circle class="ring" cx="503.0" cy="128.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="503.0" cy="128.0" r="4"/>
<circle class="ring" cx="504.1" cy="114.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="504.1" cy="114.0" r="4"/>
<circle class="ring" cx="504.1" cy="110.0" r="6" fill="var(--global-bg-color)"/>
<circle class="dist" cx="504.1" cy="110.0" r="4"/>
<text class="tick" x="12" y="170.0" text-anchor="middle" transform="rotate(-90 12 170.0)">R of the text, best strength</text>
</svg>
<figcaption class="caption">Three runs toward the same target, P with the text (star), on the same answers. Each point is a checkpoint, placed by how far the model has moved from P and how much of that move the text gives back at its best strength.</figcaption>
</figure>

Distillation heads for the sentence. Fine-tuning gets halfway and then moves past it. DPO puts about a fifth of its change along the sentence from its first steps, while moving about as far as the others.

All three start in the same expected direction. At the start, the rejected answers in DPO add nothing on average, and distillation's gradient is fine-tuning's averaged over every possible next token instead of the one sampled. What differs is how much of the target each example carries: whole next-token distributions, one sampled answer, or one sampled answer minus another that is pure noise in any single pair. The less of the target an example carries, the further training wanders from it.

**A correction in words and a training step have the same form but carry different amounts.** Adding w to the prompt gives exactly the optimum of KL-regularized RL with reward $$\log P_w - \log P$$ ([Korbak et al. 2022](https://arxiv.org/abs/2205.11275)). But the sentence delivers the whole shift at once, while preferences and rewards deliver samples of it, and training on samples also moves the model along whatever is particular to them. A real DPO stage learns from preferences between sampled answers, so it is not P under any sentence, though it is close to P under one learned vector. To put a sentence into the weights, distill it; DPO on pairs built from it, as in [Open Character Training](https://arxiv.org/abs/2511.01689), mostly goes elsewhere.

These are small models: most runs are at 1B, the sentence stages use two texts, one learning rate and one answer per prompt, and "no text" means none we found.
