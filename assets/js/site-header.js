---
permalink: /assets/js/site-header.js
---
{% comment %}
  The site header for standalone pages under zedongpeng.com that Jekyll does not build. They load this file and
  /assets/css/site.css, so their header is always the one in _includes/header.liquid.
{% endcomment %}
{% capture header_html %}{% include header.liquid %}{% endcapture %}
(function () {
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") document.documentElement.dataset.theme = saved;
  } catch (e) {}
  var script = document.currentScript;
  script.insertAdjacentHTML("afterend", {{ header_html | strip | jsonify }});
  document.getElementById("zp-theme").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();
