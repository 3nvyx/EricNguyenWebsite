"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore, type ComponentProps } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PAGES, activePage } from "@/lib/pages";

/*
 * Home is one long page: About, Projects and Play as sections, one after another (each with the
 * id from lib/pages.ts). The page tabs follow the scroll (SectionSpy) and clicking one glides
 * there (goToPage). Off home, a tab goes to its section on home (/#projects).
 */

let current = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
function setCurrent(i: number) {
  if (i === current) return;
  current = i;
  for (const fn of listeners) fn();
}

/**
 * How a tab marks the current one for screen readers: on home it's a place on the page, elsewhere
 * the page itself.
 */
export function useCurrentKind() {
  return usePathname() === "/" ? "location" : "page";
}

/** Which page the tabs mark: on home the section in view, elsewhere the page the path is part of. */
export function useCurrentPage() {
  const pathname = usePathname();
  const inView = useSyncExternalStore(subscribe, () => current, () => 0);
  return pathname === "/" ? inView : activePage(pathname);
}

/** The section in view: the last one whose top has passed the upper third of the screen. */
export function sectionInView() {
  const line = window.innerHeight / 3;
  let i = 0;
  PAGES.forEach((p, k) => {
    const el = document.getElementById(p.id);
    if (el && el.getBoundingClientRect().top <= line) i = k;
  });
  // Scrolled to the very end, the last section counts even if it's too short to reach the line.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) i = PAGES.length - 1;
  return i;
}

/**
 * Mounted on home: keeps the tabs on the section in view, and the address on it too (/#play),
 * so a reload or a shared link comes back to the same place.
 */
export function SectionSpy() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Leaving home, the next page scrolls to its top before this is cleaned up: that scroll
      // isn't home's, and writing home's address then would replace the new page's.
      if (window.location.pathname !== "/") return;
      const i = sectionInView();
      setCurrent(i);
      const url = i === 0 ? "/" : `/#${PAGES[i].id}`;
      if (window.location.pathname + window.location.hash !== url) window.history.replaceState(null, "", url);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Arriving at /#play, the browser has already scrolled there: mark it straight away. Back or
    // Forward may put the scroll somewhere else again, so look once more after those.
    const recheck = () =>
      requestAnimationFrame(() => {
        if (window.location.pathname === "/") setCurrent(sectionInView());
      });
    setCurrent(sectionInView());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("popstate", recheck);
    window.addEventListener("pageshow", recheck);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("popstate", recheck);
      window.removeEventListener("pageshow", recheck);
      // Off home the tabs follow the path; coming back, they start from the top, not a stale section.
      setCurrent(0);
    };
  }, []);
  return null;
}

/** Glides to a section on home (or jumps, for reduced motion). */
export function scrollToSection(i: number) {
  const el = document.getElementById(PAGES[i].id);
  if (!el) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (i === 0) window.scrollTo({ top: 0, behavior: still ? "instant" : "smooth" });
  else el.scrollIntoView({ behavior: still ? "instant" : "smooth", block: "start" });
}

/** Goes to page `i`: its section, gliding there on home and navigating there from elsewhere. */
export function useGoToPage() {
  const router = useRouter();
  const pathname = usePathname();
  return (i: number) => (pathname === "/" ? scrollToSection(i) : router.push(PAGES[i].href));
}

/** A link to page `index`'s section: on home it glides there; elsewhere it opens home there. */
export function SectionLink({ index, onClick, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { index: number }) {
  const pathname = usePathname();
  return (
    <Link
      href={PAGES[index].href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (pathname !== "/") return;
        e.preventDefault();
        scrollToSection(index);
      }}
    />
  );
}
