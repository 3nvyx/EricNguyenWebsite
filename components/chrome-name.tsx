"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The name set in brushed metal: a dark gradient clipped to the glyphs, an SVG specular bevel
 * (applied through CSS `filter`), and a reflection that sits where the pointer is. The light
 * follows the pointer anywhere on the page, so the metal catches it as the mouse passes.
 */
export function ChromeName({ className }: { className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 220, damping: 28, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  // The reflection: a diagonal band of light that slides along the word with the pointer,
  // like a brushed-metal highlight. It fades out as the pointer moves vertically away.
  const band = useMotionTemplate`linear-gradient(112deg, transparent calc(${sx}px - 70px), rgba(255,255,255,0.78) ${sx}px, transparent calc(${sx}px + 70px))`;
  const fade = useTransform(sy, [-260, -40, 60, 280], [0, 1, 1, 0]);

  return (
    <motion.h1
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
    </motion.h1>
  );
}
