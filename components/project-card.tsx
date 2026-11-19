"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { useMountedInSlide } from "@/components/slide-link";
import { isFeatured } from "@/lib/featured";
import { cn, hoverLink, morph } from "@/lib/utils";

/** The soft background a project card takes while hovered or focused. */
export const cardHover = cn(
  "-m-[calc(12*var(--u))] p-[calc(12*var(--u))] transition-colors duration-200",
  "hover:bg-faint/30 focus-within:bg-faint/30",
);

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

// Each card enters as a block in three beats: it fades in as a soft grey blur, a little out of
// place (scattered off to the left, the way the page sweeps in); it glides into its slot in grid
// order; and once its cover has loaded it sharpens into colour.
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
    filter: "blur(14px) grayscale(1)",
  };
}

const SETTLED = { opacity: 1, x: "0%", y: "0%", rotate: 0, scale: 1, filter: "none" };

/** Runs the three beats; returns what to pass to the card's motion.div. */
function useBlockEntrance(index: number, glides: boolean) {
  const ref = useRef<HTMLDivElement>(null);
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
    const el = ref.current;
    const img = el?.querySelector("img");
    // The 3D card and the SLAP! splash have no image to wait for.
    const loaded = new Promise<void>((done) => {
      if (!img || img.complete) return done();
      img.addEventListener("load", () => done(), { once: true });
      img.addEventListener("error", () => done(), { once: true });
    });
    let live = true;
    const delay = Math.min(index, MAX_STAGGERED) * STAGGER;
    (async () => {
      await controls.start({ opacity: 1, transition: { duration: 0.25, delay } });
      if (!live) return;
      await controls.start({ x: "0%", y: "0%", rotate: 0, scale: 1, transition: { duration: 0.7, ease: GLIDE } });
      await loaded;
      if (!live) return;
      await controls.start({ filter: "blur(0px) grayscale(0)", transition: { duration: 0.5, ease: GLIDE } });
      // Drop the filter entirely, so the card doesn't keep a filter layer for good.
      if (live) controls.set({ filter: "none" });
    })();
    return () => {
      live = false;
      controls.stop();
    };
  }, [controls, index, still, glides]);

  return { ref, controls, initial: glides ? false : scatter(index) };
}

/**
 * A card on the projects page. Its gif holds on a still and plays only while hovered. `index` is
 * its place in the grid, for the order the cards glide in.
 */
export function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  const glides = useMountedInSlide() && isFeatured(p.slug);
  const { ref: blockRef, controls, initial } = useBlockEntrance(index, glides);
  // Only home's covers have a twin to glide from. Named, the others would be lifted out of their
  // card for the transition and held where their entrance starts.
  const cover = isFeatured(p.slug) ? morph(`project-${p.slug}`, "vt-card") : undefined;

  return (
    <motion.div ref={blockRef} initial={initial} animate={controls}>
      <Link ref={ref} href={`/projects/${p.slug}`} {...handlers} className={cn("group block", cardHover)}>
        <p className="fw-label flex justify-between gap-6">
          <span className="uppercase">{p.title}</span>
          <span className="text-mute">{p.dates}</span>
        </p>
        {/* morph: coming from home, a featured cover blurs, glides here and sharpens. */}
        <div className={cn("aspect-video w-full overflow-hidden", cover?.className)} style={cover?.style}>
          <MediaSlot project={p} playing={playing} />
        </div>
        <p className={cn("fw-title mt-[calc(14*var(--u))] self-start", hoverLink, "group-hover:underline")}>
          {p.title}
        </p>
        <p className="fw-text text-mute">
          {p.tags.map((t) => `#${t}`).join("  ")}
        </p>
        <p className="fw-text mt-[calc(10*var(--u))]">{p.line}</p>
      </Link>
    </motion.div>
  );
}
