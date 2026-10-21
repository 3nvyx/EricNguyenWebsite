/** Shared shapes and limits for the Breakout leaderboard API, safe to import from client code. */

export const NAME_MAX = 20;
export const BOARD_SIZE = 10;

export type Entry = { id: number; name: string; score: number; at: string };

export type BoardResponse = { ok: true; top: Entry[] } | { ok: false; message: string };

export type SubmitRequest = { name: string; score: number; durationMs: number };

export type SubmitResponse =
  | { ok: true; id: number; rank: number; top: Entry[] }
  | { ok: false; message: string };

/** Trims, collapses spaces and drops control characters; "" means the name isn't usable. */
export function cleanName(raw: string) {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX);
}

/**
 * The most a run of this length could plausibly score. Generous on purpose: it only stops
 * obviously forged submissions, it isn't anti-cheat.
 */
export function maxScoreFor(durationMs: number) {
  return 200 + Math.ceil(durationMs / 1000) * 600;
}
