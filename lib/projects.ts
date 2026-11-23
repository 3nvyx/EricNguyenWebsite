/**
 * The kinds of project the grid can be filtered by (components/project-grid.tsx), in the order
 * the filter lists them. Every project has at least one.
 */
export const PROJECT_TYPES = [
  { id: "hackathon", label: "Hackathons" },
  { id: "client", label: "Client work" },
  { id: "hardware", label: "Hardware" },
  { id: "events", label: "Events" },
  { id: "research", label: "Research" },
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number]["id"];

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
  /** The broad kinds of work it is, for the grid's filter (PROJECT_TYPES). One or two. */
  types: ProjectType[];
  stack: string;
  /** Path under /public. Missing files fall back to a placeholder. */
  media: string;
  /** Shape of the card image, as a CSS aspect ratio; match it to the recording. Default 16 / 9. */
  aspect?: string;
};

/** Newest first, by when each was started. Which four are featured is set in lib/featured.ts. */
export const PROJECTS: Project[] = [
  {
    slug: "zap",
    title: "ZAP!",
    line: "A spatial knowledge space for Meta Quest: say a topic, throw it into place, and step inside its world",
    href: "https://zap-eosin.vercel.app",
    dates: "Nov 2026",
    tags: ["XR", "Meta Quest", "Voice AI", "Hackathon"],
    types: ["hackathon"],
    stack: "Unity / C# / Python / World Labs",
    // The name animation from the headset build (ZapIntro.mp4), then three moments from the
    // headset tour: the Great Wall, the wormhole to the biology lab, the ribosome.
    media: "/media/zap-intro.mp4",
  },
  {
    slug: "luyten",
    title: "Cal Hacks Winner: Luyten – Autonomous Finance",
    line: "Agentic finance for high-growth startups, so the books close while teams build",
    href: "https://3nvyx.github.io/luyten/",
    dates: "Oct 2026",
    tags: ["AI agents", "Fintech", "Full stack", "Hackathon"],
    types: ["hackathon"],
    stack: "SvelteKit / SpacetimeDB / Claude Agent SDK",
    media: "/media/luyten.gif",
    aspect: "16 / 10",
  },
  {
    slug: "nijello",
    title: "Nijello",
    line: "A Cal Hacks side project: a Scrabble auction bot trained by evolution on millions of simulated matches",
    href: "https://github.com/3nvyx/nijello-scabble-bot",
    dates: "Oct 2026",
    tags: ["AI", "Evolution", "Simulation", "Hackathon"],
    types: ["hackathon"],
    stack: "TypeScript / Node / SpacetimeDB",
    media: "/media/nijello/arena.jpg",
  },
  {
    slug: "slap",
    title: "SLAP!",
    line: "Live captions for any classroom",
    href: "https://github.com/3nvyx/slap",
    dates: "Oct 2026",
    tags: ["Hardware", "Embedded", "Real-time", "AI"],
    types: ["hackathon", "hardware"],
    stack: "ESP32 / Node / React",
    media: "/media/slap.gif",
  },
  {
    slug: "nfc-card",
    title: "NFC Business Card",
    line: "A printed business card with an NFC tag sealed inside",
    dates: "Sep – Oct 2026",
    tags: ["Hardware", "3D printing", "CAD"],
    types: ["hardware"],
    stack: "Python / manifold3d / Bambu Studio",
    media: "/media/nfc-card/preview.png",
  },
  {
    slug: "honors",
    title: "Honors Eligibility",
    line: "Checks a transcript against 17 honor societies, fully offline",
    dates: "Aug 2026 – now",
    tags: ["Desktop app", "Data", "Automation"],
    types: ["client"],
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
    types: ["events"],
    stack: "Next.js / Supabase / Tailwind",
    media: "/media/occhacks.gif",
    aspect: "16 / 10",
  },
  {
    slug: "chef-nourish",
    title: "Chef Nourish",
    line: "Meal production for a private chef kitchen, from client diets to delivery labels",
    dates: "May – Sep 2026",
    tags: ["Client work", "Full stack", "AI", "Operations"],
    types: ["client"],
    stack: "Next.js / Postgres / OpenAI",
    media: "/media/chef-nourish.gif",
    aspect: "4 / 3",
  },
  {
    slug: "nyx",
    title: "Nyx",
    line: "A live dashboard for an autonomous bug-hunting agent",
    href: "https://github.com/3nvyx/nyx",
    dates: "Apr 2026",
    tags: ["Security", "AI", "Real-time", "Hackathon"],
    types: ["hackathon"],
    stack: "Next.js / Three.js / Pusher",
    media: "/media/nyx.gif",
  },
  {
    slug: "q-industries",
    title: "Q Industries",
    line: "A Vietnamese-language site for an industrial engineering supplier",
    dates: "Mar – May 2026",
    tags: ["Web", "Client work", "Vietnamese"],
    types: ["client"],
    stack: "Next.js / Tailwind / Resend",
    media: "/media/q-industries.gif",
  },
  {
    slug: "glow-box",
    title: "Glow Box",
    line: "A lamp of printed PLA and CNC-cut oak, with 768 light settings",
    dates: "Jan 2026",
    tags: ["Product design", "3D printing", "CNC", "Lighting"],
    types: ["hardware"],
    stack: "Bambu P1S / CNC / PLA / Oak",
    media: "/media/glow-box/shelf.jpg",
    aspect: "4 / 3",
  },
  {
    slug: "spookathon",
    title: "Spookathon 2025",
    line: "The 30-hour follow-up to HackCC, for 100+ hackers",
    href: "https://www.youtube.com/watch?v=I9FVxneDnL4",
    dates: "2025",
    tags: ["Project management", "Leadership", "Events"],
    types: ["events"],
    stack: "Project management / Sponsorship / Logistics",
    media: "/media/spookathon.gif",
  },
  {
    slug: "condensed-cot",
    title: "Condensing Chain-of-Thought",
    line: "Research: a 7B model that reasons in fewer, sharper steps scores higher on the AIME",
    dates: "Jan – Apr 2025",
    tags: ["Research", "AI", "LLMs"],
    types: ["research"],
    stack: "LoRA / DeepSeek-R1 / Qwen2.5",
    media: "/media/research/poster.jpg",
    aspect: "4 / 3",
  },
  {
    slug: "hackcc",
    title: "HackCC 2024",
    line: "A 30-hour hackathon run by students across community colleges",
    href: "https://www.youtube.com/watch?v=vT81BYkjc8k",
    dates: "2024",
    tags: ["Project management", "Leadership", "Events"],
    types: ["events"],
    stack: "Project management / Sponsorship / Logistics",
    media: "/media/hackcc.gif",
  },
  {
    slug: "pickle-banh-mi",
    title: "Pickle Banh Mi",
    line: "A website design for a local banh mi shop, made to bring in orders",
    dates: "Design only",
    tags: ["UI design", "Client work", "Figma"],
    types: ["client"],
    stack: "Figma",
    media: "/media/pickle-banh-mi/hero.jpg",
  },
];

export const LINKS = [
  { label: "GitHub", href: "https://github.com/3nvyx" },
  { label: "Resume", href: "/Eric_Nguyen_Resume.pdf" },
  { label: "Mail", href: "mailto:envn001@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/eric-nguyennn/" },
];

export const EMAIL = "envn001@gmail.com";
