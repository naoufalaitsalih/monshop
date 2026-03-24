"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAdminAuditLog } from "@/context/admin-audit-context";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useAdminToast } from "@/context/admin-toast-context";
import type { AdminAuditAction, AdminAuditEntity } from "@/lib/admin-audit-log";

type LogClickOptions = {
  /** Affiche un toast discret (désactivé par défaut pour limiter le bruit). */
  showToast?: boolean;
  /** Surcharge du userId (ex. après login). */
  userIdOverride?: string;
};

/**
 * Enregistre un clic admin (localStorage + contexte) pour traçabilité.
 * Aligné sur la structure { userId, action, entity, details, date }.
 */
export function useAdminClickLog() {
  const { pushLog } = useAdminAuditLog();
  const { user } = useAdminAuth();
  const { pushToast } = useAdminToast();
  const t = useTranslations("admin");

  const logClick = useCallback(
    (
      action: AdminAuditAction,
      entity: AdminAuditEntity,
      details?: string,
      options?: LogClickOptions
    ) => {
      const uid = options?.userIdOverride ?? user?.id;
      if (!uid) return;
      pushLog({
        userId: uid,
        action,
        entity,
        details: details ?? "",
      });
      if (options?.showToast) {
        pushToast(t("toastClickLogged"), "info");
      }
    },
    [pushLog, user?.id, pushToast, t]
  );

  return { logClick };
}
