<p align="center">
  <img src="https://img.shields.io/badge/SaathPay-Payment%20Infrastructure-FF6B35?style=for-the-badge&labelColor=1a1a1a" />
</p>

<h1 align="center">SaathPay</h1>
<h3 align="center">Stop Waiting 7 Days For Money You Already Earned.</h3>

<p align="center">
  <strong>Programmable payment infrastructure for freelancers and AI agents.</strong><br/>
  Clients pay with card. Funds lock on Solana. You get paid in 2 seconds.
</p>

<p align="center">
  <a href="https://saath-pay.vercel.app">Live Demo</a> •
  <a href="#the-problem">Problem</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## The Problem

Every freelancer working with international clients knows this pain:

- 💸 **7-day payment delays** — you delivered on Monday, money arrives next week
- 🔪 **6% in fees** — PayPal, Wise, bank wires all take their cut
- 🤷 **Zero protection** — client ghosts after delivery? Good luck.
- 🤖 **AI agents can't get paid** — the future workforce has no payment rail

**$50B+ flows through Indian freelancers annually.** Most of it leaks to middlemen and delays.

---

## The Solution

SaathPay replaces the entire broken pipeline with one flow:

```
Client pays (card/UPI) → Funds lock on Solana → Work delivered → Payment released in 2 seconds
```

No banks in the middle. No 7-day holds. No 6% fees. Just code executing payments at the speed of the internet.

---

## How It Works

| Step | What Happens | Time |
|------|-------------|------|
| 1 | Freelancer creates project + AI generates milestones | 30 sec |
| 2 | Client receives payment link, pays with any card/UPI | 2 min |
| 3 | Funds auto-lock in Solana smart contract escrow | Instant |
| 4 | Freelancer delivers work, submits proof | — |
| 5 | Client approves → USDC releases to freelancer wallet | **2 seconds** |
| 6 | AI agents get paid autonomously via x402 protocol | **1 second** |

**Settlement: 2 seconds. Fee: $0.01. Transparency: 100% on-chain.**

---

## Features

### 🔐 Smart Escrow Vault
Client funds are locked in a Solana Program Derived Address (PDA). Neither party can cheat — the smart contract enforces the rules. Every transaction is publicly verifiable on Solana Explorer.

### 🎯 Milestone-Based Payments
Break any project into 3-5 milestones. Each milestone has its own deliverable, deadline, and payment amount. Funds release per-milestone — not all-or-nothing.

### ✨ AI Milestone Generator
Describe your project in plain English. Google Gemini 2.0 Flash analyzes it and generates structured milestones with amounts, deliverables, and timelines — in under 3 seconds.

### 💳 One-Click Client Payments
Clients don't need crypto wallets. They pay with Visa, Mastercard, UPI, or bank transfer through Stripe's hosted checkout. Behind the scenes, funds convert to USDC and lock on Solana.

### 🤖 x402 Agent Payments
AI agents (code reviewers, QA bots, doc writers) get their own Solana wallets. When they complete a task, USDC transfers autonomously from escrow — no human approval needed. This is the x402 protocol pattern: HTTP 402 Payment Required → auto-settle.

### ⚡ 2-Second Settlement
Solana confirms transactions in ~400ms. After client approval, USDC is in the freelancer's wallet within 2 seconds. Compare: PayPal (3 days), bank wire (5-7 days), Wise (1-2 days).

### 🔔 Real-Time Notifications
Supabase Realtime WebSocket subscriptions push instant alerts: escrow funded, milestone approved, payment released, agent paid. No refresh needed.

### 📊 Analytics Dashboard
Track total earnings, pending payouts, project completion rates, transaction history with Solana Explorer links, and AI agent costs — all in one view.

### ⭐ Reputation System
Every completed project increases your on-chain reputation score. Higher reputation = more trust from clients = better projects.

### 🛡️ Webhook-Driven Architecture
Stripe webhooks trigger on-chain escrow funding automatically. Event-driven, idempotent, with signature verification and deduplication.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS 4 | Server components + edge performance |
| Blockchain | Solana (devnet) + @solana/web3.js + SPL Token | Sub-second finality, $0.01 fees |
| Wallet | Phantom via @solana/wallet-adapter-react | Most popular Solana wallet |
| Payments | Stripe (checkout + webhooks) | Global card acceptance, India-ready |
| AI | Google Gemini 2.0 Flash | Free tier, JSON mode, 3-model fallback |
| Database | Supabase (Postgres + Realtime + RLS) | Auth + DB + WebSockets in one |
| Deployment | Vercel | Zero-config Next.js hosting |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                         │
│  Stripe Checkout ──→ Webhook ──→ Solana Escrow PDA           │
└──────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
     ┌──────────────┐ ┌────────┐ ┌──────────────┐
     │  Supabase    │ │ Solana │ │  Gemini AI   │
     │  • Auth      │ │ • PDA  │ │  • Milestone │
     │  • Postgres  │ │ • USDC │ │    Generator │
     │  • Realtime  │ │ • SPL  │ │  • 3-model   │
     │  • RLS       │ │        │ │    fallback  │
     └──────────────┘ └────────┘ └──────────────┘
```

---

## What Makes This Different

| | SaathPay | PayPal / Wise / Banks |
|---|---|---|
| Settlement | 2 seconds | 3-7 days |
| Fees | < $0.01 | 3-6% |
| Escrow | Smart contract (trustless) | Manual / none |
| AI agents | x402 autonomous payments | Impossible |
| Transparency | On-chain, public | Black box |
| AI assistance | Built-in milestone generator | None |

---

## The x402 Difference

Most payment platforms stop at human-to-human transfers. SaathPay goes further:

**AI agents are first-class payment participants.**

When a CodeReview-Bot finishes reviewing a PR, it doesn't wait for a human to click "pay." The x402 protocol pattern triggers autonomous USDC transfer from escrow to the agent's wallet. No approval queue. No delay. Just work → pay.

This is what payment infrastructure looks like when you build for 2026, not 2016.

---

## Live Numbers

| Metric | Value |
|--------|-------|
| Settlement time | < 2 seconds |
| Transaction fee | < $0.01 |
| AI milestone generation | ~3 seconds |
| Supported currencies | 80+ (via Stripe) |
| On-chain verification | 100% public |

---

## Team

Built by **Azhan Ali** — solo developer, India 🇮🇳

---

## License

MIT — use it, fork it, build on it.

---

<p align="center">
  <strong>SaathPay</strong> — Work Together. Get Paid Together.<br/>
  <sub>Built with conviction that freelancers deserve better than 7-day payment delays.</sub>
</p>
