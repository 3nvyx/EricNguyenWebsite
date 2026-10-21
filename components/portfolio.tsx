"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PROJECTS } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { cn, ease, hoverLink as hover, pageMain } from "@/lib/utils";

const CORE = PROJECTS.slice(0, 3);
const MORE = PROJECTS.slice(3);

// Measurements below are design pixels at 1440 wide, written as calc(N*var(--u)) (see globals.css).
export function Portfolio() {
  return (
    <main className={pageMain}>
      <PageTitle>
        <PageTitleLink href="/projects" dir="forward">
          Projects
        </PageTitleLink>
      </PageTitle>
      <section id="work" className="flex scroll-mt-10 flex-col gap-[calc(45*var(--u))]">
        {CORE.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.1 }}
          >
            <h2 className="fw-label flex justify-between gap-6">
              <span className="uppercase">{p.title}</span>
              <span className="text-mute">{p.dates}</span>
            </h2>
            <div className="grid gap-5 md:grid-cols-[calc(400*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]">
              <Link
                href={`/projects/${p.slug}`}
                className="block w-full self-start overflow-hidden"
                style={{ aspectRatio: p.aspect ?? "16 / 9" }}
                aria-label={`${p.title}: ${p.line}`}
              >
                <MediaSlot project={p} />
              </Link>
              <div className="flex min-w-0 flex-col">
                <Link href={`/projects/${p.slug}`} className={cn("fw-title self-start", hover)}>
                  {p.title}
                </Link>
                <p className="fw-text mt-[calc(4*var(--u))] flex flex-wrap gap-x-[calc(12*var(--u))] text-mute">
                  {p.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </p>
                <div className="fw-text mt-[calc(36*var(--u))]">
                  <p>
                    {p.stack}
                    {!p.href && <span className="text-mute"> [Private]</span>}
                  </p>
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
            <h2 className="fw-label flex justify-between gap-6">
              <span>MORE</span>
              <Link href="/projects" className={hover}>
                SEE ALL PROJECTS →
              </Link>
            </h2>
            <ul className="fw-text">
              {MORE.map((p) => (
                <li key={p.slug} className="flex flex-wrap gap-x-[calc(27*var(--u))]">
                  <Link href={`/projects/${p.slug}`} className={hover}>
                    {p.title}
                  </Link>
                  <span className="text-mute">
                    [{p.dates}] {p.line}
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
