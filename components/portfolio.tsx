"use client";

import { motion } from "motion/react";
import { LINKS, PROJECTS } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { ChromeName } from "@/components/chrome-name";

const ease = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Resume", href: LINKS[1].href },
  { label: "Mail", href: LINKS[2].href },
];

const CORE = PROJECTS.slice(0, 3);
const MORE = PROJECTS.slice(3);

function external(href: string) {
  return href.startsWith("http") || href.endsWith(".pdf");
}

export function Portfolio() {
  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease }}
        className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-8 md:py-6"
        aria-label="Primary"
      >
        <ChromeName className="text-[18px] leading-none md:text-[22px]" />
        <ul className="flex gap-4 text-[13px] text-mute md:gap-7">
          {NAV.map((n) => (
            <li key={n.label}>
              <a
                href={n.href}
                target={external(n.href) ? "_blank" : undefined}
                rel={external(n.href) ? "noopener noreferrer" : undefined}
                className="underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>

      <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pt-24 pb-6 md:px-6 md:pt-28 md:pb-8">
        <motion.p
          id="about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="max-w-sm scroll-mt-24 text-[13px] leading-relaxed text-mute"
        >
          CS student at Orange Coast College. I build small devices and the software
          around them, and tools that make slow things fast.
        </motion.p>

        <section id="work" className="mt-10 flex scroll-mt-24 flex-col gap-6 md:mt-12 md:gap-5">
          {CORE.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.1 }}
              className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6"
            >
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video w-full shrink-0 overflow-hidden md:h-[clamp(7rem,calc((100dvh-20rem)/3),12rem)] md:w-auto"
                aria-label={`${p.title}: ${p.line}`}
              >
                <MediaSlot project={p} />
              </a>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-6 md:flex-col md:items-start md:gap-1.5">
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-2xl font-medium leading-none tracking-tight md:text-[26px]"
                >
                  {p.title}
                </a>
                <p className="text-right text-[13px] text-mute md:text-left">{p.line}</p>
              </div>
            </motion.article>
          ))}
        </section>

        {MORE.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.6 }}
            className="mt-8 flex gap-5 text-[13px] text-mute md:mt-10"
          >
            {MORE.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.line}
                  className="underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </motion.ul>
        )}

        <nav className="mt-auto flex gap-6 pt-10 text-xs text-faint" aria-label="Contact">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </main>
    </>
  );
}
