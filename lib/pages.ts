// The site's main pages, as shown in the sidebar tabs and the top bar. They're sections of one
// long home page (app/(site)/page.tsx), each with its `id`; `href` goes to it from anywhere.

/** `more`: a second link revealed when the tab is hovered (or focused). */
export type Page = { label: string; id: string; href: string; more?: { label: string; href: string } };

/** Every project as a card grid (the featured ones are on home). */
export const PROJECTS_GRID = "/projects/all";

/** The game on its own page, on a wider board (the smaller one is on home). */
export const PLAY_FULL = "/play/full";

export const PAGES: Page[] = [
  // About's preview; the whole story (experience, leadership, awards) is one hover away.
  { label: "About", id: "about", href: "/", more: { label: "See more →", href: "/about/more" } },
  // The featured projects; the full grid is one hover away.
  { label: "Projects", id: "projects", href: "/#projects", more: { label: "See more →", href: PROJECTS_GRID } },
  // Blogs are parked for now; the tab goes to the game instead.
  // { label: "BLOGS", href: "/blogs" },
  // The game; the full-size board is one hover away.
  { label: "Play", id: "play", href: "/#play", more: { label: "Full size →", href: PLAY_FULL } },
];

/**
 * Which page a path belongs to, off home (on home, the section in view: components/sections.tsx):
 * /about/more counts as About, everything under /projects as Projects, /play/full as Play.
 */
export function activePage(pathname: string) {
  return pathname.startsWith("/projects") ? 1 : pathname.startsWith("/play") ? 2 : 0;
}

/**
 * The page whose "See more →" leads to `pathname` (the projects grid, the full About), if any.
 * Those wide pages swap the name in the top bar for the page's title, back to it.
 */
export function moreOf(pathname: string) {
  return PAGES.find((p) => p.more?.href === pathname);
}

/** The morph name for a page's title, so it glides between the page and its "See more" page. */
export function titleMorph(page: Page) {
  return `${page.label.toLowerCase()}-title`;
}

/** Pages in the centred frame without the sidebar: the "See more" pages and each project. */
export function isFramed(pathname: string) {
  return !!moreOf(pathname) || pathname.startsWith("/projects/");
}
