"use client";

import { usePathname } from "next/navigation";
import { SectionLink, useCurrentKind, useCurrentPage } from "@/components/sections";
import { SlideLink } from "@/components/slide-link";
import { PAGES, moreOf } from "@/lib/pages";
import { cn, hoverLink } from "@/lib/utils";

/**
 * Page nav as a plain tab list, like the Rakuten Fashion Week brand pages: the current page in
 * ink, the rest in a soft gray. "stack" is the phones' row, pinned to the top of the sidebar
 * pages (app/(site)/layout.tsx; desktop uses the arc in arc-tabs.tsx); "row" is the top bar on
 * pages without the sidebar.
 */
export function PageTabs({ layout = "stack" }: { layout?: "stack" | "row" }) {
  const pathname = usePathname();
  const active = useCurrentPage();
  const currentKind = useCurrentKind();
  const stack = layout === "stack";
  // On a "See more" page (the projects grid, the full About), every top-bar tab leads back to a
  // section of home: run the morph in reverse, so the sidebar slides back in. The "See more →"
  // links are left out there.
  const fromGrid = !stack && !!moreOf(pathname);
  return (
    <nav aria-label="Pages">
      <ul className={cn("fw-nav flex gap-6", layout === "row" && "md:gap-[calc(27*var(--u))]")}>
        {PAGES.map((it, i) => {
          // The phone row has no hover to reveal "See more →" with (and it would sit over the
          // next tab): the sections' own buttons lead on from there.
          const more = !fromGrid && !stack && it.more;
          // Phones: padded to a finger's height.
          const className = cn(hoverLink, stack && "inline-block py-1.5", i === active ? "text-ink" : "fw-nav-off");
          return (
            <li key={it.href} className={cn("self-start", more && "group relative")}>
              {fromGrid ? (
                <SlideLink href={it.href} dir="back" aria-current={i === active ? "page" : undefined} className={className}>
                  {it.label}
                </SlideLink>
              ) : (
                <SectionLink index={i} aria-current={i === active ? currentKind : undefined} className={className}>
                  {it.label}
                </SectionLink>
              )}
              {more && (
                // Revealed on hover: to the right in the sidebar, underneath in the top bar. The
                // padding bridges the gap so the pointer can travel from the tab to the link.
                <SlideLink
                  href={more.href}
                  dir="forward"
                  className={cn(
                    "fw-small pointer-events-none absolute whitespace-nowrap text-mute opacity-0 transition-opacity duration-200",
                    "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
                    "hover:text-ink hover:underline underline-offset-4",
                    stack ? "top-1/2 left-full -translate-y-1/2 pl-[calc(14*var(--u))]" : "top-full right-0 pt-[calc(6*var(--u))]",
                  )}
                >
                  {more.label}
                </SlideLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
