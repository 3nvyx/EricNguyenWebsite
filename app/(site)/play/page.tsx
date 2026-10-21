import type { Metadata } from "next";
import { pageMain } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";
import { Breakout } from "@/components/breakout";

export const metadata: Metadata = { title: "Play" };

export default function PlayPage() {
  return (
    <main className={pageMain}>
      <PageTitle>Play</PageTitle>
      <div className="max-w-[calc(720*var(--u))]">
        <Breakout />
      </div>
    </main>
  );
}
