import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, postDate } from "@/lib/posts";
import { hoverLink, pageMain } from "@/lib/utils";
import { Prose } from "@/components/prose";

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
      <article>
        <h1 className="fw-name">{post.title}</h1>
        <p className="fw-text mt-[calc(10*var(--u))] text-mute">{post.summary}</p>
        <div className="mt-[calc(36*var(--u))]">
          <Prose blocks={post.body} />
        </div>
      </article>
    </main>
  );
}
