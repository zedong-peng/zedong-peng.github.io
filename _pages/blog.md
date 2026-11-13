---
layout: default
permalink: /blog/
title: Posts
---

<section class="col page-head">
<h1>{{ site.blog_name }}</h1>

{% for category in site.display_categories %}
{% assign section_posts = site.posts | where_exp: "post", "post.categories contains category" %}
<h2 class="section" id="{{ category | slugify }}">{{ category | capitalize }}</h2>
{% include blog_post_list.liquid posts=section_posts %}
{% endfor %}
</section>
