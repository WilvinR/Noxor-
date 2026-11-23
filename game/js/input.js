"use strict";
/* ================== INPUT ================== */
const K = { left: 0, right: 0, jump: 0, slide: 0, fire: 0, swap: 0, jp: 0, sp: 0, wp: 0, rp: 0 };
const KEYMAP = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
  ArrowDown: "slide",
  KeyS: "slide",
  KeyJ: "fire",
  KeyK: "fire",
  KeyF: "fire",
  ControlLeft: "fire",
  KeyQ: "swap",
  KeyE: "swap",
  KeyR: "reload",
};
/** Teclas físicas pulsadas. Una acción sigue activa mientras quede alguna de sus teclas
 *  (antes, soltar A con ← aún pulsada detenía el movimiento). */
const HELD = new Set();
function press(k, v) {
  if (k === "jump" && v && !K.jump) K.jp = 1;
  if (k === "slide" && v && !K.slide) K.sp = 1;
  if (k === "swap" && v && !K.swap) K.wp = 1;
  if (k === "reload") {
    if (v) K.rp = 1;
    return;
  }
  K[k] = v ? 1 : 0;
}
function keyHeld(k) {
  for (const c of HELD) if (KEYMAP[c] === k) return true;
  return false;
}
function releaseAll() {
  HELD.clear();
  for (const k in K) K[k] = 0;
}
addEventListener("keydown", (e) => {
  if (e.code === "KeyP" || e.code === "Escape") {
    togglePause();
    return;
  }
  // Enter: jugar / reintentar / continuar sin ratón
  if (e.code === "Enter" && !e.repeat && document.activeElement?.tagName !== "BUTTON") {
    if (G.state === "menu" || (G.state === "dead" && !$("over").classList.contains("hidden"))) startGame();
    else if (G.state === "paused") togglePause();
    return;
  }
  // 1-7: selección directa de arma
  const dg = /^Digit([1-7])$/.exec(e.code);
  if (dg && G.state === "play") {
    selectW(WORDER[+dg[1] - 1]);
    return;
  }
  const k = KEYMAP[e.code];
  if (k) {
    e.preventDefault();
    if (!e.repeat) {
      HELD.add(e.code);
      press(k, 1);
    }
  }
});
addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  HELD.delete(e.code);
  if (!keyHeld(k)) press(k, 0);
});
// al perder el foco no deben quedar teclas "pegadas"
addEventListener("blur", releaseAll);
// Ratón: sólo el puntero de tipo ratón dispara/para (el original dejaba el disparo
// bloqueado en portátiles con pantalla táctil porque ignoraba el mouseup).
cv.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button === 0) K.fire = 1;
});
addEventListener("pointerup", (e) => {
  if (e.pointerType === "mouse" && e.button === 0) K.fire = 0;
});
// Primer toque en un equipo detectado como no táctil: activa los controles táctiles.
addEventListener(
  "touchstart",
  () => {
    if (isTouch) return;
    isTouch = true;
    if (G.state === "play" || G.state === "paused") $("touch").classList.remove("hidden");
    setKeysInfo();
    resize();
  },
  { passive: true },
);
cv.addEventListener("contextmenu", (e) => e.preventDefault());
document.querySelectorAll(".tb").forEach((b) => {
  const k = b.dataset.k;
  const on = (e) => {
    e.preventDefault();
    audioInit();
    try {
      b.setPointerCapture(e.pointerId);
    } catch (_) {}
    b.classList.add("on");
    press(k, 1);
  };
  const off = (e) => {
    b.classList.remove("on");
    press(k, 0);
  };
  b.addEventListener("pointerdown", on);
  b.addEventListener("pointerup", off);
  b.addEventListener("pointercancel", off);
  b.addEventListener("lostpointercapture", off);
});
