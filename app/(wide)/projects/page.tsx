import type { Metadata } from "next";
import { PROJECTS } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";
import { PageTitle, PageTitleLink } from "@/components/page-title";

export const metadata: Metadata = { title: "Projects" };

/**
 * Every project, full width without the sidebar, in rows so the featured ones read first.
 * Every cover is the same 16:9 frame here (project pages keep each one's own shape); each card
 * opens the project's page, and its gif plays only while hovered. The title links back home.
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
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}
