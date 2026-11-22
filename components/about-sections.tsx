import type { AboutSection } from "@/lib/about";
import { cn, hoverLink, morph } from "@/lib/utils";

// Home's About preview and the top of the full page (components/about-detail.tsx) are the same
// block, AboutPreview, only larger on the full page: the portrait, the summary (the lead line) and
// the skills. Sliding between the two, each of the three glides on its own from one spot to the
// other and grows or shrinks on the way (morph). Both ends are the same layout at a different
// scale, so each piece is one picture changing size, never two versions fading across each other.
type Where = "home" | "more";
/** A piece's twin is on the other page: `pair` is the link that leads there. */
const pairOf = (on: Where) => (on === "home" ? "/about/more" : "/");
const photoMorph = (on: Where) => morph("about-photo", { kind: "vt-photo", pair: pairOf(on) });
const summaryMorph = (on: Where) => morph("about-summary", { pair: pairOf(on) });
/**
 * A section of groups (the skills) as a piece. Its name comes from its label, with anything but
 * letters and digits turned to dashes, so it's always a valid name.
 */
const groupsMorph = (section: AboutSection, on: Where) =>
  morph(`about-${section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, { pair: pairOf(on) });


/**
 * The About block: the portrait on the left; on the right, the lead about Eric set large across
 * the column, its capitals level with the photo's top, and the featured sections (the skills) as
 * a compact grid under it. The photo stretches to the right column's height so both start and
 * end on the same lines; it is never squatter than 4:5, and when the right column is the shorter
 * one the photo sets the height. On home it is kept short, so "My story" under it shows without
 * scrolling.
 *
 * Below xl the right column would be too narrow for the skills, so the photo (narrower) sits
 * beside the lead line alone, the line resting on the photo's bottom edge, and the skills run the
 * full width under both. Phones stack all three.
 *
 * Every measure inside is in --au, the block's own design pixel. `on="home"`: the site's (--u).
 * `on="more"`: at xl, where the three sit side by side, the block fills the full page's frame as
 * home's layout scaled up: --au is the frame's inner width over 869, the width in design pixels
 * of home's About column there. So its lines break exactly where home's do, and the three pieces
 * are their twins at a larger size all the way through the slide.
 */
export function AboutPreview({ lead, sections, on = "home" }: { lead: string; sections: AboutSection[]; on?: Where }) {
  const photo = photoMorph(on);
  const summary = summaryMorph(on);
  return (
    <section
      className={cn(
        "[--au:var(--u)]",
        on === "more" && "xl:[--au:calc((var(--frame)_-_2*var(--edge))/869)]",
        "grid gap-y-[calc(20*var(--au))]",
        "md:grid-cols-[calc(180*var(--au))_minmax(0,1fr)] md:gap-x-[calc(27*var(--au))] md:gap-y-[calc(27*var(--au))]",
        // Extra height from a tall photo goes under the skills, not between them and the lead.
        "xl:grid-cols-[calc(250*var(--au))_minmax(0,1fr)] xl:grid-rows-[auto_1fr] xl:gap-y-[calc(22*var(--au))]",
      )}
    >
      <div
        {...photo.attrs}
        style={photo.style}
        className={cn("relative aspect-[4/5] w-[calc(200*var(--au))] md:w-full xl:row-span-2 xl:self-stretch", photo.className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/eric-portrait.jpg"
          alt="Eric Nguyen"
          width={800}
          height={1201}
          className="absolute inset-0 size-full object-cover object-[50%_28%]"
        />
      </div>
      {/* xl: the negative margin lifts the first line's capitals level with the photo's top. */}
      <p
        {...summary.attrs}
        style={summary.style}
        className={cn(
          "text-[calc(26*var(--au))] leading-[1.25] tracking-[-0.01em] md:self-end xl:-mt-[0.18em] xl:self-start",
          summary.className,
        )}
      >
        {lead}
      </p>
      <div className="flex min-w-0 flex-col gap-[calc(27*var(--au))] md:col-span-2 xl:col-span-1 xl:col-start-2">
        {sections.map((s) => (
          <AboutSectionBlock key={s.label} section={s} on={on} />
        ))}
      </div>
    </section>
  );
}

/**
 * One About section, with the same rhythm as the project rows: label over a hairline, then the
 * when in a left column and the entry in a right one. `stacked` puts the when above the full
 * entries instead (one-line rows keep a narrower left column), for the full page's one column.
 * A section of groups (the skills) is the compact grid inside AboutPreview; `on` is the page it
 * is on.
 */
export function AboutSectionBlock({ section, stacked = false, on = "home" }: { section: AboutSection; stacked?: boolean; on?: Where }) {
  if (section.groups) return <AboutGroupsCompact section={section} on={on} />;
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
 * A section of groups (the skills) inside AboutPreview, set tight so it stays short: label over a
 * hairline, then the groups two across (one when the column is narrow, as on a phone), each name
 * in small grey type over its items, the items in smaller type with close lines and plain commas.
 * Measured in AboutPreview's --au, so it scales with the rest of the block.
 */
function AboutGroupsCompact({ section, on }: { section: AboutSection; on: Where }) {
  const m = groupsMorph(section, on);
  return (
    <section {...m.attrs} style={m.style} className={cn("@container", m.className)}>
      {/* The site's section label (fw-label in globals.css), in --au. */}
      <h2 className="mb-[calc(14*var(--au))] border-b-[0.5px] border-ink pb-[calc(2.25*var(--au))] text-[calc(12*var(--au))] leading-[1.5]">
        {section.label}
      </h2>
      <ul className="grid gap-x-[calc(27*var(--au))] gap-y-[calc(12*var(--au))] @min-[26rem]:grid-cols-2">
        {section.entries.map((e) => (
          <li key={e.when}>
            <p className="text-[calc(12*var(--au))] leading-[1.4] text-mute">{e.when}</p>
            <GroupItems items={e.title} className="text-[calc(14*var(--au))] leading-[1.4]" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A group's comma-separated items, each kept whole on its line. */
function GroupItems({ items, className }: { items: string; className?: string }) {
  return (
    <p className={className}>
      {items.split(", ").map((item, i, all) => (
        // Each item stays whole with its comma after it, so a line never starts with one; the
        // space after is where lines break.
        <span key={item}>
          <span className="whitespace-nowrap">
            {item}
            {i < all.length - 1 && ","}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}
