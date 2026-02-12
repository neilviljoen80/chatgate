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
import { Facebook, CheckCircle2, Info, AlertCircle, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import Link from "next/link";

interface ConnectPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ConnectPage({ searchParams }: ConnectPageProps) {
  const user = await getUser();
  const supabase = createClient();

  // Fetch connected pages
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

  return (
    <DashboardShell
      title="Connect Facebook Page"
      description="Link your Facebook Page to receive and respond to Messenger messages."
    >
      <div className="max-w-2xl space-y-6">
        {/* Success alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Successfully connected {pagesConnected || ""} Facebook Page(s)! 
              Your Messenger messages will now appear in your inbox.
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert */}
        {errorParam && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessages[errorParam] || errorMessages.unknown}
            </AlertDescription>
          </Alert>
        )}

        {/* Connected Pages */}
        {pages && pages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connected Pages</CardTitle>
              <CardDescription>
                These Facebook Pages are linked to your ChatGate account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{page.page_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Page ID: {page.page_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactive</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Connect Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5" />
              {pages && pages.length > 0
                ? "Connect Another Page"
                : "Connect Your Facebook Page"}
            </CardTitle>
            <CardDescription>
              When you connect your Page, ChatGate will be able to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm">
                Receive messages sent to your Facebook Page via Messenger
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm">
                Send automatic replies on your behalf
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm">
                Help you qualify leads and answer common questions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm">
                Keep your data secure — we only access what you authorize
              </p>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/api/auth/facebook">
                  <Facebook className="mr-2 h-4 w-4" />
                  Connect Facebook Page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
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
            </a>{" "}
            to start receiving messages.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardShell>
  );
}
