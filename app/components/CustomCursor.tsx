"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hand-drawn marker cursor.
 * - Big dot follower (the "pen tip")
 * - Wobbly outlined ring that lags behind
 * - Ink trail that fades
 * - Morphs on hover over interactive elements
 * - Sparkle burst on click
 */

type CursorVariant = "default" | "hover" | "click";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [hoverLabel, setHoverLabel] = useState<string>("");
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  const ringRef = useRef({ x: -100, y: -100 });
  const trailIdRef = useRef(0);
  const clickIdRef = useRef(0);

  // Detect touch device — skip cursor
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    }
  }, []);

  // Mouse tracking
  useEffect(() => {
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Add to trail (throttled via id)
      trailIdRef.current += 1;
      const newPoint: TrailPoint = {
        id: trailIdRef.current,
        x: e.clientX,
        y: e.clientY,
      };
      setTrail((prev) => [...prev.slice(-12), newPoint]);

      // Hover detection
      const el = e.target as HTMLElement;
      const interactive = el.closest(
        "a, button, input, textarea, [role='button'], [data-cursor-hover]",
      );

      if (interactive) {
        setVariant("hover");
        const label =
          interactive.getAttribute("data-cursor-label") ||
          (interactive.tagName === "A"
            ? "click →"
            : interactive.tagName === "BUTTON"
              ? "click me!"
              : interactive.tagName === "INPUT" || interactive.tagName === "TEXTAREA"
                ? "type here"
                : "tap!");
        setHoverLabel(label);
      } else {
        setVariant("default");
        setHoverLabel("");
      }
    };

    const handleDown = (e: MouseEvent) => {
      setVariant("click");
      clickIdRef.current += 1;
      const newClick = {
        id: clickIdRef.current,
        x: e.clientX,
        y: e.clientY,
      };
      setClicks((prev) => [...prev, newClick]);
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 600);
    };

    const handleUp = () => {
      setVariant((v) => (v === "click" ? "default" : v));
    };

    const handleLeave = () => {
      setPos({ x: -100, y: -100 });
      setRingPos({ x: -100, y: -100 });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [isTouch]);

  // Smooth ring follow
  useEffect(() => {
    if (isTouch) return;
    let raf: number;
    const animate = () => {
      ringRef.current.x += (pos.x - ringRef.current.x) * 0.18;
      ringRef.current.y += (pos.y - ringRef.current.y) * 0.18;
      setRingPos({ x: ringRef.current.x, y: ringRef.current.y });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [pos, isTouch]);

  // Trail fade: drop oldest every 40ms
  useEffect(() => {
    if (isTouch) return;
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 40);
    return () => clearInterval(interval);
  }, [isTouch]);

  if (!mounted || isTouch) return null;

  const dotSize = variant === "hover" ? 16 : variant === "click" ? 6 : 10;
  const ringSize = variant === "hover" ? 60 : variant === "click" ? 30 : 36;

  return (
    <>
      {/* Ink trail (fading dots behind cursor) */}
      {trail.map((t, i) => {
        const opacity = (i / trail.length) * 0.6;
        const size = 4 + (i / trail.length) * 6;
        return (
          <div
            key={t.id}
            className="pointer-events-none fixed z-[9998] rounded-full"
            style={{
              left: t.x,
              top: t.y,
              width: size,
              height: size,
              transform: "translate(-50%, -50%)",
              background: "#ff6b35",
              opacity,
              mixBlendMode: "multiply",
              transition: "opacity 0.3s",
            }}
          />
        );
      })}

      {/* Click sparkle bursts */}
      {clicks.map((c) => (
        <div
          key={c.id}
          className="pointer-events-none fixed z-[9999]"
          style={{
            left: c.x,
            top: c.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ClickBurst />
        </div>
      ))}

      {/* Outer wobbly ring */}
      <div
        className="pointer-events-none fixed z-[9999] transition-all duration-150 ease-out"
        style={{
          left: ringPos.x,
          top: ringPos.y,
          width: ringSize,
          height: ringSize,
          transform: "translate(-50%, -50%)",
          mixBlendMode: variant === "hover" ? "normal" : "multiply",
        }}
      >
        <svg
          width={ringSize}
          height={ringSize}
          viewBox="0 0 60 60"
          className={variant === "hover" ? "animate-spin-slow" : ""}
        >
          <circle
            cx="30"
            cy="30"
            r="26"
            fill={variant === "hover" ? "#ffd23f" : "none"}
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeDasharray={variant === "click" ? "3 3" : "0"}
            opacity={variant === "hover" ? "0.9" : "1"}
          />
          {/* Wobble second ring for hand-drawn feel */}
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>

        {/* Hover label */}
        {variant === "hover" && hoverLabel && (
          <div
            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-[8px_12px_10px_14px] border-[2px] border-ink bg-accent-orange px-3 py-1 font-[family-name:var(--font-marker)] text-sm text-white shadow-[2px_2px_0_#1a1a1a]"
            style={{ textShadow: "1px 1px 0 #1a1a1a" }}
          >
            {hoverLabel}
          </div>
        )}
      </div>

      {/* Inner pen tip dot (orange marker ink) */}
      <div
        className="pointer-events-none fixed z-[10000] rounded-full transition-all duration-75"
        style={{
          left: pos.x,
          top: pos.y,
          width: dotSize,
          height: dotSize,
          transform: "translate(-50%, -50%)",
          background:
            variant === "hover"
              ? "#1a1a1a"
              : variant === "click"
                ? "#06a77d"
                : "#ff6b35",
          boxShadow:
            variant === "hover"
              ? "0 0 0 3px #ffd23f, 1px 1px 0 #1a1a1a"
              : "1px 1px 0 #1a1a1a",
        }}
      />

      {/* Global cursor hide CSS */}
      <style jsx global>{`
        html,
        body,
        a,
        button,
        input,
        textarea,
        select,
        [role="button"] {
          cursor: none !important;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
}

/** Sparkle burst animation on click */
function ClickBurst() {
  const particles = Array.from({ length: 8 });
  return (
    <div className="relative">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const colors = ["#ff6b35", "#ffd23f", "#06a77d", "#ff6b9d", "#4a90e2"];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute left-0 top-0 h-2 w-2 rounded-full"
            style={{
              background: color,
              border: "1.5px solid #1a1a1a",
              animation: `burst-${i} 0.6s ease-out forwards`,
            }}
          />
        );
      })}
      <style jsx>{`
        ${particles
          .map((_, i) => {
            const angle = (i / particles.length) * 360;
            const rad = (angle * Math.PI) / 180;
            const dx = Math.cos(rad) * 40;
            const dy = Math.sin(rad) * 40;
            return `
              @keyframes burst-${i} {
                0% {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0);
                  opacity: 0;
                }
              }
            `;
          })
          .join("\n")}
      `}</style>
    </div>
  );
}
