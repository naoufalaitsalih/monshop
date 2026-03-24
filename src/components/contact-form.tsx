"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useClients } from "@/context/clients-context";
import { useAdminToast } from "@/context/admin-toast-context";

export function ContactForm() {
  const t = useTranslations("contact");
  const tAdmin = useTranslations("admin");
  const { upsertFromContact } = useClients();
  const { pushToast } = useAdminToast();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (!name || !email) return;
    const created = upsertFromContact({ name, email });
    if (created) pushToast(tAdmin("toastClientAdded"), "success");
    setSent(true);
  };

  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm sm:p-8">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-ink"
          >
            {t("sent")}
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="c-name"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone"
              >
                {t("name")}
              </label>
              <input
                id="c-name"
                name="name"
                required
                className="w-full rounded-xl border border-ink/10 bg-sand/30 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label
                htmlFor="c-email"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone"
              >
                {t("email")}
              </label>
              <input
                id="c-email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-ink/10 bg-sand/30 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label
                htmlFor="c-msg"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone"
              >
                {t("message")}
              </label>
              <textarea
                id="c-msg"
                required
                rows={5}
                className="w-full rounded-xl border border-ink/10 bg-sand/30 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-ink px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              {t("send")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
