/**
 * File: src/components/notifications/IntensityKnob.tsx
 * Description: Tactile rotary dial components for the spatial notification lab:
 * - RotaryKnob: Reusable precision SVG rotary dial for any numeric range.
 * - IntensityKnob: Master intensity dial with 5 quick-select detents.
 * - TuningKnobDeck: 6-knob console to tune Intensity, Word Cadence, Flight Speed,
 *   Breach Scale, Stack Overlap, and Vapor Blur one by one.
 */
"use client";

import { useCallback, useRef, useState } from 'react';
import {
  DEFAULT_TUNING,
  INTENSITY_PRESETS,
  type TuningParams,
} from '@/lib/notifications/types';

interface RotaryKnobProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  unit?: string;
  size?: number;
  accent?: string;
  onChange: (val: number) => void;
}

export function RotaryKnob({
  label,
  sublabel,
  value,
  min,
  max,
  step = 0.01,
  displayValue,
  unit = '',
  size = 112,
  accent = 'var(--t1)',
  onChange,
}: RotaryKnobProps) {
  const dialRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const START_ANGLE = 135;
  const END_ANGLE = 405;
  const SPAN = END_ANGLE - START_ANGLE; // 270 deg

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const currentAngle = START_ANGLE + normalized * SPAN;

  const quantize = useCallback(
    (rawNorm: number) => {
      const clampedNorm = Math.max(0, Math.min(1, rawNorm));
      const rawVal = min + clampedNorm * (max - min);
      const stepped = Math.round(rawVal / step) * step;
      // Avoid floating point noise
      const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
      return Number(Math.max(min, Math.min(max, stepped)).toFixed(decimals));
    },
    [min, max, step]
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;

      let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;

      if (deg >= 45 && deg < 135) {
        if (deg < 90) deg = 45;
        else deg = 135;
      } else if (deg < 45) {
        deg += 360;
      }

      const clampedDeg = Math.max(START_ANGLE, Math.min(END_ANGLE, deg));
      const norm = (clampedDeg - START_ANGLE) / SPAN;
      onChange(quantize(norm));
    },
    [SPAN, onChange, quantize]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let dir = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') dir = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') dir = -1;
    else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
      return;
    } else return;

    e.preventDefault();
    const nextNorm = normalized + dir * 0.05;
    onChange(quantize(nextNorm));
  };

  const center = size / 2;
  const radius = size * 0.39;
  const innerHub = size * 0.27;
  const strokeWidth = 2.6;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (SPAN / 360) * circumference;
  const activeLength = normalized * arcLength;

  const rad = ((currentAngle - 90) * Math.PI) / 180;
  const pointerX = center + Math.cos(rad) * (radius - 7);
  const pointerY = center + Math.sin(rad) * (radius - 7);
  const pointerInnerX = center + Math.cos(rad) * (innerHub * 0.68);
  const pointerInnerY = center + Math.sin(rad) * (innerHub * 0.68);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ width: size, height: size }}
        className="group relative cursor-grab select-none touch-none active:cursor-grabbing focus-visible:outline-none"
      >
        <svg
          ref={dialRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          aria-hidden
        >
          {/* Track arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--rail)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(135 ${center} ${center})`}
            strokeLinecap="round"
          />

          {/* Active glowing arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={strokeWidth + 0.5}
            strokeDasharray={`${activeLength} ${circumference}`}
            transform={`rotate(135 ${center} ${center})`}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 6px var(--glow))',
              transition: isDragging ? 'none' : 'stroke-dasharray 0.16s var(--ease)',
            }}
          />

          {/* Hub ring */}
          <circle
            cx={center}
            cy={center}
            r={innerHub}
            fill="none"
            stroke="var(--rail)"
            strokeWidth="1"
            className="transition-colors group-hover:stroke-ink-3"
          />

          {/* Indicator needle */}
          <line
            x1={pointerInnerX}
            y1={pointerInnerY}
            x2={pointerX}
            y2={pointerY}
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${accent})`,
              transition: isDragging ? 'none' : 'all 0.16s var(--ease)',
            }}
          />

          {/* Perimeter ticks */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((tickStep, idx) => {
            const tickAngle = START_ANGLE + tickStep * SPAN;
            const tickRad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = center + Math.cos(tickRad) * (radius + 5);
            const y1 = center + Math.sin(tickRad) * (radius + 5);
            const x2 = center + Math.cos(tickRad) * (radius + 8.5);
            const y2 = center + Math.sin(tickRad) * (radius + 8.5);
            const isLit = normalized >= tickStep - 0.01;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isLit ? accent : 'var(--ink-3)'}
                strokeWidth={tickStep === 0 || tickStep === 1 ? '1.5' : '1'}
                opacity={isLit ? 0.9 : 0.35}
              />
            );
          })}
        </svg>

        {/* Central numeric display */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="fw-big fw-tabular text-[19px] font-light leading-none text-ink">
            {displayValue}
            {unit && <span className="text-[11px] font-normal text-ink-3">{unit}</span>}
          </span>
        </div>
      </div>

      <span className="fw-kicker text-[11px] tracking-[2px] text-ink text-center">
        {label}
      </span>
      {sublabel && (
        <span className="text-[11px] font-light text-ink-3 text-center leading-tight">
          {sublabel}
        </span>
      )}
    </div>
  );
}

interface IntensityKnobProps {
  value: number;
  onChange: (val: number) => void;
}

export default function IntensityKnob({ value, onChange }: IntensityKnobProps) {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <RotaryKnob
        label="Intensity"
        sublabel="Lowest → Highest"
        value={value}
        min={0.05}
        max={1.0}
        step={0.01}
        displayValue={String(Math.round(value * 100))}
        unit="%"
        size={132}
        onChange={onChange}
      />

      <div className="flex flex-1 flex-col gap-3 min-w-[260px]">
        <div className="flex items-baseline justify-between">
          <span className="fw-kicker text-ink-2 text-[0.8125rem]">Quick Intensity Detents</span>
          <span className="fw-tabular text-[0.8125rem] text-t1 font-normal">
            {value <= 0.25
              ? 'Whisper float'
              : value <= 0.5
              ? 'Calm focus'
              : value <= 0.8
              ? 'Kinetic surge'
              : 'Hyper-warp breach'}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Preset intensity detents"
          className="grid grid-cols-2 sm:grid-cols-5 gap-2"
        >
          {INTENSITY_PRESETS.map((preset) => {
            const active = Math.abs(value - preset.value) < 0.06;
            return (
              <button
                key={preset.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(preset.value)}
                className="flex flex-col items-start gap-1 py-2 px-1 text-left transition-colors min-h-[48px]"
                style={{
                  borderBottom: `1.5px solid ${active ? 'var(--t1)' : 'var(--rail)'}`,
                }}
              >
                <span
                  className="fw-big text-[16px] tracking-wide"
                  style={{
                    color: active ? 'var(--t1)' : 'var(--ink)',
                    fontWeight: active ? 500 : 300,
                  }}
                >
                  {preset.label}
                </span>
                <span className="fw-tabular text-[11px] text-ink-3">
                  {Math.round(preset.value * 100)}% · {preset.note}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TuningKnobDeckProps {
  tuning: TuningParams;
  onChange: (patch: Partial<TuningParams>) => void;
  onReset: () => void;
}

/**
 * Six-knob console for tuning every aspect of the dual-sign and word-by-word fly-throughs one by one.
 */
export function TuningKnobDeck({ tuning, onChange, onReset }: TuningKnobDeckProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4 pt-2">
        <RotaryKnob
          label="01 · Intensity"
          sublabel="Overall energy & Z reach"
          value={tuning.intensity}
          min={0.05}
          max={1.0}
          step={0.01}
          displayValue={String(Math.round(tuning.intensity * 100))}
          unit="%"
          accent="var(--t1)"
          onChange={(intensity) => onChange({ intensity })}
        />

        <RotaryKnob
          label="02 · Word Cadence"
          sublabel="Gap before next sign"
          value={tuning.cadenceMs}
          min={100}
          max={950}
          step={10}
          displayValue={String(tuning.cadenceMs)}
          unit="ms"
          accent="var(--t2)"
          onChange={(cadenceMs) => onChange({ cadenceMs })}
        />

        <RotaryKnob
          label="03 · Flight Duration"
          sublabel="Time on screen per sign"
          value={tuning.durationSec}
          min={0.8}
          max={4.5}
          step={0.1}
          displayValue={tuning.durationSec.toFixed(1)}
          unit="s"
          accent="var(--t1)"
          onChange={(durationSec) => onChange({ durationSec })}
        />

        <RotaryKnob
          label="04 · Breach Scale"
          sublabel="How huge it grows"
          value={tuning.maxScale}
          min={1.2}
          max={32}
          step={0.5}
          displayValue={tuning.maxScale.toFixed(1)}
          unit="×"
          accent="var(--t2)"
          onChange={(maxScale) => onChange({ maxScale })}
        />

        <RotaryKnob
          label="05 · Back Peek Y"
          sublabel="Where back text sits"
          value={tuning.stackOffsetY}
          min={-60}
          max={60}
          step={2}
          displayValue={tuning.stackOffsetY > 0 ? `+${tuning.stackOffsetY}` : String(tuning.stackOffsetY)}
          unit="px"
          accent="var(--t3)"
          onChange={(stackOffsetY) => onChange({ stackOffsetY })}
        />

        <RotaryKnob
          label="06 · Vapor Blur"
          sublabel="Dissipation mist"
          value={tuning.blurPx}
          min={0}
          max={44}
          step={1}
          displayValue={String(tuning.blurPx)}
          unit="px"
          accent="var(--t1)"
          onChange={(blurPx) => onChange({ blurPx })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rail)]/40 pt-3 text-[12px] text-ink-3">
        <span>
          Drag any knob vertically/radially or use arrow keys to fine-tune the overlap and fly-through feel.
        </span>
        <button
          type="button"
          onClick={onReset}
          className="fw-kicker text-[11px] text-ink-2 hover:text-t1 transition-colors min-h-[36px]"
        >
          ↺ Reset Knobs to Default ({Math.round(DEFAULT_TUNING.intensity * 100)}% · {DEFAULT_TUNING.cadenceMs}ms)
        </button>
      </div>
    </div>
  );
}
