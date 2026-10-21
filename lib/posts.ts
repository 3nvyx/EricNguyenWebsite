// Blog posts, newest first. Each one gets a page at /blogs/<slug>.
// A post's body is a list of blocks: plain strings are paragraphs, { h } is a subheading.

export type Block = string | { h: string };

export type Post = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-10-20". */
  date: string;
  summary: string;
  /** Drafts are listed with a [Draft] mark until this is removed. */
  draft?: boolean;
  body: Block[];
};

export const postDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", timeZone: "UTC" });

export const POSTS: Post[] = [
  {
    slug: "building-slap",
    title: "Building SLAP!",
    date: "2026-10-20",
    summary: "A box you slap on the lecturer's desk, and the whole room gets live captions in their own language.",
    draft: true,
    body: [
      "SLAP! is one small device per classroom. Put it on the lecturer's desk, press the button (or slap it twice), and everyone who scans the code gets live captions in their own language. When the lecture ends, the recording turns into a study kit: a knowledge graph, flashcards, practice questions, a recall check, likely exam topics and a study plan.",
      "[Why you built it: the moment or class that made you want this.]",
      { h: "The device" },
      "The hardware is an ESP32-S3 with a microphone, a button and a 2.42-inch OLED. It streams audio to the server over Wi-Fi. There is no pairing step: switch it on and it shows up in the Devices panel by itself, and you pick which class it records into.",
      "When it wakes, the screen plays a six-frame animation: the cat mascot, then a hand slapping it, then \"SLAP!\". The frames are 128 by 64 one-bit sprites, drawn as text in the repo and converted to firmware by a small script. The same frames play on the projects page of this site.",
      { h: "Captions and translation" },
      "The server is Node and TypeScript (Hono plus WebSockets). It takes the device's audio, sends it to Deepgram for live transcription, translates it, and pushes captions to every phone on the class page. There is no sign-in: anyone with the code can follow along.",
      "Every outside service has a mock behind it. Without API keys the whole app still runs end to end, which made it much easier to build and demo [and to recover when the venue Wi-Fi did X].",
      { h: "After the lecture" },
      "When the session stops, a study pipeline runs over the transcript: an outline, the key concepts, cards and questions. Those fill in the lecture page, the graph, review, practice, recall and exam-topic pages. You can also ask the lecture a question, practise answering out loud with a voice partner, or export the class as an Obsidian vault.",
      { h: "What I'd change" },
      "The live parts need WebSockets held open and state kept in memory, so the API can't run on serverless hosting; it runs on a small server instead, with the web app optionally on Vercel. [What you'd do differently next time, and what's next for SLAP!.]",
    ],
  },
];
