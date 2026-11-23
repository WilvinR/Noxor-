"use strict";
/* ================== BASE ================== */
const cv = document.getElementById("c"),
  ctx = cv.getContext("2d");
const VH = 540,
  GROUND = 452;
let VW = 960,
  SC = 1,
  OX = 0,
  OY = 0,
  DPR = 1,
  RES = 1,
  EXT = 0;
const PI = Math.PI,
  TAU = PI * 2;
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function mulberry(s) {
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const $ = (id) => document.getElementById(id);
const PMIN0 = 70;
let PMIN = 70,
  PSTART = 200;
const isTouch = "ontouchstart" in window || matchMedia("(pointer:coarse)").matches;
let store = {};
try {
  store = JSON.parse(localStorage.getItem("zm_save") || "{}");
} catch (e) {}
function save() {
  try {
    localStorage.setItem("zm_save", JSON.stringify(store));
  } catch (e) {}
}
