"use strict";
/* ================== SPAWNING ================== */
function spawnZombie(type, x) {
  const T = ZT[type];
  const hpM = 1 + G.loop * 0.5 + G.dist / 5000;
  const z = {
    type,
    x: x || VW + rnd(40, 120),
    hp: T.hp * hpM,
    max: T.hp * hpM,
    spd: rnd(T.spd[0], T.spd[1]),
    dmg: T.dmg,
    w: T.w,
    h: T.h,
    an: T.an * rnd(0.85, 1.15),
    pts: T.pts,
    s: T.s * rnd(0.95, 1.06),
    armor: T.armor || 0,
    ph: rnd(TAU),
    dead: 0,
    flash: 0,
    atk: 0,
    burn: 0,
    yo: 0,
    kb: 0,
    skin: pick(SKIN),
    cloth: pick(CLOTH),
    cloth2: pick(CLOTH),
    hold: type === "spitter" ? rnd(3.5, 5) : 0,
    shot: rnd(0.6, 1.2),
    gib: 0,
    hair: Math.random() < 0.6,
    lean: rnd(-0.1, 0.1),
  };
  zs.push(z);
  if (Math.random() < 0.35) sfxGroan(panOf(z.x), type === "bloater" ? 0.7 : 1);
}
function zTypeByDist() {
  const d = G.dist;
  const tb = [["walker", 1]];
  if (d > 250) tb.push(["runner", 0.2 + Math.min(0.45, d / 4000)]);
  if (d > 450) tb.push(["crawler", 0.3]);
  if (d > 750) tb.push(["spitter", 0.16]);
  if (d > 1100) tb.push(["bloater", 0.18]);
  if (d > 1600) tb.push(["armored", 0.22]);
  let s = 0;
  for (const t of tb) s += t[1];
  let r = Math.random() * s;
  for (const t of tb) {
    r -= t[1];
    if (r <= 0) return t[0];
  }
  return "walker";
}
const OBS = {
  barrier: { w: 92, h: 46, dmg: 15 },
  wire: { w: 84, h: 26, dmg: 9 },
  car: { w: 176, h: 68, dmg: 20 },
  beam: { w: 120, h: 0, dmg: 18 },
  barrel: { w: 32, h: 50, dmg: 12 },
};
function spawnObstacle() {
  let pool = ["barrier", "barrier", "wire"];
  if (G.dist > 150) pool.push("barrel");
  if (G.dist > 300) pool.push("beam");
  if (G.dist > 500) pool.push("car");
  if (G.dist > 1000) pool.push("beam", "car");
  const t = pick(pool);
  const O = OBS[t];
  const o = {
    t,
    x: VW + 100,
    w: O.w,
    h: O.h,
    dmg: O.dmg,
    hit: 0,
    hp: 30,
    seed: (Math.random() * 1e5) | 0,
    fire: t === "car" && Math.random() < 0.4,
  };
  if (t === "beam") {
    o.top = GROUND - 230;
    o.bot = GROUND - 60;
  }
  obs.push(o);
}
function spawnPickup() {
  let r = Math.random();
  let kind,
    w = null;
  if (P.hp < 60 && r < 0.35) kind = "med";
  else if (r < 0.55) {
    kind = "weapon";
    const cand = WORDER.filter(
      (k) => k !== "pistol" && (G.dist > 200 || ["smg", "shotgun", "rifle"].includes(k)),
    );
    const unowned = cand.filter((k) => !P.arms[k].own);
    w = unowned.length && Math.random() < 0.65 ? pick(unowned) : pick(cand);
  } else if (r < 0.85) kind = "ammo";
  else kind = "med";
  if (kind === "med" && P.hp >= 100) kind = "ammo";
  pick_.push({ kind, w, x: VW + 60, y: Math.random() < 0.5 ? GROUND - 48 : GROUND - 150, bob: rnd(TAU) });
}
function spawnDecor() {
  const t = pick(["lamp", "lamp", "sign", "car", "fire", "fire", "bus"]);
  decor.push({ t, x: VW + 120, seed: (Math.random() * 1e5) | 0, on: Math.random() < 0.7, fl: 0 });
}
