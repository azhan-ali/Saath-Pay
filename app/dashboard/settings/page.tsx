import EmptyState from "@/app/components/EmptyState";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange">~ preferences ~</p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Settings</h1>
      </div>
      <EmptyState
        emoji="⚙️"
        title="Coming soon"
        description="Profile settings, notification preferences, payout bank details, and API keys — all here."
        ctaLabel="← Back to dashboard"
        ctaHref="/dashboard"
      />
    </div>
  );
}
