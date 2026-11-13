---
layout: post
title: "Claude Code's hillclimb skill"
date: 2026-11-06 14:00:00 +0800
lang: en
description: "Work in progress. In April I shared a skill that let Claude Code grind on a benchmark overnight. Anthropic's eval and hillclimbing workflow shows what my version was missing: a measurement I could trust."
categories: life
related_posts: false
_styles: |
  .autoresearch-figure { display: block; width: 100%; border: 0; background: #faf9f5; border-radius: 6px; }
  .autoresearch-progress { height: 680px; }
  .autoresearch-loop { height: 590px; }
  .autoresearch-log { overflow-x: auto; margin-bottom: 1.5rem; }
  .autoresearch-log table { min-width: 560px; }
  @media (max-width: 600px) {
    .autoresearch-progress { height: 830px; }
    .autoresearch-loop { height: 1030px; }
  }
---

> **整理中 · Work in progress.** I'm still organizing the original GrepQA experiments. The historical SOTA comparison has not been independently reproduced.

In April I shared a Claude Code skill that ran benchmark experiments while I slept. On September 28, Anthropic published [Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/), which ships a more careful version of the same idea as `/claude-api build-eval` and `/claude-api hillclimb`.

The short answer: my loop was good at running experiments and weak at deciding which results to trust. Anthropic's design fixes most of that. This post covers what my loop produced, what Anthropic's adds, and what I would change.

<figure>
  <img src="{{ '/assets/autoresearch/wechat-2026-04-01.png' | relative_url }}" alt="My April 1 WeChat message sharing benchmark-grinder: install the skill, give Claude Code a metric and benchmark, go to sleep, and inspect git history in the morning." width="1352" height="704" style="width:100%;height:auto" loading="lazy" data-zoomable />
  <figcaption>April 1, 11:55. “Then go to sleep. In the morning, look at git history to see what it has been up to.” In the next message I credited the NVIDIA AVO work Chenqi had shared.</figcaption>
</figure>

## The April version

On April 1, I posted `benchmark-grinder` in a WeChat group. Give Claude Code a benchmark, let it keep trying changes, go to sleep, and read the git history in the morning. The idea borrowed from NVIDIA's AVO, AlphaEvolve, and Karpathy's autoresearch.

The skill kept a small contract in `benchmark.md`: the metric, the run command, which files it could edit, and which evaluation files were frozen. It ran an untouched baseline, tested one hypothesis at a time, and kept or reverted each change. It forbade gaming the evaluator. What it lacked was a measurement protocol: no data split, no grader calibration, and no rule for when a gain is real. (Sources: [four slides from my March 31 report]({{ '/assets/autoresearch/epcc-2026-03-31-excerpt.pdf' | relative_url }}) and the [original skill text]({{ '/assets/autoresearch/benchmark-grinder-2026-04-01.txt' | relative_url }}).)

The first overnight run moved F1 from 29.76% to 30.07%, with one SSL crash. The bigger test came next.

## GrepQA

GrepQA answers questions about long conversations. An LLM writes keyword predicates, the system searches the conversation text, and the LLM answers from what it finds.

Over 34 versions, GrepQA went from **29.90 to 51.69 F1** on LoCoMo-10 with GPT-4o-mini. Answering from the full context scored 42.39 in the same table. The best version was v21. The [April 8 slides]({{ '/assets/autoresearch/epcc-2026-04-08-grepqa.pdf' | relative_url }}) show the architecture and results, and the [repository history]({{ '/assets/autoresearch/grepqa-history.txt' | relative_url }}) keeps the changelogs.

<figure>
  <iframe class="autoresearch-figure autoresearch-progress" src="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}" title="GrepQA: all 34 versions, recorded scores and unresolved results" loading="lazy"></iframe>
  <figcaption>All 34 versions. Filled dots are full runs, hollow dots pilots, diamonds versions with conflicting scores, and dashes versions without a recovered score. Select a version to see what changed. <a href="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}">Open figure</a> · <a href="{{ '/assets/autoresearch/grepqa-versions.csv' | relative_url }}">Data</a>.</figcaption>
</figure>

Most of the gains had clear causes:

- Pulling in neighboring turns gave retrieved lines their context.
- Several predicates with `must/should` scoring improved retrieval.
- Session dates let the model resolve relative time.
- v21 dropped answer-side keyword guessing, which had pointed the search at the wrong evidence.

51.69 was above the published Mem0 numbers in my comparison table (45.10, and 46.14 for the graph variant). Those were literature numbers with different models and setups, so the claim I can defend is narrower: GrepQA improved its own baseline by 21.79 points and beat the published numbers in that table. It is not a controlled leaderboard result.

After v21, twelve more versions tried IDF weighting, date anchors, enumeration, reranking, and session selection. None beat v21 on a full run. v31 is the clearest example. It scored 51.19 on a pilot against v21's 49.57, then regressed on the full run, because adding session headers to the scored text created false keyword matches. The loop produced these results quickly. It could not tell me which ones to believe.

### Full version log

“Full” and “pilot” follow the source labels. “Alt.” marks versions where two records disagree; both scores are shown. “—” means I have not recovered a score, not that the method scored zero.

<div class="autoresearch-log" markdown="1">

| Version | F1 | Run | Change |
|:--|:--|:--|:--|
| v1 | 29.90 | Full | Baseline: one keyword predicate, top-k retrieval |
| v2 | 35.18 | Full | Sliding-window context + multi-query retrieval |
| v3 | 28.96 | Full | Precision focus: no window, top-k=2, reranking |
| v4 | 22.43 | Full | Adaptive top-k + stricter answer prompt |
| v5 | 31.51 | Full | LLM filtering when many turns are retrieved |
| v6 | 46.71 / 44.69 | Alt. | New engine: 2 predicates, must/should scoring, speaker filter. Main table vs. changelog |
| v7 | 41.62 | Pilot | Session-date-aware time hints |
| v8 | 35.18 | Pilot | Answer-type-aware prompts |
| v9 | 44.57 | Pilot | 3 question-side predicates |
| v10 | 46.46 | Full | Date-aware answer prompt |
| v11 | 46.16 | Full | Include all values for list questions |
| v12 | 47.51 | Full | Complete but concise answers |
| v13 | 48.10 / 51.34 | Alt. | Resolve relative time from session timestamps. Changelog vs. selected-run table |
| v14 | 47.46 | Full | Temporal reasoning + “be complete” |
| v15 | 45.26 | Pilot | Answer-anticipation words in predicates |
| v16 | 47.41 | Pilot | Conservative third answer-anticipation predicate |
| v17 | 44.06 | Pilot | Second predicate targets answer vocabulary |
| v18 | 48.16 | Full | Disable speaker fallback |
| v19 | 46.48 | Pilot | Top-k from 8 to 5 |
| v20 | 45.69 | Pilot | 3 predicates with answer-side guessing |
| **v21** | **51.69** | Full | 3 question-side predicates; no answer guessing. **Kept.** Pilot score 49.57 |
| v22 | — | — | Single-word must-keywords |
| v23 | — | — | top_k=20, enumerate all items |
| v24 | — | — | IDF-weighted keyword matches |
| v25 | — | — | Relaxed second pass when few turns match |
| v26 | — | — | Larger retrieval for list questions only |
| v27 | — | — | Date anchors and vocabulary bridges. Pilot regression of about 5.4 pp |
| v28 | — | — | Broad retrieval, then LLM rerank |
| v29 | — | — | Month/year predicate injected in Python |
| v30 | — | — | Shorter answers, token limit 64 → 48 |
| v31 | 51.19 | Pilot | Session dates in scored text. Full run −0.89 pp vs. v21 |
| v32 | — | — | Header scoring only for date-anchor predicates |
| v33 | 46.99 | Pilot | Diverse predicates for enumeration questions |
| v34 | — | — | Route temporal vs. other questions; latency analysis only |

</div>

## What Anthropic's workflow adds

`build-eval` starts from representative cases, ideally real traffic or real failures, and has a person review the inputs and sample grades. `hillclimb` then works within an agreed scope, checks whether a gain is larger than noise, and tests one change at a time. Lower cost at equal quality counts as progress. Prompt and skill edits are the natural first target because they are cheap to try and easy to revert.

```text
/claude-api build-eval
/claude-api hillclimb
```

<figure>
  <iframe class="autoresearch-figure autoresearch-loop" src="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}" title="Anthropic's evaluation and hillclimbing workflow, with a plateau diagnosis branch" loading="lazy"></iframe>
  <figcaption>My schematic of the article and public skill. The optional three-way split reserves the final test for the end. <a href="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}">Open figure</a>.</figcaption>
</figure>

The public skill, pinned here to the version I read on November 6, adds three things I wish I'd had.

**Test the grader first.** The [eval-building guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/build-eval.md) feeds the grader deliberately bad outputs and induced infrastructure errors to confirm it rejects them. For coding agents, it checks the resulting workspace rather than whether the transcript sounds successful. Otherwise the optimizer and the grader can agree on a convenient fiction.

**Record why, not just what.** In the [hillclimbing guide](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/evals/eval-hillclimb.md), a fresh analyzer reads training traces and proposes one patch with a trace-backed explanation. Outputs, grades, patches, and loop state go to disk. Git history shows what changed; this record shows why.

**Treat a plateau as a diagnosis.** Missing knowledge, unclear instructions, a wrong grader, infrastructure failures, and noise each need a different fix. If the grader changes, stored outputs are regraded, so a better ruler isn't mistaken for a better system. My SSL crash belongs in an operations log, not in the evidence about retrieval.

## The held-out boundary

There is one default I would change for research results. The article scores the test set each round and keeps the version that does best on it. Even if the analyzer never sees test transcripts, choosing among many variants by test score fits the choice to that set. The test set becomes validation data.

The skill already offers the fix: on larger evals, select on a validation set and hold out a third slice for the final comparison. I would use that for anything I publish. On a small set, I would call the result exploratory.

Isolation has a similar gap. Giving the analyzer only training paths is a convention, not a barrier, and the guide notes that its harness hashes detect changes but can't stop an agent with write access. For a serious benchmark, the runner should enforce the boundary.

## What I would keep

From my grinder: the small contract, one hypothesis per run, reversible changes, and persistent logs. From Anthropic: grader checks before the first round, failure diagnosis at a plateau, and a final test on data never used for selection.

My [April 8 notes]({{ '/assets/autoresearch/epcc-2026-04-08-excerpt.txt' | relative_url }}) already pointed at the harder problem. Running experiments was getting easy; choosing what to run was not. They also caught a quiet mistake: LoCoMo leaderboard accuracy and my micro F1 were not comparable.

Agents can now run more of the experiments. Picking the question and spotting a misleading result are still my job. When I wake up, I want a record that tells me what I now know.
