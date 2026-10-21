/**
 * Coffee chat availability. Pure functions over epoch milliseconds so the API routes can
 * combine the fixed class schedule with live free/busy from Google Calendar.
 *
 * Everything is reckoned in Eric's time zone (Pacific); callers format for the visitor.
 */

import { HORIZON_DAYS } from "@/lib/coffee-chat";

export type Interval = { start: number; end: number };

export { HORIZON_DAYS };

export const TIME_ZONE = "America/Los_Angeles";
/** Length of a coffee chat, in minutes. */
export const SLOT_MINUTES = 30;
/** Don't offer a slot that butts right up against a class or another event. */
const BUFFER_MINUTES = 15;
/** Earliest bookable slot is this far out, so Eric sees the invite first. */
const LEAD_HOURS = 24;

/** Bookable hours by weekday (0 = Sunday), Pacific wall clock, [open, close). */
const HOURS: Record<number, [number, number]> = {
  0: [10, 17],
  1: [9, 19],
  2: [9, 19],
  3: [9, 19],
  4: [9, 19],
  5: [9, 19],
  6: [10, 17],
};

/**
 * Weekly class schedule from the student calendar (lnguyen1509@student.cccd.edu), Fall 2026,
 * Pacific. The source of truth is the calendar; this is the fallback when the site has no
 * Google credentials and keeps class time blocked even if live free/busy fails.
 * [weekday, start, end]
 */
export const CLASS_SCHEDULE: Array<[number, string, string]> = [
  [1, "09:35", "12:05"],
  [1, "12:20", "19:00"],
  [2, "12:45", "14:50"],
  [2, "15:00", "18:00"],
  [3, "09:35", "12:05"],
  [3, "12:20", "14:00"],
  [3, "14:20", "16:50"],
  [4, "12:45", "14:50"],
  [4, "15:25", "18:35"],
  [5, "13:00", "17:00"],
];

/**
 * Whole days with no coffee chats, Pacific, inclusive (YYYY-MM-DD). For things the calendar
 * marks "free" (like a hackathon) or that aren't on it at all.
 */
export const BLOCKED_DAYS: Array<{ from: string; to: string; label: string }> = [
  { from: "2026-10-23", to: "2026-10-25", label: "CalHacks" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export type ZonedDate = { y: number; m: number; d: number; weekday: number };

/** Pacific wall-clock parts for an instant. */
function wallClock(t: number) {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormat.formatToParts(new Date(t))) p[type] = value;
  return {
    y: +p.year,
    m: +p.month,
    d: +p.day,
    h: +p.hour,
    min: +p.minute,
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
}

/** Epoch ms of a Pacific wall-clock time. */
export function zoned(y: number, m: number, d: number, h: number, min: number): number {
  // Read the wall time as if it were UTC, see what Pacific wall time that instant shows, and
  // shift by the difference. Daytime hours are never inside a DST transition, so one pass is exact.
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = wallClock(guess);
  const shown = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  return guess - (shown - guess);
}

/** The next `n` Pacific calendar days starting today. */
export function daysAhead(now: number, n: number): ZonedDate[] {
  const today = wallClock(now);
  // Step from noon so a DST change can't move us across midnight.
  let t = zoned(today.y, today.m, today.d, 12, 0);
  const days: ZonedDate[] = [];
  for (let i = 0; i < n; i++, t += 24 * 3600e3) {
    const { y, m, d, weekday } = wallClock(t);
    days.push({ y, m, d, weekday });
  }
  return days;
}

function hhmm(s: string): [number, number] {
  const [h, m] = s.split(":").map(Number);
  return [h, m];
}

/** Class blocks for the given days. */
export function classBusy(days: ZonedDate[]): Interval[] {
  const busy: Interval[] = [];
  for (const day of days) {
    for (const [weekday, start, end] of CLASS_SCHEDULE) {
      if (weekday !== day.weekday) continue;
      const [sh, sm] = hhmm(start);
      const [eh, em] = hhmm(end);
      busy.push({ start: zoned(day.y, day.m, day.d, sh, sm), end: zoned(day.y, day.m, day.d, eh, em) });
    }
  }
  return busy;
}

function ymd(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m, d];
}

/** Busy intervals covering every blocked day, midnight to midnight Pacific. */
export function blockedBusy(): Interval[] {
  return BLOCKED_DAYS.map(({ from, to }) => {
    const [fy, fm, fd] = ymd(from);
    const [ty, tm, td] = ymd(to);
    // End at noon on the last day plus a bit over half a day, so it reaches the next midnight.
    return { start: zoned(fy, fm, fd, 0, 0), end: zoned(ty, tm, td, 12, 0) + 13 * 3600e3 };
  });
}

/** Open slots over the given days, skipping anything that overlaps (plus buffer) a busy interval. */
export function freeSlots(now: number, days: ZonedDate[], busy: Interval[]): Interval[] {
  const earliest = now + LEAD_HOURS * 3600e3;
  const slot = SLOT_MINUTES * 60e3;
  const buffer = BUFFER_MINUTES * 60e3;
  const slots: Interval[] = [];
  for (const day of days) {
    const [open, close] = HOURS[day.weekday];
    const first = zoned(day.y, day.m, day.d, open, 0);
    const last = zoned(day.y, day.m, day.d, close, 0);
    for (let t = first; t + slot <= last; t += slot) {
      if (t < earliest) continue;
      const s = t - buffer;
      const e = t + slot + buffer;
      if (busy.some((b) => b.start < e && b.end > s)) continue;
      slots.push({ start: t, end: t + slot });
    }
  }
  return slots;
}
