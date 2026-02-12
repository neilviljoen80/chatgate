import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ChatGate</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild className="gradient-primary border-0 text-white shadow-md shadow-primary/20">
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
