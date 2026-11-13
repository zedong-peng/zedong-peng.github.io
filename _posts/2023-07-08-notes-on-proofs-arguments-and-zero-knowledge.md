---
layout: post
title: Notes on Proofs, Arguments, and Zero-Knowledge
date: 2023-07-08 15:15:48 +0800
lang: en
description: "Reading notes on Justin Thaler's Proofs, Arguments, and Zero-Knowledge, on commitment schemes, and on watermarking neural networks. Guided by Liyao Xiang."
categories: research
---

These are my reading notes from 2023, guided by [Liyao Xiang](http://xiangliyao.cn). They cover the first four chapters of Justin Thaler's [Proofs, Arguments, and Zero-Knowledge](https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.html), then commitment schemes, then watermarking neural networks. Section numbers follow the book.

## The book

### 1 Introduction

- IP: interactive proof
- MIP: multi-prover interactive proof
- PCP: probabilistically checkable proof
- [zk-SNARK](https://zhuanlan.zhihu.com/p/487866576): zero-knowledge succinct non-interactive argument of knowledge

### 2 Fingerprinting and Freivalds' algorithm

**2.1 Reed-Solomon fingerprinting.** A Reed-Solomon code can be viewed as a polynomial generated from the data (Figure 2.1 in the book). The probability that two different inputs get the same fingerprint must be small, or the check is unreliable.

**2.2 Freivalds' algorithm.** Both protocols reduce the task of checking whether two large objects are equal to checking one random entry of a distance-amplifying encoding of those objects. The objects are vectors in Reed-Solomon fingerprinting, and the claimed and actual answer matrices in Freivalds' algorithm.

**2.3 Lagrange interpolation.** See [this explanation](https://zhuanlan.zhihu.com/p/511200890) and the recurrence in Equation 2.10.

### 3 Definitions and technical preliminaries

**3.1 Interactive proofs.** $\delta_c$ is the completeness error and $\delta_s$ is the soundness error. The costs of an interactive proof are:

- the running time of P and V
- the space used by P and V
- the total number of bits communicated
- the total number of messages exchanged

If V and P exchange $k$ messages, $\lceil k/2 \rceil$ is the round complexity of the proof system.

**3.2 Argument systems.** Terms to know: computational soundness, reusability and public verifiability.

**3.3 Robustness of the definitions.** Definition 3.1 requires $\delta_c$ and $\delta_s$ to be at most 1/3. The constant is a convention and does not change the results.

**3.4 Schwartz-Zippel lemma.** The one-variable case: a nonzero polynomial of degree $d$ has at most $d$ roots.

**3.5 Low-degree and multilinear extensions.** Lagrange interpolation gives the multilinear extension of a function on the Boolean hypercube (Figure 3.2 in the book):

![Lagrange interpolation for a multilinear extension](https://pic3.zhimg.com/v2-2cf5334c0ef96df87706a5810379622e.png)
![A worked multilinear extension](https://pic4.zhimg.com/v2-6c7fe30c3e4ececac784fa70a1a52463.png)

### 4 Interactive proofs

**4.1 Sum-check.** The protocol ([explanation](https://cloud.tencent.com/developer/article/2023698)):

![The sum-check protocol](https://pic4.zhimg.com/v2-a3046b52457145f43818c734bf8a112b.png)

An example:

![A sum-check example](https://pic3.zhimg.com/v2-70c1ad7b56c9291398821655afa499b2.png)

Its advantage is that the verifier's messages to the prover are only random field elements, so they are independent of the input polynomial $g$.

**4.2 SAT $\in$ IP.** SAT asks whether a formula in conjunctive normal form is satisfiable. The SAT protocol is closely related to IP = PSPACE: the problems that interactive proofs with polynomial-time verifiers can solve are exactly the problems solvable in polynomial space. The section also introduces doubly efficient interactive proofs.

**4.4 A super-efficient IP for MATMULT.** This is the optimized protocol for matrix multiplication from [Tha13]. Given two $n \times n$ matrices $A$ and $B$ over a field $F$, MATMULT computes $C = A \cdot B$. Unlike Freivalds' protocol, it does not require P to send the whole answer matrix.

## Commitments

A commitment fixes a value without revealing it. It has two phases:

- Commit: for data $v$, compute the commitment $c$ and send $c$ to the verifier.
- Open: send $v$. The verifier computes the commitment $c'$ of $v$ and compares it with $c$.

And two properties:

- Hiding: before the commitment is opened, the verifier does not know $v$.
- Binding: $c$ can be opened to only one $v$.

The opening phase can use a zero-knowledge proof to keep $v$ private. For polynomial commitments, see [this introduction](https://zhuanlan.zhihu.com/p/574383126) and Chapters 14 to 16 of the book.

### Hash commitment

This is the simplest scheme. The one-wayness of the hash function gives hiding, and its collision resistance gives binding.

![A hash commitment](https://pic2.zhimg.com/80/v2-a79da07ebfb37eb4d0d4cee26d809ea5_1440w.webp)

Image from [Cryptographic Commitments](https://zhuanlan.zhihu.com/p/150514744).

### Pedersen commitment

The algorithm is Protocol 5 in Section 12.3 of the book; see also [this explanation](https://zhuanlan.zhihu.com/p/62355190).

![The Pedersen commitment protocol](https://pic4.zhimg.com/v2-b5a9291f8088cda6a7786754d6a8ba5b.png)

It works in a [cyclic group](https://baike.baidu.com/item/循环群/2876454?fr=aladdin): a group $G$ in which every element is a power of one fixed element $a$, the generator, written $G = (a)$. The exchange between the committer and the verifier:

![The Pedersen commitment between the committer and the verifier](https://pic2.zhimg.com/80/v2-a608bec8d7385afdaa9e2e61ba521ea9_1440w.webp)

The commitment is $c = g^m h^z$. The random value $z$ hides $m$, and binding rests on the hardness of the discrete logarithm. The form is also additively homomorphic, so two Pedersen commitments combine into a commitment to the sum:

$$
c_1 \cdot c_2
= g^{m_1} h^{z_1} \cdot g^{m_2} h^{z_2}
= g^{m_1+m_2} h^{z_1+z_2}
= g^{m_3} h^{z_3}
= c_3.
$$

### Hardness assumptions

Three problems that these schemes rely on ([source](https://mp.weixin.qq.com/s?__biz=MzU0MDY4MDMzOA==&mid=2247484310&idx=1&sn=e780ccd6fc2eed51ec2ccc6f6b7803b9&chksm=fb34ca6bcc43437d447b0da56c68b125b01950f801362336e07184f091468537921066ccd2c8&scene=21#wechat_redirect)):

- Integer factorization. Given two large primes $p$ and $q$, computing $n = pq$ is easy. Given $n$, finding $p$ and $q$ is hard.
- Discrete logarithm. Over the real numbers a logarithm such as $\log_2 9$ is easy to compute by binary search. In a finite field with generator $g$, computing $b = g^a$ from an integer $a$ is easy, but computing $a$ from $b$ and $g$ is hard.
- Elliptic-curve discrete logarithm. Let $P$ be a point on an elliptic curve over a finite field. Given an integer $a$, computing $Q = aP$ is easy. Given $P$ and $Q$, computing $a$ is hard.

![Binary search for a real logarithm](https://pic2.zhimg.com/v2-023b908f29af7f1d4d30b5a58ee42189.jpeg)

## Watermarking neural networks

Two questions: how digital watermarks apply to neural networks, and how they combine with cryptographic tools such as zero-knowledge proofs.

[Adi et al., USENIX Security 2018](https://www.usenix.org/conference/usenixsecurity18/presentation/adi) watermark a model offered as a service by planting a backdoor in it. Two surveys:

- [A Survey of Deep Neural Network Watermarking Techniques](https://arxiv.org/abs/2103.09274)
- [A Systematic Review on Model Watermarking for Neural Networks](https://arxiv.org/abs/2009.12153)

Notes on the setting:

- Blockchain timestamps, and ambiguity attacks.
- The model is public but verification is black-box, because the parameters are not disclosed.
- The computational-resource assumption: an attacker will not retrain the model, because that costs too much.
- The trigger must be strong enough that adversarial fine-tuning cannot remove it.

---

> Translated from the original Chinese with AI assistance.
