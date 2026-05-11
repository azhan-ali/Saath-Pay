# 🇮🇳 SaathPay — Saath Kaam, Saath Payment

<div align="center">

**Get Paid in Seconds. Not Days. Not Weeks. Seconds.**

*Programmable stablecoin payment rails for Indian freelancers, SMEs & AI agents*

[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Powered by Stripe](https://img.shields.io/badge/Powered%20by-Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![AI by Gemini](https://img.shields.io/badge/AI%20by-Gemini%202.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

> *"Azhan builds AI SaaS in India. His client is in the US. Today, getting paid means 7 days of waiting and 6% in fees. His AI agents? Nobody can pay them at all. SaathPay changes that."*

</div>

---

## ✨ What is SaathPay?

SaathPay is a **programmable payment infrastructure** for the AI-native workforce. It combines:

- 💳 **Fiat payments** (card, UPI, NetBanking via Stripe) for clients who don't know crypto
- 🔐 **Solana escrow** that locks funds on-chain until work is approved
- 🤖 **x402 autonomous payments** for AI agents — no human approval needed
- ✨ **Gemini AI** that generates smart project milestones in 3 seconds
- ⚡ **2-second settlement** vs 5-7 days for bank wire, at under $0.01 fee

**The core story:** Client pays via card → USDC locks on Solana → AI agents get paid autonomously → Human approves milestone → USDC releases instantly.

---

## 🎬 Demo

```
0:00 — Client opens payment link, pays $2000 via card
0:05 — Dodo webhook fires → USDC locks in Solana escrow
0:10 — Gemini AI generates 4 milestones from project description
0:30 — AI agent completes code review → x402 auto-pays $5 USDC
0:35 — Freelancer submits proof → client approves
0:36 — $500 USDC released to freelancer wallet
       Settlement time: 1.8 seconds. Fee: $0.0025.
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│  Stripe Checkout (card/UPI) ──→ Webhook ──→ Solana Escrow PDA  │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────────┐
│  Next.js 16     │          │  Solana Devnet        │
│  App Router     │          │  ┌────────────────┐   │
│  ┌───────────┐  │          │  │ Escrow Vault   │   │
│  │ Supabase  │  │◄────────►│  │ (PDA)          │   │
│  │ Postgres  │  │          │  │ USDC locked    │   │
│  │ Realtime  │  │          │  └────────────────┘   │
│  └───────────┘  │          │  ┌────────────────┐   │
│  ┌───────────┐  │          │  │ Agent Wallets  │   │
│  │ Gemini AI │  │          │  │ (x402 payouts) │   │
│  │ Milestones│  │          │  └────────────────┘   │
│  └───────────┘  │          └──────────────────────┘
└─────────────────┘
```

---

## 🚀 Features

### 🔐 Smart Escrow Vault (Phase 3)
- Solana PDA holds USDC until milestone approval
- On-chain proof — verifiable on Solana Explorer
- Demo mode works without deployed program

### 💳 Fiat → USDC Pipeline (Phase 4)
- Client pays via Stripe (card, UPI, NetBanking)
- Webhook auto-funds Solana escrow
- No crypto knowledge needed for clients

### ✨ AI Milestone Generator (Phase 5)
- Google Gemini 2.0 Flash generates 3-5 milestones
- Context-aware (detects AI, mobile, SaaS projects)
- 3-model fallback chain (never fails the user)
- Rate limited: 10 req/min per user

### 🤖 x402 Agent Payments (Phase 6)
- Add AI agents to any project
- Each agent gets a unique Solana keypair
- "Agent completed task" → USDC auto-transfers
- HTTP 402 Payment Required pattern
- Live payment feed with TX hashes

### 🔔 Real-time Notifications (Phase 7)
- Supabase Realtime WebSocket subscriptions
- Bell icon with unread count badge
- Events: escrow funded, milestone paid, agent paid
- Mark individual or all as read

### 📊 Analytics Dashboard (Phase 7)
- Total earned, pending payout, project breakdown
- Transaction history with Solana Explorer links
- Reputation score (0-100) with level badges
- Agent cost tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 + TypeScript + Tailwind CSS v4 |
| **UI Theme** | Custom hand-drawn sketch aesthetic |
| **Auth + DB** | Supabase (Postgres + Realtime + RLS) |
| **Blockchain** | Solana devnet + @solana/web3.js + SPL Token |
| **Wallet** | Phantom via @solana/wallet-adapter-react |
| **Payments** | Stripe (checkout + webhooks) |
| **AI** | Google Gemini 2.0 Flash |
| **Deployment** | Vercel |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://app.supabase.com) account (free)
- A [Stripe](https://dashboard.stripe.com) account (free test mode)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/saathpay.git
cd saathpay
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini AI
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Go to [app.supabase.com](https://app.supabase.com) → your project → **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**
4. Go to **Authentication → Providers → Email** → turn OFF "Confirm email"

### 4. Run Development Server

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Stripe webhook forwarding (for payment testing)
stripe listen --api-key sk_test_... --forward-to localhost:3000/api/webhooks/dodo
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing the Full Flow

### Payment Flow
1. Sign up → create a project
2. Click "Generate Payment Link" → copy the `/pay/[id]` URL
3. Open the URL → click "Pay" → use test card `4242 4242 4242 4242`
4. Watch the project status change to "Funded ✓"

### AI Milestones
1. Create project → write a description → click "Next"
2. Click "✨ Generate with AI" → Gemini generates 4 milestones in ~3 seconds

### x402 Agent Payments
1. Open a project → click "🤖 AI Agents" tab
2. Click "Add AI Agent" → select a preset → "Add Agent"
3. Click "Agent Completed Task → Pay $5 USDC"
4. See TX hash + Solana Explorer link in the live feed

### Devnet SOL Airdrop
1. Connect Phantom wallet (set to devnet)
2. Dashboard → Wallet → "Airdrop 1 SOL (devnet)"

---

## 🌐 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: SaathPay complete — Phases 0-7"
git remote add origin https://github.com/your-username/saathpay.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables (same as `.env.local` but with production values)
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL: `https://saathpay.vercel.app`
6. Click **Deploy**

### Step 3 — Production Stripe Webhook

After deploy, add a production webhook in Stripe Dashboard:
- URL: `https://your-app.vercel.app/api/webhooks/dodo`
- Events: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- Copy the signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars

### Step 4 — Verify Deployment

```bash
# Test the webhook endpoint
curl -X POST https://your-app.vercel.app/api/webhooks/dodo \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}' 
# Should return: {"received":true}

# Test AI endpoint
curl -X POST https://your-app.vercel.app/api/ai/milestones \
  -H "Content-Type: application/json" \
  -d '{"description":"Build a chatbot","totalAmount":1000}'
# Should return milestones array
```

---

## 📁 Project Structure

```
saathpay/
├── app/
│   ├── api/
│   │   ├── agents/          # x402 agent payment APIs
│   │   ├── ai/milestones/   # Gemini AI milestone generator
│   │   ├── dodo/            # Stripe checkout creation
│   │   ├── notifications/   # Notification read/fetch
│   │   ├── solana/          # Escrow, airdrop, approve APIs
│   │   └── webhooks/dodo/   # Stripe webhook handler
│   ├── auth/                # Login, signup, callback
│   ├── components/          # Shared UI components
│   ├── dashboard/           # Main app (projects, agents, analytics)
│   └── pay/[id]/            # Public client payment page
├── lib/
│   ├── dodo/client.ts       # Stripe/payment provider client
│   ├── solana/program.ts    # Solana SDK + demo mode
│   └── supabase/            # Auth + DB clients
├── supabase/
│   └── schema.sql           # Full DB schema with RLS
├── .env.example             # Environment variable template
└── next.config.ts           # Next.js + Turbopack config
```

---

## 🗄️ Database Schema

```sql
users          — profiles, wallet addresses, reputation scores
projects       — escrow projects with Stripe + Solana metadata
milestones     — per-project milestones with proof URIs
transactions   — on-chain TX log (escrow_fund, milestone_payout, agent_payout)
ai_agents      — agent wallets + x402 payment history
notifications  — real-time notification feed
```

All tables have Row Level Security (RLS) — users can only access their own data.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role (server-only) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (localhost or Vercel) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | ⬜ | `devnet` (default) |
| `NEXT_PUBLIC_ESCROW_PROGRAM_ID` | ⬜ | Anchor program ID (demo mode if empty) |

---

## 🛡️ Security

- All API routes require authentication (Supabase JWT)
- Webhook endpoint verifies Stripe HMAC signature
- Service role key only used server-side (never exposed to browser)
- RLS policies on all Supabase tables
- `.env.local` in `.gitignore` — never committed

---

## 🗺️ Roadmap

- [ ] **Anchor smart contract** — deploy real escrow program to Solana devnet
- [ ] **INR payout rail** — Dodo Payouts API for bank transfers
- [ ] **Reputation SBT** — on-chain Soulbound Token for reputation
- [ ] **Multi-sig escrow** — require 2-of-3 approval for large projects
- [ ] **Revenue splitter** — auto-split payments between team members
- [ ] **Risk detection AI** — Gemini-powered fraud detection
- [ ] **WhatsApp notifications** — payment alerts via WhatsApp Business API
- [ ] **Mobile app** — React Native with Phantom Mobile SDK

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Built With Love For

- 🇮🇳 Indian freelancers tired of 7-day payment delays
- 🤖 AI agents that deserve to get paid
- 🌏 The global AI-native workforce

---

<div align="center">

**SaathPay** — *Saath Kaam, Saath Payment*

[Live Demo](https://saathpay.vercel.app) · [Report Bug](https://github.com/your-username/saathpay/issues) · [Request Feature](https://github.com/your-username/saathpay/issues)

Made with ❤️ in India 🇮🇳

</div>
