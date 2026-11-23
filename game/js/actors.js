"use strict";
/* ================== DRAW ================== */
function limb(x1, y1, x2, y2, w, c) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function limb3(x1, y1, x2, y2, x3, y3, w, c) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.stroke();
}
function leg(hx, hy, sw, bend, L) {
  const kx = hx + Math.sin(sw) * L,
    ky = hy + Math.cos(sw) * L;
  const a2 = sw - bend;
  return [kx, ky, kx + Math.sin(a2) * L, ky + Math.cos(a2) * L];
}
function circ(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
function ell(x, y, rx, ry, c, rot) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  ctx.fill();
}
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function glow(x, y, r, col, a) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
function shadow(x, w, a) {
  ctx.fillStyle = `rgba(0,0,0,${a || 0.45})`;
  ctx.beginPath();
  ctx.ellipse(x, GROUND + 2, w, w * 0.18, 0, 0, TAU);
  ctx.fill();
}

function drawGun(c, id, sc) {
  c.save();
  if (sc) c.scale(sc, sc);
  const dk = "#1b1c1f",
    md = "#2c2e33",
    lt = "#4a4d55",
    wd = "#5a3a22",
    wd2 = "#6e4729";
  const R = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  switch (id) {
    case "pistol":
      R(-2, -5, 19, 5, md);
      R(-2, -5, 19, 1.5, lt);
      R(-1, 0, 5, 8, dk);
      R(4, 0, 3, 2, dk);
      break;
    case "smg":
      R(-10, -3, 6, 3, dk);
      R(-4, -6, 22, 7, md);
      R(-4, -6, 22, 1.5, lt);
      R(18, -4.5, 8, 3, dk);
      R(4, 1, 4, 9, dk);
      R(-1, 1, 4, 7, dk);
      break;
    case "rifle":
      c.fillStyle = wd;
      c.beginPath();
      c.moveTo(-16, -4);
      c.lineTo(-2, -5);
      c.lineTo(-2, 1);
      c.lineTo(-16, 4);
      c.closePath();
      c.fill();
      R(-2, -6, 24, 7, md);
      R(-2, -6, 24, 1.5, lt);
      R(14, -5, 10, 5, wd2);
      R(24, -4, 14, 2.5, dk);
      R(34, -7, 2, 3, dk);
      c.fillStyle = dk;
      c.beginPath();
      c.moveTo(6, 1);
      c.lineTo(11, 1);
      c.quadraticCurveTo(14, 8, 10, 13);
      c.lineTo(6, 12);
      c.quadraticCurveTo(9, 7, 6, 1);
      c.fill();
      R(0, 1, 4, 7, dk);
      break;
    case "shotgun":
      R(-16, -4, 14, 7, wd);
      R(-2, -5, 18, 6, md);
      R(-2, -5, 18, 1.5, lt);
      R(16, -5, 24, 3, dk);
      R(16, -2, 20, 3, md);
      R(18, -2.5, 12, 5, wd2);
      R(0, 1, 4, 6, dk);
      break;
    case "sniper":
      R(-18, -4, 16, 8, "#2b3326");
      R(-2, -5, 30, 6, "#323a2c");
      R(-2, -5, 30, 1.5, "#4b5644");
      R(28, -4, 22, 2.5, dk);
      R(2, -11, 18, 4, dk);
      circ(2, -9, 2.6, dk);
      circ(20, -9, 3, dk);
      glowDot(c, 21, -9, "111,227,255");
      R(8, 1, 4, 7, dk);
      R(30, 1, 1.5, 8, dk);
      R(34, 1, 1.5, 8, dk);
      break;
    case "flamer":
      R(-6, -6, 22, 9, "#3d3a30");
      R(-6, -6, 22, 2, "#5a5646");
      R(16, -4, 18, 4, dk);
      R(30, -5, 4, 6, "#555");
      R(2, 3, 4, 7, dk);
      c.fillStyle = "#7a2a1a";
      c.fillRect(-14, -8, 8, 14);
      glowDot(c, 35, -2, "90,160,255");
      break;
    case "rocket":
      R(-22, -6, 66, 10, "#3b4430");
      R(-22, -6, 66, 2, "#566246");
      R(-24, -7, 4, 12, dk);
      R(40, -7, 4, 12, dk);
      c.fillStyle = "#4a5038";
      c.beginPath();
      c.moveTo(44, -6);
      c.lineTo(52, -3);
      c.lineTo(52, 0);
      c.lineTo(44, 4);
      c.fill();
      R(0, 4, 4, 8, dk);
      R(10, 4, 4, 7, dk);
      R(4, -11, 8, 5, dk);
      break;
  }
  c.restore();
}
function glowDot(c, x, y, col) {
  c.save();
  c.globalCompositeOperation = "lighter";
  const g = c.createRadialGradient(x, y, 0, x, y, 5);
  g.addColorStop(0, `rgba(${col},.9)`);
  g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g;
  c.fillRect(x - 5, y - 5, 10, 10);
  c.restore();
}

function drawPlayer() {
  const p = P;
  ctx.save();
  ctx.translate(p.x, p.y);
  const FF = p.face || 1;
  const hgt = GROUND - p.y;
  ctx.fillStyle = `rgba(0,0,0,${0.5 * clamp(1 - hgt / 220, 0.15, 1)})`;
  ctx.beginPath();
  ctx.ellipse(0, hgt + 2, 24 * (1 - hgt / 450), 5, 0, 0, TAU);
  ctx.fill();
  ctx.scale(FF, 1);
  if (p.dead) {
    ctx.rotate(-Math.min(1, p.dead * 2.5) * 1.45);
  }
  if (p.inv > 0 && !p.dead && ((G.t * 18) | 0) % 2) ctx.globalAlpha = 0.45;
  const L = 23,
    ph = p.phase;
  let lf,
    lb,
    hx = 0,
    hy,
    sx,
    sy;
  if (p.slide > 0 && !p.dead) {
    lf = [1.5, 0.1];
    lb = [1.15, 1.5];
    hy = -18;
    hx = -2;
    sx = -12;
    sy = -45;
  } else if (!p.ground || p.dead) {
    lf = [0.75, 1.35];
    lb = [-0.35, 0.75];
    hy = -48;
    sx = 6;
    sy = -77;
  } else if (p.idle) {
    lf = [0.14 + Math.sin(G.t * 2) * 0.02, 0.12];
    lb = [-0.16, 0.2];
    hy = -L * (Math.cos(0.14) + Math.cos(0.02)) + 1;
    sx = 6;
    sy = hy - 29 + Math.sin(G.t * 2.4) * 0.8;
  } else {
    lf = [Math.sin(ph) * 0.85, Math.max(0, Math.cos(ph)) * 1.45 + 0.12];
    lb = [Math.sin(ph + PI) * 0.85, Math.max(0, Math.cos(ph + PI)) * 1.45 + 0.12];
    const ext = (s) => L * (Math.cos(s[0]) + Math.cos(s[0] - s[1]));
    hy = -Math.max(ext(lf), ext(lb)) + 1;
    sx = 7;
    sy = hy - 29;
  }
  p.hipY = hy;
  const legF = leg(hx, hy, lf[0], lf[1], L),
    legB = leg(hx, hy, lb[0], lb[1], L);
  const pants = "#2b2e33",
    pantsD = "#1f2125",
    boot = "#121010",
    jk = "#46432f",
    jkD = "#35321f",
    jkL = "#6c6548";
  const gp = { x: sx + 14 - p.recoil * 5, y: sy + 9 };
  if (p.cur === "rocket") {
    gp.x = sx + 2 - p.recoil * 5;
    gp.y = sy - 2;
  }
  const a = p.aim;
  const grip2 = {
    x: gp.x + Math.cos(a) * (p.cur === "pistol" ? 3 : 13),
    y: gp.y + Math.sin(a) * (p.cur === "pistol" ? 3 : 13) + 1,
  };
  // back arm
  limb3(sx - 2, sy + 2, (sx + grip2.x) / 2 - 2, (sy + grip2.y) / 2 + 8, grip2.x, grip2.y, 6.5, jkD);
  // back leg
  limb3(hx, hy, legB[0], legB[1], legB[2], legB[3], 9, pantsD);
  limb(legB[2], legB[3], legB[2] + 7, legB[3] + 1, 6, boot);
  // backpack
  ctx.save();
  const bx = lerp(hx, sx, 0.55) - 10,
    by = lerp(hy, sy, 0.55);
  ctx.translate(bx, by);
  ctx.rotate(Math.atan2(sx - hx, -(sy - hy)) * 0.9);
  ctx.fillStyle = "#3a3124";
  rrect(-7, -13, 13, 25, 3);
  ctx.fill();
  ctx.fillStyle = "#4f4636";
  ctx.fillRect(-7, -6, 13, 2);
  ell(0, -15, 8, 4.5, "#4c4838");
  ctx.restore();
  // torso
  limb(hx, hy, sx, sy, 15, jk);
  limb(hx + 3, hy - 2, sx + 4, sy + 1, 4, jkL);
  limb(hx - 3, hy - 1, sx - 1, sy, 3, jkD);
  ctx.strokeStyle = "#241e16";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy);
  ctx.lineTo(hx + 5, hy - 3);
  ctx.stroke();
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(hx - 7, hy - 3, 14, 4);
  // front leg
  limb3(hx, hy, legF[0], legF[1], legF[2], legF[3], 9.5, pants);
  limb(legF[0], legF[1], legF[0] + 1, legF[1] + 3, 9, "#33363c");
  limb(legF[2], legF[3], legF[2] + 7.5, legF[3] + 1, 6.5, boot);
  // head
  const Hx = sx + 4,
    Hy = sy - 12;
  circ(Hx, Hy, 10, "#2f2c24");
  ell(Hx + 4, Hy + 1.5, 6.2, 7, "#16171a");
  ctx.fillStyle = "#8ee6ff";
  ctx.fillRect(Hx + 3, Hy - 2.5, 7, 2.6);
  glow(Hx + 7, Hy - 1.3, 9, "111,227,255", 0.55);
  circ(Hx + 9.5, Hy + 5, 3.3, "#3b3d40");
  circ(Hx + 9.5, Hy + 5, 1.4, "#202124");
  ctx.strokeStyle = "#45412f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(Hx, Hy, 10, PI * 0.75, PI * 1.95);
  ctx.stroke();
  // gun
  ctx.save();
  ctx.translate(gp.x, gp.y);
  ctx.rotate(a);
  drawGun(ctx, p.cur);
  ctx.restore();
  // front arm
  limb3(sx + 1, sy + 2, (sx + gp.x) / 2 - 3, (sy + gp.y) / 2 + 7, gp.x + 1, gp.y + 2, 7, jk);
  circ(gp.x + 1, gp.y + 2, 3.2, "#2a2520");
  if (p.cur === "flamer") {
    glow(gp.x + Math.cos(a) * 35, gp.y + Math.sin(a) * 35 - 2, 8, "80,150,255", 0.6);
  }
  ctx.restore();
}

function drawZombie(z) {
  const s = z.s;
  const fl = z.flash > 0;
  const C = (c) => (fl ? "#efe8de" : c);
  ctx.save();
  ctx.translate(z.x, GROUND - z.yo);
  if (!z.dead) shadow(0, z.w * 0.65, 0.4);
  const FS = z.fd === 1 ? 1 : -1;
  ctx.scale(FS, 1);
  let alpha = 1;
  if (z.dead) {
    const f = Math.min(1, z.dead * 2.6);
    ctx.rotate(-f * (z.type === "crawler" ? 0.2 : 1.42));
    if (z.dead > 1.1) alpha = Math.max(0, 1 - (z.dead - 1.1) / 0.7);
  }
  ctx.globalAlpha = alpha;
  const skin = C(z.skin),
    skinD = C(shade(z.skin, -0.25)),
    cl = C(z.cloth),
    clD = C(shade(z.cloth, -0.3)),
    blood = fl ? "#efe8de" : "#4a0707";
  const L = 22 * s,
    ph = z.ph;
  if (z.type === "crawler") {
    const hx = -18 * s,
      hy = -9 * s,
      sx = 10 * s,
      sy = -14 * s;
    limb3(hx, hy, hx - 14 * s, hy + 4 * s, hx - 34 * s, -2 * s, 7 * s, clD);
    limb3(hx, hy, hx - 16 * s, hy + 1 * s, hx - 36 * s, -5 * s, 7 * s, cl);
    limb(hx, hy, sx, sy, 13 * s, cl);
    limb(hx + 6 * s, hy - 3 * s, sx - 4 * s, sy - 3 * s, 3 * s, blood);
    const r1 = Math.sin(ph),
      r2 = Math.sin(ph + PI);
    limb3(sx, sy, sx + 10 * s + r1 * 5 * s, sy - 8 * s, sx + 20 * s + r1 * 8 * s, -1 * s, 5 * s, skinD);
    circ(sx + 10 * s, sy - 3 * s, 8.5 * s, skin);
    ell(sx + 14 * s, sy + 1 * s, 4 * s, 2.5 * s, blood);
    circ(sx + 13 * s, sy - 6 * s, 1.8 * s, fl ? "#fff" : "#ffd34d");
    limb3(sx, sy, sx + 12 * s + r2 * 5 * s, sy - 6 * s, sx + 22 * s + r2 * 8 * s, -1 * s, 5.5 * s, skin);
    ctx.restore();
    if (!fl && !z.dead) glow(z.x + FS * 13 * s, GROUND - z.yo - 20 * s, 7, "255,200,60", 0.35);
    return;
  }
  const big = z.type === "bloater";
  const run = z.type === "runner";
  const amp = run ? 0.8 : 0.5;
  const sw1 = Math.sin(ph) * amp,
    b1 = Math.max(0, Math.cos(ph)) * (run ? 1.4 : 0.9) + 0.2;
  const sw2 = Math.sin(ph + PI) * amp * 0.8,
    b2 = Math.max(0, Math.cos(ph + PI)) * (run ? 1.4 : 0.7) + 0.2;
  const ext = (a, b) => L * (Math.cos(a) + Math.cos(a - b));
  const hx = 0,
    hy = z.dead ? -L * 1.9 : -Math.max(ext(sw1, b1), ext(sw2, b2)) + 1;
  const lean = (run ? 18 : 12) * s + z.lean * 10;
  const sx = lean,
    sy = hy - 27 * s * (big ? 1.05 : 1);
  const lf = leg(hx, hy, sw1, b1, L),
    lb = leg(hx, hy, sw2, b2, L);
  const lw = (run ? 7 : 8.5) * s * (big ? 1.25 : 1);
  // back arm
  const reach = z.spit > 0 ? -0.5 : 1;
  const a1 = Math.sin(ph * 0.5) * 4 * s;
  limb3(
    sx - 2 * s,
    sy + 2 * s,
    sx + 10 * s,
    sy + 10 * s + a1,
    sx + 24 * s * reach,
    sy + 6 * s + a1,
    lw * 0.7,
    skinD,
  );
  // back leg
  limb3(hx, hy, lb[0], lb[1], lb[2], lb[3], lw, clD);
  limb(lb[2], lb[3], lb[2] + 6 * s, lb[3] + 1, lw * 0.7, "#151314");
  // torso
  limb(hx, hy, sx, sy, (run ? 12 : 14) * s * (big ? 1.4 : 1), cl);
  if (z.type === "armored") {
    limb(hx + 1, hy - 4 * s, sx, sy + 3 * s, 18 * s, C("#252b33"));
    ctx.fillStyle = C("#3a4552");
    ctx.fillRect(hx + 2 * s, hy - 18 * s, 10 * s, 6 * s);
  } else {
    ell(lerp(hx, sx, 0.55) + 4 * s, lerp(hy, sy, 0.55), 3.5 * s, 6 * s, skinD);
    ctx.strokeStyle = fl ? "#fff" : "rgba(40,10,10,.8)";
    ctx.lineWidth = 1.2 * s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(lerp(hx, sx, 0.4 + i * 0.12) + 1 * s, lerp(hy, sy, 0.4 + i * 0.12));
      ctx.lineTo(lerp(hx, sx, 0.4 + i * 0.12) + 7 * s, lerp(hy, sy, 0.4 + i * 0.12) + 1 * s);
      ctx.stroke();
    }
    ell(lerp(hx, sx, 0.3) - 3 * s, lerp(hy, sy, 0.3), 4 * s, 3 * s, blood);
  }
  if (big) {
    const bx = lerp(hx, sx, 0.5) + 9 * s,
      by = lerp(hy, sy, 0.5) + 4 * s;
    const pulse = 1 + Math.sin(G.t * 6 + z.ph) * 0.04;
    const g = ctx.createRadialGradient(bx - 6 * s, by - 6 * s, 2, bx, by, 24 * s);
    g.addColorStop(0, C("#a3b07a"));
    g.addColorStop(1, C("#5c6a3e"));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx, by, 21 * s * pulse, 23 * s * pulse, 0, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + 0.4,
        px = bx + Math.cos(a) * 14 * s,
        py = by + Math.sin(a) * 15 * s;
      circ(px, py, (2.5 + (i % 2)) * s, fl ? "#fff" : "#c6ff4d");
    }
  }
  // front leg
  limb3(hx, hy, lf[0], lf[1], lf[2], lf[3], lw, cl);
  limb(lf[2], lf[3], lf[2] + 6 * s, lf[3] + 1, lw * 0.75, "#1a1718");
  if (z.type !== "armored") ell(lf[0], lf[1], 3 * s, 2 * s, skinD);
  // head
  const tilt = z.spit > 0 ? -0.5 : 0.15;
  const Hx = sx + 8 * s,
    Hy = sy - 8 * s;
  ctx.save();
  ctx.translate(Hx, Hy);
  ctx.rotate(tilt);
  if (z.type === "spitter") {
    circ(-1 * s, 8 * s, 9 * s, fl ? "#fff" : "rgba(140,190,50,.95)");
    circ(2 * s, 10 * s, 3 * s, fl ? "#fff" : "#d6ff6a");
  }
  circ(0, 0, 9 * s, skin);
  ell(4 * s, 5 * s, 5 * s, 3.2 * s, skinD);
  ctx.fillStyle = fl ? "#fff" : "#2a0a0a";
  ctx.fillRect(3 * s, 5 * s, 5 * s, (z.spit > 0 ? 4 : 2) * s);
  if (z.hair) {
    ctx.fillStyle = C("#1d1a18");
    ctx.beginPath();
    ctx.arc(-1 * s, -2 * s, 9 * s, PI * 0.95, PI * 1.75);
    ctx.fill();
  }
  if (z.type === "armored") {
    ctx.fillStyle = C("#1e2733");
    ctx.beginPath();
    ctx.arc(0, -1 * s, 10.5 * s, PI, TAU);
    ctx.fill();
    ctx.fillRect(-10.5 * s, -1 * s, 21 * s, 3 * s);
    ctx.fillStyle = fl ? "#fff" : "rgba(120,160,190,.45)";
    ctx.fillRect(2 * s, -1 * s, 9 * s, 5 * s);
  }
  circ(5 * s, -1.5 * s, 1.9 * s, fl ? "#fff" : run ? "#ff4a3a" : "#ffd34d");
  ctx.restore();
  // front arm
  limb3(
    sx + 1 * s,
    sy + 2 * s,
    sx + 13 * s,
    sy + 8 * s - a1,
    sx + 27 * s * reach,
    sy + 3 * s - a1,
    lw * 0.75,
    skin,
  );
  ctx.restore();
  if (!fl && !z.dead) {
    glow(z.x + FS * (Hx + 5 * s), GROUND - z.yo + Hy - 1.5 * s, 8 * s, run ? "255,60,40" : "255,200,60", 0.4);
    if (big) glow(z.x + FS * (sx * 0.5 + 9 * s), GROUND + (hy + sy) / 2, 40 * s, "160,255,60", 0.12);
  }
}
function mixHex(a, b, t) {
  const x = parseInt(a.slice(1), 16),
    y = parseInt(b.slice(1), 16);
  const r = lerp(x >> 16, y >> 16, t) | 0,
    g = lerp((x >> 8) & 255, (y >> 8) & 255, t) | 0,
    bb = lerp(x & 255, y & 255, t) | 0;
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | bb).toString(16).slice(1);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16,
    g = (n >> 8) & 255,
    b = n & 255;
  const f = 1 + amt;
  r = clamp((r * f) | 0, 0, 255);
  g = clamp((g * f) | 0, 0, 255);
  b = clamp((b * f) | 0, 0, 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/* ---- bosses ---- */
function drawBoss(b) {
  const fl = b.flash > 0;
  const C = (c) => {
    const x = b.tint ? mixHex(c, b.tint[0], b.tint[1]) : c;
    return fl ? shade(x, 0.55) : x;
  };
  const sc = b.sc || 1;
  ctx.save();
  ctx.translate(b.x, b.y);
  if (!b.air) shadow(0, b.w * 0.5, 0.55);
  else {
    const hh = GROUND - b.y;
    ctx.save();
    ctx.translate(0, hh);
    shadow(0, b.w * 0.4 * (1 - hh / 500), 0.4);
    ctx.restore();
  }
  if (b.dying) {
    ctx.translate(rnd(-3, 3), rnd(-2, 2));
  }
  const BF = b.face || -1;
  ctx.scale(BF * sc, sc);
  const ph = b.ph;
  switch (b.id) {
    case "butcher": {
      const s = 2.45,
        L = 22 * s;
      const sw1 = Math.sin(ph) * 0.35,
        sw2 = Math.sin(ph + PI) * 0.35;
      const hy = -L * 1.92 - Math.abs(Math.sin(ph)) * 3;
      const lf = leg(0, hy, sw1, 0.3 + Math.max(0, Math.cos(ph)) * 0.5, L),
        lb = leg(0, hy, sw2, 0.3 + Math.max(0, Math.cos(ph + PI)) * 0.5, L);
      const sx = 14,
        sy = hy - 70;
      // back arm with hook chain
      limb3(sx - 10, sy + 6, sx + 6, sy + 40, sx + 24, sy + 60, 17, C("#6e6458"));
      ctx.strokeStyle = C("#3a3a3a");
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(sx + 24, sy + 60);
      ctx.quadraticCurveTo(sx + 30, sy + 100 + Math.sin(G.t * 3) * 6, sx + 20, sy + 125);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = C("#777");
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx + 24, sy + 132, 8, -0.5, PI);
      ctx.stroke();
      limb3(0, hy, lb[0], lb[1], lb[2], lb[3], 22, C("#2e2620"));
      limb(lb[2], lb[3], lb[2] + 16, lb[3] + 2, 14, "#151210");
      // body
      const bg = ctx.createRadialGradient(sx - 10, hy - 50, 10, sx, hy - 35, 70);
      bg.addColorStop(0, C("#a49787"));
      bg.addColorStop(1, C("#5f554a"));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(sx + 2, hy - 38, 48, 58, 0, 0, TAU);
      ctx.fill();
      // apron
      ctx.fillStyle = C("#b5a68d");
      ctx.beginPath();
      ctx.moveTo(sx - 26, hy - 75);
      ctx.lineTo(sx + 30, hy - 75);
      ctx.lineTo(sx + 44, hy + 20);
      ctx.lineTo(sx - 30, hy + 20);
      ctx.closePath();
      ctx.fill();
      if (!fl) {
        ell(sx + 10, hy - 30, 16, 22, "rgba(90,8,8,.75)");
        ell(sx - 10, hy + 5, 10, 7, "rgba(90,8,8,.7)");
        ell(sx + 25, hy - 60, 7, 10, "rgba(90,8,8,.6)");
      }
      ctx.strokeStyle = C("#6a5e50");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 26, hy - 75);
      ctx.lineTo(sx - 10, sy + 10);
      ctx.moveTo(sx + 30, hy - 75);
      ctx.lineTo(sx + 20, sy + 10);
      ctx.stroke();
      limb3(0, hy, lf[0], lf[1], lf[2], lf[3], 24, C("#3a3028"));
      limb(lf[2], lf[3], lf[2] + 17, lf[3] + 2, 15, "#181412");
      // shoulders/head (sack mask)
      ell(sx, sy + 8, 38, 18, C("#7d7264"));
      const Hx = sx + 16,
        Hy = sy - 14;
      ell(Hx, Hy, 19, 22, C("#8a7a5c"));
      ctx.strokeStyle = C("#4e4232");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Hx - 10, Hy + 12);
      ctx.lineTo(Hx + 14, Hy + 10);
      for (let i = 0; i < 6; i++) {
        ctx.moveTo(Hx - 8 + i * 4, Hy + 8);
        ctx.lineTo(Hx - 8 + i * 4, Hy + 15);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(Hx - 4, Hy - 14);
      ctx.lineTo(Hx + 3, Hy - 24);
      ctx.lineTo(Hx + 6, Hy - 14);
      ctx.fillStyle = C("#6e5e44");
      ctx.fill();
      const eyeC = b.warn ? "#ff2a1a" : "#ff7a3a";
      circ(Hx + 6, Hy - 4, 3.2, fl ? "#fff" : eyeC);
      circ(Hx + 15, Hy - 3, 2.6, fl ? "#fff" : eyeC);
      // cleaver arm
      const ang = -b.arm * 1.9 + 0.3;
      const shX = sx + 18,
        shY = sy + 4;
      const ex = shX + Math.cos(ang + 0.6) * 34,
        ey = shY + Math.sin(ang + 0.6) * 34;
      const hx2 = ex + Math.cos(ang) * 34,
        hy2 = ey + Math.sin(ang) * 34;
      limb3(shX, shY, ex, ey, hx2, hy2, 19, C("#857a6c"));
      ctx.save();
      ctx.translate(hx2, hy2);
      ctx.rotate(ang - PI / 2);
      ctx.fillStyle = "#2a1e16";
      ctx.fillRect(-4, -6, 8, 18);
      const cg = ctx.createLinearGradient(-20, 0, 20, 0);
      cg.addColorStop(0, C("#a8adb3"));
      cg.addColorStop(1, C("#555a60"));
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(34, 10);
      ctx.lineTo(38, 62);
      ctx.lineTo(-6, 70);
      ctx.closePath();
      ctx.fill();
      if (!fl) {
        ctx.fillStyle = "rgba(110,10,10,.8)";
        ctx.beginPath();
        ctx.moveTo(-6, 50);
        ctx.lineTo(10, 46);
        ctx.lineTo(20, 66);
        ctx.lineTo(-6, 70);
        ctx.fill();
      }
      circ(26, 20, 3, "#222");
      ctx.restore();
      b.eye = [-(Hx + 10), hy + 0 + (Hy - hy)];
      break;
    }
    case "mother": {
      const s = 1,
        bob = Math.sin(G.t * 2) * 4;
      const cy = -120 + bob + b.crouch * 20;
      // legs stumps
      for (const lx of [-40, -5, 30]) {
        limb3(lx, cy + 50, lx + 8 + Math.sin(ph + lx) * 6, cy + 85, lx + 4, 0, 18, C("#4d5a3a"));
      }
      // tentacles back
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = C("#5a6a40");
        ctx.lineWidth = 9 - i * 2;
        ctx.beginPath();
        const tx = -20 + i * 20,
          ty = cy - 30;
        ctx.moveTo(tx, ty);
        ctx.bezierCurveTo(
          tx + 60,
          ty - 40 + Math.sin(G.t * 2 + i) * 20,
          tx + 110,
          ty + 30,
          tx + 130 + Math.sin(G.t * 3 + i) * 15,
          ty + 60 + Math.cos(G.t * 2 + i) * 20,
        );
        ctx.stroke();
      }
      // sack body
      const g = ctx.createRadialGradient(-20, cy - 40, 20, 0, cy, 110);
      g.addColorStop(0, C("#9aa874"));
      g.addColorStop(0.6, C("#68774a"));
      g.addColorStop(1, C("#3c4729"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, cy, 92, 82, -0.15, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = fl ? "#fff" : "rgba(60,20,40,.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        const a = i * 0.9;
        ctx.moveTo(Math.cos(a) * 30, cy + Math.sin(a) * 30);
        ctx.quadraticCurveTo(
          Math.cos(a + 0.4) * 60,
          cy + Math.sin(a + 0.4) * 55,
          Math.cos(a + 0.2) * 85,
          cy + Math.sin(a + 0.2) * 72,
        );
        ctx.stroke();
      }
      for (let i = 0; i < 11; i++) {
        const a = i * 2.1,
          rr = 40 + ((i * 17) % 40),
          px = Math.cos(a) * rr,
          py = cy + Math.sin(a) * rr * 0.85;
        const pr = 5 + (i % 3) * 3 + Math.sin(G.t * 5 + i) * 1.5;
        circ(px, py, pr, fl ? "#fff" : "#5f7f1c");
        circ(px - 1, py - 1, pr * 0.6, fl ? "#fff" : "#c8ff4a");
      }
      // neck & head
      const nx = 70,
        ny = cy - 70;
      ctx.strokeStyle = C("#6c7a4e");
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(40, cy - 40);
      ctx.quadraticCurveTo(60, cy - 90, nx + 10, ny - 10);
      ctx.stroke();
      ctx.save();
      ctx.translate(nx + 18, ny - 12);
      ctx.rotate(0.25 - b.mouth * 0.3);
      ell(0, 0, 26, 19, C("#7f8c5c"));
      ctx.fillStyle = fl ? "#fff" : "#1a0808";
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(30, -4 - b.mouth * 10);
      ctx.lineTo(30, 10 + b.mouth * 12);
      ctx.closePath();
      ctx.fill();
      if (!fl) {
        ctx.fillStyle = "#d9d0b0";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(14 + i * 4, 0 - b.mouth * 3);
          ctx.lineTo(16 + i * 4, 5);
          ctx.lineTo(18 + i * 4, 0 - b.mouth * 3);
          ctx.fill();
        }
      }
      for (const [ex, ey] of [
        [4, -8],
        [12, -10],
        [-4, -6],
        [8, -14],
      ])
        circ(ex, ey, 2.4, fl ? "#fff" : "#ffe14a");
      ctx.restore();
      if (!fl && Math.random() < 0.3)
        part({
          x: b.x + BF * (nx + 40),
          y: b.y + ny,
          vx: rnd(-20, 20),
          vy: rnd(20, 80),
          g: 600,
          life: 0.6,
          s: 2.5,
          col: "#9ad12a",
          t: "blood",
          sf: 0,
        });
      b.eye = [-(nx + 26), ny - 20];
      break;
    }
    case "tank": {
      const s = 2.8,
        L = 22 * s;
      const sw1 = Math.sin(ph) * 0.25,
        sw2 = Math.sin(ph + PI) * 0.25;
      const hy = -L * 1.95 + b.crouch * 25;
      const lf = leg(0, hy, sw1, 0.35, L),
        lb = leg(0, hy, sw2, 0.35, L);
      const sx = 12,
        sy = hy - 95 + b.crouch * 10;
      const plates = Math.ceil((b.hp / b.max) * 6);
      limb3(0, hy, lb[0], lb[1], lb[2], lb[3], 30, C("#3a3632"));
      limb(lb[2], lb[3], lb[2] + 20, lb[3] + 2, 18, "#181614");
      // back fist
      const ang2 = -b.arm * 1.2;
      limb3(
        sx - 30,
        sy + 10,
        sx - 10 + Math.cos(ang2 + 1) * 40,
        sy + 60,
        sx + 20,
        sy + 90 + ang2 * 30,
        26,
        C("#5d544b"),
      );
      circ(sx + 20, sy + 92 + ang2 * 30, 20, C("#4a433c"));
      // torso
      ctx.fillStyle = C("#6c6258");
      ctx.beginPath();
      ctx.moveTo(-28, hy + 8);
      ctx.lineTo(-56, sy + 5);
      ctx.lineTo(sx + 64, sy - 5);
      ctx.lineTo(36, hy + 8);
      ctx.closePath();
      ctx.fill();
      const pc = ["#5b6067", "#4f545b", "#666b72"];
      const plts = [
        [-40, sy + 10, 40, 36],
        [4, sy + 2, 44, 34],
        [-30, sy + 48, 36, 30],
        [10, sy + 40, 36, 32],
        [-20, hy - 30, 46, 26],
        [30, sy + 20, 26, 40],
      ];
      for (let i = 0; i < plates; i++) {
        const [px, py, pw, ph2] = plts[i];
        ctx.fillStyle = C(pc[i % 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + pw, py + 3);
        ctx.lineTo(px + pw - 3, py + ph2);
        ctx.lineTo(px + 2, py + ph2 - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = fl ? "#fff" : "#9aa0a8";
        for (const [rx, ry] of [
          [4, 4],
          [pw - 6, 6],
          [pw - 7, ph2 - 5],
          [5, ph2 - 6],
        ])
          circ(px + rx, py + ry, 1.8, ctx.fillStyle);
      }
      // core
      const cyy = -b.bh * 0.56;
      const pulse = 0.7 + Math.sin(G.t * 6) * 0.3;
      circ(18, cyy, 13, fl ? "#fff" : "#3a1a0a");
      circ(18, cyy, 8, fl ? "#fff" : `rgba(255,${(140 + pulse * 60) | 0},40,1)`);
      limb3(0, hy, lf[0], lf[1], lf[2], lf[3], 32, C("#4a443e"));
      ctx.fillStyle = C("#5b6067");
      ctx.fillRect(lf[0] - 12, lf[1] - 14, 26, 22);
      limb(lf[2], lf[3], lf[2] + 22, lf[3] + 2, 19, "#1a1816");
      // head
      const Hx = sx + 30,
        Hy = sy - 14;
      ell(Hx, Hy, 20, 18, C("#5d554c"));
      ctx.fillStyle = C("#4a4f56");
      rrect(Hx - 12, Hy - 14, 30, 24, 4);
      ctx.fill();
      ctx.fillStyle = fl ? "#fff" : "#ff5a2a";
      ctx.fillRect(Hx - 2, Hy - 4, 18, 3);
      // front arm
      const ang = -b.arm * 1.6;
      const shX = sx + 50,
        shY = sy + 6;
      const ex = shX + Math.cos(ang + 1.1) * 42,
        ey = shY + Math.sin(ang + 1.1) * 42;
      const fx = ex + Math.cos(ang + 0.3) * 44,
        fy = ey + Math.sin(ang + 0.3) * 44;
      limb3(shX, shY, ex, ey, fx, fy, 30, C("#7a6f64"));
      circ(shX, shY, 22, C(plates > 3 ? "#5b6067" : "#6a5f55"));
      circ(fx, fy, 24, C("#5e554c"));
      ctx.fillStyle = C("#777d85");
      ctx.fillRect(fx - 8, fy - 24, 16, 10);
      b.eye = [-(Hx + 7), Hy - 2];
      break;
    }
    case "hound": {
      const cr = b.crouch,
        air = b.air;
      const by = -96 + cr * 24 + (air ? -6 : 0) - Math.abs(Math.sin(ph * 1.6)) * 4;
      const hipX = -64,
        chX = 46;
      const sk = C("#7a2a24"),
        skD = C("#4a1612"),
        bone = C("#d6c7b0"),
        L = 46;
      const gait = (off, front) => {
        if (air) return front ? [1.1, 0.4] : [-1.1, -0.3];
        const a = ph * 1.6 + off;
        return front
          ? [Math.sin(a) * 0.6, Math.max(0, Math.cos(a)) * 0.9 + 0.15]
          : [Math.sin(a) * 0.6, -(Math.max(0, Math.cos(a)) * 0.9 + 0.25)];
      };
      const drawLeg = (x, off, front, col, w) => {
        const [sw, bd] = gait(off, front);
        const l = leg(x, by + 10, sw, bd, L);
        limb3(x, by + 10, l[0], l[1], l[2], l[3], w, col);
        limb(l[2], l[3], l[2] + 10, l[3] + 1, w * 0.8, C("#2a1210"));
      };
      drawLeg(hipX + 8, PI * 0.5, false, skD, 15);
      drawLeg(chX + 8, PI * 1.5, true, skD, 13);
      ctx.strokeStyle = sk;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(hipX - 20, by - 6);
      ctx.quadraticCurveTo(hipX - 70, by - 30 + Math.sin(G.t * 4) * 10, hipX - 95, by + 10);
      ctx.stroke();
      const g = ctx.createRadialGradient(-10, by - 20, 10, -8, by, 80);
      g.addColorStop(0, C("#9a3a32"));
      g.addColorStop(1, C("#521a16"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(-8, by, 76, 32, -0.06, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = bone;
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const rx = 6 + i * 9;
        ctx.arc(rx, by - 6, 24 - i * 1.5, PI * 0.2, PI * 0.85);
        ctx.stroke();
      }
      ctx.fillStyle = bone;
      for (let i = 0; i < 7; i++) {
        const px = hipX + i * 17;
        ctx.beginPath();
        ctx.moveTo(px - 5, by - 28);
        ctx.lineTo(px - 10, by - 46 - (i % 2) * 8);
        ctx.lineTo(px + 5, by - 30);
        ctx.fill();
      }
      drawLeg(hipX, 0, false, sk, 17);
      drawLeg(chX, PI, true, sk, 15);
      ctx.strokeStyle = sk;
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(chX, by - 8);
      ctx.lineTo(chX + 30, by - 22);
      ctx.stroke();
      const jaw = Math.max(b.arm * 0.8, b.mouth, b.sub === "rush" ? 0.6 : 0, 0.15);
      ctx.save();
      ctx.translate(chX + 42, by - 26);
      ell(6, 0, 26, 15, C("#6a2420"));
      ctx.fillStyle = C("#5a1c18");
      ctx.beginPath();
      ctx.moveTo(14, -6);
      ctx.lineTo(46, 0);
      ctx.lineTo(16, 8);
      ctx.fill();
      ctx.save();
      ctx.translate(14, 6);
      ctx.rotate(jaw * 0.6);
      ctx.fillStyle = C("#4e1814");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, 4);
      ctx.lineTo(2, 10);
      ctx.fill();
      ctx.fillStyle = bone;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(6 + i * 5, 2);
        ctx.lineTo(8 + i * 5, -4);
        ctx.lineTo(10 + i * 5, 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = bone;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(18 + i * 5, 3);
        ctx.lineTo(20 + i * 5, 9);
        ctx.lineTo(22 + i * 5, 3);
        ctx.fill();
      }
      ctx.fillStyle = C("#3a100c");
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-14, -30);
      ctx.lineTo(4, -12);
      ctx.fill();
      circ(16, -5, 3.2, fl ? "#fff" : "#ff3a2a");
      ctx.restore();
      b.eye = [-(chX + 58), by - 31];
      break;
    }
    case "spider": {
      const cr = b.crouch;
      const by = -80 + cr * 22 + (b.air ? -8 : 0);
      const thx = 24,
        thy = by + 2;
      const sk = C("#2c2329"),
        skD = C("#1a1418"),
        bone = C("#d8cfc0");
      const legs = (far) => {
        for (let i = 0; i < 4; i++) {
          const hx = thx - 16 + i * 11,
            hy = thy + (far ? -4 : 4);
          const a = ph * 1.9 + (i * PI) / 2 + (far ? PI : 0);
          const fx = thx + (-130 + i * 78) * (far ? 0.9 : 1) + Math.sin(a) * 16,
            fy = -Math.max(0, Math.cos(a)) * 12;
          const kx = (hx + fx) / 2 + (i < 2 ? -14 : 14),
            ky = Math.min(hy, fy) - 58 - (3 - Math.abs(i - 1.5)) * 6 + cr * 16;
          limb3(hx, hy, kx, ky, fx, fy, far ? 7 : 9, far ? skD : sk);
          ctx.fillStyle = far ? skD : bone;
          ctx.beginPath();
          ctx.arc(kx, ky, far ? 3 : 4, 0, TAU);
          ctx.fill();
        }
      };
      legs(true);
      const g = ctx.createRadialGradient(-60, by - 30, 8, -55, by - 12, 72);
      g.addColorStop(0, C("#4a3a44"));
      g.addColorStop(1, C("#1a1418"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(-58, by - 14, 68, 48, -0.15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = fl ? "#fff" : `rgba(${b.eyeCol},.85)`;
      ctx.beginPath();
      ctx.moveTo(-70, by - 38);
      ctx.lineTo(-52, by - 14);
      ctx.lineTo(-70, by + 10);
      ctx.lineTo(-62, by - 14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-44, by - 36);
      ctx.lineTo(-56, by - 14);
      ctx.lineTo(-44, by + 8);
      ctx.lineTo(-50, by - 14);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 6; i++) circ(-90 + i * 12, by - 46 + Math.abs(i - 2.5) * 4, 2.4, C("#6a5a64"));
      ell(thx, thy, 36, 26, sk);
      ctx.strokeStyle = C("#3e333a");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(thx, thy, 20, PI * 1.1, PI * 1.9);
      ctx.stroke();
      legs(false);
      const Hx = thx + 36,
        Hy = thy - 8;
      ell(Hx, Hy, 17, 15, C("#b8ad9e"));
      ctx.fillStyle = fl ? "#fff" : "#140a0c";
      ctx.fillRect(Hx + 2, Hy + 4, 13, 3 + b.mouth * 5);
      for (const [ex, ey] of [
        [6, -6],
        [12, -4],
        [2, -9],
        [9, -11],
        [14, -8],
        [-2, -4],
      ])
        circ(Hx + ex, Hy + ey, 2.1, fl ? "#fff" : `rgb(${b.eyeCol})`);
      const m = b.mouth * 0.5 + Math.sin(G.t * 8) * 0.05;
      for (const sgn of [-1, 1]) {
        ctx.save();
        ctx.translate(Hx + 12, Hy + 10);
        ctx.rotate(sgn * (0.3 + m));
        ctx.fillStyle = bone;
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.quadraticCurveTo(14, 2 * sgn, 10, 16 * sgn > 0 ? 16 : 12);
        ctx.lineTo(4, 2);
        ctx.fill();
        ctx.restore();
      }
      b.eye = [-(Hx + 8), Hy - 7];
      break;
    }
    case "reaper": {
      const s = 2.3,
        L = 24 * s;
      const cr = b.crouch;
      const hy = -L * 1.75 + cr * 35;
      const air = b.air;
      const sw1 = air ? 0.9 : Math.sin(ph) * 0.3,
        sw2 = air ? -0.5 : Math.sin(ph + PI) * 0.3;
      const lf = leg(0, hy, sw1, air ? 1.6 : 0.5 + cr * 1.1, L),
        lb = leg(0, hy, sw2, air ? 0.9 : 0.5 + cr * 1.1, L);
      const sx = 22 + cr * 12,
        sy = hy - 62 + cr * 12;
      const sk = C("#4b3f50"),
        skD = C("#322a36"),
        bone = C("#d8cfc0");
      limb3(0, hy, lb[0], lb[1], lb[2], lb[3], 11, skD);
      // back blade arm
      const ab = -b.arm;
      limb3(sx - 6, sy + 4, sx + 10, sy + 38, sx + 34 + ab * 20, sy + 40, 8, skD);
      ctx.fillStyle = C("#b8ae9e");
      ctx.beginPath();
      ctx.moveTo(sx + 34 + ab * 20, sy + 40);
      ctx.lineTo(sx + 96 + ab * 30, sy + 26 - ab * 30);
      ctx.lineTo(sx + 38 + ab * 20, sy + 48);
      ctx.fill();
      // torso + spine spikes
      limb(0, hy, sx, sy, 18, sk);
      for (let i = 0; i < 6; i++) {
        const t = i / 5,
          px = lerp(-4, sx - 8, t),
          py = lerp(hy, sy, t);
        ctx.fillStyle = bone;
        ctx.beginPath();
        ctx.moveTo(px - 4, py);
        ctx.lineTo(px - 18 - i * 2, py - 14 - i * 3);
        ctx.lineTo(px + 4, py - 4);
        ctx.fill();
      }
      ctx.strokeStyle = fl ? "#fff" : "rgba(20,10,20,.7)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const t = 0.3 + i * 0.14;
        ctx.moveTo(lerp(0, sx, t) + 3, lerp(hy, sy, t));
        ctx.lineTo(lerp(0, sx, t) + 11, lerp(hy, sy, t) + 3);
        ctx.stroke();
      }
      limb3(0, hy, lf[0], lf[1], lf[2], lf[3], 12, sk);
      // head skull
      const Hx = sx + 16,
        Hy = sy - 10;
      ctx.save();
      ctx.translate(Hx, Hy);
      ctx.rotate(0.3);
      ell(0, 0, 13, 10, bone);
      ctx.fillStyle = fl ? "#fff" : "#1a0c10";
      ctx.fillRect(4, 4, 12, 4);
      ctx.fillStyle = bone;
      for (let i = 0; i < 4; i++) ctx.fillRect(5 + i * 3, 3, 1.5, 6);
      ctx.fillStyle = bone;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-26, -18);
      ctx.lineTo(-4, -10);
      ctx.fill();
      circ(5, -2, 3, fl ? "#fff" : "#ff2a2a");
      ctx.restore();
      // front blade arm
      const af = -b.arm;
      const ex = sx + 16,
        ey = sy + 28;
      const hx3 = sx + 36 + af * 10,
        hy3 = sy + 30 + af * 16;
      limb3(sx + 2, sy + 3, ex, ey, hx3, hy3, 9, sk);
      ctx.fillStyle = bone;
      ctx.beginPath();
      ctx.moveTo(hx3, hy3 - 3);
      ctx.lineTo(hx3 + 80 + af * 20, hy3 - 30 - af * 40);
      ctx.lineTo(hx3 + 6, hy3 + 7);
      ctx.closePath();
      ctx.fill();
      b.eye = [-(Hx + 6), Hy];
      break;
    }
  }
  ctx.restore();
  if (!fl && b.eye) {
    glow(
      b.x - BF * b.eye[0] * sc,
      b.y + b.eye[1] * sc,
      (b.warn ? 42 : 26) * sc,
      b.eyeCol,
      b.warn ? 0.7 : 0.4,
    );
  }
  if (b.id === "tank" && !fl)
    glow(b.x - BF * 18 * sc, b.y - b.h * 0.56, 50 * sc, "255,150,40", 0.45 + Math.sin(G.t * 6) * 0.15);
  if (b.id === "mother" && !fl)
    glow(b.x, b.y - 120 * sc, 140 * sc, b.eyeCol === "200,255,70" ? "150,255,60" : b.eyeCol, 0.1);
  if (b.id === "spider" && !fl) glow(b.x - BF * 55 * sc, b.y - 95 * sc, 70 * sc, b.eyeCol, 0.14);
}
