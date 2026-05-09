import EmptyState from "@/app/components/EmptyState";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-blue">~ your numbers ~</p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Analytics</h1>
      </div>
      <EmptyState
        emoji="📊"
        title="Coming in Phase 7"
        description="Earnings charts, payment velocity, client retention, and settlement time analytics — all in one place."
        ctaLabel="← Back to dashboard"
        ctaHref="/dashboard"
      />
    </div>
  );
}
