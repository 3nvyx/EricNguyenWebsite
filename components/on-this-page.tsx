"use client";

import { useEffect, useState } from "react";
import { cn, hoverLink } from "@/lib/utils";

/**
 * "On this page": the write-up's sections, styled like the page tabs. The section being read
 * is in ink; the rest are gray.
 */
export function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    // The current section is the last heading that has scrolled past the top third of the screen.
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <p className="fw-small uppercase text-mute">On this page</p>
      <ul className="fw-text mt-[calc(10*var(--u))]">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={cn(hoverLink, s.id === active ? "text-ink" : "fw-nav-off")}>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
