export type Project = {
  slug: string;
  title: string;
  line: string;
  /** Public link. Omitted for private work (client projects, private repos). */
  href?: string;
  /** When it was built, from the repo's commit history. Shown on the card's label line. */
  dates: string;
  /** Shown as hashtags under the title. */
  tags: string[];
  stack: string;
  /** Path under /public. Missing files fall back to a placeholder. */
  media: string;
  /** Shape of the card image, as a CSS aspect ratio; match it to the recording. Default 16 / 9. */
  aspect?: string;
};

/** The first three are the featured rows; the rest are listed under MORE. */
export const PROJECTS: Project[] = [
  {
    slug: "slap",
    title: "SLAP!",
    line: "Live captions for any classroom",
    href: "https://github.com/3nvyx/slap",
    dates: "Oct 2026",
    tags: ["Hardware", "Embedded", "Real-time", "AI"],
    stack: "ESP32 / Node / React",
    media: "/media/slap.gif",
  },
  {
    slug: "chef-nourish",
    title: "Chef Nourish",
    line: "Meal production for a private chef kitchen, from client diets to delivery labels",
    dates: "May – Sep 2026",
    tags: ["Client work", "Full stack", "AI", "Operations"],
    stack: "Next.js / Postgres / OpenAI",
    media: "/media/chef-nourish.gif",
    aspect: "4 / 3",
  },
  {
    slug: "honors",
    title: "Honors Eligibility",
    line: "Checks a transcript against 17 honor societies, fully offline",
    dates: "Aug 2026 – now",
    tags: ["Desktop app", "Data", "Automation"],
    stack: "Python / Access",
    media: "/media/honors.gif",
    aspect: "16 / 10",
  },
  {
    slug: "sevis",
    title: "Sevis",
    line: "Where international students study, mapped",
    href: "https://github.com/3nvyx/SEVIS-data-maping-trends",
    dates: "Sep 2026",
    tags: ["Data", "Visualization"],
    stack: "Python / Next.js",
    media: "/media/sevis.gif",
  },
  {
    slug: "daisy",
    title: "Daisy",
    line: "Scene-based RGB lighting control",
    href: "https://github.com/3nvyx/daisy-light-control-system",
    dates: "Sep 2026",
    tags: ["Lighting", "UI"],
    stack: "TypeScript / Next.js",
    media: "/media/daisy.gif",
  },
  {
    slug: "carousel",
    title: "Carousel",
    line: "Cover-flow carousel component",
    href: "https://github.com/3nvyx/Interesting-Carousel",
    dates: "Nov 2025",
    tags: ["UI", "Component"],
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
