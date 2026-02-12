import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Initiates Facebook OAuth flow to connect a Facebook Page.
 * Redirects the user to Facebook's OAuth dialog with the required permissions.
 */
export async function GET() {
  // Verify user is authenticated
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/facebook/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: "META_APP_ID not configured" },
      { status: 500 }
    );
  }

  // Permissions needed for Messenger Platform
  const scopes = [
    "pages_show_list",        // Show list of pages user manages
    "pages_messaging",        // Send/receive messages as a Page
    "pages_manage_metadata",  // Subscribe page to webhooks
    "pages_read_engagement",  // Read page engagement data
  ].join(",");

  // Include user ID in state to link the OAuth result to the correct user
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");

  const oauthUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", appId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", scopes);
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(oauthUrl.toString());
}
