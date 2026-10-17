"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import { SlapSplash } from "@/components/slap-splash";

/** One media slot. Slap shows the device's own switch-on animation; the rest show a gif or a placeholder. */
export function MediaSlot({ project }: { project: Project }) {
  const [missing, setMissing] = useState(false);

  if (project.slug === "slap") {
    return (
      <div className="h-full w-full bg-ink p-[3%]">
        <SlapSplash className="h-full w-full object-contain" />
      </div>
    );
  }

  if (missing) {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-faint text-xs text-mute">
        {project.slug} — gif
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.media}
      alt={project.line}
      onError={() => setMissing(true)}
      className="h-full w-full object-cover"
    />
  );
}
