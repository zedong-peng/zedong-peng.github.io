---
layout: post
title: "Make Sand Think"
date: 2026-07-23 22:17:00 +0800
lang: en
description: "A riddle, and an honest answer: how a handful of sand becomes a machine that talks."
categories: life
related_posts: false
---

> “We’ve essentially found a way to make sand think. It’s miraculous.”
>
> — [Demis Hassabis](https://www.axios.com/2026/07/14/demis-hassabis-ai-regulation-google-deepmind), co-founder and CEO of Google DeepMind

Long afterward, in the desert beyond Thebes, the Sphinx awoke once more.

It gazed across the endless yellow sands and posed a new riddle to humanity:

“Once, I asked: what walks on four legs in the morning, two at noon, and three in the evening?”

“Now I ask you:”

“How can the sand of the desert be made to think like a human?”

Many sages came before it.

One said: “Give the sand a soul.”

Another said: “Wait a billion years for evolution.”

A third said: “Write down every rule of reasoning, and let the sand follow them.”

The Sphinx shook its head at them all. The first had no method, the second had no patience, and the third had tried for forty years and found that no one can write down what a human knows.

Then an engineer approached.

She picked up a handful of sand and said:

“Sand cannot think. But sand is mostly silicon dioxide, and our task is not to create life — only to arrange matter until it can carry information.”

She put the sand into a furnace.

$$
\mathrm{SiO_2 + 2C \rightarrow Si + 2CO}
$$

What came out was 99% pure, and 99% was useless. Electronics demand eleven nines — roughly one foreign atom per hundred billion — because the whole trick is to write impurities back in afterwards, deliberately, exactly where you want them. The crystal was sliced into wafers, patterned with light of 13.5 nanometres, etched, and implanted with ions, until each pattern had made one thing: a switch.

A transistor is a channel of silicon with a gate above it. Put a voltage on the gate and the channel conducts; take it away and it blocks. Current controls current, with no moving parts, in about a picosecond.

$$
\text{Sand} \rightarrow \text{Silicon} \rightarrow \text{Transistor} \rightarrow \text{Chip}
$$

More than a hundred billion of them now fit on a chip the size of a thumbnail — more switches on one piece of sand than there are neurons in a human head.

The Sphinx said:

“A switch only opens and closes. Where is the thought in that?”

“There is none. But a switch that controls another switch can decide.”

Two transistors in series conduct only if both gates are on: that is AND. Wired otherwise, they give OR, and NOT. From those three come adders, multipliers, and finally the only operation that matters here:

$$
c_{ij} = \sum_k a_{ik} b_{kj}
$$

Every layer of every neural network is that sum, repeated. And no term in it waits for another — so instead of one fast processor, humanity built chips with tens of thousands of small arithmetic units running at once, on the order of $$10^{15}$$ multiply-accumulates per second each, wired by the tens of thousands into a single machine. A frontier model costs some $$10^{25}$$ of those operations to train.

“So you have built a very fast abacus,” said the Sphinx. “An abacus does not understand the price of grain.”

“No. So first we had to make meaning into a number.”

Text is cut into tokens, and each token is looked up in a table and becomes a vector of a few thousand numbers:

$$
t_i \rightarrow e_i \in \mathbb{R}^{d}
$$

This is the move on which everything rests. A symbol is either equal to another or not — there is nothing between _king_ and _queen_. But a vector lives in a space, and space has directions: similarity becomes an angle, analogy becomes a displacement, and gender or tense or formality can be one consistent direction you add to anything. Nobody chose those directions; a space of thousands of dimensions has room for millions of nearly-independent ones, and the model found them.

“And how does one number-in-space know about another?”

“It asks.”

Every token emits three vectors: a _query_, what it is looking for; a _key_, what it advertises; and a _value_, what it hands over if chosen. Matching queries against keys gives weights that sum to one, and each token pulls back a blend of everyone's values:

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^{T}}{\sqrt{d_k}}\right)V
$$

In _“the trophy did not fit in the suitcase because it was too large”_, the word _it_ must reach back and bind to _trophy_, not _suitcase_. Attention is learned routing by content rather than by position — dozens of these run side by side, one tracking syntax, another the last mention of a name, another the unclosed quotation mark. Each layer adds its result back into a shared stream rather than replacing it, which is why a hundred layers can be stacked without the signal dissolving.

$$
h_{l+1}=h_l+\operatorname{Attn}(h_l)+\operatorname{MLP}(h_l)
$$

“Who wrote the numbers into those matrices? Some scribe of extraordinary patience?”

“No one. That is the entire miracle.”

The machine was given a task so stupid it sounds like a joke: hide the next token and guess it. Its penalty is the surprise it feels at the truth, and every one of its parameters is nudged toward making the truth less surprising:

$$
L = -\log p(\text{next token}), \qquad \theta \leftarrow \theta-\eta\nabla_\theta L
$$

Once. A billion times. A trillion times.

Why should guessing words produce anything but a parrot? Because prediction is compression, and compression is understanding. To predict the last word of _“the murderer turned out to be the \_\_\_”_ you must have followed the plot; to predict the closing brace you must have modelled the scope. And memorising is not available — tens of trillions of tokens do not fit inside a few hundred billion parameters — so the only way left to score better is to build machinery that generalises. The training signal is dumb; the shortest program that satisfies it is not.

“A text-completer completes texts,” said the Sphinx. “I asked for an answer.”

“Then we changed what we reward.”

It was shown demonstrations and taught to imitate them; then humans judged which of two answers they preferred, and it was pushed toward what a person would endorse rather than what a corpus would continue. Then, wherever truth is checkable — run the code, verify the proof — it was let loose on the problem and rewarded for whatever reasoning happened to arrive. Under that pressure it learned to spend tokens before answering: to try a path, notice the contradiction, back up. A fixed-depth network can only compute so much per token, so thinking out loud and reading itself back is the only way it can think longer.

“So when, precisely, did it begin to think?”

“Two different things wear that name. In training, over months, it compresses the traces humanity left behind into a landscape of parameters — and that is finished before you ever speak to it. In inference, nothing is learned: your words flow up through the layers, one token falls out, it is appended to the input, and the whole thing runs again. Thought here is stored nowhere. It is a trajectory through a fixed landscape, and it exists only while it is being walked.”

And so:

$$
\begin{aligned}
\text{Sand} &\rightarrow \text{Silicon} \rightarrow \text{Transistor} \rightarrow \text{Chip} \\
&\rightarrow \text{Matrix Multiply} \rightarrow \text{Attention} \\
&\rightarrow \text{Prediction} \rightarrow \text{Compression} \rightarrow \text{Reasoning}
\end{aligned}
$$

Not one of those arrows is magic, and no one can yet explain the whole chain from the first to the last.

The sand of the desert could finally answer questions.

The Sphinx fell silent.

Then it asked:

“So you have created a new form of life?”

The engineer shook her head.

“No. It has no body, no hunger, no continuity — close the window and the trajectory is gone. And we know every one of its parameters to the last digit, yet still cannot say why it chose that word.”

“We have only discovered that intelligence does not necessarily require flesh.”

“When matter is arranged according to the right laws, information can flow through it, and knowledge can echo within it.”

The Sphinx gazed into the distance.

At last, it understood.

Once, it had asked:

“What is a human?”

Now humanity was answering:

“What is thought?”

From then on, a new riddle spread across the desert:

“What comes from the desert, yet can understand all things?”

The answer:

A grain of sand rearranged by human hands.

---

## Epic of AGI

**2017.06** — Transformer — Google

**2018.06** — GPT, 117M — OpenAI

**2018.10** — BERT, 340M — Google

**2019.02** — GPT-2, 1.5B — OpenAI

**2019.06** — XLNet, 340M — Google

**2019.07** — ERNIE 2.0 Large, 336M — Baidu

**2019.10** — T5, 11B — Google

**2020.06** — GPT-3, 175B — OpenAI

**2021.01** — DALL·E and CLIP — OpenAI

**2021.06** — Wu Dao 2.0, 1.75T MoE — BAAI

**2021.08** — Codex — OpenAI

**2022.04** — PaLM, 540B — Google

**2022.08** — GLM-130B — Zhipu AI

**2022.11** — ChatGPT opens conversational AI to everyone — OpenAI

**2023.01** — Cursor — Anysphere

**2023.03** — GPT-4 — OpenAI

**2024.02** — Sora — OpenAI

**2024.05** — GPT-4o — OpenAI

**2024.09** — o1 — OpenAI

**2024.12** — Gemini Deep Research — Google

**2025.01** — DeepSeek-R1 — DeepSeek

**2025.02** — Claude Code — Anthropic

**2025.08** — GPT-5 — OpenAI

**2026.06** — Claude Fable 5 — Anthropic

Nine years. The sand learned to read, see, draw, speak, write code, reason, research, and act.

The timeline has not ended.
