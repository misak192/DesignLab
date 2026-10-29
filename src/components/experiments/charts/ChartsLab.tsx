/**
 * File: src/components/experiments/charts/ChartsLab.tsx
 * Description: Letter-coded charts: applies the FrissonWorks letter-colour bar encoding to:
 * 1. XP Bars (letter-coded progress with newest letter soft until settled)
 * 2. Leaderboards (identity-hue letters tracking member score)
 * 3. Vote Tallies (proportional letter fill from green to red)
 * 4. ChronoLyst Timeline (duration-weighted typographic event blocks)
 */
"use client";

import { useState } from 'react';
import Link from 'next/link';

function letterFill(word: string, filledCount: number, accentColor: string, softColor: string) {
  const chars = Array.from(word);
  const cap = chars.length;
  const isSettled = filledCount >= cap;

  return chars.map((char, idx) => {
    let color = 'var(--ink-3)';
    if (idx < filledCount) {
      if (idx === filledCount - 1 && !isSettled) {
        color = softColor; // newest letter is soft while still growing
      } else {
        color = accentColor; // solid
      }
    }
    return (
      <span
        key={idx}
        className="transition-colors duration-300 font-mono tracking-[0.1em]"
        style={{ color }}
      >
        {char}
      </span>
    );
  });
}

export default function ChartsLab() {
  // XP Bar state
  const [xp, setXp] = useState(14); // out of 24
  const xpWord = 'RESONANCE_PROGRESSION';

  // Vote Tally state
  const [upvotes, setUpvotes] = useState(18);
  const [downvotes, setDownvotes] = useState(6);
  const tallyWord = 'CONSENSUS_RESONANCE';

  // Leaderboard state
  const LEADERBOARD_PEOPLE = [
    { name: 'Maya Lin', hue: '#FF2FA6', softHue: '#ff80ca', scoreWord: 'ARCHITECT_SOVEREIGN', score: 15 },
    { name: 'Kenji Sato', hue: '#00F2FE', softHue: '#7df8ff', scoreWord: 'NEXUS_SYNTHESIZER', score: 12 },
    { name: 'Lisa Chen', hue: '#C1FF22', softHue: '#dbff75', scoreWord: 'CHRONO_MODERATOR', score: 9 },
    { name: 'Anthony V.', hue: '#F59E0B', softHue: '#fbbf24', scoreWord: 'BRANCH_CONSENSUS', score: 7 },
  ];

  // ChronoLyst timeline events
  const TIMELINE_EVENTS = [
    { time: '09:00', title: 'KERNEL_INITIALIZATION', author: 'Maya', hue: '#FF2FA6', duration: '45m', width: '30%' },
    { time: '09:45', title: 'SPATIAL_TOPOLOGY_ALIGNMENT', author: 'Kenji', hue: '#00F2FE', duration: '60m', width: '45%' },
    { time: '11:00', title: 'CONSENSUS_REACHED_V3', author: 'Lisa', hue: '#C1FF22', duration: '30m', width: '25%' },
  ];

  // Vote split calculation
  const totalVotes = upvotes + downvotes;
  const tallyChars = Array.from(tallyWord);
  const upCount = totalVotes > 0 ? Math.round((upvotes / totalVotes) * tallyChars.length) : 0;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Letter-Coded Charts
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Type is the chart: bars, progress, tallies, and timelines encoded letter by letter.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          No generic grey bars. In FrissonWorks, data is spelled out. Under capacity, every colored letter is solid
          except the newest (soft tint); at capacity, all letters go solid.
        </p>
      </header>

      <div className="flex flex-col gap-20 pt-4">
        {/* 01 · XP Bar */}
        <section className="flex flex-col gap-4 border-b border-[var(--rail)]/50 pb-12">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">01</span>
              <h2 className="fw-kicker text-ink">XP Meter</h2>
            </div>
            <span className="fw-tabular text-[13px] text-t1">
              LEVEL 04 &bull; {xp} / {xpWord.length} RUNES
            </span>
          </div>

          <p className="text-[14px] text-ink-3">
            Each letter is a progress notch. The newest active letter breathes in a softer tint while still climbing.
          </p>

          <div className="py-4 text-[clamp(18px,2.5vw,26px)] font-mono tracking-[0.15em] select-none">
            {letterFill(xpWord, xp, 'var(--t1)', '#7df8ff')}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setXp((v) => Math.max(0, v - 1))}
              className="fw-kicker text-ink-2 hover:text-ink p-1 min-h-[36px]"
            >
              − Reduce XP
            </button>
            <button
              type="button"
              onClick={() => setXp((v) => Math.min(xpWord.length, v + 1))}
              className="fw-kicker text-t1 hover:text-ink p-1 min-h-[36px]"
            >
              + Earn XP
            </button>
            <button
              type="button"
              onClick={() => setXp(xpWord.length)}
              className="fw-kicker text-ink-3 hover:text-t1 p-1 min-h-[36px]"
            >
              Level Complete (Solid)
            </button>
          </div>
        </section>

        {/* 02 · Leaderboard */}
        <section className="flex flex-col gap-6 border-b border-[var(--rail)]/50 pb-12">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">02</span>
              <h2 className="fw-kicker text-ink">Typographic Leaderboard</h2>
            </div>
            <span className="fw-tabular text-[13px] text-ink-3">IDENTITY-HUE ENCODING</span>
          </div>

          <div className="flex flex-col divide-y divide-[var(--rail)]/30">
            {LEADERBOARD_PEOPLE.map((person, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex items-baseline gap-4 min-w-[200px]">
                  <span className="fw-tabular text-[13px] text-t1">0{idx + 1}</span>
                  <span className="fw-big text-[20px] font-light text-ink" style={{ color: person.hue }}>
                    {person.name}
                  </span>
                </div>

                <div className="text-[15px] font-mono tracking-[0.12em] select-none">
                  {letterFill(person.scoreWord, person.score, person.hue, person.softHue)}
                </div>

                <span className="fw-tabular text-[14px] text-ink-2">
                  {person.score * 120} PTS
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 03 · Vote Tally */}
        <section className="flex flex-col gap-4 border-b border-[var(--rail)]/50 pb-12">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">03</span>
              <h2 className="fw-kicker text-ink">Proportional Vote Split</h2>
            </div>
            <span className="fw-tabular text-[13px] text-ink-3">
              +{upvotes} UP &bull; −{downvotes} DOWN
            </span>
          </div>

          <p className="text-[14px] text-ink-3">
            The word fills proportionally from both ends: green fills from left, red fills from right.
          </p>

          <div className="py-4 text-[clamp(18px,2.5vw,26px)] font-mono tracking-[0.15em] select-none">
            {tallyChars.map((char, i) => {
              const isUp = i < upCount;
              const color = isUp ? '#10b981' : '#ef4444';
              return (
                <span key={i} className="transition-colors duration-300" style={{ color }}>
                  {char}
                </span>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUpvotes((v) => v + 1)}
              className="fw-kicker text-[#10b981] hover:text-ink p-1 min-h-[36px]"
            >
              + Upvote ({upvotes})
            </button>
            <button
              type="button"
              onClick={() => setDownvotes((v) => v + 1)}
              className="fw-kicker text-[#ef4444] hover:text-ink p-1 min-h-[36px]"
            >
              − Downvote ({downvotes})
            </button>
          </div>
        </section>

        {/* 04 · ChronoLyst Timeline */}
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">04</span>
              <h2 className="fw-kicker text-ink">ChronoLyst Timeline</h2>
            </div>
            <span className="fw-tabular text-[13px] text-ink-3">DURATION-WEIGHTED TYPE BLOCKS</span>
          </div>

          <p className="text-[14px] text-ink-3">
            Horizontal time continuum where each milestone is a letter-coded block sized to its real duration.
          </p>

          <div className="flex w-full overflow-hidden border border-[var(--rail)] p-3 gap-2">
            {TIMELINE_EVENTS.map((ev, i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-3 border-l-2 transition-all hover:bg-[var(--rail)]/20"
                style={{ width: ev.width, borderColor: ev.hue }}
              >
                <div className="flex justify-between items-baseline text-[11px] text-ink-3">
                  <span className="fw-tabular">{ev.time}</span>
                  <span className="fw-tabular text-t1">{ev.duration}</span>
                </div>
                <span className="fw-big text-[13px] font-light tracking-wide text-ink truncate mt-2" style={{ color: ev.hue }}>
                  {ev.title}
                </span>
                <span className="fw-kicker text-[10px] text-ink-3 mt-1">
                  By {ev.author}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

