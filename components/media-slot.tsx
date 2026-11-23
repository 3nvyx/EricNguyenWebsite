"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Project } from "@/lib/projects";
import { SlapSplash } from "@/components/slap-splash";
import { LoopingVideo, MediaImage, posterOf, videoOf } from "@/components/media-image";
import { cn } from "@/lib/utils";

// three.js only loads on pages that show the card.
const NfcCard3D = dynamic(() => import("@/components/nfc-card-3d").then((m) => m.NfcCard3D), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-faint/75" />,
});

export { posterOf };

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
      <LoopingVideo src={project.media} poster={posterOf(project.media)} label={project.line} className="h-full w-full object-cover" />
    );
  }

  if (video) {
    return (
      <div className="relative h-full w-full">
        <MediaImage src={posterOf(project.media)} alt={project.line} label={label} eager />
        {playing && <PlayingVideo src={project.media} />}
      </div>
    );
  }

  if (playing === undefined || !project.media.endsWith(".gif")) {
    return <MediaImage src={project.media} alt={project.line} label={label} eager />;
  }

  return (
    <div className="relative h-full w-full">
      <MediaImage src={posterOf(project.media)} alt={project.line} label={label} eager />
      {/* The gif's video twin: a tenth of the download, which matters on a phone. */}
      {playing && <PlayingVideo src={videoOf(project.media)} fallback={project.media} />}
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

/**
 * Like PlayingGif, for a video: from the start on each play, looping, faded in when it can play.
 * `fallback`: the gif to play instead if the video can't be loaded.
 */
function PlayingVideo({ src, fallback }: { src: string; fallback?: string }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // No video for it, or the phone won't autoplay one: the gif plays by itself. Without a
  // fallback, the still underneath simply stays.
  if (failed) return fallback ? <PlayingGif src={fallback} /> : null;
  return (
    <LoopingVideo
      src={src}
      onPlaying={() => setReady(true)}
      onFail={() => setFailed(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
        ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
