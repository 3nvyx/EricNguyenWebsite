"use client";

import { useEffect, useRef, useState } from "react";
import {
  NAME_MAX,
  PAGE_SIZE,
  cleanName,
  type BoardResponse,
  type Entry,
  type SubmitResponse,
} from "@/lib/leaderboard";
import type { Result } from "@/components/breakout";
import { cn } from "@/lib/utils";

const NAME_KEY = "breakout-name";

function readName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}

/**
 * Every saved score, best first, plus an optional "save your score" field after each finished
 * run. The list has no cap: it loads a page at a time as you scroll to its bottom. Hidden
 * entirely when the API isn't configured, so the game still works without a database.
 */
export function Leaderboard({ result }: { result: Result | null }) {
  const [top, setTop] = useState<Entry[] | null>(null);
  const [more, setMore] = useState(false);
  const [mine, setMine] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const loading = useRef(false);

  const load = async (offset: number) => {
    if (loading.current) return;
    loading.current = true;
    try {
      const res = await fetch(`/api/leaderboard?offset=${offset}&limit=${PAGE_SIZE}`);
      const d = (await res.json()) as BoardResponse;
      if (!d.ok) return;
      // New saves can shift rows between pages; skip any we already have.
      setTop((prev) => {
        const have = new Set(prev?.map((e) => e.id));
        return [...(offset ? (prev ?? []) : []), ...d.top.filter((e) => !offset || !have.has(e.id))];
      });
      setMore(d.more);
    } catch {
      // Leave the board as it is; the next scroll tries again.
    } finally {
      loading.current = false;
    }
  };

  useEffect(() => {
    void load(0);
  }, []);

  const onScroll = (e: React.UIEvent<HTMLOListElement>) => {
    const el = e.currentTarget;
    if (more && top && el.scrollTop + el.clientHeight > el.scrollHeight - 120) void load(top.length);
  };

  // After saving, scroll the list (not the page) so your row is in view.
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>("[data-mine]");
    if (list && row) list.scrollTop = row.offsetTop - list.offsetTop - list.clientHeight / 2;
  }, [mine, top]);

  if (!top) return null;

  return (
    <section className="mt-[calc(45*var(--u))]">
      {result && result.score > 0 && (
        <SaveScore
          key={result.run}
          result={result}
          onSaved={(id, board, hasMore) => {
            setMine(id);
            setTop(board);
            setMore(hasMore);
          }}
        />
      )}
      <h2 className="fw-label">Leaderboard</h2>
      {top.length === 0 ? (
        <p className="fw-text text-mute">No scores yet. Be the first.</p>
      ) : (
        // About twelve rows tall; everyone else scrolls inside it.
        <ol
          ref={listRef}
          onScroll={onScroll}
          className="flex max-h-[calc(400*var(--u))] flex-col overflow-y-auto overscroll-contain"
        >
          {top.map((e, i) => (
            <li
              key={e.id}
              data-mine={e.id === mine || undefined}
              className={cn(
                "fw-text grid grid-cols-[calc(36*var(--u))_minmax(0,1fr)_auto] gap-[calc(12*var(--u))] py-[calc(4*var(--u))]",
                e.id === mine ? "text-ink" : i > 2 && "text-mute",
              )}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="truncate">
                {e.name}
                {e.id === mine && <span className="fw-small ml-2 text-mute">YOU</span>}
              </span>
              <span className="tabular-nums">{e.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function SaveScore({
  result,
  onSaved,
}: {
  result: Result;
  onSaved: (id: number, top: Entry[], more: boolean) => void;
}) {
  const [name, setName] = useState(readName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanName(name);
    if (!clean) return setMessage("Add a name first.");
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean, score: result.score, durationMs: result.durationMs }),
      });
      const data = (await res.json()) as SubmitResponse;
      if (!data.ok) {
        setStatus("idle");
        return setMessage(data.message);
      }
      saveName(clean);
      setStatus("saved");
      setMessage(`Saved. You're #${data.rank}.`);
      onSaved(data.id, data.top, data.more);
    } catch {
      setStatus("idle");
      setMessage("Couldn't save that. Try again.");
    }
  };

  return (
    <form onSubmit={submit} className="mb-[calc(36*var(--u))]">
      <p className="fw-title">{result.score} points</p>
      {status === "saved" ? (
        <p className="fw-text mt-[calc(6*var(--u))] text-mute">{message}</p>
      ) : (
        <>
          <p className="fw-small mt-[calc(4*var(--u))] text-mute">
            Optional: put your name on the board.
          </p>
          <div className="mt-[calc(12*var(--u))] flex max-w-[calc(420*var(--u))] gap-[calc(10*var(--u))]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="Your name"
              aria-label="Your name"
              autoComplete="nickname"
              className="fw-text min-w-0 flex-1 border-b border-faint bg-transparent py-[calc(4*var(--u))] outline-none placeholder:text-faint focus:border-ink"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="fw-small cursor-pointer bg-ink px-[calc(14*var(--u))] text-bone disabled:opacity-50"
            >
              {status === "saving" ? "SAVING…" : "SAVE SCORE"}
            </button>
          </div>
          {message && <p className="fw-small mt-[calc(8*var(--u))] text-mute">{message}</p>}
        </>
      )}
    </form>
  );
}
