---
layout: post
title: "From AI Coding Assistant to Research Copilot"
date: 2026-04-14 23:35:00 +0800
description: "How my workflow evolved from trying mainstream AI IDEs in 2024 to treating AI as part of the full research loop in 2026."
tags: AI research-workflow Claude-Code Codex Cursor Copilot
categories: research
related_posts: false
toc:
  beginning: true
---

By 2026, I no longer think of AI as a tool that merely helps me write code faster. In my daily work, it has become part of the research loop itself. I use it to discuss ideas, scout baselines, iterate on experiments, prepare weekly reports, revise papers, and sometimes even help me reason through feedback from meetings.

That coupling is already deep enough that I find it hard to describe my current workflow as "research first, AI second." In many weeks, the research process itself is organized around repeated AI-assisted loops.

That was not how it started.

## When I tried the three mainstream AI IDEs in 2024

At the end of 2024, I deliberately tried three mainstream AI IDE setups in parallel: **Trae**, **Cursor Pro**, and **GitHub Copilot Pro**. My editor at the time was still **VS Code**, so the comparison felt practical rather than theoretical.

I tried Trae partly because one of my senior graduate-school friends, Mingzhe, was working on Trae-related development at ByteDance. That made me curious enough to pay for it and see what it could actually do in serious research engineering work.

The results were clear fairly quickly.

**Trae** never felt like it had access to truly top-tier models, and the free plan was slow enough that it broke the flow. For lightweight help that might be acceptable. For real research work, where I often need sustained iteration over long contexts and fragile codebases, it was not enough.

**Copilot Pro** had access to strong GPT-family models at the time, especially through the GitHub student benefit, but the product experience still felt clumsy. It could answer and complete, but it did not feel like a capable partner. I often had the sense that the underlying model was stronger than the surrounding interface.

**Cursor** was the one that first felt genuinely useful. It had momentum for a reason. During the painful period when I was building ForgeHLS, Cursor gave me substantial help in getting infrastructure unstuck, generating scaffolding, and reducing the friction of a codebase that kept resisting straightforward automation. I wrote more about why that phase was painful in [my ForgeHLS/DiffHLS post](/blog/2026/forgehls-and-diffhls/).

At that point, though, my expectation of AI was still fairly primitive: give it a coding direction, let it implement something, and then I would run the code myself and continue from there.

## Codex was the first tool that matched that expectation well

After OpenAI released Codex, I had very little reason not to use it. I was already a GPT subscriber, and Codex felt like the most natural next step for the workflow I already wanted.

Codex CLI fit my needs surprisingly well:

- I could explain a coding idea in plain language.
- It could turn that idea into an implementation draft.
- I could run the code, inspect the output, and decide the next step.

That sounds basic now, but it solved a real problem. It gave me a direct path from thought to implementation without requiring me to micromanage every line.

Codex also had an economic advantage that mattered. I never felt quota anxiety using it. A tool that is slightly less magical but always available can be more useful than a stronger tool that constantly forces you to think about burn rate.

## Claude Code changed the scale of what I delegate

The real shift happened when I started using **Claude Code** seriously. That was the first time I felt that AI was no longer just helping me code. It was beginning to operate as a research copilot.

Its single biggest weakness is cost. If Claude Code were much cheaper through official access, my tool decisions would be simpler. But capability-wise, it changed my workflow more than any previous coding assistant I had used.

The reason is not that it writes prettier code. The reason is that it can sustain a longer chain of work without collapsing.

I can now give it a research idea and ask it to investigate the surrounding space: possible benchmarks, nearby SOTA systems, missing comparisons, plausible implementation paths, and concrete follow-up experiments.

That pattern has worked especially well in [`auto-research-single`](https://github.com/zedong-peng/auto-research-single), a small repo I use as a literature-research agent template. It has also been extremely effective for iterative experiment work in [`benchmark-grinder`](https://github.com/zedong-peng/benchmark-grinder), where repeated experiment modification, execution support, result inspection, and next-step refinement matter more than one-shot code generation.

What makes this powerful is not a single command. It is the loop:

1. propose an idea,
2. let the agent research and scope it,
3. have it implement or revise the experiment,
4. inspect results,
5. ask for analysis,
6. convert that into deliverables.

Once that loop becomes reliable, AI stops being an autocomplete layer and starts becoming part of the operating system for research.

## My workflow 2026 now: AI across the full research pipeline

My current workflow is not centered on one tool. It is centered on task shape.

For coding-heavy but straightforward implementation work, **Codex** is still excellent. It is cheap, direct, and dependable. I often use it when I want fast execution without worrying about exhausting a premium quota.

For longer-horizon work, **Claude Code** is usually my default. That is especially true when the task is not just "write this function," but "help me move the project forward."

In practice, that means I use AI in several recurring stages.

### 1. Idea formation and research scouting

When I have a rough research idea, I often start by talking to AI before I do a full manual search. I use it to pressure-test the idea, identify adjacent work, surface benchmark candidates, and expose missing assumptions.

This does not replace reading papers. It changes the order of operations. Instead of beginning from a blank page, I begin from a partially structured search space.

I have also started to formalize that process into reusable agent skills. One example is my [`autonomous-benchmark-optimizer`](https://github.com/zedong-peng/autoresearch/tree/main/skills/autonomous-benchmark-optimizer) skill, which frames early exploration around a concrete contract: what metric matters, what command defines the benchmark, what files are editable, what must stay frozen, and how results should be logged.

### 2. Experiment iteration

This is where the gain is largest.

I can ask an agent to modify an experiment, add a condition, adjust an evaluation path, compare outputs, or propose the next debugging step. For iterative research code, that is much closer to how real work happens than a simple "generate script" interaction.

This is also why I care less now about whether a tool has the single best chat answer, and more about whether it can preserve momentum across multiple rounds of refinement.

Here too, I increasingly rely on reusable skills rather than one-off prompts. In [`benchmark-grinder`](https://github.com/zedong-peng/benchmark-grinder/tree/main/skills/benchmark-grinder), I wrote down the loop I actually want the agent to follow: establish a baseline, isolate one hypothesis, edit only the approved scope, run the benchmark, log the result, keep the change only if it improves the target metric, and continue.

### A concrete example: from meeting feedback to an experiment loop

To make this less abstract, here is a lightly edited English version of a real prompt I used after a group meeting. I kept the structure close to the original, but replaced the real local path with `/path/to/sum.md` and the real API key with `sk-xxxxx`.

```text
The meeting summary from last week is at /path/to/sum.md.

The advisor's feedback was useful. First determine whether the GrepQA problem is actually valuable. If it is, then identify the insight: in which cases GrepQA improves, why each component is designed the way it is, how it compares with other memory methods, and what other insight can be extracted.

Then, based on the current results, continue designing three modules. These can be updates to existing modules or entirely new ones. Write the ablation experiment code and run the scripts to obtain results. Verify the modules one by one. Remember to use git for version control. If a module does not improve the results, roll it back and move on to the next idea, because the current GrepQA version log is evolving too slowly and contains repeated directions.

After the loop of validating the problem's value, finding insight, and continuing the experiments, update the README. Because there may be new components and changes to older ones, explain again why each component is designed that way. Then write a public-facing blog post in local Markdown, in a style influenced by OpenAI, Anthropic, or Karpathy. If figures or formulas are needed, write scripts to generate them.

API for the experiments:
GPT-4o-mini OpenRouter key: sk-xxxxx
```

This prompt is not "please write some code for me." It is a research operating instruction. It links meeting feedback, hypothesis formation, ablation design, version control, rollback rules, documentation updates, and outward-facing writing in one chain.

That is also why I increasingly say AI may partially replace researchers. My point is not that human taste or judgment disappears. My point is that more and more of the day-to-day research machinery is already delegable when the workflow is specified clearly enough.

### 3. Blog and report delivery

One of the strongest patterns in my workflow is using AI to turn ongoing work into readable deliverables.

I keep a reusable slide template for my weekly EPCC group reports, now published as [`weekly-report-slides-template`](https://github.com/zedong-peng/weekly-report-slides-template). My usual process is to first ask the agent to write a blog-style narrative, then convert that structure into slides. If there are fresh experiment outputs, I can point the agent to the relevant directory and let it pull the needed figures or numbers into the report draft.

### 4. Meeting reflection

During group meetings, I often rely on AI-generated meeting summaries as an additional memory layer. After the meeting, I may discuss the advisor's suggestions with AI so I can unpack the idea, restate constraints, and identify concrete next actions while the context is still fresh.

### 5. Paper writing and LaTeX revision

I also use AI for LaTeX revision and paper editing. At this point that part feels almost routine: restructuring arguments, polishing wording, and propagating experiment updates through a draft are all tasks current systems can already handle reasonably well.

## The stack I actually pay for

My current setup is very simple:

- **Codex**: about `$20/month`
- **Cursor**: about `$20/month`
- **Claude Code**: my main workhorse, usually accessed through a low-cost third-party relay because the official path is expensive for the volume of work I want to run

When I need model APIs for actual LLM experiments rather than coding assistance, I usually use **OpenRouter** because it is convenient to access both open and closed models from one place, while keeping the option to switch to open-weight models when the experimental setting calls for it.

This separation matters. My coding stack and my experiment stack overlap, but they are not the same thing.

## What changed most is not coding speed

If I had to summarize the difference between 2024 and 2026, I would not say that AI made me code faster, although it did. I would say that AI made my research process more externally runnable.

Parts of the workflow that used to exist only in my head can now be offloaded into an interactive loop:

- turning a vague idea into a scoped direction,
- mapping out benchmarks and comparisons,
- implementing and revising experiments,
- converting raw progress into reports,
- rewriting paper sections,
- and reflecting on feedback after meetings.

In other words, AI is no longer just helping me produce artifacts. It is helping me maintain research momentum.

That is why Claude Code, despite the cost, became my main tool. That is also why Codex remains permanently useful for me: if a tool is cheap, reliable, and available, it becomes part of the default workflow rather than a special occasion.

I still do not think AI replaces research judgment. It does not choose the problem for me, and it does not make weak ideas strong. But it does reduce the friction between thought, implementation, iteration, and delivery.

For a PhD workflow, that reduction is enormous.

## Closing thought

The main lesson from the last two years is that the most important AI tools for research are no longer the ones that merely complete code. The important ones are the tools that can carry context across a chain of tasks long enough to help produce an actual research outcome.

That is why my workflow today looks less like "using an AI IDE" and more like working with a small, imperfect, but highly productive research assistant that happens to live in the terminal.

My more personal and less comfortable conclusion is that research itself increasingly looks like a profession that AI will partially replace. I do not mean that human researchers disappear overnight. I mean that more and more of the work that once felt distinctly "ours" now looks automatable: literature mapping, baseline design, experiment iteration, technical writing, and even parts of idea generation. I say that not as an outsider speculating about the future, but as someone whose own weekly research loop is already deeply coupled to AI.

What unsettles me is not only the speed. It is the quality. AI can propose angles I did not initially see, combine ideas faster than I can, and sustain exploratory loops with a level of patience that humans usually do not have.

That makes me think AGI may arrive faster than most of us expected. Maybe not as a dramatic overnight event, but as a steady collapse of tasks that used to define highly skilled intellectual work. From where I stand now, research no longer feels like a safe exception to that trend. It feels like one of the domains already being quietly reorganized by it.
