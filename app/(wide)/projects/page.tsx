import type { Metadata } from "next";
import { PROJECTS } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = { title: "Projects" };

/**
 * Every project, full width without the sidebar, the featured ones (home's four) first.
 * Every cover is the same 16:9 frame here (project pages keep each one's own shape), and they
 * glide into order as grey blurred blocks, then sharpen as they load (components/project-card.tsx);
 * each card opens the project's page, and its gif plays only while hovered. The page's title, back to
 * home, sits in the top bar where the name is on other pages (components/top-bar.tsx).
 */
export default function ProjectsPage() {
  return (
    <main className="px-5 pt-10 pb-24 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(64*var(--u))] md:pb-[calc(120*var(--u))]">
      <ul className="grid gap-x-[calc(27*var(--u))] gap-y-[calc(45*var(--u))] md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <li key={p.slug}>
            <ProjectCard project={p} index={i} />
          </li>
        ))}
      </ul>
    </main>
  );
}
