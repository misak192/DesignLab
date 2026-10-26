/**
 * File: src/components/comments/Composer.tsx
 * Description: Where you type. Plain text with a hairline under it, no box and no focus ring: while you write, the
 * box is lit from behind by the chosen glow (src/components/backgrounds/GlowFrame.tsx, picked on /backgrounds; the
 * default is LoreLyst's star cluster, which blows apart when you post and re-forms). Enter posts, Shift+Enter starts
 * a new line.
 */
"use client";
import { useRef, useState, type KeyboardEvent } from 'react';
import GlowFrame from '@/components/backgrounds/GlowFrame';
import { useDisplay } from '@/components/display/DisplayProvider';
import type { GlowStyle } from '@/lib/display/settings';

const LIMIT = 280;

interface ComposerProps {
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** The colour of the submit button once there is something to post (the writer's accent). */
  accent?: string;
  /** Override the glow (the /backgrounds page shows each one); otherwise the saved choice. */
  glow?: GlowStyle;
}

export default function Composer({ placeholder, submitLabel, onSubmit, onCancel, autoFocus, accent, glow }: ComposerProps) {
  const { settings } = useDisplay();
  const [text, setText] = useState('');
  const [burst, setBurst] = useState(0);
  const postRef = useRef<HTMLButtonElement>(null);
  const body = text.trim();

  const submit = () => {
    if (!body) return;
    onSubmit(body);
    setText('');
    setBurst((b) => b + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <GlowFrame glow={glow ?? settings.glow} burst={burst} originRef={postRef} className="py-2">
      <div className="flex flex-col gap-1">
        <textarea
          value={text}
          autoFocus={autoFocus}
          rows={2}
          maxLength={LIMIT}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full resize-none border-0 border-b border-rail bg-transparent px-0 py-2 text-[1.0625rem] font-light leading-[1.55] text-ink outline-none placeholder:text-ink-3 focus:border-ink-3"
        />
        <div className="flex items-center justify-between gap-4 text-[0.875rem]">
          <span className="fw-tabular text-ink-3">{text.length > LIMIT - 40 ? `${LIMIT - text.length} left` : ''}</span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel} className="min-h-[48px] px-3 text-ink-2 hover:text-ink">
                Cancel
              </button>
            )}
            <button
              ref={postRef}
              type="button"
              onClick={submit}
              disabled={!body}
              className="min-h-[48px] px-3 font-medium text-ink transition-colors outline-none focus-visible:underline disabled:cursor-default disabled:text-ink-3"
              style={body && accent ? { color: accent } : undefined}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </GlowFrame>
  );
}
