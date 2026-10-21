import { TIME_ZONE } from "@/lib/availability";
import type { SlotsResponse } from "@/lib/coffee-chat";
import { openSlots } from "../availability";

export const dynamic = "force-dynamic";

export async function GET() {
  const { slots, live } = await openSlots();
  const body: SlotsResponse = {
    timeZone: TIME_ZONE,
    live,
    slots: slots.map((s) => ({ start: new Date(s.start).toISOString(), end: new Date(s.end).toISOString() })),
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
