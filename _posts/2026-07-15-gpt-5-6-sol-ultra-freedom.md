---
layout: post
title: "我实现了 GPT-5.6-sol Ultra 自由"
date: 2026-07-15 19:20:00 +0800
lang: zh-CN
translation_key: gpt-5-6-sol-ultra-freedom
description: "为什么我坚持用最强的模型，以及我如何用一台小服务器和 Sub2API 搭出自己的 AI 中转站。"
tags: AI GPT-5.6-sol Codex Sub2API
categories: AI
hidden: true
related_posts: false
toc:
  beginning: true
---

## Why GPT-5.6-sol Ultra?

我一直贯穿一个理念：**要用就用最好的。**

我们用 AI 就是为了提高效率。如果你用的是一些次一点的模型，比如 DeepSeek，最后任务没有干成，其实还是降低了效率。既然用 AI 是为了省时间，那么强模型带来的成功率，往往比那一点价格差更重要。

这也是为什么我之前一直在用 Claude 的 Opus 之类的模型，而不是 GPT。但现在 GPT-5.6-sol 的表现也还可以，而且 Claude 确实更贵。我之前经常是几百元、几百元地往中转站里充值，所以后来就研究了一下，想自己实现这个自由。

现在我用 Codex 做任务，基本都是直接开 GPT-5.6-sol Ultra。

## How Free?

我首先在 [Vultr](https://www.vultr.com/) 上买了一台每月 5 美元的小服务器，然后用 GitHub 上开源的 [Sub2API](https://github.com/Wei-Shaw/sub2api) 做了一个中转站。

但 Sub2API 只是提供了一个形式，真正的 OpenAI 订阅号还得自己买。我在 Twitter 和 Telegram 上找到了一些非常低价的日抛订阅，有 Plus，也有 K12。现在流行的是 K12 订阅，前段时间则是 Team 订阅。

总之，就是几块钱的价格就能买到一个 Plus 订阅的额度。它可能很快就会被封号，但因为有 5 小时和 7 天的额度窗口，如果能把额度用满，那么价格就会非常低。低到什么程度呢？甚至可能比 DeepSeek 官方 API 的价格还低，但用的是 GPT-5.6-sol Ultra。

我觉得，在现在这个 AI 时代，作为一个学生，就必须掌握怎样快速、非常低价地使用 AI，让它帮助你快速出成果、出结果。

## 三层额度与自动切换

我现在在赵杰茹老师的实验室。赵老师还是非常前沿的，给实验室里每个人都配了一个外部第三方中转商的额度，每人每周 300 美元。

但我的用量比较大，这 300 美元有时候一两天就能跑完，甚至半天就用完了。实验室的额度用完以后，我就继续跑自己的中转站。但我自己的号有时候补充得不够及时，也会导致任务中断，所以我还配了一个保底的 [Right Code](https://www.right.codes/) API。Right Code 在我接触到的中转站里，算是规模最大、价格最低的一批，Opus 和 GPT 都有。

问题是，我本地只有一个工作窗口，它自己不知道应该什么时候换 API。所以我现在用 [CC Switch](https://github.com/farion1231/cc-switch) 做自动轮换，按照优先级调度：

1. 实验室的每周 300 美元额度
2. 我自己的 SYToken 中转站
3. 保底的 Right Code API

实验室的额度用完后，CC Switch 会自动把后台 API 切到我的中转站；我的中转站也不可用时，再切到 Right Code。

前段时间，还有人在反编译 Claude Code 后发现，它的脚本里有一份第三方 API 域名列表。里面出现了 Right Code、PackyCode 这样的大型中转站，也有 Moonshot、阿里云这样的大公司。这至少说明 Claude Code 会识别一些常见的非官方 API 地址；不过这份列表具体用来做什么，我没有进一步下结论。

现在我大概就是这么一个流程：先用实验室额度，再用自己的中转站，最后用 Right Code 保底。这样既能保证工作稳定不中断，同时也比较便宜。

## 从自用工具到中转站

后来我把这套系统做成了一个中转站，域名就是 [sytoken.com](https://sytoken.com/)，也在[校内论坛发过一篇帖子](https://shuiyuan.sjtu.edu.cn/t/topic/478920)。

当时大概开了一个月，用户有几百个，每天也有几百元，有时候几千元的流水。

但主要问题是我没有经营执照，这确实会有一些经营和法律风险。所以现在我已经不再对外运营了，主要就是我自己、两三个认识的人，还有我的室友们在用。

---

> 本人口述，GPT-5.6-sol 润色。
