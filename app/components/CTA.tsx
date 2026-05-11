"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="py-14 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sketch-card sketch-card-yellow relative overflow-hidden"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          <div
            className="tape"
            style={{ top: "-10px", left: "15%", transform: "rotate(-5deg)", background: "rgba(255, 107, 157, 0.7)" }}
          />
          <div
            className="tape"
            style={{ top: "-10px", right: "15%", transform: "rotate(4deg)", background: "rgba(6, 167, 125, 0.6)" }}
          />

          <div className="text-center py-6">
            <p className="font-[family-name:var(--font-hand)] text-lg text-accent-orange mb-1">
              ~ ready to get paid faster? ~
            </p>
            <h2 className="font-[family-name:var(--font-marker)] text-3xl md:text-4xl text-ink mb-3">
              Join the{" "}
              <span className="squiggle">waitlist</span>
            </h2>
            <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft max-w-xl mx-auto mb-6">
              Be the first to try SaathPay. Pilot users get{" "}
              <span className="highlight-pink">lifetime 0% fees</span> +
              priority support from the founding team.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-5"
            >
              <div className="flex-1 relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  type="email"
                  placeholder="you@building.com"
                  className="w-full pl-11 pr-4 py-2.5 rough-box bg-paper font-[family-name:var(--font-body)] text-base text-ink placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[4px_4px_0_#1a1a1a] transition-shadow"
                />
              </div>
              <button
                type="submit"
                className="sketch-btn sketch-btn-orange group whitespace-nowrap"
              >
                <span>Join Waitlist</span>
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>

            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-[family-name:var(--font-sketch)] text-ink-soft">
              <span>✓ No credit card required</span>
              <span>✓ 30-second signup</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
