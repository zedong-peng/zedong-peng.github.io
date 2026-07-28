---
layout: post
title: "我实现了 GPT-5.6-sol Ultra 自由"
date: 2026-07-15 19:20:00 +0800
lang: zh-CN
description: "为什么我坚持用最强的模型，以及我如何用一台小服务器和 Sub2API 搭出自己的 AI 中转站。"
categories: notes
hidden: true
related_posts: false
toc:
  beginning: true
---

## 为什么一定要用 GPT-5.6-sol Ultra

用 AI 就是为了提高效率。如果用的是一些次一点的模型，比如 DeepSeek，最后任务没有干成，其实还是降低了效率。既然用 AI 是为了省时间，那么强模型带来的成功率，往往比那一点价格差更重要。

这也是为什么我之前一直在用 Claude 的 Opus 之类的模型，而不是 GPT。但现在 GPT-5.6-sol 的表现也还可以，而且 Claude 确实更贵。我之前经常是几百几百地往中转站里充值，所以后来就研究了一下，想自己实现这个自由。

现在我用 Codex 做任务，基本都是直接开 GPT-5.6-sol Ultra。

## 我是怎么实现这个自由的

我先在 [Vultr](https://www.vultr.com/) 上买了一台每月 5 美元的小服务器，在 Cloudflare 上花 7 美元注册了域名 sytoken.org，然后用 GitHub 上开源的 [Sub2API](https://github.com/Wei-Shaw/sub2api) 搭了一个中转站 [水源token](https://sytoken.org/)。

但 Sub2API 只是提供了一个形式，真正的 OpenAI 订阅号还得自己买。我在 Twitter 和 Telegram 上找到了一些非常低价的日抛订阅，有 Plus，也有 K12。现在流行的是 K12 订阅，前段时间则是 Team 订阅。

总之，几块钱的价格就能买到一个 Plus 订阅的额度。它可能很快就会被封号，但因为有 5 小时和 7 天两个额度窗口，只要能把额度用满，摊下来的价格就会非常低。

低到什么程度？下面是我自己实测和整理的一组价格，都按 input 价格计：

<table>
  <thead>
    <tr>
      <th class="text-center">模型</th>
      <th>来源</th>
      <th>input 价格</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4" class="text-center align-middle">GPT-5.6-sol</td>
      <td>OpenAI 官方 API（api.openai.com）</td>
      <td>¥33.7/M tokens</td>
    </tr>
    <tr>
      <td>OpenAI Pro 20x 官方订阅</td>
      <td>¥1/M tokens <sup>*</sup></td>
    </tr>
    <tr>
      <td>中转站 <a href="https://www.rightapi.ai/" target="_blank">rightapi.ai</a></td>
      <td>¥2/M tokens</td>
    </tr>
    <tr>
      <td>sytoken.org（我自建）</td>
      <td>约 ¥0.5/M tokens</td>
    </tr>
    <tr>
      <td rowspan="4" class="text-center align-middle">Opus 5</td>
      <td>Anthropic 官方 API（api.anthropic.com）</td>
      <td>¥33.7/M tokens</td>
    </tr>
    <tr>
      <td>Anthropic Max 20x 官方订阅</td>
      <td>¥1/M tokens <sup>*</sup></td>
    </tr>
    <tr>
      <td>中转站 <a href="https://www.rightapi.ai/" target="_blank">rightapi.ai</a></td>
      <td>¥7.5/M tokens</td>
    </tr>
    <tr>
      <td>中转站 <a href="https://4router.net/" target="_blank">4Router</a> cheapCCApi 渠道</td>
      <td>¥4.5/M tokens</td>
    </tr>
    <tr>
      <td class="text-center align-middle">DeepSeek-V4-Pro</td>
      <td>deepseek.com 官方 API</td>
      <td>¥3/M tokens</td>
    </tr>
  </tbody>
</table>

两点说明：

- <sup>*</sup>官方订阅那两行是按额度用满折算的。Pro 20x 每月 200 美元，月额度约合 7312 美元，数据来自 [Codex 额度雷达](https://codexradar.com)；Max 20x 每月 200 美元，月额度约合 6468 美元，数据来自 [Claude 额度雷达](https://claudecoderadar.com)。
- Claude 还有 awsq 之类的低价渠道，是把 Kiro 的 Claude 模型反代出来用。确实是 Opus 5，但会带上 Kiro 的 system prompt，质量下降多少不好说。这类渠道过不了 [Hvoy AI](https://www.hvoy.ai/) 的原生测试，表里其他渠道都能过。

可以看出，国外的顶级大模型只要走订阅，其实没那么贵。再结合性能来看，自己建站用GPT-5.6-sol是最便宜的一档：

{% include figure.liquid path="assets/img/blog/artificial-analysis-coding-agent-index-cost-per-task-2026-07-27.png" class="img-fluid rounded z-depth-1" zoomable=true %}

_Artificial Analysis Coding Agent Index 与单任务成本，截图于 2026 年 7 月 27 日。_

## 稳定性怎么保证

我现在在赵杰茹老师的实验室。赵老师还是非常前沿的，给实验室里每个人都配了一个外部第三方中转商的额度，每人每周 50 元。

我的用量比较大，这 50 元有时候一两天就能跑完，问题是，我本地只有一个工作窗口，它自己不知道应该什么时候换到我的中转站，只会返回503然后停止工作。所以我在 [CC Switch](https://github.com/farion1231/cc-switch) 里打开了「设置 - 路由 - 自动故障转移」，实验室的额度用完后，CC Switch 会自动把后台 API 切到我的中转站；我的中转站也不可用时，再切到 Right Code。同时我还在闲鱼上淘到了400¥一年的cursor pro，能用opus 5,fable 5,gpt5.6，所以平常就不用vscode了，开个cursor，下侧终端跑codex cli， 右侧cursor用opus问问题和plan。

前段时间，还有人在反编译 Claude Code 后发现，它的脚本里有一份第三方 API 域名列表。里面出现了 Right Code、PackyCode 这样的大型中转站，也有 Moonshot、阿里云这样的大公司。这至少说明 Claude Code 会识别一些常见的非官方 API 地址；算是皇军认证中转站了。不过这份列表具体用来做什么，没有进一步研究。

## 从自用工具到中转站

后来我把[水源token](https://sytoken.org/)做成了一个对外的中转站，也在校内论坛发过一篇[帖子](https://shuiyuan.sjtu.edu.cn/t/topic/478920)宣传，一个月下来用户有几百个，每天有几百元流水。

但主要问题是我没有经营执照，这确实会有一些经营和法律风险。所以现在我已经不再对外运营了，主要就是我自己、两三个认识的人，还有我的室友们在用。
