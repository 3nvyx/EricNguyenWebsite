import { ABOUT_BRIEF, FEATURED_ABOUT } from "@/lib/about";
import { PAGES } from "@/lib/pages";
import { cn, hoverLink, pageMain } from "@/lib/utils";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { AboutIntro, AboutSectionBlock } from "@/components/about-sections";
import { Breakout } from "@/components/breakout";
import { NudgeArrow } from "@/components/nudge-arrow";
import { Portfolio } from "@/components/portfolio";
import { SectionSpy } from "@/components/sections";
import { SlideLink } from "@/components/slide-link";

const [ABOUT, PROJECTS, PLAY] = PAGES;

// A section's top stops this far below the screen's top when a tab glides to it (the page's own top padding).
const section = "scroll-mt-12 md:scroll-mt-[calc(64*var(--u))]";

/**
 * Home: one long page, About, Projects and Play one after another (their ids in lib/pages.ts).
 * The sidebar's tabs follow the scroll and glide to a section (components/sections.tsx); the
 * footer ends it.
 *
 * About is the short preview: the photo beside a few lines on who Eric is, then the skills (the
 * featured sections in lib/about.ts). Its title and "See more about me" slide to the full page
 * (/about/more), as Projects' slide to the grid (/projects/all).
 */
export default function Home() {
  return (
    <main className={cn(pageMain, "flex flex-col gap-[calc(150*var(--u))]")}>
      <section id={ABOUT.id} aria-label={ABOUT.label} className={section}>
        <PageTitle>
          <PageTitleLink href="/about/more" dir="forward" vtName="about-title">
            About
          </PageTitleLink>
        </PageTitle>
        <div className="flex flex-col gap-[calc(45*var(--u))]">
          <AboutIntro paragraphs={ABOUT_BRIEF} lead />
          {FEATURED_ABOUT.map((s) => (
            <AboutSectionBlock key={s.label} section={s} />
          ))}
          <p className="fw-label">
            <SlideLink href="/about/more" dir="forward" className={cn("group inline-flex items-baseline", hoverLink)}>
              SEE MORE ABOUT ME
              <NudgeArrow />
            </SlideLink>
          </p>
        </div>
      </section>

      <section id={PROJECTS.id} aria-label={PROJECTS.label} className={section}>
        <Portfolio />
      </section>

      <section id={PLAY.id} aria-label={PLAY.label} className={section}>
        <PageTitle as="h2">Play</PageTitle>
        <div className="max-w-[calc(720*var(--u))]">
          <Breakout />
        </div>
      </section>

      <SectionSpy />
    </main>
  );
}
