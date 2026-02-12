import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InboxClient } from "@/components/inbox/inbox-client";
import { Button } from "@/components/ui/button";
import { Inbox, Link2 } from "lucide-react";
import Link from "next/link";

export default async function InboxPage() {
  const user = await getUser();
  const supabase = createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_id, page_name")
    .eq("user_id", user?.id || "");

  if (!pages || pages.length === 0) {
    return (
      <DashboardShell
        title="Live Chat"
        description="View and respond to Messenger conversations in real-time."
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg">No channel connected</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            Connect a Facebook Page to start receiving and replying to Messenger conversations.
          </p>
          <Button asChild className="mt-4 gradient-primary border-0 text-white">
            <Link href="/dashboard/connect">
              <Link2 className="mr-2 h-4 w-4" />
              Connect Page
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const pageIds = pages.map((p) => p.id);
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`*, subscriber:subscribers(id, psid, first_name, last_name, profile_pic), page:pages(id, page_name)`)
    .in("page_id", pageIds)
    .order("last_message_at", { ascending: false })
    .limit(50);

  return (
    <DashboardShell
      title="Live Chat"
      description="View and respond to Messenger conversations in real-time."
    >
      <InboxClient conversations={conversations || []} pages={pages} />
    </DashboardShell>
  );
}
