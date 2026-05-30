import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/server/auth";
import { assertResourceOwnership } from "@/server/guards";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceActions } from "@/components/invoices/invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: true,
    },
  });

  if (!invoice) notFound();
  await assertResourceOwnership(userId, invoice.userId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {invoice.client?.name ?? "No client"} · Issued {formatDate(invoice.issueDate)}
          </p>
        </div>
        <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "danger" : "secondary"}>
          {invoice.status}
        </Badge>
      </div>

      <InvoiceActions invoiceId={invoice.id} status={invoice.status} />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.description} × {parseFloat(item.quantity.toString())}
                </span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(item.total.toString()))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(parseFloat(invoice.subtotal.toString()))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(parseFloat(invoice.taxAmount.toString()))}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(parseFloat(invoice.total.toString()))}</span>
            </div>
          </div>
          {invoice.notes && (
            <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              {invoice.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to invoices
      </Link>
    </div>
  );
}
