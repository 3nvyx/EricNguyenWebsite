import Link from "next/link";
import type { Project } from "@/lib/projects";
import { PROJECTS } from "@/lib/projects";
import { PROJECT_DETAILS, type Fact } from "@/lib/project-details";
import { MediaSlot } from "@/components/media-slot";
import { Prose } from "@/components/prose";
import { cn, hoverLink } from "@/lib/utils";
import { sectionId } from "@/lib/content";
import { OnThisPage } from "@/components/on-this-page";

const arrow = <span className="ml-0.5 align-top text-[0.75em]">↗</span>;

/** Facts for projects without a write-up yet, from what the card already knows. */
function defaultFacts(p: Project): Fact[] {
  return [
    { label: "Duration", values: [p.dates] },
    { label: "Tools", values: p.stack.split(" / ") },
  ];
}

/**
 * One project's page: back link and dates on the label line, the cover, title, tagline and
 * tags, a strip of facts, an optional problem statement, then the write-up and prev / next.
 * Every project uses this; projects without a write-up show the header and facts only.
 */
export function ProjectDetail({ project }: { project: Project }) {
  const detail = PROJECT_DETAILS[project.slug];
  const facts = detail?.facts ?? defaultFacts(project);
  const i = PROJECTS.findIndex((p) => p.slug === project.slug);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  const sections = (detail?.body ?? [])
    .filter((b): b is { h: string } => typeof b === "object" && "h" in b)
    .map((b) => ({ id: sectionId(b.h), label: b.h }));

  return (
    <div
      className={cn(
        "px-5 pt-8 pb-24 md:px-[calc(45*var(--u))] md:pt-[calc(45*var(--u))] md:pb-[calc(120*var(--u))]",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,calc(855*var(--u)))_minmax(0,1fr)] lg:gap-x-[calc(45*var(--u))]",
      )}
    >
      {/* Left rail: the way back, kept in view. */}
      <aside className="mb-8 lg:sticky lg:top-[calc(64*var(--u))] lg:mb-0 lg:self-start">
        <Link href="/projects" className={cn("fw-nav", hoverLink)}>
          ← PROJECTS
        </Link>
      </aside>

      <main>
        <h2 className="fw-label flex justify-between gap-6">
          <span className="uppercase">{project.title}</span>
          <span className="text-mute">{project.dates}</span>
        </h2>

        <div className="w-full overflow-hidden" style={{ aspectRatio: project.aspect ?? "16 / 9" }}>
          <MediaSlot project={project} controls />
        </div>

        <h1 className="fw-name mt-[calc(36*var(--u))]">{project.title}</h1>
        <p className="fw-text text-mute">{project.line}</p>
        <p className="fw-text mt-[calc(4*var(--u))] flex flex-wrap gap-x-[calc(12*var(--u))] text-mute">
          {project.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </p>

        <dl className="mt-[calc(36*var(--u))] grid grid-cols-2 gap-x-[calc(27*var(--u))] gap-y-[calc(18*var(--u))] border-b border-ink/45 pb-[calc(27*var(--u))] md:grid-cols-[repeat(auto-fit,minmax(calc(130*var(--u)),1fr))]">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="fw-small uppercase text-mute">{f.label}</dt>
              <dd className="fw-text mt-[calc(4*var(--u))]">
                {f.values.map((v) => (
                  <span key={v} className="block">
                    {v}
                  </span>
                ))}
              </dd>
            </div>
          ))}
          <div>
            <dt className="fw-small uppercase text-mute">Link</dt>
            <dd className="fw-text mt-[calc(4*var(--u))]">
              {project.href ? (
                <a href={project.href} target="_blank" rel="noopener noreferrer" className={hoverLink}>
                  {project.href.includes("github.com")
                    ? "GitHub"
                    : project.href.includes("youtube.com")
                      ? "Recap video"
                      : "Live site"}
                  {arrow}
                </a>
              ) : (
                <span className="text-mute">Private</span>
              )}
            </dd>
          </div>
        </dl>

        {detail?.statement && (
          <p className="fw-name mt-[calc(45*var(--u))] text-pretty leading-[1.35]">
            {detail.statement}
          </p>
        )}

        {detail?.body && (
          <div className="mt-[calc(27*var(--u))]">
            <Prose blocks={detail.body} headings="label" />
          </div>
        )}

        <nav
          aria-label="More projects"
          className="fw-text mt-[calc(72*var(--u))] grid grid-cols-3 items-start gap-6 border-t border-ink/45 pt-[calc(27*var(--u))]"
        >
          <Link href={`/projects/${prev.slug}`} className="group flex flex-col">
            <span className="fw-small uppercase text-mute">← Previous</span>
            <span className={cn("self-start", hoverLink, "group-hover:underline")}>{prev.title}</span>
          </Link>
          <Link href="/projects" className={cn("self-center justify-self-center", hoverLink)}>
            All projects
          </Link>
          <Link href={`/projects/${next.slug}`} className="group flex flex-col items-end text-right">
            <span className="fw-small uppercase text-mute">Next →</span>
            <span className={cn(hoverLink, "group-hover:underline")}>{next.title}</span>
          </Link>
        </nav>
      </main>

      {/* Right rail: the write-up's sections. */}
      {sections.length > 0 && (
        <aside className="hidden lg:sticky lg:top-[calc(64*var(--u))] lg:block lg:self-start">
          <OnThisPage sections={sections} />
        </aside>
      )}
    </div>
  );
}
