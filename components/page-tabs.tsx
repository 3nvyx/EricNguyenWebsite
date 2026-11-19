"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlideLink } from "@/components/slide-link";
import { PAGES, activePage } from "@/lib/pages";
import { cn, hoverLink } from "@/lib/utils";

/**
 * Page nav as a plain tab list, like the Rakuten Fashion Week brand pages: the current page in
 * ink, the rest in a soft gray. "stack" is the sidebar's tabs on phones, as a row (desktop uses
 * the arc in arc-tabs.tsx); "row" is the top bar on pages without the sidebar.
 */
export function PageTabs({ layout = "stack" }: { layout?: "stack" | "row" }) {
  const pathname = usePathname();
  const active = activePage(pathname);
  const stack = layout === "stack";
  // On the projects grid, every top-bar tab leads back to a sidebar page: run the grid's morph
  // in reverse, so the sidebar slides back in. "See more →" would lead to the grid itself, so
  // it's left out there.
  const fromGrid = !stack && pathname === "/projects";
  return (
    <nav aria-label="Pages">
      <ul className={cn("fw-nav flex gap-6", layout === "row" && "md:gap-[calc(27*var(--u))]")}>
        {PAGES.map((it, i) => {
          const more = !fromGrid && it.more;
          const className = cn(hoverLink, i === active ? "text-ink" : "fw-nav-off");
          return (
            <li key={it.href} className={cn("self-start", more && "group relative")}>
              {fromGrid ? (
                <SlideLink href={it.href} dir="back" aria-current={i === active ? "page" : undefined} className={className}>
                  {it.label}
                </SlideLink>
              ) : (
                <Link href={it.href} aria-current={i === active ? "page" : undefined} className={className}>
                  {it.label}
                </Link>
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
