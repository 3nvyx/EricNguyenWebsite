"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { COFFEE_CHAT_EMBED, COFFEE_CHAT_INVITE } from "@/lib/projects";
import { cn, ease, hoverLink } from "@/lib/utils";

/**
 * "Have a coffee chat with me". Opens the Google Calendar booking page in a panel over the site;
 * without a booking page set up yet, it opens a pre-filled Calendar invite in a new tab.
 */
export function CoffeeChat({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = (
    <>
      Have a coffee chat with me
      <span className="ml-0.5 align-top text-[0.75em]">↗</span>
    </>
  );

  if (!COFFEE_CHAT_EMBED) {
    return (
      <a href={COFFEE_CHAT_INVITE} target="_blank" rel="noopener noreferrer" className={cn(hoverLink, className)}>
        {label}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn("cursor-pointer text-left", hoverLink, className)}
      >
        {label}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="coffee"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                className="fw fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Book a coffee chat with Eric Nguyen"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-[min(760px,88dvh)] w-[min(920px,94vw)] flex-col bg-bone p-[calc(24*var(--u))]"
                >
                  <div className="fw-label flex justify-between">
                    <span>COFFEE CHAT</span>
                    <button type="button" onClick={() => setOpen(false)} className={cn("cursor-pointer", hoverLink)}>
                      CLOSE
                    </button>
                  </div>
                  <iframe
                    src={COFFEE_CHAT_EMBED}
                    title="Book a coffee chat with Eric Nguyen"
                    className="w-full flex-1 bg-white"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
