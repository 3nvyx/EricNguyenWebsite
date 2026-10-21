import Link from "next/link";
import { ChromeName } from "@/components/chrome-name";
import { PageTabs } from "@/components/page-tabs";

/** For pages without the sidebar: the name (home) on the left, the page tabs on the right. */
export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 md:px-[calc(45*var(--u))] md:pt-[calc(40*var(--u))]">
      <Link href="/" aria-label="Eric Nguyen, home">
        <ChromeName className="fw-name" />
      </Link>
      <PageTabs layout="row" />
    </header>
  );
}
