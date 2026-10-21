import type { Metadata } from "next";
import { POSTS } from "@/lib/posts";
import { cn, hoverLink, pageMain } from "@/lib/utils";

export const metadata: Metadata = { title: "Blogs" };

const date = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", timeZone: "UTC" });

export default function BlogsPage() {
  return (
    <main className={pageMain}>
      <h2 className="fw-label">BLOGS</h2>
      {POSTS.length === 0 ? (
        <p className="fw-text text-mute">First post soon.</p>
      ) : (
        <ul className="flex flex-col gap-[calc(36*var(--u))]">
          {POSTS.map((p) => (
            <li
              key={p.slug}
              className="grid gap-2 md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]"
            >
              <p className="fw-text text-mute">{date.format(new Date(p.date))}</p>
              <div>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className={cn("fw-title", hoverLink)}>
                  {p.title}
                </a>
                <p className="fw-text mt-[calc(10*var(--u))]">{p.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
