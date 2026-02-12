"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Link2,
  Settings,
  MessageSquare,
  Inbox,
  Zap,
  Users,
  Send,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Live Chat", href: "/dashboard/inbox", icon: Inbox },
  { title: "Contacts", href: "/dashboard/subscribers", icon: Users },
  { title: "Automation", href: "/dashboard/flows", icon: Zap },
  { title: "Broadcasts", href: "/dashboard/broadcasts", icon: Send },
  { title: "Connect", href: "/dashboard/connect", icon: Link2 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-[hsl(var(--sidebar))] border-r-0">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">ChatGate</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white/80 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
