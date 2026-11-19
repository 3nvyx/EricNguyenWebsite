import { PROJECTS } from "@/lib/projects";

/**
 * The projects home shows, two columns of cards (components/portfolio.tsx). Going to the
 * projects grid, these covers glide from their home spots into the grid (globals.css, "Page
 * slides"), so the grid's cards for them skip their own entrance (components/project-card.tsx).
 */
export const FEATURED = PROJECTS.slice(0, 4);

export const isFeatured = (slug: string) => FEATURED.some((p) => p.slug === slug);
