# Repository Guidelines

Zedong Peng's personal academic site, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll template and served at https://zedongpeng.com.

## Structure

- `_pages/`: the about page (`/`), the blog index, the CV and the 404 page. `/publications/` is only a redirect stub to `/cv/`.
- `_posts/`: blog posts, named `YYYY-MM-DD-kebab-case-title.md`.
- `_data/`: `cv.yml` (the CV), `series.yml` (blog series), `socials.yml`.
- `_bibliography/papers.bib`: all publications, rendered by jekyll-scholar.
- `_layouts/`, `_includes/`, `_plugins/`: the templates. All styling is one hand-written file, `assets/css/site.css`: two families, four sizes, two text colors and one accent, after Anthropic's site, plus four of its colors for figures (`--clay`, `--olive`, `--sky`, `--cloud`). There is no CSS framework and no icon font.
- `assets/`: images, PDFs, JavaScript and standalone HTML.
- `feed.xml`: the Atom feed, which lists what the blog index lists.
- `_config.yml`: site settings, plugins, and the MathJax URL with its SRI hash. A file at the repository root is published unless it is listed under `exclude`.

## Build and deploy

```bash
docker compose up --detach      # serves http://localhost:8080 with live reload; add --build after a Gemfile change
docker compose logs -f jekyll   # follow the first build
docker compose down
```

A push to `main` runs `.github/workflows/deploy.yml`: Jekyll build, the CV printed to PDF, then `_site` uploaded straight to GitHub Pages (no `gh-pages` branch). Other paths under zedongpeng.com, such as `/memorytax/` or `/qwen38-4090-inference/`, are separate repos with their own Pages. There is no test suite; a clean `bundle exec jekyll build` is the check.

## Theme

Every page under zedongpeng.com looks the same, and the look is whatever an ordinary anthropic.com article actually does, measured from the rendered page rather than remembered: sans for the header, titles, headings and small print, serif for the text that is read. Poppins and Lora (both OFL) stand in for Anthropic's own typefaces, as its brand skill prescribes. The values are in `assets/css/site.css` and the header in `_includes/header.liquid`. The site is light only, as Anthropic's is: no dark mode and no theme switch. Change the look there and nowhere else.

A page takes one of two forms:

- A Markdown post in `_posts/`. This is the default.
- A standalone HTML page in its own repo, served by that repo's GitHub Pages at `zedongpeng.com/<repo>/`, for a page with its own figures, data or build. Start from `assets/template/page.html`: it links `site.css` and loads `/assets/js/site-header.js`, which inserts the same header. Its own styles go in one `<style>` block that uses the variables of `site.css`; it sets no fonts or colors of its own. A figure, in a post or on a standalone page, takes its colors from those variables too and never writes a hex value. List it on the blog with a post that sets `redirect:`.

## CV

Edit `_data/cv.yml`; publications come from `_bibliography/papers.bib`. `_layouts/cv.liquid` renders `/cv/`, and the deploy workflow prints that page to `/assets/pdf/Zedong_Peng_CV.pdf`, so never commit that PDF.

Entry links use bracketed labels and never link the title. A CV entry takes a `links:` list of `label`/`url` pairs, rendered as `[label]` after the title. A publication gets `[paper] [arxiv] [pdf] [code] [data] [slides] [poster] [video]` from its BibTeX fields. Bracketed labels are for entry-level resources only; names inside a summary or highlight stay natural prose links.

## Publications

Edit `_bibliography/papers.bib`. Custom BibTeX fields add the links: `website` (the venue page, shown as `[paper]`), `arxiv`, `pdf`, `code`, `data`, `slides`, `poster` and `video`.

## Posts

- Open with what the post is and the plain answer. Headings are plain noun phrases.
- Give `date` an explicit `+0800` offset, and date a post earlier than the push that publishes it.
- `categories` is exactly one of `better-ml`, `faster-ml` or `life`, after the homepage's line, making machine learning better and faster. `better-ml` is a post that reports my own research on what a model or an agent can do: an experiment, a dataset, a benchmark, a paper, a survey or reading notes. `faster-ml` is one that reports my own research on how fast a model runs: inference, kernels, hardware. `life` is every other post. The Posts menu in the header and the blog index list those three, after an overview. `category_names` in `_config.yml` holds how each is written on the page.
- A post is in one language and has no translation, as on Anthropic's site. English is the default; a post written for Chinese readers ends in `-zh` and sets `lang: zh-CN`.
- A post joins a series with `series` and `series_episode`, both defined in `_data/series.yml`.
- A post whose content lives on its own site sets `redirect:` to that URL (see Theme).
- A category name links to its page, `/blog/category/<name>/`.
- A post's address holds its year. When a post's date or file name changes, the old address is gone: nothing forwards from it, so update every link to it in the same commit.
- The blog index lists posts and nothing else, as Anthropic's lists do. A standalone site, a leaderboard included, gets a `redirect:` post, and a series has no page of its own: the box on each episode lists the others.

## Gallery

`/gallery/` shows the photos of `_data/gallery.yml`, which documents an entry's fields; the files are under `assets/img/gallery/`. They are laid out as anthropic.com/research's gallery view is, on a full-width 12-column grid with two photos a row: `_plugins/gallery-layout.rb` holds Anthropic's rule, which picks each row's sizes and positions from a hash of its two file names, so adding a photo at the top moves the photos below it. Commit one JPEG per photo, converted from the HEIC original at its full resolution with its EXIF kept, GPS coordinates included: I choose which photos to publish, so one whose location is private is not added. A photo names its place and has no map. A place in China is named in Chinese and one in Japan in Japanese, as `南京・瞻园` and `東京・港区`; any other place is named in English.

## Style

Two-space indentation in YAML, Liquid, JavaScript and SCSS. Lowercase, descriptive asset names, with a post's images under `assets/img/blog/`. Commit messages are short imperative summaries, one focused change per commit.
