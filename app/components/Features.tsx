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
    desc: "Client ka paisa Solana blockchain pe secure locker mein. No cheating, no ghosting.",
    color: "sketch-card-yellow",
    iconBg: "bg-accent-yellow",
    tag: "Core",
    rotation: "-2deg",
  },
  {
    icon: Target,
    title: "Milestone Payments",
    desc: "Project ko 3–5 milestones mein todo. Har milestone pe alag payment release.",
    color: "sketch-card-pink",
    iconBg: "bg-accent-pink",
    tag: "Core",
    rotation: "1deg",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    desc: "Approval ke 2 seconds baad USDC freelancer ke wallet mein. No 5-day wait.",
    color: "sketch-card-green",
    iconBg: "bg-accent-green",
    tag: "Core",
    rotation: "-1deg",
  },
  {
    icon: CreditCard,
    title: "Dodo Payments",
    desc: "Client normal card/UPI se pay kare. Dodo handles fiat → USDC seamlessly.",
    color: "sketch-card-orange",
    iconBg: "bg-accent-orange",
    tag: "Winning",
    rotation: "2deg",
  },
  {
    icon: Sparkles,
    title: "AI Milestone Assistant",
    desc: "Project describe karo, Gemini 3 seconds mein smart milestones suggest karta hai.",
    color: "sketch-card-purple",
    iconBg: "bg-accent-purple",
    tag: "AI",
    rotation: "-1.5deg",
  },
  {
    icon: Shield,
    title: "AI Risk Detection",
    desc: "Suspicious behaviour, fake proofs, fraud patterns AI auto-detect karta hai.",
    color: "sketch-card-blue",
    iconBg: "bg-accent-blue",
    tag: "AI",
    rotation: "1.5deg",
  },
  {
    icon: FileText,
    title: "Auto Invoicing",
    desc: "Invoices, receipts, payout logs, tax summaries — sab auto-generate ho jaata hai.",
    color: "sketch-card-yellow",
    iconBg: "bg-accent-yellow",
    tag: "Utility",
    rotation: "-2deg",
  },
  {
    icon: Star,
    title: "Reputation System",
    desc: "On-chain reputation score. More trust = better projects = more income.",
    color: "sketch-card-pink",
    iconBg: "bg-accent-pink",
    tag: "Trust",
    rotation: "1deg",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    desc: "Escrow funded, milestone approved, payout released — turant notifications.",
    color: "sketch-card-green",
    iconBg: "bg-accent-green",
    tag: "UX",
    rotation: "-1deg",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Earnings, pending payouts, client activity, payment charts — sab ek jagah.",
    color: "sketch-card-orange",
    iconBg: "bg-accent-orange",
    tag: "Insights",
    rotation: "2deg",
  },
  {
    icon: Bot,
    title: "Agent Payments (x402)",
    desc: "AI agents ko autonomous micropayments. Humans + agents saath kaam, saath payment.",
    color: "sketch-card-purple",
    iconBg: "bg-accent-purple",
    tag: "Bonus 🔥",
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
                {/* Tag */}
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-ink text-paper font-[family-name:var(--font-sketch)] text-xs rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                  {f.tag}
                </div>

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
