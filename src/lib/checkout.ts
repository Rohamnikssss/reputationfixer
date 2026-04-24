/**
 * ────────────────────────────────────────────────────────────────────────────
 * Checkout configuration (Lemon Squeezy)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Replace the placeholder URLs with real Lemon Squeezy product checkout links.
 *
 * Recommended: set these as environment variables so URLs can change without
 * a code deploy. The expected env var names are:
 *
 *   NEXT_PUBLIC_LEMON_STARTER_CHECKOUT_URL   → $9 one-time, 10 rescue packs
 *   NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL       → $29/mo, 100 rescue packs
 *   NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL    → $99/mo, 500 rescue packs
 *
 * NOTE: This project runs on TanStack Start + Vite, which exposes client-side
 * env vars via `import.meta.env`. Any var starting with `VITE_` or
 * `NEXT_PUBLIC_` is safely embedded in the client bundle. We read both forms
 * and fall back to the placeholder URL below.
 *
 * To configure: add the NEXT_PUBLIC_* vars in your hosting provider
 * (e.g. Vercel, Netlify, Cloudflare) or in a local `.env.local` file.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Vite exposes string env vars on import.meta.env at build time.
const env = import.meta.env as Record<string, string | undefined>;

const FALLBACK_URLS = {
  starter: "https://checkout.lemonsqueezy.com/buy/placeholder-starter-9",
  pro: "https://checkout.lemonsqueezy.com/buy/placeholder-pro-29",
  agency: "https://checkout.lemonsqueezy.com/buy/placeholder-agency-99",
};

export const CHECKOUT_URLS = {
  starter:
    env.NEXT_PUBLIC_LEMON_STARTER_CHECKOUT_URL ??
    env.VITE_LEMON_STARTER_CHECKOUT_URL ??
    FALLBACK_URLS.starter,
  pro:
    env.NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL ??
    env.VITE_LEMON_PRO_CHECKOUT_URL ??
    FALLBACK_URLS.pro,
  agency:
    env.NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL ??
    env.VITE_LEMON_AGENCY_CHECKOUT_URL ??
    FALLBACK_URLS.agency,
} as const;

export type PlanKey = keyof typeof CHECKOUT_URLS;

export const PLAN_LABELS: Record<PlanKey, string> = {
  starter: "Starter — $9 for 10 rescue packs",
  pro: "Pro — $29/mo for 100 rescue packs",
  agency: "Agency Beta — $99/mo for 500 rescue packs",
};
