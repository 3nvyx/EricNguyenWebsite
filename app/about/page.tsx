import type { Metadata } from "next";
import { ABOUT } from "@/lib/about";
import { pageMain } from "@/lib/utils";

export const metadata: Metadata = { title: "About" };

// Same rhythm as the project rows: label over a hairline, then a left column and a right column.
export default function AboutPage() {
  return (
    <main className={pageMain}>
      <div className="flex flex-col gap-[calc(45*var(--u))]">
        {ABOUT.map((section) => (
          <section key={section.label}>
            <h2 className="fw-label">{section.label}</h2>
            <ul className="flex flex-col gap-[calc(36*var(--u))]">
              {section.entries.map((e) => (
                <li
                  key={`${e.title}-${e.where}`}
                  className="grid gap-2 md:grid-cols-[calc(279*var(--u))_minmax(0,1fr)] md:gap-[calc(27*var(--u))]"
                >
                  <p className="fw-text text-mute">{e.when}</p>
                  <div>
                    <p className="fw-title">{e.title}</p>
                    <p className="fw-text text-mute">{e.where}</p>
                    <p className="fw-text mt-[calc(10*var(--u))]">{e.line}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
