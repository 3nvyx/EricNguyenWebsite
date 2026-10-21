/**
 * Server-only Google Calendar access for coffee chat booking. Acts as Eric via an OAuth refresh
 * token (see scripts/google-oauth-token.mjs and .env.example). Never import from client code.
 */

import type { Interval } from "@/lib/availability";
import { TIME_ZONE } from "@/lib/availability";

/** Eric's calendars: free/busy is read from both, and both get the booking. */
const PERSONAL = "envn001@gmail.com";
const STUDENT = "lnguyen1509@student.cccd.edu";
const FREE_BUSY_CALENDARS = [PERSONAL, STUDENT];
/** The event is created on the personal (token owner's) calendar; the student address is invited. */
const INVITE = [STUDENT];

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

function env() {
  const { GOOGLE_OAUTH_CLIENT_ID: id, GOOGLE_OAUTH_CLIENT_SECRET: secret, GOOGLE_OAUTH_REFRESH_TOKEN: refresh } =
    process.env;
  return id && secret && refresh ? { id, secret, refresh } : null;
}

/** True when the site has Google credentials; otherwise booking falls back to email. */
export function isConfigured(): boolean {
  return env() !== null;
}

let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  const creds = env();
  if (!creds) throw new Error("Google Calendar is not configured");
  if (cached && cached.expires > Date.now() + 60e3) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.id,
      client_secret: creds.secret,
      refresh_token: creds.refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Calendar API ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

type FreeBusyResponse = {
  calendars: Record<string, { busy?: Array<{ start: string; end: string }>; errors?: unknown[] }>;
};

/** Busy intervals across both of Eric's calendars. */
export async function busyIntervals(timeMin: number, timeMax: number): Promise<Interval[]> {
  const data = await call<FreeBusyResponse>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: new Date(timeMin).toISOString(),
      timeMax: new Date(timeMax).toISOString(),
      timeZone: TIME_ZONE,
      items: FREE_BUSY_CALENDARS.map((id) => ({ id })),
    }),
  });
  const busy: Interval[] = [];
  for (const id of FREE_BUSY_CALENDARS) {
    const cal = data.calendars[id];
    if (!cal) continue;
    if (cal.errors?.length) console.error(`freeBusy ${id}:`, cal.errors);
    for (const b of cal.busy ?? []) busy.push({ start: Date.parse(b.start), end: Date.parse(b.end) });
  }
  return busy;
}

export type Booking = { start: number; end: number; name: string; email: string; note?: string };

type EventResponse = { htmlLink?: string; hangoutLink?: string };

/**
 * Create the event on Eric's calendar with the visitor and the student address as guests, a
 * Google Meet link, and reminders. Google emails the invite to every guest, which is both the
 * alert and what puts it on the student calendar.
 */
export async function bookEvent(b: Booking): Promise<{ htmlLink?: string; meetLink?: string }> {
  const description = [
    `Coffee chat booked from ericnguyen.dev by ${b.name} (${b.email}).`,
    b.note ? `\n${b.note}` : "",
    "\n30 minutes, video or in person around Irvine.",
  ].join("\n");
  const event = await call<EventResponse>(
    "/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1",
    {
      method: "POST",
      body: JSON.stringify({
        summary: `Coffee chat: ${b.name}`,
        description,
        start: { dateTime: new Date(b.start).toISOString(), timeZone: TIME_ZONE },
        end: { dateTime: new Date(b.end).toISOString(), timeZone: TIME_ZONE },
        attendees: [
          { email: b.email, displayName: b.name },
          ...INVITE.map((email) => ({ email })),
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 15 },
          ],
        },
        conferenceData: {
          createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
        },
        guestsCanInviteOthers: false,
      }),
    },
  );
  return { htmlLink: event.htmlLink, meetLink: event.hangoutLink };
}
