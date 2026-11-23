"use strict";
/* ================== UI ================== */
const UI = {};
function refreshWeaponUI() {
  const ic = $("wIcon"),
    x = ic.getContext("2d");
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, ic.width, ic.height);
  const sc = P.cur === "rocket" ? 1.6 : P.cur === "sniper" ? 1.75 : 2.4;
  x.setTransform(1, 0, 0, 1, ic.width / 2 - (WEAP[P.cur].len * sc) / 2 + 8, ic.height / 2 + 4);
  drawGun(x, P.cur, sc);
  $("wName").textContent = WEAP[P.cur].n;
  const sl = $("slots");
  sl.innerHTML = "";
  for (const k of WORDER) {
    const i = document.createElement("i");
    if (P.arms[k] && P.arms[k].own) i.className = "own";
    if (k === P.cur) i.className = "cur";
    sl.appendChild(i);
  }
  UI.w = P.cur;
}
function setTxt(id, v) {
  if (UI[id] !== v) {
    UI[id] = v;
    $(id).textContent = v;
  }
}
function updateHUD() {
  if (G.state === "menu") return;
  document.body.classList.toggle("boss", !!G.boss);
  const hp = Math.max(0, Math.ceil(P.hp));
  setTxt("hpTxt", hp);
  const pc = hp + "%";
  if (UI.hpw !== pc) {
    UI.hpw = pc;
    $("hpFill").style.width = pc;
    $("hpGhost").style.width = pc;
  }
  $("hpBox").classList.toggle("low", hp < 30);
  const d = Math.floor(G.dist);
  if (UI.d !== d) {
    UI.d = d;
    $("dist").innerHTML = d.toLocaleString("es") + "<small>m</small>";
  }
  setTxt("kills", G.kills);
  setTxt("lvl", G.lvl);
  setTxt("score", Math.floor(G.score).toLocaleString("es"));
  const mult = 1 + Math.floor(G.combo / 5);
  const ct = G.combo >= 3 ? `${G.combo} BAJAS · x${mult}` : "";
  setTxt("combo", ct);
  $("combo").classList.toggle("on", G.combo >= 3);
  const a = curA();
  setTxt("mag", P.rl > 0 ? "···" : a.mag);
  setTxt("res", " / " + (a.res === Infinity ? "∞" : a.res));
  $("ammo").classList.toggle("empty", a.mag === 0 && P.rl <= 0);
  $("rlFill").style.width = P.rl > 0 ? 100 * (1 - P.rl / curW().rl) + "%" : "0%";
  if (UI.w !== P.cur) refreshWeaponUI();
  if (G.boss) {
    $("bossFill").style.width = (100 * G.boss.hp) / G.boss.max + "%";
  }
}

function showScreen(id) {
  ["menu", "pause", "over"].forEach((s) => $(s).classList.toggle("hidden", s !== id));
}
function startGame() {
  audioInit();
  HQ.length = 0;
  $("hint").classList.remove("on");
  resetGame();
  showScreen(null);
  $("hud").classList.remove("hidden");
  if (isTouch) $("touch").classList.remove("hidden");
  UI.d = -1;
  UI.hpw = "";
  Object.keys(UI).forEach((k) => delete UI[k]);
  refreshWeaponUI();
  setZone(0, true);
  banner("CORRE", "ZONA 1 · " + ZONES[0].name);
  last = performance.now();
}
function showOver() {
  if (G.state !== "dead") return;
  showScreen("over");
  $("touch").classList.add("hidden");
  $("hud").classList.add("hidden");
  const d = Math.floor(G.dist),
    sc = Math.floor(G.score);
  $("oDist").textContent = d.toLocaleString("es");
  $("oKills").textContent = G.kills;
  $("oBoss").textContent = G.bossesK;
  $("oScore").textContent = sc.toLocaleString("es");
  const rec = sc > (store.best || 0);
  if (rec) {
    store.best = sc;
    store.bestD = d;
    save();
  }
  $("newRec").classList.toggle("hidden", !rec);
  $("oReach").textContent = "NIVEL " + G.lvl + " · " + ZONES[ZONE.i].name;
  $("bestOver").textContent =
    "MEJOR: " +
    (store.best || 0).toLocaleString("es") +
    " PTS · " +
    (store.bestD || 0).toLocaleString("es") +
    " M";
}
function togglePause() {
  if (G.state === "play") {
    G.state = "paused";
    showScreen("pause");
    if (AU.flameG) AU.flameG.gain.setTargetAtTime(0, AU.c.currentTime, 0.03);
    releaseAll();
  } else if (G.state === "paused") {
    G.state = "play";
    showScreen(null);
    last = performance.now();
  }
}
function toMenu() {
  G.state = "menu";
  P = {
    x: 200,
    y: GROUND,
    vy: 0,
    ground: true,
    slide: 0,
    hp: 100,
    inv: 0,
    phase: 0,
    cur: "pistol",
    recoil: 0,
    aim: 0,
    arms: { pistol: { own: 1, mag: 12, res: Infinity } },
    dead: 0,
  };
  zs = [];
  obs = [];
  bul = [];
  ep = [];
  pick_ = [];
  G.boss = null;
  setZone(0, true);
  showScreen("menu");
  $("hud").classList.add("hidden");
  $("touch").classList.add("hidden");
  setBest();
}
function setBest() {
  $("bestMenu").textContent = store.best
    ? "RÉCORD: " +
      store.best.toLocaleString("es") +
      " PTS · " +
      (store.bestD || 0).toLocaleString("es") +
      " M"
    : "";
}
function isFS() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function goFS(user) {
  if (isFS()) return;
  const el = document.documentElement;
  const rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!rq) {
    if (user) toast("Este navegador no permite pantalla completa aquí");
    return;
  }
  try {
    const r = rq.call(el, { navigationUI: "hide" });
    const after = () => {
      try {
        screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape").catch(() => {});
      } catch (e) {}
    };
    if (r && r.then)
      r.then(after).catch(() => {
        if (user) toast("No se pudo activar pantalla completa");
      });
    else after();
  } catch (e) {
    if (user) toast("No se pudo activar pantalla completa");
  }
}
function toggleFS() {
  if (isFS()) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else goFS(true);
}
document.addEventListener("fullscreenchange", () => setTimeout(resize, 150));
document.addEventListener("webkitfullscreenchange", () => setTimeout(resize, 150));
$("fsBtn").onclick = (e) => {
  e.stopPropagation();
  toggleFS();
};
$("fsBtn2").onclick = () => toggleFS();
$("playBtn").onclick = () => {
  if (isTouch) goFS(false);
  startGame();
};
$("againBtn").onclick = () => {
  if (isTouch) goFS(false);
  startGame();
};
$("menuBtn").onclick = toMenu;
$("quitBtn").onclick = toMenu;
$("resumeBtn").onclick = togglePause;
$("pauseBtn").onclick = (e) => {
  e.stopPropagation();
  togglePause();
};
$("sndBtn").onclick = () => {
  audioInit();
  setSound(!AU.on);
};
$("sndBtn2").onclick = () => setSound(!AU.on);
/** Panel de controles (menú y pausa), adaptado a teclado o a pantalla táctil. */
function setKeysInfo() {
  const kb = (...k) => k.map((x) => `<kbd>${x}</kbd>`).join("");
  const rows = isTouch
    ? [
        ["◀ ▶", "moverse"],
        ["▲", "saltar · 2 toques: doble salto"],
        ["▼", "deslizarse / caída rápida"],
        ["FUEGO", "mantén para disparar"],
        ["ARMA", "cambiar de arma"],
        ["❚❚", "pausa"],
      ]
    : [
        [kb("A", "D"), "moverse"],
        [kb("W", "Espacio"), "saltar · doble salto"],
        [kb("S"), "deslizarse / caída rápida"],
        [kb("J") + " / clic", "disparar (mantén)"],
        [kb("Q") + " " + kb("1-7"), "cambiar / elegir arma"],
        [kb("R"), "recargar"],
        [kb("P") + " " + kb("Esc"), "pausa"],
        [kb("Enter"), "jugar / continuar"],
      ];
  const html = rows.map(([k, t]) => `<div class="k"><span>${k}</span><span>${t}</span></div>`).join("");
  $("keysInfo").innerHTML = html;
  $("keysPause").innerHTML = html;
}
setKeysInfo();
document.addEventListener("visibilitychange", () => {
  if (document.hidden && G.state === "play") togglePause();
});
// redimensionado con espera: en móvil la barra del navegador dispara decenas de eventos
// y cada uno reconstruía todas las capas del escenario
let rsT = 0;
addEventListener("resize", () => {
  clearTimeout(rsT);
  rsT = setTimeout(resize, 120);
});
