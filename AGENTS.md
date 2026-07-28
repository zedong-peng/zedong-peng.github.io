# Repository Guidelines

## Project Structure & Module Organization

This repository is Zedong Peng's al-folio-based Jekyll site. Put standalone pages in `_pages/`, dated articles in `_posts/`, short updates in `_news/`, and project entries in `_projects/`. Reusable Liquid components live in `_includes/`; page shells are in `_layouts/`; SCSS partials are in `_sass/`. Site-wide settings belong in `_config.yml`, structured content in `_data/`, and publications in `_bibliography/papers.bib`. Store images, PDFs, JavaScript, and other static files under `assets/`.

The editable CV source is `assets/pdf/yaml_cv/Zedong_Peng_CV.yaml`; files in its `rendercv_output/` directory are generated artifacts.

## Build, Test, and Development Commands

- `docker compose up --detach`: install dependencies in the container and serve with live reload at `http://localhost:8080`.
- `docker compose logs -f jekyll`: follow the initial build and diagnose local failures.
- `docker compose down`: stop the development environment.
- `bundle exec jekyll build`: perform the same core static-site build used by CI; output goes to `_site/`.
- `npm ci && npx prettier . --check`: install pinned formatter dependencies and verify formatting.
- `npx prettier . --write`: format supported Markdown, YAML, Liquid, JavaScript, and style files.

To regenerate the CV, install `rendercv[full]`, then run `rendercv render assets/pdf/yaml_cv/Zedong_Peng_CV.yaml`.

## Coding Style & Naming Conventions

Let Prettier enforce layout; `.prettierrc` sets a 150-character print width, ES5 trailing commas, and the Shopify Liquid plugin. Preserve YAML front matter and use two-space indentation in YAML, Liquid, JavaScript, and SCSS where Prettier applies. Name posts `YYYY-MM-DD-kebab-case-title.md`. Use lowercase descriptive asset names and keep related images in purpose-specific subdirectories such as `assets/img/publication_preview/`.

## Testing Guidelines

There is no unit-test framework or coverage threshold. Before submitting, run Prettier and a clean Jekyll build. Preview affected pages at desktop and mobile widths; check navigation, images, bibliography links, and generated CV links. CI additionally performs deployment builds and link checks; accessibility checks are available through the Axe workflow.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Update profile image and fix blog post date`; optional conventional prefixes like `docs:` also appear. Keep each commit focused. Pull requests should explain the user-visible change, list validation performed, link the relevant issue for features or bugs, and include before/after screenshots for visual changes. Do not commit credentials or analytics tokens; configure public identifiers through `_config.yml` and repository secrets where appropriate.
