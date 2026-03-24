"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  kind: ToastKind;
};

type AdminToastContextValue = {
  toasts: Toast[];
  pushToast: (message: string, kind?: ToastKind) => void;
  dismiss: (id: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `t-${Date.now()}`;
      setToasts((t) => [...t, { id, message, kind }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ toasts, pushToast, dismiss }),
    [toasts, pushToast, dismiss]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </AdminToastContext.Provider>
  );
}

function ToastViewport() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed bottom-6 end-6 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            t.kind === "success"
              ? "border-accent/40 bg-white text-ink"
              : t.kind === "info"
                ? "border-sky-200 bg-sky-50 text-sky-950"
                : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-md p-1 text-stone hover:bg-black/5"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}
