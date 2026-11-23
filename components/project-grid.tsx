"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GRID_ORDER } from "@/lib/featured";
import { PROJECT_TYPES, type ProjectType } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";
import { cameFrom } from "@/components/slide-link";
import { cn } from "@/lib/utils";

/*
 * The projects grid with its filter: a row of types (lib/projects.ts PROJECT_TYPES) over the
 * cards. Picking one keeps the projects of that type: the others fade out, the ones left glide
 * into their new places, and any that come back fall in like the grid's own entrance. "All" is
 * every project, the featured four first.
 *
 * The choice goes in the address (/projects/all?type=hardware), so it can be shared and the
 * browser's Back from a project's page returns to it. It's also remembered for "← Projects" on
 * a project's page (which leads to the plain address), as long as that project is one the filter
 * shows: nobody should come back to a grid without the project they just left. Coming from
 * anywhere else, the grid starts on All, which is also what the server renders. Picking a filter
 * replaces the address rather than adding to the history, so Back leaves the grid.
 */

type Filter = ProjectType | "all";

const STORE = "projects-type";
const isType = (v: string | null): v is ProjectType => PROJECT_TYPES.some((t) => t.id === v);

// Storage can be switched off (some private modes): then nothing is remembered, and nothing breaks.
function remembered() {
  try {
    return window.sessionStorage.getItem(STORE);
  } catch {
    return null;
  }
}
function remember(filter: Filter) {
  try {
    window.sessionStorage.setItem(STORE, filter);
  } catch {}
}

/** The filter to open on: the address's, else the remembered one if we're back from a project it shows. */
function openingFilter(): Filter {
  const inAddress = new URLSearchParams(window.location.search).get("type");
  if (isType(inAddress)) return inAddress;
  const from = cameFrom();
  const slug = from?.startsWith("/projects/") ? from.split("/")[2] : null;
  const kept = remembered();
  const project = GRID_ORDER.find((p) => p.slug === slug);
  return project && isType(kept) && project.types.includes(kept) ? kept : "all";
}

/** How many projects each filter shows. */
const COUNT: Record<Filter, number> = {
  all: GRID_ORDER.length,
  ...(Object.fromEntries(PROJECT_TYPES.map((t) => [t.id, GRID_ORDER.filter((p) => p.types.includes(t.id)).length])) as Record<
    ProjectType,
    number
  >),
};

const GLIDE = [0.32, 0.72, 0, 1] as const;
const noop = () => () => {};

export function ProjectGrid() {
  const still = useReducedMotion();
  const [picked, setPicked] = useState<Filter>(() => (typeof window === "undefined" ? "all" : openingFilter()));
  // The server can't know the choice, so the first paint of a page load is All, like its HTML;
  // arriving by a link (no HTML to match), the choice shows from the first frame.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const filter = hydrated ? picked : "all";
  // A page load that opens on a filter (a shared link): the server's All grid is swapped for the
  // filtered one in one go, as a fresh list, not by animating twelve cards out the moment the
  // page appears. (Their exits never finish that early, which left every card on screen.)
  const [openedFiltered] = useState(picked !== "all");
  const listKey = hydrated && openedFiltered ? "opened-filtered" : "list";

  // Keep the address and the remembered choice on the filter.
  useEffect(() => {
    remember(picked);
    const url = new URL(window.location.href);
    if (picked === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", picked);
    // null, not the current state: that's how Next knows the address changed and keeps its own
    // record of it in step (otherwise its next update would write the old address back).
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [picked]);

  const shown = filter === "all" ? GRID_ORDER : GRID_ORDER.filter((p) => p.types.includes(filter));
  const options: { id: Filter; label: string }[] = [{ id: "all", label: "All" }, ...PROJECT_TYPES];

  return (
    <>
      <div role="group" aria-label="Filter projects by type" className="mb-[calc(36*var(--u))] flex flex-wrap gap-[calc(8*var(--u))]">
        {options.map((o) => {
          const on = o.id === filter;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(o.id)}
              className={cn(
                "fw-small cursor-pointer border px-[calc(12*var(--u))] py-[calc(6*var(--u))] uppercase tracking-[0.08em] transition-colors duration-200 max-md:py-[calc(9*var(--u))]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                on ? "border-ink bg-ink text-bone" : "border-ink/30 text-ink/70 hover:border-ink hover:text-ink",
              )}
            >
              {o.label}
              <span className={cn("ml-[calc(6*var(--u))] tabular-nums", on ? "text-bone/60" : "text-mute")}>{COUNT[o.id]}</span>
            </button>
          );
        })}
      </div>
      {/* Says the result to screen readers when the filter changes. */}
      <p aria-live="polite" className="sr-only">
        {shown.length} {shown.length === 1 ? "project" : "projects"} shown
      </p>
      <ul key={listKey} className="relative grid gap-x-[calc(27*var(--u))] gap-y-[calc(45*var(--u))] md:grid-cols-2 lg:grid-cols-3">
        {/* popLayout: a card that leaves is lifted out at once, so the rest can glide up into its place. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={still ? false : "position"}
              exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: GLIDE }}
            >
              <ProjectCard project={p} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
