"use client";

import { usePathname } from "next/navigation";
import { isFramed } from "@/lib/pages";

/**
 * How wide the footer sits: on the framed pages (the "See more" pages and each project) its
 * content lines up with their centred frame; beside the sidebar it spans the page, like the
 * sidebar and the page do.
 */
export function FooterFrame({ children }: { children: React.ReactNode }) {
  const framed = isFramed(usePathname());
  return (
    <div className="group" data-swipe="page" data-framed={framed ? "" : undefined}>
      {children}
    </div>
  );
}
