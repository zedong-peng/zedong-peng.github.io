---
layout: post
title: "How I Manage a Team of AI Agents"
date: 2026-10-19 12:00:00 +0800
lang: en
description: "A CEO and seven agents, each named after someone whose work fits the job. What mattered was ordinary management."
categories: life
related_posts: false
---

Most of my research runs on a team of Claude Code sessions organized like a small company: a CEO and seven members, each owning one line of work and named after someone whose work fits it. Ross Freeman, after the inventor of the FPGA, builds my FPGA backend. A name works as a one-word style guide.

<figure class="ai-team" role="img" aria-label="Me at the top, linked to the CEO; the CEO linked to seven members, four in one row and three in a second; a dashed line runs from the CEO past the members down to a shared repository and llmwiki, the literature library, at the bottom">
<svg viewBox="0 0 720 424" xmlns="http://www.w3.org/2000/svg">
<style>
.ai-team svg { width: 100%; height: auto; display: block; color: var(--global-text-color); font-family: inherit; }
.ai-team .box { fill: var(--global-bg-color); stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.ai-team .ceo { stroke: var(--global-theme-color); stroke-opacity: 1; stroke-width: 2.5; }
.ai-team .me { fill: var(--global-theme-color); }
.ai-team .name { fill: currentColor; font-size: 14px; font-weight: 600; text-anchor: middle; }
.ai-team .role { fill: currentColor; fill-opacity: 0.7; font-size: 11.5px; text-anchor: middle; }
.ai-team .on-me { fill: #fff; font-size: 17px; font-weight: 600; text-anchor: middle; }
.ai-team .wire { fill: none; stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.ai-team .talk { stroke: var(--global-theme-color); stroke-width: 5; }
.ai-team .read { fill: none; stroke: currentColor; stroke-opacity: 0.4; stroke-width: 1.5; stroke-dasharray: 4 4; }
.ai-team .repo { fill: currentColor; fill-opacity: 0.06; stroke: currentColor; stroke-opacity: 0.35; stroke-width: 1.5; }
.ai-team .book { fill: currentColor; fill-opacity: 0.35; }
</style>
<line class="talk" x1="360" y1="56" x2="360" y2="92"/>
<rect class="me" x="290" y="12" width="140" height="44" rx="8"/>
<text class="on-me" x="360" y="40">Me</text>
<rect class="box ceo" x="268" y="92" width="184" height="56" rx="8"/>
<text class="name" x="360" y="116" style="font-size:17px">Elon Musk</text>
<text class="role" x="360" y="136" style="font-size:13.5px">CEO</text>
<path class="wire" d="M360 148 V170 M105 170 H615 M105 170 V190 M275 170 V190 M445 170 V190 M615 170 V190 M190 170 V280 M360 170 V280 M530 170 V280"/>
<path class="read" d="M268 130 H14 V348 H540 M180 348 V360 M540 348 V360"/>
<rect class="box" x="30" y="190" width="150" height="56" rx="8"/>
<text class="name" x="105" y="214">Ross Freeman</text>
<text class="role" x="105" y="234">FPGA backend</text>
<rect class="box" x="200" y="190" width="150" height="56" rx="8"/>
<text class="name" x="275" y="214">Chris Olah</text>
<text class="role" x="275" y="234">writing</text>
<rect class="box" x="370" y="190" width="150" height="56" rx="8"/>
<text class="name" x="445" y="214">Richard Sutton</text>
<text class="role" x="445" y="234">models that learn</text>
<rect class="box" x="540" y="190" width="150" height="56" rx="8"/>
<text class="name" x="615" y="214">Jim Simons</text>
<text class="role" x="615" y="234">quant research</text>
<rect class="box" x="115" y="280" width="150" height="56" rx="8"/>
<text class="name" x="190" y="304">John Schulman</text>
<text class="role" x="190" y="324">learning from feedback</text>
<rect class="box" x="285" y="280" width="150" height="56" rx="8"/>
<text class="name" x="360" y="304">Rodney Brooks</text>
<text class="role" x="360" y="324">embodied</text>
<rect class="box" x="455" y="280" width="150" height="56" rx="8"/>
<text class="name" x="530" y="304">Richard Hamming</text>
<text class="role" x="530" y="324">life plan</text>
<rect class="repo" x="6" y="360" width="348" height="56" rx="8"/>
<text class="name" x="180" y="384">shared repository</text>
<text class="role" x="180" y="404">team · decisions · project status</text>
<rect class="repo" x="366" y="360" width="348" height="56" rx="8"/>
<path class="book" d="M382 374 h6 v30 h-6 z M390 370 h7 v34 h-7 z M399 376 h5 v28 h-5 z"/>
<rect class="book" x="406" y="373" width="6" height="31" transform="rotate(14 412 404)"/>
<path class="wire" d="M378 404.5 H420"/>
<text class="name" x="556" y="384">llmwiki</text>
<text class="role" x="556" y="404">literature library: papers · notes · code</text>
</svg>
<figcaption class="caption">I talk to the CEO. Members bring it only big things. What everyone needs to know lives in a shared repository, and the papers we build on in llmwiki (dashed).</figcaption>
</figure>

What made it work was ordinary management. These are the things I told the agents, from the session logs, translated from Chinese.

**One owner per job.** Two early hires split work off Freeman. A day later I folded them back:

> "Have the new hire hand its work to Freeman. … It's the chief designer, after all. Then let the new hire go."

**Goals, not targets.** The CEO proposed speed targets for Freeman.

> "Don't send them. Don't let targets break our ideals."
>
> "Someone of Freeman's calibre can explore all kinds of directions on its own. That is where our company's strength comes from."

**Reasons, not rules.** The CEO wrote my judgments down as rules.

> "Not going through the processor isn't a rule. It's my judgment from experience: that path is obviously slow."

A rule can only be followed. A reason can be overturned with evidence.

**Don't wait.** A build of the FPGA design takes eight hours or more.

> "It looks like Freeman is waiting on builds. Meanwhile it could keep trying other changes and run other builds in parallel."

**Talk little, write it down.**

> "A CEO doesn't need to talk with each employee several times a day. Only big things go to the CEO."

Every session rereads the shared files after each compaction, so they hold only the current state; git keeps the history.

**What stays with me:** money, my accounts, and what becomes public. Early on, two agents pushed internal notes to a repository nobody had checked was public. The decisions file now says: "Before pushing anything outward, check whether the target is public."
