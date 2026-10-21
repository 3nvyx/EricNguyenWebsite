// About page content, from the resumes (Feb 2026 and earlier).

export type AboutEntry = {
  when: string;
  title: string;
  where?: string;
  line?: string;
  link?: { label: string; href: string };
};

/** compact: one-line rows (awards, skills) instead of the full title / where / line block. */
export type AboutSection = { label: string; entries: AboutEntry[]; compact?: boolean };

// First-person intro shown above the sections: who Eric is, not the resume (that's below).
export const ABOUT_INTRO: string[] = [
  "I'm Eric. I make things people actually pick up and use, and that could mean anything.",
  "I do my best work next to the people who'll use it. I sit with someone doing a job the slow way, find the part that hurts, and make it disappear, in code, in hardware, or both.",
  "I also love getting people into a room together. I started Iota Xi, my college's computer science honor society, and I've led three hackathons since. The best part of building is who you build it with.",
];

export const ABOUT: AboutSection[] = [
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
        link: { label: "Recap video", href: "https://www.youtube.com/watch?v=vT81BYkjc8k" },
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
  {
    label: "SKILLS",
    compact: true,
    entries: [
      { when: "Languages", title: "TypeScript, JavaScript, Python, C++, SQL, HTML / CSS" },
      { when: "Frontend", title: "React, Next.js, React Router, Tailwind CSS, shadcn/ui" },
      { when: "Backend and data", title: "Node.js, Hono, WebSockets, PostgreSQL, Supabase, Neon" },
      { when: "Hardware and tools", title: "ESP32-S3, Arduino, Git, Docker, Vercel, PostHog" },
      { when: "Design and fabrication", title: "Figma, Rhino, SolidWorks, Fusion 360, Bambu Studio (3D printing)" },
    ],
  },
];
