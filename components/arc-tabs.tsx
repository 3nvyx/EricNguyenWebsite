"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlideLink, slideTo, type SlideDir } from "@/components/slide-link";
import { PAGES, activePage } from "@/lib/pages";
import { cn } from "@/lib/utils";

/*
 * The desktop sidebar's page tabs, set along an arc like the rim of a wheel just off the left
 * edge of the screen. The current page sits at the apex, a little larger; the others curve back
 * toward the edge, close together, smaller and fainter the further they are. The text stays
 * level: only its position and size follow the arc. The list has ends (About on top, Play at the
 * bottom); it doesn't loop.
 *
 * Clicking a tab, or turning the mouse wheel over the tabs (one notch, one page), turns the arc
 * and slides the page beside it (SlideLink's `up` / `down`) on the same curve and timing, so the
 * wheel and the page move as one. Phones keep the plain tab row (PageTabs).
 *
 * The tabs sit in a black blob that bulges out from the left edge of the screen, roughly half an
 * oval, its outline slowly drifting so it reads as something fluid. The tabs read light on it.
 * Over the blob or a tab the wheel turns the arc; anywhere else it scrolls the page. The blob's
 * keyframes (`blob-drift`) are in globals.css.
 */

// Measurements are design pixels at 1440 wide (see --u in globals.css).
const RADIUS = 150; // the wheel's radius
const STEP = 0.27; // radians between neighbouring tabs: about 40px apart, 5px further left
const GROW = 0.15; // the current tab's extra size
const SHRINK = 0.1; // how much smaller each step away is
const FADE = 0.2; // how much fainter each step away is (the only fade: tabs are full bone on the blob)
const MIN_OPACITY = 0.6;
// The blob: an oval centred on the screen's left edge, level with the apex, so about half of it
// shows. The sidebar's content starts EDGE in from the screen's edge.
const BLOB_X = 300; // half its width: how far it reaches into the screen
const BLOB_Y = 190; // half its height, at most
const BLOB_Y_MIN = 110; // ...and at least, to hold the tabs
const TOP_BLOCK = 215; // the sidebar's name, links and coffee chat, from the top: the blob stays below
const EDGE = 45;

// Same duration and curve as the page slides in globals.css, so the arc and the page move as one.
const DURATION = 650;
const EASE = cubicBezier(0.32, 0.72, 0, 1);

const N = PAGES.length;

export function ArcTabs({ className }: { className?: string }) {
  const router = useRouter();
  const active = activePage(usePathname());
  const pos = useArcPosition(active);
  const navRef = useRef<HTMLElement>(null);

  // A tab below the current one slides its page up from below.
  const dirTo = (i: number): SlideDir => (i > active ? "up" : "down");

  // The wheel turns the arc one tab per notch. A trackpad sends a stream of small events for
  // one swipe, so after a step the wheel stays locked until the stream goes quiet and the turn
  // has had time to land. Steps count from the page last asked for, not the one showing, so a
  // slow page can't make a second notch ask for the same page again.
  const targetRef = useRef(active);
  useEffect(() => {
    targetRef.current = active;
  }, [active]);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let lockedUntil = 0;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let settled = true;
    const onWheel = (e: WheelEvent) => {
      // Pinch-zoom (and ctrl+wheel) arrives as a wheel event: leave it to the browser.
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      // Firefox's mouse wheel counts in lines (deltaMode 1), about 3 a notch; others in pixels.
      const dy = e.deltaMode ? e.deltaY * 16 : e.deltaY;
      // The rest of a swipe that just turned the arc is swallowed, even once it reaches an end.
      const turning = !settled || performance.now() < lockedUntil;
      const next = targetRef.current + (dy > 0 ? 1 : -1);
      // Past either end (with the swipe over), the wheel scrolls the page as usual.
      if (!turning && (next < 0 || next >= N)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(() => (settled = true), 180);
      if (turning || next < 0 || next >= N || Math.abs(dy) < 4) return;
      settled = false;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      lockedUntil = performance.now() + (still ? 0 : DURATION);
      const step = next - targetRef.current;
      targetRef.current = next;
      slideTo(router, PAGES[next].href, step > 0 ? "up" : "down");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(quiet);
    };
  }, [router]);

  return (
    // The nav itself takes no pointer events: only the blob and the tabs do, so the wheel turns the
    // arc over them and scrolls the page everywhere else in the sidebar (their events reach the
    // nav's listener).
    <nav
      ref={navRef}
      aria-label="Pages"
      className={cn("fw-nav pointer-events-none relative h-[calc(200*var(--u))] w-[calc(290*var(--u))]", className)}
    >
      <div
        aria-hidden
        className="blob pointer-events-auto absolute bg-ink"
        style={{
          left: `calc(${-EDGE - BLOB_X} * var(--u))`,
          // On short windows the blob gets shorter, so it stays clear of the top block.
          ["--blob-y" as string]: `clamp(calc(${BLOB_Y_MIN} * var(--u)), calc(50dvh - ${TOP_BLOCK} * var(--u)), calc(${BLOB_Y} * var(--u)))`,
          top: "calc(50% - var(--blob-y))",
          width: `calc(${2 * BLOB_X} * var(--u))`,
          height: "calc(2 * var(--blob-y))",
        }}
      />
      <ul className={LIST}>
        {PAGES.map((it, i) => (
          <li key={it.href} className={cn(ITEM, it.more && "group")} style={place(i - pos)}>
            <SlideLink
              href={it.href}
              dir={dirTo(i)}
              aria-current={i === active ? "page" : undefined}
              className={cn(ON_BLOB, "text-bone")}
            >
              {it.label}
            </SlideLink>
            {it.more && (
              // Revealed on hover, to the right of the tab. The padding bridges the gap so the
              // pointer can travel from the tab to the link.
              <SlideLink
                href={it.more.href}
                dir="forward"
                className={cn(
                  MORE,
                  ON_BLOB,
                  "pointer-events-none text-bone/60 opacity-0 transition-[opacity,color] duration-200",
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
// Links on the blob: hoverLink's darken-on-hover would vanish on black, so they brighten instead.
const ON_BLOB = "underline-offset-4 transition-colors duration-300 hover:text-bone hover:underline";

/** Where a tab `d` steps from the apex sits on the arc, and how large and faint it is. */
function place(d: number): React.CSSProperties {
  const far = Math.abs(d);
  const x = RADIUS * (Math.cos(d * STEP) - 1);
  const y = RADIUS * Math.sin(d * STEP);
  const scale = 1 + GROW * Math.max(0, 1 - far) - SHRINK * far;
  return {
    transform: `translate(calc(${x} * var(--u)), calc(-50% + ${y} * var(--u))) scale(${scale})`,
    opacity: Math.max(MIN_OPACITY, 1 - FADE * far),
  };
}

/**
 * The arc's position as a float that eases toward the current tab. Driven by
 * requestAnimationFrame on the same cubic-bezier as the page slides' CSS, so the arc and the page
 * move exactly together.
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
