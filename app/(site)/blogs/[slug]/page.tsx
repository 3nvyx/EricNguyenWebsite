import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, postDate } from "@/lib/posts";
import { cn, hoverLink, pageMain } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main className={pageMain}>
      <h2 className="fw-label flex justify-between">
        <Link href="/blogs" className={hoverLink}>
          ← BLOGS
        </Link>
        <span className="text-mute">
          {postDate.format(new Date(post.date))}
          {post.draft && " [Draft]"}
        </span>
      </h2>
      <article className="max-w-[calc(640*var(--u))]">
        <h1 className="fw-name">{post.title}</h1>
        <p className="fw-text mt-[calc(10*var(--u))] text-mute">{post.summary}</p>
        <div className="fw-text mt-[calc(36*var(--u))] space-y-[calc(16*var(--u))]">
          {post.body.map((b, i) =>
            typeof b === "string" ? (
              <p key={i}>{b}</p>
            ) : (
              <h3 key={i} className={cn("fw-title pt-[calc(20*var(--u))]")}>
                {b.h}
              </h3>
            ),
          )}
        </div>
      </article>
    </main>
  );
}
