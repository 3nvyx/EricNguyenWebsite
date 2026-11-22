import { Sidebar } from "@/components/sidebar";

/**
 * Home (About, Projects and Play as one long page), Blogs and Privacy: the sticky sidebar beside the page. It sticks while the page
 * scrolls, then leaves with the content when the footer arrives. Project pages live outside
 * this group and have no sidebar.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // Full width: the sidebar's column, then the page out to the right edge.
    <div className="md:grid md:grid-cols-[36.5vw_minmax(0,1fr)]">
      <Sidebar />
      {/* The page beside the sidebar. It's its own view-transition layer while a tab switch
          slides it up or down (globals.css), so the sidebar holds still. */}
      <div className="page-slot min-w-0">{children}</div>
    </div>
  );
}
