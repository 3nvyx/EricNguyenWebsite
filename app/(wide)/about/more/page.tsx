import type { Metadata } from "next";
import { ABOUT_LEAD } from "@/lib/about";
import { AboutDetail } from "@/components/about-detail";

export const metadata: Metadata = { title: "About", description: ABOUT_LEAD };

/**
 * The full About, without the sidebar and laid out like a project's page
 * (components/about-detail.tsx). Reached from home's "My story" and the About title; the page's
 * title, back to home, sits in the top bar (components/top-bar.tsx).
 */
export default function AboutMorePage() {
  return <AboutDetail />;
}
