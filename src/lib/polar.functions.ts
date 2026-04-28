/**
 * Polar checkout server function.
 * Creates a Polar checkout session for the rescue-pack unlock ($19) and
 * returns the hosted checkout URL for client-side redirect.
 */
import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const POLAR_PRODUCT_ID = "b061915b-4103-4e1b-b1f5-f50d34cfb801";

const forwardSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (typeof window === "undefined") return next();
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        return next({ headers: { Authorization: `Bearer ${token}` } });
      }
    } catch {
      /* noop */
    }
    return next();
  }
);

export const createPolarCheckout = createServerFn({ method: "POST" })
  .middleware([forwardSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const token = process.env.POLAR_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Payments are not configured. Please contact support.");
    }

    const origin =
      process.env.PUBLIC_APP_URL ??
      process.env.VITE_PUBLIC_APP_URL ??
      "https://reputationfixer.lovable.app";

    const res = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [POLAR_PRODUCT_ID],
        success_url: `${origin}/app?checkout_id={CHECKOUT_ID}`,
        external_customer_id: context.userId,
        customer_email: context.claims?.email,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      // eslint-disable-next-line no-console
      console.error("[polar] checkout failed:", res.status, text);
      throw new Error("Could not start checkout. Please try again.");
    }

    const checkout = (await res.json()) as { url: string; id: string };
    return { url: checkout.url, id: checkout.id };
  });
