import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard, Bookmark, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Reputation Fixer AI
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" exact />
            <NavItem to="/app/generate" icon={Plus} label="New rescue" />
            <NavItem to="/app/saved" icon={Bookmark} label="Saved" />
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  exact,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      )}
      activeProps={{
        className: "bg-accent text-foreground",
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
