import type { Metadata } from "next";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { MediaSlot } from "@/components/media-slot";
import { PageTitle, PageTitleLink } from "@/components/page-title";
import { cn, hoverLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

/**
 * Every project, full width without the sidebar, in rows so the featured ones read first.
 * Every cover is the same 16:9 frame here (project pages keep each one's own shape); each card
 * opens the project's page. The title links back home.
 */
export default function ProjectsPage() {
  return (
    <main className="px-5 pt-10 pb-24 md:px-[calc(45*var(--u))] md:pt-[calc(64*var(--u))] md:pb-[calc(120*var(--u))]">
      <PageTitle className="text-center">
        <PageTitleLink href="/" dir="back">
          Projects
        </PageTitleLink>
      </PageTitle>
      <ul className="grid items-start gap-x-[calc(27*var(--u))] gap-y-[calc(45*var(--u))] md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`} className="group block">
              <p className="fw-label flex justify-between gap-6">
                <span className="uppercase">{p.title}</span>
                <span className="text-mute">{p.dates}</span>
              </p>
              <div className="aspect-video w-full overflow-hidden">
                <MediaSlot project={p} />
              </div>
              <p className={cn("fw-title mt-[calc(14*var(--u))] self-start", hoverLink, "group-hover:underline")}>
                {p.title}
              </p>
              <p className="fw-text text-mute">
                {p.tags.map((t) => `#${t}`).join("  ")}
              </p>
              <p className="fw-text mt-[calc(10*var(--u))]">{p.line}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
