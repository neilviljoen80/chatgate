import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FlowsClient } from "@/components/flows/flows-client";

export default async function FlowsPage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch user's pages
  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_name")
    .eq("user_id", user?.id || "");

  // Fetch user's flows with steps
  const { data: flows } = await supabase
    .from("flows")
    .select("*, flow_steps(*), page:pages(page_name)")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      title="Automation Flows"
      description="Create automated reply sequences for your Messenger conversations."
    >
      <FlowsClient
        flows={flows || []}
        pages={pages || []}
      />
    </DashboardShell>
  );
}
