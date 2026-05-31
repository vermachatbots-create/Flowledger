"use client";

import { signOut } from "next-auth/react";
import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  title?: string;
}

export function Header({ user, title = "Dashboard" }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "FL";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#070b12]/70 px-4 backdrop-blur-2xl sm:px-6">
      <h1 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">{title}</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Bell className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="ml-2 flex items-center gap-3 border-l border-white/[0.06] pl-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
