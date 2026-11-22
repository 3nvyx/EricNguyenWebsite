import type { Metadata } from "next";
import { ABOUT_BRIEF, FEATURED_ABOUT } from "@/lib/about";
import { cn, hoverLink, pageMain } from "@/lib/utils";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { AboutIntro, AboutSectionBlock } from "@/components/about-sections";
import { NudgeArrow } from "@/components/nudge-arrow";
import { SlideLink } from "@/components/slide-link";

export const metadata: Metadata = { title: "About" };

/**
 * A short preview: the photo beside a few lines on who Eric is, then the skills (the featured
 * sections in lib/about.ts). Like home and the projects grid, the title and "See more about me"
 * slide to the full page (/about/more): the whole intro and every section.
 */
export default function AboutPage() {
  return (
    <main className={pageMain}>
      <PageTitle>
        <PageTitleLink href="/about/more" dir="forward" vtName="about-title">
          About
        </PageTitleLink>
      </PageTitle>
      <div className="flex flex-col gap-[calc(45*var(--u))]">
        <AboutIntro paragraphs={ABOUT_BRIEF} lead />
        {FEATURED_ABOUT.map((section) => (
          <AboutSectionBlock key={section.label} section={section} />
        ))}
        <p className="fw-label">
          <SlideLink href="/about/more" dir="forward" className={cn("group inline-flex items-baseline", hoverLink)}>
            SEE MORE ABOUT ME
            <NudgeArrow />
          </SlideLink>
        </p>
      </div>
    </main>
  );
}
