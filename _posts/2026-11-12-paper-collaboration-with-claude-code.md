---
layout: post
title: "Writing Papers with Claude Code and GitHub, without Overleaf"
date: 2026-11-12 20:31:00 +0800
lang: en
translation_key: paper-collaboration-with-claude-code
description: "A paper's figures, tables and build live in one private GitHub repo, and Claude Code does the work. The PDF goes out through git or an access-controlled page. Overleaf stays only as the door an advisor uses."
categories: life
related_posts: false
---

Most of the work on my papers now goes to Claude Code: drawing figures, computing tables, compiling, checking numbers. After writing this way for a while, I rarely open Overleaf's online editor. What I need is a place where Claude Code can read and write files and run commands, so the paper lives in a private GitHub repo.

This post covers how the repo is laid out, how the figures and tables are made, how the PDF reaches collaborators, and what to do when your advisor uses Overleaf.

Claude Code here always has its model set to Opus 5.5 high or Fable 5.2 high. Those are the settings that drew my figures. With a weaker model the figures usually come out noticeably worse, so check which model you are on before you copy this.

## When this fits

This pays off most on a paper with many figures and tables, where numbers get checked again and again, and where collaborators are happy to comment on a PDF.

I still use Overleaf in two cases. One is the night before a deadline, when several people edit the same paragraph at once and the live editor beats git. The other is a collaborator who does not use git and wants to edit the text by hand. The section "When your advisor uses Overleaf" below covers that one.

## Repo layout

```
paper/
├── main.tex  refs.bib       the text
├── figs/     <name>.html    figure sources, exported to <name>.pdf
├── data/     *.csv *.json   experiment results
├── tables/   *.py           LaTeX tables generated from data/
├── tools/    build.sh       exports figures, compiles the PDF
└── CLAUDE.md                rules for Claude Code
```

`CLAUDE.md` holds only the rules Claude Code could not work out by reading the code. Mine look roughly like this:

```markdown
- Every number has a source read in this session, with the conditions it was measured under.
- Figures are drawn at print size: 506 pt for full width, 241 pt for one column.
- One colour means one thing, and every figure shares one stylesheet.
- Show me a change before it is synced back to Overleaf.
```

## Figures

A figure's source is an HTML page that Claude Code writes. Headless Chrome prints it to PDF, and `pdfcrop` trims the margins:

```bash
chrome --headless --no-pdf-header-footer \
  --print-to-pdf="$PWD/figs/overview.pdf" "file://$PWD/figs/overview.html"
pdfcrop --margins 2 figs/overview.pdf figs/overview.pdf
pdffonts figs/overview.pdf   # only the paper's fonts may be embedded, and no Type 3
```

I used to draw by hand in PowerPoint or draw.io. In HTML, alignment, spacing and colour become rules, and the styles tuned for one figure carry over to the next. The page is drawn at the width it will have in print, with the same fonts as the body text, so the type size usually needs no further adjustment once the figure is in the paper.

Revisions happen by talking. Claude Code can open the page and look at the result itself. When something bothers me I say so, it edits and exports again, and a round takes well under a minute. The more specific the request, the less rework:

| Instead of | Try |
| --- | --- |
| make the figure look better | fewer words, more structure and hierarchy, let the figure do the talking |
| the legend is messy | put the legend on the bottom row, one square per colour, with the same names in every figure |
| the lines are a mess | route the lines at right angles, each one starting from the block that sends it |

For a system overview, I have Claude Code read the code first and draw the outline. Then it refines one component at a time, rereading that component's code before each pass. That way the figure shows things that are really in the code.

Every revision is a commit, so a bad one can be rolled back. On a recent project I made more than twenty commits in a day, most of them figure changes.

## Tables

A table is the output of data analysis, so the data goes in the repo and code generates the table:

- `data/` holds results as CSV or JSON. Each file records which experiment it came from and the conditions it was measured under.
- Claude Code writes a script that reads the data and prints a LaTeX table. The same data also feeds the figures.
- When the experiment code lives in another repo or on a server, write the path in `CLAUDE.md`. Claude Code can go there, read the logs and check the numbers.

After an experiment is rerun, regenerate the table. Nobody edits numbers by hand.

One rule is worth putting in `CLAUDE.md`: when a number has no source, Claude Code should flag it and ask, not guess. Old drafts often carry numbers that nobody can trace to a run, and it is better to find them early.

## Getting the PDF to people

Collaborators need to see the compiled PDF. There are only two ways to do it. Pick one:

| Route | Who can read it | Fits when |
| --- | --- | --- |
| Commit the PDF to git | Repo collaborators | Everyone has a GitHub account |
| CI builds it and deploys to Cloudflare Pages behind Cloudflare Access | People on an email allowlist, who sign in with a one-time code | Your advisor wants to click a link and not create an account |

The first needs no setup. The second treats the paper like software with releases: on every push, CI builds and publishes it, and each build has a stable address. Access is free for up to 50 users, which covers a research group.

Nothing else works. Two routes people often ask about:

- **GitHub Pages.** Pages on a private repo needs a paid plan, and the site itself is public. Access-controlled Pages exist only on Enterprise Cloud.
- **A public link that is hard to guess.** The address is the only protection. Once the link is forwarded or crawled you cannot take it back, and an unpublished draft should not sit there.

The CI for the second route looks roughly like this. Create the Pages project first:

{% raw %}
```yaml
name: paper
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: xu-cheng/latex-action@v3
        with:
          root_file: main.tex
      - run: mkdir site && cp main.pdf site/
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy site --project-name=paper
```
{% endraw %}

`pages.dev` is unreliable from mainland China, so bind your own domain. Once you do, put the original `pages.dev` address behind Access too. Otherwise that address skips the login.

## When your advisor uses Overleaf

When your advisor is still on Overleaf, there are two options.

### Option 1: the advisor switches workflow

It is worth a student's effort to bring their advisor onto git. The advisor gains from it too:

- **Changes are visible.** Every edit has a diff, so nobody digs through Overleaf's history to see who touched which paragraph. `latexdiff` can also produce a PDF with the changes marked.
- **Comments have a home.** Review happens on specific lines in a pull request, and each comment closes when it is addressed.
- **No LaTeX details to manage.** An advisor can install Claude Code too and say "cut Section 3 to one page". The change still lands in git.
- **No overwriting each other.** Everyone edits on their own branch, and a conflict is reported at merge time.

At minimum the advisor needs a GitHub account, to read the PDF and leave comments on a pull request. The student and Claude Code do the rest.

### Option 2: Claude Code syncs with a cookie

An advisor who stays on Overleaf is not a problem. The draft stays there, you direct your local Claude Code to sync it using your Overleaf session cookie, and your own work still happens in GitHub.

Paid plans on overleaf.com have an official Git sync. Use it if you have it. A university's self-hosted Overleaf on the Community Edition does not, and that is when the cookie comes in. Copy the session cookie from a logged-in browser, store it outside the repo, and one command downloads the whole project:

```bash
curl -sS -b "overleaf.sid=$(cat ~/.config/overleaf/sid)" -o draft.zip \
  "https://<your Overleaf>/project/<project id>/download/zip"
unzip -oq draft.zip -d overleaf/
git add overleaf && git commit -m "Pull the draft"
```

On a self-hosted instance the cookie is usually named `overleaf.sid`. Commit each pull on its own, and `git diff` shows what your advisor and collaborators changed.

Three rules for the cookie:

- The cookie is your login. Keep it on your machine, out of the repo, and away from any third-party service.
- The draft belongs to everyone. Review the figures and paragraphs Claude Code changed before they are synced back to Overleaf.
- The cookie expires. When a pull fails, copy a fresh one from the browser.

## Where to start

Pick one figure. Have Claude Code redraw it in HTML and put it in a private repo. Once that figure is better than the old one, move the tables and the build in.
