// Blog posts, newest first. Add an entry here to list it on /blogs.

export type Post = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-10-20". */
  date: string;
  summary: string;
  /** Where the post lives; external for now (Medium, Substack, a repo README...). */
  href: string;
};

export const POSTS: Post[] = [];
