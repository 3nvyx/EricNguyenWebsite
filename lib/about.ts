// About page content, from the resume (Feb 2026), with the degree updated to computer engineering.

export type AboutEntry = {
  when: string;
  title: string;
  where: string;
  line: string;
};

export type AboutSection = { label: string; entries: AboutEntry[] };

export const ABOUT: AboutSection[] = [
  {
    label: "EDUCATION",
    entries: [
      {
        when: "2024 – 2027",
        title: "Computer Engineering",
        where: "Orange Coast College, Costa Mesa",
        line: "Transferring to UC Irvine in fall 2027. GPA 3.72. Garrison Fellow, Student Leader of the Year 2025.",
      },
    ],
  },
  {
    label: "EXPERIENCE",
    entries: [
      {
        when: "2024 – now",
        title: "Data & Operations Assistant",
        where: "Garrison Honors Center, OCC",
        line: "Records for 3,000+ students; JavaScript automation that cut manual processing about twelvefold.",
      },
      {
        when: "2024 – now",
        title: "Product & Solutions Engineer",
        where: "Plethora.so",
        line: "Client sites and internal workflow tools, from requirements to shipped.",
      },
      {
        when: "2025",
        title: "AI Research Fellow",
        where: "Giles T. Brown Research Symposium",
        line: "Condensed chain-of-thought distillation; AIME 2024 pass@1 from 46.7% to 53.3%.",
      },
      {
        when: "2020 – 2023",
        title: "International Partnerships Coordinator",
        where: "Q Industries, Ho Chi Minh City",
        line: "Grew sales 10% through international distributor partnerships.",
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
        line: "The first two-year honor society for computer science; partnerships with Amazon, Sony and NASA.",
      },
      {
        when: "2024 – 2025",
        title: "Lead Organizer",
        where: "HackCC 2024, Spookathon 2025",
        line: "30-hour hackathons for 100+ attendees; $21,000 raised. OCC event of the year.",
      },
      {
        when: "2025 – now",
        title: "Treasurer",
        where: "Phi Theta Kappa, Alpha Beta Gamma, Mu Alpha Theta",
        line: "A ~$90K budget across three honor societies.",
      },
    ],
  },
];
