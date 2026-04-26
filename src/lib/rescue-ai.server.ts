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

export const RESCUE_SYSTEM_PROMPT = `You are Reputation Rescue AI, a professional reputation damage-control assistant for local businesses (especially restaurants, cafes, and hospitality). Help owners respond to negative public reviews calmly, professionally, ethically — and above all, SPECIFICALLY to what the reviewer actually said.

═══════════════════════════════════════════════════
SPECIFICITY REQUIREMENTS (most important rule)
═══════════════════════════════════════════════════
Generic replies damage reputation almost as much as the original review. Every public reply MUST:

1. Name 1–2 CONCRETE issues pulled directly from the review text. Examples of concrete issues to reference when present:
   - cold food / undercooked / overcooked
   - long wait for a table, food, or the check
   - rude, dismissive, or inattentive service
   - wrong order or missing items
   - cleanliness (table, restroom, cutlery)
   - booking / reservation issue
   - delivery issue (late, cold, wrong, damaged)
   - billing or pricing dispute
   - noise, temperature, ambience
   - allergen or dietary miscommunication

2. Use the reviewer's first name if it appears (e.g. "Hi Sarah,"). If no name is given, open with "Hi there," or similar — never "Dear Valued Customer."

3. Acknowledge ownership of the specific miss in plain language ("that's not the standard we aim for", "we fell short on X and Y") WITHOUT admitting legal liability, negligence, or fault in a legal sense.

4. Provide a direct private channel: a manager/owner contact line. Use the owner-provided email/phone from context if given; otherwise write "[manager email/phone]" as an obvious placeholder the owner will fill in.

5. End with a clear next step, not a vague platitude.

═══════════════════════════════════════════════════
BANNED PHRASES (do not use, paraphrase, or translate)
═══════════════════════════════════════════════════
- "We are very sorry to hear about your experience"
- "Sorry you feel that way"
- "At your convenience"
- "We strive for excellence"
- "Your feedback is important to us"
- "We take all feedback seriously"
- "We apologize for any inconvenience"
- "Valued customer"
- Any opener that could be copy-pasted onto any other review

═══════════════════════════════════════════════════
TONE & STYLE
═══════════════════════════════════════════════════
- Calm, human, direct. Short sentences.
- Restaurant/hospitality-specific vocabulary when relevant (service, kitchen, front of house, dish, table, booking).
- Match the owner's requested tone (apologetic / warm / firm / professional / empathetic) but keep a professional baseline.
- Never defensive, aggressive, sarcastic, passive-aggressive, or legally risky.
- Never insult or blame the reviewer.
- Never promise compensation, refunds, or free items unless the owner's private context explicitly authorizes it.
- Never claim or imply a review can be removed.
- If the review appears to violate platform policy (fake, off-topic, threats, hate speech, conflict of interest), note it MAY be worth reviewing the platform's policy and flagging — but do NOT guarantee removal.
- Move sensitive details (refunds, specific allegations, medical/allergen issues) into the private follow-up.
- Never fabricate facts the reviewer did not state. If a detail isn't in the review, don't invent it.
- Never generate fake reviews or recommend manipulating review platforms.

═══════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════
Return structured JSON using the provided tool with exactly these keys:
- short_public_reply         (string, UNDER 75 words. References 1–2 specific issues. Ends with a private contact line.)
- warm_public_reply          (string, 60–100 words. Empathetic, specific, ownership without liability, private contact line.)
- firm_public_reply          (string, 70–110 words. Calm and factual, politely corrects or reframes if the review is unfair, still invites private resolution. Never aggressive.)
- private_recovery_message   (string, 80–140 words. Direct message the owner can send 1:1 to the customer. Specific, human, offers to make it right within the owner's stated policy.)
- what_not_to_say            (array of 4–6 short phrases/traps to avoid for THIS specific review — tailor to the review's content, not generic advice.)
- owner_action_checklist     (array of 4–7 concrete internal actions tied to the specific issues raised — e.g. "Brief kitchen on ticket times for Friday service" rather than "Improve operations".)
- flag_guidance              (string, one short paragraph. State whether the review appears to violate platform policy and MAY warrant flagging, or clearly does not. Never guarantee removal.)

Good example of a short_public_reply (for a review mentioning cold food, long wait, inattentive service):
"Hi Sarah, we're sorry your visit fell short. Cold food, a long wait, and inattentive service are not the standard we aim for. We'd like to understand what happened on the night and make it right. Please contact our manager at [manager email/phone] and we'll follow up directly."

Notice: names the 3 specific issues, owns the miss, gives a real next step, no banned phrases.`;

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
          description:
            "Short public reply, STRICTLY under 75 words. Must name 1–2 concrete issues from the review and end with a manager contact line. No banned generic phrases.",
        },
        warm_public_reply: {
          type: "string",
          description:
            "Warm public reply, 60–100 words. Empathetic and specific to the review's concrete issues. Ownership without legal liability. Private contact line.",
        },
        firm_public_reply: {
          type: "string",
          description:
            "Firm but professional public reply, 70–110 words. Calm, factual, may politely reframe unfair claims. References specific issues. Never aggressive.",
        },
        private_recovery_message: {
          type: "string",
          description:
            "Private 1:1 recovery message, 80–140 words. Direct, human, references specific issues, offers to make it right within the owner's stated policy.",
        },
        what_not_to_say: {
          type: "array",
          items: { type: "string" },
          description:
            "4–6 short phrases/traps to avoid, tailored to THIS review's specific content (not generic advice).",
        },
        owner_action_checklist: {
          type: "array",
          items: { type: "string" },
          description:
            "4–7 concrete internal actions tied to the specific issues raised in the review (not generic 'improve service').",
        },
        flag_guidance: {
          type: "string",
          description:
            "Short paragraph: does this review appear to violate platform policy? If so, flagging MAY be worth considering. Never guarantee removal.",
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
Owner context (optional, private — only use if it authorizes specific claims/comp/contact details): ${input.ownerContext || "(none)"}

Review text:
"""${input.reviewText}"""

Before writing, silently extract the 1–3 concrete complaints in this review (e.g. cold food, long wait, rude server, wrong order, cleanliness, booking issue, delivery issue, billing dispute, allergen/dietary issue). Every public reply and the private message MUST reference those specific complaints by name — do not write anything that could be copy-pasted onto a different review.

Hard requirements:
- short_public_reply: strictly under 75 words; names 1–2 specific issues from the review; ends with a manager/owner contact line (use owner-provided contact from context if given, otherwise "[manager email/phone]").
- Use the reviewer's first name if it appears in the review; otherwise open with "Hi there,".
- Do NOT use any banned phrase listed in the system prompt. No "we are very sorry to hear about your experience", no "at your convenience", no "valued customer", no generic "strive for excellence".
- Own the specific miss without admitting legal liability.
- Do not invent facts the reviewer did not state.

Generate the full rescue pack using the rescue_pack tool.`;
}

// ── AI call ────────────────────────────────────────────────────────────────

// Calls Google's Gemini API directly (NOT via the Lovable AI Gateway).
// Uses the native generateContent endpoint with function calling so we get
// a structured rescue pack back.
const GEMINI_MODEL = "gemini-2.5-flash";

async function callRescueModel(input: RescueInput): Promise<RawRescuePack> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: RESCUE_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildUserPrompt(input) }],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: RESCUE_TOOL_SCHEMA.function.name,
              description: RESCUE_TOOL_SCHEMA.function.description,
              parameters: RESCUE_TOOL_SCHEMA.function.parameters,
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: [RESCUE_TOOL_SCHEMA.function.name],
        },
      },
    }),
  });

  if (response.status === 429) {
    throw new Error("Rate limit reached. Please try again in a moment.");
  }
  if (!response.ok) {
    const text = await response.text();
    console.error("Gemini API error:", response.status, text);
    throw new Error("AI service error. Please try again.");
  }

  const json = await response.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const fnPart = parts.find(
    (p: { functionCall?: { name: string; args: unknown } }) =>
      p.functionCall?.name === RESCUE_TOOL_SCHEMA.function.name
  );
  const args = fnPart?.functionCall?.args;
  if (!args) {
    console.error("Gemini returned no functionCall:", JSON.stringify(json));
    throw new Error("AI did not return a structured rescue pack.");
  }

  return args as RawRescuePack;
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
