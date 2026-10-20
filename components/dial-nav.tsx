"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn, hoverLink } from "@/lib/utils";

export type DialItem = { label: string; href: string };

const STEP = "calc(34 * var(--u))"; // distance between stops on the dial
const TILT = 28; // degrees each stop is turned away from the reader

/**
 * Page nav drawn as a dial: the items sit on a drum that turns so the current page faces the
 * reader at the notch, and the others roll away above and below it.
 */
export function DialNav({ items, active }: { items: DialItem[]; active: number }) {
  return (
    <nav aria-label="Pages">
      {/* Phone: a plain row. */}
      <ul className="fw-nav flex gap-6 md:hidden">
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

      {/* Desktop: the dial. */}
      <div
        className="relative hidden h-[calc(110*var(--u))] md:block"
        style={{ perspective: "calc(260 * var(--u))" }}
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-0 h-px w-[calc(14*var(--u))] -translate-y-1/2 bg-ink"
        />
        <ul className="fw-nav absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {items.map((it, i) => {
            const offset = i - active;
            const on = offset === 0;
            return (
              <motion.li
                key={it.href}
                className="absolute top-1/2 left-[calc(26*var(--u))] origin-left"
                initial={false}
                animate={{
                  y: `calc(-50% + ${offset} * ${STEP})`,
                  rotateX: -offset * TILT,
                  opacity: Math.abs(offset) > 1 ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                <Link
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(hoverLink, "block", on ? "text-ink" : "fw-nav-off")}
                >
                  {it.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
