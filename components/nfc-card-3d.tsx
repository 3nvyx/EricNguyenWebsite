"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { MediaImage } from "@/components/media-image";
import { cn } from "@/lib/utils";

// The card as printed: exported from the generator script in "NFC Biz Card Project", one node per
// print layer, in millimetres with the front facing +Z. Compressed with gltfpack (meshopt).
const MODEL = "/media/nfc-card/card.glb";
const FALLBACK = "/media/nfc-card/preview.png";
const W = 85.6;
const H = 53.98;

/** Each layer, front to back: how far it moves out when exploded, and its label. */
const LAYERS = [
  { name: "front_ink", step: 2, label: "Front art", note: "0.2 mm black" },
  { name: "body", step: 1, label: "Body + pocket", note: "0.3 mm white" },
  { name: "tag", step: 0, label: "NFC tag", note: "25.4 mm, sealed in mid-print" },
  { name: "lid", step: -1, label: "Lid", note: "0.4 mm white" },
  { name: "back_ink", step: -2, label: "Back art", note: "0.2 mm black" },
] as const;
const SPREAD = 15; // mm between exploded layers

const MATERIALS: Record<string, THREE.MeshStandardMaterialParameters> = {
  body: { color: 0xf6f5f1, roughness: 0.55 },
  lid: { color: 0xf6f5f1, roughness: 0.55 },
  front_ink: { color: 0x141414, roughness: 0.42 },
  back_ink: { color: 0x141414, roughness: 0.42 },
  tag: { color: 0xe0b872, roughness: 0.3, transparent: true, opacity: 0.85 },
  coil: { color: 0xc27a46, roughness: 0.35, metalness: 0.85 },
};

let cached: Promise<GLTF> | null = null;
function loadModel() {
  if (!cached) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    cached = loader.loadAsync(MODEL);
    cached.catch(() => (cached = null));
  }
  return cached;
}

/** Rendered client-side only (see MediaSlot), so the check can run during the first render. */
function webglAvailable() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

/**
 * Eric's NFC business card as a live 3D model. Drag to turn it; let go and it settles on a face.
 * With `controls`, a click flips it and a button pulls the print layers apart to show the tag
 * sealed inside. Without, clicks fall through (the card is a link on the projects list).
 */
export function NfcCard3D({ controls = false, className }: { controls?: boolean; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLLIElement | null)[]>([]);
  const leaders = useRef<(SVGPathElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const api = useRef<{ flip: () => void; explode: (on: boolean) => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(() => !webglAvailable());
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || failed) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 1, 2000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-60, 90, 140);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(80, -40, -120);
    scene.add(key, rim);

    const card = new THREE.Group();
    scene.add(card);
    const parts: { obj: THREE.Object3D; base: number; step: number }[] = [];
    const materials: THREE.Material[] = [];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = {
      rotY: -0.9, rotX: 0.35, velY: 0, velX: 0, face: 0, settling: false,
      hoverX: 0, hoverY: 0, explode: 0, explodeTo: 0,
      dragging: false, dragged: false, lastX: 0, lastY: 0, lastT: 0, downX: 0, downY: 0,
    };

    let cancelled = false;
    loadModel()
      .then((gltf) => {
        if (cancelled) return;
        const root = gltf.scene.clone(true);
        root.traverse((o) => {
          const spec = MATERIALS[o.name];
          if (spec) {
            const m = new THREE.MeshStandardMaterial(spec);
            materials.push(m);
            o.traverse((c) => {
              if (c instanceof THREE.Mesh) c.material = m;
            });
          }
          const layer = LAYERS.find((l) => l.name === o.name || (o.name === "coil" && l.name === "tag"));
          if (layer) parts.push({ obj: o, base: o.position.z, step: layer.step });
        });
        card.add(root);
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));

    // Fit the card (or the exploded stack) to the box.
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
    };
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    fit();

    // Input: drag to spin with momentum; hover leans the card toward the pointer.
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      s.dragging = true;
      s.dragged = false;
      s.settling = false;
      s.lastX = s.downX = e.clientX;
      s.lastY = s.downY = e.clientY;
      s.lastT = performance.now();
      s.velY = s.velX = 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.hoverX = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.hoverY = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!s.dragging) return;
      if (!s.dragged && Math.hypot(e.clientX - s.downX, e.clientY - s.downY) > 4) {
        s.dragged = true;
        el.setPointerCapture(e.pointerId);
      }
      if (!s.dragged) return;
      const now = performance.now();
      const dt = Math.max((now - s.lastT) / 1000, 1 / 240);
      const dy = ((e.clientX - s.lastX) / width) * Math.PI * 1.6;
      const dx = ((e.clientY - s.lastY) / height) * Math.PI * 0.8;
      s.rotY += dy;
      s.rotX = THREE.MathUtils.clamp(s.rotX + dx, -0.7, 0.7);
      s.velY = damp(s.velY, dy / dt, 20, dt);
      s.velX = damp(s.velX, dx / dt, 20, dt);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = now;
    };
    const up = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      if (performance.now() - s.lastT > 80) s.velY = s.velX = 0; // held still before letting go
      s.settling = true;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const leave = () => {
      s.hoverX = s.hoverY = 0;
    };
    // A drag shouldn't count as a click on the link around the card.
    const click = (e: MouseEvent) => {
      if (s.dragged) {
        e.preventDefault();
        e.stopPropagation();
        s.dragged = false;
      } else if (controls && !(e.target as HTMLElement).closest("button")) {
        api.current?.flip();
      }
    };
    // Pressing on a link and moving starts the browser's own link drag, which steals the pointer.
    const link = el.closest("a");
    link?.setAttribute("draggable", "false");
    const noNativeDrag = (e: Event) => e.preventDefault();
    el.addEventListener("mousedown", noNativeDrag);
    el.addEventListener("dragstart", noNativeDrag);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", click, true);

    api.current = {
      flip: () => {
        s.settling = false;
        s.velY = 0;
        s.face += Math.PI;
      },
      explode: (on) => {
        s.explodeTo = on ? 1 : 0;
      },
    };

    // Render only while on screen.
    let visible = true;
    let frame = 0;
    const view = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    view.observe(el);

    // Labels sit in a column beside the card, each tied to the middle of its layer's on-screen right
    // edge by a leader line. They keep their spacing however the card is turned: face-on, the layers
    // all project to one spot, and labels placed at their anchors would pile up on the art.
    const anchor = new THREE.Vector3();
    const anchors = LAYERS.map(() => ({ x: 0, y: 0 }));
    const callout = { placed: false, flipped: false, x: 0, ys: LAYERS.map(() => 0), slide: 0, slideTo: 0 };
    const toScreen = (v: THREE.Vector3) => {
      v.applyMatrix4(card.matrixWorld).project(camera);
      return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
    };
    const placeLabels = (e: number, dt: number) => {
      card.updateMatrixWorld();
      const items = labels.current;
      const labelW = Math.max(...items.map((li) => li?.offsetWidth ?? 0));
      const gap = Math.max(...items.map((li) => li?.offsetHeight ?? 0)) + 6;
      const top = 12;
      const bottom = height - (bar.current?.offsetHeight ?? 0);

      let left = width;
      let right = 0;
      LAYERS.forEach((l, i) => {
        const z = l.step * SPREAD * e;
        for (const sx of [-1, 1]) {
          const mid = toScreen(anchor.set((sx * W) / 2, 0, z));
          if (sx === -1 || mid.x > anchors[i].x) anchors[i] = mid;
          for (const sy of [-1, 1]) {
            const corner = toScreen(anchor.set((sx * W) / 2, (sy * H) / 2, z)).x;
            left = Math.min(left, corner);
            right = Math.max(right, corner);
          }
        }
      });

      // Keep the stack's order down the column (flipped when the back faces up), then push the
      // labels apart, centred on their anchors and kept inside the box.
      const tilt = anchors[0].y - anchors[LAYERS.length - 1].y;
      if (Math.abs(tilt) > 8 || !callout.placed) callout.flipped = tilt > 0;
      const order = LAYERS.map((_, i) => i);
      if (callout.flipped) order.reverse();
      const ys = order.map((i) => anchors[i].y);
      for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k], ys[k - 1] + gap);
      const centre = order.reduce((sum, i, k) => sum + anchors[i].y - ys[k], 0) / ys.length;
      for (let k = 0; k < ys.length; k++) ys[k] += centre;
      ys[ys.length - 1] = Math.min(ys[ys.length - 1], bottom - gap / 2);
      for (let k = ys.length - 2; k >= 0; k--) ys[k] = Math.min(ys[k], ys[k + 1] - gap);
      ys[0] = Math.max(ys[0], top + gap / 2);
      for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k], ys[k - 1] + gap);

      // Where the column doesn't fit beside the card (narrow screens), slide the card left to make room.
      callout.slideTo = THREE.MathUtils.clamp(right + callout.slide + 28 + labelW + 12 - width, 0, left + callout.slide - 12);
      const x = Math.min(right + 28, width - labelW - 12);
      const rate = reduced || !callout.placed ? Infinity : 10;
      callout.x = damp(callout.x, x, rate, dt);
      order.forEach((i, k) => (callout.ys[i] = damp(callout.ys[i], ys[k], rate, dt)));
      callout.placed = true;

      const opacity = String(Math.max(0, e * 2 - 1));
      LAYERS.forEach((_, i) => {
        const li = items[i];
        const line = leaders.current[i];
        const { x: ax, y: ay } = anchors[i];
        const y = callout.ys[i];
        if (li) {
          li.style.transform = `translate(${callout.x}px, ${y}px) translateY(-50%)`;
          li.style.opacity = opacity;
        }
        if (line) {
          line.setAttribute("d", `M${ax},${ay} L${callout.x - 12},${y} H${callout.x - 4}`);
          line.style.opacity = opacity;
        }
      });
    };

    let last = performance.now();
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const t = now / 1000;

      s.explode = reduced ? s.explodeTo : damp(s.explode, s.explodeTo, 5, dt);
      const e = s.explode;

      if (!s.dragging) {
        if (s.settling) {
          // Coast on the throw, then land on whichever face is nearest.
          s.rotY += s.velY * dt;
          s.velY *= Math.exp(-2.5 * dt);
          if (Math.abs(s.velY) < 1.2) {
            s.face = Math.round(s.rotY / Math.PI) * Math.PI;
            s.settling = false;
          }
        } else {
          // Exploded, it turns and tips back so the layers stack down the screen.
          const sway = reduced ? 0 : Math.sin(t * 0.6) * 0.18;
          const toY = s.face + (-0.3 + sway) * (1 - e) - 0.55 * e + s.hoverX * 0.25;
          s.rotY = damp(s.rotY, toY, 4, dt);
        }
        s.velX *= Math.exp(-6 * dt);
        const toX = (0.25 + (reduced ? 0 : Math.sin(t * 0.45) * 0.06)) * (1 - e) - 0.85 * e + s.hoverY * 0.15;
        s.rotX = damp(s.rotX + s.velX * dt, toX, 3, dt);
      }
      card.rotation.set(s.rotX, s.rotY, 0);

      for (const p of parts) p.obj.position.z = p.base + p.step * SPREAD * e;

      // Pull back to fit the card, and further for the exploded stack.
      const fov = THREE.MathUtils.degToRad(camera.fov / 2);
      const span = 1.18 + e * 0.7;
      const dist = Math.max((W * span) / 2 / Math.tan(fov) / camera.aspect, (H * span * 1.15) / 2 / Math.tan(fov));
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      callout.slide = damp(callout.slide, e > 0.01 ? callout.slideTo : 0, reduced ? Infinity : 6, dt);
      camera.setViewOffset(width, height, callout.slide, 0, width, height);

      renderer.render(scene, camera);

      if (e > 0.01) placeLabels(e, dt);
      else callout.placed = false;

      if (visible) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      view.disconnect();
      resize.disconnect();
      link?.removeAttribute("draggable");
      el.removeEventListener("mousedown", noNativeDrag);
      el.removeEventListener("dragstart", noNativeDrag);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", click, true);
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, [controls, failed]);

  if (failed) return <MediaImage src={FALLBACK} alt="Eric's NFC business card, front and back" label="nfc-card" className="object-contain" />;

  const toggle = () => {
    api.current?.explode(!exploded);
    setExploded(!exploded);
  };

  return (
    <div
      ref={host}
      role="img"
      aria-label="3D model of Eric's NFC business card. Drag to turn it."
      className={cn("relative h-full w-full touch-pan-y select-none overflow-hidden bg-faint/75", "cursor-grab active:cursor-grabbing", className)}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full text-ink/40">
        {LAYERS.map((l, i) => (
          <path
            key={l.name}
            ref={(n) => {
              leaders.current[i] = n;
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            opacity={0}
          />
        ))}
      </svg>
      <ul aria-hidden className="pointer-events-none absolute inset-0">
        {LAYERS.map((l, i) => (
          <li
            key={l.name}
            ref={(n) => {
              labels.current[i] = n;
            }}
            className="fw-small absolute top-0 left-0 whitespace-nowrap text-ink opacity-0"
          >
            {l.label} <span className="text-mute max-sm:hidden">{l.note}</span>
          </li>
        ))}
      </ul>

      <div
        ref={bar}
        className={cn(
          "fw-small pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-[calc(14*var(--u))] text-mute transition-opacity duration-500",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <span>{controls ? "Drag to turn · Click to flip" : "Drag to turn"}</span>
        {controls && (
          <button
            type="button"
            onClick={toggle}
            aria-pressed={exploded}
            className="pointer-events-auto cursor-pointer border border-ink/40 px-3 py-1 text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            {exploded ? "Assemble" : "Show layers"}
          </button>
        )}
      </div>
    </div>
  );
}
