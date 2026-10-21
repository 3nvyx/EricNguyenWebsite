"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES, activePage } from "@/lib/pages";
import { cn, hoverLink } from "@/lib/utils";

/**
 * Page nav as a plain tab list, like the Rakuten Fashion Week brand pages: the current page in
 * ink, the rest in a soft gray. "stack" is the sidebar's column (a row on phones); "row" is the
 * top bar on pages without the sidebar.
 */
export function PageTabs({ layout = "stack" }: { layout?: "stack" | "row" }) {
  const active = activePage(usePathname());
  return (
    <nav aria-label="Pages">
      <ul className={cn("fw-nav flex gap-6", layout === "stack" && "md:flex-col md:gap-0", layout === "row" && "md:gap-[calc(27*var(--u))]")}>
        {PAGES.map((it, i) => (
          <li key={it.href} className={cn("self-start", it.more && "group relative")}>
            <Link
              href={it.href}
              aria-current={i === active ? "page" : undefined}
              className={cn(hoverLink, i === active ? "text-ink" : "fw-nav-off")}
            >
              {it.label}
            </Link>
            {it.more && (
              // Revealed on hover: to the right in the sidebar, underneath in the top bar. The
              // padding bridges the gap so the pointer can travel from the tab to the link.
              <Link
                href={it.more.href}
                className={cn(
                  "fw-small pointer-events-none absolute whitespace-nowrap text-mute opacity-0 transition-opacity duration-200",
                  "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
                  "hover:text-ink hover:underline underline-offset-4",
                  layout === "stack"
                    ? "top-1/2 left-full -translate-y-1/2 pl-[calc(14*var(--u))]"
                    : "top-full right-0 pt-[calc(6*var(--u))]",
                )}
              >
                {it.more.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
