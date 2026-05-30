import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/pricing"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.some(
    (route) =>
      nextUrl.pathname === route ||
      nextUrl.pathname.startsWith("/api/auth")
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isDashboard =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/invoices") ||
    nextUrl.pathname.startsWith("/clients") ||
    nextUrl.pathname.startsWith("/expenses") ||
    nextUrl.pathname.startsWith("/analytics") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/onboarding");

  if (isApiRoute && !nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  if (isLoggedIn && isDashboard) {
    const onboardingStep = req.auth?.user?.onboardingStep;
    if (
      onboardingStep &&
      onboardingStep !== "COMPLETED" &&
      !nextUrl.pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
