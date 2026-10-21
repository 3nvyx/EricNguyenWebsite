"use client";

import Link from "next/link";
import { cn, hoverLink } from "@/lib/utils";

export type PageTab = { label: string; href: string };

/**
 * Page nav as a plain tab list, like the Rakuten Fashion Week brand pages: stacked on desktop,
 * a row on phones; the current page in ink, the rest in a soft gray.
 */
export function PageTabs({ items, active }: { items: PageTab[]; active: number }) {
  return (
    <nav aria-label="Pages">
      <ul className="fw-nav flex gap-6 md:flex-col md:gap-0">
        {items.map((it, i) => (
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
