import { OnboardingStep, SubscriptionTier } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionTier?: SubscriptionTier;
      onboardingStep?: OnboardingStep;
      company?: string | null;
      currency?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
