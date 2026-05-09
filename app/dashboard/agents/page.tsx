import EmptyState from "@/app/components/EmptyState";

export default function AgentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-purple">~ autonomous workers ~</p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">AI Agents</h1>
      </div>
      <EmptyState
        emoji="🤖"
        title="Coming in Phase 6"
        description="Add AI agents to your projects. They earn autonomous micropayments via x402 protocol on Solana — no human approval needed."
        ctaLabel="← Back to projects"
        ctaHref="/dashboard/projects"
      />
    </div>
  );
}
