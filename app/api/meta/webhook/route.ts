import { NextRequest, NextResponse } from "next/server";

/**
 * Meta Webhook Verification (GET)
 *
 * When you configure a webhook in the Meta App Dashboard, Facebook sends
 * a GET request with a verify token. This handler will eventually verify
 * the token and respond with the challenge.
 *
 * TODO: Implement verification logic using getMetaConfig().verifyToken
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Placeholder: will be implemented when Meta integration is built
  console.log("Webhook verification attempt:", { mode, token: !!token, challenge: !!challenge });

  return NextResponse.json(
    { status: "not_implemented", message: "Webhook verification not yet configured." },
    { status: 501 }
  );
}

/**
 * Meta Webhook Event Handler (POST)
 *
 * Facebook sends POST requests with event data (messages, postbacks, etc.)
 * to this endpoint. This handler will eventually process those events.
 *
 * TODO: Implement event parsing and handling for:
 * - messages (text, attachments)
 * - messaging_postbacks
 * - messaging_optins
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Placeholder: log the event for debugging during development
    console.log("Webhook event received:", JSON.stringify(body, null, 2));

    // Always return 200 to acknowledge receipt (required by Meta)
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Failed to process webhook event." },
      { status: 400 }
    );
  }
}
