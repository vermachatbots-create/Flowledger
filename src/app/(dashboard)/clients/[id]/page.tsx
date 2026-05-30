import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/server/auth";
import { assertResourceOwnership } from "@/server/guards";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const client = await db.client.findUnique({
    where: { id },
    include: {
      invoices: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!client) notFound();
  await assertResourceOwnership(userId, client.userId);

  const totalBilled = client.invoices.reduce(
    (s, i) => s + parseFloat(i.total.toString()),
    0
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{client.name}</h2>
        {client.company && <p className="text-muted-foreground">{client.company}</p>}
        {client.email && <p className="text-sm mt-1">{client.email}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total billed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{client.invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices for this client.</p>
          ) : (
            client.invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 hover:text-primary"
              >
                <div>
                  <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.issueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={inv.status === "PAID" ? "success" : "secondary"}>
                    {inv.status}
                  </Badge>
                  <span className="font-medium text-sm">
                    {formatCurrency(parseFloat(inv.total.toString()))}
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to clients
      </Link>
    </div>
  );
}
