/**
 * File: src/components/comments/CommentRow.tsx
 * Description: One comment and, below it, its replies. Row layout v2.2 (FW Comments · Design "Row layout v2", plus the
 * Master Lab behaviours Michalku asked to bring back):
 *  - The right-hand cluster is always `Name  time  total  count ›`; revealed, the total becomes `+up | −down`.
 *  - Tapping the sentence does BOTH: opens its replies (as many levels deep as the "Levels per tap" setting says) and
 *    reveals the rest of the author line (occupation, place, Reply). Tap again to fold and hide.
 *  - The reply count is a second, narrower target: it opens or folds only this comment's direct replies.
 *  - The author line floats to the end of the sentence's last line when there is room, otherwise sits right-aligned
 *    under it. Its space is reserved whether shown or hidden, so revealing never shifts the layout.
 * The letter logic is untouched: it still comes from src/lib/fw-comments. Motion follows the MOTION level.
 */
"use client";
import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { accentFor, formatNet, nameFirstMode, tally, votePaletteFor, type FirstWordMode, type ThreadNode } from '@/lib/fw-comments';
import { transitionFor } from '@/lib/motion/presets';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import Age from './Age';
import CommentText from './CommentText';
import Composer from './Composer';
import { personById, useComments } from './context';
import { useHeightTransition } from './useHeightTransition';

// 12-13px controls with a 48px-tall tap area that doesn't add height to the row.
const HIT = "relative before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']";

// Width of the word Reply at 13px, for fitting it after the sentence.
const REPLY_WIDTH = 37;

// Lets the sentence (inline text) act like a button from the keyboard.
const onActivate = (action: () => void) => (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};

interface CommentRowProps {
  node: ThreadNode;
  /** Position among its siblings, for the staggered arrival (replies only). */
  index?: number;
  /** Open this row's replies when it first appears (a parent's tap reached this deep). */
  initialOpen?: boolean;
  /** How many more levels below this row's own replies a tap should keep opening. */
  cascade?: number;
}

export default function CommentRow({ node, index = 0, initialOpen = false, cascade: cascadeProp = 0 }: CommentRowProps) {
  const { people, me, canPost, votes, palette, showParticipation, threadLines, openLevels, vote, post } = useComments();
  const { settings } = useDisplay();
  const m = useMotion();
  const light = settings.light;

  const [revealed, setRevealed] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(initialOpen);
  // How many levels below this row's replies the last tap opened too (so the replies mount already open).
  const [cascade, setCascade] = useState(cascadeProp);
  const [replying, setReplying] = useState(false);

  const { comment, depth, directReplies, descendants, authorPosts, children } = node;
  const author = personById(people, comment.authorId);
  const accent = accentFor(author.accent, light);
  const { up, down } = tally(comment, votes);
  const colours = votePaletteFor(palette, light);
  const myVote = votes[comment.id]?.[me.id];
  const isMine = comment.authorId === me.id;
  const hasReplies = directReplies > 0;
  const fadeMs = Math.round(400 * m.scale);
  const { ref: blockRef, mark } = useHeightTransition<HTMLDivElement>(revealed, Math.round(300 * m.scale));
  const nameMode = nameFirstMode(author.name, authorPosts, showParticipation);
  const sentenceRef = useRef<HTMLSpanElement>(null);
  // Where the hover Reply goes: a little after the end of the sentence's last line, if there is room before the name.
  const [replyAt, setReplyAt] = useState({ gap: 20, show: true });

  // A hero's first word is a meter of its direct replies (zero replies = plain white). Everyone else gets the
  // identity gradient, or, when the participation test is on, a meter of that person's posts in this thread.
  const first: FirstWordMode =
    depth === 0
      ? { kind: 'meter', count: directReplies }
      : showParticipation
        ? { kind: 'meter', count: authorPosts }
        : { kind: 'identity' };

  // A tap on a sentence with replies opens them `openLevels` deep and shows who wrote it; a tap on an open, revealed
  // sentence folds both away; otherwise it just toggles the author line.
  const tapSentence = () => {
    mark();
    if (hasReplies && !repliesOpen) {
      setCascade(openLevels - 1);
      setRepliesOpen(true);
      setRevealed(true);
    } else if (hasReplies && revealed) {
      setRepliesOpen(false);
      setRevealed(false);
    } else {
      setRevealed((v) => !v);
    }
  };

  // The count is the precise control: it opens or folds just this one level.
  const toggleCount = () => {
    setCascade(0);
    setRepliesOpen((v) => !v);
  };

  // Measured when the pointer enters the row (not while rendering): how much room the last line leaves for Reply.
  const measureReply = () => {
    const sentence = sentenceRef.current;
    const block = blockRef.current;
    if (!sentence || !block || revealed) return;
    const range = document.createRange();
    range.selectNodeContents(sentence);
    const rects = Array.from(range.getClientRects());
    if (rects.length === 0) return;
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const lineRight = Math.max(...rects.filter((r) => r.bottom >= bottom - 2).map((r) => r.right));
    const room = block.getBoundingClientRect().right - lineRight;
    setReplyAt({ gap: Math.max(2, Math.min(20, room - REPLY_WIDTH - 4)), show: room >= REPLY_WIDTH + 8 });
  };

  const repliesLabel = `${repliesOpen ? 'Close' : 'Open'} replies to ${author.name}, ${descendants} in all`;

  const voteButton = (direction: 1 | -1, count: number) => {
    const active = myVote === direction;
    return (
      <motion.button
        type="button"
        onClick={() => vote(comment.id, direction)}
        disabled={isMine}
        aria-pressed={active}
        whileTap={m.spring ? { scale: 1.5 } : undefined}
        aria-label={`${direction === 1 ? 'Vote up' : 'Vote down'}, ${count} so far${isMine ? ' (not on your own comment)' : ''}`}
        className={`${HIT} transition-colors hover:text-ink disabled:cursor-default disabled:hover:text-inherit`}
        style={{
          color: active ? (direction === 1 ? colours.up : colours.down) : undefined,
          fontWeight: active ? 500 : 400,
        }}
      >
        {direction === 1 ? '+' : '−'}
        {count}
      </motion.button>
    );
  };

  const fade = (visible: boolean) =>
    `transition-[opacity,filter] ease-out ${visible ? 'opacity-100 blur-0' : 'pointer-events-none opacity-0 blur-[3px]'}`;
  const fadeStyle = { transitionDuration: `${fadeMs}ms` };

  // Replies arrive one after another; with MOTION off they are simply there.
  const arrival =
    depth > 0 && m.scale > 0
      ? {
          initial: { opacity: 0, y: m.rise, filter: `blur(${m.blur}px)` },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: transitionFor(m, 0.5, index * m.stagger),
        }
      : {};

  return (
    <motion.li {...arrival}>
      {/* Three columns from sm up: the sentence, the name's slot, the rest of the cluster. Once revealed the sentence
          block spans the name's slot too, so the identity unit can end exactly where the name was. */}
      <div
        onMouseEnter={measureReply}
        className="group/row grid grid-cols-1 items-start gap-x-3 sm:grid-cols-[minmax(0,1fr)_4.25rem_auto]"
      >
        {/* No space is reserved for the reveal: it opens with a short height animation (useHeightTransition). */}
        <div
          ref={blockRef}
          className={`flow-root py-1.5 text-[1.0625rem] font-light leading-[26px] text-ink sm:col-start-1 sm:row-start-1 ${revealed ? 'sm:col-span-2' : ''}`}
        >
          <span
            ref={sentenceRef}
            role="button"
            tabIndex={0}
            aria-expanded={revealed}
            onClick={tapSentence}
            onKeyDown={onActivate(tapSentence)}
            className="cursor-pointer underline-offset-4 focus-visible:underline focus-visible:outline-none"
          >
            <CommentText
              body={comment.body}
              up={up}
              down={down}
              accent={accent}
              first={first}
              palette={colours}
              smooth={m.colour}
            />
          </span>

          {/* Reply: always in this one place, a little after the end of the sentence, in one design. Collapsed it takes
              no width (so nothing reflows) and shows while the pointer is over the row; revealed it is in the line. */}
          {canPost && (
            <span className={revealed ? '' : 'inline-block w-0 whitespace-nowrap align-baseline'}>
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                aria-expanded={replying}
                tabIndex={revealed || replyAt.show ? 0 : -1}
                style={{ ...fadeStyle, marginLeft: revealed ? 20 : replyAt.gap }}
                className={`${HIT} fw-reply transition-opacity ${
                  revealed
                    ? 'opacity-100'
                    : replyAt.show
                      ? 'pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover/row:pointer-events-auto group-hover/row:opacity-100'
                      : 'pointer-events-none opacity-0'
                }`}
              >
                Reply
              </button>
            </span>
          )}

          {/* Revealed: the identity unit, one nowrap piece, always aligned right where the name was. It sits on the
              sentence's row if it fits, otherwise the whole unit drops to the next row, ending at the same place. */}
          {revealed && (
            <span className="fw-reveal text-[0.75rem] font-normal leading-none" style={{ animationDuration: `${fadeMs}ms` }}>
              <span className="float-right ml-4 mt-[5px] whitespace-nowrap text-ink-2">
                <CommentText
                  body={author.name}
                  up={0}
                  down={0}
                  accent={accent}
                  first={nameMode}
                  palette={colours}
                  smooth={m.colour}
                />
                <span aria-hidden> · </span>
                {author.role}
                <span aria-hidden> · </span>
                {author.place}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-x-3 sm:contents">
          {/* The name sits in its own slot at rest; once revealed it moves into the identity unit, which ends here.
              Name, time and total are tap targets for the same gesture as the sentence (mouse and touch). */}
          <span
            aria-hidden={revealed}
            onClick={tapSentence}
            style={fadeStyle}
            className={`mt-1.5 flex h-[26px] min-w-[4.25rem] cursor-pointer items-center justify-end text-right text-[0.8125rem] font-normal sm:col-start-2 sm:row-start-1 sm:w-full ${fade(!revealed)}`}
          >
            <CommentText body={author.name} up={0} down={0} accent={accent} first={nameMode} palette={colours} smooth={m.colour} />
          </span>

          <div className="fw-tabular mt-1.5 flex h-[26px] shrink-0 items-center justify-end gap-3 text-[0.8125rem] text-ink-3 sm:col-start-3 sm:row-start-1">
            <span onClick={tapSentence} className="cursor-pointer">
              <Age at={comment.createdAt} />
            </span>

            {/* One cell, two faces: the total at rest, +up | −down (the vote buttons) once revealed. */}
            <span className="grid justify-items-end">
              <span
                aria-hidden={revealed}
                onClick={tapSentence}
                title="Net score (up minus down)"
                style={{ ...fadeStyle, color: myVote === 1 ? colours.up : myVote === -1 ? colours.down : undefined, fontWeight: myVote ? 500 : undefined }}
                className={`col-start-1 row-start-1 cursor-pointer ${fade(!revealed)}`}
              >
                {formatNet(up, down)}
              </span>
              <span
                inert={!revealed}
                aria-hidden={!revealed}
                style={fadeStyle}
                className={`col-start-1 row-start-1 flex items-center gap-1.5 ${fade(revealed)}`}
              >
                {voteButton(1, up)}
                <span aria-hidden>|</span>
                {voteButton(-1, down)}
              </span>
            </span>

            {hasReplies ? (
              <button
                type="button"
                onClick={toggleCount}
                aria-expanded={repliesOpen}
                aria-label={repliesLabel}
                className={`${HIT} flex w-10 items-center justify-end gap-0.5 transition-colors hover:text-ink`}
              >
                {descendants}
                <ChevronRight
                  aria-hidden
                  style={{ transitionDuration: `${Math.round(300 * m.scale)}ms` }}
                  className={`h-3 w-3 transition-transform ${repliesOpen ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span aria-hidden className="w-10" />
            )}
          </div>
        </div>
      </div>

      {replying && (
        <div className="pb-3">
          <Composer
            autoFocus
            accent={accentFor(me.accent, light)}
            placeholder={`Reply to ${author.name} as ${me.name}…`}
            submitLabel="Reply"
            onCancel={() => setReplying(false)}
            onSubmit={(body) => {
              post(comment.id, body);
              setReplying(false);
              setCascade(0);
              setRepliesOpen(true);
            }}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        {children.length > 0 && repliesOpen && (
          <motion.div
            key="replies"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitionFor(m, 0.4)}
            className="overflow-hidden"
          >
            {/* Indent plus identity colour carry the structure; the hairline is optional (Thread lines setting). */}
            <ol className={threadLines ? 'ml-[6px] border-l border-rail pl-3 sm:ml-[10px] sm:pl-[18px]' : 'pl-4 sm:pl-8'}>
              {children.map((child, i) => (
                <CommentRow
                  key={child.comment.id}
                  node={child}
                  index={i}
                  initialOpen={cascade > 0}
                  cascade={Math.max(0, cascade - 1)}
                />
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
