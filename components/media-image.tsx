"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that shows a dashed placeholder with `label` while the file doesn't exist yet,
 * so pages can reference media before it's recorded. Fills its parent.
 */
export function MediaImage({ src, alt, label, className }: { src: string; alt: string; label: string; className?: string }) {
  const [missing, setMissing] = useState(false);

  // A server-rendered <img> can fail before React attaches onError, so also check when it mounts.
  const checkLoaded = (el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth === 0) setMissing(true);
  };

  if (missing) {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-faint text-xs text-mute">
        {label}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={checkLoaded}
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
