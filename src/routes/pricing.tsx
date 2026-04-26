import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStarterCheckoutUrl,
  hasExternalStarterCheckout,
  REQUEST_ACCESS_URLS,
} from "@/lib/checkout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Reputation Fixer AI" },
      {
        name: "description",
        content:
          "Free preview, $19 Starter Pack, Pro coming soon, Agency Beta by request.",
      },
      { property: "og:title", content: "Pricing — Reputation Fixer AI" },
      {
        property: "og:description",
        content: "Rescue bad reviews starting at $19. No long contracts.",
      },
    ],
  }),
  component: PricingPage,
});

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  cta: string;
  /** External checkout URL — opens in a new tab */
  externalHref?: string;
  /** Internal request-access form (preferred for unconnected plans) */
  requestAccessPlan?: "starter" | "pro" | "agency";
  /** Free plan → signup */
  signup?: boolean;
  features: string[];
  featured?: boolean;
  disabled?: boolean;
  badge?: string;
};

function buildPlans(): Plan[] {
  const starterUrl = getStarterCheckoutUrl();
  const starterIsExternal =
    hasExternalStarterCheckout() && /^https?:\/\//i.test(starterUrl);

  const starter: Plan = {
    name: "Starter Pack",
    price: "$19",
    cadence: "one-time",
    blurb: "For the occasional bad review.",
    cta: "Get Starter Pack — $19",
    features: [
      "10 full rescue packs",
      "All 3 public reply drafts",
      "Private recovery message",
      "Owner action checklist",
      "Flag / report guidance",
    ],
    featured: true,
    badge: "Most popular",
    ...(starterIsExternal
      ? { externalHref: starterUrl }
      : { requestAccessPlan: "starter" as const }),
  };

  return [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      blurb: "Try before you buy.",
      cta: "Start free",
      signup: true,
      features: [
        "1 public reply preview",
        "Short public reply draft",
        "Guardrail disclaimer",
      ],
    },
    starter,
    {
      name: "Pro",
      price: "$29",
      cadence: "/ month",
      blurb: "Most restaurants will pick this.",
      cta: "Coming soon",
      disabled: true,
      badge: "Coming soon",
      features: [
        "100 rescue packs / month",
        "Everything in Starter Pack",
        "Saved generations library",
        "Priority AI queue",
      ],
    },
    {
      name: "Agency Beta",
      price: "$99",
      cadence: "/ month",
      blurb: "Manage multiple locations.",
      cta: "Request access",
      requestAccessPlan: "agency",
      features: [
        "500 rescue packs / month",
        "Unlimited business profiles",
        "Beta features early access",
        "Email support",
      ],
    },
  ];
}

function PricingPage() {
  const plans = buildPlans();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Transparent pricing
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Pay only for what you rescue.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Start free. Upgrade when you need more packs. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={cn(
                "relative flex flex-col shadow-card",
                p.featured && "border-primary/50 shadow-glow",
                p.disabled && "opacity-90"
              )}
            >
              {p.badge && (
                <div
                  className={cn(
                    "absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    p.featured
                      ? "bg-gradient-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground"
                  )}
                >
                  {p.badge}
                </div>
              )}
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {p.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      {p.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {p.cadence}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                </div>
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.disabled ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                    aria-disabled="true"
                  >
                    {p.cta}
                  </Button>
                ) : p.externalHref ? (
                  <Button
                    asChild
                    variant={p.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    <a href={p.externalHref} target="_blank" rel="noreferrer">
                      {p.cta}
                    </a>
                  </Button>
                ) : p.requestAccessPlan ? (
                  <Button
                    asChild
                    variant={p.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link
                      to="/request-access"
                      search={{ plan: p.requestAccessPlan }}
                    >
                      {p.cta}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={p.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link to="/login" search={{ mode: "signup" }}>
                      {p.cta}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          All plans include the disclaimer: AI outputs are drafts and must be
          reviewed by the business owner before posting.
        </p>

        {/* Silence unused-import warning when no Pro/Agency external links exist */}
        <span className="hidden" aria-hidden>
          {REQUEST_ACCESS_URLS.pro}
          {REQUEST_ACCESS_URLS.agency}
        </span>
      </section>

      <SiteFooter />
    </div>
  );
}
