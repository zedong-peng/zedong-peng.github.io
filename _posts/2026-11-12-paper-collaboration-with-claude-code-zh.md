---
layout: post
title: "不靠 Overleaf：用 Claude Code 和 GitHub 合写论文"
date: 2026-11-12 20:30:00 +0800
lang: zh-CN
translation_key: paper-collaboration-with-claude-code
description: "论文的图、表和构建都放进一个 GitHub private repo，交给 Claude Code 干活。PDF 用 git 或带权限的网页分发，Overleaf 只在导师离不开时当入口。"
categories: life
hidden: true
related_posts: false
---

我写论文的活，现在大多交给 Claude Code：画图、算表格、编译、核对数字。这样写了一段时间，我很少再打开 Overleaf 的在线编辑器。我需要的是一个 Claude Code 能读写文件、能运行命令的地方，所以把论文放进了一个 GitHub private repo。

这篇文章讲这个仓库怎么搭，图和表格怎么做，PDF 怎么发给合作者，以及导师用 Overleaf 时怎么办。

文中的 Claude Code，模型都设置为 Opus 5.5 high 或 Fable 5.2 high。我的图是用这两个设置画的。换成弱一些的模型，图的质量通常会差一截，照着做之前先确认你用的是哪个模型。

## 适用范围

这套做法在图多、表格多、数字要反复核对的论文上最划算，前提是合作者愿意看 PDF 提意见。

有两种情况我仍然会用 Overleaf。一种是截稿前几个人要同时改同一段，在线编辑器的实时协作比 git 顺手。另一种是合作者不用 git，又要亲手改正文，这种情况的处理办法在后面"导师用 Overleaf"一节。

## 仓库结构

```
paper/
├── main.tex  refs.bib       正文
├── figs/     <name>.html    图的源文件，导出成 <name>.pdf
├── data/     *.csv *.json   实验结果
├── tables/   *.py           从 data/ 生成 LaTeX 表格
├── tools/    build.sh       导出图、编译 PDF
└── CLAUDE.md                给 Claude Code 的规则
```

`CLAUDE.md` 里只写 Claude Code 自己读代码读不出来的规则。我的几条大致是这样：

```markdown
- 每个数字都要有这次会话里读到的来源，并写明它是在什么条件下测的。
- 图按印刷尺寸画：通栏 506 pt，单栏 241 pt。
- 一种颜色只表示一个意思，全文的图共用一份样式表。
- 改动同步回 Overleaf 之前，先给我看。
```

## 图

图的源文件是一个 HTML 页面，由 Claude Code 来写。无头 Chrome 把它打印成 PDF，再裁掉白边：

```bash
chrome --headless --no-pdf-header-footer \
  --print-to-pdf="$PWD/figs/overview.pdf" "file://$PWD/figs/overview.html"
pdfcrop --margins 2 figs/overview.pdf figs/overview.pdf
pdffonts figs/overview.pdf   # 只允许嵌入论文用的字体，不能有 Type 3
```

以前我在 PowerPoint 或 draw.io 里手画。换成 HTML 以后，对齐、间距和配色都能写成规则，一张图调好的样式可以直接用到下一张。页面按版面的实际宽度画，嵌入和正文相同的字体，放进论文里字号通常不用再调。

改图靠口述。Claude Code 能自己打开页面看效果，我看到哪里不舒服就直接说，它改完重新导出，一轮几十秒。说得越具体，返工越少：

| 不要这样说 | 试试这样说 |
| --- | --- |
| 把图改好看点 | 字少些，图的结构和层次多些，让图说话 |
| 图例有点乱 | 图例放在最下面一行，每种颜色一个方块，所有图里用同样的名字 |
| 线太乱了 | 走线改成横平竖直，每条线从发出它的那个模块出发 |

画一张系统总览图时，我的顺序是先让 Claude Code 读代码，画出整体轮廓，然后一次只改一个部件，改之前让它重读这个部件的代码。这样图上画的是代码里真有的东西。

每一次修改都是一个 commit，画坏了可以退回去。最近一个项目里，我一天提交了二十多次，大部分是图的修改。

## 表格

表格背后是数据分析，所以数据放进仓库，表格由代码生成：

- `data/` 里放实验结果的 CSV 或 JSON，每个文件记下它来自哪次实验、在什么条件下测的。
- Claude Code 写脚本读这些数据，输出 LaTeX 表格。同一份数据也用来画图。
- 实验代码在另一个仓库或服务器上时，在 `CLAUDE.md` 里写清路径，Claude Code 可以直接过去读日志、核对数字。

实验重跑以后，重新生成一遍表格即可，不用手动改数字。

有一条规矩值得写进 `CLAUDE.md`：找不到来源的数字，让 Claude Code 标出来问人，不要让它猜。旧稿里常有这样的数字，谁也说不清是哪次实验跑出来的，越早找出来越好。

## PDF 的分发

编译出的 PDF 要让合作者看到。方式只有两种，二选一：

| 方式 | 谁能看 | 适合 |
| --- | --- | --- |
| PDF 提交进 git | 仓库协作者 | 合作者都有 GitHub 账号 |
| CI 编译后发到 Cloudflare Pages，前面挂 Cloudflare Access | 邮箱白名单里的人，收验证码登录 | 导师想点开链接就看，不想注册账号 |

第一种不用搭任何东西。第二种是把论文当成软件来发版：每次 push 由 CI 编译并发布，每一版有固定网址。Access 的免费额度是 50 人，一个课题组够用。

别的方式都不行。常被问到的有两种：

- **GitHub Pages**：private repo 开 Pages 需要付费版，而且页面本身是公开的。带访问控制的 Pages 只有 Enterprise Cloud 有。
- **一个难猜的公开链接**：只靠网址保密。链接被转发或被爬到就收不回来，未发表的稿子不该这样放。

第二种方式的 CI 大致是这样，Pages 项目要先建好：

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

`pages.dev` 在国内不稳定，最好绑自己的域名。绑了域名以后，原来的 `pages.dev` 地址也要一起放进 Access，否则从那个地址能绕过登录。

## 导师用 Overleaf

导师还在用 Overleaf 时，有两个办法。

### 办法一：导师切换工作流

学生值得花点力气，推荐导师一起用 git。这对导师也省事：

- **改动看得见**：每次修改都有 diff，不用在 Overleaf 的历史记录里翻是谁动了哪一段。`latexdiff` 还能生成一份标红的 PDF。
- **批注有地方放**：在 Pull Request 里对着具体的行写意见，改完一条关一条。
- **不用管 LaTeX 的细节**：导师也可以装 Claude Code，直接说"把第三节压到一页"，改动照样进 git。
- **不会互相覆盖**：各人在各自的分支上改，合并时有冲突会明确提示。

导师最少只需要一个 GitHub 账号，用来看 PDF 和在 Pull Request 里留言。其余的由学生和 Claude Code 来做。

### 办法二：Claude Code 用 cookie 同步

导师不换也不要紧。稿子留在 Overleaf 上，你指挥本地的 Claude Code 用 Overleaf 的登录 cookie 同步，你自己的活仍然全在 GitHub 里做。

overleaf.com 的付费版有官方的 Git 同步，有的话直接用它。学校自建的 Overleaf 如果是社区版，就没有这个功能，这时才用 cookie。从浏览器里取出登录后的会话 cookie，存在仓库外面，一条命令能把整个项目拉下来：

```bash
curl -sS -b "overleaf.sid=$(cat ~/.config/overleaf/sid)" -o draft.zip \
  "https://<学校的 Overleaf>/project/<项目 id>/download/zip"
unzip -oq draft.zip -d overleaf/
git add overleaf && git commit -m "Pull the draft"
```

自建实例的 cookie 一般叫 `overleaf.sid`。每次拉取单独提交，`git diff` 就能看到导师和合作者改了什么。

用 cookie 有三条规矩：

- cookie 等于你的登录态，只放在本机，不进仓库，不贴给任何第三方服务。
- 稿子是大家的。Claude Code 改的图和段落，你审过以后再同步回 Overleaf。
- cookie 会过期，拉取失败时重新从浏览器取一次。

## 起步

先挑一张图。让 Claude Code 用 HTML 把它重画一遍，放进一个 private repo。等这张图比原来的好，再把表格和编译搬进来。
