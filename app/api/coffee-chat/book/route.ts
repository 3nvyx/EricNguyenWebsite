import type { BookRequest, BookResponse } from "@/lib/coffee-chat";
import { bookEvent, isConfigured } from "@/lib/google-calendar";
import { openSlots } from "../availability";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(body: BookResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let data: Partial<BookRequest>;
  try {
    data = (await req.json()) as Partial<BookRequest>;
  } catch {
    return reply({ ok: false, error: "invalid", message: "Bad request." }, 400);
  }

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const note = (data.note ?? "").trim().slice(0, 500) || undefined;
  const start = Date.parse(data.start ?? "");
  if (!name || name.length > 80 || !EMAIL.test(email) || email.length > 254 || Number.isNaN(start)) {
    return reply({ ok: false, error: "invalid", message: "Please add your name and a valid email." }, 400);
  }

  // Only ever book a slot the site would offer right now.
  const { slots } = await openSlots();
  const slot = slots.find((s) => s.start === start);
  if (!slot) {
    return reply({ ok: false, error: "taken", message: "That time just went. Pick another." }, 409);
  }

  if (!isConfigured()) {
    return reply({ ok: false, error: "not_configured", message: "Booking isn't live yet." }, 503);
  }

  try {
    const { htmlLink, meetLink } = await bookEvent({ ...slot, name, email, note });
    return reply({ ok: true, htmlLink, meetLink });
  } catch (err) {
    console.error("coffee chat booking failed:", err);
    return reply({ ok: false, error: "failed", message: "Couldn't book that. Try again or email me." }, 502);
  }
}
