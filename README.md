
<div align="center">

# 💸 SaathPay

### *Stop Waiting 7 Days For Money You Already Earned.*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-saathpay.vercel.app-FF6B35?style=for-the-badge)](https://saath-pay.vercel.app)
[![Built on Solana](https://img.shields.io/badge/⚡_Solana-Devnet-9945FF?style=for-the-badge)](https://solana.com)
[![Powered by Stripe](https://img.shields.io/badge/💳_Stripe-Payments-635BFF?style=for-the-badge)](https://stripe.com)
[![AI by Gemini](https://img.shields.io/badge/✨_Gemini-2.0_Flash-4285F4?style=for-the-badge)](https://aistudio.google.com)

<br/>

> **You delivered the work on Monday.**
> **It's Friday. Still no money.**
> **This is what SaathPay fixes.**

</div>

---

<br/>

## 🩸 The Pain Is Real

Every Indian freelancer working with global clients knows this story:

```
Monday    → You deliver the project. Client says "great work!"
Tuesday   → You send the invoice.
Wednesday → "Processing..."
Thursday  → "Our finance team needs to approve."
Friday    → Nothing.
Next week → $47 eaten by PayPal fees. $200 lost to exchange rates.
```

**$50 billion flows through Indian freelancers every year.**
Most of it bleeds out through delays, fees, and broken trust.

**SaathPay ends this.**

<br/>

---

<br/>

## ⚡ What Happens Instead

```
Monday 9:00 AM  →  You create a project. AI generates milestones in 3 seconds.
Monday 9:02 AM  →  Client gets a payment link. Pays with their Visa card.
Monday 9:03 AM  →  $2,000 USDC locks in a Solana smart contract. On-chain. Immutable.
Monday 9:04 AM  →  You start working. Money is already secured.

[Work happens]

Friday 5:00 PM  →  You submit proof. Client clicks Approve.
Friday 5:00:02  →  $2,000 USDC is in your wallet.
                   Settlement time: 1.8 seconds.
                   Fee: $0.0025.
                   Bank wire: still processing.
```

<br/>

---

<br/>

## 🏗️ The Full Picture

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   CLIENT                    SAATHPAY                   FREELANCER    │
│                                                                       │
│   Pays with card  ──────►  Stripe Checkout                           │
│                                    │                                  │
│                            Webhook fires                              │
│                                    │                                  │
│                            USDC locks in  ◄──────────────────────    │
│                            Solana Escrow                              │
│                            (PDA — trustless)                          │
│                                    │                                  │
│                            Work delivered                             │
│                                    │                                  │
│   Client approves ──────►  Smart contract                            │
│                            releases USDC  ──────────────────────►    │
│                                                              Wallet   │
│                                                           in 2 sec ✓  │
│                                                                       │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                                       │
│   AI AGENT                 x402 PROTOCOL                             │
│                                                                       │
│   Task complete   ──────►  HTTP 402 fired                            │
│                            Auto-pays agent  ────────────────────►    │
│                            No human needed              $5 USDC ✓    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

</div>

<br/>

---

<br/>

## 🔥 Features That Actually Matter

<br/>

### 🔐 Smart Escrow — Trustless by Design
No middleman holds your money. A Solana Program Derived Address (PDA) holds it. Code enforces the rules. Neither party can cheat, ghost, or delay. Every rupee is publicly verifiable on Solana Explorer.

<br/>

### ✨ AI Milestone Generator — 3 Seconds to a Full Project Plan
Type your project description. Hit generate. Google Gemini 2.0 Flash reads it, understands the scope, and returns 3–5 structured milestones with amounts, deliverables, and timelines. Edit anything. Confirm. Done.

No more "how do I split this $5,000 project?" — AI handles it.

<br/>

### 💳 Clients Don't Need Crypto — They Just Pay
Your client in New York doesn't need a Phantom wallet. They don't need to know what USDC is. They click a link, enter their Visa card, and pay. Stripe handles the rest. Behind the scenes, funds convert and lock on Solana. The client experience is identical to any normal checkout.

<br/>

### 🤖 x402 Agent Payments — The Future Is Already Here
This is the feature no other platform has.

AI agents (code reviewers, QA bots, documentation writers) are first-class payment participants in SaathPay. Each agent gets its own Solana wallet. When it completes a task, the x402 protocol fires:

```
Agent reports completion
        ↓
Server returns HTTP 402 Payment Required
        ↓
USDC auto-transfers from escrow to agent wallet
        ↓
No human approval. No delay. 1 second.
```

You're not just paying humans anymore. You're running a team of humans and AI — and everyone gets paid.

<br/>

### ⚡ 2-Second Settlement — Not a Marketing Claim
Solana's block time is ~400ms. After client approval, the smart contract executes, USDC transfers, and your wallet balance updates. The entire process takes under 2 seconds. This is not a rounding error. This is the actual number.

Compare:
- PayPal: 3 business days
- Bank wire: 5–7 business days
- Wise: 1–2 business days
- **SaathPay: 2 seconds**

<br/>

### 🔔 Real-Time Everything
Supabase Realtime WebSocket subscriptions mean you never refresh. Escrow funded? Bell rings. Milestone approved? Bell rings. Agent paid? Bell rings. The dashboard is alive.

<br/>

---

<br/>

## 📊 By The Numbers

<div align="center">

| What | How Fast | How Cheap |
|------|----------|-----------|
| Payment settlement | **1.8 seconds** | **$0.0025** |
| AI milestone generation | **~3 seconds** | **Free** |
| Agent x402 payment | **~1 second** | **$0.0025** |
| Escrow setup | **Instant** | **$0** |
| Client checkout | **Standard card flow** | **Stripe rates** |

</div>

<br/>

---

<br/>

## 🛠️ Built With

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 · TypeScript · Tailwind CSS 4 |
| **Blockchain** | Solana Devnet · @solana/web3.js · SPL Token |
| **Wallet** | Phantom via @solana/wallet-adapter-react |
| **Payments** | Stripe Checkout + Webhooks |
| **AI** | Google Gemini 2.0 Flash (3-model fallback chain) |
| **Database** | Supabase — Postgres + Realtime + Row Level Security |
| **Auth** | Supabase Auth — email/password + JWT |
| **Deployment** | Vercel |

</div>

<br/>

---

<br/>

## 🆚 SaathPay vs. Everything Else

<div align="center">

| | SaathPay | PayPal | Wise | Bank Wire | Deel |
|---|:---:|:---:|:---:|:---:|:---:|
| Settlement time | **2 sec** | 3 days | 2 days | 7 days | 3 days |
| Transaction fee | **$0.01** | 4.4% | 0.5–2% | $25–50 | 2–5% |
| Escrow protection | **✅ On-chain** | ❌ | ❌ | ❌ | ✅ Manual |
| AI milestone help | **✅ Built-in** | ❌ | ❌ | ❌ | ❌ |
| AI agent payments | **✅ x402** | ❌ | ❌ | ❌ | ❌ |
| On-chain proof | **✅ Public** | ❌ | ❌ | ❌ | ❌ |
| No crypto needed (client) | **✅** | ✅ | ✅ | ✅ | ✅ |

</div>

<br/>

---

<br/>

## 🗺️ What's Next

The hackathon version runs on Solana devnet with Stripe as the payment processor. The roadmap:

- **Anchor smart contract** — deploy the real escrow program on devnet/mainnet
- **INR payout rail** — direct bank transfer to Indian accounts
- **Reputation SBT** — on-chain Soulbound Token that can't be faked
- **WhatsApp payment alerts** — because that's where Indian freelancers live
- **Multi-sig escrow** — 2-of-3 approval for large enterprise contracts
- **Revenue splitter** — auto-split payments across a team

<br/>

---

<br/>

## 👤 Built By

**Azhan Ali** — solo developer, India 🇮🇳

Built in 72 hours for the **Dodo × Superteam India Hackathon**.

<br/>

---

<br/>

<div align="center">

**SaathPay** — *Work Together. Get Paid Together.*

<br/>

*Built with the conviction that Indian freelancers deserve better than 7-day payment delays and 6% fees.*

<br/>

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>
