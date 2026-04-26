import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/ai-disclaimer")({
  head: () => ({
    meta: [
      { title: "AI Disclaimer — Reputation Fixer AI" },
      {
        name: "description",
        content:
          "How to safely use AI-generated review replies. Drafts only — review before posting. No guarantee of removal.",
      },
      { property: "og:title", content: "AI Disclaimer — Reputation Fixer AI" },
      {
        property: "og:description",
        content:
          "Drafts only. Review before posting. No guarantee of review removal or rating improvement.",
      },
    ],
  }),
  component: AiDisclaimerPage,
});

function AiDisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          Important — please read before posting
        </div>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">
          AI Disclaimer
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Last updated: April 24, 2026
        </p>

        <Card className="mb-10 border-warning/30 bg-warning/5 shadow-card">
          <CardContent className="p-6 text-sm leading-relaxed text-foreground/90">
            <strong className="font-semibold">
              AI-generated draft. Review before posting. This does not guarantee
              review removal.
            </strong>{" "}
            Every reply, message, checklist, and flagging note produced by
            Reputation Fixer AI is a draft suggestion — not a finished,
            approved, or fact-checked response.
          </CardContent>
        </Card>

        <div className="space-y-8 text-foreground/90">
          <Section title="1. Outputs are drafts only">
            All replies, private messages, "what not to say" notes, owner
            checklists, and flagging guidance are AI-generated drafts. They are
            starting points — not final answers. You must read every word and
            edit before posting anywhere public.
          </Section>

          <Section title="2. You are the publisher">
            Reputation Fixer AI never connects to your Google Business Profile,
            Yelp, TripAdvisor, or any other platform. Nothing is auto-posted.
            Every public reply is posted by you, on your account, under your
            business name — and you take full responsibility for it.
          </Section>

          <Section title="3. No guarantee of review removal">
            Flagging guidance describes when a review may violate a platform's
            policies. Whether a review is actually removed is decided solely by
            Google or the relevant platform. We make no promise of removal.
          </Section>

          <Section title="4. No guarantee of rating improvement">
            Using this Service does not guarantee that your overall star
            rating, review count, customer sentiment, or search ranking will
            improve.
          </Section>

          <Section title="5. Not legal advice">
            Outputs are not legal advice and are not a substitute for a
            qualified attorney. If a review involves potential defamation,
            threats, or other legal issues, consult a lawyer before responding
            publicly.
          </Section>

          <Section title="6. AI can be wrong">
            Large language models can misread the review, invent facts about
            your business, or produce phrasing that reads worse than intended.
            Always check that the draft is accurate, on-brand, and free of
            promises (refunds, comps, legal admissions) you didn't authorize.
          </Section>

          <Section title="7. Brand-safe by default — not perfect">
            The system is tuned to avoid defensive, sarcastic, or legally risky
            language. It is not foolproof. The owner remains the final
            reviewer.
          </Section>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          See also our{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
