// The site's main pages, as shown in the sidebar tabs and the top bar.

/** `more`: a second link revealed when the tab is hovered (or focused). */
export type Page = { label: string; href: string; more?: { label: string; href: string } };

export const PAGES: Page[] = [
  { label: "ABOUT", href: "/about" },
  // Home is the featured projects; the full grid is one hover away.
  { label: "PROJECTS", href: "/", more: { label: "SEE MORE →", href: "/projects" } },
  { label: "BLOGS", href: "/blogs" },
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
