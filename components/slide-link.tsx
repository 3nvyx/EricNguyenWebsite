"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState, type ComponentProps } from "react";

/**
 * `forward` / `back`: home to the projects grid and back. The sidebar slides off to the left (or
 * back in), the "Projects" title (marked with morph() in lib/utils.ts) glides to its spot on the
 * other page, and the old page goes soft and grey as the new one sweeps in over it.
 * `up` / `down`: only the page beside the sidebar moves, as if scrolling one long page: the next
 * page comes up from below / down from above, joined to the old one (the sidebar holds still;
 * see .page-slot in app/(site)/layout.tsx). Desktop only: on phones the sidebar sits above the
 * page, so these fall back to a plain navigation.
 */
export type SlideDir = "forward" | "back" | "up" | "down";

// The open view transition's "the new page is in the DOM" signal. SlideNavDone calls it.
let finishNav: (() => void) | null = null;
// Which slide is current, so an earlier transition finishing late can't undo a newer one.
let slideId = 0;

type Router = ReturnType<typeof useRouter>;

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
 * they arrive fully drawn instead of fading in mid-slide.
 */
export function slideTo(
  router: Router,
  href: string,
  dir: SlideDir,
  { replace, scroll }: { replace?: boolean; scroll?: boolean } = {},
) {
  const go = () => (replace ? router.replace(href, { scroll }) : router.push(href, { scroll }));
  if (!canSlide(dir)) return go();

  const root = document.documentElement;
  const id = ++slideId;
  root.dataset.slide = dir;

  // Vertical slides move .page-slot as its own layer, lined up with the new page. Where the
  // slot's top sat on screen before and after lets the CSS put the old image back where it was
  // scrolled to and clip each page to the screen it shows.
  const slot = () => document.querySelector(".page-slot");
  const top = () => `${slot()?.getBoundingClientRect().top ?? 0}px`;
  root.style.setProperty("--slide-old-top", top());
  root.style.setProperty("--slide-new-top", "0px");

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timeout);
          if (finishNav === finish) finishNav = null;
          resolve();
        };
        // Runs after Next has scrolled the new page into view.
        const finish = () => {
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
    if (id !== slideId) return;
    delete root.dataset.slide;
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
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; dir: SlideDir }) {
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
        slideTo(router, href, dir, { replace: replace ?? undefined, scroll: scroll ?? undefined });
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
 * Mounted once in the root layout. When the pathname changes, the new route has committed to
 * the DOM, so the view transition can take its "after" snapshot.
 */
export function SlideNavDone() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    finishNav?.();
    finishNav = null;
  }, [pathname]);
  return null;
}
