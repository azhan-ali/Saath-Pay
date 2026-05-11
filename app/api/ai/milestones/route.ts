/**
 * POST /api/ai/milestones
 *
 * Generates milestone breakdown using Google Gemini 2.0 Flash.
 * Phase 5 — full implementation with auth, rate limiting, validation.
 *
 * Body:    { description: string, totalAmount: number }
 * Returns: { milestones: Milestone[], demoMode: boolean, model?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
// Try flash first, fall back to flash-8b (lower quota usage)
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// ── Rate limiting (in-memory, resets on server restart) ──────────────────────
// For production use Redis/Upstash. For hackathon, in-memory is fine.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;       // max calls per window
const RATE_WINDOW = 60_000;  // 1 minute window

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// ── Demo milestones (fallback when no Gemini key) ─────────────────────────────
function getDemoMilestones(totalAmount: number, description: string) {
  // Try to make demo milestones somewhat relevant to the description
  const isDesign = /design|ui|ux|figma|wireframe/i.test(description);
  const isAI = /ai|ml|model|chatbot|nlp|gpt/i.test(description);
  const isMobile = /mobile|app|ios|android|flutter/i.test(description);

  const templates = isAI
    ? [
        { name: "Data & Architecture", deliverable: "Dataset prep + model architecture doc", estimated_days: 3 },
        { name: "Model Training", deliverable: "Trained model with evaluation metrics", estimated_days: 7 },
        { name: "API Integration", deliverable: "REST API with model endpoints", estimated_days: 4 },
        { name: "Testing & Deploy", deliverable: "Production deployment + monitoring", estimated_days: 3 },
      ]
    : isMobile
    ? [
        { name: "UI/UX Design", deliverable: "Figma screens + prototype", estimated_days: 4 },
        { name: "Core Features", deliverable: "Main app screens + navigation", estimated_days: 8 },
        { name: "Backend Integration", deliverable: "API integration + auth", estimated_days: 5 },
        { name: "Testing & Launch", deliverable: "App store submission + bug fixes", estimated_days: 3 },
      ]
    : [
        { name: "Discovery & Design", deliverable: "Wireframes + design mockups (Figma)", estimated_days: 3 },
        { name: "Core Development", deliverable: "Working backend API + database schema", estimated_days: 7 },
        { name: "Frontend Integration", deliverable: "Fully functional UI connected to API", estimated_days: 5 },
        { name: "Testing & Deployment", deliverable: "Production deployment + documentation", estimated_days: 2 },
      ];

  const splits = [0.2, 0.35, 0.25, 0.2];
  return templates.map((m, i) => ({
    ...m,
    amount: Math.round(totalAmount * splits[i] * 100) / 100,
  }));
}

// ── Gemini call with model fallback ──────────────────────────────────────────
async function callGemini(description: string, totalAmount: number): Promise<{
  milestones: Array<{ name: string; deliverable: string; amount: number; estimated_days: number }>;
  model: string;
}> {
  const prompt = `You are an expert project manager for software and AI projects.

Project description: "${description}"
Total budget: $${totalAmount} USD

Break this into 3-5 milestones. Return ONLY a valid JSON array:
[
  {
    "name": "short milestone name (2-5 words)",
    "deliverable": "specific, verifiable output the client can check",
    "amount": <number, no $ sign>,
    "estimated_days": <integer>
  }
]

Rules:
- amounts MUST sum to exactly ${totalAmount}
- deliverables must be concrete (e.g. "Figma file with 10 screens", not "design work")
- milestones in logical order
- ONLY return the JSON array, no markdown, no explanation`;

  let lastError: Error | null = null;

  // Try each model in order until one works
  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (res.status === 429) {
        // Rate limited on this model — try next
        lastError = new Error(`${model} quota exceeded`);
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        lastError = new Error(`Gemini ${model} error ${res.status}: ${err.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const milestones = JSON.parse(cleaned);

      if (!Array.isArray(milestones) || milestones.length === 0) {
        lastError = new Error(`${model} returned empty array`);
        continue;
      }

      // Fix amounts to sum exactly to totalAmount
      const sum = milestones.reduce((acc: number, m: { amount: number }) => acc + Number(m.amount), 0);
      if (Math.abs(sum - totalAmount) > 0.01) {
        const diff = totalAmount - milestones.slice(0, -1).reduce((a: number, m: { amount: number }) => a + Number(m.amount), 0);
        milestones[milestones.length - 1].amount = Math.round(diff * 100) / 100;
      }

      return { milestones, model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check (optional but good practice — prevents abuse)
  let userId = "anonymous";
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Non-fatal — continue without auth
    }
  }

  // Rate limit
  const { allowed, remaining } = checkRateLimit(userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in 1 minute." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      },
    );
  }

  // Parse body
  const body = await req.json().catch(() => ({}));
  const { description, totalAmount } = body as {
    description?: string;
    totalAmount?: number;
  };

  if (!description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  if (!totalAmount || Number(totalAmount) <= 0) {
    return NextResponse.json({ error: "totalAmount must be a positive number" }, { status: 400 });
  }
  if (description.length > 2000) {
    return NextResponse.json({ error: "description too long (max 2000 chars)" }, { status: 400 });
  }

  const amount = Number(totalAmount);

  // No Gemini key → demo mode
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        milestones: getDemoMilestones(amount, description),
        demoMode: true,
        model: "demo",
        message: "Add GEMINI_API_KEY to .env.local for real AI generation",
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  }

  // Try Gemini with model fallback
  try {
    const { milestones, model } = await callGemini(description, amount);
    return NextResponse.json(
      { milestones, demoMode: false, model },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  } catch (err) {
    console.error("Gemini generation failed:", err);
    const isQuota = err instanceof Error && err.message.includes("quota");
    return NextResponse.json(
      {
        milestones: getDemoMilestones(amount, description),
        demoMode: true,
        model: "demo-fallback",
        warning: isQuota
          ? "Gemini daily quota exceeded — using smart demo milestones. Resets at midnight."
          : err instanceof Error ? err.message : "AI generation failed",
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  }
}
