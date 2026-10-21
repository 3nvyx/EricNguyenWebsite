"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EMAIL, LINKS } from "@/lib/projects";
import { CoffeeChat } from "@/components/coffee-chat";
import { useCopyEmail } from "@/components/copy-email";
import { ICON } from "@/lib/icons";
import { ChromeName } from "@/components/chrome-name";
import { PageTabs, type PageTab } from "@/components/page-tabs";
import { cn, ease, hoverLink } from "@/lib/utils";

const PAGES: PageTab[] = [
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/" },
  { label: "BLOGS", href: "/blogs" },
];

const [GITHUB, RESUME, , LINKEDIN] = LINKS;
const SOCIAL = [
  {
    label: "GitHub",
    href: GITHUB.href,
    path: ICON.github,
  },
  {
    label: "LinkedIn",
    href: LINKEDIN.href,
    path: ICON.linkedin,
  },
];

/** The left column, shared by every page. Fixed on desktop so only the right side scrolls. */
export function Sidebar() {
  const pathname = usePathname();
  // Projects is home; a blog post under /blogs/... still marks BLOGS as current.
  const active = Math.max(
    0,
    PAGES.findIndex((p) => (p.href === "/" ? pathname === "/" : pathname.startsWith(p.href))),
  );

  // Clicking the email copies it. "Copied to clipboard" holds until the pointer leaves the
  // email (or focus moves away), then it returns to the resting mail icon and address.
  const { copied, copy: copyEmail, reset: resetCopied } = useCopyEmail();

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease }}
      className={cn(
        "flex flex-col px-5 pt-8",
        "md:sticky md:top-0 md:z-10 md:ml-[calc(45*var(--u))] md:h-dvh md:w-[calc(428*var(--u))] md:self-start md:justify-between md:px-0",
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
            className="bg-[#3a3a38] px-[calc(8*var(--u))] py-[calc(3*var(--u))] tracking-[0.04em] text-bone transition-colors duration-200 hover:bg-[#262625]"
          >
            RESUME<span className="ml-0.5 align-top text-[0.75em]">↗</span>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            onMouseLeave={resetCopied}
            onBlur={resetCopied}
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
                    ? ICON.check
                    : ICON.mail
                }
                className={copied ? undefined : "group-hover:hidden group-focus-visible:hidden"}
              />
              {!copied && (
                <path
                  d={ICON.copy}
                  className="hidden group-hover:inline group-focus-visible:inline"
                />
              )}
            </svg>
            <span aria-live="polite">{copied ? "Copied to clipboard" : EMAIL}</span>
          </button>
        </div>
        <div className="fw-small mt-[calc(18*var(--u))] max-w-[calc(320*var(--u))] space-y-[calc(10*var(--u))] text-mute">
          <p>
            I am an engineer making hardware and software that make slow, manual work
            disappear.{" "}
            <span className="text-ink underline underline-offset-4">Currently seeking a summer 2027 internship.</span>
          </p>
          <p>Off the clock: espresso tonics, photography, tennis.</p>
          <p>
            <CoffeeChat className="text-ink" />
          </p>
        </div>
      </div>

      {/* Middle left. */}
      <div className="mt-[calc(36*var(--u))] md:absolute md:top-1/2 md:right-0 md:left-0 md:mt-0 md:-translate-y-1/2">
        <PageTabs items={PAGES} active={active} />
      </div>
    </motion.aside>
  );
}
