"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createBillingPortalSession } from "@/actions/billing";
import Link from "next/link";

export function BillingSettings({ hasStripe }: { hasStripe: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      {hasStripe ? (
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={isPending}
          onClick={() => startTransition(() => createBillingPortalSession())}
        >
          {isPending ? "Loading..." : "Manage billing"}
        </Button>
      ) : (
        <Link href="/pricing">
          <Button variant="glow" className="rounded-xl">
            Upgrade plan
          </Button>
        </Link>
      )}
    </div>
  );
}
