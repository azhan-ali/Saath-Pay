import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange">~ preferences ~</p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Settings</h1>
        </div>
        <div className="rough-box bg-yellow-50 p-4 font-[family-name:var(--font-body)] text-sm text-yellow-800">
          Configure Supabase to manage your settings.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange">~ preferences ~</p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Settings</h1>
        <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
          Manage your profile, wallet, and account preferences.
        </p>
      </div>

      <SettingsForm
        userId={user.id}
        email={user.email ?? ""}
        initialProfile={{
          full_name: profile?.full_name ?? "",
          wallet_address: profile?.wallet_address ?? "",
          role: profile?.role ?? "freelancer",
          reputation_score: profile?.reputation_score ?? 50,
          total_earned: profile?.total_earned ?? 0,
          total_projects_completed: profile?.total_projects_completed ?? 0,
        }}
      />
    </div>
  );
}
