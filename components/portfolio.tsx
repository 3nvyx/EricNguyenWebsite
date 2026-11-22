"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FEATURED, type FeaturedProject as Featured } from "@/lib/featured";
import { SeeMoreButton } from "@/components/see-more-button";
import { CardBody, cardFill, cardHover, useHoverPlay } from "@/components/project-card";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { useMountedInSlide } from "@/components/slide-link";
import { cn, ease } from "@/lib/utils";
import { PROJECTS_GRID } from "@/lib/pages";

/**
 * One featured card: the same block as its card in the grid (CardBody), so going there it simply
 * glides into place. Hovering tints it like the grid's cards (cardHover) and plays its gif.
 */
function FeaturedProject({ project: p, index: i }: { project: Featured; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  const inSlide = useMountedInSlide();

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
        // data-vt-block: its pieces go, or stay, together (slideTo's pickMorphs).
        data-vt-block=""
        className={cn("group block", cardHover, cardFill, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink")}
      >
        <CardBody project={p} playing={playing} pair={PROJECTS_GRID} />
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
        <h3 className="fw-label">FEATURED WORK</h3>
        <div className="grid gap-x-[calc(27*var(--u))] gap-y-[calc(45*var(--u))] md:grid-cols-2">
          {FEATURED.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} index={i} />
          ))}
        </div>
        <motion.div
          initial={inSlide ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.45 }}
          className="mt-[calc(27*var(--u))]"
        >
          <SeeMoreButton href={PROJECTS_GRID}>See all projects</SeeMoreButton>
        </motion.div>
      </div>
    </>
  );
}
