import CreateProjectForm from "./CreateProjectForm";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EmptyState from "@/app/components/EmptyState";

export default async function NewProjectPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        emoji="🔧"
        title="Supabase not configured"
        description="Add your Supabase keys to .env.local to create projects."
        ctaLabel="← Back"
        ctaHref="/dashboard"
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange">
          ~ new work ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">
          Create Project
        </h1>
        <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
          Set up milestones, share the payment link, get paid on-chain.
        </p>
      </div>
      <CreateProjectForm userId={user.id} />
    </div>
  );
}
