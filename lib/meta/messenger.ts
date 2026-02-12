/**
 * Facebook Messenger Send API utility.
 * Server-only — do NOT import this in client components.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

// ---- Types ----

export interface QuickReply {
  content_type: "text" | "user_phone_number" | "user_email";
  title?: string;
  payload?: string;
  image_url?: string;
}

export interface Button {
  type: "web_url" | "postback" | "phone_number";
  title: string;
  url?: string;
  payload?: string;
}

export interface GenericElement {
  title: string;
  subtitle?: string;
  image_url?: string;
  default_action?: {
    type: "web_url";
    url: string;
  };
  buttons?: Button[];
}

export interface SendMessageOptions {
  recipientId: string;
  pageAccessToken: string;
  messagingType?: "RESPONSE" | "UPDATE" | "MESSAGE_TAG";
  tag?: string;
}

// ---- Send Functions ----

/**
 * Send a plain text message.
 */
export async function sendTextMessage(
  options: SendMessageOptions & { text: string }
) {
  return sendRawMessage(options.pageAccessToken, {
    recipient: { id: options.recipientId },
    messaging_type: options.messagingType || "RESPONSE",
    message: { text: options.text },
    ...(options.tag ? { tag: options.tag } : {}),
  });
}

/**
 * Send a text message with quick replies.
 */
export async function sendQuickReplies(
  options: SendMessageOptions & { text: string; quickReplies: QuickReply[] }
) {
  return sendRawMessage(options.pageAccessToken, {
    recipient: { id: options.recipientId },
    messaging_type: options.messagingType || "RESPONSE",
    message: {
      text: options.text,
      quick_replies: options.quickReplies,
    },
  });
}

/**
 * Send a button template.
 */
export async function sendButtonTemplate(
  options: SendMessageOptions & { text: string; buttons: Button[] }
) {
  return sendRawMessage(options.pageAccessToken, {
    recipient: { id: options.recipientId },
    messaging_type: options.messagingType || "RESPONSE",
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: options.text,
          buttons: options.buttons,
        },
      },
    },
  });
}

/**
 * Send a generic (carousel) template.
 */
export async function sendGenericTemplate(
  options: SendMessageOptions & { elements: GenericElement[] }
) {
  return sendRawMessage(options.pageAccessToken, {
    recipient: { id: options.recipientId },
    messaging_type: options.messagingType || "RESPONSE",
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: options.elements,
        },
      },
    },
  });
}

/**
 * Send a sender action (typing indicator, mark seen).
 */
export async function sendSenderAction(
  pageAccessToken: string,
  recipientId: string,
  action: "typing_on" | "typing_off" | "mark_seen"
) {
  return sendRawMessage(pageAccessToken, {
    recipient: { id: recipientId },
    sender_action: action,
  });
}

// ---- Messenger Profile ----

/**
 * Set the Get Started button payload.
 */
export async function setGetStartedButton(
  pageAccessToken: string,
  payload: string = "GET_STARTED"
) {
  return setMessengerProfile(pageAccessToken, {
    get_started: { payload },
  });
}

/**
 * Set the greeting text shown to new users.
 */
export async function setGreetingText(
  pageAccessToken: string,
  text: string
) {
  return setMessengerProfile(pageAccessToken, {
    greeting: [
      { locale: "default", text },
    ],
  });
}

/**
 * Set the persistent menu.
 */
export async function setPersistentMenu(
  pageAccessToken: string,
  buttons: Button[]
) {
  return setMessengerProfile(pageAccessToken, {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: buttons,
      },
    ],
  });
}

// ---- User Profile ----

/**
 * Get subscriber profile info from Facebook.
 */
export async function getUserProfile(
  pageAccessToken: string,
  psid: string
): Promise<{
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  locale?: string;
  gender?: string;
} | null> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${psid}?fields=first_name,last_name,profile_pic,locale,gender&access_token=${pageAccessToken}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---- Internal helpers ----

async function sendRawMessage(
  pageAccessToken: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/me/messages?access_token=${pageAccessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("Messenger Send API error:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, messageId: data.message_id };
  } catch (err) {
    console.error("Messenger Send API exception:", err);
    return { success: false, error: "Network error" };
  }
}

async function setMessengerProfile(
  pageAccessToken: string,
  profile: Record<string, unknown>
) {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/me/messenger_profile?access_token=${pageAccessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      }
    );
    return await res.json();
  } catch (err) {
    console.error("Messenger Profile API error:", err);
    return { result: "error" };
  }
}
