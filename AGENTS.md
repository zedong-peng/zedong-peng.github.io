# Repository Guidelines

Zedong Peng's personal academic site, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll template and served at https://zedongpeng.com.

## Structure

- `_pages/`: the about page (`/`), the blog index, the CV, the series index and the 404 page. `/publications/` is only a redirect stub to `/cv/`.
- `_posts/`: blog posts, named `YYYY-MM-DD-kebab-case-title.md`.
- `_data/`: `cv.yml` (the CV), `series.yml` (blog series), `socials.yml`.
- `_bibliography/papers.bib`: all publications, rendered by jekyll-scholar.
- `_layouts/`, `_includes/`, `_plugins/`: the templates. All styling is one hand-written file, `assets/css/site.css`: two families, four sizes, two text colors and one accent, after Anthropic's site. There is no CSS framework and no icon font.
- `assets/`: images, PDFs, JavaScript and standalone HTML.
- `_config.yml`: site settings, plugins, and third-party library URLs with SRI hashes. A file at the repository root is published unless it is listed under `exclude`.

## Build and deploy

```bash
docker compose up --detach      # serves http://localhost:8080 with live reload
docker compose logs -f jekyll   # follow the first build
docker compose down
```

A push to `main` runs `.github/workflows/deploy.yml`: Jekyll build, the CV printed to PDF, then `_site` uploaded straight to GitHub Pages (no `gh-pages` branch). Other paths under zedongpeng.com, such as `/memorytax/` or `/qwen38-4090-inference/`, are separate repos with their own Pages. There is no test suite; a clean `bundle exec jekyll build` is the check.

## Theme

Every page under zedongpeng.com looks the same, and the look is whatever an ordinary anthropic.com article actually does, measured from the rendered page rather than remembered: sans for the header, titles, headings and small print, serif for the text that is read. Poppins and Lora (both OFL) stand in for Anthropic's own typefaces, as its brand skill prescribes. The values are in `assets/css/site.css` and the header in `_includes/header.liquid`. The site is light only, as Anthropic's is: no dark mode and no theme switch. Change the look there and nowhere else.

A page takes one of two forms:

- A Markdown post in `_posts/`. This is the default.
- A standalone HTML page in its own repo, served by that repo's GitHub Pages at `zedongpeng.com/<repo>/`, for a page with its own figures, data or build. Start from `assets/template/page.html`: it links `site.css` and loads `/assets/js/site-header.js`, which inserts the same header. Its own styles go in one `<style>` block that uses the variables of `site.css`; it sets no fonts or colors of its own. List it on the blog with a post that sets `redirect:`.

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
- A post whose content lives on its own site sets `redirect:` to that URL (see Theme).

## Style

Two-space indentation in YAML, Liquid, JavaScript and SCSS. Lowercase, descriptive asset names, with a post's images under `assets/img/blog/`. Commit messages are short imperative summaries, one focused change per commit.
