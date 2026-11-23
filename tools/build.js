/* Empaqueta game/ en un único HTML autónomo: dist/zona_muerta.html
 * (mismo formato de entrega que el original: un archivo que se abre con doble clic).
 * Uso: node tools/build.js */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "game");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, f) =>
  `<style>\n${fs.readFileSync(path.join(root, f), "utf8")}</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) =>
  `<script>\n${fs.readFileSync(path.join(root, f), "utf8")}</script>`);
fs.mkdirSync(path.join(__dirname, "..", "dist"), { recursive: true });
const out = path.join(__dirname, "..", "dist", "zona_muerta.html");
fs.writeFileSync(out, html);
console.log("OK →", path.relative(process.cwd(), out), (html.length / 1024).toFixed(0) + " KB");
