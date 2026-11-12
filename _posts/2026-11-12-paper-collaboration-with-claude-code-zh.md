---
layout: post
title: "不靠 Overleaf：用 Claude Code 和 GitHub 合写论文"
date: 2026-11-12 20:30:00 +0800
lang: zh-CN
description: "论文的图、表和构建都放进一个 GitHub private repo，交给 Claude Code 干活。PDF 用 git 或带权限的网页分发，Overleaf 只在导师离不开时当入口。"
categories: life
related_posts: false
---

这篇讲我现在怎么和别人合写论文。做法是：论文的图、表格和构建全部放在一个 GitHub private repo 里，活交给 Claude Code 干；编出来的 PDF 用 git 或一个带权限的网页分发；Overleaf 只在导师离不开它的时候留作入口。

文中的 Claude Code 指的都是里面跑 Opus 5.5 或 Fable 5.2。我画图用的就是这两个模型。换成弱一些的模型，图的质量会差很多，照着做之前先确认模型。

## 仓库结构

```
paper/
├── main.tex  refs.bib       正文
├── figs/     <name>.html    图的源文件，导出成 <name>.pdf
├── data/     *.csv *.json   实验结果
├── tables/   *.py           从 data/ 生成 LaTeX 表格
├── tools/    build.sh       导出图、编译 PDF
└── CLAUDE.md                给 Claude Code 的规则：数字从哪来、图怎么画
```

仓库保持 private。未发表的稿子、合作者的实验数据都在里面，投双盲会议时尤其不能漏出去。

## 图：HTML 画，打印成 PDF

图的源文件是一个 HTML 页面，由 Claude Code 写，用无头 Chrome 打印成 PDF，再裁掉白边：

```bash
chrome --headless --no-pdf-header-footer \
  --print-to-pdf="$PWD/figs/overview.pdf" "file://$PWD/figs/overview.html"
pdfcrop --margins 2 figs/overview.pdf figs/overview.pdf
pdffonts figs/overview.pdf   # 确认没有 Type 3 字体，也没有混进系统字体
```

比起自己在 PowerPoint 或 draw.io 里手搓，这样画有三个好处：

- **好看**：HTML 和 CSS 的排版能力比绘图软件强，对齐、间距、配色都能写成规则，全文的图用同一份样式表。
- **改得快**：Claude Code 能自己打开页面看效果。我看到哪里不舒服，直接口述，比如"这一排的字太挤""箭头别交叉"，它改完重新导出，一轮几十秒。
- **和正文一致**：按版面的实际宽度画（acmart 的单栏是 241 pt），嵌入和正文相同的字体，放进论文里字号不会忽大忽小。

图的每一次修改都是一个 commit，画坏了可以退回去。

## 表格：数据和代码放一起

表格背后是数据分析，所以数据放进仓库，表格由代码生成：

- `data/` 里放实验结果的 CSV 或 JSON，每个文件记下它来自哪次实验、哪个路径。
- Claude Code 写脚本读这些数据，输出 LaTeX 表格，同一份数据也用来画图。
- 实验代码在另一个仓库或服务器上时，在 `CLAUDE.md` 里写清路径，Claude Code 可以直接过去读日志、核对数字。

这样表里的每个数字都能追到来源。实验重跑以后，重新生成一遍表格即可，不用手动改数字。

## PDF 的分发

编译出的 PDF 要让合作者看到。按人数和习惯，有这几条路：

| 方式 | 谁能看 | 适合 |
| --- | --- | --- |
| PDF 提交进 git，或挂在 Release、Actions 产物里 | 仓库协作者 | 合作者都有 GitHub 账号 |
| CI 编译后发到 Cloudflare Pages，前面挂 Cloudflare Access | 邮箱白名单里的人，收验证码登录 | 导师想点开链接就看，不想注册账号 |
| 拷到组里的服务器，或用 Tailscale 在内网分享 | 能登服务器或在同一个 tailnet 里的人 | 组里本来就共用服务器 |

我推荐前两条。第一条不用搭任何东西；第二条给每一版一个固定网址，Access 的免费额度是 50 人，一个课题组够用。

没选的几条路和原因：

- **GitHub Pages**：private repo 开 Pages 需要付费版，而且页面本身是公开的。带访问控制的 Pages 只有 Enterprise Cloud 有。
- **一个难猜的公开链接**：只靠网址保密。链接被转发或被爬到就收不回来，未发表的稿子不该这样放。
- **claude.ai 的 Artifact**：适合自己随手看一版，但 CI 没法自动往上发，在国内还要代理。

第二条路的 CI 大致是这样（Pages 项目要先建好）：

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

两点要注意。`pages.dev` 在国内不稳定，最好绑自己的域名。绑了域名以后，原来的 `pages.dev` 地址也要一起放进 Access，否则从那个地址能绕过登录。

## 导师只用 Overleaf 的情况

导师只会用 Overleaf 也不要紧。稿子留在 Overleaf 上，Claude Code 用登录后的 cookie 把它接进仓库，你自己的活仍然全在 GitHub 里做。

overleaf.com 的付费版有官方的 Git 同步，有的话直接用它。学校自建的 Overleaf 如果是社区版，就没有这个功能，这时才用 cookie：从浏览器里取出登录后的会话 cookie，存在仓库外面，一条命令把整个项目拉下来。

```bash
curl -sS -b "overleaf.sid=$(cat ~/.config/overleaf/sid)" -o draft.zip \
  "https://<学校的 Overleaf>/project/<项目 id>/download/zip"
unzip -oq draft.zip -d overleaf/
git add overleaf && git commit -m "Pull the draft"
```

自建实例的 cookie 一般叫 `overleaf.sid`。每次拉取单独提交，`git diff` 就能看到导师和合作者改了什么。

三条规矩：

- cookie 等于你的登录态，只放在本机，不进仓库，不贴给任何第三方服务。
- 稿子是大家的。我的做法是只读：Claude Code 只往下拉，图和段落在仓库里改好、我审过，再手动放回 Overleaf。
- cookie 会过期，拉取失败时重新从浏览器取一次。

## 劝导师也用 git

学生值得花点力气，推荐导师一起用 git，因为对导师也更省事：

- **改动看得见**：每次修改都有 diff，不用在 Overleaf 的历史记录里翻是谁动了哪一段；`latexdiff` 还能生成一份标红的 PDF。
- **批注有地方放**：在 Pull Request 里对着具体的行写意见，改完一条关一条。
- **不用学 LaTeX 的细节**：导师也可以装 Claude Code，直接说"把第三节压到一页""这张图的配色换一下"，改动照样进 git。
- **不会互相覆盖**：各人在各自的分支上改，合并时有冲突会明确提示。

导师最少只需要一个 GitHub 账号：看 PDF，在 Pull Request 里留言。其余的由学生和 Claude Code 来做。
