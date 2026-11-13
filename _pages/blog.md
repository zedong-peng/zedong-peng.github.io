---
layout: default
permalink: /blog/
title: Posts
nav: true
nav_order: 1
---

<section class="col page-head">
<h1>{{ site.blog_name }}</h1>
<p class="lead">{{ site.blog_description }}</p>

{% assign visible_posts = site.posts | where_exp: "post", "post.hidden != true" %}
{% for category in site.display_categories %}
{% assign section_posts = visible_posts | where_exp: "post", "post.categories contains category" %}
<h2 class="section" id="{{ category | slugify }}">{{ category | capitalize }}</h2>
{% include blog_post_list.liquid posts=section_posts %}
{% endfor %}

<h2 class="section" id="series">Series</h2>
<ul class="list">
  {% for series_entry in site.data.series %}
  {% assign series = series_entry[1] %}
  <li>
    <a class="t" href="{{ series.url | relative_url }}">{{ series.title.en }}</a>
    <p class="d small">{{ series.summary.en }}</p>
  </li>
  {% endfor %}
</ul>

<h2 class="section" id="websites">Websites</h2>
<ul class="list">
  <li>
    <a class="t" href="/velodrome/">Velodrome</a>
    <p class="d small">A pelican riding a bicycle, drawn by model, effort, harness and provider.</p>
  </li>
  <li>
    <a class="t" href="/qwen38-4090-inference/">Qwen3.8-27B / RTX 4090</a>
    <p class="d small">Single-GPU inference speed, configurations and raw samples. The leaderboard behind the 4090 study.</p>
  </li>
  <li>
    <a class="t" href="/blog/2026/ai-usage/">How Much AI I Actually Use</a>
    <p class="d small">Daily token usage on three machines, priced at API list rates.</p>
  </li>
</ul>
</section>
