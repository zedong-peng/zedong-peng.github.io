# Repository Guidelines

Zedong Peng's personal academic site, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll template and served at https://zedongpeng.com.

## Structure

- `_pages/`: the about page (`/`), the blog index, the CV, the series index and the 404 page. `/publications/` is only a redirect stub to `/cv/`.
- `_posts/`: blog posts, named `YYYY-MM-DD-kebab-case-title.md`.
- `_data/`: `cv.yml` (the CV), `series.yml` (blog series), `socials.yml`.
- `_bibliography/papers.bib`: all publications, rendered by jekyll-scholar.
- `_layouts/`, `_includes/`, `_sass/`, `_plugins/`: the theme.
- `assets/`: images, PDFs, JavaScript and standalone HTML.
- `_config.yml`: site settings, plugins, and third-party library URLs with SRI hashes. A file at the repository root is published unless it is listed under `exclude`.

## Build and deploy

```bash
docker compose up --detach      # serves http://localhost:8080 with live reload
docker compose logs -f jekyll   # follow the first build
docker compose down
```

A push to `main` runs `.github/workflows/deploy.yml`: Jekyll build, the Qwen3.8-4090 leaderboard built from its own repo, PurgeCSS, the CV printed to PDF, then `_site` published to the `gh-pages` branch. There is no test suite; a clean `bundle exec jekyll build` is the check.

## CV

Edit `_data/cv.yml`; publications come from `_bibliography/papers.bib`. `_layouts/cv.liquid` renders `/cv/`, and the deploy workflow prints that page to `/assets/pdf/Zedong_Peng_CV.pdf`, so never commit that PDF.

Entry links use bracketed labels and never link the title. A CV entry takes a `links:` list of `label`/`url` pairs, rendered as `[label]` after the title. A publication gets `[paper] [arxiv] [pdf] [code] [data] [slides] [video]` from its BibTeX fields. Bracketed labels are for entry-level resources only; names inside a summary or highlight stay natural prose links.

## Publications

Edit `_bibliography/papers.bib`. Custom BibTeX fields add the extras: `preview`, `pdf`, `poster`, `slides`, `code`, `video`, and `selected={true}`.

## Posts

- Open with what the post is and the plain answer. Headings are plain noun phrases.
- Give `date` an explicit `+0800` offset, and date a post earlier than the push that publishes it.
- `categories` is `research` or `life`; the blog index lists posts under those two headings.
- A translated post is two files that share a `translation_key`. The Chinese file ends in `-zh`, sets `lang: zh-CN`, and sets `hidden: true` so that only the English one is listed.
- A post joins a series with `series` and `series_episode`, both defined in `_data/series.yml`.
- A post whose content lives on its own site sets `redirect:` to that URL. A standalone HTML article under `assets/html/` is shown with `layout: embed` and `embed:`.

## Style

Two-space indentation in YAML, Liquid, JavaScript and SCSS. Lowercase, descriptive asset names, with a post's images under `assets/img/blog/`. Commit messages are short imperative summaries, one focused change per commit.
