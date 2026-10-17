export type Project = {
  slug: string;
  title: string;
  line: string;
  href: string;
  /** Path under /public. Missing files fall back to a placeholder. */
  media: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "slap",
    title: "Slap",
    line: "Live captions for any classroom",
    href: "https://github.com/3nvyx/slap",
    media: "/media/slap.gif",
  },
  {
    slug: "honors",
    title: "Honors",
    line: "Eligibility for 17 honor societies, offline",
    href: "https://occ-honor-societies-transcript-anal.vercel.app",
    media: "/media/honors.gif",
  },
  {
    slug: "sevis",
    title: "Sevis",
    line: "Where international students study, mapped",
    href: "https://github.com/3nvyx/SEVIS-data-maping-trends",
    media: "/media/sevis.gif",
  },
  {
    slug: "daisy",
    title: "Daisy",
    line: "Scene-based RGB lighting control",
    href: "https://github.com/3nvyx/daisy-light-control-system",
    media: "/media/daisy.gif",
  },
  {
    slug: "carousel",
    title: "Carousel",
    line: "Cover-flow carousel component",
    href: "https://github.com/3nvyx/Interesting-Carousel",
    media: "/media/carousel.gif",
  },
];

export const HERO = PROJECTS[0];

export const LINKS = [
  { label: "GitHub", href: "https://github.com/3nvyx" },
  { label: "Resume", href: "/Resume_Eric_Nguyen_Feb_25_2026.pdf" },
  { label: "Mail", href: "mailto:envn001@gmail.com" },
];
