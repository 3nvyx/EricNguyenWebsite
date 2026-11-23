import type { Metadata } from "next";
import { Breakout } from "@/components/breakout";

export const metadata: Metadata = { title: "Play" };

/**
 * The game full size, without the sidebar: a wider board with more columns, sized to fit the
 * screen (components/breakout.tsx). Reached from home's Play title and "Play full size"; the
 * page's title, back to home, sits in the top bar (components/top-bar.tsx).
 */
export default function PlayFullPage() {
  return (
    <main className="px-5 pt-10 pb-24 md:mx-auto md:max-w-[var(--frame)] md:px-[var(--edge)] md:pt-[calc(40*var(--u))] md:pb-[calc(120*var(--u))]">
      <Breakout wide />
    </main>
  );
}
