import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { RescueForm, type RescueInput } from "@/components/rescue-form";
import { RescueResult, UnlockCTA } from "@/components/rescue-result";
import { generateRescuePack, type RescuePack } from "@/lib/rescue.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { startUnlockCheckout } from "@/lib/unlock";

export const Route = createFileRoute("/app/generate")({
  component: GeneratePage,
});

// Free tier allowance — counts saved generations.
// Replace with a server-side credit ledger once billing is live.
const FREE_CREDITS = 3;

function GeneratePage() {
  const { user, isAdmin, hasUnlockedAccess } = useAuth();
  const [unlockLoading, setUnlockLoading] = useState(false);
  const handleUnlock = async () => {
    setUnlockLoading(true);
    const ok = await startUnlockCheckout();
    if (!ok) {
      setUnlockLoading(false);
      toast.error("Could not start checkout. Please try again.");
    }
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<RescuePack | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [usedCredits, setUsedCredits] = useState<number | null>(null);

  // Load credits used (saved generation count).
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setUsedCredits(count ?? 0);
    })();
  }, [user]);

  const creditsRemaining = Math.max(FREE_CREDITS - (usedCredits ?? 0), 0);
  // Admins bypass the paywall entirely (test mode / owner access).
  const outOfCredits = !hasUnlockedAccess && usedCredits !== null && creditsRemaining === 0;

  const run = async (v: RescueInput) => {
    if (!user) return;
    if (outOfCredits) {
      toast.error("You're out of free credits — upgrade to keep generating.");
      return;
    }
    setLoading(true);
    setPack(null);
    setSavedId(null);
    try {
      const result = await generateRescuePack({ data: v });
      setPack(result);

      // Auto-save to history (acts as the credit decrement event).
      const { data: row, error } = await supabase
        .from("generations")
        .insert({
          user_id: user.id,
          business_name: v.businessName,
          business_type: v.businessType,
          review_text: v.reviewText,
          star_rating: v.starRating,
          tone: v.tone,
          owner_context: v.ownerContext,
          short_reply: result.shortReply,
          warm_reply: result.warmReply,
          firm_reply: result.firmReply,
          private_message: result.privateMessage,
          what_not_to_say: result.whatNotToSay.join("\n"),
          action_checklist: result.actionChecklist.join("\n"),
          flag_guidance: result.flagGuidance,
          // Full rescue pack as structured JSON (canonical storage).
          output_json: result as unknown as Json,
        })
        .select("id")
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[app.generate] save error:", error);
        toast.error("Could not save your rescue pack. Please try again.");
      } else {
        setSavedId(row.id);
        setUsedCredits((c) => (c ?? 0) + 1);
        toast.success("Saved to your library");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[app.generate] generation failed:", e);
      const isResponse =
        typeof Response !== "undefined" && e instanceof Response;
      const status = isResponse ? (e as Response).status : null;
      if (status === 401 || status === 403) {
        toast.error("Your session expired. Please sign in again.");
        navigate({ to: "/login" });
      } else if (e instanceof Error) {
        toast.error(
          /credit|upgrade/i.test(e.message)
            ? e.message
            : "Generation failed. Please try again."
        );
      } else {
        toast.error("Generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate rescue reply
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste the review, pick a tone, get the full pack.
          </p>
        </div>
        {isAdmin ? (
          <div className="text-xs">
            <span className="rounded-md bg-primary/15 px-2 py-1 font-medium text-primary">
              Admin · unlimited
            </span>
          </div>
        ) : usedCredits !== null && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {creditsRemaining}
            </span>{" "}
            / {FREE_CREDITS} free credits left
          </div>
        )}
      </div>

      {outOfCredits ? (
        (() => {
          const url = getStarterCheckoutUrl();
          const external = hasExternalStarterCheckout() && /^https?:\/\//i.test(url);
          return (
            <Card className="overflow-hidden border-primary/40 bg-gradient-primary/10 shadow-glow">
              <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    You've used all {FREE_CREDITS} free rescue packs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock 10 more rescue packs for $19 to keep generating.
                  </p>
                </div>
                <Button asChild size="lg">
                  <a
                    href={url}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    <Crown className="mr-1.5 h-4 w-4" /> Unlock full rescue pack — $19
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })()
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-6 sm:p-8">
            <RescueForm onSubmit={run} loading={loading} />
          </CardContent>
        </Card>
      )}

      {pack && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Rescue pack</h2>
              <p className="text-xs text-muted-foreground">
                {savedId
                  ? "Saved to your library — drafts only, never auto-posted."
                  : "Drafts only — review before posting to Google."}
              </p>
            </div>
            {savedId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/app/saved" })}
              >
                View in library
              </Button>
            )}
          </div>
          <RescueResult pack={pack} />
          {!isAdmin && (
            <div className="pt-2">
              <UnlockCTA />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Need more rescue packs? <Link to="/pricing" className="underline hover:text-foreground">See pricing</Link>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
