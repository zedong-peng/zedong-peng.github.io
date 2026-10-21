---
layout: page
title: projects
permalink: /projects/
description: Things I build and write the numbers for.
nav: true
nav_order: 3
---

A short list, not a full dump: the tools here have a write-up, a number I can defend, or both. Everything else is on [GitHub](https://github.com/zedong-peng).

<div class="td-grid">

<a class="td-card" href="/tokendust/">
  <span class="td-kicker">tool · open source</span>
  <b>tokendust</b>
  <span class="td-desc">Count the tokens every agent on your machines actually used, sum the machines, and get a share card. The board behind the <a href="/blog/2026/ai-usage/">AI usage post</a>.</span>
  <span class="td-links">board · <span class="td-mono">curl | python3</span></span>
</a>

<a class="td-card" href="https://sytoken.org/ai-board/">
  <span class="td-kicker">live · since 2025</span>
  <b>AI 使用实况</b>
  <span class="td-desc">The public log this all came from: daily tokens, spending and notes across every subscription, in Chinese, updated from local logs.</span>
  <span class="td-links">sytoken.org</span>
</a>

<a class="td-card" href="https://github.com/zedong-peng/llmwiki">
  <span class="td-kicker">tool · research</span>
  <b>llmwiki</b>
  <span class="td-desc">A source-first paper ingestion skill that keeps a persistent personal Markdown wiki, so reading accumulates instead of scrolling past.</span>
  <span class="td-links">github</span>
</a>

<a class="td-card" href="https://github.com/zedong-peng/DiffHLS">
  <span class="td-kicker">research · ISEDA 2026</span>
  <b>DiffHLS</b>
  <span class="td-desc">Differential learning for HLS QoR prediction: GNN structure plus LLM code embeddings. Code, data and paper from my work on LLM4EDA.</span>
  <span class="td-links">github · <a href="/blog/2025/forgehls-and-diffhls/">write-up</a></span>
</a>

<a class="td-card" href="https://github.com/zedong-peng/memorytax">
  <span class="td-kicker">paper · code</span>
  <b>MemoryTax</b>
  <span class="td-desc">The bitter lesson of agent memory: what long-context and retrieval actually buy, measured against their cost. Paper, code and data.</span>
  <span class="td-links">github · <a href="/blog/2026/memorytax/">write-up</a></span>
</a>

<a class="td-card" href="https://github.com/zedong-peng/pelican-bicycle">
  <span class="td-kicker">benchmark · ongoing</span>
  <b>pelican-bicycle</b>
  <span class="td-desc">The same SVG pelican-on-a-bicycle prompt across every model, effort level, provider and harness — a clean read on how much of "quality" is the harness.</span>
  <span class="td-links">github · results</span>
</a>

</div>

<style>
.td-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 28px;
}
.td-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--global-divider-color, #e3e5df);
  border-radius: 10px;
  background: var(--global-card-bg-color, #fff);
  color: var(--global-text-color, #1f211e);
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s;
}
.td-card:hover {
  border-color: var(--global-theme-color, #2a78d6);
  transform: translateY(-1px);
}
.td-kicker {
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--global-text-color-light, #6b7067);
}
.td-card b { font-size: 15.5px; font-weight: 620; }
.td-desc { font-size: 13.5px; line-height: 1.6; color: var(--global-text-color-light, #6b7067); }
.td-desc a, .td-links a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.td-links { margin-top: auto; padding-top: 8px; font-size: 12px; color: var(--global-text-color-light, #6b7067); }
.td-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style>
