"use client";

import { motion } from "framer-motion";

/**
 * Animated, creative hand-drawn background.
 * - Notebook grid
 * - Floating doodles (stars, coins, arrows, hearts)
 * - Soft color blobs
 * - Coffee stain
 * - Torn paper corner
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base paper color */}
      <div className="absolute inset-0 bg-paper" />

      {/* Soft color blobs (dreamy) */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #ffd23f 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #ff6b9d 0%, transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #06a77d 0%, transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 right-1/4 w-[380px] h-[380px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #4a90e2 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Notebook grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a1a 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Paper noise texture */}
      <div
        className="absolute inset-0 opacity-[0.4] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 250 250'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.08 0'/></filter><rect width='250' height='250' filter='url(%23n)'/></svg>")`,
          backgroundSize: "250px 250px",
        }}
      />

      {/* Coffee stain top-right */}
      <svg
        className="absolute top-[8%] right-[5%] opacity-[0.12]"
        width="180"
        height="180"
        viewBox="0 0 200 200"
      >
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="75"
          fill="#8b4513"
          transform="rotate(-15 100 100)"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="68"
          fill="#fdfaf2"
          transform="rotate(-10 100 100)"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="62"
          ry="62"
          fill="#8b4513"
          opacity="0.5"
        />
      </svg>

      {/* Floating doodle: star */}
      <motion.svg
        className="absolute top-[18%] left-[7%]"
        width="50"
        height="50"
        viewBox="0 0 60 60"
        animate={{ rotate: [0, 360], y: [0, -15, 0] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <path
          d="M30 5 L35 22 L53 22 L38 33 L44 50 L30 40 L16 50 L22 33 L7 22 L25 22 Z"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </motion.svg>

      {/* Floating doodle: dollar coin */}
      <motion.div
        className="absolute top-[45%] left-[4%]"
        animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-green border-[3px] border-ink shadow-[3px_3px_0_#1a1a1a]">
          <span className="font-[family-name:var(--font-marker)] text-2xl text-white">
            $
          </span>
        </div>
      </motion.div>

      {/* Floating doodle: heart */}
      <motion.svg
        className="absolute top-[70%] left-[10%]"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        animate={{ scale: [1, 1.2, 1], rotate: [-8, 8, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M20 34 C 20 34, 4 22, 4 12 C 4 6, 9 3, 14 3 C 17 3, 20 6, 20 10 C 20 6, 23 3, 26 3 C 31 3, 36 6, 36 12 C 36 22, 20 34, 20 34 Z"
          fill="#ff6b9d"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </motion.svg>

      {/* Floating doodle: rupee */}
      <motion.div
        className="absolute top-[28%] right-[8%]"
        animate={{ y: [0, 15, 0], rotate: [5, -5, 5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-orange border-[3px] border-ink shadow-[3px_3px_0_#1a1a1a]">
          <span className="font-[family-name:var(--font-marker)] text-2xl text-white">
            ₹
          </span>
        </div>
      </motion.div>

      {/* Floating doodle: lightning */}
      <motion.svg
        className="absolute top-[55%] right-[6%]"
        width="50"
        height="60"
        viewBox="0 0 50 60"
        animate={{ rotate: [-10, 10, -10], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M28 2 L8 32 L20 32 L15 58 L42 24 L28 24 L35 2 Z"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </motion.svg>

      {/* Floating doodle: sparkle */}
      <motion.svg
        className="absolute top-[82%] right-[12%]"
        width="45"
        height="45"
        viewBox="0 0 45 45"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M22.5 2 L26 19 L43 22.5 L26 26 L22.5 43 L19 26 L2 22.5 L19 19 Z"
          fill="#9b59b6"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </motion.svg>

      {/* Squiggly arrow mid */}
      <motion.svg
        className="absolute top-[38%] left-[42%] hidden lg:block"
        width="100"
        height="50"
        viewBox="0 0 100 50"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M5 25 Q 25 5 50 25 T 90 25"
          fill="none"
          stroke="#4a90e2"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M80 15 L95 25 L80 35"
          fill="none"
          stroke="#4a90e2"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </motion.svg>

      {/* Plus signs scattered */}
      {[
        { top: "15%", left: "35%", color: "#ff6b35", size: 16, delay: 0 },
        { top: "60%", left: "28%", color: "#06a77d", size: 20, delay: 0.5 },
        { top: "25%", right: "28%", color: "#4a90e2", size: 14, delay: 1 },
        { top: "78%", right: "32%", color: "#ff6b9d", size: 18, delay: 1.5 },
        { top: "50%", left: "55%", color: "#ffd23f", size: 22, delay: 2 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute font-[family-name:var(--font-marker)] font-bold opacity-50"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            color: p.color,
            fontSize: p.size,
          }}
          animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          +
        </motion.div>
      ))}

      {/* Dot pattern in corners */}
      <div
        className="absolute top-0 left-0 w-40 h-40 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #1a1a1a 1.5px, transparent 1.5px)",
          backgroundSize: "15px 15px",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-40 h-40 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #1a1a1a 1.5px, transparent 1.5px)",
          backgroundSize: "15px 15px",
        }}
      />

      {/* Handwritten notes scattered */}
      <div
        className="absolute top-[22%] left-[25%] hidden xl:block font-[family-name:var(--font-hand)] text-accent-orange opacity-40 rotate-[-8deg]"
        style={{ fontSize: "22px" }}
      >
        super fast! ⚡
      </div>
      <div
        className="absolute top-[68%] right-[20%] hidden xl:block font-[family-name:var(--font-hand)] text-accent-green opacity-40 rotate-[6deg]"
        style={{ fontSize: "22px" }}
      >
        zero fees 💸
      </div>
      <div
        className="absolute top-[88%] left-[30%] hidden xl:block font-[family-name:var(--font-hand)] text-accent-pink opacity-40 rotate-[-4deg]"
        style={{ fontSize: "22px" }}
      >
        made in India 🇮🇳
      </div>

      {/* Light vignette at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.05) 100%)",
        }}
      />
    </div>
  );
}
