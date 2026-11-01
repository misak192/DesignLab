/**
 * File: src/components/chartstudy/dots/stacks.tsx
 * Description: Row 4 of the Blends page (17 to 23): the coin stack as stacked bars. A coin is one ellipse, and the thickness
 * of the coin is the same ellipse pushed down by a box-shadow of a deeper shade, so a column of seven coins is seven
 * elements. Six columns of 2 to 7 coins show how it reads as a chart. The variants colour the coins four ways: the shifted
 * gradient, airbrush (no extrusion, soft overlapping ellipses), tint-bleed glass, and a shift that grows up the stack (the
 * "prism"); plus one with a glowing top coin and one fading out toward the base.
 */
import type { CSSProperties, FC } from 'react';
import { mixHex, tint } from '../shared';
import { Wrap, mask } from './kit';
import type { DotProps } from './kit';
import { SHEEN, SOFT, glassN } from './blends';

const COUNTS = [2, 4, 3, 6, 5, 7];
const MAX = 7;

interface Coin {
  /** Styles of coin number k (0 is the bottom) in a column of n coins. */
  (k: number, n: number): CSSProperties;
}

function Bars({ p, coin, column, soft = false }: { p: DotProps; coin: Coin; column?: CSSProperties; soft?: boolean }) {
  const w = p.s * 0.5;
  const eh = w * 0.38; // height of a coin's face
  const ext = Math.max(4, w * 0.2); // how far the coin is pushed down to make its thickness
  const step = Math.max(6, w * 0.3); // vertical distance between coins
  const pitch = w * 1.45;
  const height = MAX * step + eh + ext + 6;
  return (
    <Wrap s={COUNTS.length * pitch - (pitch - w)} h={height}>
      {COUNTS.map((n, i) => (
        <span key={i} aria-hidden style={{ position: 'absolute', left: i * pitch, bottom: 0, width: w, height: (n - 1) * step + eh + ext, ...column }}>
          {Array.from({ length: n }, (_, k) => (
            <span
              key={k}
              style={{
                position: 'absolute',
                left: soft ? -w * 0.1 : 0,
                bottom: k * step + (soft ? 0 : ext),
                width: soft ? w * 1.2 : w,
                height: soft ? eh * 1.8 : eh,
                borderRadius: '50%',
                ...coin(k, n),
              }}
            />
          ))}
        </span>
      ))}
    </Wrap>
  );
}

const plain = (p: DotProps): Coin => (k) => ({
  background: `linear-gradient(120deg, ${p.hi}, ${p.c})`,
  boxShadow: k === 0 ? `0 ${Math.max(4, p.s * 0.08)}px 0 ${p.lo}, 0 ${p.s * 0.22}px ${p.s * 0.22}px ${tint(p.lo, 0.55)}` : `0 ${Math.max(4, p.s * 0.08)}px 0 ${p.lo}`,
});

/** 17 Coin stack as bars, in the shifted gradient with a soft shadow under each column. */
export const D17: FC<DotProps> = (p) => <Bars p={p} coin={plain(p)} />;

/** 18 Airbrush coin stack: soft overlapping ellipses, no edges, a column of spray. */
export const D18: FC<DotProps> = (p) => (
  <Bars p={p} soft coin={() => ({ background: `linear-gradient(145deg, ${p.hi}, ${p.lo})`, ...mask(SOFT) })} />
);

/** 19 Tint-bleed coin stack: pale glass coins with the colour bleeding in from the right. */
export const D19: FC<DotProps> = (p) => (
  <Bars
    p={p}
    coin={() => ({
      background: `${SHEEN}, linear-gradient(100deg, ${glassN(0.66)}, ${glassN(0.3)} 45%, ${tint(p.c, 0.85)})`,
      boxShadow: `0 ${Math.max(4, p.s * 0.08)}px 0 ${tint(p.lo, 0.7)}`,
    })}
  />
);

/** 20 Prism stack: the shift grows up the stack, from the deeper cousin at the base to the lighter one at the top. */
export const D20: FC<DotProps> = (p) => (
  <Bars
    p={p}
    coin={(k) => {
      const t = k / (MAX - 1);
      const top = mixHex(p.lo, p.hi, t);
      return { background: `linear-gradient(120deg, ${mixHex(top, '#ffffff', 0.18)}, ${top})`, boxShadow: `0 ${Math.max(4, p.s * 0.08)}px 0 ${mixHex(p.deep, p.lo, t)}` };
    }}
  />
);

/** 21 Glow stack: the top coin of every column is lit. */
export const D21: FC<DotProps> = (p) => (
  <Bars
    p={p}
    coin={(k, n) => ({
      background: `linear-gradient(120deg, ${p.hi}, ${p.c})`,
      boxShadow: k === n - 1 ? `0 ${Math.max(4, p.s * 0.08)}px 0 ${p.lo}, 0 0 ${p.s * 0.3}px ${tint(p.hi, 0.95)}` : `0 ${Math.max(4, p.s * 0.08)}px 0 ${p.lo}`,
    })}
  />
);

/** 22 Fade stack: the columns dissolve toward the base, by a mask on the column. */
export const D22: FC<DotProps> = (p) => <Bars p={p} coin={plain(p)} column={mask('linear-gradient(to top, transparent 0%, #000 62%)')} />;

/** 23 Prism airbrush stack: the airbrush column with the shift growing up it. */
export const D23: FC<DotProps> = (p) => (
  <Bars
    p={p}
    soft
    coin={(k) => ({ background: `linear-gradient(145deg, ${mixHex(p.lo, p.hi, (k + 1) / MAX)}, ${mixHex(p.lo, p.hi, k / MAX)})`, ...mask(SOFT) })}
  />
);

export const STACK_DOTS: Record<string, FC<DotProps>> = { '17': D17, '18': D18, '19': D19, '20': D20, '21': D21, '22': D22, '23': D23 };
