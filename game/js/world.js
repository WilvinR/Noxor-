"use strict";
/* ================== LAYERS ================== */
const LY = {};
function mkLayer(lw, lh) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(lw * RES);
  c.height = Math.ceil(lh * RES);
  const x = c.getContext("2d");
  x.setTransform(RES, 0, 0, RES, 0, 0);
  return { c, x, lw, lh };
}
function buildLayers() {
  // sky gradient
  LY.sky = ctx.createLinearGradient(0, 0, 0, VH);
  LY.sky.addColorStop(0, "#05060a");
  LY.sky.addColorStop(0.35, "#110e13");
  LY.sky.addColorStop(0.62, "#2a1712");
  LY.sky.addColorStop(0.78, "#4a2110");
  LY.sky.addColorStop(0.86, "#2b140d");
  LY.sky.addColorStop(1, "#0a0707");
  // clouds
  for (const [key, seed, alpha, yb] of [
    ["cl1", 11, 0.55, 120],
    ["cl2", 27, 0.45, 210],
  ]) {
    const L = mkLayer(1800, VH);
    const r = mulberry(seed);
    const x = L.x;
    for (let i = 0; i < 70; i++) {
      const cx = r() * 1800,
        cy = yb + (r() - 0.5) * 170,
        rad = 60 + r() * 160;
      for (const ox of [0, -1800, 1800]) {
        const g = x.createRadialGradient(cx + ox, cy, 0, cx + ox, cy, rad);
        const warm = cy > 200;
        g.addColorStop(0, warm ? `rgba(80,40,30,${alpha * 0.5})` : `rgba(42,36,40,${alpha * 0.55})`);
        g.addColorStop(1, "rgba(20,16,18,0)");
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(cx + ox, cy, rad * 1.8, rad * 0.6, 0, 0, TAU);
        x.fill();
      }
    }
    LY[key] = L;
  }
  // far skyline
  LY.far = skyline(1600, mulberry(5), 395, 70, 250, "#17121a", "#1d1720", {
    win: 0.025,
    holes: 0,
    ant: 0.25,
  });
  LY.mid = skyline(1600, mulberry(9), 432, 50, 200, "#0f0b0e", "#140f12", {
    win: 0.012,
    holes: 0.5,
    ant: 0.15,
    fires: 5,
    smoke: 4,
  });
  LY.near = nearLayer(1700, mulberry(13));
  LY.ground = groundLayer(1024, mulberry(21));
  LY.fg = fgLayer(1400, mulberry(37));
  // vignette
  const V = mkLayer(VW, VH);
  const g = V.x.createRadialGradient(VW / 2, VH * 0.45, VH * 0.25, VW / 2, VH * 0.5, VW * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.6, "rgba(0,0,0,.25)");
  g.addColorStop(1, "rgba(0,0,0,.62)");
  V.x.fillStyle = g;
  V.x.fillRect(0, 0, VW, VH);
  LY.vig = V;
  const D = mkLayer(VW, VH);
  const g2 = D.x.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VW * 0.7);
  g2.addColorStop(0, "rgba(140,0,0,0)");
  g2.addColorStop(1, "rgba(170,0,0,.85)");
  D.x.fillStyle = g2;
  D.x.fillRect(0, 0, VW, VH);
  LY.dmg = D;
  // grain
  const N = document.createElement("canvas");
  N.width = N.height = 192;
  const nx = N.getContext("2d");
  const id = nx.createImageData(192, 192);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = Math.random() * 255;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = Math.random() * 60;
  }
  nx.putImageData(id, 0, 0);
  LY.grain = ctx.createPattern(N, "repeat");
}
function skyline(lw, r, base, minH, maxH, col, col2, o) {
  const L = mkLayer(lw, VH),
    x = L.x;
  let px = 0;
  const blds = [];
  while (px < lw) {
    const w = 30 + r() * 80,
      h = minH + r() * (maxH - minH);
    blds.push({
      px,
      w,
      h,
      jag: r() < 0.5,
      j: [r(), r(), r(), r(), r()],
      ant: r() < o.ant,
      hs: r() < o.holes,
    });
    px += w + r() * 14 - 6;
  }
  for (const b of blds) {
    for (const ox of [0, -lw]) {
      const X = b.px + ox;
      const g = x.createLinearGradient(0, base - b.h, 0, base);
      g.addColorStop(0, col2);
      g.addColorStop(1, col);
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(X, base + 2);
      if (b.jag) {
        x.lineTo(X, base - b.h * (0.75 + b.j[0] * 0.25));
        const n = 5;
        for (let i = 1; i < n; i++) x.lineTo(X + (b.w * i) / n, base - b.h * (0.55 + b.j[i] * 0.45));
        x.lineTo(X + b.w, base - b.h * (0.6 + b.j[4] * 0.4));
      } else {
        x.lineTo(X, base - b.h);
        x.lineTo(X + b.w, base - b.h);
      }
      x.lineTo(X + b.w, base + 2);
      x.closePath();
      x.fill();
      if (b.ant) {
        x.strokeStyle = col2;
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(X + b.w * 0.5, base - b.h);
        x.lineTo(X + b.w * 0.5, base - b.h - 30 - b.j[2] * 40);
        x.stroke();
      }
      // windows
      const rr = mulberry(Math.floor(b.px * 7));
      for (let wy = base - b.h + 12; wy < base - 8; wy += 12)
        for (let wx = X + 5; wx < X + b.w - 6; wx += 9) {
          const q = rr();
          if (q < o.win) {
            x.fillStyle = `rgba(255,${(120 + rr() * 60) | 0},60,${0.25 + rr() * 0.35})`;
            x.fillRect(wx, wy, 4, 5);
          } else if (q < 0.35) {
            x.fillStyle = "rgba(0,0,0,.25)";
            x.fillRect(wx, wy, 4, 5);
          }
        }
      if (b.hs) {
        x.save();
        x.globalCompositeOperation = "destination-out";
        for (let k = 0; k < 3; k++) {
          x.beginPath();
          const hx = X + b.w * (0.2 + b.j[k] * 0.6),
            hy = base - b.h * (0.3 + b.j[k + 1] * 0.5),
            hr = 6 + b.j[k + 2] * 14;
          x.moveTo(hx - hr, hy);
          x.lineTo(hx - hr * 0.3, hy - hr);
          x.lineTo(hx + hr, hy - hr * 0.4);
          x.lineTo(hx + hr * 0.6, hy + hr * 0.8);
          x.closePath();
          x.fill();
        }
        x.restore();
        x.strokeStyle = "rgba(40,30,34,.9)";
        x.lineWidth = 1.2;
        for (let k = 0; k < 4; k++) {
          x.beginPath();
          const sx = X + b.w * b.j[k];
          x.moveTo(sx, base - b.h * 0.95);
          x.lineTo(sx + (b.j[k + 1] - 0.5) * 20, base - b.h * 0.95 - 10 - b.j[k] * 16);
          x.stroke();
        }
      }
    }
  }
  if (o.fires) {
    for (let i = 0; i < o.fires; i++) {
      const fx = r() * lw;
      for (const ox of [0, -lw, lw]) {
        const g = x.createRadialGradient(fx + ox, base, 0, fx + ox, base, 90);
        g.addColorStop(0, "rgba(255,120,40,.55)");
        g.addColorStop(0.4, "rgba(200,60,20,.2)");
        g.addColorStop(1, "rgba(120,30,10,0)");
        x.fillStyle = g;
        x.fillRect(fx + ox - 90, base - 90, 180, 95);
      }
    }
  }
  if (o.smoke) {
    for (let i = 0; i < o.smoke; i++) {
      const sx = r() * lw;
      for (const ox of [0, -lw, lw]) {
        for (let k = 0; k < 14; k++) {
          const yy = base - k * 24,
            rr2 = 16 + k * 7,
            xx = sx + ox + k * k * 0.9;
          const g = x.createRadialGradient(xx, yy, 0, xx, yy, rr2);
          g.addColorStop(0, `rgba(12,10,12,${0.5 - k * 0.03})`);
          g.addColorStop(1, "rgba(12,10,12,0)");
          x.fillStyle = g;
          x.fillRect(xx - rr2, yy - rr2, rr2 * 2, rr2 * 2);
        }
      }
    }
  }
  return L;
}
function nearLayer(lw, r) {
  const L = mkLayer(lw, VH),
    x = L.x;
  const base = GROUND - 10;
  const col = "#070609";
  x.fillStyle = col;
  // rubble mounds
  x.beginPath();
  x.moveTo(0, base + 12);
  let px = 0;
  while (px <= lw) {
    x.lineTo(px, base - 8 - r() * 26);
    px += 20 + r() * 40;
  }
  x.lineTo(lw, base + 12);
  x.closePath();
  x.fill();
  const poles = [];
  for (let i = 0; i < 9; i++) {
    const X = r() * lw;
    const t = r();
    if (t < 0.4) {
      // broken wall
      const w = 40 + r() * 90,
        h = 40 + r() * 100;
      for (const ox of [0, -lw]) {
        x.beginPath();
        x.moveTo(X + ox, base);
        x.lineTo(X + ox, base - h);
        x.lineTo(X + ox + w * 0.3, base - h * (0.7 + r() * 0.3));
        x.lineTo(X + ox + w * 0.55, base - h * (0.4 + r() * 0.4));
        x.lineTo(X + ox + w * 0.8, base - h * (0.2 + r() * 0.4));
        x.lineTo(X + ox + w, base);
        x.fill();
        x.strokeStyle = col;
        x.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
          x.beginPath();
          const rx = X + ox + w * (0.2 + k * 0.15);
          x.moveTo(rx, base - h * 0.5);
          x.lineTo(rx + (r() - 0.5) * 10, base - h * 0.8 - r() * 20);
          x.stroke();
        }
      }
    } else if (t < 0.7) {
      poles.push(X);
    } else {
      // dead tree
      for (const ox of [0, -lw]) tree(x, X + ox, base, 60 + r() * 50, -PI / 2, 5, mulberry(i * 31 + 7));
    }
  }
  poles.sort((a, b) => a - b);
  for (const X of poles) {
    for (const ox of [0, -lw]) {
      const tilt = (r() - 0.5) * 0.12;
      x.save();
      x.translate(X + ox, base);
      x.rotate(tilt);
      x.fillRect(-3, -170, 6, 170);
      x.fillRect(-22, -160, 44, 4);
      x.fillRect(-16, -145, 32, 3);
      x.restore();
    }
  }
  x.strokeStyle = "rgba(7,6,9,.9)";
  x.lineWidth = 1.2;
  for (let i = 0; i < poles.length - 1; i++) {
    const a = poles[i],
      b = poles[i + 1];
    if (b - a > 420) continue;
    for (const yy of [-160, -145]) {
      for (const ox of [0, -lw]) {
        x.beginPath();
        x.moveTo(a + ox, base + yy);
        x.quadraticCurveTo((a + b) / 2 + ox, base + yy + 30, b + ox, base + yy);
        x.stroke();
      }
    }
  }
  return L;
}
function tree(x, X, Y, len, ang, depth, r) {
  if (depth <= 0 || len < 4) return;
  const X2 = X + Math.cos(ang) * len,
    Y2 = Y + Math.sin(ang) * len;
  x.strokeStyle = "#070609";
  x.lineWidth = depth * 1.4;
  x.beginPath();
  x.moveTo(X, Y);
  x.lineTo(X2, Y2);
  x.stroke();
  const n = depth > 3 ? 2 : rint(1, 3);
  for (let i = 0; i < n; i++)
    tree(x, X2, Y2, len * (0.55 + r() * 0.2), ang + (r() - 0.5) * 1.2, depth - 1, r);
}
function groundLayer(lw, r) {
  const L = mkLayer(lw, VH - GROUND + 16),
    x = L.x;
  const H = VH - GROUND + 16;
  // curb/back
  x.fillStyle = "#171418";
  x.fillRect(0, 0, lw, 16);
  x.fillStyle = "#3a3336";
  x.fillRect(0, 14, lw, 2);
  const g = x.createLinearGradient(0, 16, 0, H);
  g.addColorStop(0, "#242024");
  g.addColorStop(0.3, "#19171a");
  g.addColorStop(1, "#0b0a0c");
  x.fillStyle = g;
  x.fillRect(0, 16, lw, H - 16);
  for (let i = 0; i < 2600; i++) {
    const px = r() * lw,
      py = 16 + r() * (H - 16);
    const v = r();
    x.fillStyle = v < 0.5 ? `rgba(255,240,230,${r() * 0.06})` : `rgba(0,0,0,${r() * 0.35})`;
    x.fillRect(px, py, 1 + r() * 2, 1 + r() * 1.5);
  }
  // lane
  for (let i = 0; i < 8; i++) {
    x.fillStyle = "rgba(150,125,60,.28)";
    x.save();
    x.translate(i * 128 + 10, 58);
    x.transform(1, 0, -0.25, 1, 0, 0);
    x.fillRect(0, 0, 64, 4);
    x.restore();
    x.fillStyle = "rgba(0,0,0,.4)";
    for (let k = 0; k < 5; k++) x.fillRect(i * 128 + 10 + r() * 60, 58 + r() * 4, 3 + r() * 6, 2);
  }
  // cracks
  x.strokeStyle = "rgba(0,0,0,.65)";
  for (let i = 0; i < 22; i++) {
    let cx = r() * lw,
      cy = 18 + r() * (H - 20);
    x.lineWidth = 0.6 + r() * 1.6;
    x.beginPath();
    x.moveTo(cx, cy);
    for (let k = 0; k < 6; k++) {
      cx += (r() - 0.3) * 28;
      cy += (r() - 0.5) * 10;
      x.lineTo(cx, cy);
    }
    x.stroke();
  }
  // potholes and stains
  for (let i = 0; i < 6; i++) {
    const px = r() * (lw - 80) + 40,
      py = 30 + r() * (H - 50);
    const rw = 18 + r() * 30;
    x.fillStyle = "rgba(0,0,0,.55)";
    x.beginPath();
    x.ellipse(px, py, rw, rw * 0.22, 0, 0, TAU);
    x.fill();
    x.strokeStyle = "rgba(120,110,110,.12)";
    x.lineWidth = 1;
    x.beginPath();
    x.ellipse(px, py + 1, rw, rw * 0.22, 0, 0, PI);
    x.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const px = r() * lw,
      py = 25 + r() * (H - 40);
    const g2 = x.createRadialGradient(px, py, 0, px, py, 40);
    g2.addColorStop(0, "rgba(60,8,8,.35)");
    g2.addColorStop(1, "rgba(60,8,8,0)");
    x.fillStyle = g2;
    x.beginPath();
    x.ellipse(px, py, 50, 10, 0, 0, TAU);
    x.fill();
  }
  // debris
  for (let i = 0; i < 40; i++) {
    const px = r() * lw,
      py = 18 + r() * (H - 24);
    x.fillStyle = r() < 0.5 ? "#2b2526" : "#1a1617";
    x.save();
    x.translate(px, py);
    x.rotate(r() * PI);
    x.fillRect(-3, -1.5, 4 + r() * 7, 2 + r() * 3);
    x.restore();
  }
  // light edge
  x.fillStyle = "rgba(255,150,100,.06)";
  x.fillRect(0, 16, lw, 2);
  return L;
}
function drawLayer(L, off, y) {
  const o = ((off % L.lw) + L.lw) % L.lw;
  for (let x = -o; x < VW; x += L.lw) ctx.drawImage(L.c, x, y, L.lw, L.lh);
}

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const cw = innerWidth,
    ch = innerHeight;
  cv.width = Math.round(cw * DPR);
  cv.height = Math.round(ch * DPR);
  cv.style.width = cw + "px";
  cv.style.height = ch + "px";
  const band = isTouch && cw > ch ? Math.min(44, ch * 0.11) : 0;
  const ah = ch - band;
  VW = clamp((cw / ah) * VH, 760, 1280);
  SC = Math.min(cw / VW, ah / VH);
  OX = (cw - VW * SC) / 2;
  OY = band ? Math.max(0, (ah - VH * SC) / 2) : (ch - VH * SC) / 2;
  EXT = band ? (ch - OY - VH * SC) / SC : 0;
  RES = Math.min(SC * DPR, 2);
  if (isTouch) {
    PMIN = clamp(210 / SC, 240, 460);
    PSTART = PMIN + 40;
  }
  buildLayers();
  checkRotate();
}
let rotSkipped = false;
function checkRotate() {
  const r = $("rotate");
  if (isTouch && innerHeight > innerWidth && !rotSkipped) r.classList.remove("hidden");
  else r.classList.add("hidden");
}
$("rotSkip").onclick = () => {
  rotSkipped = true;
  checkRotate();
};

/* ================== ZONAS (variedad visual por nivel) ==================
 * El original usaba una única paleta naranja/negra durante toda la partida. Cada nivel
 * (400 m) cambia ahora de zona con un fundido de 3 s: cielo, neblina atmosférica entre
 * capas de parallax, luz de horizonte y la luz de borde de los personajes.
 */
const ZONES = [
  {
    name: "CIUDAD EN LLAMAS",
    sky: ["#07070d", "#140f15", "#2c1813", "#5a2610", "#2b140d", "#0a0707"],
    haze: [120, 62, 40],
    hor: [255, 120, 50],
    rim: [255, 172, 112],
    key: [255, 186, 128],
    moon: [222, 206, 182],
  },
  {
    name: "DISTRITO TÓXICO",
    sky: ["#040908", "#0b1613", "#16271a", "#3c5018", "#16200e", "#060805"],
    haze: [64, 96, 46],
    hor: [170, 230, 60],
    rim: [196, 255, 128],
    key: [205, 255, 160],
    moon: [214, 228, 176],
  },
  {
    name: "PUERTO NOCTURNO",
    sky: ["#03050c", "#0a1222", "#142542", "#2a4672", "#121c30", "#05070c"],
    haze: [58, 80, 122],
    hor: [110, 160, 255],
    rim: [158, 204, 255],
    key: [176, 214, 255],
    moon: [226, 236, 255],
  },
  {
    name: "ZONA ROJA",
    sky: ["#090304", "#1b070a", "#38090d", "#7a1512", "#2a0808", "#090303"],
    haze: [124, 32, 30],
    hor: [255, 70, 50],
    rim: [255, 120, 96],
    key: [255, 150, 128],
    moon: [240, 190, 176],
  },
];
const ZONE = { i: 0, from: 0, t: 1, rim: "", key: "", haze: "", hor: "", moon: "" };
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
for (const z of ZONES) z.skyRgb = z.sky.map(hexRgb);
const mixRgb = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
function setZone(i, instant) {
  i = ((i % ZONES.length) + ZONES.length) % ZONES.length;
  if (i === ZONE.i && ZONE.t >= 1) return;
  ZONE.from = instant ? i : ZONE.i;
  ZONE.i = i;
  ZONE.t = instant ? 1 : 0;
  zoneTick(0);
}
function zoneTick(dt) {
  ZONE.t = Math.min(1, ZONE.t + dt / 3);
  const a = ZONES[ZONE.from],
    b = ZONES[ZONE.i],
    t = ZONE.t * ZONE.t * (3 - 2 * ZONE.t);
  const m = (k) => mixRgb(a[k], b[k], t).join(",");
  ZONE.rim = `rgba(${m("rim")},.85)`;
  ZONE.key = m("key");
  ZONE.haze = m("haze");
  ZONE.hor = m("hor");
  ZONE.moon = m("moon");
  ZONE.sky = a.skyRgb.map((c, k) => `rgb(${mixRgb(c, b.skyRgb[k], t).join(",")})`);
}
zoneTick(0);
const SKY_STOPS = [0, 0.35, 0.62, 0.78, 0.86, 1];

/** Capa de primer plano: escombros y varillas que pasan por delante (profundidad). */
function fgLayer(lw, r) {
  const H = 70,
    L = mkLayer(lw, H),
    x = L.x;
  x.fillStyle = "#040304";
  let px = 0;
  while (px < lw) {
    const gap = 140 + r() * 260;
    px += gap;
    if (px > lw - 120) break;
    const w = 60 + r() * 120,
      h = 18 + r() * 26;
    // montículo de escombros
    x.beginPath();
    x.moveTo(px, H);
    for (let k = 0; k <= 6; k++) x.lineTo(px + (w * k) / 6, H - h * (0.4 + r() * 0.6) * Math.sin((k / 6) * PI));
    x.lineTo(px + w, H);
    x.closePath();
    x.fill();
    // varillas de acero retorcidas
    x.strokeStyle = "#040304";
    x.lineWidth = 2.2;
    for (let k = 0; k < 2 + r() * 3; k++) {
      const bx = px + w * (0.2 + r() * 0.6);
      x.beginPath();
      x.moveTo(bx, H - h * 0.5);
      x.quadraticCurveTo(bx + (r() - 0.5) * 30, H - h - 10 - r() * 10, bx + (r() - 0.5) * 40, H - h - 18 - r() * 16);
      x.stroke();
    }
    px += w;
  }
  return L;
}
