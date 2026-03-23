import type { Order, OrderLineItem } from "@/context/orders-context";

export type OrderPdfCopy = {
  docTitle: string;
  orderId: string;
  client: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  itemsTitle: string;
  total: string;
  date: string;
  qty: string;
  size: string;
  unitShort: string;
};

function lineProductName(line: OrderLineItem, locale: string): string {
  return locale === "ar" ? line.nameAr : line.nameFr;
}

export async function downloadOrderPdf(
  order: Order,
  copy: OrderPdfCopy,
  locale: string,
  formatDate: (iso: string) => string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;

  doc.setFontSize(16);
  doc.text(copy.docTitle, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`${copy.orderId}: ${order.id}`, margin, y);
  y += 7;
  doc.text(`${copy.date}: ${formatDate(order.date)}`, margin, y);
  y += 12;

  doc.setFontSize(12);
  doc.text(copy.client, margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.text(order.customerName, margin, y);
  y += 6;
  doc.text(`${copy.email}: ${order.email}`, margin, y);
  y += 6;
  doc.text(`${copy.phone}: ${order.phone ?? "—"}`, margin, y);
  y += 6;
  doc.text(`${copy.address}: ${order.address}`, margin, y);
  y += 6;
  if (order.city) {
    doc.text(`${copy.city}: ${order.city}`, margin, y);
    y += 6;
  }
  y += 6;

  doc.setFontSize(12);
  doc.text(copy.itemsTitle, margin, y);
  y += 8;

  doc.setFontSize(9);
  for (const line of order.items) {
    const name = lineProductName(line, locale);
    const row = [
      name.slice(0, 55),
      `${copy.size}: ${line.size}`,
      `${copy.qty}: ${line.quantity} × ${line.unitPriceMad} MAD/${copy.unitShort} = ${line.lineTotalMad} MAD`,
    ].join(" · ");
    const lines = doc.splitTextToSize(row, 180);
    for (const chunk of lines) {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      doc.text(chunk, margin, y);
      y += 5;
    }
    y += 2;
  }

  y += 6;
  if (y > 255) {
    doc.addPage();
    y = 18;
  }
  doc.setFontSize(12);
  doc.text(`${copy.total}: ${order.total} MAD`, margin, y);

  const safe = order.id.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 12) || "commande";
  doc.save(`commande-${safe}.pdf`);
}
