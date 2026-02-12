import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InboxClient } from "@/components/inbox/inbox-client";

export default async function InboxPage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch user's pages
  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_id, page_name")
    .eq("user_id", user?.id || "");

  if (!pages || pages.length === 0) {
    return (
      <DashboardShell
        title="Inbox"
        description="View and respond to Messenger conversations."
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No Facebook Pages connected yet. Connect a Page to start receiving messages.
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

  // Fetch conversations with subscriber info for all user's pages
  const pageIds = pages.map((p) => p.id);

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      subscriber:subscribers(id, psid, first_name, last_name, profile_pic),
      page:pages(id, page_name)
    `)
    .in("page_id", pageIds)
    .order("last_message_at", { ascending: false })
    .limit(50);

  return (
    <DashboardShell
      title="Inbox"
      description="View and respond to Messenger conversations."
    >
      <InboxClient
        conversations={conversations || []}
        pages={pages}
      />
    </DashboardShell>
  );
}
