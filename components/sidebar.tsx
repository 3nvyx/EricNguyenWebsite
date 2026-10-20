"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EMAIL, LINKS } from "@/lib/projects";
import { CoffeeChat } from "@/components/coffee-chat";
import { ChromeName } from "@/components/chrome-name";
import { DialNav, type DialItem } from "@/components/dial-nav";
import { cn, ease, hoverLink } from "@/lib/utils";

const PAGES: DialItem[] = [
  { label: "PROJECTS", href: "/" },
  { label: "RESUME", href: "/resume" },
];

const [GITHUB, RESUME, , LINKEDIN] = LINKS;
// Brand marks from Simple Icons (CC0), 24x24.
const SOCIAL = [
  {
    label: "GitHub",
    href: GITHUB.href,
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "LinkedIn",
    href: LINKEDIN.href,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
];

/** The left column, shared by every page. Fixed on desktop so only the right side scrolls. */
export function Sidebar() {
  const pathname = usePathname();
  const active = Math.max(0, PAGES.findIndex((p) => p.href === pathname));

  // Clicking the email copies it. "Copied to clipboard" holds until the pointer leaves the
  // email (or focus moves away), then it returns to the resting mail icon and address.
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard API blocked (insecure context or permissions): fall back to a hidden textarea.
      const t = document.createElement("textarea");
      t.value = EMAIL;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
  };

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease }}
      className={cn(
        "flex flex-col px-5 pt-8",
        "md:fixed md:top-0 md:bottom-0 md:left-[calc(45*var(--u))] md:z-10 md:w-[calc(428*var(--u))] md:justify-between md:px-0",
        "md:pt-[calc(64*var(--u))] md:pb-[calc(45*var(--u))]",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-[calc(24*var(--u))] gap-y-1">
          <ChromeName className="fw-name" />
          <ul className="flex translate-y-[calc(2*var(--u))] items-center gap-[calc(18*var(--u))]">
            {SOCIAL.map((s) => (
              <li key={s.label} className="flex">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex text-[#3a3a38] transition-colors duration-200 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[calc(22*var(--u))]">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="fw-small mt-[calc(8*var(--u))] flex items-center gap-[calc(14*var(--u))]">
          <a
            href={RESUME.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ink px-[calc(8*var(--u))] py-[calc(3*var(--u))] tracking-[0.04em] text-bone transition-colors duration-200 hover:bg-[#3a3a38]"
          >
            RESUME<span className="ml-0.5 align-top text-[0.75em]">↗</span>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            onMouseLeave={() => setCopied(false)}
            onBlur={() => setCopied(false)}
            aria-label={`Copy email address ${EMAIL}`}
            className={cn("group flex cursor-pointer items-center gap-[calc(6*var(--u))]", hoverLink)}
          >
            {/* Material Symbols icons (Apache 2.0), flat like the GitHub and LinkedIn marks:
                mail at rest, copy on hover, a check right after copying. */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-[calc(15*var(--u))] shrink-0 text-[#3a3a38] transition-colors duration-200 group-hover:text-ink"
            >
              <path
                d={
                  copied
                    ? "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    : "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                }
                className={copied ? undefined : "group-hover:hidden group-focus-visible:hidden"}
              />
              {!copied && (
                <path
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                  className="hidden group-hover:inline group-focus-visible:inline"
                />
              )}
            </svg>
            <span aria-live="polite">{copied ? "Copied to clipboard" : EMAIL}</span>
          </button>
        </div>
        <div className="fw-small mt-[calc(18*var(--u))] max-w-[calc(320*var(--u))] space-y-[calc(10*var(--u))] text-mute">
          <p>
            Computer engineering student at Orange Coast College, transferring to UC Irvine
            in fall 2027.
          </p>
          <p className="text-ink underline underline-offset-4">Currently seeking a summer 2027 internship.</p>
          <p>Off the clock: espresso tonics, photography, tennis.</p>
          <p>
            <CoffeeChat className="text-ink" />
          </p>
        </div>
      </div>

      {/* Middle left. */}
      <div className="mt-[calc(36*var(--u))] md:absolute md:top-1/2 md:right-0 md:left-0 md:mt-0 md:-translate-y-1/2">
        <DialNav items={PAGES} active={active} />
      </div>
    </motion.aside>
  );
}
