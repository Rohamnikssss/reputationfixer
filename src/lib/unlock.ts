/**
 * Triggers a Polar checkout from the client and redirects to the hosted
 * checkout URL. Returns false if not redirected (caller can show fallback).
 */
import { createPolarCheckout } from "@/lib/polar.functions";
import { supabase } from "@/integrations/supabase/client";

let inFlight = false;

export async function startUnlockCheckout(): Promise<boolean> {
  if (inFlight) return false;
  inFlight = true;
  try {
    // Skip the server call entirely for anonymous users — checkout requires
    // an authenticated user to attribute the purchase to.
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?mode=signup&next=/app";
        return true;
      }
      return false;
    }

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
      const status =
        e instanceof Response
          ? e.status
          : (e as { status?: number; response?: { status?: number } })?.status ??
            (e as { response?: { status?: number } })?.response?.status ??
            null;
      if (status === 401 || status === 403) {
        window.location.href = "/login?mode=signup&next=/app";
        return true;
      }
    }
    return false;
  } finally {
    inFlight = false;
  }
}
