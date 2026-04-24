/**
 * ────────────────────────────────────────────────────────────────────────────
 * Reputation Rescue AI — core generation logic
 * ────────────────────────────────────────────────────────────────────────────
 *
 * This file is intentionally framework-agnostic. It exports a single pure
 * function, `generateRescuePackCore`, that:
 *   1. Takes validated rescue input.
 *   2. Calls the AI (Gemini via the Lovable AI Gateway) with a strict system
 *      prompt and a structured-output tool schema.
 *   3. Returns a typed `RescuePack`.
 *
 * Keeping the AI logic here (and **not** inside the TanStack server function
 * directly) means it can be reused from:
 *   - `src/lib/rescue.functions.ts`  (web app server function)
 *   - A future Supabase edge function / webhook
 *   - A CLI or cron job
 *
 * ────────────────────────────────────────────────────────────────────────────
 * API KEY
 * ────────────────────────────────────────────────────────────────────────────
 * Server-only env vars (never expose to the client):
 *   LOVABLE_API_KEY  — preferred on Lovable Cloud. Proxies Gemini and handles
 *                      billing. Read from `process.env.LOVABLE_API_KEY`.
 *   GEMINI_API_KEY   — use this if you call Google's Gemini REST API directly
 *                      (e.g. after migrating off Lovable). Swap the fetch URL
 *                      + auth header in `callRescueModel` accordingly.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";

// ── Input validation ───────────────────────────────────────────────────────

export const RescueInputSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  businessType: z.string().trim().max(80).optional().default(""),
  reviewText: z.string().trim().min(5).max(3000),
  starRating: z.number().int().min(1).max(5),
  tone: z.enum(["apologetic", "warm", "firm", "professional", "empathetic"]),
  ownerContext: z.string().trim().max(1000).optional().default(""),
});

export type RescueInput = z.infer<typeof RescueInputSchema>;

// ── Output shape ───────────────────────────────────────────────────────────
//
// The model returns snake_case keys to match the product spec. We normalize
// to camelCase `RescuePack` before returning so the rest of the app (UI
// components, DB columns) can keep the idiomatic JS naming.

export type RescuePack = {
  shortReply: string;
  warmReply: string;
  firmReply: string;
  privateMessage: string;
  whatNotToSay: string[];
  actionChecklist: string[];
  flagGuidance: string;
};

type RawRescuePack = {
  short_public_reply: string;
  warm_public_reply: string;
  firm_public_reply: string;
  private_recovery_message: string;
  what_not_to_say: string[];
  owner_action_checklist: string[];
  flag_guidance: string;
};

// ── System prompt ──────────────────────────────────────────────────────────

export const RESCUE_SYSTEM_PROMPT = `You are Reputation Rescue AI, a professional reputation damage-control assistant for local businesses. Help business owners respond to negative public reviews calmly, professionally, and ethically.

Rules:
- Avoid defensive, aggressive, sarcastic, or legally risky language.
- Never insult the reviewer.
- Never admit legal liability.
- Never promise compensation unless the user explicitly provided that policy.
- Never claim a review can definitely be removed.
- If a review may violate platform policies, say it may be worth reviewing the platform's policy and flagging it, but do not guarantee removal.
- Keep public replies concise, human, and brand-safe.
- Move sensitive details into private follow-up.
- Never generate fake reviews.
- Never recommend manipulating review platforms.

Return structured JSON using the provided tool with exactly these keys:
- short_public_reply         (string, under ~40 words)
- warm_public_reply          (string, 50–90 words)
- firm_public_reply          (string, 60–100 words, still calm and professional)
- private_recovery_message   (string, 80–140 words, invites offline resolution)
- what_not_to_say            (array of 4–6 short phrases/traps to avoid)
- owner_action_checklist     (array of 4–7 concrete internal actions)
- flag_guidance              (string, one short paragraph; note it MAY be worth flagging if the review appears to violate platform policy, but do not guarantee removal)

Match the owner's requested tone, but keep a professional baseline at all times.`;

// ── Tool / JSON schema ─────────────────────────────────────────────────────

const RESCUE_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "rescue_pack",
    description: "Return the complete rescue pack for the review.",
    parameters: {
      type: "object",
      properties: {
        short_public_reply: {
          type: "string",
          description: "Short public reply, under ~40 words.",
        },
        warm_public_reply: {
          type: "string",
          description: "Warm public reply, 50–90 words.",
        },
        firm_public_reply: {
          type: "string",
          description:
            "Firm but professional public reply, 60–100 words. Never aggressive.",
        },
        private_recovery_message: {
          type: "string",
          description:
            "Private customer recovery message, 80–140 words. Invites offline resolution.",
        },
        what_not_to_say: {
          type: "array",
          items: { type: "string" },
          description: "4–6 short phrases or traps to avoid.",
        },
        owner_action_checklist: {
          type: "array",
          items: { type: "string" },
          description: "4–7 concrete internal owner actions.",
        },
        flag_guidance: {
          type: "string",
          description:
            "Short paragraph on whether the review may warrant flagging per platform policy. Never guarantee removal.",
        },
      },
      required: [
        "short_public_reply",
        "warm_public_reply",
        "firm_public_reply",
        "private_recovery_message",
        "what_not_to_say",
        "owner_action_checklist",
        "flag_guidance",
      ],
      additionalProperties: false,
    },
  },
};

// ── User prompt builder ────────────────────────────────────────────────────

function buildUserPrompt(input: RescueInput): string {
  return `Business name: ${input.businessName}
Business type: ${input.businessType || "Local business"}
Star rating given: ${input.starRating}/5
Desired tone: ${input.tone}
Owner context (optional, private — only use if it authorizes specific claims/comp): ${input.ownerContext || "(none)"}

Review text:
"""${input.reviewText}"""

Generate the full rescue pack using the rescue_pack tool. Follow every rule in the system prompt.`;
}

// ── AI call ────────────────────────────────────────────────────────────────

async function callRescueModel(input: RescueInput): Promise<RawRescuePack> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: RESCUE_SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
        tools: [RESCUE_TOOL_SCHEMA],
        tool_choice: {
          type: "function",
          function: { name: "rescue_pack" },
        },
      }),
    }
  );

  if (response.status === 429) {
    throw new Error("Rate limit reached. Please try again in a moment.");
  }
  if (response.status === 402) {
    throw new Error(
      "AI credits exhausted. Add funds in Settings → Workspace → Usage."
    );
  }
  if (!response.ok) {
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error("AI gateway error. Please try again.");
  }

  const json = await response.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) {
    throw new Error("AI did not return a structured rescue pack.");
  }

  return JSON.parse(call.function.arguments) as RawRescuePack;
}

// ── Normalization ──────────────────────────────────────────────────────────

function normalize(raw: RawRescuePack): RescuePack {
  return {
    shortReply: raw.short_public_reply,
    warmReply: raw.warm_public_reply,
    firmReply: raw.firm_public_reply,
    privateMessage: raw.private_recovery_message,
    whatNotToSay: raw.what_not_to_say ?? [],
    actionChecklist: raw.owner_action_checklist ?? [],
    flagGuidance: raw.flag_guidance,
  };
}

// ── Public entry point ─────────────────────────────────────────────────────

/**
 * Generate a complete Reputation Rescue pack for a single negative review.
 *
 * Pure function — no framework, no HTTP layer. Wrap it in `createServerFn`
 * (see `src/lib/rescue.functions.ts`) or call it from an edge function.
 *
 * Throws on validation errors, rate limits, billing errors, and any upstream
 * AI failure. The caller is responsible for turning thrown errors into a
 * user-facing response.
 */
export async function generateRescuePackCore(
  input: RescueInput
): Promise<RescuePack> {
  const validated = RescueInputSchema.parse(input);
  const raw = await callRescueModel(validated);
  return normalize(raw);
}
