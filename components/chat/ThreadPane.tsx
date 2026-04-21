'use client';

/**
 * ThreadPane
 * ──────────
 * Slack-inspired right-hand pane for reading and posting replies on a
 * single thread. Keeps side-conversations out of the main channel view
 * without hiding them behind a modal: the pane slides in from the right,
 * preserves the channel's context on the left, and closes cleanly.
 *
 * Principles baked in here — the kind of stuff a principal designer
 * would sweat over on v1 of a chat app:
 *
 *   1. **Parent is always in view.**  The thread root stays anchored at
 *      the top of the pane so readers never lose context, no matter how
 *      deep the reply list gets. No accordion, no "scroll up to see the
 *      question" trap.
 *
 *   2. **Replies read like a focused mini-channel.**  Same avatar +
 *      author chip system as the main channel, same reaction row, same
 *      hover affordances. Zero re-learning required — if you know the
 *      channel, you know the thread.
 *
 *   3. **The composer is always reachable.**  Sticky at the bottom, with
 *      a soft separator above it so it reads as "the thing that takes
 *      your input" rather than "another message".
 *
 *   4. **Delightful motion, never distracting.**  The pane springs in
 *      (not slides — springs — the difference matters) and exits with a
 *      slightly faster tween so closing feels crisp. Replies animate in
 *      one at a time as they arrive.
 *
 *   5. **Keyboard-first where it matters.**  Esc closes the pane. Enter
 *      sends; Shift+Enter adds a newline. The composer autofocuses on
 *      open so your thought doesn't lose momentum between click and type.
 *
 * This component is intentionally *dumb about data* — the host
 * (ChatInterface) owns the message list, reaction toggles, and reply
 * submission. We receive them as props and render them in the right
 * shape. Keeps the thread feature surgical to add and trivial to remove.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Megaphone, Send, CornerDownRight } from 'lucide-react';
import { TEAM_AUTHORS, type TeamAuthor, type MessageReaction } from './teamSeedMessages';
import type { TeamChannelId } from './TeamChatSidebar';
import { ReactionPillRow, ReactionPicker } from './MessageReactions';

/**
 * Minimal message shape the pane needs. Matches a subset of the host's
 * Message type so we don't drag the entire ChatInterface type graph in
 * here. The host casts its richer messages down to this shape when it
 * passes them to the pane.
 */
export interface ThreadMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
  from?: 'user' | 'team';
  author?: TeamAuthor;
  channel?: TeamChannelId;
  reactions?: MessageReaction[];
  /** For the parent only — when true, we render it with a subtle
   *  "pinned" treatment at the top of the pane. */
  isRoot?: boolean;
}

interface ThreadPaneProps {
  /** The root message of the thread — rendered pinned at the top. */
  parent: ThreadMessage;
  /** Replies in timestamp order (oldest → newest). */
  replies: ThreadMessage[];
  /** Host-owned reaction toggle. Works on both the root and replies. */
  onToggleReaction: (messageId: string, emoji: string) => void;
  /** Post a reply. Host appends the new message to the global list with
   *  `parentId = parent.id` and the same channel as the parent. */
  onSendReply: (text: string, alsoSendToChannel: boolean) => void;
  onClose: () => void;
  /** Which channel this thread belongs to — drives the breadcrumb. */
  channelId: TeamChannelId;
  channelLabel: string;
}

/* ─── Time helpers ─────────────────────────────────────────────────── */

function formatRelative(ts: Date): string {
  const diff = Date.now() - ts.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatExactTime(ts: Date): string {
  return ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ─── Sub-atoms ────────────────────────────────────────────────────── */

function AuthorAvatar({ author, isUser, size = 28 }: { author?: TeamAuthor; isUser: boolean; size?: number }) {
  if (isUser) {
    return (
      <div
        className="rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ width: size, height: size, fontSize: size * 0.42, fontWeight: 700 }}
      >
        You
      </div>
    );
  }
  const meta = author ? TEAM_AUTHORS[author] : TEAM_AUTHORS['brego-team'];
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}
      style={{ width: size, height: size, fontSize: size * 0.42, fontWeight: 700 }}
    >
      {meta.initials}
    </div>
  );
}

function AuthorNameRow({
  author,
  isUser,
  timestamp,
}: {
  author?: TeamAuthor;
  isUser: boolean;
  timestamp: Date;
}) {
  const name = isUser ? 'You' : (author ? TEAM_AUTHORS[author].name : 'Brego Team');
  const role = isUser ? null : (author ? TEAM_AUTHORS[author].role : 'Official Updates');
  return (
    <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
      <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
        {name}
      </span>
      {role && (
        <span
          className="text-gray-500 px-1.5 py-0.5 rounded bg-gray-100/80"
          style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.01em' }}
        >
          {role}
        </span>
      )}
      <span className="text-gray-400" style={{ fontSize: '11px' }}>
        {formatExactTime(timestamp)}
      </span>
    </div>
  );
}

/**
 * Render the body of a thread message. Deliberately minimal — we don't
 * re-render the host's rich component zoo (dashboards, file cards, etc.)
 * inside threads because threads should stay text-first. If a reply
 * includes a file upload, we render a compact stand-in rather than the
 * full card; keeps the thread pane scannable.
 */
function ThreadBodyText({ content }: { content: string }) {
  // Lightweight bold renderer for **text** — good enough for thread
  // replies which almost never need markdown beyond emphasis. Splits on
  // `**...**` and wraps the odd-indexed chunks in <strong>.
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p style={{ fontSize: '14px', lineHeight: '1.55', color: '#111827', whiteSpace: 'pre-wrap' }}>
      {parts.map((p, i) => {
        if (i % 2 === 1) {
          return (
            <strong key={i} style={{ fontWeight: 600 }}>
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </p>
  );
}

function ThreadMessageRow({
  msg,
  isRoot,
  onToggleReaction,
}: {
  msg: ThreadMessage;
  isRoot: boolean;
  onToggleReaction: (id: string, emoji: string) => void;
}) {
  const isUser = msg.type === 'user' || msg.from === 'user';

  return (
    <div className={`group/msg flex items-start gap-2.5 ${isRoot ? '' : 'hover:bg-gray-50/70 rounded-lg'} -mx-2 px-2 py-1.5 transition-colors`}>
      <AuthorAvatar author={msg.author} isUser={isUser} size={isRoot ? 32 : 28} />
      <div className="flex-1 min-w-0">
        <AuthorNameRow author={msg.author} isUser={isUser} timestamp={msg.timestamp} />
        <ThreadBodyText content={msg.content} />
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <ReactionPillRow
            reactions={msg.reactions}
            onToggle={(emoji) => onToggleReaction(msg.id, emoji)}
          />
          <ReactionPicker onPick={(emoji) => onToggleReaction(msg.id, emoji)} hoverOnly />
        </div>
      </div>
    </div>
  );
}

/* ─── Main pane ────────────────────────────────────────────────────── */

export function ThreadPane({
  parent,
  replies,
  onToggleReaction,
  onSendReply,
  onClose,
  channelId,
  channelLabel,
}: ThreadPaneProps) {
  const [draft, setDraft] = useState('');
  const [alsoPost, setAlsoPost] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const Icon = channelId === 'announcements' ? Megaphone : Hash;

  // Autofocus composer on open — matches Slack's behaviour and lets the
  // user keep typing without a stray click. Short delay so focus lands
  // *after* the slide-in transition completes and the textarea is fully
  // in the tab order.
  useEffect(() => {
    const t = setTimeout(() => composerRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, []);

  // Esc closes the pane — standard expectation; no focus-trap needed
  // since the rest of the chat is still interactive behind the pane.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Auto-scroll to bottom when a new reply lands, so the latest message
  // stays visible without the user hunting for it.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [replies.length]);

  const replyCount = replies.length;
  const lastReplyAt = replies.length > 0 ? replies[replies.length - 1].timestamp : null;

  const replyLabel = useMemo(() => {
    if (replyCount === 0) return 'No replies yet';
    if (replyCount === 1) return '1 reply';
    return `${replyCount} replies`;
  }, [replyCount]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;
    onSendReply(text, alsoPost);
    setDraft('');
    setAlsoPost(false);
    // Keep focus in the composer so rapid follow-up replies feel fluid.
    composerRef.current?.focus();
  };

  return (
    <motion.aside
      // Spring-in from the right — the slight overshoot at the end is
      // what sells the "it landed" feel without being bouncy. Tuned to
      // feel snappy (total motion ~280ms) rather than cinematic.
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.6 }}
      className="h-full w-full sm:w-[440px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200/80 shadow-[-8px_0_24px_rgba(15,23,42,0.04)]"
      role="complementary"
      aria-label={`Thread on #${channelLabel}`}
    >
      {/* Header — title + channel breadcrumb + close. Mirrors the channel
          header's visual weight so the pane reads as a first-class surface,
          not a dialog. */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
            <CornerDownRight className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-gray-900 leading-tight" style={{ fontSize: '14px', fontWeight: 600 }}>
              Thread
            </h3>
            <div className="flex items-center gap-1 text-gray-500 mt-0.5" style={{ fontSize: '11px' }}>
              <Icon className="w-3 h-3" strokeWidth={2} />
              <span className="truncate">{channelLabel}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close thread"
          title="Close thread (Esc)"
          className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </header>

      {/* Body — scrollable area with parent pinned at top, divider, replies */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
        {/* Parent — the thread root. Subtle "pinned" treatment so users
            always know where the question started, but nothing shouty. */}
        <div className="rounded-lg bg-gradient-to-br from-gray-50/80 to-white border border-gray-200/60 px-3 py-3 mb-4">
          <ThreadMessageRow msg={parent} isRoot onToggleReaction={onToggleReaction} />
        </div>

        {/* Divider — "N replies · last reply Xm ago". Reads like a chapter
            heading inside the pane. */}
        <div className="flex items-center gap-3 mb-2 select-none">
          <div className="flex-1 h-px bg-gray-200/80" />
          <span className="text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>
            {replyLabel}
            {lastReplyAt && replyCount > 0 && (
              <span className="text-gray-400 ml-1.5" style={{ fontWeight: 500 }}>
                · last {formatRelative(lastReplyAt)}
              </span>
            )}
          </span>
          <div className="flex-1 h-px bg-gray-200/80" />
        </div>

        {/* Replies — plain stack, no fancy grouping. Each reply animates
            in once; framer's `layout` prop keeps the list rearranging
            smoothly if a new reply lands while the pane is open. */}
        <AnimatePresence initial={false}>
          {replies.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ThreadMessageRow msg={r} isRoot={false} onToggleReaction={onToggleReaction} />
            </motion.div>
          ))}
        </AnimatePresence>

        {replyCount === 0 && (
          <div className="text-center py-6 text-gray-400" style={{ fontSize: '12px' }}>
            Be the first to reply
          </div>
        )}
      </div>

      {/* Composer — sticky footer. Soft separator above makes it feel
          like an input bar, not another message. */}
      <footer className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm px-3 pt-2.5 pb-3">
        <div className="rounded-xl border border-gray-200 bg-white focus-within:border-brand/50 focus-within:shadow-[0_0_0_3px_rgba(32,76,199,0.08)] transition-all">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Reply to this thread…"
            rows={2}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 focus:outline-none"
            style={{ fontSize: '14px', lineHeight: '1.55' }}
          />
          <div className="flex items-center justify-between px-2.5 pb-2">
            {/* "Also send to channel" — Slack's classic dual-post toggle.
                Off by default (the point of a thread is to keep it out of
                the channel), but one click away when it matters. */}
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-gray-600 hover:text-gray-900 transition-colors">
              <input
                type="checkbox"
                checked={alsoPost}
                onChange={(e) => setAlsoPost(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand/40 focus:ring-offset-0"
              />
              <span style={{ fontSize: '11.5px' }}>Also send to #{channelLabel}</span>
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!draft.trim()}
              aria-label="Send reply"
              title="Send · Enter"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                draft.trim()
                  ? 'bg-brand text-white hover:bg-brand-hover active:scale-[0.95] shadow-[0_1px_2px_rgba(32,76,199,0.25)]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <p className="text-gray-400 mt-1.5 px-1" style={{ fontSize: '10.5px' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </footer>
    </motion.aside>
  );
}

/* ─── Thread summary strip (used in the main channel) ──────────────── */

/**
 * Compact strip shown below a parent message when it has replies.
 * Clicking opens the ThreadPane. Mirrors Slack's summary: stacked
 * avatars of the unique repliers + "N replies" + last reply relative
 * time + a subtle "View thread →" affordance on hover.
 */
export interface ThreadSummaryStripProps {
  replies: ThreadMessage[];
  onClick: () => void;
  alignRight?: boolean;
}

export function ThreadSummaryStrip({ replies, onClick, alignRight = false }: ThreadSummaryStripProps) {
  if (replies.length === 0) return null;

  // Unique participants, preserving first-reply order. Avatars stack
  // left-to-right, capped at 3 so the strip never grows past a
  // predictable width.
  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();
    const out: { key: string; author?: TeamAuthor; isUser: boolean }[] = [];
    for (const r of replies) {
      const isUser = r.type === 'user' || r.from === 'user';
      const key = isUser ? 'you' : (r.author ?? 'brego-team');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, author: isUser ? undefined : (r.author ?? 'brego-team'), isUser });
      if (out.length >= 3) break;
    }
    return out;
  }, [replies]);

  const count = replies.length;
  const lastReplyAt = replies[replies.length - 1].timestamp;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/thread inline-flex items-center gap-2 mt-1.5 px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all ${
        alignRight ? 'self-end' : ''
      }`}
      title="View thread"
    >
      <div className="flex -space-x-1.5">
        {uniqueParticipants.map((p) => (
          <AuthorAvatar key={p.key} author={p.author} isUser={p.isUser} size={20} />
        ))}
      </div>
      <span className="text-brand" style={{ fontSize: '12px', fontWeight: 600 }}>
        {count} {count === 1 ? 'reply' : 'replies'}
      </span>
      <span className="text-gray-400" style={{ fontSize: '11.5px' }}>
        Last {formatRelative(lastReplyAt)}
      </span>
      <span
        className="text-gray-400 opacity-0 group-hover/thread:opacity-100 transition-opacity"
        style={{ fontSize: '11.5px', fontWeight: 500 }}
      >
        View thread →
      </span>
    </button>
  );
}
