"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState, type ComponentProps } from "react";

/**
 * `forward` / `back`: home to the projects grid and back. The sidebar slides off to the left (or
 * back in), the "Projects" title (marked with morph() in lib/utils.ts) glides to its spot on the
 * other page, and the new page fades in over the old one.
 * `up` / `down`: only the page beside the sidebar moves, as if scrolling one long page: the next
 * page comes up from below / down from above, joined to the old one (the sidebar holds still;
 * see .page-slot in app/(site)/layout.tsx). Desktop only: on phones the sidebar sits above the
 * page, so these fall back to a plain navigation.
 * `open` / `close`: a card on the projects grid and its project's page. The card's pieces (cover,
 * label, title, tags, line) each travel to their spot on the other page as the page fades over.
 * Pass `morph` (the project's slug) so slideTo can find them: see nameMorphs.
 */
export type SlideDir = "forward" | "back" | "up" | "down" | "open" | "close";

// The open view transition's "the new page is in the DOM" signal. SlideNavDone calls it.
let finishNav: (() => void) | null = null;
// Which slide is current, so an earlier transition finishing late can't undo a newer one.
let slideId = 0;
// Set by slideTo for an href with a #section: once that route is in the DOM, SlideNavDone scrolls
// the section into view before the slide's "after" picture. Any other route arriving (the slide
// never landed) just clears it.
let landAt: { path: string; id: string } | null = null;
// Which slide last named each morph piece, so a slide only clears the names it still owns.
const pieceOwner = new WeakMap<HTMLElement, number>();

type Router = ReturnType<typeof useRouter>;

/**
 * Names the elements marked `data-morph-key={key}` for this transition, each with its
 * `data-morph-name`, and returns them. Only the one card and its project page carry a key's marks,
 * so the names stay unique; they're set inline just for the slide (cleared when it finishes).
 * `onScreen` names only the pieces in view: leaving a page scrolled far down, its header's pieces
 * would otherwise fly in from far off screen, so they stay with the page instead.
 */
function nameMorphs(key: string, id: number, onScreen = false) {
  const els = [...document.querySelectorAll<HTMLElement>(`[data-morph-key="${CSS.escape(key)}"]`)].filter((el) => {
    if (!onScreen) return true;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  });
  for (const el of els) {
    el.style.viewTransitionName = el.dataset.morphName ?? "none";
    pieceOwner.set(el, id);
  }
  return els;
}

/**
 * Takes the morph name (morph() in lib/utils.ts) off every marked piece that's off screen, for
 * this slide, and returns them so it can be put back.
 */
function dropOffscreen() {
  return [...document.querySelectorAll<HTMLElement>(".vt-name")].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) return false;
    el.style.viewTransitionName = "none";
    return true;
  });
}

/** Whether a slide can run here; otherwise the caller navigates plainly. */
function canSlide(dir: SlideDir) {
  if (!document.startViewTransition) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const vertical = dir === "up" || dir === "down";
  return !vertical || window.matchMedia("(min-width: 48rem)").matches;
}

/**
 * Navigates to `href` inside a slide when the browser can show one, and plainly otherwise. For
 * navigation that doesn't start from a link click (the sidebar's arc turned by the wheel).
 * Pages that mount during a slide can skip their own entrance fades with useMountedInSlide, so
 * they arrive fully drawn instead of fading in mid-slide. An href with a #section (/#projects)
 * lands on that section of the page.
 */
export function slideTo(
  router: Router,
  href: string,
  dir: SlideDir,
  { replace, scroll: scrollOpt, morph }: { replace?: boolean; scroll?: boolean; morph?: string } = {},
) {
  // Without a slide, Next scrolls to the #section itself.
  if (!canSlide(dir)) return replace ? router.replace(href, { scroll: scrollOpt }) : router.push(href, { scroll: scrollOpt });
  // Landing on a section, SlideNavDone does the scrolling, so Next mustn't jump to the top first.
  const [rawPath, section] = href.split("#");
  const path = rawPath || "/";
  landAt = section ? { path, id: section } : null;
  const scroll = section ? false : scrollOpt;
  // Back to the grid, finish scrolls the card into view itself, so Next mustn't jump to the top.
  const slideScroll = dir === "close" && morph ? false : scroll;
  const go = () => (replace ? router.replace(href, { scroll: slideScroll }) : router.push(href, { scroll: slideScroll }));

  const root = document.documentElement;
  const id = ++slideId;
  root.dataset.slide = dir;
  // Where the slide started and where it's going, for morphs between one pair of pages only.
  root.dataset.slideFrom = window.location.pathname;
  root.dataset.slideTo = path;
  // Between home and a "See more" page, only what's on screen at each end morphs: home is one
  // long page, and a piece far off screen would fly in from (or out to) there.
  const offscreen = dir === "forward" || dir === "back" ? dropOffscreen() : [];

  // Vertical slides move .page-slot as its own layer, lined up with the new page. Where the
  // slot's top sat on screen before and after lets the CSS put the old image back where it was
  // scrolled to and clip each page to the screen it shows.
  const slot = () => document.querySelector(".page-slot");
  const top = () => `${slot()?.getBoundingClientRect().top ?? 0}px`;
  root.style.setProperty("--slide-old-top", top());
  root.style.setProperty("--slide-new-top", "0px");
  // The old page's pieces are named now; the new page's once it's in the DOM (in finish).
  const named = morph ? nameMorphs(morph, id, true) : [];
  const clearNames = () => {
    for (const el of named) {
      if (pieceOwner.get(el) !== id) continue;
      el.style.viewTransitionName = "";
      pieceOwner.delete(el);
    }
  };
  // Set once the new page is captured or the wait gave up: a route committing later is too late.
  let settled = false;

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          settled = true;
          clearTimeout(timeout);
          if (finishNav === finish) finishNav = null;
          resolve();
        };
        // Runs after Next has scrolled the new page into view.
        const finish = () => {
          if (settled) return;
          if (morph) {
            const arrived = nameMorphs(morph, id);
            named.push(...arrived);
            // Back on the grid: bring the whole card being returned to into view, so its pieces
            // land on screen (Next was told not to jump to the top; see slideScroll).
            if (dir === "close") (arrived[0]?.closest("a") ?? arrived[0])?.scrollIntoView({ block: "center" });
          }
          if (dir === "forward" || dir === "back") offscreen.push(...dropOffscreen());
          root.style.setProperty("--slide-new-top", top());
          done();
        };
        // Never leave the page frozen if the route is slow: slide to whatever is there.
        const timeout = setTimeout(done, 2500);
        finishNav = finish;
        go();
      }),
  );
  // ready rejects when a transition is skipped (e.g. a newer one starts); nothing to do then.
  transition.ready.catch(() => {});
  transition.finished.finally(() => {
    clearNames();
    for (const el of offscreen) if (el.style.viewTransitionName === "none") el.style.viewTransitionName = "";
    // A slide that never landed mustn't scroll a later page to its section.
    if (landAt?.path === path) landAt = null;
    if (id !== slideId) return;
    delete root.dataset.slide;
    delete root.dataset.slideFrom;
    delete root.dataset.slideTo;
  });
}

/**
 * A Link that slides between pages with the View Transitions API instead of swapping them in
 * place (see slideTo). The keyframes are in globals.css, keyed off html[data-slide]. Falls back
 * to a plain Link when the browser has no view transitions, the visitor prefers reduced motion,
 * or the click opens a new tab.
 */
export function SlideLink({
  href,
  dir,
  onClick,
  replace,
  scroll,
  morph,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; dir: SlideDir; morph?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (href === pathname || !canSlide(dir)) return;
        // Stopping the default here also stops Link's own navigation; slideTo navigates instead.
        e.preventDefault();
        slideTo(router, href, dir, { replace: replace ?? undefined, scroll: scroll ?? undefined, morph });
      }}
    />
  );
}

/**
 * Whether this component mounted while a slide was running, as part of the page sliding in. Its
 * entrance fade would only play halfway through the slide, so it should start drawn instead
 * (`initial={mountedInSlide ? false : {...}}`). False on the server and on first load.
 */
export function useMountedInSlide() {
  const [inSlide] = useState(() => typeof document !== "undefined" && !!document.documentElement.dataset.slide);
  return inSlide;
}

/**
 * The page the running slide started from, if this component mounted during one; otherwise null
 * (always on the server and on first load).
 */
export function useSlideOrigin() {
  const [from] = useState(() =>
    typeof document !== "undefined" ? (document.documentElement.dataset.slideFrom ?? null) : null,
  );
  return from;
}

/**
 * The direction of the slide this component mounted during, if any; otherwise null (always on
 * the server and on first load).
 */
export function useSlideDir() {
  const [dir] = useState(() =>
    typeof document !== "undefined" ? ((document.documentElement.dataset.slide as SlideDir | undefined) ?? null) : null,
  );
  return dir;
}

/**
 * Mounted once in the root layout. When the pathname changes, the new route has committed to
 * the DOM, so the view transition can take its "after" snapshot (after scrolling to the section
 * slideTo was asked to land on).
 */
export function SlideNavDone() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (landAt) {
      if (landAt.path === pathname) document.getElementById(landAt.id)?.scrollIntoView({ behavior: "instant" });
      landAt = null;
    }
    finishNav?.();
    finishNav = null;
  }, [pathname]);
  return null;
}
