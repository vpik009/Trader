# GamerRate

Rate the video games you've played: 1 to 4 stars, plus an optional review.

| Stars | Meaning |
|---|---|
| ★ | Awful |
| ★★ | Meh |
| ★★★ | Good |
| ★★★★ | Amazing |

- **Library**: every game you've rated, filterable by star count.
- **Game page**: the average across GamerRate users with a breakdown, user reviews, and outside scores: critics (IGDB's aggregate of IGN, GameSpot, etc.), Metacritic, Steam user reviews and IGDB users.
- **Login**: Google SSO only. There are no passwords. The database stores just the provider account ID, display name and avatar. No email.

## Stack

Next.js 15 (App Router, server actions) · Auth.js v5 · Prisma + SQLite · Tailwind · IGDB for game data · Steam store API for Steam/Metacritic scores.

## Try it without any API keys

```bash
npm install
npm run demo
```

Open http://localhost:3000 and click **Sign in (demo)**. This starts the app with 13 real games (with Steam cover art), six players and their ratings and reviews, and a one-click login as "Demo Player". It uses a separate `prisma/demo.db` and resets that file on every start. Search only looks through the demo games unless Twitch keys are set. Never run demo mode in production: anyone can sign in.

## Setup

```bash
npm install
cp .env.example .env    # then fill in the values below
npx auth secret         # writes AUTH_SECRET
npx prisma migrate dev  # creates prisma/dev.db
npm run dev
```

**Google OAuth**: in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create an OAuth client ID (type "Web application") with the redirect URI `http://localhost:3000/api/auth/callback/google`. Put it in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

**IGDB**: register an app at [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) (any redirect URL works, e.g. `http://localhost`). Put the client ID/secret in `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`.

## Notes

- Game data is cached in the `Game` table and refreshed from IGDB after 7 days.
- To move to Postgres, change `provider` in `prisma/schema.prisma` and set `DATABASE_URL`.
