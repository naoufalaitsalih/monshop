/** Journal d’actions admin — types partagés (persisté via AdminAuditLogProvider). */

export type AdminAuditAction =
  | "ADD_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "CONFIRM_ORDER"
  | "ADD_CATEGORY"
  | "DELETE_CLIENT";

export type AdminAuditEntity = "product" | "order" | "category" | "client";

export type AdminAuditLogEntry = {
  id: string;
  userId: string;
  action: AdminAuditAction;
  entity: AdminAuditEntity;
  details: string;
  date: string;
};

export const ADMIN_AUDIT_ACTIONS: AdminAuditAction[] = [
  "ADD_PRODUCT",
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
  "CONFIRM_ORDER",
  "ADD_CATEGORY",
  "DELETE_CLIENT",
];

export function isAdminAuditAction(s: string): s is AdminAuditAction {
  return (ADMIN_AUDIT_ACTIONS as string[]).includes(s);
}
