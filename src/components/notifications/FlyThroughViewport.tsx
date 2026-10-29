/**
 * File: src/components/notifications/FlyThroughViewport.tsx
 * Description: Borderless spatial fly-through stage rendered directly above each button.
 * No theater screen, no boxes, no borders: big hero signs spawn in the air above the tapped button.
 * Earlier signs sit on top (higher zIndex) and partially cover subsequent signs emerging behind them.
 */
"use client";

import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';
import type { ColorTone, FlySign, NotificationEasing } from '@/lib/notifications/types';

interface ButtonFlyStageProps {
  /** Active sequence of signs flying above this button. */
  signs: FlySign[];
  /** Optional alignment ('left' for grid buttons, 'center' for wide hero buttons). */
  align?: 'left' | 'center';
}

function getEaseTuple(easing: NotificationEasing): readonly [number, number, number, number] {
  switch (easing) {
    case 'warp-accel':
      return [0.52, 0.02, 0.86, 0.08] as const;
    case 'snappy-spring':
      return [0.16, 1.32, 0.38, 1] as const;
    case 'slingshot':
      return [0.34, 1.56, 0.64, 1] as const;
    case 'linear-glide':
      return [0.35, 0.25, 0.65, 0.75] as const;
    case 'luxe-sine':
    default:
      return [0.22, 1, 0.36, 1] as const;
  }
}

function getToneFillStyle(tone: ColorTone): React.CSSProperties {
  switch (tone) {
    case 't1':
      return {
        color: 'var(--t1)',
        textShadow: '0 0 22px var(--glow), var(--halo-lg)',
      };
    case 't2':
      return {
        color: 'var(--t2)',
        textShadow: '0 0 22px color-mix(in srgb, var(--t2) 28%, transparent), var(--halo-lg)',
      };
    case 't3':
      return {
        color: 'var(--t3)',
        textShadow: 'var(--halo-lg)',
      };
    case 'gradient':
      return {
        background: 'linear-gradient(135deg, var(--t1), var(--t2), var(--ink))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 14px var(--glow))',
      };
    case 'aurora':
      return {
        background: 'linear-gradient(90deg, #FF2FA6, #1FC7FF, var(--ink))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 16px rgba(255,47,166,0.35))',
      };
    case 'ink':
    default:
      return {
        color: 'var(--ink)',
        textShadow: '0 0 24px rgba(255,255,255,0.18), var(--halo-lg)',
      };
  }
}

function buildSignKeyframes(
  sign: FlySign,
  motionScale: number
): { initial: TargetAndTransition; animate: TargetAndTransition } {
  const scaleFactor = motionScale === 0 ? 0.05 : motionScale;
  const dur = Math.max(0.2, sign.durationSec * scaleFactor);
  const delay = (sign.delayMs / 1000) * scaleFactor;
  const ease = getEaseTuple(sign.easing);

  const zReach = 260 + sign.intensity * 1600;
  const endScale = sign.maxScale;
  const endBlur = sign.blurPx;
  // Back signs start offset by stackOffsetY behind the front sign, then move into the focal line (y: 0) as the front sign clears
  const startY = sign.index === 0 ? 8 : sign.stackOffsetY;

  if (sign.disappearance === 'infinite-grow') {
    return {
      initial: {
        opacity: 0,
        scale: 0.48,
        y: startY,
        z: -420,
        letterSpacing: '0.12em',
        filter: 'blur(8px)',
      },
      animate: {
        opacity: [0, 1, 1, 0],
        scale: [0.48, 1, 1.35, endScale],
        y: [startY, 0, -4, -18],
        z: [-420, 0, 140, zReach],
        letterSpacing: ['0.12em', '0.24em', '0.36em', `${0.5 + sign.intensity * 1.1}em`],
        filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', `blur(${endBlur}px)`],
        transition: {
          duration: dur,
          delay,
          times: [0, 0.24, 0.64, 1],
          ease,
        },
      },
    };
  }

  if (sign.disappearance === 'ethereal-dissipate') {
    return {
      initial: {
        opacity: 0,
        scale: 0.72,
        y: startY + 10,
        z: -260,
        letterSpacing: '0.16em',
        filter: 'blur(12px)',
      },
      animate: {
        opacity: [0, 1, 1, 0],
        scale: [0.72, 1, 1.08, Math.min(endScale, 2.8)],
        y: [startY + 10, 0, -8, -42],
        z: [-260, 0, 35, 140],
        letterSpacing: ['0.16em', '0.26em', '0.38em', `${0.65 + sign.intensity * 0.9}em`],
        filter: ['blur(12px)', 'blur(0px)', 'blur(0px)', `blur(${Math.max(14, endBlur * 1.3)}px)`],
        transition: {
          duration: dur,
          delay,
          times: [0, 0.26, 0.68, 1],
          ease,
        },
      },
    };
  }

  if (sign.disappearance === 'dimensional-warp') {
    const dir = sign.index % 2 === 0 ? 1 : -1;
    return {
      initial: {
        opacity: 0,
        scale: 0.45,
        rotateY: -28 * dir,
        rotateX: 14,
        x: -70 * dir,
        y: startY,
        z: -500,
        filter: 'blur(8px)',
      },
      animate: {
        opacity: [0, 1, 1, 0],
        scale: [0.45, 1, 1.3, endScale * 0.85],
        rotateY: [-28 * dir, -4 * dir, 10 * dir, 38 * dir],
        rotateX: [14, 0, -5, -18],
        x: [-70 * dir, 0, 35 * dir, 220 * dir],
        y: [startY, 0, -8, -28],
        z: [-500, 0, 140, zReach],
        filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', `blur(${endBlur}px)`],
        transition: {
          duration: dur,
          delay,
          times: [0, 0.26, 0.64, 1],
          ease,
        },
      },
    };
  }

  if (sign.disappearance === 'stardust-split') {
    return {
      initial: {
        opacity: 0,
        scale: 0.65,
        y: startY,
        z: -320,
        letterSpacing: '0.14em',
        filter: 'blur(10px)',
      },
      animate: {
        opacity: [0, 1, 1, 0],
        scale: [0.65, 1, 1.15, Math.min(endScale, 4.5)],
        y: [startY, 0, -6, -26],
        z: [-320, 0, 60, 280],
        letterSpacing: ['0.14em', '0.26em', '0.48em', '1.85em'],
        filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', `blur(${Math.max(10, endBlur)}px)`],
        transition: {
          duration: dur,
          delay,
          times: [0, 0.25, 0.64, 1],
          ease,
        },
      },
    };
  }

  // horizon-sink
  return {
    initial: {
      opacity: 0,
      scale: Math.min(endScale, 3.2),
      y: startY,
      z: 320,
      letterSpacing: '0.32em',
      filter: 'blur(14px)',
    },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [Math.min(endScale, 3.2), 1, 0.72, 0.06],
      y: [startY, 0, -6, -24],
      z: [320, 0, -280, -1800],
      letterSpacing: ['0.32em', '0.24em', '0.18em', '0.06em'],
      filter: ['blur(14px)', 'blur(0px)', 'blur(1px)', `blur(${Math.max(12, endBlur)}px)`],
      transition: {
        duration: dur,
        delay,
        times: [0, 0.26, 0.66, 1],
        ease,
      },
    },
  };
}

export default function ButtonFlyStage({ signs, align = 'center' }: ButtonFlyStageProps) {
  const m = useMotion();

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute bottom-full left-0 right-0 mb-2 flex h-[110px] overflow-visible select-none ${
        align === 'left' ? 'items-end justify-start' : 'items-center justify-center'
      }`}
    >
      <AnimatePresence>
        {signs.map((sign) => {
          const kf = buildSignKeyframes(sign, m.scale);
          // Crucial layering rule: first sign (index 0) is on top, later signs sit behind it!
          const zIndex = 1000 - sign.index;
          const fillStyle = getToneFillStyle(sign.tone);

          return (
            <div
              key={sign.id}
              className={`pointer-events-none absolute inset-0 flex overflow-visible ${
                align === 'left' ? 'items-end justify-start' : 'items-center justify-center'
              }`}
              style={{
                zIndex,
                perspective: '1000px',
                perspectiveOrigin: align === 'left' ? '25% 50%' : '50% 50%',
              }}
            >
              <motion.div
                initial={kf.initial}
                animate={kf.animate}
                className={`flex flex-col overflow-visible whitespace-nowrap ${
                  align === 'left' ? 'items-start text-left origin-left' : 'items-center text-center origin-center'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity, filter, letter-spacing',
                }}
              >
                {sign.kicker && (
                  <span
                    className="fw-kicker mb-1 text-[10px] tracking-[0.38em] text-t1 uppercase"
                    style={{
                      WebkitTextStroke: '3px var(--canvas)',
                      paintOrder: 'stroke fill',
                    }}
                  >
                    {sign.kicker}
                  </span>
                )}

                {/* Relative wrapper with canvas silhouette twin so the front sign cleanly partially covers the sign behind it */}
                <span className="relative inline-block">
                  {/* Opaque canvas occlusion silhouette right behind the glyph fill */}
                  <span
                    aria-hidden
                    className="fw-vogue pointer-events-none select-none text-[clamp(26px,4.5vw,56px)] leading-[1.08] font-light uppercase"
                    style={{
                      color: 'var(--canvas)',
                      WebkitTextStroke: '8px var(--canvas)',
                      paintOrder: 'stroke fill',
                      textShadow: '0 0 22px var(--canvas), 0 0 10px var(--canvas)',
                    }}
                  >
                    {sign.text}
                  </span>

                  {/* Visible luminous hero text on top of its own silhouette */}
                  <span
                    className="fw-vogue absolute inset-0 text-[clamp(26px,4.5vw,56px)] leading-[1.08] font-light uppercase"
                    style={fillStyle}
                  >
                    {sign.text}
                  </span>
                </span>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
