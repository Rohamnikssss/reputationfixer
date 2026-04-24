import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bookmark, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<
    { id: string; business_name: string; star_rating: number; created_at: string }[]
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
        .select("id, business_name, star_rating, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent(data ?? []);
    })();
  }, [user]);

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
        <Button asChild>
          <Link to="/app/generate">
            <Plus className="mr-1.5 h-4 w-4" /> New rescue
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Sparkles}
          label="Rescue packs generated"
          value={count ?? "—"}
        />
        <StatCard icon={TrendingUp} label="Plan" value="Free" sub="1 preview / day" />
        <StatCard icon={Bookmark} label="Saved replies" value={count ?? "—"} />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent rescues</CardTitle>
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
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{r.business_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.star_rating}★ ·{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-0.5 text-2xl font-semibold">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
