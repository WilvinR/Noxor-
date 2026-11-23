"use strict";
/* ================== AUDIO ================== */
const AU = { c: null, on: store.snd !== false };
function audioInit() {
  if (AU.c) {
    if (AU.c.state === "suspended") AU.c.resume();
    return;
  }
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    const c = new A();
    AU.c = c;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 5;
    comp.attack.value = 0.002;
    comp.release.value = 0.2;
    AU.master = c.createGain();
    AU.master.gain.value = AU.on ? 0.9 : 0;
    AU.master.connect(comp);
    comp.connect(c.destination);
    AU.sfx = c.createGain();
    AU.sfx.gain.value = 1;
    AU.sfx.connect(AU.master);
    AU.mus = c.createGain();
    AU.mus.gain.value = 0.55;
    AU.mus.connect(AU.master);
    const sr = c.sampleRate;
    const mkImp = (sec, dec) => {
      const l = sr * sec,
        b = c.createBuffer(2, l, sr);
      for (let ch = 0; ch < 2; ch++) {
        const d = b.getChannelData(ch);
        for (let i = 0; i < l; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / l, dec) * (i < sr * 0.012 ? 0.3 : 1);
        }
      }
      return b;
    };
    AU.rev = c.createConvolver();
    AU.rev.buffer = mkImp(2.6, 3.2);
    const rg = c.createGain();
    rg.gain.value = 0.42;
    AU.rev.connect(rg);
    rg.connect(AU.master);
    const nl = sr * 2;
    AU.noise = c.createBuffer(1, nl, sr);
    let d = AU.noise.getChannelData(0);
    for (let i = 0; i < nl; i++) d[i] = Math.random() * 2 - 1;
    AU.brown = c.createBuffer(1, nl, sr);
    d = AU.brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nl; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    AU.dist = c.createWaveShaper();
    const cu = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = i / 512 - 1;
      cu[i] = Math.tanh(x * 3.2);
    }
    AU.dist.curve = cu;
    AU.dist.connect(AU.sfx);
    AU.dist2 = c.createWaveShaper();
    const cu2 = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = i / 512 - 1;
      cu2[i] = Math.tanh(x * 6);
    }
    AU.dist2.curve = cu2;
    const dg = c.createGain();
    dg.gain.value = 0.5;
    AU.dist2.connect(dg);
    dg.connect(AU.sfx);
    // flamethrower loop
    const fs = c.createBufferSource();
    fs.buffer = AU.brown;
    fs.loop = true;
    const ff = c.createBiquadFilter();
    ff.type = "lowpass";
    ff.frequency.value = 900;
    const ff2 = c.createBiquadFilter();
    ff2.type = "peaking";
    ff2.frequency.value = 300;
    ff2.gain.value = 8;
    const fn = c.createBufferSource();
    fn.buffer = AU.noise;
    fn.loop = true;
    const fnf = c.createBiquadFilter();
    fnf.type = "bandpass";
    fnf.frequency.value = 2200;
    fnf.Q.value = 0.8;
    const fng = c.createGain();
    fng.gain.value = 0.18;
    AU.flameG = c.createGain();
    AU.flameG.gain.value = 0;
    fs.connect(ff);
    ff.connect(ff2);
    ff2.connect(AU.flameG);
    fn.connect(fnf);
    fnf.connect(fng);
    fng.connect(AU.flameG);
    AU.flameG.connect(AU.sfx);
    const fr = c.createGain();
    fr.gain.value = 0.3;
    AU.flameG.connect(fr);
    fr.connect(AU.rev);
    fs.start();
    fn.start();
    startAmbient();
    setTimeout(() => {
      try {
        buildSounds();
      } catch (e) {}
    }, 30);
  } catch (e) {
    AU.c = null;
  }
}
function setSound(on) {
  AU.on = on;
  store.snd = on;
  save();
  if (AU.c) AU.master.gain.setTargetAtTime(on ? 0.9 : 0, AU.c.currentTime, 0.05);
  ["sndBtn", "sndBtn2"].forEach((i) => ($(i).textContent = on ? "🔊 SONIDO" : "🔇 SIN SONIDO"));
}
function outp(node, rev, pan) {
  const c = AU.c;
  let n = node;
  if (pan !== undefined && c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.value = clamp(pan, -1, 1);
    node.connect(p);
    n = p;
  }
  n.connect(AU.sfx);
  if (rev) {
    const g = c.createGain();
    g.gain.value = rev;
    n.connect(g);
    g.connect(AU.rev);
  }
}
function nz(o) {
  const c = AU.c;
  if (!c) return;
  const t = c.currentTime + (o.d || 0);
  const s = c.createBufferSource();
  s.buffer = o.brown ? AU.brown : AU.noise;
  s.playbackRate.value = o.rate || 1;
  const f = c.createBiquadFilter();
  f.type = o.type || "bandpass";
  f.frequency.setValueAtTime(o.f, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
  f.Q.value = o.q || 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.g, t + (o.a || 0.002));
  if (o.hold) g.gain.setValueAtTime(o.g, t + o.hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  s.connect(f);
  f.connect(g);
  if (o.dist) {
    g.connect(AU.dist);
  }
  outp(g, o.rev, o.pan);
  s.start(t, Math.random() * 1.5);
  s.stop(t + o.dur + 0.05);
}
function tn(o) {
  const c = AU.c;
  if (!c) return;
  const t = c.currentTime + (o.d || 0);
  const s = c.createOscillator();
  s.type = o.w || "sine";
  s.frequency.setValueAtTime(o.f, t);
  if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + (o.fd || o.dur));
  if (o.det) s.detune.value = o.det;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.g, t + (o.a || 0.003));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  let n = s;
  if (o.lp) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    s.connect(f);
    n = f;
  }
  n.connect(g);
  if (o.dist) {
    g.connect(o.dist === 2 ? AU.dist2 : AU.dist);
    if (o.rev) {
      const r = c.createGain();
      r.gain.value = o.rev;
      g.connect(r);
      r.connect(AU.rev);
    }
  } else outp(g, o.rev, o.pan);
  s.start(t);
  s.stop(t + o.dur + 0.05);
}
const SHP = {
  pistol: {
    len: 1,
    crack: 0.9,
    nw: 0.0011,
    bright: 9000,
    tb: 0.012,
    t1: 0.022,
    blast: 1.3,
    hiss: 0.8,
    f0: 190,
    f1: 60,
    t2: 0.045,
    thump: 0.55,
    mech: [
      [0.012, 3400, 0.35],
      [0.05, 2600, 0.25],
    ],
    echo: [
      [0.09, 0.32],
      [0.21, 0.2],
      [0.38, 0.1],
    ],
    drive: 1.8,
    gain: 0.72,
    rev: 0.35,
  },
  smg: {
    len: 0.75,
    crack: 0.7,
    nw: 0.0009,
    bright: 8500,
    tb: 0.01,
    t1: 0.015,
    blast: 1.1,
    hiss: 0.7,
    f0: 170,
    f1: 60,
    t2: 0.03,
    thump: 0.42,
    mech: [[0.01, 3800, 0.25]],
    echo: [
      [0.08, 0.25],
      [0.19, 0.14],
      [0.33, 0.07],
    ],
    drive: 1.6,
    gain: 0.5,
    rev: 0.22,
  },
  rifle: {
    len: 1.3,
    crack: 1,
    nw: 0.0008,
    bright: 11000,
    tb: 0.016,
    t1: 0.032,
    blast: 1.6,
    hiss: 1,
    f0: 160,
    f1: 48,
    t2: 0.06,
    thump: 0.75,
    mech: [[0.012, 2900, 0.3]],
    echo: [
      [0.1, 0.38],
      [0.24, 0.24],
      [0.43, 0.12],
      [0.7, 0.06],
    ],
    drive: 2,
    gain: 0.72,
    rev: 0.35,
  },
  shotgun: {
    len: 1.6,
    crack: 0.9,
    nw: 0.0016,
    bright: 6500,
    tb: 0.025,
    t1: 0.04,
    blast: 2,
    hiss: 0.6,
    f0: 120,
    f1: 42,
    t2: 0.075,
    thump: 0.9,
    echo: [
      [0.12, 0.42],
      [0.27, 0.28],
      [0.48, 0.15],
      [0.8, 0.07],
    ],
    drive: 2.2,
    gain: 0.9,
    rev: 0.5,
  },
  sniper: {
    len: 2.2,
    crack: 1.2,
    nw: 0.0007,
    bright: 13000,
    tb: 0.018,
    t1: 0.036,
    blast: 2.1,
    hiss: 1.2,
    f0: 110,
    f1: 36,
    t2: 0.085,
    thump: 0.95,
    echo: [
      [0.14, 0.48],
      [0.32, 0.32],
      [0.58, 0.18],
      [0.95, 0.09],
      [1.4, 0.04],
    ],
    drive: 2.3,
    gain: 0.95,
    rev: 0.6,
  },
};
function clickInto(arr, sr, t0, f, g) {
  const s = Math.floor(t0 * sr),
    len = Math.floor(sr * 0.04);
  const fs = [f, f * 1.47, f * 2.09, f * 2.76];
  for (let i = 0; i < len && s + i < arr.length; i++) {
    const t = i / sr;
    let v = 0;
    for (let k = 0; k < 4; k++) v += Math.sin(TAU * fs[k] * t + k) * Math.exp(-t / (0.007 / (k + 1)));
    v += (Math.random() * 2 - 1) * Math.exp(-t / 0.0012) * 1.6;
    arr[s + i] += v * g * 0.35;
  }
}
function genShot(o) {
  const c = AU.c,
    sr = c.sampleRate,
    n = Math.floor(sr * o.len);
  const b = c.createBuffer(2, n, sr);
  const dry = new Float32Array(n);
  let lp = 0,
    lp2 = 0,
    ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let x = 0;
    if (t < o.nw) x += (t < o.nw * 0.45 ? 1 : -0.75) * o.crack;
    const w = Math.random() * 2 - 1;
    const fc = 350 + o.bright * Math.exp(-t / o.tb);
    const a = 1 - Math.exp((-TAU * fc) / sr);
    lp += a * (w - lp);
    lp2 += a * (lp - lp2);
    const env = t < 0.0006 ? t / 0.0006 : Math.exp(-t / o.t1);
    x +=
      lp2 * env * o.blast * 2.4 +
      w * Math.exp(-t / 0.0025) * o.hiss * 0.55 +
      lp2 * Math.exp(-t / (o.t1 * 3)) * o.blast * 0.28;
    const f = o.f1 + (o.f0 - o.f1) * Math.exp(-t / 0.025);
    ph += (TAU * f) / sr;
    x += Math.sin(ph) * Math.exp(-t / o.t2) * o.thump * (t < 0.002 ? t / 0.002 : 1);
    dry[i] = x;
  }
  for (const m of o.mech || []) clickInto(dry, sr, m[0], m[1], m[2]);
  for (let ch = 0; ch < 2; ch++) {
    const out = b.getChannelData(ch);
    out.set(dry);
    for (const [d, g] of o.echo) {
      const off = Math.floor((d + (ch ? 0.019 : 0) + Math.random() * 0.012) * sr);
      let s1 = 0,
        s2 = 0;
      for (let i = 0; i + off < n; i++) {
        s1 += 0.09 * (dry[i] - s1);
        s2 += 0.09 * (s1 - s2);
        out[i + off] += s2 * g * 1.15;
      }
    }
    const k = Math.tanh(o.drive);
    for (let i = 0; i < n; i++) out[i] = (Math.tanh(out[i] * o.drive) / k) * o.gain;
    const fl = Math.floor(sr * 0.06);
    for (let i = 0; i < fl; i++) out[n - 1 - i] *= i / fl;
  }
  return b;
}
function genMech(list, len) {
  const c = AU.c,
    sr = c.sampleRate,
    n = Math.floor(sr * len);
  const b = c.createBuffer(1, n, sr);
  const d = b.getChannelData(0);
  for (const m of list) clickInto(d, sr, m[0], m[1], m[2]);
  return b;
}
function genBoom(big) {
  const c = AU.c,
    sr = c.sampleRate,
    len = big ? 3.2 : 2.4,
    n = Math.floor(sr * len);
  const b = c.createBuffer(2, n, sr);
  const dry = new Float32Array(n);
  let br = 0,
    lp = 0,
    lp2 = 0,
    ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const w = Math.random() * 2 - 1;
    br = (br + 0.03 * w) / 1.03;
    const fc = 90 + (big ? 3500 : 2800) * Math.exp(-t / 0.07);
    const a = 1 - Math.exp((-TAU * fc) / sr);
    lp += a * (br * 6 + w * 0.15 - lp);
    lp2 += a * (lp - lp2);
    const env = t < 0.003 ? t / 0.003 : Math.exp(-t / (big ? 0.7 : 0.5));
    let x = lp2 * env * 3.2;
    const f = 28 + 60 * Math.exp(-t / 0.08);
    ph += (TAU * f) / sr;
    x += Math.sin(ph) * Math.exp(-t / 0.35) * 1.3;
    if (t < 0.004) x += (Math.random() * 2 - 1) * 1.2;
    if (t > 0.05 && t < 1.4 && Math.random() < 0.0009 * Math.exp(-t / 0.5))
      clickInto(dry, sr, t, rnd(900, 3000), rnd(0.2, 0.6));
    dry[i] += x;
  }
  for (let ch = 0; ch < 2; ch++) {
    const out = b.getChannelData(ch);
    out.set(dry);
    for (const [d, g] of [
      [0.22, 0.45],
      [0.5, 0.28],
      [0.9, 0.14],
    ]) {
      const off = Math.floor((d + (ch ? 0.025 : 0)) * sr);
      let s1 = 0;
      for (let i = 0; i + off < n; i++) {
        s1 += 0.04 * (dry[i] - s1);
        out[i + off] += s1 * g * 1.5;
      }
    }
    for (let i = 0; i < n; i++) out[i] = Math.tanh(out[i] * 2.2) * 0.95;
    const fl = Math.floor(sr * 0.1);
    for (let i = 0; i < fl; i++) out[n - 1 - i] *= i / fl;
  }
  return b;
}
function playBuf(buf, o) {
  const c = AU.c;
  if (!c || !buf) return;
  o = o || {};
  const s = c.createBufferSource();
  s.buffer = buf;
  s.playbackRate.value = o.rate || 1;
  const g = c.createGain();
  g.gain.value = o.g || 1;
  s.connect(g);
  outp(g, o.rev, o.pan);
  s.start(c.currentTime + (o.d || 0));
}
function buildSounds() {
  AU.shots = {};
  for (const k in SHP) {
    AU.shots[k] = [0, 1, 2].map(() => genShot(SHP[k]));
  }
  AU.mech = {
    pump: genMech(
      [
        [0, 1900, 0.6],
        [0.03, 2700, 0.4],
        [0.13, 1500, 0.75],
        [0.155, 2300, 0.5],
      ],
      0.4,
    ),
    bolt: genMech(
      [
        [0, 2300, 0.5],
        [0.1, 1700, 0.55],
        [0.24, 2700, 0.5],
        [0.31, 1900, 0.6],
      ],
      0.5,
    ),
    magOut: genMech(
      [
        [0, 1500, 0.55],
        [0.02, 2500, 0.3],
      ],
      0.15,
    ),
    magIn: genMech(
      [
        [0, 1150, 0.75],
        [0.016, 3100, 0.5],
      ],
      0.15,
    ),
    rack: genMech(
      [
        [0, 2700, 0.6],
        [0.07, 2000, 0.75],
      ],
      0.2,
    ),
    empty: genMech([[0, 3300, 0.5]], 0.08),
    swap: genMech(
      [
        [0, 1400, 0.4],
        [0.05, 2200, 0.35],
      ],
      0.15,
    ),
  };
  AU.booms = [genBoom(0), genBoom(1)];
}
let lastShell = 0,
  lastFlesh = 0,
  lastGroan = 0,
  lastStep = 0;
function sfxShot(id, pan) {
  if (!AU.c) return;
  if (id === "rocket") {
    nz({ type: "bandpass", f: 300, f2: 2400, q: 0.7, g: 0.7, a: 0.02, dur: 0.6, rev: 0.5, pan });
    nz({ brown: true, type: "lowpass", f: 900, f2: 150, g: 0.9, dur: 0.5, pan });
    tn({ f: 110, f2: 40, dur: 0.25, g: 0.8, dist: 1 });
    nz({ type: "highpass", f: 3000, g: 0.35, dur: 0.05, pan });
    return;
  }
  if (id === "flamer") return;
  if (AU.shots && AU.shots[id]) {
    playBuf(pick(AU.shots[id]), { rate: rnd(0.95, 1.05), pan, rev: SHP[id].rev });
    if (id === "shotgun") playBuf(AU.mech.pump, { d: 0.36, g: 0.9, pan: -0.2, rev: 0.15 });
    if (id === "sniper") playBuf(AU.mech.bolt, { d: 0.5, g: 0.9, pan: -0.2, rev: 0.15 });
  }
}
function sfxShell() {
  const n = performance.now();
  if (n - lastShell < 70 || !AU.c) return;
  lastShell = n;
  const f = rnd(4200, 6200);
  tn({ f, dur: 0.09, g: 0.035, pan: -0.3 });
  tn({ f: f * 1.47, dur: 0.06, g: 0.02, d: 0.004, pan: -0.3 });
  tn({ f: f * 0.9, dur: 0.05, g: 0.015, d: 0.09, pan: -0.3 });
}
function sfxReload(t) {
  if (!AU.c || !AU.mech) return;
  const m = AU.mech;
  playBuf(m.magOut, { g: 0.8, pan: -0.2 });
  playBuf(m.magIn, { d: t * 0.6, g: 0.9, pan: -0.2 });
  playBuf(m.rack, { d: t * 0.85, g: 0.9, pan: -0.2, rev: 0.1 });
}
function sfxEmpty() {
  if (AU.mech) playBuf(AU.mech.empty, { g: 0.7 });
}
function sfxFlesh(pan, head) {
  const n = performance.now();
  if (n - lastFlesh < 45 || !AU.c) return;
  lastFlesh = n;
  nz({ type: "lowpass", f: 900, f2: 200, g: 0.45, dur: 0.09, pan });
  tn({ f: 140, f2: 60, dur: 0.07, g: 0.25, pan });
  if (head) {
    nz({ type: "bandpass", f: 1800, q: 2, g: 0.35, dur: 0.06, pan, d: 0.01 });
    nz({ brown: true, type: "lowpass", f: 500, g: 0.4, dur: 0.18, pan, d: 0.02 });
  }
}
function sfxGroan(pan, pitch = 1, big = 0, force) {
  const n = performance.now();
  if (!AU.c || (!force && n - lastGroan < 650)) return;
  lastGroan = n;
  const c = AU.c,
    t = c.currentTime,
    dur = rnd(0.7, 1.3) * (big ? 1.6 : 1);
  const o = c.createOscillator();
  o.type = "sawtooth";
  const f0 = (big ? 48 : rnd(75, 105)) * pitch;
  o.frequency.setValueAtTime(f0 * 1.15, t);
  o.frequency.linearRampToValueAtTime(f0 * 0.75, t + dur);
  const l = c.createOscillator();
  l.frequency.value = rnd(5, 9);
  const lg = c.createGain();
  lg.gain.value = f0 * 0.12;
  l.connect(lg);
  lg.connect(o.frequency);
  const f1 = c.createBiquadFilter();
  f1.type = "bandpass";
  f1.frequency.setValueAtTime(big ? 320 : rnd(480, 650), t);
  f1.frequency.linearRampToValueAtTime(big ? 250 : 380, t + dur);
  f1.Q.value = 3;
  const f2 = c.createBiquadFilter();
  f2.type = "bandpass";
  f2.frequency.value = big ? 800 : 1150;
  f2.Q.value = 5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.9 : 0.45, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const sh = c.createWaveShaper();
  sh.curve = AU.dist.curve;
  o.connect(sh);
  sh.connect(f1);
  sh.connect(f2);
  f1.connect(g);
  const g2 = c.createGain();
  g2.gain.value = 0.6;
  f2.connect(g2);
  g2.connect(g);
  outp(g, big ? 0.9 : 0.45, pan);
  o.start(t);
  l.start(t);
  o.stop(t + dur + 0.1);
  l.stop(t + dur + 0.1);
  nz({ type: "bandpass", f: big ? 600 : 1000, q: 1.5, g: big ? 0.35 : 0.15, a: 0.1, dur, pan });
}
function sfxRoar() {
  if (!AU.c) return;
  [42, 44.5, 63, 85].forEach((f, i) =>
    tn({
      w: "sawtooth",
      f: f * 1.2,
      f2: f * 0.8,
      fd: 2.2,
      dur: 2.3,
      g: 0.32,
      a: 0.25,
      dist: 2,
      rev: 0.9,
      lp: 900,
    }),
  );
  nz({ brown: true, type: "lowpass", f: 700, f2: 150, g: 1, a: 0.3, dur: 2.4, rev: 1 });
  sfxGroan(0, 0.55, 1, true);
}
function sfxBoom(pan, big) {
  if (!AU.c) return;
  if (AU.booms) playBuf(AU.booms[big ? 1 : 0], { rate: rnd(0.92, 1.05), pan, rev: 0.6 });
  else nz({ brown: true, type: "lowpass", f: 2200, f2: 60, g: 1.4, dur: 2, rev: 0.9, pan });
}
function sfxHurt() {
  tn({ w: "sawtooth", f: 190, f2: 120, dur: 0.2, g: 0.25, lp: 900 });
  nz({ type: "lowpass", f: 700, g: 0.5, dur: 0.12 });
  tn({ f: 60, f2: 40, dur: 0.2, g: 0.5 });
}
function sfxJump() {
  nz({ type: "bandpass", f: 1400, f2: 700, q: 1, g: 0.12, a: 0.02, dur: 0.18 });
}
function sfxLand() {
  nz({ type: "lowpass", f: 500, f2: 120, g: 0.4, dur: 0.12 });
  nz({ type: "bandpass", f: 2500, q: 1, g: 0.05, dur: 0.08 });
}
function sfxSlide() {
  nz({ type: "bandpass", f: 1800, f2: 600, q: 0.8, g: 0.2, a: 0.03, dur: 0.5 });
}
function sfxStep() {
  const n = performance.now();
  if (n - lastStep < 120) return;
  lastStep = n;
  nz({ type: "lowpass", f: 420, g: 0.16, dur: 0.06 });
  nz({ type: "bandpass", f: rnd(1800, 2600), q: 1.2, g: 0.035, dur: 0.05 });
}
function sfxPickup(kind) {
  if (kind === "weapon") {
    sfxReload(0.5);
    tn({ f: 440, dur: 0.25, g: 0.12, rev: 0.4 });
    tn({ f: 660, dur: 0.35, g: 0.12, d: 0.08, rev: 0.4 });
    tn({ f: 880, dur: 0.5, g: 0.1, d: 0.16, rev: 0.5 });
  } else if (kind === "med") {
    tn({ f: 523, dur: 0.25, g: 0.13 });
    tn({ f: 784, dur: 0.4, g: 0.12, d: 0.1, rev: 0.4 });
  } else {
    nz({ type: "bandpass", f: 1800, q: 4, g: 0.3, dur: 0.05 });
    nz({ type: "bandpass", f: 1200, q: 4, g: 0.3, dur: 0.06, d: 0.07 });
    tn({ f: 600, dur: 0.2, g: 0.08, d: 0.05 });
  }
}
function sfxSplat(pan) {
  nz({ type: "lowpass", f: 1200, f2: 200, g: 0.45, dur: 0.25, pan });
  nz({ brown: true, type: "lowpass", f: 400, g: 0.5, dur: 0.3, pan });
}
function sfxAcid(pan) {
  nz({ type: "bandpass", f: 800, f2: 2400, q: 2, g: 0.25, a: 0.02, dur: 0.3, pan });
}
function sfxSlam() {
  tn({ f: 70, f2: 25, dur: 0.6, g: 1.2, dist: 1 });
  nz({ brown: true, type: "lowpass", f: 900, f2: 80, g: 1.2, dur: 1, rev: 0.7 });
}
function sfxSwoosh() {
  nz({ type: "bandpass", f: 600, f2: 2500, q: 1.2, g: 0.4, a: 0.05, dur: 0.3 });
}
function sfxBeat() {
  tn({ f: 58, f2: 40, dur: 0.18, g: 0.35 });
  tn({ f: 52, f2: 38, dur: 0.2, g: 0.28, d: 0.22 });
}

/* ---- music ---- */
const MUS = { beat: 0, next: 0, boss: false };
function startAmbient() {
  const c = AU.c;
  // wind
  const w = c.createBufferSource();
  w.buffer = AU.noise;
  w.loop = true;
  const wf = c.createBiquadFilter();
  wf.type = "bandpass";
  wf.frequency.value = 450;
  wf.Q.value = 0.6;
  const wl = c.createOscillator();
  wl.frequency.value = 0.07;
  const wlg = c.createGain();
  wlg.gain.value = 250;
  wl.connect(wlg);
  wlg.connect(wf.frequency);
  const wg = c.createGain();
  wg.gain.value = 0.05;
  w.connect(wf);
  wf.connect(wg);
  wg.connect(AU.mus);
  w.start();
  wl.start();
  // drone
  const dg = c.createGain();
  dg.gain.value = 0.05;
  const df = c.createBiquadFilter();
  df.type = "lowpass";
  df.frequency.value = 260;
  df.Q.value = 4;
  const dl = c.createOscillator();
  dl.frequency.value = 0.05;
  const dlg = c.createGain();
  dlg.gain.value = 120;
  dl.connect(dlg);
  dlg.connect(df.frequency);
  dl.start();
  [55, 55.35, 82.4].forEach((f) => {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.connect(df);
    o.start();
  });
  df.connect(dg);
  dg.connect(AU.mus);
  AU.droneG = dg;
  setInterval(musTick, 40);
}
const SCALE = [110, 130.8, 146.8, 164.8, 196, 220, 261.6];
const BASS = [55, 55, 65.4, 55, 49, 55, 82.4, 73.4];
function musTick() {
  const c = AU.c;
  if (!c || !AU.on) return;
  const now = c.currentTime;
  if (MUS.next < now) MUS.next = now + 0.05;
  const playing = G.state === "play";
  const boss = playing && !!G.boss;
  const bpm = boss ? 138 : 96;
  const step = 60 / bpm / 2;
  while (MUS.next < now + 0.2) {
    const t = MUS.next - now;
    const b = MUS.beat % 16;
    if (playing) {
      if (boss) {
        if (b % 2 === 0) tn({ f: 110, f2: 38, fd: 0.12, dur: 0.3, g: 0.55, d: t, dist: 1 });
        if (b % 4 === 2) nz({ type: "bandpass", f: 1800, q: 0.7, g: 0.3, dur: 0.15, d: t, rev: 0.3 });
        nz({ type: "highpass", f: 8000, g: b % 2 ? 0.06 : 0.03, dur: 0.04, d: t });
        tn({ w: "sawtooth", f: BASS[b % 8], dur: step * 0.9, g: 0.16, d: t, lp: 420, dist: 2 });
        if (b === 0 && Math.random() < 0.6)
          tn({ w: "triangle", f: pick([440, 415.3, 392]), dur: 2.2, g: 0.05, a: 0.4, d: t, rev: 0.9 });
      } else {
        if (b === 0 || b === 8) tn({ f: 90, f2: 36, fd: 0.15, dur: 0.45, g: 0.42, d: t });
        if (b === 12 && Math.random() < 0.5) tn({ f: 80, f2: 36, fd: 0.15, dur: 0.4, g: 0.25, d: t });
        if (b % 4 === 2) nz({ type: "highpass", f: 7000, g: 0.025, dur: 0.05, d: t });
        if (b % 4 === 0 && Math.random() < 0.45) {
          const f = pick(SCALE) * (Math.random() < 0.3 ? 2 : 1);
          tn({ w: "triangle", f, dur: 1.8, g: 0.07, d: t, rev: 1.2 });
          tn({ f: f * 2.01, dur: 1.2, g: 0.02, d: t, rev: 1 });
        }
      }
    } else if (b === 0 && Math.random() < 0.5) {
      const f = pick(SCALE);
      tn({ w: "triangle", f, dur: 2.5, g: 0.05, d: t, rev: 1.4 });
    }
    MUS.beat++;
    MUS.next += step;
  }
}
