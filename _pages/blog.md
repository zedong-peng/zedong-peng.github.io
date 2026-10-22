---
layout: default
permalink: /blog/
title: posts
nav: true
nav_order: 1
pagination:
  enabled: false
  collection: posts
  permalink: /page/:num/
  per_page: 20
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

<div class="post">

{% assign blog_name_size = site.blog_name | size %}
{% assign blog_description_size = site.blog_description | size %}

{% if blog_name_size > 0 or blog_description_size > 0 %}

  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>
  {% endif %}

{% if site.display_tags and site.display_tags.size > 0 or site.display_categories and site.display_categories.size > 0 %}

  <div class="tag-category-list">
    <ul class="p-0 m-0">
      {% for tag in site.display_tags %}
        <li>
          <i class="fa-solid fa-hashtag fa-sm"></i> <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag }}</a>
        </li>
        {% unless forloop.last %}
          <p>&bull;</p>
        {% endunless %}
      {% endfor %}
      {% if site.display_categories.size > 0 and site.display_tags.size > 0 %}
        <p>&bull;</p>
      {% endif %}
      {% for category in site.display_categories %}
        <li>
          <i class="fa-solid fa-tag fa-sm"></i> <a href="#{{ category | slugify }}">{{ category }}</a>
        </li>
        {% unless forloop.last %}
          <p>&bull;</p>
        {% endunless %}
      {% endfor %}
    </ul>
  </div>
  {% endif %}

{% assign visible_posts = site.posts | where_exp: "post", "post.hidden != true" %}
{% assign featured_posts = visible_posts | where: "featured", "true" %}
{% if featured_posts.size > 0 %}
<br>

<div class="container featured-posts">
{% assign is_even = featured_posts.size | modulo: 2 %}
<div class="row row-cols-{% if featured_posts.size <= 2 or is_even == 0 %}2{% else %}3{% endif %}">
{% for post in featured_posts %}
{% assign post_language = post.lang | default: site.lang %}
<div class="col mb-4">
<a href="{{ post.url | relative_url }}">
<div class="card hoverable">
<div class="row g-0">
<div class="col-md-12">
<div class="card-body">
<div class="float-right">
<i class="fa-solid fa-thumbtack fa-xs"></i>
</div>
<h3 class="card-title text-lowercase">{{ post.title }}</h3>
<p class="card-text">{{ post.description }}</p>

                    {% if post.external_source == blank %}
                      {% if post_language contains 'zh' %}
                        {% assign read_time = post.content | strip_html | size | divided_by: 500 | plus: 1 %}
                      {% else %}
                        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
                      {% endif %}
                    {% else %}
                      {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
                    {% endif %}
                    {% assign year = post.date | date: "%Y" %}

                    <p class="post-meta">
                      {% if post_language contains 'zh' %}{{ read_time }} 分钟阅读{% else %}{{ read_time }} min read{% endif %} &nbsp; &middot; &nbsp;
                      <a href="{{ year | prepend: '/blog/' | relative_url }}">
                        <i class="fa-solid fa-calendar fa-sm"></i> {{ year }} </a>
                      &nbsp; &middot; &nbsp;
                      {% include post_language_control.liquid post=post links=false %}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      {% endfor %}
      </div>
    </div>
    <hr>

{% endif %}

{% for category in site.display_categories %}
{% assign section_posts = visible_posts | where_exp: "post", "post.categories contains category" %}

<h2 class="blog-section" id="{{ category | slugify }}">{{ category | capitalize }}</h2>

{% include blog_post_list.liquid posts=section_posts show_language=true %}
{% endfor %}

<h2 class="blog-section" id="websites">websites</h2>

<ul class="td-sites">
  <li>
    <a href="/zp-coding/"><b>ZP-Coding</b></a>
    <span>ZP-Coding v0.1: a single-attempt benchmark for generative coding agents. One prompt, one attempt, every model; raw outputs side by side.</span>
  </li>
  <li>
    <a href="/qwen38-4090/"><b>Qwen3.8-27B / RTX 4090</b></a>
    <span>Single-GPU inference speed, configurations and raw samples. The leaderboard behind the 4090 study.</span>
  </li>
  <li>
    <a href="/tokendust/"><b>tokendust</b></a>
    <span>Count the tokens your own agents used and get a share card. The tool behind <a href="/blog/2026/ai-usage/">How Much AI I Actually Use</a>.</span>
  </li>
  <li>
    <a href="https://sytoken.org/ai-board/"><b>AI 使用实况</b></a>
    <span>每日 AI 用量、花费与笔记的公开记录（中文）。</span>
  </li>
  <li>
    <a href="/memorytax/"><b>MemoryTax</b></a>
    <span>What agent memory actually buys once the model can read the raw history. Paper, code and data.</span>
  </li>
</ul>

<style>
  .td-sites {
    margin: 0.6rem 0 0;
    padding: 0;
    list-style: none;
  }
  .td-sites li {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    padding: 10px 0;
    border-bottom: 1px solid var(--global-divider-color);
    font-size: 14.5px;
  }
  .td-sites li:last-child { border-bottom: 0; }
  .td-sites b { font-weight: 600; }
  .td-sites a { color: var(--global-text-color); text-decoration: none; }
  .td-sites a:hover { color: var(--global-theme-color); }
  .td-sites span {
    color: var(--global-text-color-light);
    font-size: 13.5px;
    line-height: 1.6;
  }
  .td-sites span a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
</style>

<style>
  .blog-section {
    margin: 2.5rem 0 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--global-divider-color);
    font-size: 1.6rem;
  }
</style>

</div>
