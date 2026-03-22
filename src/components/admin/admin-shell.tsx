"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <div className="hidden w-60 shrink-0 lg:block lg:sticky lg:top-0 lg:h-screen lg:self-start">
        <AdminSidebar />
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed start-0 top-0 z-50 h-full w-64 max-w-[85vw] transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-ink"
            aria-expanded={open}
            aria-label="Ouvrir le menu"
          >
            Menu
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone">
            Admin
          </span>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
