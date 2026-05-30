import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { PricingActions } from "@/components/billing/pricing-actions";

const plans = [
  {
    key: "FREE" as const,
    plan: PLANS.FREE,
    features: ["5 invoices", "3 clients", "20 expenses", "3 AI insights/mo"],
  },
  {
    key: "PRO" as const,
    plan: PLANS.PRO,
    features: ["100 invoices", "50 clients", "500 expenses", "50 AI insights/mo", "Priority support"],
    popular: true,
  },
  {
    key: "TEAM" as const,
    plan: PLANS.TEAM,
    features: ["Unlimited everything", "Team collaboration", "Custom reports", "Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">FlowLedger</span>
        </Link>
      </nav>

      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground mt-3">Start free. Scale as you grow.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(({ key, plan, features, popular }) => (
            <Card
              key={key}
              className={`rounded-2xl relative ${popular ? "border-primary shadow-glow" : ""}`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold mt-2">
                  ${plan.price}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {key === "FREE" ? (
                  <Link href="/register">
                    <Button variant="outline" className="w-full rounded-xl">
                      Get started
                    </Button>
                  </Link>
                ) : (
                  <PricingActions tier={key} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
