import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Link2,
  Zap,
  Users,
  Inbox,
  ArrowRight,
  CheckCircle2,
  Circle,
  MessageSquare,
  Sparkles,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_name")
    .eq("user_id", user?.id || "");

  const pageIds = pages?.map((p) => p.id) || [];
  const hasPages = pageIds.length > 0;

  let totalSubscribers = 0;
  let openConversations = 0;
  let totalFlows = 0;
  let activeFlows = 0;

  if (pageIds.length > 0) {
    const [subsResult, openResult, flowsResult, activeFlowsResult] =
      await Promise.all([
        supabase.from("subscribers").select("id", { count: "exact", head: true }).in("page_id", pageIds),
        supabase.from("conversations").select("id", { count: "exact", head: true }).in("page_id", pageIds).eq("status", "open"),
        supabase.from("flows").select("id", { count: "exact", head: true }).eq("user_id", user?.id || ""),
        supabase.from("flows").select("id", { count: "exact", head: true }).eq("user_id", user?.id || "").eq("is_active", true),
      ]);

    totalSubscribers = subsResult.count || 0;
    openConversations = openResult.count || 0;
    totalFlows = flowsResult.count || 0;
    activeFlows = activeFlowsResult.count || 0;
  }

  const firstName = user?.email?.split("@")[0] || "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Setup progress
  const steps = [
    { done: hasPages, label: "Connect Facebook Page" },
    { done: totalFlows > 0, label: "Create your first automation" },
    { done: activeFlows > 0, label: "Activate an automation flow" },
    { done: totalSubscribers > 0, label: "Get your first subscriber" },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  const stats = [
    {
      label: "Subscribers",
      value: totalSubscribers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/subscribers",
    },
    {
      label: "Open Chats",
      value: openConversations,
      icon: Inbox,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/inbox",
    },
    {
      label: "Active Flows",
      value: activeFlows,
      icon: Zap,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/flows",
    },
    {
      label: "Connected Pages",
      value: pageIds.length,
      icon: Link2,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/dashboard/connect",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-5 md:p-8">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Hello, {displayName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {hasPages
            ? `${pageIds.length} connected channel${pageIds.length > 1 ? "s" : ""}`
            : "Let's get your Messenger automation up and running"}
        </p>
      </div>

      {/* Stats Row */}
      {hasPages && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="card-hover border-0 shadow-sm hover:shadow-md cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} ${stat.color} rounded-xl p-3`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Setup Progress */}
      {!hasPages || completedSteps < steps.length ? (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Setup Progress
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Complete these steps to unlock the full power of ChatGate
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">{completedSteps}/{steps.length}</span>
              </div>
            </div>
            <Progress value={progressPercent} className="mt-4 h-2 bg-white/20" />
          </div>
          <CardContent className="p-6 space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.label}
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  step.done ? "bg-emerald-50" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm font-medium flex-1 ${step.done ? "text-emerald-700 line-through" : ""}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <Button size="sm" variant="ghost" asChild className="text-primary">
                    <Link href={idx === 0 ? "/dashboard/connect" : "/dashboard/flows"}>
                      Start <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Start Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Start Here</h2>
        <div className="grid gap-4 md:grid-cols-3 stagger-children">
          <Card className="card-hover border-0 shadow-sm group cursor-pointer overflow-hidden">
            <Link href="/dashboard/flows">
              <CardHeader className="pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-2 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-base">Create an Automation</CardTitle>
                <CardDescription>
                  Set up keyword-triggered flows to respond to customers automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Link>
          </Card>

          <Card className="card-hover border-0 shadow-sm group cursor-pointer overflow-hidden">
            <Link href="/dashboard/inbox">
              <CardHeader className="pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="text-base">Live Chat</CardTitle>
                <CardDescription>
                  View and reply to Messenger conversations in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open inbox <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Link>
          </Card>

          <Card className="card-hover border-0 shadow-sm group cursor-pointer overflow-hidden">
            <Link href="/dashboard/broadcasts">
              <CardHeader className="pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                  <Send className="h-6 w-6" />
                </div>
                <CardTitle className="text-base">Send a Broadcast</CardTitle>
                <CardDescription>
                  Send targeted messages to all your subscribers at once.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Create broadcast <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
