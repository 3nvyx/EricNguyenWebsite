export type Project = {
  slug: string;
  title: string;
  line: string;
  href: string;
  /** Shown as "[year] stack" under the line. */
  year: number;
  stack: string;
  /** Path under /public. Missing files fall back to a placeholder. */
  media: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "slap",
    title: "Slap",
    line: "Live captions for any classroom",
    href: "https://github.com/3nvyx/slap",
    year: 2026,
    stack: "ESP32 / Node / React",
    media: "/media/slap.gif",
  },
  {
    slug: "honors",
    title: "Honors",
    line: "Eligibility for 17 honor societies, offline",
    href: "https://occ-honor-societies-transcript-anal.vercel.app",
    year: 2026,
    stack: "Python / Access",
    media: "/media/honors.gif",
  },
  {
    slug: "sevis",
    title: "Sevis",
    line: "Where international students study, mapped",
    href: "https://github.com/3nvyx/SEVIS-data-maping-trends",
    year: 2026,
    stack: "Python / Next.js",
    media: "/media/sevis.gif",
  },
  {
    slug: "daisy",
    title: "Daisy",
    line: "Scene-based RGB lighting control",
    href: "https://github.com/3nvyx/daisy-light-control-system",
    year: 2026,
    stack: "TypeScript / Next.js",
    media: "/media/daisy.gif",
  },
  {
    slug: "carousel",
    title: "Carousel",
    line: "Cover-flow carousel component",
    href: "https://github.com/3nvyx/Interesting-Carousel",
    year: 2025,
    stack: "TypeScript / React",
    media: "/media/carousel.gif",
  },
];

export const LINKS = [
  { label: "GitHub", href: "https://github.com/3nvyx" },
  { label: "Resume", href: "/Resume_Eric_Nguyen_Feb_25_2026.pdf" },
  { label: "Mail", href: "mailto:envn001@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ericnguyen342/" },
];

export const EMAIL = "envn001@gmail.com";

/**
 * Coffee chat booking calendar: the Google Calendar appointment schedule's embed URL, shown in a
 * panel on the page. Get it from the schedule's Share → Website embed → Inline, and copy the
 * iframe's src (https://calendar.google.com/calendar/appointments/schedules/…?gv=true).
 * Empty until that exists; the link then falls back to COFFEE_CHAT_INVITE.
 */
export const COFFEE_CHAT_EMBED = "";

/** Fallback: a pre-filled Calendar invite with Eric as the guest. */
export const COFFEE_CHAT_INVITE =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Coffee chat with Eric Nguyen") +
  "&details=" + encodeURIComponent("30 minutes, video or in person around Irvine.") +
  "&add=" + encodeURIComponent("envn001@gmail.com");
