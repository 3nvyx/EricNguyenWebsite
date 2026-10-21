"use client";

import { motion } from "motion/react";
import { PROJECTS } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { cn, ease, hoverLink as hover, pageMain } from "@/lib/utils";

const CORE = PROJECTS.slice(0, 3);
const MORE = PROJECTS.slice(3);

// Measurements below are design pixels at 1440 wide, written as calc(N*var(--u)) (see globals.css).
export function Portfolio() {
  return (
    <main className={pageMain}>
      <section id="work" className="flex scroll-mt-10 flex-col gap-[calc(45*var(--u))]">
        {CORE.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.1 }}
          >
            <h2 className="fw-label uppercase">{p.title}</h2>
            <div className="grid gap-5 md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[2/1] w-full self-start overflow-hidden"
                aria-label={`${p.title}: ${p.line}`}
              >
                <MediaSlot project={p} />
              </a>
              <div className="flex min-w-0 flex-col">
                <a href={p.href} target="_blank" rel="noopener noreferrer" className={cn("fw-title self-start", hover)}>
                  {p.title}
                </a>
                <div className="fw-text mt-[calc(45*var(--u))]">
                  <p>[{p.year}] {p.stack}</p>
                  <p className="mt-[calc(16*var(--u))]">{p.line}</p>
                </div>
              </div>
            </div>
          </motion.article>
        ))}

        {MORE.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
          >
            <h2 className="fw-label">MORE</h2>
            <ul className="fw-text">
              {MORE.map((p) => (
                <li key={p.slug} className="flex flex-wrap gap-x-[calc(27*var(--u))]">
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className={hover}>
                    {p.title}
                  </a>
                  <span className="text-mute">
                    [{p.year}] {p.line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </section>
    </main>
  );
}
