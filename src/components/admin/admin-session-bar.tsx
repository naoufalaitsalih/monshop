"use client";

import { useAdminRbac } from "@/context/admin-rbac-context";
import { useTranslations } from "next-intl";

export function AdminSessionBar() {
  const t = useTranslations("admin");
  const { users, currentUser, hydrated, setSessionUser } = useAdminRbac();

  if (!hydrated || users.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="admin-session-user" className="sr-only">
        {t("rbacSessionLabel")}
      </label>
      <select
        id="admin-session-user"
        value={currentUser?.id ?? ""}
        onChange={(e) => setSessionUser(e.target.value)}
        className="max-w-[200px] rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
    </div>
  );
}
