import type { Metadata } from "next";
import { EMAIL } from "@/lib/projects";
import { cn, hoverLink, pageMain } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = { title: "Privacy" };

/** What the coffee chat booking collects and where it goes. Linked from the Google OAuth consent screen. */
export default function PrivacyPage() {
  return (
    <main className={pageMain}>
      <PageTitle>Privacy</PageTitle>
      <div className="fw-text max-w-[calc(640*var(--u))] space-y-[calc(16*var(--u))]">
        <p>
          This site collects nothing unless you book a coffee chat. Booking asks for your name and
          email so I can send you a calendar invite. Those go into one event on my Google Calendar,
          with a Google Meet link, and Google emails the invite to you and to me. I don&apos;t store
          them anywhere else or share them with anyone.
        </p>
        <p>
          Reading the site uses Vercel Analytics, which counts page views without cookies or
          personal identifiers.
        </p>
        <p>
          To cancel a booking or have your details removed, decline the invite or email{" "}
          <a href={`mailto:${EMAIL}`} className={cn("text-ink", hoverLink)}>
            {EMAIL}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
