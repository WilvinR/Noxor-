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
addEventListener("keydown", (e) => {
  if (e.code === "KeyP" || e.code === "Escape") {
    togglePause();
    return;
  }
  const k = KEYMAP[e.code];
  if (k) {
    e.preventDefault();
    if (!e.repeat) press(k, 1);
  }
});
addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (k) press(k, 0);
});
cv.addEventListener("mousedown", (e) => {
  if (e.button === 0) K.fire = 1;
});
addEventListener("mouseup", () => {
  if (!isTouch) K.fire = 0;
});
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
