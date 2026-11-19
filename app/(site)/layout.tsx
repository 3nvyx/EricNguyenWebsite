import { Sidebar } from "@/components/sidebar";

/**
 * Projects, About and Blogs: the sticky sidebar beside the page. It sticks while the page
 * scrolls, then leaves with the content when the footer arrives. Project pages live outside
 * this group and have no sidebar.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // The centred frame (--frame in globals.css): sidebar column, then the page.
    <div className="md:mx-auto md:grid md:max-w-[var(--frame)] md:grid-cols-[var(--side-col)_minmax(0,1fr)] md:px-[var(--edge)]">
      <Sidebar />
      {/* The page beside the sidebar. It's its own view-transition layer while a tab switch
          slides it up or down (globals.css), so the sidebar holds still. */}
      <div className="page-slot min-w-0">{children}</div>
    </div>
  );
}
