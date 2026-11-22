import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Plain-word links: darken and underline on hover. */
export const hoverLink =
  "underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline";

/** The right-hand column every page renders into, beside the sticky sidebar. */
export const pageMain = cn(
  "px-5 pt-12 pb-24",
  "md:pt-[calc(64*var(--u))] md:pr-[var(--edge)] md:pb-[calc(120*var(--u))] md:pl-0",
);

/** Shared easing for page motion. */
export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Marks an element that morphs between home and a "See more" page during a `forward` / `back`
 * SlideLink transition: the element with the same name on the other page glides from one spot
 * to the other. Merge `className` with cn, pass `style` and spread `attrs`. globals.css turns the
 * name on only during those transitions, so it doesn't cut the element out of other slides.
 * `kind` is a view-transition-class, for styling a family of morphs ("vt-card-text": the words
 * on a featured card). `pair` is where its twin is (a page, or a section of home: /#projects): going anywhere
 * else, it stays with its page.
 */
export function morph(name: string, { kind, pair }: { kind?: string; pair?: string } = {}) {
  return {
    // The kind is also a class, so CSS can pick out a family of names (see globals.css).
    className: cn("vt-name", kind),
    style: { "--vt-name": name, ...(kind && { "--vt-class": kind }) } as React.CSSProperties,
    attrs: pair ? { "data-vt-pair": pair } : {},
  };
}

/**
 * Marks one piece of a project (its cover, label, title...) that travels between its card on the
 * projects grid and its project page during an `open` / `close` slide. Spread it on the element on
 * both pages; slideTo names the pieces of that one project for the slide (components/slide-link.tsx).
 */
export function projectPiece(slug: string, piece: "cover" | "name" | "dates" | "title" | "tags" | "line") {
  return { "data-morph-key": slug, "data-morph-name": `project-${piece}` };
}
