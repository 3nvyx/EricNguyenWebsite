// Project write-ups for /projects/<slug>, keyed by slug. Projects without an entry still get a
// page (header, facts from the card, link). DRAFTS: written from each repo's README; [brackets]
// are for Eric to fill. Figure paths show a placeholder until the image is added under /public.

import type { Block } from "@/lib/content";

export type Fact = { label: string; values: string[] };

export type ProjectDetail = {
  /** The strip under the title: Type, Team, Duration, Tools... */
  facts: Fact[];
  /** One large line framing the problem, shown before the write-up. */
  statement?: string;
  body: Block[];
};

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  slap: {
    facts: [
      { label: "Type", values: ["Hackathon project", "OCC Hacks 2026"] },
      { label: "Team", values: ["Me", "Hibiki (@BikkyNico)"] },
      { label: "Duration", values: ["~30 hours", "Oct 2026"] },
      { label: "Hardware", values: ["ESP32-S3", "Arduino UNO R4", "INMP441 mic", "2.42\" OLED", "MPU6050", "3D-printed housing"] },
      { label: "Software", values: ["C++ (PlatformIO)", "TypeScript, Node", "Hono, WebSockets", "React", "Neon Postgres", "Deepgram, Soniox", "Cloud Translation", "Fish Audio", "GPT-6 Luna"] },
    ],
    statement: "A lecture is gone the moment it's spoken. What if the whole room could read it live, in their own language, and keep it?",
    body: [
      { h: "Overview" },
      "SLAP! is a hardware and software project Hibiki and I built in about 30 hours at OCC Hacks. It's a small device that sits near the lecturer, and you have to slap it to turn it on. Everyone in the class follows the same live captions on a shared web page, translated into Vietnamese or Japanese if they need it. Every lecture is saved and tied to the rest of the course, and turned into study material.",
      { video: { src: "/media/slap/demo.mp4", poster: "/media/slap/demo-poster.jpg", caption: "Demoing SLAP! at OCC Hacks: captions, translation, then the device opened up" } },
      { h: "Context" },
      "In class I'd do my best to take notes, follow the lecture and pay full attention, and something would still slip through the cracks. Transcription tools like Granola and Wispr are made for work meetings, not for students; I'd check a lecture transcript once or twice and never again. And by then my study material was scattered across transcripts, GoodNotes, Canvas, paper handouts and PDFs, which made pulling it together a pain.",
      "Hibiki had the same problem, and as an international student, a language barrier on top of it.",
      { h: "The device" },
      "Why a device and not a phone app: a microphone near the lecturer hears more clearly than a phone in the back row, so the transcript is more accurate. It's cheap and easy to replace, and nobody gets looked at for having their phone out in class.",
      "Inside is an ESP32-S3 with an INMP441 microphone and a 2.42-inch OLED, streaming audio to the server over Wi-Fi. An MPU6050 motion sensor feels the slap, run by an Arduino UNO R4, all in a 3D-printed housing. There's no pairing: switch it on and it appears in the Devices panel by itself, and you pick which class it records into.",
      "When it wakes, the screen plays a six-frame animation, the cat mascot getting slapped. The frames are 128 by 64 one-bit sprites drawn as text in the repo and compiled into the firmware by a small script. It's the same animation at the top of this page.",
      { figures: [
        { src: "/media/slap/breadboard.jpg", caption: "On the breadboard, waiting for the server", aspect: "3 / 4" },
        { src: "/media/slap/device.jpg", caption: "In the finished housing, captioning its own name", aspect: "3 / 4" },
      ] },
      { h: "Captions and translation" },
      "The server is Node and TypeScript (Hono plus WebSockets). It sends the device's audio for live transcription and pushes captions to every phone on the class page in about 150 ms. There's no sign-in; anyone with the code follows along. Translation into Vietnamese and Japanese adds about 25 ms.",
      "Every outside service has a mock behind it. Without API keys the whole app still runs end to end, which made it fast to build and safe to demo.",
      { figure: { src: "/media/slap/demo-table.jpg", caption: "The demo table: the SLAP! site on the laptop, the device beside it", aspect: "4 / 3" } },
      { h: "Making it fast" },
      { list: [
        "Latency is about where you wait, not how small your packets are. We expected smaller audio packets to help, but 20 ms and 250 ms packets made no measurable difference. Dropping Deepgram's SDK for a raw WebSocket did: interim captions went from 555 to 121 ms (78% faster), final captions from 920 to 438 ms (52%), and it stopped crashing on Node 22.",
        "Pick the model for how it streams, not just how accurate it is. Switching to Soniox cut the worst-case (p90) word delay from about 1.5 s to 0.7 s, because it sends an update every ~100 ms where Deepgram sends one about every second.",
        "The cloud still beats local for speed. We benchmarked four local translation models on a Mac, and none beat Google Cloud Translation: 167 ms for two languages in parallel, against 305 ms to 1.5 s locally. Each sentence is translated once per language, not once per student, so the cost doesn't grow with the class.",
      ] },
      { h: "After the lecture" },
      "Every lecture is saved and connected to the rest of the course. Combined with the syllabus and textbook, it builds a study plan toward the exam dates, with flashcards, multiple-choice and short-answer questions on what was actually said in class. A knowledge graph shows how the concepts connect, and you can ask the lecture a question or export the class as an Obsidian vault.",
      "For something more interactive, you can pick a voice to explain a concept to you, generated with Fish Audio.",
      { h: "Reflections" },
      "Hardware is the risk. The MPU6050 didn't fit the ESP32, so it went on an Arduino, and I had to double the housing at the last minute to make room. We barely got it off the breadboard, soldered and into the case in time.",
      { video360: { src: "/media/slap/soldering-360.mp4", poster: "/media/slap/soldering-360-poster.jpg", caption: "Soldering it together, filmed in 360° on an Insta360" } },
      "Live captions need WebSockets held open and state in memory, so the API can't run on serverless hosting; it runs on a small server, with the web app optionally on Vercel.",
      "I learned plenty building it, and the show-and-tell with other attendees was the most fun I've had in a while.",
    ],
  },

  "chef-nourish": {
    facts: [
      { label: "Type", values: ["Client work", "at Plethora"] },
      { label: "Team", values: ["3 engineers"] },
      { label: "Duration", values: ["5 months", "May – Sep 2026"] },
      { label: "Tools", values: ["Next.js, React", "TypeScript", "PostgreSQL, Neon", "OpenAI", "Vercel"] },
    ],
    statement: "Every client eats differently. Every week the kitchen has to turn those diets into menus, cut sheets, labels and deliveries without a single mistake.",
    body: [
      { h: "Overview" },
      "Chef Nourish is the internal system a private chef kitchen runs on. It holds client profiles and dietary restrictions, builds the weekly menus, and produces everything the kitchen and drivers need: cut sheets, labels, menu sheets, packing stations and delivery spreadsheets.",
      { figure: { src: "/media/chef-nourish/menu.jpg", caption: "Writing a week's menu, with the cut sheet filling in beside it", aspect: "4 / 3" } },
      { h: "Context" },
      "[How the kitchen worked before: what was done by hand, and what went wrong.]",
      { h: "Safety first, then AI" },
      "Restrictions are checked deterministically against an ingredient catalogue: if a dish conflicts with a client's diet, the check says so, every time. AI helps with the creative part, suggesting dishes and substitutions, and a person reviews before anything reaches the kitchen.",
      { h: "What it covers" },
      { list: [
        "Client profiles, plans, schedules, addresses and normalised dietary restrictions",
        "Menu creation with substitutions, custom meals, history and recovery copies",
        "PDF and Word cut sheets, labels, menu sheets and delivery spreadsheets",
        "Cook roster, kitchen boards, packing stations and container inventory",
        "Invite-only Google sign-in and team administration",
      ] },
      { figures: [
        { src: "/media/chef-nourish/substitutions.jpg", caption: "Reviewing a substitution for one client", aspect: "4 / 3" },
        { src: "/media/chef-nourish/labels.jpg", caption: "Generated labels", aspect: "4 / 3" },
      ] },
      { h: "My part" },
      "[What you owned on the team of three: features, decisions, and the hand-off to the client.]",
      { h: "Reflections" },
      "[What you learned building for a real kitchen.]",
    ],
  },

  "nfc-card": {
    facts: [
      { label: "Type", values: ["Personal project"] },
      { label: "Team", values: ["Me"] },
      { label: "Duration", values: ["4 weeks", "Sep – Oct 2026"] },
      { label: "Tools", values: ["Python", "shapely, fontTools", "manifold3d, trimesh", "Bambu Studio"] },
    ],
    statement: "A business card you can tap. Printed in two colours, 0.7 mm thin, with the NFC tag sealed inside where nobody can see it.",
    body: [
      { h: "Overview" },
      "A credit-card-sized business card, 3D printed in white and black. The front has my name, contact details and a drawing of me; the back has a QR code and an NFC mark. Tap a phone on the mark and it opens my site, because there's an NFC tag sealed in the middle of the card. The model above is the exact geometry I print: drag it around, or pull the layers apart to see the tag.",
      { figure: { src: "/media/nfc-card/preview.png", caption: "Front and back as generated, with the tag pocket outlined in blue", aspect: "1772 / 579" } },
      { h: "Context" },
      "[Why you made it: the event or moment that made you want a card, and why a printed NFC one.]",
      { h: "Printing a tag inside" },
      "The card is built in layers, 0.1 mm each. Two layers of black art on the front face, a pocket just deep enough for the tag, a two-layer white lid, and two layers of black art on the back. The print pauses right after the pocket is finished, I drop the tag in, and the printer seals it over. The black art is inlaid flush, so both faces are perfectly flat.",
      { list: [
        "85.6 x 53.98 mm with a 3.18 mm corner, the same size as a bank card",
        "0.2 mm nozzle; no line thinner than 0.22 mm, so the text and QR print cleanly",
        "Pocket 0.6 mm wider than the tag, depth rounded up to whole layers",
        "The pause layer is computed and printed by the script, so there's no guessing in the slicer",
      ] },
      { h: "A card generator" },
      "Getting the first card right took prototypes, so I turned it into a script. Fill in a short config with a name, title, email, website, link for the QR code and an optional drawing, and it lays out the card, turns the fonts and SVG art into outlines, builds the two-colour model with manifold3d and writes a print-ready 3MF for Bambu Studio, with and without a lanyard slot.",
      "Before writing anything it checks the parts are watertight, flags lines too thin to print, warns if the name crowds the drawing, and scans the QR code back from the model to make sure it still opens the right link. Card thickness and the pause layer follow from the tag: an ultra-thin inlay gives a 0.7 mm card, a sticker 0.8 mm, a hard disc 1.8 mm.",
      { h: "Reflections" },
      "[What the prototypes taught you, how people react when they tap it, and what's next.]",
    ],
  },

  honors: {
    facts: [
      { label: "Type", values: ["Tool for OCC's", "Garrison Honors Center"] },
      { label: "Team", values: ["Me"] },
      { label: "Duration", values: ["Aug 2026 – now"] },
      { label: "Tools", values: ["Python", "Pydantic", "PySide6", "BeautifulSoup", "Microsoft Access"] },
    ],
    statement: "Seventeen honor societies, seventeen rulebooks, and one registrar checking every transcript against all of them by hand.",
    body: [
      { h: "Overview" },
      "A desktop app that decides which of Orange Coast College's 17 honor societies a student qualifies for. It reads the student's transcript, has a person confirm it, works out eligibility for every society, and writes the result back into the registrar's Access database. It's fully offline and deterministic: the same transcript always gives the same answer.",
      { figure: { src: "/media/honors/work-screen.png", caption: "Transcript fields beside the source document, for review", aspect: "16 / 10" } },
      { h: "The problem" },
      "Each society has its own rule: a GPA floor, a unit floor, a set of qualifying courses, sometimes a document that must be on file. Two things go wrong when that's done by hand, and the app is built to prevent both.",
      { list: [
        "A misread transcript value silently changes the answer.",
        "A membership gets written into the wrong column of a twenty-year-old database.",
      ] },
      { h: "How it works" },
      { list: [
        "Reads the Banner transcript export with a parser that matches columns by heading, never by position.",
        "Shows every extracted value beside the source page, flagged as unverified until a person confirms it.",
        "Recomputes GPA and units from the confirmed courses instead of trusting the printed totals.",
        "Runs all 17 society rules, including the ones that aren't numbers.",
        "Previews every database write as a diff before anything changes.",
      ] },
      { figure: { src: "/media/honors/result.png", caption: "A finished determination across all 17 societies", aspect: "16 / 10" } },
      { h: "Design decisions" },
      "Unverified and confirmed transcripts are separate types, so no calculation can ever read data a person hasn't signed off. A broken society rule fails loudly instead of quietly turning into \"doesn't qualify\". And an unreadable old record means \"ask the registrar\", never \"not a member\", so no student loses a membership they earned.",
      "Every Access column name lives in one file and is checked against the live database at import. 557 tests cover the parser, the confirmation gate, all seventeen rules, the GPA maths and the write planner.",
      { h: "Reflections" },
      "[What changed for the honors center, and what you'd do next.]",
    ],
  },

  occhacks: {
    facts: [
      { label: "Type", values: ["Event website", "for Iota Xi"] },
      { label: "Team", values: ["Me"] },
      { label: "Duration", values: ["5 months", "May – Oct 2026"] },
      { label: "Tools", values: ["Next.js, React", "Tailwind", "Supabase", "Resend", "PostHog"] },
    ],
    statement: "One site to carry a hackathon from the first visitor to the last check-in.",
    body: [
      { h: "Overview" },
      "OCC Hacks 2026 was a free two-day hackathon at Orange Coast College, October 10–11, run by Iota Xi. I built the whole site in one Next.js app: the landing page, the sign-up forms for hackers, volunteers and mentors, and the dashboard the organizers ran the event from.",
      { figure: { src: "/media/occhacks/hero.png", caption: "The landing page", aspect: "16 / 10" } },
      { h: "What's in it" },
      { list: [
        "A landing page with tracks, mentors, sponsors, the schedule and an FAQ",
        "Three sign-up forms: hackers, volunteers and mentors",
        "An organizer dashboard for applicants, QR check-in, volunteers, mentors, email campaigns and CSV export",
      ] },
      { figures: [
        { src: "/media/occhacks/tracks.png", caption: "The three tracks", aspect: "16 / 10" },
        { src: "/media/occhacks/schedule.png", caption: "Two days, from registration to closing", aspect: "16 / 10" },
      ] },
      { h: "How it went" },
      "Applications ran for about six weeks, from Aug 24 to Oct 5. 216 people applied, 211 were accepted and 141 confirmed they were coming. The deadline drove the rush: 38% of applications arrived in the final week, and the last one landed two minutes before the form closed.",
      "Between Aug 24 and Oct 16 the site had 12,267 page views from about 1,500 visitors, 43% of them on phones.",
      { figure: { src: "/media/occhacks/applications-open.png", caption: "The homepage while applications were open, with the countdown to the deadline", aspect: "16 / 10" } },
      { h: "Reflections" },
      "[What running the site during the event taught you, and what you'd change for next year.]",
    ],
  },

  hackcc: {
    facts: [
      { label: "Type", values: ["Project management", "Lead organizer"] },
      { label: "Team", values: ["Me (lead)", "6 departments across colleges"] },
      { label: "Duration", values: ["30 hours", "[Month] 2024"] },
      { label: "Recognition", values: ["OCC Event of the Year 2025"] },
    ],
    statement: "[One line on why HackCC needed to exist: what community college students were missing.]",
    body: [
      { h: "Overview" },
      "HackCC 2024 was a 30-hour hackathon for community college students, run by a team drawn from several colleges. I led it as lead organizer, directing six departments that handled sponsorship, the venue, catering, mentors and overnight accommodations for 100+ attendees.",
      { youtube: { id: "vT81BYkjc8k", caption: "HackCC 2024, the recap" } },
      { h: "Running it" },
      "[How the six departments split the work, and the hardest call you made as lead.]",
      { h: "How it went" },
      "Across HackCC and Spookathon we raised over $21,000 in sponsorship, and HackCC won OCC's Event of the Year at Honors Night 2025. [Attendance, projects and winners for HackCC itself.]",
      { figures: [
        { src: "/media/hackcc/tracks.jpg", caption: "The four tracks, on the event site" },
        { src: "/media/hackcc/sponsors.jpg", caption: "The sponsors who made it happen" },
      ] },
      { h: "Reflections" },
      "[What you carried into Spookathon and OCC Hacks.]",
    ],
  },

  spookathon: {
    facts: [
      { label: "Type", values: ["Project management", "Lead organizer"] },
      { label: "Team", values: ["Me (lead)", "6 departments across colleges"] },
      { label: "Duration", values: ["30 hours", "[Month] 2025"] },
    ],
    statement: "[One line on what Spookathon set out to do differently from HackCC.]",
    body: [
      { h: "Overview" },
      "Spookathon 2025 was a 30-hour hackathon that followed HackCC, run by the same cross-college team. I led it as lead organizer: sponsorship, the venue, catering, mentors and overnight accommodations for 100+ attendees.",
      { youtube: { id: "I9FVxneDnL4", caption: "Spookathon 2025, the recap" } },
      { h: "Running it" },
      "[What changed from HackCC: the theme, the format, the team.]",
      { figures: [
        { src: "/media/spookathon/about.jpg", caption: "The Halloween theme ran through the whole site" },
        { src: "/media/spookathon/tracks.jpg", caption: "Six tracks, including a Math Honor Society challenge" },
      ] },
      { h: "How it went" },
      "Across HackCC and Spookathon we raised over $21,000 in sponsorship. [Attendance, projects and winners for Spookathon itself.]",
      { h: "Reflections" },
      "[What you'd tell the next lead organizer.]",
    ],
  },

  "q-industries": {
    facts: [
      { label: "Type", values: ["Client work", "at Plethora"] },
      { label: "Team", values: ["Me (lead)", "+ 2 at Plethora"] },
      { label: "Duration", values: ["2 months", "Mar – May 2026"] },
      { label: "Tools", values: ["Next.js, React", "Tailwind", "shadcn/ui", "Resend"] },
    ],
    statement: "I spent three years at Q Industries building its partnerships. Then I built its website.",
    body: [
      { h: "Overview" },
      "Q Industries supplies bearings, seals and lubrication systems to factories in Vietnam, and handles engineering design, maintenance, condition monitoring and reconditioning. I worked there from 2020 to 2023 as its international partnerships coordinator; this site, in Vietnamese, was a chance to give the company a modern front door.",
      { figure: { src: "/media/q-industries/home.png", caption: "The home page" } },
      { h: "What's on it" },
      { list: [
        "A home page with a hero video, what the company does, animated stats, its history and its partners",
        "An about page",
        "A customers and partners directory, grouped by industry",
        "Product pages",
        "A contact form that emails the sales team",
      ] },
      { figures: [
        { src: "/media/q-industries/customers.png", caption: "Customers and partners by industry", aspect: "4 / 3" },
        { src: "/media/q-industries/contact.png", caption: "The contact form", aspect: "4 / 3" },
      ] },
      { h: "My part" },
      "[What you led on the build, and how knowing the company from the inside shaped it.]",
      { h: "Reflections" },
      "[What you learned building for a client you used to work for.]",
    ],
  },

  "pickle-banh-mi": {
    facts: [
      { label: "Type", values: ["Client work", "at Plethora"] },
      { label: "Team", values: ["[Team]"] },
      { label: "Status", values: ["Designed in Figma", "not built"] },
      { label: "Tools", values: ["Figma"] },
    ],
    statement: "Get a hungry visitor from the home page to an order in one tap.",
    body: [
      { h: "Overview" },
      "A new website for Pickle Banh Mi Co., a Vietnamese sandwich shop with locations across LA and Orange County, designed in Figma to bring in more orders and strengthen its presence online. The project was paused by the client before development started, so this is the design as it stood.",
      { figure: { src: "/media/pickle-banh-mi/home.jpg", caption: "The hero, with press from Discovering LA, Yelp and the OC Register right underneath", aspect: "1512 / 1165" } },
      { h: "The design" },
      "Every section leads to an order. The hero sells the food and the press bar backs it up. Then a single card offers both ways to buy: delivery through DoorDash or Grubhub, or pickup through online ordering. The menu shows nine dishes with another order button at the top, and the footer repeats the main links: menu, catering, Yelp, locations and contact.",
      { figure: { src: "/media/pickle-banh-mi/order.jpg", caption: "Delivery or pickup, from one card", aspect: "1512 / 862" } },
      { figure: { src: "/media/pickle-banh-mi/menu.jpg", caption: "The menu, a grid of the shop's dishes", aspect: "1512 / 975" } },
      "[The decisions behind it: the type, the red and pink, the photography.]",
      { h: "Reflections" },
      "[What you'd carry into the build if it picks back up.]",
    ],
  },

  nyx: {
    facts: [
      { label: "Type", values: ["Hackathon project"] },
      { label: "Team", values: ["Me", "@johncourpayton", "@KevinNDoan"] },
      { label: "Duration", values: ["3 days", "Apr 2026"] },
      { label: "Tools", values: ["Next.js", "React Three Fiber", "Pusher", "OpenAI SDK", "Discord"] },
    ],
    statement: "An AI that hunts for vulnerabilities on its own, and a screen that lets you watch it think.",
    body: [
      { h: "Overview" },
      "Nyx is the dashboard for an autonomous security agent. Give it a target and it starts probing, while the dashboard shows what it's doing in real time: its reasoning, the commands it runs, the vulnerabilities it finds and how serious they are. When it's done, it writes up a penetration-test report.",
      { figure: { src: "/media/nyx.png", caption: "Where a scan starts: Nyx asks for a target" } },
      { h: "What you see" },
      { list: [
        "A thought stream of the agent's reasoning as it works",
        "A live console of the commands it runs",
        "An attack tree and an evidence locker for each finding",
        "An impact meter that tracks how serious things are getting",
        "A generated report at the end, with a 3D robot avatar watching over it all",
      ] },
      { h: "How it works" },
      "The agent runs separately and reports back through a Discord bridge. Its events stream to the browser over Pusher, so the dashboard updates the moment something happens.",
      { h: "My part" },
      "[What you built on the team of three.]",
    ],
  },

  "condensed-cot": {
    facts: [
      { label: "Type", values: ["Research", "Giles T. Brown", "Research Symposium"] },
      { label: "Team", values: ["Me", "Kevin Doan"] },
      { label: "Advisor", values: ["Justin Jang, Ph.D."] },
      { label: "Duration", values: ["4 months", "Jan – Apr 2025"] },
      { label: "Tools", values: ["DeepSeek-R1-Distill", "Qwen2.5-32B-Instruct", "LoRA", "RTX 4060 Ti 16 GB"] },
    ],
    statement: "Can condensing a model's chain of thought into shorter, more precise steps make it better at hard math?",
    body: [
      { h: "Overview" },
      "Reasoning models show their work, but much of it is filler: repeated steps and vague \"fluffy\" language that cost compute without making the answer more likely to be right. We tested whether training a small model on condensed reasoning would make it a better mathematician.",
      { h: "Method" },
      { list: [
        "Solved 137 problems from GSM8K, past AIMEs and the Putnam with DeepSeek-R1-Distill-Qwen-14B, keeping only problems the base model got right",
        "Split each solution into its reasoning and its conclusion, and rewrote the reasoning with Qwen2.5-32B-Instruct (3-bit) to cut redundancy without changing the answer",
        "Fine-tuned DeepSeek-R1-Distill-Qwen-7B on the condensed solutions with LoRA for four epochs, on a single RTX 4060 Ti",
        "Split condensed outputs longer than the context window into overlapping segments to keep the logic continuous",
      ] },
      { h: "Results" },
      "The fine-tuned model beat the base model on every exam we tried, including AIME 2024, which it never saw in training.",
      { list: [
        "AIME 2024, one attempt: 53.3 vs 46.7, up 14.1% (the average human score is 40)",
        "AIME 2024, three attempts: 66.6 vs 56.6, up 17.7%",
        "AMATYC Student Math League, Fall and Spring combined: up 15.8%",
      ] },
      { h: "Why it matters" },
      "Fine-tuning a small model on concise reasoning made it more accurate without heavier hardware. That points to cheaper, clearer reasoning models for tutoring, proof assistance and debugging. [What you'd test next with more data or full precision.]",
    ],
  },

  "glow-box": {
    facts: [
      { label: "Type", values: ["Product design", "and fabrication"] },
      { label: "Team", values: ["Me"] },
      { label: "Duration", values: ["Jan 2026"] },
      { label: "Tools", values: ["[Design program]", "Bambu P1S", "CNC router"] },
      { label: "Materials", values: ["Translucent smoke PLA", "Galaxy black PLA", "Recycled redwood oak"] },
    ],
    statement: "A minimal, geometric form that lets the light do all the talking.",
    body: [
      { h: "Overview" },
      "The Glow Box started as a way to learn a new design program while working with fabrication tools I hadn't used before. Its simple shape lets light be the main thing you notice. With eight brightness levels, twelve colors and eight light patterns, it has 768 settings.",
      { figures: [
        { src: "/media/glow-box/colors.jpg", caption: "Nine of its colors. Photos by Nikki Jaramilo", aspect: "1 / 1" },
        { src: "/media/glow-box/white.jpg", caption: "The printed shade, unlit", aspect: "1 / 1" },
      ] },
      { h: "Fabrication" },
      "The white shade and black base were printed on a Bambu P1S, the shade at 0.08 mm layers for a smooth finish and the base at 0.24 mm. The wooden base was cut separately on a CNC machine, then sanded and finished with polyurethane.",
      "The parts are made to fit each other: the hole in the shade lines up with the cut-out in the black base, and the depth of the wooden holder matches the base's circular recess. It weighs 0.83 pounds and measures 3 × 3 × 6 inches.",
      { figure: { src: "/media/glow-box/detail.jpg", caption: "The shade's cable hole lines up with the base", aspect: "4 / 3" } },
      { figures: [
        { src: "/media/glow-box/on-base.jpg", caption: "Shade, printed base and oak holder", aspect: "2 / 3" },
        { src: "/media/glow-box/base-corner.jpg", caption: "The CNC-cut oak base", aspect: "3 / 2" },
      ] },
      { h: "In use" },
      "Its warm, even light is easy on the eyes, which makes it a good reading lamp for browsing a bookshelf.",
      { figures: [
        { src: "/media/glow-box/reaching.jpg", caption: "Lighting the bookshelf", aspect: "3 / 4" },
        { src: "/media/glow-box/reading.jpg", caption: "Though the phone still wins", aspect: "9 / 8" },
      ] },
      { h: "Reflections" },
      "[What you learned from the new program and tools, and what you'd change in version two.]",
    ],
  },
};
