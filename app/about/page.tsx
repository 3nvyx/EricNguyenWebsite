import type { Metadata } from "next";
import { ABOUT, ABOUT_INTRO } from "@/lib/about";
import { cn, hoverLink, pageMain } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = { title: "About" };

// Same rhythm as the project rows: label over a hairline, then a left column and a right column.
export default function AboutPage() {
  return (
    <main className={pageMain}>
      <PageTitle>About</PageTitle>
      <div className="flex flex-col gap-[calc(45*var(--u))]">
        <section>
          <div className="fw-text max-w-[calc(640*var(--u))] space-y-[calc(16*var(--u))]">
            {ABOUT_INTRO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
        {ABOUT.map((section) => (
          <section key={section.label}>
            <h2 className="fw-label">{section.label}</h2>
            <ul
              className={cn(
                "flex flex-col",
                section.compact ? "gap-[calc(10*var(--u))]" : "gap-[calc(36*var(--u))]",
              )}
            >
              {section.entries.map((e) => (
                <li
                  key={`${e.when}-${e.title}`}
                  className="grid gap-1 md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]"
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
        ))}
      </div>
    </main>
  );
}
