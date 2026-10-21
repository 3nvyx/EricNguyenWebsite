import { TopBar } from "@/components/top-bar";

/** Pages without the sidebar (the projects grid and each project): a top bar instead. */
export default function WideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
