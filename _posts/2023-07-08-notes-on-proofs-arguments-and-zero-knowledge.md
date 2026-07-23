---
layout: post
title: Notes on Proofs, Arguments, and Zero-Knowledge
date: 2023-07-08 15:15:48
lang: en
translation_key: zero-knowledge-notes
description: Notes on machine learning, security, privacy, and mobile computing. Guided by Liyao Xiang.
categories: notes
featured: false
---

# ZKP

Tags: machine learning, security, privacy, and mobile computing.

Guided by [Liyao Xiang](http://xiangliyao.cn).

# Proofs, Arguments, and Zero-Knowledge

<https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.html>

## 1 Introduction

- IPs: interactive proofs
- MIP: multi-prover interactive proofs
- PCP: probabilistically checkable proofs
- [zk-SNARK](https://zhuanlan.zhihu.com/p/487866576): Zero-Knowledge Succinct Non-Interactive Argument of Knowledge

## 2 Fingerprinting and Freivalds' Algorithm

### 2.1 Reed-Solomon Fingerprinting

A Reed-Solomon code can be viewed as a polynomial generated from the data (see Figure 2-1).

The probability of a hash collision must be small; otherwise, it undermines reliability.

### 2.2 Freivalds' Algorithm

Both protocols reduce the task of checking whether two large objects are equal - vectors in Reed-Solomon fingerprinting, and the claimed and actual answer matrices in Freivalds' algorithm - to checking the equality of one random entry in distance-amplifying encodings of those objects.

### 2.3 [Lagrange Interpolation](https://zhuanlan.zhihu.com/p/511200890)

Recurrence formula (2.10).

## 3 Definitions and Technical Preliminaries

### 3.1 IPs

Errors: $\delta_c$ is the completeness error, and $\delta_s$ is the soundness error.

Cost factors for an interactive proof:

- The running time of P and V
- The space used by P and V
- The total number of communicated bits
- The total number of messages exchanged

If V and P exchange $k$ messages, the upper bound $k/2$ is called the round complexity of the interactive proof system.

### 3.2 Argument Systems

- Computational soundness
- Reusability
- Public verifiability

### 3.3 Robustness

Why does Definition 3.1 require $\delta_c$ and $\delta_s$ to be at most 1/3?

This choice is for convenience or aesthetics and does not change the result.

### 3.4 Schwartz-Zippel Lemma

A degree-$d$ polynomial has at most $d$ roots.

### 3.5 Low-Degree and Multilinear Extensions

How is the Lagrange interpolation in Figure 3.2 used?

![](https://pic3.zhimg.com/v2-2cf5334c0ef96df87706a5810379622e.png)
![image alt](https://pic4.zhimg.com/v2-6c7fe30c3e4ececac784fa70a1a52463.png)

## 4 IPs

### 4.1 Sum-Check

[Algorithm explanation](https://cloud.tencent.com/developer/article/2023698):

![](https://pic4.zhimg.com/v2-a3046b52457145f43818c734bf8a112b.png)

Example:

![](https://pic3.zhimg.com/v2-70c1ad7b56c9291398821655afa499b2.png)

Advantage: the verifier's messages to the prover contain only random field elements and are therefore completely independent of the input polynomial $g$.

### 4.2 SAT $\in$ IP

The SAT problem asks whether a formula in conjunctive normal form is satisfiable.

The SAT protocol is closely related to IP = PSPACE: the class of problems solvable by interactive proofs with polynomial-time verifiers is exactly the class of problems solvable in polynomial space.

Doubly efficient IPs.

### 4.4 Third Application: Super-Efficient IP for MATMULT

This section describes the highly optimized IP protocol for matrix multiplication (MATMULT) from [Tha13].

Given two $n \times n$ input matrices $A$ and $B$ over a field $F$, MATMULT computes the matrix product $C=A \cdot B$.

Compared with Freivalds' protocol, this protocol avoids requiring P to send the complete answer matrix.

# 2.15

### sec18-adi

Watermark MLaaS, where the service can only be used by one person.

Method: use backdoors.

([Pedersen commitment algorithm](https://zhuanlan.zhihu.com/p/62355190))

Opening a commitment: decrypting.

Two properties of commitments: binding and hiding.

Setup - input - proof - verify.

Peng: introduce the Pedersen commitment algorithm. For further reading, see Chapters 14-16 on polynomial commitments in _Proofs, Arguments, and Zero-Knowledge_.

Wu: read Chapter 10 of _Proofs, Arguments, and Zero-Knowledge_, focusing on Section 10.3.

## Commitment

Use private data without decrypting it.

Process:

- Commit: for data $v$, compute the corresponding commitment $c$, then send $v$ and $c$ to the verifier.
- Open the commitment: receive $v$, compute the corresponding commitment $c'$, and compare $c$ with $c'$.

Two properties:

- Hiding: before the commitment is opened, the verifier does not know $v$.
- Binding: $v$ is uniquely associated with the commitment $c$.

The opening phase can use a ZKP to protect $v$.

### Hash Commitment

The simplest commitment scheme.

For a hash function, one-wayness provides hiding, while collision resistance provides binding.

![image alt](https://pic2.zhimg.com/80/v2-a79da07ebfb37eb4d0d4cee26d809ea5_1440w.webp)

Image source: [Cryptographic Commitments](https://zhuanlan.zhihu.com/p/150514744)

### Pedersen Commitment

Algorithm: _Proofs, Arguments, and Zero-Knowledge_, Section 12.3, Protocol 5.

![](https://pic4.zhimg.com/v2-b5a9291f8088cda6a7786754d6a8ba5b.png)

A [cyclic group](https://baike.baidu.com/item/循环群/2876454?fr=aladdin) is a group $G$ in which every element is a power of one fixed element $a$. It is written as $G=(a)$, and $a$ is called a generator of the group. A group is a special kind of set, and "element" refers to a member of that set.

![image alt](https://pic2.zhimg.com/80/v2-a608bec8d7385afdaa9e2e61ba521ea9_1440w.webp)

A random value plus the hardness of the discrete logarithm problem provides hiding.

$c=g^m h^z$ provides binding and additive homomorphism: two Pedersen commitments can be combined,

$$
c_1 \cdot c_2
= g^{m_1} h^{z_1} \cdot g^{m_2} h^{z_2}
= g^{m_1+m_2} h^{z_1+z_2}
= g^{m_3} h^{z_3}
= c_3.
$$

[Computational hardness](https://mp.weixin.qq.com/s?__biz=MzU0MDY4MDMzOA==&mid=2247484310&idx=1&sn=e780ccd6fc2eed51ec2ccc6f6b7803b9&chksm=fb34ca6bcc43437d447b0da56c68b125b01950f801362336e07184f091468537921066ccd2c8&scene=21#wechat_redirect):

- Integer factorization problem
  - Given two large primes $p$ and $q$, it is easy to compute $n=pq$. Given $n$, however, finding $p$ and $q$ is difficult.
- Discrete logarithm problem
  - Over the real numbers, computing $\log_2(9)$ using binary search is easy.
    - ![](https://pic2.zhimg.com/v2-023b908f29af7f1d4d30b5a58ee42189.jpeg)
  - In a finite field with modulus $n$ and generator $g$, given an integer $a$, it is easy to compute $g^a=b$. Given $b$ and $g$, however, computing $a$ is difficult. This involves arithmetic over finite fields.
- Elliptic-curve discrete logarithm problem
  - In an elliptic-curve group over a finite field $F$, let $P$ be a point on the curve. Given an integer $a$, computing $aP=Q$ is easy. Given $P$ and $Q$, however, computing $a$ is difficult.

### [Polynomial Commitment](https://zhuanlan.zhihu.com/p/574383126)

# 2.18

Watermarking, commitments, and ZKPs:

1. Applications of digital watermarks in neural networks
2. Combining digital watermarks with cryptographic tools such as zero-knowledge proofs

[A Survey of Deep Neural Network Watermarking Techniques](https://arxiv.org/abs/2103.09274)

[A Systematic Review on Model Watermarking for Neural Networks](https://arxiv.org/abs/2009.12153)

# 3.15

Blockchain timestamps and ambiguity attacks.

The model is public, but verification is black-box because the parameters are not disclosed.

Computational-resource assumption: an attacker will not spend excessive resources retraining a model because the cost would be too high.

The trigger must be strong enough that it cannot be removed through adversarial fine-tuning.

---

> Translated from the original Chinese with AI assistance.
