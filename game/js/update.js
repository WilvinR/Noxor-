"use strict";
/* ================== UPDATE ================== */
function update(dt) {
  G.t += dt;
  const playing = G.state === "play" || G.state === "dead";
  if (G.state === "menu") {
    G.speed = 200;
  }
  if (G.state === "play") {
    G.arena = !!(G.boss && !G.boss.dying && G.boss.st !== "enter" && obs.length === 0);
    let tgt = 280 + Math.min(300, G.dist * 0.08);
    if (G.boss) tgt *= 0.85;
    if (G.arena) tgt = 0;
    if (G.stun > 0) {
      G.stun -= dt;
      tgt *= 0.55;
    }
    G.speed = lerp(G.speed, tgt, dt * (G.arena ? 3 : 2));
  }
  if (G.state === "dead") G.speed = lerp(G.speed, 0, dt * 2);
  if (G.state !== "play") G.arena = false;
  G.scroll += G.speed * dt;
  if (G.state === "play") {
    G.dist += (G.speed * dt) / 40;
    G.score += ((G.speed * dt) / 40) * 1;
    const L = 1 + Math.floor(G.dist / 400);
    if (L > G.lvl) {
      G.lvl = L;
      setZone(L - 1);
      if (!G.boss && bannerT <= 0) banner("NIVEL " + L, "ZONA " + (ZONE.i + 1) + " · " + ZONES[ZONE.i].name);
    }
  }
  G.shake = Math.max(0, G.shake - dt * 40);
  G.hurt = Math.max(0, G.hurt - dt * 1.8);
  G.flashW = Math.max(0, G.flashW - dt);
  if (G.comboT > 0) {
    G.comboT -= dt;
    if (G.comboT <= 0) G.combo = 0;
  }
  if (G.hintT > 0) {
    G.hintT -= dt;
    if (G.hintT <= 0) $("hint").classList.remove("on");
  }
  if (toastT > 0) {
    toastT -= dt;
    if (toastT <= 0) $("toast").classList.remove("on");
  }
  if (bannerT > 0) {
    bannerT -= dt;
    if (bannerT <= 0) $("banner").classList.remove("on");
  }
  G.warn = null;

  if (playing) {
    updatePlayer(dt);
    if (G.state === "play") {
      // spawning
      if (!G.boss && G.dist >= G.nextBoss) startBoss();
      G.zt -= dt;
      if (G.zt <= 0) {
        if (G.boss) {
          if (!G.boss.atk.includes("birth")) spawnZombie(Math.random() < 0.5 ? "walker" : "runner");
          G.zt = rnd(3, 4.5);
        } else {
          if (G.dist > 600 && Math.random() < Math.min(0.16, 0.05 + G.dist / 20000)) {
            const n = rint(3, Math.min(6, 3 + Math.floor(G.dist / 1500)));
            for (let i = 0; i < n; i++)
              spawnZombie(Math.random() < 0.7 ? "walker" : "runner", VW + 60 + i * rnd(50, 80));
            G.zt = rnd(2, 3);
          } else {
            spawnZombie(zTypeByDist());
            G.zt = Math.max(0.45, 2.6 - G.dist / 900) * rnd(0.7, 1.3);
          }
        }
      }
      if (!G.boss) {
        G.ot -= dt;
        if (G.ot <= 0) {
          spawnObstacle();
          G.ot = Math.max(1.7, 3.6 - G.dist / 1500) * rnd(0.8, 1.25);
        }
      }
      G.pt -= dt;
      if (G.pt <= 0) {
        spawnPickup();
        if (G.arena) {
          const p = pick_[pick_.length - 1];
          if (p) {
            p.x = rnd((isTouch ? PMIN : 80) + 40, VW * 0.6);
            p.y = GROUND - 48;
          }
        }
        G.pt = rnd(5.5, 9.5) * (G.arena ? 1.3 : 1);
      }
    }
  }
  G.dt -= dt;
  if (G.dt <= 0 && !G.arena) {
    spawnDecor();
    G.dt = rnd(1.2, 3.4);
  }
  const sp = G.speed * dt;
  // decor
  for (const d of decor) {
    d.x -= sp * 0.78;
    if (d.t === "fire" || (d.t === "car" && d.seed % 3 === 0)) {
      if (Math.random() < 0.5)
        part({
          x: d.x + rnd(-18, 18),
          y: GROUND - 16 - (d.t === "car" ? 30 : 8),
          vx: rnd(-20, 20),
          vy: rnd(-140, -60),
          dr: 1,
          life: rnd(0.4, 0.8),
          s: rnd(6, 12),
          s2: 2,
          col: pick(["#ff9a3c", "#ffcc66", "#ff6a1a"]),
          t: "fire",
          add: 1,
          sf: 0.78,
        });
      if (Math.random() < 0.15)
        part({
          x: d.x,
          y: GROUND - 50,
          vx: rnd(-10, 20),
          vy: rnd(-60, -30),
          life: 2.5,
          s: 10,
          s2: 40,
          col: "rgba(20,18,18,.4)",
          t: "smoke",
          sf: 0.78,
        });
    }
    if (d.t === "lamp") {
      d.fl -= dt;
      if (d.fl <= 0) {
        d.on = Math.random() < 0.85;
        d.fl = d.on ? rnd(0.3, 2.5) : rnd(0.03, 0.2);
      }
    }
  }
  decor = decor.filter((d) => d.x > -300);
  // obstacles
  const pb = pbox();
  for (const o of obs) {
    o.x -= sp;
    if (o.boomT > 0) {
      o.boomT -= dt;
      if (o.boomT <= 0) {
        o.dead = 1;
        explode(o.x, GROUND - 25, 150, 180, "barrel");
      }
    }
    if (o.fire && Math.random() < 0.5)
      part({
        x: o.x + rnd(-40, 50),
        y: GROUND - o.h + rnd(0, 15),
        vx: rnd(-30, 30),
        vy: rnd(-160, -70),
        dr: 1,
        life: rnd(0.4, 0.8),
        s: rnd(7, 13),
        s2: 2,
        col: pick(["#ff9a3c", "#ffcc66", "#ff6a1a"]),
        t: "fire",
        add: 1,
      });
    if (G.state === "play" && !o.hit) {
      let box;
      if (o.t === "beam") box = { x: o.x - o.w / 2, y: o.top, w: o.w, h: o.bot - o.top };
      else {
        const ix = o.t === "car" ? 24 : o.t === "barrel" ? 6 : 16;
        box = {
          x: o.x - o.w / 2 + ix,
          y: GROUND - o.h + (o.t === "car" ? 14 : 9),
          w: o.w - ix * 2,
          h: o.h - (o.t === "car" ? 14 : 9),
        };
      }
      if (ov(pb, box)) {
        if (o.t === "barrel") {
          o.hit = 1;
          o.boomT = 0.01;
        } else {
          o.hit = 1;
          hurtPlayer(o.dmg);
          if (o.t !== "wire") G.stun = 0.4;
          for (let i = 0; i < 12; i++)
            part({
              x: P.x + 14,
              y: P.y - 40,
              vx: rnd(-200, 200),
              vy: rnd(-300, -50),
              g: 1100,
              life: rnd(0.4, 0.9),
              s: rnd(2, 5),
              col: o.t === "wire" ? "#555" : "#3a3332",
              t: "rect",
              rot: rnd(TAU),
              vr: rnd(-10, 10),
            });
        }
      }
    }
  }
  obs = obs.filter((o) => o.x > -220 && !o.dead);
  // pickups
  for (const p of pick_) {
    p.x -= sp;
    p.bob += dt * 3;
    if (G.state === "play" && ov(pb, { x: p.x - 20, y: p.y - 22 + Math.sin(p.bob) * 5, w: 40, h: 44 })) {
      p.got = 1;
      if (p.kind === "weapon") {
        giveWeapon(p.w);
        sfxPickup("weapon");
      } else if (p.kind === "med") {
        P.hp = Math.min(100, P.hp + 40);
        toast("+40 VIDA");
        sfxPickup("med");
      } else {
        const own = WORDER.filter((k) => k !== "pistol" && P.arms[k].own);
        if (own.length) {
          const id = P.cur !== "pistol" ? P.cur : pick(own);
          P.arms[id].res += Math.ceil(WEAP[id].pack * 0.6);
          toast("+ MUNICIÓN · " + WEAP[id].n);
        } else {
          giveWeapon(pick(["smg", "shotgun", "rifle"]));
        }
        sfxPickup("ammo");
        refreshWeaponUI();
      }
      for (let i = 0; i < 14; i++)
        part({
          x: p.x,
          y: p.y,
          vx: rnd(-200, 200),
          vy: rnd(-200, 100),
          life: 0.5,
          col: p.kind === "med" ? "#ff6060" : "#ffd27a",
          t: "spark",
          add: 1,
        });
    }
  }
  pick_ = pick_.filter((p) => p.x > -60 && !p.got);
  // zombies
  for (const z of zs) {
    if (z.dead) {
      z.dead += dt;
      z.flash -= dt;
      z.x -= sp;
      continue;
    }
    z.flash -= dt;
    z.atk -= dt;
    z.ph += dt * z.an;
    let vx = -(G.speed + z.spd);
    z.fd = -1;
    if (G.arena) {
      z.fd = P.x > z.x + 10 ? 1 : -1;
      vx = z.fd * (z.spd + 55);
    }
    if (z.type === "spitter" && z.hold > 0 && z.x < VW - 110) {
      vx = -z.spd;
      z.hold -= dt;
      z.shot -= dt;
      if (z.shot <= 0) {
        z.shot = rnd(1.4, 2);
        z.spit = 0.4;
        lob(z.x - 10, GROUND - 80, P.x + rnd(-40, 60), rnd(0.7, 0.9), "acid", 10);
        sfxAcid(panOf(z.x));
      }
    }
    if (z.spit > 0) z.spit -= dt;
    z.x += vx * dt + z.kb * dt * 6;
    z.kb *= Math.pow(0.02, dt);
    if (z.burn > 0) {
      z.burn -= dt;
      z.hp -= 18 * dt;
      if (Math.random() < 0.6)
        part({
          x: z.x + rnd(-12, 12),
          y: GROUND - z.h * rnd(0.2, 0.9),
          vx: rnd(-30, 30),
          vy: rnd(-150, -60),
          life: rnd(0.3, 0.6),
          s: rnd(5, 10),
          s2: 2,
          col: pick(["#ff9a3c", "#ffcc66"]),
          t: "fire",
          add: 1,
        });
      if (z.hp <= 0) killZ(z, 0, false);
    }
    if (G.state === "play" && !z.dead && z.atk <= 0 && ov(pb, zbox(z))) {
      hurtPlayer(z.dmg);
      z.atk = 1.1;
      z.kb = 60;
      sfxGroan(panOf(z.x), 1, 0, true);
    }
    if (z.x < -50 && Math.random() < 0.01) {
    }
  }
  zs = zs.filter((z) => z.x > -140 && !(z.dead > 1.8) && !(z.gib && z.dead));
  // boss
  if (G.boss) updateBoss(G.boss, dt);
  // bullets
  for (const b of bul) {
    b.life -= dt;
    if (b.t === "flame") {
      b.vx *= Math.pow(0.25, dt);
      b.vy -= 60 * dt;
    }
    if (b.t === "rocket") {
      b.vx *= 1 + dt * 1.6;
      if (Math.random() < 0.9)
        part({
          x: b.x - 8,
          y: b.y,
          vx: rnd(-80, -20),
          vy: rnd(-30, 30),
          dr: 2,
          life: rnd(0.5, 1),
          s: 5,
          s2: 18,
          col: "rgba(90,85,85,.4)",
          t: "smoke",
        });
      part({
        x: b.x - 10,
        y: b.y,
        vx: -200,
        vy: rnd(-20, 20),
        life: 0.08,
        s: 7,
        s2: 2,
        col: "#ffcc66",
        t: "fire",
        add: 1,
      });
      light(b.x, b.y, 90, "255,170,90", 0.5);
    }
    const nx = b.x + b.vx * dt,
      ny = b.y + b.vy * dt;
    // hit zombies (swept along x)
    const minx = Math.min(b.x, nx),
      maxx = Math.max(b.x, nx);
    for (const z of zs) {
      if (z.dead || b.life <= 0) continue;
      if (b.hit && b.hit.includes(z)) continue;
      const zb = zbox(z);
      if (maxx >= zb.x && minx <= zb.x + zb.w && ny >= zb.y && ny <= zb.y + zb.h) {
        if (b.t === "flame") {
          z.hp -= b.dmg * dt * 1.0;
          z.burn = Math.max(z.burn, 2.2);
          z.flash = 0.03;
          if (z.hp <= 0) killZ(z, 0, false);
          continue;
        }
        if (b.t === "rocket") {
          b.life = 0;
          explode(b.x, ny, 140, b.dmg, "player");
          break;
        }
        hurtZ(z, b.dmg, clamp(nx, zb.x, zb.x + zb.w), ny, b.vx);
        if (b.pierce > 0) {
          b.pierce--;
          (b.hit || (b.hit = [])).push(z);
        } else {
          b.life = 0;
        }
      }
    }
    const bs = G.boss;
    if (bs && !bs.dying && b.life > 0) {
      const bb = { x: bs.x - bs.w / 2, y: bs.y - bs.h, w: bs.w, h: bs.h };
      if (maxx >= bb.x && minx <= bb.x + bb.w && ny >= bb.y && ny <= bb.y + bb.h) {
        if (b.t === "flame") {
          if (Math.random() < 0.5) hurtBoss(bs, b.dmg * dt * 2, bb.x + 10, ny);
        } else if (b.t === "rocket") {
          b.life = 0;
          explode(bb.x + 20, ny, 140, b.dmg, "player");
        } else {
          hurtBoss(bs, b.dmg, b.vx > 0 ? bb.x + rnd(4, 20) : bb.x + bb.w - rnd(4, 20), ny);
          if (b.pierce > 0) b.pierce = 0;
          b.life = 0;
        }
      }
    }
    for (const o of obs) {
      if (o.t !== "barrel" || o.hit || b.life <= 0) continue;
      if (maxx >= o.x - 16 && minx <= o.x + 16 && ny > GROUND - 50) {
        if (b.t === "flame") {
          o.hp -= 60 * dt;
        } else {
          o.hp -= b.dmg;
          b.life = b.pierce > 0 ? b.life : 0;
        }
        part({
          x: o.x - 14,
          y: ny,
          vx: -200,
          vy: rnd(-100, 100),
          life: 0.12,
          col: "#ffd27a",
          t: "spark",
          add: 1,
        });
        if (o.hp <= 0) {
          o.hit = 1;
          o.boomT = 0.02;
        }
      }
    }
    b.x = nx;
    b.y = ny;
    if (b.t === "rocket" && b.life > 0 && (b.y > GROUND || b.x > VW + 40 || b.x < -40)) {
      if (b.y > GROUND) explode(b.x, GROUND - 10, 140, b.dmg, "player");
      b.life = 0;
    }
    if (b.t !== "flame" && b.y > GROUND + 4 && b.life > 0) {
      b.life = 0;
      for (let i = 0; i < 3; i++)
        part({
          x: b.x,
          y: GROUND,
          vx: rnd(-100, 100),
          vy: rnd(-200, -60),
          g: 800,
          life: 0.3,
          col: "#ffcf7a",
          t: "spark",
          add: 1,
        });
    }
  }
  bul = bul.filter((b) => b.life > 0 && b.x < VW + 80 && b.x > -50);
  // enemy projectiles
  for (const e of ep) {
    if (e.delay > 0) {
      e.delay -= dt;
      continue;
    }
    e.life -= dt;
    e.vy += (e.g || 0) * dt;
    if (e.t === "debris") e.vy += 1800 * dt;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.rot = (e.rot || 0) + dt * (e.t === "cleaver" ? 14 : e.t === "boulder" ? -e.vx / 30 : 3);
    if (e.t === "shock") {
      if (Math.random() < 0.8)
        part({
          x: e.x + rnd(-20, 20),
          y: GROUND - rnd(0, e.h),
          vx: rnd(-60, 60) + e.vx * 0.2,
          vy: rnd(-160, -40),
          life: rnd(0.3, 0.6),
          s: rnd(4, 8),
          s2: rnd(16, 28),
          col: "rgba(100,88,80,.35)",
          t: "smoke",
        });
    }
    if (e.t === "acid" || e.t === "bolt") {
      if (Math.random() < 0.5)
        part({
          x: e.x,
          y: e.y,
          vx: rnd(-30, 30),
          vy: rnd(-30, 30),
          life: 0.3,
          s: 4,
          s2: 1,
          col: "#b5ff4a",
          t: "dot",
          add: 1,
        });
    }
    // hit player
    const pb2 = pbox();
    if (G.state === "play" && !e.done) {
      let hit = false;
      if (e.t === "shock") hit = ov(pb2, { x: e.x - e.w / 2, y: GROUND - e.h, w: e.w, h: e.h });
      else hit = ov(pb2, { x: e.x - e.r, y: e.y - e.r, w: e.r * 2, h: e.r * 2 });
      if (hit) {
        hurtPlayer(e.dmg);
        if (e.t !== "shock" && e.t !== "boulder") {
          e.done = 1;
          if (e.t === "acid" || e.t === "bolt") {
            for (let i = 0; i < 10; i++)
              part({
                x: e.x,
                y: e.y,
                vx: rnd(-200, 200),
                vy: rnd(-200, 50),
                g: 900,
                life: 0.5,
                s: 3,
                col: "#8fd12a",
                t: "blood",
              });
            sfxAcid(panOf(e.x));
          }
        }
      }
    }
    // ground
    if ((e.t === "acid" || e.t === "cleaver" || e.t === "debris") && e.y >= GROUND - 6 && !e.done) {
      e.done = 1;
      if (e.t === "acid") {
        puddles.push({ x: e.x, w: rnd(70, 100), life: 3 });
        sfxAcid(panOf(e.x));
        for (let i = 0; i < 12; i++)
          part({
            x: e.x,
            y: GROUND - 4,
            vx: rnd(-220, 220),
            vy: rnd(-260, -60),
            g: 900,
            life: 0.6,
            s: rnd(2, 4),
            col: "#8fd12a",
            t: "blood",
          });
      } else {
        sfxLand();
        G.shake = Math.max(G.shake, e.t === "debris" ? 8 : 3);
        for (let i = 0; i < 10; i++)
          part({
            x: e.x,
            y: GROUND,
            vx: rnd(-200, 200),
            vy: rnd(-250, -60),
            g: 1000,
            life: rnd(0.4, 0.8),
            s: rnd(2, 5),
            col: "#3a3332",
            t: "rect",
            rot: rnd(TAU),
            vr: rnd(-10, 10),
          });
        for (let i = 0; i < 6; i++)
          part({
            x: e.x,
            y: GROUND,
            vx: rnd(-120, 120),
            vy: rnd(-80, -20),
            life: 0.7,
            s: 6,
            s2: 22,
            col: "rgba(90,80,75,.4)",
            t: "smoke",
          });
      }
    }
  }
  ep = ep.filter((e) => !e.done && e.life > 0 && e.x > -120 && e.x < VW + 200);
  // puddles
  for (const p of puddles) {
    p.x -= sp;
    p.life -= dt;
    if (Math.random() < 0.3)
      part({
        x: p.x + rnd(-p.w / 2, p.w / 2),
        y: GROUND + 2,
        vx: 0,
        vy: rnd(-50, -20),
        life: 0.6,
        s: 3,
        s2: 7,
        col: "rgba(150,220,60,.25)",
        t: "smoke",
      });
    if (G.state === "play" && P.ground && Math.abs(P.x - p.x) < p.w / 2) hurtPlayer(8);
  }
  puddles = puddles.filter((p) => p.life > 0 && p.x > -100);
  for (const d of decals) d.x -= sp;
  decals = decals.filter((d) => d.x > -100);
  // particles
  for (const p of parts) {
    p.life -= dt;
    if (p.dr) (p.vx *= Math.pow(1 / (1 + p.dr), dt)), (p.vy *= Math.pow(1 / (1 + p.dr), dt));
    p.vy += p.g * dt;
    p.x += p.vx * dt - sp * p.sf;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    if (p.t === "fire" || p.t === "smoke") {
      p.vy -= (p.t === "fire" ? 40 : 20) * dt;
    }
    if ((p.t === "blood" || p.t === "rect" || p.t === "shell") && p.y > GROUND + 2 && p.vy > 0) {
      if (p.t === "blood") {
        p.life = 0;
        if (Math.random() < 0.12 && decals.length < 45)
          decals.push({ x: p.x, y: GROUND + rnd(2, 14), r: rnd(4, 10), c: "rgba(80,6,6,.5)" });
      } else if (p.b > 0) {
        p.y = GROUND + 2;
        p.vy *= -0.35;
        p.vx *= 0.5;
        p.vr *= 0.5;
        p.b--;
        if (p.t === "shell") sfxShell();
      } else {
        p.y = GROUND + 2;
        p.vy = 0;
        p.vx = 0;
        p.vr = 0;
      }
    }
  }
  parts = parts.filter((p) => p.life > 0);
  for (const f of floats) {
    f.life -= dt * 1.6;
    f.y -= dt * 40;
    f.x -= sp * 0.5;
  }
  floats = floats.filter((f) => f.life > 0);
  // ash
  while (ash.length < 70)
    ash.push({
      x: rnd(VW + 200),
      y: rnd(-20, VH),
      vx: rnd(-40, -10),
      vy: rnd(15, 45),
      s: rnd(0.8, 2.2),
      a: rnd(0.2, 0.6),
      ph: rnd(TAU),
      ember: Math.random() < 0.15,
    });
  for (const a of ash) {
    a.x += (a.vx - G.speed * 0.25) * dt;
    a.y += a.vy * dt;
    a.ph += dt * 2;
    a.x += Math.sin(a.ph) * 8 * dt;
    if (a.y > VH || a.x < -20) {
      a.x = rnd(VW, VW + 200);
      a.y = rnd(-20, VH * 0.8);
    }
  }
  // tutorial hints
  hintTick();
  if (G.state === "play") {
    const t = G.t;
    if (!store.tut && !G.boss) {
      if (t > 3 && t < 3.1) hint(isTouch ? "Mantén FUEGO para disparar" : "Mantén J o clic para disparar", 3);
      if (t > 7 && t < 7.1) hint("Salta los obstáculos · deslízate bajo las vigas", 3.2);
      if (t > 11 && t < 11.1) hint("Recoge cajas de armas y botiquines", 3);
      if (t > 15) (store.tut = 1), save();
    }
  }
}
