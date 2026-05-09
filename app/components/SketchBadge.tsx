import type { ReactNode } from "react";

type Color = "yellow" | "green" | "orange" | "pink" | "blue" | "purple" | "red" | "ink";

const colorMap: Record<Color, string> = {
  yellow: "bg-accent-yellow text-ink",
  green:  "bg-accent-green text-white",
  orange: "bg-accent-orange text-white",
  pink:   "bg-accent-pink text-white",
  blue:   "bg-accent-blue text-white",
  purple: "bg-accent-purple text-white",
  red:    "bg-red-400 text-white",
  ink:    "bg-ink text-paper",
};

export default function SketchBadge({
  children,
  color = "ink",
  className = "",
}: {
  children: ReactNode;
  color?: Color;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-[family-name:var(--font-sketch)] text-xs rounded-[8px_10px_9px_11px] shadow-[1.5px_1.5px_0_rgba(0,0,0,0.25)] ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}
