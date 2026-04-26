/**
 * TanStack server function wrapper for the rescue-pack AI generator.
 *
 * All prompt, schema, and AI provider logic lives in `./rescue-ai.server.ts`.
 * This file only:
 *   - Declares the RPC entry point (`generateRescuePack`).
 *   - Enforces authentication via `requireSupabaseAuth`.
 *   - Enforces the free-credit quota server-side (cannot be bypassed by
 *     calling the function directly with a script).
 *   - Validates input via the shared Zod schema.
 *   - Re-exports the `RescuePack` / `RescueInput` types for client code.
 */

import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  generateRescuePackCore,
  RescueInputSchema,
  type RescuePack,
  type RescueInput,
} from "./rescue-ai.server";

export type { RescuePack, RescueInput };

/**
 * Free-tier allowance — must match the value displayed in the dashboard UI.
 * Once a paid plan is active for the user, this gate should be replaced by a
 * proper credit-ledger check (and bypassed for paying users).
 */
const FREE_CREDITS = 3;

/**
 * Forward the user's Supabase access token to the server as a Bearer
 * Authorization header. Without this, `requireSupabaseAuth` cannot validate
 * the session because TanStack Start's RPC fetch does not include the
 * supabase-js auth header by default.
 *
 * Runs only in the browser; during SSR there is no `localStorage` so we skip.
 */
const forwardSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (typeof window === "undefined") return next();
    try {
      // Lazy import keeps the supabase client out of the server bundle path
      // for this middleware module.
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        return next({ headers: { Authorization: `Bearer ${token}` } });
      }
    } catch {
      // fall through — server middleware will reject as unauthorized
    }
    return next();
  }
);

export const generateRescuePack = createServerFn({ method: "POST" })
  .middleware([forwardSupabaseAuth, requireSupabaseAuth])
  .inputValidator((input: unknown) => RescueInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Server-side credit enforcement.
    // The browser also gates this for UX, but the browser cannot be trusted —
    // so we re-check here using the authenticated user's own RLS-scoped
    // supabase client.
    const { count, error: countError } = await context.supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", context.userId);

    if (countError) {
      // Don't leak raw DB errors; log server-side, return a safe message.
      // eslint-disable-next-line no-console
      console.error("[generateRescuePack] credit-count failed:", countError);
      throw new Error("Could not verify your remaining credits. Try again.");
    }

    if ((count ?? 0) >= FREE_CREDITS) {
      throw new Error(
        "You've used all your free rescue packs. Upgrade to keep generating."
      );
    }

    return generateRescuePackCore(data);
  });
