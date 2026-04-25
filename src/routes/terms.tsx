import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Reputation Rescue AI" },
      {
        name: "description",
        content: "Terms governing use of Reputation Rescue AI.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">
          Terms of Service
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: April 24, 2026
        </p>

        <div className="space-y-8 text-foreground/90">
          <Section title="1. Acceptance">
            By using Reputation Rescue AI ("Service"), you agree to these Terms.
            If you do not agree, do not use the Service.
          </Section>
          <Section title="2. AI-generated drafts only">
            The Service generates AI-drafted reply text and guidance based on
            inputs you provide. <strong>All outputs are drafts.</strong> You
            must review, edit, and approve every draft before posting it
            anywhere public. You are solely responsible for what you publish.
          </Section>
          <Section title="3. No removal or posting guarantees">
            We do not connect to Google Business Profile or any other review
            platform. We never auto-post replies. We make{" "}
            <strong>no guarantee that any review will be removed</strong> by
            Google or any other platform. Flagging guidance is informational
            only — the platform makes the final decision.
          </Section>
          <Section title="4. No guarantee of rating improvement">
            We make <strong>no guarantee</strong> that using the Service will
            improve your overall star rating, review count, customer
            sentiment, search ranking, or business performance. Outcomes depend
            entirely on factors outside our control.
          </Section>
          <Section title="5. Not legal advice">
            Outputs are <strong>not legal advice</strong> and are not a
            substitute for a qualified attorney. If a review involves potential
            defamation, harassment, threats, or other legal matters, consult a
            lawyer before responding publicly. We are not a law firm and no
            attorney–client relationship is created by your use of the Service.
          </Section>
          <Section title="6. Acceptable use">
            You agree not to use the Service to harass, defame, or mislead any
            person. You agree not to post AI output that contains false
            statements of fact, fabricated quotes, or fake reviews. You agree
            not to attempt to manipulate any review platform.
          </Section>
          <Section title="7. Accounts and billing">
            You are responsible for activity under your account. Paid plans
            auto-renew unless canceled. Usage credits expire as described on
            the pricing page.
          </Section>
          <Section title="8. Disclaimer of warranties">
            The Service is provided "as is" and "as available" without
            warranties of any kind, express or implied. AI output may contain
            errors, hallucinations, or phrasing that is unsuitable for your
            situation. Review every draft before use.
          </Section>
          <Section title="9. Limitation of liability">
            To the maximum extent permitted by law, Reputation Rescue AI is not
            liable for indirect, incidental, special, consequential, or
            punitive damages — including damage to reputation, lost revenue,
            or lost customers — arising from your use of the Service.
          </Section>
          <Section title="10. Changes">
            We may update these Terms. Continued use after changes constitutes
            acceptance.
          </Section>
          <Section title="11. Contact">
            Questions? Email support@reputationrescue.ai.
          </Section>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
