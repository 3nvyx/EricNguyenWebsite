// The site's main pages, as shown in the sidebar tabs and the top bar.

export type Page = { label: string; href: string };

export const PAGES: Page[] = [
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "BLOGS", href: "/blogs" },
];

/** Which page a path belongs to. Home shows the featured projects, so it counts as Projects. */
export function activePage(pathname: string) {
  if (pathname === "/") return PAGES.findIndex((p) => p.href === "/projects");
  return Math.max(
    0,
    PAGES.findIndex((p) => pathname.startsWith(p.href)),
  );
}
