import Link from "next/link";
import { LINKS } from "@/lib/projects";
import { ICON } from "@/lib/icons";
import { CoffeeChat } from "@/components/coffee-chat";
import { CopyEmailIcon } from "@/components/copy-email";
import { LocalTime } from "@/components/local-time";

const [GITHUB, RESUME, , LINKEDIN] = LINKS;

const link = "underline-offset-4 hover:underline";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

const SOCIAL = [
  { label: "GitHub", href: GITHUB.href, path: ICON.github },
  { label: "LinkedIn", href: LINKEDIN.href, path: ICON.linkedin },
];

/**
 * Site footer, modelled on the Rakuten Fashion Week footer: a full-width ink bar, the name in
 * the left column, three stacked link columns starting at the main column, and social marks
 * plus copyright on the right. Measurements are design pixels at 1440 (see globals.css).
 */
export function Footer() {
  return (
    // Selection is ink-on-bone site-wide (globals.css), which vanishes on this ink bar; flip it here.
    <footer className="fw bg-ink text-bone selection:bg-bone selection:text-ink">
      <div className="grid gap-8 px-5 py-8 md:grid-cols-[calc(36.5vw-45*var(--u))_minmax(0,1fr)] md:gap-0 md:px-[calc(45*var(--u))] md:py-[calc(26.25*var(--u))]">
        <div className="self-start">
          <Link href="/" className="font-display fw-small text-[calc(15*var(--u))] tracking-tight">
            Eric Nguyen
          </Link>
          <LocalTime className="fw-small mt-[calc(6*var(--u))] opacity-70" />
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-[calc(69*var(--u))]">
          <nav aria-label="Footer" className="fw-small flex gap-[calc(27*var(--u))]">
            <ul className="flex flex-col">
              <li><Link href="/about" className={link}>ABOUT</Link></li>
              <li><Link href="/projects" className={link}>PROJECTS</Link></li>
              {/* <li><Link href="/blogs" className={link}>BLOGS</Link></li> */}
              <li><Link href="/play" className={link}>PLAY</Link></li>
            </ul>
            <ul className="flex flex-col">
              <li><a href={RESUME.href} {...ext} className={link}>RESUME</a></li>
              <li><CoffeeChat className="hover:text-bone">COFFEE CHAT</CoffeeChat></li>
            </ul>
            <ul className="flex flex-col">
              <li><a href={GITHUB.href} {...ext} className={link}>GITHUB</a></li>
              <li><a href={LINKEDIN.href} {...ext} className={link}>LINKEDIN</a></li>
            </ul>
          </nav>

          <div className="fw-small md:w-[calc(279*var(--u))]">
            <ul className="flex items-center gap-[calc(11.25*var(--u))]">
              <li className="flex">
                <CopyEmailIcon
                  className="flex cursor-pointer opacity-90 transition-opacity hover:opacity-100"
                  iconClassName="size-[calc(20*var(--u))]"
                />
              </li>
              {SOCIAL.map((s) => (
                <li key={s.label} className="flex">
                  <a href={s.href} {...ext} aria-label={s.label} className="opacity-90 transition-opacity hover:opacity-100">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[calc(20*var(--u))]">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-[calc(14*var(--u))]">
              © {new Date().getFullYear()} Eric Nguyen
              <br />
              Irvine, California
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
