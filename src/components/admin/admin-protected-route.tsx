"use client";

import { useEffect } from "react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useRouter } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
};

/**
 * Protège le dashboard admin : session obligatoire (localStorage).
 * La session ne peut pas être vérifiée en middleware (pas d’accès localStorage côté serveur).
 */
export function AdminProtectedRoute({ children }: Props) {
  const { ready, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-accent" />
          <p className="text-sm text-stone">…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
      </div>
    );
  }

  return <>{children}</>;
}
