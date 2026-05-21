"use client";

import { UserButton } from "@clerk/nextjs";
import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
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
          Security Audit Platform
        </span>
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
