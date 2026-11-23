"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { SlideLink, useSlideDir, useSlideOrigin } from "@/components/slide-link";
import { cardText, isFeatured } from "@/lib/featured";
import { cn, morph, projectPiece } from "@/lib/utils";

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

// Each card enters as a block in two beats: it fades in a little out of place (off to the right
// and a little high, the way the page sweeps in from the right on the way here), then falls into
// its slot in grid order. No blur or grey.
const STAGGER = 0.045; // seconds between cards
const MAX_STAGGERED = 12;
const GLIDE = [0.32, 0.72, 0, 1] as const;

/** Where card `i` starts before it glides into order. Fixed per card, so it never jitters. */
function scatter(i: number) {
  return {
    opacity: 0,
    x: `${14 + (i % 3) * 8}%`,
    y: `${-(6 + ((i * 37) % 4) * 4)}%`,
    rotate: (((i * 53) % 7) - 3) * 1.1,
    scale: 0.94,
  };
}

const SETTLED = { opacity: 1, x: "0%", y: "0%", rotate: 0, scale: 1 };

/** Runs the two beats; returns what to pass to the card's motion.div. */
function useBlockEntrance(index: number, glides: boolean) {
  const controls = useAnimationControls();
  const still = useReducedMotion();
  // Its place when it arrived. The grid's filter moves the cards that stay to new places; they
  // glide there (components/project-grid.tsx) and don't enter again.
  const order = useRef(index);

  useEffect(() => {
    // The server always renders the scattered start, so reduced motion settles it here rather
    // than skipping `initial` (which would leave the server's hidden styles in place).
    // A featured card arriving from home: it glides here in the page transition, so it starts
    // in place. (Only on a client navigation, so this can't differ from server HTML.)
    if (still || glides) {
      controls.set(SETTLED);
      return;
    }
    let live = true;
    const delay = Math.min(order.current, MAX_STAGGERED) * STAGGER;
    (async () => {
      await controls.start({ opacity: 1, transition: { duration: 0.25, delay } });
      if (!live) return;
      await controls.start({ x: "0%", y: "0%", rotate: 0, scale: 1, transition: { duration: 0.7, ease: GLIDE } });
    })();
    return () => {
      live = false;
      controls.stop();
    };
  }, [controls, still, glides]);

  return { controls, initial: glides ? false : scatter(index) };
}

/**
 * What's in a project's card, the same block on home's Projects section and in the grid: the
 * cover (with a star in its corner if the project is featured), the name with when it was
 * started over a hairline, and its one line (always there, so nothing moves on hover). The gif
 * plays while `playing`.
 *
 * `pair`: where this card's twin is (a featured card: home's is in the grid, the grid's on home).
 * Its pieces then travel to their twins' places during the slide between the two (morph), all on
 * one curve, so the card moves as one block: the cover scales, the words keep their size.
 * `pieces`: also mark them for the slide to the project's own page (the grid's cards).
 *
 * The words are set to the grid card's measure on both pages (from lg up, where the grid is three
 * across and home's cards are wider): the name, the date's column and the line each get the width
 * they have in the grid, so they wrap the same and are the same picture at both ends of the
 * slide. Nothing has to cross-fade into a different wrapping.
 */
// The grid card's width at lg and up: a third of the frame (1120) less its margins (2 × 45) and
// gaps (2 × 27), rounded down; the date's column; and what's left for the name beside it.
const TEXT_W = "lg:max-w-[calc(325*var(--u))]";
const DATE_W = "lg:w-[calc(70*var(--u))]";
const NAME_W = "lg:max-w-[calc(239*var(--u))]"; // 325 - the 16 gap - 70
export function CardBody({ project: p, playing, pair, pieces = false }: { project: Project; playing: boolean; pair?: string; pieces?: boolean }) {
  const { title, built } = cardText(p);
  const part = (name: string, kind: string) => (pair ? morph(`card-${p.slug}-${name}`, { kind, pair }) : undefined);
  const piece = (name: Parameters<typeof projectPiece>[1]) => (pieces ? projectPiece(p.slug, name) : {});
  const cover = part("cover", "vt-card-cover");
  const name = part("title", "vt-card-text");
  const date = part("date", "vt-card-text");
  const rule = part("rule", "vt-card-rule");
  const line = part("line", "vt-card-text");

  return (
    <>
      <div
        {...piece("cover")}
        {...cover?.attrs}
        style={cover?.style}
        className={cn("relative aspect-video w-full overflow-hidden", cover?.className)}
      >
        <div className="h-full w-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]">
          <MediaSlot project={p} playing={playing} />
        </div>
        {/* A featured project wears a star in its cover's corner, on home and in the grid alike
            (it's part of the cover, so the card is still the same block on both). */}
        {isFeatured(p.slug) && (
          <span
            title="Featured project"
            className="absolute top-[calc(8*var(--u))] left-[calc(8*var(--u))] flex size-[calc(26*var(--u))] items-center justify-center rounded-full bg-bone text-ink shadow-[0_1px_4px_rgb(17_17_17/0.25)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[calc(15*var(--u))]">
              <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" />
            </svg>
            <span className="sr-only">Featured project</span>
          </span>
        )}
      </div>
      {/* The name, then when it was started at the far right. The name wraps rather than cut off. */}
      <p className="mt-[calc(12*var(--u))] flex items-baseline justify-between gap-[calc(16*var(--u))]">
        <span
          {...piece("title")}
          {...name?.attrs}
          style={name?.style}
          title={p.title}
          className={cn("fw-title min-w-0 underline-offset-4 group-hover:underline", NAME_W, name?.className)}
        >
          {title}
        </span>
        <span
          {...piece("dates")}
          {...date?.attrs}
          style={date?.style}
          className={cn("fw-small shrink-0 whitespace-nowrap text-right uppercase tracking-[0.06em]", DATE_W, date?.className)}
        >
          {built}
        </span>
      </p>
      {/* The hairline, its own piece so it can stretch to the card's width as the card travels. */}
      <span aria-hidden {...rule?.attrs} style={rule?.style} className={cn("mt-[calc(6*var(--u))] block h-px bg-ink", rule?.className)} />
      {/* Hugs its words (w-fit), within the grid card's measure, so it's the same picture on both pages. */}
      <p
        {...piece("line")}
        {...line?.attrs}
        style={line?.style}
        className={cn("fw-text mt-[calc(6*var(--u))] w-fit max-w-full text-ink/70", TEXT_W, line?.className)}
      >
        {p.line}
      </p>
    </>
  );
}

/**
 * A card on the projects page. Its gif holds on a still and plays only while hovered. `index` is
 * its place in the grid, for the order the cards fall in.
 */
export function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  // Only a slide from home has a card to glide from ("See more →" also comes from other pages).
  const glides = useSlideOrigin() === "/" && isFeatured(p.slug);
  // Coming back from a project page, the grid is simply there (that card's pieces fly home).
  const fromProject = useSlideDir() === "close";
  const settled = glides || fromProject;
  const { controls, initial } = useBlockEntrance(index, settled);

  return (
    <motion.div initial={initial} animate={controls} className="h-full">
      {/* Opening the project, each piece marked with projectPiece travels to its spot on the page. */}
      <SlideLink
        ref={ref}
        href={`/projects/${p.slug}`}
        dir="open"
        morph={p.slug}
        {...handlers}
        // data-vt-block: its pieces go, or stay, together (slideTo's pickMorphs).
        data-vt-block=""
        className={cn("group block", cardHover, cardFill, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink")}
      >
        {/* Only home's featured cards have a twin: named, the others' pieces would be lifted out
            and held where their entrance starts. */}
        <CardBody project={p} playing={playing} pair={isFeatured(p.slug) ? "/#projects" : undefined} pieces />
      </SlideLink>
    </motion.div>
  );
}
