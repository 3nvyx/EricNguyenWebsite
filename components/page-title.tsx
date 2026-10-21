import Link from "next/link";
import { cn, hoverLink } from "@/lib/utils";

/** The page's title at the top of its column, at the reference's brand-title size. */
export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("fw-name mb-[calc(36*var(--u))]", className)}>{children}</h1>;
}

/**
 * A title that links to a sibling page. The arrow sits outside the word (so the word keeps its
 * alignment) on the side it's heading: `forward` after it, `back` before it. It nudges that way on hover.
 */
export function PageTitleLink({
  href,
  dir,
  children,
}: {
  href: string;
  dir: "forward" | "back";
  children: React.ReactNode;
}) {
  const back = dir === "back";
  return (
    <Link href={href} className={cn("group relative inline-block", hoverLink)}>
      <span
        aria-hidden
        className={cn(
          "absolute top-0 text-mute transition-transform duration-200 group-hover:text-ink motion-reduce:transition-none",
          back
            ? "right-full mr-[calc(10*var(--u))] group-hover:-translate-x-1"
            : "left-full ml-[calc(10*var(--u))] group-hover:translate-x-1",
        )}
      >
        {back ? "←" : "→"}
      </span>
      {children}
    </Link>
  );
}
