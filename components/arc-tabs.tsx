"use client";

import { useEffect, useRef, useState } from "react";
import { SlideLink } from "@/components/slide-link";
import { SectionLink, useCurrentKind, useCurrentPage, useGoToPage } from "@/components/sections";
import { PAGES } from "@/lib/pages";
// The blob behind the tabs is switched off for now; see the commented-out FluidBlob below.
// import { FluidBlob } from "@/components/fluid-blob";
import { cn, hoverLink } from "@/lib/utils";

/*
 * The desktop sidebar's page tabs (once set on an arc, hence the name). They hold still in a
 * close column, About on top and Projects below; the current one is larger, and the others
 * smaller and fainter the further they are, and switching just grows one and shrinks the other.
 * A short bar to their left, a solid track with a marker one page tall, shows how many pages
 * there are and which one you're on; the marker slides as that changes.
 *
 * About and Projects are sections of one long home page (components/sections.tsx): the
 * tabs follow the scroll, and clicking a tab, or turning the mouse wheel over the tabs (one
 * notch, one section), glides the page there. Phones keep the plain tab row (PageTabs).
 *
 * Over the tabs and the bar the wheel changes section; anywhere else it scrolls the page.
 *
 * (Switched off for now: a black jelly blob behind the tabs, bulging in from the screen's left
 * edge, with the tabs in light on it; components/fluid-blob.tsx. To bring it back, uncomment it
 * and its import, and put the tabs back on ON_BLOB's light colours.)
 */

// Measurements are design pixels at 1440 wide (see --u in globals.css).
const ROW = 40; // from one tab to the next
const GROW = 0.15; // the current tab's extra size
const SHRINK = 0.1; // how much smaller each step away is
const FADE = 0.2; // how much fainter each step away is
const MIN_OPACITY = 0.6;
// The page bar, left of the tabs and centred on them: a track SEG tall per page.
const BAR_X = -20; // from the tabs' left edge
const BAR_SEG = 16;
const BAR_W = 2;
// The blob (switched off): an oval centred on the screen's left edge, level with the apex.
// const BLOB_X = 300; // half its width: how far it reaches into the screen
// const BLOB_Y = 190; // half its height, at most
// const BLOB_Y_MIN = 110; // ...and at least, to hold the tabs
// const TOP_BLOCK = 215; // the sidebar's top block, from the top: the blob stays below it
// const EDGE = 45; // the sidebar's content starts this far in from the frame's edge (--edge); the
// blob would now need the frame's offset from the screen edge too

// Same duration and curve as the page slides in globals.css, so the tabs move with the page.
const DURATION = 650;
const EASE = cubicBezier(0.32, 0.72, 0, 1);

const N = PAGES.length;
// How long a glide to a section is given before the wheel can step again (a smooth scroll across
// the page takes longer than the tabs' own turn).
const GLIDE_LOCK = 900;

export function ArcTabs({ className }: { className?: string }) {
  const active = useCurrentPage();
  const currentKind = useCurrentKind();
  const pos = useArcPosition(active);
  const navRef = useRef<HTMLElement>(null);
  const goTo = useGoToPage();
  const goRef = useRef(goTo);
  useEffect(() => {
    goRef.current = goTo;
  }, [goTo]);

  // The wheel moves one section per notch. A trackpad sends a stream of small events for one
  // swipe, so after a step the wheel stays locked until the stream goes quiet and the glide has
  // had time to land. Steps count from the section last asked for, not the one showing: a glide
  // passes the sections in between, and the tabs following them mustn't move the target.
  const targetRef = useRef(active);
  const activeRef = useRef(active);
  const lockRef = useRef(0);
  const unlockRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    activeRef.current = active;
    if (performance.now() >= lockRef.current) targetRef.current = active;
  }, [active]);
  useEffect(() => () => clearTimeout(unlockRef.current), []);
  // A click glides too: aim there and hold the target until it lands. Then the target is
  // whatever the tabs show, in case the glide was cut short by a scroll of the visitor's own.
  const aim = (i: number) => {
    targetRef.current = i;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lock = still ? 0 : GLIDE_LOCK;
    lockRef.current = performance.now() + lock;
    clearTimeout(unlockRef.current);
    unlockRef.current = setTimeout(() => (targetRef.current = activeRef.current), lock);
  };
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let settled = true;
    const onWheel = (e: WheelEvent) => {
      // Pinch-zoom (and ctrl+wheel) arrives as a wheel event: leave it to the browser.
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      // Firefox's mouse wheel counts in lines (deltaMode 1), about 3 a notch; others in pixels.
      const dy = e.deltaMode ? e.deltaY * 16 : e.deltaY;
      // The rest of a swipe that just changed page is swallowed, even once it reaches an end.
      const turning = !settled || performance.now() < lockRef.current;
      const next = targetRef.current + (dy > 0 ? 1 : -1);
      // Past either end (with the swipe over), the wheel scrolls the page as usual.
      if (!turning && (next < 0 || next >= N)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(() => (settled = true), 180);
      if (turning || next < 0 || next >= N || Math.abs(dy) < 4) return;
      settled = false;
      aim(next);
      goRef.current(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(quiet);
    };
  }, []);

  return (
    // The nav takes no pointer events itself: only the bar and the tabs do, so the wheel changes
    // page over them and scrolls the page everywhere else in the sidebar (their events reach the
    // nav's listener).
    <nav
      ref={navRef}
      aria-label="Pages"
      className={cn("fw-nav pointer-events-none relative h-[calc(200*var(--u))] w-[calc(290*var(--u))]", className)}
    >
      {/* <FluidBlob
        pulse={active}
        className="pointer-events-auto absolute"
        style={{
          left: `calc(${-EDGE - BLOB_X} * var(--u))`,
          // On short windows the blob gets shorter, so it stays clear of the top block.
          ["--blob-y" as string]: `clamp(calc(${BLOB_Y_MIN} * var(--u)), calc(50dvh - ${TOP_BLOCK} * var(--u)), calc(${BLOB_Y} * var(--u)))`,
          top: "calc(50% - var(--blob-y))",
          width: `calc(${2 * BLOB_X} * var(--u))`,
          height: "calc(2 * var(--blob-y))",
        }}
      /> */}

      {/* The page bar. Its padding widens the hover target past the hairline. */}
      <div
        aria-hidden
        className="pointer-events-auto absolute px-[calc(6*var(--u))]"
        style={{ left: `calc(${BAR_X - 6} * var(--u))`, top: `calc(50% - ${(N * BAR_SEG) / 2} * var(--u))` }}
      >
        <div
          className="relative bg-faint"
          style={{ width: `calc(${BAR_W} * var(--u))`, height: `calc(${N * BAR_SEG} * var(--u))` }}
        >
          {/* The marker: one page's share of the track, on the current page. */}
          <span
            className="absolute top-0 left-0 block h-[var(--seg)] w-full bg-ink"
            style={{
              ["--seg" as string]: `calc(${BAR_SEG} * var(--u))`,
              transform: `translateY(calc(${pos * BAR_SEG} * var(--u)))`,
            }}
          />
        </div>
      </div>
      <ul className={LIST}>
        {PAGES.map((it, i) => (
          <li key={it.href} className={cn(ITEM, it.more && "group")} style={place(i, i - pos)}>
            <SectionLink
              index={i}
              onClick={() => aim(i)}
              aria-current={i === active ? currentKind : undefined}
              className={cn(hoverLink, "duration-300", i === active ? "text-ink" : "fw-nav-off")}
            >
              {it.label}
            </SectionLink>
            {it.more && (
              // Revealed on hover, to the right of the tab. The padding bridges the gap so the
              // pointer can travel from the tab to the link.
              <SlideLink
                href={it.more.href}
                dir="forward"
                className={cn(
                  MORE,
                  "pointer-events-none text-mute opacity-0 transition-opacity duration-200 hover:text-ink hover:underline underline-offset-4",
                  "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
                )}
              >
                {it.more.label}
              </SlideLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const LIST = "text-[length:calc(27*var(--u))] leading-[calc(40*var(--u))]";
const ITEM = "pointer-events-auto absolute top-1/2 left-0 origin-left whitespace-nowrap";
const MORE = "fw-small absolute top-1/2 left-full -translate-y-1/2 pl-[calc(14*var(--u))]";
// Links on the blob (switched off): hoverLink's darken-on-hover would vanish on black, so they
// brightened instead, with the tabs in text-bone.
// const ON_BLOB = "underline-offset-4 transition-colors duration-300 hover:text-bone hover:underline";

/**
 * Tab `i`'s fixed row, centred on the column, and how large and faint it is `d` steps from the
 * current page (fractional while the page changes, so it grows and shrinks smoothly).
 */
function place(i: number, d: number): React.CSSProperties {
  const far = Math.abs(d);
  const y = (i - (N - 1) / 2) * ROW;
  const scale = 1 + GROW * Math.max(0, 1 - far) - SHRINK * far;
  return {
    transform: `translateY(calc(-50% + ${y} * var(--u))) scale(${scale})`,
    opacity: Math.max(MIN_OPACITY, 1 - FADE * far),
  };
}

/**
 * The current page as a float that eases toward each new one, for the tabs' sizes and the bar. Driven by
 * requestAnimationFrame on the same cubic-bezier as the page slides' CSS, so they move with the page.
 */
function useArcPosition(active: number) {
  const [pos, setPos] = useState(active);
  const posRef = useRef(active);

  useEffect(() => {
    const from = posRef.current;
    const to = active;
    if (to === from) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start: number | undefined;
    let raf = 0;
    const tick = (t: number) => {
      start ??= t;
      const k = still ? 1 : Math.min(1, (t - start) / DURATION);
      posRef.current = from + (to - from) * EASE(k);
      setPos(posRef.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return pos;
}

/** A CSS-style cubic-bezier easing: time in, progress out. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Find the curve's t for this x (Newton, then bisection if the slope is flat), then its y.
    let t = x;
    for (let i = 0; i < 6; i++) {
      const s = slope(x1, x2, t);
      if (Math.abs(s) < 1e-6) break;
      t -= (at(x1, x2, t) - x) / s;
    }
    if (t < 0 || t > 1 || Math.abs(at(x1, x2, t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      t = x;
      for (let i = 0; i < 20; i++) {
        if (at(x1, x2, t) < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return at(y1, y2, t);
  };
}
