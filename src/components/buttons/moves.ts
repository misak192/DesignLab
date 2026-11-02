/**
 * File: src/components/buttons/moves.ts
 * Description: What happens when a button is pressed, one function per MoveKind (see src/lib/buttons/options.ts). Everything is
 * drawn with the Web Animations API, so a press can be repeated at any moment and every animation ends back at the resting
 * word (no fill is held). Light is made of gradients on small elements added to the button's overlay for about a second and
 * then removed; nothing is a box, border or fill behind the word. Client only (it reads the DOM).
 */
import type { MoveSpec, Shape } from '@/lib/buttons/options';

export interface Ctx {
  btn: HTMLElement;
  /** The word: letters (`.fw-kb__l`) in a row. */
  word: HTMLElement;
  letters: HTMLElement[];
  /** The overlay over the button where particles and clones live. */
  fx: HTMLElement;
  /** The press point, in px from the button's top left. */
  px: number;
  py: number;
  w: number;
  h: number;
  /** 1 normally, more at OTT. */
  amp: number;
  /** 1 normally, below 1 for slow motion. */
  speed: number;
  c: string;
  hi: string;
  lo: string;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/** Animate with the lab's easing, slowed by `speed`, and hold the first frame during a delay. */
function go(c: Ctx, el: Element, frames: Keyframe[], ms: number, opts: KeyframeAnimationOptions = {}): Animation {
  const delay = (opts.delay ?? 0) / c.speed;
  return el.animate(frames, { duration: ms / c.speed, easing: EASE, fill: 'backwards', ...opts, delay });
}

const tones = (c: Ctx) => [c.c, c.hi, c.lo, '#ffffff'] as const;

function bg(shape: Shape, tone: string): string {
  switch (shape) {
    case 'star':
      return `radial-gradient(circle, #fff 0 14%, ${tone} 28%, transparent 62%), linear-gradient(90deg, transparent 8%, ${tone} 50%, transparent 92%) center / 100% 7% no-repeat, linear-gradient(0deg, transparent 8%, ${tone} 50%, transparent 92%) center / 7% 100% no-repeat`;
    case 'orb':
      return `radial-gradient(circle, ${tone}dd 0, ${tone}77 42%, ${tone}22 62%, transparent 72%)`;
    case 'bokeh':
      return `radial-gradient(circle, ${tone}22 0, ${tone}33 52%, ${tone}aa 61%, transparent 68%)`;
    case 'spark':
      return `radial-gradient(circle, #fff 0 22%, ${tone} 46%, transparent 72%)`;
  }
}

/** One light dot (a gradient on a span) centred on (x, y) in the overlay, removed when its animation ends. */
function dot(c: Ctx, shape: Shape, size: number, x: number, y: number, tone: string): HTMLElement {
  const el = document.createElement('span');
  Object.assign(el.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    margin: `${-size / 2}px 0 0 ${-size / 2}px`,
    borderRadius: '50%',
    background: bg(shape, tone),
    pointerEvents: 'none',
  });
  c.fx.appendChild(el);
  return el;
}

const gone = (el: Element, a: Animation) => {
  a.onfinish = () => el.remove();
  a.oncancel = () => el.remove();
};

/** The middle of the word, in overlay coordinates. */
const mid = (c: Ctx) => ({ x: c.word.offsetLeft + c.word.offsetWidth / 2, y: c.word.offsetTop + c.word.offsetHeight / 2 });

/** The origin of a burst: the press point, or the middle of the word. */
const origin = (c: Ctx, center?: boolean) => (center ? mid(c) : { x: c.px, y: c.py });

/** A hidden word while clones play: the original is invisible for `ms`. */
const hideWord = (c: Ctx, ms: number) => c.word.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ms / c.speed });

/** A copy of the word laid exactly over it (for glints and slices). */
function ghost(c: Ctx): HTMLElement {
  const g = c.word.cloneNode(true) as HTMLElement;
  g.setAttribute('aria-hidden', 'true');
  Object.assign(g.style, { position: 'absolute', left: `${c.word.offsetLeft}px`, top: `${c.word.offsetTop}px`, pointerEvents: 'none', margin: '0' });
  c.fx.appendChild(g);
  return g;
}

function ring(c: Ctx, x: number, y: number, size: number, delay: number, tone: string, ms = 850) {
  const el = dot(c, 'orb', size, x, y, tone);
  el.style.background = `radial-gradient(circle, transparent 50%, ${tone}cc 57%, transparent 67%)`;
  gone(el, go(c, el, [{ transform: 'scale(0.08)', opacity: 0.95 }, { transform: 'scale(1)', opacity: 0 }], ms, { delay }));
}

function glow(c: Ctx, scale = 1.25, ms = 700, tone = c.hi) {
  const { x, y } = mid(c);
  const el = document.createElement('span');
  const gw = c.word.offsetWidth * 1.5;
  const gh = c.word.offsetHeight * 2.6;
  Object.assign(el.style, {
    position: 'absolute', left: `${x - gw / 2}px`, top: `${y - gh / 2}px`, width: `${gw}px`, height: `${gh}px`, pointerEvents: 'none',
    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${tone}cc, ${tone}44 45%, transparent 72%)`,
  });
  c.fx.appendChild(el);
  gone(el, go(c, el, [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: `scale(${scale})`, offset: 0.3 }, { opacity: 0, transform: `scale(${scale * 1.1})` }], ms));
}

/** A horizontal line of light across the word. */
function streak(c: Ctx, widthK: number, thick: number, ms: number) {
  const { x, y } = mid(c);
  const w = c.word.offsetWidth * widthK;
  const el = document.createElement('span');
  Object.assign(el.style, {
    position: 'absolute', left: `${x - w / 2}px`, top: `${y - thick / 2}px`, width: `${w}px`, height: `${thick}px`, pointerEvents: 'none',
    background: `linear-gradient(90deg, transparent, ${c.hi}, #fff 50%, ${c.hi}, transparent)`,
  });
  c.fx.appendChild(el);
  gone(el, go(c, el, [{ transform: 'scaleX(0.05)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.35 }, { transform: 'scaleX(1.15)', opacity: 0 }], ms));
}

type Fn = (c: Ctx, p: MoveSpec) => void;

/** Sparks flying out from a point, optionally pulled down by gravity. */
function fly(c: Ctx, p: MoveSpec, shape: Shape, n: number, dist: number, size: [number, number], ms: number, grav = 0) {
  const o = origin(c, p.even);
  for (let i = 0; i < n; i++) {
    const a = p.even ? (i / n) * Math.PI * 2 : rnd(0, Math.PI * 2);
    const r = dist * c.amp * (p.even ? 1 : rnd(0.45, 1));
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r * (p.even ? 0.6 : 1);
    const s = rnd(size[0], size[1]);
    const el = dot(c, shape, s, o.x, o.y, pick(tones(c)));
    gone(
      el,
      go(
        c,
        el,
        [
          { transform: 'translate(0, 0) scale(0.3) rotate(0deg)', opacity: 0 },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) scale(1) rotate(60deg)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${dx}px, ${dy + grav}px) scale(0.2) rotate(140deg)`, opacity: 0 },
        ],
        ms * rnd(0.8, 1.15),
        { delay: rnd(0, 90) }
      )
    );
  }
}

const MOVES: Record<MoveSpec['k'], Fn> = {
  /* ── pulse ── */
  pulse: (c, p) => {
    const s = 1 + ((p.d ?? 1.12) - 1) * c.amp;
    go(c, c.word, [{ transform: 'scale(1)' }, { transform: `scale(${s})`, offset: 0.35 }, { transform: 'scale(1)' }], 560);
  },
  heartbeat: (c) => {
    const s = 0.14 * c.amp;
    go(c, c.word, [{ transform: 'scale(1)' }, { transform: `scale(${1 + s})`, offset: 0.14 }, { transform: 'scale(1)', offset: 0.3 }, { transform: `scale(${1 + s * 0.7})`, offset: 0.46 }, { transform: 'scale(1)' }], 760);
    glow(c, 1.15, 760);
  },
  spread: (c, p) => {
    const n = c.letters.length;
    c.letters.forEach((l, i) => {
      const dx = (i - (n - 1) / 2) * (p.d ?? 9) * c.amp;
      go(c, l, [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)`, offset: 0.4 }, { transform: 'translateX(0)' }], 900);
    });
  },
  flash: (c) => {
    const base = getComputedStyle(c.word).textShadow;
    go(c, c.word, [{ textShadow: base }, { textShadow: `0 0 14px ${c.hi}, 0 0 34px ${c.c}`, offset: 0.25 }, { textShadow: base }], 800);
    glow(c, 1.2, 800);
  },
  rings: (c, p) => {
    const n = p.n ?? 3;
    const size = Math.max(c.w, c.h * 2) * 1.35;
    for (let i = 0; i < n; i++) ring(c, c.px, c.py, size, i * 150, i % 2 ? c.hi : c.c);
  },

  /* ── jump ── */
  hop: (c, p) => {
    const h = (p.d ?? 16) * c.amp;
    go(
      c,
      c.word,
      [
        { transform: 'translateY(0) scale(1, 1)', transformOrigin: '50% 100%' },
        { transform: `translateY(${-h}px) scale(0.96, 1.07)`, offset: 0.25, transformOrigin: '50% 100%' },
        { transform: 'translateY(0) scale(1.07, 0.9)', offset: 0.5, transformOrigin: '50% 100%' },
        { transform: `translateY(${-h * 0.3}px) scale(1, 1)`, offset: 0.7, transformOrigin: '50% 100%' },
        { transform: 'translateY(0) scale(1, 1)', transformOrigin: '50% 100%' },
      ],
      620
    );
  },
  wave: (c, p) => {
    const h = (p.d ?? 14) * c.amp;
    c.letters.forEach((l, i) => go(c, l, [{ transform: 'translateY(0)' }, { transform: `translateY(${-h}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], 560, { delay: i * (p.d && p.d < 10 ? 70 : 45) }));
  },
  squash: (c) => {
    const o = '50% 100%';
    go(
      c,
      c.word,
      [
        { transform: 'scale(1, 1)', transformOrigin: o },
        { transform: `scale(${1 + 0.2 * c.amp}, ${1 - 0.3 * c.amp})`, offset: 0.2, transformOrigin: o },
        { transform: `scale(${1 - 0.1 * c.amp}, ${1 + 0.22 * c.amp})`, offset: 0.5, transformOrigin: o },
        { transform: 'scale(1.04, 0.96)', offset: 0.75, transformOrigin: o },
        { transform: 'scale(1, 1)', transformOrigin: o },
      ],
      700
    );
  },
  launch: (c, p) => {
    const h = (p.d ?? 80) * c.amp;
    go(
      c,
      c.word,
      [
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translateY(${-h}px)`, opacity: 0, filter: 'blur(6px)', offset: 0.35 },
        { transform: `translateY(${h * 0.6}px)`, opacity: 0, filter: 'blur(6px)', offset: 0.45 },
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
      ],
      950
    );
  },
  drop: (c) => {
    c.letters.forEach((l, i) =>
      go(
        c,
        l,
        [
          { transform: 'translateY(-34px)', opacity: 0 },
          { transform: 'translateY(5px)', opacity: 1, offset: 0.55 },
          { transform: 'translateY(-3px)', offset: 0.78 },
          { transform: 'translateY(0)' },
        ],
        760,
        { delay: i * 45 }
      )
    );
  },

  /* ── scatter ── */
  scatter: (c, p) => {
    const d = (p.d ?? 70) * c.amp;
    c.letters.forEach((l, i) => {
      const dx = rnd(-d, d);
      const dy = rnd(-d * 0.8, d * 0.8);
      const rot = rnd(-140, 140);
      const t = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${rnd(0.6, 1.3)})`;
      go(
        c,
        l,
        [
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
          { transform: t, opacity: 0.3, filter: 'blur(3px)', offset: 0.4 },
          { transform: t, opacity: 0.3, filter: 'blur(3px)', offset: 0.55 },
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
        ],
        1100,
        { delay: i * 20 }
      );
    });
  },
  burst: (c, p) => {
    fly(c, p, p.shape ?? 'star', p.n ?? 16, p.d ?? 90, [10, 20], 900);
  },
  dust: (c) => {
    c.letters.forEach((l, i) => {
      const dx = rnd(10, 36);
      const dy = rnd(-14, -44);
      go(
        c,
        l,
        [
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
          { transform: `translate(${dx}px, ${dy}px) scale(1.2)`, opacity: 0, filter: 'blur(7px)', offset: 0.5 },
          { transform: `translate(${-dx * 0.3}px, ${-dy * 0.3}px)`, opacity: 0, filter: 'blur(7px)', offset: 0.62 },
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
        ],
        1300,
        { delay: i * 30 }
      );
    });
    const b = mid(c);
    for (let i = 0; i < 22; i++) {
      const el = dot(c, 'spark', rnd(3, 6), b.x + rnd(-c.word.offsetWidth / 2, c.word.offsetWidth / 2), b.y + rnd(-6, 8), pick(tones(c)));
      gone(el, go(c, el, [{ transform: 'translate(0,0)', opacity: 0 }, { opacity: 0.9, offset: 0.2 }, { transform: `translate(${rnd(20, 70)}px, ${rnd(-50, -18)}px)`, opacity: 0 }], rnd(800, 1300), { delay: rnd(0, 250) }));
    }
  },
  bokeh: (c, p) => {
    const n = p.n ?? 7;
    const b = mid(c);
    for (let i = 0; i < n; i++) {
      const s = rnd(18, 54);
      const el = dot(c, 'bokeh', s, b.x + rnd(-c.word.offsetWidth * 0.5, c.word.offsetWidth * 0.5), b.y + rnd(-12, 12), pick([c.c, c.hi, c.lo]));
      gone(
        el,
        go(c, el, [{ transform: 'translate(0,0) scale(0.2)', opacity: 0 }, { transform: 'translate(0,-8px) scale(1)', opacity: 1, offset: 0.35 }, { transform: `translate(${rnd(-30, 30)}px, ${rnd(-60, -24)}px) scale(1.4)`, opacity: 0 }], rnd(1000, 1500), { delay: rnd(0, 200) })
      );
    }
  },
  confetti: (c, p) => {
    const n = p.n ?? 18;
    const b = mid(c);
    for (let i = 0; i < n; i++) {
      const dx = rnd(-110, 110) * c.amp;
      const up = rnd(40, 90) * c.amp;
      const el = dot(c, i % 3 ? 'spark' : 'orb', rnd(5, 11), b.x + rnd(-20, 20), b.y, pick(tones(c)));
      gone(
        el,
        go(
          c,
          el,
          [
            { transform: 'translate(0,0) scale(0.4)', opacity: 0 },
            { transform: `translate(${dx * 0.6}px, ${-up}px) scale(1)`, opacity: 1, offset: 0.35 },
            { transform: `translate(${dx}px, ${rnd(30, 70)}px) scale(0.5)`, opacity: 0 },
          ],
          rnd(900, 1300),
          { delay: rnd(0, 120) }
        )
      );
    }
  },

  /* ── slice ── */
  slice: (c, p) => {
    const N = p.n ?? 2;
    const dist = (p.d ?? 14) * c.amp;
    const vertical = !!p.vertical;
    const deg = p.deg ?? 0;
    const total = 780;
    const pad = 8;
    const W = c.word.offsetWidth + pad * 2;
    const H = c.word.offsetHeight + pad * 2;
    const half = ((Math.tan((deg * Math.PI) / 180) * (vertical ? H / W : W / H) * 100) / 2) || 0;
    hideWord(c, total);
    for (let i = 0; i < N; i++) {
      const a = i === 0 ? -300 : (i / N) * 100;
      const b = i === N - 1 ? 400 : ((i + 1) / N) * 100;
      const clip = vertical
        ? `polygon(${a - half}% -50%, ${b - half}% -50%, ${b + half}% 150%, ${a + half}% 150%)`
        : `polygon(-50% ${a - half}%, 150% ${a + half}%, 150% ${b + half}%, -50% ${b - half}%)`;
      const g = ghost(c);
      g.style.padding = `${pad}px`;
      g.style.left = `${c.word.offsetLeft - pad}px`;
      g.style.top = `${c.word.offsetTop - pad}px`;
      g.style.clipPath = clip;
      const s = i % 2 === 0 ? -1 : 1;
      const mv = vertical ? `translate(0, ${s * dist}px)` : `translate(${s * dist}px, 0)`;
      let frames: Keyframe[];
      if (p.glitch) {
        frames = [];
        const steps = 9;
        for (let k = 0; k < steps; k++) frames.push({ transform: `translate(${rnd(-dist, dist)}px, ${rnd(-2, 2)}px)`, offset: k / steps });
        frames.push({ transform: 'translate(0,0)', offset: 1 });
      } else {
        frames = [{ transform: 'translate(0,0)' }, { transform: mv, offset: 0.3 }, { transform: mv, offset: 0.55 }, { transform: 'translate(0,0)' }];
      }
      gone(g, go(c, g, frames, total, p.glitch ? { easing: 'steps(1, end)' } : { easing: 'cubic-bezier(0.7, 0, 0.2, 1)' }));
    }
    // the lines of light along the cuts
    const cx = c.word.offsetLeft + c.word.offsetWidth / 2;
    const cy = c.word.offsetTop + c.word.offsetHeight / 2;
    for (let j = 1; j < N; j++) {
      const t = j / N - 0.5;
      const len = (vertical ? c.word.offsetHeight : c.word.offsetWidth) * 1.5;
      const el = document.createElement('span');
      const x = vertical ? cx + t * c.word.offsetWidth : cx;
      const y = vertical ? cy : cy + t * c.word.offsetHeight;
      Object.assign(el.style, {
        position: 'absolute', pointerEvents: 'none',
        left: `${vertical ? x - 1 : x - len / 2}px`, top: `${vertical ? y - len / 2 : y - 1}px`,
        width: vertical ? '2px' : `${len}px`, height: vertical ? `${len}px` : '2px',
        background: `linear-gradient(${vertical ? 180 : 90}deg, transparent, ${c.hi}, #fff 50%, ${c.hi}, transparent)`,
      });
      c.fx.appendChild(el);
      const r = vertical ? -deg : deg;
      gone(el, go(c, el, [{ transform: `rotate(${r}deg) ${vertical ? 'scaleY' : 'scaleX'}(0.1)`, opacity: 0 }, { transform: `rotate(${r}deg) ${vertical ? 'scaleY' : 'scaleX'}(1)`, opacity: 1, offset: 0.2 }, { transform: `rotate(${r}deg) ${vertical ? 'scaleY' : 'scaleX'}(1)`, opacity: 0 }], 620));
    }
  },

  /* ── zoom to nothing ── */
  zoomIn: (c) => {
    go(
      c,
      c.word,
      [
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: `scale(${3.4 * c.amp})`, opacity: 0, filter: 'blur(14px)', offset: 0.42 },
        { transform: 'scale(0.55)', opacity: 0, filter: 'blur(8px)', offset: 0.55 },
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
      ],
      1000
    );
    glow(c, 1.6, 600);
  },
  zoomOut: (c) => {
    go(
      c,
      c.word,
      [
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: 'scale(0.02)', opacity: 0, filter: 'blur(3px)', offset: 0.38 },
        { transform: 'scale(0.02)', opacity: 0, offset: 0.58 },
        { transform: `scale(${1 + 0.14 * c.amp})`, opacity: 1, filter: 'blur(0px)', offset: 0.82 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      1100
    );
    const b = mid(c);
    const el = dot(c, 'star', 26, b.x, b.y, c.hi);
    gone(el, go(c, el, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.4 }, { transform: 'scale(0.4)', opacity: 0, offset: 0.6 }, { transform: 'scale(0)', opacity: 0 }], 1100));
  },
  implode: (c) => {
    const W = c.word.offsetWidth;
    c.letters.forEach((l) => {
      const cx = W / 2 - (l.offsetLeft + l.offsetWidth / 2);
      go(
        c,
        l,
        [
          { transform: 'none', opacity: 1 },
          { transform: `translateX(${cx}px) scale(0.1)`, opacity: 0, offset: 0.4 },
          { transform: `translateX(${cx}px) scale(0.1)`, opacity: 0, offset: 0.55 },
          { transform: `translateX(${cx * 0.3}px) scale(1.25)`, opacity: 1, offset: 0.82 },
          { transform: 'none', opacity: 1 },
        ],
        1000,
        { delay: Math.abs(cx) * 0.2 }
      );
    });
    glow(c, 0.6, 700);
  },
  explode: (c) => {
    const W = c.word.offsetWidth;
    c.letters.forEach((l, i) => {
      const cx = l.offsetLeft + l.offsetWidth / 2 - W / 2;
      go(
        c,
        l,
        [
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
          { transform: `translate(${cx * 1.8}px, ${rnd(-12, 12)}px) scale(${5 * c.amp})`, opacity: 0, filter: 'blur(12px)', offset: 0.42 },
          { transform: 'scale(0.4)', opacity: 0, filter: 'blur(6px)', offset: 0.6 },
          { transform: 'none', opacity: 1, filter: 'blur(0px)' },
        ],
        1100,
        { delay: i * 18 }
      );
    });
  },
  focus: (c) => {
    go(
      c,
      c.word,
      [
        { filter: 'blur(0px)', opacity: 1, transform: 'scale(1)' },
        { filter: 'blur(11px)', opacity: 0.2, transform: 'scale(1.06)', offset: 0.4 },
        { filter: 'blur(11px)', opacity: 0.2, transform: 'scale(1.06)', offset: 0.55 },
        { filter: 'blur(0px)', opacity: 1, transform: 'scale(1)' },
      ],
      1000
    );
  },

  /* ── stars ── */
  constellation: (c) => {
    const stars = Array.from(c.btn.querySelectorAll<HTMLElement>('.fw-kb__star'));
    const W = c.btn.offsetWidth;
    const H = c.btn.offsetHeight;
    stars.forEach((s, i) => {
      const sx = parseFloat(s.style.getPropertyValue('--sx')) / 100 - 0.5;
      const sy = parseFloat(s.style.getPropertyValue('--sy')) / 100 - 0.5;
      const dx = sx * (W + 120) * c.amp;
      const dy = sy * (H + 80) * c.amp;
      go(
        c,
        s,
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(2)`, opacity: 0, offset: 0.4 },
          { transform: `translate(${dx}px, ${dy}px) scale(2)`, opacity: 0, offset: 0.55 },
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
        ],
        1300,
        { delay: i * 12 }
      );
    });
    fly(c, { k: 'burst', even: true }, 'star', 10, 70, [8, 14], 900);
  },
  twinkle: (c) => {
    const base = getComputedStyle(c.word).textShadow;
    c.letters.forEach((l, i) => {
      go(c, l, [{ transform: 'scale(1)', textShadow: base }, { transform: 'scale(1.28)', textShadow: `0 0 12px ${c.hi}, 0 0 24px ${c.c}`, offset: 0.4 }, { transform: 'scale(1)', textShadow: base }], 640, { delay: i * 70 });
      const x = c.word.offsetLeft + l.offsetLeft + l.offsetWidth / 2;
      const y = c.word.offsetTop + c.word.offsetHeight * rnd(0.1, 0.4);
      const st = dot(c, 'star', rnd(14, 24), x, y, pick([c.hi, '#ffffff']));
      gone(st, go(c, st, [{ transform: 'scale(0) rotate(0deg)', opacity: 0 }, { transform: 'scale(1) rotate(45deg)', opacity: 1, offset: 0.4 }, { transform: 'scale(0) rotate(90deg)', opacity: 0 }], 700, { delay: i * 70 }));
    });
  },
  shoot: (c) => {
    const b = mid(c);
    const L = c.word.offsetWidth * 0.7 + 60;
    const el = document.createElement('span');
    Object.assign(el.style, {
      position: 'absolute', left: `${b.x - 50}px`, top: `${b.y - 1}px`, width: '100px', height: '2px', pointerEvents: 'none',
      background: `linear-gradient(90deg, transparent, ${c.hi}, #fff)`, transformOrigin: '100% 50%',
    });
    c.fx.appendChild(el);
    const dx = L;
    const dy = L * 0.42;
    gone(el, go(c, el, [{ transform: `translate(${-dx}px, ${-dy}px) rotate(23deg) scaleX(0.4)`, opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px, ${dy}px) rotate(23deg) scaleX(1.3)`, opacity: 0 }], 700));
    const head = dot(c, 'star', 18, b.x, b.y, '#ffffff');
    gone(head, go(c, head, [{ transform: `translate(${-dx}px, ${-dy}px) scale(0.4)`, opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0 }], 700));
    const base = getComputedStyle(c.word).textShadow;
    go(c, c.word, [{ textShadow: base }, { textShadow: `0 0 12px ${c.hi}, 0 0 28px ${c.c}`, offset: 0.55 }, { textShadow: base }], 900, { delay: 120 });
  },
  orbit: (c) => {
    const b = mid(c);
    const rx = c.word.offsetWidth / 2 + 22;
    const ry = c.word.offsetHeight / 2 + 12;
    const frames: Keyframe[] = [];
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
      frames.push({ transform: `translate(${Math.cos(a) * rx}px, ${Math.sin(a) * ry}px) scale(${0.7 + 0.5 * Math.sin((i / steps) * Math.PI)})`, opacity: i === 0 || i === steps ? 0 : 1, offset: i / steps });
    }
    for (let k = 0; k < 3; k++) {
      const el = dot(c, 'star', 18 - k * 4, b.x, b.y, k ? c.hi : '#ffffff');
      gone(el, go(c, el, frames, 1100, { delay: k * 70, easing: 'linear' }));
    }
  },

  /* ── light and orbs ── */
  flare: (c) => {
    streak(c, 2.2, 2, 800);
    glow(c, 1.2, 800);
  },
  embers: (c, p) => {
    const n = p.n ?? 14;
    const b = mid(c);
    for (let i = 0; i < n; i++) {
      const x = b.x + rnd(-c.word.offsetWidth / 2, c.word.offsetWidth / 2);
      const el = dot(c, 'spark', rnd(3, 7), x, b.y + c.word.offsetHeight * 0.3, pick([c.hi, c.c]));
      gone(el, go(c, el, [{ transform: 'translate(0,0) scale(0.6)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${rnd(-14, 24)}px, ${-rnd(36, 90) * c.amp}px) scale(0.2)`, opacity: 0 }], rnd(900, 1500), { delay: rnd(0, 260) }));
    }
  },
  ripple: (c) => {
    const size = Math.max(c.w, c.h) * 2.6;
    const el = dot(c, 'orb', size, c.px, c.py, c.hi);
    gone(el, go(c, el, [{ transform: 'scale(0.1)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 0 }], 900));
  },
  sweep: (c) => {
    const g = ghost(c);
    Object.assign(g.style, { color: 'transparent', textShadow: 'none', filter: 'none', backgroundImage: `linear-gradient(100deg, transparent 32%, #fff 46%, ${c.hi} 54%, transparent 68%)`, backgroundSize: '260% 100%', backgroundRepeat: 'no-repeat' });
    g.style.setProperty('-webkit-text-fill-color', 'transparent');
    g.style.setProperty('-webkit-text-stroke', '0');
    g.style.setProperty('-webkit-background-clip', 'text');
    g.style.setProperty('background-clip', 'text');
    gone(g, go(c, g, [{ backgroundPosition: '88% 0' }, { backgroundPosition: '12% 0' }], 900, { fill: 'both' }));
  },
  fade: (c) => {
    c.letters.forEach((l, i) =>
      go(
        c,
        l,
        [
          { opacity: 1, filter: 'blur(0px)' },
          { opacity: 0, filter: 'blur(9px)', offset: 0.35 },
          { opacity: 0, filter: 'blur(9px)', offset: 0.5 },
          { opacity: 1, filter: 'blur(0px)' },
        ],
        1000,
        { delay: i * 55 }
      )
    );
  },

  /* ── letters ── */
  roll: (c) => {
    c.word.style.perspective = '420px';
    c.letters.forEach((l, i) => go(c, l, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(360deg)' }], 760, { delay: i * 50 }));
    window.setTimeout(() => (c.word.style.perspective = ''), (760 + c.letters.length * 50) / c.speed + 50);
  },
  type: (c) => {
    const n = c.letters.length;
    c.letters.forEach((l, i) =>
      go(
        c,
        l,
        [
          { opacity: 1 },
          { opacity: 0, offset: 0.08 },
          { opacity: 0, offset: 0.25 + (i / n) * 0.55 },
          { opacity: 1, offset: 0.27 + (i / n) * 0.55 },
          { opacity: 1 },
        ],
        1300,
        { easing: 'linear' }
      )
    );
  },
  wash: (c) => {
    const base = getComputedStyle(c.word).color;
    c.letters.forEach((l, i) => go(c, l, [{ color: base }, { color: c.hi, offset: 0.4 }, { color: base }], 800, { delay: i * 60 }));
  },
  fringe: (c, p) => {
    const a = p.d ?? 4;
    const s = (x: number, y: number) => `${x}px ${y}px 0 var(--t2), ${-x}px ${-y}px 0 var(--t1)`;
    const base = getComputedStyle(c.word).textShadow;
    go(
      c,
      c.word,
      [
        { textShadow: base, transform: 'translateX(0)' },
        { textShadow: s(a, 0), transform: 'translateX(-2px)', offset: 0.12 },
        { textShadow: s(-a * 1.3, 1), transform: 'translateX(2px)', offset: 0.28 },
        { textShadow: s(a * 0.8, -1), transform: 'translateX(-1px)', offset: 0.45 },
        { textShadow: s(a * 0.4, 0), transform: 'translateX(0)', offset: 0.7 },
        { textShadow: base, transform: 'translateX(0)' },
      ],
      520
    );
  },
  stamp: (c) => {
    go(c, c.word, [{ transform: 'scale(1)' }, { transform: 'scale(0.88)', offset: 0.14 }, { transform: 'scale(1.04)', offset: 0.4 }, { transform: 'scale(1)' }], 520);
    const base = getComputedStyle(c.word).textShadow;
    go(c, c.word, [{ textShadow: base }, { textShadow: `0 0 3px ${c.lo}, 0 0 10px ${c.c}`, offset: 0.14 }, { textShadow: base }], 700);
    const b = mid(c);
    ring(c, b.x, b.y, Math.max(c.w, c.h * 2) * 1.2, 40, c.lo, 900);
    ring(c, b.x, b.y, Math.max(c.w, c.h * 2) * 0.8, 120, c.c, 900);
  },
  inkpop: (c) => {
    const b = mid(c);
    const orbs = 7;
    go(c, c.word, [{ opacity: 1 }, { opacity: 0.25, offset: 0.25 }, { opacity: 0.25, offset: 0.5 }, { opacity: 1 }], 1500);
    for (let i = 0; i < orbs; i++) {
      const x = b.x + (i / (orbs - 1) - 0.5) * c.word.offsetWidth * 1.1;
      const y = b.y + rnd(-10, 10);
      const tone = pick([c.hi, c.c, c.lo]);
      const orb = dot(c, 'orb', rnd(16, 30), x, y, tone);
      const swell = go(c, orb, [{ transform: 'scale(0.4)', opacity: 0.4 }, { transform: 'scale(1.4)', opacity: 1 }], 380);
      swell.onfinish = () => {
        orb.remove();
        for (let k = 0; k < 4; k++) {
          const a = rnd(0, Math.PI * 2);
          const r = rnd(24, 70) * c.amp;
          const f = dot(c, 'spark', rnd(4, 9), x, y, tone);
          gone(f, go(c, f, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px) scale(0.2)`, opacity: 0 }], 800));
        }
      };
    }
  },
};

/** Run every move of a design at once. */
export function press(c: Ctx, moves: MoveSpec[]) {
  if (c.fx.childElementCount > 160) return;
  for (const mv of moves) MOVES[mv.k](c, mv);
}
