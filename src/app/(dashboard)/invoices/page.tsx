import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUserId } from "@/server/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const userId = await requireUserId();
  const invoices = await db.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} total invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button variant="glow" className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            New invoice
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              No invoices yet. Create your first one.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {invoice.client?.name ?? "No client"} · {formatDate(invoice.issueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "danger" : "secondary"}>
                      {invoice.status}
                    </Badge>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(invoice.total.toString()))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
