import { PROJECTS, type Project } from "@/lib/projects";

/**
 * The four featured projects, in order. `tag` is the one-glance reason it's here, leading its card's
 * name ("Client Work: Chef Nourish"); `title` shortens the name when the tag already says the rest.
 */
const PICKS = [
  { slug: "luyten", tag: "Cal Hacks Winner", title: "Luyten" },
  { slug: "chef-nourish", tag: "Client Work" },
  { slug: "honors", tag: "Work Automation" },
  { slug: "slap", tag: "Embedded Programming" },
] as const satisfies readonly { slug: string; tag: string; title?: string }[];

export type FeaturedProject = Project & { tag: string; cardTitle: string; built: string };

/** The month and year a project was started, from its dates: "May – Sep 2026" is "May 2026". */
function startedIn(dates: string) {
  const year = dates.match(/\d{4}/)?.[0];
  const month = dates.match(/^[A-Z][a-z]{2}\b/)?.[0];
  return month && year ? `${month} ${year}` : (year ?? dates);
}

/**
 * The featured cards on home's Projects section (components/portfolio.tsx). Going to the projects
 * grid, each one is the same block there: it glides from its spot on home into the grid
 * (globals.css, "Page slides"), so the grid lists them first (GRID_ORDER) and their cards skip
 * their own entrance (components/project-card.tsx).
 */
export const FEATURED: FeaturedProject[] = PICKS.map((pick) => {
  const p = PROJECTS.find((x) => x.slug === pick.slug);
  if (!p) throw new Error(`lib/featured.ts: no project with slug "${pick.slug}"`);
  return { ...p, tag: pick.tag, cardTitle: "title" in pick ? pick.title : p.title, built: startedIn(p.dates) };
});

export const isFeatured = (slug: string) => FEATURED.some((p) => p.slug === slug);

/** Every project for the grid: the featured ones first, then the rest newest first. */
export const GRID_ORDER: Project[] = [...FEATURED, ...PROJECTS.filter((p) => !isFeatured(p.slug))];

/**
 * What a project's card says under its cover, the same on home and in the grid: its name (a
 * featured one led by its tag) and when it was started.
 */
export function cardText(p: Project) {
  const f = FEATURED.find((x) => x.slug === p.slug);
  return { title: f ? `${f.tag}: ${f.cardTitle}` : p.title, built: startedIn(p.dates) };
}
