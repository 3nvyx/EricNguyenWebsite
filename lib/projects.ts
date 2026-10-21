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
    slug: "nfc-card",
    title: "NFC Business Card",
    line: "A printed business card with an NFC tag sealed inside",
    dates: "Sep – Oct 2026",
    tags: ["Hardware", "3D printing", "CAD"],
    stack: "Python / manifold3d / Bambu Studio",
    media: "/media/nfc-card/preview.png",
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
    slug: "occhacks",
    title: "OCC Hacks",
    line: "The site, sign-ups and organizer dashboard for a 200-hacker event",
    href: "https://www.occhacks.com",
    dates: "May – Oct 2026",
    tags: ["Web", "Full stack", "Events"],
    stack: "Next.js / Supabase / Tailwind",
    media: "/media/occhacks.gif",
    aspect: "16 / 10",
  },
  {
    slug: "hackcc",
    title: "HackCC 2024",
    line: "A 30-hour hackathon run by students across community colleges",
    href: "https://www.youtube.com/watch?v=vT81BYkjc8k",
    dates: "2024",
    tags: ["Project management", "Leadership", "Events"],
    stack: "Project management / Sponsorship / Logistics",
    media: "/media/hackcc.jpg",
  },
  {
    slug: "spookathon",
    title: "Spookathon 2025",
    line: "The 30-hour follow-up to HackCC, for 100+ hackers",
    href: "https://www.youtube.com/watch?v=vT81BYkjc8k",
    dates: "2025",
    tags: ["Project management", "Leadership", "Events"],
    stack: "Project management / Sponsorship / Logistics",
    media: "/media/spookathon.jpg",
  },
  {
    slug: "q-industries",
    title: "Q Industries",
    line: "A Vietnamese-language site for an industrial engineering supplier",
    dates: "Mar – May 2026",
    tags: ["Web", "Client work", "Vietnamese"],
    stack: "Next.js / Tailwind / Resend",
    media: "/media/q-industries.png",
  },
  {
    slug: "pickle-banh-mi",
    title: "Pickle Banh Mi",
    line: "A website design for a local banh mi shop, made to bring in orders",
    dates: "Design only",
    tags: ["UI design", "Client work", "Figma"],
    stack: "Figma",
    media: "/media/pickle-banh-mi/hero.jpg",
  },
  {
    slug: "nyx",
    title: "Nyx",
    line: "A live dashboard for an autonomous bug-hunting agent",
    href: "https://github.com/3nvyx/nyx",
    dates: "Apr 2026",
    tags: ["Security", "AI", "Real-time", "Hackathon"],
    stack: "Next.js / Three.js / Pusher",
    media: "/media/nyx.gif",
  },
  {
    slug: "condensed-cot",
    title: "Condensing Chain-of-Thought",
    line: "Research: a 7B model that reasons in fewer, sharper steps scores higher on the AIME",
    dates: "Jan – Apr 2025",
    tags: ["Research", "AI", "LLMs"],
    stack: "LoRA / DeepSeek-R1 / Qwen2.5",
    media: "/media/research/poster.jpg",
    aspect: "4 / 3",
  },
  {
    slug: "glow-box",
    title: "Glow Box",
    line: "A lamp of printed PLA and CNC-cut oak, with 768 light settings",
    dates: "Jan 2026",
    tags: ["Product design", "3D printing", "CNC", "Lighting"],
    stack: "Bambu P1S / CNC / PLA / Oak",
    media: "/media/glow-box/shelf.jpg",
    aspect: "4 / 3",
  },
];

export const LINKS = [
  { label: "GitHub", href: "https://github.com/3nvyx" },
  { label: "Resume", href: "/Resume_Eric_Nguyen_Feb_25_2026.pdf" },
  { label: "Mail", href: "mailto:envn001@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ericnguyen342/" },
];

export const EMAIL = "envn001@gmail.com";
