/** Shared shapes and constants for the coffee chat API, safe to import from client code. */

/** How many days ahead the picker offers. */
export const HORIZON_DAYS = 14;

export type Slot = { start: string; end: string };

export type SlotsResponse = {
  /** Eric's time zone; the client formats slots in the visitor's. */
  timeZone: string;
  /** True when slots reflect live free/busy from Google Calendar, not just the class schedule. */
  live: boolean;
  slots: Slot[];
};

export type BookRequest = { start: string; name: string; email: string; note?: string };

export type BookResponse =
  | { ok: true; htmlLink?: string; meetLink?: string }
  | { ok: false; error: "not_configured" | "taken" | "invalid" | "failed"; message: string };
