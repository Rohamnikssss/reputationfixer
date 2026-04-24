import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { RescueForm, type RescueInput } from "@/components/rescue-form";
import { RescueResult } from "@/components/rescue-result";
import { generateRescuePack, type RescuePack } from "@/lib/rescue.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export const Route = createFileRoute("/app/generate")({
  component: GeneratePage,
});

function GeneratePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<RescuePack | null>(null);
  const [lastInput, setLastInput] = useState<RescueInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const run = async (v: RescueInput) => {
    setLoading(true);
    setPack(null);
    setSavedId(null);
    try {
      const result = await generateRescuePack({ data: v });
      setPack(result);
      setLastInput(v);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!pack || !lastInput || !user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        business_name: lastInput.businessName,
        business_type: lastInput.businessType,
        review_text: lastInput.reviewText,
        star_rating: lastInput.starRating,
        tone: lastInput.tone,
        owner_context: lastInput.ownerContext,
        short_reply: pack.shortReply,
        warm_reply: pack.warmReply,
        firm_reply: pack.firmReply,
        private_message: pack.privateMessage,
        what_not_to_say: pack.whatNotToSay.join("\n"),
        action_checklist: pack.actionChecklist.join("\n"),
        flag_guidance: pack.flagGuidance,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSavedId(data.id);
    toast.success("Saved to your library");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Generate rescue reply
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste the review, pick a tone, get the full pack.
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6 sm:p-8">
          <RescueForm onSubmit={run} loading={loading} />
        </CardContent>
      </Card>

      {pack && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rescue pack</h2>
            {savedId ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/app/saved" })}
              >
                View in library
              </Button>
            ) : (
              <Button size="sm" onClick={save} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Saving..." : "Save to library"}
              </Button>
            )}
          </div>
          <RescueResult pack={pack} />
        </div>
      )}
    </div>
  );
}
