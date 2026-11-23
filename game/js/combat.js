"use strict";
/* ================== COMBAT ================== */
function hurtZ(z, d, hx, hy, vx) {
  if (z.dead) return;
  let head = false;
  const top = GROUND - z.yo - z.h;
  if (z.type !== "crawler" && hy < top + z.h * 0.22) {
    head = true;
    d *= 2;
  }
  if (z.armor && !head) d *= 1 - z.armor;
  z.hp -= d;
  z.flash = 0.07;
  z.kb += Math.min(60, d * 0.6) * (vx > 0 ? 1 : -1);
  const n = head ? 10 : 4;
  for (let i = 0; i < n; i++)
    part({
      x: hx,
      y: hy,
      vx: rnd(40, 360) * (vx > 0 ? 1 : -1),
      vy: rnd(-260, 80),
      g: 1100,
      life: rnd(0.35, 0.8),
      s: rnd(1.5, 3.8),
      col: pick(["#7a0a0a", "#5a0606", "#8f1414"]),
      t: "blood",
    });
  part({
    x: hx,
    y: hy,
    vx: vx * 0.05,
    vy: 0,
    life: 0.25,
    s: 3,
    s2: 12,
    col: "rgba(110,10,10,.45)",
    t: "smoke",
  });
  sfxFlesh(panOf(hx), head);
  if (z.hp <= 0) killZ(z, d, head);
}
function killZ(z, d, head) {
  z.dead = 0.001;
  G.kills++;
  G.combo++;
  G.comboT = 2.6;
  const mult = 1 + Math.floor(G.combo / 5);
  const pts = z.pts * mult * (head ? 2 : 1);
  G.score += pts;
  floater(
    z.x,
    GROUND - z.h - z.yo - 10,
    (head ? "CABEZA +" : "+") + pts,
    head ? "#ffb340" : "rgba(255,255,255,.85)",
    head ? 14 : 12,
  );
  if (Math.random() < 0.3) sfxGroan(panOf(z.x), 0.85, 0);
  decals.push({ x: z.x, y: GROUND + rnd(4, 30), r: rnd(18, 34), c: "rgba(70,5,5,.55)" });
  if (decals.length > 45) decals.shift();
  if (d >= 120 || z.type === "bloater") {
    z.gib = 1;
    for (let i = 0; i < 18; i++)
      part({
        x: z.x + rnd(-10, 10),
        y: GROUND - z.h * rnd(0.2, 0.9),
        vx: rnd(-300, 400),
        vy: rnd(-550, -100),
        g: 1300,
        life: rnd(0.7, 1.4),
        s: rnd(3, 7),
        col: pick([z.skin, "#5a0606", z.cloth, "#7a0a0a"]),
        t: "rect",
        rot: rnd(TAU),
        vr: rnd(-15, 15),
        b: 1,
      });
    sfxSplat(panOf(z.x));
  }
  if (z.type === "bloater") {
    for (let i = 0; i < 30; i++)
      part({
        x: z.x,
        y: GROUND - 50,
        vx: rnd(-400, 400),
        vy: rnd(-400, 50),
        g: 800,
        life: rnd(0.5, 1),
        s: rnd(3, 6),
        col: pick(["#7fa52a", "#5a7a1a", "#a6c94a"]),
        t: "blood",
      });
    for (let i = 0; i < 10; i++)
      part({
        x: z.x,
        y: GROUND - 50,
        vx: rnd(-150, 150),
        vy: rnd(-120, 0),
        life: 1.5,
        s: 12,
        s2: 50,
        col: "rgba(110,140,40,.25)",
        t: "smoke",
      });
    sfxBoom(panOf(z.x), 0);
    G.shake = 10;
    for (const o of zs)
      if (o !== z && !o.dead && Math.abs(o.x - z.x) < 120) hurtZ(o, 120, o.x, GROUND - o.h / 2, o.x - z.x);
    if (Math.abs(P.x - z.x) < 110) hurtPlayer(18);
  }
  if (G.combo % 10 === 0) {
    $("combo").style.transform = "scale(1.3)";
    setTimeout(() => ($("combo").style.transform = ""), 150);
  }
}
function explode(x, y, r, dmg, src) {
  G.shake = Math.max(G.shake, 16);
  sfxBoom(panOf(x), r > 150);
  light(x, y, r * 3, "255,150,60", 1);
  G.flashW = 0.25;
  for (let i = 0; i < 34; i++) {
    const a = rnd(TAU),
      s = rnd(80, 520);
    part({
      x: x + rnd(-15, 15),
      y: y + rnd(-15, 15),
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 120,
      dr: 3,
      life: rnd(0.3, 0.75),
      s: rnd(10, 22),
      s2: rnd(2, 6),
      col: pick(["#ffdd88", "#ff9a3c", "#ff6a1a", "#ffe9b0"]),
      t: "fire",
      add: 1,
    });
  }
  for (let i = 0; i < 26; i++) {
    const a = rnd(TAU),
      s = rnd(40, 260);
    part({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 140,
      dr: 1.6,
      life: rnd(1, 2.2),
      s: rnd(12, 20),
      s2: rnd(40, 80),
      col: "rgba(35,30,30,.55)",
      t: "smoke",
    });
  }
  for (let i = 0; i < 22; i++) {
    const a = rnd(TAU),
      s = rnd(300, 900);
    part({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 200,
      g: 900,
      life: rnd(0.3, 0.9),
      col: "#ffcf7a",
      t: "spark",
      add: 1,
    });
  }
  for (let i = 0; i < 10; i++)
    part({
      x,
      y,
      vx: rnd(-400, 400),
      vy: rnd(-600, -150),
      g: 1300,
      life: rnd(0.8, 1.5),
      s: rnd(3, 7),
      col: "#221d1d",
      t: "rect",
      rot: rnd(TAU),
      vr: rnd(-12, 12),
      b: 1,
    });
  decals.push({ x, y: GROUND + rnd(4, 20), r: r * 0.5, c: "rgba(0,0,0,.6)" });
  if (dmg > 0) {
    for (const z of zs) {
      if (z.dead) continue;
      const dd = Math.hypot(z.x - x, GROUND - z.h / 2 - y);
      if (dd < r + z.w / 2) hurtZ(z, dmg * (1 - dd / (r * 1.6)), z.x, GROUND - z.h * 0.5, z.x - x);
    }
    const b = G.boss;
    if (b && !b.dying) {
      const dd = Math.abs(b.x - x);
      if (dd < r + b.w / 2) hurtBoss(b, dmg * 0.9, b.x - b.w * 0.3, b.y - b.h * 0.56);
    }
    for (const o of obs)
      if (o.t === "barrel" && !o.hit && Math.abs(o.x - x) < r) {
        o.hit = 1;
        o.boomT = 0.12;
      }
    if (src !== "player" && Math.hypot(P.x - x, P.y - 40 - y) < r * 0.85) hurtPlayer(22);
  }
}
