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
};

export type CreateOrderInput = Omit<Order, "id" | "date">;

type OrdersContextValue = {
  orders: Order[];
  hydrated: boolean;
  addOrder: (input: CreateOrderInput) => Order;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
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
      id,
      date: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const value = useMemo(
    () => ({ orders, hydrated, addOrder }),
    [orders, hydrated, addOrder]
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
