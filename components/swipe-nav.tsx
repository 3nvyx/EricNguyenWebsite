"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sectionInView } from "@/components/sections";
import { slideTo, type SlideDir } from "@/components/slide-link";
import { PAGES, PROJECTS_GRID, moreOf } from "@/lib/pages";

/*
 * Sideways swipes move between home and the pages off it, like the slides the links run
 * (SlideLink's `forward` / `back`): on home, swiping left (two fingers on a trackpad, or a finger
 * on a touch screen) goes into the section in view (About to the full About, Projects to the
 * grid); on those pages, swiping right goes back to home's section, and on a project's page back
 * to the grid (`close`).
 *
 * It's one motion, not a drag and then a slide. The page starts to follow the fingers (going in,
 * the sidebar begins closing to the left and the page edges left with it; going back, the page
 * edges right), and as soon as the swipe clearly means it, the slide takes over from exactly
 * there and carries on: a trackpad swipe a quarter of the way along (TAKE_OVER), without waiting
 * for the fingers or the trackpad's momentum to stop; a finger on a touch screen when it lifts a
 * third of the way along (COMMIT) or flicks. Short of that, it all springs back. With nowhere to
 * go, it only gives a little. The pages a swipe can reach are fetched ahead, so nothing waits on
 * them. The browser's own swipe-back is off (globals.css), so the two can't fight.
 *
 * What moves is marked data-swipe: "sidebar" (components/sidebar.tsx) and "page" (the page
 * beside it, the wide pages, the footer).
 */

type Target = { href: string; dir: SlideDir; morph?: string; sign: 1 | -1 };

// Swiping this far (a share of the window, at most MAX_PULL px) is all the way.
const PULL = 0.45;
const MAX_PULL = 560;
// A trackpad swipe this share of the way along is meant: the slide takes over there and then.
const TAKE_OVER = 0.25;
// A finger lifted at this share of the way or more, and the slide runs on.
const COMMIT = 0.3;
// ...or flicked this fast (px per ms), in the right direction.
const FLICK = 0.5;
// Quiet this long between wheel events ends a trackpad swipe (its momentum included).
const QUIET = 140;
const SPRING = "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.45s cubic-bezier(0.32, 0.72, 0, 1)";

/** Where a swipe can go from `pathname` (on home, from the section in view right now). */
function targets(pathname: string): Target[] {
  if (pathname === "/") {
    const more = PAGES[sectionInView()]?.more;
    return more ? [{ href: more.href, dir: "forward", sign: 1 }] : [];
  }
  const from = moreOf(pathname);
  if (from) return [{ href: from.href, dir: "back", sign: -1 }];
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/")[2];
    return [{ href: PROJECTS_GRID, dir: "close", morph: slug, sign: -1 }];
  }
  return [];
}

const swipeEls = (kind: string) => [...document.querySelectorAll<HTMLElement>(`[data-swipe="${kind}"]`)];

/** Moves the marked parts for a swipe `dx` px along (positive: fingers left, going in). */
function follow(dx: number, target: Target | undefined) {
  const width = Math.min(window.innerWidth * PULL, MAX_PULL);
  const shift = window.innerWidth * (window.innerWidth >= 768 ? 0.365 : 0.24);
  const set = (el: HTMLElement, x: number, opacity = 1) => {
    el.style.transition = "none";
    el.style.transform = x ? `translateX(${x}px)` : "";
    // Only the page dims: the sidebar's opacity is its own entrance fade's (framer-motion).
    if (el.dataset.swipe === "page") el.style.opacity = opacity < 1 ? String(opacity) : "";
  };
  if (!target || Math.sign(dx) !== target.sign) {
    // Nowhere to go this way: a little give that stiffens the further it's pushed.
    const give = -Math.sign(dx) * 28 * (1 - 1 / (1 + Math.abs(dx) / 140));
    for (const el of swipeEls("page")) set(el, give);
    return 0;
  }
  const p = Math.min(1, Math.abs(dx) / width);
  if (target.dir === "forward") {
    for (const el of swipeEls("sidebar")) set(el, -p * el.offsetWidth * 0.9);
    for (const el of swipeEls("page")) set(el, -p * shift * 0.35, 1 - p * 0.25);
  } else {
    for (const el of swipeEls("page")) set(el, p * shift * 0.3, 1 - p * 0.25);
  }
  return p;
}

/** Springs everything back to where it was. */
function release() {
  for (const el of [...swipeEls("page"), ...swipeEls("sidebar")]) {
    el.style.transition = SPRING;
    el.style.transform = "";
    if (el.dataset.swipe === "page") el.style.opacity = "";
    setTimeout(() => {
      if (!el.style.transform) el.style.transition = "";
    }, 500);
  }
}

/** Clears what a swipe left on the parts (once the next page is in, before its slide's picture). */
function reset() {
  for (const el of [...swipeEls("page"), ...swipeEls("sidebar")]) {
    el.style.transition = el.style.transform = "";
    if (el.dataset.swipe === "page") el.style.opacity = "";
  }
}

/**
 * Whether a swipe starting on `target` belongs to it rather than to the page: a canvas, form
 * controls (a video's seek bar), anything marked data-no-swipe (the 360° video), and anything
 * that scrolls sideways itself (any way, for a touch, whose direction isn't known yet; for a
 * wheel, only if it can still scroll the way `dx` goes).
 */
function ownsSwipe(target: EventTarget | null, dx?: number) {
  for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
    if (el instanceof HTMLCanvasElement || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
    if (el instanceof HTMLElement && el.dataset.noSwipe !== undefined) return true;
    const { overflowX } = getComputedStyle(el);
    if ((overflowX !== "auto" && overflowX !== "scroll") || el.scrollWidth <= el.clientWidth) continue;
    if (dx === undefined) return true;
    if (dx > 0 ? el.scrollLeft + el.clientWidth < el.scrollWidth - 1 : el.scrollLeft > 0) return true;
  }
  return false;
}

const progress = (dx: number) => Math.min(1, Math.abs(dx) / Math.min(window.innerWidth * PULL, MAX_PULL));

/** The wheel and touch handling. Mounted once, in the root layout, before SlideNavDone. */
export function SwipeNav() {
  const router = useRouter();
  const pathname = usePathname();
  const here = useRef(pathname);
  const stall = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    here.current = pathname;
  }, [pathname]);

  // The next page is in: drop the swipe's offsets before the slide takes its picture of it.
  useLayoutEffect(() => {
    clearTimeout(stall.current);
    reset();
  }, [pathname]);

  // Fetch the pages a swipe can reach from here ahead of time, so the slide doesn't wait on them.
  useEffect(() => {
    const hrefs = pathname === "/" ? PAGES.flatMap((p) => (p.more ? [p.more.href] : [])) : targets(pathname).map((t) => t.href);
    for (const href of hrefs) router.prefetch(href.split("#")[0] || "/");
  }, [pathname, router]);

  useEffect(() => {
    const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sliding = () => !!document.documentElement.dataset.slide;
    const targetFor = (dx: number) => targets(here.current).find((t) => t.sign === Math.sign(dx));

    const commit = (t: Target) => {
      const from = here.current;
      slideTo(router, t.href, t.dir, { morph: t.morph });
      // The offsets come off when the next page arrives (the layout effect above). If it never
      // does (a failed or stalled load), spring back rather than staying half-swiped.
      clearTimeout(stall.current);
      stall.current = setTimeout(() => {
        if (here.current === from) release();
      }, 3000);
    };

    // ---- Wheel (trackpads) ----
    // A scroll's direction is settled by its first few events together, not the first alone
    // (a vertical scroll often starts with a sideways twitch). Until then nothing is stopped.
    let streaming = false;
    let axis: "x" | "y" | null = null;
    let sumX = 0;
    let sumY = 0;
    let events = 0;
    let dx = 0;
    let spent = false;
    let blocked = false; // this scroll started on something that scrolls sideways itself
    let quiet: ReturnType<typeof setTimeout> | undefined;
    const end = () => {
      streaming = false;
      if (axis === "x" && !spent) {
        // It never got far enough to take over: back to where it was.
        release();
      }
      axis = null;
      dx = sumX = sumY = events = 0;
      spent = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const ex = e.deltaMode ? e.deltaX * 16 : e.deltaX;
      const ey = e.deltaMode ? e.deltaY * 16 : e.deltaY;
      if (!streaming) {
        streaming = true;
        blocked = sliding() || ownsSwipe(e.target, ex);
      }
      clearTimeout(quiet);
      quiet = setTimeout(end, QUIET);
      if (blocked) return;
      if (!axis) {
        sumX += ex;
        sumY += ey;
        events++;
        if (Math.abs(sumX) + Math.abs(sumY) < 12 && events < 3) return;
        axis = Math.abs(sumX) > Math.abs(sumY) * 1.2 ? "x" : "y";
        if (axis === "x") dx = sumX;
      } else if (axis === "x") {
        // Turned into a clearly vertical scroll before going anywhere: let the page have it.
        if (!spent && Math.abs(ey) > Math.abs(ex) * 2 && progress(dx) < 0.1) {
          axis = "y";
          release();
          return;
        }
        dx += ex;
      }
      if (axis !== "x") return;
      e.preventDefault();
      if (spent) return;
      const t = targetFor(dx);
      const p = still() ? (t ? progress(dx) : 0) : follow(dx, t);
      // Far enough to mean it: the slide takes over now, mid-swipe, so it's one motion. The rest
      // of the swipe (its momentum too) is swallowed.
      if (t && p >= TAKE_OVER) {
        spent = true;
        commit(t);
      }
    };

    // ---- Touch ----
    let start: { x: number; y: number } | null = null;
    let touchAxis: "x" | "y" | null = null;
    let touchDx = 0;
    let moved = false; // offsets are on the page
    let last = { x: 0, t: 0, v: 0 };
    const cancel = () => {
      if (moved) release();
      start = null;
      touchAxis = null;
      moved = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      // A second finger: this isn't a swipe any more.
      if (e.touches.length > 1) return cancel();
      const touch = e.touches[0];
      // The screen's edges belong to the browser (swipe back).
      const edge = touch.clientX < 24 || touch.clientX > window.innerWidth - 24;
      start = !edge && !sliding() && !ownsSwipe(e.target) ? { x: touch.clientX, y: touch.clientY } : null;
      touchAxis = null;
      touchDx = 0;
      moved = false;
      last = { x: touch.clientX, t: e.timeStamp, v: 0 };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!start) return;
      const touch = e.touches[0];
      const mx = touch.clientX - start.x;
      const my = touch.clientY - start.y;
      if (!touchAxis) {
        if (Math.hypot(mx, my) < 10) return;
        touchAxis = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y";
      }
      if (touchAxis !== "x") return;
      if (e.cancelable) e.preventDefault();
      // Fingers moving left is going in: the same sign as a trackpad's deltaX.
      touchDx = -mx;
      const dt = e.timeStamp - last.t;
      if (dt > 0) last = { x: touch.clientX, t: e.timeStamp, v: (last.x - touch.clientX) / dt };
      if (!still()) {
        follow(touchDx, targetFor(touchDx));
        moved = true;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (start && touchAxis === "x") {
        const t = targetFor(touchDx);
        // A flick counts only if the fingers were still moving fast as they lifted.
        const fresh = e.timeStamp - last.t < 100;
        const flick = t && fresh && Math.sign(last.v) === t.sign && Math.abs(last.v) > FLICK;
        if (t && (progress(touchDx) >= COMMIT || flick)) commit(t);
        else release();
      } else if (moved) release();
      start = null;
      touchAxis = null;
      moved = false;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    // Cancelled by the system (a notification, an edge gesture): never a navigation.
    window.addEventListener("touchcancel", cancel);
    return () => {
      clearTimeout(quiet);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", cancel);
    };
  }, [router]);

  return null;
}
