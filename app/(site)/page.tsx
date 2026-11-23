import { ABOUT_LEAD, FEATURED_ABOUT } from "@/lib/about";
import { PAGES, PLAY_FULL } from "@/lib/pages";
import { cn, pageMain } from "@/lib/utils";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { AboutPreview } from "@/components/about-sections";
import { Breakout } from "@/components/breakout";
import { Portfolio } from "@/components/portfolio";
import { SectionSpy } from "@/components/sections";
import { SeeMoreButton } from "@/components/see-more-button";

const [ABOUT, PROJECTS, PLAY] = PAGES;

// A section's top stops this far below the screen's top when a tab glides to it (the page's own top padding).
// On phones that's below the pinned tabs (app/(site)/layout.tsx).
const section = "scroll-mt-16 md:scroll-mt-[calc(64*var(--u))]";

/**
 * Home: one long page, About, Projects and Play one after another (their ids in lib/pages.ts).
 * The sidebar's tabs follow the scroll and glide to a section (components/sections.tsx); the
 * footer ends it.
 *
 * About is the short preview: the portrait beside the one line on who Eric is, with the skills
 * (the featured sections in lib/about.ts) under that line, and "My story" centred below, all
 * short enough to show at once. Its title and "My story" slide to the full page (/about/more),
 * where the portrait, the summary and the skills each glide to their new places; Projects' slide
 * to the grid (/projects/all) the same way.
 */
export default function Home() {
  return (
    <main className={cn(pageMain, "flex flex-col gap-[calc(60*var(--u))]")}>
      <section id={ABOUT.id} aria-label={ABOUT.label} className={section}>
        <PageTitle>
          <PageTitleLink href="/about/more" dir="forward" vtName="about-title">
            About
          </PageTitleLink>
        </PageTitle>
        <div className="flex flex-col gap-[calc(27*var(--u))]">
          <AboutPreview lead={ABOUT_LEAD} sections={FEATURED_ABOUT} />
          <SeeMoreButton href="/about/more">My story</SeeMoreButton>
        </div>
      </section>

      <section id={PROJECTS.id} aria-label={PROJECTS.label} className={section}>
        <Portfolio />
      </section>

      <section id={PLAY.id} aria-label={PLAY.label} className={section}>
        <PageTitle as="h2">
          <PageTitleLink href={PLAY_FULL} dir="forward" vtName="play-title">
            Play
          </PageTitleLink>
        </PageTitle>
        <div className="flex flex-col gap-[calc(45*var(--u))]">
          <Breakout />
          <SeeMoreButton href={PLAY_FULL}>Play full size</SeeMoreButton>
        </div>
      </section>

      <SectionSpy />
    </main>
  );
}
