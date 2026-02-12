# ChatGate

Messenger automation for small businesses. Connect your Facebook Page, set up auto-replies, and qualify leads — all from one simple dashboard.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth & Database:** Supabase (email/password auth, PostgreSQL)
- **Deployment:** Vercel
- **Integration:** Meta Graph API / Messenger Platform (scaffolded, not yet implemented)

## Project Structure

```
chatgate/
├── app/
│   ├── (marketing)/         # Public pages (landing)
│   ├── (auth)/              # Login, signup, logout
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── connect/     # Facebook Page connection UI
│   │       └── settings/    # User settings
│   └── api/
│       └── meta/webhook/    # Meta webhook endpoint (stub)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # Header, footer, sidebar, shell
│   ├── auth/                # Auth card component
│   └── shared/              # Loader, alerts
├── lib/
│   ├── supabase/            # Client & server Supabase utilities
│   ├── auth/                # Session helpers
│   └── meta/                # Meta config utilities
├── supabase/
│   └── schema.sql           # Database schema (pages, settings)
├── middleware.ts             # Route protection
└── .env.local.example       # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Meta Developer](https://developers.facebook.com) account (for later)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chatgate
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Authentication > Providers**, make sure **Email** is enabled.
3. (Optional) Enable **Facebook** OAuth provider if you want Facebook login:
   - Go to Authentication > Providers > Facebook
   - Add your Facebook App ID and Secret
   - Set the redirect URL shown by Supabase in your Facebook App settings
4. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create the `pages` and `settings` tables with RLS policies.

### 3. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Description | Where to Find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | Supabase Dashboard > Settings > API |
| `META_APP_ID` | Facebook App ID | Meta Developer Dashboard |
| `META_APP_SECRET` | Facebook App Secret | Meta Developer Dashboard |
| `META_VERIFY_TOKEN` | Custom token for webhook verification | You choose this (any string) |

> **Important:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` and `META_APP_SECRET` server-side only.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

- Visit `/signup` to create an account
- Visit `/login` to sign in
- After login, you'll be redirected to `/dashboard`

### 5. Build for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import your repository.
3. In the Vercel project settings, add all environment variables from `.env.local`.
4. Deploy — Vercel will automatically detect Next.js and configure the build.

### Environment Variables on Vercel

Add each variable from your `.env.local` file in Vercel's project settings under **Settings > Environment Variables**. Make sure to set them for the appropriate environments (Production, Preview, Development).

## Architecture Notes

### Authentication Flow

- Supabase handles user registration and login (email/password).
- `middleware.ts` intercepts requests to `/dashboard/*` and redirects unauthenticated users to `/login`.
- Server components use `lib/auth/session.ts` to get the current user.
- Client components use `lib/supabase/client.ts` for browser-side auth.

### Route Protection

The middleware creates a Supabase server client that refreshes the session cookie. Protected routes under `/dashboard` require authentication. Auth pages (`/login`, `/signup`) redirect authenticated users to `/dashboard`.

### Meta Integration (Planned)

- `lib/meta/config.ts` centralizes Meta environment configuration.
- `app/api/meta/webhook/route.ts` is a stub for the Meta webhook endpoint.
- The `/dashboard/connect` page has the UI shell ready for Facebook Page OAuth.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

Private project. All rights reserved.
