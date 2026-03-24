"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AdminAuditAction,
  AdminAuditEntity,
  AdminAuditLogEntry,
} from "@/lib/admin-audit-log";
import { isAdminAuditAction, isAdminAuditEntity } from "@/lib/admin-audit-log";

const STORAGE_KEY = "maison-moda-admin-audit-v1";
const MAX_LOGS = 500;

function parseEntry(raw: unknown): AdminAuditLogEntry | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<AdminAuditLogEntry>;
  const id = String(o.id ?? "").trim();
  const userId = String(o.userId ?? "").trim();
  const action = o.action;
  const entity = String(o.entity ?? "").trim();
  const details = String(o.details ?? "");
  const date = String(o.date ?? "").trim();
  if (!id || !userId || !isAdminAuditAction(String(action))) return null;
  if (!isAdminAuditEntity(entity)) return null;
  return {
    id,
    userId,
    action: action as AdminAuditAction,
    entity: entity as AdminAuditEntity,
    details,
    date: date || new Date().toISOString(),
  };
}

function loadFromStorage(): AdminAuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.map(parseEntry).filter((x): x is AdminAuditLogEntry => x != null);
  } catch {
    return [];
  }
}

type AdminAuditContextValue = {
  hydrated: boolean;
  logs: AdminAuditLogEntry[];
  pushLog: (input: {
    userId: string;
    action: AdminAuditAction;
    entity: AdminAuditEntity;
    details: string;
  }) => void;
};

const AdminAuditContext = createContext<AdminAuditContextValue | null>(null);

export function AdminAuditLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLogs(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      /* ignore quota */
    }
  }, [logs, hydrated]);

  const pushLog = useCallback(
    (input: {
      userId: string;
      action: AdminAuditAction;
      entity: AdminAuditEntity;
      details: string;
    }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `log-${Date.now()}`;
      const entry: AdminAuditLogEntry = {
        id,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        details: input.details,
        date: new Date().toISOString(),
      };
      setLogs((prev) => [entry, ...prev].slice(0, MAX_LOGS));
    },
    []
  );

  const value = useMemo(
    () => ({ hydrated, logs, pushLog }),
    [hydrated, logs, pushLog]
  );

  return (
    <AdminAuditContext.Provider value={value}>
      {children}
    </AdminAuditContext.Provider>
  );
}

export function useAdminAuditLog() {
  const ctx = useContext(AdminAuditContext);
  if (!ctx) {
    throw new Error("useAdminAuditLog must be used within AdminAuditLogProvider");
  }
  return ctx;
}
