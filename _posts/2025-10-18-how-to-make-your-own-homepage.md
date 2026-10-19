---
layout: post
title: "How to Make Your Own Homepage"
date: 2025-10-18 12:00:00 +0800
lang: en
description: "A domain from Cloudflare, the al-folio template and free hosting on GitHub Pages: how this site is put together, step by step."
categories: life
related_posts: false
agent_prompt: |
  Read https://zedongpeng.com/blog/2025/how-to-make-your-own-homepage/ and build me a personal homepage with a blog the same way: the al-folio template, hosted on GitHub Pages, on my own domain. Ask me for what only I can give you: my name, photo, papers, CV and the domain I want. For steps that need my GitHub or Cloudflare account, tell me exactly what to click. Do the rest yourself, and show me the site running locally before we publish it.
---

This site is the kind of homepage many researchers keep: an about page, a list of papers, a CV and a blog. It costs me about ten dollars a year, and all of that is the domain name. The template and the hosting are free. This post walks through how it is put together, using this site as the example, so you can build your own. If you use an AI coding agent, give it the prompt above; the rest of this post is the same walk-through, for people.

There are three parts:

- **Template:** [al-folio](https://github.com/alshedivat/al-folio), a free [Jekyll](https://jekyllrb.com) theme made for academics. Jekyll turns a folder of plain text files into a website.
- **Hosting:** [GitHub Pages](https://pages.github.com), which serves the built site for free.
- **Domain:** zedongpeng.com, bought on [Cloudflare](https://www.cloudflare.com/products/registrar/).

<figure class="homepage-flow" role="img" aria-label="Publishing: your files on the main branch are pushed, GitHub Actions builds them with Jekyll into the gh-pages branch, and GitHub Pages serves it. Visiting: the browser asks Cloudflare DNS for the address, then fetches the page from GitHub Pages."><svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg"><style>
.homepage-flow svg { width: 100%; height: auto; display: block; color: var(--global-text-color); font-family: inherit; }
.homepage-flow .box { fill: var(--global-bg-color); stroke: currentColor; stroke-opacity: 0.45; stroke-width: 1.5; }
.homepage-flow .host { fill: var(--global-theme-color); }
.homepage-flow .name { fill: currentColor; font-size: 16px; font-weight: 600; text-anchor: middle; }
.homepage-flow .sub { fill: currentColor; fill-opacity: 0.7; font-size: 13px; text-anchor: middle; }
.homepage-flow .on-host { fill: #fff; fill-opacity: 1; }
.homepage-flow .row { fill: currentColor; fill-opacity: 0.55; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
.homepage-flow .edge { stroke: currentColor; stroke-opacity: 0.6; stroke-width: 1.5; fill: none; }
.homepage-flow .head { fill: currentColor; fill-opacity: 0.6; }
.homepage-flow .lbl { fill: currentColor; fill-opacity: 0.7; font-size: 12.5px; text-anchor: middle; }
.homepage-flow .step { fill: var(--global-theme-color); }
.homepage-flow .step-n { fill: #fff; font-size: 11px; font-weight: 700; text-anchor: middle; }
</style>
<text class="row" x="10" y="26">publish</text>
<rect class="box" x="10" y="40" width="150" height="64" rx="8"/>
<text class="name" x="85" y="67">your files</text>
<text class="sub" x="85" y="88">main branch</text>
<rect class="box" x="210" y="40" width="150" height="64" rx="8"/>
<text class="name" x="285" y="67">GitHub Actions</text>
<text class="sub" x="285" y="88">Jekyll build</text>
<rect class="box" x="410" y="40" width="130" height="64" rx="8"/>
<text class="name" x="475" y="67">gh-pages</text>
<text class="sub" x="475" y="88">built site</text>
<rect class="host" x="590" y="40" width="120" height="250" rx="8"/>
<text class="name on-host" x="650" y="160">GitHub</text>
<text class="name on-host" x="650" y="180">Pages</text>
<path class="edge" d="M160 72 H202"/><path class="head" d="M210 72 l-8 -4.5 v9 z"/>
<text class="lbl" x="185" y="64">push</text>
<path class="edge" d="M360 72 H402"/><path class="head" d="M410 72 l-8 -4.5 v9 z"/>
<path class="edge" d="M540 72 H582"/><path class="head" d="M590 72 l-8 -4.5 v9 z"/>
<text class="row" x="10" y="146">visit</text>
<rect class="box" x="10" y="160" width="150" height="130" rx="8"/>
<text class="name" x="85" y="220">browser</text>
<text class="sub" x="85" y="241">zedongpeng.com</text>
<rect class="box" x="290" y="160" width="160" height="56" rx="8"/>
<text class="name" x="370" y="184">Cloudflare</text>
<text class="sub" x="370" y="204">DNS</text>
<path class="edge" d="M168 188 H282"/><path class="head" d="M290 188 l-8 -4.5 v9 z"/><path class="head" d="M160 188 l8 -4.5 v9 z"/>
<circle class="step" cx="186" cy="174" r="9"/><text class="step-n" x="186" y="178">1</text>
<text class="lbl" x="236" y="178">address?</text>
<path class="edge" d="M160 262 H582"/><path class="head" d="M590 262 l-8 -4.5 v9 z"/>
<circle class="step" cx="186" cy="248" r="9"/><text class="step-n" x="186" y="252">2</text>
<text class="lbl" x="236" y="252">the page</text>
</svg>
<figcaption class="caption">Top: publishing. Pushing to the main branch starts a build on GitHub's servers, which writes the finished site to the gh-pages branch, and GitHub Pages serves it. Bottom: visiting. The browser asks Cloudflare where zedongpeng.com lives (1), gets GitHub's address, and fetches the page from GitHub Pages (2). Cloudflare only answers the lookup; the pages never pass through it.</figcaption>
</figure>

## Start from the template

al-folio's own [install guide](https://github.com/alshedivat/al-folio/blob/main/INSTALL.md) is good. The short version:

1. On the al-folio GitHub page, click **Use this template → Create a new repository**. Name it `<your-username>.github.io`. Mine is `zedong-peng.github.io`.
2. In the new repository, go to **Settings → Actions → General → Workflow permissions** and choose **Read and write permissions**. The build needs this to save the finished site back to the repository.
3. In `_config.yml`, set `url: https://<your-username>.github.io` for now, and leave the `baseurl:` line empty. Don't delete it.
4. Open the **Actions** tab and wait a few minutes for the job called **Deploy site** to finish. It creates a new branch, `gh-pages`, that holds the built site.
5. Go to **Settings → Pages → Build and deployment**. Set the source to **Deploy from a branch**, and choose `gh-pages`, not `main`.

A minute later, `https://<your-username>.github.io` shows a copy of the al-folio demo. Everything after this is swapping the demo content for your own.

## Make it yours

al-folio keeps the content apart from the layout. You edit a handful of text files, and the template turns them into pages:

| File                       | What it holds                                                |
| -------------------------- | ------------------------------------------------------------ |
| `_config.yml`              | Site title, your name, the site address, time zone, features |
| `_pages/about.md`          | The front page: the text under your name                     |
| `assets/img/`              | Your photo and other images                                  |
| `_data/socials.yml`        | The icons at the bottom: email, GitHub, Google Scholar       |
| `_bibliography/papers.bib` | Your papers, as BibTeX                                       |
| `_data/cv.yml`             | The CV page                                                  |
| `_posts/`                  | Blog posts, one Markdown file each                           |
| `_sass/_themes.scss`       | Colors                                                       |

What I changed on this site:

- **Fewer pages.** The demo comes with projects, repositories, teaching and more. I kept four: about, posts, publications and CV. To hide a page, set `nav: false` at the top of its file in `_pages/`.
- **Color.** One line in `_sass/_themes.scss`, `--global-theme-color`, turns the links and accents from the default cyan to purple. It appears once for the light theme and once for the dark.
- **Papers.** Each paper is a BibTeX entry, the format reference managers export. Extra fields become buttons and badges: `pdf=` and `arxiv=` add links under the entry, and `abbr=` puts the venue in a small box beside it.
- **CV.** The CV page is built from `_data/cv.yml`. For a PDF version I use [RenderCV](https://github.com/rendercv/rendercv), which turns a YAML file into a typeset PDF, and link it at the top of the CV page.

A blog post is a Markdown file in `_posts/` whose name starts with the date, like `2025-10-18-how-to-make-your-own-homepage.md`. It begins with a short header:

```yaml
---
layout: post
title: "How to Make Your Own Homepage"
date: 2025-10-18 12:00:00 +0800
description: "A domain from Cloudflare, the al-folio template and free hosting on GitHub Pages."
---
```

The text goes below it, and the post appears at `/blog/2025/how-to-make-your-own-homepage/`.

## Publish with a push

Publishing is just pushing to `main`. A workflow that ships with the template, `.github/workflows/deploy.yml`, runs on every push: it builds the site with Jekyll, trims unused styles, and writes the result to `gh-pages`. GitHub Pages serves whatever is on `gh-pages`. That is the top row of the figure, and it takes a few minutes end to end. The **Actions** tab shows where it is.

## Connect your own domain

I bought zedongpeng.com on Cloudflare. Its registrar charges what the registry charges, with no markup, and renewals cost the same as the first year. A `.com` is about ten dollars a year.

Because the domain is on Cloudflare, Cloudflare also runs its DNS, the public directory that tells browsers which server a name belongs to. In the Cloudflare dashboard, under **DNS → Records**, add:

| Type  | Name  | Content                     | Proxy status |
| ----- | ----- | --------------------------- | ------------ |
| A     | `@`   | `185.199.108.153`           | DNS only     |
| A     | `@`   | `185.199.109.153`           | DNS only     |
| A     | `@`   | `185.199.110.153`           | DNS only     |
| A     | `@`   | `185.199.111.153`           | DNS only     |
| CNAME | `www` | `<your-username>.github.io` | DNS only     |

`@` means the bare domain. The four addresses are GitHub Pages' servers, as listed in [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Set every record to **DNS only** (the gray cloud). With the orange cloud, Cloudflare stands between visitors and GitHub, GitHub can't see that the domain points at it, and it won't issue the certificate HTTPS needs.

Then, on GitHub:

1. **Settings → Pages → Custom domain**: enter your domain and save. GitHub checks the DNS records and requests a free certificate, which can take a while.
2. Once it's ready, tick **Enforce HTTPS**.
3. In `_config.yml`, change `url` to your domain, for example `url: https://zedongpeng.com`, and keep `baseurl:` empty.

`www.zedongpeng.com` now redirects to `zedongpeng.com`. Saving the custom domain also writes a small file named `CNAME` into `gh-pages`. Mine has survived every deploy so far, but if your custom domain goes blank after a deploy, al-folio's FAQ says to add the same file to `main`.

Check the spelling in step 3 letter by letter. A typo there breaks nothing you can see, because links between pages are relative, so the site works. But the template uses `url` for the addresses that only machines read: the canonical link in each page's header, which tells search engines a page's real address, the sitemap and the RSS feed. With a typo, all of them point at a domain you don't own. After changing `url`, open your live site's page source and search for "canonical".

## Preview before you push

You don't have to push to see a change. With [Docker](https://www.docker.com) installed, run this in the repository:

```bash
docker compose up
```

Then open `http://localhost:8080`. The page reloads as you edit.

Two things caught me out:

- **Posts dated in the future don't appear.** Jekyll compares the date with the moment the build runs, so a post dated this evening and pushed this afternoon stays missing until the date is moved back. Give each date a time and an offset, and set `timezone:` in `_config.yml`.
- **A red cross on a commit is usually the formatting check.** The template runs [Prettier](https://prettier.io), a code formatter, on every push and fails if a file isn't formatted its way. The site still deploys, but it's worth fixing.

## Keep a note for your agent

If an agent builds your site, ask it to leave a `CLAUDE.md` (or `AGENTS.md`) file in the repository: a short note on where things live and how to publish. The next time you want a change, the agent reads the note instead of working out the layout again.

The source for this site is [public on GitHub](https://github.com/zedong-peng/zedong-peng.github.io), if you want to see any of the files above.
