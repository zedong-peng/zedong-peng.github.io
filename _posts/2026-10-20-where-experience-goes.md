---
layout: post
title: "Where Experience Goes"
date: 2026-10-20 12:00:00 +0800
lang: en
description: "Long context, agent memory, parametric memory, test-time training, continual learning and self-improving agents are one problem under many names: learning from experience after training has ended. Each picks a place to keep an experience and a rule for writing it there. The rule is the hard part, and it should be learned."
categories: life
related_posts: false
---

A language model's training ends on a fixed day, and its working life starts then. From that day on it reads documents longer than anything it was trained on, talks with the same person for months, works with tools that change under it and plays games it has never seen. Whether it gets better at any of this comes down to one thing: whether what just happened changes what it does next.

Many research areas work on this, each under its own name. Long-context models keep more of what happened. Agent memory writes notes and looks them up later. Parametric memory, model editing and continual learning put new knowledge into the weights without breaking the old. Test-time training updates the model on the input in front of it. Self-improving agents rewrite their own prompts, tools and code, and recursive self-improvement asks what happens when that loop feeds itself. They have separate benchmarks and mostly separate people. I think they are one problem, the oldest one in reinforcement learning: learning from experience. What is new is that the experience now arrives after training has ended, in what [Silver and Sutton](http://incompleteideas.net/papers/TheEraOfExperience.pdf) call the era of experience.

Each of these areas answers the same two questions: where an experience is kept, and what rule decides what gets written there.

## Where an experience can go

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
<figcaption class="caption">The top row keeps text, the bottom row changes parameters. The left column writes every token; the right column writes only what a rule picks. Each field covers part of the grid. Recursive self-improvement is the loop: what is kept changes what the model does, and so what it meets next.</figcaption>
</figure>

**Context.** Keep every token and read all of them at every step. This is what long-context work scales. Nothing is lost, but nothing is learned either: the model has to work out the lesson of page 3 again every time it reads page 3, and the cost grows with everything kept.

**Fast weights.** Keep a fixed-size state and write every token into it with a small learning rule. It sounds like a different field, but it is how efficient long-context models already work. A linear-attention layer is a matrix that each token updates ([Schlag et al., 2021](https://arxiv.org/abs/2102.11174)); test-time-training layers make the update an explicit gradient step on a self-supervised loss ([Sun et al., 2024](https://arxiv.org/abs/2407.04620)); Titans call the state a memory learned at test time ([Behrouz et al., 2024](https://arxiv.org/abs/2501.00663)). The [Qwen3.8-27B I run on one GPU](/blog/2026/qwen38-4090-decode/) keeps 48 of its 64 layers this way. Long context and test-time training meet here.

**Notes.** Write down what seems worth keeping and read it back when it seems relevant. This is agent memory: ChatGPT's memory, a coding agent's MEMORY.md, [MemGPT](https://arxiv.org/abs/2310.08560), [Mem0](https://arxiv.org/abs/2504.19413). Notes can hold procedures as well as facts: [Voyager](https://arxiv.org/abs/2305.16291) keeps its skills as code, and an agent that edits its own prompt is writing notes to its future self. The writer is a model or a hand-built pipeline, and the format is text.

**Weights.** Change the model itself. This is parametric memory, model editing ([Meng et al., 2022](https://arxiv.org/abs/2202.05262)) and test-time training in its original sense ([Sun et al., 2020](https://arxiv.org/abs/1909.13231)). Once written, the experience costs nothing to read, and it can change behaviour in situations that look nothing like the one it came from. The price is the problem continual learning has worked on for decades: writing the new without erasing the old ([Kirkpatrick et al., 2017](https://arxiv.org/abs/1612.00796)).

Recursive self-improvement is not another place. It is what happens when the loop closes: the model that gets updated is the one that acts, so every update changes the next experience it collects. If experience reliably lands where it helps, the loop compounds. If not, it goes in circles.

## The hard part is the write rule

None of the four places is short of room. A context window holds a million tokens, a vector store holds anything, and a LoRA adapter, a small set of extra weights trained on top of the model, has room for far more than one conversation. What keeps going wrong is the rule that decides which part of an experience is kept, and in what form. Four cases from my own work:

**A designed writer drops what a stronger reader needed.** In [MemoryTax](https://zedongpeng.com/memorytax/) I compared agent memory systems with simply handing the model the whole conversation. Mem0's notes beat the whole conversation only with the weakest model, GPT-4o-mini. And a store written by a weak model stays weak whoever reads it: a stronger reader does not recover what the writer left out.

**An objective that does not know the use writes the wrong thing.** My [first try at parametric memory](/blog/2026/failure-of-parametric-memory/) fine-tuned a LoRA adapter on a long conversation with the ordinary next-token loss, then asked questions about it. The answer score (word-overlap F1, out of 100) went from 6.7 to 7.2. The weights moved toward predicting the conversation's text, not toward answering questions about it.

**A reward that does not fire writes nothing.** A small model learned to predict what programs in Brainfuck, a tiny programming language, print. Then I changed one rule of the machine and let the model adapt with reinforcement learning, rewarded when its predicted output matched the machine's. On the runs the change touched, it drew 11,712 samples over three rounds and 32 were rewarded, each one by an arithmetic slip under the old rule. A model explores with what it believes, so the reward stays silent exactly where the new information is. Trained on the machine's step-by-step trace instead, the same model started to adapt after 16 runs.

**Pixels do not carry; a rule does.** On [ARC-AGI-3](https://arcprize.org/arc-agi/3/), a small network trained during play to predict which actions lead to a screen it has not seen passes the first level in 77 of 250 runs over 25 games, against 47 for random clicks on objects. What it learns is which cells of this layout to click, and level 2 has a new layout: keeping its weights or resetting them makes no difference to whether it passes. When Qwen3.8-27B reads that winning try, writes down the rule, and plays level 2 of the game ft09 with the rule in its prompt, it passes in 5 of 10 runs; without level 1 it passes none. The rule is only as good as what its writer saw: if the explanation is shown the moves but not the screen at the moment level 1 was solved, it passes in 1. This is one game; on the five others I tried, no version passed level 2.

These are four versions of one mistake. What is kept was decided before the experience arrived: a schema for notes, a loss for weights, a reward for RL, a pixel target for a small network. The part of an experience that matters is the part the rule did not anticipate.

## The rule should be learned

Every rule above was designed by a person: append everything, a prompt that says what to extract, a next-token loss, a reward function. [The bitter lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) was about what a model computes: methods that learn and search beat methods built on human knowledge once there is enough compute. It applies just as well to what a model keeps. Deciding by hand what is worth remembering is the same bet on human knowledge, and I expect it to lose the same way.

A learned rule needs a signal, and an agent has one at every step without a teacher: the gap between what it expected and what happened. All four cases point at it. The ARC rule carried to level 2 only when its writer saw the screen at the moment level 1 was solved: the outcome, not the moves, said what had worked. The Brainfuck reward was silent, but the machine's trace showed step by step where the prediction went wrong, and that was enough to adapt on. Surprise marks the part of an experience the model did not already contain, which is the part worth keeping. Where that error signal should land is the question I work on.

## Notes are a buffer; weights are the destination

Text is a good first place for an experience. It is cheap to write, a person can check it, and a model can say why it wrote it. But a note has to be read and used again every time, and it is only as good as its reader. Qwen3-8B, handed the rule that let Qwen3.8-27B pass level 2 of ft09, passes none of 10 runs: it toggles cells in one round and toggles the same cells back in the next. Weights need no reader.

The brain is usually described as using both: a fast store for episodes, slow learning in the cortex, and replay during sleep that moves one into the other ([McClelland, McNaughton and O'Reilly, 1995](https://doi.org/10.1037/0033-295X.102.3.419)). The machine version has its pieces: notes as the fast store, and training a model on its own context so that what the context taught moves into the weights ([Snell et al., 2022](https://arxiv.org/abs/2209.15189)). In a toy agent environment I tried the whole shape. A surprise from a tool becomes a written note; the note and the raw experience serve as the model's world model; a sleep rehearses them into a small adapter. That loop kept up when a rule changed and when the change was taken back, without losing the other rule. In an environment that small it was no more accurate than reading the notes directly; sleep only made it faster. The next experiment asks for more: take the ARC rule that works in the prompt, train it into the weights, and see whether the model passes level 2 without being told.

A common view holds that the realistic short-term route to self-improvement is the harness: better prompts, memory and tools, with the weights left alone. It is where results show up first, and the ARC result above is a harness result. I don't choose a place by which one pays off soonest. A harness that rewrites itself is still worth building, as the cheapest place to test whether a system learns from its own stream at all. That test needs care: a score reported after the same tasks were tried many times mixes search within a task with learning across tasks. The clean version scores only the first attempt on each new task, on tasks the edits never saw, against the same agent whose harness never changes. And whether the editor needs only right or wrong, or has to see the whole run, is the error-signal question again, asked in text.

## Three bets

- The line between training and inference goes away. A deployed model is updated by its own experience as a matter of course, the way a person is.
- The write rule is learned from the model's own errors, not designed.
- Text memory stays, as the place where an experience waits until it is understood, not as the place where it ends.

A teenager learns to drive in a dozen or so hours. Every second they see what the car does; an instructor's words change their next move; a week later it is in their hands. Nobody calls those three different fields.
