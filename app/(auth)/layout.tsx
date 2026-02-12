import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:flex-1 gradient-primary relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blob animate-float" />
        <div className="absolute -left-8 bottom-20 h-48 w-48 rounded-full bg-white/5 blob" style={{ animationDelay: "3s" }} />
        <div className="absolute right-1/4 bottom-10 h-32 w-32 rounded-full bg-white/5 blob" style={{ animationDelay: "1.5s" }} />

        <div className="relative text-center text-white px-12 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">ChatGate</h1>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">
            Automate your Facebook Messenger conversations. Qualify leads,
            answer questions, and grow your business — all on autopilot.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-white/50">
            <span>✓ Free to start</span>
            <span>✓ No coding</span>
            <span>✓ 60s setup</span>
          </div>
        </div>
      </div>

      {/* Right - Auth form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">ChatGate</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
