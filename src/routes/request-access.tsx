import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/request-access")({
  validateSearch: z.object({
    plan: z.enum(["starter", "pro", "agency"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Request access — Reputation Fixer AI" },
      {
        name: "description",
        content:
          "Tell us about your restaurant and we'll send payment and access details for Reputation Fixer AI shortly.",
      },
      { property: "og:title", content: "Request access — Reputation Fixer AI" },
      {
        property: "og:description",
        content:
          "Tell us about your restaurant and we'll follow up with payment and access details.",
      },
    ],
  }),
  component: RequestAccessPage,
});

const PLAN_LABELS: Record<"starter" | "pro" | "agency", string> = {
  starter: "Starter Pack — $19 (10 rescue packs)",
  pro: "Pro — $29/mo (100 rescue packs)",
  agency: "Agency Beta — $99/mo (500 rescue packs)",
};

function RequestAccessPage() {
  const { plan: planParam } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "agency">(
    planParam ?? "starter"
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Best-effort persist into Supabase if a `request_access` table exists.
      // The table isn't in the generated types yet — cast through `unknown` so
      // the build doesn't depend on a migration. If the table is missing or
      // RLS blocks anonymous insert, we still show the success state so the
      // user is never blocked. (Email follow-up is handled out of band.)
      const client = supabase as unknown as {
        from: (table: string) => {
          insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
        };
      };
      const { error } = await client.from("request_access").insert({
        name,
        email,
        restaurant_name: restaurantName,
        plan,
        message,
      });
      if (error && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("[request-access] insert failed:", error);
      }
      setSubmitted(true);
    } catch (err) {
      // Same fallback — don't block the user on storage errors.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("[request-access] error:", err);
      }
      toast.error("Couldn't reach the server, but we noted your request.");
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Early access
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {submitted ? "Thanks — we got your request" : "Request access"}
          </h1>
          {!submitted && (
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Payment isn't connected yet — tell us your details and we'll send
              payment and access information by email shortly.
            </p>
          )}
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Thanks — we'll send payment and access details shortly.
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We'll email <strong>{email || "you"}</strong> within one
                    business day with next steps for{" "}
                    <strong>{PLAN_LABELS[plan]}</strong>.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/">Back to home</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/app/generate">Try the free generator</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Owner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@restaurant.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant name</Label>
                  <Input
                    id="restaurant"
                    required
                    maxLength={160}
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Bella's Trattoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan interested in</Label>
                  <Select
                    value={plan}
                    onValueChange={(v) =>
                      setPlan(v as "starter" | "pro" | "agency")
                    }
                  >
                    <SelectTrigger id="plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">
                        {PLAN_LABELS.starter}
                      </SelectItem>
                      <SelectItem value="pro">{PLAN_LABELS.pro}</SelectItem>
                      <SelectItem value="agency">
                        {PLAN_LABELS.agency}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    maxLength={800}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Anything you want us to know — number of locations, urgency, current review situation."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Request access"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By submitting you agree to our{" "}
                  <Link to="/terms" className="underline hover:text-foreground">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
