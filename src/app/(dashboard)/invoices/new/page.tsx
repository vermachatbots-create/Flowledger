import { requireUserId } from "@/server/auth";
import { db } from "@/lib/db";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata = { title: "New Invoice" };

export default async function NewInvoicePage() {
  const userId = await requireUserId();
  const clients = await db.client.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Create invoice</h2>
      <InvoiceForm clients={clients} />
    </div>
  );
}
