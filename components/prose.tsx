import { sectionId, type Block, type Figure } from "@/lib/content";
import { MediaImage } from "@/components/media-image";
import { cn } from "@/lib/utils";

function FigureView({ figure }: { figure: Figure }) {
  return (
    <figure>
      <div className="w-full overflow-hidden" style={{ aspectRatio: figure.aspect ?? "16 / 9" }}>
        <MediaImage src={figure.src} alt={figure.caption} label={figure.src.split("/").pop() ?? "image"} />
      </div>
      <figcaption className="fw-small mt-[calc(8*var(--u))] text-mute">{figure.caption}</figcaption>
    </figure>
  );
}

/**
 * Renders a content body. Headings are either section labels over a hairline (project pages)
 * or plain titles (blog posts). Text stays at a readable measure; figures use the full width.
 */
export function Prose({ blocks, headings = "title" }: { blocks: Block[]; headings?: "label" | "title" }) {
  return (
    <div className="fw-text space-y-[calc(16*var(--u))]">
      {blocks.map((b, i) => {
        if (typeof b === "string") {
          return (
            <p key={i} className="max-w-[calc(640*var(--u))]">
              {b}
            </p>
          );
        }
        if ("h" in b) {
          return headings === "label" ? (
            <h2 key={i} id={sectionId(b.h)} className="fw-label scroll-mt-[calc(36*var(--u))] pt-[calc(36*var(--u))] uppercase">
              {b.h}
            </h2>
          ) : (
            <h3 key={i} className="fw-title pt-[calc(20*var(--u))]">
              {b.h}
            </h3>
          );
        }
        if ("list" in b) {
          return (
            <ul key={i} className="max-w-[calc(640*var(--u))] list-['–_'] space-y-[calc(6*var(--u))] pl-[calc(18*var(--u))]">
              {b.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if ("figure" in b) {
          return (
            <div key={i} className="py-[calc(12*var(--u))]">
              <FigureView figure={b.figure} />
            </div>
          );
        }
        if ("video" in b) {
          return (
            <figure key={i} className="py-[calc(12*var(--u))]">
              <video
                src={b.video.src}
                poster={b.video.poster}
                controls
                playsInline
                preload="metadata"
                aria-label={b.video.caption}
                className="w-full bg-ink"
                style={{ aspectRatio: b.video.aspect ?? "16 / 9" }}
              />
              <figcaption className="fw-small mt-[calc(8*var(--u))] text-mute">{b.video.caption}</figcaption>
            </figure>
          );
        }
        if ("youtube" in b) {
          return (
            <figure key={i} className="py-[calc(12*var(--u))]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${b.youtube.id}?rel=0`}
                title={b.youtube.caption}
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="aspect-video w-full bg-ink"
              />
              <figcaption className="fw-small mt-[calc(8*var(--u))] text-mute">{b.youtube.caption}</figcaption>
            </figure>
          );
        }
        return (
          <div key={i} className={cn("grid gap-[calc(18*var(--u))] py-[calc(12*var(--u))] md:grid-cols-2")}>
            <FigureView figure={b.figures[0]} />
            <FigureView figure={b.figures[1]} />
          </div>
        );
      })}
    </div>
  );
}
