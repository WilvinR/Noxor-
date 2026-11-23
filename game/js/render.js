"use strict";
function drawObstacle(o) {
  const x = o.x;
  ctx.save();
  switch (o.t) {
    case "barrier": {
      shadow(x, o.w * 0.55, 0.5);
      ctx.fillStyle = "#5a5552";
      ctx.beginPath();
      ctx.moveTo(x - 46, GROUND);
      ctx.lineTo(x - 38, GROUND - 14);
      ctx.lineTo(x - 30, GROUND - 46);
      ctx.lineTo(x + 30, GROUND - 46);
      ctx.lineTo(x + 38, GROUND - 14);
      ctx.lineTo(x + 46, GROUND);
      ctx.fill();
      const g = ctx.createLinearGradient(0, GROUND - 46, 0, GROUND);
      g.addColorStop(0, "rgba(255,255,255,.08)");
      g.addColorStop(1, "rgba(0,0,0,.4)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 30, GROUND - 40, 60, 14);
      ctx.clip();
      for (let i = -3; i < 6; i++) {
        ctx.fillStyle = i % 2 ? "rgba(170,40,30,.7)" : "rgba(200,190,170,.5)";
        ctx.beginPath();
        ctx.moveTo(x - 30 + i * 14, GROUND - 26);
        ctx.lineTo(x - 16 + i * 14, GROUND - 40);
        ctx.lineTo(x - 9 + i * 14, GROUND - 40);
        ctx.lineTo(x - 23 + i * 14, GROUND - 26);
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(0,0,0,.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - 8, GROUND - 46);
      ctx.lineTo(x - 2, GROUND - 30);
      ctx.lineTo(x - 10, GROUND - 18);
      ctx.stroke();
      ctx.fillStyle = "#3a3532";
      ctx.fillRect(x + 22, GROUND - 50, 12, 4);
      break;
    }
    case "wire": {
      shadow(x, o.w * 0.5, 0.35);
      ctx.strokeStyle = "#5d5a57";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.ellipse(x - 36 + i * 9, GROUND - 13, 9, 13, 0.3, 0, TAU);
        ctx.stroke();
      }
      ctx.strokeStyle = "#8a8580";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const px = x - 40 + i * 4.6,
          py = GROUND - 13 + Math.sin(i * 1.7) * 12;
        ctx.beginPath();
        ctx.moveTo(px - 2, py - 2);
        ctx.lineTo(px + 2, py + 2);
        ctx.moveTo(px + 2, py - 2);
        ctx.lineTo(px - 2, py + 2);
        ctx.stroke();
      }
      limb(x - 42, GROUND, x - 42, GROUND - 30, 3, "#3a2a1e");
      limb(x + 42, GROUND, x + 42, GROUND - 30, 3, "#3a2a1e");
      break;
    }
    case "car": {
      shadow(x, o.w * 0.55, 0.6);
      const r = mulberry(o.seed);
      const body = pick(["#4a2c22", "#3a3a3e", "#2e3a3a", "#4a3a28"]);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(x - 86, GROUND - 14);
      ctx.lineTo(x - 84, GROUND - 40);
      ctx.lineTo(x - 50, GROUND - 44);
      ctx.lineTo(x - 28, GROUND - 68);
      ctx.lineTo(x + 30, GROUND - 68);
      ctx.lineTo(x + 52, GROUND - 44);
      ctx.lineTo(x + 86, GROUND - 38);
      ctx.lineTo(x + 88, GROUND - 14);
      ctx.closePath();
      ctx.fill();
      const g = ctx.createLinearGradient(0, GROUND - 68, 0, GROUND - 10);
      g.addColorStop(0, "rgba(255,200,160,.08)");
      g.addColorStop(1, "rgba(0,0,0,.45)");
      ctx.fillStyle = g;
      ctx.fill();
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = `rgba(${(110 + r() * 60) | 0},${(50 + r() * 30) | 0},20,.55)`;
        ctx.beginPath();
        ctx.arc(x - 80 + r() * 160, GROUND - 60 + r() * 44, 3 + r() * 8, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#0b0b0d";
      ctx.beginPath();
      ctx.moveTo(x - 24, GROUND - 64);
      ctx.lineTo(x - 2, GROUND - 64);
      ctx.lineTo(x - 2, GROUND - 46);
      ctx.lineTo(x - 42, GROUND - 46);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 4, GROUND - 64);
      ctx.lineTo(x + 28, GROUND - 64);
      ctx.lineTo(x + 44, GROUND - 46);
      ctx.lineTo(x + 4, GROUND - 46);
      ctx.fill();
      ctx.strokeStyle = "rgba(200,220,230,.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, GROUND - 62);
      ctx.lineTo(x + 18, GROUND - 52);
      ctx.lineTo(x + 14, GROUND - 48);
      ctx.moveTo(x + 18, GROUND - 52);
      ctx.lineTo(x + 30, GROUND - 56);
      ctx.stroke();
      for (const wx of [x - 54, x + 56]) {
        ctx.fillStyle = "#0d0c0c";
        ctx.beginPath();
        ctx.ellipse(wx, GROUND - 10, 17, 12, 0, 0, TAU);
        ctx.fill();
        circ(wx, GROUND - 10, 6, "#2a2624");
      }
      ctx.fillStyle = "rgba(0,0,0,.4)";
      ctx.fillRect(x - 86, GROUND - 28, 174, 3);
      ctx.fillStyle = "#55504a";
      ctx.fillRect(x + 80, GROUND - 34, 8, 6);
      break;
    }
    case "beam": {
      const top = o.top,
        bot = o.bot;
      ctx.strokeStyle = "#2a2626";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      for (const cx of [x - 44, x + 44]) {
        ctx.beginPath();
        ctx.moveTo(cx, -10);
        ctx.lineTo(cx + (cx < x ? 8 : -8), bot - 28);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(x, bot - 16);
      ctx.rotate(Math.sin(G.t * 1.5 + o.seed) * 0.03);
      const g = ctx.createLinearGradient(0, -16, 0, 16);
      g.addColorStop(0, "#5d5450");
      g.addColorStop(0.5, "#3c3533");
      g.addColorStop(1, "#231f1e");
      ctx.fillStyle = g;
      ctx.fillRect(-o.w / 2 - 8, -16, o.w + 16, 32);
      ctx.fillStyle = "#1c1918";
      ctx.fillRect(-o.w / 2 - 8, -5, o.w + 16, 10);
      ctx.fillStyle = "rgba(180,60,30,.55)";
      for (let i = 0; i < 5; i++) ctx.fillRect(-o.w / 2 + i * 28, -14, 14, 4);
      ctx.fillStyle = "#c9b04a";
      ctx.globalAlpha = 0.75;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-o.w / 2 - 8 + i * 24, 16);
        ctx.lineTo(-o.w / 2 + 4 + i * 24, 16);
        ctx.lineTo(-o.w / 2 - 4 + i * 24, 24);
        ctx.lineTo(-o.w / 2 - 16 + i * 24, 24);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.strokeStyle = "#151313";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 20, bot);
      ctx.quadraticCurveTo(x - 14, bot + 20, x - 22, bot + 34);
      ctx.stroke();
      if (Math.random() < 0.04)
        for (let i = 0; i < 4; i++)
          part({
            x: x - 22,
            y: bot + 34,
            vx: rnd(-80, 80),
            vy: rnd(-50, 80),
            g: 900,
            life: 0.3,
            col: "#9fd8ff",
            t: "spark",
            add: 1,
          });
      break;
    }
    case "barrel": {
      shadow(x, 20, 0.5);
      const g = ctx.createLinearGradient(x - 16, 0, x + 16, 0);
      g.addColorStop(0, "#4a0d0a");
      g.addColorStop(0.45, "#a3241a");
      g.addColorStop(1, "#3a0808");
      ctx.fillStyle = g;
      rrect(x - 16, GROUND - 50, 32, 50, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(x - 16, GROUND - 36, 32, 3);
      ctx.fillRect(x - 16, GROUND - 16, 32, 3);
      ctx.fillStyle = "#e2b23a";
      ctx.beginPath();
      ctx.moveTo(x, GROUND - 31);
      ctx.lineTo(x + 7, GROUND - 20);
      ctx.lineTo(x - 7, GROUND - 20);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.fillRect(x - 1, GROUND - 28, 2, 5);
      if (o.hp < 30) glow(x, GROUND - 40, 20, "255,120,40", 0.3);
      break;
    }
  }
  ctx.restore();
}
function drawPickup(p) {
  const y = p.y + Math.sin(p.bob) * 5;
  const x = p.x;
  const col = p.kind === "weapon" ? "255,179,64" : p.kind === "med" ? "255,70,70" : "120,230,120";
  glow(x, y, 55, col, 0.35);
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(${col},.8)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 24 + Math.sin(G.t * 4) * 2, 0, TAU);
  ctx.stroke();
  if (p.kind === "weapon") {
    ctx.fillStyle = "rgba(10,10,10,.6)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.rotate(-0.15);
    const sc = p.w === "rocket" || p.w === "sniper" ? 0.62 : 0.85;
    ctx.translate(-20 * sc, 2);
    drawGun(ctx, p.w, sc);
    ctx.restore();
  } else if (p.kind === "med") {
    ctx.fillStyle = "#e8e4dc";
    rrect(-14, -11, 28, 22, 4);
    ctx.fill();
    ctx.fillStyle = "#d42a22";
    ctx.fillRect(-3, -8, 6, 16);
    ctx.fillRect(-8, -3, 16, 6);
  } else {
    ctx.fillStyle = "#3d4a2a";
    rrect(-15, -9, 30, 18, 2);
    ctx.fill();
    ctx.fillStyle = "#c9a24a";
    for (let i = 0; i < 5; i++) ctx.fillRect(-11 + i * 5, -14, 3, 7);
    ctx.fillStyle = "#e8d48a";
    ctx.font = "bold 7px Rajdhani,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AMMO", 0, 5);
  }
  ctx.restore();
}
function drawDecor(d) {
  const x = d.x,
    base = GROUND - 12;
  ctx.save();
  // el decorado va al 78% de la velocidad del suelo: es un plano intermedio y debe verse
  // algo más pequeño (antes se dibujaba a escala de primer plano y parecía flotar)
  ctx.translate(x, base);
  ctx.scale(0.84, 0.84);
  ctx.translate(-x, -base);
  switch (d.t) {
    case "lamp":
      ctx.fillStyle = "#0d0c0e";
      ctx.fillRect(x - 3, base - 190, 6, 190);
      ctx.beginPath();
      ctx.moveTo(x, base - 188);
      ctx.quadraticCurveTo(x + 5, base - 206, x + 36, base - 198);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#0d0c0e";
      ctx.stroke();
      ctx.fillRect(x + 28, base - 200, 20, 7);
      if (d.on) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createLinearGradient(0, base - 193, 0, base + 40);
        g.addColorStop(0, "rgba(255,200,130,.22)");
        g.addColorStop(1, "rgba(255,200,130,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x + 30, base - 193);
        ctx.lineTo(x + 46, base - 193);
        ctx.lineTo(x + 110, base + 30);
        ctx.lineTo(x - 34, base + 30);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        light(x + 38, base - 192, 40, "255,210,150", 0.8);
        light(x + 38, GROUND + 10, 110, "255,190,120", 0.18);
      }
      break;
    case "sign":
      ctx.translate(x, base);
      ctx.rotate(-0.12);
      // dos postes visibles con zapata: el cartel queda anclado al suelo
      ctx.fillStyle = "#2a2528";
      ctx.fillRect(-30, -112, 5, 112);
      ctx.fillRect(25, -112, 5, 112);
      ctx.fillStyle = "#1c181a";
      ctx.fillRect(-34, -6, 13, 8);
      ctx.fillRect(21, -6, 13, 8);
      ctx.fillStyle = "#8a7a2a";
      ctx.fillRect(-40, -130, 80, 40);
      ctx.fillStyle = "#1a1610";
      ctx.fillRect(-37, -127, 74, 34);
      ctx.fillStyle = "#b8a040";
      ctx.font = "bold 11px Rajdhani,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚠ PELIGRO", 0, -112);
      ctx.font = "600 8px Rajdhani,sans-serif";
      ctx.fillText("ZONA EN CUARENTENA", 0, -100);
      ctx.fillStyle = "rgba(0,0,0,.5)";
      ctx.fillRect(-10, -127, 20, 8);
      break;
    case "car":
      ctx.fillStyle = "#0c0b0d";
      ctx.beginPath();
      ctx.moveTo(x - 70, base);
      ctx.lineTo(x - 68, base - 26);
      ctx.lineTo(x - 34, base - 30);
      ctx.lineTo(x - 18, base - 50);
      ctx.lineTo(x + 26, base - 50);
      ctx.lineTo(x + 40, base - 30);
      ctx.lineTo(x + 70, base - 26);
      ctx.lineTo(x + 72, base);
      ctx.fill();
      if (d.seed % 3 === 0) light(x, base - 40, 130, "255,130,50", 0.4);
      break;
    case "bus":
      ctx.fillStyle = "#0b0a0c";
      ctx.save();
      ctx.translate(x, base);
      ctx.rotate(0.05);
      ctx.fillRect(-120, -80, 240, 72);
      ctx.fillStyle = "#141216";
      for (let i = 0; i < 7; i++) ctx.fillRect(-110 + i * 32, -70, 24, 22);
      ctx.restore();
      break;
    case "fire":
      ctx.fillStyle = "#120e0c";
      rrect(x - 14, base - 24, 28, 30, 3);
      ctx.fill();
      light(x, base - 30, 150 + Math.sin(G.t * 20 + d.seed) * 15, "255,130,50", 0.55);
      break;
  }
  ctx.restore();
}
function drawEP(e) {
  if (e.delay > 0) {
    if (e.t === "debris") {
      const a = 0.3 + (1 - e.delay) * 0.5;
      ctx.fillStyle = `rgba(255,40,30,${a * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(e.x, GROUND + 2, 30, 6, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,80,60,${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(e.x, GROUND + 2, 30 * (1 - e.delay * 0.5), 6, 0, 0, TAU);
      ctx.stroke();
    }
    return;
  }
  ctx.save();
  ctx.translate(e.x, e.y);
  switch (e.t) {
    case "acid":
    case "bolt":
      glow(0, 0, 26, "170,255,60", 0.6);
      circ(0, 0, e.r * 0.8, "#7fbf1a");
      circ(-2, -2, e.r * 0.45, "#d8ff7a");
      break;
    case "cleaver":
      ctx.rotate(e.rot);
      ctx.fillStyle = "#8d9298";
      ctx.fillRect(-12, -8, 22, 16);
      ctx.fillStyle = "#2a1e16";
      ctx.fillRect(-20, -2, 8, 4);
      ctx.fillStyle = "rgba(110,10,10,.8)";
      ctx.fillRect(4, -8, 6, 16);
      break;
    case "spike":
      if (e.vx > 0) ctx.scale(-1, 1);
      ctx.fillStyle = "#d8cfc0";
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(18, -5);
      ctx.lineTo(18, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.15)";
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(60, 0);
      ctx.stroke();
      break;
    case "boulder":
      ctx.rotate(e.rot);
      ctx.fillStyle = "#3a3534";
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU,
          r = e.r * (0.85 + ((i * 7) % 3) * 0.08);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.fill();
      ctx.fillStyle = "#4e4746";
      ctx.beginPath();
      ctx.arc(-6, -6, e.r * 0.45, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#211d1d";
      ctx.fillRect(-4, 4, 14, 5);
      break;
    case "debris":
      ctx.rotate(e.rot);
      ctx.fillStyle = "#4a4342";
      ctx.fillRect(-22, -16, 44, 32);
      ctx.fillStyle = "#2a2524";
      ctx.fillRect(-22, 6, 44, 10);
      ctx.strokeStyle = "#6a5a50";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -16);
      ctx.lineTo(-14, -30);
      ctx.moveTo(8, -16);
      ctx.lineTo(12, -28);
      ctx.stroke();
      break;
    case "shock": {
      ctx.translate(0, GROUND - e.y);
      if (e.vx > 0) ctx.scale(-1, 1);
      const g = ctx.createLinearGradient(0, -e.h, 0, 0);
      g.addColorStop(0, "rgba(255,200,150,0)");
      g.addColorStop(1, "rgba(255,170,110,.5)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-e.w, 0);
      ctx.quadraticCurveTo(-e.w * 0.3, -e.h * 1.2, e.w * 0.3, -e.h * 0.4);
      ctx.lineTo(e.w * 0.5, 0);
      ctx.fill();
      glow(0, -8, 40, "255,150,80", 0.35);
      break;
    }
  }
  ctx.restore();
}
function drawBullet(b) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (b.t === "flame") {
    const t = 1 - b.life / b.max;
    const r = 6 + t * 30;
    const a = Math.min(1, b.life * 3);
    ctx.globalAlpha = a;
    ctx.drawImage(flameSpr(t), b.x - r, b.y - r, r * 2, r * 2);
  } else if (b.t === "rocket") {
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.fillStyle = "#4a5038";
    ctx.fillRect(-12, -3, 16, 6);
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.lineTo(12, 0);
    ctx.lineTo(4, 3);
    ctx.fill();
  } else {
    const tl = b.t === "sniper" ? 0.045 : 0.02;
    const x0 = b.x - b.vx * tl,
      y0 = b.y - b.vy * tl;
    const g = ctx.createLinearGradient(x0, y0, b.x, b.y);
    g.addColorStop(0, "rgba(255,200,120,0)");
    g.addColorStop(1, b.t === "sniper" ? "rgba(200,240,255,1)" : "rgba(255,225,160,1)");
    ctx.strokeStyle = g;
    ctx.lineWidth = b.t === "sniper" ? 3.2 : 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}
function drawParts(add) {
  for (const p of parts) {
    if (!!p.add !== add) continue;
    const t = p.life / p.max;
    if (p.t === "dot" || p.t === "blood") {
      ctx.globalAlpha = Math.min(1, t * 2);
      circ(p.x, p.y, p.s2 >= 0 ? lerp(p.s2, p.s, t) : p.s, p.col);
    } else if (p.t === "smoke") {
      ctx.globalAlpha = t * 0.9;
      circ(p.x, p.y, lerp(p.s2, p.s, t), p.col);
    } else if (p.t === "fire") {
      ctx.globalAlpha = t;
      const r = lerp(p.s2, p.s, t);
      ctx.drawImage(fireSpr(p.col), p.x - r, p.y - r, r * 2, r * 2);
    } else if (p.t === "spark") {
      ctx.globalAlpha = t;
      ctx.strokeStyle = p.col;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
      ctx.stroke();
    } else if (p.t === "flash") {
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const r = p.s * (1 + Math.random() * 0.4);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, "rgba(255,255,230,1)");
      g.addColorStop(0.3, "rgba(255,210,120,.9)");
      g.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(0, -r * 0.45);
      ctx.lineTo(r * 1.6, 0);
      ctx.lineTo(0, r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-r * 0.5, -r * 0.5, r, r);
      ctx.restore();
    } else if (p.t === "rect" || p.t === "shell") {
      ctx.globalAlpha = Math.min(1, t * 3);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.s / 2, -p.s * 0.22, p.s, p.s * 0.45);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}
function drawWarn() {
  const w = G.warn;
  if (!w || G.state !== "play") return;
  const x = P.x,
    y = P.y - (P.slide > 0 ? 70 : 125);
  const a = 0.6 + Math.sin(G.t * 16) * 0.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(20,0,0,.6)";
  rrect(-52, -15, 104, 30, 8);
  ctx.fill();
  ctx.strokeStyle = "#ff4a3a";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#ff6a5a";
  ctx.font = "700 13px Rajdhani,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(w === "jump" ? "▲ SALTA" : w === "slide" ? "▼ DESLIZA" : "◀ ▶ MUÉVETE", 0, 1);
  ctx.restore();
}

/** Velo de neblina con el color atmosférico de la zona entre y0 e y1. */
function haze(y0, y1, a) {
  const g = ctx.createLinearGradient(0, y0 - 120, 0, y1);
  g.addColorStop(0, `rgba(${ZONE.haze},0)`);
  g.addColorStop(1, `rgba(${ZONE.haze},${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(-10, y0 - 120, VW + 20, y1 - y0 + 122);
}
function render() {
  FX.frame++;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  const sh = G.shake;
  const sx = sh ? rnd(-sh, sh) * 0.6 : 0,
    sy = sh ? rnd(-sh, sh) * 0.6 : 0;
  ctx.setTransform(SC * DPR, 0, 0, SC * DPR, (OX + sx * SC) * DPR, (OY + sy * SC) * DPR);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-10, -10, VW + 20, VH + EXT + 20);
  ctx.clip();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  lights.length = 0;
  const s = G.scroll;
  // cielo de la zona actual (fundido entre zonas)
  const sky = ctx.createLinearGradient(0, 0, 0, VH);
  for (let i = 0; i < 6; i++) sky.addColorStop(SKY_STOPS[i], ZONE.sky[i]);
  ctx.fillStyle = sky;
  ctx.fillRect(-10, -10, VW + 20, VH + 20);
  // resplandor de horizonte
  {
    const hs = glowSpr(ZONE.hor);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18;
    ctx.drawImage(hs, VW * 0.3 - 520, 410 - 200, 1040, 400);
    ctx.globalAlpha = 0.13;
    ctx.drawImage(hs, VW * 0.85 - 420, 420 - 170, 840, 340);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  // luna desplazada para no quedar tapada por el panel de arma en pantallas estrechas
  const mx = VW * 0.64,
    my = 128;
  glow(mx, my, 260, ZONE.moon, 0.16);
  circ(mx, my, 36, `rgb(${ZONE.moon})`);
  circ(mx - 9, my - 6, 6, "rgba(120,100,90,.35)");
  circ(mx + 10, my + 9, 8, "rgba(120,100,90,.3)");
  circ(mx + 4, my - 14, 4, "rgba(120,100,90,.3)");
  const mg = ctx.createRadialGradient(mx - 10, my - 10, 5, mx, my, 36);
  mg.addColorStop(0, "rgba(0,0,0,0)");
  mg.addColorStop(1, "rgba(40,20,20,.5)");
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(mx, my, 34, 0, TAU);
  ctx.fill();
  drawLayer(LY.cl1, s * 0.02 + G.t * 6, 0);
  drawLayer(LY.far, s * 0.06, 0);
  // perspectiva atmosférica: cada plano lejano se funde con el color del aire de la zona
  haze(140, 400, 0.42);
  drawLayer(LY.cl2, s * 0.05 + G.t * 10, 0);
  drawLayer(LY.mid, s * 0.16, 0);
  if (FX.q > 0) haze(250, 440, 0.24);
  drawLayer(LY.near, s * 0.42, 0);
  if (FX.q > 0) haze(330, 452, 0.1);
  for (const d of decor) drawDecor(d);
  if (EXT > 0) {
    ctx.fillStyle = "#0b0a0c";
    ctx.fillRect(-10, VH - 2, VW + 20, EXT + 12);
  }
  drawLayer(LY.ground, s, GROUND - 16);
  for (const d of decals) ell(d.x, d.y, d.r, d.r * 0.22, d.c);
  for (const p of puddles) {
    const a = Math.min(1, p.life);
    ctx.globalAlpha = a;
    ell(p.x, GROUND + 4, p.w / 2, 8, "rgba(110,170,30,.65)");
    ell(p.x - 6, GROUND + 3, p.w / 3, 4, "rgba(200,255,100,.4)");
    ctx.globalAlpha = 1;
    glow(p.x, GROUND, p.w * 0.7, "150,255,50", 0.18 * a);
  }
  for (const o of obs) if (o.t !== "beam") drawObstacle(o);
  for (const p of pick_) drawPickup(p);
  for (const z of zs) if (z.dead) drawZombie(z);
  if (G.boss) drawBoss(G.boss);
  for (const z of zs) if (!z.dead) drawZombie(z);
  if (G.state !== "menu" || true) drawPlayer();
  for (const o of obs) if (o.t === "beam") drawObstacle(o);
  for (const e of ep) drawEP(e);
  drawParts(false);
  for (const b of bul) drawBullet(b);
  ctx.globalCompositeOperation = "lighter";
  drawParts(true);
  ctx.globalCompositeOperation = "source-over";
  // luces dinámicas (sprites cacheados en lugar de un degradado nuevo por luz y frame)
  for (let i = 0; i < lights.length; i += 5)
    blit(lightSpr(lights[i + 3]), lights[i], lights[i + 1], lights[i + 2], lights[i + 4], true);
  // primer plano en parallax rápido: da profundidad sin tapar al jugador
  if (FX.q > 0) drawLayer(LY.fg, s * 1.35, VH + EXT - LY.fg.lh + 6);
  // ash
  for (const a of ash) {
    if (a.ember) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,${(140 + Math.sin(a.ph * 3) * 60) | 0},60,${a.a})`;
    } else ctx.fillStyle = `rgba(180,170,165,${a.a * 0.6})`;
    ctx.fillRect(a.x, a.y, a.s, a.s);
    ctx.globalCompositeOperation = "source-over";
  }
  // ground fog
  const gf = ctx.createLinearGradient(0, GROUND - 40, 0, VH);
  gf.addColorStop(0, `rgba(${ZONE.haze},0)`);
  gf.addColorStop(0.4, `rgba(${ZONE.haze},.12)`);
  gf.addColorStop(1, "rgba(10,8,8,.55)");
  ctx.fillStyle = gf;
  ctx.fillRect(0, GROUND - 40, VW, VH - GROUND + 40);
  if (EXT > 0) {
    ctx.fillStyle = "rgba(10,8,8,.55)";
    ctx.fillRect(-10, VH, VW + 20, EXT + 10);
  }
  // floaters
  ctx.textAlign = "center";
  for (const f of floats) {
    ctx.globalAlpha = Math.min(1, f.life * 2);
    ctx.font = `700 ${f.sz}px Teko,Rajdhani,sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillText(f.txt, f.x + 1, f.y + 1);
    ctx.fillStyle = f.col;
    ctx.fillText(f.txt, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  drawWarn();
  // post
  ctx.drawImage(LY.vig.c, 0, 0, VW, VH + EXT);
  if (G.hurt > 0 || (P.hp < 30 && G.state === "play")) {
    ctx.globalAlpha = Math.max(
      G.hurt * 0.9,
      P.hp < 30 && G.state === "play" ? 0.25 + Math.sin(G.t * 5) * 0.12 : 0,
    );
    ctx.drawImage(LY.dmg.c, 0, 0, VW, VH + EXT);
    ctx.globalAlpha = 1;
  }
  if (G.flashW > 0) {
    ctx.fillStyle = `rgba(255,220,180,${G.flashW * 0.5})`;
    ctx.fillRect(0, 0, VW, VH + EXT);
  }
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = LY.grain;
  ctx.save();
  ctx.translate(rnd(-90, 0), rnd(-90, 0));
  ctx.fillRect(0, 0, VW + 100, VH + EXT + 100);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.restore();
}
