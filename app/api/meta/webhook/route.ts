import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserProfile, sendTextMessage } from "@/lib/meta/messenger";

/**
 * Meta Webhook Verification (GET)
 * Facebook sends a GET request with a verify token when you configure a webhook.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully");
    // Must return the challenge as plain text
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("Webhook verification failed:", { mode, tokenMatch: token === verifyToken });
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * Meta Webhook Event Handler (POST)
 * Facebook sends POST requests with messaging events (messages, postbacks, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify this is a page subscription event
    if (body.object !== "page") {
      return NextResponse.json({ error: "Not a page event" }, { status: 404 });
    }

    // Process each entry (one per page)
    for (const entry of body.entry || []) {
      const pageId = entry.id;

      // Process each messaging event
      for (const event of entry.messaging || []) {
        await processMessagingEvent(pageId, event);
      }
    }

    // Always return 200 to acknowledge receipt (required by Meta)
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 to prevent Facebook from retrying
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

// ---- Event Processing ----

interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    quick_reply?: { payload: string };
    attachments?: Array<{
      type: string;
      payload: { url: string };
    }>;
  };
  postback?: {
    title: string;
    payload: string;
  };
  optin?: {
    ref?: string;
  };
  referral?: {
    ref?: string;
    source?: string;
    type?: string;
  };
  delivery?: {
    mids: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
}

async function processMessagingEvent(fbPageId: string, event: MessagingEvent) {
  const senderPsid = event.sender.id;
  const supabase = createAdminClient();

  // Look up the page in our database
  const { data: page } = await supabase
    .from("pages")
    .select("id, access_token, user_id")
    .eq("page_id", fbPageId)
    .eq("is_active", true)
    .single();

  if (!page) {
    console.warn(`No active page found for Facebook Page ID: ${fbPageId}`);
    return;
  }

  // Handle delivery receipts
  if (event.delivery) {
    await handleDelivery(supabase, page.id, event.delivery);
    return;
  }

  // Handle read receipts
  if (event.read) {
    await handleRead(supabase, page.id, event.read);
    return;
  }

  // For messages and postbacks, ensure subscriber and conversation exist
  const subscriber = await getOrCreateSubscriber(supabase, page, senderPsid);
  if (!subscriber) return;

  const conversation = await getOrCreateConversation(supabase, page.id, subscriber.id);
  if (!conversation) return;

  // Handle incoming message
  if (event.message) {
    await handleMessage(supabase, page, subscriber, conversation, event);
  }

  // Handle postback (button tap)
  if (event.postback) {
    await handlePostback(supabase, page, subscriber, conversation, event);
  }
}

// ---- Subscriber Management ----

async function getOrCreateSubscriber(
  supabase: ReturnType<typeof createAdminClient>,
  page: { id: string; access_token: string },
  psid: string
) {
  // Check if subscriber exists
  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .eq("page_id", page.id)
    .eq("psid", psid)
    .single();

  if (existing) {
    // Update last interaction
    await supabase
      .from("subscribers")
      .update({ last_interaction: new Date().toISOString() })
      .eq("id", existing.id);
    return existing;
  }

  // Fetch profile from Facebook
  const profile = await getUserProfile(page.access_token, psid);

  // Create new subscriber
  const { data: newSubscriber, error } = await supabase
    .from("subscribers")
    .insert({
      page_id: page.id,
      psid,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      profile_pic: profile?.profile_pic || null,
      locale: profile?.locale || null,
      gender: profile?.gender || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating subscriber:", error.message);
    return null;
  }

  return newSubscriber;
}

// ---- Conversation Management ----

async function getOrCreateConversation(
  supabase: ReturnType<typeof createAdminClient>,
  pageId: string,
  subscriberId: string
) {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("page_id", pageId)
    .eq("subscriber_id", subscriberId)
    .single();

  if (existing) return existing;

  // Create new conversation
  const { data: newConvo, error } = await supabase
    .from("conversations")
    .insert({
      page_id: pageId,
      subscriber_id: subscriberId,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error.message);
    return null;
  }

  return newConvo;
}

// ---- Message Handling ----

async function handleMessage(
  supabase: ReturnType<typeof createAdminClient>,
  page: { id: string; access_token: string; user_id: string },
  subscriber: { id: string; psid: string },
  conversation: { id: string },
  event: MessagingEvent
) {
  const msg = event.message!;
  const isQuickReply = !!msg.quick_reply;

  // Determine message type and content
  let messageType = "text";
  let content = msg.text || "";
  let payload: Record<string, unknown> | null = null;

  if (isQuickReply) {
    messageType = "quick_reply";
    payload = { quick_reply: msg.quick_reply };
  } else if (msg.attachments && msg.attachments.length > 0) {
    messageType = msg.attachments[0].type; // image, video, audio, file
    payload = { attachments: msg.attachments };
    content = `[${messageType}]`;
  }

  // Store inbound message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    page_id: page.id,
    subscriber_id: subscriber.id,
    direction: "inbound",
    message_type: messageType,
    content,
    payload,
    fb_message_id: msg.mid,
    sent_by: "subscriber",
  });

  // Update conversation preview and increment unread count
  // Using raw SQL via .rpc() would be ideal, but for simplicity we fetch + update
  const { data: currentConvo } = await supabase
    .from("conversations")
    .select("unread_count")
    .eq("id", conversation.id)
    .single();

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.substring(0, 100),
      unread_count: (currentConvo?.unread_count || 0) + 1,
      status: "open",
    })
    .eq("id", conversation.id);

  // Check for matching automation flows
  const triggerValue = isQuickReply
    ? msg.quick_reply!.payload
    : msg.text?.toLowerCase().trim();

  await checkAndRunFlow(supabase, page, subscriber, triggerValue || "", "keyword");
}

async function handlePostback(
  supabase: ReturnType<typeof createAdminClient>,
  page: { id: string; access_token: string; user_id: string },
  subscriber: { id: string; psid: string },
  conversation: { id: string },
  event: MessagingEvent
) {
  const postback = event.postback!;

  // Store postback as a message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    page_id: page.id,
    subscriber_id: subscriber.id,
    direction: "inbound",
    message_type: "postback",
    content: postback.title,
    payload: { postback },
    sent_by: "subscriber",
  });

  // Update conversation
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: postback.title.substring(0, 100),
      status: "open",
    })
    .eq("id", conversation.id);

  // Check if this is the Get Started postback
  const triggerType = postback.payload === "GET_STARTED" ? "get_started" : "keyword";
  await checkAndRunFlow(supabase, page, subscriber, postback.payload, triggerType);
}

// ---- Delivery & Read Receipts ----

async function handleDelivery(
  supabase: ReturnType<typeof createAdminClient>,
  pageId: string,
  delivery: { mids: string[]; watermark: number }
) {
  if (delivery.mids) {
    for (const mid of delivery.mids) {
      await supabase
        .from("messages")
        .update({ delivered_at: new Date().toISOString() })
        .eq("fb_message_id", mid)
        .eq("page_id", pageId);
    }
  }
}

async function handleRead(
  supabase: ReturnType<typeof createAdminClient>,
  pageId: string,
  read: { watermark: number }
) {
  // Mark all outbound messages before the watermark as read
  const watermarkDate = new Date(read.watermark).toISOString();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("page_id", pageId)
    .eq("direction", "outbound")
    .is("read_at", null)
    .lte("created_at", watermarkDate);
}

// ---- Flow Execution ----

async function checkAndRunFlow(
  supabase: ReturnType<typeof createAdminClient>,
  page: { id: string; access_token: string },
  subscriber: { id: string; psid: string },
  triggerValue: string,
  triggerType: string
) {
  // Look for matching active flow
  let query = supabase
    .from("flows")
    .select("*, flow_steps(*)")
    .eq("page_id", page.id)
    .eq("is_active", true);

  if (triggerType === "get_started") {
    query = query.eq("trigger_type", "get_started");
  } else if (triggerType === "keyword") {
    // Check for keyword match or default reply
    query = query.or(`trigger_type.eq.keyword,trigger_type.eq.default_reply`);
  }

  const { data: flows } = await query;

  if (!flows || flows.length === 0) return;

  // Find the best matching flow
  let matchedFlow = null;

  if (triggerType === "get_started") {
    matchedFlow = flows[0]; // First get_started flow
  } else {
    // Try keyword match first
    matchedFlow = flows.find(
      (f) =>
        f.trigger_type === "keyword" &&
        f.trigger_value &&
        triggerValue.includes(f.trigger_value.toLowerCase())
    );
    // Fall back to default reply
    if (!matchedFlow) {
      matchedFlow = flows.find((f) => f.trigger_type === "default_reply");
    }
  }

  if (!matchedFlow) return;

  // Execute flow steps in order
  const steps = (matchedFlow.flow_steps || []).sort(
    (a: { step_order: number }, b: { step_order: number }) => a.step_order - b.step_order
  );

  for (const step of steps) {
    await executeFlowStep(supabase, page, subscriber, step);
  }
}

async function executeFlowStep(
  supabase: ReturnType<typeof createAdminClient>,
  page: { id: string; access_token: string },
  subscriber: { id: string; psid: string },
  step: { step_type: string; config: Record<string, unknown> }
) {
  const config = step.config;

  switch (step.step_type) {
    case "send_message": {
      const text = config.text as string;
      if (!text) break;

      const quickReplies = config.quick_replies as Array<{
        content_type: "text";
        title: string;
        payload: string;
      }> | undefined;

      const buttons = config.buttons as Array<{
        type: "postback" | "web_url";
        title: string;
        payload?: string;
        url?: string;
      }> | undefined;

      if (quickReplies && quickReplies.length > 0) {
        const { sendQuickReplies } = await import("@/lib/meta/messenger");
        await sendQuickReplies({
          recipientId: subscriber.psid,
          pageAccessToken: page.access_token,
          text,
          quickReplies,
        });
      } else if (buttons && buttons.length > 0) {
        const { sendButtonTemplate } = await import("@/lib/meta/messenger");
        await sendButtonTemplate({
          recipientId: subscriber.psid,
          pageAccessToken: page.access_token,
          text,
          buttons,
        });
      } else {
        await sendTextMessage({
          recipientId: subscriber.psid,
          pageAccessToken: page.access_token,
          text,
        });
      }

      // Store outbound message
      const conversation = await getOrCreateConversation(supabase, page.id, subscriber.id);
      if (conversation) {
        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          page_id: page.id,
          subscriber_id: subscriber.id,
          direction: "outbound",
          message_type: "text",
          content: text,
          payload: config,
          sent_by: "bot",
        });
      }
      break;
    }
    case "delay": {
      const seconds = (config.seconds as number) || 1;
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      break;
    }
    case "action": {
      const actionType = config.type as string;
      const actionValue = config.value as string;

      if (actionType === "add_tag" && actionValue) {
        // Fetch current tags and append the new one
        const { data: sub } = await supabase
          .from("subscribers")
          .select("tags")
          .eq("id", subscriber.id)
          .single();

        const currentTags: string[] = sub?.tags || [];
        if (!currentTags.includes(actionValue)) {
          await supabase
            .from("subscribers")
            .update({ tags: [...currentTags, actionValue] })
            .eq("id", subscriber.id);
        }
      }
      break;
    }
    default:
      console.log(`Unhandled flow step type: ${step.step_type}`);
  }
}
