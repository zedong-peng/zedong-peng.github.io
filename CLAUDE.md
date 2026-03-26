# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal academic website for Zedong Peng, built with the [al-folio](https://github.com/alshedivat/al-folio) Jekyll template. Deployed to https://zedonpeng.com via GitHub Actions → gh-pages branch.

## Common Commands

### Local Development (Docker)
```bash
docker compose up --detach
docker compose exec jekyll bundle
docker compose restart jekyll
# Site available at http://localhost:8080
docker compose down
```

### Update CV
```bash
cd assets/pdf/yaml_cv
rendercv render "Zedong_Peng_CV.yaml"
# or with live reload:
rendercv render --watch "Zedong_Peng_CV.yaml"
```

First-time setup: `pip install "rendercv[full]"`

### Deployment
Automatic on push to `main` via `.github/workflows/deploy.yml`. No manual deployment needed.

## Architecture

### Content Structure
- `_pages/` — Static pages (about, cv, publications, projects, etc.)
- `_posts/` — Blog posts
- `_news/` — News/announcements collection
- `_projects/` — Project entries
- `_bibliography/papers.bib` — All publications in BibTeX format (rendered by jekyll-scholar)
- `assets/pdf/yaml_cv/Zedong_Peng_CV.yaml` — CV source of truth (rendered to PDF by RenderCV)

### Template System
- `_layouts/` — Liquid layout templates (12 types: about, bib, cv, post, distill, etc.)
- `_includes/` — Reusable Liquid components
- `_sass/` — SCSS stylesheets

### Key Configuration
- `_config.yml` — All site settings, plugin config, enabled features, and third-party library CDN URLs with SRI hashes
- Jekyll Scholar settings: author name `[Peng, Zedong]`, APA style, grouped by year descending

### Build Pipeline
GitHub Actions runs: Jekyll build → PurgeCSS → deploy to gh-pages. Image optimization (WebP, multiple widths) happens via jekyll-imagemagick during build.

### Adding Publications
Edit `_bibliography/papers.bib`. Use custom BibTeX fields for extras: `preview`, `slides`, `code`, `video`, `selected={true}` (shows on about page).

### Adding News
Create a file in `_news/` as a Markdown or HTML snippet.
