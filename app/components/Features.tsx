"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Target,
  Zap,
  CreditCard,
  Sparkles,
  Shield,
  FileText,
  Star,
  Bell,
  BarChart3,
  Bot,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Smart Escrow Vault",
    desc: "Client funds are locked in a Solana smart contract. No cheating, no ghosting, no disputes.",
    color: "sketch-card-yellow",
    iconBg: "bg-accent-yellow",
    rotation: "-2deg",
  },
  {
    icon: Target,
    title: "Milestone Payments",
    desc: "Break any project into 3–5 milestones. Each milestone releases a separate payment on approval.",
    color: "sketch-card-pink",
    iconBg: "bg-accent-pink",
    rotation: "1deg",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    desc: "USDC lands in your wallet within 2 seconds of approval. No 5-day bank delays.",
    color: "sketch-card-green",
    iconBg: "bg-accent-green",
    rotation: "-1deg",
  },
  {
    icon: CreditCard,
    title: "Stripe Payments",
    desc: "Clients pay with any card, UPI, or bank transfer. Stripe handles fiat → USDC seamlessly.",
    color: "sketch-card-orange",
    iconBg: "bg-accent-orange",
    rotation: "2deg",
  },
  {
    icon: Sparkles,
    title: "AI Milestone Assistant",
    desc: "Describe your project and Gemini AI generates smart, structured milestones in under 3 seconds.",
    color: "sketch-card-purple",
    iconBg: "bg-accent-purple",
    rotation: "-1.5deg",
  },
  {
    icon: Shield,
    title: "AI Risk Detection",
    desc: "Suspicious behaviour, fake proofs, and fraud patterns are automatically flagged by AI.",
    color: "sketch-card-blue",
    iconBg: "bg-accent-blue",
    rotation: "1.5deg",
  },
  {
    icon: FileText,
    title: "Auto Invoicing",
    desc: "Invoices, receipts, payout logs, and tax summaries are generated automatically after every payment.",
    color: "sketch-card-yellow",
    iconBg: "bg-accent-yellow",
    rotation: "-2deg",
  },
  {
    icon: Star,
    title: "Reputation System",
    desc: "Build an on-chain reputation score. Higher trust means better projects and higher income.",
    color: "sketch-card-pink",
    iconBg: "bg-accent-pink",
    rotation: "1deg",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    desc: "Instant notifications when escrow is funded, a milestone is approved, or a payout is released.",
    color: "sketch-card-green",
    iconBg: "bg-accent-green",
    rotation: "-1deg",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track earnings, pending payouts, client activity, and payment charts — all in one place.",
    color: "sketch-card-orange",
    iconBg: "bg-accent-orange",
    rotation: "2deg",
  },
  {
    icon: Bot,
    title: "Agent Payments (x402)",
    desc: "AI agents receive autonomous micropayments via the x402 protocol. Humans and agents, paid together.",
    color: "sketch-card-purple",
    iconBg: "bg-accent-purple",
    rotation: "-1.5deg",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-14 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-hand)] text-lg text-accent-orange mb-1"
          >
            ~ what makes us different ~
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-marker)] text-3xl md:text-4xl text-ink mb-3"
          >
            Everything you need.{" "}
            <span className="squiggle squiggle-green">Nothing you don&apos;t.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-[family-name:var(--font-body)] text-sm text-ink-soft max-w-2xl mx-auto"
          >
            11 features designed to fix the broken payment experience for{" "}
            <span className="highlight">Indian freelancers</span> working with
            global clients.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`sketch-card ${f.color}`}
                style={{ transform: `rotate(${f.rotation})` }}
              >
                {/* Icon */}
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px_17px_15px_18px] ${f.iconBg} border-[2.5px] border-ink shadow-[3px_3px_0_#1a1a1a] mb-3`}
                >
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </div>

                <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink mb-1">
                  {f.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
