import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Bookmark,
  Sparkles,
  Zap,
  Crown,
  Star,
} from "lucide-react";
import { startUnlockCheckout } from "@/lib/unlock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

// Free tier allowance — tracked client-side against saved generations count.
// Replace with a server-side credit ledger once billing is live.
const FREE_CREDITS = 3;

function Dashboard() {
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
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<
    {
      id: string;
      business_name: string;
      star_rating: number;
      tone: string;
      review_text: string;
      created_at: string;
    }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count: c } = await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCount(c ?? 0);

      const { data } = await supabase
        .from("generations")
        .select("id, business_name, star_rating, tone, review_text, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent(data ?? []);
    })();
  }, [user]);

  const used = count ?? 0;
  const creditsRemaining = Math.max(FREE_CREDITS - used, 0);
  const outOfCredits = creditsRemaining === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Rescue your next review in under a minute.
          </p>
        </div>
        <div className="flex gap-2">
          {!hasUnlockedAccess && (
            <Button variant="outline" onClick={handleUnlock} disabled={unlockLoading}>
              <Crown className="mr-1.5 h-4 w-4" />
              {unlockLoading ? "Redirecting…" : "Upgrade"}
            </Button>
          )}
          <Button asChild>
            <Link to="/app/generate">
              <Plus className="mr-1.5 h-4 w-4" /> New rescue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden shadow-card">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Credits remaining
              </div>
              <div className="mt-0.5 text-2xl font-semibold">
                {isAdmin ? (
                  "∞"
                ) : (
                  <>
                    {creditsRemaining}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {FREE_CREDITS}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAdmin ? "Admin · unlimited" : "Free plan"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Saved generations
              </div>
              <div className="mt-0.5 text-2xl font-semibold">
                {count ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                In your library
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Plan
              </div>
              <div className="mt-0.5 text-2xl font-semibold">
                {isAdmin ? "Admin" : "Free"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAdmin ? "Test mode · all features" : "Upgrade for more"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA banner — hidden for admins/paid users */}
      {!hasUnlockedAccess && (
        <Card className="overflow-hidden border-primary/40 bg-gradient-primary/10 shadow-glow">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Crown className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {outOfCredits
                  ? "Out of free credits"
                  : "Unlock 10 full rescue packs for $19"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Get all 3 public reply drafts, the private recovery message, owner
                checklist, and flag guidance for your next 10 reviews.
              </p>
            </div>
            <Button size="lg" className="w-full sm:w-auto" onClick={handleUnlock} disabled={unlockLoading}>
              {unlockLoading ? "Redirecting…" : "Unlock full rescue pack — $19"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent review replies</CardTitle>
          <Button asChild size="sm" variant="ghost">
            <Link to="/app/saved">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No rescue packs yet.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/app/generate">Generate your first</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.business_name}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {r.tone}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 text-warning">
                        {Array.from({ length: r.star_rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </span>
                      <span>·</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {r.review_text}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/app/saved">Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
