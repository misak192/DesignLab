/**
 * File: src/components/display/BackgroundHost.tsx (ported from LoreLyst unchanged except imports)
 * Description: Draws the chosen background. One full-viewport WebGL canvas, mounted once in the root layout
 * (see AuraBackground), with one small program per engine (shaders.ts) built the first time it is picked and
 * kept. SCENERY (the photograph) and OFF are not drawn here.
 *
 * EVERY background is STILL at rest and only MOVES when something happens: a click on something that DOES something (a
 * title, a row, a button, a link: never a tap on empty page, never a touch that is really a scroll or a swipe), a page change,
 * a node opening in the explorer. An action never changes a size or a brightness (no swelling, no flashing); it only pushes
 * the engine's clock (uTime) and a drift counter (uPage) forward by a set distance, and both are SPRING-SMOOTHED: they
 * ease in, ease out and carry on along their path, so several taps in a row glide on rather than jerk. A cap stops a
 * burst of taps from queueing more than twice one action's distance, and taps closer together than a quarter of a second
 * count once. MOTION decides how far one action moves things (engines.ts, MOTION_FEEL):
 *   OFF     nothing ever moves: one still frame, redrawn only when the skin, the size or the choice changes;
 *   NORMAL  a tiny nudge;
 *   COLOUR  the same nudge, with the saturation pulsing up and settling back over a second;
 *   OTT     things move visibly, then ease to a stop.
 * There is no animation loop at all between actions. If frames run slow (an old machine, a huge screen) the render
 * scale steps down, only while something is moving.
 *
 * NEXUS alone listens for more: a tap sets off a small star in the sky away from your finger, and it draws the
 * visitor's ELI-MEs as stars and pillar clusters (bgEvents.ts).
 *
 * The colours are the skin's six node colours, read from the page (inside .fw-aura, so gold's and minimal's deeper
 * aura ramps apply) and tweened over 600 ms when the skin or light mode changes. The loop pauses when the tab is
 * hidden, is capped at 30 frames a second, and for visitors who ask for reduced motion draws single frames and never
 * starts. No WebGL: the page colour stays.
 */
"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ACTION_MS, CLUSTER_ANCHORS, INTENSITY_STRENGTH, MAX_STARS, MOTION_FEEL, type BgEngine, type BgIntensity } from "@/lib/display/background/engines";
import { SOURCES, fragmentFor } from "@/lib/display/background/shaders";
import { getCounts, getStars, onBgEvent, onStarsChange } from "@/lib/display/background/bgEvents";

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
const SKIN_VARS = ["--node-1", "--node-2", "--node-3", "--node-4", "--node-5", "--node-6"];
const UNIFORMS = ["uRes", "uTime", "uDark", "uS", "uSat", "uAmp", "uPage", "uBg", "uC[0]", "uStarA[0]", "uStarB[0]", "uNova[0]", "uClA", "uClB"];
/** The spring that carries the clock and the page drift: critically damped, so it eases in, eases out and never overshoots. */
const SPRING = 5.5;

/** What counts as an action: a click on anything that acts. The click event does not fire for a scroll or a swipe, so reading on a tablet never moves the background. */
const ACTIONABLE = "a[href],button,[role='button'],[role='link'],[role='tab'],summary,label,select,input,.fw-row,.fw-nexus-card,.fw-icon-btn,.fw-cbtn";

type RGB = [number, number, number];
interface Prog { prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null> }
interface Live { engine: BgEngine; intensity: BgIntensity; motion: string }
interface Nova { x: number; y: number; at: number; ci: number }

/** Any CSS colour (hex, rgb, color-mix, color(srgb …)) as 0–1 RGB, by painting one pixel. */
function toRgb(ctx: CanvasRenderingContext2D, css: string): RGB {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}

export default function BackgroundHost({ engine, intensity, motion }: Live) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ set: (l: Live) => void; page: () => void } | null>(null);
  const live = useRef<Live>({ engine, intensity, motion });
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => { api.current?.set({ engine, intensity, motion }); }, [engine, intensity, motion]);
  useEffect(() => {
    if (firstPath.current) { firstPath.current = false; return; }
    api.current?.page();
  }, [pathname]);

  useEffect(() => {
    const holder = host.current;
    if (!holder) return;
    // A fresh canvas for every mount, never React's own element: once a canvas has had loseContext() called on it
    // (which cleanup must do), getContext() on it hands back the dead context and the canvas paints solid white.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    holder.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) as WebGLRenderingContext | null;
    if (!gl) { canvas.remove(); return; }

    const progs = new Map<string, Prog | null>();
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const getProg = (id: string): Prog | null => {
      if (progs.has(id)) return progs.get(id) ?? null;
      let out: Prog | null = null;
      const frag = fragmentFor(id);
      if (frag) {
        const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, frag);
        if (vs && fs) {
          const prog = gl.createProgram()!;
          gl.attachShader(prog, vs); gl.attachShader(prog, fs);
          gl.bindAttribLocation(prog, 0, "p");
          gl.linkProgram(prog);
          if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            const loc: Record<string, WebGLUniformLocation | null> = {};
            UNIFORMS.forEach((n) => { loc[n] = gl.getUniformLocation(prog, n); });
            out = { prog, loc };
          }
        }
      }
      progs.set(id, out);
      return out;
    };
    const initBuffers = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    };
    initBuffers();

    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const probe = document.createElement("canvas"); probe.width = probe.height = 1;
    const pctx = probe.getContext("2d", { willReadFrequently: true })!;

    // ---- state ---------------------------------------------------------------------------------
    let cur: Live = live.current;
    let dark = 1;
    let bg: RGB = [0, 0, 0];
    let from: RGB[] = [], shown: RGB[] = [], to: RGB[] = [];
    let tweenStart = 0;
    // The engine's clock and the page drift: each is a spring (position, velocity) chasing a target that an action moves on.
    let clock = 0, clockV = 0, clockT = 0;
    let page = 0, pageV = 0, pageT = 0;
    // The last action, for COLOUR's saturation pulse; and when the last distance was queued (taps closer than 250 ms count once).
    let bumpAt = -1e9, lastQueued = -1e9;
    const novas: Nova[] = [];
    const clus = [0, 0, 0, 0, 0, 0];
    // Render scale steps down if frames run slow (only counted while something is moving), never below half of the engine's own.
    let quality = 1, slow = 0;
    let raf = 0, last = 0, lastT = performance.now(), w = 2, h = 2;
    const feelOf = () => (REDUCED ? MOTION_FEEL.off : MOTION_FEEL[cur.motion] ?? MOTION_FEEL.normal);

    /** Queue one action's worth of movement: the targets move on, capped at twice that distance ahead of where the springs are. */
    const queue = (now: number, pageToo: boolean) => {
      bumpAt = now;
      const feel = feelOf();
      if (feel.move === 0 || now - lastQueued < 250) return;
      lastQueued = now;
      const inc = feel.move * (SOURCES[cur.engine]?.speed ?? 1);
      clockT = Math.min(clockT + inc, clock + inc * 2);
      if (pageToo) pageT = Math.min(pageT + feel.pageStep, page + feel.pageStep * 2);
    };

    // ---- the skin: six colours, the page colour, and light/dark ------------------------------------
    const readSkin = (first: boolean) => {
      const scope = (document.querySelector(".fw-aura") as HTMLElement | null) ?? document.body;
      const span = document.createElement("span");
      span.style.position = "absolute"; span.style.visibility = "hidden";
      scope.appendChild(span);
      const get = (v: string) => { span.style.color = `var(${v})`; return toRgb(pctx, getComputedStyle(span).color); };
      to = SKIN_VARS.map(get);
      bg = get("--background");
      scope.removeChild(span);
      dark = document.body.classList.contains("light-mode") ? 0 : 1;
      if (first || REDUCED) { shown = to.map((c) => [...c] as RGB); from = shown; tweenStart = -1e9; }
      else { from = shown.map((c) => [...c] as RGB); tweenStart = performance.now(); }
      kick();
    };

    // ---- drawing ---------------------------------------------------------------------------------
    const starA = new Float32Array(MAX_STARS * 4);
    const starB = new Float32Array(MAX_STARS * 4);
    const novaData = new Float32Array(12);

    const draw = (now: number) => {
      const p = getProg(cur.engine);
      if (!p) { gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
      const feel = feelOf();
      const still = feel.move === 0;
      const def = SOURCES[cur.engine];
      gl.useProgram(p.prog);
      const L = p.loc;
      gl.uniform2f(L.uRes, w, h);
      gl.uniform1f(L.uTime, clock);
      gl.uniform1f(L.uDark, dark);
      gl.uniform1f(L.uS, INTENSITY_STRENGTH[cur.intensity] * (def?.gain ?? 1));
      // COLOUR: the saturation pulses up and settles back over a second after an action; every other level stays at 1.
      const age = Math.min(1, Math.max(0, (now - bumpAt) / ACTION_MS));
      gl.uniform1f(L.uSat, 1 + (feel.sat - 1) * Math.sin(Math.PI * age));
      gl.uniform1f(L.uAmp, feel.amp);
      gl.uniform1f(L.uPage, page);
      gl.uniform3f(L.uBg, bg[0], bg[1], bg[2]);
      gl.uniform3fv(L["uC[0]"], new Float32Array(shown.flat()));
      if (def?.stars && L["uStarA[0]"]) {
        const asp = window.innerWidth / window.innerHeight;
        const anchor = (i: number): [number, number] => [(CLUSTER_ANCHORS[i][0] - 0.5) * asp, 0.5 - CLUSTER_ANCHORS[i][1]];
        const stars = getStars();
        for (let i = 0; i < MAX_STARS; i++) {
          const s = stars[i];
          if (!s) { starA.set([0, 0, -1, 0], i * 4); starB.set([-1, 0, -99, -99], i * 4); continue; }
          const [ax, ay] = anchor(s.pillar);
          // A still page (MOTION off) shows every star as it ends up: grown, with no explosion in progress.
          const born = still ? 99 : (now - s.born) / 1000;
          const boom = s.boom && !still ? Math.min(30, (now - s.boom) / 1000) : 30;
          let prev: (typeof stars)[number] | undefined;
          for (let j = i - 1; j >= 0; j--) if (stars[j].pillar === s.pillar) { prev = stars[j]; break; }
          const pa = prev ? anchor(prev.pillar) : null;
          starA.set([ax + s.ox, ay + s.oy, born, s.pillar], i * 4);
          starB.set([boom, s.level, prev && pa ? pa[0] + prev.ox : -99, prev && pa ? pa[1] + prev.oy : -99], i * 4);
        }
        gl.uniform4fv(L["uStarA[0]"], starA);
        gl.uniform4fv(L["uStarB[0]"], starB);
        for (let i = 0; i < 3; i++) {
          const n = novas[i], a = n ? (now - n.at) / 1000 : -1;
          novaData.set(n && a < 2.4 && !still ? [n.x, n.y, a, n.ci] : [0, 0, -1, 0], i * 4);
        }
        gl.uniform4fv(L["uNova[0]"], novaData);
        gl.uniform4f(L.uClA, clus[0], clus[1], clus[2], clus[3]);
        gl.uniform4f(L.uClB, clus[4], clus[5], 0, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /** One step of a critically damped spring toward its target (sub-stepped, so a long frame stays stable). */
    const spring = (x: number, v: number, target: number, dt: number): [number, number] => {
      const n = Math.max(1, Math.ceil(dt / 0.012)), d = dt / n;
      for (let i = 0; i < n; i++) { v += ((target - x) * SPRING * SPRING - 2 * SPRING * v) * d; x += v * d; }
      return Math.abs(target - x) < 0.0005 && Math.abs(v) < 0.0005 ? [target, 0] : [x, v];
    };

    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      if (now - last < 33) { raf = requestAnimationFrame(frame); return; }
      last = now;
      const raw = (now - lastT) / 1000;
      const dt = Math.min(0.1, raw); lastT = now;
      const feel = feelOf();
      const def = SOURCES[cur.engine];
      if (feel.move === 0) { clock = clockT = page = pageT = 0; clockV = pageV = 0; }
      else { [clock, clockV] = spring(clock, clockV, clockT, dt); [page, pageV] = spring(page, pageV, pageT, dt); }
      const moving = clock !== clockT || page !== pageT;
      // Slow frames while moving: step the render scale down (a long gap is a throttled tab, not a slow machine).
      if (moving && !document.hidden && raw < 0.4) {
        slow = raw > 0.055 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 10 && quality > 0.5) { quality = Math.max(0.5, quality * 0.8); slow = 0; resize(); }
      }
      // The pillar clusters fade in and out as the ELI-MEs in them come and go.
      let clusBusy = false;
      const counts = def?.stars ? getCounts() : [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 6; i++) {
        const target = counts[i] > 0 ? Math.min(1, 0.35 + 0.12 * counts[i]) : 0;
        clus[i] = feel.move === 0 ? target : clus[i] + (target - clus[i]) * (1 - Math.exp(-dt * 1.6));
        if (Math.abs(target - clus[i]) < 0.005) clus[i] = target; else clusBusy = true;
      }
      const f = Math.min(1, (now - tweenStart) / 600);
      shown = to.map((c, i) => c.map((v, j) => from[i][j] + (v - from[i][j]) * f) as RGB);
      draw(now);
      const starsBusy = feel.move > 0 && !!def?.stars && (clusBusy || novas.some((n) => now - n.at < 2400) || getStars().some((q) => now - q.born < 2500 || (q.boom > 0 && now - q.boom < 4200)));
      const pulse = feel.sat > 1 && now - bumpAt < ACTION_MS;
      if (moving || f < 1 || starsBusy || pulse) raf = requestAnimationFrame(frame);
    };
    function kick() {
      if (REDUCED) { draw(performance.now()); return; }
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const resize = () => {
      // Every engine is soft, so about half resolution scaled up is invisible and a quarter of the GPU work.
      const k = Math.min(SOURCES[cur.engine]?.res ?? 0.5, 1400 / window.innerWidth, 900 / window.innerHeight) * quality;
      w = Math.max(2, Math.round(window.innerWidth * k)); h = Math.max(2, Math.round(window.innerHeight * k));
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
      kick();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || !target.closest || !target.closest(ACTIONABLE)) return;
      const now = performance.now(), W = window.innerWidth, H = window.innerHeight;
      queue(now, false);
      // NEXUS: a click sets off a small star right where it landed (see novaLight in shaders.ts).
      if (SOURCES[cur.engine]?.stars && feelOf().move > 0) {
        // A keyboard "click" has no position: treat it as the middle of the screen.
        const px = e.detail === 0 ? W / 2 : e.clientX, py = e.detail === 0 ? H / 2 : e.clientY;
        novas.unshift({ x: (px - W / 2) / H, y: -(py - H / 2) / H, at: now, ci: Math.floor(Math.random() * 6) });
        if (novas.length > 3) novas.length = 3;
      }
      kick();
    };
    const step = () => { queue(performance.now(), true); kick(); };

    api.current = {
      set: (l) => { const was = SOURCES[cur.engine]?.res; cur = l; if (SOURCES[l.engine]?.res !== was) resize(); kick(); },
      page: step,
    };
    const offBus = onBgEvent((e) => { if (e.type === "open") step(); else if (e.type === "elime") kick(); });
    const offStars = onStarsChange(() => kick());
    const onLost = (e: Event) => { e.preventDefault(); if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    const onRestored = () => { progs.clear(); initBuffers(); kick(); };

    readSkin(true); resize();
    const mo = new MutationObserver(() => readSkin(false));
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", resize);
    window.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("visibilitychange", kick);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      cancelAnimationFrame(raf); mo.disconnect(); api.current = null; offBus(); offStars();
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", kick);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="absolute inset-0 pointer-events-none" />;
}
