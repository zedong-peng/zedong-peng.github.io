---
layout: post
title: "Claude Code's hillclimb skill"
date: 2026-11-06 14:00:00 +0800
lang: en
description: "Anthropic's hillclimb skill lets Claude Code improve a prompt or a skill against an eval, round after round, unattended. What it adds to the cruder loop I ran in April, and the one default I would change."
categories: life
_styles: |
  .autoresearch-figure { display: block; width: 100%; border: 0; }
  .autoresearch-loop { height: 460px; }
  .autoresearch-progress { height: 490px; }
  @media (max-width: 600px) {
    .autoresearch-loop { height: 1050px; }
    .autoresearch-progress { height: 630px; }
  }
---
Anthropic's [Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/) ships two commands for Claude Code. `/claude-api build-eval` turns a task into an evaluation. `/claude-api hillclimb` then improves a prompt or a skill against it, one change at a time, unattended.

I ran a cruder version of this loop in April. It was good at running experiments and weak at deciding which results to trust, and that is the part the skill gets right. There is one default I would change before publishing a number from it.

## The loop

`build-eval` starts from representative cases, ideally real traffic or real failures, and has a person review the inputs and sample grades. `hillclimb` then works within an agreed scope. It tests one change at a time, checks whether a gain is larger than noise, and counts lower cost at equal quality as progress. Prompt and skill edits are the natural first target, because they are cheap to try and easy to revert.

<figure>
  <iframe class="autoresearch-figure autoresearch-loop" src="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}" title="Anthropic's evaluation and hillclimbing workflow, with a plateau diagnosis branch" loading="lazy"></iframe>
  <figcaption>My schematic of the article and the public skill. <a href="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}">Open figure</a>.</figcaption>
</figure>

## My April loop

In April I shared a skill called `benchmark-grinder` ([original text]({{ '/assets/autoresearch/benchmark-grinder-2026-04-01.txt' | relative_url }})): give Claude Code a benchmark, let it keep trying changes, go to sleep, and read the git history in the morning. It kept a small contract of the metric, the run command, the files it could edit and the evaluation files it could not. It ran an untouched baseline, tested one hypothesis at a time, and kept or reverted each change.

I used it on GrepQA, which answers questions about long conversations by searching them with keyword predicates that an LLM writes. Over 34 versions, GrepQA went from 29.90 to 51.69 F1 on LoCoMo-10 with GPT-4o-mini ([slides]({{ '/assets/autoresearch/epcc-2026-04-08-grepqa.pdf' | relative_url }})).

<figure>
  <iframe class="autoresearch-figure autoresearch-progress" src="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}" title="GrepQA: all 34 versions, recorded scores and unresolved results" loading="lazy"></iframe>
  <figcaption>Each mark is a recorded result, not a controlled trajectory; pilots ran on a subset. Select a version to see what changed. <a href="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}">Open figure</a> · <a href="{{ '/assets/autoresearch/grepqa-versions.csv' | relative_url }}">Data</a>.</figcaption>
</figure>

The best version was the 21st. Thirteen more followed, and none beat it on a full run. Version 31 scored 51.19 on a pilot, where version 21 had scored 49.57, and then came out 0.89 points below version 21 on the full run.

The loop produced results quickly. It could not tell me which ones to believe. It had no data split, no check of the grader, and no rule for when a gain is real.

## What the skill adds

The public skill, in the version I read on November 6, adds three things I wish I had had.

- It tests the grader first. The [eval-building guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/build-eval.md) feeds the grader deliberately bad outputs and induced infrastructure errors to confirm that it rejects them. For coding agents, it checks the resulting workspace, not whether the transcript sounds successful.
- It records why, not just what. In the [hillclimbing guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/eval-hillclimb.md), a fresh analyzer reads the training traces and proposes one patch with an explanation backed by a trace. Outputs, grades, patches and loop state go to disk. Git history shows what changed; this record shows why.
- It treats a plateau as a diagnosis. Missing knowledge, unclear instructions, a wrong grader, infrastructure failures and noise each need a different fix. If the grader changes, stored outputs are regraded, so a better ruler is not mistaken for a better system.

## The held-out boundary

The default I would change is how the winner is chosen. The article scores the test set each round and keeps the version that does best on it. Even if the analyzer never sees a test transcript, choosing among many variants by test score fits the choice to that set, and the test set becomes validation data.

The skill already offers the fix: on larger evals, select on a validation set and hold out a third slice for the final comparison. I would use that for anything I publish, and call a result on a small set exploratory.

Isolation has a similar gap. Giving the analyzer only the training paths is a convention, not a barrier, and the guide notes that its harness hashes detect changes but cannot stop an agent with write access. For a serious benchmark, the runner should enforce the boundary.

<script>
  // Each figure is as tall as its content, whatever the width.
  document.querySelectorAll('.autoresearch-figure').forEach(function (frame) {
    function fit() {
      var body = frame.contentDocument && frame.contentDocument.body;
      if (body && body.offsetHeight) frame.style.height = body.offsetHeight + 'px';
    }
    frame.addEventListener('load', function () {
      fit();
      new ResizeObserver(fit).observe(frame.contentDocument.body);
    });
    fit();
  });
</script>
