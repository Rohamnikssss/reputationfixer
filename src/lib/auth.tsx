import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isPaid: boolean;
  hasUnlockedAccess: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Look up roles whenever the user changes.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsPaid(false);
      return;
    }
    let cancelled = false;
    const loadRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[auth] role lookup failed:", error);
        setIsAdmin(false);
        setIsPaid(false);
        return;
      }
      const roles = (data ?? []).map((r) => r.role);
      setIsAdmin(roles.includes("admin"));
      setIsPaid(roles.includes("paid"));
    };
    loadRoles();

    // Realtime: when payments grant a role, reflect it without a refresh.
    const channel = supabase
      .channel(`user_roles_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => loadRoles()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasUnlockedAccess = isAdmin || isPaid;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isPaid, hasUnlockedAccess, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
