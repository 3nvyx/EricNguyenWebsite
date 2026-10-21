// Blog posts, newest first. Each one gets a page at /blogs/<slug>.
// A post's body uses the shared content blocks (lib/content.ts).

import type { Block } from "@/lib/content";

export type Post = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-10-20". */
  date: string;
  summary: string;
  /** Drafts are listed with a [Draft] mark until this is removed. */
  draft?: boolean;
  body: Block[];
};

export const postDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", timeZone: "UTC" });

export const POSTS: Post[] = [];
