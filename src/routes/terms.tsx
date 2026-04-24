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
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-foreground/90">
          <Section title="1. Acceptance">
            By using Reputation Rescue AI ("Service"), you agree to these Terms.
            If you do not agree, do not use the Service.
          </Section>
          <Section title="2. What the Service is">
            The Service generates AI-drafted reply text and guidance based on
            inputs you provide. All outputs are drafts. You are solely
            responsible for reviewing, editing, and deciding whether to post any
            generated content.
          </Section>
          <Section title="3. No removal or posting guarantees">
            We do not connect to Google Business Profile, we do not auto-post
            replies, and we make no promise that any review will be removed by
            Google or any platform. Flagging guidance is informational only.
          </Section>
          <Section title="4. Acceptable use">
            You agree not to use the Service to harass, defame, or mislead any
            person. You agree not to post AI output that contains false
            statements of fact.
          </Section>
          <Section title="5. Accounts and billing">
            You are responsible for activity under your account. Paid plans
            auto-renew unless canceled. Usage credits expire as described in
            the pricing page.
          </Section>
          <Section title="6. Disclaimer">
            The Service is provided "as is" without warranties of any kind. AI
            output may contain errors. Review every draft before use.
          </Section>
          <Section title="7. Limitation of liability">
            To the maximum extent permitted by law, Reputation Rescue AI is not
            liable for indirect, incidental, or consequential damages arising
            from your use of the Service.
          </Section>
          <Section title="8. Changes">
            We may update these Terms. Continued use after changes constitutes
            acceptance.
          </Section>
          <Section title="9. Contact">
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
