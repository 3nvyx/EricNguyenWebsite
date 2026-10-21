"use client";

import { useState } from "react";
import { EMAIL } from "@/lib/projects";
import { ICON } from "@/lib/icons";

/** Copies the email address on click; "Copied to clipboard" holds until the pointer leaves. */
export function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard API blocked (insecure context or permissions): fall back to a hidden textarea.
      const t = document.createElement("textarea");
      t.value = EMAIL;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
  };
  return { copied, copy, reset: () => setCopied(false) };
}

/** A mail icon that copies the address; it shows a check until the pointer leaves. */
export function CopyEmailIcon({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const { copied, copy, reset } = useCopyEmail();
  return (
    <button
      type="button"
      onClick={copy}
      onMouseLeave={reset}
      onBlur={reset}
      aria-label={`Copy email address ${EMAIL}`}
      title={copied ? "Copied to clipboard" : EMAIL}
      className={className}
    >
      {/* A solid badge, so its edges line up with the GitHub and LinkedIn marks beside it. */}
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClassName}>
        <path fillRule="evenodd" d={copied ? ICON.checkBadge : ICON.mailBadge} />
      </svg>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
