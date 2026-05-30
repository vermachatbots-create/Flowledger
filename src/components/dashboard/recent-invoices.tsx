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
      <p className="text-sm text-muted-foreground py-8 text-center">
        No invoices yet.{" "}
        <Link href="/invoices/new" className="text-primary hover:underline">
          Create your first invoice
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/invoices/${invoice.id}`}
          className="flex items-center justify-between rounded-xl border border-border/50 p-4 hover:bg-muted/30 transition-colors"
        >
          <div>
            <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {invoice.client?.name ?? "No client"} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
              {invoice.status}
            </Badge>
            <span className="font-semibold text-sm">
              {formatCurrency(parseFloat(invoice.total.toString()))}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
