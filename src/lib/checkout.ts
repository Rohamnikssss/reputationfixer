/**
 * ────────────────────────────────────────────────────────────────────────────
 * Checkout configuration (Polar — coming soon)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * We will use Polar as the payment provider. Real checkout is NOT connected
 * yet. Until a real Polar checkout URL is configured, every "Unlock" /
 * "Upgrade" / "Starter Pack" button falls back to the in-app early-access
 * form at /request-access.
 *
 * To wire up Polar later, set ONE environment variable. Either name works:
 *
 *   NEXT_PUBLIC_POLAR_STARTER_CHECKOUT_URL   (preferred)
 *   VITE_POLAR_STARTER_CHECKOUT_URL          (alternate)
 *
 * Vite exposes any env var starting with VITE_ or NEXT_PUBLIC_ on
 * `import.meta.env` at build time. Set the variable in your hosting
 * provider (Cloudflare / Vercel / Netlify) or in a local `.env.local`.
 * ────────────────────────────────────────────────────────────────────────────
 */

const env = import.meta.env as Record<string, string | undefined>;

/**
 * Where every Starter / Upgrade / Unlock button should point.
 *
 * - If a Polar checkout URL is configured, return it.
 * - Otherwise return the in-app early-access form path.
 */
export function getStarterCheckoutUrl(): string {
  return (
    env.NEXT_PUBLIC_POLAR_STARTER_CHECKOUT_URL ??
    env.VITE_POLAR_STARTER_CHECKOUT_URL ??
    "/request-access?plan=starter"
  );
}

/**
 * Whether the current build has a real external Polar checkout URL
 * configured. UI uses this to decide between `target="_blank"` (external
 * checkout) vs internal client-side navigation to the request-access form.
 */
export function hasExternalStarterCheckout(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_POLAR_STARTER_CHECKOUT_URL ??
      env.VITE_POLAR_STARTER_CHECKOUT_URL
  );
}

/**
 * Pro and Agency plans are intentionally NOT connected to a checkout yet.
 * Their CTAs route to the same in-app early-access form, pre-tagged with
 * the plan the visitor is interested in.
 */
export const REQUEST_ACCESS_URLS = {
  pro: "/request-access?plan=pro",
  agency: "/request-access?plan=agency",
} as const;

export type PlanKey = "starter" | "pro" | "agency";
