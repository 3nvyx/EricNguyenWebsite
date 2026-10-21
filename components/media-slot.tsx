"use client";

import dynamic from "next/dynamic";
import type { Project } from "@/lib/projects";
import { SlapSplash } from "@/components/slap-splash";
import { MediaImage } from "@/components/media-image";

// three.js only loads on pages that show the card.
const NfcCard3D = dynamic(() => import("@/components/nfc-card-3d").then((m) => m.NfcCard3D), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-faint/75" />,
});

/**
 * A project's cover. SLAP! shows the device's own switch-on animation, the NFC card is a 3D model
 * (with flip and layer controls when `controls`), and the rest show a gif or a placeholder.
 */
export function MediaSlot({ project, controls = false }: { project: Project; controls?: boolean }) {
  if (project.slug === "slap") {
    return (
      <div className="h-full w-full bg-ink p-[3%]">
        <SlapSplash className="h-full w-full object-contain" />
      </div>
    );
  }

  if (project.slug === "nfc-card") return <NfcCard3D controls={controls} />;

  return <MediaImage src={project.media} alt={project.line} label={`${project.slug} — gif`} />;
}
