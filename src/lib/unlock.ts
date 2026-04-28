/**
 * Triggers a Polar checkout from the client and redirects to the hosted
 * checkout URL. Returns false if not redirected (caller can show fallback).
 */
import { createPolarCheckout } from "@/lib/polar.functions";

let inFlight = false;

export async function startUnlockCheckout(): Promise<boolean> {
  if (inFlight) return false;
  inFlight = true;
  try {
    const { url } = await createPolarCheckout();
    if (typeof window !== "undefined" && url) {
      window.location.href = url;
      return true;
    }
    return false;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[unlock] checkout failed:", e);
    if (typeof window !== "undefined") {
      const isResponse = typeof Response !== "undefined" && e instanceof Response;
      const status = isResponse ? (e as Response).status : null;
      if (status === 401 || status === 403) {
        window.location.href = "/login?next=/app";
        return true;
      }
    }
    return false;
  } finally {
    inFlight = false;
  }
}
