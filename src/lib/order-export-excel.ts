import type { Order, OrderStatus } from "@/context/orders-context";
import * as XLSX from "xlsx";

export type OrderExcelHeaders = {
  id: string;
  client: string;
  phone: string;
  total: string;
  status: string;
  date: string;
};

export function exportOrdersToExcel(
  orders: Order[],
  filename: string,
  headers: OrderExcelHeaders,
  statusLabel: (s: OrderStatus) => string,
  formatDate: (iso: string) => string
) {
  const rows = orders.map((o) => ({
    [headers.id]: o.id,
    [headers.client]: o.customerName,
    [headers.phone]: o.phone ?? "—",
    [headers.total]: o.total,
    [headers.status]: statusLabel(o.status),
    [headers.date]: formatDate(o.date),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Commandes");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
