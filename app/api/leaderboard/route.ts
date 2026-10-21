import { neon } from "@neondatabase/serverless";
import {
  BOARD_SIZE,
  cleanName,
  maxScoreFor,
  type BoardResponse,
  type Entry,
  type SubmitRequest,
  type SubmitResponse,
} from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

// Per-instance throttle so one visitor can't flood the board. Resets when the function cold-starts.
const lastPost = new Map<string, number>();
const THROTTLE_MS = 5000;

function reply(body: BoardResponse | SubmitResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function top(): Promise<Entry[]> {
  const rows = await sql!`
    SELECT id, name, score, created_at FROM breakout_scores
    ORDER BY score DESC, created_at ASC LIMIT ${BOARD_SIZE}`;
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    score: Number(r.score),
    at: new Date(r.created_at as string).toISOString(),
  }));
}

export async function GET() {
  if (!sql) return reply({ ok: false, message: "Leaderboard isn't live yet." }, 503);
  try {
    return reply({ ok: true, top: await top() });
  } catch (err) {
    console.error("leaderboard read failed:", err);
    return reply({ ok: false, message: "Couldn't load the leaderboard." }, 502);
  }
}

export async function POST(req: Request) {
  if (!sql) return reply({ ok: false, message: "Leaderboard isn't live yet." }, 503);

  let data: Partial<SubmitRequest>;
  try {
    data = (await req.json()) as Partial<SubmitRequest>;
  } catch {
    return reply({ ok: false, message: "Bad request." }, 400);
  }

  const name = cleanName(String(data.name ?? ""));
  const score = Number(data.score);
  const durationMs = Number(data.durationMs);
  if (!name) return reply({ ok: false, message: "Add a name first." }, 400);
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(durationMs) ||
    score <= 0 ||
    score % 5 !== 0 ||
    durationMs < 1000 ||
    durationMs > 6 * 60 * 60 * 1000 ||
    score > maxScoreFor(durationMs)
  ) {
    return reply({ ok: false, message: "That score doesn't look right." }, 400);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  if (now - (lastPost.get(ip) ?? 0) < THROTTLE_MS) {
    return reply({ ok: false, message: "Easy. Try again in a few seconds." }, 429);
  }
  lastPost.set(ip, now);

  try {
    const [row] = await sql`
      INSERT INTO breakout_scores (name, score, duration_ms)
      VALUES (${name}, ${score}, ${durationMs}) RETURNING id, created_at`;
    const [{ ahead }] = await sql`
      SELECT count(*)::int AS ahead FROM breakout_scores
      WHERE score > ${score} OR (score = ${score} AND created_at < ${row.created_at})`;
    return reply({ ok: true, id: Number(row.id), rank: Number(ahead) + 1, top: await top() });
  } catch (err) {
    console.error("leaderboard write failed:", err);
    return reply({ ok: false, message: "Couldn't save that. Try again." }, 502);
  }
}
