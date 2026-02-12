/**
 * Meta / Facebook Graph API configuration.
 * Server-only — do NOT import this in client components.
 */

interface MetaConfig {
  appId: string;
  appSecret: string;
  verifyToken: string;
}

export function getMetaConfig(): MetaConfig {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (!appId || !appSecret || !verifyToken) {
    throw new Error(
      "Missing Meta configuration. Ensure META_APP_ID, META_APP_SECRET, and META_VERIFY_TOKEN are set in environment variables."
    );
  }

  return { appId, appSecret, verifyToken };
}
