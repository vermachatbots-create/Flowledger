"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/actions/clients";
import { Card } from "@/components/ui/card";

export function ClientFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    startTransition(async () => {
      const result = await createClient(data);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else if (!result.success) {
        setError(result.error);
      }
    });
  };

  if (!open) {
    return (
      <Button variant="glow" className="rounded-xl" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add client
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <h3 className="font-semibold mb-4">New client</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
