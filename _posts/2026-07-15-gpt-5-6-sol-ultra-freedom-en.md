---
layout: post
title: "How I Achieved GPT-5.6-sol Ultra Freedom"
date: 2026-07-15 19:21:00 +0800
lang: en
translation_key: gpt-5-6-sol-ultra-freedom
description: "Why I insist on using the strongest models, and how I built my own AI relay with a small server and Sub2API."
tags: AI GPT-5.6-sol Codex Sub2API
categories: AI
related_posts: false
toc:
  beginning: true
---

## Why GPT-5.6-sol Ultra?

I have always followed one principle: **if I am going to use something, I use the best.**

We use AI to improve efficiency. If you use a weaker model, such as DeepSeek, and it ultimately fails to complete the task, your efficiency actually goes down. Since the point of using AI is to save time, the higher success rate of a strong model is often more important than the small difference in price.

That is why I previously kept using models such as Claude Opus instead of GPT. Now, however, GPT-5.6-sol also performs reasonably well, while Claude is indeed more expensive. I used to add hundreds of yuan at a time to third-party relay services, so I eventually looked into whether I could build my own setup and achieve GPT-5.6-sol Ultra freedom for myself.

These days, when I use Codex for a task, I generally turn on GPT-5.6-sol Ultra directly.

## How I Achieved This Freedom

I first bought a small $5-per-month server from [Vultr](https://www.vultr.com/), then used the open-source [Sub2API](https://github.com/Wei-Shaw/sub2api) project on GitHub to build an API relay.

Sub2API only provides the infrastructure, however. I still had to obtain the actual OpenAI subscription accounts myself. On Twitter and Telegram, I found some extremely inexpensive disposable subscriptions, including Plus and K12 accounts. K12 subscriptions are common now; Team subscriptions were more common a while ago.

In short, you can buy the quota of a Plus subscription for only a few yuan. The account may be banned quickly, but because the quota is allocated in five-hour and seven-day windows, the effective price can be very low if you fully use those limits. How low? It may even cost less than the official DeepSeek API while still giving you GPT-5.6-sol Ultra.

I believe that, in the current AI era, students need to know how to access AI quickly and at very low cost so that it can help them produce results faster.

## Three Tiers of Quota and Automatic Failover

I am currently in Professor Jieru Zhao's lab. Professor Zhao is very forward-looking and provides everyone in the lab with quota from an external third-party relay service: $300 per person each week.

My usage is relatively high, though. I sometimes consume the entire $300 in one or two days, or even half a day. After the lab quota runs out, I continue through my own relay. Sometimes I do not replenish my own accounts quickly enough, which can interrupt a task, so I also configured the [Right Code](https://www.right.codes/) API as a fallback. Among the relay services I have encountered, Right Code is one of the largest and least expensive, and it offers both Opus and GPT models.

The problem is that I only have one local work session, and it does not know when it should switch APIs. I now use [CC Switch](https://github.com/farion1231/cc-switch) for automatic rotation, with providers scheduled in this priority order:

1. The lab's $300 weekly quota
2. My own SYToken relay
3. The Right Code API as a fallback

When the lab quota runs out, CC Switch automatically changes the backend API to my relay. If my relay is also unavailable, it switches to Right Code.

Some time ago, people reverse-engineering Claude Code found a list of third-party API domains in its scripts. The list included large relay services such as Right Code and PackyCode, as well as major companies such as Moonshot and Alibaba Cloud. This at least suggests that Claude Code recognizes some common unofficial API addresses, although I did not draw any further conclusions about what the list is used for.

My workflow now looks roughly like this: I use the lab quota first, then my own relay, and finally Right Code as the fallback. This keeps my work stable and uninterrupted while also keeping the cost relatively low.

## From a Personal Tool to an API Relay Service

I later turned this system into an API relay service at [sytoken.com](https://sytoken.com/) and also [published a post about it on the university forum](https://shuiyuan.sjtu.edu.cn/t/topic/478920).

It operated for about a month. There were several hundred users, with daily transaction volume of several hundred yuan and sometimes several thousand yuan.

The main problem was that I did not have a business license, which created genuine operational and legal risks. I have therefore stopped operating it publicly. It is now used mainly by me, two or three people I know, and my roommates.

---

> Dictated by the author and polished by GPT-5.6-sol.
>
> Translated from the Chinese version by GPT-5.6-sol.
