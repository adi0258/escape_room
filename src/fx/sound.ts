/**
 * Synthesized audio via WebAudio — no asset files needed. All functions are
 * safe no-ops on platforms without AudioContext (native builds can later
 * swap in react-native-sound behind the same API).
 */
declare const window: any;

let ctx: any = null;
let ambientNodes: { stop: () => void } | null = null;

const getCtx = (): any => {
  if (typeof window === 'undefined') return null;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

/** short envelope beep — the building block for UI sounds */
function tone(freq: number, dur: number, type: string, gainPeak: number, when = 0) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sound = {
  click: () => tone(660, 0.08, 'square', 0.04),
  success: () => {
    tone(523, 0.15, 'sine', 0.08);
    tone(659, 0.15, 'sine', 0.08, 0.12);
    tone(784, 0.3, 'sine', 0.08, 0.24);
  },
  error: () => {
    tone(180, 0.2, 'sawtooth', 0.06);
    tone(140, 0.25, 'sawtooth', 0.06, 0.1);
  },
  whisper: () => tone(320, 0.35, 'sine', 0.03),
  creak: () => {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t0);
    osc.frequency.linearRampToValueAtTime(60, t0 + 0.7);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.02, t0 + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.9);
  },

  /** two quick low thuds — walking to another room */
  footsteps: () => {
    tone(70, 0.09, 'sine', 0.09);
    tone(62, 0.09, 'sine', 0.09, 0.18);
    tone(70, 0.09, 'sine', 0.07, 0.36);
  },
  /** heavy metallic clunk — a lock giving up */
  unlock: () => {
    tone(220, 0.06, 'square', 0.07);
    tone(110, 0.25, 'triangle', 0.09, 0.07);
  },
  /** dry paper rustle approximation */
  paper: () => {
    tone(1800, 0.04, 'sawtooth', 0.015);
    tone(2400, 0.05, 'sawtooth', 0.012, 0.05);
    tone(1500, 0.06, 'sawtooth', 0.015, 0.11);
  },
  /** single clock tick */
  tick: () => tone(1000, 0.03, 'square', 0.05),

  /** low haunted-basement drone + occasional random creaks */
  startAmbient: () => {
    const c = getCtx();
    if (!c || ambientNodes) return;
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const g = c.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    osc2.type = 'sine';
    osc2.frequency.value = 55.7; // slight detune = slow unsettling beat
    g.gain.value = 0.015;
    osc1.connect(g);
    osc2.connect(g);
    g.connect(c.destination);
    osc1.start();
    osc2.start();
    const creakTimer = setInterval(() => {
      if (Math.random() < 0.35) sound.creak();
    }, 9000);
    ambientNodes = {
      stop: () => {
        osc1.stop();
        osc2.stop();
        clearInterval(creakTimer);
      },
    };
  },

  stopAmbient: () => {
    ambientNodes?.stop();
    ambientNodes = null;
  },
};
