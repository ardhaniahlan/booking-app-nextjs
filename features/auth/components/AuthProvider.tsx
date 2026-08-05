"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { createBrowserClient } from "@supabase/ssr";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setAuth(
          {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || "User",
          },
          profile?.role as "admin" | "user",
        );
      } else {
        clearAuth();
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          clearAuth();
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, supabase]);

  return <>{children}</>;
};

export default AuthProvider;
