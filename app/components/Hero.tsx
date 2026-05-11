"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-10 px-4 overflow-hidden">
      {/* Decorative background sketches */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Star doodle top-left */}
        <svg
          className="absolute top-24 left-8 md:left-20 wobble-anim"
          width="60"
          height="60"
          viewBox="0 0 60 60"
        >
          <path
            d="M30 5 L35 22 L53 22 L38 33 L44 50 L30 40 L16 50 L22 33 L7 22 L25 22 Z"
            fill="#ffd23f"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Circle scribble top-right */}
        <svg
          className="absolute top-36 right-12 md:right-32 float-anim"
          width="80"
          height="80"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="#ff6b9d"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
          <circle cx="40" cy="40" r="8" fill="#ff6b9d" />
        </svg>

        {/* Arrow scribble bottom-left */}
        <svg
          className="absolute bottom-20 left-4 md:left-32 hidden md:block"
          width="100"
          height="60"
          viewBox="0 0 100 60"
        >
          <path
            d="M5 40 Q 25 10 50 30 T 95 25"
            fill="none"
            stroke="#06a77d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M85 15 L95 25 L85 35"
            fill="none"
            stroke="#06a77d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Dollar sign */}
        <motion.div
          className="absolute top-1/3 right-8 md:right-40 hidden md:block"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-green border-[3px] border-ink shadow-[3px_3px_0_#1a1a1a]">
            <span className="font-[family-name:var(--font-marker)] text-2xl text-white">
              $
            </span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rough-box bg-accent-yellow shadow-[3px_3px_0_#1a1a1a]">
            <Sparkles size={18} className="text-ink" />
            <span className="font-[family-name:var(--font-sketch)] text-sm font-bold">
              Built for Dodo × Superteam India Hackathon
            </span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-center font-[family-name:var(--font-marker)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-ink leading-[1.15] mb-4"
        >
          Stop Waiting 7 Days
          <br />
          For Money You{" "}
          <span className="inline-block relative">
            <span className="highlight">Already</span>
          </span>
          <br />
          <span className="squiggle">Earned.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center font-[family-name:var(--font-body)] text-base md:text-lg text-ink-soft max-w-3xl mx-auto mb-3"
        >
          <span className="font-[family-name:var(--font-hand)] text-2xl md:text-3xl text-accent-orange">
            Work Together. Get Paid Together.
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center font-[family-name:var(--font-body)] text-sm md:text-base text-ink-soft max-w-2xl mx-auto mb-7"
        >
          Programmable stablecoin payment rails for Indian freelancers, SMEs &
          AI agents.{" "}
          <span className="highlight-green">Built on Solana.</span>{" "}
          <span className="highlight-pink">Powered by Dodo Payments.</span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <a href="#signup" className="sketch-btn sketch-btn-orange group">
            <span>Start Getting Paid</span>
            <ArrowRight
              size={20}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </a>
          <a href="#demo" className="sketch-btn sketch-btn-primary">
            <Zap size={18} className="mr-2" />
            <span>Watch 60s Demo</span>
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { value: "< 2s", label: "settlement time", color: "sketch-card-yellow" },
            { value: "$0.01", label: "gas fee", color: "sketch-card-pink" },
            { value: "80+", label: "currencies supported", color: "sketch-card-green" },
            { value: "0%", label: "wire fees 🎉", color: "sketch-card-blue" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className={`sketch-card ${stat.color} text-center py-3`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
            >
              <div className="font-[family-name:var(--font-marker)] text-2xl md:text-3xl text-ink">
                {stat.value}
              </div>
              <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, y: { duration: 2, repeat: Infinity } }}
          className="flex justify-center mt-8"
        >
          <div className="font-[family-name:var(--font-hand)] text-ink-soft flex flex-col items-center gap-1">
            <span>scroll down</span>
            <span className="text-2xl">↓</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
