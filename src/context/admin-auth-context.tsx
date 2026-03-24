"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAdminRbac } from "@/context/admin-rbac-context";
import type { AdminUser } from "@/lib/admin-rbac";

const AUTH_STORAGE_KEY = "maison-moda-admin-auth-v1";

type SessionPayload = {
  userId: string;
};

function loadSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SessionPayload>;
    const id = String(p.userId ?? "").trim();
    return id || null;
  } catch {
    return null;
  }
}

export type AdminAuthUser = Omit<AdminUser, "password">;

function stripPassword(u: AdminUser): AdminAuthUser {
  const { password, ...rest } = u;
  void password;
  return rest;
}

type AdminAuthContextValue = {
  /** RBAC + session chargés */
  ready: boolean;
  /** Utilisateur connecté (sans mot de passe) */
  user: AdminAuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: () => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { users, hydrated: rbacHydrated, setSessionUser } = useAdminRbac();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    if (!rbacHydrated) return;
    const id = loadSessionUserId();
    if (id && users.some((u) => u.id === id)) {
      setSessionUserId(id);
      setSessionUser(id);
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setSessionUserId(null);
    }
    setAuthHydrated(true);
  }, [rbacHydrated, users, setSessionUser]);

  const authenticated = useMemo(
    () =>
      sessionUserId != null && users.some((u) => u.id === sessionUserId),
    [sessionUserId, users]
  );

  const user = useMemo((): AdminAuthUser | null => {
    if (!sessionUserId) return null;
    const u = users.find((x) => x.id === sessionUserId);
    return u ? stripPassword(u) : null;
  }, [sessionUserId, users]);

  const login = useCallback(
    (email: string, password: string): boolean => {
      const e = email.trim().toLowerCase();
      const u = users.find((x) => x.email === e);
      const pwd = u?.password ?? "";
      if (!u || pwd !== password) return false;
      const payload: SessionPayload = { userId: u.id };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      setSessionUserId(u.id);
      setSessionUser(u.id);
      return true;
    },
    [users, setSessionUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSessionUserId(null);
  }, []);

  const isAuthenticated = useCallback(
    () => authenticated,
    [authenticated]
  );

  const ready = rbacHydrated && authHydrated;

  const value = useMemo(
    () => ({
      ready,
      user,
      login,
      logout,
      isAuthenticated,
    }),
    [ready, user, login, logout, isAuthenticated]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
