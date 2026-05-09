"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { label: "Settlement time", saath: "< 2 sec", others: "3–7 days" },
  { label: "Transaction fee", saath: "< $0.01", others: "3–6%" },
  { label: "Currency conversion", saath: "Auto + free", others: "2–4% hidden" },
  { label: "Escrow protection", saath: "Smart contract", others: "Manual / None" },
  { label: "AI milestone help", saath: "Built-in", others: "Nope" },
  { label: "Agent payments (x402)", saath: "Supported", others: "Impossible" },
  { label: "Transparency", saath: "On-chain public", others: "Black box" },
  { label: "Built for Indians", saath: "🇮🇳 Yes", others: "🤷" },
];

export default function Comparison() {
  return (
    <section id="why" className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-hand)] text-2xl text-accent-pink mb-2"
          >
            ~ the honest comparison ~
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-marker)] text-4xl md:text-6xl text-ink mb-4"
          >
            SaathPay vs.{" "}
            <span className="text-stroke">the old way</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sketch-card bg-paper overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-[3px] border-dashed border-ink">
                  <th className="text-left py-4 px-4 font-[family-name:var(--font-marker)] text-lg">
                    Feature
                  </th>
                  <th className="text-left py-4 px-4 font-[family-name:var(--font-marker)] text-lg text-accent-green">
                    SaathPay 🇮🇳
                  </th>
                  <th className="text-left py-4 px-4 font-[family-name:var(--font-marker)] text-lg text-ink-soft">
                    Banks / PayPal / Wire
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className="border-b border-dashed border-ink/30 last:border-0"
                  >
                    <td className="py-4 px-4 font-[family-name:var(--font-body)] text-base text-ink">
                      {r.label}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sketch)] text-base font-bold text-accent-green">
                        <Check size={18} strokeWidth={3} />
                        {r.saath}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sketch)] text-base text-ink-soft">
                        <X size={18} strokeWidth={3} className="text-red-500" />
                        {r.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
