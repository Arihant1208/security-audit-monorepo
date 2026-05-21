"use client";

import { Shield, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-bold">Steve</span>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user?.email}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
