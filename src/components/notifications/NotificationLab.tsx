/**
 * File: src/components/notifications/NotificationLab.tsx
 * Description: The /notifications page for FrissonWorks Design Lab.
 * No theater screen box: every fly-through spawns directly in the borderless air above the button you tap.
 * - Section 01: 8 Archetype buttons. Every press launches 2 signs above that button:
 *   first the Button Name (on top), followed right behind it by "You are doing so well!" (partially covered by the front sign).
 * - Section 02: 6-Knob Word-by-Word Tuning Deck + Hero Trigger Button to tune a long sentence word by word.
 * - Section 03: 6 curated Long-Sentence Word-by-Word Style Buttons, each launching above itself and loadable into the knobs.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { playNotificationSound } from '@/lib/notifications/audio';
import {
  ARCHETYPES,
  type ArchetypeConfig,
   type ColorTone,
  DEFAULT_FOLLOW_UP,
  DEFAULT_TUNING,
  type DisappearanceMode,
  type FlySign,
  type NotificationEasing,
  SAMPLE_SENTENCES,
  type TuningParams,
  WORD_STREAM_STYLES,
  type WordStreamStyle,
} from '@/lib/notifications/types';
import ButtonFlyStage from './FlyThroughViewport';
import IntensityKnob, { TuningKnobDeck } from './IntensityKnob';

export default function NotificationLab() {
  const { settings } = useDisplay();

  // Map of buttonId -> active FlySign[] currently flying above that specific button
  const [buttonStreams, setButtonStreams] = useState<Record<string, FlySign[]>>({});
  const cleanupTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});

  // Master tuning parameters controlled by the rotary knobs
  const [tuning, setTuning] = useState<TuningParams>(DEFAULT_TUNING);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Long sentence state for word-by-word fly-through
  const [sentence, setSentence] = useState<string>(SAMPLE_SENTENCES[0]);
  const [customMode, setCustomMode] = useState<DisappearanceMode>('infinite-grow');
  const [customEasing, setCustomEasing] = useState<NotificationEasing>('warp-accel');
  const [customTone, setCustomTone] = useState<ColorTone>('t1');

  const updateTuning = useCallback((patch: Partial<TuningParams>) => {
    setTuning((prev) => ({ ...prev, ...patch }));
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    const timersMap = cleanupTimersRef.current;
    return () => {
      Object.values(timersMap).forEach((list) => list.forEach(clearTimeout));
    };
  }, []);

  /**
   * Launches a sequence of FlySign items directly above `buttonId`.
   * Sign 0 has highest zIndex (on top), Sign 1 sits behind Sign 0, Sign 2 behind Sign 1, etc.
   */
  const launchSequenceOnButton = useCallback(
    (
      buttonId: string,
      items: { text: string; kicker?: string; tone?: ColorTone }[],
      params: TuningParams,
      disappearance: DisappearanceMode,
      easing: NotificationEasing,
      defaultTone: ColorTone
    ) => {
      // Clear any previous timers on this button
      if (cleanupTimersRef.current[buttonId]) {
        cleanupTimersRef.current[buttonId].forEach(clearTimeout);
      }
      cleanupTimersRef.current[buttonId] = [];

      const batchId = `${buttonId}-${Date.now()}`;
      const signs: FlySign[] = items.map((item, idx) => ({
        id: `${batchId}-${idx}`,
        text: item.text,
        kicker: item.kicker,
        index: idx,
        total: items.length,
        delayMs: idx * params.cadenceMs,
        durationSec: params.durationSec,
        maxScale: params.maxScale,
        blurPx: params.blurPx,
        stackOffsetY: params.stackOffsetY,
        disappearance,
        easing,
        tone: item.tone ?? defaultTone,
        intensity: params.intensity,
      }));

      setButtonStreams((prev) => ({
        ...prev,
        [buttonId]: signs,
      }));

      // Schedule optional audio chimes per sign
      if (soundEnabled) {
        signs.forEach((sign, idx) => {
          const soundTimer = setTimeout(() => {
            // Slightly ascend pitch awareness via tone/intensity
            const pitchBoost = Math.min(1, params.intensity + idx * 0.04);
            playNotificationSound(pitchBoost, sign.tone);
          }, sign.delayMs);
          cleanupTimersRef.current[buttonId].push(soundTimer);
        });
      }

      // Clear signs after the last one finishes its flight
      const totalDurationMs =
        (items.length - 1) * params.cadenceMs + params.durationSec * 1000 + 400;
      const clearTimer = setTimeout(() => {
        setButtonStreams((prev) => ({
          ...prev,
          [buttonId]: [],
        }));
      }, totalDurationMs);
      cleanupTimersRef.current[buttonId].push(clearTimer);
    },
    [soundEnabled]
  );

  /**
   * Fires the 2-sign sequence above an archetype button:
   * Sign 1 (front/top): Button Name
   * Sign 2 (behind Sign 1): "You are doing so well!"
   */
  const fireArchetypeButton = (arch: ArchetypeConfig) => {
    launchSequenceOnButton(
      arch.id,
      [
        { text: arch.name, kicker: arch.kicker, tone: arch.tone },
        { text: arch.followUpText, kicker: 'SECOND SIGN · BEHIND', tone: 'ink' },
      ],
      tuning,
      arch.disappearance,
      arch.easing,
      arch.tone
    );
  };

  /**
   * Splits the current sentence into words and fires them one by one above `buttonId`.
   * First word is on top (zIndex 1000), each subsequent word spawns behind the previous word.
   */
  const fireWordByWordOnButton = (
    buttonId: string,
    params: TuningParams,
    disappearance: DisappearanceMode,
    easing: NotificationEasing,
    tone: ColorTone
  ) => {
    const words = sentence
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return;

    const items = words.map((word, idx) => ({
      text: word,
      kicker: `${String(idx + 1).padStart(2, '0')} / ${String(words.length).padStart(2, '0')}`,
      tone: idx % 2 === 0 ? tone : ('ink' as ColorTone),
    }));

    launchSequenceOnButton(buttonId, items, params, disappearance, easing, tone);
  };

  const firePresetWordStyle = (style: WordStreamStyle) => {
    fireWordByWordOnButton(
      style.id,
      style.tuning,
      style.disappearance,
      style.easing,
      style.tone
    );
  };

  const loadStyleIntoKnobs = (style: WordStreamStyle) => {
    setTuning(style.tuning);
    setCustomMode(style.disappearance);
    setCustomEasing(style.easing);
    setCustomTone(style.tone);
    fireWordByWordOnButton(
      'hero-tuned-word-stream',
      style.tuning,
      style.disappearance,
      style.easing,
      style.tone
    );
  };

  const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-44 pt-10 sm:pt-14">
      {/* Page Header */}
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Notifications
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          No theater screen. Every tap launches layered signs right in the air above the button.
        </p>
        <p className="max-w-[64ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Each button press spawns a depth-ordered sequence directly above itself: the first sign flies in front,
          and the next sign emerges right behind it — partially covered by the front sign until the front sign
          grows huge past the camera or dissolves into mist.
        </p>
      </header>

      {/* 01 · Master Intensity & Dual-Sign Archetype Buttons */}
      <section aria-labelledby="s-archetypes" className="flex flex-col gap-10 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">01</span>
              <h2 id="s-archetypes" className="fw-kicker text-ink">
                Dual-Sign Fly-Through Buttons
              </h2>
            </div>
            <p className="fw-big max-w-[36ch] text-[26px] font-light leading-[1.25] text-ink">
              Sign 1: Button Name (on top) → Sign 2: &ldquo;{DEFAULT_FOLLOW_UP}&rdquo; (behind).
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span className="fw-tabular text-[12px] text-ink-3">
              SKIN: {settings.skin.toUpperCase()} · MOTION: {settings.motion.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="fw-kicker text-ink-2 hover:text-ink transition-colors min-h-[44px]"
            >
              {soundEnabled ? '● SOUND ON' : '○ SOUND OFF'}
            </button>
          </div>
        </div>

        {/* Master Intensity Knob */}
        <div className="py-2">
          <IntensityKnob
            value={tuning.intensity}
            onChange={(intensity) => updateTuning({ intensity })}
          />
        </div>

        {/* Grid of 8 Archetype Buttons — generous top padding so each button has open air above it */}
        <div className="grid gap-x-10 gap-y-28 pt-24 sm:grid-cols-2 lg:grid-cols-4">
          {ARCHETYPES.map((arch) => {
            const activeSigns = buttonStreams[arch.id] ?? [];
            const isFlying = activeSigns.length > 0;
            const isWarp =
              arch.disappearance === 'infinite-grow' || arch.disappearance === 'dimensional-warp';

            return (
              <div
                key={arch.id}
                className="relative flex flex-col"
                style={{ zIndex: isFlying ? 600 : 1 }}
              >
                {/* Borderless fly-through stage right above this button */}
                <ButtonFlyStage signs={activeSigns} align="center" />

                <button
                  type="button"
                  onClick={() => fireArchetypeButton(arch)}
                  className="group relative flex flex-col items-start gap-3.5 py-4 text-left transition-colors min-h-[156px] border-t border-b"
                  style={{
                    borderColor: isFlying ? 'var(--t1)' : 'var(--rail)',
                  }}
                >
                  <div className="flex w-full items-baseline justify-between">
                    <span className="fw-kicker text-[11px] text-t1">
                      {arch.kicker}
                    </span>
                    <span className="fw-tabular text-[11px] text-ink-3">
                      {isWarp ? '⚡ GROW & GONE' : '✦ DISSIPATE'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span
                      className="fw-big text-[23px] font-light tracking-wide transition-colors"
                      style={{ color: isFlying ? 'var(--t1)' : 'var(--ink)' }}
                    >
                      {arch.name}
                    </span>
                    <span className="text-[12px] font-normal text-ink-2">
                      Then: &ldquo;{arch.followUpText}&rdquo;
                    </span>
                  </div>

                  <p className="text-[13px] font-light leading-[1.45] text-ink-3">
                    {arch.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-1 text-[10px] uppercase tracking-[1.5px] text-t3">
                    <span>{arch.disappearance.replace('-', ' ')}</span>
                    <span>·</span>
                    <span>{arch.easing.replace('-', ' ')}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 · Word-by-Word Long Sentence Tuning Deck (One Button + 6 Knobs) */}
      <section aria-labelledby="s-word-tuner" className="flex flex-col gap-10 pt-32">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">02</span>
            <h2 id="s-word-tuner" className="fw-kicker text-ink">
              Word-by-Word Long Sentence Studio (6 Knobs)
            </h2>
          </div>
          <p className="fw-big max-w-[36ch] text-[29px] font-light leading-[1.25] text-ink">
            Tune the word-by-word overlap and fly-through one knob at a time.
          </p>
          <p className="max-w-[62ch] text-[0.9375rem] font-light leading-[1.5] text-ink-2">
            Word 1 spawns in front (`z-index` top). Word 2 spawns behind Word 1 after the{' '}
            <span className="text-ink">Word Cadence</span> delay, partially covered by Word 1 until Word 1
            flies past or vaporizes. Adjust all 6 knobs below and tap the hero button to test live.
          </p>
        </div>

        {/* 6 Rotary Knobs Deck */}
        <TuningKnobDeck
          tuning={tuning}
          onChange={updateTuning}
          onReset={() => setTuning(DEFAULT_TUNING)}
        />

        {/* Sentence Input & Mode Pickers */}
        <div className="grid gap-8 pt-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="word-sentence-input" className="fw-kicker text-[11px] text-ink-2">
                Long Sentence ({wordCount} words in depth stack)
              </label>
              <span className="fw-tabular text-[11px] text-t1">
                Total flight: ~{(((wordCount - 1) * tuning.cadenceMs) / 1000 + tuning.durationSec).toFixed(1)}s
              </span>
            </div>

            <input
              id="word-sentence-input"
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--rail)] py-2.5 text-[19px] font-light text-ink focus:border-t1 focus:outline-none"
              placeholder="Type a long sentence to fly through word by word..."
            />

            {/* Quick sample sentences */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
              <span className="fw-kicker text-[10px] text-ink-3 self-center">Samples:</span>
              {SAMPLE_SENTENCES.map((sample, i) => {
                const active = sentence === sample;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSentence(sample)}
                    className="text-left text-[12px] font-light transition-colors py-1"
                    style={{ color: active ? 'var(--t1)' : 'var(--ink-3)' }}
                  >
                    0{i + 1} · &ldquo;{sample.slice(0, 28)}…&rdquo;
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disappearance, Easing & Tone for the Tuned Button */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="fw-kicker text-[10px] text-ink-3 w-[4.5rem]">Mode</span>
              {(
                [
                  ['infinite-grow', 'Grow & Gone'],
                  ['ethereal-dissipate', 'Mist Vapor'],
                  ['dimensional-warp', '3D Orbit'],
                  ['stardust-split', 'Stardust'],
                  ['horizon-sink', 'Horizon'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCustomMode(id)}
                  className="text-[13px] py-1 border-b transition-colors"
                  style={{
                    color: customMode === id ? 'var(--t1)' : 'var(--ink-2)',
                    borderColor: customMode === id ? 'var(--t1)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="fw-kicker text-[10px] text-ink-3 w-[4.5rem]">Easing</span>
              {(
                [
                  ['warp-accel', 'Warp'],
                  ['luxe-sine', 'Luxe Sine'],
                  ['snappy-spring', 'Spring'],
                  ['slingshot', 'Slingshot'],
                  ['linear-glide', 'Linear'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCustomEasing(id)}
                  className="text-[13px] py-1 border-b transition-colors"
                  style={{
                    color: customEasing === id ? 'var(--t1)' : 'var(--ink-2)',
                    borderColor: customEasing === id ? 'var(--t1)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="fw-kicker text-[10px] text-ink-3 w-[4.5rem]">Colour</span>
              {(
                [
                  ['t1', 'T1 Glow'],
                  ['t2', 'T2 Glow'],
                  ['gradient', 'Gradient'],
                  ['aurora', 'Aurora'],
                  ['ink', 'Pure Ink'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCustomTone(id)}
                  className="text-[13px] py-1 border-b transition-colors"
                  style={{
                    color: customTone === id ? 'var(--t1)' : 'var(--ink-2)',
                    borderColor: customTone === id ? 'var(--t1)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Tuned Word-by-Word Trigger Button with generous air-space above it */}
        <div
          className="relative mt-28 flex flex-col items-center"
          style={{
            zIndex: (buttonStreams['hero-tuned-word-stream']?.length ?? 0) > 0 ? 700 : 1,
          }}
        >
          <ButtonFlyStage
            signs={buttonStreams['hero-tuned-word-stream'] ?? []}
            align="center"
          />

          <button
            type="button"
            onClick={() =>
              fireWordByWordOnButton(
                'hero-tuned-word-stream',
                tuning,
                customMode,
                customEasing,
                customTone
              )
            }
            className="flex w-full max-w-[680px] flex-col items-center gap-2 border-t border-b border-t1 py-6 text-center transition-colors min-h-[88px]"
          >
            <span className="fw-kicker text-[11px] tracking-[0.35em] text-t1">
              TAP TO LAUNCH WORD BY WORD ({wordCount} WORDS · FRONT COVERS BACK)
            </span>
            <span
              className="fw-big text-[clamp(22px,3.2vw,30px)] font-light tracking-[0.06em] uppercase"
              style={{ color: 'var(--ink)' }}
            >
              Fly Tuned Sentence Word by Word →
            </span>
            <span className="fw-tabular text-[12px] text-ink-3">
              Intensity {Math.round(tuning.intensity * 100)}% · Cadence {tuning.cadenceMs}ms · Duration {tuning.durationSec.toFixed(1)}s · Scale {tuning.maxScale}× · Peek {tuning.stackOffsetY}px
            </span>
          </button>
        </div>
      </section>

      {/* 03 · Multiple Styles of Long-Sentence Word-by-Word Fly-Through */}
      <section aria-labelledby="s-word-styles" className="flex flex-col gap-10 pt-32">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">03</span>
            <h2 id="s-word-styles" className="fw-kicker text-ink">
              Long-Sentence Word-by-Word Styles
            </h2>
          </div>
          <p className="fw-big max-w-[36ch] text-[29px] font-light leading-[1.25] text-ink">
            Six curated word-by-word styles. Tap any button to see the sentence fly above it.
          </p>
          <p className="max-w-[60ch] text-[0.875rem] font-normal text-t3">
            Each button below has its own cadence, depth overlap, and disappearance style for the long sentence.
            Want to tweak one further? Tap &ldquo;Load into 6 Knobs&rdquo; under any button.
          </p>
        </div>

        <div className="grid gap-x-12 gap-y-28 pt-24 sm:grid-cols-2 lg:grid-cols-3">
          {WORD_STREAM_STYLES.map((style) => {
            const activeSigns = buttonStreams[style.id] ?? [];
            const isFlying = activeSigns.length > 0;

            return (
              <div
                key={style.id}
                className="relative flex flex-col"
                style={{ zIndex: isFlying ? 650 : 1 }}
              >
                {/* Local fly-through stage right above this style button */}
                <ButtonFlyStage signs={activeSigns} align="center" />

                <button
                  type="button"
                  onClick={() => firePresetWordStyle(style)}
                  className="flex flex-col items-start gap-3 py-4 text-left border-t border-b transition-colors min-h-[164px]"
                  style={{
                    borderColor: isFlying ? 'var(--t1)' : 'var(--rail)',
                  }}
                >
                  <div className="flex w-full items-baseline justify-between">
                    <span className="fw-kicker text-[11px] text-t1">
                      {style.kicker}
                    </span>
                    <span className="fw-tabular text-[11px] text-ink-3">
                      {style.tuning.cadenceMs}ms · {style.tuning.maxScale}×
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span
                      className="fw-big text-[23px] font-light tracking-wide"
                      style={{ color: isFlying ? 'var(--t1)' : 'var(--ink)' }}
                    >
                      {style.name}
                    </span>
                    <span className="text-[12px] font-normal text-ink-2">
                      {style.tagline}
                    </span>
                  </div>

                  <p className="text-[13px] font-light leading-[1.45] text-ink-3">
                    {style.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-1 text-[10px] uppercase tracking-[1.5px] text-t3">
                    <span>{style.disappearance.replace('-', ' ')}</span>
                    <span>·</span>
                    <span>{style.easing.replace('-', ' ')}</span>
                    <span>·</span>
                    <span>Peek {style.tuning.stackOffsetY}px</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loadStyleIntoKnobs(style)}
                  className="fw-kicker mt-2 w-fit text-[10px] text-ink-3 hover:text-t1 transition-colors min-h-[36px]"
                >
                  ↑ Load &ldquo;{style.name}&rdquo; into 6 Knobs & Fire
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
