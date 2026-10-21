# ericnguyen

Next.js 16, Tailwind 4, Motion, one shadcn tooltip. Single page: `components/portfolio.tsx`.

```bash
npm run dev
```

Projects and links live in `lib/projects.ts`. Gifs go in `public/media/<slug>.gif`; Slap plays its device switch-on animation from `lib/slap-splash.ts` (source: `3nvyx/slap` → `screen-lab/sprites.js`).

## Coffee chat booking

The sidebar and footer "coffee chat" button opens a dropdown of open 30-minute slots over the
next two weeks (`components/coffee-chat.tsx`, `app/api/coffee-chat/*`). Slots come from the
weekly class schedule in `lib/availability.ts` plus, when Google credentials are set, live
free/busy from both of Eric's calendars. Booking creates the event on the Gmail calendar and
invites the student address, so it lands on both and Google emails the invite. Setup is in
`.env.example`; `node scripts/google-oauth-token.mjs` mints the refresh token.
