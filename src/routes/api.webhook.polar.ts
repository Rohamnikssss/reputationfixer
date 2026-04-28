/**
 * Polar webhook handler.
 *
 * Listens for subscription events from Polar and updates user access via the
 * existing `user_roles` table:
 *   - subscription.created / subscription.active  -> grant 'paid' role
 *   - subscription.revoked                        -> remove 'paid' role
 *
 * Also records the order in the `payments` table when available.
 *
 * Webhook signature is verified using POLAR_WEBHOOK_SECRET (Standard Webhooks).
 */
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, webhook-id, webhook-signature, webhook-timestamp",
};

async function grantPaidRole(userId: string) {
  const { error } = await supabaseAdmin
    .from("user_roles")
    .upsert(
      { user_id: userId, role: "paid" },
      { onConflict: "user_id,role", ignoreDuplicates: true }
    );
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[polar-webhook] grant paid failed:", error);
  }
}

async function revokePaidRole(userId: string) {
  const { error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "paid");
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[polar-webhook] revoke paid failed:", error);
  }
}

function resolveUserId(data: Record<string, unknown>): string | null {
  // Polar puts the linked external_customer_id in different shapes depending
  // on event type — try the common ones.
  const candidates: unknown[] = [
    (data as { customer?: { external_id?: string } }).customer?.external_id,
    (data as { external_customer_id?: string }).external_customer_id,
    (data as { user_id?: string }).user_id,
    (data as { metadata?: { user_id?: string } }).metadata?.user_id,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}

export const Route = createFileRoute("/api/webhook/polar")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        const secret = process.env.POLAR_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Webhook secret not configured", {
            status: 500,
            headers: CORS,
          });
        }

        const body = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((v, k) => {
          headers[k] = v;
        });

        let event: { type: string; data: Record<string, unknown> };
        try {
          // Polar provides the secret as a plain string; Standard Webhooks
          // expects it base64-encoded.
          const base64Secret = Buffer.from(secret, "utf-8").toString("base64");
          const wh = new Webhook(base64Secret);
          event = wh.verify(body, headers) as typeof event;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[polar-webhook] signature verification failed:", err);
          return new Response("Invalid signature", { status: 401, headers: CORS });
        }

        const data = event.data ?? {};
        const userId = resolveUserId(data);

        try {
          switch (event.type) {
            case "subscription.created":
            case "subscription.active":
            case "order.paid": {
              if (userId) await grantPaidRole(userId);
              break;
            }
            case "subscription.revoked":
            case "subscription.canceled": {
              // Only revoke on actual revoke; canceled may still have access until period end.
              if (event.type === "subscription.revoked" && userId) {
                await revokePaidRole(userId);
              }
              break;
            }
            default:
              break;
          }

          // Best-effort payment record.
          if (
            userId &&
            (event.type === "order.paid" || event.type === "subscription.created")
          ) {
            const order = data as {
              id?: string;
              amount?: number;
              currency?: string;
              customer?: { email?: string };
            };
            await supabaseAdmin.from("payments").insert({
              user_id: userId,
              email: order.customer?.email ?? "",
              plan: "starter",
              amount_cents: order.amount ?? 1900,
              currency: (order.currency ?? "USD").toUpperCase(),
              provider_order_id: order.id ?? null,
              status: "paid",
              raw_payload: JSON.parse(JSON.stringify(event)),
            });
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[polar-webhook] handler failed:", err);
          // Still 200 so Polar does not retry indefinitely on our bug.
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
