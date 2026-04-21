'use client';

/**
 * MessageReactions
 * ────────────────
 * Two small, reusable atoms for the team chat:
 *
 *   • ReactionPillRow   — renders the stack of reaction pills below a
 *                         message. Each pill is `${emoji} ${count}`, with
 *                         the "you reacted" state visually lit up.
 *   • ReactionPicker    — tiny popover of the six default emojis; shown
 *                         on hover next to a message. Clicking an emoji
 *                         toggles the user's reaction.
 *
 * Intentionally dumb — both components are fully controlled by the host
 * (ChatInterface) via `onToggle(messageId, emoji)`. Keeps the data model
 * straightforward: each Message carries a `reactions` array, and toggling
 * mutates that array in the single source of truth.
 *
 * The six defaults (👍 ❤️ 🎉 👀 🙌 🔥) mirror what most modern chat apps
 * pick as their "most useful" reactions — positive, light, cover the
 * common acknowledgement-and-encouragement beats without needing a full
 * emoji keyboard. If a message already carries reactions outside that
 * set (e.g. from seeded data), the picker still renders them in the pill
 * row via the Message, so no reaction ever gets "hidden" just because
 * it's not in the default list.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import type { MessageReaction } from './teamSeedMessages';

export const DEFAULT_REACTION_EMOJIS = ['👍', '❤️', '🎉', '👀', '🙌', '🔥'];

/* ─── Pill row (below bubble) ────────────────────────────────────────── */

interface ReactionPillRowProps {
  reactions: MessageReaction[] | undefined;
  /** Handle used to decide which pills are "yours". The seed + toggle
   *  helpers both use the literal `'you'` so the UI doesn't need to
   *  thread the real userId around. */
  youHandle?: string;
  /** Invoked with the emoji clicked. Host toggles membership. */
  onToggle: (emoji: string) => void;
  /** When true, the row aligns to the right — used for user bubbles. */
  alignRight?: boolean;
}

export function ReactionPillRow({
  reactions,
  youHandle = 'you',
  onToggle,
  alignRight = false,
}: ReactionPillRowProps) {
  if (!reactions || reactions.length === 0) return null;

  // Collapse reactions with zero members (can happen after the user
  // unreacts the last reaction of that emoji) — belt-and-braces since
  // the host should already prune them, but this keeps the UI robust
  // if it doesn't.
  const visible = reactions.filter((r) => r.users.length > 0);
  if (visible.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-1 ${alignRight ? 'justify-end' : ''}`}
      // Prevent the parent bubble's group-hover styles from bleeding in —
      // reactions are their own surface.
      onClick={(e) => e.stopPropagation()}
    >
      {visible.map((r) => {
        const youReacted = r.users.includes(youHandle);
        return (
          <motion.button
            key={r.emoji}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onToggle(r.emoji)}
            title={
              youReacted
                ? r.users.length === 1
                  ? 'You reacted — click to remove'
                  : `You and ${r.users.length - 1} other${r.users.length > 2 ? 's' : ''} reacted`
                : `${r.users.length} reacted — click to join`
            }
            className={`inline-flex items-center gap-1 h-6 px-1.5 rounded-full border transition-colors ${
              youReacted
                ? 'bg-brand/10 border-brand/30 text-brand'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
            style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1 }}
          >
            <span style={{ fontSize: '13px' }}>{r.emoji}</span>
            <span>{r.users.length}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Inline picker (hover affordance) ───────────────────────────────── */

interface ReactionPickerProps {
  onPick: (emoji: string) => void;
  /** When true, the button is only visible on parent hover — mirrors the
   *  existing message toolbar affordances (copy, bookmark). */
  hoverOnly?: boolean;
  /** Align the expanded emoji tray to the right instead of left — used
   *  on user-side bubbles so the tray doesn't blow past the viewport. */
  alignRight?: boolean;
}

export function ReactionPicker({
  onPick,
  hoverOnly = true,
  alignRight = false,
}: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click — light touch, no portals, no focus traps. The
  // tray is tiny and low-stakes so a simple document listener suffices.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Add reaction"
        title="Add reaction"
        onClick={() => setOpen((v) => !v)}
        className={`w-7 h-7 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all ${
          hoverOnly && !open
            ? 'opacity-0 group-hover/msg:opacity-100'
            : 'opacity-100'
        }`}
      >
        <SmilePlus className="w-3.5 h-3.5" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-30 top-full mt-1 ${alignRight ? 'right-0' : 'left-0'}`}
          >
            <div className="flex items-center gap-0.5 p-1 bg-white border border-gray-200 rounded-full shadow-lg">
              {DEFAULT_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onPick(emoji);
                    setOpen(false);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{ fontSize: '16px', lineHeight: 1 }}
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
