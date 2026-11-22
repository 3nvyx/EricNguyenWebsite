"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FEATURED, type FeaturedProject as Featured } from "@/lib/featured";
import { MediaSlot } from "@/components/media-slot";
import { NudgeArrow } from "@/components/nudge-arrow";
import { useHoverPlay } from "@/components/project-card";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { SlideLink, useMountedInSlide } from "@/components/slide-link";
import { cn, ease, hoverLink as hover, morph } from "@/lib/utils";
import { PROJECTS_GRID } from "@/lib/pages";

/**
 * One featured card: a dark box so the eye lands here first, a chip saying why it's featured
 * (lib/featured.ts), then the cover, a short title and one line. Like the projects page, its gif
 * plays only on hover. Going to the grid, the cover glides to its card there (morph).
 */
function FeaturedProject({ project: p, index: i }: { project: Featured; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  const inSlide = useMountedInSlide();
  const cover = morph(`project-${p.slug}`, "vt-card");

  return (
    <motion.div
      initial={inSlide ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.08 }}
      className="h-full"
    >
      <Link
        ref={ref}
        href={`/projects/${p.slug}`}
        {...handlers}
        className={cn(
          "group flex h-full flex-col rounded-[calc(14*var(--u))] bg-ink p-[calc(14*var(--u))] text-bone",
          "transition-transform duration-300 ease-out motion-safe:hover:-translate-y-[calc(3*var(--u))]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
        )}
      >
        <span className="fw-small mb-[calc(12*var(--u))] self-start rounded-full bg-bone px-[calc(10*var(--u))] py-[calc(3*var(--u))] font-medium uppercase tracking-[0.06em] text-ink">
          {p.tag}
        </span>
        <div className={cn("aspect-video w-full overflow-hidden rounded-[calc(6*var(--u))] ring-1 ring-bone/15", cover.className)} style={cover.style}>
          <MediaSlot project={p} playing={playing} />
        </div>
        {/* One line: a title longer than the card ends in an ellipsis (the full one on hover). */}
        <p title={p.title} className="fw-title mt-[calc(14*var(--u))] truncate underline-offset-4 group-hover:underline">
          {p.cardTitle}
        </p>
        <p className="fw-text text-bone/60">{p.line}</p>
      </Link>
    </motion.div>
  );
}

// Measurements below are design pixels at 1440 wide, written as calc(N*var(--u)) (see globals.css).
/** Home's Projects section: the four featured projects, with the way on to the full grid. */
export function Portfolio() {
  const inSlide = useMountedInSlide();
  return (
    <>
      <PageTitle as="h2">
        <PageTitleLink href={PROJECTS_GRID} dir="forward" vtName="projects-title">
          Projects
        </PageTitleLink>
      </PageTitle>
      <div>
        {/* Label over a hairline, like About's sections. The four are picked in lib/featured.ts. */}
        <h2 className="fw-label">FEATURED</h2>
        <div className="grid gap-x-[calc(27*var(--u))] gap-y-[calc(45*var(--u))] md:grid-cols-2">
          {FEATURED.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} index={i} />
          ))}
        </div>
        <motion.p
          initial={inSlide ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.45 }}
          className="fw-label mt-[calc(45*var(--u))]"
        >
          <SlideLink href={PROJECTS_GRID} dir="forward" className={cn("group inline-flex items-baseline", hover)}>
            SEE ALL PROJECTS
            <NudgeArrow />
          </SlideLink>
        </motion.p>
      </div>
    </>
  );
}
