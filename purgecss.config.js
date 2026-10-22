module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  // The standalone Qwen3.8 leaderboard builds its own class names; keep them.
  safelist: { standard: [/^qwen38-/] },
  skippedContentGlobs: ["_site/assets/**/*.html"],
};
