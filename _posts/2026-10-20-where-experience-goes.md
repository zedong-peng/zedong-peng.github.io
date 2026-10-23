---
layout: post
title: "Where Experience Goes"
date: 2026-10-20 12:00:00 +0800
lang: en
description: "Long context, agent memory, parametric memory, test-time training and self-improving agents are one problem: where an experience is kept, and which rule writes it there. The rule is the hard part, and it should be learned."
categories: life
related_posts: false
---

Long context, agent memory, parametric memory, test-time training, continual learning and self-improving agents work on one problem under different names: learning from experience after training has ended. Each answers two questions: where an experience is kept, and what rule decides what gets written there.

<figure class="experience-fig" role="img" aria-label="A two-by-two grid of stores. Top row, text: Context, append every token; Notes, a writer decides. Bottom row, parameters: Fast weights, update per token; Weights, gradient step. Long context covers the left column, test-time training the bottom row, agent memory the Notes cell, parametric memory the Weights cell. Experience enters from the left; what the model does loops back into its experience, labelled recursive self-improvement.">
<svg viewBox="0 0 680 405" xmlns="http://www.w3.org/2000/svg">
<style>
.experience-fig svg { width: 100%; height: auto; display: block; color: var(--global-text-color); font-family: inherit; }
.experience-fig .cell { fill: var(--global-bg-color); stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.experience-fig .store { fill: currentColor; font-size: 17px; font-weight: 600; text-anchor: middle; }
.experience-fig .rule { fill: currentColor; fill-opacity: 0.7; font-size: 13.5px; text-anchor: middle; }
.experience-fig .axis { fill: currentColor; fill-opacity: 0.55; font-size: 13px; }
.experience-fig .src { fill: currentColor; font-size: 14px; font-weight: 600; }
.experience-fig .field { fill: var(--global-theme-color); font-size: 15px; font-weight: 600; }
.experience-fig .brace { fill: none; stroke: var(--global-theme-color); stroke-width: 2; }
.experience-fig .flow { fill: none; stroke: currentColor; stroke-opacity: 0.55; stroke-width: 2; }
.experience-fig .head { fill: currentColor; fill-opacity: 0.55; }
.experience-fig .loop { fill: none; stroke: var(--global-theme-color); stroke-width: 2.5; }
.experience-fig .loop-head { fill: var(--global-theme-color); }
</style>
<path class="brace" d="M175 44 V36 H345 V44"/>
<text class="field" x="260" y="26" text-anchor="middle">long context</text>
<text class="axis" x="260" y="68" text-anchor="middle">every token</text>
<text class="axis" x="450" y="68" text-anchor="middle">chosen by a rule</text>
<text class="axis" x="163" y="135" text-anchor="end">text</text>
<text class="axis" x="163" y="255" text-anchor="end">parameters</text>
<rect class="cell" x="175" y="80" width="170" height="100" rx="8"/>
<text class="store" x="260" y="126">Context</text>
<text class="rule" x="260" y="150">append</text>
<rect class="cell" x="365" y="80" width="170" height="100" rx="8"/>
<text class="store" x="450" y="126">Notes</text>
<text class="rule" x="450" y="150">a writer decides</text>
<rect class="cell" x="175" y="200" width="170" height="100" rx="8"/>
<text class="store" x="260" y="246">Fast weights</text>
<text class="rule" x="260" y="270">update per token</text>
<rect class="cell" x="365" y="200" width="170" height="100" rx="8"/>
<text class="store" x="450" y="246">Weights</text>
<text class="rule" x="450" y="270">gradient step</text>
<path class="brace" d="M539 80 H547 V180 H539"/>
<text class="field" x="557" y="126">agent</text>
<text class="field" x="557" y="145">memory</text>
<path class="brace" d="M539 200 H547 V300 H539"/>
<text class="field" x="557" y="246">parametric</text>
<text class="field" x="557" y="265">memory</text>
<path class="brace" d="M175 308 V316 H535 V308"/>
<text class="field" x="355" y="338" text-anchor="middle">test-time training</text>
<text class="src" x="14" y="180">experience</text>
<path class="flow" d="M14 190 H163"/>
<polygon class="head" points="171,190 161,184 161,196"/>
<path class="loop" d="M535 190 H648 Q660 190 660 202 V358 Q660 370 648 370 H42 Q30 370 30 358 V206"/>
<polygon class="loop-head" points="30,196 24,207 36,207"/>
<text class="rule" x="600" y="182">acts</text>
<text class="field" x="345" y="394" text-anchor="middle">recursive self-improvement</text>
</svg>
<figcaption class="caption">Top row keeps text, bottom row changes parameters; left column writes every token, right column only what a rule picks. Recursive self-improvement is the loop.</figcaption>
</figure>

None of the four places is short of room. What goes wrong is the write rule. Four cases from my own work:

| Store                                                             | Rule, designed in advance                    | What happened                                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Notes ([MemoryTax](https://zedongpeng.com/memorytax/))            | Mem0's extraction                            | beats the whole conversation only with GPT-4o-mini; a stronger reader cannot recover what a weak writer dropped                       |
| Weights ([LoRA](/blog/2026/failure-of-parametric-memory/))        | next-token loss on the conversation          | question-answering F1 6.7 → 7.2                                                                                                       |
| Weights (RL on Brainfuck)                                         | reward when the predicted output matches     | after one rule of the machine changed, 32 of 11,712 samples rewarded; trained on the machine's trace instead, it adapts after 16 runs |
| Weights (small net, [ARC-AGI-3](https://arcprize.org/arc-agi/3/)) | predict which actions reach an unseen screen | passes level 1 in 77 of 250 runs (random clicks 47), learns nothing that carries to level 2                                           |

Each time, what was kept was decided before the experience arrived. The part that matters is the part the rule did not anticipate.

**The rule should be learned.** [The bitter lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) applies to what a model keeps as much as to what it computes. An agent has a signal for it at every step, with no teacher: the gap between what it expected and what happened. The Brainfuck model adapted once it saw where its prediction went wrong. On ARC, when Qwen3.8-27B wrote down the rule from the moment level 1 was solved and played level 2 with it in the prompt, it passed 5 of 10 runs; without it, none. Where that error signal should land is what I work on.

**Notes are a buffer; weights are the destination.** A note must be read again every time and is only as good as its reader: Qwen3-8B, given the same rule, passes none of 10. Weights need no reader.

A teenager learns to drive in a dozen hours. They see what the car does, an instructor's words change their next move, and a week later it is in their hands. Nobody calls those three different fields.
