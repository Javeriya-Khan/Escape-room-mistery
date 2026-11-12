let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function initAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return createCtx();
  } catch {
    return null;
  }
}

function createCtx(): AudioContext | null {
  if (!ctx) {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.95;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 0.95, ctx.currentTime, 0.02);
}

export function isMuted() {
  return muted;
}

type ToneOpts = {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
  delay?: number;
};

function tone({ freq, dur = 0.16, type = "square", vol = 0.35, slideTo, delay = 0 }: ToneOpts) {
  const c = initAudio();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur = 0.25, vol = 0.25) {
  const c = initAudio();
  if (!c || !master || muted) return;
  const frames = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = vol;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
}

function sweepNoise(dur: number, from: number, to: number, vol = 0.2, delay = 0) {
  const c = initAudio();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + delay;
  const frames = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
}

export const sfx = {
  click: () => tone({ freq: 520, dur: 0.07, type: "square", vol: 0.28 }),
  hover: () => tone({ freq: 880, dur: 0.05, type: "sine", vol: 0.12 }),
  open: () => {
    tone({ freq: 380, dur: 0.12, type: "triangle", vol: 0.3, slideTo: 720 });
    tone({ freq: 720, dur: 0.12, type: "sine", vol: 0.2, delay: 0.08 });
  },
  close: () => tone({ freq: 480, dur: 0.12, type: "triangle", vol: 0.25, slideTo: 200 }),
  found: () => {
    tone({ freq: 660, dur: 0.1, type: "square", vol: 0.32 });
    tone({ freq: 990, dur: 0.14, type: "square", vol: 0.3, delay: 0.09 });
    tone({ freq: 1320, dur: 0.2, type: "sine", vol: 0.25, delay: 0.18 });
  },
  key: () => tone({ freq: 700, dur: 0.05, type: "square", vol: 0.3 }),
  wrong: () => {
    tone({ freq: 220, dur: 0.22, type: "sawtooth", vol: 0.35, slideTo: 90 });
    noise(0.18, 0.15);
  },
  hint: () => {
    tone({ freq: 1200, dur: 0.08, type: "sine", vol: 0.25 });
    tone({ freq: 1600, dur: 0.1, type: "sine", vol: 0.2, delay: 0.07 });
  },
  unlock: () => {
    noise(0.3, 0.2);
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.28, type: "triangle", vol: 0.32, delay: i * 0.11 }),
    );
  },
  // Door ki creak + halka thud
  doorCreak: () => {
    tone({ freq: 70, dur: 1.0, type: "sawtooth", vol: 0.16, slideTo: 150 });
    tone({ freq: 140, dur: 0.9, type: "triangle", vol: 0.1, slideTo: 260, delay: 0.1 });
    sweepNoise(1.1, 300, 1400, 0.22);
    tone({ freq: 60, dur: 0.25, type: "sine", vol: 0.35, slideTo: 40, delay: 1.0 });
  },
  step: () => {
    tone({ freq: 110, dur: 0.05, type: "sine", vol: 0.22, slideTo: 70 });
    sweepNoise(0.06, 900, 300, 0.08);
  },
  whoosh: () => sweepNoise(0.6, 400, 3000, 0.18),
  // Level jeetne ki fanfare (final level par lambi)
  win: (final = false) => {
    const notes = final ? [523, 659, 784, 1046, 784, 1046, 1318, 1568] : [523, 659, 784, 1046];
    notes.forEach((f, i) => {
      tone({ freq: f, dur: 0.32, type: "triangle", vol: 0.3, delay: i * 0.13 });
      tone({ freq: f * 2, dur: 0.25, type: "sine", vol: 0.1, delay: i * 0.13 });
    });
    const end = notes.length * 0.13;
    [523, 659, 784].forEach((f) => tone({ freq: f, dur: 0.9, type: "sine", vol: 0.16, delay: end }));
  },
  tick: () => tone({ freq: 1000, dur: 0.03, type: "sine", vol: 0.08 }),
};
