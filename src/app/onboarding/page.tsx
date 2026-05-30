"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completeOnboarding } from "@/actions/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await completeOnboarding(formData);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Set up your workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company / Business name</Label>
              <Input id="company" name="company" placeholder="Acme Studio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default currency</Label>
              <Input id="currency" name="currency" defaultValue="USD" maxLength={3} />
            </div>
            <Button type="submit" variant="glow" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Setting up..." : "Go to dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
