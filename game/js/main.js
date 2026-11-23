"use strict";
/* ================== LOOP ================== */
let last = performance.now();
function frame(now) {
  const raw = (now - last) / 1000;
  let dt = Math.min(0.034, raw);
  qualityTick(Math.min(raw, 0.1));
  last = now;
  if (G.slowT > 0) {
    G.slowT -= dt;
    if (G.slowT <= 0) G.slow = 1;
  }
  if (G.state !== "paused") zoneTick(dt);
  if (G.state !== "paused") {
    // menu attract: player runs
    if (G.state === "menu") {
      P.phase += dt * 10;
      P.y = GROUND;
      P.ground = true;
      P.hipY = -46;
    }
    update(dt * G.slow);
  }
  render();
  updateHUD();
  requestAnimationFrame(frame);
}
resize();
setSound(AU.on);
setBest();
requestAnimationFrame(frame);
