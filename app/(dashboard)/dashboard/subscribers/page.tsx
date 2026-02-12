import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubscribersClient } from "@/components/subscribers/subscribers-client";

export default async function SubscribersPage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch user's pages
  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_name")
    .eq("user_id", user?.id || "");

  if (!pages || pages.length === 0) {
    return (
      <DashboardShell
        title="Subscribers"
        description="People who have messaged your Facebook Pages."
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Connect a Facebook Page to start collecting subscribers.
          </p>
          <a
            href="/dashboard/connect"
            className="mt-4 text-primary hover:underline text-sm font-medium"
          >
            Connect a Page
          </a>
        </div>
      </DashboardShell>
    );
  }

  const pageIds = pages.map((p) => p.id);

  // Fetch subscribers with page info
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*, page:pages(page_name)")
    .in("page_id", pageIds)
    .order("last_interaction", { ascending: false })
    .limit(100);

  return (
    <DashboardShell
      title="Subscribers"
      description="People who have messaged your Facebook Pages."
    >
      <SubscribersClient subscribers={subscribers || []} />
    </DashboardShell>
  );
}
