import type { Metadata } from "next";
import Link from "next/link";
import { POSTS, postDate } from "@/lib/posts";
import { cn, hoverLink, pageMain } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = { title: "Blogs" };

export default function BlogsPage() {
  return (
    <main className={pageMain}>
      <PageTitle>Blogs</PageTitle>
      {POSTS.length === 0 ? (
        <p className="fw-text text-mute">First post soon.</p>
      ) : (
        <ul className="flex flex-col gap-[calc(36*var(--u))]">
          {POSTS.map((p) => (
            <li
              key={p.slug}
              className="grid gap-2 md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]"
            >
              <p className="fw-text text-mute">
                {postDate.format(new Date(p.date))}
                {p.draft && " [Draft]"}
              </p>
              <div>
                <Link href={`/blogs/${p.slug}`} className={cn("fw-title", hoverLink)}>
                  {p.title}
                </Link>
                <p className="fw-text mt-[calc(10*var(--u))]">{p.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
