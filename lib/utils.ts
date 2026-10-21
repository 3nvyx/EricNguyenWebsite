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
  "md:pt-[calc(64*var(--u))] md:pr-[calc(45*var(--u))] md:pb-[calc(120*var(--u))] md:pl-0",
);

/** Shared easing for page motion. */
export const ease = [0.22, 1, 0.36, 1] as const;
