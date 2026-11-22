import { PROJECTS, type Project } from "@/lib/projects";

/**
 * The four featured projects, in order. `tag` is the one-glance reason it's here, shown as a chip
 * on its dark card; `title` shortens the card's title when the tag already says the rest.
 */
const PICKS = [
  { slug: "luyten", tag: "Cal Hacks winner", title: "Luyten" },
  { slug: "chef-nourish", tag: "Client work" },
  { slug: "honors", tag: "Work automation" },
  { slug: "slap", tag: "Embedded programming" },
] as const satisfies readonly { slug: string; tag: string; title?: string }[];

export type FeaturedProject = Project & { tag: string; cardTitle: string };

/**
 * The featured cards on home's Projects section (components/portfolio.tsx). Going to the projects
 * grid, these covers glide from their spots into the grid (globals.css, "Page slides"), so the grid
 * lists them first (GRID_ORDER) and their cards skip their own entrance (components/project-card.tsx).
 */
export const FEATURED: FeaturedProject[] = PICKS.map((pick) => {
  const p = PROJECTS.find((x) => x.slug === pick.slug);
  if (!p) throw new Error(`lib/featured.ts: no project with slug "${pick.slug}"`);
  return { ...p, tag: pick.tag, cardTitle: "title" in pick ? pick.title : p.title };
});

export const isFeatured = (slug: string) => FEATURED.some((p) => p.slug === slug);

/** Every project for the grid: the featured ones first, then the rest newest first. */
export const GRID_ORDER: Project[] = [...FEATURED, ...PROJECTS.filter((p) => !isFeatured(p.slug))];
