"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** A gif's or video's still, saved beside it as `<name>.poster.jpg`. */
export const posterOf = (media: string) => media.replace(/\.(gif|mp4)$/, ".poster.jpg");

/**
 * A gif's video twin, saved beside it as `<name>.mp4`: the same clip at about a tenth of the
 * size (a 5.7 MB gif is under 1 MB), which is what phones on mobile data should get. Make one
 * with: ffmpeg -i x.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 27 -an x.mp4
 */
export const videoOf = (gif: string) => gif.replace(/\.gif$/, ".mp4");

/**
 * A silent, looping clip that plays itself, the way a gif does. Browsers only promise to
 * autoplay a muted inline video, and phones are strict about it, so it's muted and started by
 * hand: React sets `muted` too late for Safari to count it, and iPhones in Low Power Mode refuse
 * to autoplay at all. `onFail` is called when the phone won't play it or the file can't be
 * loaded (even if that happened before React was listening), so the caller can show something
 * else; `onPlaying` once it's moving.
 */
export function LoopingVideo({
  src,
  poster,
  label,
  className,
  onFail,
  onPlaying,
}: {
  src: string;
  poster?: string;
  /** What it shows, for screen readers; leave out for a clip that only decorates. */
  label?: string;
  className?: string;
  onFail?: () => void;
  onPlaying?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const fail = useRef(onFail);
  useEffect(() => {
    fail.current = onFail;
  }, [onFail]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    if (el.error || el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return fail.current?.();
    // Refused (NotAllowedError) is a failure; cut short because it left the page is not.
    el.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "NotAllowedError") fail.current?.();
    });
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onError={() => fail.current?.()}
      onPlaying={onPlaying}
      className={className}
    />
  );
}

/**
 * An image that shows a dashed placeholder with `label` while the file doesn't exist yet,
 * so pages can reference media before it's recorded. Fills its parent. A gif plays as its video
 * twin (videoOf), looping and silent like the gif, and falls back to the gif itself if there's
 * no video for it or the phone won't autoplay one.
 *
 * `eager`: load it straight away. For covers, which page slides take a picture of the moment
 * they arrive; other images (a write-up's figures) wait until they're near the screen.
 */
export function MediaImage({
  src,
  alt,
  label,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
  eager?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  const [noVideo, setNoVideo] = useState(false);

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

  if (src.endsWith(".gif") && !noVideo) {
    return (
      <LoopingVideo
        src={videoOf(src)}
        poster={posterOf(src)}
        label={alt}
        onFail={() => setNoVideo(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={checkLoaded}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? undefined : "async"}
      onError={() => setMissing(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
