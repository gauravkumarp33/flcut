# FLCut

FLCut is a link shortner for the Finite Loop Club. It can shorten the event link of any platform like Instagram , linkedin , Youtube etc.
This reduces the lenght of the link and also can track link usage. This helps is having a simple and clean url for sharing through various platforms and is managed by the core team.

## Tech Stack

- Next.js App Router with TypeScript
- React server components and server actions
- Tailwind CSS
- Prisma 7
- PostgreSQL
- Zod for form validation

## Core Features

- It can create short links from the user entered lenghty links.
- The maintainer can customize slug, title, event name, channel, and expiry date
- If no slug is given , then automatic slug will be created
- Maintainer can specify the link expiery time 
- If the link expiers
- Public redirect route at `/[slug]`
- Link status handling for active, inactive, expired, missing, and invalid links
- Click event tracking for each valid redirect
- Unique click counting with a first-party visitor cookie
- Protected dashboard with link list, search, sorting, and simple per-link analytics

## Assumptions

- FLCut is for internal club use, not a public SaaS product.
- One shared admin password is enough for the current stage.
- Link creators are trusted club operators.
- PostgreSQL is available in local or hosted form.
- Public short links should stay accessible without authentication.
- Dashboard, link creation, and analytics must require admin login.

## Unique Click Definition

A unique click is counted as one visitor per link within a 24-hour window.

The redirect route stores a first-party HTTP-only cookie named `flcut_vid`. On each valid redirect, FLCut checks whether that visitor has clicked the same link in the last 24 hours:

- If not, the click event is stored with `isUnique = true` and `uniqueClickCount` is incremented.
- If yes, the click event is still stored, but only `clickCount` is incremented.

This is a practical privacy-conscious approximation, not a perfect identity system.

## Expired And Invalid Link Behavior

Expired or inactive links do not redirect. Instead, FLCut shows a branded expired-link page with navigation back to the home page or dashboard login.

Missing slugs show a branded not-found page.

Invalid destinations are blocked safely. FLCut only redirects to `http` and `https` URLs. It does not proxy, preview, or fetch destination pages.

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
ADMIN_PASSWORD="change-this-password"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open:

- Public app: `http://localhost:3000`
- Admin login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and the Prisma Postgres adapter. |
| `ADMIN_PASSWORD` | Yes | Shared admin password used to create the protected dashboard session. Never expose this to the client. |

## Database And Prisma

The Prisma schema is in `prisma/schema.prisma`.

Main models:

- `Link`: stores slug, destination URL, metadata, status, expiry, and click counters.
- `ClickEvent`: stores individual visits, referrer, user agent, hashed IP, visitor cookie id, and uniqueness flag.

The generated Prisma client outputs to `app/generated/prisma`, which is ignored by git. The `prebuild` script runs `prisma generate` before production builds.

Useful commands:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev
npx prisma migrate status
```

## Running Checks

```bash
npm run lint
npm run build
```

`npm run build` also runs `prisma generate` through the `prebuild` script.

## Deployment Notes

- Set `DATABASE_URL` and `ADMIN_PASSWORD` in the deployment environment.
- Run Prisma migrations against the production database before serving traffic.
- Cookies are HTTP-only and use `Secure=true` automatically in production.
- Public redirects depend on server-side database access, so deploy to a runtime that can connect to PostgreSQL.
- The public redirect route should remain unauthenticated.

## Design Decisions And Tradeoffs

- Shared-password auth keeps the admin flow simple for a small club team.
- No full user account system exists yet.
- No advanced analytics charts are included; the analytics page uses simple summaries and activity lists.
- The redirect route records analytics before redirecting. This is simple and reliable, though it adds a small database write before each redirect.
- Slug generation is intentionally basic and short. Duplicate checks keep it safe enough for this stage.
- IP addresses are hashed before storage.
- Generated Prisma client files are not committed.

## Developer Notes

- Preserve the `FLCUT-AI-2627-visible` comment in `app/layout.tsx`.
- Preserve the `loopTraceMarkerVisible` marker in the codebase.
- Protect all `/dashboard` routes.
- Keep `/`, `/login`, and `/[slug]` public.
- Avoid adding product features during cleanup work; prefer small, reviewable changes.
- If this project upgrades further on Next.js 16+, consider renaming `middleware.ts` to `proxy.ts` after confirming the deployment target supports the newer convention.
