import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@prisma/client";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  total: { toString(): string };
  status: InvoiceStatus;
  dueDate: Date;
  client?: { name: string } | null;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  PAID: "success",
  SENT: "secondary",
  VIEWED: "secondary",
  OVERDUE: "danger",
  DRAFT: "secondary",
  CANCELLED: "secondary",
};

export function RecentInvoices({ invoices }: { invoices: InvoiceRow[] }) {
  if (!invoices.length) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No invoices yet.{" "}
        <Link
          href="/invoices/new"
          className="text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Create your first invoice
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/invoices/${invoice.id}`}
          className="glass-row flex items-center justify-between p-4"
        >
          <div>
            <p className="text-sm font-medium text-slate-100">{invoice.invoiceNumber}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {invoice.client?.name ?? "No client"} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
              {invoice.status}
            </Badge>
            <span className="text-sm font-semibold tabular-nums text-slate-100">
              {formatCurrency(parseFloat(invoice.total.toString()))}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
