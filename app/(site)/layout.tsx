import { PageTabs } from "@/components/page-tabs";
import { Sidebar } from "@/components/sidebar";

/**
 * Home (About and Projects as one long page), Blogs and Privacy: the sticky sidebar beside the page. It sticks while the page
 * scrolls, then leaves with the content when the footer arrives. Project pages live outside
 * this group and have no sidebar.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // Full width: the sidebar's column, then the page out to the right edge.
    <div className="md:grid md:grid-cols-[var(--sidebar-col)_minmax(0,1fr)]">
      <Sidebar />
      {/* Phones: the page tabs, pinned to the top once the header above has scrolled away, so the
          sections of the long home page are always one tap off. (Desktop has them in the sidebar.) */}
      <div className="sticky top-0 z-30 border-b-[0.5px] border-ink/25 bg-bone/90 px-5 backdrop-blur-sm md:hidden">
        <PageTabs />
      </div>
      {/* The page beside the sidebar. It's its own view-transition layer while a tab switch
          slides it up or down (globals.css), so the sidebar holds still. */}
      <div data-swipe="page" className="page-slot min-w-0">
        {children}
      </div>
    </div>
  );
}
