import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, Settings, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Welcome to ChatGate. Here's how to get started."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Step 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Connect Your Page</CardTitle>
            <CardDescription>
              Link your Facebook Page to start receiving Messenger messages
              through ChatGate.
            </CardDescription>
            <Button className="mt-4 w-full" asChild>
              <Link href="/dashboard/connect">Connect Facebook Page</Link>
            </Button>
          </CardHeader>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                2
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Set Up Auto-Replies</CardTitle>
            <CardDescription>
              Configure automatic responses for common questions your customers
              ask. Coming soon.
            </CardDescription>
            <Button className="mt-4 w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardHeader>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                3
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Customize Settings</CardTitle>
            <CardDescription>
              Set your timezone, notification preferences, and other account
              settings.
            </CardDescription>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}
