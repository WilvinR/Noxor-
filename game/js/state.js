"use strict";
/* ================== STATE ================== */
const G = {
  arena: false,
  state: "menu",
  t: 0,
  scroll: 0,
  speed: 220,
  dist: 0,
  kills: 0,
  score: 0,
  combo: 0,
  comboT: 0,
  shake: 0,
  hurt: 0,
  slow: 1,
  slowT: 0,
  boss: null,
  bossIdx: 0,
  bossesK: 0,
  nextBoss: 600,
  loop: 0,
  lvl: 1,
  zt: 2,
  ot: 2.5,
  pt: 5,
  dt: 1,
  stun: 0,
  hintT: 0,
  flashW: 0,
};
let P = {};
let zs = [],
  obs = [],
  bul = [],
  ep = [],
  pick_ = [],
  parts = [],
  decals = [],
  puddles = [],
  decor = [],
  floats = [],
  ash = [];
const lights = [];
function resetGame() {
  Object.assign(G, {
    state: "play",
    t: 0,
    scroll: 0,
    speed: 330,
    dist: 0,
    kills: 0,
    score: 0,
    combo: 0,
    comboT: 0,
    shake: 0,
    hurt: 0,
    slow: 1,
    slowT: 0,
    boss: null,
    bossIdx: 0,
    bossesK: 0,
    nextBoss: 600,
    loop: 0,
    lvl: 1,
    zt: 2.5,
    ot: 3.5,
    pt: 4,
    dt: 0.5,
    stun: 0,
    hintT: 0,
    flashW: 0,
    warn: null,
  });
  P = {
    x: PSTART,
    y: GROUND,
    vy: 0,
    ground: true,
    coy: 0,
    slide: 0,
    sq: false,
    hp: 100,
    inv: 0,
    phase: 0,
    cur: "pistol",
    cd: 0,
    rl: 0,
    recoil: 0,
    aim: 0,
    dead: 0,
    arms: { pistol: { own: 1, mag: 12, res: Infinity } },
  };
  for (const k of WORDER) if (k !== "pistol") P.arms[k] = { own: 0, mag: 0, res: 0 };
  zs = [];
  obs = [];
  bul = [];
  ep = [];
  pick_ = [];
  parts = [];
  decals = [];
  puddles = [];
  floats = [];
  $("bossBar").classList.add("hidden");
  refreshWeaponUI();
}
P = {
  x: 200,
  y: GROUND,
  vy: 0,
  ground: true,
  slide: 0,
  hp: 100,
  inv: 0,
  phase: 0,
  cur: "pistol",
  recoil: 0,
  aim: 0,
  arms: { pistol: { own: 1, mag: 12, res: Infinity } },
  dead: 0,
};

/* ================== HELPERS ================== */
function part(o) {
  if (parts.length > 950) return;
  const p = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    g: 0,
    dr: 0,
    life: 1,
    max: 1,
    s: 3,
    s2: -1,
    col: "#fff",
    t: "dot",
    add: 0,
    sf: 1,
    rot: 0,
    vr: 0,
    b: 0,
  };
  for (const k in o) p[k] = o[k];
  p.max = p.life;
  parts.push(p);
}
function light(x, y, r, col, a) {
  lights.push(x, y, r, col, a);
}
function floater(x, y, txt, col, sz) {
  floats.push({ x, y, txt, col: col || "#fff", sz: sz || 18, life: 1 });
}
function pbox() {
  const h = P.slide > 0 ? 44 : 88;
  return { x: P.x - 14, y: P.y - h, w: 28, h };
}
function zbox(z) {
  return { x: z.x - z.w / 2, y: GROUND - z.h - z.yo, w: z.w, h: z.h };
}
function ov(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function panOf(x) {
  return clamp((x / VW) * 2 - 1, -1, 1) * 0.7;
}
let toastT = 0,
  bannerT = 0;
function toast(t) {
  const e = $("toast");
  e.textContent = t;
  e.classList.add("on");
  toastT = 2;
}
function banner(t, s) {
  const e = $("banner");
  e.innerHTML = t + (s ? `<small>${s}</small>` : "");
  e.classList.add("on");
  bannerT = 1.9;
}
const HQ = [];
function hint(t, d) {
  HQ.push([t, d || 3]);
}
function hintTick() {
  if (HQ.length && bannerT <= 0 && G.hintT <= 0) {
    const [t, d] = HQ.shift();
    const e = $("hint");
    e.textContent = t;
    e.classList.add("on");
    G.hintT = d;
  }
}
