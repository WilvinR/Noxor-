/* Pruebas funcionales automatizadas de Zona Muerta (Playwright + Chromium).
 * Uso: node tests/gameplay.test.js [ruta-al-html]   (por defecto game/index.html) */
const { chromium, devices } = require("playwright");
const path = require("path");
const file = path.resolve(process.argv[2] || path.join(__dirname, "../game/index.html"));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ✔ " + m); } else { fail++; console.log("  ✘ " + m); } };
const wait = (pg, ms) => pg.waitForTimeout(ms);
// El reloj del juego limita dt a 34 ms: en equipos lentos avanza más despacio que el real,
// así que las esperas largas se hacen por condición, no por tiempo.
const until = (pg, fn, t = 15000) => pg.waitForFunction(fn, null, { timeout: t }).then(() => true, () => false);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("file://" + file);
  await wait(pg, 600);
  const ev = (f, a) => pg.evaluate(f, a);
  console.log("Menú e inicio");
  ok(await pg.isVisible("#menu"), "menú visible al cargar");
  await pg.keyboard.press("Enter");
  await wait(pg, 300);
  ok((await ev(() => G.state)) === "play", "Enter inicia la partida");
  ok(await pg.isVisible("#hud"), "HUD visible en juego");
  await ev(() => { P.inv = 1e9; G.zt = G.ot = G.pt = 1e9; zs = []; obs = []; });

  console.log("Salto, doble salto y búfer");
  await pg.keyboard.press("Space");
  await wait(pg, 120);
  ok((await ev(() => P.y)) < (await ev(() => GROUND)) - 20, "Espacio salta");
  await pg.keyboard.press("Space");
  await wait(pg, 60);
  ok((await ev(() => P.jumps)) === 2, "segundo Espacio en el aire = doble salto");
  await wait(pg, 1200);
  ok(await ev(() => P.ground), "aterriza en el suelo");
  await ev(() => { P.y = GROUND - 6; P.vy = 300; P.ground = false; P.jumps = 2; P.coy = 0; });
  await pg.keyboard.press("Space");
  await wait(pg, 140);
  ok((await ev(() => P.vy)) < 0 || (await ev(() => P.y)) < GROUND - 10, "salto pulsado justo antes de aterrizar se ejecuta (búfer)");
  await wait(pg, 1200);

  console.log("Deslizamiento y vigas");
  await pg.keyboard.press("KeyS");
  await wait(pg, 60);
  ok((await ev(() => P.slide)) > 0, "S desliza");
  ok((await ev(() => pbox().h)) < 60, "caja de colisión al deslizar cabe bajo una viga (60 px)");
  await ev(() => { P.inv = 0; P.hp = 100; obs.push({ t: "beam", x: P.x + 40, w: 120, h: 0, dmg: 18, hit: 0, hp: 30, seed: 1, top: GROUND - 230, bot: GROUND - 60 }); });
  await wait(pg, 500);
  ok((await ev(() => P.hp)) === 100, "deslizándose bajo la viga no recibe daño");
  await wait(pg, 900);
  await ev(() => { P.inv = 0; P.hp = 100; obs = [{ t: "beam", x: P.x + 30, w: 120, h: 0, dmg: 18, hit: 0, hp: 30, seed: 1, top: GROUND - 230, bot: GROUND - 60 }]; });
  await wait(pg, 300);
  ok((await ev(() => P.hp)) < 100, "de pie contra la viga sí recibe daño");
  await ev(() => { P.inv = 1e9; P.hp = 100; obs = []; });

  console.log("Disparo, recarga y armas");
  const mag0 = await ev(() => curA().mag);
  await pg.keyboard.down("KeyJ");
  await wait(pg, 400);
  await pg.keyboard.up("KeyJ");
  ok((await ev(() => curA().mag)) < mag0, "J dispara y consume munición");
  await pg.keyboard.press("KeyR");
  await wait(pg, 50);
  ok((await ev(() => P.rl)) > 0, "R recarga");
  ok(await until(pg, () => curA().mag === 12 && P.rl <= 0), "cargador lleno tras recargar");
  await ev(() => { giveWeapon("shotgun"); giveWeapon("rifle"); });
  await pg.keyboard.press("Digit1");
  ok((await ev(() => P.cur)) === "pistol", "tecla 1 selecciona pistola");
  await pg.keyboard.press("Digit3");
  ok((await ev(() => P.cur)) === "shotgun", "tecla 3 selecciona escopeta");
  await pg.keyboard.press("Digit5");
  ok((await ev(() => P.cur)) === "shotgun", "tecla de arma no poseída no cambia nada");
  await pg.keyboard.press("KeyQ");
  await wait(pg, 50);
  ok((await ev(() => P.cur)) === "rifle", "Q cicla a la siguiente arma poseída");

  console.log("Teclas superpuestas y ratón");
  await pg.keyboard.down("KeyA");
  await pg.keyboard.down("ArrowLeft");
  await pg.keyboard.up("KeyA");
  ok((await ev(() => K.left)) === 1, "soltar A con ← pulsada mantiene el movimiento");
  await pg.keyboard.up("ArrowLeft");
  ok((await ev(() => K.left)) === 0, "soltar ambas detiene el movimiento");
  await pg.mouse.move(640, 400);
  await pg.mouse.down();
  ok((await ev(() => K.fire)) === 1, "clic izquierdo dispara");
  await pg.mouse.up();
  ok((await ev(() => K.fire)) === 0, "soltar el clic deja de disparar");

  console.log("Pausa");
  await pg.keyboard.press("KeyP");
  ok((await ev(() => G.state)) === "paused" && (await pg.isVisible("#pause")), "P pausa y muestra menú de pausa");
  const d0 = await ev(() => G.dist);
  await wait(pg, 300);
  ok((await ev(() => G.dist)) === d0, "el juego se congela en pausa");
  ok((await pg.$$eval("#keysPause .k", (e) => e.length)) > 0, "la pausa muestra los controles");
  await pg.keyboard.press("Escape");
  ok((await ev(() => G.state)) === "play", "Esc reanuda");

  console.log("Zonas y niveles");
  await ev(() => { G.dist = 405; });
  await wait(pg, 200);
  ok((await ev(() => G.lvl)) === 2 && (await ev(() => ZONE.i)) === 1, "a 400 m: nivel 2 y zona 2");
  ok(await until(pg, () => ZONE.t === 1), "el fundido de zona termina");

  console.log("Jefe");
  await ev(() => { G.dist = G.nextBoss; });
  await wait(pg, 200);
  ok(await ev(() => !!G.boss), "aparece el jefe al llegar a su distancia");
  ok(await pg.isVisible("#bossBar"), "barra de jefe visible");
  const ov = await ev(() => { const a = $("bossBar").getBoundingClientRect(), h = $("hint").getBoundingClientRect(), bn = $("banner").getBoundingClientRect(); return a.bottom <= bn.top + 1 && bn.bottom <= h.top + 1; });
  ok(ov, "barra de jefe, anuncio y consejo no se solapan");
  await ev(() => { G.boss.x = VW - 200; G.boss.st = "idle"; hurtBoss(G.boss, 1e7, G.boss.x, G.boss.y - 50); });
  await until(pg, () => G.bossesK === 1);
  ok((await ev(() => G.bossesK)) === 1 && !(await ev(() => !!G.boss)), "derrotar al jefe suma y lo elimina");
  ok((await ev(() => pick_.filter((p) => p.kind === "weapon").length)) >= 1, "el jefe suelta un arma");

  console.log("Derrota, récord y reinicio");
  await ev(() => { P.inv = 0; P.hp = 1; hurtPlayer(80); });
  ok(await until(pg, () => !$("over").classList.contains("hidden")), "pantalla de derrota");
  ok((await pg.textContent("#oReach")).includes("NIVEL"), "derrota muestra nivel y zona alcanzados");
  ok((await ev(() => JSON.parse(localStorage.getItem("zm_save")).best)) > 0, "récord guardado en localStorage");
  await pg.keyboard.press("Enter");
  await wait(pg, 200);
  ok((await ev(() => G.state)) === "play" && (await ev(() => P.hp)) === 100, "Enter reinicia una partida limpia");
  await pg.click("#pauseBtn");
  await pg.click("#quitBtn");
  ok(await pg.isVisible("#menu"), "Salir vuelve al menú");
  ok((await pg.textContent("#bestMenu")).includes("RÉCORD"), "el menú muestra el récord");

  console.log("Redimensionado");
  await pg.setViewportSize({ width: 900, height: 700 });
  await wait(pg, 300);
  await pg.setViewportSize({ width: 1920, height: 1080 });
  await wait(pg, 300);
  ok((await ev(() => VW)) > 0, "redimensionado sin errores");

  console.log("Móvil (táctil)");
  const mc = await b.newContext({ ...devices["Pixel 7 landscape"] });
  const m = await mc.newPage();
  m.on("pageerror", (e) => errs.push("móvil: " + e.message));
  await m.goto("file://" + file);
  await wait(m, 500);
  await m.tap("#playBtn");
  await wait(m, 300);
  ok(await m.isVisible("#touch"), "controles táctiles visibles");
  const fire = await m.$("#tFire");
  const bb = await fire.boundingBox();
  await m.dispatchEvent("#tFire", "pointerdown", { pointerId: 1, pointerType: "touch" });
  ok((await m.evaluate(() => K.fire)) === 1, "botón FUEGO dispara");
  await m.dispatchEvent("#tFire", "pointerup", { pointerId: 1, pointerType: "touch" });
  ok((await m.evaluate(() => K.fire)) === 0, "soltar FUEGO deja de disparar");
  ok(bb.width >= 44, "botón FUEGO con tamaño táctil suficiente");

  console.log("Calidad adaptativa");
  const q = await ev(() => FX.q);
  ok(q >= 0 && q <= 2, "nivel de calidad válido (" + q + ")");

  ok(errs.length === 0, "sin errores de JavaScript" + (errs.length ? ": " + errs.join(" | ") : ""));
  await b.close();
  console.log(`\n${pass} correctas, ${fail} fallidas`);
  process.exit(fail ? 1 : 0);
})();
