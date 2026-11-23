"use strict";
/* ================== FX: sprites cacheados y compositor de personajes ==================
 *
 * 1) Sprites radiales cacheados.
 *    El original creaba un `createRadialGradient` nuevo por cada brillo, luz, partícula de
 *    fuego y llama, en cada fotograma (cientos por frame). Aquí cada degradado se rasteriza
 *    una sola vez en un lienzo de 128 px y luego se dibuja escalado con drawImage.
 *
 * 2) Compositor de actores (jugador, zombis, jefes).
 *    Cada personaje se dibuja en un lienzo auxiliar y se compone con:
 *      - sombreado volumétrico (luz cenital cálida / pies en sombra),
 *      - luz de contorno (rim light) del color de la zona,
 *      - contorno oscuro de silueta para que se lean siempre sobre el fondo,
 *    y después se pega en la escena con su opacidad final (sin artefactos de alfa).
 *    Los brillos (ojos, visor) que se piden durante el dibujo se difieren y se pintan
 *    encima, en coordenadas de mundo, para que no queden contorneados.
 */
const FX = { spr: new Map(), frame: 0, q: 2, qLock: false, acc: 0, n: 0, cool: 3 };
/* Calidad adaptativa de personajes:
 *   2 = contorno + rim light + sombreado   1 = sólo contorno   0 = dibujo directo (como el original)
 * Si el equipo no sostiene ~45 fps se baja un nivel (nunca se sube, para no oscilar).
 * ?q=0|1|2 en la URL fija el nivel manualmente. */
try {
  const qm = /[?&]q=([012])/.exec(location.search);
  if (qm) {
    FX.q = +qm[1];
    FX.qLock = true;
  }
} catch (e) {}
function qualityTick(rawDt) {
  if (FX.qLock || FX.q === 0 || G.state !== "play") return;
  if (FX.cool > 0) {
    FX.cool -= rawDt;
    return;
  }
  FX.acc += rawDt;
  FX.n++;
  if (FX.n >= 120) {
    const avg = FX.acc / FX.n;
    FX.acc = FX.n = 0;
    if (avg > 1 / 45) {
      FX.q--;
      FX.cool = 3;
    }
  }
}

function radialSprite(key, stops) {
  let c = FX.spr.get(key);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  FX.spr.set(key, c);
  return c;
}
/** Dibuja un sprite radial centrado en (x,y) con radio r y opacidad a. */
function blit(spr, x, y, r, a, additive) {
  const c = ctx,
    ga = c.globalAlpha,
    op = c.globalCompositeOperation;
  c.globalAlpha = ga * a;
  if (additive) c.globalCompositeOperation = "lighter";
  c.drawImage(spr, x - r, y - r, r * 2, r * 2);
  c.globalAlpha = ga;
  c.globalCompositeOperation = op;
}
const glowSpr = (col) =>
  radialSprite("g" + col, [
    [0, `rgba(${col},1)`],
    [1, `rgba(${col},0)`],
  ]);
const lightSpr = (col) =>
  radialSprite("l" + col, [
    [0, `rgba(${col},.55)`],
    [0.4, `rgba(${col},.18)`],
    [1, `rgba(${col},0)`],
  ]);
const fireSpr = (col) =>
  radialSprite("f" + col, [
    [0, col],
    [1, "rgba(255,60,0,0)"],
  ]);
/** Llama del lanzallamas: 8 variantes según su edad (antes: un degradado por partícula). */
function flameSpr(t) {
  const q = Math.min(7, (t * 8) | 0),
    tt = q / 7;
  return radialSprite("fl" + q, [
    [0, `rgba(255,${(220 - tt * 120) | 0},${(140 - tt * 120) | 0},.6)`],
    [0.6, `rgba(255,${(100 - tt * 60) | 0},20,.35)`],
    [1, "rgba(120,20,0,0)"],
  ]);
}

/* ---------------- compositor de actores ---------------- */
const ACT = { on: false, glows: [], bx: 0, by: 0, R: 2 };
const AW = 760,
  AH = 640; // tamaño máximo (unidades virtuales) de la caja de un actor
/** Lienzos auxiliares agrupados por tamaño (múltiplos de 64 px). Usar lienzos pequeños y
 *  ajustados es clave: al reutilizar un lienzo que ya se pintó en la escena, el navegador
 *  copia la superficie completa; con uno grande esa copia costaba más que el propio dibujo. */
const ACT_POOL = new Map();
function actLayers(pw, ph) {
  const R = Math.max(1, Math.min(RES, 2));
  if (ACT.R !== R) {
    ACT_POOL.clear();
    ACT.R = R;
  }
  const w = Math.ceil(pw / 64) * 64,
    h = Math.ceil(ph / 64) * 64,
    key = w * 4096 + h;
  // un juego de lienzos distinto para cada actor del mismo tamaño dentro del fotograma
  let slot = ACT_POOL.get(key);
  if (!slot) ACT_POOL.set(key, (slot = { f: -1, n: 0, sets: [] }));
  if (slot.f !== FX.frame) {
    slot.f = FX.frame;
    slot.n = 0;
  }
  let L = slot.sets[slot.n];
  if (!L) {
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return { c, x: c.getContext("2d") };
    };
    L = { cv: mk(), ol: mk(), rim: mk(), out: mk() };
    slot.sets.push(L);
  }
  slot.n++;
  ACT.cv = L.cv;
  ACT.ol = L.ol;
  ACT.rim = L.rim;
  ACT.out = L.out;
}
function silhouette(dst, src, pw, ph, col) {
  const x = dst.x;
  x.setTransform(1, 0, 0, 1, 0, 0);
  // "copy" y "source-in" son operaciones globales: sin recorte afectarían a TODO el
  // lienzo auxiliar en cada actor. El clip las limita a la caja del personaje.
  x.save();
  x.beginPath();
  x.rect(0, 0, pw, ph);
  x.clip();
  x.globalCompositeOperation = "copy";
  x.drawImage(src.c, 0, 0, pw, ph, 0, 0, pw, ph);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = col;
  x.fillRect(0, 0, pw, ph);
  x.restore();
}
/**
 * Dibuja un actor con contorno, rim light y sombreado.
 * @param {number} bx,by,bw,bh  caja en coordenadas de mundo que contiene al actor
 * @param {Function} fn         función de dibujo (usa `ctx` y coordenadas de mundo)
 * @param {object} o            {alpha, outline, rim, rimDx, rimDy, shade}
 */
function drawActor(bx, by, bw, bh, fn, o) {
  o = o || {};
  if (FX.q === 0) {
    const ga = ctx.globalAlpha;
    ctx.globalAlpha = ga * (o.alpha == null ? 1 : o.alpha);
    fn();
    ctx.globalAlpha = ga;
    return;
  }
  if (FX.q === 1) o = { ...o, rim: 0, shade: 0 };
  bw = Math.min(bw, AW);
  bh = Math.min(bh, AH);
  const R = Math.max(1, Math.min(RES, 2)),
    pw = Math.ceil(bw * R),
    ph = Math.ceil(bh * R);
  actLayers(pw, ph);
  const A = ACT.cv.x;
  A.setTransform(1, 0, 0, 1, 0, 0);
  A.clearRect(0, 0, pw, ph);
  A.setTransform(R, 0, 0, R, -bx * R, -by * R);
  A.lineCap = "round";
  A.lineJoin = "round";
  A.globalAlpha = 1;
  ACT.on = true;
  ACT.bx = bx;
  ACT.by = by;
  ACT.glows.length = 0;
  const prev = ctx;
  ctx = A;
  try {
    fn();
  } finally {
    ctx = prev;
    ACT.on = false;
  }
  // sombreado volumétrico: luz cálida desde arriba, pies hundidos en sombra
  const sh = o.shade == null ? 1 : o.shade;
  if (sh > 0) {
    A.setTransform(1, 0, 0, 1, 0, 0);
    A.globalAlpha = 1;
    A.globalCompositeOperation = "source-atop";
    const g = A.createLinearGradient(0, 0, 0, ph);
    const z = ZONE;
    g.addColorStop(0, `rgba(${z.key},${0.14 * sh})`);
    g.addColorStop(0.45, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${0.42 * sh})`);
    A.fillStyle = g;
    A.fillRect(0, 0, pw, ph);
    A.globalCompositeOperation = "source-over";
  }
  // Composición. Opaco: directo a la escena (menos pasadas). Semitransparente: primero en
  // un lienzo intermedio para que el contorno no se acumule bajo el cuerpo al desvanecerse.
  const alpha = o.alpha == null ? 1 : o.alpha;
  const viaO = alpha < 0.999;
  const T = viaO ? ACT.out.x : ctx;
  if (viaO) {
    T.setTransform(1, 0, 0, 1, 0, 0);
    T.clearRect(0, 0, pw, ph);
  }
  const put = (src, dx, dy) =>
    viaO
      ? T.drawImage(src, 0, 0, pw, ph, dx * R, dy * R, pw, ph)
      : T.drawImage(src, 0, 0, pw, ph, bx + dx, by + dy, pw / R, ph / R);
  const d = o.outline == null ? 1.7 : o.outline;
  if (d > 0) {
    // contorno con 4 copias diagonales de la silueta (≈ trazo de d px)
    silhouette(ACT.ol, ACT.cv, pw, ph, "rgba(6,4,8,.92)");
    const k = d * 0.92;
    put(ACT.ol.c, -k, -k);
    put(ACT.ol.c, k, -k);
    put(ACT.ol.c, -k, k);
    put(ACT.ol.c, k, k);
  }
  const rim = o.rim == null ? ZONE.rim : o.rim;
  if (rim) {
    silhouette(ACT.rim, ACT.cv, pw, ph, rim);
    put(ACT.rim.c, o.rimDx || 1.3, o.rimDy || -1.4);
  }
  put(ACT.cv.c, 0, 0);
  if (viaO) {
    const ga = ctx.globalAlpha;
    ctx.globalAlpha = ga * alpha;
    ctx.drawImage(ACT.out.c, 0, 0, pw, ph, bx, by, pw / R, ph / R);
    ctx.globalAlpha = ga;
  }
  // brillos diferidos (ojos, visor, núcleo) por encima del contorno
  for (const gl of ACT.glows) glow(gl[0], gl[1], gl[2], gl[3], gl[4] * (o.alpha == null ? 1 : o.alpha));
}

/** Brillo aditivo. Durante el dibujo de un actor se difiere a coordenadas de mundo. */
function glow(x, y, r, col, a) {
  if (ACT.on) {
    const m = ctx.getTransform(),
      R = ACT.R;
    ACT.glows.push([
      (m.a * x + m.c * y + m.e) / R + ACT.bx,
      (m.b * x + m.d * y + m.f) / R + ACT.by,
      (r * Math.hypot(m.a, m.b)) / R,
      col,
      a,
    ]);
    return;
  }
  blit(glowSpr(col), x, y, r, a, true);
}
