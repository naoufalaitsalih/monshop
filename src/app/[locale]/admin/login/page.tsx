"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import {
  SEED_ADMIN_PASSWORD,
  SEED_EDITOR_PASSWORD,
} from "@/lib/admin-rbac";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const { ready, login, isAuthenticated } = useAdminAuth();
  const { hydrated: rbacHydrated, users } = useAdminRbac();
  const { pushLog } = useAdminAuditLog();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated()) router.replace("/admin");
  }, [ready, isAuthenticated, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr(t("loginErrorRequired"));
      return;
    }
    if (login(email, password)) {
      const u = users.find(
        (x) => x.email === email.trim().toLowerCase()
      );
      if (u) {
        pushLog({
          userId: u.id,
          action: "CLICK_AUTH_LOGIN_SUBMIT",
          entity: "auth",
          details: `email=${u.email}`,
        });
      }
      pushToast(t("toastLoginSuccess"), "success");
      router.replace("/admin");
    } else {
      pushToast(t("toastLoginError"), "error");
      setErr(t("loginErrorInvalid"));
    }
  };

  if (!ready || !rbacHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/60">
        <div className="text-center">
          <p className="font-display text-2xl text-ink">{t("loginBrand")}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("loginBrandSub")}
          </p>
          <h1 className="mt-6 font-display text-xl text-ink">
            {t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm text-stone">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="admin-login-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
            >
              {t("loginEmail")}
            </label>
            <input
              id="admin-login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-ink placeholder:text-stone/60 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="admin@maisonmoda.local"
            />
          </div>
          <div>
            <label
              htmlFor="admin-login-password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone"
            >
              {t("loginPassword")}
            </label>
            <input
              id="admin-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-ink placeholder:text-stone/60 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="••••••••"
            />
          </div>
          {err ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            {t("loginSubmit")}
          </button>
        </form>

        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-center text-[11px] leading-relaxed text-stone">
          {t("loginDemoHint", {
            adminEmail: "admin@maisonmoda.local",
            adminPass: SEED_ADMIN_PASSWORD,
            editorEmail: "editor@maisonmoda.local",
            editorPass: SEED_EDITOR_PASSWORD,
          })}
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t("loginBackShop")}
          </Link>
        </div>
      </div>
    </div>
  );
}
