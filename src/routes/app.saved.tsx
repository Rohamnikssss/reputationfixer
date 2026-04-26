import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RescueResult } from "@/components/rescue-result";
import { Trash2, ChevronLeft, Star, Plus } from "lucide-react";
import type { RescuePack } from "@/lib/rescue.functions";

interface SavedRow {
  id: string;
  business_name: string;
  business_type: string | null;
  review_text: string;
  star_rating: number;
  tone: string;
  owner_context: string | null;
  short_reply: string;
  warm_reply: string;
  firm_reply: string;
  private_message: string;
  what_not_to_say: string;
  action_checklist: string;
  flag_guidance: string;
  created_at: string;
}

export const Route = createFileRoute("/app/saved")({
  component: SavedPage,
});

function SavedPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedRow | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[app.saved] load error:", error);
      toast.error("Failed to load your library. Please refresh.");
    }
    setRows((data as SavedRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[app.saved] delete error:", error);
      return toast.error("Could not delete that rescue pack. Please try again.");
    }
    toast.success("Deleted");
    setSelected((s) => (s?.id === id ? null : s));
    setRows((r) => r.filter((x) => x.id !== id));
  };

  if (selected) {
    const pack: RescuePack = {
      shortReply: selected.short_reply,
      warmReply: selected.warm_reply,
      firmReply: selected.firm_reply,
      privateMessage: selected.private_message,
      whatNotToSay: selected.what_not_to_say
        ? selected.what_not_to_say.split("\n").filter(Boolean)
        : [],
      actionChecklist: selected.action_checklist
        ? selected.action_checklist.split("\n").filter(Boolean)
        : [],
      flagGuidance: selected.flag_guidance,
    };

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to library
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {selected.business_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selected.star_rating}★ · {selected.tone} ·{" "}
              {new Date(selected.created_at).toLocaleString()}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => remove(selected.id)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Original review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {selected.review_text}
            </p>
          </CardContent>
        </Card>

        <RescueResult pack={pack} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Saved rescues
          </h1>
          <p className="text-sm text-muted-foreground">
            Your complete rescue pack library.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/app/generate">
            <Plus className="mr-1.5 h-4 w-4" /> New rescue
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No saved rescues yet.</p>
            <Button asChild className="mt-4">
              <Link to="/app/generate">Generate your first</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="group text-left"
            >
              <Card className="h-full shadow-card transition-colors group-hover:border-primary/40">
                <CardContent className="p-5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="font-medium">{r.business_name}</div>
                    <div className="flex items-center gap-0.5 text-warning">
                      {Array.from({ length: r.star_rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {r.review_text}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {r.tone} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
