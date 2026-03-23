"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category } from "@/data/products";

const STORAGE_KEY = "maison-moda-orders-v1";

export type OrderLineItem = {
  productId: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  quantity: number;
  size: string;
  unitPriceMad: number;
  lineTotalMad: number;
  category?: Category;
  isPack?: boolean;
};

export type OrderStatus = "pending" | "confirmed";

export type Order = {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city?: string;
  items: OrderLineItem[];
  total: number;
  date: string;
  status: OrderStatus;
};

export type CreateOrderInput = Omit<Order, "id" | "date" | "status"> & {
  status?: OrderStatus;
};

type OrdersContextValue = {
  orders: Order[];
  hydrated: boolean;
  addOrder: (input: CreateOrderInput) => Order;
  confirmOrder: (id: string) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function normalizeOrder(raw: unknown): Order | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Partial<Order>;
  if (!o.id || !Array.isArray(o.items)) return null;
  const status: OrderStatus =
    o.status === "confirmed" ? "confirmed" : "pending";
  return {
    id: String(o.id),
    customerName: String(o.customerName ?? ""),
    email: String(o.email ?? ""),
    phone: o.phone ? String(o.phone) : undefined,
    address: String(o.address ?? ""),
    city: o.city ? String(o.city) : undefined,
    items: o.items as OrderLineItem[],
    total: Number(o.total) || 0,
    date: String(o.date ?? new Date().toISOString()),
    status,
  };
}

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeOrder)
      .filter((x): x is Order => x != null);
  } catch {
    return [];
  }
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOrders(loadOrders());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder = useCallback((input: CreateOrderInput) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ord-${Date.now()}`;
    const order: Order = {
      ...input,
      status: input.status ?? "pending",
      id,
      date: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const confirmOrder = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "confirmed" as const } : o
      )
    );
  }, []);

  const value = useMemo(
    () => ({ orders, hydrated, addOrder, confirmOrder }),
    [orders, hydrated, addOrder, confirmOrder]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return ctx;
}
