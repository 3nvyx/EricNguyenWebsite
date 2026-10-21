"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { cn, hoverLink } from "@/lib/utils";

/**
 * A card on the projects page. Its gif holds on a still and plays while the card is hovered or
 * focused; on touch screens, which can't hover, it plays while the card is mostly in view.
 */
export function ProjectCard({ project: p }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/projects/${p.slug}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "group -m-[calc(12*var(--u))] block p-[calc(12*var(--u))] transition-colors duration-200",
        "hover:bg-faint/30 focus-visible:bg-faint/30",
      )}
    >
      <p className="fw-label flex justify-between gap-6">
        <span className="uppercase">{p.title}</span>
        <span className="text-mute">{p.dates}</span>
      </p>
      <div className="aspect-video w-full overflow-hidden">
        <MediaSlot project={p} playing={active || inView} />
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
