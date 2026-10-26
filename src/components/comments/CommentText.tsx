/**
 * File: src/components/comments/CommentText.tsx
 * Description: Draws a comment as coloured runs from the letter logic. The first word is the person's identity
 * (gradient, or a one-hue meter), the last word shows the votes; both are only colour, so the text stays plain text.
 */
import { composeComment, toneColour, type FirstWordMode, type VotePalette } from '@/lib/fw-comments';

interface CommentTextProps {
  body: string;
  up: number;
  down: number;
  accent: string;
  first: FirstWordMode;
  palette: VotePalette;
  /** Colour changes fade instead of snapping (MOTION colour and ott). */
  smooth?: boolean;
}

export default function CommentText({ body, up, down, accent, first, palette, smooth }: CommentTextProps) {
  const runs = composeComment(body, { up, down, first });

  return (
    <>
      {runs.map((run, i) => {
        if (run.tone === 'ink') return <span key={i}>{run.text}</span>;

        if (run.tone === 'identity') {
          return (
            <span
              key={i}
              className="fw-gradient-text"
              style={{ backgroundImage: `linear-gradient(90deg, ${accent}, var(--ink))` }}
            >
              {run.text}
            </span>
          );
        }

        return (
          <span
            key={i}
            style={{ color: toneColour(run.tone, accent, palette) ?? undefined, transition: smooth ? 'color 0.6s' : undefined }}
          >
            {run.text}
          </span>
        );
      })}
    </>
  );
}
