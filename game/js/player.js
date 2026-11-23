"use strict";
/* ================== PLAYER ================== */
function curW() {
  return WEAP[P.cur];
}
function curA() {
  return P.arms[P.cur];
}
function hurtPlayer(d) {
  if (P.inv > 0 || G.state !== "play") return;
  d *= Math.min(1.15, 0.6 + G.dist / 3000);
  P.hp -= d;
  P.inv = 0.9;
  G.hurt = 1;
  G.shake = Math.max(G.shake, 11);
  sfxHurt();
  try {
    navigator.vibrate && navigator.vibrate(60);
  } catch (e) {}
  for (let i = 0; i < 10; i++)
    part({
      x: P.x,
      y: P.y - 50,
      vx: rnd(-200, 100),
      vy: rnd(-250, 50),
      g: 900,
      life: rnd(0.4, 0.8),
      s: rnd(2, 4),
      col: "#7a0a0a",
      t: "blood",
    });
  if (P.hp <= 0) {
    P.hp = 0;
    die();
  }
}
function die() {
  G.state = "dead";
  P.dead = 0.001;
  G.slow = 0.35;
  G.slowT = 1.4;
  AU.flameG && AU.flameG.gain.setTargetAtTime(0, AU.c.currentTime, 0.05);
  sfxGroan(0, 0.8, 0, true);
  setTimeout(showOver, 1700);
}
function startReload() {
  const a = curA(),
    w = curW();
  if (P.rl > 0 || a.mag >= w.mag || a.res <= 0) return;
  P.rl = w.rl;
  sfxReload(w.rl);
}
function finishReload() {
  const a = curA(),
    w = curW();
  const n = Math.min(w.mag - a.mag, a.res);
  a.mag += n;
  a.res -= n;
}
function switchW(dir = 1, silent) {
  let i = WORDER.indexOf(P.cur);
  for (let k = 1; k <= WORDER.length; k++) {
    const id = WORDER[(i + k * dir + WORDER.length * 2) % WORDER.length];
    const a = P.arms[id];
    if (a.own && a.mag + a.res > 0) {
      if (id !== P.cur) {
        P.cur = id;
        P.rl = 0;
        P.cd = 0.2;
        if (!silent) {
          if (AU.mech) playBuf(AU.mech.swap, { g: 0.8 });
          toast(WEAP[id].n);
        }
        refreshWeaponUI();
      }
      return;
    }
  }
}
/** Selección directa (teclas 1-7) si el arma está en posesión y tiene munición. */
function selectW(id) {
  const a = P.arms[id];
  if (!a || !a.own || a.mag + a.res <= 0 || id === P.cur) return;
  P.cur = id;
  P.rl = 0;
  P.cd = 0.2;
  if (AU.mech) playBuf(AU.mech.swap, { g: 0.8 });
  toast(WEAP[id].n);
  refreshWeaponUI();
}
function giveWeapon(id) {
  const a = P.arms[id],
    w = WEAP[id];
  const was = a.own;
  a.own = 1;
  if (!was) {
    a.mag = w.mag;
    a.res = w.pack - w.mag;
  } else a.res += w.pack;
  const curScore = WORDER.indexOf(P.cur);
  if (!was || P.cur === "pistol" || WORDER.indexOf(id) > curScore) {
    P.cur = id;
    P.rl = 0;
  }
  toast("▲ " + w.n);
  refreshWeaponUI();
}
function aimTarget(mx, my) {
  let best = null,
    bd = 1e9;
  const f = P.face || 1;
  for (const z of zs) {
    if (z.dead) continue;
    const dx = (z.x - P.x) * f;
    if (dx < 25 || dx > 820) continue;
    const ty = GROUND - z.yo - z.h * (z.type === "crawler" ? 0.5 : 0.62);
    const a = Math.atan2(ty - my, (z.x - mx) * f);
    if (Math.abs(a) > 0.42) continue;
    if (dx < bd) {
      bd = dx;
      best = a;
    }
  }
  const b = G.boss;
  if (b && !b.dying) {
    const dx = (b.x - P.x) * f;
    if (dx > 25) {
      const ty = b.y - b.h * (b.id === "tank" ? 0.56 : b.id === "spider" || b.id === "hound" ? 0.5 : 0.6);
      const a = Math.atan2(ty - my, (b.x - mx) * f);
      if (Math.abs(a) < 0.6 && dx - b.w / 2 < bd) best = a;
    }
  }
  return best === null ? 0 : clamp(best, -0.55, 0.55);
}
function gunPos() {
  const sl = P.slide > 0;
  const hip = P.hipY || -46;
  const f = P.face || 1;
  let sx = sl ? -8 : 6,
    sy = sl ? -44 : hip - 29;
  // el cuerpo se dibuja escalado por CH: el cañón debe coincidir con el arma visible
  if (P.cur === "rocket") return { x: P.x + f * CH * (sx + 2 - P.recoil * 5), y: P.y + CH * (sy - 2) };
  return { x: P.x + f * CH * (sx + 14 - P.recoil * 5), y: P.y + CH * (sy + 9) };
}
function shoot() {
  const w = curW(),
    a = curA();
  if (a.mag <= 0) {
    if (a.res > 0) startReload();
    else {
      sfxEmpty();
      switchW(1);
    }
    P.cd = 0.25;
    return;
  }
  a.mag--;
  P.cd = w.rate;
  P.recoil = 1;
  const gp = gunPos();
  const ang = P.aim,
    F = P.face || 1;
  const mx = gp.x + F * Math.cos(ang) * w.len,
    my = gp.y + Math.sin(ang) * w.len - 2;
  if (w.flame) {
    for (let i = 0; i < 2; i++) {
      const an = ang + rnd(-w.sp, w.sp);
      bul.push({
        x: mx,
        y: my,
        vx: F * Math.cos(an) * w.vel * rnd(0.8, 1.1) + G.speed * 0.3,
        vy: Math.sin(an) * w.vel * rnd(0.8, 1.1) - rnd(0, 40),
        dmg: w.dmg,
        life: rnd(0.42, 0.55),
        max: 0.5,
        t: "flame",
        pierce: 99,
      });
    }
    light(mx + F * 60, my, 160, "255,140,40", 0.5);
    if (Math.random() < 0.3)
      part({
        x: mx + F * 40,
        y: my,
        vx: F * 300,
        vy: -60,
        life: 0.8,
        s: 8,
        s2: 30,
        col: "rgba(30,25,25,.5)",
        t: "smoke",
      });
    AU.flameG && AU.flameG.gain.setTargetAtTime(0.7, AU.c.currentTime, 0.03);
    G.flameOn = 0.08;
  } else if (w.rocket) {
    bul.push({
      x: mx,
      y: my,
      vx: F * Math.cos(ang) * w.vel,
      vy: Math.sin(ang) * w.vel,
      dmg: w.dmg,
      life: 3,
      t: "rocket",
      pierce: 0,
    });
    sfxShot("rocket", panOf(mx));
    for (let i = 0; i < 14; i++)
      part({
        x: gp.x - F * 16,
        y: gp.y,
        vx: -F * rnd(120, 380),
        vy: rnd(-80, 80),
        dr: 3,
        life: rnd(0.5, 1),
        s: rnd(6, 10),
        s2: rnd(24, 40),
        col: "rgba(60,55,55,.55)",
        t: "smoke",
      });
    light(gp.x - F * 20, gp.y, 200, "255,170,90", 0.7);
  } else {
    for (let i = 0; i < w.pel; i++) {
      const an = ang + rnd(-w.sp, w.sp) * (w.pel > 1 ? 1 : 1);
      const v = w.vel * rnd(0.92, 1.05);
      bul.push({
        x: mx,
        y: my,
        vx: F * Math.cos(an) * v,
        vy: Math.sin(an) * v,
        dmg: w.dmg,
        life: 0.7,
        t: P.cur === "sniper" ? "sniper" : "b",
        pierce: w.pierce || 0,
        hit: null,
      });
    }
    sfxShot(P.cur, panOf(mx));
    // muzzle
    const big = P.cur === "shotgun" || P.cur === "sniper";
    part({
      x: mx + F * 6,
      y: my,
      life: 0.05,
      s: big ? 20 : 13,
      col: "#fff3c0",
      t: "flash",
      add: 1,
      rot: F > 0 ? ang : PI - ang,
    });
    for (let i = 0; i < (big ? 10 : 4); i++)
      part({
        x: mx,
        y: my,
        vx: F * Math.cos(ang + rnd(-0.4, 0.4)) * rnd(300, 900),
        vy: Math.sin(ang + rnd(-0.4, 0.4)) * rnd(300, 900) - 40,
        life: rnd(0.05, 0.15),
        col: "#ffd27a",
        t: "spark",
        add: 1,
      });
    for (let i = 0; i < (big ? 5 : 2); i++)
      part({
        x: mx + F * 4,
        y: my,
        vx: F * rnd(30, 160),
        vy: rnd(-50, -10),
        dr: 2.5,
        life: rnd(0.5, 1),
        s: rnd(3, 5),
        s2: rnd(12, 22),
        col: "rgba(160,150,140,.22)",
        t: "smoke",
      });
    light(mx + F * 10, my, big ? 240 : 170, "255,190,110", big ? 0.85 : 0.6);
    if (P.cur !== "shotgun" || true) {
      const sx = gp.x + F * 4,
        sy = gp.y - 4;
      part({
        x: sx,
        y: sy,
        vx: -F * rnd(60, 160),
        vy: rnd(-320, -200),
        g: 1400,
        life: 1.4,
        s: P.cur === "sniper" ? 6 : P.cur === "shotgun" ? 7 : 4,
        col: P.cur === "shotgun" ? "#a52a1e" : "#c9a24a",
        t: "shell",
        rot: rnd(TAU),
        vr: rnd(-20, 20),
        b: 1,
      });
    }
  }
  G.shake = Math.max(G.shake, w.shake);
  if (a.mag === 0 && a.res > 0) startReload();
}
function updatePlayer(dt) {
  const p = P;
  if (G.state === "dead") {
    p.dead += dt;
    p.vy += 2200 * dt;
    p.y = Math.min(GROUND, p.y + p.vy * dt);
    return;
  }
  const mv = K.right - K.left;
  const ar = G.arena;
  const maxX = ar ? VW - 70 : VW * 0.6,
    minX = ar ? (isTouch ? PMIN : 60) : PMIN;
  p.x = clamp(p.x + mv * (ar ? 320 : 290) * dt, minX, Math.max(maxX, Math.min(p.x, VW - 70)));
  if (p.x > maxX) p.x = lerp(p.x, maxX, dt * 2);
  p.face = ar && G.boss && !G.boss.dying ? (G.boss.x >= p.x ? 1 : -1) : 1;
  p.idle = ar && mv === 0;
  p.coy -= dt;
  if (p.ground) p.coy = 0.09;
  // búfer de salto: una pulsación justo antes de aterrizar no se pierde (130 ms)
  if (K.jp) p.jb = 0.13;
  else p.jb = (p.jb || 0) - dt;
  if (p.jb > 0 && !(p.ground || p.coy > 0) && p.jumps < 2) {
    p.jb = 0;
    p.vy = -700;
    p.jumps = 2;
    p.flip = 0;
    sfxJump();
    for (let i = 0; i < 5; i++)
      part({
        x: p.x,
        y: p.y,
        vx: rnd(-80, 80),
        vy: rnd(40, 120),
        life: 0.35,
        s: 3,
        s2: 9,
        col: "rgba(160,150,140,.3)",
        t: "smoke",
      });
  }
  if (p.jb > 0 && (p.ground || p.coy > 0)) {
    p.jb = 0;
    p.vy = -880;
    p.jumps = 1;
    p.ground = false;
    p.coy = 0;
    p.slide = 0;
    sfxJump();
    for (let i = 0; i < 6; i++)
      part({
        x: p.x,
        y: GROUND,
        vx: rnd(-120, 40),
        vy: rnd(-60, -10),
        life: 0.5,
        s: 3,
        s2: 10,
        col: "rgba(90,80,75,.3)",
        t: "smoke",
      });
  }
  if (K.sp) {
    if (p.ground) {
      if (p.slide <= 0) sfxSlide();
      p.slide = 0.82;
    } else {
      p.vy = Math.max(p.vy, 950);
      p.sq = true;
    }
  }
  if (p.slide > 0) {
    p.slide -= dt;
    if (K.slide && p.slide < 0.1 && (p.slideHold || 0) < 0.6) {
      p.slide = 0.1;
      p.slideHold = (p.slideHold || 0) + dt;
    }
    if (Math.random() < 0.5)
      part({
        x: p.x + rnd(-10, 10),
        y: GROUND - 2,
        vx: rnd(-220, -80),
        vy: rnd(-60, -10),
        life: 0.4,
        s: 2,
        s2: 8,
        col: "rgba(100,90,85,.3)",
        t: "smoke",
      });
  } else p.slideHold = 0;
  const g = 2100;
  p.vy += g * dt;
  p.y += p.vy * dt;
  if (p.y >= GROUND) {
    if (!p.ground) {
      sfxLand();
      p.land = 0.14;
      for (let i = 0; i < 5; i++)
        part({
          x: p.x,
          y: GROUND,
          vx: rnd(-90, 90),
          vy: rnd(-40, -5),
          life: 0.4,
          s: 3,
          s2: 9,
          col: "rgba(90,80,75,.3)",
          t: "smoke",
        });
      if (p.sq) {
        p.slide = 0.75;
        p.sq = false;
        sfxSlide();
      }
    }
    p.y = GROUND;
    p.vy = 0;
    p.ground = true;
    p.jumps = 0;
  } else p.ground = false;
  const sp = G.arena ? mv * (p.face || 1) * 0.9 : G.speed / 330;
  if (p.ground && p.slide <= 0) {
    const prev = p.phase;
    p.phase += dt * 11.5 * sp;
    if (Math.floor(prev / PI) !== Math.floor(p.phase / PI)) sfxStep();
  }
  p.inv -= dt;
  if (p.land > 0) p.land -= dt;
  p.recoil = Math.max(0, p.recoil - dt * 9);
  // aim
  const gp = gunPos();
  const ta = aimTarget(gp.x, gp.y);
  p.aim = lerp(p.aim, ta, Math.min(1, dt * 14));
  // weapons
  p.cd -= dt;
  if (p.rl > 0) {
    p.rl -= dt;
    if (p.rl <= 0) finishReload();
  }
  if (K.wp) switchW(1);
  if (K.rp) startReload();
  if (K.fire && p.cd <= 0 && p.rl <= 0) shoot();
  if (G.flameOn > 0) {
    G.flameOn -= dt;
    if (G.flameOn <= 0 && AU.flameG) AU.flameG.gain.setTargetAtTime(0, AU.c.currentTime, 0.06);
  }
  K.jp = K.sp = K.wp = K.rp = 0;
}
