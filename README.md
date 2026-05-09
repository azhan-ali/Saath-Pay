# SaathPay 🇮🇳

> **Saath Kaam, Saath Payment**
>
> Get Paid in Seconds. Not Days. Not Weeks. Seconds.

Programmable stablecoin payment rails for Indian freelancers, SMEs & AI agents — built on **Solana**, powered by **Dodo Payments**.

Built for the **Dodo Payments × Superteam India** prize track at the Solana Frontier Hackathon (Colosseum).

---

## ✨ What is SaathPay?

SaathPay solves the broken cross-border payment experience for Indian freelancers working with global clients:

| Problem | SaathPay Solution |
|---|---|
| Bank wires take 5–7 days | Instant USDC settlement on Solana (<2 sec) |
| 3–6% platform fees | <$0.01 gas fee |
| No escrow protection | Smart contract escrow vault |
| Manual milestone tracking | AI-generated milestones (Gemini) |
| No payment rails for AI agents | x402-style autonomous micropayments |
| Clients need crypto wallets | Dodo Payments handles fiat checkout |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 |
| UI | Custom sketch/hand-drawn components + Framer Motion |
| Auth + DB | Supabase (Postgres + Realtime + RLS) |
| Blockchain | Solana devnet + Anchor framework |
| Payments | Dodo Payments (checkout + webhooks) |
| AI | Google Gemini 2.0 Flash |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A [Supabase](https://app.supabase.com) account (free)
- A [Dodo Payments](https://dodopayments.com) sandbox account
- A [Google AI Studio](https://aistudio.google.com) API key (free)
- [Phantom Wallet](https://phantom.app) browser extension

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/saathpay.git
cd saathpay
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Solana (devnet by default)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Dodo Payments (Phase 4)
DODO_API_KEY=
DODO_WEBHOOK_SECRET=

# Gemini AI (Phase 5)
GEMINI_API_KEY=
```

### 3. Set Up Database

1. Go to your Supabase project → **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**
4. Go to **Authentication → Providers → Email** → turn OFF "Confirm email" for dev

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
saathpay/
├── app/
│   ├── auth/              # Signup, login, OAuth callback
│   ├── components/        # Shared UI (Navbar, Hero, Features, etc.)
│   ├── dashboard/         # Protected dashboard pages
│   ├── providers/         # Solana wallet + app providers
│   ├── globals.css        # Sketch theme + custom CSS
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/
│   └── supabase/          # Supabase client helpers (browser + server)
├── supabase/
│   └── schema.sql         # Full DB schema with RLS policies
├── proxy.ts               # Next.js 16 proxy (auth middleware)
├── .env.example           # Environment variable template
└── README.md
```

---

## 🗺️ Build Phases

| Phase | Feature | Status |
|---|---|---|
| 0 | Landing page (sketch UI + animated bg + custom cursor) | ✅ Done |
| 1 | Foundation (Supabase auth + DB + Solana wallet connect) | ✅ Done |
| 2 | Dashboard + Project creation UI | 🔜 Next |
| 3 | Solana smart contract (escrow + milestones) | ⏳ |
| 4 | Dodo Payments integration (checkout + webhooks) | ⏳ |
| 5 | AI milestone generator (Gemini) | ⏳ |
| 6 | Agent payments (x402 protocol) | ⏳ |
| 7 | Polish (notifications, PDF receipts, analytics) | ⏳ |
| 8 | Deployment + traction + submission | ⏳ |

---

## 🔐 Security

- All secrets in `.env.local` — never committed (see `.gitignore`)
- Row-Level Security (RLS) on all Supabase tables
- Webhook signature verification for Dodo events
- Wallet authentication via Solana wallet adapter

---

## 🤝 Built By

Made with ❤️ in India for the **Dodo Payments × Superteam India** hackathon track at Solana Frontier.

---

## 📄 License

MIT
