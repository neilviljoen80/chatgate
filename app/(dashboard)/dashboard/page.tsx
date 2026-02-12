import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, Zap, Users, Inbox, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch stats
  const { data: pages } = await supabase
    .from("pages")
    .select("id")
    .eq("user_id", user?.id || "");

  const pageIds = pages?.map((p) => p.id) || [];

  let totalSubscribers = 0;
  let totalConversations = 0;
  let openConversations = 0;
  let totalFlows = 0;

  if (pageIds.length > 0) {
    const [subsResult, convosResult, openResult, flowsResult] = await Promise.all([
      supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .in("page_id", pageIds),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .in("page_id", pageIds),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .in("page_id", pageIds)
        .eq("status", "open"),
      supabase
        .from("flows")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user?.id || ""),
    ]);

    totalSubscribers = subsResult.count || 0;
    totalConversations = convosResult.count || 0;
    openConversations = openResult.count || 0;
    totalFlows = flowsResult.count || 0;
  }

  const hasPages = pageIds.length > 0;

  return (
    <DashboardShell
      title="Dashboard"
      description={`Welcome back${user?.email ? `, ${user.email}` : ""}. Here's your ChatGate overview.`}
    >
      {/* Stats Cards */}
      {hasPages ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Connected Pages</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pageIds.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Open Conversations</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openConversations}</div>
                <p className="text-xs text-muted-foreground">{totalConversations} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFlows}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Inbox
                </CardTitle>
                <CardDescription>
                  View and reply to Messenger conversations in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/inbox">Open Inbox</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation
                </CardTitle>
                <CardDescription>
                  Create keyword-triggered flows to automate responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/flows">Manage Flows</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Subscribers
                </CardTitle>
                <CardDescription>
                  View and manage people who&apos;ve messaged your pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/subscribers">View Subscribers</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Getting Started */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                  2
                </div>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Set Up Auto-Replies</CardTitle>
              <CardDescription>
                Create automation flows to respond to common questions automatically.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/dashboard/flows">Create a Flow</Link>
              </Button>
            </CardHeader>
          </Card>
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
                Set your timezone, notification preferences, and other account settings.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/dashboard/settings">Go to Settings</Link>
              </Button>
            </CardHeader>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
