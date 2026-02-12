"use server";

import { createClient } from "@/lib/supabase/server";
import { sendTextMessage } from "@/lib/meta/messenger";

/**
 * Send a reply message from the dashboard (human agent).
 */
export async function sendReply(
  conversationId: string,
  pageInternalId: string,
  subscriberId: string,
  text: string
) {
  const supabase = createClient();

  // Verify the user owns this page
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: page } = await supabase
    .from("pages")
    .select("id, page_id, access_token")
    .eq("id", pageInternalId)
    .eq("user_id", user.id)
    .single();

  if (!page) return { error: "Page not found or unauthorized" };

  // Get subscriber PSID
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("psid")
    .eq("id", subscriberId)
    .single();

  if (!subscriber) return { error: "Subscriber not found" };

  // Send via Messenger
  const result = await sendTextMessage({
    recipientId: subscriber.psid,
    pageAccessToken: page.access_token,
    text,
  });

  if (!result.success) {
    return { error: result.error || "Failed to send message" };
  }

  // Store outbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    page_id: pageInternalId,
    subscriber_id: subscriberId,
    direction: "outbound",
    message_type: "text",
    content: text,
    fb_message_id: result.messageId,
    sent_by: "human",
  });

  // Update conversation
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: text.substring(0, 100),
      unread_count: 0,
    })
    .eq("id", conversationId);

  return { success: true };
}
