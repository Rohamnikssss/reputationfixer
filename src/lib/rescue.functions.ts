import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  businessType: z.string().trim().max(80).optional().default(""),
  reviewText: z.string().trim().min(5).max(3000),
  starRating: z.number().int().min(1).max(5),
  tone: z.enum(["apologetic", "warm", "firm", "professional", "empathetic"]),
  ownerContext: z.string().trim().max(1000).optional().default(""),
});

export type RescuePack = {
  shortReply: string;
  warmReply: string;
  firmReply: string;
  privateMessage: string;
  whatNotToSay: string[];
  actionChecklist: string[];
  flagGuidance: string;
};

const SYSTEM_PROMPT = `You are Reputation Rescue AI, an expert at helping restaurant owners respond professionally to negative Google reviews.

Your job: generate a complete "rescue pack" — multiple public reply drafts, a private recovery message, guardrails, an owner action checklist, and flag/report guidance.

STRICT RULES:
- Never be defensive, sarcastic, or dismissive.
- Never promise a refund or comp unless the owner context explicitly authorizes it.
- Never promise the review will be removed.
- Address specific complaints by paraphrasing, never quote the reviewer harshly.
- Keep public replies concise (short: <40 words, warm: 50-90 words, firm: 60-100 words).
- Private message should be warm, direct, invite offline resolution, 80-140 words.
- "What not to say" lists 4-6 short phrases or traps to avoid.
- Action checklist lists 4-7 concrete internal actions (train staff, audit X, contact reviewer, etc.).
- Flag guidance: one short paragraph on whether/when to flag the review to Google (fake, TOS violation, personal attack, etc.), without promising removal.
- Match the requested tone but keep a professional baseline.`;

export const generateRescuePack = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    // ─────────────────────────────────────────────────────────────────────
    // AI API KEY
    // ─────────────────────────────────────────────────────────────────────
    // This server function calls the Lovable AI Gateway, which proxies
    // Google Gemini models and handles billing for you.
    //
    // Server-only env vars (never expose to the client):
    //   LOVABLE_API_KEY   — used below, preferred on Lovable Cloud.
    //   GEMINI_API_KEY    — use this instead if you call Google's Gemini
    //                        REST API directly (e.g. after migrating off
    //                        Lovable). Swap the fetch URL + auth header
    //                        accordingly.
    // ─────────────────────────────────────────────────────────────────────
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Business name: ${data.businessName}
Business type: ${data.businessType || "Restaurant"}
Star rating given: ${data.starRating}/5
Desired tone: ${data.tone}
Owner context (optional, private): ${data.ownerContext || "(none)"}

Review text:
"""${data.reviewText}"""

Generate the full rescue pack using the tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rescue_pack",
              description: "Return the complete rescue pack for the review.",
              parameters: {
                type: "object",
                properties: {
                  shortReply: { type: "string", description: "Short public reply, <40 words." },
                  warmReply: { type: "string", description: "Warm public reply, 50-90 words." },
                  firmReply: { type: "string", description: "Firm professional reply, 60-100 words." },
                  privateMessage: {
                    type: "string",
                    description: "Private customer recovery message, 80-140 words.",
                  },
                  whatNotToSay: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 short phrases or traps to avoid.",
                  },
                  actionChecklist: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-7 concrete internal owner actions.",
                  },
                  flagGuidance: {
                    type: "string",
                    description:
                      "Short paragraph on flag/report guidance without promising removal.",
                  },
                },
                required: [
                  "shortReply",
                  "warmReply",
                  "firmReply",
                  "privateMessage",
                  "whatNotToSay",
                  "actionChecklist",
                  "flagGuidance",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rescue_pack" } },
      }),
    });

    if (response.status === 429) {
      throw new Error("Rate limit reached. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
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
    const parsed = JSON.parse(call.function.arguments) as RescuePack;
    return parsed;
  });
