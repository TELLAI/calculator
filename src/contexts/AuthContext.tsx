"use client";

import { createContext, useCallback, useContext } from "react";
import { useSession, signOut, SessionProvider } from "next-auth/react";

type Role = "admin" | "user" | null;

type AuthState = {
  user: { id: string; email: string } | null;
  role: Role;
  organizationId: string | null;
  organizationName: string | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  organizationId: null,
  organizationName: null,
  loading: true,
  logout: async () => {},
});

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user
          ? { id: session.user.id, email: session.user.email! }
          : null,
        role: (session?.user?.role as Role) ?? null,
        organizationId: session?.user?.organizationId ?? null,
        organizationName: session?.user?.organizationName ?? null,
        loading: status === "loading",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
