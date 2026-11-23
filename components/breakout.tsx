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
/** Two SPLITs (1 → 3 → 9) is the most; more than that and the wall stops being a threat. */
const MAX_BALLS = 9;
const DROP_W = 54;
const DROP_H = 16;
/** SHIELD puts a one-use floor here. */
const SHIELD_Y = H - 4;
const BULLET_W = 2;
const BULLET_H = 8;
const BULLET_SPEED = 720;
const FIRE_EVERY = 0.4;
const BLAST_LIFE = 0.35;
/** What a bomb or line does to each block it reaches: enough for tough, not for steel. */
const BLAST_DAMAGE = 2;

/**
 * Every block is black; bone marks say what it does. normal: 1 hit. tough: 2 (framed). steel: 3
 * (striped). bomb: breaks its eight neighbours. line: clears its row. bonus: pays 50 extra.
 */
type Kind = "normal" | "tough" | "steel" | "bomb" | "line" | "bonus";
type Power = "split" | "wide" | "slow" | "pierce" | "laser" | "shield" | "short" | "fast";
type Block = { x: number; y: number; hp: number; kind: Kind; power?: Power };
type Ball = { x: number; y: number; vx: number; vy: number };
type Drop = { x: number; y: number; power: Power };
type Bullet = { x: number; y: number };
type Blast = { x: number; y: number; kind: "bomb" | "line"; t: number };
type Pop = { x: number; y: number; text: string; t: number; color: string };
type Phase = "ready" | "playing" | "over";
/** A running effect for the score row; `left` is whole seconds (0 for SHIELD, which waits to be used). */
type Effect = { label: string; left: number; bad: boolean };
export type Result = { run: number; score: number; durationMs: number };

const HP: Record<Kind, number> = { normal: 1, tough: 2, steel: 3, bomb: 1, line: 1, bonus: 1 };

// Plain and armoured blocks are black. Green helps you and red hurts you, wherever they appear:
// pills, the paddle, and blocks that carry that power-up.
const GOOD = "#1f9a6e";
const BAD = "#e0453a";
// Each special block has its own colour, carried through to its blast and score pop.
const BOMB = "#ee7a22";
const LINE = "#3a6fd8";
const BONUS = "#b8860b";
const KIND_COLOR: Partial<Record<Kind, string>> = { bomb: BOMB, line: LINE, bonus: BONUS };

/** `weight` is how often it drops relative to the others; bad ones pay 75 for the risk. */
const POWERS: Record<Power, { label: string; bad: boolean; weight: number }> = {
  split: { label: "SPLIT", bad: false, weight: 16 },
  wide: { label: "WIDE", bad: false, weight: 13 },
  slow: { label: "SLOW", bad: false, weight: 11 },
  pierce: { label: "PIERCE", bad: false, weight: 9 },
  laser: { label: "LASER", bad: false, weight: 11 },
  shield: { label: "SHIELD", bad: false, weight: 10 },
  short: { label: "SHORT", bad: true, weight: 15 },
  fast: { label: "FAST", bad: true, weight: 15 },
};
const POWER_LIST = Object.keys(POWERS) as Power[];
const WEIGHT_SUM = POWER_LIST.reduce((n, p) => n + POWERS[p].weight, 0);
const powerColor = (p: Power) => (POWERS[p].bad ? BAD : GOOD);

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
  let r = Math.random() * WEIGHT_SUM;
  for (const p of POWER_LIST) {
    r -= POWERS[p].weight;
    if (r < 0) return p;
  }
  return "split";
}

/** Specials are a steady sprinkle; armour (tough, then steel) gets more common as the run goes on. */
function pickKind(elapsed: number): Kind {
  const r = Math.random();
  if (r < 0.05) return "bomb";
  if (r < 0.08) return "line";
  if (r < 0.12) return "bonus";
  const steel = 0.02 + Math.min(0.1, elapsed / 600);
  const tough = 0.1 + Math.min(0.25, elapsed / 300);
  const a = Math.random();
  return a < steel ? "steel" : a < steel + tough ? "tough" : "normal";
}

/** A row with a few holes. Only plain and armoured blocks carry power-ups. */
function makeRow(y: number, elapsed: number): Block[] {
  const row: Block[] = [];
  for (let c = 0; c < COLS; c++) {
    if (Math.random() > 0.8) continue;
    const kind = pickKind(elapsed);
    const carries = kind === "normal" || kind === "tough" || kind === "steel";
    row.push({
      x: GAP + c * (BLOCK_W + GAP),
      y,
      hp: HP[kind],
      kind,
      power: carries && Math.random() < 0.14 ? pickPower() : undefined,
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
    bullets: [] as Bullet[],
    blasts: [] as Blast[],
    pops: [] as Pop[],
    // The y of the newest (top) row; when it creeps down off the edge, another row spawns above it.
    topY: GAP,
    paddleX: (W - PADDLE.base) / 2,
    paddleW: PADDLE.base,
    paddleTarget: PADDLE.base,
    // Play times when each timed effect wears off; 0 (or anything already past) means off.
    // sizeUntil is WIDE or SHORT, whichever paddleTarget says.
    sizeUntil: 0,
    slowUntil: 0,
    fastUntil: 0,
    pierceUntil: 0,
    laserUntil: 0,
    /** Seconds until the laser's next pair of shots. */
    fireCd: 0,
    shield: false,
    stuck: true,
    /** Seconds with the ball in play. The wall, speed and armour all scale with it. */
    elapsed: 0,
    startedAt: 0,
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
 * One life: the game ends when the last ball drops or the wall reaches the line. Blocks vary
 * (armoured, explosive, row-clearing, bonus), some carry a power-up to catch (green) or dodge
 * (red, worth bonus points if you're brave). Breaking blocks without touching the paddle builds
 * a score multiplier.
 */
export function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [mult, setMult] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [effects, setEffects] = useState<Effect[]>([]);
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

    /** Is a timed effect that ends at `until` still running? */
    const on = (until: number) => until > state.current.elapsed;

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

    const addScore = (n: number, x: number, y: number, label?: string, color = ink) => {
      const s = state.current;
      s.score += n;
      setScore(s.score);
      if (label) s.pops.push({ x, y, text: label, t: 0, color });
    };

    /**
     * Breaks a block and anything its blast reaches; bombs and lines set each other off. A ball
     * break moves the combo on one step, however big the chain, so one lucky bomb can't jump
     * straight to ×5. Laser breaks score at the current multiplier but don't build it.
     */
    const shatter = (first: Block, byBall: boolean) => {
      const s = state.current;
      if (byBall) s.combo += 1;
      const m = Math.min(5, 1 + Math.floor(s.combo / 3));
      first.hp = 0;
      const queue = [first];
      let boom = false;
      while (queue.length) {
        const k = queue.shift()!;
        const cx = k.x + BLOCK_W / 2;
        if (k.kind === "bonus") addScore(10 * m + 50, cx, k.y, `+${10 * m + 50}`, BONUS);
        else addScore(10 * m, cx, k.y, m > 1 ? `+${10 * m}` : undefined);
        if (k.power) s.drops.push({ x: k.x + (BLOCK_W - DROP_W) / 2, y: k.y, power: k.power });
        if (k.kind !== "bomb" && k.kind !== "line") continue;
        boom = true;
        s.blasts.push({ x: cx, y: k.y + BLOCK_H / 2, kind: k.kind, t: 0 });
        for (const o of s.blocks) {
          if (o.hp <= 0) continue;
          const sameRow = Math.abs(o.y - k.y) < 1;
          const reached =
            k.kind === "line"
              ? sameRow
              : Math.abs(o.x - k.x) <= BLOCK_W + GAP + 1 && Math.abs(o.y - k.y) <= ROW_H + 1;
          if (!reached) continue;
          // Blasts do two damage: they clear tough blocks but only crack steel.
          o.hp -= BLAST_DAMAGE;
          if (o.hp > 0) continue;
          o.hp = 0;
          queue.push(o);
        }
      }
      s.blocks = s.blocks.filter((o) => o.hp > 0);
      setMult(m);
      if (boom) throttled("boom", fx.boom);
      else throttled("block", () => fx.block(Math.max(1, s.combo)));
    };

    /** One hit from a ball or a laser shot. PIERCE lets a ball break anything in one go. */
    const hit = (k: Block, byBall: boolean) => {
      if (k.hp <= 0) return;
      if (!(byBall && on(state.current.pierceUntil))) {
        k.hp -= 1;
        if (k.hp > 0) {
          throttled("block", fx.tough);
          addScore(5, 0, 0);
          return;
        }
      }
      shatter(k, byBall);
    };

    const applyPower = (d: Drop) => {
      const s = state.current;
      const cx = d.x + DROP_W / 2;
      const { label, bad } = POWERS[d.power];
      switch (d.power) {
        case "split": {
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
          break;
        }
        case "wide":
          s.paddleTarget = PADDLE.wide;
          s.sizeUntil = s.elapsed + 12;
          break;
        case "short":
          s.paddleTarget = PADDLE.short;
          s.sizeUntil = s.elapsed + 10;
          break;
        // SLOW and FAST cancel each other out.
        case "slow":
          s.slowUntil = s.elapsed + 8;
          s.fastUntil = 0;
          break;
        case "fast":
          s.fastUntil = s.elapsed + 8;
          s.slowUntil = 0;
          break;
        case "pierce":
          s.pierceUntil = s.elapsed + 6;
          break;
        case "laser":
          s.laserUntil = s.elapsed + 6;
          s.fireCd = 0;
          break;
        case "shield":
          s.shield = true;
          break;
      }
      if (d.power === "split") fx.split();
      else if (bad) fx.bad();
      else fx.good();
      addScore(bad ? 75 : 25, cx, d.y, bad ? `+75 ${label}` : label, powerColor(d.power));
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
    // The game sits on the long home page: off screen, it pauses and ignores the keys (the arrow
    // keys are the page's again), so a run can't play on, or end, out of sight.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) keys.current.left = keys.current.right = false;
      },
      { threshold: 0.25 },
    );
    io.observe(canvas);

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (!visible) return;
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
      for (const e of s.blasts) e.t += dt;
      s.blasts = s.blasts.filter((e) => e.t < BLAST_LIFE);

      if (s.stuck) {
        // Everything holds still until the first launch.
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
      if (s.blocks.some((k) => k.y + BLOCK_H >= PADDLE_Y - 1)) return end();

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

      // LASER: a pair of shots from the paddle's ends every FIRE_EVERY seconds.
      if (on(s.laserUntil)) {
        s.fireCd -= dt;
        if (s.fireCd <= 0) {
          s.fireCd = FIRE_EVERY;
          s.bullets.push({ x: s.paddleX + 5, y: PADDLE_Y - BULLET_H }, { x: s.paddleX + s.paddleW - 5, y: PADDLE_Y - BULLET_H });
          throttled("laser", fx.laser);
        }
      }
      const travel = BULLET_SPEED * dt;
      s.bullets = s.bullets.filter((u) => {
        // Sweep the whole distance covered this frame so a shot can't skip over a block.
        const top = u.y - travel;
        let target: Block | undefined;
        for (const k of s.blocks) {
          if (u.x < k.x || u.x > k.x + BLOCK_W || k.y > u.y + BULLET_H || k.y + BLOCK_H < top) continue;
          if (!target || k.y > target.y) target = k;
        }
        if (target) {
          hit(target, false);
          return false;
        }
        u.y = top;
        return u.y + BULLET_H > 0;
      });

      // SLOW and FAST scale how far balls travel, not their speed, so the paddle's aim is unchanged.
      const pace = on(s.slowUntil) ? 0.6 : on(s.fastUntil) ? 1.4 : 1;
      const piercing = on(s.pierceUntil);

      // Substeps keep a fast ball from tunnelling through a block.
      const n = 6;
      for (let i = 0; i < n; i++) {
        for (const b of s.balls) {
          b.x += (b.vx * dt * pace) / n;
          b.y += (b.vy * dt * pace) / n;

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
            const hitAt = (b.x - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
            const floor = SPEED_START + s.elapsed * 1.2;
            const speed = Math.min(SPEED_MAX, Math.max(floor, Math.hypot(b.vx, b.vy) * 1.02));
            const angle = Math.max(-1, Math.min(1, hitAt)) * (Math.PI / 3);
            b.vx = Math.sin(angle) * speed;
            b.vy = -Math.cos(angle) * speed;
            b.y = PADDLE_Y - BALL_R;
            s.combo = 0;
            setMult(1);
            throttled("paddle", fx.paddle);
          }

          // SHIELD: one save from below, then it's gone.
          if (s.shield && b.vy > 0 && b.y + BALL_R >= SHIELD_Y) {
            b.y = SHIELD_Y - BALL_R;
            b.vy = -Math.abs(b.vy);
            steepen(b, Math.hypot(b.vx, b.vy));
            s.shield = false;
            fx.shield();
          }

          for (let j = 0; j < s.blocks.length; j++) {
            const k = s.blocks[j];
            const cx = Math.max(k.x, Math.min(b.x, k.x + BLOCK_W));
            const cy = Math.max(k.y, Math.min(b.y, k.y + BLOCK_H));
            if ((b.x - cx) ** 2 + (b.y - cy) ** 2 > BALL_R ** 2) continue;
            // A piercing ball ploughs straight through; otherwise bounce off whichever face the
            // ball went in deeper on.
            if (!piercing) {
              const overlapX = Math.min(b.x + BALL_R - k.x, k.x + BLOCK_W - (b.x - BALL_R));
              const overlapY = Math.min(b.y + BALL_R - k.y, k.y + BLOCK_H - (b.y - BALL_R));
              if (overlapX < overlapY) b.vx = b.x < k.x + BLOCK_W / 2 ? -Math.abs(b.vx) : Math.abs(b.vx);
              else b.vy = b.y < k.y + BLOCK_H / 2 ? -Math.abs(b.vy) : Math.abs(b.vy);
              steepen(b, Math.hypot(b.vx, b.vy));
            }
            hit(k, true);
            break;
          }
        }
        s.balls = s.balls.filter((b) => b.y < H + BALL_R);
        if (!s.balls.length) return end();
      }
    };

    const drawBlock = (k: Block) => {
      const armoured = k.kind === "tough" || k.kind === "steel";
      const cx = k.x + BLOCK_W / 2;
      const cy = k.y + BLOCK_H / 2;

      // Black unless it's special or carries a power-up; the bone marks get busier the more hits
      // it has left.
      const fill = KIND_COLOR[k.kind] ?? (k.power ? powerColor(k.power) : ink);
      ctx.fillStyle = fill;
      ctx.fillRect(k.x, k.y, BLOCK_W, BLOCK_H);
      ctx.strokeStyle = bone;
      ctx.fillStyle = bone;
      ctx.lineWidth = 1.5;
      if (k.hp >= 3) {
        // Steel: tight diagonal stripes.
        ctx.save();
        ctx.beginPath();
        ctx.rect(k.x, k.y, BLOCK_W, BLOCK_H);
        ctx.clip();
        ctx.beginPath();
        for (let x = k.x - BLOCK_H; x < k.x + BLOCK_W; x += 6) {
          ctx.moveTo(x, k.y + BLOCK_H);
          ctx.lineTo(x + BLOCK_H, k.y);
        }
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.restore();
      } else if (armoured && k.hp === 2) {
        // Two hits left: an inset frame.
        ctx.strokeRect(k.x + 3.5, k.y + 3.5, BLOCK_W - 7, BLOCK_H - 7);
      } else if (armoured) {
        // One hit left on an armoured block: a crack.
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy - 5);
        ctx.lineTo(cx - 2, cy + 1);
        ctx.lineTo(cx + 3, cy - 2);
        ctx.lineTo(cx + 9, cy + 5);
        ctx.stroke();
      }

      ctx.beginPath();
      if (k.kind === "bomb") {
        // ✱
        ctx.lineWidth = 2;
        for (let a = 0; a < 3; a++) {
          const t = (a * Math.PI) / 3 + Math.PI / 2;
          ctx.moveTo(cx + Math.cos(t) * 7, cy + Math.sin(t) * 7);
          ctx.lineTo(cx - Math.cos(t) * 7, cy - Math.sin(t) * 7);
        }
        ctx.stroke();
      } else if (k.kind === "line") {
        // ◄—►
        const l = k.x + 9;
        const r = k.x + BLOCK_W - 9;
        ctx.moveTo(l + 3, cy);
        ctx.lineTo(r - 3, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(l, cy);
        ctx.lineTo(l + 5, cy - 3.5);
        ctx.lineTo(l + 5, cy + 3.5);
        ctx.closePath();
        ctx.moveTo(r, cy);
        ctx.lineTo(r - 5, cy - 3.5);
        ctx.lineTo(r - 5, cy + 3.5);
        ctx.closePath();
        ctx.fill();
      } else if (k.kind === "bonus") {
        // ◆, wide so it can't be mistaken for the power-up dot.
        ctx.moveTo(cx, cy - 5.5);
        ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx, cy + 5.5);
        ctx.lineTo(cx - 8, cy);
        ctx.closePath();
        ctx.fill();
      }

      if (k.power) {
        // A ring in the block's colour clears the stripes or crack underneath so the dot reads.
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bone;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      const s = state.current;
      const scale = canvas.width / W;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Danger line: the game ends when the wall reaches it. It warms to red as the wall closes in.
      const lowest = s.blocks.reduce((m, k) => Math.max(m, k.y + BLOCK_H), 0);
      const near = Math.max(0, Math.min(1, 1 - (PADDLE_Y - lowest) / (ROW_H * 4)));
      ctx.fillStyle = near > 0 ? BAD : faint;
      ctx.globalAlpha = near > 0 ? 0.35 + near * 0.65 : 1;
      ctx.fillRect(0, PADDLE_Y - 1, W, near > 0 ? 2 : 1);
      ctx.globalAlpha = 1;

      for (const k of s.blocks) drawBlock(k);

      // Bomb rings and line flashes.
      for (const e of s.blasts) {
        const p = e.t / BLAST_LIFE;
        ctx.globalAlpha = 1 - p;
        ctx.strokeStyle = KIND_COLOR[e.kind]!;
        ctx.fillStyle = KIND_COLOR[e.kind]!;
        ctx.lineWidth = 2;
        if (e.kind === "bomb") {
          ctx.beginPath();
          ctx.arc(e.x, e.y, 10 + p * 50, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const h = 1 + 5 * (1 - p);
          ctx.fillRect(0, e.y - h / 2, W, h);
        }
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 10px ${font}`;
      for (const d of s.drops) {
        // Good drops are solid; bad ones are hollow so they read as ones to dodge.
        const { label, bad } = POWERS[d.power];
        const color = powerColor(d.power);
        ctx.beginPath();
        ctx.roundRect(d.x, d.y, DROP_W, DROP_H, DROP_H / 2);
        ctx.fillStyle = bad ? bone : color;
        ctx.fill();
        if (bad) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fillStyle = bad ? color : bone;
        ctx.fillText(label, d.x + DROP_W / 2, d.y + DROP_H / 2 + 0.5);
      }

      ctx.fillStyle = GOOD;
      for (const u of s.bullets) ctx.fillRect(u.x - BULLET_W / 2, u.y, BULLET_W, BULLET_H);

      if (s.shield) {
        ctx.fillStyle = GOOD;
        ctx.fillRect(0, SHIELD_Y, W, 2);
      }

      // The paddle takes the colour of an active size power-up and blinks in its last two seconds.
      const blink = Math.floor(s.elapsed * 8) % 2 === 1;
      const sizeEnding = s.sizeUntil && s.sizeUntil - s.elapsed < 2;
      ctx.globalAlpha = sizeEnding && blink ? 0.35 : 1;
      ctx.fillStyle = !s.sizeUntil ? ink : s.paddleTarget === PADDLE.wide ? GOOD : BAD;
      ctx.fillRect(s.paddleX, PADDLE_Y, s.paddleW, PADDLE_H);
      if (on(s.laserUntil)) {
        // Two little guns on the ends.
        ctx.globalAlpha = s.laserUntil - s.elapsed < 2 && blink ? 0.35 : 1;
        ctx.fillStyle = GOOD;
        ctx.fillRect(s.paddleX + 3, PADDLE_Y - 5, 4, 5);
        ctx.fillRect(s.paddleX + s.paddleW - 7, PADDLE_Y - 5, 4, 5);
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = on(s.pierceUntil) ? GOOD : ink;
      for (const b of s.balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = `600 12px ${font}`;
      for (const p of s.pops) {
        ctx.globalAlpha = 1 - p.t / 0.9;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y - p.t * 30);
      }
      ctx.globalAlpha = 1;
    };

    // Timed effects show in the score row, away from where you're tracking the ball. React only
    // hears about it when a label or whole second changes, not every frame.
    let effectsKey = "";
    const syncEffects = () => {
      const s = state.current;
      const list: Effect[] = [];
      const add = (label: string, until: number, bad: boolean) => {
        if (on(until)) list.push({ label, left: Math.ceil(until - s.elapsed), bad });
      };
      add(s.paddleTarget === PADDLE.short ? "SHORT" : "WIDE", s.sizeUntil, s.paddleTarget === PADDLE.short);
      add("SLOW", s.slowUntil, false);
      add("FAST", s.fastUntil, true);
      add("PIERCE", s.pierceUntil, false);
      add("LASER", s.laserUntil, false);
      if (s.shield) list.push({ label: "SHIELD", left: 0, bad: false });
      const key = list.map((e) => `${e.label}${e.left}`).join();
      if (key === effectsKey) return;
      effectsKey = key;
      setEffects(list);
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Clamp dt so a backgrounded tab doesn't teleport the ball on return.
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      // Paused while scrolled away (see `visible`).
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (phaseRef.current !== "over") step(dt);
      draw();
      syncEffects();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  const overlay =
    phase === "ready"
      ? { title: "Breakout", line: "to start", verb: "Click" }
      : phase === "over"
        ? { title: "Game over", line: "to play again", lead: `${score} points · `, verb: "click" }
        : null;

  return (
    <div>
      <div className="fw-small mb-[calc(10*var(--u))] flex items-center justify-between gap-4 text-mute">
        <span className="flex flex-wrap items-center gap-x-[calc(14*var(--u))]">
          <span>
            SCORE <span className="text-ink tabular-nums">{score}</span>
            {mult > 1 && <span className="ml-1.5 text-[#1f9a6e]">×{mult}</span>}
          </span>
          {effects.map((e) => (
            <span key={e.label} className={`tabular-nums ${e.bad ? "text-[#e0453a]" : "text-[#1f9a6e]"}`}>
              {e.label}
              {e.left > 0 && ` ${e.left}`}
            </span>
          ))}
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
          aria-label="Breakout game. Move the paddle with the mouse or arrow keys; click or press Space to start."
          className="block aspect-[4/3] w-full cursor-none touch-none outline-none"
        />
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Backed so it stays readable when the wall has come down behind it. */}
            <div className="flex flex-col items-center gap-[calc(6*var(--u))] bg-bone/90 px-[calc(24*var(--u))] py-[calc(14*var(--u))] text-center">
              <p className="fw-title">{overlay.title}</p>
              <p className="fw-small text-mute">
                {overlay.lead}
                {/* "Tap" on touch screens. */}
                <span className="[@media(pointer:coarse)]:hidden">{overlay.verb}</span>
                <span className="hidden [@media(pointer:coarse)]:inline">{overlay.verb === "Click" ? "Tap" : "tap"}</span>{" "}
                {overlay.line}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="fw-small mt-[calc(10*var(--u))] flex flex-col gap-[calc(6*var(--u))] text-mute">
        <p>
          Mouse, touch or ← → to move. One life. Chain blocks without touching the bar for up to ×5.
        </p>
        <p>
          Blocks: framed ones take two hits, striped ones three. The{" "}
          <span className="text-[#ee7a22]">orange ✱</span> blows up its neighbours, the{" "}
          <span className="text-[#3a6fd8]">blue ◄►</span> clears its row; blasts only crack steel. The{" "}
          <span className="text-[#b8860b]">gold ◆</span> pays 50.
        </p>
        <p>
          Dotted blocks drop a power-up in their colour. Catch the{" "}
          <span className="text-[#1f9a6e]">green</span> ones: SPLIT, WIDE, SLOW, PIERCE, LASER, SHIELD.
          The <span className="text-[#e0453a]">red</span> ones, SHORT and FAST, hurt but pay 75.
        </p>
      </div>
      <Leaderboard result={result} />
    </div>
  );
}
