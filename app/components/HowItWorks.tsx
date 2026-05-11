"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    title: "Create Project",
    desc: "Freelancer creates project & AI generates milestones instantly.",
    emoji: "📝",
    color: "sketch-card-yellow",
  },
  {
    num: "2",
    title: "Client Pays via Dodo",
    desc: "Client pays with card, UPI or bank transfer. Dodo handles everything.",
    emoji: "💳",
    color: "sketch-card-orange",
  },
  {
    num: "3",
    title: "Locked on Solana",
    desc: "Funds auto-bridge to USDC & lock in escrow smart contract.",
    emoji: "🔒",
    color: "sketch-card-green",
  },
  {
    num: "4",
    title: "Work & Submit",
    desc: "Freelancer delivers milestones. Proof stored on-chain.",
    emoji: "🛠️",
    color: "sketch-card-blue",
  },
  {
    num: "5",
    title: "Client Approves",
    desc: "Client reviews & approves. Smart contract does the rest.",
    emoji: "✅",
    color: "sketch-card-pink",
  },
  {
    num: "6",
    title: "Instant USDC",
    desc: "Money in freelancer wallet in 2 seconds. No delays, no fees.",
    emoji: "⚡",
    color: "sketch-card-purple",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-14 px-4 relative bg-paper-dark/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-hand)] text-lg text-accent-green mb-1"
          >
            ~ how it works ~
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-marker)] text-3xl md:text-4xl text-ink mb-3"
          >
            Six steps.{" "}
            <span className="highlight-green">Zero headaches.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`sketch-card ${s.color} relative`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              {/* Washi tape on top */}
              <div
                className="tape"
                style={{
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(-3deg)",
                }}
              />

              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper font-[family-name:var(--font-marker)] text-lg border-[2.5px] border-ink shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
                  {s.num}
                </div>
                <div className="text-3xl">{s.emoji}</div>
              </div>

              <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink mb-1">
                {s.title}
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mt-10"
        >
          <p className="font-[family-name:var(--font-hand)] text-lg text-accent-orange mb-2">
            that&apos;s literally it ↓
          </p>
          <a href="#signup" className="sketch-btn sketch-btn-green">
            Try it yourself →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
