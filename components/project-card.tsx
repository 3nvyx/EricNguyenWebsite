"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { cn, hoverLink } from "@/lib/utils";

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

/** A card on the projects page. Its gif holds on a still and plays only while hovered. */
export function ProjectCard({ project: p }: { project: Project }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();

  return (
    <Link ref={ref} href={`/projects/${p.slug}`} {...handlers} className={cn("group block", cardHover)}>
      <p className="fw-label flex justify-between gap-6">
        <span className="uppercase">{p.title}</span>
        <span className="text-mute">{p.dates}</span>
      </p>
      <div className="aspect-video w-full overflow-hidden">
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
  );
}
