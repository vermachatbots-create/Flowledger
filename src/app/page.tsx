import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FlowLedger</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="glow" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <LandingHero />
      <LandingFeatures />

      <footer className="border-t border-border/50 py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FlowLedger. Built for modern businesses.
      </footer>
    </div>
  );
}
