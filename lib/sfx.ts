// Breakout sound effects, synthesized with Web Audio so there are no files to load.

type Note = { freq: number; to?: number; dur: number; type?: OscillatorType; gain?: number; delay?: number };

const MUTE_KEY = "breakout-muted";

export function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(MUTE_KEY));
}

export function onMutedChange(cb: () => void) {
  window.addEventListener(MUTE_KEY, cb);
  return () => window.removeEventListener(MUTE_KEY, cb);
}

export function createSfx() {
  let ctx: AudioContext | null = null;
  let out: GainNode | null = null;
  let muted = readMuted();

  /** Browsers only allow audio after a gesture, so the first click or key press calls this. */
  const unlock = () => {
    if (!ctx) {
      ctx = new AudioContext();
      out = ctx.createGain();
      out.gain.value = 0.18;
      out.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
  };

  const play = (...notes: Note[]) => {
    if (muted || !ctx || !out) return;
    const t0 = ctx.currentTime;
    for (const n of notes) {
      const start = t0 + (n.delay ?? 0);
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = n.type ?? "square";
      osc.frequency.setValueAtTime(n.freq, start);
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, start + n.dur);
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(n.gain ?? 0.6, start + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
      osc.connect(env).connect(out);
      osc.start(start);
      osc.stop(start + n.dur + 0.02);
    }
  };

  // Major pentatonic, so a long combo climbs without ever sounding wrong.
  const SCALE = [0, 2, 4, 7, 9];
  const comboFreq = (combo: number) => {
    const i = Math.min(combo, 14) - 1;
    const semis = SCALE[i % 5] + 12 * Math.floor(i / 5);
    return 440 * 2 ** (semis / 12);
  };

  return {
    unlock,
    get muted() {
      return muted;
    },
    setMuted(m: boolean) {
      muted = m;
      saveMuted(m);
    },
    launch: () => play({ freq: 330, to: 660, dur: 0.12, type: "triangle" }),
    paddle: () => play({ freq: 220, dur: 0.07, type: "square", gain: 0.4 }),
    wall: () => play({ freq: 160, dur: 0.04, type: "square", gain: 0.2 }),
    block: (combo: number) => play({ freq: comboFreq(combo), dur: 0.09, type: "square", gain: 0.35 }),
    tough: () => play({ freq: 120, to: 90, dur: 0.08, type: "sawtooth", gain: 0.3 }),
    good: () =>
      play(
        { freq: 523, dur: 0.08, type: "triangle" },
        { freq: 659, dur: 0.08, type: "triangle", delay: 0.07 },
        { freq: 784, dur: 0.14, type: "triangle", delay: 0.14 },
      ),
    bad: () => play({ freq: 392, to: 196, dur: 0.25, type: "sawtooth", gain: 0.35 }),
    split: () =>
      play(
        { freq: 880, dur: 0.06, type: "square", gain: 0.3 },
        { freq: 1175, dur: 0.06, type: "square", gain: 0.3, delay: 0.05 },
        { freq: 1568, dur: 0.1, type: "square", gain: 0.3, delay: 0.1 },
      ),
    lose: () => play({ freq: 300, to: 80, dur: 0.4, type: "triangle", gain: 0.6 }),
    over: () =>
      play(
        { freq: 392, dur: 0.18, type: "triangle" },
        { freq: 330, dur: 0.18, type: "triangle", delay: 0.18 },
        { freq: 262, dur: 0.18, type: "triangle", delay: 0.36 },
        { freq: 196, dur: 0.5, type: "triangle", delay: 0.54 },
      ),
  };
}

export type Sfx = ReturnType<typeof createSfx>;
