import Link from "next/link";
import { requireUserId } from "@/server/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const userId = await requireUserId();
  const clients = await db.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { invoices: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} clients</p>
        </div>
        <ClientFormDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card className="rounded-2xl border-border/50 hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{client.name}</CardTitle>
                {client.company && (
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {client._count.invoices} invoice{client._count.invoices !== 1 ? "s" : ""}
                </p>
                {client.email && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{client.email}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {clients.length === 0 && (
        <Card className="rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No clients yet. Add your first client.</p>
        </Card>
      )}
    </div>
  );
}
