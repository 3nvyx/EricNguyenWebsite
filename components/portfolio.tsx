"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/projects";
import { FEATURED } from "@/lib/featured";
import { MediaSlot } from "@/components/media-slot";
import { cardHover, useHoverPlay } from "@/components/project-card";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { SlideLink, useMountedInSlide } from "@/components/slide-link";
import { cn, ease, hoverLink as hover, morph, pageMain } from "@/lib/utils";

/**
 * One home card: the cover, the title and one line. Like the projects page, its gif plays only
 * on hover. Going to the grid, the cover blurs, glides to its card there and sharpens (morph).
 */
function FeaturedProject({ project: p, index: i }: { project: Project; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  const inSlide = useMountedInSlide();
  const cover = morph(`project-${p.slug}`, "vt-card");

  return (
    <motion.div
      initial={inSlide ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.08 }}
    >
      <Link ref={ref} href={`/projects/${p.slug}`} {...handlers} className={cn("group block", cardHover)}>
        <div className={cn("aspect-video w-full overflow-hidden", cover.className)} style={cover.style}>
          <MediaSlot project={p} playing={playing} />
        </div>
        <p className={cn("fw-title mt-[calc(14*var(--u))]", hover, "group-hover:underline")}>{p.title}</p>
        <p className="fw-text text-mute">{p.line}</p>
      </Link>
    </motion.div>
  );
}

/**
 * The arrow after "See all projects". Once the link scrolls into view it hops forward twice,
 * rests, and repeats, so the way onward is easy to spot. Still for reduced-motion users.
 */
function NudgeArrow() {
  const still = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="ml-[calc(8*var(--u))] inline-block"
      whileInView={still ? undefined : { x: [0, 6, 0, 4, 0] }}
      transition={{ duration: 0.9, ease: "easeOut", repeat: Infinity, repeatDelay: 1.4 }}
    >
      →
    </motion.span>
  );
}

// Measurements below are design pixels at 1440 wide, written as calc(N*var(--u)) (see globals.css).
export function Portfolio() {
  const inSlide = useMountedInSlide();
  return (
    <main className={pageMain}>
      <PageTitle>
        <PageTitleLink href="/projects" dir="forward" vtName="projects-title">
          Projects
        </PageTitleLink>
      </PageTitle>
      <section id="work" className="scroll-mt-10">
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
          <SlideLink href="/projects" dir="forward" className={cn("group inline-flex items-baseline", hover)}>
            SEE ALL PROJECTS
            <NudgeArrow />
          </SlideLink>
        </motion.p>
      </section>
    </main>
  );
}
