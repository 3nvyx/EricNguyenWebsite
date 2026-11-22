"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { SlideLink, useSlideDir, useSlideOrigin } from "@/components/slide-link";
import { isFeatured } from "@/lib/featured";
import { cn, hoverLink, morph, projectPiece } from "@/lib/utils";

/** The soft background a project card takes while hovered or focused. */
export const cardHover = cn(
  "-m-[calc(12*var(--u))] p-[calc(12*var(--u))] transition-colors duration-200",
  "hover:bg-faint/30 focus-within:bg-faint/30",
);

/**
 * Makes a card as tall as its grid row, so every card in a row (and its hover background) is the
 * same height. Its wrappers take h-full; the card adds back the 12px bleed cardHover gives it on
 * each side.
 */
export const cardFill = "h-[calc(100%+24*var(--u))]";

/**
 * Whether a card's gif should play: while it's hovered or something in it has focus, or, on
 * touch screens that can't hover, while it's mostly in view. Spread `handlers` on the card.
 */
export function useHoverPlay<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setActive(true),
    onPointerLeave: () => setActive(false),
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
  };

  return { ref, playing: active || inView, handlers };
}

// Each card enters as a block in two beats: it fades in a little out of place (scattered off to
// the left, the way the page sweeps in), then glides into its slot in grid order. No blur or grey.
const STAGGER = 0.045; // seconds between cards
const MAX_STAGGERED = 12;
const GLIDE = [0.32, 0.72, 0, 1] as const;

/** Where card `i` starts before it glides into order. Fixed per card, so it never jitters. */
function scatter(i: number) {
  return {
    opacity: 0,
    x: `${-(18 + (i % 3) * 10)}%`,
    y: `${(((i * 37) % 5) - 2) * 7}%`,
    rotate: (((i * 53) % 7) - 3) * 1.1,
    scale: 0.94,
  };
}

const SETTLED = { opacity: 1, x: "0%", y: "0%", rotate: 0, scale: 1 };

/** Runs the two beats; returns what to pass to the card's motion.div. */
function useBlockEntrance(index: number, glides: boolean) {
  const controls = useAnimationControls();
  const still = useReducedMotion();

  useEffect(() => {
    // The server always renders the scattered start, so reduced motion settles it here rather
    // than skipping `initial` (which would leave the server's hidden styles in place).
    // A featured card arriving from home: its cover glides here in the page transition, so it
    // starts in place. (Only on a client navigation, so this can't differ from server HTML.)
    if (still || glides) {
      controls.set(SETTLED);
      return;
    }
    let live = true;
    const delay = Math.min(index, MAX_STAGGERED) * STAGGER;
    (async () => {
      await controls.start({ opacity: 1, transition: { duration: 0.25, delay } });
      if (!live) return;
      await controls.start({ x: "0%", y: "0%", rotate: 0, scale: 1, transition: { duration: 0.7, ease: GLIDE } });
    })();
    return () => {
      live = false;
      controls.stop();
    };
  }, [controls, index, still, glides]);

  return { controls, initial: glides ? false : scatter(index) };
}

/**
 * A card on the projects page. Its gif holds on a still and plays only while hovered. `index` is
 * its place in the grid, for the order the cards glide in.
 */
export function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  // Only a slide from home has a cover to glide from ("See more →" also comes from other pages).
  const glides = useSlideOrigin() === "/" && isFeatured(p.slug);
  // Coming back from a project page, the grid is simply there (that card's pieces fly home).
  const fromProject = useSlideDir() === "close";
  const settled = glides || fromProject;
  const { controls, initial } = useBlockEntrance(index, settled);
  // Only home's covers have a twin to glide from. Named, the others would be lifted out of their
  // card for the transition and held where their entrance starts.
  const cover = isFeatured(p.slug) ? morph(`project-${p.slug}`, "vt-card") : undefined;

  return (
    <motion.div initial={initial} animate={controls} className="h-full">
      {/* Opening the project, each piece marked with projectPiece travels to its spot on the page. */}
      <SlideLink
        ref={ref}
        href={`/projects/${p.slug}`}
        dir="open"
        morph={p.slug}
        {...handlers}
        className={cn("group block", cardHover, cardFill)}
      >
        {/* One line, so every cover in a row starts level: the title shortens, the date doesn't. */}
        <p className="fw-label flex justify-between gap-6">
          <span {...projectPiece(p.slug, "name")} title={p.title} className="min-w-0 truncate uppercase">{p.title}</span>
          <span {...projectPiece(p.slug, "dates")} className="shrink-0 whitespace-nowrap text-mute">{p.dates}</span>
        </p>
        {/* morph: coming from home, a featured cover glides here from its spot there. */}
        <div {...projectPiece(p.slug, "cover")} className={cn("aspect-video w-full overflow-hidden", cover?.className)} style={cover?.style}>
          <MediaSlot project={p} playing={playing} />
        </div>
        {/* One line: a title longer than the card ends in an ellipsis (the full one on hover). */}
        {/* The pieces of text hug their words (w-fit), so each one scales to its twin's size. */}
        <p className="mt-[calc(14*var(--u))] flex">
          <span {...projectPiece(p.slug, "title")} title={p.title} className={cn("fw-title min-w-0 truncate", hoverLink, "group-hover:underline")}>
            {p.title}
          </span>
        </p>
        <p {...projectPiece(p.slug, "tags")} className="fw-text w-fit max-w-full text-mute">
          {p.tags.map((t) => `#${t}`).join("  ")}
        </p>
        <p {...projectPiece(p.slug, "line")} className="fw-text mt-[calc(10*var(--u))] w-fit max-w-full">{p.line}</p>
      </SlideLink>
    </motion.div>
  );
}
