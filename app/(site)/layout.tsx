import { Sidebar } from "@/components/sidebar";

/**
 * Projects, About and Blogs: the sticky sidebar beside the page. It sticks while the page
 * scrolls, then leaves with the content when the footer arrives. Project pages live outside
 * this group and have no sidebar.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:grid md:grid-cols-[36.5vw_minmax(0,1fr)]">
      <Sidebar />
      {children}
    </div>
  );
}
