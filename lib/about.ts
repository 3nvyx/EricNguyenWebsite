// About page content, from the resumes (Feb 2026 and earlier), with the degree updated to computer engineering.

export type AboutEntry = {
  when: string;
  title: string;
  where?: string;
  line?: string;
  link?: { label: string; href: string };
};

/** compact: one-line rows (awards, skills) instead of the full title / where / line block. */
export type AboutSection = { label: string; entries: AboutEntry[]; compact?: boolean };

// DRAFT: first-person intro shown above the sections. Edit freely; [brackets] are for Eric to fill.
export const ABOUT_INTRO: string[] = [
  "I'm Eric, a computer engineering student at Orange Coast College, transferring to UC Irvine in fall 2027.",
  "Before school I spent three years in Ho Chi Minh City at Q Industries, working with distributors and suppliers across borders on pricing, shipping and partnerships. [One line on what that taught you.]",
  "At OCC I founded Iota Xi, the first two-year honor society for computer science, and led the teams behind HackCC and Spookathon. I like work that crosses hardware and software; SLAP!, a small device that captions a lecture live, is the one I'm proudest of so far.",
  "I'm looking for a summer 2027 internship in [embedded / product / software engineering]. Off the clock: espresso tonics, photography, tennis.",
];

export const ABOUT: AboutSection[] = [
  {
    label: "EXPERIENCE",
    entries: [
      {
        when: "2024 – now",
        title: "Product & Solutions Engineer",
        where: "Plethora",
        line: "Client sites for Pickle Banh Mi Co. and Q Industries, and internal workflow tools for Chef Nourish, from gathering requirements to shipping.",
      },
      {
        when: "2024 – now",
        title: "Data & Operations Assistant",
        where: "Garrison Honors Center, OCC",
        line: "Records and outreach for 3,000+ students; JavaScript automation that cut manual processing about twelvefold.",
      },
      {
        when: "2025",
        title: "AI Research Fellow",
        where: "Giles T. Brown Research Symposium",
        line: "Condensed chain-of-thought: distilled DeepSeek-R1 reasoning through Qwen2.5-32B-Instruct to tune DeepSeek-R1-Distill-Qwen-7B. AIME 2024 pass@1 from 46.7% to 53.3%.",
      },
      {
        when: "2020 – 2023",
        title: "International Partnerships Coordinator",
        where: "Q Industries, Ho Chi Minh City",
        line: "Grew sales 10% by securing distributorships with international brands and tightening quotes and shipping.",
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
        when: "2024 – 2025",
        title: "Lead Organizer",
        where: "HackCC 2024, Spookathon 2025",
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
      { when: "2025", title: "OCC Event of the Year, HackCC and Spookathon" },
      { when: "2025", title: "Garrison Fellow" },
      { when: "2025", title: "Joseph R. Kroll Award" },
      { when: "2024 – 25", title: "PTK All-California Academic Honor Roll" },
    ],
  },
  {
    label: "SKILLS",
    compact: true,
    entries: [
      { when: "Programming", title: "Python, C++, Java, JavaScript / TypeScript, HTML / CSS" },
      { when: "Tools", title: "Git, Node.js, React, Next.js, Tailwind, Figma" },
      { when: "CAD and fabrication", title: "Rhino, SolidWorks, Fusion 360, Bambu Studio (3D printing)" },
    ],
  },
  {
    label: "EDUCATION",
    entries: [
      {
        when: "2024 – 2027",
        title: "Computer Engineering",
        where: "Orange Coast College, Costa Mesa",
        line: "Transferring to UC Irvine in fall 2027. GPA 3.72.",
      },
    ],
  },
];
