'use client';

/**
 * TeamChatSidebar
 * ────────────────
 * Slack-inspired left nav shown when the user is chatting with the Brego
 * Team. Lists channels (Discussions, Announcements) and active teammates
 * with presence indicators.
 *
 * The sidebar is intentionally visual-only — state lives in ChatInterface
 * (activeChannel, chatMode, etc.) — so swapping between BregoGPT's sidebar
 * and this one stays cheap and predictable.
 */

import { Hash, Megaphone, UserPlus, MessageSquare, Star, Paperclip } from 'lucide-react';
import type { TeamView, TeamTabCounts } from './TeamTabViews';

export type TeamChannelId = 'discussions' | 'announcements';

export interface TeamChannelMeta {
  id: TeamChannelId;
  label: string;
  description: string;
}

export const TEAM_CHANNELS: TeamChannelMeta[] = [
  {
    id: 'discussions',
    label: 'discussions',
    description: 'General conversation with your Brego growth team',
  },
  {
    id: 'announcements',
    label: 'announcements',
    description: 'Updates, releases and important news from Brego',
  },
];

export interface Teammate {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string; // tailwind gradient classes (from-X to-Y)
  status: 'online' | 'away' | 'offline';
}

// Reasonable defaults — keeps presentation correct when the host hasn't
// wired up real presence yet. Host can override via props. Roster and
// gradients mirror TEAM_AUTHORS in teamSeedMessages so each teammate's
// avatar reads the same across the sidebar and chat bubbles.
export const DEFAULT_TEAMMATES: Teammate[] = [
  {
    id: 'tejas',
    name: 'Tejas Atha',
    role: 'COO',
    initials: 'T',
    gradient: 'from-amber-500 to-orange-600',
    status: 'online',
  },
  {
    id: 'zubear',
    name: 'Zubear Shaikh',
    role: 'Accounts & Taxation Lead',
    initials: 'Z',
    gradient: 'from-fuchsia-500 to-pink-600',
    status: 'online',
  },
  {
    id: 'irshad',
    name: 'Irshad Qureshi',
    role: 'Accounts & Taxation Specialist',
    initials: 'I',
    gradient: 'from-sky-500 to-blue-600',
    status: 'online',
  },
  {
    id: 'chinmay',
    name: 'Chinmay Pawar',
    role: 'Performance Marketing Lead',
    initials: 'C',
    gradient: 'from-violet-500 to-purple-600',
    status: 'away',
  },
];

interface TeamChatSidebarProps {
  activeChannel: TeamChannelId;
  onChannelSelect: (channel: TeamChannelId) => void;
  channelUnread?: Partial<Record<TeamChannelId, number>>;
  teamStatus: { status: 'online' | 'away' | 'offline'; label: string; detail: string };
  teammates?: Teammate[];
  onMentionTeammate?: (handle: string) => void;
  onExitTeamMode?: () => void;
  /**
   * Called when the user clicks the "Invite team members" CTA. The host is
   * responsible for surfacing an invite modal / flow. Falls back to a no-op
   * if omitted.
   */
  onInviteTeammates?: () => void;
  /**
   * Which top-of-sidebar tab view is currently taking over the main area.
   * `'channel'` means the user is viewing the active channel's messages
   * (default). The other values swap the main area for the corresponding
   * filtered view — mirrors WhatsApp's Threads / Starred / Media tabs.
   */
  activeView?: TeamView;
  onViewChange?: (view: TeamView) => void;
  /**
   * Live counts for each tab. Drives the small number pill next to each
   * tab label so users know whether there's anything to look at before
   * clicking through.
   */
  tabCounts?: TeamTabCounts;
}

// Compact tab definitions for the Threads / Starred / Media row. Kept
// local so the row's shape and labels live next to each other.
const TAB_DEFS: {
  id: TeamView;
  label: string;
  Icon: typeof MessageSquare;
  getCount: (c: TeamTabCounts | undefined) => number;
  hint: string;
}[] = [
  {
    id: 'threads',
    label: 'Threads',
    Icon: MessageSquare,
    getCount: (c) => c?.threads ?? 0,
    hint: 'Recent conversations across channels',
  },
  {
    id: 'starred',
    label: 'Starred',
    Icon: Star,
    getCount: (c) => c?.starred ?? 0,
    hint: 'Messages you bookmarked for later',
  },
  {
    id: 'media',
    label: 'Media',
    Icon: Paperclip,
    getCount: (c) => c?.media ?? 0,
    hint: 'Media, docs and links shared in channels',
  },
];

export function TeamChatSidebar({
  activeChannel,
  onChannelSelect,
  channelUnread = {},
  teamStatus,
  teammates = DEFAULT_TEAMMATES,
  onMentionTeammate,
  onExitTeamMode,
  onInviteTeammates,
  activeView = 'channel',
  onViewChange,
  tabCounts,
}: TeamChatSidebarProps) {
  // `onExitTeamMode`, `teammates` and `onMentionTeammate` are kept in the
  // props contract for backward compatibility, but the visual elements that
  // used them (workspace header + teammates/DM list) have been removed. Exit
  // back to BregoGPT is available via the mode toggle in ChatInterface, and
  // the team roster has been replaced by a single "Invite team members" CTA.
  void onExitTeamMode;
  void teammates;
  void onMentionTeammate;

  // A channel is only "visually active" when the user is on the channel
  // view. If they've jumped into Threads/Starred/Media, the sidebar must
  // not falsely highlight a channel — otherwise the two selection states
  // compete and the user can't tell where they are.
  const channelSelectionLive = activeView === 'channel';

  return (
    <div className="h-full flex flex-col">
      {/* Views — WhatsApp-style quick filters. Stacked vertically so they
          read like a first-class section, matching the Channels list below.
          Each view takes over the main chat area; tapping a channel below
          (or tapping an active view again) returns to the channel view.
          No heading: the icons + labels are self-describing, and dropping
          the "VIEWS" eyebrow tightens the top of the sidebar. */}
      <div className="px-3 pt-4 pb-3">
        <div className="space-y-0.5">
          {TAB_DEFS.map(({ id, label, Icon, getCount, hint }) => {
            const active = activeView === id;
            const count = getCount(tabCounts);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange?.(active ? 'channel' : id)}
                aria-pressed={active}
                title={hint}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 text-left group ${
                  active
                    ? 'bg-brand text-white shadow-[0_1px_2px_rgba(32,76,199,0.25)]'
                    : count > 0
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <Icon
                  className={`w-[14px] h-[14px] flex-shrink-0 ${
                    active ? 'text-white/90' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  strokeWidth={active ? 2.2 : 2}
                />
                <span
                  className="flex-1 truncate"
                  style={{ fontSize: '14px', fontWeight: active || count > 0 ? 600 : 500 }}
                >
                  {label}
                </span>
                {count > 0 && (
                  <span
                    className={`flex-shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center ${
                      active ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                    }`}
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Separator between Views and Channels */}
      <div className="mx-3 border-t border-gray-200/60" />

      {/* Channels */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between px-1.5 mb-1.5">
          <span
            className="text-gray-400 uppercase tracking-wider"
            style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            Channels
          </span>
        </div>
        <div className="space-y-0.5">
          {TEAM_CHANNELS.map((channel) => {
            const isActive = channelSelectionLive && activeChannel === channel.id;
            const unread = channelUnread[channel.id] ?? 0;
            const Icon = channel.id === 'announcements' ? Megaphone : Hash;
            return (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 text-left group ${
                  isActive
                    ? 'bg-brand text-white shadow-[0_1px_2px_rgba(32,76,199,0.25)]'
                    : unread > 0
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
                title={channel.description}
              >
                <Icon
                  className={`w-[14px] h-[14px] flex-shrink-0 ${
                    isActive ? 'text-white/90' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.2 : 2}
                />
                <span
                  className="flex-1 truncate"
                  style={{ fontSize: '14px', fontWeight: isActive || unread > 0 ? 600 : 500 }}
                >
                  {channel.label}
                </span>
                {unread > 0 && !isActive && (
                  <span
                    className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invite team members CTA — replaces the old Teammates/DM list. Kept
          visually quiet so it reads as a utility row (like the channel rows
          above), not a hero button: no border, no subtitle, just an icon +
          label that lights up brand on hover. */}
      <div className="px-3 pt-3 pb-4 flex-1 overflow-y-auto">
        <button
          type="button"
          onClick={() => onInviteTeammates?.()}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-gray-600 hover:text-brand hover:bg-gray-100/80 transition-colors group"
          title="Invite your team to these channels"
        >
          <UserPlus
            className="w-[15px] h-[15px] text-gray-500 group-hover:text-brand transition-colors flex-shrink-0"
            strokeWidth={2}
          />
          <span
            className="truncate"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            Invite team members
          </span>
        </button>
      </div>
    </div>
  );
}

// Re-export the label helper so callers can render the channel name in headers
export function getChannelMeta(id: TeamChannelId): TeamChannelMeta {
  return TEAM_CHANNELS.find((c) => c.id === id) ?? TEAM_CHANNELS[0];
}
