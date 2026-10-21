"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Three = typeof import("three");

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

function webglAvailable() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Puts the equirectangular video on the inside of a sphere and looks out from the middle.
 * Drag (or the arrow keys) turns the view, with a little coast on release; a click that isn't a
 * drag plays or pauses. The returned `stick` turns it continuously, for the control ball, and
 * `recenter` swings back to the start. Until the video first plays, the poster stands in as a
 * 360° still.
 */
function mount(
  THREE: Three,
  el: HTMLDivElement,
  vid: HTMLVideoElement,
  poster: string | undefined,
  ui: { onLook: () => void; needle: () => HTMLElement | null },
) {
  const { onLook } = ui;
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = "block";
  renderer.domElement.setAttribute("aria-hidden", "true");
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 100);
  const geometry = new THREE.SphereGeometry(10, 64, 32);
  geometry.scale(-1, 1, 1); // seen from inside
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  scene.add(new THREE.Mesh(geometry, material));

  // Redraw only when something changed: a look, a new frame, a texture arriving.
  let dirtyUntil = 0;
  const dirty = (ms = 0) => (dirtyUntil = Math.max(dirtyUntil, performance.now() + ms));

  const textures: InstanceType<Three["Texture"]>[] = [];
  const show = (t: InstanceType<Three["Texture"]>) => {
    t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t);
    material.map = t;
    material.color.set(0xffffff);
    material.needsUpdate = true;
    dirty(100);
  };
  let videoTexture: InstanceType<Three["VideoTexture"]> | null = null;
  if (poster) new THREE.TextureLoader().load(poster, (t) => (videoTexture ? t.dispose() : show(t)));
  const onFrame = () => {
    if (!videoTexture) show((videoTexture = new THREE.VideoTexture(vid)));
    dirty(300);
  };
  vid.addEventListener("playing", onFrame);
  vid.addEventListener("seeked", onFrame);

  // The middle of the video faces you at the start. A larger lon turns the view left.
  const START = 270;
  const s = {
    lon: START, lat: 0, velLon: 0, velLat: 0, stickX: 0, stickY: 0, recentering: false,
    dragging: false, dragged: false, lastX: 0, lastY: 0, lastT: 0, downX: 0, downY: 0,
  };
  const look = (dLon: number, dLat: number) => {
    if (dLon || dLat) s.recentering = false;
    s.lon += dLon;
    s.lat = Math.max(-85, Math.min(85, s.lat + dLat));
    dirty();
  };

  let width = 1;
  let height = 1;
  const fit = () => {
    width = el.clientWidth || 1;
    height = el.clientHeight || 1;
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty();
  };
  const resize = new ResizeObserver(fit);
  resize.observe(el);
  fit();

  const isControl = (e: Event) => !!(e.target as HTMLElement).closest("button, input, [data-control]");
  const down = (e: PointerEvent) => {
    if (isControl(e)) return;
    s.dragging = true;
    s.dragged = false;
    s.lastX = s.downX = e.clientX;
    s.lastY = s.downY = e.clientY;
    s.lastT = performance.now();
    s.velLon = s.velLat = 0;
  };
  const move = (e: PointerEvent) => {
    if (!s.dragging) return;
    if (!s.dragged && Math.hypot(e.clientX - s.downX, e.clientY - s.downY) > 4) {
      s.dragged = true;
      el.setPointerCapture(e.pointerId);
      onLook();
    }
    if (!s.dragged) return;
    const now = performance.now();
    const dt = Math.max((now - s.lastT) / 1000, 1 / 240);
    const k = camera.fov / height; // degrees per pixel, so the scene stays under the pointer
    const dLon = (e.clientX - s.lastX) * k;
    const dLat = (e.clientY - s.lastY) * k;
    look(dLon, dLat);
    s.velLon = damp(s.velLon, dLon / dt, 20, dt);
    s.velLat = damp(s.velLat, dLat / dt, 20, dt);
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = now;
  };
  const up = (e: PointerEvent) => {
    if (!s.dragging) return;
    s.dragging = false;
    if (performance.now() - s.lastT > 80) s.velLon = s.velLat = 0; // held still before letting go
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };
  const click = (e: MouseEvent) => {
    if (isControl(e)) return;
    if (s.dragged) s.dragged = false;
    else if (vid.paused) vid.play();
    else vid.pause();
  };
  const key = (e: KeyboardEvent) => {
    if (isControl(e)) return;
    const turn: Record<string, [number, number]> = { ArrowLeft: [15, 0], ArrowRight: [-15, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] };
    if (turn[e.key]) {
      look(...turn[e.key]);
      onLook();
    } else if (e.key === " " || e.key === "k") {
      if (vid.paused) vid.play();
      else vid.pause();
    } else return;
    e.preventDefault();
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("click", click);
  el.addEventListener("keydown", key);

  // Render only while on screen.
  let visible = true;
  let frame = 0;
  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) dirty(100); // anything that changed while off screen
    if (visible && !frame) frame = requestAnimationFrame(tick);
  });
  view.observe(el);

  const target = new THREE.Vector3();
  let last = performance.now();
  const tick = (now: number) => {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    // The ball: pushed further, it turns faster, gently near the middle for fine aiming.
    if (s.stickX || s.stickY) {
      const curve = (v: number) => Math.sign(v) * Math.abs(v) ** 1.6;
      look(-curve(s.stickX) * 140 * dt, -curve(s.stickY) * 90 * dt);
    }
    if (s.recentering) {
      const toLon = s.lon + ((((START - s.lon) % 360) + 540) % 360) - 180; // the short way round
      s.lon = damp(s.lon, toLon, 6, dt);
      s.lat = damp(s.lat, 0, 6, dt);
      if (Math.abs(toLon - s.lon) < 0.05 && Math.abs(s.lat) < 0.05) s.recentering = false;
      dirty();
    }
    if (!s.dragging && (Math.abs(s.velLon) > 0.5 || Math.abs(s.velLat) > 0.5)) {
      look(s.velLon * dt, s.velLat * dt);
      const drag = Math.exp(-3 * dt);
      s.velLon *= drag;
      s.velLat *= drag;
    }
    if (now < dirtyUntil || !vid.paused) {
      const phi = THREE.MathUtils.degToRad(90 - s.lat);
      const theta = THREE.MathUtils.degToRad(s.lon);
      camera.lookAt(target.setFromSphericalCoords(1, phi, theta));
      renderer.render(scene, camera);
      const needle = ui.needle();
      if (needle) needle.style.transform = `rotate(${START - s.lon}deg)`;
    }
    if (visible) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  const unmount = () => {
    cancelAnimationFrame(frame);
    view.disconnect();
    resize.disconnect();
    vid.removeEventListener("playing", onFrame);
    vid.removeEventListener("seeked", onFrame);
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    el.removeEventListener("click", click);
    el.removeEventListener("keydown", key);
    textures.forEach((t) => t.dispose());
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  return {
    unmount,
    stick: (x: number, y: number) => {
      s.stickX = x;
      s.stickY = y;
      s.velLon = s.velLat = 0;
    },
    recenter: () => {
      s.velLon = s.velLat = 0;
      s.recentering = true;
    },
  };
}

/**
 * A 360° video you can look around in. three.js loads only when one is on the page; without
 * WebGL it falls back to the flat (equirectangular) video with the browser's own controls.
 */
export function Video360({ src, poster, label, className }: { src: string; poster?: string; label: string; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const needle = useRef<HTMLSpanElement>(null);
  const api = useRef<ReturnType<typeof mount> | null>(null);
  const held = useRef({ id: -1, moved: false });
  const [failed, setFailed] = useState(false);
  const [looked, setLooked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    const el = host.current;
    const vid = video.current;
    if (!el || !vid) return;
    if (!webglAvailable()) {
      setFailed(true);
      return;
    }
    setCanFullscreen(!!document.fullscreenEnabled);
    if (vid.readyState >= 1) setDuration(vid.duration); // metadata can arrive before hydration
    let cancelled = false;
    import("three")
      .then((THREE) => {
        if (!cancelled) api.current = mount(THREE, el, vid, poster, { onLook: () => setLooked(true), needle: () => needle.current });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      api.current?.unmount();
      api.current = null;
    };
  }, [poster]);

  if (failed) {
    return <video src={src} poster={poster} controls playsInline preload="metadata" aria-label={label} className={cn("h-full w-full bg-ink object-contain", className)} />;
  }

  const toggle = () => {
    const vid = video.current;
    if (!vid) return;
    if (vid.paused) vid.play();
    else vid.pause();
  };
  // The control ball: the knob follows the pointer within the ring and springs back on release.
  // A tap without moving faces the start again.
  const TRAVEL = 0.32; // of the ball's width
  const aim = (e: React.PointerEvent) => {
    const r = pad.current?.getBoundingClientRect();
    if (!r) return;
    const max = r.width * TRAVEL;
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx *= max / len;
      dy *= max / len;
    }
    if (len > 4) {
      held.current.moved = true;
      setLooked(true);
    }
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
    api.current?.stick(dx / max, dy / max);
  };
  const grab = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    held.current = { id: e.pointerId, moved: false };
    if (knob.current) knob.current.style.transition = "none";
    aim(e);
  };
  const release = (e: React.PointerEvent) => {
    if (e.pointerId !== held.current.id) return;
    held.current.id = -1;
    if (knob.current) {
      knob.current.style.transition = "transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1.2)";
      knob.current.style.transform = "";
    }
    api.current?.stick(0, 0);
    if (!held.current.moved) api.current?.recenter();
  };

  const button = "pointer-events-auto cursor-pointer px-2 py-1 transition-colors hover:bg-bone hover:text-ink";

  return (
    <div
      ref={host}
      tabIndex={0}
      aria-label={`${label}. 360° video: drag, use the control ball or the arrow keys to look around, space to play or pause.`}
      className={cn(
        "relative h-full w-full touch-pan-y select-none overflow-hidden bg-ink outline-none",
        "cursor-grab active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-2",
        className,
      )}
    >
      <video
        ref={video}
        src={src}
        playsInline
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      />

      <span
        className={cn(
          "fw-small pointer-events-none absolute top-[calc(14*var(--u))] left-[calc(14*var(--u))] bg-ink/70 px-2 py-1 text-bone transition-opacity duration-500",
          looked ? "opacity-0" : "opacity-100",
        )}
      >
        360° · Drag or use the ball to look around
      </span>

      <div
        ref={pad}
        data-control
        aria-hidden
        title="Push to look around · tap to face the front"
        onPointerDown={grab}
        onPointerMove={(e) => e.pointerId === held.current.id && aim(e)}
        onPointerUp={release}
        onPointerCancel={release}
        className="absolute right-[calc(14*var(--u))] bottom-[calc(52*var(--u))] size-[72px] cursor-grab touch-none rounded-full border border-bone/50 bg-ink/45 backdrop-blur-sm active:cursor-grabbing max-sm:size-[60px]"
      >
        {/* Which way you're facing: the dot sits at the top when facing the start. */}
        <span ref={needle} className="pointer-events-none absolute inset-[5px]">
          <span className="absolute top-0 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-bone" />
        </span>
        <span
          ref={knob}
          className="pointer-events-none absolute top-1/2 left-1/2 -mt-[14px] -ml-[14px] size-[28px] rounded-full bg-bone shadow-[0_2px_8px_rgb(0_0_0/0.35)] max-sm:-mt-[12px] max-sm:-ml-[12px] max-sm:size-[24px]"
        />
      </div>

      <div className="fw-small pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-[calc(12*var(--u))] bg-gradient-to-t from-ink/80 to-transparent px-[calc(10*var(--u))] pt-[calc(24*var(--u))] pb-[calc(8*var(--u))] text-bone">
        <button type="button" onClick={toggle} className={cn(button, "w-[4.5em] text-left")}>
          {playing ? "Pause" : "Play"}
        </button>
        <span className="tabular-nums">
          {fmt(time)} / {fmt(duration)}
        </span>
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => {
            const vid = video.current;
            if (vid) vid.currentTime = Number(e.target.value);
          }}
          className="pointer-events-auto min-w-0 flex-1 cursor-pointer accent-bone"
        />
        <button type="button" onClick={() => video.current && (video.current.muted = !muted)} className={button}>
          {muted ? "Unmute" : "Mute"}
        </button>
        {canFullscreen && (
          <button
            type="button"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : host.current?.requestFullscreen())}
            className={cn(button, "max-sm:hidden")}
          >
            Full screen
          </button>
        )}
      </div>
    </div>
  );
}
