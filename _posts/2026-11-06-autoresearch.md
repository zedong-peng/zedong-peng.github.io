---
layout: post
title: "Autoresearch, Seven Months After My Grinder"
date: 2026-11-06 14:00:00 +0800
lang: en
description: "In April I told friends to let a benchmark grinder run while they slept. Anthropic's eval and hillclimbing workflow gives me a better way to think about what should happen overnight."
categories: life
related_posts: false
---

On April 1, I posted a skill called `benchmark-grinder` in a WeChat group. The pitch was simple: give Claude Code a benchmark, let it keep trying changes, and go to sleep. In the morning, read the git history. Seven months later, I came across Anthropic's [Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/), published on September 28. It packages a more carefully designed version of this workflow into `/claude-api build-eval` and `/claude-api hillclimb`.

I'm glad this exists. My skill was useful, but I hadn't thought through the evaluation nearly as carefully. Reading Anthropic's design sent me back to my own reports to see what I had actually built, and what the overnight runs had established.

<figure>
  <img src="{{ '/assets/autoresearch/wechat-2026-04-01.png' | relative_url }}" alt="My April 1 WeChat message sharing benchmark-grinder: install the skill, give Claude Code a metric and benchmark, go to sleep, and inspect git history in the morning." width="1352" height="704" style="width:100%;height:auto" loading="lazy" data-zoomable />
  <figcaption>April 1, 11:55. “Then go to sleep. In the morning, look at git history to see what it has been up to.” In the next message I credited the NVIDIA AVO work Chenqi had shared.</figcaption>
</figure>

## The April version

The work started a little earlier than I remembered. My EPCC report is dated March 31, and the grinder repository's first commit is from that evening. The slides mention NVIDIA's AVO, AlphaEvolve, and Karpathy's autoresearch. I was borrowing a workflow and making it reusable for my own experiments.

There were two loops. `auto-research-single` read papers and revised ideas, keeping its working memory in Markdown files. `benchmark-grinder` worked against an executable evaluation. It recorded the metric, run command, allowed edits, and frozen evaluation files in `benchmark.md`; ran an untouched baseline; tried one hypothesis at a time; and kept or discarded the change. Logs and a result ledger preserved what happened. I've put the relevant [four slides here]({{ '/assets/autoresearch/epcc-2026-03-31-excerpt.pdf' | relative_url }}) and archived the [original skill text]({{ '/assets/autoresearch/benchmark-grinder-2026-04-01.txt' | relative_url }}), so the sources don't depend on access to my private repositories.

The skill already prohibited gaming the evaluator and warned against unsupported gains in noisy runs. It also allowed a simpler or cheaper system to count as progress at roughly equal quality. The unfinished part was turning those intentions into a measurement protocol: it had no prescribed data split, grader calibration, or statistical acceptance rule.

The experiment log is a useful antidote to my enthusiastic group message. On my LoCoMo setup, the baseline was 29.76% F1. Category-specific prompts reached 30.07% and were kept. The other completed attempts scored lower; increasing retrieval to `top_k=16` crashed with an SSL error.

<figure>
  <img src="{{ '/assets/autoresearch/grinder-runs.png' | relative_url }}" alt="March 31 experiment log: baseline 29.76% F1; category prompts 30.07%, kept; temporal prompt 29.87%, reverted; top_k 16 crashed; constraint-aware query 29.68%, discarded; temporal weight boost 22.89%, discarded; category 3 chain of thought 29.02%, discarded." width="1500" height="900" style="width:100%;height:auto" loading="lazy" data-zoomable />
  <figcaption>Transcribed from the March 31 slides. These are recorded run scores, with no uncertainty estimates in the slide; the crash has no score. <a href="{{ '/assets/autoresearch/grinder-runs.csv' | relative_url }}">Data</a>.</figcaption>
</figure>

That is a working experiment loop. The 0.31 percentage-point increase, by itself, is weak evidence of an improvement. The slide gives me no repeat-run variation or independent final evaluation with which to judge it. An agent can do exactly what I asked, leave a tidy history, and still leave the scientific question unanswered.

## Anthropic's design

The entry point matters. `build-eval` starts with representative cases, preferably grounded in production traffic or real failures, and asks the user to review inputs and sample grades. `hillclimb` then works within an agreed scope and objective, checks whether a useful gain is measurable above noise, and tests individual changes. The proposer uses training failures; held-out scores help decide whether to keep a patch. When progress stalls, it investigates the failures rather than indefinitely editing the prompt. These are the central ideas in [the article](https://claude.dev/blog/automating-eval-design-and-hillclimbing/).

The objective can also be lower cost while preserving quality. That gives the loop somewhere useful to go when an evaluation is nearly saturated. Prompt and skill edits make a natural starting point: they are cheap to try and revert, and a narrow edit makes its effect easier to investigate. In an updated Claude Code session, the two entry points are:

```text
/claude-api build-eval
/claude-api hillclimb
```

I also read the public skill implementation, which is more detailed than the article. The links below pin the version I read on November 6.

The [eval-building guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/build-eval.md) makes human review part of constructing the measurement. For an agent that edits code, it prefers checking the resulting workspace over judging whether the transcript sounds successful. It also asks for deliberately bad outputs and induced infrastructure errors to test the evaluator. I like this because the optimizer and the evaluator can otherwise agree on a convenient fiction. A polished rubric is much less convincing than seeing it reject an obviously wrong answer.

The [hillclimbing guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/eval-hillclimb.md) usually gives a fresh analyzer the training traces and asks it for one patch with a trace-backed explanation. The outer session applies changes and tracks scores. Per-case outputs, usage, grades, patches, and loop state live on disk. This makes the experiment inspectable after the conversation ends. My old promise to “read git history in the morning” covered code changes; this record also lets me inspect why a change was proposed and how it was judged.

The same guide treats a plateau as a diagnostic event. Missing knowledge, inaccessible instructions, a wrong grader, infrastructure failures, and ordinary variance need different responses. If the grader changes, it calls for regrading stored outputs across variants and checking whether their ranking changes. That distinction is especially valuable: repairing the ruler can be necessary, but the resulting score movement must be separated from progress in the system being measured.

My old SSL failure makes this concrete. It belongs in the operational record, but it tells me nothing about whether retrieving more passages helps. Likewise, several plausible prompt edits that fail to move a score should make me inspect the bottleneck. Persistence is useful only while another experiment can teach me something.

## The held-out boundary

There is one detail I would handle more strictly for a research result. The article describes scoring the test set each round and retaining the version that does best on it. The current guide uses this as its default too. Even if the analyzer never sees test transcripts, selecting among many variants using those scores adapts the final choice to that set. It functions as validation data.

This is my statistical reading of the workflow, and the implementation already offers a remedy: for a sufficiently large evaluation, it optionally uses validation for round selection and reserves a third test slice for the final comparison. I would choose that arrangement for a result I intended to publish. On a small set, I would describe the outcome as exploratory and collect new cases before making a stronger claim.

The same distinction applies to isolation. Giving the analyzer only training paths is a useful workflow constraint. It doesn't by itself make other files inaccessible. The guide explicitly recognizes a similar limit for its harness hashes: they detect changes, but cannot contain an agent that already has broad write access. For a serious benchmark, I would make the relevant data boundaries enforceable by the runner or environment.

## What I would keep

I still want the overnight loop. I would keep the small contract, one hypothesis per experiment, reversible changes, and persistent records from my grinder. I would add Anthropic's measurement checks before the first optimization round, failure diagnosis at a plateau, and a final comparison on data unused for selecting the winner. A small gain would remain a candidate until the evidence supports keeping it.

My [April 8 notes]({{ '/assets/autoresearch/epcc-2026-04-08-excerpt.txt' | relative_url }}) were already circling the next problem: execution was getting easier, while deciding what was worth doing remained difficult. They also recorded a mundane correction with large consequences: LoCoMo leaderboard accuracy and the micro F1 I was using could not be compared directly.

That is the part of autoresearch I care about more now. I can delegate more experiments, but choosing a useful question and recognizing a misleading result still need attention. Anthropic's workflow gives the agent better procedures for the second job. When I wake up, I want a record that helps me decide what I now know.
