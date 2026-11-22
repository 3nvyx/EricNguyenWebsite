"use client";

import type { Project } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { useHoverPlay } from "@/components/project-card";

/**
 * A preview of a project's recap video, for the About page: its cover still, which plays the
 * project's short clip while hovered or focused (on touch screens, while it's in view), like a
 * project's card. The whole tile opens the full video (the project's `href`) in a new tab.
 */
export function RecapPreview({ project }: { project: Project }) {
  const { ref, playing, handlers } = useHoverPlay<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      {...handlers}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <span className="relative block aspect-video w-full overflow-hidden">
        <MediaSlot project={project} playing={playing} />
        {/* Says it's a video, and that the tile plays it. */}
        <span
          aria-hidden
          className="fw-small absolute bottom-[calc(8*var(--u))] left-[calc(8*var(--u))] bg-ink px-[calc(8*var(--u))] py-[calc(2*var(--u))] text-bone uppercase tracking-[0.08em]"
        >
          ▶ Watch
        </span>
      </span>
      <span className="fw-small mt-[calc(8*var(--u))] block text-mute transition-colors duration-200 group-hover:text-ink">
        {project.title}, the recap
        <span className="ml-0.5 align-top text-[0.75em]">↗</span>
      </span>
    </a>
  );
}
