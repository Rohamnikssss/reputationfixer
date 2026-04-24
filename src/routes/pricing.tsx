import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Reputation Rescue AI" },
      {
        name: "description",
        content:
          "Simple per-pack pricing. Free preview, Starter, Pro, and Agency Beta plans.",
      },
      { property: "og:title", content: "Pricing — Reputation Rescue AI" },
      {
        property: "og:description",
        content: "Rescue bad reviews starting at $9. No long contracts.",
      },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Try before you buy.",
    cta: "Start free",
    to: "/login",
    features: [
      "1 public reply preview",
      "Short public reply draft",
      "Guardrail disclaimer",
    ],
  },
  {
    name: "Starter",
    price: "$9",
    cadence: "one-time",
    blurb: "For the occasional bad review.",
    cta: "Get Starter",
    to: "/login",
    features: [
      "10 full rescue packs",
      "All 3 public reply drafts",
      "Private recovery message",
      "Owner action checklist",
      "Flag / report guidance",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/ month",
    blurb: "Most restaurants pick this.",
    cta: "Go Pro",
    to: "/login",
    features: [
      "100 rescue packs / month",
      "Everything in Starter",
      "Saved generations library",
      "Priority AI queue",
    ],
    featured: true,
  },
  {
    name: "Agency Beta",
    price: "$99",
    cadence: "/ month",
    blurb: "Manage multiple locations.",
    cta: "Join beta",
    to: "/login",
    features: [
      "500 rescue packs / month",
      "Unlimited business profiles",
      "Beta features early access",
      "Email support",
    ],
  },
];

function PricingPage() {
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
                p.featured && "border-primary/50 shadow-glow"
              )}
            >
              {p.featured && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
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
                <Button
                  asChild
                  variant={p.featured ? "default" : "outline"}
                  className="w-full"
                >
                  <Link to={p.to} search={{ mode: "signup" }}>
                    {p.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          All plans include the disclaimer: AI outputs are drafts and must be
          reviewed by the business owner before posting.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
