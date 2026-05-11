/**
 * POST /api/agents/[id]/toggle
 * Toggles an agent's active/inactive status.
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id: agentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { projectId } = body as { projectId?: string };

  // Verify ownership via project
  const { data: agent } = await supabase
    .from("ai_agents")
    .select("id, is_active, project_id")
    .eq("id", agentId)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", agent.project_id)
    .eq("freelancer_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { error } = await supabase
    .from("ai_agents")
    .update({ is_active: !agent.is_active })
    .eq("id", agentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, isActive: !agent.is_active });
}
