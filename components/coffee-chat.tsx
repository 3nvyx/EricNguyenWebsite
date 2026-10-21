"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { EMAIL } from "@/lib/projects";
import { HORIZON_DAYS, type BookResponse, type Slot, type SlotsResponse } from "@/lib/coffee-chat";
import { cn, ease, hoverLink } from "@/lib/utils";

const PANEL_WIDTH = 340;
const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 16;
/** Open upward when there's less than this below the button and more room above. */
const PANEL_HEIGHT_HINT = 460;

type Placement = { left: number; width: number; maxHeight: number; top?: number; bottom?: number };

const subscribeNever = () => () => {};

/**
 * "Have a coffee chat with me". Opens a dropdown of open 30-minute slots over the next two
 * weeks (from /api/coffee-chat/slots); picking one and leaving a name and email books it
 * straight onto Eric's calendars and sends the invite.
 */
export function CoffeeChat({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /** Where the panel goes relative to the button, measured when it opens and on resize/scroll. */
  const measure = useCallback((): Placement | null => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(PANEL_WIDTH, vw - VIEWPORT_MARGIN * 2);
    const left = Math.min(Math.max(r.left, VIEWPORT_MARGIN), vw - width - VIEWPORT_MARGIN);
    // Room on either side of the button; the panel caps its height to that and scrolls inside.
    const below = vh - r.bottom - PANEL_GAP - VIEWPORT_MARGIN;
    const above = r.top - PANEL_GAP - VIEWPORT_MARGIN;
    if (below >= PANEL_HEIGHT_HINT || below >= above) {
      return { left, width, maxHeight: below, top: r.bottom + PANEL_GAP };
    }
    return { left, width, maxHeight: above, bottom: vh - r.top + PANEL_GAP };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => setPlacement(measure());
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, measure]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  const label = children ?? "Have a coffee chat with me";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) setPlacement(measure());
          setOpen(!open);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn("cursor-pointer text-left", hoverLink, className)}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn("ml-1 inline size-[0.7em] align-[-0.05em] transition-transform duration-300", open && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && placement && (
              <motion.div
                key="coffee"
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label="Book a coffee chat with Eric Nguyen"
                initial={{ opacity: 0, y: placement.top !== undefined ? -6 : 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: placement.top !== undefined ? -4 : 4, scale: 0.98 }}
                transition={{ duration: 0.28, ease }}
                style={placement}
                className="fw fw-small fixed z-50 overflow-y-auto overscroll-contain bg-bone p-[calc(16*var(--u))] text-ink shadow-[0_18px_48px_-16px_rgba(17,17,17,0.35)] ring-1 ring-ink/15"
              >
                <Picker onClose={close} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

type Day = { key: string; label: string; slots: Slot[] };
/** One cell of the two-week grid: a blank before today, or a date with its open slots (if any). */
type Cell = { key: string; num: string; day?: Day } | null;
type Stage = "pick" | "details" | "booking" | "done";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const numFormat = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long" });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const zoneFormat = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" });

/** Sunday-first weekday initials in the visitor's locale. */
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => weekdayFormat.format(new Date(2023, 0, 1 + i)));

function groupByDay(slots: Slot[]): Map<string, Day> {
  const days = new Map<string, Day>();
  for (const slot of slots) {
    const d = new Date(slot.start);
    const key = dayKeyFormat.format(d);
    let day = days.get(key);
    if (!day) {
      day = { key, label: dayFormat.format(d), slots: [] };
      days.set(key, day);
    }
    day.slots.push(slot);
  }
  return days;
}

/** Today through the horizon in the visitor's local calendar, padded to start on a Sunday. */
function buildGrid(days: Map<string, Day>): { cells: Cell[]; months: string } {
  const today = new Date();
  const cells: Cell[] = Array.from({ length: today.getDay() }, () => null);
  const first = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let last = first;
  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    const key = dayKeyFormat.format(date);
    cells.push({ key, num: numFormat.format(date), day: days.get(key) });
    last = date;
  }
  const a = monthFormat.format(first);
  const b = monthFormat.format(last);
  return { cells, months: a === b ? a : `${a} – ${b}` };
}

const chip = "cursor-pointer border border-ink/25 px-[calc(8*var(--u))] py-[calc(5*var(--u))] transition-colors duration-150 hover:border-ink";
const chipOn = "border-ink bg-ink text-bone hover:border-ink";
const field = "w-full border-b border-ink/30 bg-transparent py-[calc(5*var(--u))] outline-none transition-colors placeholder:text-faint focus:border-ink";

function Picker({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<SlotsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<BookResponse | null>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(() => {
    let on = true;
    fetch("/api/coffee-chat/slots")
      .then((r) => (r.ok ? (r.json() as Promise<SlotsResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => on && setData(d))
      .catch(() => on && setLoadError("Couldn't load times."));
    return () => {
      on = false;
    };
  }, []);

  useEffect(load, [load]);

  const days = useMemo(() => groupByDay(data?.slots ?? []), [data]);
  const { cells, months } = useMemo(() => buildGrid(days), [days]);
  const day = (dayKey && days.get(dayKey)) || days.values().next().value;
  const zone = useMemo(
    () => zoneFormat.formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "",
    [],
  );

  useEffect(() => {
    if (days.size) firstRef.current?.focus();
  }, [days.size]);

  const slotLabel = slot ? `${dayFormat.format(new Date(slot.start))} · ${timeFormat.format(new Date(slot.start))}` : "";

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    setStage("booking");
    let json: BookResponse;
    try {
      const res = await fetch("/api/coffee-chat/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: slot.start, name, email }),
      });
      json = (await res.json()) as BookResponse;
    } catch {
      json = { ok: false, error: "failed", message: "Couldn't reach the calendar. Try again or email me." };
    }
    setResult(json);
    if (json.ok) {
      setStage("done");
    } else if (json.error === "taken") {
      setSlot(null);
      setStage("pick");
      setData(null);
      load();
    } else {
      setStage("details");
    }
  }

  const mailto = slot
    ? `mailto:${EMAIL}?subject=${encodeURIComponent(`Coffee chat ${slotLabel} ${zone}`)}&body=${encodeURIComponent(
        `Hi Eric,\n\nI'd like a coffee chat on ${slotLabel} (${zone}).\n\n${name}`,
      )}`
    : `mailto:${EMAIL}`;

  return (
    <div className="flex flex-col gap-[calc(12*var(--u))]">
      <div className="fw-label mb-0 flex justify-between">
        <span>COFFEE CHAT</span>
        <button type="button" onClick={onClose} className={cn("cursor-pointer", hoverLink)}>
          CLOSE
        </button>
      </div>

      {stage === "done" && result?.ok ? (
        <div className="space-y-[calc(6*var(--u))]">
          <p>Booked.</p>
          <p className="text-mute">
            {slotLabel} {zone}. Invite sent to {email}.
            {result.meetLink && (
              <>
                {" "}
                <a href={result.meetLink} target="_blank" rel="noopener noreferrer" className={cn("text-ink", hoverLink)}>
                  Google Meet link
                </a>
                .
              </>
            )}
          </p>
        </div>
      ) : stage === "details" || stage === "booking" ? (
        <form onSubmit={book} className="space-y-[calc(12*var(--u))]">
          <p className="flex items-baseline justify-between gap-3">
            <span>{slotLabel}</span>
            <button type="button" onClick={() => setStage("pick")} className={cn("cursor-pointer text-mute", hoverLink)}>
              change
            </button>
          </p>
          <input
            autoFocus
            required
            maxLength={80}
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
          <input
            required
            type="email"
            maxLength={254}
            placeholder="you@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          {result && !result.ok && (
            <p className="text-mute" role="alert">
              {result.message}
              {result.error === "not_configured" && (
                <>
                  {" "}
                  <a href={mailto} className={cn("text-ink", hoverLink)}>
                    Email me this time
                  </a>{" "}
                  instead.
                </>
              )}
            </p>
          )}
          <button
            type="submit"
            disabled={stage === "booking"}
            className="cursor-pointer bg-ink px-[calc(12*var(--u))] py-[calc(6*var(--u))] tracking-[0.04em] text-bone transition-colors duration-200 hover:bg-[#262625] disabled:cursor-wait disabled:opacity-60"
          >
            {stage === "booking" ? "BOOKING…" : "BOOK IT"}
          </button>
        </form>
      ) : (
        <>
          <p className="text-mute">30 minutes, video or in person around Irvine.</p>
          {loadError ? (
            <p className="text-mute" role="alert">
              {loadError}{" "}
              <button
                type="button"
                onClick={() => {
                  setLoadError(null);
                  load();
                }}
                className={cn("cursor-pointer text-ink", hoverLink)}>
                Retry
              </button>
            </p>
          ) : !data ? (
            <p className="text-mute" aria-live="polite">
              Checking the calendar…
            </p>
          ) : !days.size ? (
            <p className="text-mute">
              Nothing open in the next two weeks.{" "}
              <a href={`mailto:${EMAIL}`} className={cn("text-ink", hoverLink)}>
                Email me
              </a>
              .
            </p>
          ) : (
            <>
              {result && !result.ok && result.error === "taken" && (
                <p className="text-mute" role="alert">
                  {result.message}
                </p>
              )}
              <div role="group" aria-label={`Days in ${months}`} className="space-y-[calc(6*var(--u))]">
                <p className="text-mute">{months}</p>
                <div className="grid grid-cols-7 gap-[calc(4*var(--u))] text-center">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} aria-hidden="true" className="text-faint">
                      {w}
                    </span>
                  ))}
                  {cells.map((c, i) =>
                    c === null ? (
                      <span key={`blank-${i}`} />
                    ) : (
                      <button
                        key={c.key}
                        ref={c.day && c.key === day?.key ? firstRef : undefined}
                        type="button"
                        disabled={!c.day}
                        onClick={() => setDayKey(c.key)}
                        aria-pressed={c.key === day?.key}
                        aria-label={c.day ? c.day.label : undefined}
                        className={cn(
                          "py-[calc(3*var(--u))] tabular-nums transition-colors duration-150",
                          c.day ? "cursor-pointer border border-ink/25 hover:border-ink" : "text-faint",
                          c.key === day?.key && chipOn,
                        )}
                      >
                        {c.num}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <p>{day?.label}</p>
              <div
                role="group"
                aria-label={`Times on ${day?.label}`}
                className="grid grid-cols-3 gap-[calc(6*var(--u))]"
              >
                {day?.slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => {
                      setSlot(s);
                      setResult(null);
                      setStage("details");
                    }}
                    className={cn("text-center tabular-nums", chip)}
                  >
                    {timeFormat.format(new Date(s.start))}
                  </button>
                ))}
              </div>
              <p className="text-mute">Times in {zone}.</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
