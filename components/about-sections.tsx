import { ABOUT_INTRO, type AboutSection } from "@/lib/about";
import { cn, hoverLink } from "@/lib/utils";

/** The photo beside the intro, as its own column so no line wraps under it. Stacked on phones. */
export function AboutIntro({ className }: { className?: string }) {
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
        {ABOUT_INTRO.map((p) => (
          <p key={p}>{p}</p>
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
