"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminToast } from "@/context/admin-toast-context";
import type { AdminUser } from "@/lib/admin-rbac";

function formatDate(iso: string, loc: string) {
  try {
    return new Intl.DateTimeFormat(loc === "ar" ? "ar-MA" : "fr-FR", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  return (
    <RequireAdminAccess permission="users.view">
      <AdminUsersContent />
    </RequireAdminAccess>
  );
}

function AdminUsersContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { pushToast } = useAdminToast();
  const {
    users,
    roles,
    hydrated,
    addUser,
    updateUser,
    removeUser,
    canAccess,
  } = useAdminRbac();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", roleId: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const roleName = useCallback(
    (roleId: string) => roles.find((r) => r.id === roleId)?.name ?? roleId,
    [roles]
  );

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", email: "", roleId: roles[0]?.id ?? "" });
  }, [roles]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", roleId: roles[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, roleId: u.roleId });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.roleId) return;
    if (editing) {
      if (!canAccess("users.edit")) return;
      const ok = updateUser(editing.id, form);
      if (ok) {
        pushToast(t("toastUserUpdated"), "success");
        resetForm();
      } else {
        pushToast(t("toastUserDuplicateEmail"), "error");
      }
    } else {
      if (!canAccess("users.create")) return;
      const u = addUser(form);
      if (u) {
        pushToast(t("toastUserAdded"), "success");
        resetForm();
      } else {
        pushToast(t("toastUserDuplicateEmail"), "error");
      }
    }
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const ok = removeUser(pendingDeleteId);
    if (ok) pushToast(t("toastUserRemoved"), "success");
    setPendingDeleteId(null);
    if (editing?.id === pendingDeleteId) resetForm();
  };

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />;
  }

  const canCreate = canAccess("users.create");
  const canEdit = canAccess("users.edit");
  const canDelete = canAccess("users.delete");
  const formVisible =
    showForm && ((!editing && canCreate) || (editing != null && canEdit));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("usersPageTitle")}</h1>
          <p className="mt-2 text-sm text-stone">{t("usersPageSubtitle")}</p>
        </div>
        {canCreate && !showForm ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink hover:bg-accent/90"
          >
            {t("usersAdd")}
          </button>
        ) : null}
      </div>

      {formVisible ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-ink">
            {editing ? t("usersEditTitle") : t("usersCreateTitle")}
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-stone">
                {t("usersFormName")}
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-stone">
                {t("usersFormEmail")}
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-stone">
                {t("usersFormRole")}
              </label>
              <select
                required
                value={form.roleId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roleId: e.target.value }))
                }
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white"
              >
                {editing ? t("usersSave") : t("usersCreate")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-stone">
              <tr>
                <th className="px-4 py-3">{t("usersColName")}</th>
                <th className="px-4 py-3">{t("usersColEmail")}</th>
                <th className="px-4 py-3">{t("usersColRole")}</th>
                <th className="px-4 py-3">{t("clientsColDate")}</th>
                <th className="px-4 py-3 text-end">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sorted.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-stone">{u.email}</td>
                  <td className="px-4 py-3">{roleName(u.roleId)}</td>
                  <td className="px-4 py-3 text-xs text-stone">
                    {formatDate(u.createdAt, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                        >
                          {t("edit")}
                        </button>
                      ) : null}
                      {canDelete && users.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(u.id)}
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          {t("delete")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={t("usersDeleteTitle")}
        message={t("usersDeleteMessage")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
