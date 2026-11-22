import { TopBar } from "@/components/top-bar";

/** Pages without the sidebar (the projects grid and each project): a top bar instead. */
export default function WideLayout({ children }: { children: React.ReactNode }) {
  return (
    // One piece, so a sideways swipe back moves the whole page (components/swipe-nav.tsx).
    <div data-swipe="page">
      <TopBar />
      {children}
    </div>
  );
}
