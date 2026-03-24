"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { slugify } from "@/lib/slugify";
import type { AdminRole, AdminUser, RolePermissions } from "@/lib/admin-rbac";
import {
  SUPER_ROLE_ID,
  SUPER_USER_ID,
  checkPermission,
  defaultRoles,
  defaultUsers,
  emptyPermissions,
  fullPermissions,
  SEED_ADMIN_PASSWORD,
  SEED_EDITOR_PASSWORD,
} from "@/lib/admin-rbac";

const STORAGE_KEY = "maison-moda-admin-rbac-v1";

type Persisted = {
  roles: AdminRole[];
  users: AdminUser[];
  currentUserId: string;
};

function seedPasswordForEmail(email: string): string {
  if (email === "admin@maisonmoda.local") return SEED_ADMIN_PASSWORD;
  if (email === "editor@maisonmoda.local") return SEED_EDITOR_PASSWORD;
  return "";
}

function normalizeUser(raw: unknown): AdminUser | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<AdminUser>;
  const id = String(o.id ?? "").trim();
  const email = String(o.email ?? "").trim().toLowerCase();
  const roleId = String(o.roleId ?? "").trim();
  if (!id || !email || !roleId) return null;
  const pwd =
    typeof o.password === "string" && o.password.length > 0
      ? o.password
      : seedPasswordForEmail(email) || "changeme";
  return {
    id,
    name: String(o.name ?? "").trim(),
    email,
    roleId,
    password: pwd,
    createdAt:
      typeof o.createdAt === "string" && o.createdAt
        ? o.createdAt
        : new Date().toISOString(),
  };
}

function normalizeRole(raw: unknown): AdminRole | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<AdminRole>;
  const id = String(o.id ?? "").trim();
  const name = String(o.name ?? "").trim();
  if (!id || !name) return null;
  const perms = o.permissions as Partial<RolePermissions> | undefined;
  if (!perms || typeof perms !== "object") return null;
  const isSuperAdmin =
    o.isSuperAdmin === true || id === SUPER_ROLE_ID;
  return {
    id,
    name,
    permissions: mergePerms(emptyPermissions(), perms),
    createdAt:
      typeof o.createdAt === "string" && o.createdAt
        ? o.createdAt
        : new Date().toISOString(),
    isSuperAdmin,
  };
}

function mergePerms(
  base: RolePermissions,
  patch: Partial<RolePermissions>
): RolePermissions {
  return {
    dashboard: Boolean(patch.dashboard ?? base.dashboard),
    products: { ...base.products, ...(patch.products ?? {}) },
    orders: { ...base.orders, ...(patch.orders ?? {}) },
    categories: { ...base.categories, ...(patch.categories ?? {}) },
    clients: { ...base.clients, ...(patch.clients ?? {}) },
    users: { ...base.users, ...(patch.users ?? {}) },
    roles: { ...base.roles, ...(patch.roles ?? {}) },
    audit: { ...base.audit, ...(patch.audit ?? {}) },
  };
}

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return {
      roles: defaultRoles(),
      users: defaultUsers(),
      currentUserId: SUPER_USER_ID,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        roles: defaultRoles(),
        users: defaultUsers(),
        currentUserId: SUPER_USER_ID,
      };
    }
    const p = JSON.parse(raw) as Partial<Persisted>;
    const roles = Array.isArray(p.roles)
      ? p.roles.map(normalizeRole).filter((x): x is AdminRole => x != null)
      : [];
    const users = Array.isArray(p.users)
      ? p.users.map(normalizeUser).filter((x): x is AdminUser => x != null)
      : [];
    let currentUserId = String(p.currentUserId ?? SUPER_USER_ID);
    if (roles.length === 0) roles.push(...defaultRoles());
    if (users.length === 0) users.push(...defaultUsers());
    if (!users.some((u) => u.id === currentUserId)) {
      currentUserId = users[0]?.id ?? SUPER_USER_ID;
    }
    return { roles, users, currentUserId };
  } catch {
    return {
      roles: defaultRoles(),
      users: defaultUsers(),
      currentUserId: SUPER_USER_ID,
    };
  }
}

function newId(prefix: string) {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

type AdminRbacContextValue = {
  hydrated: boolean;
  roles: AdminRole[];
  users: AdminUser[];
  currentUser: AdminUser | null;
  currentRole: AdminRole | null;
  /** Rôle courant = super administrateur (journaux, bypass RBAC sauf audit réservé super) */
  isSuperAdmin: boolean;
  permissions: RolePermissions | null;
  canAccess: (key: string) => boolean;
  setSessionUser: (userId: string) => void;
  addUser: (input: {
    name: string;
    email: string;
    roleId: string;
  }) => AdminUser | null;
  updateUser: (
    id: string,
    input: { name: string; email: string; roleId: string }
  ) => boolean;
  removeUser: (id: string) => boolean;
  addRole: (name: string, permissions: RolePermissions) => AdminRole | null;
  updateRole: (id: string, name: string, permissions: RolePermissions) => boolean;
  removeRole: (id: string) => boolean;
};

const AdminRbacContext = createContext<AdminRbacContextValue | null>(null);

export function AdminRbacProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<AdminRole[]>(() => defaultRoles());
  const [users, setUsers] = useState<AdminUser[]>(() => defaultUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(SUPER_USER_ID);
  const [hydrated, setHydrated] = useState(false);
  const usersRef = useRef(users);
  usersRef.current = users;

  useEffect(() => {
    const p = loadPersisted();
    setRoles(p.roles);
    setUsers(p.users);
    setCurrentUserId(p.currentUserId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = { roles, users, currentUserId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [roles, users, currentUserId, hydrated]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser?.roleId) ?? null,
    [roles, currentUser]
  );

  const permissions = currentRole?.permissions ?? null;

  const isSuperAdmin = Boolean(currentRole?.isSuperAdmin);

  const canAccess = useCallback(
    (key: string) => {
      if (key === "audit.view") {
        return isSuperAdmin;
      }
      if (isSuperAdmin) return true;
      return checkPermission(permissions, key);
    },
    [permissions, isSuperAdmin]
  );

  const setSessionUser = useCallback((userId: string) => {
    if (!usersRef.current.some((x) => x.id === userId)) return;
    setCurrentUserId(userId);
  }, []);

  const addUser = useCallback(
    (input: { name: string; email: string; roleId: string }) => {
      const email = input.email.trim().toLowerCase();
      const name = input.name.trim();
      if (!email || !name || !roles.some((r) => r.id === input.roleId)) {
        return null;
      }
      let created: AdminUser | null = null;
      setUsers((prev) => {
        if (prev.some((u) => u.email === email)) return prev;
        created = {
          id: newId("u"),
          name,
          email,
          roleId: input.roleId,
          password: "changeme",
          createdAt: new Date().toISOString(),
        };
        return [...prev, created];
      });
      return created;
    },
    [roles]
  );

  const updateUser = useCallback(
    (id: string, input: { name: string; email: string; roleId: string }) => {
      const email = input.email.trim().toLowerCase();
      if (!email || !roles.some((r) => r.id === input.roleId)) return false;
      let ok = false;
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === id);
        if (idx < 0) return prev;
        if (prev.some((u) => u.email === email && u.id !== id)) return prev;
        ok = true;
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          name: input.name.trim(),
          email,
          roleId: input.roleId,
        };
        return next;
      });
      return ok;
    },
    [roles]
  );

  const removeUser = useCallback((id: string) => {
    let fallback: string | null = null;
    let removed = false;
    setUsers((prev) => {
      if (prev.length <= 1) return prev;
      if (!prev.some((u) => u.id === id)) return prev;
      removed = true;
      const next = prev.filter((u) => u.id !== id);
      if (id === currentUserId && next.length > 0) fallback = next[0].id;
      return next;
    });
    if (fallback) setCurrentUserId(fallback);
    return removed;
  }, [currentUserId]);

  const addRole = useCallback((name: string, perms: RolePermissions) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let created: AdminRole | null = null;
    setRoles((prev) => {
      const base = slugify(trimmed) || "role";
      let id = base;
      let n = 0;
      while (prev.some((r) => r.id === id)) {
        n += 1;
        id = `${base}-${n}`;
      }
      created = {
        id,
        name: trimmed,
        permissions: mergePerms(emptyPermissions(), perms),
        createdAt: new Date().toISOString(),
        isSuperAdmin: false,
      };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateRole = useCallback((id: string, name: string, perms: RolePermissions) => {
    let ok = false;
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      ok = true;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        name: name.trim() || next[idx].name,
        permissions: mergePerms(emptyPermissions(), perms),
        isSuperAdmin: next[idx].isSuperAdmin,
      };
      return next;
    });
    return ok;
  }, []);

  const removeRole = useCallback((id: string) => {
    if (id === SUPER_ROLE_ID) return false;
    if (usersRef.current.some((u) => u.roleId === id)) return false;
    let ok = false;
    setRoles((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target?.isSuperAdmin) return prev;
      if (prev.length <= 1) return prev;
      if (!prev.some((r) => r.id === id)) return prev;
      ok = true;
      return prev.filter((r) => r.id !== id);
    });
    return ok;
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      roles,
      users,
      currentUser,
      currentRole,
      isSuperAdmin,
      permissions,
      canAccess,
      setSessionUser,
      addUser,
      updateUser,
      removeUser,
      addRole,
      updateRole,
      removeRole,
    }),
    [
      hydrated,
      roles,
      users,
      currentUser,
      currentRole,
      isSuperAdmin,
      permissions,
      canAccess,
      setSessionUser,
      addUser,
      updateUser,
      removeUser,
      addRole,
      updateRole,
      removeRole,
    ]
  );

  return (
    <AdminRbacContext.Provider value={value}>{children}</AdminRbacContext.Provider>
  );
}

export function useAdminRbac() {
  const ctx = useContext(AdminRbacContext);
  if (!ctx) {
    throw new Error("useAdminRbac must be used within AdminRbacProvider");
  }
  return ctx;
}

/** Évite d’importer fullPermissions partout */
export { fullPermissions };
