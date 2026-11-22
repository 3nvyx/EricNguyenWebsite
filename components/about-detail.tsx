import Link from "next/link";
import { ABOUT, ABOUT_LEAD, ABOUT_STORY } from "@/lib/about";
import { sectionId } from "@/lib/content";
import { PROJECTS_GRID } from "@/lib/pages";
import { LINKS } from "@/lib/projects";
import { AboutSectionBlock, GroupItems, groupsMorph, photoMorph, summaryMorph } from "@/components/about-sections";
import { CoffeeChat } from "@/components/coffee-chat";
import { OnThisPage } from "@/components/on-this-page";
import { SlideLink } from "@/components/slide-link";
import { cn, hoverLink } from "@/lib/utils";

const RESUME = LINKS.find((l) => l.label === "Resume");
// The first paragraph is the statement; the last is the invitation, with the coffee chat's own
// link right after it.
const STATEMENT = ABOUT_STORY[0];
const STORY = ABOUT_STORY.slice(1, -1);
const INVITE = ABOUT_STORY.at(-1);

// The skills are the strip of facts; every other section follows the story, one after another.
const GROUPS = ABOUT.filter((s) => s.groups);
const SECTIONS = ABOUT.filter((s) => !s.groups);
/** "EXPERIENCE" as "Experience", for the rail. */
const title = (label: string) => label.charAt(0) + label.slice(1).toLowerCase();
const ON_THIS_PAGE = [{ id: "story", label: "Story" }, ...SECTIONS.map((s) => ({ id: sectionId(s.label), label: title(s.label) }))];

const photo = photoMorph("more");
const summary = summaryMorph("more");

/**
 * The full About, laid out like a project's page (components/project-detail.tsx): the label
 * line, the portrait as the cover, the name, the one line about Eric, the skills as the strip of
 * facts, the statement set large, then the story and each section (experience, leadership,
 * awards) down one centred column, with the sections listed in the right rail. The way back to
 * home is "← About" at the top left (components/top-bar.tsx).
 *
 * The cover, the line and the skills are the same three blocks as home's About preview: sliding
 * between the two, each glides to its place here (see components/about-sections.tsx).
 */
export function AboutDetail() {
  return (
    <div
      className={cn(
        "px-5 pt-8 pb-24 md:px-[var(--edge)] md:pt-[calc(45*var(--u))] md:pb-[calc(120*var(--u))]",
        // In the site's centred frame, like every page: the article between two narrow rails.
        "md:mx-auto md:max-w-[var(--frame)]",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,calc(640*var(--u)))_minmax(0,1fr)] lg:gap-x-[calc(45*var(--u))]",
      )}
    >
      {/* Left rail: empty, holding the article in the centre column. */}
      <div aria-hidden className="hidden lg:block" />

      <main>
        <p className="fw-label flex justify-between gap-6">
          <span className="uppercase">My story</span>
          <span className="text-mute">Product engineer</span>
        </p>

        {/* 3:2, not a project's 16:9: wide enough to read as a cover, tall enough for head and shoulders. */}
        <div {...photo.attrs} style={photo.style} className={cn("aspect-[3/2] w-full overflow-hidden", photo.className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/eric-portrait.jpg"
            alt="Eric Nguyen"
            width={800}
            height={1201}
            className="size-full object-cover object-[50%_27%]"
          />
        </div>

        <h2 className="fw-name mt-[calc(36*var(--u))]">Eric Nguyen</h2>
        <p {...summary.attrs} style={summary.style} className={cn("fw-text w-fit text-mute", summary.className)}>
          {ABOUT_LEAD}
        </p>

        {/* The skills, where a project's facts go: each group's name over its items. */}
        {GROUPS.map((section) => {
          const m = groupsMorph(section, "more");
          return (
            <dl
              key={section.label}
              aria-label={title(section.label)}
              {...m.attrs}
              style={m.style}
              className={cn(
                "mt-[calc(36*var(--u))] grid grid-cols-2 gap-x-[calc(27*var(--u))] gap-y-[calc(18*var(--u))] border-b border-ink/45 pb-[calc(27*var(--u))] md:grid-cols-3",
                m.className,
              )}
            >
              {section.entries.map((e) => (
                <div key={e.when}>
                  <dt className="fw-small uppercase text-mute">{e.when}</dt>
                  <dd className="mt-[calc(4*var(--u))]">
                    <GroupItems items={e.title} whole={false} className="leading-[1.6]" />
                  </dd>
                </div>
              ))}
            </dl>
          );
        })}

        <p id="story" className="fw-name mt-[calc(45*var(--u))] scroll-mt-[calc(36*var(--u))] text-pretty leading-[1.35]">
          {STATEMENT}
        </p>
        <div className="fw-text mt-[calc(27*var(--u))] space-y-[calc(16*var(--u))]">
          {STORY.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {INVITE && (
            <p>
              {INVITE} <CoffeeChat className="underline underline-offset-4">Pick a time</CoffeeChat>
            </p>
          )}
        </div>

        {SECTIONS.map((section) => (
          // The label's top padding and the scroll margin match a project's section headings.
          <div key={section.label} id={sectionId(section.label)} className="scroll-mt-[calc(36*var(--u))] pt-[calc(52*var(--u))]">
            <AboutSectionBlock section={section} stacked />
          </div>
        ))}

        <nav
          aria-label="More"
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
      </main>

      {/* Right rail: the page's sections. */}
      <aside className="hidden lg:sticky lg:top-[calc(64*var(--u))] lg:block lg:self-start">
        <OnThisPage sections={ON_THIS_PAGE} />
      </aside>
    </div>
  );
}
