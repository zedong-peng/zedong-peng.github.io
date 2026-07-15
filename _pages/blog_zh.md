---
layout: default
permalink: /blog/zh/
title: 中文文章
description: 关于研究与生活的中文文章。
lang: zh-CN
nav: false
pagination:
  enabled: false
---

<div class="post">
  <div class="header-bar">
    <h1>中文文章</h1>
    <h2>关于研究与生活的博客。</h2>
  </div>

{% include blog_language_switcher.liquid active_language='zh-CN' %}

{% assign visible_posts = site.posts | where_exp: 'post', 'post.hidden != true' %}
{% include blog_post_list.liquid posts=visible_posts language='zh-CN' %}

</div>
