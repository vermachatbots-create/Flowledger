"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createExpense } from "@/actions/expenses";

interface Category {
  value: string;
  label: string;
}

export function ExpenseForm({ categories }: { categories: readonly Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      category: form.get("category") as string,
      description: form.get("description") as string,
      amount: parseFloat(form.get("amount") as string),
      vendor: (form.get("vendor") as string) || undefined,
      date: new Date(form.get("date") as string),
      isRecurring: form.get("isRecurring") === "on",
    };

    startTransition(async () => {
      const result = await createExpense(payload);
      if (result.success) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              name="category"
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Input name="description" required placeholder="AWS, Figma, etc." />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input name="amount" type="number" min="0.01" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input name="date" type="date" defaultValue={today} required />
          </div>
          <Button type="submit" disabled={isPending} className="rounded-xl">
            {isPending ? "Adding..." : "Add expense"}
          </Button>
          {error && <p className="text-sm text-red-400 sm:col-span-full">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
