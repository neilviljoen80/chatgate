import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

/**
 * Facebook OAuth callback handler.
 * 1. Exchanges the authorization code for a user access token
 * 2. Exchanges for a long-lived token (60 days)
 * 3. Fetches the user's Facebook Pages
 * 4. Stores each Page with its Page Access Token in the database
 * 5. Subscribes each Page to the webhook
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // Handle user denied permission
    if (errorParam) {
      console.error("Facebook OAuth error:", errorParam);
      return NextResponse.redirect(
        `${appUrl}/dashboard/connect?error=denied`
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connect?error=missing_params`
      );
    }

    // Decode state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(stateParam, "base64").toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connect?error=invalid_state`
      );
    }

    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;
    const redirectUri = `${appUrl}/api/auth/facebook/callback`;

    // Step 1: Exchange code for short-lived user access token
    const tokenUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.redirect(
        `${appUrl}/dashboard/connect?error=token_exchange`
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for long-lived user token (60 days)
    const longLivedUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    const userAccessToken = longLivedData.access_token || shortLivedToken;

    // Step 3: Fetch user's Facebook Pages
    const pagesRes = await fetch(
      `${GRAPH_API_BASE}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connect?error=no_pages`
      );
    }

    // Step 4: Store pages in database using admin client (bypasses RLS)
    const supabase = createAdminClient();
    const connectedPages: string[] = [];

    for (const page of pagesData.data) {
      // Upsert: insert or update if page already exists for this user
      const { error } = await supabase.from("pages").upsert(
        {
          user_id: userId,
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          is_active: true,
        },
        {
          onConflict: "user_id,page_id",
        }
      );

      if (error) {
        console.error(`Error storing page ${page.id}:`, error.message);
        continue;
      }

      connectedPages.push(page.name);

      // Step 5: Subscribe page to webhook
      try {
        const subscribeRes = await fetch(
          `${GRAPH_API_BASE}/${page.id}/subscribed_apps`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: page.access_token,
              subscribed_fields: [
                "messages",
                "messaging_postbacks",
                "messaging_optins",
                "messaging_referrals",
              ].join(","),
            }),
          }
        );
        const subscribeData = await subscribeRes.json();
        if (!subscribeData.success) {
          console.error(`Webhook subscription failed for ${page.id}:`, subscribeData);
        }
      } catch (err) {
        console.error(`Webhook subscription error for ${page.id}:`, err);
      }
    }

    const pagesConnected = connectedPages.length;
    return NextResponse.redirect(
      `${appUrl}/dashboard/connect?success=true&pages=${pagesConnected}`
    );
  } catch (err) {
    console.error("Facebook OAuth callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/connect?error=unknown`
    );
  }
}
