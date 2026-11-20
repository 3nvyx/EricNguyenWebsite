"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The arrow after "See all projects" and "See more about me". Once the link scrolls into view it
 * hops forward twice, rests, and repeats, so the way onward is easy to spot. Still for
 * reduced-motion users.
 */
export function NudgeArrow() {
  const still = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="ml-[calc(8*var(--u))] inline-block"
      whileInView={still ? undefined : { x: [0, 6, 0, 4, 0] }}
      transition={{ duration: 0.9, ease: "easeOut", repeat: Infinity, repeatDelay: 1.4 }}
    >
      →
    </motion.span>
  );
}
