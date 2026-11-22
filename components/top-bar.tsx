"use client";

import { usePathname } from "next/navigation";
import { ChromeName } from "@/components/chrome-name";
import { PageTitleLink } from "@/components/page-title";
import { SlideLink } from "@/components/slide-link";
import { ICON } from "@/lib/icons";
import { LINKS } from "@/lib/projects";
import { moreOf, titleMorph } from "@/lib/pages";

const [GITHUB, , , LINKEDIN] = LINKS;
const SOCIAL = [
  { label: "GitHub", href: GITHUB.href, path: ICON.github },
  { label: "LinkedIn", href: LINKEDIN.href, path: ICON.linkedin },
];

/** The name (home, with the slide back) and the GitHub and LinkedIn marks, like the sidebar's top. */
function NameAndSocials() {
  return (
    <div className="flex flex-wrap items-center gap-x-[calc(24*var(--u))] gap-y-1">
      <SlideLink href="/" dir="back" aria-label="Eric Nguyen, home">
        <ChromeName className="fw-name" />
      </SlideLink>
      <ul className="flex translate-y-[calc(2*var(--u))] items-center gap-[calc(18*var(--u))]">
        {SOCIAL.map((s) => (
          <li key={s.label} className="flex">
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="flex text-[#3a3a38] transition-colors duration-200 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[calc(22*var(--u))]">
                <path d={s.path} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * For pages without the sidebar, at the same height as the sidebar pages' tops so the title
 * glides straight across. On a "See more" page (the projects grid, the full About) the left spot
 * holds the page's title, back to where it came from: the "Projects" or "About" title glides here
 * as the sidebar leaves (see SlideLink), and the name and socials sit on the right. A project's
 * page is laid out the same way: "← Projects" on the left (back to the grid, the project's pieces
 * flying back into its card), the name and socials on the right.
 */
export function TopBar() {
  const pathname = usePathname();
  // On a "See more" page (the projects grid, the full About), the page it came from.
  const from = moreOf(pathname);
  // On a project's page, its slug.
  const project = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;
  return (
    // In the site's centred frame, lined up with the page below it.
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(64*var(--u))]">
      {from ? (
        <>
          {/* The arrow leads the line, so "← Projects" starts where the name does on other pages. */}
          <h1 className="fw-name">
            <PageTitleLink href={from.href} dir="back" vtName={titleMorph(from)} inline>
              {from.label}
            </PageTitleLink>
          </h1>
          <NameAndSocials />
        </>
      ) : (
        <>
          {project && (
            <p className="fw-name">
              <PageTitleLink href="/projects" dir="close" slideMorph={project} inline>
                Projects
              </PageTitleLink>
            </p>
          )}
          <NameAndSocials />
        </>
      )}
    </header>
  );
}
