# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal academic website for Zedong Peng, built with the [al-folio](https://github.com/alshedivat/al-folio) Jekyll template. Deployed to https://zedongpeng.com via GitHub Actions → gh-pages branch.

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

Edit `_data/cv.yml`; publications come from `_bibliography/papers.bib`. `_layouts/cv.liquid` renders `/cv/`, and the deploy workflow prints that page to `/assets/pdf/Zedong_Peng_CV.pdf`. Entry links use bracketed labels, never link the title: a CV entry takes a `links:` list of `label`/`url` pairs (rendered as `[label]` after the title), and a publication gets `[paper] [arxiv] [pdf] [code] [data] [slides] [video]` from its BibTeX fields. Bracketed labels are for entry-level resources only; names inside a summary or highlight stay natural prose links.

### Deployment

Automatic on push to `main` via `.github/workflows/deploy.yml`. No manual deployment needed.

## Architecture

### Content Structure

- `_pages/` — Static pages (about, cv, projects, etc.); `/publications/` is only a redirect stub to `/cv/`
- `_posts/` — Blog posts
- `_news/` — News/announcements collection
- `_projects/` — Project entries
- `_bibliography/papers.bib` — All publications in BibTeX format (rendered by jekyll-scholar)
- `_data/cv.yml` — CV source of truth (the `/cv/` page; its PDF is printed from the page on deploy)

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

### Writing Posts

Open with what the post is and the plain answer; headings are plain noun phrases. Date a post earlier than the push that publishes it.

### Adding News

Create a file in `_news/` as a Markdown or HTML snippet.
