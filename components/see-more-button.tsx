import { NudgeArrow } from "@/components/nudge-arrow";
import { SlideLink } from "@/components/slide-link";
import { cn } from "@/lib/utils";

/**
 * The way on from a section of home to its "See more" page ("My story", "See all
 * projects"): a rectangular button centred under the section, ink outline with small caps, that
 * fills with ink on hover. Its arrow hops forward now and then (NudgeArrow), and it slides to the
 * page like the section's title does.
 */
export function SeeMoreButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-center", className)}>
      <SlideLink
        href={href}
        dir="forward"
        className={cn(
          "group fw-small inline-flex items-baseline border border-ink px-[calc(28*var(--u))] py-[calc(12*var(--u))] uppercase tracking-[0.08em]",
          "transition-colors duration-200 hover:bg-ink hover:text-bone",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
        )}
      >
        {children}
        <NudgeArrow />
      </SlideLink>
    </div>
  );
}
