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
  "md:pt-[calc(64*var(--u))] md:pr-0 md:pb-[calc(120*var(--u))] md:pl-0",
);

/** Shared easing for page motion. */
export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Marks an element that morphs between home and the projects grid during a `forward` / `back`
 * SlideLink transition: the element with the same name on the other page glides from one spot
 * to the other. Merge `className` with cn and pass `style`. globals.css turns the name on only
 * during those transitions, so it doesn't cut the element out of the vertical tab slides.
 * `kind` is a view-transition-class, for styling a family of morphs ("vt-card": the covers).
 */
export function morph(name: string, kind?: string) {
  return {
    // The kind is also a class, so CSS can switch a family of names off (see globals.css).
    className: cn("vt-name", kind),
    style: { "--vt-name": name, ...(kind && { "--vt-class": kind }) } as React.CSSProperties,
  };
}
