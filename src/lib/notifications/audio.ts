/**
 * File: src/lib/notifications/audio.ts
 * Description: Ethereal Web Audio synthesizer for the spatial notifications lab.
 * Synthesizes pure harmonic sine waves and glass chime envelopes with frequency modulation
 * mapped to the intensity knob. Completely zero external assets, strictly client-side.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays an ethereal notification sound based on the tone and intensity.
 */
export function playNotificationSound(intensity: number, tone: string = 't1') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Map intensity to filter cutoff and master volume
    const clampedIntensity = Math.max(0.1, Math.min(1.0, intensity));
    const cutoff = 1200 + clampedIntensity * 4800;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);

    const masterVolume = 0.08 + clampedIntensity * 0.12;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(masterVolume, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + clampedIntensity * 0.8);

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Musical base frequencies based on tone
    let baseFreq = 440; // A4
    if (tone === 't1') baseFreq = 523.25; // C5
    else if (tone === 't2') baseFreq = 659.25; // E5
    else if (tone === 't3') baseFreq = 392.00; // G4
    else if (tone === 'aurora') baseFreq = 587.33; // D5
    else if (tone === 'gradient') baseFreq = 493.88; // B4

    // Layer 2 to 3 harmonious harmonics
    const harmonics = [1, 1.5, 2.0];
    harmonics.forEach((mult, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * mult, now);

      // Pitch rise or subtle frequency sweep during breach
      if (clampedIntensity > 0.6) {
        osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 1.35, now + 0.6);
      }

      oscGain.gain.setValueAtTime(1 / (index + 1), now);
      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now);
      osc.stop(now + 1.8 + clampedIntensity);
    });
  } catch {
    // Graceful silence if audio is blocked
  }
}

