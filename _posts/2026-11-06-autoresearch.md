---
layout: post
title: "Claude Code's hillclimb skill"
date: 2026-11-06 14:00:00 +0800
lang: en
description: "Work in progress. In April I told friends to let a benchmark grinder run while they slept. Anthropic's eval and hillclimbing workflow gives me a better way to think about what should happen overnight."
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

> **整理中 · Work in progress.** These are working notes while I organize the original GrepQA experiments and refine the figures. The historical SOTA comparison has not been independently reproduced.

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

The first overnight log was modest: 29.76% F1 became 30.07%, and one attempt crashed with an SSL error. The more substantial example came next, when I used the same style of repeated experimentation on **GrepQA**: ask an LLM for keyword predicates, search the conversation text, then answer from the retrieved evidence.

## GrepQA's longer run

My memory was “about 32 versions.” The [historical repository record]({{ '/assets/autoresearch/grepqa-history.txt' | relative_url }}) actually reaches **v33**, and the source later includes **v34**, an answer-routing variant with latency analysis. The retained winner was **v21**. In the main results table, GrepQA went from **29.90 to 51.69 F1**, a gain of **21.79 percentage points**. The full-context configuration in that table scored **42.39**. These were reported GPT-4o-mini runs on LoCoMo-10; the [April 8 report slides]({{ '/assets/autoresearch/epcc-2026-04-08-grepqa.pdf' | relative_url }}) preserve the architecture and results.

<figure>
  <iframe class="autoresearch-figure autoresearch-progress" src="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}" title="GrepQA: all 34 versions, recorded scores and unresolved results" loading="lazy"></iframe>
  <figcaption>All 34 numbered versions. Filled dots denote reported full runs, hollow dots pilots, diamonds records with alternative scores, and dashes versions without a recovered score. Select a version for its change and outcome. <a href="{{ '/assets/autoresearch/grepqa-progress.html' | relative_url }}">Open figure</a> · <a href="{{ '/assets/autoresearch/grepqa-versions.csv' | relative_url }}">Data</a>.</figcaption>
</figure>

The improvements had identifiable mechanisms. Context windows brought neighboring turns into view. Multiple predicates and a <code>must/should</code> scoring scheme improved retrieval. Session dates helped resolve relative time in answers. The retained v21 used three predicates derived from the question and removed answer-side keyword guessing: guessing an answer before retrieval could send the search toward the wrong evidence.

This was the result I remembered as reaching SOTA. In the report's comparison table, 51.69 was above the imported memory-system results, including Mem0 at 45.10 and its graph variant at 46.14. Those were literature numbers, and the historical README explicitly notes differences in model and evaluation setup. The defensible claim here is that GrepQA exceeded the published numbers in that comparison, and substantially improved my own recorded baseline; this is not a newly verified, controlled leaderboard result.

The plateau is part of the story too. Versions v22–v33 explored IDF scoring, date anchors, enumeration, reranking, and session selection without displacing v21 in the recorded full evaluation. Some trials were only pilots. The plot distinguishes those cases; a missing score means the artifact was not recovered, not that the method scored zero.

### The complete version log

Here is the whole trail, including regressions and unfinished evidence. **Full** and **pilot** follow the source labels. **Alt.** marks conflicting or differently configured scores in the surviving records. The full-run table and changelog disagree for v6 and v13, so both numbers are retained rather than silently choosing one. “—” means I have not recovered a separate score. The [source archive]({{ '/assets/autoresearch/grepqa-history.txt' | relative_url }}) includes the changelogs, commit messages, and recovered module notes.

<div class="autoresearch-log" markdown="1">

| Version | Recorded F1 | Run | What changed / what happened |
|:--|:--|:--|:--|
| v1 | 29.90 | Full | Baseline: single keyword predicate, top-k retrieval  |
| v2 | 35.18 | Full | Sliding window context expansion + multi-query retrieval  |
| v3 | 28.96 | Full | Precision-focused: window=0, top-k=2, reranking, smarter fallback  |
| v4 | 22.43 | Full | Adaptive top-k + stricter answer extraction prompt  |
| v5 | 31.51 | Full | Selective LLM filtering when many turns retrieved  |
| v6 | 46.71 / 44.69 | Alt. | New engine: 2 predicates, must/should scoring, speaker filter. Main table / later log: 46.71. Original changelog: 44.69. Both retained here; configuration mapping is unresolved. |
| v7 | 41.62 | Pilot | Added session-date-aware time_hint scoring  |
| v8 | 35.18 | Pilot | Answer-type-aware answering prompts  |
| v9 | 44.57 | Pilot | Switched to 3 question-side predicates  |
| v10 | 46.46 | Full | Date-aware answer prompt on top of v6-k8  |
| v11 | 46.16 | Full | Answer prompt: include all values for list questions  |
| v12 | 47.51 | Full | Balanced answer prompt: complete but concise  |
| v13 | 48.10 / 51.34 | Alt. | Resolve relative time expressions using session timestamps. Changelog: 48.10. Historical selected full-run table: 51.34. The record does not reconcile these runs. |
| v14 | 47.46 | Full | Combined temporal reasoning with "be complete" instruction  |
| v15 | 45.26 | Pilot | Answer-anticipation words added to predicate generation  |
| v16 | 47.41 | Pilot | Conservative third answer-anticipation predicate  |
| v17 | 44.06 | Pilot | Second predicate explicitly targets answer-turn vocabulary  |
| v18 | 48.16 | Full | Disabled speaker fallback to reduce noisy retrieval  |
| v19 | 46.48 | Pilot | Reduced top-k from 8 to 5 to cut retrieval noise  |
| v20 | 45.69 | Pilot | 3 predicates including answer-side keyword guessing  |
| v21 | 51.69 | Full | 3 predicates, question-side only; removed answer guessing. Retained winner: full 51.69; a later pilot baseline was 49.57. Pilot and full scores are different evaluations. |
| v22 | — | — | Enforce single-word must_keywords, avoiding exact-match failures from multiword phrases. Source recovered; separate score not found. |
| v23 | — | — | Retrieve top_k=20 and ask the answerer to enumerate all items. Not retained; separate score not found. |
| v24 | — | — | Weight keyword matches by inverse document frequency (IDF). Not retained; separate score not found. |
| v25 | — | — | If too few turns match, generate relaxed predicates for a second retrieval pass. Not retained; separate score not found. |
| v26 | — | — | Use larger retrieval and enumerate-all answers only for list questions. Not retained; separate score not found. |
| v27 | — | — | Add date anchors and vocabulary bridges to predicate generation. A later commit reports a pilot regression of about 5.4 pp; no absolute score recovered. |
| v28 | — | — | Retrieve broadly, then have an LLM rerank down to the most relevant turns. Not retained; separate score not found. |
| v29 | — | — | Inject a month/year predicate in Python while keeping the v21 prompt. Date matching initially searched turn text rather than session headers; separate score not found. |
| v30 | — | — | Force shorter answers and lower the answer token limit from 64 to 48. Not retained; separate score not found. |
| v31 | 51.19 | Pilot | Include session dates in the text used to score predicates. Pilot 51.19 vs v21 pilot 49.57; later full run regressed 0.89 pp vs v21. Common words in headers introduced false matches. |
| v32 | — | — | Score session headers only for predicates explicitly tagged as date anchors. Attempts to fix v31 interference; not retained. Separate score not found. |
| v33 | 46.99 | Pilot | Classify enumeration questions and generate diverse predicates for them. Pilot 46.99 vs v21 pilot 49.57 (−2.58 pp); not retained. |
| v34 | — | — | Route temporal questions to concise answers and other questions to comprehensive answers. Implementation and latency analysis recovered; independent quality score not found. |

</div>

One later attempt is particularly instructive. v31 looked promising on the pilot (51.19 against v21's 49.57), then regressed on the full run. Scoring every turn together with its session header introduced unwanted keyword matches. v32 narrowed that behavior to date-anchor predicates. That is exactly the kind of history I want to retain: the attractive first signal, the broader failure, and the next hypothesis it suggested.

The process got me a useful system and a collection of failed explanations. Anthropic's evaluation discipline would make the next such search easier to interpret, especially after many attempts on the same benchmark.

## Anthropic's design

The entry point matters. `build-eval` starts with representative cases, preferably grounded in production traffic or real failures, and asks the user to review inputs and sample grades. `hillclimb` then works within an agreed scope and objective, checks whether a useful gain is measurable above noise, and tests individual changes. The proposer uses training failures; held-out scores help decide whether to keep a patch. When progress stalls, it investigates the failures rather than indefinitely editing the prompt. These are the central ideas in [the article](https://claude.dev/blog/automating-eval-design-and-hillclimbing/).

The objective can also be lower cost while preserving quality. That gives the loop somewhere useful to go when an evaluation is nearly saturated. Prompt and skill edits make a natural starting point: they are cheap to try and revert, and a narrow edit makes its effect easier to investigate. In an updated Claude Code session, the two entry points are:

```text
/claude-api build-eval
/claude-api hillclimb
```

<figure>
  <iframe class="autoresearch-figure autoresearch-loop" src="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}" title="Anthropic's evaluation and hillclimbing workflow, with a plateau diagnosis branch" loading="lazy"></iframe>
  <figcaption>My schematic of the article and public skill. The optional three-way split reserves the final test for the end. <a href="{{ '/assets/autoresearch/eval-loop.html' | relative_url }}">Open figure</a>.</figcaption>
</figure>

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
