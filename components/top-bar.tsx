"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChromeName } from "@/components/chrome-name";
import { PageTabs } from "@/components/page-tabs";
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

/**
 * For pages without the sidebar: the name (home) on the left, the page tabs on the right, at the
 * same height as the sidebar pages' tops so the title glides straight across. On a "See more"
 * page (the projects grid, the full About) the left spot holds the page's title instead, back to
 * where it came from: the "Projects" or "About" title glides here as the sidebar leaves (see
 * SlideLink). Their right side has the name (home, with the slide back) and the GitHub and
 * LinkedIn marks, like the top of the sidebar, instead of the page tabs.
 */
export function TopBar() {
  // On a "See more" page (the projects grid, the full About), the page it came from.
  const from = moreOf(usePathname());
  const grid = !!from;
  return (
    // In the site's centred frame, lined up with the page below it.
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(64*var(--u))]">
      {from ? (
        // The arrow leads the line, so "← Projects" starts where the name does on other pages.
        <h1 className="fw-name">
          <PageTitleLink href={from.href} dir="back" vtName={titleMorph(from)} inline>
            {from.label}
          </PageTitleLink>
        </h1>
      ) : (
        <Link href="/" aria-label="Eric Nguyen, home">
          <ChromeName className="fw-name" />
        </Link>
      )}
      {grid ? (
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
      ) : (
        <PageTabs layout="row" />
      )}
    </header>
  );
}
