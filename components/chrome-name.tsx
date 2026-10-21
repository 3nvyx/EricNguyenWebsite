"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The name set in brushed metal: a dark gradient clipped to the glyphs, an SVG specular bevel
 * (applied through CSS `filter`), and a reflection that sits where the pointer is. The light
 * follows the pointer anywhere on the page, so the metal catches it as the mouse passes.
 */
export function ChromeName({ className }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { band, fade } = usePointerLight(ref);

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={cn("chrome-name font-display font-medium tracking-tight", className)}
    >
      <span className="chrome-base">Eric Nguyen</span>
      <motion.span aria-hidden="true" className="chrome-light" style={{ backgroundImage: band, opacity: fade }}>
        Eric Nguyen
      </motion.span>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <filter id="chrome-bevel" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="2.5"
              specularConstant="0.55"
              specularExponent="30"
              lightingColor="#ffffff"
              result="spec"
            >
              <fePointLight x="-120" y="-220" z="260" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
            <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.4" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>
      </svg>
    </motion.p>
  );
}

// The shine is full strength with the pointer on the letters and gone FAR px outside them, so
// it doesn't catch from the email line just below.
const NEAR = 0;
const FAR = 10;
// The line box is taller than the glyphs; ignore this share of its height at top and bottom.
const TRIM = 0.18;

/**
 * A diagonal band of light that follows the pointer across `ref`. It only shows while the
 * pointer is on the element, with a short fade just outside its edges.
 */
function usePointerLight(ref: React.RefObject<HTMLElement | null>) {
  const x = useMotionValue(-400);
  const near = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 28, mass: 0.4 });
  const fade = useSpring(near, { stiffness: 180, damping: 30 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      x.set(e.clientX - r.left);
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const trim = r.height * TRIM;
      const dy = Math.max(r.top + trim - e.clientY, 0, e.clientY - (r.bottom - trim));
      const d = Math.hypot(dx, dy);
      near.set(Math.min(1, Math.max(0, (FAR - d) / (FAR - NEAR))));
    };
    const onLeave = () => near.set(0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, x, near]);

  // A brushed-metal highlight that slides along the metal with the pointer.
  const band = useMotionTemplate`linear-gradient(112deg, transparent calc(${sx}px - 22px), rgba(255,255,255,0.85) ${sx}px, transparent calc(${sx}px + 22px))`;
  return { band, fade };
}
