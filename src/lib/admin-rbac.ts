/** RBAC admin — types + helpers (prêt pour API future). */

export type ProductPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type OrderPermissions = {
  view: boolean;
  confirm: boolean;
};

export type CategoryPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type ClientPermissions = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type UserPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type RolesMetaPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

/** Journal d’audit (/admin/logs) */
export type AuditPermissions = {
  view: boolean;
};

export type RolePermissions = {
  dashboard: boolean;
  products: ProductPermissions;
  orders: OrderPermissions;
  categories: CategoryPermissions;
  clients: ClientPermissions;
  users: UserPermissions;
  /** Gestion des définitions de rôles (/admin/roles) */
  roles: RolesMetaPermissions;
  audit: AuditPermissions;
};

export type AdminRole = {
  id: string;
  name: string;
  permissions: RolePermissions;
  createdAt: string;
  /**
   * Super administrateur : accès complet RBAC + seuls journaux (/admin/logs, logs par user).
   * Ne pas retirer sur le rôle seed `role_super_admin`.
   */
  isSuperAdmin?: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  createdAt: string;
  /** Mot de passe en clair (temporaire — remplacer par hash côté API) */
  password?: string;
};

const SEED = "2024-01-01T00:00:00.000Z";

export const SUPER_ROLE_ID = "role_super_admin";
export const EDITOR_ROLE_ID = "role_editor";
export const SUPER_USER_ID = "user_super_admin";
export const EDITOR_USER_ID = "user_editor";

export function roleIsSuperAdmin(role: AdminRole | null | undefined): boolean {
  if (!role) return false;
  return Boolean(role.isSuperAdmin) || role.id === SUPER_ROLE_ID;
}

export function fullPermissions(): RolePermissions {
  const all = { view: true, create: true, edit: true, delete: true };
  return {
    dashboard: true,
    products: { ...all },
    orders: { view: true, confirm: true },
    categories: { ...all },
    clients: { view: true, edit: true, delete: true },
    users: { ...all },
    roles: { ...all },
    audit: { view: true },
  };
}

export function editorPermissions(): RolePermissions {
  return {
    dashboard: true,
    products: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
    orders: { view: true, confirm: false },
    categories: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
    clients: { view: true, edit: true, delete: false },
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    roles: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    audit: { view: false },
  };
}

export function defaultRoles(): AdminRole[] {
  return [
    {
      id: SUPER_ROLE_ID,
      name: "super_admin",
      permissions: fullPermissions(),
      createdAt: SEED,
      isSuperAdmin: true,
    },
    {
      id: EDITOR_ROLE_ID,
      name: "Éditeur",
      permissions: editorPermissions(),
      createdAt: SEED,
      isSuperAdmin: false,
    },
  ];
}

/** Mots de passe seed (démo) — alignés sur la migration des comptes existants */
export const SEED_ADMIN_PASSWORD = "admin123";
export const SEED_EDITOR_PASSWORD = "editor123";

export function defaultUsers(): AdminUser[] {
  return [
    {
      id: SUPER_USER_ID,
      name: "Administrateur",
      email: "admin@maisonmoda.local",
      roleId: SUPER_ROLE_ID,
      createdAt: SEED,
      password: SEED_ADMIN_PASSWORD,
    },
    {
      id: EDITOR_USER_ID,
      name: "Éditeur boutique",
      email: "editor@maisonmoda.local",
      roleId: EDITOR_ROLE_ID,
      createdAt: SEED,
      password: SEED_EDITOR_PASSWORD,
    },
  ];
}

/** Clé plate : "dashboard" | "products.view" | "orders.confirm" | … */
export function checkPermission(
  permissions: RolePermissions | null | undefined,
  key: string
): boolean {
  if (!permissions) return false;
  const k = key.trim();
  if (k === "dashboard") return Boolean(permissions.dashboard);
  const dot = k.indexOf(".");
  if (dot < 0) return false;
  const section = k.slice(0, dot) as keyof RolePermissions;
  const action = k.slice(dot + 1);
  const block = permissions[section];
  if (block && typeof block === "object" && action in block) {
    return Boolean((block as Record<string, boolean>)[action]);
  }
  return false;
}

export function emptyPermissions(): RolePermissions {
  return {
    dashboard: false,
    products: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, confirm: false },
    categories: { view: false, create: false, edit: false, delete: false },
    clients: { view: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
  };
}
