# Environment Variables

Reputation Rescue AI reads its configuration from environment variables.
This project runs on **TanStack Start (Vite)** + **Lovable Cloud (Supabase)**.
The Supabase client config is auto-generated on Lovable — you do **not** need
to set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` manually
here, but the names below are the canonical names to use if you migrate to
another host (Next.js on Vercel, a custom Express backend, etc.).

---

## Public (client-side) variables

These are safe to expose in the browser bundle.

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project REST URL. | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key. Used by the browser client. | `eyJhbGciOi...` |
| `NEXT_PUBLIC_LEMON_STARTER_CHECKOUT_URL` | Lemon Squeezy checkout URL for the **Starter** plan ($9 / 10 packs). | `https://checkout.lemonsqueezy.com/buy/...` |
| `NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL` | Lemon Squeezy checkout URL for the **Pro** plan ($29/mo / 100 packs). | `https://checkout.lemonsqueezy.com/buy/...` |
| `NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL` | Lemon Squeezy checkout URL for the **Agency Beta** plan ($99/mo / 500 packs). | `https://checkout.lemonsqueezy.com/buy/...` |

> On Lovable, Supabase credentials are injected automatically into
> `src/integrations/supabase/client.ts`. The Lemon Squeezy vars can be set in
> your hosting provider or in `.env.local` during local development.

---

## Server-only (secret) variables

These must **never** be exposed to the client bundle. They are read only
inside `createServerFn` handlers (TanStack server functions) or edge
functions.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Direct Google Gemini API key (if you call the Gemini REST API directly instead of via the Lovable AI Gateway). |
| `LOVABLE_API_KEY` | Currently used by `src/lib/rescue.functions.ts` to call the Lovable AI Gateway, which proxies Gemini. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key used by webhook handlers (e.g. Lemon Squeezy → `payments` table) to bypass RLS. Never ship to the browser. |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC secret used to verify Lemon Squeezy webhook signatures. |

---

## Where each key is consumed in code

| File | Reads |
| --- | --- |
| `src/integrations/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (auto-generated on Lovable). |
| `src/lib/checkout.ts` | `NEXT_PUBLIC_LEMON_STARTER_CHECKOUT_URL`, `NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL`, `NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL`. |
| `src/lib/rescue.functions.ts` | `LOVABLE_API_KEY` (or `GEMINI_API_KEY` if you swap in the direct Gemini endpoint). |
| Future webhook route (e.g. `src/routes/api/public/lemon-webhook.ts`) | `SUPABASE_SERVICE_ROLE_KEY`, `LEMON_SQUEEZY_WEBHOOK_SECRET`. |

---

## Database tables

See `supabase/migrations/` for the canonical schema. Conceptually:

- **users** — Managed by Supabase Auth (`auth.users`). Extended by
  `public.profiles` (id, email, full_name, created_at). Auto-created on signup
  via the `handle_new_user` trigger.
- **generations** — One row per rescue pack the AI produced. Columns:
  `business_name`, `business_type`, `review_text`, `star_rating`, `tone`,
  `owner_context`, `output_json` (full rescue pack JSON), `created_at`, plus
  per-field columns kept for backward compatibility.
- **payments** — One row per Lemon Squeezy order. Columns: `user_id`,
  `email`, `plan`, `amount_cents`, `currency`, `status`, `lemon_order_id`,
  `raw_payload`, `created_at`, `updated_at`. Row-Level Security lets users
  read only their own payments; inserts/updates happen via the service role
  from the webhook handler.
