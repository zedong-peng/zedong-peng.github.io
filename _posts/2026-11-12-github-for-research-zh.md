---
layout: post
title: "用 GitHub 管理 research"
date: 2026-11-12 21:39:00 +0800
lang: zh-CN
translation_key: github-for-research
description: "main 放问题描述、可复用模块和 eval，多个 Agent 开多个 worktree 并行尝试多种解法，commit 历史就是 research 历史。"
categories: life
hidden: true
related_posts: false
series: missing-semester
series_episode: notes
---

本文翻译自[英文版]({% post_url 2026-11-12-github-for-research %})。

用 GitHub 管理 research。

## Repo

- **main**：问题描述、可复用模块和 eval，不断迭代。
- **worktree**：多个 Agent 开多个 worktree，并行尝试多种解法。
- **commit**：commit 历史就是 research 历史。

论文也放进 repo：[还在用 Overleaf，你就落后了]({% post_url 2026-11-12-paper-collaboration-with-claude-code-zh %})。

## 合作

同组的人想合作这个问题，也只是多一个 Agent 开 worktree 尝试 research。

## 规模

Anthropic 让一个模型协调 1,000 多个 subagent 工作八天，从一个空文件夹做出了能在笔记本上启动的操作系统。[^1]

## 注释

[^1]: Anthropic，[Introducing Claude Fable 5.2 and Claude Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2)，2026 年 11 月 9 日："As an experiment, one Anthropic engineer gave Fable 5.2 the task of designing a prototype operating system. Starting from an empty folder, the model coordinated over 1,000 subagents, working around the clock for eight days."
