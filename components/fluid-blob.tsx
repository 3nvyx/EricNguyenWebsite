"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/*
 * A jelly-like blob drawn on a canvas, in the spirit of react-interactive-blob but written here
 * so it can take the sidebar's shape: an oval the size of this element, which the tabs' blob
 * uses as half an oval bulging in from the screen's left edge (components/arc-tabs.tsx).
 *
 * The outline is a ring of POINTS, each with a radial offset and velocity. Every frame each point
 * is pulled toward the average of its neighbours (so a push travels round the edge) and back to
 * the rest oval, and loses a little speed to friction. On top of that the outline drifts on its
 * own: a couple of slow waves running round it. Moving the pointer across the edge pushes the
 * points there in or out, with the pointer's speed; `pulse` changing (a new page) sends a ripple
 * from the right-hand side, where the current tab sits. Reduced motion draws the oval once.
 *
 * The element itself is the oval at rest and the hit area (rounded, so the corners don't catch
 * the pointer); the canvas spills PAD past it on every side for the bulges and is click-through.
 */

const POINTS = 40;
const PAD = 0.18; // canvas margin around the oval, as a share of its size
const ELASTICITY = 0.035; // pull toward the neighbours' average
const SPRING = 0.012; // pull back to the rest oval
const FRICTION = 0.06; // share of speed lost each frame
const SENSITIVITY = 0.0003; // radial push per pixel of pointer motion
const MAX_PUSH = 0.01; // ...capped per event
// Hard limits, so no run of pushes can tear it: the edge stays inside the canvas's PAD (with
// room for the drift) and never moves faster than this a frame.
const MAX_R = 0.28;
const MAX_V = 0.04;
const REACH = 0.32; // how near the edge (as a share of the radius) the pointer has to be
const SPREAD = 2; // points either side of the nearest that also feel a push
const PULSE = 0.012; // the ripple a page change sends

export function FluidBlob({
  className,
  style,
  pulse,
}: {
  className?: string;
  style?: CSSProperties;
  pulse?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Radial offsets and speeds, as shares of the radius. Kept across renders for `pulse`.
  const pts = useRef(Array.from({ length: POINTS }, () => ({ r: 0, v: 0 })));

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#111";
    const p = pts.current;

    let rx = 0;
    let ry = 0;
    let w = 0;
    let h = 0;
    // The box's centre on screen, for the pointer: re-measured on resize and scroll rather than
    // on every pointer move.
    let centre = { x: 0, y: 0 };
    const measure = () => {
      const r = box.getBoundingClientRect();
      centre = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    // A move to a screen with another pixel density doesn't resize anything, so watch for it.
    let dprQuery: MediaQueryList | undefined;
    const watchDpr = () => {
      dprQuery?.removeEventListener("change", resize);
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", resize);
    };
    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      watchDpr();
      measure();
      rx = r.width / 2;
      ry = r.height / 2;
      w = r.width * (1 + 2 * PAD);
      h = r.height * (1 + 2 * PAD);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
      // The canvas has it from here; the box's plain oval was only the stand-in before it drew.
      if (rx > 0) box.style.backgroundColor = "transparent";
      // Hidden (the phone layout, no size) there's nothing to simulate: the loop stops, and
      // starts again when the box gets a size.
      if (!still && rx > 0 && !raf) raf = requestAnimationFrame(frame);
    };

    // The outline's own slow drift: two waves running round it in opposite directions.
    const drift = (a: number, t: number) =>
      still ? 0 : 0.022 * Math.sin(2 * a + t * 0.0005) + 0.016 * Math.sin(3 * a - t * 0.0008 + 1.3);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const at = (i: number) => {
        const k = (i + POINTS) % POINTS;
        const a = (k / POINTS) * Math.PI * 2;
        const s = 1 + p[k].r + drift(a, t);
        return [cx + Math.cos(a) * rx * s, cy + Math.sin(a) * ry * s] as const;
      };
      // A smooth closed curve: through the midpoints, bending at each point.
      ctx.beginPath();
      const [x0, y0] = at(0);
      const [xl, yl] = at(-1);
      ctx.moveTo((x0 + xl) / 2, (y0 + yl) / 2);
      for (let i = 0; i < POINTS; i++) {
        const [x, y] = at(i);
        const [xn, yn] = at(i + 1);
        ctx.quadraticCurveTo(x, y, (x + xn) / 2, (y + yn) / 2);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const clamp = (x: number, m: number) => Math.max(-m, Math.min(m, x));
    const r = new Float64Array(POINTS);
    const step = () => {
      for (let i = 0; i < POINTS; i++) r[i] = p[i].r;
      for (let i = 0; i < POINTS; i++) {
        const q = p[i];
        const neighbours = (r[(i - 1 + POINTS) % POINTS] + r[(i + 1) % POINTS]) / 2;
        q.v = clamp((q.v + (neighbours - q.r) * ELASTICITY - q.r * SPRING) * (1 - FRICTION), MAX_V);
        q.r = clamp(q.r + q.v, MAX_R);
      }
    };

    // The pointer pushes the edge where it crosses it, in the direction it's moving.
    let last: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX - centre.x;
      const y = e.clientY - centre.y;
      if (last && rx > 0) {
        const nx = x / rx;
        const ny = y / ry;
        if (Math.abs(Math.hypot(nx, ny) - 1) < REACH) {
          const a = Math.atan2(ny, nx);
          // Outward speed along the edge's normal direction (roughly), in pixels.
          const radial = (x - last.x) * Math.cos(a) + (y - last.y) * Math.sin(a);
          const push = Math.max(-MAX_PUSH, Math.min(MAX_PUSH, radial * SENSITIVITY));
          const nearest = Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * POINTS) % POINTS;
          for (let k = -SPREAD; k <= SPREAD; k++) {
            p[(nearest + k + POINTS) % POINTS].v += push * (1 - Math.abs(k) / (SPREAD + 1));
          }
        }
      }
      last = { x, y };
    };

    // The simulation steps at a fixed 60 a second whatever the screen's refresh rate, so the
    // jelly moves the same on a 120Hz screen as a 60Hz one (and matches the time-based drift).
    const TICK = 1000 / 60;
    let raf = 0;
    let prev: number | undefined;
    let owed = 0;
    const frame = (t: number) => {
      if (rx === 0) {
        raf = 0;
        prev = undefined;
        return;
      }
      owed += Math.min(t - (prev ?? t), 100);
      prev = t;
      while (owed >= TICK) {
        step();
        owed -= TICK;
      }
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    // A pointer coming back into the window starts fresh, not from where it left.
    const forget = () => (last = null);

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("blur", forget);
      document.documentElement.addEventListener("pointerleave", forget);
    }
    return () => {
      ro.disconnect();
      dprQuery?.removeEventListener("change", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("blur", forget);
      document.documentElement.removeEventListener("pointerleave", forget);
      cancelAnimationFrame(raf);
    };
  }, []);

  // A new page: a ripple from the right-hand side (angle 0), where the current tab sits. Compared
  // with the last value rather than skipping the first run, so StrictMode's double run doesn't
  // ripple on mount; skipped while hidden, so ripples don't pile up unseen.
  const lastPulse = useRef(pulse);
  useEffect(() => {
    if (lastPulse.current === pulse) return;
    lastPulse.current = pulse;
    if (!boxRef.current?.offsetWidth) return;
    const p = pts.current;
    for (let k = -3; k <= 3; k++) p[(k + POINTS) % POINTS].v += PULSE * (1 - Math.abs(k) / 4);
  }, [pulse]);

  return (
    // bg-ink: the oval at rest, shown until the canvas first draws (before hydration, say), so the
    // light tabs on it are never left on the light page.
    <div ref={boxRef} aria-hidden className={cn("rounded-[50%] bg-ink", className)} style={style}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{
          left: `${-PAD * 100}%`,
          top: `${-PAD * 100}%`,
          width: `${(1 + 2 * PAD) * 100}%`,
          height: `${(1 + 2 * PAD) * 100}%`,
        }}
      />
    </div>
  );
}
