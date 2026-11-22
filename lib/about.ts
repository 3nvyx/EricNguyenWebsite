// About page content, from the resumes (Feb 2026 and earlier).

import type { Block } from "@/lib/content";

export type AboutEntry = {
  when: string;
  title: string;
  where?: string;
  line?: string;
  link?: { label: string; href: string };
  /** Projects (by slug, lib/projects.ts) whose recap videos are previewed under the entry. */
  recaps?: string[];
};

/**
 * compact: one-line rows (awards, skills) instead of the full title / where / line block.
 * featured: shown in the About block (home's preview and the top of the full page); the others
 * follow the story on the full page (/about/more).
 * groups: a grid of small groups (skills), each `when` as a label over its comma-separated `title`.
 */
export type AboutSection = {
  label: string;
  entries: AboutEntry[];
  compact?: boolean;
  featured?: boolean;
  groups?: boolean;
};

// The full About page's story, in the first person: the statement, set large like a project's,
// then the write-up under it, with photos from the work it mentions (their captions are the ones
// on those projects' own pages).
export const ABOUT_STATEMENT =
  "I'm an extremely curious person. I like figuring out how things naturally flow, and the order behind why the world works the way it does.";

export const ABOUT_STORY: Block[] = [
  "I like working on a team and building a methodical plan to hit a project's goals and deadlines. I've picked up a wide range of skills along the way, and I bring all of them to whatever I'm working on.",
  "In business development, my work led to an increase of up to 10% in yearly recurring revenue. Then I went back to college, where I'm a student worker in a department with one full-time staff member, and I automate a lot of its work. For a client, I took on an extremely hard (but interesting) project that automated a large part of their business and let them scale.",
  {
    figures: [
      { src: "/media/honors/work-screen.png", caption: "Honors Eligibility: transcript fields beside the source document, for review", aspect: "4 / 3" },
      { src: "/media/chef-nourish/menu.jpg", caption: "Chef Nourish: writing a week's menu, with the cut sheet filling in beside it", aspect: "4 / 3" },
    ],
  },
  "I've also led and won many hackathons.",
  {
    figures: [
      { src: "/media/luyten/spacetimedb-team.jpg", caption: "Our team with the SpacetimeDB folks at Cal Hacks", aspect: "4 / 3" },
      { src: "/media/zap/team-table.jpg", caption: "ZAP!: Nadia, Kevin and me at table 42, with the pitch site on one laptop and the headset's view on the other", aspect: "4 / 3" },
    ],
  },
];

// The lead of the About block, on home's preview and at the top of the full page: who Eric is and
// the internship search, set large beside the photo, with the skills under it.
export const ABOUT_LEAD = "I'm Eric, a product engineer working across hardware and software. Currently looking for a summer 2027 internship.";

export const ABOUT: AboutSection[] = [
  {
    label: "SKILLS",
    compact: true,
    featured: true,
    groups: true,
    entries: [
      { when: "Languages", title: "TypeScript, JavaScript, Python, C++, SQL, HTML / CSS" },
      { when: "Frontend", title: "React, Next.js, SvelteKit, React Router, Vite, Tailwind CSS, shadcn/ui" },
      { when: "Backend and data", title: "Node.js, Hono, WebSockets, PostgreSQL, SpacetimeDB, Supabase, Neon" },
      { when: "AI and agents", title: "Claude Agent SDK, Vercel AI SDK, OpenAI, Fetch.ai uAgents, LoRA fine\u2011tuning" },
      { when: "Hardware and tools", title: "ESP32-S3, Arduino, Git, Docker, Vercel, PostHog" },
      { when: "Design and fabrication", title: "Figma, Rhino, SolidWorks, Fusion 360, Bambu Studio (3D printing)" },
    ],
  },
  {
    label: "EXPERIENCE",
    entries: [
      {
        when: "2024 – now",
        title: "Operations Assistant & Automation Developer",
        where: "Garrison Honors Center, OCC",
        line: "An offline Python desktop app that checks eligibility for 17 honor societies, replacing manual review of 300+ applications a semester and writing results back to the registrar's 20-year-old Access database.",
      },
      {
        when: "2024 – 2026",
        title: "Product & Solutions Engineer",
        where: "Plethora",
        line: "A software startup that pivoted several times. Along the way I built client work from requirements to launch, including the Q Industries website and the system Chef Nourish's kitchen runs on.",
      },
      {
        when: "2025",
        title: "AI Research Fellow",
        where: "Giles T. Brown Research Symposium",
        line: "Condensed chain-of-thought: distilled DeepSeek-R1 reasoning through Qwen2.5-32B-Instruct to tune DeepSeek-R1-Distill-Qwen-7B. AIME 2024 pass@1 from 46.7% to 53.3%.",
      },
    ],
  },
  {
    label: "LEADERSHIP",
    entries: [
      {
        when: "2024 – now",
        title: "Founder and President",
        where: "Iota Xi, OCC",
        line: "The first two-year honor society for computer science; career opportunities for 300+ students through Amazon, Sony, Kickstarter and NASA.",
      },
      {
        when: "2024 – 2026",
        title: "Lead Organizer",
        where: "HackCC 2024, Spookathon 2025, OCC Hacks 2026",
        line: "Led a six-department team across colleges to run 30-hour hackathons for 100+ attendees; raised $21,000.",
        recaps: ["hackcc", "spookathon"],
      },
      {
        when: "2024 – now",
        title: "Treasurer and Tech Officer",
        where: "Phi Theta Kappa, Alpha Beta Gamma, Mu Alpha Theta",
        line: "A ~$90K budget across three honor societies; fee-waiver programs, LaTeX and productivity workshops, and the chapter websites.",
      },
    ],
  },
  {
    label: "AWARDS",
    compact: true,
    entries: [
      { when: "2025", title: "Sharon K. Donoff Student Leader of the Year" },
      { when: "2025", title: "OCC Event of the Year, HackCC" },
      { when: "2025", title: "Garrison Fellow" },
      { when: "2025", title: "Joseph R. Kroll Award" },
      { when: "2024 – 25", title: "PTK All-California Academic Honor Roll" },
    ],
  },
];

export const FEATURED_ABOUT = ABOUT.filter((s) => s.featured);
