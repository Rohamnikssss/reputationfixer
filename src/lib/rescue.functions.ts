/**
 * TanStack server function wrapper for the Reputation Rescue AI.
 *
 * All prompt, schema, and API logic lives in `./rescue-ai.server.ts`.
 * This file only:
 *   - Declares the RPC entry point (`generateRescuePack`).
 *   - Validates input via the shared Zod schema.
 *   - Re-exports the `RescuePack` / `RescueInput` types for client code.
 *
 * Client components import these types; the `.server.ts` core module is not
 * reachable from the browser bundle.
 */

import { createServerFn } from "@tanstack/react-start";
import {
  generateRescuePackCore,
  RescueInputSchema,
  type RescuePack,
  type RescueInput,
} from "./rescue-ai.server";

export type { RescuePack, RescueInput };

export const generateRescuePack = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RescueInputSchema.parse(input))
  .handler(async ({ data }) => {
    return generateRescuePackCore(data);
  });
