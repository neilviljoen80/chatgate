import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Facebook,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield,
  Zap,
  MessageSquare,
  Globe,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import Link from "next/link";

interface ConnectPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ConnectPage({ searchParams }: ConnectPageProps) {
  const user = await getUser();
  const supabase = createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  const success = searchParams.success === "true";
  const errorParam = searchParams.error as string | undefined;
  const pagesConnected = searchParams.pages as string | undefined;

  const errorMessages: Record<string, string> = {
    denied: "You denied permission. Please try again and accept the required permissions.",
    missing_params: "Something went wrong with the OAuth flow. Please try again.",
    invalid_state: "Invalid session state. Please try connecting again.",
    token_exchange: "Failed to exchange authorization code. Check your app credentials.",
    no_pages: "No Facebook Pages found. Make sure you are an admin of at least one Page.",
    unknown: "An unexpected error occurred. Please try again.",
  };

  const hasPages = pages && pages.length > 0;

  return (
    <DashboardShell
      title="Connect Channel"
      description="Link your Facebook Page to start automating Messenger conversations."
    >
      <div className="max-w-3xl space-y-6">
        {/* Success alert */}
        {success && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 animate-slide-up">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription>
              Successfully connected {pagesConnected || ""} Facebook Page(s)!
              Your Messenger messages will now appear in your inbox.
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert */}
        {errorParam && (
          <Alert variant="destructive" className="animate-slide-up">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessages[errorParam] || errorMessages.unknown}
            </AlertDescription>
          </Alert>
        )}

        {/* Connected Pages */}
        {hasPages && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Connected Pages</CardTitle>
              <CardDescription>
                These Facebook Pages are linked to your ChatGate account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{page.page_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {page.page_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {page.is_active ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Connect CTA */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {/* Visual header */}
          <div className="relative gradient-primary p-8 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blob animate-float" />
            <div className="absolute right-20 -bottom-4 h-20 w-20 rounded-full bg-white/5 blob" style={{ animationDelay: "2s" }} />

            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
                <Facebook className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {hasPages ? "Connect Another Page" : "Connect Your Facebook Page"}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  One-click setup — takes less than 60 seconds
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Receive Messages",
                  desc: "All Messenger messages appear in your ChatGate inbox",
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  icon: Zap,
                  title: "Auto-Reply",
                  desc: "Set up automated responses for common questions",
                  color: "text-violet-600 bg-violet-50",
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  desc: "We only access what you explicitly authorize",
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  icon: Globe,
                  title: "24/7 Availability",
                  desc: "Never miss a lead — respond even when you're offline",
                  color: "text-orange-600 bg-orange-50",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} shrink-0`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mb-8 p-5 rounded-xl bg-muted/50 border border-border/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How it works
              </h4>
              <div className="flex items-start gap-4">
                {[
                  { step: "1", label: "Click connect below" },
                  { step: "2", label: "Authorize ChatGate on Facebook" },
                  { step: "3", label: "Select your Page(s)" },
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center gap-2 flex-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {idx < 2 && <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0 ml-auto hidden sm:block" />}
                  </div>
                ))}
              </div>
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto gradient-primary border-0 text-white hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              <Link href="/api/auth/facebook">
                <Facebook className="mr-2 h-5 w-5" />
                Connect Facebook Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            You must be an admin of the Facebook Page you want to connect.
            After connecting, configure your webhook URL in the{" "}
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Meta App Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
