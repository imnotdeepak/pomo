# Pomo

A Pomodoro study app with a focus timer, task board, ambient sounds and study history. Built with Next.js, Clerk and Supabase.

## Features

- ⏰ **Pomodoro timer**: configurable focus and break lengths (default 25 / 5 minutes). Click the time to edit it inline.
- 📋 **Kanban board**: To Do / In Progress / Done task board.
- 🎧 **Ambient sounds**: study sounds that play while you focus, plus an alarm when a session ends.
- 📊 **Study history**: total and today's focus time, and a past-year activity heatmap shown in your local timezone.
- 🔐 **Auth and billing**: Clerk handles sign-in and subscriptions. The dashboard needs an active `access` plan.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Environment variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # server-only; never expose to the client
```

In the Clerk dashboard, enable Billing and create a plan with the key `access`.

### Database

The app expects these Supabase tables. Every row is keyed by the Clerk user ID in `user_id`, or `clerk_user_id` for `users`.

| Table | Used for |
|---|---|
| `users` | Profile synced from Clerk on dashboard load (`clerk_user_id`, `email`, `name`) |
| `tasks` | Kanban tasks (`title`, `status`: `todo` / `in-progress` / `done`) |
| `study_sessions` | One row per completed focus session (`duration_minutes`, `created_at`) |
| `user_stats` | All-time total (`total_study_time_minutes`), kept up to date from `study_sessions` |

## How it works

- **Routing guard** (`src/proxy.ts`): `/dashboard` and the paid API routes (`/api/tasks`, `/api/sessions`) need a signed-in user with the `access` plan. Users without the plan are sent to `/billing`. Subscribers who open `/billing` are sent to `/dashboard`.
- **Data access**: the browser never talks to Supabase directly. API routes check the user with Clerk, then query Supabase with the service-role key, filtering every query by the user's ID.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (redirects signed-in users)
│   ├── login/, signup/       # Clerk sign-in / sign-up
│   ├── billing/              # Clerk pricing table
│   ├── checkout-success/     # Refreshes the session after purchase
│   ├── dashboard/            # Timer, sounds, kanban, history
│   └── api/
│       ├── sessions/         # GET history, POST completed session
│       ├── tasks/            # Kanban CRUD
│       └── users/            # Upsert the Clerk user into Supabase
├── components/
│   ├── CircularTimer.tsx
│   ├── SoundControlBar.tsx
│   ├── KanbanBoard.tsx
│   ├── HistoryPopup.tsx
│   ├── auth-background.tsx   # Backdrop for login/signup pages
│   ├── call-to-action.tsx    # Landing page section
│   └── ui/                   # Landing page sections and shared primitives
├── lib/
│   ├── supabase-admin.ts     # Server-only Supabase client (service role)
│   ├── study-time-api.ts     # Client helpers for /api/sessions
│   ├── clerk-appearance.ts   # Dark theme for Clerk components
│   └── utils.ts              # cn() class helper
└── proxy.ts                  # Clerk middleware / route protection
```

## Tech stack

- **Next.js 16** (App Router, Turbopack) and **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Clerk**: authentication and billing
- **Supabase**: Postgres database
- **@paper-design/shaders-react**: animated dithering backgrounds
