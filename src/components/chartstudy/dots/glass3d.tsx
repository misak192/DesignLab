/**
 * File: src/components/chartstudy/dots/glass3d.tsx
 * Description: Rows 4 and 5 of the Dot Study (19 to 30): glass and 3D. Glass here is neutral pale fill with a tint of the
 * dot colour, drawn with gradients only (no backdrop-filter, so a chart of hundreds stays cheap). 3D is a tilt and a
 * gradient: a cylinder is an ellipse on top of a rectangle with elliptical bottom corners, a stack is ellipses pushed
 * down by a box-shadow of a deeper shade.
 */
import type { FC } from 'react';
import { anim, mixHex, tint } from '../shared';
import { N, Wrap, at, disc } from './kit';
import type { DotProps } from './kit';

/** The glossy part of glass: a pale sheen over the top half that stops short, as light on a pane does. One gradient layer, no element. */
const SHEEN = `linear-gradient(to bottom, ${tint('#ffffff', 0.36)} 0, ${tint('#ffffff', 0.07)} 46%, ${tint('#ffffff', 0)} 50%)`;
const glass = (a: number, b: number) => `${SHEEN}, linear-gradient(160deg, ${tint(N, a)}, ${tint(N, b)})`;

/** 19 Neutral glass: a pale, translucent dot that picks up the colour only at its base. */
export const D19: FC<DotProps> = ({ c, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `${SHEEN}, linear-gradient(165deg, ${tint(N, 0.5)}, ${tint(N, 0.2)} 52%, ${tint(c, 0.7)})`, {
      boxShadow: `0 ${s * 0.2}px ${s * 0.38}px ${tint(lo, 0.3)}, inset 0 ${-s * 0.1}px ${s * 0.22}px ${tint(c, 0.35)}`,
    })}
  />
);

/** 20 Glass vessel: a neutral glass dot filled with the dot colour up to a level. */
export const D20: FC<DotProps> = ({ hi, lo, s, live }) => (
  <span aria-hidden style={disc(s, glass(0.5, 0.2), { position: 'relative', overflow: 'hidden', boxShadow: `0 ${s * 0.18}px ${s * 0.34}px ${tint(lo, 0.28)}` })}>
    <span
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '58%',
        background: `linear-gradient(to bottom, ${tint(hi, 0.92)}, ${tint(lo, 0.92)})`,
        ...anim(live, 'fw-cd-bob', 3200, { loop: true }),
      }}
    />
  </span>
);

/** 21 Tint bleed: neutral glass with the colour bleeding in from one side. */
export const D21: FC<DotProps> = ({ c, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `${SHEEN}, linear-gradient(100deg, ${tint(N, 0.5)}, ${tint(N, 0.2)} 40%, ${tint(c, 0.8)})`, {
      boxShadow: `${s * 0.15}px ${s * 0.2}px ${s * 0.4}px ${tint(lo, 0.32)}`,
    })}
  />
);

/** 22 Glass over colour: a neutral glass dot overlapping a coloured one, so the overlap shows tinted. */
export const D22: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={at(s * 0.78, { background: `radial-gradient(circle, ${hi}, ${c} 62%, ${lo})` }, 45, 46)} />
    <span aria-hidden style={at(s * 0.74, { background: glass(0.5, 0.2), boxShadow: `0 ${s * 0.1}px ${s * 0.26}px ${tint(lo, 0.35)}` }, 57, 56)} />
  </Wrap>
);

/** The raised pad of 23 and 24: light from the top left, shade from the bottom right, in a dark shift of the colour. */
const pad = (s: number, deep: string) =>
  disc(s, 'linear-gradient(145deg, #4a5068, #262a3b)', {
    boxShadow: `${-s * 0.1}px ${-s * 0.1}px ${s * 0.22}px ${tint('#ffffff', 0.16)}, ${s * 0.12}px ${s * 0.12}px ${s * 0.26}px ${tint(mixHex(deep, '#05060a', 0.7), 0.7)}`,
  });

/** 23 Soft raised: a neutral raised dot. */
export const D23: FC<DotProps> = ({ deep, s }) => <span aria-hidden style={pad(s, deep)} />;

/** 24 Lit pad: the raised pad with the colour lit inside it like a lamp. */
export const D24: FC<DotProps> = ({ c, hi, lo, deep, s }) => (
  <span aria-hidden style={{ ...pad(s, deep), position: 'relative' }}>
    <span
      style={at(s * 0.56, {
        background: `linear-gradient(145deg, ${hi}, ${lo})`,
        boxShadow: `0 0 ${s * 0.32}px ${tint(c, 0.65)}, inset 0 ${-s * 0.06}px ${s * 0.1}px ${tint(lo, 0.55)}`,
      })}
    />
  </span>
);

/* 3D: cylinders. The top is an ellipse of height e; the body is the rest, its bottom corners elliptical. */
function Cylinder({ s, top, body, shadow }: { s: number; top: string; body: string; shadow: string }) {
  const e = s * 0.4;
  const total = s * 0.78;
  return (
    <Wrap s={s} h={total}>
      <span aria-hidden style={{ position: 'absolute', left: '6%', right: '6%', bottom: -s * 0.08, height: s * 0.22, borderRadius: '50%', background: shadow }} />
      <span
        aria-hidden
        style={{ position: 'absolute', left: 0, right: 0, top: e / 2, bottom: 0, background: body, borderRadius: `0 0 ${s / 2}px ${s / 2}px / 0 0 ${e / 2}px ${e / 2}px` }}
      />
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: s, height: e, borderRadius: '50%', background: top }} />
    </Wrap>
  );
}

/** 25 Coin: a cylinder tilted toward you, a lit top and a gradient across the side. */
export const D25: FC<DotProps> = ({ c, hi, lo, deep, s }) => (
  <Cylinder
    s={s}
    top={`linear-gradient(120deg, ${hi}, ${c})`}
    body={`linear-gradient(to right, ${deep}, ${lo} 22%, ${c} 50%, ${hi} 64%, ${c} 82%, ${deep})`}
    shadow={`radial-gradient(closest-side, ${tint(lo, 0.65)}, ${tint(lo, 0)})`}
  />
);

/** 26 Glass coin: the same coin in neutral glass with a tint of the colour at its base. */
export const D26: FC<DotProps> = ({ c, lo, s }) => (
  <Cylinder
    s={s}
    top={`linear-gradient(130deg, ${tint(N, 0.7)}, ${tint(N, 0.32)})`}
    body={`linear-gradient(to top, ${tint(c, 0.7)}, ${tint(c, 0)} 80%), linear-gradient(to right, ${tint(N, 0.24)}, ${tint(N, 0.5)} 36%, ${tint(N, 0.22)})`}
    shadow={`radial-gradient(closest-side, ${tint(lo, 0.45)}, ${tint(lo, 0)})`}
  />
);

/** 27 Turntable: a disc tilted back in perspective, its gradient slowly turning. */
export const D27: FC<DotProps> = ({ c, hi, lo, s, live }) => (
  <Wrap s={s} style={{ perspective: s * 3 }}>
    <span aria-hidden style={{ position: 'absolute', left: '10%', right: '10%', bottom: s * 0.08, height: s * 0.26, borderRadius: '50%', background: `radial-gradient(closest-side, ${tint(lo, 0.6)}, ${tint(lo, 0)})` }} />
    <span
      aria-hidden
      style={{
        ...disc(s, `conic-gradient(from 40deg, ${hi}, ${c}, ${lo}, ${c}, ${hi})`),
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'rotateX(58deg)',
        ...anim(live, 'fw-cd-turn', 7000, { loop: true, ease: 'linear' }),
      }}
    />
  </Wrap>
);

/** 28 Matte ball: shaded round with cousins of the colour, no gloss, with a shadow on the ground. */
export const D28: FC<DotProps> = ({ c, hi, lo, deep, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={{ position: 'absolute', left: '14%', right: '14%', bottom: 0, height: s * 0.16, borderRadius: '50%', background: `radial-gradient(closest-side, ${tint(deep, 0.75)}, ${tint(deep, 0)})` }} />
    <span aria-hidden style={at(s * 0.84, { background: `radial-gradient(circle at 50% 44%, ${hi} 0%, ${c} 42%, ${lo} 76%, ${deep} 100%)` }, 50, 45)} />
  </Wrap>
);

/** 29 Capped: a lighter lid on the top of the dot, like the capped bars. */
export const D29: FC<DotProps> = ({ c, hi, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `linear-gradient(to bottom, ${hi} 0, ${hi} 15%, ${c} 17%, ${lo} 100%)`, { boxShadow: `0 ${s * 0.2}px ${s * 0.38}px ${tint(lo, 0.5)}` })}
  />
);

/** 30 Coin stack: three coins stacked, each pushed down by a deeper shade of the colour. */
export const D30: FC<DotProps> = ({ c, hi, lo, deep, s }) => {
  const coin = (i: number) => ({
    position: 'absolute' as const,
    left: '9%',
    width: '82%',
    height: s * 0.36,
    top: s * (0.5 - i * 0.17),
    borderRadius: '50%',
    background: `linear-gradient(120deg, ${hi}, ${c})`,
    boxShadow: i === 0 ? `0 ${s * 0.13}px 0 ${deep}, 0 ${s * 0.3}px ${s * 0.3}px ${tint(lo, 0.5)}` : `0 ${s * 0.13}px 0 ${lo}`,
  });
  return (
    <Wrap s={s}>
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden style={coin(i)} />
      ))}
    </Wrap>
  );
};

export const GLASS3D_DOTS: Record<string, FC<DotProps>> = { '19': D19, '20': D20, '21': D21, '22': D22, '23': D23, '24': D24, '25': D25, '26': D26, '27': D27, '28': D28, '29': D29, '30': D30 };
