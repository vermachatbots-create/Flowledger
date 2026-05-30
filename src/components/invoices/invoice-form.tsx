"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createInvoice } from "@/actions/invoices";

interface ClientOption {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceForm({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      clientId: (form.get("clientId") as string) || null,
      issueDate: new Date(form.get("issueDate") as string),
      dueDate: new Date(form.get("dueDate") as string),
      notes: (form.get("notes") as string) || undefined,
      currency: "USD",
      taxRate: parseFloat((form.get("taxRate") as string) || "0"),
      status: "DRAFT" as const,
      isRecurring: form.get("isRecurring") === "on",
      items,
    };

    startTransition(async () => {
      const result = await createInvoice(payload);
      if (result.success && result.data) {
        router.push(`/invoices/${result.data.id}`);
      } else if (!result.success) {
        setError(result.error);
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const dueDefault = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <select
                name="clientId"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax rate (%)</Label>
              <Input id="taxRate" name="taxRate" type="number" min="0" max="100" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input id="issueDate" name="issueDate" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={dueDefault} required />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Line items</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                  className="w-20"
                  min="0.01"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value))}
                  className="w-28"
                  min="0"
                  step="0.01"
                />
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add item
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Payment terms, thank you note..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRecurring" name="isRecurring" className="rounded" />
            <Label htmlFor="isRecurring" className="font-normal">
              Recurring invoice
            </Label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-lg font-semibold">
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            <Button type="submit" variant="glow" disabled={isPending} className="rounded-xl">
              {isPending ? "Creating..." : "Create invoice"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
