"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ShopCategory } from "@/context/categories-context";
import { useShopCategories } from "@/context/categories-context";
import { useAdminToast } from "@/context/admin-toast-context";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { productImageUnoptimized } from "@/lib/product-image";
import { RequireAdminAccess } from "@/components/admin/require-admin-access";
import { useAdminRbac } from "@/context/admin-rbac-context";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import { useAdminClickLog } from "@/hooks/use-admin-click-log";

function emptyForm() {
  return { nameFr: "", nameAr: "", image: "" };
}

export default function AdminCategoriesPage() {
  return (
    <RequireAdminAccess permission="categories.view">
      <AdminCategoriesPageContent />
    </RequireAdminAccess>
  );
}

function AdminCategoriesPageContent() {
  const t = useTranslations("admin");
  const { canAccess } = useAdminRbac();
  const { user: authUser } = useAdminAuth();
  const { pushLog } = useAdminAuditLog();
  const { logClick } = useAdminClickLog();
  const {
    categories,
    hydrated,
    addCategory,
    updateCategory,
    removeCategory,
    moveCategory,
  } = useShopCategories();
  const { pushToast } = useAdminToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShopCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const resetUi = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setUrlInput("");
    setShowForm(true);
  };

  const openEdit = (c: ShopCategory) => {
    setEditing(c);
    setForm({
      nameFr: c.nameFr,
      nameAr: c.nameAr,
      image: c.image,
    });
    setUrlInput("");
    setShowForm(true);
  };

  useEffect(() => {
    if (!showForm || !editing) return;
    const frame = requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [showForm, editing]);

  useEffect(() => {
    if (showForm && editing && !canAccess("categories.edit")) resetUi();
    if (showForm && !editing && !canAccess("categories.create")) resetUi();
  }, [showForm, editing, canAccess, resetUi]);

  const clearImage = () => {
    setForm((f) => ({ ...f, image: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result ?? "");
      if (r) setForm((f) => ({ ...f, image: r }));
    };
    reader.readAsDataURL(file);
  };

  const canSubmit =
    Boolean(form.nameFr.trim()) &&
    Boolean(form.nameAr.trim()) &&
    Boolean(form.image.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logClick(
      "CLICK_CATEGORY_SUBMIT",
      "category",
      editing ? `edit · ${editing.id}` : "create"
    );
    if (!canSubmit) return;

    const nameFr = form.nameFr.trim();
    const nameAr = form.nameAr.trim();
    const image = form.image.trim();

    if (editing) {
      const ok = updateCategory(editing.id, { nameFr, nameAr, image });
      if (ok) {
        pushToast(t("toastCategoryUpdated"), "success");
        resetUi();
      }
    } else {
      addCategory({ nameFr, nameAr, image });
      if (authUser?.id) {
        pushLog({
          userId: authUser.id,
          action: "ADD_CATEGORY",
          entity: "category",
          details: `${nameFr} / ${nameAr}`,
        });
      }
      pushToast(t("toastCategoryAdded"), "success");
      resetUi();
    }
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const deletedId = pendingDeleteId;
    removeCategory(deletedId);
    pushToast(t("toastCategoryDeleted"), "success");
    setPendingDeleteId(null);
    if (editing?.id === deletedId) resetUi();
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const ok = moveCategory(id, direction);
    if (ok) pushToast(t("toastCategoryOrderChanged"), "success");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  const canCreate = canAccess("categories.create");
  const canEdit = canAccess("categories.edit");
  const canDelete = canAccess("categories.delete");
  const formVisible =
    showForm &&
    ((!editing && canCreate) || (editing != null && canEdit));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {t("categoriesPageTitle")}
          </h1>
          <p className="mt-2 text-sm text-stone">
            {t("categoriesPageSubtitle")}
          </p>
        </div>
        {!showForm && canCreate ? (
          <button
            type="button"
            onClick={() => {
              logClick("CLICK_CATEGORY_ADD_OPEN", "category", "");
              openCreate();
            }}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/90"
          >
            {t("categoriesAdd")}
          </button>
        ) : null}
      </div>

      {formVisible ? (
        <div
          ref={formSectionRef}
          className="scroll-mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-display text-lg text-ink">
            {editing ? t("categoriesEditTitle") : t("categoriesCreateTitle")}
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
                  {t("categoriesNameFr")}
                </label>
                <input
                  required
                  value={form.nameFr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nameFr: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
                  {t("categoriesNameAr")}
                </label>
                <input
                  required
                  dir="rtl"
                  value={form.nameAr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nameAr: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                {t("categoriesImage")}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    logClick(
                      "CLICK_CATEGORY_APPLY_IMAGE_URL",
                      "category",
                      urlInput.trim()
                    );
                    const u = urlInput.trim();
                    if (!u) return;
                    setForm((f) => ({ ...f, image: u }));
                    setUrlInput("");
                  }}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
                >
                  {t("categoriesApplyUrl")}
                </button>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone">
                  {t("categoriesImageFile")}
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-ink"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readFile(f);
                    e.target.value = "";
                  }}
                />
                <p className="mt-2 text-xs text-stone">
                  {t("categoriesImageNote")}
                </p>
              </div>
              {!form.image.trim() ? (
                <p className="mt-3 text-xs font-medium text-amber-800">
                  {t("categoriesImageRequiredHint")}
                </p>
              ) : null}
              {form.image ? (
                <div className="relative mt-4 inline-block">
                  <div className="relative h-40 w-32 overflow-hidden rounded-xl border border-zinc-200">
                    <Image
                      src={form.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={productImageUnoptimized(form.image)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logClick("CLICK_CATEGORY_CLEAR_IMAGE", "category", "");
                      clearImage();
                    }}
                    className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("categoriesRemoveImage")}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editing ? t("categoriesSave") : t("categoriesCreate")}
              </button>
              <button
                type="button"
                onClick={() => {
                  logClick("CLICK_CATEGORY_CANCEL", "category", "");
                  resetUi();
                }}
                className="rounded-full border border-zinc-300 bg-white px-8 py-3 text-sm font-semibold text-ink hover:bg-zinc-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, index) => (
          <li
            key={c.id}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              <Image
                src={c.image}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 100vw, 33vw"
                unoptimized={productImageUnoptimized(c.image)}
              />
            </div>
            <div className="space-y-1 p-4">
              <p className="font-medium text-ink">{c.nameFr}</p>
              <p className="text-sm text-stone" dir="rtl">
                {c.nameAr}
              </p>
              <p className="font-mono text-[10px] text-stone/80">
                {c.id} · #{c.order + 1}
              </p>
              {canEdit ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      logClick(
                        "CLICK_CATEGORY_MOVE_UP",
                        "category",
                        `id=${c.id}`
                      );
                      handleMove(c.id, "up");
                    }}
                    title={t("categoriesMoveUp")}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={t("categoriesMoveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index >= categories.length - 1}
                    onClick={() => {
                      logClick(
                        "CLICK_CATEGORY_MOVE_DOWN",
                        "category",
                        `id=${c.id}`
                      );
                      handleMove(c.id, "down");
                    }}
                    title={t("categoriesMoveDown")}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={t("categoriesMoveDown")}
                  >
                    ↓
                  </button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      logClick(
                        "CLICK_CATEGORY_EDIT_OPEN",
                        "category",
                        `id=${c.id} · ${c.nameFr}`
                      );
                      openEdit(c);
                    }}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold hover:bg-zinc-50"
                  >
                    {t("edit")}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      logClick(
                        "CLICK_CATEGORY_DELETE_OPEN",
                        "category",
                        `id=${c.id}`
                      );
                      setPendingDeleteId(c.id);
                    }}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
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
        title={t("categoriesDeleteTitle")}
        message={t("categoriesDeleteMessage")}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        onInteract={(kind) => {
          const d =
            pendingDeleteId != null
              ? `category · id=${pendingDeleteId}`
              : "category";
          if (kind === "confirm") logClick("CLICK_DIALOG_CONFIRM", "dialog", d);
          else if (kind === "cancel")
            logClick("CLICK_DIALOG_CANCEL", "dialog", d);
          else logClick("CLICK_DIALOG_BACKDROP", "dialog", d);
        }}
      />
    </div>
  );
}
