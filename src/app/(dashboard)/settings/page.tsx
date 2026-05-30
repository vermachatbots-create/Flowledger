import { requireUserId } from "@/server/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingSettings } from "@/components/billing/billing-settings";
import { PLANS } from "@/lib/constants";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      company: true,
      currency: true,
      subscriptionTier: true,
      stripeCustomerId: true,
    },
  });

  const plan = PLANS[user.subscriptionTier];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {user.name ?? "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">Company:</span> {user.company ?? "—"}</p>
          <p><span className="text-muted-foreground">Currency:</span> {user.currency}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Current plan: <strong>{plan.name}</strong> (${plan.price}/mo)
          </p>
          <BillingSettings hasStripe={!!user.stripeCustomerId} />
        </CardContent>
      </Card>
    </div>
  );
}
