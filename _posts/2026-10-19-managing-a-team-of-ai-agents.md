---
layout: post
title: "How I Manage a Team of AI Agents"
date: 2026-10-19 12:00:00 +0800
lang: en
description: "A CEO, four specialists named after people whose work fits the job, and a few habits of ordinary management that mattered more than the technology."
categories: life
related_posts: false
---

Most of my research now runs on a team of AI agents organized like a small company. One agent is the CEO. Each of the others owns one line of work and is named after a well-known person whose work fits the job. I talk almost only to the CEO.

The team is a few days old. The parts that mattered most were ordinary management: one owner per job, goals instead of targets, reasons instead of rules, and little chatter. This post describes the setup and the handful of things I told the agents along the way, quoted from the session logs and translated from Chinese.

## Before the team

Each agent is a session of Claude Code, Anthropic's coding assistant. Given a task, a session reads and writes code, runs commands on my machines, starts experiments and keeps working for hours. When its history grows too long, it summarizes the history to make room. That step is called compaction, and it means anything an agent must not forget has to live in a file.

My main project lets llama.cpp, a popular open-source program for running language models, run on an FPGA: a chip whose circuits can be rewired for one job. Several sessions worked on it at once, next to a few side projects. Each was capable on its own. The weak link was me. I was the only channel between them, carrying each decision from one session to the next and checking whether it had arrived.

On October 16, in the middle of a strategy discussion, I gave the session I was talking to a new job:

> "From now on you're Musk. Take on Musk's personality and manage the other sessions from first principles. The session building the FPGA hardware works for you. What should we call it? Who are the famous names in hardware?"

That session became Elon Musk, CEO. The hardware session became Ross Freeman, after the Xilinx co-founder who invented the FPGA.

## The team

<figure class="ai-team" role="img" aria-label="Me at the top, linked to the CEO; the CEO linked to four members; all of them read a shared repository and llmwiki, the literature library, at the bottom">
<svg viewBox="0 0 720 368" xmlns="http://www.w3.org/2000/svg">
<style>
.ai-team svg { width: 100%; height: auto; display: block; color: var(--global-text-color); font-family: inherit; }
.ai-team .box { fill: var(--global-bg-color); stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.ai-team .ceo { stroke: var(--global-theme-color); stroke-opacity: 1; stroke-width: 2.5; }
.ai-team .me { fill: var(--global-theme-color); }
.ai-team .name { fill: currentColor; font-size: 17px; font-weight: 600; text-anchor: middle; }
.ai-team .role { fill: currentColor; fill-opacity: 0.7; font-size: 13.5px; text-anchor: middle; }
.ai-team .on-me { fill: #fff; font-size: 17px; font-weight: 600; text-anchor: middle; }
.ai-team .wire { fill: none; stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.ai-team .talk { stroke: var(--global-theme-color); stroke-width: 5; }
.ai-team .read { fill: none; stroke: currentColor; stroke-opacity: 0.4; stroke-width: 1.5; stroke-dasharray: 4 4; }
.ai-team .repo { fill: currentColor; fill-opacity: 0.06; stroke: currentColor; stroke-opacity: 0.35; stroke-width: 1.5; }
.ai-team .book { fill: currentColor; fill-opacity: 0.35; }
</style>
<line class="talk" x1="360" y1="56" x2="360" y2="102"/>
<path class="wire" d="M360 158 V180 M105 180 H615 M105 180 V202 M275 180 V202 M445 180 V202 M615 180 V202"/>
<path class="read" d="M105 258 V282 M275 258 V282 M445 258 V282 M615 258 V282 M268 130 H14 V282 H615 M180 282 V304 M540 282 V304"/>
<rect class="me" x="290" y="12" width="140" height="44" rx="8"/>
<text class="on-me" x="360" y="40">Me</text>
<rect class="box ceo" x="268" y="102" width="184" height="56" rx="8"/>
<text class="name" x="360" y="126">Elon Musk</text>
<text class="role" x="360" y="146">CEO</text>
<rect class="box" x="30" y="202" width="150" height="56" rx="8"/>
<text class="name" x="105" y="226">Ross Freeman</text>
<text class="role" x="105" y="246">FPGA backend</text>
<rect class="box" x="200" y="202" width="150" height="56" rx="8"/>
<text class="name" x="275" y="226">Chris Olah</text>
<text class="role" x="275" y="246">writing</text>
<rect class="box" x="370" y="202" width="150" height="56" rx="8"/>
<text class="name" x="445" y="226">Richard Sutton</text>
<text class="role" x="445" y="246">models that learn</text>
<rect class="box" x="540" y="202" width="150" height="56" rx="8"/>
<text class="name" x="615" y="226">Jim Simons</text>
<text class="role" x="615" y="246">quant research</text>
<rect class="repo" x="6" y="304" width="348" height="56" rx="8"/>
<text class="name" x="180" y="328">shared repository</text>
<text class="role" x="180" y="348">team · decisions · project status</text>
<rect class="repo" x="366" y="304" width="348" height="56" rx="8"/>
<path class="book" d="M382 318 h6 v30 h-6 z M390 314 h7 v34 h-7 z M399 320 h5 v28 h-5 z"/>
<rect class="book" x="406" y="317" width="6" height="31" transform="rotate(14 412 348)"/>
<path class="wire" d="M378 348.5 H420"/>
<text class="name" x="556" y="328">llmwiki</text>
<text class="role" x="556" y="348">literature library: papers · notes · code</text>
</svg>
<figcaption class="caption">I talk to the CEO (thick line). Members bring the CEO only big things and rarely message each other. What everyone needs to know lives in a shared repository that each session reads when it starts; the papers we build on live in llmwiki, a literature library every agent can read (dashed lines).</figcaption>
</figure>

| Name           | Named after                                                     | Job                                                                     |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Elon Musk      | builds companies from first principles, bets big                | CEO: direction, decisions, resources, blockers                          |
| Ross Freeman   | inventor of the FPGA                                            | chief designer of the FPGA backend: hardware, builds, tests on the card |
| Chris Olah     | clear visual explanations of how neural networks work           | writing: the project's report page and posts on this blog               |
| Richard Sutton | father of reinforcement learning, author of "The Bitter Lesson" | research on models that learn from their own experience                 |
| Jim Simons     | mathematician who founded Renaissance Technologies              | quantitative trading research                                           |

A name works like a one-word style guide: it tells the agent how to approach the work without a list of rules. When I wanted the writer to work differently, the CEO renamed it. It joined as Knuth, after Donald Knuth's idea that a program should read like an explanation, and became Olah the same day, when I asked for more figures and a style learned from Anthropic's own writing.

## One owner per job

Adding an agent costs one message, and so does removing one. Two early hires split work off the chief designer: Conway took the builds and the tests on the card, and Patterson checked performance estimates and kept the report page. On October 17 I folded both back into Freeman. Of Conway, I told the CEO:

> "Have the new hire hand its work to Freeman. It seems to carry habits from older versions of our rules; Freeman can avoid them or learn from them and keep going. It's the chief designer, after all. Then let the new hire go."

The lesson went into the team page: one long-lived session per role, and one owner for each body of facts. One-off searches, audits and parallel attempts are helpers an agent starts inside its own role, not new hires.

## A hire is one message

Everything a new member needs fits in the message that starts its session. Here is the one Jim Simons received, shortened ("the user" is me):

> You are Jim Simons, the company's quant researcher, reporting to Musk. … Goal: find returns that survive trading costs and hold up out of sample. The user has tried some of this before, knows its limits, and wants you to step outside it and do it your own way: the market, data, methods and direction are yours to choose. Limits: no real money. No orders and no touching any account; anything that involves money or the user's accounts goes through Musk to the user. No keys in the repository. … Experiments go in the repository's notes, the current state in the project file. Come to Musk with big results or decisions you need made; otherwise there is no need to report.

It has a persona, a goal without a number, hard limits where money or exposure is involved, freedom everywhere else, and a rule for when to speak up. Most of those came from corrections I made in the first few days.

## Goals, not targets

The CEO's first instinct was a good manager's: set measurable targets. It proposed two numbers for Freeman, a generation speed for the flagship model at a long context and a time limit for reading in a long prompt, and asked whether to send them. I said:

> "Don't send them. Don't let targets break our ideals."

The project's goal is now a direction with no number in it: generate text with every model at the full speed of the card's memory, at any context length.

The CEO also liked to hand out ideas. I stopped that too:

> "Right. The directions you gave Freeman were only the CEO's suggestions. Someone of Freeman's calibre can explore all kinds of directions on its own. That is where our company's strength comes from."

Earlier, once the project's report page had a first version, I had put the same thing in English: "We have the power to do anything, please be brave." A failed attempt now costs one line in the notes.

## Reasons, not rules

When I said something firmly, the CEO wrote it down as a rule and passed it on as one. At one point its list of "rules from the user" had three entries: one kind of data in the FPGA design must be written by the card itself, not by the computer's processor; don't start a long build with an untested change; keep the report page on version 1.1.0. I took them apart again:

> "Not going through the processor isn't a rule. It's my judgment from experience: that path is obviously slow. Not starting long builds with untested changes isn't a rule either; my worry is that changing too little per build makes development crawl. Keeping the page at 1.1.0 isn't a rule. It's our current stable version, so we made material from it first. When there's a new stable version we can update it, but not for every small change, because editing the page takes real work."

A rule can only be followed. A reason can be weighed against evidence, and an agent with better evidence can overturn it. The decisions file now gives the reason with each decision and labels the project's defaults "overturn with data."

## Don't wait

Turning an FPGA design into a working circuit, a build, takes eight hours or more. Early on, Freeman started a build and waited for it:

> "It looks like Freeman is waiting on builds. Meanwhile it could keep trying other changes and run other builds in parallel."

Now agents keep working while long jobs run, and they check changes cheaply first so that each long run tests several of them at once. For Sutton, whose experiments run on a server with four GPUs, the same idea pointed the other way:

> "Don't run several rounds fighting over the GPUs. Use all four to finish one task first, so you get fast feedback."

Both are about one quantity: the time from an idea to its result.

## Talk little, write it down

Within two days the agents were messaging each other and the CEO constantly: acknowledgments, progress updates, relays.

> "Fewer messages between sessions: among the members, and between them and you. A CEO doesn't need to talk with each employee several times a day. Only big things go to the CEO."

A member now comes to the CEO with a result that changes direction, a decision only the CEO or I can make, or a problem it cannot solve. Everything else goes into its notes and its project's status file. When there was no writing to do, I told the writer to rest so it would stop spending tokens.

The shared documents got the same treatment. Every agent rereads them at the start of each session and after each compaction, so every line in them is paid for again and again:

> "Company documents shouldn't keep a long history of changes, or every session will read a pile of irrelevant things like personnel changes. Let git track the changes; the files should show only the latest, for the agents to read."

## What stays with me

Some decisions stay with me: anything that touches money, my accounts, or what becomes public. One of those went wrong early. I had said my wiki, llmwiki, could hold the company's notes, and nobody checked that its repository was public. Two agents pushed internal notes there before a third noticed and asked first. The commits were removed, the repository was made private, and the decisions file gained a line: "Before pushing anything outward, check whether the target is public." The wiki now holds only other people's work; our own results stay in each project's notes.

I also bring judgment the agents don't have yet, usually in a single line. "Two paths, isn't that hard to understand?" started the work of replacing two designs that did the same job on the chip with a single one. "The 2024 benchmarks are already a bit dated" sent Sutton to survey what the field uses now before choosing one. And on what a result should mean for a small open model: "If we get an improvement at all, that's good. The point is the method."

## How it runs

For readers who want to try something similar:

- Each agent is an interactive Claude Code session in its own long-running terminal, titled with its full name and role. I can step into any of them and talk to it directly.
- All sessions start in one company folder. Its instruction file, which Claude Code loads automatically, is the team page, so every agent knows who is on the team and how we work.
- A private GitHub repository holds three kinds of files: the team page, the decisions in force, and one status file per project. Each project's code and notes live in their own private repositories.
- llmwiki is the company's literature library: the papers, blog posts and code by others that an agent has read, each with its citation and a reading note. Every agent can read it, and an agent that reads something new in depth files it there. [Its own post](/blog/2026/llmwiki/) explains how it works.
- Agents message each other through Claude Code's built-in messaging between sessions.
- The laptop I type on is only a launcher. Code, data and experiments live on servers.

## What I'd keep

Most of this is advice you would give about managing people: one owner per job, a goal worth having instead of a number, reasons instead of rules, room to try and fail, few meetings, and the state written down. With agents the last one matters most, because a session knows only what it is given when it starts.

_This post went through the company too. I asked the CEO for "a simple blog post about how I manage AI"; the CEO passed it to Olah, the writer, who wrote it from the company's files and the session logs._
