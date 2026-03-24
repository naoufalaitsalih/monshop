"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAdminRbac, fullPermissions } from "@/context/admin-rbac-context";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminToast } from "@/context/admin-toast-context";
import type { AdminRole, RolePermissions } from "@/lib/admin-rbac";
import { SUPER_ROLE_ID, emptyPermissions } from "@/lib/admin-rbac";

function formatDate(iso: string, loc: string) {
  try {
    return new Intl.DateTimeFormat(loc === "ar" ? "ar-MA" : "fr-FR", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function clonePerms(p: RolePermissions): RolePermissions {
  return JSON.parse(JSON.stringify(p)) as RolePermissions;
}

type BoolRowProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

function BoolRow({ label, checked, onChange, disabled }: BoolRowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2.5 transition hover:bg-zinc-100/80 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-zinc-300 text-accent focus:ring-accent"
      />
      <span className="text-sm font-medium text-ink">{label}</span>
    </label>
  );
}

export default function AdminRolesPage() {
  return (
    <RequireAdminAccess permission="roles.view">
      <AdminRolesContent />
    </RequireAdminAccess>
  );
}

function AdminRolesContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { pushToast } = useAdminToast();
  const {
    roles,
    hydrated,
    addRole,
    updateRole,
    removeRole,
    canAccess,
  } = useAdminRbac();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<RolePermissions>(fullPermissions());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setName("");
    setPerms(fullPermissions());
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setPerms(emptyPermissions());
    setShowForm(true);
  };

  const openEdit = (r: AdminRole) => {
    setEditing(r);
    setName(r.name);
    setPerms(clonePerms(r.permissions));
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      if (!canAccess("roles.edit")) return;
      if (updateRole(editing.id, trimmed, perms)) {
        pushToast(t("toastRoleUpdated"), "success");
        resetForm();
      }
    } else {
      if (!canAccess("roles.create")) return;
      if (addRole(trimmed, perms)) {
        pushToast(t("toastRoleAdded"), "success");
        resetForm();
      }
    }
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    if (removeRole(pendingDeleteId)) {
      pushToast(t("toastRoleRemoved"), "success");
    } else {
      pushToast(t("toastRoleRemoveBlocked"), "error");
    }
    setPendingDeleteId(null);
    if (editing?.id === pendingDeleteId) resetForm();
  };

  const sorted = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles]
  );

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />;
  }

  const canCreate = canAccess("roles.create");
  const canEdit = canAccess("roles.edit");
  const canDelete = canAccess("roles.delete");
  const formVisible =
    showForm && ((!editing && canCreate) || (editing != null && canEdit));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("rolesPageTitle")}</h1>
          <p className="mt-2 text-sm text-stone">{t("rolesPageSubtitle")}</p>
        </div>
        {canCreate && !showForm ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink hover:bg-accent/90"
          >
            {t("rolesAdd")}
          </button>
        ) : null}
      </div>

      {formVisible ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-display text-lg text-ink">
            {editing ? t("rolesEditTitle") : t("rolesCreateTitle")}
          </h2>
          <div className="max-w-md">
            <label className="mb-1 block text-xs font-semibold uppercase text-stone">
              {t("rolesFormName")}
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermDashboard")}
              </h3>
              <div className="mt-2 max-w-md">
                <BoolRow
                  label={t("rbacPermDashboardAccess")}
                  checked={perms.dashboard}
                  onChange={(v) =>
                    setPerms((p) => ({ ...p, dashboard: v }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermProducts")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.products.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      products: { ...p.products, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionCreate")}
                  checked={perms.products.create}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      products: { ...p.products, create: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionEdit")}
                  checked={perms.products.edit}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      products: { ...p.products, edit: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionDelete")}
                  checked={perms.products.delete}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      products: { ...p.products, delete: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermOrders")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.orders.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      orders: { ...p.orders, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacPermOrderConfirm")}
                  checked={perms.orders.confirm}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      orders: { ...p.orders, confirm: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermCategories")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.categories.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      categories: { ...p.categories, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionCreate")}
                  checked={perms.categories.create}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      categories: { ...p.categories, create: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionEdit")}
                  checked={perms.categories.edit}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      categories: { ...p.categories, edit: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionDelete")}
                  checked={perms.categories.delete}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      categories: { ...p.categories, delete: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermClients")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.clients.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      clients: { ...p.clients, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionEdit")}
                  checked={perms.clients.edit}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      clients: { ...p.clients, edit: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionDelete")}
                  checked={perms.clients.delete}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      clients: { ...p.clients, delete: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermUsers")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.users.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      users: { ...p.users, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionCreate")}
                  checked={perms.users.create}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      users: { ...p.users, create: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionEdit")}
                  checked={perms.users.edit}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      users: { ...p.users, edit: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionDelete")}
                  checked={perms.users.delete}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      users: { ...p.users, delete: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermRolesMeta")}
              </h3>
              <div className="mt-2 grid max-w-lg gap-2 sm:grid-cols-2">
                <BoolRow
                  label={t("rbacActionView")}
                  checked={perms.roles.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      roles: { ...p.roles, view: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionCreate")}
                  checked={perms.roles.create}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      roles: { ...p.roles, create: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionEdit")}
                  checked={perms.roles.edit}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      roles: { ...p.roles, edit: v },
                    }))
                  }
                />
                <BoolRow
                  label={t("rbacActionDelete")}
                  checked={perms.roles.delete}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      roles: { ...p.roles, delete: v },
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone">
                {t("rbacPermAudit")}
              </h3>
              <div className="mt-2 max-w-md">
                <BoolRow
                  label={t("rbacPermAuditView")}
                  checked={perms.audit.view}
                  onChange={(v) =>
                    setPerms((p) => ({
                      ...p,
                      audit: { ...p.audit, view: v },
                    }))
                  }
                />
              </div>
            </section>
          </div>

          <div className="flex gap-3 border-t border-zinc-100 pt-4">
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white"
            >
              {editing ? t("rolesSave") : t("rolesCreate")}
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
      ) : null}

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sorted.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-ink">{r.name}</p>
                <p className="mt-1 font-mono text-xs text-stone">{r.id}</p>
                <p className="mt-2 text-xs text-stone">
                  {formatDate(r.createdAt, locale)}
                </p>
              </div>
              <div className="flex gap-2">
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                  >
                    {t("edit")}
                  </button>
                ) : null}
                {canDelete && r.id !== SUPER_ROLE_ID ? (
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(r.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                  >
                    {t("delete")}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={t("rolesDeleteTitle")}
        message={t("rolesDeleteMessage")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
