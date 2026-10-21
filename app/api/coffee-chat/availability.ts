import { HORIZON_DAYS, classBusy, daysAhead, freeSlots, type Interval } from "@/lib/availability";
import { busyIntervals, isConfigured } from "@/lib/google-calendar";

/** Open coffee chat slots right now: class schedule plus live free/busy when configured. */
export async function openSlots(now = Date.now()): Promise<{ slots: Interval[]; live: boolean }> {
  const days = daysAhead(now, HORIZON_DAYS);
  let busy = classBusy(days);
  let live = false;
  if (isConfigured()) {
    try {
      busy = busy.concat(await busyIntervals(now, now + (HORIZON_DAYS + 1) * 24 * 3600e3));
      live = true;
    } catch (err) {
      console.error("coffee chat free/busy failed, using class schedule only:", err);
    }
  }
  return { slots: freeSlots(now, days, busy), live };
}
