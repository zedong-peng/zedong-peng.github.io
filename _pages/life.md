---
layout: page
title: life
description: Everyday things, including how much AI I actually use.
permalink: /life/
nav: true
nav_order: 2
---

<link rel="stylesheet" href="{{ '/assets/css/ai-usage.css' | relative_url }}">

<div class="au-board" id="au-board" data-source="{{ '/assets/ai-usage/data.json' | relative_url }}">
  <p class="au-lede">
    Token usage across my three machines — a Mac, one Linux box at home, and one FPGA server at the lab.
    Each day the machines are read where their logs live, merged on the Mac, and the result is committed to this repo.
    Every number is what the APIs would have cost at list price, not what I paid.
  </p>

  <div class="au-controls" role="group" aria-label="Time range">
    <button type="button" data-range="60" aria-pressed="true">60 days</button>
    <button type="button" data-range="365" aria-pressed="false">1 year</button>
    <button type="button" data-range="0" aria-pressed="false">All</button>
  </div>

  <div id="au-tokens" class="au-tokens is-loading">
    <div class="au-chart" id="au-chart"><div class="au-tip" id="au-tip" hidden></div></div>
    <ul class="au-legend" id="au-legend"></ul>
    <p class="au-tools" id="au-tools"></p>
  </div>

  <p class="au-footnote">
    <span id="au-updated">Reading…</span><br>
    <span id="au-hosts"></span>
  </p>

  <noscript><p class="au-footnote">The chart needs JavaScript.</p></noscript>
</div>

<script defer src="{{ '/assets/js/ai-usage.js' | relative_url }}"></script>
