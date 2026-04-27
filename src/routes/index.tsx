import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { RescueForm, type RescueInput } from "@/components/rescue-form";
import { RescueResult, UnlockCTA } from "@/components/rescue-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateRescuePack, type RescuePack } from "@/lib/rescue.functions";
import { getStarterCheckoutUrl, hasExternalStarterCheckout } from "@/lib/checkout";
import {
  Sparkles,
  ShieldCheck,
  Clock,
  MessageSquareHeart,
  ListChecks,
  FileWarning,
  Flag,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<RescuePack | null>(null);

  const handleGenerate = async (v: RescueInput) => {
    setLoading(true);
    setPack(null);
    try {
      const result = await generateRescuePack({ data: v });
      setPack(result);
      setTimeout(() => {
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      // The server function requires auth — a Response (not an Error) is thrown
      // on 401. Detect that and guide the user to sign in instead of crashing.
      const isResponse =
        typeof Response !== "undefined" && e instanceof Response;
      const status = isResponse ? (e as Response).status : null;
      if (status === 401 || status === 403) {
        toast.error("Please sign in to generate a rescue pack — it's free.");
      } else if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        {/* Single soft mint glow accent — calm, blurred, never competing with the headline */}
        <div
          aria-hidden
          className="hero-orb left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.78 0.16 160 / 0.55), transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(oklch(1 0 0 / 1) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Built for restaurants under review pressure
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Bad review?{" "}
              <span className="text-gradient-primary">
                Reply professionally in 30 seconds.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Reputation Fixer AI helps restaurants turn angry Google reviews
              into calm public replies, private recovery messages, and action
              checklists — without sounding defensive.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#generator">Fix my review now</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> 30-second drafts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Owner reviews
                before posting
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareHeart className="h-3.5 w-3.5 text-primary" /> Calm,
                never defensive
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Every rescue pack includes
          </h2>
          <p className="mt-3 text-muted-foreground">
            One input, seven outputs. No template copy-paste.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MessageSquareHeart,
              title: "3 public reply drafts",
              desc: "Short, warm, and firm — pick the tone that fits the review.",
            },
            {
              icon: Sparkles,
              title: "Private recovery message",
              desc: "A direct DM that invites the guest to resolve offline.",
            },
            {
              icon: FileWarning,
              title: "What not to say",
              desc: "Traps to avoid so you don't escalate or promise refunds.",
            },
            {
              icon: ListChecks,
              title: "Owner action checklist",
              desc: "Concrete internal fixes — retrain staff, audit process.",
            },
            {
              icon: Flag,
              title: "Flag / report guidance",
              desc: "When the review may violate Google's rules. No removal promises.",
            },
            {
              icon: ShieldCheck,
              title: "Owner-reviewed workflow",
              desc: "Nothing posts automatically. You always stay in control.",
            },
          ].map((f) => (
            <Card key={f.title} className="shadow-card">
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mb-1 font-medium">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Generator */}
      <section id="generator" className="bg-card/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Free review reply generator
            </h2>
            <p className="mt-3 text-muted-foreground">
              Paste the review. Get a short public reply free. Unlock the full
              rescue pack with an account.
            </p>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-6 sm:p-8">
              <RescueForm onSubmit={handleGenerate} loading={loading} />
            </CardContent>
          </Card>

          {pack && (
            <div id="result" className="mt-10 space-y-4 scroll-mt-20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Your rescue pack</h3>
                  <p className="text-xs text-muted-foreground">
                    Free preview — 1 short public reply shown. Rest are locked.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/login" search={{ mode: "signup" }}>
                    Create free account
                  </Link>
                </Button>
              </div>

              <UnlockCTA />

              <RescueResult
                pack={pack}
                gated
                onUnlock={() => {
                  const url = getStarterCheckoutUrl();
                  if (hasExternalStarterCheckout() && /^https?:\/\//i.test(url)) {
                    window.open(url, "_blank", "noreferrer");
                  } else {
                    window.location.href = url;
                  }
                }}
              />

              <UnlockCTA />
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex gap-3 py-5 text-sm text-foreground/90">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <strong className="font-medium">Important:</strong> AI outputs are
              drafts and must be reviewed by the business owner before posting.
              We don't connect to your Google Business Profile, don't auto-post
              replies, and never promise review removal.
            </div>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
