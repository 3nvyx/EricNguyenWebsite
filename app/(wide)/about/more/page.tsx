import type { Metadata } from "next";
import { ABOUT } from "@/lib/about";
import { AboutIntro, AboutSectionBlock } from "@/components/about-sections";

// The full sections first, so they share a row and the one-line ones (skills, awards) another.
const SECTIONS = [...ABOUT.filter((s) => !s.compact), ...ABOUT.filter((s) => s.compact)];

export const metadata: Metadata = { title: "About" };

/**
 * The full About, full width without the sidebar: the intro, then every section two to a row
 * (the full ones first), the when above each entry. Reached from /about's "See more"; the page's
 * title, back to /about, sits in the top bar (components/top-bar.tsx).
 */
export default function AboutMorePage() {
  return (
    <main className="px-5 pt-10 pb-24 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(64*var(--u))] md:pb-[calc(120*var(--u))]">
      <AboutIntro className="mb-[calc(64*var(--u))]" />
      <div className="grid gap-x-[calc(45*var(--u))] gap-y-[calc(64*var(--u))] md:grid-cols-2">
        {SECTIONS.map((section) => (
          <AboutSectionBlock key={section.label} section={section} stacked />
        ))}
      </div>
    </main>
  );
}
