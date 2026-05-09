import type { ReactNode } from "react";
import Link from "next/link";

export default function EmptyState({
  emoji,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  emoji: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Doodle box */}
      <div
        className="sketch-card sketch-card-yellow inline-block mb-6"
        style={{ transform: "rotate(-2deg)" }}
      >
        <span className="text-6xl">{emoji}</span>
      </div>
      <h3 className="font-[family-name:var(--font-marker)] text-3xl text-ink mb-2">
        {title}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-lg text-ink-soft max-w-sm mb-6">
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="sketch-btn sketch-btn-orange">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
