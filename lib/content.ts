// Long-form content shared by blog posts and project pages.
// A body is a list of blocks: a plain string is a paragraph.

export type Figure = {
  /** Path under /public. Missing files show a placeholder until the image exists. */
  src: string;
  caption: string;
  /** CSS aspect ratio; default 16 / 9. */
  aspect?: string;
};

export type Block =
  | string
  | { h: string }
  | { list: string[] }
  | { figure: Figure }
  /** A video with controls; `src` is the video, `poster` the still shown before it plays. */
  | { video: Figure & { poster?: string } }
  /** A YouTube video, embedded by its id (the `v=` part of the watch URL). */
  | { youtube: { id: string; caption: string } }
  /** Two figures side by side on desktop. */
  | { figures: [Figure, Figure] };

/** The id a section heading gets on the page, for "On this page" links. */
export function sectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
