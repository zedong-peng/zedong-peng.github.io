---
layout: post
title: "把海外家里的笔记本分给朋友用 Claude Code"
date: 2026-10-18 12:00:00 +0800
lang: zh-CN
description: "海外家里的一台笔记本，环境干净。用 Tailscale 和 T3 Code 分给身边的朋友，手机、电脑、网页都能用 Claude Code。"
categories: notes
related_posts: false
---

海外家里有一台笔记本，环境干净，我用它跑 Claude Code。身边的朋友有需要，我就分给他们用，用不用他们自己定。这台机器硬盘只剩十几个 G，所以它只当入口，重活都交给各人自己的服务器。

## 1. 共享这台机器

给朋友建一个没有 sudo 的普通账号，把自己的家目录锁死：

```bash
sudo adduser friend
chmod 700 /home/me
```

然后在 Tailscale 控制台对这台机器点 Share，把链接发给朋友。对方接受后只能看到这一台机器，看不到你的其他设备。

## 2. 用 T3 Code 当界面

T3 Code 可以同时接入 Claude Code、OpenCode 和 Codex 的订阅，在同一个界面里切换。它和 Claude Code 都跑在海外机器上。朋友开着 Tailscale，手机或电脑浏览器打开 T3 Code 就能用，不需要梯子。两端的会话是同步的，在电脑上开的任务，路上用手机接着看、接着批。

配置好之后，手机、电脑或网页端直接启动 T3 Code 就行。

## 3. 重活回到自己的机器

朋友在海外机器上跑一个用户态 Tailscale，不用 root，状态都放在自己的家目录里：

```bash
tailscaled --tun=userspace-networking \
  --state=$HOME/.tailscale/state --socket=$HOME/.tailscale/sock &
tailscale --socket=$HOME/.tailscale/sock up
```

配好 SSH 密钥后，Claude 直接 ssh 回朋友自己的服务器，代码、数据、训练都留在那边。海外机器只占几百 MB。

```
手机 / 电脑 ──Tailscale──▶ 海外机器（T3 Code + Claude） ──用户态 Tailscale + SSH──▶ 各自的服务器
```

## FAQ

**为什么要单独起一个用户级的 Tailscale？**

因为 Claude 还得能连到生产机器上做实验，比如 4090、A100、FPGA。海外机器自带的那个 Tailscale 是宿主的，只负责把这台机器共享出来；朋友自己的机器都在他们自己的 tailnet 里，要连回去，就得有一个属于他们自己的 Tailscale 身份。用户态模式不需要 root，每人一个，互不影响。

**为什么用 T3 Code，而不是直接 ssh 进去开终端？**

多端，加上多个订阅。我自己就有好几个订阅，用量见 [AI 使用实况](https://sytoken.org/ai-board/)。T3 Code 把它们放进同一个界面，会话在手机和电脑之间同步，ssh 做不到这些，在手机上敲终端也很难受。

**第 1 步分享出来的节点，之后还有用吗？**

用户态 Tailscale 配好以后，朋友就有了自己的入口。分享的节点只用来第一次上机配置，之后留作备份登录：用户态 Tailscale 或 T3 出问题时，还能从这里 ssh 进去修。

**海外机器的硬盘撑得住吗？**

撑得住。这台机器上只有 T3 Code、Claude Code 和会话记录，几百 MB。仓库、数据和编译产物都留在各人自己的服务器上。

**朋友之间会互相看到吗？**

不会。每人一个普通账号，没有 sudo，每个人的家目录都是 700。
