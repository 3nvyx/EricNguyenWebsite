"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  SPLASH_FRAMES,
  SPLASH_FRAME_MS,
  SPLASH_HEIGHT,
  SPLASH_WIDTH,
} from "@/lib/slap-splash";

const INK = [17, 17, 17, 255];
const BONE = [244, 243, 240, 255];

/** Decode the "#" art into ImageData once per module. */
let decoded: ImageData[] | null = null;
function frames(): ImageData[] {
  if (decoded) return decoded;
  decoded = SPLASH_FRAMES.map((rows) => {
    const img = new ImageData(SPLASH_WIDTH, SPLASH_HEIGHT);
    for (let y = 0; y < SPLASH_HEIGHT; y++) {
      const row = rows[y];
      for (let x = 0; x < SPLASH_WIDTH; x++) {
        const lit = row[x] === "#";
        const px = lit ? BONE : INK;
        img.data.set(px, (y * SPLASH_WIDTH + x) * 4);
      }
    }
    return img;
  });
  return decoded;
}

/**
 * The device's switch-on animation on a 128 x 64 canvas, scaled up with crisp pixels.
 * Plays once on mount and again on hover or click; holds the last frame.
 */
export function SlapSplash({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playing = useRef(false);

  const draw = useCallback((i: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.putImageData(frames()[i], 0, 0);
  }, []);

  const play = useCallback(() => {
    if (playing.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      draw(SPLASH_FRAMES.length - 1);
      return;
    }
    playing.current = true;
    const step = (i: number) => {
      draw(i);
      if (i >= SPLASH_FRAMES.length - 1) {
        playing.current = false;
        return;
      }
      timer.current = setTimeout(() => step(i + 1), SPLASH_FRAME_MS[i]);
    };
    step(0);
  }, [draw]);

  useEffect(() => {
    play();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      playing.current = false;
    };
  }, [play]);

  return (
    <canvas
      ref={canvasRef}
      width={SPLASH_WIDTH}
      height={SPLASH_HEIGHT}
      onMouseEnter={play}
      onClick={play}
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-label="Slap switching on: the mascot gets slapped"
      role="img"
    />
  );
}
