'use client';

/**
 * TeamTabViews
 * ────────────
 * Three WhatsApp-inspired takeover views for the Brego Team chat area:
 *
 *   • Threads         → flattened timeline of recent activity across all
 *                       channels, grouped by day, newest first. Tap a row
 *                       to jump to that message in its channel.
 *   • Starred         → messages the user has bookmarked (reuses the
 *                       existing `bookmarkedMessageIds` Set). Unstar inline
 *                       or jump to the original message.
 *   • Media, docs &   → attachments (images + files) and links extracted
 *     links             from message content. Sub-filter between All,
 *                       Media, Docs and Links with a live count per group.
 *
 * These views are intentionally presentational — all state mutations
 * (bookmark toggle, channel switching, scroll-to-message) happen via
 * callbacks on the host (ChatInterface). That keeps ChatInterface's single
 * source of truth intact.
 *
 * Design principles:
 *   • Every view must have a meaningful empty state with a clear CTA.
 *   • Every row must be keyboard-reachable and click-to-jump.
 *   • Item counts flow back to the sidebar so the tabs can render live
 *     badges without this component owning presentation of the tabs.
 */

import { memo, useMemo, useState } from 'react';
import {
  MessageSquare,
  Star,
  Paperclip,
  Hash,
  Megaphone,
  FileText,
  Image as ImageIcon,
  LinkIcon,
  ExternalLink,
  ArrowRight,
  CornerDownRight,
} from 'lucide-react';
import type { TeamChannelId } from './TeamChatSidebar';
import { TEAM_AUTHORS, type TeamAuthor } from './teamSeedMessages';

// ─── Types ──────────────────────────────────────────────────────────────

export type TeamView = 'channel' | 'threads' | 'starred' | 'media';

/**
 * The minimal Message shape these views need. Mirrors a subset of the
 * `Message` interface declared in ChatInterface — keeping it local avoids
 * coupling this file to the giant ChatInterface type graph while still
 * staying strictly typed at every call site.
 */
export interface TeamViewMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
  channel?: TeamChannelId;
  from?: 'user' | 'team';
  /** For team-authored messages: the specific teammate. Surfaces as an
   *  avatar + name in the Threads list so users can scan "who's in this
   *  thread" at a glance. */
  author?: TeamAuthor;
  /** When set, this message is a *reply* in a thread whose root is this
   *  id. Threads view keys off this to count replies per root. */
  parentId?: string;
  component?: string;
  data?: any;
}

export interface TeamTabCounts {
  threads: number;
  starred: number;
  media: number;
}

// ─── URL + file helpers ─────────────────────────────────────────────────

// Intentionally conservative: match http(s) URLs only, stop at whitespace,
// closing parens or common punctuation to avoid swallowing markdown.
const URL_RE = /https?:\/\/[^\s)<>\]"]+/gi;

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|svg|heic|avif|bmp)$/i;
// Keep this list explicit — "file" vs "image" is classification that
// shows up in the sub-tabs, so we can't lean on a generic "has extension"
// check.
const DOC_EXT_RE = /\.(pdf|docx?|xlsx?|csv|pptx?|txt|zip|rar|json|tsv|md)$/i;

export function extractUrls(content: string): string[] {
  if (!content) return [];
  const matches = content.match(URL_RE) ?? [];
  // Strip common trailing punctuation that markdown / prose often drags in.
  return matches.map((u) => u.replace(/[.,;:!?]+$/, ''));
}

/**
 * Classify a single message into the media taxonomy used by the Media
 * view. Returns `null` when the message doesn't belong in that view.
 */
function classifyMedia(
  msg: TeamViewMessage,
): { kind: 'image' | 'doc' | 'link'; label: string; meta?: string; url?: string } | null {
  // File uploads — check data.uploadType first, then extension as fallback.
  if (msg.component === 'file-upload' && msg.data?.fileName) {
    const name: string = msg.data.fileName;
    const uploadType: string | undefined = msg.data.uploadType;
    const isImage = uploadType === 'image' || IMAGE_EXT_RE.test(name);
    return {
      kind: isImage ? 'image' : 'doc',
      label: name,
      meta: [msg.data.fileType, msg.data.fileSize].filter(Boolean).join(' · '),
    };
  }

  if (msg.component === 'batch-upload' && msg.data?.files) {
    // A batch represents multiple files at once; we flatten into a single
    // "N files" doc row. Keeps the list scannable without exploding into
    // dozens of near-identical entries.
    const files: string[] = Array.isArray(msg.data.files) ? msg.data.files : [];
    const anyImage = files.some((f) => IMAGE_EXT_RE.test(f));
    return {
      kind: anyImage ? 'image' : 'doc',
      label: `${files.length} ${files.length === 1 ? 'file' : 'files'}`,
      meta: msg.data.totalSize
        ? `${msg.data.totalSize} · ${msg.data.folderPath ?? 'Dataroom'}`
        : msg.data.folderPath ?? undefined,
    };
  }

  // Plain text message — extract first URL if any.
  const urls = extractUrls(msg.content);
  if (urls.length > 0) {
    return { kind: 'link', label: urls[0], url: urls[0] };
  }

  return null;
}

// ─── Count helpers (exposed to the sidebar) ─────────────────────────────

export function getTabCounts(
  messages: TeamViewMessage[],
  bookmarkedMessageIds: Set<string>,
): TeamTabCounts {
  // Threads = the number of root messages that have at least one reply.
  // Before we had real threads this was a catch-all "activity" count;
  // now that replies are a first-class concept, counting them separately
  // gives a truthful badge and matches the user's mental model (and
  // Slack's).
  const replyCountByParent = new Map<string, number>();
  for (const m of messages) {
    if (!m.parentId) continue;
    replyCountByParent.set(m.parentId, (replyCountByParent.get(m.parentId) ?? 0) + 1);
  }
  let threads = 0;
  let media = 0;
  let starred = 0;
  for (const m of messages) {
    if (!m.channel) continue;
    if (!m.parentId && (replyCountByParent.get(m.id) ?? 0) > 0) threads += 1;
    if (bookmarkedMessageIds.has(m.id)) starred += 1;
    if (classifyMedia(m)) media += 1;
  }
  return { threads, starred, media };
}

// ─── Shared atoms ───────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: TeamChannelId }) {
  const isAnnouncements = channel === 'announcements';
  const Icon = isAnnouncements ? Megaphone : Hash;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium ${
        isAnnouncements
          ? 'bg-amber-50 text-amber-700 border border-amber-100'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      }`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.2} />
      {isAnnouncements ? 'announcements' : 'discussions'}
    </span>
  );
}

function AuthorChip({ msg }: { msg: TeamViewMessage }) {
  const isUser = msg.type === 'user' || msg.from === 'user';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        isUser ? 'text-brand' : 'text-emerald-700'
      }`}
    >
      {isUser ? 'You' : 'Brego Team'}
    </span>
  );
}

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

function formatDayHeader(ts: Date): string {
  const now = new Date();
  const a = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((b - a) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return ts.toLocaleDateString('en-IN', { weekday: 'long' });
  return ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Produce a short, scannable preview: strips markdown noise, collapses
 * whitespace, and truncates at a word boundary. Preview length tuned
 * for the single-line row layout (~90 chars before wrap on desktop).
 */
function previewOf(content: string, max = 120): string {
  if (!content) return '';
  const stripped = content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '[image]')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= max) return stripped;
  const sliced = stripped.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trim()}…`;
}

// ─── View chrome ────────────────────────────────────────────────────────

function ViewHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: typeof MessageSquare;
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200/60 bg-white/70 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-[18px] h-[18px] text-gray-700" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
            {title}
          </h2>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {typeof count === 'number' && count > 0 && (
        <span
          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
          style={{ fontSize: '11px', fontWeight: 600 }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  hint,
}: {
  icon: typeof MessageSquare;
  title: string;
  body: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-gray-400" strokeWidth={1.6} />
      </div>
      <h3 className="text-gray-900 mb-1.5" style={{ fontSize: '15px', fontWeight: 600 }}>
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm leading-relaxed" style={{ fontSize: '13px' }}>
        {body}
      </p>
      {hint && (
        <p className="text-gray-400 max-w-sm leading-relaxed mt-3" style={{ fontSize: '12px' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Threads view ───────────────────────────────────────────────────────

/**
 * Slack-style "All Threads" view. Lists the root messages that have at
 * least one reply, ordered by most-recent activity (last reply timestamp,
 * falling back to the root's own timestamp). Clicking a row opens the
 * ThreadPane alongside the root's channel — the same UX as clicking the
 * summary strip in the channel transcript.
 *
 * We deliberately do NOT show every team message here anymore (the old
 * behaviour was really an activity feed, which duplicated the channel
 * view). The tab's label is "Threads" and its count badge is the number
 * of thread conversations, so users now get exactly what the label
 * promises.
 */
export const TeamThreadsView = memo(function TeamThreadsView({
  messages,
  onJumpToMessage,
  onOpenThread,
}: {
  messages: TeamViewMessage[];
  onJumpToMessage: (messageId: string, channel: TeamChannelId) => void;
  /** When provided, clicking a row opens the thread pane (preferred UX).
   *  Falls back to onJumpToMessage if absent, which is useful for screens
   *  that don't host the pane yet. */
  onOpenThread?: (rootId: string, channel: TeamChannelId) => void;
}) {
  /**
   * Collect thread entries — one per root that has replies. Each entry
   * carries the root, the replies, and the "last activity" timestamp we
   * use for sorting.
   */
  const threadEntries = useMemo(() => {
    const repliesByParent = new Map<string, TeamViewMessage[]>();
    for (const m of messages) {
      if (!m.parentId) continue;
      const arr = repliesByParent.get(m.parentId) ?? [];
      arr.push(m);
      repliesByParent.set(m.parentId, arr);
    }
    // Sort each reply bucket chronologically so "last reply" is the tail.
    for (const arr of repliesByParent.values()) {
      arr.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    type Entry = {
      root: TeamViewMessage;
      replies: TeamViewMessage[];
      lastActivity: Date;
    };

    const entries: Entry[] = [];
    for (const m of messages) {
      if (!m.channel || m.parentId) continue; // roots only
      const replies = repliesByParent.get(m.id) ?? [];
      if (replies.length === 0) continue;
      const lastActivity = replies[replies.length - 1].timestamp;
      entries.push({ root: m, replies, lastActivity });
    }
    entries.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    return entries;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ViewHeader
        icon={MessageSquare}
        title="Threads"
        subtitle="Conversations with follow-up replies, newest activity first."
        count={threadEntries.length}
      />
      <div className="flex-1 overflow-y-auto">
        {threadEntries.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No threads yet"
            body="Hover a message in #discussions and hit “Reply in thread” to keep side-conversations out of the main channel."
            hint="Tip: threads are perfect for back-and-forth on a single question."
          />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-5">
            <ul className="space-y-2">
              {threadEntries.map(({ root, replies, lastActivity }) => (
                <li key={root.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!root.channel) return;
                      if (onOpenThread) onOpenThread(root.id, root.channel);
                      else onJumpToMessage(root.id, root.channel);
                    }}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-200/70 bg-white hover:bg-gray-50 hover:border-gray-300/80 hover:shadow-[0_1px_4px_rgba(15,23,42,0.04)] transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <ThreadRootAvatar msg={root} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {root.channel && <ChannelBadge channel={root.channel} />}
                          <span
                            className="text-gray-900"
                            style={{ fontSize: '12.5px', fontWeight: 600 }}
                          >
                            {rootAuthorName(root)}
                          </span>
                          <span className="text-gray-400" style={{ fontSize: '11px' }}>
                            {formatRelative(root.timestamp)}
                          </span>
                        </div>
                        <p
                          className="text-gray-700 leading-relaxed"
                          style={{ fontSize: '13px' }}
                        >
                          {previewOf(root.content, 140)}
                        </p>
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-brand" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                            <CornerDownRight className="w-3 h-3" strokeWidth={2.4} />
                            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                          <span className="text-gray-400" style={{ fontSize: '11.5px' }}>
                            Last {formatRelative(lastActivity)}
                          </span>
                          <ParticipantAvatars replies={replies} />
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Thread row atoms ───────────────────────────────────────────────────

function rootAuthorName(msg: TeamViewMessage): string {
  if (msg.type === 'user' || msg.from === 'user') return 'You';
  return msg.author ? TEAM_AUTHORS[msg.author].name : 'Brego Team';
}

function ThreadRootAvatar({ msg }: { msg: TeamViewMessage }) {
  const isUser = msg.type === 'user' || msg.from === 'user';
  if (isUser) {
    return (
      <div
        className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ fontSize: '10.5px', fontWeight: 700 }}
      >
        You
      </div>
    );
  }
  const meta = msg.author ? TEAM_AUTHORS[msg.author] : TEAM_AUTHORS['brego-team'];
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}
      style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}
    >
      {meta.initials}
    </div>
  );
}

/**
 * Stacked avatars of up to 3 unique repliers. Same visual vocabulary as
 * the in-channel ThreadSummaryStrip so the tab view and the transcript
 * feel like two angles on the same thread.
 */
function ParticipantAvatars({ replies }: { replies: TeamViewMessage[] }) {
  const uniques = useMemo(() => {
    const seen = new Set<string>();
    const out: { key: string; label: string; gradient?: string; isUser: boolean }[] = [];
    for (const r of replies) {
      const isUser = r.type === 'user' || r.from === 'user';
      const key = isUser ? 'you' : (r.author ?? 'brego-team');
      if (seen.has(key)) continue;
      seen.add(key);
      if (isUser) {
        out.push({ key, label: 'You', isUser: true });
      } else {
        const meta = r.author ? TEAM_AUTHORS[r.author] : TEAM_AUTHORS['brego-team'];
        out.push({ key, label: meta.initials, gradient: meta.gradient, isUser: false });
      }
      if (out.length >= 3) break;
    }
    return out;
  }, [replies]);

  if (uniques.length === 0) return null;
  return (
    <div className="flex -space-x-1.5">
      {uniques.map((u) => (
        <div
          key={u.key}
          className={`w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-white shadow-sm ${
            u.isUser ? 'bg-brand' : `bg-gradient-to-br ${u.gradient}`
          }`}
          style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.02em' }}
          title={u.label}
        >
          {u.isUser ? 'Y' : u.label}
        </div>
      ))}
    </div>
  );
}

// ─── Starred view ───────────────────────────────────────────────────────

export const TeamStarredView = memo(function TeamStarredView({
  messages,
  bookmarkedMessageIds,
  onToggleBookmark,
  onJumpToMessage,
}: {
  messages: TeamViewMessage[];
  bookmarkedMessageIds: Set<string>;
  onToggleBookmark: (messageId: string) => void;
  onJumpToMessage: (messageId: string, channel: TeamChannelId) => void;
}) {
  const starred = useMemo(() => {
    return messages
      .filter((m) => !!m.channel && bookmarkedMessageIds.has(m.id))
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [messages, bookmarkedMessageIds]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ViewHeader
        icon={Star}
        title="Starred"
        subtitle="Messages you've saved from any channel."
        count={starred.length}
      />
      <div className="flex-1 overflow-y-auto">
        {starred.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No starred messages yet"
            body="Right-click any message and choose Bookmark to save it here. Starred items survive across sessions."
            hint="Use Starred to keep important team decisions and references one tap away."
          />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-5">
            <ul className="space-y-2">
              {starred.map((msg) => (
                <li key={msg.id}>
                  <div className="group px-4 py-3 rounded-xl border border-amber-100/80 bg-amber-50/40 hover:bg-amber-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(msg.id)}
                        className="flex-shrink-0 p-1 -ml-1 -mt-1 rounded-md hover:bg-amber-100/60 transition-colors"
                        title="Remove from starred"
                      >
                        <Star
                          className="w-4 h-4 text-amber-500 fill-amber-400"
                          strokeWidth={1.6}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {msg.channel && <ChannelBadge channel={msg.channel} />}
                          <AuthorChip msg={msg} />
                          <span className="text-gray-400" style={{ fontSize: '11px' }}>
                            {formatRelative(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className="text-gray-800 leading-relaxed"
                          style={{ fontSize: '13px' }}
                        >
                          {previewOf(msg.content, 240)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => msg.channel && onJumpToMessage(msg.id, msg.channel)}
                        className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-gray-600 hover:text-brand hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        style={{ fontSize: '12px', fontWeight: 500 }}
                        title="Open in channel"
                      >
                        Open
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Media / Docs / Links view ──────────────────────────────────────────

type MediaFilter = 'all' | 'media' | 'docs' | 'links';

export const TeamMediaView = memo(function TeamMediaView({
  messages,
  onJumpToMessage,
}: {
  messages: TeamViewMessage[];
  onJumpToMessage: (messageId: string, channel: TeamChannelId) => void;
}) {
  const [filter, setFilter] = useState<MediaFilter>('all');

  const classified = useMemo(() => {
    const out: Array<{
      msg: TeamViewMessage;
      entry: NonNullable<ReturnType<typeof classifyMedia>>;
    }> = [];
    for (const m of messages) {
      if (!m.channel) continue;
      const entry = classifyMedia(m);
      if (entry) out.push({ msg: m, entry });
    }
    out.sort((a, b) => b.msg.timestamp.getTime() - a.msg.timestamp.getTime());
    return out;
  }, [messages]);

  const counts = useMemo(
    () => ({
      all: classified.length,
      media: classified.filter((c) => c.entry.kind === 'image').length,
      docs: classified.filter((c) => c.entry.kind === 'doc').length,
      links: classified.filter((c) => c.entry.kind === 'link').length,
    }),
    [classified],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return classified;
    if (filter === 'media') return classified.filter((c) => c.entry.kind === 'image');
    if (filter === 'docs') return classified.filter((c) => c.entry.kind === 'doc');
    return classified.filter((c) => c.entry.kind === 'link');
  }, [filter, classified]);

  const filterDefs: { id: MediaFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'media', label: 'Media', count: counts.media },
    { id: 'docs', label: 'Docs', count: counts.docs },
    { id: 'links', label: 'Links', count: counts.links },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ViewHeader
        icon={Paperclip}
        title="Media, docs & links"
        subtitle="Everything shared across your team channels."
        count={classified.length}
      />
      {classified.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {filterDefs.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  disabled={f.count === 0 && f.id !== 'all'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 ${
                    active
                      ? 'bg-brand text-white border-brand shadow-[0_1px_2px_rgba(32,76,199,0.25)]'
                      : f.count === 0
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                  }`}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  {f.label}
                  <span
                    className={`${
                      active ? 'text-white/80' : f.count === 0 ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {classified.length === 0 ? (
          <EmptyState
            icon={Paperclip}
            title="No media, docs or links yet"
            body="Files and links shared in your team channels will appear here, grouped for quick retrieval."
            hint="Use the + menu in chat to upload a document or image."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Paperclip}
            title={`No ${filter} yet`}
            body={`Nothing classified as ${filter} has been shared in your channels.`}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-5">
            <ul className="grid grid-cols-1 gap-2">
              {filtered.map(({ msg, entry }) => {
                const Icon =
                  entry.kind === 'image' ? ImageIcon : entry.kind === 'doc' ? FileText : LinkIcon;
                const iconWrapClasses =
                  entry.kind === 'image'
                    ? 'bg-violet-50 text-violet-600 border-violet-100'
                    : entry.kind === 'doc'
                      ? 'bg-sky-50 text-sky-600 border-sky-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100';
                return (
                  <li key={msg.id}>
                    <button
                      type="button"
                      onClick={() => msg.channel && onJumpToMessage(msg.id, msg.channel)}
                      className="w-full text-left px-3.5 py-3 rounded-xl border border-gray-200/70 bg-white hover:bg-gray-50 hover:border-gray-300/80 transition-colors group flex items-start gap-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconWrapClasses}`}
                      >
                        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {msg.channel && <ChannelBadge channel={msg.channel} />}
                          <AuthorChip msg={msg} />
                          <span className="text-gray-400" style={{ fontSize: '11px' }}>
                            {formatRelative(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className="text-gray-900 truncate"
                          style={{ fontSize: '13px', fontWeight: 500 }}
                          title={entry.label}
                        >
                          {entry.label}
                        </p>
                        {entry.meta && (
                          <p className="text-gray-500 truncate mt-0.5" style={{ fontSize: '11px' }}>
                            {entry.meta}
                          </p>
                        )}
                      </div>
                      {entry.kind === 'link' && entry.url ? (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 hover:text-brand hover:bg-white opacity-0 group-hover:opacity-100 transition-colors"
                          style={{ fontSize: '11px', fontWeight: 500 }}
                          title="Open link in new tab"
                        >
                          Open
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1 transition-colors" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});
