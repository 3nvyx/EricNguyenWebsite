"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Project } from "@/lib/projects";
import { SlapSplash } from "@/components/slap-splash";
import { MediaImage } from "@/components/media-image";
import { cn } from "@/lib/utils";

// three.js only loads on pages that show the card.
const NfcCard3D = dynamic(() => import("@/components/nfc-card-3d").then((m) => m.NfcCard3D), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-faint/75" />,
});

/** A gif's or video's still, saved beside it as `<name>.poster.jpg`. */
export const posterOf = (media: string) => media.replace(/\.(gif|mp4)$/, ".poster.jpg");

/**
 * A project's cover. SLAP! shows the device's own switch-on animation, the NFC card is a 3D model
 * (with flip and layer controls when `controls`), and the rest show a gif, a video or a
 * placeholder. Pass `playing` to hold a gif or video on its poster until it's true; leave it out
 * to autoplay. Videos loop; at rest a card shows the video's poster (for ZAP!, the finished logo
 * from its name animation, which opens the reel).
 */
export function MediaSlot({
  project,
  controls = false,
  playing,
}: {
  project: Project;
  controls?: boolean;
  playing?: boolean;
}) {
  if (project.slug === "slap") {
    return (
      <div className="h-full w-full bg-ink p-[3%]">
        <SlapSplash className="h-full w-full object-contain" />
      </div>
    );
  }

  if (project.slug === "nfc-card") return <NfcCard3D controls={controls} />;

  const label = `${project.slug} — gif`;
  const video = project.media.endsWith(".mp4");

  if (video && playing === undefined) {
    return (
      <video
        src={project.media}
        poster={posterOf(project.media)}
        autoPlay
        loop
        muted
        playsInline
        aria-label={project.line}
        className="h-full w-full object-cover"
      />
    );
  }

  if (video) {
    return (
      <div className="relative h-full w-full">
        <MediaImage src={posterOf(project.media)} alt={project.line} label={label} />
        {playing && <PlayingVideo src={project.media} />}
      </div>
    );
  }

  if (playing === undefined || !project.media.endsWith(".gif")) {
    return <MediaImage src={project.media} alt={project.line} label={label} />;
  }

  return (
    <div className="relative h-full w-full">
      <MediaImage src={posterOf(project.media)} alt={project.line} label={label} />
      {playing && <PlayingGif src={project.media} />}
    </div>
  );
}

/** Mounted fresh on each play so the gif starts from its first frame; fades in once loaded. */
function PlayingGif({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
        loaded ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

/** Like PlayingGif, for a video: from the start on each play, looping, faded in when it can play. */
function PlayingVideo({ src }: { src: string }) {
  const [ready, setReady] = useState(false);
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      aria-hidden
      onPlaying={() => setReady(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
        ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
