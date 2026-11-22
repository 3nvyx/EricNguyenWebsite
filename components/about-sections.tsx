import { ABOUT_INTRO, type AboutSection } from "@/lib/about";
import { cn, hoverLink } from "@/lib/utils";

/**
 * The photo beside the intro, as its own column so no line wraps under it. Stacked on phones.
 * `paragraphs`: the whole intro by default; /about passes the short one. `lead`: the first
 * paragraph is set larger, as the line the rest hangs off.
 */
export function AboutIntro({
  paragraphs = ABOUT_INTRO,
  lead = false,
  className,
}: {
  paragraphs?: string[];
  lead?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "fw-text flex max-w-[calc(820*var(--u))] flex-col gap-[calc(20*var(--u))] md:flex-row md:gap-[calc(27*var(--u))]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/eric-portrait.jpg"
        alt="Eric Nguyen"
        width={800}
        height={1201}
        className="aspect-square w-[calc(160*var(--u))] min-w-28 shrink-0 object-cover object-[50%_28%] md:mt-[calc(8*var(--u))]"
      />
      <div className="space-y-[calc(16*var(--u))]">
        {paragraphs.map((p, i) => (
          <p key={p} className={cn(lead && i === 0 && "fw-title")}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

/**
 * One About section, with the same rhythm as the project rows: label over a hairline, then the
 * when in a left column and the entry in a right one. `stacked` puts the when above the full
 * entries instead (one-line rows keep a narrower left column), for the full page's two columns.
 */
export function AboutSectionBlock({ section, stacked = false }: { section: AboutSection; stacked?: boolean }) {
  if (section.groups) return <AboutGroups section={section} stacked={stacked} />;
  return (
    <section>
      <h2 className="fw-label">{section.label}</h2>
      <ul
        className={cn("flex flex-col", section.compact ? "gap-[calc(10*var(--u))]" : "gap-[calc(36*var(--u))]")}
      >
        {section.entries.map((e) => (
          <li
            key={`${e.when}-${e.title}`}
            className={cn(
              "grid gap-1",
              // Stacked, the one-line rows still sit side by side, on a narrower left column.
              !stacked
                ? "md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]"
                : section.compact && "md:grid-cols-[calc(170*var(--u))_minmax(0,1fr)] md:gap-[calc(20*var(--u))]",
            )}
          >
            <p className="fw-text text-mute">{e.when}</p>
            {section.compact ? (
              <p className="fw-text">{e.title}</p>
            ) : (
              <div>
                <p className="fw-title">{e.title}</p>
                {e.where && <p className="fw-text text-mute">{e.where}</p>}
                {e.line && <p className="fw-text mt-[calc(10*var(--u))]">{e.line}</p>}
                {e.link && (
                  <a
                    href={e.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("fw-text mt-[calc(6*var(--u))] inline-block", hoverLink)}
                  >
                    {e.link.label}
                    <span className="ml-0.5 align-top text-[0.75em]">↗</span>
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A section as a grid of small groups (the skills): each group's name in small grey type over
 * its items, set apart by soft dots. Three across beside the sidebar, two in the full page's
 * half-width column, one on phones.
 */
function AboutGroups({ section, stacked }: { section: AboutSection; stacked: boolean }) {
  return (
    <section>
      <h2 className="fw-label">{section.label}</h2>
      <ul
        className={cn(
          "grid gap-x-[calc(27*var(--u))] gap-y-[calc(27*var(--u))] sm:grid-cols-2",
          !stacked && "lg:grid-cols-3",
        )}
      >
        {section.entries.map((e) => (
          <li key={e.when}>
            <p className="fw-small text-mute mb-[calc(6*var(--u))]">{e.when}</p>
            <p className="fw-text leading-[1.75]!">
              {e.title.split(", ").map((item, i, items) => (
                // Each item stays whole with the dot after it, so a line can end on a dot but
                // never start with one; the space after is where lines break.
                <span key={item}>
                  <span className="whitespace-nowrap">
                    {item}
                    {i < items.length - 1 && (
                      <>
                        <span aria-hidden className="text-mute">
                          {" ·"}
                        </span>
                        <span className="sr-only">,</span>
                      </>
                    )}
                  </span>{" "}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
