"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createSfx, onMutedChange, readMuted, type Sfx } from "@/lib/sfx";
import { Leaderboard } from "@/components/leaderboard";

// Logical playfield in game units; the canvas scales it to the column width.
const W = 640;
const H = 480;
const COLS = 10;
const GAP = 4;
const BLOCK_W = (W - GAP * (COLS + 1)) / COLS;
const BLOCK_H = 18;
const ROW_H = BLOCK_H + GAP;
const START_ROWS = 5;

const PADDLE_H = 10;
const PADDLE_Y = H - 28;
const PADDLE = { base: 96, wide: 156, short: 56 };
const PADDLE_SPEED = 640;
const BALL_R = 6;
const SPEED_START = 430;
const SPEED_MAX = 780;
const MAX_BALLS = 12;
const LIVES = 3;
const MAX_LIVES = 5;
const DROP_W = 46;
const DROP_H = 16;

type Power = "split" | "wide" | "short" | "life";
type Block = { x: number; y: number; hp: number; tough: boolean; power?: Power };
type Ball = { x: number; y: number; vx: number; vy: number };
type Drop = { x: number; y: number; power: Power };
type Pop = { x: number; y: number; text: string; t: number };
type Phase = "ready" | "serve" | "playing" | "over";
export type Result = { run: number; score: number; durationMs: number };

const DROP_LABEL: Record<Power, string> = { split: "SPLIT", wide: "WIDE", short: "SHORT", life: "+1" };

const BEST_KEY = "breakout-best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {}
  window.dispatchEvent(new Event(BEST_KEY));
}

function onBestChange(cb: () => void) {
  window.addEventListener(BEST_KEY, cb);
  return () => window.removeEventListener(BEST_KEY, cb);
}

function pickPower(): Power {
  const r = Math.random();
  return r < 0.38 ? "split" : r < 0.68 ? "wide" : r < 0.95 ? "short" : "life";
}

/** A row with a few holes. Tough (two-hit) blocks get more common the longer the run goes. */
function makeRow(y: number, elapsed: number): Block[] {
  const toughChance = 0.1 + Math.min(0.3, elapsed / 300);
  const row: Block[] = [];
  for (let c = 0; c < COLS; c++) {
    if (Math.random() > 0.8) continue;
    const tough = Math.random() < toughChance;
    row.push({
      x: GAP + c * (BLOCK_W + GAP),
      y,
      hp: tough ? 2 : 1,
      tough,
      power: Math.random() < 0.12 ? pickPower() : undefined,
    });
  }
  return row.length ? row : makeRow(y, elapsed);
}

function freshState() {
  const blocks: Block[] = [];
  for (let r = 0; r < START_ROWS; r++) blocks.push(...makeRow(GAP + r * ROW_H, 0));
  return {
    blocks,
    balls: [] as Ball[],
    drops: [] as Drop[],
    pops: [] as Pop[],
    // The y of the newest (top) row; when it creeps down off the edge, another row spawns above it.
    topY: GAP,
    paddleX: (W - PADDLE.base) / 2,
    paddleW: PADDLE.base,
    paddleTarget: PADDLE.base,
    /** Play time when the current WIDE/SHORT effect wears off; 0 when none is active. */
    sizeUntil: 0,
    stuck: true,
    /** Seconds with the ball in play. The wall, speed and tough blocks all scale with it. */
    elapsed: 0,
    startedAt: 0,
    lives: LIVES,
    combo: 0,
    score: 0,
  };
}

/** Never let a ball settle into a near-horizontal path; it would take forever to come back. */
function steepen(b: Ball, speed: number) {
  const minVy = speed * 0.3;
  if (Math.abs(b.vy) < minVy) {
    b.vy = (b.vy < 0 ? -1 : 1) * minVy;
    b.vx = (b.vx < 0 ? -1 : 1) * Math.sqrt(speed * speed - minVy * minVy);
  }
}

/**
 * Breakout where the wall advances: blocks creep down and new rows keep arriving from the top.
 * Three lives; losing the ball or letting the wall reach the line costs one. Some blocks take two
 * hits, some carry a power-up to catch (SPLIT, WIDE, +1) or dodge (SHORT, worth bonus points if
 * you're brave). Breaking blocks without touching the paddle builds a score multiplier.
 */
export function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [mult, setMult] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const best = useSyncExternalStore(onBestChange, readBest, () => 0);
  const muted = useSyncExternalStore(onMutedChange, readMuted, () => false);
  const sfx = useRef<Sfx | null>(null);
  const phaseRef = useRef<Phase>("ready");
  const state = useRef(freshState());
  const keys = useRef({ left: false, right: false });
  const runs = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const fx = (sfx.current = createSfx());
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#111";
    const mute = css.getPropertyValue("--mute").trim() || "#777";
    const faint = css.getPropertyValue("--faint").trim() || "#bbb";
    const bone = css.getPropertyValue("--bone").trim() || "#f4f3f0";
    const font = getComputedStyle(document.body).fontFamily;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * (H / W) * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Wall and block sounds can fire dozens of times a second with many balls; cap them.
    const lastSound: Record<string, number> = {};
    const throttled = (key: string, play: () => void) => {
      const now = performance.now();
      if (now - (lastSound[key] ?? 0) < 45) return;
      lastSound[key] = now;
      play();
    };

    const setPlayPhase = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };

    const serveBall = () => {
      const s = state.current;
      s.balls = [{ x: s.paddleX + s.paddleW / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }];
      s.stuck = true;
    };

    const launch = () => {
      fx.unlock();
      if (phaseRef.current === "over") {
        state.current = freshState();
        setScore(0);
        setLives(LIVES);
        setMult(1);
        setResult(null);
      }
      const s = state.current;
      if (!s.balls.length) serveBall();
      setPlayPhase("playing");
      if (!s.stuck) return;
      if (!s.startedAt) s.startedAt = performance.now();
      const speed = Math.min(SPEED_MAX, SPEED_START + s.elapsed * 1.2);
      const angle = (Math.random() - 0.5) * (Math.PI / 3);
      s.balls[0].vx = Math.sin(angle) * speed;
      s.balls[0].vy = -Math.cos(angle) * speed;
      s.stuck = false;
      fx.launch();
    };

    const end = () => {
      const s = state.current;
      setPlayPhase("over");
      fx.over();
      if (s.score > readBest()) saveBest(s.score);
      runs.current += 1;
      setResult({ run: runs.current, score: s.score, durationMs: Math.round(performance.now() - s.startedAt) });
    };

    const loseLife = (wall: boolean) => {
      const s = state.current;
      s.lives -= 1;
      setLives(s.lives);
      s.combo = 0;
      setMult(1);
      s.drops = [];
      s.paddleTarget = PADDLE.base;
      s.sizeUntil = 0;
      // If the wall got through, knock it back a few rows so the next life starts with room.
      if (wall) s.blocks = s.blocks.filter((k) => k.y + BLOCK_H < PADDLE_Y - 5 * ROW_H);
      s.balls = [];
      if (s.lives <= 0) return end();
      fx.lose();
      serveBall();
      setPlayPhase("serve");
    };

    const addScore = (n: number, x: number, y: number, label?: string) => {
      const s = state.current;
      s.score += n;
      setScore(s.score);
      if (label) s.pops.push({ x, y, text: label, t: 0 });
    };

    const applyPower = (d: Drop) => {
      const s = state.current;
      const cx = d.x + DROP_W / 2;
      if (d.power === "split") {
        const extra: Ball[] = [];
        for (const b of s.balls) {
          const speed = Math.hypot(b.vx, b.vy);
          for (const turn of [-0.35, 0.35]) {
            if (s.balls.length + extra.length >= MAX_BALLS) break;
            const c = Math.cos(turn);
            const sn = Math.sin(turn);
            const nb = { x: b.x, y: b.y, vx: b.vx * c - b.vy * sn, vy: b.vx * sn + b.vy * c };
            steepen(nb, speed);
            extra.push(nb);
          }
        }
        s.balls.push(...extra);
        fx.split();
        addScore(25, cx, d.y, "SPLIT");
      } else if (d.power === "wide") {
        s.paddleTarget = PADDLE.wide;
        s.sizeUntil = s.elapsed + 12;
        fx.good();
        addScore(25, cx, d.y, "WIDE");
      } else if (d.power === "short") {
        s.paddleTarget = PADDLE.short;
        s.sizeUntil = s.elapsed + 10;
        fx.bad();
        addScore(75, cx, d.y, "+75 SHORT");
      } else {
        s.lives = Math.min(MAX_LIVES, s.lives + 1);
        setLives(s.lives);
        fx.good();
        addScore(25, cx, d.y, "+1 LIFE");
      }
    };

    const toGame = (clientX: number) => {
      const r = canvas.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * W;
    };
    const onMove = (e: PointerEvent) => {
      const s = state.current;
      s.paddleX = Math.max(0, Math.min(W - s.paddleW, toGame(e.clientX) - s.paddleW / 2));
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      launch();
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      // Leave typing alone (the name field for the leaderboard).
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = down;
      else if (e.key === "ArrowRight" || e.key === "d") keys.current.right = down;
      else if (e.key === " " && down && document.activeElement === canvas) launch();
      else return;
      if (document.activeElement === canvas) e.preventDefault();
    };
    const keyDown = onKey(true);
    const keyUp = onKey(false);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    const step = (dt: number) => {
      const s = state.current;

      // Paddle: keys, then ease its width toward the current power-up size, keeping it centred.
      if (keys.current.left) s.paddleX -= PADDLE_SPEED * dt;
      if (keys.current.right) s.paddleX += PADDLE_SPEED * dt;
      const oldW = s.paddleW;
      s.paddleW += (s.paddleTarget - s.paddleW) * Math.min(1, dt * 12);
      s.paddleX = Math.max(0, Math.min(W - s.paddleW, s.paddleX - (s.paddleW - oldW) / 2));

      for (const p of s.pops) p.t += dt;
      s.pops = s.pops.filter((p) => p.t < 0.9);

      if (s.stuck) {
        // Everything holds still until the serve, so a lost life never costs more than one.
        for (const b of s.balls) {
          b.x = s.paddleX + s.paddleW / 2;
          b.y = PADDLE_Y - BALL_R;
        }
        return;
      }

      s.elapsed += dt;
      if (s.sizeUntil && s.elapsed > s.sizeUntil) {
        s.paddleTarget = PADDLE.base;
        s.sizeUntil = 0;
      }

      // The wall creeps faster the longer you survive, up to a cap.
      const creep = Math.min(22, 5 + s.elapsed * 0.12);
      for (const k of s.blocks) k.y += creep * dt;
      s.topY += creep * dt;
      while (s.topY > GAP) {
        s.topY -= ROW_H;
        s.blocks.push(...makeRow(s.topY, s.elapsed));
      }
      if (s.blocks.some((k) => k.y + BLOCK_H >= PADDLE_Y - 1)) return loseLife(true);

      for (const d of s.drops) d.y += 150 * dt;
      s.drops = s.drops.filter((d) => {
        const caught =
          d.y + DROP_H >= PADDLE_Y &&
          d.y <= PADDLE_Y + PADDLE_H &&
          d.x + DROP_W >= s.paddleX &&
          d.x <= s.paddleX + s.paddleW;
        if (caught) applyPower(d);
        return !caught && d.y < H;
      });

      // Substeps keep a fast ball from tunnelling through a block.
      const n = 6;
      for (let i = 0; i < n; i++) {
        for (const b of s.balls) {
          b.x += (b.vx * dt) / n;
          b.y += (b.vy * dt) / n;

          if (b.x < BALL_R || b.x > W - BALL_R) {
            b.x = Math.max(BALL_R, Math.min(W - BALL_R, b.x));
            b.vx = b.x < W / 2 ? Math.abs(b.vx) : -Math.abs(b.vx);
            throttled("wall", fx.wall);
          }
          if (b.y < BALL_R) {
            b.y = BALL_R;
            b.vy = Math.abs(b.vy);
            throttled("wall", fx.wall);
          }

          // Paddle: the bounce angle follows where it hit, so you can aim. Each hit is a touch faster.
          if (
            b.vy > 0 &&
            b.y + BALL_R >= PADDLE_Y &&
            b.y - BALL_R <= PADDLE_Y + PADDLE_H &&
            b.x >= s.paddleX - BALL_R &&
            b.x <= s.paddleX + s.paddleW + BALL_R
          ) {
            const hit = (b.x - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
            const floor = SPEED_START + s.elapsed * 1.2;
            const speed = Math.min(SPEED_MAX, Math.max(floor, Math.hypot(b.vx, b.vy) * 1.02));
            const angle = Math.max(-1, Math.min(1, hit)) * (Math.PI / 3);
            b.vx = Math.sin(angle) * speed;
            b.vy = -Math.cos(angle) * speed;
            b.y = PADDLE_Y - BALL_R;
            s.combo = 0;
            setMult(1);
            throttled("paddle", fx.paddle);
          }

          for (let j = 0; j < s.blocks.length; j++) {
            const k = s.blocks[j];
            const cx = Math.max(k.x, Math.min(b.x, k.x + BLOCK_W));
            const cy = Math.max(k.y, Math.min(b.y, k.y + BLOCK_H));
            if ((b.x - cx) ** 2 + (b.y - cy) ** 2 > BALL_R ** 2) continue;
            // Bounce off whichever face the ball went in deeper on.
            const overlapX = Math.min(b.x + BALL_R - k.x, k.x + BLOCK_W - (b.x - BALL_R));
            const overlapY = Math.min(b.y + BALL_R - k.y, k.y + BLOCK_H - (b.y - BALL_R));
            if (overlapX < overlapY) b.vx = b.x < k.x + BLOCK_W / 2 ? -Math.abs(b.vx) : Math.abs(b.vx);
            else b.vy = b.y < k.y + BLOCK_H / 2 ? -Math.abs(b.vy) : Math.abs(b.vy);
            steepen(b, Math.hypot(b.vx, b.vy));

            k.hp -= 1;
            if (k.hp > 0) {
              throttled("block", fx.tough);
              addScore(5, 0, 0);
              break;
            }
            s.blocks.splice(j, 1);
            s.combo += 1;
            const m = Math.min(5, 1 + Math.floor(s.combo / 3));
            setMult(m);
            throttled("block", () => fx.block(s.combo));
            addScore(10 * m, k.x + BLOCK_W / 2, k.y, m > 1 ? `+${10 * m}` : undefined);
            if (k.power) s.drops.push({ x: k.x + (BLOCK_W - DROP_W) / 2, y: k.y, power: k.power });
            break;
          }
        }
        s.balls = s.balls.filter((b) => b.y < H + BALL_R);
        if (!s.balls.length) return loseLife(false);
      }
    };

    const draw = () => {
      const s = state.current;
      const scale = canvas.width / W;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Danger line: the wall costs a life when it reaches it.
      ctx.fillStyle = faint;
      ctx.fillRect(0, PADDLE_Y - 1, W, 1);

      for (const k of s.blocks) {
        if (k.tough && k.hp === 1) {
          // A cracked tough block: just its outline left.
          ctx.strokeStyle = ink;
          ctx.lineWidth = 2;
          ctx.strokeRect(k.x + 1, k.y + 1, BLOCK_W - 2, BLOCK_H - 2);
        } else {
          ctx.fillStyle = k.tough ? ink : mute;
          ctx.fillRect(k.x, k.y, BLOCK_W, BLOCK_H);
        }
        if (k.power) {
          ctx.fillStyle = k.tough && k.hp === 1 ? ink : bone;
          ctx.beginPath();
          ctx.arc(k.x + BLOCK_W / 2, k.y + BLOCK_H / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 10px ${font}`;
      for (const d of s.drops) {
        // Good drops are solid; SHORT is hollow so it reads as one to dodge.
        const bad = d.power === "short";
        ctx.beginPath();
        ctx.roundRect(d.x, d.y, DROP_W, DROP_H, DROP_H / 2);
        ctx.fillStyle = bad ? bone : ink;
        ctx.fill();
        if (bad) {
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fillStyle = bad ? ink : bone;
        ctx.fillText(DROP_LABEL[d.power], d.x + DROP_W / 2, d.y + DROP_H / 2 + 0.5);
      }

      // The paddle blinks in the last two seconds of a size power-up.
      const ending = s.sizeUntil && s.sizeUntil - s.elapsed < 2;
      ctx.globalAlpha = ending && Math.floor(s.elapsed * 8) % 2 ? 0.35 : 1;
      ctx.fillStyle = ink;
      ctx.fillRect(s.paddleX, PADDLE_Y, s.paddleW, PADDLE_H);
      ctx.globalAlpha = 1;

      for (const b of s.balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = `600 12px ${font}`;
      for (const p of s.pops) {
        ctx.globalAlpha = 1 - p.t / 0.9;
        ctx.fillStyle = ink;
        ctx.fillText(p.text, p.x, p.y - p.t * 30);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Clamp dt so a backgrounded tab doesn't teleport the ball on return.
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (phaseRef.current !== "over") step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  const overlay =
    phase === "ready"
      ? { title: "Breakout", line: "Click or press Space to launch" }
      : phase === "serve"
        ? { title: `${lives} ${lives === 1 ? "life" : "lives"} left`, line: "Click or press Space to serve" }
        : phase === "over"
          ? { title: "Game over", line: `${score} points · click to play again` }
          : null;

  return (
    <div>
      <div className="fw-small mb-[calc(10*var(--u))] flex items-center justify-between gap-4 text-mute">
        <span className="flex items-center gap-[calc(18*var(--u))]">
          <span>
            SCORE <span className="text-ink tabular-nums">{score}</span>
            {mult > 1 && <span className="ml-1.5 text-ink">×{mult}</span>}
          </span>
          <span aria-label={`${lives} lives`} className="flex items-center gap-1">
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span
                key={i}
                className={i < lives ? "size-[calc(7*var(--u))] rounded-full bg-ink" : "hidden"}
              />
            ))}
          </span>
        </span>
        <span className="flex items-center gap-[calc(18*var(--u))]">
          <span>
            BEST <span className="text-ink tabular-nums">{Math.max(best, score)}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              sfx.current?.unlock();
              sfx.current?.setMuted(!muted);
            }}
            className="cursor-pointer underline-offset-4 hover:text-ink hover:underline"
          >
            {muted ? "SOUND OFF" : "SOUND ON"}
          </button>
        </span>
      </div>
      <div className="relative border border-faint">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Breakout game. Move the paddle with the mouse or arrow keys; click or press Space to launch."
          className="block aspect-[4/3] w-full cursor-none touch-none outline-none"
        />
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Backed so it stays readable when the wall has come down behind it. */}
            <div className="flex flex-col items-center gap-[calc(6*var(--u))] bg-bone/90 px-[calc(24*var(--u))] py-[calc(14*var(--u))] text-center">
              <p className="fw-title">{overlay.title}</p>
              <p className="fw-small text-mute">{overlay.line}</p>
            </div>
          </div>
        )}
      </div>
      <p className="fw-small mt-[calc(10*var(--u))] text-mute">
        Mouse, touch or ← → to move. Dark blocks take two hits; dotted ones drop a power-up. Catch
        SPLIT, WIDE and +1; SHORT shrinks your bar but pays 75. Chain blocks without touching the
        bar for up to ×5.
      </p>
      <Leaderboard result={result} />
    </div>
  );
}
