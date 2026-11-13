---
permalink: /assets/js/site-header.js
---
{% comment %}
  The site header for standalone pages under zedongpeng.com that Jekyll does not build. They load this file and
  /assets/css/site.css, so their header is always the one in _includes/header.liquid.
{% endcomment %}
{% capture header_html %}{% include header.liquid %}{% endcapture %}
document.currentScript.insertAdjacentHTML("afterend", {{ header_html | strip | jsonify }});
