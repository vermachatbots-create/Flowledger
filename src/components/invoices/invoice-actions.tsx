"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markInvoicePaid, duplicateInvoice, deleteInvoice } from "@/actions/invoices";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "PAID" && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await markInvoicePaid(invoiceId);
              router.refresh();
            })
          }
        >
          <Check className="h-4 w-4 mr-1" />
          Mark paid
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await duplicateInvoice(invoiceId);
            if (result.success && result.data) {
              router.push(`/invoices/${result.data.id}`);
            }
          })
        }
      >
        <Copy className="h-4 w-4 mr-1" />
        Duplicate
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-xl text-red-400"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteInvoice(invoiceId);
            router.push("/invoices");
          })
        }
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
