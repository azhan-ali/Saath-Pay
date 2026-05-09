"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SaathPay Custom Cursor — v2
 *
 * Design: Hand-drawn pencil nib that matches the sketch/paper theme.
 *   • Default  → small orange marker dot + wobbly ink ring (lagging slightly)
 *   • Hover    → ring fills yellow, dot turns black, label appears
 *   • Click    → ink splat burst (paper-themed colors)
 *
 * Performance: ALL position updates go directly to DOM via refs.
 * Zero React state updates during mouse movement → zero lag.
 */
export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // DOM refs — we write to these directly, never via setState
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // RAF-based ring lerp state (plain object, not React state)
  const mouse  = useRef({ x: -200, y: -200 });
  const ring   = useRef({ x: -200, y: -200 });
  const rafId  = useRef<number>(0);
  const isHover = useRef(false);

  useEffect(() => {
    setMounted(true);
    setIsTouch(
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches,
    );
  }, []);

  useEffect(() => {
    if (!mounted || isTouch) return;

    // ── RAF loop: lerp ring toward mouse ──────────────────────────────────
    const tick = () => {
      const speed = isHover.current ? 0.12 : 0.16;
      ring.current.x += (mouse.current.x - ring.current.x) * speed;
      ring.current.y += (mouse.current.y - ring.current.y) * speed;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // ── Mouse move ────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      // Move dot instantly (no lag)
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Hover detection
      const el = e.target as HTMLElement;
      const interactive = el.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor-hover]",
      );

      if (interactive) {
        if (!isHover.current) {
          isHover.current = true;
          dotRef.current?.classList.add("cursor-hover");
          ringRef.current?.classList.add("ring-hover");
        }
        // Label
        if (labelRef.current) {
          const lbl =
            interactive.getAttribute("data-cursor-label") ||
            (interactive.tagName === "A"       ? "open →"     :
             interactive.tagName === "BUTTON"  ? "click!"     :
             interactive.tagName === "INPUT" ||
             interactive.tagName === "TEXTAREA"? "type here"  : "tap!");
          labelRef.current.textContent = lbl;
          labelRef.current.style.opacity = "1";
          labelRef.current.style.transform = "translateX(-50%) translateY(0)";
        }
      } else {
        if (isHover.current) {
          isHover.current = false;
          dotRef.current?.classList.remove("cursor-hover");
          ringRef.current?.classList.remove("ring-hover");
        }
        if (labelRef.current) {
          labelRef.current.style.opacity = "0";
          labelRef.current.style.transform = "translateX(-50%) translateY(-4px)";
        }
      }
    };

    // ── Click: ink splat ──────────────────────────────────────────────────
    const onDown = (e: MouseEvent) => {
      dotRef.current?.classList.add("cursor-click");
      ringRef.current?.classList.add("ring-click");
      spawnSplat(e.clientX, e.clientY);
    };

    const onUp = () => {
      dotRef.current?.classList.remove("cursor-click");
      ringRef.current?.classList.remove("ring-click");
    };

    const onLeave = () => {
      mouse.current = { x: -200, y: -200 };
      if (dotRef.current)  dotRef.current.style.transform  = "translate(-200px, -200px)";
      if (ringRef.current) ringRef.current.style.transform = "translate(-200px, -200px)";
    };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted, isTouch]);

  if (!mounted || isTouch) return null;

  return (
    <>
      {/* ── Dot (pen nib tip) — moves instantly ── */}
      <div
        ref={dotRef}
        id="sp-cursor-dot"
        className="pointer-events-none fixed left-0 top-0 z-[10000]"
        style={{ willChange: "transform" }}
      />

      {/* ── Ring (lagging follower) ── */}
      <div
        ref={ringRef}
        id="sp-cursor-ring"
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ willChange: "transform" }}
      >
        {/* Hover label inside ring container so it follows */}
        <div
          ref={labelRef}
          id="sp-cursor-label"
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(100% + 8px)",
            transform: "translateX(-50%) translateY(-4px)",
            opacity: 0,
            transition: "opacity 0.15s, transform 0.15s",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Global styles ── */}
      <style>{`
        /* Hide native cursor everywhere */
        *, *::before, *::after { cursor: none !important; }

        /* ── Dot ── */
        #sp-cursor-dot {
          width: 10px;
          height: 10px;
          margin-left: -5px;
          margin-top: -5px;
          border-radius: 50%;
          background: #ff6b35;
          border: 2px solid #1a1a1a;
          box-shadow: 1px 1px 0 #1a1a1a;
          transition: width 0.12s, height 0.12s, margin 0.12s, background 0.12s, border-radius 0.12s;
        }
        #sp-cursor-dot.cursor-hover {
          width: 14px;
          height: 14px;
          margin-left: -7px;
          margin-top: -7px;
          background: #1a1a1a;
          border-color: #ffd23f;
          box-shadow: 0 0 0 3px #ffd23f, 1px 1px 0 #1a1a1a;
        }
        #sp-cursor-dot.cursor-click {
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          background: #06a77d;
          border-color: #1a1a1a;
          box-shadow: 1px 1px 0 #1a1a1a;
        }

        /* ── Ring ── */
        #sp-cursor-ring {
          width: 36px;
          height: 36px;
          margin-left: -18px;
          margin-top: -18px;
          border: 2.5px solid #1a1a1a;
          /* Organic wobbly shape — matches sketch theme */
          border-radius: 52% 48% 55% 45% / 48% 52% 48% 52%;
          background: transparent;
          transition:
            width 0.18s cubic-bezier(.34,1.56,.64,1),
            height 0.18s cubic-bezier(.34,1.56,.64,1),
            margin 0.18s cubic-bezier(.34,1.56,.64,1),
            background 0.15s,
            border-color 0.15s,
            border-radius 0.3s;
        }
        #sp-cursor-ring.ring-hover {
          width: 52px;
          height: 52px;
          margin-left: -26px;
          margin-top: -26px;
          background: rgba(255, 210, 63, 0.35);
          border-color: #1a1a1a;
          border-radius: 48% 52% 45% 55% / 52% 48% 52% 48%;
          animation: ring-wobble 2s ease-in-out infinite;
        }
        #sp-cursor-ring.ring-click {
          width: 24px;
          height: 24px;
          margin-left: -12px;
          margin-top: -12px;
          border-style: dashed;
          border-color: #06a77d;
          background: rgba(6, 167, 125, 0.1);
        }

        /* ── Label ── */
        #sp-cursor-label {
          background: #1a1a1a;
          color: #fdfaf2;
          font-family: 'Permanent Marker', cursive;
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 8px 10px 9px 11px;
          border: 2px solid #1a1a1a;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
          letter-spacing: 0.3px;
        }

        /* ── Animations ── */
        @keyframes ring-wobble {
          0%, 100% { border-radius: 48% 52% 45% 55% / 52% 48% 52% 48%; }
          33%       { border-radius: 55% 45% 52% 48% / 45% 55% 45% 55%; }
          66%       { border-radius: 45% 55% 48% 52% / 55% 45% 55% 45%; }
        }

        /* ── Ink splat ── */
        .sp-splat {
          position: fixed;
          pointer-events: none;
          z-index: 9998;
          width: 0;
          height: 0;
        }
        .sp-splat-dot {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid #1a1a1a;
          animation: splat-fly var(--dur) ease-out forwards;
        }
        @keyframes splat-fly {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: translate(
                   calc(-50% + var(--dx)),
                   calc(-50% + var(--dy))
                 ) scale(0.2);
                 opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ── Ink splat spawner (pure DOM, no React) ────────────────────────────────────
const SPLAT_COLORS = ["#ff6b35", "#ffd23f", "#06a77d", "#ff6b9d", "#4a90e2", "#9b59b6", "#1a1a1a"];

function spawnSplat(x: number, y: number) {
  const container = document.createElement("div");
  container.className = "sp-splat";
  container.style.left = `${x}px`;
  container.style.top  = `${y}px`;

  const count = 7;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360 + Math.random() * 20 - 10;
    const dist  = 28 + Math.random() * 20;
    const rad   = (angle * Math.PI) / 180;
    const dx    = Math.cos(rad) * dist;
    const dy    = Math.sin(rad) * dist;
    const size  = 5 + Math.random() * 5;
    const dur   = 0.45 + Math.random() * 0.2;
    const color = SPLAT_COLORS[i % SPLAT_COLORS.length];

    const dot = document.createElement("div");
    dot.className = "sp-splat-dot";
    dot.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      --dx: ${dx}px;
      --dy: ${dy}px;
      --dur: ${dur}s;
    `;
    container.appendChild(dot);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 700);
}
