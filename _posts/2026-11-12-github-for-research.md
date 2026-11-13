---
layout: post
title: "Manage research with GitHub"
date: 2026-11-12 21:40:00 +0800
lang: en
description: "Main holds the problem statement, reusable modules and evals; agents try several solutions in parallel worktrees; the commit history is the research history."
categories: life
series: missing-semester
series_episode: notes
---

Manage research with GitHub.

## The repo

- **main**: the problem statement, reusable modules and evals, iterated on continually.
- **worktrees**: several agents open several worktrees and try several solutions in parallel.
- **commits**: the commit history is the research history.

Papers go in the repo too: [If you still use Overleaf, you are behind]({% post_url 2026-11-12-paper-collaboration-with-claude-code %}).

## Collaboration

A labmate who wants to work on the problem is just one more agent opening a worktree to try some research.

## Scale

Anthropic had one model coordinate over 1,000 subagents for eight days, from an empty folder to an operating system that boots on a laptop.[^1]

## Footnotes

[^1]: Anthropic, [Introducing Claude Fable 5.2 and Claude Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2), November 9, 2026: "As an experiment, one Anthropic engineer gave Fable 5.2 the task of designing a prototype operating system. Starting from an empty folder, the model coordinated over 1,000 subagents, working around the clock for eight days."
