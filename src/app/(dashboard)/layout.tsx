import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-[#070b12]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={session?.user} />
          <main className="relative flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
