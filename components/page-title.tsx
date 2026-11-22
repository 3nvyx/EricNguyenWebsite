import { SlideLink } from "@/components/slide-link";
import { cn, hoverLink, morph } from "@/lib/utils";

/** The page's title at the top of its column, at the reference's brand-title size. */
export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("fw-name mb-[calc(36*var(--u))]", className)}>{children}</h1>;
}

/**
 * A title that links to a sibling page, with an arrow on the side it's heading: `forward` after
 * the word, `back` before it. It nudges that way on hover. `close` is a back link from a project's
 * page to the grid: pass `slideMorph` (the project's slug) so its pieces fly back into its card.
 *
 * `inline`: the arrow takes its own room, so the line starts with it (the projects grid's top
 * bar, where "← Projects" starts where the name does elsewhere). Otherwise it hangs outside the
 * word, so the word keeps its alignment. `vtName` makes the word glide to the same-named word on
 * the next page (see morph); the arrow isn't part of it.
 */
export function PageTitleLink({
  href,
  dir,
  vtName,
  slideMorph,
  inline = false,
  children,
}: {
  href: string;
  dir: "forward" | "back" | "close";
  vtName?: string;
  slideMorph?: string;
  inline?: boolean;
  children: React.ReactNode;
}) {
  const back = dir !== "forward";
  const m = vtName ? morph(vtName) : undefined;
  const gap = "calc(10*var(--u))";
  const arrow = (
    <span
      aria-hidden
      className={cn(
        "text-mute transition-transform duration-200 group-hover:text-ink motion-reduce:transition-none",
        back ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
        inline ? "inline-block" : cn("absolute top-0", back ? "right-full" : "left-full"),
      )}
      style={back ? { marginRight: gap } : { marginLeft: gap }}
    >
      {back ? "←" : "→"}
    </span>
  );
  return (
    <SlideLink href={href} dir={dir} morph={slideMorph} className={cn("group relative inline-block", hoverLink)}>
      {back && arrow}
      {/* inline-block, so it has a box to glide; the link's underline can't reach into it. */}
      <span className={cn("inline-block underline-offset-4 group-hover:underline", m?.className)} style={m?.style}>
        {children}
      </span>
      {!back && arrow}
    </SlideLink>
  );
}
