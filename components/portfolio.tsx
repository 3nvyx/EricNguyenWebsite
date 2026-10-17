"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HERO, LINKS, PROJECTS } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ease = [0.22, 1, 0.36, 1] as const;

export function Portfolio() {
  const [active, setActive] = useState(HERO);
  const others = PROJECTS.filter((p) => p.slug !== HERO.slug);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pt-5 pb-6 md:px-6 md:pt-7 md:pb-8">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease }}
        className="font-display text-[22px] font-thin leading-none tracking-wide md:text-[26px]"
      >
        Eric Nguyen
      </motion.h1>

      <motion.a
        href={active.href}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
        onMouseLeave={() => setActive(HERO)}
        className="relative my-6 block aspect-video w-full overflow-hidden md:my-7"
        aria-label={`${active.title}: ${active.line}`}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={active.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="absolute inset-0"
          >
            <MediaSlot project={active} />
          </motion.div>
        </AnimatePresence>
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.4 }}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease }}
            >
              <a
                href={active.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-4xl font-thin leading-none md:text-5xl"
              >
                {active.title}
              </a>
              <p className="mt-2 text-[13px] text-mute">{active.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] md:flex-col md:items-end md:gap-y-0.5 md:leading-relaxed">
          {others.map((p) => (
            <li key={p.slug}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setActive(p)}
                    onFocus={() => setActive(p)}
                    onMouseLeave={() => setActive(HERO)}
                    onBlur={() => setActive(HERO)}
                    className="text-mute transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
                  >
                    {p.title}
                  </a>
                </TooltipTrigger>
                <TooltipContent side="left">{p.line}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.6 }}
        className="mt-auto flex gap-6 pt-10 text-xs text-faint"
        aria-label="Contact"
      >
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-ink"
          >
            {l.label}
          </a>
        ))}
      </motion.nav>
    </main>
  );
}
