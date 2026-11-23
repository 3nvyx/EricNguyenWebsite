import type { Metadata } from "next";
import { ProjectGrid } from "@/components/project-grid";

export const metadata: Metadata = { title: "Projects" };

/**
 * Every project, full width without the sidebar, the featured ones (home's four) first, under a
 * filter by type (components/project-grid.tsx). Every cover is the same 16:9 frame here (project
 * pages keep each one's own shape), and the cards fade in and fall into order
 * (components/project-card.tsx); each card opens the project's page, and its clip plays only
 * while hovered. The page's title, back to home, sits in the top bar where the name is on other
 * pages (components/top-bar.tsx).
 */
export default function ProjectsPage() {
  return (
    <main className="px-5 pt-10 pb-24 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(64*var(--u))] md:pb-[calc(120*var(--u))]">
      <ProjectGrid />
    </main>
  );
}
