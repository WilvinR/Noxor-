"use strict";
/* ================== BOSSES ================== */
function startBoss() {
  const idx = G.bossIdx,
    lp = Math.floor(idx / 25),
    d = BOSSES[idx % 25];
  const body = d[1],
    B = BODY[body],
    sc = d[4];
  const hp = (1500 + (idx % 25) * 330) * (1 + lp * 0.8);
  const name = d[0] + (lp ? " " + ROMAN[Math.min(lp, 9)] : "");
  G.boss = {
    id: body,
    name,
    atk: d[2],
    tint: d[3],
    sc,
    eyeCol: d[5] || (body === "mother" ? "200,255,70" : "255,50,30"),
    bw: B.w,
    bh: B.h,
    w: B.w * sc,
    h: B.h * sc,
    lvl: idx,
    num: (idx % 25) + 1,
    x: VW + B.w * sc,
    y: GROUND,
    hp,
    max: hp,
    st: "enter",
    stT: 0,
    t: 0,
    ph: 0,
    flash: 0,
    arm: 0,
    warn: null,
    cnt: 0,
    vy: 0,
    air: false,
    mouth: 0,
    crouch: 0,
    hitcd: 0,
    last: null,
  };
  banner(name, "JEFE " + ((idx % 25) + 1) + " DE 25 · SE ACERCA");
  sfxRoar();
  G.shake = 18;
  $("bossBar").classList.remove("hidden");
  $("bossName").textContent = (idx % 25) + 1 + "/25 · " + name;
  obs = obs.filter((o) => o.x < VW * 0.7);
}
function bossAttack(b) {
  let a;
  do {
    a = pick(b.atk);
  } while (b.atk.length > 1 && a === b.last);
  b.last = a;
  b.st = a;
  b.cnt = 0;
  b.sub = 0;
  b.stT = 0;
  b.t2 = 0;
  b.hitDone = 0;
}
function spawnShock(x, dir, h) {
  ep.push({
    t: "shock",
    x,
    y: GROUND,
    vx: dir * (620 + Math.min(160, (G.boss ? G.boss.lvl : 0) * 7)),
    vy: 0,
    h: h || 36,
    w: 44,
    life: 2.5,
    dmg: 18,
  });
}
function lob(x, y, tx, T, type, dmg) {
  const g = 1300;
  const vx = (tx - x) / T;
  const vy = (GROUND - 12 - y - 0.5 * g * T * T) / T;
  ep.push({ t: type, x, y, vx, vy, g, r: type === "cleaver" ? 14 : 10, life: 4, dmg, rot: 0 });
}
function updateBoss(b, dt) {
  b.t += dt;
  b.flash = Math.max(0, b.flash - dt);
  b.ph += dt * (b.sub === "rush" ? 10 : 3.2);
  b.hitcd -= dt;
  b.warn = null;
  const lv = b.lvl,
    low = b.hp < b.max * 0.5,
    W = b.w;
  const f = b.x >= P.x ? -1 : 1;
  b.face = f;
  const gap = W * 0.5 + 150;
  const home =
    b.st === "enter"
      ? VW * (b.id === "mother" ? 0.8 : 0.76)
      : f < 0
        ? clamp(Math.max(P.x + gap, VW * 0.72), W * 0.4, VW - W * 0.4)
        : clamp(Math.min(P.x - gap, VW * 0.28), W * 0.4, VW - W * 0.4);
  if (b.dying) {
    b.dying -= dt;
    b.flash = Math.random() < 0.3 ? 0.05 : 0;
    if (Math.random() < 0.25) {
      const bx = b.x + rnd(-W / 2, W / 2),
        by = b.y - rnd(0, b.h);
      for (let i = 0; i < 10; i++)
        part({
          x: bx,
          y: by,
          vx: rnd(-300, 300),
          vy: rnd(-400, 100),
          g: 1100,
          life: rnd(0.5, 1),
          s: rnd(2, 5),
          col: "#6a0808",
          t: "blood",
        });
      sfxFlesh(panOf(bx), 1);
    }
    G.shake = Math.max(G.shake, 4);
    if (b.dying <= 0) bossDead(b);
    return;
  }
  if (b.st === "enter") {
    b.x -= 170 * dt;
    if (b.x <= home) {
      b.st = "idle";
      b.stT = 0;
      hint("ARENA · muévete libre y esquiva", 2.2);
    }
    return;
  }
  const tgtX = () => clamp(P.x, 80, VW - 80);
  const top = b.y - b.h,
    front = b.x + f * W * 0.42;
  b.stT += dt;
  switch (b.st) {
    case "idle":
      b.x += clamp((home - b.x) * 2, -260, 260) * dt;
      b.arm = lerp(b.arm, 0, dt * 5);
      b.crouch = lerp(b.crouch, 0, dt * 5);
      b.mouth = lerp(b.mouth, 0, dt * 5);
      if (b.stT > Math.max(0.5, 1.6 - lv * 0.035 - (low ? 0.3 : 0))) bossAttack(b);
      break;
    case "recover":
      b.x += clamp((home - b.x) * 2, -260, 260) * dt;
      b.arm = lerp(b.arm, 0, dt * 4);
      b.crouch = lerp(b.crouch, 0, dt * 5);
      b.mouth = lerp(b.mouth, 0, dt * 5);
      if (b.stT > 0.7) {
        b.st = "idle";
        b.stT = 0;
      }
      break;
    case "slam":
      b.warn = "jump";
      b.arm = Math.min(1, b.stT / 0.65);
      if (b.stT > 0.75) {
        b.arm = -0.6;
        sfxSlam();
        G.shake = 16;
        spawnShock(front, f, 38);
        for (let i = 0; i < 20; i++)
          part({
            x: front + rnd(-30, 30),
            y: GROUND,
            vx: rnd(-300, 200),
            vy: rnd(-300, -50),
            g: 900,
            life: rnd(0.5, 1),
            s: rnd(2, 4),
            col: "#3a3030",
            t: "rect",
            rot: rnd(TAU),
            vr: rnd(-10, 10),
          });
        b.cnt++;
        if (b.cnt < Math.min(3, 1 + (lv >= 6 ? 1 : 0) + (low ? 1 : 0))) {
          b.stT = 0.15;
        } else {
          b.st = "recover";
          b.stT = 0;
        }
      }
      break;
    case "throw":
      b.warn = "move";
      b.arm = Math.sin(b.stT * 8) * 0.5 + 0.5;
      if (b.stT > 0.6) {
        lob(front, top + b.h * 0.2, tgtX() + rnd(-30, 60), rnd(0.8, 1), "cleaver", 18);
        sfxSwoosh();
        b.cnt++;
        b.stT = 0.15;
        if (b.cnt >= 2 + Math.floor(lv / 8)) {
          b.st = "recover";
          b.stT = 0;
        }
      }
      break;
    case "swing":
    case "sweep": {
      const hi = b.st === "swing";
      if (!b.sub) b.sub = "tele";
      if (b.sub === "tele") {
        b.warn = hi ? "slide" : "jump";
        if (hi) b.arm = Math.min(1, b.stT / 0.5) * 0.6;
        else b.crouch = Math.min(1, b.stT / 0.4);
        if (b.stT > 0.7) {
          b.sub = "rush";
          b.stT = 0;
          sfxGroan(panOf(b.x), 0.6, 1, true);
        }
      } else if (b.sub === "rush") {
        b.warn = hi ? "slide" : "jump";
        b.x += f * 950 * dt;
        if (Math.abs(b.x - P.x) <= W * 0.45 + 60 || b.x < W * 0.4 || b.x > VW - W * 0.4) {
          b.sub = "hit";
          b.stT = 0;
          sfxSwoosh();
        }
      } else if (b.sub === "hit") {
        b.arm = hi ? lerp(0.6, -0.8, Math.min(1, b.stT / 0.18)) : -1;
        if (b.stT > 0.12 && !b.hitDone) {
          b.hitDone = 1;
          const dd = (P.x - b.x) * f;
          const inR = dd > 0 && dd < W * 0.45 + 170;
          if (inR && (hi ? P.slide <= 0 && P.y > GROUND - 125 : P.y > GROUND - 48)) hurtPlayer(24);
          for (let i = 0; i < 8; i++)
            part({
              x: b.x + f * (W * 0.45 + 60),
              y: hi ? GROUND - 80 : GROUND - 20,
              vx: f * rnd(200, 500),
              vy: rnd(-80, 80),
              life: 0.25,
              col: "#fff",
              t: "spark",
              add: 1,
            });
        }
        if (b.stT > 0.45) {
          b.sub = "back";
          b.hitDone = 0;
        }
      } else if (b.sub === "back") {
        b.x += Math.sign(home - b.x) * 400 * dt;
        b.arm = lerp(b.arm, 0, dt * 4);
        b.crouch = lerp(b.crouch, 0, dt * 5);
        if (Math.abs(home - b.x) < 12 || b.stT > 2) {
          b.st = "idle";
          b.stT = 0;
          b.sub = 0;
        }
      }
      break;
    }
    case "barrage":
      b.warn = "move";
      b.mouth = Math.min(1, b.stT * 2);
      if (b.stT > 0.75) {
        b.t2 += dt;
        if (b.t2 > 0.14) {
          b.t2 = 0;
          const off = [-90, 0, 80, 160, -40, 120][b.cnt % 6];
          lob(front, top + b.h * 0.15, tgtX() + off, rnd(0.85, 1.05), "acid", 12);
          sfxAcid(panOf(b.x));
          b.cnt++;
          if (b.cnt >= Math.min(6, 3 + Math.floor(lv / 7))) {
            b.st = "recover";
            b.stT = 0;
          }
        }
      }
      break;
    case "beam":
      if (!b.sub) {
        b.sub = Math.random() < 0.5 ? "hi" : "lo";
      }
      b.warn = b.sub === "hi" ? "slide" : "jump";
      b.mouth = Math.min(1, b.stT * 1.5);
      if (b.stT > 0.8) {
        b.t2 += dt;
        if (b.t2 > 0.14) {
          b.t2 = 0;
          const yy = b.sub === "hi" ? GROUND - 72 : GROUND - 16;
          ep.push({ t: "bolt", x: front, y: yy, vx: f * 800, vy: 0, r: 11, life: 2, dmg: 14 });
          sfxAcid(panOf(b.x));
          b.cnt++;
          if (b.cnt >= 4 + Math.floor(lv / 8)) {
            b.st = "recover";
            b.stT = 0;
            b.sub = 0;
          }
        }
      }
      break;
    case "birth":
      b.crouch = Math.min(1, b.stT * 2);
      b.mouth = b.crouch;
      if (b.stT > 0.6 && !b.cnt) {
        b.cnt = 1;
        const n = 2 + Math.floor(lv / 10);
        for (let i = 0; i < n; i++) spawnZombie("crawler", clamp(front + f * i * 55, 20, VW + 40));
        sfxSplat(panOf(b.x));
        for (let i = 0; i < 20; i++)
          part({
            x: front,
            y: b.y - 60,
            vx: rnd(-300, 0),
            vy: rnd(-300, -50),
            g: 1000,
            life: rnd(0.5, 1),
            s: rnd(2, 5),
            col: "#6b8a1e",
            t: "blood",
          });
      }
      if (b.stT > 1) {
        b.st = "recover";
        b.stT = 0;
      }
      break;
    case "boulder":
      b.warn = "jump";
      b.arm = Math.min(1, b.stT / 0.6);
      if (b.stT > 0.75) {
        b.arm = -0.4;
        ep.push({
          t: "boulder",
          x: front,
          y: GROUND - 30,
          vx: f * (520 + Math.min(120, lv * 5)),
          vy: 0,
          r: 30,
          life: 4,
          dmg: 22,
          rot: 0,
        });
        sfxSlam();
        G.shake = 8;
        b.cnt++;
        if (b.cnt < 1 + (lv >= 10 ? 1 : 0) + (low ? 1 : 0)) {
          b.stT = 0.0;
        } else {
          b.st = "recover";
          b.stT = 0;
        }
      }
      break;
    case "rain":
      b.warn = "move";
      b.crouch = Math.sin(Math.min(1, b.stT / 0.6) * PI);
      if (b.stT > 0.6 && !b.cnt) {
        b.cnt = 1;
        sfxSlam();
        G.shake = 16;
        const n = Math.min(8, 3 + Math.floor(lv / 5));
        for (let i = 0; i < n; i++) {
          const tx = clamp(P.x + rnd(-260, 260), 40, VW - 40);
          ep.push({
            t: "debris",
            x: tx,
            y: -60,
            vx: 0,
            vy: 0,
            r: 22,
            life: 5,
            dmg: 20,
            delay: 0.7 + i * 0.24,
            rot: rnd(TAU),
          });
        }
        ep.push({ t: "debris", x: P.x, y: -60, vx: 0, vy: 0, r: 22, life: 5, dmg: 20, delay: 1, rot: 0 });
      }
      if (b.stT > 1.4) {
        b.st = "recover";
        b.stT = 0;
      }
      break;
    case "pound":
      b.warn = "jump";
      b.arm = Math.min(1, b.stT / 0.7);
      if (b.stT > 0.85) {
        b.arm = -0.5;
        sfxSlam();
        G.shake = 18;
        spawnShock(front, f, 40);
        b.cnt++;
        b.stT = 0.25;
        if (b.cnt >= 1 + (lv >= 5 ? 1 : 0) + (lv >= 15 ? 1 : 0)) {
          b.st = "recover";
          b.stT = 0;
        }
      }
      break;
    case "leap":
      if (!b.sub) {
        b.sub = "crouch";
      }
      if (b.sub === "crouch") {
        b.crouch = Math.min(1, b.stT / 0.4);
        b.warn = "move";
        if (b.stT > 0.5) {
          b.sub = "air";
          b.stT = 0;
          b.tx = clamp(P.x, W * 0.4, VW - W * 0.4);
          const T = 0.9;
          b.vx = (b.tx - b.x) / T;
          b.vy = -(0.5 * 2200 * T);
          b.air = true;
          sfxSwoosh();
        }
      } else if (b.sub === "air") {
        b.warn = "move";
        b.crouch = 0;
        b.x += b.vx * dt;
        b.vy += 2200 * dt;
        b.y += b.vy * dt;
        if (b.y >= GROUND && b.vy > 0) {
          b.y = GROUND;
          b.air = false;
          sfxSlam();
          G.shake = 16;
          spawnShock(b.x - 30, -1, 30);
          spawnShock(b.x + 30, 1, 30);
          if (Math.abs(P.x - b.x) < W * 0.4 + 30 && P.y > GROUND - 80) hurtPlayer(25);
          b.sub = "land";
          b.stT = 0;
          b.hitcd = 0.6;
          for (let i = 0; i < 16; i++)
            part({
              x: b.x,
              y: GROUND,
              vx: rnd(-300, 300),
              vy: rnd(-250, -40),
              life: 0.7,
              s: 5,
              s2: 20,
              col: "rgba(90,80,75,.4)",
              t: "smoke",
            });
        }
      } else if (b.sub === "land") {
        b.crouch = lerp(b.crouch, 0.6, dt * 8);
        b.hitcd = Math.max(b.hitcd, 0.2);
        if (b.stT > 0.55) {
          b.sub = "back";
          b.stT = 0;
          const T = 0.7;
          b.vx = (home - b.x) / T;
          b.vy = -(0.5 * 2200 * T);
          b.air = true;
        }
      } else if (b.sub === "back") {
        b.x += b.vx * dt;
        b.vy += 2200 * dt;
        b.y += b.vy * dt;
        if (b.y >= GROUND && b.vy > 0) {
          b.y = GROUND;
          b.air = false;
          b.st = "recover";
          b.stT = 0;
          b.sub = 0;
          sfxLand();
        }
      }
      break;
    case "spikes":
      if (!b.sub) b.sub = Math.random() < 0.5 ? 1 : 2;
      b.warn = b.sub === 1 ? "slide" : "jump";
      b.arm = Math.min(1, b.stT / 0.4);
      if (b.stT > 0.6) {
        const yy = b.sub === 1 ? GROUND - 74 : GROUND - 18;
        ep.push({ t: "spike", x: front, y: yy, vx: f * 860, vy: 0, r: 10, life: 2, dmg: 15 });
        sfxSwoosh();
        b.cnt++;
        b.stT = 0;
        b.sub = b.sub === 1 ? 2 : 1;
        if (b.cnt >= Math.min(7, 3 + Math.floor(lv / 6))) {
          b.st = "recover";
          b.stT = 0;
          b.sub = 0;
        }
      }
      break;
  }
  if (b.warn) G.warn = b.warn;
  if (!b.dying && b.hitcd <= 0 && b.st !== "enter") {
    const bb = { x: b.x - W * 0.38, y: b.y - b.h, w: W * 0.76, h: b.h };
    if (ov(pbox(), bb)) {
      hurtPlayer(18);
      b.hitcd = 1.2;
      P.x = clamp(P.x + (P.x < b.x ? -80 : 80), isTouch ? PMIN : 60, VW - 70);
    }
  }
}
function hurtBoss(b, d, hx, hy) {
  if (b.dying || (b.st === "enter" && b.x > VW - 20)) return;
  let m = 1;
  if (b.id === "tank") {
    const cy = b.y - b.h * 0.56;
    if (Math.abs(hy - cy) < 26) {
      m = 1.6;
      if (Math.random() < 0.2) floater(hx, hy - 10, "PUNTO DÉBIL", "#ffb340", 14);
    } else {
      m = 0.6;
      for (let i = 0; i < 2; i++)
        part({
          x: hx,
          y: hy,
          vx: rnd(-300, 50),
          vy: rnd(-200, 200),
          life: 0.15,
          col: "#ffe0a0",
          t: "spark",
          add: 1,
        });
    }
  }
  b.hp -= d * m;
  b.flash = 0.035;
  for (let i = 0; i < 3; i++)
    part({
      x: hx,
      y: hy,
      vx: rnd(-50, 250),
      vy: rnd(-200, 100),
      g: 1000,
      life: rnd(0.3, 0.7),
      s: rnd(2, 4),
      col: b.id === "mother" ? "#55761a" : "#6d0a0a",
      t: "blood",
    });
  sfxFlesh(panOf(hx));
  if (b.hp <= 0) {
    b.hp = 0;
    b.dying = 2.2;
    sfxRoar();
    G.slow = 0.4;
    G.slowT = 1.6;
    banner("¡" + b.name + " ELIMINADO!", "+" + (3000 + b.lvl * 400) + " PTS");
  }
}
function bossDead(b) {
  for (let i = 0; i < 70; i++)
    part({
      x: b.x + rnd(-b.w / 2, b.w / 2),
      y: b.y - rnd(0, b.h),
      vx: rnd(-600, 600),
      vy: rnd(-700, 0),
      g: 1200,
      life: rnd(0.7, 1.6),
      s: rnd(3, 8),
      col: pick(["#6a0808", "#4a0606", "#8a1a1a", b.skin || "#6d6a5a"]),
      t: Math.random() < 0.4 ? "rect" : "blood",
      rot: rnd(TAU),
      vr: rnd(-15, 15),
      b: 1,
    });
  explode(b.x, b.y - b.h * 0.5, 180, 0, "boss");
  for (let i = 0; i < 5; i++)
    decals.push({ x: b.x + rnd(-120, 120), y: GROUND + rnd(8, 60), r: rnd(30, 70), c: "rgba(70,5,5,.6)" });
  G.score += 3000 + b.lvl * 400;
  G.bossesK++;
  G.boss = null;
  $("bossBar").classList.add("hidden");
  G.bossIdx++;
  G.loop = Math.floor(G.bossIdx / 25);
  G.nextBoss = G.dist + 600 + Math.min(400, G.bossIdx * 16);
  if (G.bossIdx % 25 === 0)
    setTimeout(
      () => banner("¡25 JEFES DERROTADOS!", "EMPIEZA LA RONDA " + ROMAN[Math.min(G.loop + 1, 9)]),
      2500,
    );
  const cand = WORDER.filter((k) => k !== "pistol");
  const best = cand.filter((k) => !P.arms[k].own);
  pick_.push({
    kind: "weapon",
    w: best.length ? pick(best) : pick(["sniper", "rocket", "flamer", "rifle"]),
    x: b.x,
    y: GROUND - 60,
    bob: 0,
  });
  pick_.push({ kind: "med", x: b.x + 90, y: GROUND - 60, bob: 1 });
  G.zt = 2.5;
  G.ot = 2.5;
}
