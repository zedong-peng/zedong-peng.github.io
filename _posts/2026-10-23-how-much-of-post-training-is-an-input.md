---
layout: post
title: "How Much of Post-Training Is an Input?"
date: 2026-10-23 12:00:00 +0800
lang: en
description: "For a post-training stage that turns a model P into T, how much of the change can a fixed input to P give back? No text does, at 1B, 8B or 32B. One learned vector gives back half. And training on answers a sentence produced does not land on that sentence, while distilling the sentence does."
categories: research
related_posts: false
---

A sentence in the prompt can change a language model's output completely. I run a team of AI agents and correct them this way every day, a line at a time. That raises a question about post-training: is a correction in words the same kind of change as RLHF, only cheaper? If a stage of post-training could be written as an input to the model before it, that input would be what the stage learned.

This post measures it. For a post-training stage that turns a model P into a model T, we ask how much of the change a fixed input to P gives back, for inputs ranging from plain text to learned vectors. We ran this on the DPO stage of OLMo 2 at 1B and 32B and of Tulu 3 at 8B, and on OLMo 2's reinforcement-learning stages. Three findings:

- **No text gives a DPO stage back.** Hand-written instructions, prompts a 27B model wrote while seeing their scores, optimized tokens and T's own answers used as examples all leave P as far from T as before, or further, at all three sizes.
- **One learned vector gives back half.** A single vector placed where the system prompt would go recovers about half of the stage. At 8B, sixteen of them bring reward and benchmark scores to T's level.
- **Training on sampled answers does not land on a sentence, even when the sentence produced them.** With P plus a sentence as the exact optimum, DPO puts about a fifth of its change along the sentence and fine-tuning on the sentence's answers at most half. Distilling the sentence token by token recovers most of it.

So a DPO stage is mostly an input, but not one made of words. The reason is not that the preferences cannot be said. Learning from sampled answers moves a model where words do not reach, even when words produced the answers.

## The measure

Write $$P(y\mid x)$$ for the probability the earlier model gives response y to prompt x, and $$T(y\mid x)$$ for the trained model. The size of a stage is

$$D = \mathrm{KL}(T\,\|\,P) = \mathbb{E}_{x,\ y\sim T}\big[\log T(y|x) - \log P(y|x)\big],$$

in nats per response, estimated on one sample of T for each of 300 held-out prompts. An input c gives a new model $$P_c(y\mid x) = P(y\mid x, c)$$. The fraction of the stage that c gives back is

$$R(c) = 1 - \frac{\mathrm{KL}(T\,\|\,P_c)}{D}.$$

R = 1 means the input turns P into T. R = 0 means P with the input is no closer to T than P alone, and a negative R means the input moved P away. Measured on T's own samples, R asks whether P with the input would write what T writes.

Text is scored as written. Learned inputs are fitted on 3,000 other prompts from the stage's training set, one sample of T each, by maximizing $$\log P_c(y\mid x)$$, which is the same as minimizing $$\mathrm{KL}(T\Vert P_c)$$ on those prompts. A rank-64 LoRA trained on the same samples shows how much this data supports at all. From weakest to strongest:

| Input                       | What is learned                                                  | Parameters (1B) |
| --------------------------- | ---------------------------------------------------------------- | --------------: |
| Text                        | nothing: a system prompt, a note in the user turn, or examples   |               0 |
| Optimized tokens            | 16 or 64 vocabulary tokens in the system prompt                  |     16–64 tokens |
| Soft prompt                 | 1 to 64 free vectors in the system prompt                        |    2k to 131k   |
| Per-layer bias              | one vector added to the residual stream after each of 16 layers  |             33k |
| LoRA                        | a weight update of rank 1 or 64                                  |    0.75M or 48M |

The main stage is OLMo-2-0425-1B SFT→DPO. We also measured its base→SFT stage and its two stages of RL with verifiable rewards, Tulu-3-8B SFT→DPO, and OLMo-2-32B SFT→DPO, run in 4-bit with 1,000 training samples. Held-out prompts come from each stage's own prompt pool, with AlpacaEval, IFEval, GSM8K and MATH prompts to check other distributions.

## Text gives nothing back

On the 1B DPO stage (D = 71 nats), every text we tried scores at or below zero:

| Text                                                                   |     R |
| ---------------------------------------------------------------------- | ----: |
| "You are a helpful assistant."                                         | −0.10 |
| A sentence we wrote after reading P's and T's answers                  | −0.14 |
| A paragraph we wrote the same way                                      | −0.16 |
| Best of 96 prompts written by a 27B model over six rounds of feedback  | −0.04 |
| 64 tokens optimized by gradient                                        | −0.01 |
| 8 of T's own answers as examples                                       | −0.43 |

Each round, the 27B writer saw six pairs of P's and T's answers and the scores of every prompt tried so far. Its best prompts describe the DPO change correctly (give complete answers with specifics, no talk about the answer) and still score below zero on held-out prompts. T's answers work no better as examples than P's own, and more examples make it worse. The optimized tokens come out as noise around "helpful", "assistant" and "you". On the base→SFT stage, a [URIAL](https://arxiv.org/abs/2312.01552)-style preamble with three examples gives back 0.00, where sixteen vectors give back 0.16 of a ceiling of 0.22 (3,000 samples are few for that stage).

If a text pushed P the right way by the wrong amount, scaling its effect would fix it. Let $$P_w$$ be P with the text and define

$$P_g \propto P^{\,1-g}\, P_w^{\,g},$$

so g = 0 is P, g = 1 is the text and g = 2 doubles its effect, as in classifier-free guidance. For every text, R(g) is a parabola that peaks near g = 0, at 0.05 or less. To second order, $$\mathrm{KL}(T\Vert P_g)$$ is half the variance under P of $$r - g\Delta$$, where $$r = \log T - \log P$$ is the stage's log-ratio and $$\Delta = \log P_w - \log P$$ is the text's. At the best strength, R is the squared correlation of $$r$$ and $$\Delta$$. The text's effect is close to orthogonal to the stage's.

The same holds inside the model. At the last layer, the mean shift that "You are a helpful assistant." causes in the residual stream points against DPO's mean shift (cosine −0.72). Our paragraph gives −0.42, and T's answers as examples −0.32. Adding the text's shift as a bias instead of saying it removes the damage, but even with a learned scale per layer it gives back at most 0.10.

## A few vectors give back most of it

On the same stage:

| Input                 | Parameters |     R |
| --------------------- | ---------: | ----: |
| Best text             |          0 | −0.04 |
| 1 soft vector         |         2k |  0.51 |
| 16 soft vectors       |        33k |  0.64 |
| 64 soft vectors       |       131k |  0.69 |
| Per-layer bias        |        33k |  0.77 |
| LoRA, rank 1          |      0.75M |  0.64 |
| LoRA, rank 64         |        48M |  0.89 |

The four test sets give the same order. One vector where the system prompt goes recovers half the stage. The learned vectors are not odd: their norms are those of typical token embeddings, but they sit on no token, and rounding them to the nearest tokens leaves nothing. With the same 33k parameters, one vector per layer does better than sixteen at the input.

The picture holds at three sizes, though the larger models follow instructions much better:

|                 |    1B |   8B (Tulu 3) |  32B |
| --------------- | ----: | ------------: | ---: |
| D (nats)        |    71 |            28 |   73 |
| Best text       | −0.04 |         −0.15 | 0.02 |
| 16 soft vectors |  0.64 |          0.66 | 0.55 |
| Per-layer bias  |  0.77 |          0.67 | 0.70 |
| LoRA, rank 64   |  0.89 |          0.74 |    – |

The 32B model was fitted on a third of the samples, and its LoRA did not fit on one 24 GB card.

Scores follow R. On Tulu 3 at 8B, sixteen vectors or a per-layer bias move every score to T's, while the text that moves scores most, a paragraph the 27B wrote from P's and T's answers, moves reward a third of the way and lowers IFEval:

|                                | P    | P + paragraph | P + 16 vectors | P + per-layer bias | T    |
| ------------------------------ | ---- | ------------- | -------------- | ------------------ | ---- |
| Reward, AlpacaEval prompts     | 5.2  | 9.8           | 20.5           | 20.5               | 21.2 |
| Length, AlpacaEval (tokens)    | 237  | 419           | 483            | 487                | 487  |
| IFEval, strict                 | 60%  | 50%           | 68%            | 68%                | 66%  |
| GSM8K                          | 63%  | 74%           | 87%            | 86%                | 87%  |
| MATH                           | 23%  | 30%           | 38%            | 40%                | 38%  |

Reward is from Skywork-Reward-V2-Llama-3.1-8B. At 1B every text lowers the reward, and one vector takes it from −6.6 to −1.1, with T at 0.1.

The change is spread through the whole response. Splitting D by token position on the 1B stage, the first 20 tokens carry a twentieth of it and half comes after token 300. DPO does not swap in a new opening; T writes differently all the way through a long answer. Text hurts at every position, most at the start, where it changes the opening the wrong way. The vectors give back a similar share at every position.

## Training toward a sentence

All of this could mean that what DPO learns cannot be said. To check, we built a DPO stage whose answer is a sentence. For each training prompt we sample one answer from P with a sentence w as the system prompt and one from P without it, and train DPO to prefer the first. DPO's optimum is

$$\pi^* \propto P\,\Big(\frac{P_w}{P}\Big)^{1/\beta},$$

which at β = 1 is $$P_w$$ itself. A DPO run that reached its optimum would be given back by the sentence, R(w) = 1. We used two texts: "Answer as briefly as possible." and the paragraph we wrote for the real DPO stage. With the text in the prompt, P moves 4.3 and 15.3 nats away from itself, measured as $$\mathrm{KL}(P_w\Vert P)$$. Each stage has about 2,800 pairs and trains a rank-64 LoRA for two epochs.

It does not get there. At the end the sentence gives back 0.11 and the paragraph −0.12, and the ladder has the same shape as on the real stage: sixteen vectors about 0.5, the per-layer bias about 0.7. We compared the run with two others that have the same optimum, trained on the same preferred answers with the same adapter, learning rate and number of steps, following each checkpoint by checkpoint and taking the best strength g at each:

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
<figcaption class="caption">Three runs toward the same target, P with the text (star). Each point is a checkpoint at steps 25, 50, 100, 200 and the end, placed by how far the model has moved from P and how much of that move the text gives back at its best strength. Distillation heads for the star; fine-tuning on the text's answers and DPO on pairs built from them travel comparable distances, mostly in other directions.</figcaption>
</figure>

Along DPO, the sentence at its best strength gives back at most 0.24 at every checkpoint, while D grows from 1 to 12 nats. The best strength grows with D, from 0.25 to between 0.5 and 0.75, so the part of the change that runs along the sentence grows in step with the whole. The angle between them is set in the first steps. DPO does not first follow the sentence and then drift away.

Context distillation trains P without the text to match P with it at every token of the preferred answers:

$$L = \sum_t \mathrm{KL}\big(P_w(\cdot\,|\,x, y_{<t})\ \|\ P_\theta(\cdot\,|\,x, y_{<t})\big),\qquad y \sim P_w.$$

Its optimum is also $$P_w$$, and it goes there. After 25 steps the sentence at its best strength gives back 0.48. At the end the sentence gives back 0.90 and the paragraph 0.75. The sentence run ends at $$P_w$$'s own distance from P, 4.3 nats; the paragraph run covers 10.9 of 15.3.

Fine-tuning on the preferred answers, with loss $$-\log P_\theta(y\mid x)$$, lands in between. The sentence gives back up to 0.50 and the paragraph up to 0.35. Then the share falls as the model moves past $$P_w$$'s distance, to 9.2 nats against 4.3 and 22.4 against 15.3: it fits these particular answers rather than the distribution they came from.

All three runs start in the same expected direction. With θ at P the DPO margin is zero, and because $$\mathbb{E}_{y\sim P}[\nabla \log P(y\mid x)] = 0$$, the rejected answers add nothing on average. What remains is the fine-tuning gradient on the preferred answers. Distillation's gradient is that same gradient averaged over every possible next token instead of the one that was sampled. What separates the runs is how much of $$P_w$$ each example carries: whole next-token distributions in distillation, one sampled answer in fine-tuning, and in DPO one sampled answer minus another whose contribution is zero on average and pure noise in any single pair. The less of the target an example carries, the further training wanders from it.

## Along RL

The RL stage after DPO (OLMo-2-1B, rewards checked on GSM8K, MATH and instruction-following prompts), taking checkpoints as T:

| RL step | D (nats) | 16 soft vectors | LoRA, rank 64 |
| ------: | -------: | --------------: | ------------: |
|     600 |      9.5 |            0.62 |          0.67 |
|    1400 |     11.3 |            0.46 |          0.67 |
|    2600 |     13.9 |            0.38 |          0.66 |

At step 600 an input gives back almost all that the data supports. After that D keeps growing, the LoRA ceiling stays, and what the input gives back falls. RL first moves where an input can reach, then writes in what no input can. Text is below zero at every checkpoint. On maths prompts, a per-layer bias comes close to the LoRA ceiling on both RL stages, as in [bias-only RL](https://arxiv.org/abs/2505.18706); the soft prompt does not.

## What this says about correcting in words

In form, a correction in words is a step of KL-regularized RL. Adding w to the prompt gives

$$P_w = P \cdot \exp(r_w), \qquad r_w = \log P_w - \log P,$$

which is the optimum of KL-regularized RL with reward $$r_w$$ and β = 1 ([Korbak et al. 2022](https://arxiv.org/abs/2205.11275)). Context distillation, on-policy distillation and KL-regularized RL all pull a model toward a target of this kind and differ only in the target.

The measurements show what the form leaves out: what each example carries. A sentence in the prompt carries a whole shift of the distribution at once. A preference pair, or a rewarded answer, carries a sample of it, and training on samples moves the model along the target and along whatever is particular to the samples. In our runs the second part was most of the change, even when a sentence produced the samples. A real DPO stage learns from preferences between sampled answers, so it is no surprise that it is not P under any text we could find. Its change is still reachable by an input, since one vector gives back half of it, but not by an input made of words.

Two practical consequences. To make the weights do what a sentence does, distill the sentence token by token. Fine-tuning on its outputs gets part of the way, and DPO on pairs built from it, as in [Open Character Training](https://arxiv.org/abs/2511.01689), puts most of its change elsewhere. And a DPO stage can be approximated far more closely with a learned vector than with any prompt.

## Limits

- Most runs are at 1B. The 8B and 32B runs cover only the DPO stage.
- "No text" means none of the texts we tried, including 96 written by a 27B model with feedback and tokens optimized by gradient. It is not a proof that no text exists.
- R uses one sample of T per prompt and KL in one direction. On Tulu 3 we checked the other direction once, sampling P with text and scoring under T: text moves scores part of the way and the distribution no closer.
- The runs built from a sentence use two texts, 2,800 prompts with one answer each, one adapter and one learning rate. More samples per prompt would carry more of the target and should narrow the gap between fine-tuning and distillation. DPO at β = 1 on pairs it can tell apart keeps widening its margins ([Azar et al. 2023](https://arxiv.org/abs/2310.12036)), so longer training drifts further; a lighter run (lr 1e-5, one epoch) barely moved from P.

## Methods

Models: OLMo-2-0425-1B base, SFT, DPO, RLVR checkpoints and Instruct; Llama-3.1-Tulu-3-8B SFT and DPO; OLMo-2-0325-32B SFT and DPO (NF4). T is sampled at temperature 1 with up to 1,024 new tokens. Soft prompts start from the embedding of "You are a helpful assistant." and train with lr 3e-2; the per-layer bias with lr 1e-3; LoRA with lr 2e-4 (5e-4 for rank 1); all for two epochs with AdamW and a cosine schedule. 95% intervals from bootstrapping over prompts are about ±0.02 for R on the held-out pool. The DPO, fine-tuning and distillation runs built from a sentence share LoRA rank 64, lr 5e-5, batch 16, two epochs (340 to 355 steps) and checkpoints at steps 25, 50, 100 and 200; the best strength is taken over g = 0.25, 0.5, 0.75, 1 and 1.5.

Related work closest to this: [URIAL](https://arxiv.org/abs/2312.01552) and [Is In-Context Learning Sufficient](https://arxiv.org/abs/2405.19874) compare prompts with alignment by scores, not distributions; the [persona selection model](https://alignment.anthropic.com/2026/psm) reads post-training as choosing a character; [Askell et al. 2021](https://arxiv.org/abs/2112.00861) and [Snell et al. 2022](https://arxiv.org/abs/2209.15189) distill a prompt into weights; [on-policy distillation](https://thinkingmachines.ai/blog/on-policy-distillation/) and [BOND](https://arxiv.org/abs/2407.14622) put distillation and RL in one objective.
