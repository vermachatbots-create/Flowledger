"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/billing";

export function PricingActions({ tier }: { tier: "PRO" | "TEAM" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="glow"
      className="w-full rounded-xl"
      disabled={isPending}
      onClick={() => startTransition(() => createCheckoutSession(tier))}
    >
      {isPending ? "Loading..." : `Upgrade to ${tier}`}
    </Button>
  );
}
