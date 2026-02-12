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
import { Facebook, CheckCircle2, Info } from "lucide-react";

export default function ConnectPage() {
  return (
    <DashboardShell
      title="Connect Facebook Page"
      description="Link your Facebook Page to receive and respond to Messenger messages."
    >
      <div className="max-w-2xl space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Facebook Page connection is being set up. You&apos;ll be able to
            connect your Page soon. In the meantime, here&apos;s what to expect.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5" />
              Connect Your Facebook Page
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
              <Button disabled className="w-full sm:w-auto">
                <Facebook className="mr-2 h-4 w-4" />
                Connect Facebook Page
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This feature is coming soon. You&apos;ll be redirected to
                Facebook to authorize access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
