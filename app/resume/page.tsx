import type { Metadata } from "next";
import { LINKS } from "@/lib/projects";
import { cn, hoverLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Resume" };

const RESUME = LINKS[1].href;

export default function ResumePage() {
  return (
    <main
      className={cn(
        "px-5 pt-12 pb-16",
        "md:ml-[36.5vw] md:pt-[calc(64*var(--u))] md:pr-[calc(45*var(--u))] md:pb-[calc(45*var(--u))] md:pl-0",
      )}
    >
      <h2 className="fw-label flex justify-between">
        <span>RESUME</span>
        <a href={RESUME} target="_blank" rel="noopener noreferrer" className={hoverLink}>
          DOWNLOAD<span className="ml-0.5 align-top text-[0.75em]">↗</span>
        </a>
      </h2>
      <iframe
        src={`${RESUME}#view=FitH&toolbar=0`}
        title="Eric Nguyen resume"
        className="h-[75dvh] w-full bg-white md:h-[calc(100dvh-160*var(--u))]"
      />
    </main>
  );
}
