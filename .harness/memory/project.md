# Repository Conventions

- This is an al-folio-based Jekyll site. Put dated articles in `_posts/` and name them `YYYY-MM-DD-kebab-case-title.md`.
- The site uses the `Asia/Shanghai` timezone; recent authored posts use explicit `+0800` timestamps.
- Use two-space indentation in YAML, Liquid, JavaScript and SCSS. Preserve YAML front matter and existing Liquid conventions.
- Validate content changes with `bundle exec jekyll build` when dependencies are available.
- The editable CV source is `assets/pdf/yaml_cv/Zedong_Peng_CV.yaml`; its `rendercv_output/` directory contains generated artifacts.
