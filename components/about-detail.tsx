import Link from "next/link";
import { ABOUT, ABOUT_LEAD, ABOUT_STATEMENT, ABOUT_STORY, FEATURED_ABOUT } from "@/lib/about";
import { sectionId } from "@/lib/content";
import { PROJECTS_GRID } from "@/lib/pages";
import { LINKS } from "@/lib/projects";
import { AboutPreview, AboutSectionBlock } from "@/components/about-sections";
import { OnThisPage } from "@/components/on-this-page";
import { Prose } from "@/components/prose";
import { SlideLink } from "@/components/slide-link";
import { cn, hoverLink } from "@/lib/utils";

const RESUME = LINKS.find((l) => l.label === "Resume");

// The featured sections (the skills) are in the block at the top; the rest follow the story.
const SECTIONS = ABOUT.filter((s) => !s.featured);
/** "EXPERIENCE" as "Experience", for the rail. */
const title = (label: string) => label.charAt(0) + label.slice(1).toLowerCase();
const ON_THIS_PAGE = [{ id: "story", label: "Story" }, ...SECTIONS.map((s) => ({ id: sectionId(s.label), label: title(s.label) }))];

/**
 * The full About: home's About preview carried on down the page. The portrait is alone on the
 * left; everything else runs down one column on its right, on the same edges and at the same
 * sizes: the lead line and the skills (those three are AboutPreview in
 * components/about-sections.tsx, each gliding here from its place on home), then, as on a
 * project's page (components/project-detail.tsx), the label line, the statement, the story with
 * its photos, each section (experience, leadership, awards) and the ways on at the foot. The
 * sections are listed in a rail on the far right. The way back to home is "← About" at the top
 * left (components/top-bar.tsx).
 *
 * Below xl the block is home's narrower arrangement (the photo beside the lead, the skills under
 * both) and the story follows under it; there is no rail.
 */
export function AboutDetail() {
  return (
    <main
      className={cn(
        "px-5 pt-8 pb-24 md:px-[var(--edge)] md:pt-[calc(45*var(--u))] md:pb-[calc(120*var(--u))]",
        // In the site's centred frame, like every page.
        "md:mx-auto md:max-w-[var(--frame)]",
        // The block at home's own width (869 design pixels: see AboutPreview), then the rail.
        "xl:grid xl:grid-cols-[calc(869*var(--u))_minmax(0,1fr)] xl:gap-x-[calc(45*var(--u))]",
      )}
    >
      <AboutPreview lead={ABOUT_LEAD} sections={FEATURED_ABOUT} on="more">
        {/* Under the skills, in their column. Below xl, a readable measure instead of the full width. */}
        <div className="mt-[calc(37*var(--u))] max-xl:max-w-[calc(640*var(--u))] xl:mt-[calc(42*var(--u))]">
          <p className="fw-label flex justify-between gap-6">
            <span className="uppercase">My story</span>
            <span className="text-mute">Product engineer</span>
          </p>

          {/* Set like the lead line above it, in the same column. */}
          <p
            id="story"
            className="scroll-mt-[calc(36*var(--u))] text-[calc(26*var(--u))] leading-[1.25] tracking-[-0.01em] text-pretty"
          >
            {ABOUT_STATEMENT}
          </p>
          <div className="mt-[calc(27*var(--u))]">
            <Prose blocks={ABOUT_STORY} headings="label" />
          </div>

          {SECTIONS.map((section) => (
            // The label's top padding and the scroll margin match a project's section headings.
            <div key={section.label} id={sectionId(section.label)} className="scroll-mt-[calc(36*var(--u))] pt-[calc(52*var(--u))]">
              <AboutSectionBlock section={section} stacked />
            </div>
          ))}

          <nav
            aria-label="Page navigation"
            className="fw-text mt-[calc(72*var(--u))] grid grid-cols-3 items-start gap-6 border-t border-ink/45 pt-[calc(27*var(--u))]"
          >
            <SlideLink href="/" dir="back" className="group flex flex-col">
              <span className="fw-small uppercase text-mute">← Back</span>
              <span className={cn("self-start", hoverLink, "group-hover:underline")}>Home</span>
            </SlideLink>
            {RESUME ? (
              <a
                href={RESUME.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("self-center justify-self-center", hoverLink)}
              >
                Resume<span className="ml-0.5 align-top text-[0.75em]">↗</span>
              </a>
            ) : (
              <span />
            )}
            <Link href={PROJECTS_GRID} className="group flex flex-col items-end text-right">
              <span className="fw-small uppercase text-mute">Next →</span>
              <span className={cn(hoverLink, "group-hover:underline")}>Projects</span>
            </Link>
          </nav>
        </div>
      </AboutPreview>

      {/* Far right: the page's sections. */}
      <aside className="hidden xl:sticky xl:top-[calc(64*var(--u))] xl:block xl:self-start">
        <OnThisPage sections={ON_THIS_PAGE} />
      </aside>
    </main>
  );
}
