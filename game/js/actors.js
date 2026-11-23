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
/** Segmento cónico (cápsula) de grosor w1 a w2: extremidades con volumen. */
function seg(x1, y1, x2, y2, w1, w2, c) {
  const dx = x2 - x1,
    dy = y2 - y1,
    l = Math.hypot(dx, dy) || 0.001,
    nx = -dy / l,
    ny = dx / l,
    an = Math.atan2(ny, nx);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x1 + (nx * w1) / 2, y1 + (ny * w1) / 2);
  ctx.lineTo(x2 + (nx * w2) / 2, y2 + (ny * w2) / 2);
  ctx.arc(x2, y2, w2 / 2, an, an + PI, true);
  ctx.lineTo(x1 - (nx * w1) / 2, y1 - (ny * w1) / 2);
  ctx.arc(x1, y1, w1 / 2, an + PI, an, true);
  ctx.fill();
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

/* ================== PERSONAJES ==================
 * Rediseño: las extremidades dejan de ser trazos planos de grosor constante y pasan a ser
 * segmentos cónicos con volumen (muslo > tobillo, brazo > muñeca); torsos como formas con
 * hombros, pecho y cintura; cabezas con cráneo + mandíbula. Todo se compone después con
 * contorno, sombreado y rim light (ver fx.js), de modo que la silueta se lee en cualquier fondo.
 */
function drawPlayer() {
  const p = P,
    hgt = GROUND - p.y;
  // sombra de contacto (en la escena, no en el personaje)
  ctx.fillStyle = `rgba(0,0,0,${0.55 * clamp(1 - hgt / 220, 0.15, 1)})`;
  ctx.beginPath();
  ctx.ellipse(p.x, GROUND + 2, 26 * (1 - hgt / 450), 5.5, 0, 0, TAU);
  ctx.fill();
  const blink = p.inv > 0 && !p.dead && ((G.t * 18) | 0) % 2;
  // caja ajustada al cuerpo: el coste del compositor es proporcional a su área
  const hw = p.dead ? 135 : 96;
  drawActor(p.x - hw, p.y - 128, hw * 2, 142, playerBody, { alpha: blink ? 0.4 : 1 });
}
const PC = {
  pants: "#323a44",
  pantsD: "#222830",
  knee: "#171b20",
  boot: "#17120f",
  bootL: "#3a302a",
  jk: "#5d6a42",
  jkD: "#3e4730",
  jkL: "#83915e",
  vest: "#262b2d",
  vestL: "#40484a",
  strap: "#1c1712",
  glove: "#201d1a",
  helm: "#465039",
  helmL: "#6c7a54",
  mask: "#16181b",
  scarf: "#c42a1f",
  scarfD: "#7f1912",
  pack: "#54452f",
  packD: "#3a2f20",
};
function boot(x, y, dir, col, colL) {
  // bota con puntera y talón (antes: un trazo)
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 5);
  ctx.lineTo(x + 3, y - 5);
  ctx.quadraticCurveTo(x + 10 * dir, y - 4, x + 11 * dir, y + 1);
  ctx.lineTo(x - 5, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colL;
  ctx.fillRect(x - 5, y, 16, 2);
}
function playerBody() {
  const p = P;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale((p.face || 1) * CH, CH);
  if (p.dead) ctx.rotate(-Math.min(1, p.dead * 2.5) * 1.45);
  const L = 23,
    ph = p.phase;
  let lf,
    lb,
    hx = 0,
    hy,
    sx,
    sy,
    lean = 0;
  if (p.slide > 0 && !p.dead) {
    lf = [1.5, 0.1];
    lb = [1.15, 1.5];
    hy = -18;
    hx = -2;
    sx = -12;
    sy = -45;
  } else if (!p.ground || p.dead) {
    if (p.dead) {
      lf = [0.75, 1.35];
      lb = [-0.35, 0.75];
    } else if (p.jumps === 2) {
      // doble salto: rodillas recogidas
      lf = [1.35, 2.3];
      lb = [0.7, 2.1];
    } else if (p.vy < 0) {
      lf = [0.95, 1.6];
      lb = [-0.3, 0.8];
    } else {
      // caída: piernas se estiran para aterrizar
      lf = [0.45, 0.75];
      lb = [-0.4, 0.45];
    }
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
    lean = 2;
    sx = 8;
    sy = hy - 29 + Math.abs(Math.sin(ph)) * 1.2;
  }
  // aterrizaje: compresión breve
  if (p.land > 0 && !p.dead) {
    const k = p.land / 0.14;
    hy += 5 * k;
    sy += 7 * k;
  }
  p.hipY = hy;
  const legF = leg(hx, hy, lf[0], lf[1], L),
    legB = leg(hx, hy, lb[0], lb[1], L);
  const gp = { x: sx + 14 - p.recoil * 5, y: sy + 9 };
  if (p.cur === "rocket") {
    gp.x = sx + 2 - p.recoil * 5;
    gp.y = sy - 2;
  }
  const a = p.aim;
  const g2 = p.cur === "pistol" ? 3 : 13;
  const grip2 = { x: gp.x + Math.cos(a) * g2, y: gp.y + Math.sin(a) * g2 + 1 };
  const Hx = sx + 4 + lean,
    Hy = sy - 13;
  // ---- bufanda (detrás de todo): ondea según la velocidad ----
  const spd = G.arena ? Math.abs(K.right - K.left) * 0.8 + 0.2 : clamp(G.speed / 330, 0.2, 1.4);
  ctx.fillStyle = PC.scarfD;
  ctx.beginPath();
  const bx0 = Hx - 5,
    by0 = Hy + 9;
  ctx.moveTo(bx0, by0 - 3);
  const pts = [];
  for (let i = 1; i <= 5; i++) {
    const t = i / 5;
    pts.push([
      bx0 - t * (14 + 12 * spd),
      by0 + t * (4 + 10 * (1.4 - spd)) + Math.sin(G.t * 13 - i * 1.3) * (1 + t * 3.5) * spd,
    ]);
  }
  for (const q of pts) ctx.lineTo(q[0], q[1] - 2.6 * (1 - 0.15));
  for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 2.6 * (1 - i / 6));
  ctx.lineTo(bx0, by0 + 3);
  ctx.fill();
  // ---- brazo trasero ----
  const ebx = (sx + grip2.x) / 2 - 2,
    eby = (sy + grip2.y) / 2 + 8;
  seg(sx - 2, sy + 2, ebx, eby, 7, 6, PC.jkD);
  seg(ebx, eby, grip2.x, grip2.y, 6, 5, PC.jkD);
  circ(grip2.x, grip2.y, 3.2, PC.glove);
  // ---- pierna trasera ----
  seg(hx, hy, legB[0], legB[1], 10.5, 8.5, PC.pantsD);
  seg(legB[0], legB[1], legB[2], legB[3] - 2, 8.5, 6.5, PC.pantsD);
  boot(legB[2], legB[3] - 1, 1, PC.boot, "#0d0a09");
  // ---- mochila ----
  ctx.save();
  const bx = lerp(hx, sx, 0.55) - 10,
    by = lerp(hy, sy, 0.55);
  ctx.translate(bx, by);
  ctx.rotate(Math.atan2(sx - hx, -(sy - hy)) * 0.9);
  ctx.fillStyle = PC.packD;
  rrect(-8, -14, 15, 28, 4);
  ctx.fill();
  ctx.fillStyle = PC.pack;
  rrect(-8, -14, 11, 26, 4);
  ctx.fill();
  ctx.fillStyle = PC.strap;
  ctx.fillRect(-8, -5, 15, 2.4);
  ctx.fillRect(-8, 4, 15, 2.4);
  ell(-1, -16, 9, 4.8, "#5e5a45"); // saco de dormir
  ctx.strokeStyle = PC.strap;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-5, -20);
  ctx.lineTo(-5, -12);
  ctx.moveTo(3, -20);
  ctx.lineTo(3, -12);
  ctx.stroke();
  ctx.restore();
  // ---- torso: chaqueta con hombros, pecho y cintura ----
  const ux = sx - hx,
    uy = sy - hy,
    ul = Math.hypot(ux, uy) || 1;
  const nx = -uy / ul,
    ny = ux / ul; // normal hacia delante
  const P2 = (t, o) => [lerp(hx, sx, t) + nx * o, lerp(hy, sy, t) + ny * o];
  const poly = (arr, col) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(arr[0][0], arr[0][1]);
    for (let i = 1; i < arr.length; i++) ctx.lineTo(arr[i][0], arr[i][1]);
    ctx.closePath();
    ctx.fill();
  };
  poly([P2(-0.05, -7.5), P2(0.55, -8.5), P2(1.02, -9), P2(1.08, 4), P2(0.95, 10), P2(0.6, 10.5), P2(0.2, 8), P2(-0.05, 7)], PC.jk);
  // chaleco táctico
  poly([P2(0.22, -7.5), P2(0.95, -8), P2(0.98, 3), P2(0.85, 10.8), P2(0.25, 9)], PC.vest);
  poly([P2(0.3, 4), P2(0.85, 4.5), P2(0.82, 10.6), P2(0.3, 9.2)], PC.vestL);
  // portacargadores
  for (let i = 0; i < 2; i++) {
    const q = P2(0.38 + i * 0.2, 9.5);
    ctx.fillStyle = "#1b1f20";
    ctx.save();
    ctx.translate(q[0], q[1]);
    ctx.rotate(Math.atan2(ny, nx));
    rrect(-1.5, -3.5, 5, 7, 1.5);
    ctx.fill();
    ctx.restore();
  }
  // cinturón
  const b1 = P2(0.04, -8),
    b2 = P2(0.04, 8);
  ctx.strokeStyle = PC.strap;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(b1[0], b1[1]);
  ctx.lineTo(b2[0], b2[1]);
  ctx.stroke();
  const bk = P2(0.04, 5);
  ctx.fillStyle = "#8c8066";
  ctx.fillRect(bk[0] - 1.6, bk[1] - 1.8, 3.2, 3.6);
  // ---- pierna delantera ----
  seg(hx, hy, legF[0], legF[1], 11.5, 9, PC.pants);
  seg(legF[0], legF[1], legF[2], legF[3] - 2, 9, 7, PC.pants);
  ell(legF[0] + 1.5, legF[1] + 1, 5, 4.2, PC.knee, Math.atan2(legF[1] - hy, legF[0] - hx));
  boot(legF[2], legF[3] - 1, 1, PC.boot, "#0d0a09");
  // ---- cabeza: casco, máscara con visor y filtro ----
  seg(sx + 1, sy + 2, Hx, Hy + 6, 7, 6, PC.mask);
  ell(Hx - 1, Hy + 9, 8, 4, PC.scarf, -0.2); // bufanda al cuello
  circ(Hx, Hy, 10, PC.mask);
  ctx.fillStyle = PC.helm;
  ctx.beginPath();
  ctx.arc(Hx - 0.5, Hy - 0.5, 11, PI * 0.95, PI * 2.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PC.helmL;
  ctx.beginPath();
  ctx.arc(Hx - 1, Hy - 1, 9.4, PI * 1.15, PI * 1.6);
  ctx.lineTo(Hx - 1, Hy - 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2e3527";
  ctx.fillRect(Hx - 11, Hy - 1.2, 23, 2.6); // ala del casco
  // visor
  ctx.fillStyle = "#0b0d10";
  rrect(Hx + 1.5, Hy + 1.2, 10, 5, 2.2);
  ctx.fill();
  ctx.fillStyle = "#8ff0ff";
  rrect(Hx + 3, Hy + 2.2, 7.5, 2.4, 1.2);
  ctx.fill();
  glow(Hx + 7, Hy + 3.4, 10, "111,227,255", 0.6);
  // filtro respirador
  circ(Hx + 8.5, Hy + 9, 3.6, "#3c3f43");
  circ(Hx + 9.2, Hy + 9, 1.6, "#1d1e21");
  // ---- arma ----
  ctx.save();
  ctx.translate(gp.x, gp.y);
  ctx.rotate(a);
  drawGun(ctx, p.cur);
  ctx.restore();
  // ---- brazo delantero con hombrera ----
  const efx = (sx + gp.x) / 2 - 3,
    efy = (sy + gp.y) / 2 + 7;
  seg(sx + 1, sy + 2, efx, efy, 8.5, 7, PC.jk);
  seg(efx, efy, gp.x + 1, gp.y + 2, 7, 6, PC.jk);
  ell(sx + 2, sy + 1, 6.2, 5, PC.jkL, -0.3);
  circ(gp.x + 1, gp.y + 2, 3.6, PC.glove);
  if (p.cur === "flamer") glow(gp.x + Math.cos(a) * 35, gp.y + Math.sin(a) * 35 - 2, 8, "80,150,255", 0.6);
  ctx.restore();
}

function drawZombie(z) {
  if (!z.dead) shadow(z.x, z.w * 0.65, 0.42);
  let alpha = 1;
  if (z.dead > 1.1) alpha = Math.max(0, 1 - (z.dead - 1.1) / 0.7);
  if (alpha <= 0) return;
  const hw = z.dead ? z.h + 24 : 52 * z.s + 10,
    top = z.h * 1.12 + 24;
  drawActor(z.x - hw, GROUND - z.yo - top, hw * 2, top + 12, () => zombieBody(z), {
    alpha,
    rim: z.flash > 0 ? 0 : undefined,
  });
}
/** Mano en garra: tres dedos cortos (lectura de amenaza a distancia). */
function claw(x, y, ang, s, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8 * s;
  ctx.beginPath();
  for (let i = -1; i <= 1; i++) {
    const a2 = ang + i * 0.45;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a2) * 5 * s, y + Math.sin(a2) * 5 * s);
  }
  ctx.stroke();
  circ(x, y, 2.6 * s, col);
}
function zombieBody(z) {
  const s = z.s;
  const fl = z.flash > 0;
  const C = (c) => (fl ? "#efe8de" : c);
  ctx.save();
  ctx.translate(z.x, GROUND - z.yo);
  const FS = z.fd === 1 ? 1 : -1;
  ctx.scale(FS, 1);
  if (z.dead) {
    const f = Math.min(1, z.dead * 2.6);
    ctx.rotate(-f * (z.type === "crawler" ? 0.2 : 1.42));
  }
  const skin = C(z.skin),
    skinD = C(shade(z.skin, -0.28)),
    skinL = C(shade(z.skin, 0.18)),
    cl = C(z.cloth),
    clD = C(shade(z.cloth, -0.32)),
    blood = fl ? "#efe8de" : "#4a0707",
    eye = fl ? "#fff" : z.type === "runner" ? "#ff4a3a" : "#ffd34d";
  const L = 22 * s,
    ph = z.ph;
  if (z.type === "crawler") {
    const hx = -18 * s,
      hy = -9 * s,
      sx = 10 * s,
      sy = -14 * s;
    // muñones de las piernas arrastrándose
    seg(hx, hy, hx - 16 * s, hy + 3 * s, 9 * s, 7 * s, clD);
    seg(hx - 16 * s, hy + 3 * s, hx - 30 * s, -3 * s, 7 * s, 5 * s, clD);
    seg(hx, hy, hx - 18 * s, hy + 1 * s, 9 * s, 7 * s, cl);
    seg(hx - 18 * s, hy + 1 * s, hx - 33 * s, -6 * s, 7 * s, 5 * s, cl);
    seg(hx, hy, sx, sy, 12 * s, 15 * s, cl);
    seg(hx + 6 * s, hy - 4 * s, sx - 4 * s, sy - 4 * s, 3 * s, 3 * s, blood);
    const r1 = Math.sin(ph),
      r2 = Math.sin(ph + PI);
    const e1x = sx + 10 * s + r1 * 5 * s,
      e1y = sy - 8 * s;
    seg(sx, sy, e1x, e1y, 6 * s, 5 * s, skinD);
    seg(e1x, e1y, sx + 20 * s + r1 * 8 * s, -2 * s, 5 * s, 4 * s, skinD);
    claw(sx + 20 * s + r1 * 8 * s, -2 * s, 0.4, s, skinD);
    // cabeza
    circ(sx + 10 * s, sy - 4 * s, 8.5 * s, skin);
    ell(sx + 14 * s, sy + 1.5 * s, 5 * s, 3.4 * s, skinD);
    ctx.fillStyle = fl ? "#fff" : "#1d0606";
    ctx.fillRect(sx + 12 * s, sy + 1 * s, 6 * s, 2.2 * s);
    ell(sx + 13 * s, sy - 6 * s, 2.6 * s, 2.2 * s, fl ? "#fff" : "#1a0d0d");
    circ(sx + 13.5 * s, sy - 6 * s, 1.5 * s, eye);
    glow(sx + 13.5 * s, sy - 6 * s, 7, "255,200,60", fl || z.dead ? 0 : 0.35);
    const e2x = sx + 12 * s + r2 * 5 * s,
      e2y = sy - 6 * s;
    seg(sx, sy, e2x, e2y, 6.5 * s, 5.5 * s, skin);
    seg(e2x, e2y, sx + 22 * s + r2 * 8 * s, -2 * s, 5.5 * s, 4.5 * s, skin);
    claw(sx + 22 * s + r2 * 8 * s, -2 * s, 0.4, s, skin);
    ctx.restore();
    return;
  }
  const big = z.type === "bloater";
  const run = z.type === "runner";
  const arm = z.type === "armored";
  const amp = run ? 0.8 : 0.5;
  const sw1 = Math.sin(ph) * amp,
    b1 = Math.max(0, Math.cos(ph)) * (run ? 1.4 : 0.9) + 0.2;
  const sw2 = Math.sin(ph + PI) * amp * 0.8,
    b2 = Math.max(0, Math.cos(ph + PI)) * (run ? 1.4 : 0.7) + 0.2;
  const ext = (a, b) => L * (Math.cos(a) + Math.cos(a - b));
  const hx = 0,
    hy = z.dead ? -L * 1.9 : -Math.max(ext(sw1, b1), ext(sw2, b2)) + 1;
  // balanceo de cuerpo pesado al andar (cojera)
  const sway = run ? 0 : Math.sin(ph) * 2.2 * s;
  const lean = (run ? 18 : 12) * s + z.lean * 10 + sway;
  const sx = lean,
    sy = hy - 27 * s * (big ? 1.05 : 1) + Math.abs(Math.cos(ph)) * 1.5 * s;
  const lf = leg(hx, hy, sw1, b1, L),
    lb = leg(hx, hy, sw2, b2, L);
  const lw = (run ? 8 : 9.5) * s * (big ? 1.25 : 1);
  const reach = z.spit > 0 ? -0.5 : 1;
  const a1 = Math.sin(ph * 0.5) * 4 * s;
  // ---- brazo trasero ----
  {
    const ex = sx + 10 * s,
      ey = sy + 10 * s + a1,
      wx = sx + 24 * s * reach,
      wy = sy + 6 * s + a1;
    seg(sx - 2 * s, sy + 2 * s, ex, ey, lw * 0.78, lw * 0.62, skinD);
    seg(ex, ey, wx, wy, lw * 0.62, lw * 0.5, skinD);
    claw(wx, wy, -0.1, s, skinD);
  }
  // ---- pierna trasera ----
  seg(hx, hy, lb[0], lb[1], lw * 1.1, lw * 0.85, clD);
  seg(lb[0], lb[1], lb[2], lb[3] - 2, lw * 0.85, lw * 0.6, clD);
  boot(lb[2], lb[3] - 1, 1, "#151314", "#0c0b0b");
  // ---- torso: camisa rasgada ----
  const ux = sx - hx,
    uy = sy - hy,
    ul = Math.hypot(ux, uy) || 1,
    nx = -uy / ul,
    ny = ux / ul;
  const W = (run ? 6.5 : 7.5) * s * (big ? 1.4 : 1);
  const P2 = (t, o) => [lerp(hx, sx, t) + nx * o, lerp(hy, sy, t) + ny * o];
  const pts = [P2(-0.05, -W), P2(0.6, -W * 1.05), P2(1.02, -W * 1.1), P2(1.06, W * 0.6), P2(0.9, W * 1.25), P2(0.45, W * 1.15)];
  // bajo deshilachado
  for (let i = 4; i >= 0; i--) pts.push(P2(i % 2 ? -0.12 : -0.02, -W + (W * 2 * i) / 4));
  ctx.fillStyle = arm ? C("#252b33") : cl;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const q of pts) ctx.lineTo(q[0], q[1]);
  ctx.closePath();
  ctx.fill();
  if (arm) {
    // chaleco antidisturbios con placas
    ctx.fillStyle = C("#3a4552");
    for (let i = 0; i < 3; i++) {
      const q = P2(0.25 + i * 0.25, 0);
      ctx.save();
      ctx.translate(q[0], q[1]);
      ctx.rotate(Math.atan2(uy, ux) + PI / 2);
      rrect(-W * 0.9, -4 * s, W * 1.9, 7 * s, 2 * s);
      ctx.fill();
      ctx.restore();
    }
    const q = P2(0.6, W * 0.4);
    ctx.fillStyle = C("#c8b04a");
    ctx.font = `700 ${5 * s}px Rajdhani,sans-serif`;
    ctx.save();
    ctx.translate(q[0], q[1]);
    ctx.rotate(Math.atan2(uy, ux) + PI / 2);
    ctx.fillText("POLICÍA", -W * 0.8, 1.6 * s);
    ctx.restore();
  } else {
    // costillas expuestas por la herida
    const q = P2(0.55, W * 0.45);
    ell(q[0], q[1], 3.8 * s, 6.4 * s, skinD, Math.atan2(uy, ux));
    ctx.strokeStyle = fl ? "#fff" : "rgba(220,200,180,.55)";
    ctx.lineWidth = 1.2 * s;
    for (let i = 0; i < 3; i++) {
      const r = P2(0.45 + i * 0.1, W * 0.25),
        r2 = P2(0.45 + i * 0.1, W * 0.75);
      ctx.beginPath();
      ctx.moveTo(r[0], r[1]);
      ctx.lineTo(r2[0], r2[1]);
      ctx.stroke();
    }
    const bl = P2(0.28, -W * 0.3);
    ell(bl[0], bl[1], 4.5 * s, 3.2 * s, blood);
    const bl2 = P2(0.85, W * 0.6);
    ell(bl2[0], bl2[1], 3 * s, 4 * s, blood);
  }
  if (big) {
    const bx = lerp(hx, sx, 0.5) + 9 * s,
      by = lerp(hy, sy, 0.5) + 4 * s;
    const pulse = 1 + Math.sin(G.t * 6 + z.ph) * 0.04;
    ell(bx, by, 21 * s * pulse, 23 * s * pulse, C("#6f7d4a"));
    ell(bx - 5 * s, by - 6 * s, 12 * s * pulse, 12 * s * pulse, C("#93a06a"));
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + 0.4,
        px = bx + Math.cos(a) * 14 * s,
        py = by + Math.sin(a) * 15 * s;
      circ(px, py, (2.5 + (i % 2)) * s, fl ? "#fff" : "#c6ff4d");
    }
    glow(bx, by, 40 * s, "160,255,60", fl || z.dead ? 0 : 0.12);
  }
  // ---- pierna delantera ----
  seg(hx, hy, lf[0], lf[1], lw * 1.15, lw * 0.9, cl);
  seg(lf[0], lf[1], lf[2], lf[3] - 2, lw * 0.9, lw * 0.62, cl);
  if (!arm) ell(lf[0] + 1 * s, lf[1] + 2 * s, 3 * s, 2.2 * s, skinD); // rodilla asomando por el roto
  boot(lf[2], lf[3] - 1, 1, "#1a1718", "#0c0b0b");
  // ---- cabeza: cráneo + mandíbula colgante ----
  const tilt = z.spit > 0 ? -0.5 : 0.15 + Math.sin(ph * 0.5) * 0.06;
  const Hx = sx + 8 * s,
    Hy = sy - 8 * s;
  seg(sx, sy + 1 * s, Hx - 2 * s, Hy + 4 * s, 6 * s, 5 * s, skinD); // cuello
  ctx.save();
  ctx.translate(Hx, Hy);
  ctx.rotate(tilt);
  if (z.type === "spitter") {
    ell(-1 * s, 9 * s, 9 * s, 8 * s, fl ? "#fff" : "rgba(140,190,50,.95)");
    circ(2 * s, 10 * s, 3 * s, fl ? "#fff" : "#d6ff6a");
    circ(-4 * s, 12 * s, 2 * s, fl ? "#fff" : "#d6ff6a");
  }
  circ(0, 0, 9 * s, skin);
  ell(-2 * s, -3 * s, 5 * s, 4 * s, skinL); // frente iluminada
  // mandíbula
  const jaw = z.spit > 0 ? 4 : 2 + Math.max(0, Math.sin(ph * 0.7)) * 1.5;
  ctx.fillStyle = skinD;
  ctx.beginPath();
  ctx.moveTo(-2 * s, 4 * s);
  ctx.lineTo(9 * s, 3.5 * s);
  ctx.lineTo(8 * s, (6 + jaw) * s);
  ctx.lineTo(0, (7 + jaw * 0.6) * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fl ? "#fff" : "#1d0606";
  ctx.fillRect(3 * s, 4.2 * s, 6 * s, jaw * s);
  if (!fl) {
    ctx.fillStyle = "#cfc6a8";
    for (let i = 0; i < 3; i++) ctx.fillRect((3.6 + i * 1.9) * s, 4.2 * s, 1 * s, 1.4 * s);
  }
  if (z.hair) {
    ctx.fillStyle = C("#1d1a18");
    ctx.beginPath();
    ctx.arc(-1 * s, -2 * s, 9.4 * s, PI * 0.95, PI * 1.75);
    ctx.lineTo(-3 * s, -4 * s);
    ctx.fill();
  }
  if (arm) {
    ctx.fillStyle = C("#1e2733");
    ctx.beginPath();
    ctx.arc(0, -1 * s, 10.8 * s, PI, TAU);
    ctx.fill();
    ctx.fillRect(-10.8 * s, -1 * s, 21.6 * s, 3 * s);
    ctx.fillStyle = fl ? "#fff" : "rgba(120,160,190,.5)";
    ctx.fillRect(2 * s, -1 * s, 9 * s, 5 * s);
  }
  ell(5 * s, -1.5 * s, 2.8 * s, 2.3 * s, fl ? "#fff" : "#140808"); // cuenca
  circ(5.3 * s, -1.5 * s, 1.7 * s, eye);
  glow(5.3 * s, -1.5 * s, 8 * s, run ? "255,60,40" : "255,200,60", fl || z.dead ? 0 : 0.42);
  ctx.restore();
  // ---- brazo delantero extendido ----
  {
    const ex = sx + 13 * s,
      ey = sy + 8 * s - a1,
      wx = sx + 27 * s * reach,
      wy = sy + 3 * s - a1;
    seg(sx + 1 * s, sy + 2 * s, ex, ey, lw * 0.85, lw * 0.66, skin);
    seg(ex, ey, wx, wy, lw * 0.66, lw * 0.52, skin);
    claw(wx, wy, -0.2, s, skin);
    if (!arm) {
      const m = [lerp(sx, ex, 0.5), lerp(sy, ey, 0.5)];
      seg(sx, sy + 1 * s, m[0], m[1], lw * 1.05, lw * 0.9, cl); // manga rota
    }
  }
  ctx.restore();
}

function mixHex(a, b, t) {
  const x = parseInt(hex6(a).slice(1), 16),
    y = parseInt(hex6(b).slice(1), 16);
  const r = lerp(x >> 16, y >> 16, t) | 0,
    g = lerp((x >> 8) & 255, (y >> 8) & 255, t) | 0,
    bb = lerp(x & 255, y & 255, t) | 0;
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | bb).toString(16).slice(1);
}
/** Expande "#rgb" a "#rrggbb" (el original interpretaba "#777" como azul). */
function hex6(h) {
  return h.length === 4 ? "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h;
}
function shade(hex, amt) {
  const n = parseInt(hex6(hex).slice(1), 16);
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
  if (!b.air) shadow(b.x, b.w * 0.5, 0.55);
  else shadow(b.x, b.w * 0.4 * (1 - (GROUND - b.y) / 500), 0.4);
  const hw = b.bw * b.sc * 0.9 + 110,
    top = b.h * 1.35 + 60;
  drawActor(b.x - hw, b.y - top, hw * 2, top + 24, () => bossBody(b), {
    outline: 2.2,
    rim: b.flash > 0 ? 0 : undefined,
  });
}
function bossBody(b) {
  const fl = b.flash > 0;
  const C = (c) => {
    const x = b.tint ? mixHex(c, b.tint[0], b.tint[1]) : c;
    return fl ? shade(x, 0.55) : x;
  };
  const sc = b.sc || 1;
  ctx.save();
  ctx.translate(b.x, b.y);
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
      bg.addColorStop(0, C("#8f7f6d"));
      bg.addColorStop(1, C("#4d4339"));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(sx + 2, hy - 38, 48, 58, 0, 0, TAU);
      ctx.fill();
      // apron
      ctx.fillStyle = C("#9a8a6e");
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
