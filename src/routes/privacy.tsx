import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Reputation Rescue AI" },
      {
        name: "description",
        content: "How Reputation Rescue AI collects, uses, and protects your data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: April 24, 2026
        </p>

        <div className="space-y-8 text-foreground/90">
          <Section title="1. What we store">
            To operate the Service, we store: your{" "}
            <strong>account email</strong>, the{" "}
            <strong>review text you paste in</strong>, the{" "}
            <strong>AI-generated rescue replies</strong> we produce for you,
            and basic <strong>usage data</strong> (timestamps, credits used,
            plan tier). We do not ingest data from Google or any third-party
            review platform — you paste it manually.
          </Section>
          <Section title="2. Don't paste sensitive data">
            <strong>
              Please do not enter unnecessary sensitive information
            </strong>{" "}
            into the review text or owner-context fields. Avoid pasting
            customer phone numbers, emails, addresses, payment data, health
            information, or any data you are not authorized to process. If a
            customer's name appears in a review, consider redacting it before
            generating a draft.
          </Section>
          <Section title="3. How we use your data">
            To operate the Service, generate rescue packs, save your library,
            decrement credits, and improve quality. We do not sell your data
            and we do not use it to train third-party AI models without your
            consent.
          </Section>
          <Section title="4. AI processing">
            The text you submit is sent to our AI provider to generate the
            reply pack. Treat anything you paste as if it could leave our
            system — and don't paste anything you wouldn't be comfortable
            sharing with a third-party processor.
          </Section>
          <Section title="5. Storage and access">
            Data is stored in our cloud database with row-level security. Each
            account can access only its own rescue packs and saved
            generations.
          </Section>
          <Section title="6. Deletion">
            You can delete any saved rescue at any time from the Saved page.
            To delete your account and all associated data, contact
            support@reputationrescue.ai.
          </Section>
          <Section title="7. Security">
            We use encryption in transit. No system is 100% secure — use a
            strong password and don't share your login.
          </Section>
          <Section title="8. Contact">
            Privacy questions: privacy@reputationrescue.ai.
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
