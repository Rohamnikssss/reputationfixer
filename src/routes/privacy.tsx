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
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-foreground/90">
          <Section title="1. What we collect">
            Account data (email, name), review inputs you paste, and generated
            drafts. We do not ingest data from Google or any third-party review
            platform — you paste it manually.
          </Section>
          <Section title="2. How we use it">
            To operate the Service, generate rescue packs, save your library,
            and improve quality. We do not sell your data.
          </Section>
          <Section title="3. AI processing">
            Inputs are sent to our AI provider to generate replies. Do not
            include personal data you are not authorized to share. Avoid
            pasting private customer contact information into review text.
          </Section>
          <Section title="4. Storage">
            Data is stored in our cloud database with row-level security. Each
            user can access only their own rescue packs.
          </Section>
          <Section title="5. Deletion">
            You can delete any saved rescue at any time from the Saved page.
            To delete your account, contact support@reputationrescue.ai.
          </Section>
          <Section title="6. Security">
            We use encryption in transit. No system is 100% secure; use strong
            passwords and don't share your login.
          </Section>
          <Section title="7. Contact">
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
