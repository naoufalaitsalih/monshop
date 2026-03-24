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
import type { Order } from "@/context/orders-context";
import { useOrders } from "@/context/orders-context";

const STORAGE_KEY = "maison-moda-clients-v1";

export type ClientSource = "order" | "contact" | "newsletter";

/** Client CRM — e-mail normalisé (minuscules) pour l’unicité. */
export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  /** Premier canal d’entrée */
  source: ClientSource;
  /** Tous les canaux (badges) */
  sources: ClientSource[];
  orders: string[];
  createdAt: string;
};

type PersistedShape = {
  clients: Client[];
  suppressedEmails: string[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sortSourcesUnique(s: ClientSource[]): ClientSource[] {
  const order: ClientSource[] = ["order", "contact", "newsletter"];
  const set = new Set(s);
  return order.filter((x) => set.has(x));
}

function normalizeClient(raw: unknown): Client | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<Client>;
  const id = String(o.id ?? "").trim();
  const email = normalizeEmail(String(o.email ?? ""));
  if (!id || !email) return null;
  const source = (["order", "contact", "newsletter"] as const).includes(
    o.source as ClientSource
  )
    ? (o.source as ClientSource)
    : "contact";
  const sourcesRaw = Array.isArray(o.sources) ? o.sources : [source];
  const sources = sortSourcesUnique(
    sourcesRaw.filter((x): x is ClientSource =>
      (["order", "contact", "newsletter"] as const).includes(x as ClientSource)
    ) as ClientSource[]
  );
  return {
    id,
    name: String(o.name ?? ""),
    email,
    phone: String(o.phone ?? ""),
    address: String(o.address ?? ""),
    source,
    sources: sources.length > 0 ? sources : [source],
    orders: Array.isArray(o.orders) ? o.orders.map(String) : [],
    createdAt:
      typeof o.createdAt === "string" && o.createdAt
        ? o.createdAt
        : new Date().toISOString(),
  };
}

function loadPersisted(): { clients: Client[]; suppressedEmails: Set<string> } {
  if (typeof window === "undefined") {
    return { clients: [], suppressedEmails: new Set() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { clients: [], suppressedEmails: new Set() };
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const clients = parsed
        .map(normalizeClient)
        .filter((x): x is Client => x != null);
      return { clients, suppressedEmails: new Set() };
    }
    const p = parsed as Partial<PersistedShape>;
    const clients = Array.isArray(p.clients)
      ? p.clients.map(normalizeClient).filter((x): x is Client => x != null)
      : [];
    const suppressed = Array.isArray(p.suppressedEmails)
      ? p.suppressedEmails.map((e) => normalizeEmail(String(e)))
      : [];
    return { clients, suppressedEmails: new Set(suppressed) };
  } catch {
    return { clients: [], suppressedEmails: new Set() };
  }
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `cl-${Date.now()}`;
}

function mergeOrderIntoClient(c: Client, o: Order): Client {
  const orders = c.orders.includes(o.id) ? c.orders : [...c.orders, o.id];
  const sources = sortSourcesUnique([...c.sources, "order"]);
  const addrFromOrder = [o.address, o.city].filter(Boolean).join(", ").trim();
  return {
    ...c,
    orders,
    sources,
    name: c.name.trim() || o.customerName.trim() || c.name,
    phone: c.phone.trim() || (o.phone ?? "").trim() || c.phone,
    address: c.address.trim() || addrFromOrder || c.address,
  };
}

function newClientFromOrder(o: Order): Client {
  const email = normalizeEmail(o.email);
  return {
    id: newId(),
    name: o.customerName.trim(),
    email,
    phone: (o.phone ?? "").trim(),
    address: [o.address, o.city].filter(Boolean).join(", ").trim(),
    source: "order",
    sources: ["order"],
    orders: [o.id],
    createdAt: o.date,
  };
}

function upsertFromOrderInList(
  list: Client[],
  o: Order,
  suppressed: Set<string>
): Client[] {
  const email = normalizeEmail(o.email);
  if (!email || suppressed.has(email)) return list;
  const idx = list.findIndex((c) => c.email === email);
  if (idx < 0) return [...list, newClientFromOrder(o)];
  return list.map((x, i) =>
    i === idx ? mergeOrderIntoClient(x, o) : x
  );
}

type ClientsContextValue = {
  clients: Client[];
  hydrated: boolean;
  upsertFromContact: (input: { name: string; email: string }) => boolean;
  upsertFromNewsletter: (email: string) => boolean;
  updateClient: (
    id: string,
    patch: { name: string; phone: string; address: string }
  ) => boolean;
  removeClient: (id: string) => void;
  getById: (id: string) => Client | undefined;
};

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const { orders, hydrated: ordersHydrated } = useOrders();
  const [clients, setClients] = useState<Client[]>([]);
  const [suppressedEmails, setSuppressedEmails] = useState<Set<string>>(
    () => new Set()
  );
  const suppressedRef = useRef<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    suppressedRef.current = suppressedEmails;
  }, [suppressedEmails]);

  useEffect(() => {
    const { clients: loaded, suppressedEmails: sup } = loadPersisted();
    setClients(loaded);
    setSuppressedEmails(sup);
    suppressedRef.current = sup;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedShape = {
      clients,
      suppressedEmails: [...suppressedEmails],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [clients, suppressedEmails, hydrated]);

  useEffect(() => {
    if (!ordersHydrated || !hydrated) return;
    setClients((prev) => {
      let next = prev;
      for (const o of orders) {
        next = upsertFromOrderInList(next, o, suppressedRef.current);
      }
      return next;
    });
  }, [orders, ordersHydrated, hydrated]);

  const upsertFromContact = useCallback(
    (input: { name: string; email: string }) => {
      const email = normalizeEmail(input.email);
      if (!email) return false;
      let created = false;
      setClients((prev) => {
        if (suppressedRef.current.has(email)) return prev;
        const idx = prev.findIndex((c) => c.email === email);
        if (idx < 0) {
          created = true;
          return [
            ...prev,
            {
              id: newId(),
              name: input.name.trim(),
              email,
              phone: "",
              address: "",
              source: "contact",
              sources: ["contact"],
              orders: [],
              createdAt: new Date().toISOString(),
            },
          ];
        }
        const c = prev[idx];
        const sources = sortSourcesUnique([...c.sources, "contact"]);
        return prev.map((x, i) =>
          i === idx
            ? {
                ...c,
                sources,
                name: x.name.trim() || input.name.trim() || x.name,
              }
            : x
        );
      });
      return created;
    },
    []
  );

  const upsertFromNewsletter = useCallback(
    (emailRaw: string) => {
      const email = normalizeEmail(emailRaw);
      if (!email) return false;
      let created = false;
      setClients((prev) => {
        if (suppressedRef.current.has(email)) return prev;
        const idx = prev.findIndex((c) => c.email === email);
        if (idx < 0) {
          created = true;
          return [
            ...prev,
            {
              id: newId(),
              name: "",
              email,
              phone: "",
              address: "",
              source: "newsletter",
              sources: ["newsletter"],
              orders: [],
              createdAt: new Date().toISOString(),
            },
          ];
        }
        const c = prev[idx];
        const sources = sortSourcesUnique([...c.sources, "newsletter"]);
        return prev.map((x, i) => (i === idx ? { ...c, sources } : x));
      });
      return created;
    },
    []
  );

  const updateClient = useCallback(
    (id: string, patch: { name: string; phone: string; address: string }) => {
      let ok = false;
      setClients((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx < 0) return prev;
        ok = true;
        return prev.map((c, i) =>
          i === idx
            ? {
                ...c,
                name: patch.name.trim(),
                phone: patch.phone.trim(),
                address: patch.address.trim(),
              }
            : c
        );
      });
      return ok;
    },
    []
  );

  const removeClient = useCallback((id: string) => {
    let emailToSuppress: string | null = null;
    setClients((prev) => {
      const found = prev.find((c) => c.id === id);
      if (!found) return prev;
      emailToSuppress = found.email;
      return prev.filter((c) => c.id !== id);
    });
    if (emailToSuppress) {
      setSuppressedEmails((s) => {
        const n = new Set(s);
        n.add(emailToSuppress!);
        suppressedRef.current = n;
        return n;
      });
    }
  }, []);

  const getById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const value = useMemo(
    () => ({
      clients,
      hydrated,
      upsertFromContact,
      upsertFromNewsletter,
      updateClient,
      removeClient,
      getById,
    }),
    [
      clients,
      hydrated,
      upsertFromContact,
      upsertFromNewsletter,
      updateClient,
      removeClient,
      getById,
    ]
  );

  return (
    <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) {
    throw new Error("useClients must be used within ClientsProvider");
  }
  return ctx;
}
