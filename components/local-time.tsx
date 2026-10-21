"use client";

import { useEffect, useState } from "react";

const TIME_ZONE = "America/Los_Angeles";
const format = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
  timeZoneName: "short",
});

/** Eric's local time in Irvine, updated every minute. Renders on the client only. */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    // Line the updates up with the turn of each minute.
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(first);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <p className={className} suppressHydrationWarning>
      {now ? `${format.format(now)}, Irvine` : " "}
    </p>
  );
}
