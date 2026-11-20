// The site's main pages, as shown in the sidebar tabs and the top bar.

/** `more`: a second link revealed when the tab is hovered (or focused). */
export type Page = { label: string; href: string; more?: { label: string; href: string } };

export const PAGES: Page[] = [
  // About's highlights; the whole story (skills and awards too) is one hover away.
  { label: "About", href: "/about", more: { label: "See more →", href: "/about/more" } },
  // Home is the featured projects; the full grid is one hover away.
  { label: "Projects", href: "/", more: { label: "See more →", href: "/projects" } },
  // Blogs are parked for now; the tab goes to the game instead.
  // { label: "BLOGS", href: "/blogs" },
  { label: "Play", href: "/play" },
];

/** Which page a path belongs to: home and everything under /projects count as Projects. */
export function activePage(pathname: string) {
  return Math.max(
    0,
    PAGES.findIndex((p) =>
      p.href === "/" ? pathname === "/" || pathname.startsWith("/projects") : pathname.startsWith(p.href),
    ),
  );
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
