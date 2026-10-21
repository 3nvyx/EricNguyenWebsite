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
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={i === active ? "page" : undefined}
              className={cn(hoverLink, i === active ? "text-ink" : "fw-nav-off")}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
