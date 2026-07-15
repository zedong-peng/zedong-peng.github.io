---
layout: default
permalink: /blog/en/
title: English posts
description: English posts on research and life.
lang: en
nav: false
pagination:
  enabled: false
---

<div class="post">
  <div class="header-bar">
    <h1>English posts</h1>
    <h2>Blogs on research and life.</h2>
  </div>

{% include blog_language_switcher.liquid active_language='en' %}

{% assign visible_posts = site.posts | where_exp: 'post', 'post.hidden != true' %}
{% include blog_post_list.liquid posts=visible_posts language='en' %}

</div>
