import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Plain-word links: darken and underline on hover. */
export const hoverLink =
  "underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline";

/** Shared easing for page motion. */
export const ease = [0.22, 1, 0.36, 1] as const;
