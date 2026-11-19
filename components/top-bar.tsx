"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChromeName } from "@/components/chrome-name";
import { PageTabs } from "@/components/page-tabs";
import { PageTitleLink } from "@/components/page-title";

/**
 * For pages without the sidebar: the name (home) on the left, the page tabs on the right, at the
 * same height as the sidebar pages' tops so the title glides straight across. On the
 * projects grid the left spot holds the page's title instead, back to home: coming from home,
 * the "Projects" title glides here as the sidebar leaves (see SlideLink).
 */
export function TopBar() {
  const grid = usePathname() === "/projects";
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 md:px-[calc(45*var(--u))] md:pt-[calc(64*var(--u))]">
      {grid ? (
        // The arrow leads the line, so "← Projects" starts where the name does on other pages.
        <h1 className="fw-name">
          <PageTitleLink href="/" dir="back" vtName="projects-title" inline>
            Projects
          </PageTitleLink>
        </h1>
      ) : (
        <Link href="/" aria-label="Eric Nguyen, home">
          <ChromeName className="fw-name" />
        </Link>
      )}
      <PageTabs layout="row" />
    </header>
  );
}
