'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Send, Plus, MessageSquare, BarChart3, Briefcase, Database, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Zap, Target, IndianRupee, CheckCircle2, CheckSquare, XCircle, Upload, File, ChevronDown, ChevronRight, X, FileText, Users, User, Headphones, ArrowUp, Mic, Image as ImageIcon, FolderOpen, AtSign, Plug, Star, MoreHorizontal, Paperclip, ExternalLink, Hash, Megaphone, SquarePen, Trash2, Clock, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInfo, DiagnosticData } from '../../types';
import { BregoLogo } from '../BregoLogo';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  MetricsCardsComponent, 
  PerformanceChartComponent, 
  WhatsWorkingComponent, 
  WhatsBrokenComponent, 
  RiskFlagsComponent, 
  RecommendationsComponent, 
  WarningFooterComponent 
} from './ReportComponents';
import {
  FinanceHealthMetricsComponent,
  CashHealthSnapshotComponent,
  ReceivablesPayablesComponent,
  ComplianceRiskCheckComponent,
  FinanceWarningFooterComponent,
  WhatNeedsFixingComponent
} from './FinanceReportComponents';
import { PerformanceReports } from '../reports/PerformanceReports';
import { AccountsReports } from '../reports/AccountsReports';
import { Dataroom } from '../dataroom/Dataroom';
import { Workspace, MediaPlan, type Incident } from '../workspace/Workspace';
import { AddTodoModal, type AssignTodoTask } from '../workspace/AddTodoModal';
import { ProfileDropdown } from '../ProfileDropdown';
import { ProfileSettings } from '../ProfileSettings';
import { NotificationBell } from '../NotificationPanel';
import { UpgradeFlow } from '../upgrade/UpgradeFlow';
import { SidebarStatusCard, OnboardingProgress } from '../upgrade/SidebarStatusCard';
import { AccountSyncingModal } from '../upgrade/AccountSyncingModal';
import { OnboardingDataProvider } from '../context/OnboardingDataContext';

import { BusinessAccountCard, BusinessAccount } from '../business/BusinessAccountCard';
import { AddBusinessModal } from '../business/AddBusinessModal';
import { AddBusinessPlanModal } from '../business/AddBusinessPlanModal';
import { KeyboardShortcutsModal } from '../KeyboardShortcutsModal';
import { PromptSuggestions } from './PromptSuggestions';
import { MessageContextMenu, type MessageContextMenuHandle } from './MessageContextMenu';
import { matchPromptToResponse, getThinkingLabelForPrompt } from './DashboardDataEngine';
import { DashboardResponseRenderer } from './DashboardResponseCards';
import type { StructuredResponse } from './DashboardDataEngine';
import { toast, Toaster } from 'sonner';
import { NavTabs } from '../NavTabs';
import { UploadDocumentModal } from '../upload/UploadDocumentModal';
import { PostPaymentCompletionModal } from '../upgrade/PostPaymentCompletionModal';
import { ServiceTeamOnboarding } from '../upgrade/ServiceTeamOnboarding';
import { AccountsTeamOnboarding } from '../upgrade/AccountsTeamOnboarding';
import { HuddleCall, HuddleButton, useScheduledCallsCount } from './HuddleCall';
import { InlineChatIncidentForm } from './InlineChatIncidentForm';
import type { InlineIncidentResult } from './InlineChatIncidentForm';
import { TeamChatSidebar, getChannelMeta, type TeamChannelId } from './TeamChatSidebar';
import { ChannelMembersBadge, BREGO_CHANNEL_TEAM } from './ChannelMembersBadge';
import { MY_TEAM_ROSTER } from '../workspace/AssigneePickerPopover';
import {
  TeamThreadsView,
  TeamStarredView,
  TeamMediaView,
  getTabCounts,
  type TeamView,
} from './TeamTabViews';
import {
  buildTeamSeedMessages,
  DEFAULT_STARRED_MESSAGE_IDS,
  TEAM_AUTHORS,
  type TeamAuthor,
  type MessageReaction,
} from './teamSeedMessages';
import { ReactionPillRow, ReactionPicker } from './MessageReactions';
import { ThreadPane, ThreadSummaryStrip, type ThreadMessage } from './ThreadPane';

// ── Futuristic BregoGPT Icon (isometric cube) ──
function BregoGPTIcon({ className = 'w-4 h-4', color }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" stroke={color || 'currentColor'} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 8.25L15.5 5.25" stroke={color || 'currentColor'} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 8.25L2.5 5.25" stroke={color || 'currentColor'} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 8.25V16.5" stroke={color || 'currentColor'} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="8.25" r="1.2" fill={color || 'currentColor'} opacity="0.5" />
    </svg>
  );
}

// ── Waveform Visualizer (mic recording indicator) ──
function WaveformVisualizer() {
  return (
    <div className="flex items-center gap-[3px] h-5 px-1">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full bg-gradient-to-t from-red-400 to-red-300"
          initial={{ height: 4 }}
          animate={{
            height: [4, 12 + Math.random() * 8, 6, 16 + Math.random() * 4, 4],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

// ── Shared @mention renderer ──
// Each member style maps a @handle to a pill color, role suffix and icon so
// that wherever the chat renders a mention — composer preview, user bubble,
// team-authored bubble, file-upload note — it reads the same. Colors mirror
// TEAM_AUTHORS avatar gradients so Tejas stays warm (COO), Zubear fuchsia
// (Accounts Lead), Irshad blue (Accounts Specialist), Chinmay violet
// (Marketing Lead). Defined at module scope so MessageBubble, user-bubble,
// and team-bubble renders all share one source of truth.
const MENTION_MEMBER_STYLES: Record<
  string,
  { label: string; bg: string; color: string; icon: typeof User; roleSuffix?: string }
> = {
  '@bregoteam': { label: 'Brego Team', bg: '#EEF1FB', color: '#204CC7', icon: Users },
  '@bregogpt': { label: 'BregoGPT', bg: '#FEF3C7', color: '#D97706', icon: Sparkles },
  '@tejas': { label: 'Tejas', bg: '#fff7ed', color: '#ea580c', icon: User, roleSuffix: 'COO' },
  '@zubear': { label: 'Zubear', bg: '#fdf4ff', color: '#c026d3', icon: User, roleSuffix: 'Accounts' },
  '@irshad': { label: 'Irshad', bg: '#eff6ff', color: '#2563eb', icon: User, roleSuffix: 'Accounts' },
  '@chinmay': { label: 'Chinmay', bg: '#f5f3ff', color: '#7c3aed', icon: User, roleSuffix: 'Marketing' },
};

// Split text on any known @handle and swap each one for a styled pill. Keeps
// non-mention runs as plain text so **bold** and newlines still work around
// it when the caller layers its own markdown pass. Case-insensitive so
// "@Tejas" and "@tejas" both render identically.
function renderChatMentions(text: string): ReactNode[] {
  const parts = text.split(/(@bregoteam|@bregogpt|@zubear|@irshad|@tejas|@chinmay)/gi);
  return parts.map((part, i) => {
    const key = part.toLowerCase();
    const style = MENTION_MEMBER_STYLES[key];
    if (style) {
      const MIcon = style.icon;
      return (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md mx-0.5 align-baseline"
          style={{ fontSize: '11.5px', fontWeight: 600, backgroundColor: style.bg, color: style.color }}
        >
          <MIcon className="w-2.5 h-2.5" />
          {style.label}
          {style.roleSuffix && (
            <span className="opacity-50 ml-0.5" style={{ fontSize: '9.5px' }}>
              {style.roleSuffix}
            </span>
          )}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface Message {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
  buttons?: ActionButton[];
  component?: 'welcome' | 'diagnostic-intro' | 'diagnostic-question' | 'report-reveal' | 'metrics-cards' | 'performance-chart' | 'whats-working' | 'whats-broken' | 'risk-flags' | 'recommendations' | 'warning-footer' | 'action-buttons' | 'finance-health-metrics' | 'cash-health-snapshot' | 'receivables-payables' | 'compliance-risk' | 'finance-warning-footer' | 'file-upload' | 'batch-upload' | 'full-marketing-report' | 'media-plan' | 'mode-switch' | 'dashboard-response' | 'incident-confirmation' | 'task-confirmation' | 'what-needs-fixing';
  data?: any;
  businessModel?: 'ecommerce' | 'leadgen';
  companyName?: string;
  mediaPlan?: MediaPlan;
  dashboardResponse?: StructuredResponse;
  /** Team-mode messages are tagged with the channel they belong to so
   *  the sidebar can split the conversation into Discussions / Announcements.
   *  Undefined for BregoGPT (AI) messages and mode-switch separators. */
  channel?: TeamChannelId;
  /** For team messages, the author persona — useful for "from the team"
   *  styling vs the user's own message. BregoGPT uses `type` alone. */
  from?: 'user' | 'team';
  /** For team messages authored by a specific teammate (Tejas, Zubear,
   *  Irshad, Chinmay). Lets the bubble render a personalised avatar + name
   *  chip instead of the generic "Brego Team" voice. */
  author?: TeamAuthor;
  /** Emoji reactions on this message. Keyed by emoji — each entry holds
   *  the list of reacting handles (`'you'` for the current user, plus any
   *  teammate handles like `zubear`, `irshad`, `tejas`, `chinmay`). Only
   *  populated when someone has reacted. */
  reactions?: MessageReaction[];
  /** Thread this message belongs to, in AI mode. Follows Claude's mental
   *  model: each thread is a separate conversation surfaced as a row in
   *  the Recents list. Undefined on team-mode messages (they live in
   *  channels) and on legacy messages from before thread support landed
   *  — those legacy messages are treated as the "default" conversation. */
  threadId?: string;
  /** For team-mode messages: when set, this message is a Slack-style
   *  *thread reply* to another message. The parent stays visible in the
   *  channel; replies are hidden from the main channel view and only
   *  appear inside the ThreadPane. Clicking the thread summary on the
   *  parent opens the pane with all replies in timestamp order. */
  parentId?: string;
}

interface ActionButton {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary';
}

/**
 * A Claude-style conversation thread surfaced in the BregoGPT sidebar.
 * First user prompt of a thread becomes its title (truncated). Follow-up
 * messages append to the active thread rather than spawning new entries —
 * that's the key correction over the previous flat-Recents model.
 *
 * `updatedAt` drives sort order (most recently touched thread at the top)
 * and powers the Today / Yesterday / Older date groupings.
 */
interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

/** Truncate a prompt for display in the sidebar — keeps entries uniform. */
function formatThreadTitle(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'New conversation';
  if (trimmed.length <= 48) return trimmed;
  return trimmed.slice(0, 45).trimEnd() + '…';
}

/**
 * Bucket a thread's updatedAt into a human label Claude-style. Pure helper —
 * pulled out so the sidebar render stays declarative.
 */
function getThreadDateBucket(ts: number, now: number = Date.now()): 'Today' | 'Yesterday' | 'Previous 7 days' | 'Previous 30 days' | 'Older' {
  const msDay = 86_400_000;
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const today = startOfDay(now);
  const tsDay = startOfDay(ts);
  const diffDays = Math.round((today - tsDay) / msDay);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Previous 7 days';
  if (diffDays <= 30) return 'Previous 30 days';
  return 'Older';
}

const THREAD_BUCKET_ORDER: Array<ReturnType<typeof getThreadDateBucket>> = [
  'Today',
  'Yesterday',
  'Previous 7 days',
  'Previous 30 days',
  'Older',
];

/* ── Temporal formatting helpers ────────────────────────────────────────
 *
 * Centralised because four different surfaces need slightly different
 * shapes of the same timestamp: message bubbles (compact),
 * dashboard-response "Data as of" pill (full date + time), day separators
 * (just the date), and the Recents sidebar (relative — "3m ago").
 *
 * Consistent output here keeps the temporal cues coherent across the UI
 * without any one call-site rolling its own format.
 * ─────────────────────────────────────────────────────────────────────── */

/** Are two timestamps on the same calendar day (local time)? */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Short label for a message's bubble timestamp. */
function formatMessageTime(ts: Date, now: Date = new Date()): string {
  const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isSameDay(ts, now)) return `Today · ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(ts, yesterday)) return `Yesterday · ${time}`;
  const sameYear = ts.getFullYear() === now.getFullYear();
  const datePart = ts.toLocaleDateString([], sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
  return `${datePart} · ${time}`;
}

/** Long label for "Data as of …" pills — the extra gravitas is intentional. */
function formatDataAsOf(ts: Date, now: Date = new Date()): string {
  const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isSameDay(ts, now)) return `Today at ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(ts, yesterday)) return `Yesterday at ${time}`;
  const sameYear = ts.getFullYear() === now.getFullYear();
  const datePart = ts.toLocaleDateString([], sameYear
    ? { weekday: 'short', month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
  return `${datePart} at ${time}`;
}

/** Label for day-separators between messages. */
function formatDaySeparator(ts: Date, now: Date = new Date()): string {
  if (isSameDay(ts, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(ts, yesterday)) return 'Yesterday';
  const sameYear = ts.getFullYear() === now.getFullYear();
  return ts.toLocaleDateString([], sameYear
    ? { weekday: 'long', month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Condensed relative time for Recents entries — "3m / 2h / Yesterday / 5d / Apr 2". */
function formatRelativeShort(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24 && isSameDay(new Date(ts), new Date(now))) return `${hr}h ago`;
  const d = new Date(ts);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Yesterday';
  const days = Math.floor((now - ts) / 86_400_000);
  if (days < 7) return `${days}d ago`;
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return d.toLocaleDateString([], sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: '2-digit' });
}

interface ChatInterfaceProps {
  userInfo: UserInfo;
  onComplete?: () => void;
  attachedMediaPlan?: MediaPlan;
}

// Cycling thinking labels for the typing indicator
const AI_THINKING_LABELS = ['Thinking…', 'Analyzing…', 'Preparing response…', 'Almost there…'];
const TEAM_THINKING_LABELS = ['Connecting to Brego Team…', 'Reaching out…', 'Waiting for response…'];

export function ChatInterface({ userInfo, onComplete, attachedMediaPlan }: ChatInterfaceProps) {
  // ── URL-first resolution for service + businessType ───────────────────────
  // Chat is rendered under `/[service]/[model]/dashboard/chat` (scoped) AND
  // under `/dashboard/chat` (legacy). When scoped URL params are present they
  // are the authoritative source of truth — `userInfo` in React context may be
  // stale across hard refreshes, bookmarks, or deep links. This resolution
  // guarantees prompt-suggestion sets (and the primary account's service/
  // businessType) always match the URL the user is actually on.
  const routeParams = useParams<{ service?: string; model?: string }>();
  const urlServiceSlug = routeParams?.service;
  const urlModelSlug = routeParams?.model;
  const urlIsFinance = urlServiceSlug === 'accounts-taxation';
  const urlIsMarketing = urlServiceSlug === 'performance-marketing';
  // Effective service — URL wins when scoped, userInfo otherwise.
  const effectiveService: 'Performance Marketing' | 'Accounts & Taxation' = urlIsFinance
    ? 'Accounts & Taxation'
    : urlIsMarketing
    ? 'Performance Marketing'
    : ((userInfo.selectedService || 'Performance Marketing') as 'Performance Marketing' | 'Accounts & Taxation');
  // Effective business type — normalize to the PromptSuggestions-keyed values.
  const effectiveBusinessType: 'ecommerce' | 'leadgen' | 'ecommerce-restaurants' | 'trading-manufacturing' = (() => {
    if (effectiveService === 'Accounts & Taxation') {
      if (urlModelSlug === 'trading-manufacturing') return 'trading-manufacturing';
      if (urlModelSlug === 'ecommerce-restaurants') return 'ecommerce-restaurants';
      // Fall back to userInfo label when URL is absent
      return (userInfo.businessType || '').toLowerCase().includes('trading') ||
             (userInfo.businessType || '').toLowerCase().includes('manufactur') ||
             (userInfo.businessType || '').toLowerCase().includes('service')
        ? 'trading-manufacturing'
        : 'ecommerce-restaurants';
    }
    // Performance Marketing
    if (urlModelSlug === 'lead-generation') return 'leadgen';
    if (urlModelSlug === 'e-commerce') return 'ecommerce';
    return userInfo.businessModel === 'leadgen' ? 'leadgen' : 'ecommerce';
  })();
  const effectiveBusinessTypeLabel: string = effectiveService === 'Accounts & Taxation'
    ? (effectiveBusinessType === 'trading-manufacturing'
        ? 'Trading / Manufacturing / Services'
        : 'E-Commerce / Restaurant')
    : (effectiveBusinessType === 'leadgen' ? 'Lead Generation Business' : 'E-Commerce Business');

  // ── Effective userInfo ─────────────────────────────────────────────────────
  // Build a URL-corrected view of userInfo so every downstream flow — Upgrade
  // Now, Post-Payment Onboarding, Team Onboarding, Completion Modal — routes
  // to Marketing vs Accounts & Taxation based on the URL the user is on, not
  // stale React context. For finance URLs we also normalize `businessType` to
  // the human-readable onboarding label those flows expect ("E-Commerce or
  // Restaurants" / "Trading, Manufacturing or Services") so
  // resolveFinanceVariant(...) inside PostPaymentOnboarding picks correctly.
  const effectiveBusinessTypeOnboardingLabel: string = effectiveService === 'Accounts & Taxation'
    ? (effectiveBusinessType === 'trading-manufacturing'
        ? 'Trading, Manufacturing or Services'
        : 'E-Commerce or Restaurants')
    : (userInfo.businessType || '');
  const effectiveUserInfo: UserInfo = {
    ...userInfo,
    selectedService: effectiveService,
    businessType: effectiveBusinessTypeOnboardingLabel,
    businessModel: effectiveService === 'Accounts & Taxation'
      ? userInfo.businessModel // finance flows ignore businessModel
      : (effectiveBusinessType === 'leadgen' ? 'leadgen' : 'ecommerce'),
  };

  const [messages, setMessages] = useState<Message[]>([]);
  // ── Threads (Claude-style Recents) ────────────────────────────────────
  // `threads` is the metadata list rendered in the sidebar. Messages tag
  // themselves with `threadId` so the main pane can filter to the active
  // thread. `activeThreadId === null` means the user is on the empty-state
  // welcome screen (either a brand-new chat or nothing ever sent).
  //
  // `typingThreadId` is set alongside `isTyping` so switching threads while
  // the AI is composing a reply in another thread doesn't leak a typing
  // bubble into the wrong conversation.
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [typingThreadId, setTypingThreadId] = useState<string | null>(null);
  const [pendingDeleteThreadId, setPendingDeleteThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bookmarkedMessageIds, setBookmarkedMessageIds] = useState<Set<string>>(() => {
    // First-visit vs returning-visit branching:
    //   • `null`  → we've never written to this key. Seed with the curated
    //               defaults so the Starred tab isn't an empty shell on
    //               day one. (Mirrors what we do for the seeded channel
    //               history — an empty workspace feels broken.)
    //   • `'[]'`  → user explicitly unstarred everything; respect that,
    //               don't helpfully "repopulate" and undo their cleanup.
    //   • anything else → their saved selection.
    try {
      const saved = localStorage.getItem('brego_bookmarked_messages');
      if (saved === null) return new Set(DEFAULT_STARRED_MESSAGE_IDS);
      return new Set(JSON.parse(saved));
    } catch {
      return new Set(DEFAULT_STARRED_MESSAGE_IDS);
    }
  });
  const [chatMode, setChatMode] = useState<'ai' | 'team'>('ai');
  // Active Brego-Team channel — only meaningful while chatMode === 'team'.
  // Defaults to 'discussions' so switching into team mode lands on the most
  // collaborative surface first.
  const [activeChannel, setActiveChannel] = useState<TeamChannelId>('discussions');
  // Unread counts per channel (for the inactive one the sidebar shows a dot).
  const [channelUnread, setChannelUnread] = useState<Partial<Record<TeamChannelId, number>>>({});
  // Which tab view is taking over the team chat main area. 'channel' means
  // the user is in the normal channel transcript; 'threads' / 'starred' /
  // 'media' replace the transcript with a filtered cross-channel view,
  // WhatsApp-style. Always reset to 'channel' when leaving team mode so the
  // next time they come back they land on a channel, not on a stale view.
  const [teamView, setTeamView] = useState<TeamView>('channel');
  // ID of the root team-channel message whose thread is currently open in
  // the right-hand ThreadPane. `null` means no thread is open and the main
  // channel view owns the full width. Follows Slack's model: at most one
  // thread open at a time; closing the pane returns focus to the channel.
  const [activeThreadRootId, setActiveThreadRootId] = useState<string | null>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showChatMentionDropdown, setShowChatMentionDropdown] = useState(false);
  const [chatMentionQuery, setChatMentionQuery] = useState('');
  const [chatMentionIdx, setChatMentionIdx] = useState(0);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());
  const [showReports, setShowReports] = useState(false);
  const [activeReportService, setActiveReportService] = useState<'marketing' | 'finance'>('marketing');
  const [reportInitialModule, setReportInitialModule] = useState<string | null>(null);
  const [showDataroom, setShowDataroom] = useState(false);
  const [dataroomInitialFolderId, setDataroomInitialFolderId] = useState<string | null>(null);
  const [dataroomInitialService, setDataroomInitialService] = useState<'accounts' | 'performance' | undefined>(undefined);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [workspaceOpenIncident, setWorkspaceOpenIncident] = useState(false);
  const [workspaceIncidentService, setWorkspaceIncidentService] = useState<'Performance Marketing' | 'Accounts & Taxation' | ''>('');
  const [showInlineChatIncident, setShowInlineChatIncident] = useState(false);
  const [inlineChatIncidentService, setInlineChatIncidentService] = useState<'Performance Marketing' | 'Accounts & Taxation'>('Performance Marketing');
  // When the incident modal is opened from a specific message (via the
  // 3-dot menu's "Raise incident" row), this seed carries the quoted
  // excerpt into the Description field so the user doesn't have to
  // retype context that's already in the chat.
  const [inlineChatIncidentInitialDescription, setInlineChatIncidentInitialDescription] = useState<string>('');
  const [chatCreatedIncidents, setChatCreatedIncidents] = useState<Incident[]>([]);
  // @task — create a to-do right from chat using the same modal the Workspace
  // Tasks module uses. `department` drives the assignee roster the modal shows
  // ("at" shows Accounts team, "pm" shows Performance Marketing team), and
  // `project` shows up as the project chip on the resulting to-do.
  const [showInlineChatTask, setShowInlineChatTask] = useState(false);
  const [inlineChatTaskDepartment, setInlineChatTaskDepartment] = useState<'at' | 'pm'>('pm');
  const [inlineChatTaskProject, setInlineChatTaskProject] = useState<string>('Performance Marketing');
  // Same trick as the incident seed above — carries a quoted excerpt
  // from the source message into the Notes field when the task modal
  // is opened from a specific chat bubble.
  const [inlineChatTaskInitialNotes, setInlineChatTaskInitialNotes] = useState<string>('');
  const [chatCreatedTasks, setChatCreatedTasks] = useState<AssignTodoTask[]>([]);
  const [workspaceInitialModule, setWorkspaceInitialModule] = useState<'tasks' | 'incidents' | undefined>(undefined);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileSettingsInvite, setProfileSettingsInvite] = useState(false);
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [upgradeResumeMode, setUpgradeResumeMode] = useState(false);
  const [showSyncingModal, setShowSyncingModal] = useState(false);
  const [showSettingUp, setShowSettingUp] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showServiceTeamOnboarding, setShowServiceTeamOnboarding] = useState(false);
  const [showAccountsTeamOnboarding, setShowAccountsTeamOnboarding] = useState(false);

  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>({
    isUpgraded: false,
    selectedPlan: '',
    completedSteps: [],
    currentStep: 'connect',
  });
  const [connectionFeedback, setConnectionFeedback] = useState<string>('');
  const [showOtherIndustryInput, setShowOtherIndustryInput] = useState(false);
  const [otherIndustryValue, setOtherIndustryValue] = useState('');
  const [showOtherChallengeInput, setShowOtherChallengeInput] = useState(false);
  const [otherChallengeValue, setOtherChallengeValue] = useState('');
  const prevChatModeRef = useRef<'ai' | 'team'>(chatMode);
  const [dashboardThinkingLabel, setDashboardThinkingLabel] = useState<string | null>(null);

  // Guard so we only seed the dummy Brego-Team conversation into the
  // messages array once per session. Keeps the chat feeling "lived in" on
  // first entry to team mode without re-seeding (and so duplicating) if
  // the user bounces between AI and team mode repeatedly.
  const teamSeededRef = useRef<boolean>(false);

  // ── Business Accounts — Per-account state snapshot system ──
  type AccountSnapshot = {
    messages: Message[];
    threads: ChatThread[];
    activeThreadId: string | null;
    diagnosticStep: number;
    diagnosticData: Partial<DiagnosticData>;
    clickedActions: Set<string>;
    connectionFeedback: string;
    onboardingProgress: OnboardingProgress;
    showSettingUp: boolean;
    showOtherIndustryInput: boolean;
    otherIndustryValue: string;
    showOtherChallengeInput: boolean;
    otherChallengeValue: string;
    isFirstLoad: boolean;
    chatMode: 'ai' | 'team';
    activeChannel: TeamChannelId;
    channelUnread: Partial<Record<TeamChannelId, number>>;
    activeReportService: 'marketing' | 'finance';
    upgradeResumeMode: boolean;
    // userInfo overrides for this account
    selectedService: string;
    businessModel: 'ecommerce' | 'leadgen' | '';
    businessType: string;
    companyName: string;
    companyWebsite: string;
    industry: string;
    goal: string;
    adSpendRange: string;
    financeManagement: string;
    revenueRange: string;
    accountingSoftware: string;
  };

  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showAddBusinessPlanModal, setShowAddBusinessPlanModal] = useState(false);
  const [addBusinessPreSelectedService, setAddBusinessPreSelectedService] = useState<'Performance Marketing' | 'Accounts & Taxation' | undefined>(undefined);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [accountSwitching, setAccountSwitching] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<Record<string, number>>({});
  const pendingDeletionRef = useRef<{ accountId: string; account: BusinessAccount; timeoutId: ReturnType<typeof setTimeout> } | null>(null);
  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>(() => {
    // Primary account mirrors the URL the page mounted under (when scoped),
    // falling back to userInfo when the route isn't service-scoped (e.g. legacy
    // /dashboard/chat). This keeps PromptSuggestions and all downstream
    // account-derived UI aligned with the URL the user is actually on.
    const isFinance = effectiveService === 'Accounts & Taxation';
    const defaultPlatforms = isFinance
      ? [] // Finance integrations are configured post-setup via Integrations settings
      : (effectiveBusinessType === 'leadgen' ? ['google', 'meta', 'ga4'] : ['google', 'meta', 'ga4', 'shopify']);
    return [{
      id: 'primary',
      name: userInfo.companyName || 'My Business',
      service: effectiveService,
      businessType: effectiveBusinessType,
      businessTypeLabel: effectiveBusinessTypeLabel,
      status: 'connected' as const,
      connectedPlatforms: defaultPlatforms,
      createdAt: new Date(),
    }];
  });
  const [activeAccountId, setActiveAccountId] = useState('primary');
  const accountSnapshotsRef = useRef<Record<string, AccountSnapshot>>({});

  // ── Typing timeout ref (for cancelling on account switch) ──
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Attachment Menu ──
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalType, setUploadModalType] = useState<'file' | 'image'>('file');
  const [showHuddle, setShowHuddle] = useState(false);
  const scheduledCallsCount = useScheduledCallsCount();

  // ── Team Availability (IST Business Hours: Mon-Fri 10am–7pm) ──
  const getTeamStatus = (): { status: 'online' | 'away' | 'offline'; label: string; detail: string } => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60;
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    const istHour = Math.floor((istMinutes >= 0 ? istMinutes : istMinutes + 1440) / 60) % 24;
    const istDay = now.getUTCDay(); // 0=Sun, 6=Sat
    
    // Adjust day if IST offset crosses midnight
    const adjustedDay = istMinutes >= 1440 ? (istDay + 1) % 7 : istDay;
    
    const isWeekday = adjustedDay >= 1 && adjustedDay <= 5;
    const isBusinessHours = istHour >= 10 && istHour < 19;
    const isNearBusinessHours = istHour >= 9 && istHour < 10 || istHour >= 19 && istHour < 20;
    
    if (isWeekday && isBusinessHours) {
      return { status: 'online', label: 'Online', detail: 'Typically responds in minutes' };
    }
    if (isWeekday && isNearBusinessHours) {
      return { status: 'away', label: 'Away', detail: 'May take 30-60 min to respond' };
    }
    return { status: 'offline', label: 'Offline', detail: 'Back Mon-Fri, 10am IST' };
  };

  const teamStatus = getTeamStatus();

  // Messages visible in the current view:
  //  • BregoGPT (AI) mode: every message that isn't tagged to a team channel
  //    (AI replies, the user's AI-side messages, and mode-switch separators)
  //  • Brego Team mode: only messages tagged with the active channel
  // All messages that live inside a team channel — used by the
  // cross-channel tab views (Threads / Starred / Media). Filtered once so
  // each view can scan it without re-walking the global messages array.
  const teamChannelMessages = useMemo(
    () => messages.filter((m) => !!m.channel),
    [messages],
  );

  // Live counts for the three team tabs. Shown as badges on the tab
  // buttons so users know what's inside before they click through. Cheap
  // because it only depends on the already-filtered team messages +
  // bookmarks Set identity.
  const teamTabCounts = useMemo(
    () => getTabCounts(teamChannelMessages, bookmarkedMessageIds),
    [teamChannelMessages, bookmarkedMessageIds],
  );

  // Replies indexed by parentId — O(1) lookup when rendering thread
  // summaries under each parent bubble and when the ThreadPane needs to
  // hydrate its replies list. Recomputed only when `messages` changes,
  // which is exactly when a new reply would land.
  const threadRepliesByParent = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of messages) {
      if (!m.parentId) continue;
      const arr = map.get(m.parentId) ?? [];
      arr.push(m);
      map.set(m.parentId, arr);
    }
    // Ensure each bucket is in timestamp order — seed order is already
    // chronological but defensive sort keeps the UI stable if the host
    // ever inserts out-of-order.
    for (const arr of map.values()) {
      arr.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    return map;
  }, [messages]);

  const visibleMessages = useMemo(() => {
    if (chatMode === 'team') {
      // Replies live inside the ThreadPane, not the main channel — hide
      // them from the channel transcript so the channel reads like a
      // high-signal summary, and the thread pane owns the detail.
      return messages.filter((m) => m.channel === activeChannel && !m.parentId);
    }
    // AI mode:
    //  - When a thread is active, show only that thread's messages.
    //  - When there's no active thread (fresh start / after delete), show
    //    nothing. The main pane renders its welcome + PromptSuggestions
    //    instead, exactly like Claude's empty-state.
    //  - Legacy messages without a threadId are only shown when no thread is
    //    selected — they behave as the "pre-thread" transcript. Once the
    //    user starts a thread, those legacy messages get hidden so the
    //    conversation reads cleanly.
    if (!activeThreadId) {
      return messages.filter((m) => !m.channel && !m.threadId);
    }
    return messages.filter((m) => !m.channel && m.threadId === activeThreadId);
  }, [messages, chatMode, activeChannel, activeThreadId]);

  /**
   * Threads bucketed by date (Today / Yesterday / …). Sorted most-recent
   * first within each bucket. Buckets with zero entries are dropped so the
   * sidebar never renders empty headers. Recomputed only when threads
   * change — cheap but avoids re-bucketing on every input keystroke.
   */
  const groupedThreads = useMemo(() => {
    if (threads.length === 0) return [] as Array<{ label: string; items: ChatThread[] }>;
    const now = Date.now();
    const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
    const buckets = new Map<string, ChatThread[]>();
    for (const t of sorted) {
      const label = getThreadDateBucket(t.updatedAt, now);
      const arr = buckets.get(label) ?? [];
      arr.push(t);
      buckets.set(label, arr);
    }
    return THREAD_BUCKET_ORDER
      .filter((label) => buckets.has(label))
      .map((label) => ({ label, items: buckets.get(label)! }));
  }, [threads]);

  // ── Centralized mode switcher with separator ──
  const switchChatMode = (newMode: 'ai' | 'team', source?: string) => {
    if (newMode === prevChatModeRef.current) return;

    // Insert visual separator into conversation (only if there are existing messages beyond the intro).
    // The separator is un-channeled so it only appears in the AI view — team view is channel-scoped.
    if (messages.length > 2) {
      const separatorMessage: Message = {
        id: `mode-switch-${Date.now()}`,
        type: 'system',
        content: newMode === 'ai' ? 'BregoGPT' : 'Brego Team',
        timestamp: new Date(),
        component: 'mode-switch',
        data: { mode: newMode, source: source || 'dropdown' }
      };
      setMessages(prev => [...prev, separatorMessage]);
    }

    prevChatModeRef.current = newMode;
    setChatMode(newMode);

    // On entering Brego Team: always land on #discussions (the directive is
    // "Discussion channel should be the default screen when user switches to
    // Brego team"). Clear its unread badge since the user is now watching it.
    if (newMode === 'team') {
      setActiveChannel('discussions');
      setChannelUnread((prev) => ({ ...prev, discussions: 0 }));

      // First time entering team mode this session — seed a realistic
      // conversation so #discussions and #announcements don't read as
      // ghost towns. Messages are tagged with `channel`, so they're
      // invisible from AI mode and don't pollute the BregoGPT transcript.
      if (!teamSeededRef.current) {
        const seeded = buildTeamSeedMessages(userInfo.firstName);
        setMessages((prev) => [...prev, ...(seeded as unknown as Message[])]);
        teamSeededRef.current = true;
      }
    }

    // Always reset the team tab view on any mode switch. Otherwise a user
    // who left the sidebar in Starred / Media would come back to a stale
    // view with no context on how they got there.
    setTeamView('channel');
    // Threads live inside team mode; close the pane on any mode flip so
    // it doesn't linger when the user switches back to BregoGPT.
    setActiveThreadRootId(null);
  };
  const [diagnosticData, setDiagnosticData] = useState<Partial<DiagnosticData>>({
    businessModel: userInfo.businessModel || '',
    industry: '',
    goal: userInfo.goal || '',
    adSpendRange: 0,
    connectedAccounts: {
      metaAds: false,
      googleAds: false,
      linkedinAds: false,
      shopify: false,
      ga4: false
    },
    // Initialize finance fields from userInfo
    businessType: userInfo.businessType,
    financeManagement: userInfo.financeManagement,
    revenueRange: userInfo.revenueRange,
    accountingSoftware: userInfo.accountingSoftware
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [thinkingLabelIndex, setThinkingLabelIndex] = useState(0);

  useEffect(() => {
    if (!isTyping) {
      setThinkingLabelIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingLabelIndex(prev => {
        const labels = chatMode === 'team' ? TEAM_THINKING_LABELS : AI_THINKING_LABELS;
        return (prev + 1) % labels.length;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isTyping, chatMode]);

  // ── Account Snapshot Helpers ──
  const saveCurrentAccountSnapshot = () => {
    accountSnapshotsRef.current[activeAccountId] = {
      messages,
      threads,
      activeThreadId,
      diagnosticStep,
      diagnosticData: { ...diagnosticData },
      clickedActions: new Set(clickedActions),
      connectionFeedback,
      onboardingProgress: { ...onboardingProgress },
      showSettingUp,
      showOtherIndustryInput,
      otherIndustryValue,
      showOtherChallengeInput,
      otherChallengeValue,
      isFirstLoad,
      chatMode,
      activeChannel,
      channelUnread,
      activeReportService,
      upgradeResumeMode,
      selectedService: userInfo.selectedService,
      businessModel: (userInfo.businessModel || '') as 'ecommerce' | 'leadgen' | '',
      businessType: userInfo.businessType || '',
      companyName: userInfo.companyName,
      companyWebsite: userInfo.companyWebsite || '',
      industry: userInfo.industry || '',
      goal: userInfo.goal || '',
      adSpendRange: userInfo.adSpendRange || '',
      financeManagement: userInfo.financeManagement || '',
      revenueRange: userInfo.revenueRange || '',
      accountingSoftware: userInfo.accountingSoftware || '',
    };
  };

  const createDefaultSnapshot = (account: BusinessAccount): AccountSnapshot => {
    const isFinance = account.service === 'Accounts & Taxation';
    const bm: 'ecommerce' | 'leadgen' | '' =
      isFinance ? '' : (account.businessType === 'leadgen' ? 'leadgen' : 'ecommerce');
    const bt = isFinance
      ? (account.businessType === 'ecommerce-restaurants' ? 'E-Commerce or Restaurants' : 'Trading, Manufacturing & Services')
      : '';
    return {
      messages: [],
      threads: [],
      activeThreadId: null,
      diagnosticStep: 0,
      diagnosticData: {
        businessModel: bm,
        industry: '',
        goal: '',
        adSpendRange: 0,
        connectedAccounts: { metaAds: false, googleAds: false, linkedinAds: false, shopify: false, ga4: false },
        businessType: bt,
        financeManagement: '',
        revenueRange: '',
        accountingSoftware: '',
      },
      clickedActions: new Set<string>(),
      connectionFeedback: '',
      onboardingProgress: { isUpgraded: false, selectedPlan: '', completedSteps: [], currentStep: 'connect' },
      showSettingUp: false,
      showOtherIndustryInput: false,
      otherIndustryValue: '',
      showOtherChallengeInput: false,
      otherChallengeValue: '',
      isFirstLoad: true,
      chatMode: 'ai',
      activeChannel: 'discussions',
      channelUnread: {},
      activeReportService: isFinance ? 'finance' : 'marketing',
      upgradeResumeMode: false,
      selectedService: account.service,
      businessModel: bm,
      businessType: bt,
      companyName: account.name,
      companyWebsite: '',
      industry: '',
      goal: '',
      adSpendRange: '',
      financeManagement: '',
      revenueRange: '',
      accountingSoftware: '',
    };
  };

  const restoreAccountSnapshot = (snap: AccountSnapshot) => {
    setMessages(snap.messages);
    setThreads(snap.threads);
    setActiveThreadId(snap.activeThreadId);
    setTypingThreadId(null); // never resume a phantom typing indicator
    setPendingDeleteThreadId(null);
    setDiagnosticStep(snap.diagnosticStep);
    setDiagnosticData(snap.diagnosticData);
    setClickedActions(snap.clickedActions);
    setConnectionFeedback(snap.connectionFeedback);
    setOnboardingProgress(snap.onboardingProgress);
    setShowSettingUp(snap.showSettingUp);
    setShowOtherIndustryInput(snap.showOtherIndustryInput);
    setOtherIndustryValue(snap.otherIndustryValue);
    setShowOtherChallengeInput(snap.showOtherChallengeInput);
    setOtherChallengeValue(snap.otherChallengeValue);
    setIsFirstLoad(snap.isFirstLoad);
    setChatMode(snap.chatMode);
    prevChatModeRef.current = snap.chatMode;
    setActiveChannel(snap.activeChannel);
    setChannelUnread(snap.channelUnread);
    setActiveReportService(snap.activeReportService);
    setUpgradeResumeMode(snap.upgradeResumeMode);
    // Restore userInfo overrides (mutation — consistent with existing pattern)
    userInfo.selectedService = snap.selectedService;
    userInfo.businessModel = snap.businessModel as any;
    userInfo.businessType = snap.businessType;
    userInfo.companyName = snap.companyName;
    userInfo.companyWebsite = snap.companyWebsite;
    userInfo.industry = snap.industry;
    userInfo.goal = snap.goal;
    userInfo.adSpendRange = snap.adSpendRange;
    userInfo.financeManagement = snap.financeManagement;
    userInfo.revenueRange = snap.revenueRange;
    userInfo.accountingSoftware = snap.accountingSoftware;
  };

  const switchBusinessAccount = (targetAccount: BusinessAccount) => {
    if (targetAccount.id === activeAccountId) return;
    if (accountSwitching) return; // Prevent double-trigger during transition
    // 1. Close overlays & reset transient states
    setShowReports(false);
    setShowDataroom(false);
    setShowWorkspace(false);
    setWorkspaceInitialModule(undefined);
    setShowProfileSettings(false);
    setProfileSettingsInvite(false);
    setShowUpgradeFlow(false);
    setShowSyncingModal(false);
    setShowAddBusinessModal(false);
    setShowAddBusinessPlanModal(false);
    setAddBusinessPreSelectedService(undefined);
    setShowShortcutsModal(false);
    setIsGeneratingReport(false);
    setIsTyping(false);
    setInputValue('');
    // Cancel any pending system message typing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setShowAttachmentMenu(false);
    setShowModeDropdown(false);
    // 2. Start visual transition
    setAccountSwitching(true);
    // 3. Save current account
    saveCurrentAccountSnapshot();
    // 4. Brief transition delay
    setTimeout(() => {
      const snap = accountSnapshotsRef.current[targetAccount.id];
      if (snap) {
        restoreAccountSnapshot(snap);
      } else {
        // First time — create default + init welcome
        const defaultSnap = createDefaultSnapshot(targetAccount);
        accountSnapshotsRef.current[targetAccount.id] = defaultSnap;
        restoreAccountSnapshot(defaultSnap);
        // Initialize welcome + diagnostic prompt for new account
        const welcomeMsg: Message = {
          id: `welcome-${targetAccount.id}`,
          type: 'system',
          content: `Hey ${userInfo.firstName}! 👋`,
          timestamp: new Date(),
          component: 'welcome'
        };
        const introMsg: Message = {
          id: `intro-${targetAccount.id}`,
          type: 'system',
          content: `Welcome to **Brego Business**. I'm **BregoGPT** — your AI-powered growth partner. I work alongside founders and ambitious teams to drive real results — so you can stay focused on what you do best: building.`,
          timestamp: new Date(),
        };
        const diagMsg = buildNewAccountDiagnosticMsg(targetAccount);
        setMessages([welcomeMsg, introMsg, diagMsg]);
      }
      setActiveAccountId(targetAccount.id);
      setTimeout(() => {
        setAccountSwitching(false);
        toast.success(`Switched to ${targetAccount.name}`, {
          description: `${targetAccount.service} · ${targetAccount.businessTypeLabel}`,
          duration: 2500,
        });
      }, 200);
    }, 180);
  };

  // ── Delete / Remove Business Account (with Undo) ──
  const deleteBusinessAccount = (accountId: string) => {
    // Prevent deleting the last account
    if (businessAccounts.length <= 1) {
      toast.error('Cannot remove the only business account');
      return;
    }
    // Prevent deleting the active account (must switch first)
    if (accountId === activeAccountId) {
      toast.error('Switch to another account before removing this one');
      return;
    }
    const deletedAccount = businessAccounts.find(a => a.id === accountId);
    if (!deletedAccount) return;

    // Cancel any previous pending deletion cleanup
    if (pendingDeletionRef.current) {
      clearTimeout(pendingDeletionRef.current.timeoutId);
    }

    // Remove the account from the list (keep snapshot for potential undo)
    setBusinessAccounts(prev => prev.filter(a => a.id !== accountId));

    // Schedule snapshot cleanup after undo window expires
    const cleanupTimeoutId = setTimeout(() => {
      delete accountSnapshotsRef.current[accountId];
      pendingDeletionRef.current = null;
    }, 7000);

    pendingDeletionRef.current = { accountId, account: deletedAccount, timeoutId: cleanupTimeoutId };

    // Toast with undo action
    toast(`${deletedAccount.name} removed`, {
      description: 'Business account removed from workspace.',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          // Cancel snapshot cleanup
          if (pendingDeletionRef.current?.accountId === accountId) {
            clearTimeout(pendingDeletionRef.current.timeoutId);
            pendingDeletionRef.current = null;
          }
          // Re-add the account
          setBusinessAccounts(prev => [...prev, deletedAccount]);
          toast.success(`${deletedAccount.name} restored`, { duration: 2500 });
        },
      },
    });
  };

  // Helper: build initial diagnostic question for new accounts
  const buildNewAccountDiagnosticMsg = (account: BusinessAccount): Message => {
    const isFinance = account.service === 'Accounts & Taxation';
    if (isFinance) {
      return {
        id: `diag-${account.id}`,
        type: 'system',
        content: "Great — let's understand your finance setup.\n\nHow are you currently managing your Finance Department?",
        timestamp: new Date(),
        component: 'diagnostic-question',
        buttons: [
          { label: 'In-house Team', action: 'finance-management:inhouse', variant: 'secondary' as const },
          { label: 'CA Firm / Freelancer', action: 'finance-management:ca-firm', variant: 'secondary' as const },
          { label: 'Managing Personally', action: 'finance-management:personally', variant: 'secondary' as const },
          { label: 'Not Managing at All', action: 'finance-management:not-managing', variant: 'secondary' as const },
        ],
      };
    }
    return {
      id: `diag-${account.id}`,
      type: 'system',
      content: "Let's understand your business better.\n\nWhich industry do you operate in?",
      timestamp: new Date(),
      component: 'diagnostic-question',
      buttons: [
        { label: 'E-Commerce', action: 'industry:ecommerce', variant: 'secondary' as const },
        { label: 'Healthcare / Wellness', action: 'industry:healthcare', variant: 'secondary' as const },
        { label: 'Education / EdTech', action: 'industry:education', variant: 'secondary' as const },
        { label: 'B2B Services', action: 'industry:b2b-services', variant: 'secondary' as const },
        { label: 'Real Estate', action: 'industry:real-estate', variant: 'secondary' as const },
        { label: 'Food & Beverage', action: 'industry:food-beverage', variant: 'secondary' as const },
        { label: 'Technology / SaaS', action: 'industry:technology', variant: 'secondary' as const },
        { label: 'Other', action: 'industry:other', variant: 'secondary' as const },
      ],
    };
  };

  // ── Speech-to-Text ──
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
    };
  }, [speechSupported]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ── Keyboard Shortcuts ──
  // Use refs to avoid stale closures in the addEventListener callback
  const switchBusinessAccountRef = useRef(switchBusinessAccount);
  switchBusinessAccountRef.current = switchBusinessAccount;
  const businessAccountsRef = useRef(businessAccounts);
  businessAccountsRef.current = businessAccounts;
  const activeAccountIdRef = useRef(activeAccountId);
  activeAccountIdRef.current = activeAccountId;
  const accountSwitchingRef = useRef(accountSwitching);
  accountSwitchingRef.current = accountSwitching;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + / → Toggle shortcuts cheatsheet
      if (modifier && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // ? key (Shift+/ on most keyboards, no Cmd/Ctrl, not in input) → Toggle shortcuts cheatsheet
      if (e.key === '?' && !modifier) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Cmd/Ctrl + Shift + 1-9 → Account switching
      if (!modifier || !e.shiftKey) return;
      // Use e.code (Digit1-Digit9) since e.key with Shift may return shifted symbols (!, @, etc.)
      const codeMatch = e.code?.match(/^Digit(\d)$/);
      if (!codeMatch) return;
      const digit = parseInt(codeMatch[1]);
      if (digit < 1 || digit > 9) return;
      // Prevent switching during an active transition
      if (accountSwitchingRef.current) return;
      const accounts = businessAccountsRef.current;
      const targetIndex = digit - 1;
      if (targetIndex >= accounts.length) return;
      const targetAccount = accounts[targetIndex];
      if (targetAccount.id === activeAccountIdRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      switchBusinessAccountRef.current(targetAccount);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Stable — reads from refs, not closure

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detect when user scrolls away from bottom


  // ── Bookmark & Select-Mode handlers ──
  const handleToggleBookmark = useCallback((messageId: string) => {
    setBookmarkedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      try { localStorage.setItem('brego_bookmarked_messages', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  // ── "Turn this message into work" handlers ──
  // Both helpers take the message id (reserved for future linking back to
  // the source bubble) and its plain-text content, and open the same
  // modals that @task / @incident mentions already use. The excerpt is
  // clipped at ~240 chars so the prefilled field reads like a human
  // would've pasted it — long enough for real context, short enough not
  // to drown out whatever the user adds.
  const quoteExcerpt = useCallback((content: string) => {
    const normalized = content.replace(/\s+/g, ' ').trim();
    const clipped = normalized.length > 240 ? normalized.slice(0, 240).trimEnd() + '…' : normalized;
    return `"${clipped}"`;
  }, []);

  const handleCreateTaskFromMessage = useCallback(
    (_messageId: string, content: string) => {
      const isFinance = effectiveService === 'Accounts & Taxation';
      setInlineChatTaskDepartment(isFinance ? 'at' : 'pm');
      setInlineChatTaskProject(isFinance ? 'Accounts & Taxation' : 'Performance Marketing');
      setInlineChatTaskInitialNotes(`From chat:\n${quoteExcerpt(content)}`);
      setShowInlineChatTask(true);
    },
    [effectiveService, quoteExcerpt],
  );

  const handleCreateIncidentFromMessage = useCallback(
    (_messageId: string, content: string) => {
      const derivedService: 'Performance Marketing' | 'Accounts & Taxation' =
        effectiveService === 'Accounts & Taxation'
          ? 'Accounts & Taxation'
          : 'Performance Marketing';
      setInlineChatIncidentService(derivedService);
      setInlineChatIncidentInitialDescription(
        `Reported from chat:\n${quoteExcerpt(content)}\n\n`,
      );
      setShowInlineChatIncident(true);
    },
    [effectiveService, quoteExcerpt],
  );

  // Toggle a reaction on a message. `'you'` is the opaque handle used
  // everywhere for the current user — keeps the seeded data, the UI
  // highlight and the toggle logic all speaking the same language. If the
  // user was the last reactor with that emoji, the whole entry is pruned
  // so the pill row doesn't render a zero-count ghost.
  const handleToggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions ?? [];
        const idx = existing.findIndex((r) => r.emoji === emoji);
        if (idx === -1) {
          // Brand new reaction on this message.
          return {
            ...m,
            reactions: [...existing, { emoji, users: ['you'] }],
          };
        }
        const entry = existing[idx];
        const youReacted = entry.users.includes('you');
        let nextUsers: string[];
        if (youReacted) {
          nextUsers = entry.users.filter((u) => u !== 'you');
        } else {
          nextUsers = [...entry.users, 'you'];
        }
        const nextReactions = [...existing];
        if (nextUsers.length === 0) {
          nextReactions.splice(idx, 1);
        } else {
          nextReactions[idx] = { ...entry, users: nextUsers };
        }
        return { ...m, reactions: nextReactions };
      }),
    );
  }, []);

  /* ── Thread handlers ─────────────────────────────────────────────────
   *
   * Threads piggy-back on the single `messages` array: a reply is just a
   * normal Message with `parentId` set to its root. That means reactions,
   * bookmarks and scroll-to-message all work inside threads
   * without any extra wiring. Only the filtering (main channel vs pane)
   * and the pane UI need special handling.
   *
   * Open: set the active root id. The ThreadPane mounts as a sibling of
   * the channel transcript; no data fetching required.
   * Close: clear the root id. Esc / backdrop / × all route through here.
   * Send reply: append a new user-authored Message carrying the root's
   * channel and the root's id as `parentId`. The "also send to channel"
   * toggle is a dual-post: when true we emit a *second* regular message
   * in the channel transcript (parentId omitted) so the broader team can
   * see the decision without opening the thread.
   */
  const handleOpenThread = useCallback((rootId: string) => {
    setActiveThreadRootId(rootId);
  }, []);

  const handleCloseThread = useCallback(() => {
    setActiveThreadRootId(null);
  }, []);

  const handleSendThreadReply = useCallback(
    (rootId: string, text: string, alsoSendToChannel: boolean) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => {
        const root = prev.find((m) => m.id === rootId);
        if (!root || !root.channel) return prev;
        const now = new Date();
        const reply: Message = {
          id: `thread-reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'user',
          from: 'user',
          content: trimmed,
          timestamp: now,
          channel: root.channel,
          parentId: rootId,
        };
        const next = [...prev, reply];
        // Dual-post: mirror the reply into the channel so it surfaces to
        // readers who haven't opened the thread. Intentionally lightweight
        // — same text, no parentId, so it reads as a standalone message.
        if (alsoSendToChannel) {
          next.push({
            id: `thread-mirror-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: 'user',
            from: 'user',
            content: trimmed,
            // Offset by 1ms so the mirror always sorts after the reply
            // within the same timestamp batch — keeps any downstream
            // diff-sort stable.
            timestamp: new Date(now.getTime() + 1),
            channel: root.channel,
          });
        }
        return next;
      });
    },
    [],
  );

  const handleClearAllBookmarks = useCallback(() => {
    const count = bookmarkedMessageIds.size;
    setBookmarkedMessageIds(new Set());
    try { localStorage.removeItem('brego_bookmarked_messages'); } catch {}
    toast.success(`${count} bookmark${count !== 1 ? 's' : ''} cleared`);
  }, [bookmarkedMessageIds.size]);

  // Scroll to a bookmarked message
  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight flash
      el.classList.add('ring-2', 'ring-brand/30', 'rounded-2xl');
      setTimeout(() => el.classList.remove('ring-2', 'ring-brand/30', 'rounded-2xl'), 1500);
    }
  }, []);

  // Jump from a tab view (Threads / Starred / Media) back to the specific
  // message inside its channel. The scroll has to wait one frame because
  // the channel view is not mounted until React re-renders after we flip
  // `teamView`. Two rAFs give the transcript time to hydrate and paint
  // before we try to find the element.
  const handleJumpToTeamMessage = useCallback(
    (messageId: string, channel: TeamChannelId) => {
      setActiveChannel(channel);
      setChannelUnread((prev) => ({ ...prev, [channel]: 0 }));
      setTeamView('channel');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToMessage(messageId));
      });
    },
    [scrollToMessage],
  );

  // Auto-scroll disabled — let users read responses naturally from top to bottom.
  // Only scroll when the user sends a NEW prompt (their own message) so the
  // sent bubble is visible, but never yank them to the bottom for AI replies.
  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    // Skip on first load
    if (isFirstLoad && messages.length <= 2) return;

    // Only scroll when a new user message was just added
    const latest = messages[messages.length - 1];
    if (messages.length > prevCount && latest?.type === 'user') {
      // Scroll just enough to show the user's sent bubble
      setTimeout(() => {
        const el = document.getElementById(`msg-${latest.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [messages, isFirstLoad]);

  // When the user picks a different thread from the Recents sidebar, jump
  // to the bottom of that thread so the most recent exchange is in view —
  // matches Claude's behavior of resuming a conversation at its end.
  useEffect(() => {
    if (!activeThreadId) return;
    const id = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 40);
    return () => clearTimeout(id);
  }, [activeThreadId]);

  // Close mode dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
    };
    if (showModeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModeDropdown]);

  // Close attachment menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };
    if (showAttachmentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttachmentMenu]);

  // Navigate to Dataroom with a specific folder open
  const navigateToDataroomFolder = (folderId: string, service: 'accounts' | 'performance') => {
    setDataroomInitialFolderId(folderId);
    setDataroomInitialService(service);
    setShowDataroom(true);
  };

  // Handle batch upload from UploadDocumentModal (unified system)
  const handleBatchUploadComplete = (files: { fileName: string; fileSize: string; fileType: string; folderId: string; folderPath: string; service: 'accounts' | 'performance'; note?: string }[]) => {
    if (files.length === 0) return;
    const firstFile = files[0];
    const serviceName = firstFile.service === 'accounts' ? 'Accounts & Taxation' : 'Performance Marketing';
    const uploadNote = firstFile.note?.trim() || '';

    // Toast notification
    toast.success(
      files.length === 1
        ? `${firstFile.fileName} uploaded successfully`
        : `${files.length} files uploaded successfully`,
      { description: `Saved to ${serviceName} → ${firstFile.folderPath}` }
    );

    if (files.length === 1) {
      // Single file — rich card message
      const uploadMsg: Message = {
        id: `file-${Date.now()}`,
        type: 'user',
        content: `📎 Uploaded **${firstFile.fileName}** to Dataroom`,
        timestamp: new Date(),
        component: 'file-upload',
        data: { fileName: firstFile.fileName, fileSize: firstFile.fileSize, fileType: firstFile.fileType, uploadType: firstFile.fileType.match(/JPG|JPEG|PNG|WEBP|GIF|SVG/i) ? 'image' : 'file', folderPath: firstFile.folderPath, service: serviceName, folderId: firstFile.folderId, serviceKey: firstFile.service, note: uploadNote }
      };
      setMessages(prev => [...prev, uploadMsg]);
      setTimeout(() => {
        const navAction = `navigate-dataroom:${firstFile.folderId}:${firstFile.service}`;
        const noteContext = uploadNote ? `\n\n💬 **Your note:** "${uploadNote}"` : '';
        const hasBregoteamTag = /@bregoteam\b/i.test(uploadNote);
        const mentionedMembers = ['zubear', 'irshad', 'tejas', 'chinmay'].filter(n => new RegExp(`@${n}\\b`, 'i').test(uploadNote));
        const teamNotify = hasBregoteamTag
          ? `\n\n👥 **Brego Team has been notified** — they'll receive your file and note for review.`
          : mentionedMembers.length > 0
            ? `\n\n👤 **${mentionedMembers.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & ')}** (Brego Team) ${mentionedMembers.length > 1 ? 'have' : 'has'} been notified and will review your upload.`
            : '';
        addSystemMessage(
          chatMode === 'ai'
            ? `Got it! I've received **${firstFile.fileName}** (${firstFile.fileSize}, ${firstFile.fileType}) and saved it to your ${serviceName} Dataroom.\n\n📂 **Location:** ${firstFile.folderPath}\n💾 **Size:** ${firstFile.fileSize}\n📄 **Format:** ${firstFile.fileType}${noteContext}${teamNotify}\n\nThe file is now accessible from your Dataroom. Would you like me to analyze it or do anything else with it?`
            : `Your file **${firstFile.fileName}** (${firstFile.fileSize}) has been uploaded to **${firstFile.folderPath}** in ${serviceName} and shared with the Brego Team.${uploadNote ? ` Your note: "${uploadNote}"` : ''} They'll review it shortly.`,
          undefined,
          [{ label: '📂 Go to folder', action: navAction, variant: 'secondary' }]
        );
      }, 800);
    } else {
      // Multi-file — batch summary message
      const fileNames = files.map(f => f.fileName);
      const totalSize = files.map(f => {
        const num = parseFloat(f.fileSize);
        return f.fileSize.includes('MB') ? num * 1024 : num;
      }).reduce((a, b) => a + b, 0);
      const totalSizeStr = totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} MB` : `${Math.round(totalSize)} KB`;

      const batchMsg: Message = {
        id: `batch-${Date.now()}`,
        type: 'user',
        content: `📎 Uploaded **${files.length} files** to Dataroom`,
        timestamp: new Date(),
        component: 'batch-upload',
        data: { files: fileNames, fileCount: files.length, folderPath: firstFile.folderPath, service: serviceName, totalSize: totalSizeStr, folderId: firstFile.folderId, serviceKey: firstFile.service, note: uploadNote }
      };
      setMessages(prev => [...prev, batchMsg]);
      setTimeout(() => {
        const navAction = `navigate-dataroom:${firstFile.folderId}:${firstFile.service}`;
        const noteContext = uploadNote ? `\n\n💬 **Your note:** "${uploadNote}"` : '';
        const hasBregoteamTag = /@bregoteam\b/i.test(uploadNote);
        const mentionedMembers = ['zubear', 'irshad', 'tejas', 'chinmay'].filter(n => new RegExp(`@${n}\\b`, 'i').test(uploadNote));
        const teamNotify = hasBregoteamTag
          ? `\n\n👥 **Brego Team has been notified** — they'll receive your files and note for review.`
          : mentionedMembers.length > 0
            ? `\n\n👤 **${mentionedMembers.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & ')}** (Brego Team) ${mentionedMembers.length > 1 ? 'have' : 'has'} been notified and will review your upload.`
            : '';
        addSystemMessage(
          chatMode === 'ai'
            ? `I've received all **${files.length} files** (${totalSizeStr} total) and saved them to your ${serviceName} Dataroom.\n\n📂 **Location:** ${firstFile.folderPath}\n📄 **Files uploaded:**\n${fileNames.map(n => `  • ${n}`).join('\n')}${noteContext}${teamNotify}\n\nAll files are now accessible from your Dataroom. Would you like me to analyze any of these documents?`
            : `Your **${files.length} files** have been uploaded to **${firstFile.folderPath}** (${serviceName}) and shared with the Brego Team.${uploadNote ? ` Your note: "${uploadNote}"` : ''} They'll review them shortly.`,
          undefined,
          [{ label: '📂 Go to folder', action: navAction, variant: 'secondary' }]
        );
      }, 800);
    }
  };

  // Initialize conversation
  useEffect(() => {
    const primaryAccount = businessAccounts[0];
    const welcomeMessage: Message = {
      id: '1',
      type: 'system',
      content: `Hey ${userInfo.firstName}! 👋`,
      timestamp: new Date(),
      component: 'welcome'
    };
    
    setTimeout(() => {
      setMessages([welcomeMessage]);
      setTimeout(() => {
        addSystemMessage(
          `Welcome to **Brego Business**. I'm **BregoGPT** — your AI-powered growth partner. I work alongside founders and ambitious teams to drive real results — so you can stay focused on what you do best: building.`,
          undefined
        );
        
        // Onboarding is already completed - no need to ask for service selection again
      }, 600);
    }, 500);
  }, []);

  // Handle attached media plan
  useEffect(() => {
    if (attachedMediaPlan && attachedMediaPlan.combinedPlan && messages.length > 0) {
      const timer = setTimeout(() => {
        // Add media plan as a message
        const mediaPlanMessage: Message = {
          id: Date.now().toString() + '-mediaplan',
          type: 'system',
          content: '',
          timestamp: new Date(),
          component: 'media-plan',
          mediaPlan: attachedMediaPlan
        };
        
        // Add follow-up message with @BregoTeam tag
        const followUpMessage: Message = {
          id: Date.now().toString() + '-followup',
          type: 'system',
          content: `I've added your **${attachedMediaPlan.month} ${attachedMediaPlan.year} Media Plan** above. **@BregoTeam** will review your questions and respond soon.\n\nWhat would you like to discuss about this plan?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, mediaPlanMessage, followUpMessage]);
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedMediaPlan]);

  // ── Global Modals (must render in ALL return paths) ──
  const handleAddBusinessPlanComplete = (service: 'Performance Marketing' | 'Accounts & Taxation', _plan: string) => {
    setShowAddBusinessPlanModal(false);
    setAddBusinessPreSelectedService(service);
    setShowAddBusinessModal(true);
  };

  // Fired when a user clicks "Explore Finance" / "Explore Marketing" in the
  // sidebar cross-sell card. Pre-selects the target service so the Plan modal
  // opens directly at the pricing page (no duplicate service-picker step),
  // then the standard Plan → Business Details → Welcome flow takes over.
  const handleActivateCrossSell = (service: 'marketing' | 'finance') => {
    const label: 'Performance Marketing' | 'Accounts & Taxation' =
      service === 'finance' ? 'Accounts & Taxation' : 'Performance Marketing';
    setAddBusinessPreSelectedService(label);
    setShowAddBusinessPlanModal(true);
  };

  const handleAddBusinessComplete = (newAccount: BusinessAccount) => {
    saveCurrentAccountSnapshot();
    setBusinessAccounts(prev => [...prev, newAccount]);
    const defaultSnap = createDefaultSnapshot(newAccount);
    accountSnapshotsRef.current[newAccount.id] = defaultSnap;
    restoreAccountSnapshot(defaultSnap);
    const welcomeMsg: Message = {
      id: `welcome-${newAccount.id}`,
      type: 'system',
      content: `Hey ${userInfo.firstName}! 👋`,
      timestamp: new Date(),
      component: 'welcome'
    };
    const introMsg: Message = {
      id: `intro-${newAccount.id}`,
      type: 'system',
      content: `Welcome to **Brego Business**. I'm **BregoGPT** — your AI-powered growth partner. I work alongside founders and ambitious teams to drive real results — so you can stay focused on what you do best: building.`,
      timestamp: new Date(),
    };
    const diagMsg = buildNewAccountDiagnosticMsg(newAccount);
    setMessages([welcomeMsg, introMsg, diagMsg]);
    setActiveAccountId(newAccount.id);
    setShowAddBusinessModal(false);
    setAddBusinessPreSelectedService(undefined);
    setShowReports(false);
    toast.success(`${newAccount.name} created`, {
      description: `${newAccount.service} workspace is ready`,
      duration: 3000,
    });
  };

  const handleInlineChatIncidentSubmit = (result: InlineIncidentResult) => {
    setShowInlineChatIncident(false);

    // Build a full Incident object for the Workspace table
    const now = new Date();
    const sortNum = parseFloat(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    );
    const fullIncident: Incident = {
      id: result.id,
      title: result.title,
      status: 'Open',
      service: result.service,
      dateTime: result.dateTime,
      sortDate: sortNum,
      description: result.description,
      impact: 'Impact assessment pending.',
      raisedBy: 'You',
      raisedFromChat: true,
    };
    setChatCreatedIncidents((prev) => [fullIncident, ...prev]);

    // Inject a confirmation card into the chat stream
    const msgId = `${Date.now()}-incident-confirm`;
    const confirmationMessage: Message = {
      id: msgId,
      type: 'system',
      content: '',
      timestamp: new Date(),
      component: 'incident-confirmation',
      data: result,
    };
    setMessages((prev) => [...prev, confirmationMessage]);
    // Scroll to the confirmation card
    setTimeout(() => {
      const el = document.getElementById(`msg-${msgId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleInlineChatTaskSubmit = (task: AssignTodoTask) => {
    setShowInlineChatTask(false);
    setChatCreatedTasks((prev) => [task, ...prev]);

    // Inject a compact confirmation card into the chat stream — mirrors the
    // incident flow so the surface stays consistent across @mention actions.
    const msgId = `${Date.now()}-task-confirm`;
    const confirmationMessage: Message = {
      id: msgId,
      type: 'system',
      content: '',
      timestamp: new Date(),
      component: 'task-confirmation',
      data: task,
    };
    setMessages((prev) => [...prev, confirmationMessage]);
    setTimeout(() => {
      const el = document.getElementById(`msg-${msgId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleOnboardingIncidentCreated = (result: InlineIncidentResult) => {
    const now = new Date();
    const sortNum = parseFloat(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    );
    const fullIncident: Incident = {
      id: result.id,
      title: result.title,
      status: 'Open',
      service: result.service,
      dateTime: result.dateTime,
      sortDate: sortNum,
      description: result.description,
      impact: 'Impact assessment pending.',
      raisedBy: 'You',
      raisedFromOnboarding: true,
    };
    setChatCreatedIncidents((prev) => [fullIncident, ...prev]);
  };

  const renderGlobalModals = () => (
    <>
      {/* Inline Chat Incident Form */}
      {showInlineChatIncident && (
        <InlineChatIncidentForm
          defaultService={inlineChatIncidentService}
          initialDescription={inlineChatIncidentInitialDescription}
          onClose={() => {
            setShowInlineChatIncident(false);
            setInlineChatIncidentInitialDescription('');
          }}
          onSubmit={(result) => {
            handleInlineChatIncidentSubmit(result);
            setInlineChatIncidentInitialDescription('');
          }}
        />
      )}

      {/* Inline Chat Task Modal — same component the Workspace Tasks module
          uses, so the two surfaces stay in lock-step. */}
      {showInlineChatTask && (
        <AddTodoModal
          project={inlineChatTaskProject}
          department={inlineChatTaskDepartment}
          initialNotes={inlineChatTaskInitialNotes}
          onClose={() => {
            setShowInlineChatTask(false);
            setInlineChatTaskInitialNotes('');
          }}
          onAddTask={(task) => {
            handleInlineChatTaskSubmit(task);
            setInlineChatTaskInitialNotes('');
          }}
        />
      )}

      <AddBusinessPlanModal
        isOpen={showAddBusinessPlanModal}
        onClose={() => {
          setShowAddBusinessPlanModal(false);
          // Reset preselected service only if the Business Details modal
          // isn't about to open (handleAddBusinessPlanComplete sets it for
          // the next step in the flow).
          if (!showAddBusinessModal) setAddBusinessPreSelectedService(undefined);
        }}
        preSelectedService={addBusinessPreSelectedService}
        onComplete={handleAddBusinessPlanComplete}
      />
      <AddBusinessModal
        isOpen={showAddBusinessModal}
        onClose={() => { setShowAddBusinessModal(false); setAddBusinessPreSelectedService(undefined); }}
        preSelectedService={addBusinessPreSelectedService}
        onComplete={handleAddBusinessComplete}
        existingAccounts={businessAccounts}
      />

      {/* Upgrade Flow Overlay — global so it renders on top of any module.
          Routes Marketing vs Accounts & Taxation based on the URL the user is
          on, not stale userInfo (see effectiveUserInfo above). */}
      {showUpgradeFlow && (
        <UpgradeFlow
          userInfo={effectiveUserInfo}
          onClose={() => setShowUpgradeFlow(false)}
          onComplete={() => {
            setShowUpgradeFlow(false);
            // Mark all steps complete (when finishing full resume flow)
            const isFinance = effectiveService === 'Accounts & Taxation';
            setOnboardingProgress(prev => ({
              ...prev,
              completedSteps: isFinance 
                ? ['connect', 'basics', 'dataAccess', 'documents']
                : ['connect', 'basics', 'competitors', 'products'],
              currentStep: 'complete',
              serviceType: isFinance ? 'finance' : 'marketing',
            }));
            // Update active account status to 'connected' and set platforms
            setBusinessAccounts(prev => prev.map(a => {
              if (a.id !== activeAccountId) return a;
              const platforms = isFinance
                ? []
                : (a.businessType === 'leadgen' ? ['google', 'meta', 'ga4'] : ['google', 'meta', 'ga4', 'shopify']);
              return { ...a, status: 'connected' as const, connectedPlatforms: platforms };
            }));
            // Route: PM → Service Team Onboarding; Finance → Accounts Team Onboarding
            if (!isFinance) {
              setShowServiceTeamOnboarding(true);
            } else {
              setShowAccountsTeamOnboarding(true);
            }
          }}
          onConnectAndSync={() => {
            // Close upgrade flow, show syncing modal
            const isFinance = effectiveService === 'Accounts & Taxation';
            setShowUpgradeFlow(false);
            setOnboardingProgress(prev => ({
              ...prev,
              completedSteps: prev.completedSteps.includes('connect') 
                ? prev.completedSteps 
                : [...prev.completedSteps, 'connect'],
              currentStep: 'basics',
              serviceType: isFinance ? 'finance' : 'marketing',
            }));
            setShowSettingUp(true);
            setShowSyncingModal(true);
            // Update active account status to 'setup'
            setBusinessAccounts(prev => prev.map(a =>
              a.id === activeAccountId ? { ...a, status: 'setup' as const } : a
            ));
          }}
          onUpgradeConfirmed={(plan) => {
            const isFinance = effectiveService === 'Accounts & Taxation';
            setOnboardingProgress(prev => ({
              ...prev,
              isUpgraded: true,
              selectedPlan: plan,
              serviceType: isFinance ? 'finance' : 'marketing',
            }));
            // Update active account status to 'setup'
            setBusinessAccounts(prev => prev.map(a =>
              a.id === activeAccountId ? { ...a, status: 'setup' as const } : a
            ));
          }}
          onStepComplete={(stepId) => {
            setOnboardingProgress(prev => ({
              ...prev,
              completedSteps: prev.completedSteps.includes(stepId) 
                ? prev.completedSteps 
                : [...prev.completedSteps, stepId],
            }));
          }}
          onStepChange={(stepId) => {
            setOnboardingProgress(prev => ({
              ...prev,
              currentStep: stepId,
            }));
          }}
          resumeOnboarding={upgradeResumeMode && onboardingProgress.isUpgraded ? onboardingProgress : undefined}
        />
      )}

      {/* Account Syncing Modal — shown after Connect Accounts step */}
      {showSyncingModal && (
        <AccountSyncingModal
          serviceType={effectiveService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
          businessModel={
            effectiveService === 'Accounts & Taxation'
              ? effectiveBusinessType as 'ecommerce-restaurants' | 'trading-manufacturing'
              : (effectiveBusinessType as 'ecommerce' | 'leadgen')
          }
          onComplete={() => {
            setShowSyncingModal(false);
            const isFinance = effectiveService === 'Accounts & Taxation';
            // Update account status to 'setup' (still completing remaining steps)
            setBusinessAccounts(prev => prev.map(a => {
              if (a.id !== activeAccountId) return a;
              const platforms = isFinance
                ? []
                : (a.businessType === 'leadgen' ? ['google', 'meta', 'ga4'] : ['google', 'meta', 'ga4', 'shopify']);
              return { ...a, status: 'setup' as const, connectedPlatforms: platforms };
            }));
            // Only mark 'connect' as complete — remaining steps done via "Setting Up" card
            setOnboardingProgress(prev => ({
              ...prev,
              completedSteps: prev.completedSteps.includes('connect')
                ? prev.completedSteps
                : [...prev.completedSteps, 'connect'],
              currentStep: 'basics',
              serviceType: isFinance ? 'finance' : 'marketing',
            }));
            // Navigate to Dashboard with "Setting Up" card visible
            setActiveReportService(isFinance ? 'finance' : 'marketing');
            setReportInitialModule(null);
            setShowReports(true);
          }}
        />
      )}

      {/* Service Team Onboarding — Performance Marketing kickoff after all setup steps complete */}
      <ServiceTeamOnboarding
        isOpen={showServiceTeamOnboarding}
        onComplete={() => {
          setShowServiceTeamOnboarding(false);
          setOnboardingProgress(prev => ({ ...prev, stoCompleted: true }));
          setActiveReportService('marketing');
          setReportInitialModule(null);
          setShowReports(true);
        }}
        businessType={effectiveBusinessType === 'leadgen' ? 'leadgen' : 'ecommerce'}
        clientName={`${userInfo.firstName} ${userInfo.lastName}`}
        companyName={userInfo.companyName}
        monthlyBudget={userInfo.adSpendRange}
        selectedPlan={onboardingProgress.selectedPlan}
        onIncidentCreated={handleOnboardingIncidentCreated}
      />

      {/* Accounts Team Onboarding — Accounts & Taxation kickoff after all setup steps complete.
          businessType uses the URL-derived onboarding label so this modal
          correctly personalises for E-Commerce/Restaurants vs Trading/Manufacturing/Services. */}
      <AccountsTeamOnboarding
        isOpen={showAccountsTeamOnboarding}
        onComplete={() => {
          setShowAccountsTeamOnboarding(false);
          setOnboardingProgress(prev => ({ ...prev, stoCompleted: true }));
          setActiveReportService('finance');
          setReportInitialModule(null);
          setShowReports(true);
        }}
        clientName={`${userInfo.firstName} ${userInfo.lastName}`}
        companyName={userInfo.companyName}
        selectedPlan={onboardingProgress.selectedPlan}
        businessType={effectiveBusinessTypeOnboardingLabel}
        revenueRange={userInfo.revenueRange}
        onIncidentCreated={handleOnboardingIncidentCreated}
      />

      {/* "You're all set!" Completion Modal — URL-first service routing */}
      <PostPaymentCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        selectedPlan={onboardingProgress.selectedPlan}
        businessType={
          effectiveService === 'Accounts & Taxation'
            ? 'finance'
            : (effectiveBusinessType === 'leadgen' ? 'leadgen' : 'ecommerce')
        }
        headline="You're all set!"
        ctaLabel="Go to Dashboard"
      />
    </>
  );

  const addSystemMessage = (content: string, component?: string, buttons?: ActionButton[], data?: any, businessModel?: 'ecommerce' | 'leadgen', dashboardResponse?: StructuredResponse) => {
    setIsTyping(true);
    // Cancel any previous pending message timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // Capture mode/channel/thread at enqueue time — by the time setTimeout fires
    // the user may have switched modes or threads, but the reply belongs to
    // where it was spawned.
    const modeAtEnqueue = prevChatModeRef.current;
    const channelAtEnqueue = activeChannel;
    const threadAtEnqueue = activeThreadIdRef.current;
    // Thread-scope the typing indicator — if the user jumps to another thread
    // we hide the spinner in the destination rather than leaking it there.
    if (modeAtEnqueue === 'ai') setTypingThreadId(threadAtEnqueue);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
      const inTeamMode = modeAtEnqueue === 'team';
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content,
        timestamp: new Date(),
        buttons,
        component: component as any,
        data,
        businessModel,
        dashboardResponse,
        channel: inTeamMode && component !== 'mode-switch' ? channelAtEnqueue : undefined,
        from: inTeamMode ? 'team' : undefined,
        threadId: !inTeamMode && component !== 'mode-switch' ? (threadAtEnqueue ?? undefined) : undefined,
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      setTypingThreadId(null);
      // Bump the thread's updatedAt so it sorts to the top of Recents.
      if (!inTeamMode && threadAtEnqueue) {
        setThreads((prev) => prev.map((t) =>
          t.id === threadAtEnqueue ? { ...t, updatedAt: Date.now() } : t
        ));
      }
      // Bump unread for the inactive team channel (if message landed somewhere
      // the user isn't currently looking — defensive; most flows enqueue to the
      // active channel, so this is a no-op in practice).
      if (inTeamMode && channelAtEnqueue !== activeChannel) {
        setChannelUnread((prev) => ({
          ...prev,
          [channelAtEnqueue]: (prev[channelAtEnqueue] ?? 0) + 1,
        }));
      }
    }, 600);
  };

  const addUserMessage = (content: string): string => {
    // prevChatModeRef is updated synchronously by switchChatMode, so it's
    // the source of truth when @mentions force an AI→team switch mid-send.
    const inTeamMode = prevChatModeRef.current === 'team';
    const id = Date.now().toString();
    const threadForMessage = !inTeamMode ? activeThreadIdRef.current ?? undefined : undefined;
    const newMessage: Message = {
      id,
      type: 'user',
      content,
      timestamp: new Date(),
      channel: inTeamMode ? activeChannel : undefined,
      from: inTeamMode ? 'user' : undefined,
      threadId: threadForMessage,
    };
    setMessages(prev => [...prev, newMessage]);
    // Bump thread updatedAt so the active thread reorders to the top.
    if (threadForMessage) {
      setThreads((prev) => prev.map((t) =>
        t.id === threadForMessage ? { ...t, updatedAt: Date.now() } : t
      ));
    }
    return id;
  };

  // ── Thread lifecycle ──────────────────────────────────────────────────
  // Keep a ref synced with activeThreadId so message helpers (which may
  // fire inside setTimeout) read the committed thread without waiting for
  // React to re-render.
  const activeThreadIdRef = useRef<string | null>(activeThreadId);
  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  /**
   * Ensure there is an active AI-mode thread. If none, create one using the
   * given prompt as title and commit the id synchronously (via ref). Returns
   * the threadId the caller should use.
   */
  const ensureActiveThread = (firstPrompt: string): string => {
    if (activeThreadIdRef.current) return activeThreadIdRef.current;
    const now = Date.now();
    const id = `t-${now}-${Math.random().toString(36).slice(2, 8)}`;
    const title = formatThreadTitle(firstPrompt);
    const newThread: ChatThread = { id, title, createdAt: now, updatedAt: now };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    activeThreadIdRef.current = id;
    return id;
  };

  /** Start a fresh conversation. Preserves all prior threads in Recents. */
  const startNewChat = () => {
    // Cancel any in-flight AI reply — it would land in the (now empty) new
    // thread unexpectedly. The prior thread keeps whatever it has so far.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
    setTypingThreadId(null);
    setActiveThreadId(null);
    activeThreadIdRef.current = null;
    setInputValue('');
    setIsFirstLoad(true); // re-shows the welcome + PromptSuggestions
    setPendingDeleteThreadId(null);
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  /** Switch the main pane to a previously-started thread. */
  const selectThread = (id: string) => {
    if (activeThreadIdRef.current === id) return;
    setActiveThreadId(id);
    activeThreadIdRef.current = id;
    setIsFirstLoad(false);
    setPendingDeleteThreadId(null);
    // If there's a pending AI reply in another thread, let it finish there —
    // don't cancel, but hide the typing indicator from this thread's view
    // (the typingThreadId gate in the render handles that).
  };

  /**
   * Delete a thread: remove its messages, drop the metadata entry, and if
   * it was active, fall back to the empty welcome state. Called from the
   * sidebar hover-confirm UI.
   */
  const deleteThread = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.threadId !== id));
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setPendingDeleteThreadId(null);
    if (activeThreadIdRef.current === id) {
      // If an AI reply was in flight for the deleted thread, drop it.
      if (typingTimeoutRef.current && typingThreadId === id) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
        setIsTyping(false);
        setTypingThreadId(null);
      }
      setActiveThreadId(null);
      activeThreadIdRef.current = null;
      setIsFirstLoad(true);
    }
  };

  // If showing reports, render the Reports component.
  // IMPORTANT: This must come AFTER all hooks.
  //
  // ── Principal Designer rationale ──
  // Source-of-truth for "can we render this dashboard?" is the
  // **active business account's service + businessType**, not diagnosticData.
  // diagnosticData is only fully populated when the user walks through the
  // onboarding form — but most sessions arrive via the account switcher,
  // which bypasses the form entirely.
  //
  // Previously this guard silently dropped CTA clicks on the floor
  // (showReports=true but neither branch rendered → blank screen). Now we
  // (1) treat any existing account as sufficient diagnostic signal,
  // (2) trust the CTA's declared activeReportService, and
  // (3) safely downgrade to whatever we CAN render so the click never
  //     lands on a blank screen.
  if (showReports) {
    const activeAcctForReports = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];

    // Per-service availability: aggregated across the full account list, so a
    // user with one marketing + one finance account gets the service switcher.
    // diagnosticData is a secondary signal — useful when the user is mid-
    // onboarding on a fresh account before the account itself is saved.
    const hasMarketingAccount = businessAccounts.some(a => a.service === 'Performance Marketing');
    const hasFinanceAccount = businessAccounts.some(a => a.service === 'Accounts & Taxation');
    const canRenderMarketing = hasMarketingAccount || !!diagnosticData.businessModel;
    const canRenderFinance = hasFinanceAccount || !!diagnosticData.accountingSoftware;
    const hasBothServices = canRenderMarketing && canRenderFinance;

    // Trust the CTA-declared service; fall back to the active account's
    // service if the state is somehow stale, then hard-downgrade if the
    // requested service has no data behind it. The invariant: if showReports
    // is true, **something** always renders.
    const activeAcctService: 'marketing' | 'finance' =
      activeAcctForReports?.service === 'Accounts & Taxation' ? 'finance' : 'marketing';
    const requestedService: 'marketing' | 'finance' = activeReportService || activeAcctService;
    const resolvedService: 'marketing' | 'finance' =
      requestedService === 'finance'
        ? (canRenderFinance ? 'finance' : 'marketing')
        : (canRenderMarketing ? 'marketing' : 'finance');

    const showMarketingReports = resolvedService === 'marketing' && canRenderMarketing;
    const showFinanceReports = resolvedService === 'finance' && canRenderFinance;

    // PerformanceReports requires a non-nullable businessModel. Prefer
    // diagnosticData (explicit user answer), fall back to the active account's
    // businessType, default to 'ecommerce' as the most common shape.
    const resolvedBusinessModel: 'ecommerce' | 'leadgen' =
      diagnosticData.businessModel === 'leadgen' || diagnosticData.businessModel === 'ecommerce'
        ? diagnosticData.businessModel
        : (activeAcctForReports?.businessType === 'leadgen' ? 'leadgen' : 'ecommerce');

    // Legacy aliases — some downstream code still reads these names.
    const hasPerformanceDiagnostic = canRenderMarketing;
    const hasFinanceDiagnostic = canRenderFinance;
    void hasPerformanceDiagnostic; void hasFinanceDiagnostic;

    if (showMarketingReports) {
      // Performance Marketing Reports
      return (
        <div
          key="marketing-reports"
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fff' }}
        >
          <PerformanceReports
            userInfo={userInfo}
            businessModel={resolvedBusinessModel}
            onBack={() => { setShowReports(false); setReportInitialModule(null); }}
            initialModule={reportInitialModule as any}
            onServiceSwitch={(service) => setActiveReportService(service)}
            hasBothServices={hasBothServices}
            currentService="marketing"
            onboardingProgress={onboardingProgress}
            onOnboardingProgressChange={setOnboardingProgress}
            onAddBusiness={() => setShowAddBusinessPlanModal(true)}
            onActivateCrossSell={handleActivateCrossSell}
            businessAccounts={businessAccounts}
            activeAccountId={activeAccountId}
            onSwitchAccount={(account) => switchBusinessAccount(account)}
            onDeleteAccount={(accountId) => deleteBusinessAccount(accountId)}
            notificationCounts={notificationCounts}
            onProfileSettings={() => { setShowReports(false); setShowProfileSettings(true); }}
            onInviteTeam={() => { setShowReports(false); setProfileSettingsInvite(true); setShowProfileSettings(true); }}
            showSettingUp={showSettingUp}
            onUpgradeFlowTrigger={() => { setUpgradeResumeMode(false); setShowUpgradeFlow(true); }}
            onContinueSetup={() => { setUpgradeResumeMode(true); setShowUpgradeFlow(true); }}
          />
          {renderGlobalModals()}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'Manrope, sans-serif',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(229,231,235,0.6)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              },
              actionButtonStyle: {
                background: '#2563eb', color: '#fff', borderRadius: '8px',
                fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '12px', padding: '4px 12px',
              },
            }}
          />
        </div>
      );
    }

    if (showFinanceReports) {
      // Accounts & Taxation Reports
      return (
        <div
          key="finance-reports"
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fff' }}
        >
          <AccountsReports
            onClose={() => { setShowReports(false); setReportInitialModule(null); }}
            initialModule={reportInitialModule as any}
            diagnosticData={diagnosticData}
            onServiceSwitch={(service) => setActiveReportService(service)}
            hasBothServices={hasBothServices}
            currentService="finance"
            onboardingProgress={onboardingProgress}
            onOnboardingProgressChange={setOnboardingProgress}
            onAddBusiness={() => setShowAddBusinessPlanModal(true)}
            onActivateCrossSell={handleActivateCrossSell}
            businessAccounts={businessAccounts}
            activeAccountId={activeAccountId}
            onSwitchAccount={(account) => switchBusinessAccount(account)}
            onDeleteAccount={(accountId) => deleteBusinessAccount(accountId)}
            notificationCounts={notificationCounts}
            onProfileSettings={() => { setShowReports(false); setShowProfileSettings(true); }}
            onInviteTeam={() => { setShowReports(false); setProfileSettingsInvite(true); setShowProfileSettings(true); }}
            userInfo={userInfo}
            showSettingUp={showSettingUp}
            onUpgradeFlowTrigger={() => { setUpgradeResumeMode(false); setShowUpgradeFlow(true); }}
            onContinueSetup={() => { setUpgradeResumeMode(true); setShowUpgradeFlow(true); }}
          />
          {renderGlobalModals()}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'Manrope, sans-serif',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(229,231,235,0.6)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              },
              actionButtonStyle: {
                background: '#2563eb', color: '#fff', borderRadius: '8px',
                fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '12px', padding: '4px 12px',
              },
            }}
          />
        </div>
      );
    }
  }

  // If showing Dataroom
  if (showDataroom) {
    return (
      <div
        key="dataroom"
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fff' }}
      >
        <Dataroom
          userInfo={userInfo}
          onBack={() => { setShowDataroom(false); setDataroomInitialFolderId(null); setDataroomInitialService(undefined); }}
          onNavigateToChat={() => { setShowDataroom(false); setDataroomInitialFolderId(null); setDataroomInitialService(undefined); }}
          onNavigateToWorkspace={() => {
            setShowDataroom(false); setDataroomInitialFolderId(null); setDataroomInitialService(undefined);
            setShowWorkspace(true);
          }}
          onProfileSettings={() => { setShowDataroom(false); setDataroomInitialFolderId(null); setDataroomInitialService(undefined); setShowProfileSettings(true); }}
          onInviteTeam={() => { setShowDataroom(false); setDataroomInitialFolderId(null); setDataroomInitialService(undefined); setProfileSettingsInvite(true); setShowProfileSettings(true); }}
          onAddBusiness={() => setShowAddBusinessPlanModal(true)}
          businessTypeLabel={businessAccounts.find(a => a.id === activeAccountId)?.businessTypeLabel}
          businessAccounts={businessAccounts}
          activeAccountId={activeAccountId}
          onSwitchAccount={(account) => switchBusinessAccount(account)}
          onDeleteAccount={(accountId) => deleteBusinessAccount(accountId)}
          notificationCounts={notificationCounts}
          initialFolderId={dataroomInitialFolderId}
          initialService={dataroomInitialService}
        />
        {renderGlobalModals()}
      </div>
    );
  }

  // If showing Workspace
  if (showWorkspace) {
    return (
      <div
        key="workspace"
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fff' }}
      >
      <Workspace
        userInfo={userInfo}
        onBack={() => { setShowWorkspace(false); setWorkspaceInitialModule(undefined); }}
        onNavigateToChat={(plan) => {
          setShowWorkspace(false);
          if (plan && plan.combinedPlan) {
            // Add media plan as a message in the conversation
            const mediaPlanMessage: Message = {
              id: Date.now().toString() + '-mediaplan',
              type: 'system',
              content: '',
              timestamp: new Date(),
              component: 'media-plan',
              mediaPlan: plan
            };
            
            const followUpMessage: Message = {
              id: Date.now().toString() + '-followup',
              type: 'system',
              content: `I've added your **${plan.month} ${plan.year} Media Plan** above. **@BregoTeam** will review your questions and respond soon.\n\nWhat would you like to discuss about this plan?`,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, mediaPlanMessage, followUpMessage]);
            
            // No auto-scroll — let user read naturally from top to bottom
          }
        }}
        onNavigateToReports={() => {
          setShowWorkspace(false);
          setShowReports(true);
        }}
        onNavigateToDataroom={() => {
          setShowWorkspace(false);
          setShowDataroom(true);
        }}
        onProfileSettings={() => { setShowWorkspace(false); setShowProfileSettings(true); }}
        onInviteTeam={() => { setShowWorkspace(false); setProfileSettingsInvite(true); setShowProfileSettings(true); }}
        onAddBusiness={() => setShowAddBusinessPlanModal(true)}
        businessTypeLabel={businessAccounts.find(a => a.id === activeAccountId)?.businessTypeLabel}
        businessAccounts={businessAccounts}
        activeAccountId={activeAccountId}
        onSwitchAccount={(account) => switchBusinessAccount(account)}
        onDeleteAccount={(accountId) => deleteBusinessAccount(accountId)}
        notificationCounts={notificationCounts}
        onboardingProgress={onboardingProgress}
        showSettingUp={showSettingUp}
        onUpgradeClick={() => { setUpgradeResumeMode(false); setShowUpgradeFlow(true); }}
        onContinueSetup={() => { setUpgradeResumeMode(true); setShowUpgradeFlow(true); }}
        serviceType={effectiveService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
        initialRaiseIncident={workspaceOpenIncident}
        initialIncidentService={workspaceIncidentService}
        onRaiseIncidentConsumed={() => { setWorkspaceOpenIncident(false); setWorkspaceIncidentService(''); }}
        chatIncidents={chatCreatedIncidents}
        initialModule={workspaceInitialModule}
      />
      {renderGlobalModals()}
      </div>
    );
  }

  // If showing Profile Settings
  if (showProfileSettings) {
    return (
      <ProfileSettings
        userInfo={userInfo}
        onClose={() => { setShowProfileSettings(false); setProfileSettingsInvite(false); }}
        onNavigate={(screen) => {
          setShowProfileSettings(false);
          setProfileSettingsInvite(false);
          if (screen === 'chat') {
            // Already on chat, just close settings
          } else if (screen === 'reports') {
            setShowReports(true);
          } else if (screen === 'workspace') {
            setShowWorkspace(true);
          } else if (screen === 'dataroom') {
            setShowDataroom(true);
          }
        }}
        initialSection={profileSettingsInvite ? 'users' : undefined}
        initialAutoInvite={profileSettingsInvite}
        businessAccounts={businessAccounts.map(a => ({ id: a.id, service: a.service }))}
      />
    );
  }

  const handleActionClick = (action: string, label?: string) => {
    // Disable first load flag on user interaction
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
    
    // Mark this action as clicked (skip for navigate, prompt, and dashboard actions — they should stay re-clickable)
    if (!action.startsWith('navigate-dataroom:') && !action.startsWith('prompt-') && !action.startsWith('open-dashboard') && !action.startsWith('open-dataroom') && action !== 'view-incident-workspace' && action !== 'view-task-workspace') {
      setClickedActions(prev => new Set(prev).add(action));
    }

    // Don't show user message for connection buttons, upload buttons, navigate actions, prompt chains, dashboard nav, or "Other" selections
    if (label && !action.startsWith('connect:') && !action.startsWith('upload-file:') && !action.startsWith('navigate-dataroom:') && !action.startsWith('prompt-') && !action.startsWith('open-dashboard') && !action.startsWith('open-dataroom') && action !== 'industry:other' && action !== 'finance-challenge:other' && action !== 'view-incident-workspace' && action !== 'view-task-workspace') {
      addUserMessage(label);
    }

    switch (action) {
      case 'select-service:Performance Marketing':
      case 'select-service:Accounts & Taxation':
      case 'select-service:Both Services':
        const service = action.split(':')[1] as 'Performance Marketing' | 'Accounts & Taxation' | 'Both Services';
        userInfo.selectedService = service;
        setTimeout(() => {
          // Branch based on selected service immediately - skip the chat intro with quick prompts
          if (service === 'Accounts & Taxation' || service === 'Both Services') {
            // Finance Flow - STEP 2: Finance Department Management
            addSystemMessage(
              "Great choice! Let's understand your finance setup.\n\nHow are you currently managing your Finance Department?",
              'diagnostic-question',
              [
                { label: 'In-house Team', action: 'finance-management:inhouse', variant: 'secondary' },
                { label: 'CA Firm / Freelancer', action: 'finance-management:ca-firm', variant: 'secondary' },
                { label: 'Managing Personally', action: 'finance-management:personally', variant: 'secondary' },
                { label: 'Not Managing at All', action: 'finance-management:not-managing', variant: 'secondary' }
              ]
            );
          } else {
            // Performance Marketing Flow - STEP 2: Industry
            addSystemMessage(
              "Perfect! Let's understand your business better.\n\nWhich industry do you operate in?",
              'diagnostic-question',
              [
                { label: 'E-Commerce', action: 'industry:ecommerce', variant: 'secondary' },
                { label: 'Healthcare / Wellness', action: 'industry:healthcare', variant: 'secondary' },
                { label: 'Education / EdTech', action: 'industry:education', variant: 'secondary' },
                { label: 'B2B Services', action: 'industry:b2b-services', variant: 'secondary' },
                { label: 'Real Estate', action: 'industry:real-estate', variant: 'secondary' },
                { label: 'Food & Beverage', action: 'industry:food-beverage', variant: 'secondary' },
                { label: 'Technology / SaaS', action: 'industry:technology', variant: 'secondary' },
                { label: 'Other', action: 'industry:other', variant: 'secondary' }
              ]
            );
          }
        }, 600);
        break;

      // FINANCE FLOW - STEP 2: Finance Management
      case 'finance-management:inhouse':
      case 'finance-management:ca-firm':
      case 'finance-management:personally':
      case 'finance-management:not-managing':
        const financeManagement = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, financeManagement }));
        setTimeout(() => {
          // STEP 3: Annual Revenue Range
          addSystemMessage(
            "Got it! Now, help us understand your business scale.\\n\\nWhat is your Annual Revenue Range?",
            'diagnostic-question',
            [
              { label: 'Below ₹1 Cr', action: 'revenue-range:below-1cr', variant: 'secondary' },
              { label: '₹1-5 Cr', action: 'revenue-range:1-5cr', variant: 'secondary' },
              { label: '₹5-20 Cr', action: 'revenue-range:5-20cr', variant: 'secondary' },
              { label: '₹20-50 Cr', action: 'revenue-range:20-50cr', variant: 'secondary' },
              { label: 'Above ₹50 Cr', action: 'revenue-range:above-50cr', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      // FINANCE FLOW - STEP 3: Revenue Range
      case 'revenue-range:below-1cr':
      case 'revenue-range:1-5cr':
      case 'revenue-range:5-20cr':
      case 'revenue-range:20-50cr':
      case 'revenue-range:above-50cr':
        const revenueRange = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, revenueRange }));
        setTimeout(() => {
          // STEP 4: Accounting Software
          addSystemMessage(
            "Perfect, Let's talk about your finance tools.\\n\\nWhich tool do you use to manage your accounts?",
            'diagnostic-question',
            [
              { label: 'QuickBooks', action: 'accounting-software:quickbooks', variant: 'secondary' },
              { label: 'Tally', action: 'accounting-software:tally', variant: 'secondary' },
              { label: 'Zoho Books', action: 'accounting-software:zoho', variant: 'secondary' },
              { label: 'Excel / Manual', action: 'accounting-software:excel', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      // FINANCE FLOW - STEP 4: Accounting Software (updated)
      case 'accounting-software:quickbooks':
      case 'accounting-software:tally':
      case 'accounting-software:zoho':
      case 'accounting-software:excel':
        const software = action.split(':')[1] as 'quickbooks' | 'tally' | 'zoho' | 'excel';
        setDiagnosticData(prev => ({ ...prev, accountingSoftware: software }));
        setTimeout(() => {
          // STEP 5: Challenges
          addSystemMessage(
            "Almost there! One last question.\\n\\nWhat challenges do you face with your current setup?",
            'diagnostic-question',
            [
              { label: 'Poor Financial Reporting', action: 'finance-challenge:poor-visibility', variant: 'secondary' },
              { label: 'Delayed Tax Compliances', action: 'finance-challenge:delayed-compliance', variant: 'secondary' },
              { label: 'Team Skill Gaps & Inefficiency', action: 'finance-challenge:skill-gaps', variant: 'secondary' },
              { label: 'Hiring & Training Challenges', action: 'finance-challenge:hiring-challenges', variant: 'secondary' },
              { label: 'Other', action: 'finance-challenge:other', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      // FINANCE FLOW - STEP 5: Challenges
      case 'finance-challenge:poor-visibility':
      case 'finance-challenge:delayed-compliance':
      case 'finance-challenge:skill-gaps':
      case 'finance-challenge:hiring-challenges':
        const challenge = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, financeChallenge: challenge }));
        setTimeout(() => {
          // End conversation with 3 action buttons
          addSystemMessage(
            "Thank you for sharing! We've captured all the details.\\n\\nWhat would you like to do next?",
            'diagnostic-question',
            [
              { label: 'Book Strategy Call', action: 'finance-action:book-call', variant: 'primary' },
              { label: 'View Sample Report', action: 'finance-action:sample-report', variant: 'secondary' },
              { label: 'Explore BregoGPT', action: 'finance-action:explore-ai', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      case 'finance-challenge:other':
        setShowOtherChallengeInput(true);
        break;

      case 'submit-other-challenge':
        if (otherChallengeValue.trim()) {
          addUserMessage(otherChallengeValue.trim());
          setDiagnosticData(prev => ({ ...prev, financeChallenge: otherChallengeValue.trim() }));
          setShowOtherChallengeInput(false);
          setOtherChallengeValue('');
          setTimeout(() => {
            // End conversation with 3 action buttons
            addSystemMessage(
              "Thank you for sharing! We've captured all the details.\\n\\nWhat would you like to do next?",
              'diagnostic-question',
              [
                { label: 'Book Strategy Call', action: 'finance-action:book-call', variant: 'primary' },
                { label: 'View Sample Report', action: 'finance-action:sample-report', variant: 'secondary' },
                { label: 'Explore BregoGPT', action: 'finance-action:explore-ai', variant: 'secondary' }
              ]
            );
          }, 600);
        }
        break;

      // Finance Final Actions
      case 'finance-action:book-call':
        addSystemMessage(
            "Great! I'll connect you with our finance experts.\n\n*This feature will redirect to a booking page.*",
        );
        break;

      case 'finance-action:sample-report':
        setIsGeneratingReport(true);
        setTimeout(() => {
          addSystemMessage(
            "🔍 **Analyzing your data...**\n\nGathering insights and preparing your finance diagnostic report.",
            undefined
          );
          
          // Simulate report generation
          setTimeout(() => {
            generateFinanceReport();
          }, 2000);
        }, 600);
        break;

      case 'finance-action:explore-ai':
        addSystemMessage(
          "Welcome to BregoGPT! Let me show you around.\n\nNavigate to AI workspace"
        );
        break;

      case 'switch-to-ai':
        switchChatMode('ai', 'button');
        addSystemMessage(
          "You're now chatting with **BregoGPT**. How can I help you?",
          undefined
        );
        break;

      case 'switch-to-team':
        switchChatMode('team', 'button');
        addSystemMessage(
          "You're now connected to the **Brego Team**. Send a message and a team member will respond shortly.",
          undefined
        );
        break;

      // STEP 2: Industry Selection Handler
      case 'industry:ecommerce':
      case 'industry:healthcare':
      case 'industry:education':
      case 'industry:b2b-services':
      case 'industry:real-estate':
      case 'industry:food-beverage':
      case 'industry:technology':
        const industry = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, industry }));
        setTimeout(() => {
          // STEP 3: Goals Selection
          addSystemMessage(
            "Great! Now let's talk goals.\n\nWhat's the primary objective you want to achieve with performance marketing?",
            'diagnostic-question',
            [
              { label: 'Increase Revenue / Sales', action: 'goal:increase-revenue', variant: 'secondary' },
              { label: 'Generate Leads', action: 'goal:generate-leads', variant: 'secondary' },
              { label: 'Improve ROAS', action: 'goal:improve-roas', variant: 'secondary' },
              { label: 'Lower CAC', action: 'goal:lower-cac', variant: 'secondary' },
              { label: 'Increase Brand Awareness', action: 'goal:brand-awareness', variant: 'secondary' },
              { label: 'Drive Website Traffic', action: 'goal:website-traffic', variant: 'secondary' },
              { label: 'Other', action: 'goal:other', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      case 'industry:other':
        // Show input field for custom industry
        setShowOtherIndustryInput(true);
        break;

      case 'submit-other-industry':
        // Handle custom industry submission
        if (otherIndustryValue.trim()) {
          setDiagnosticData(prev => ({ ...prev, industry: otherIndustryValue.trim() }));
          addUserMessage(otherIndustryValue.trim());
          setShowOtherIndustryInput(false);
          setOtherIndustryValue('');
          setTimeout(() => {
            // STEP 3: Goals Selection
            addSystemMessage(
              "Great! Now let's talk goals.\n\nWhat's the primary objective you want to achieve with performance marketing?",
              'diagnostic-question',
              [
                { label: 'Increase Revenue / Sales', action: 'goal:increase-revenue', variant: 'secondary' },
                { label: 'Generate Leads', action: 'goal:generate-leads', variant: 'secondary' },
                { label: 'Improve ROAS', action: 'goal:improve-roas', variant: 'secondary' },
                { label: 'Lower CAC', action: 'goal:lower-cac', variant: 'secondary' },
                { label: 'Increase Brand Awareness', action: 'goal:brand-awareness', variant: 'secondary' },
                { label: 'Drive Website Traffic', action: 'goal:website-traffic', variant: 'secondary' },
                { label: 'Other', action: 'goal:other', variant: 'secondary' }
              ]
            );
          }, 600);
        }
        break;

      // STEP 3: Goals Selection Handler
      case 'goal:increase-revenue':
      case 'goal:improve-roas':
      case 'goal:lower-cac':
      case 'goal:brand-awareness':
        // These goals route to E-Commerce flow
        const ecomGoal = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, goal: ecomGoal, businessModel: 'ecommerce' }));
        setTimeout(() => {
          // STEP 4: Ad Spend Question
          addSystemMessage(
            "How much are you spending on ads each month?\n\n*- Excluding GST*",
            'diagnostic-question',
            [
              { label: '₹1.5L - ₹2.5L', action: 'ad-spend:200000', variant: 'secondary' },
              { label: '₹2.5L - ₹3.5L', action: 'ad-spend:300000', variant: 'secondary' },
              { label: '₹3.5L - ₹4.5L', action: 'ad-spend:400000', variant: 'secondary' },
              { label: '₹4.5L - ₹5.5L', action: 'ad-spend:500000', variant: 'secondary' },
              { label: '₹5.5L+', action: 'ad-spend:600000', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      case 'goal:generate-leads':
      case 'goal:website-traffic':
      case 'goal:other':
        // These goals route to Lead Gen flow
        const leadGenGoal = action.split(':')[1];
        setDiagnosticData(prev => ({ ...prev, goal: leadGenGoal, businessModel: 'leadgen' }));
        setTimeout(() => {
          // STEP 4: Ad Spend Question
          addSystemMessage(
            "How much are you spending on ads each month?\n\n*- Excluding GST*",
            'diagnostic-question',
            [
              { label: '₹1.5L - ₹2.5L', action: 'ad-spend:200000', variant: 'secondary' },
              { label: '₹2.5L - ₹3.5L', action: 'ad-spend:300000', variant: 'secondary' },
              { label: '₹3.5L - ₹4.5L', action: 'ad-spend:400000', variant: 'secondary' },
              { label: '₹4.5L - ₹5.5L', action: 'ad-spend:500000', variant: 'secondary' },
              { label: '₹5.5L+', action: 'ad-spend:600000', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      case 'business-model:ecommerce':
      case 'business-model:leadgen':
        const model = action.split(':')[1] as 'ecommerce' | 'leadgen';
        setDiagnosticData(prev => ({ ...prev, businessModel: model }));
        setTimeout(() => {
          addSystemMessage(
            "How much are you spending on ads each month?\n\n*- Excluding GST*",
            'diagnostic-question',
            [
              { label: '₹1.5L - ₹2.5L', action: 'ad-spend:200000', variant: 'secondary' },
              { label: '₹2.5L - ₹3.5L', action: 'ad-spend:300000', variant: 'secondary' },
              { label: '₹3.5L - ₹4.5L', action: 'ad-spend:400000', variant: 'secondary' },
              { label: '₹4.5L - ₹5.5L', action: 'ad-spend:500000', variant: 'secondary' },
              { label: '₹5.5L+', action: 'ad-spend:600000', variant: 'secondary' }
            ]
          );
        }, 600);
        break;

      case 'ad-spend:200000':
      case 'ad-spend:300000':
      case 'ad-spend:400000':
      case 'ad-spend:500000':
      case 'ad-spend:600000':
        const spend = parseInt(action.split(':')[1]);
        setDiagnosticData(prev => ({ ...prev, adSpendRange: spend }));
        setTimeout(() => {
          addSystemMessage(
            "**Connect your ad accounts** (select all that apply):\n\n🔒 *We only request **view-only access**. Your data is encrypted and never shared. We analyze performance to give you actionable insights — nothing more.*",
            'diagnostic-question',
            [
              { label: 'Meta Ads', action: 'connect:metaAds', variant: 'secondary' },
              { label: 'Google Ads', action: 'connect:googleAds', variant: 'secondary' },
              { label: 'LinkedIn Ads', action: 'connect:linkedinAds', variant: 'secondary' },
              { label: 'Shopify', action: 'connect:shopify', variant: 'secondary' },
              { label: 'GA4', action: 'connect:ga4', variant: 'secondary' },
              { label: 'Continue to Analysis', action: 'generate-report', variant: 'primary' }
            ]
          );
        }, 600);
        break;

      case 'connect:metaAds':
      case 'connect:googleAds':
      case 'connect:linkedinAds':
      case 'connect:shopify':
      case 'connect:ga4':
        const platform = action.split(':')[1] as keyof DiagnosticData['connectedAccounts'];
        setDiagnosticData(prev => ({
          ...prev,
          connectedAccounts: {
            ...prev.connectedAccounts!,
            [platform]: true
          }
        }));
        
        // Show feedback tooltip
        const platformLabels: Record<string, string> = {
          metaAds: 'Meta Ads',
          googleAds: 'Google Ads',
          linkedinAds: 'LinkedIn Ads',
          shopify: 'Shopify',
          ga4: 'GA4'
        };
        setConnectionFeedback(`${platformLabels[platform]} connected successfully`);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setConnectionFeedback('');
        }, 3000);
        break;

      case 'generate-report':
        setIsGeneratingReport(true);
        setTimeout(() => {
          addSystemMessage(
            "🔍 **Analyzing your data...**\n\nGathering insights and preparing your diagnostic report.",
            undefined
          );
          
          // Simulate report generation
          setTimeout(() => {
            generateDiagnosticReport();
          }, 2000);
        }, 600);
        break;

      // ── Dashboard Response follow-up actions ──
      case 'open-dashboard':
        setReportInitialModule(null);
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-campaigns':
        setReportInitialModule('campaigns');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-creatives':
        setReportInitialModule('campaigns');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-channels':
        // Deprecated label — no dedicated Channels module; kept for backwards-compat.
        // Lands on Marketing Overview, which is the honest cross-channel rollup.
        setReportInitialModule('overview');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-meta-ads':
        setReportInitialModule('meta-ads');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-google-ads':
        setReportInitialModule('google-ads');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-funnel':
        setReportInitialModule('website');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-sales':
        setReportInitialModule('sales');
        setActiveReportService('marketing');
        setShowReports(true);
        break;
      case 'open-dashboard-finance':
        setReportInitialModule(null);
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dashboard-finance-receivables':
        setReportInitialModule('receivables');
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dashboard-finance-expenses':
        setReportInitialModule('expenses');
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dashboard-finance-cashflow':
        setReportInitialModule('cashflow');
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dashboard-finance-profitloss':
        setReportInitialModule('profitloss');
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dashboard-finance-sales':
        setReportInitialModule('sales');
        setActiveReportService('finance');
        setShowReports(true);
        break;
      case 'open-dataroom-finance':
        setShowDataroom(true);
        break;
      // ── Follow-up prompt dispatch ──
      // Pattern: `handlePromptClick(label || <canonical>, <canonical>)`
      //   • arg 1 (display) — what the user clicked, shown in their bubble
      //     so the chat is WYSIWYG. Falls back to the canonical phrase for
      //     programmatic callers that don't pass a label.
      //   • arg 2 (matcher) — canonical phrase routed through the regex
      //     engine in DashboardDataEngine. Keeps responses deterministic
      //     regardless of how rich/specific the button label is.
      case 'prompt-declining-products': {
        const canonical = 'Show me products with declining sales';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-creatives': {
        const acct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = acct.service === 'Performance Marketing' && acct.businessType === 'leadgen'
          ? 'Which ad creatives are driving the most leads at the lowest CPL?'
          : 'Which ad creatives are driving the most revenue?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-channel-comparison': {
        const acct2 = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = acct2.service === 'Performance Marketing' && acct2.businessType === 'leadgen'
          ? 'Show me my LinkedIn vs Google Ads lead generation performance'
          : 'Show me my Meta vs Google Ads performance comparison';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-top-campaigns': {
        const acct3 = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = acct3.service === 'Performance Marketing' && acct3.businessType === 'leadgen'
          ? 'Show me my top performing campaigns by CPL'
          : 'Show me my top performing campaigns by ROAS';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-cac-trends': {
        const canonical = 'Analyze my customer acquisition cost trends';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-conversion-trends': {
        const canonical = 'Analyze my lead-to-opportunity conversion trends';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-sales-breakdown': {
        const canonical = 'Break down my sales revenue by channel — website, marketplace & in-store';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-overdue-invoices': {
        const canonical = 'Flag all overdue invoices and receivables that need immediate follow-up';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-compliance': {
        const canonical = 'What GST returns and compliance filings are due this month?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-dataroom': {
        const canonical = 'Pull my latest bank reconciliation reports from the Dataroom';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-pl-summary': {
        const canonical = 'Show me my P&L summary with gross margin trends for this quarter';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-receivables-aging': {
        const canonical = 'Show me my receivables aging — who owes me and for how long?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-expense-vs-revenue': {
        const canonical = 'Compare my operating expenses vs revenue growth over the last 6 months';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-cashflow': {
        const canonical = 'Show me my cash flow position and working capital health for this month';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-attention': {
        const canonical = 'What needs my immediate attention right now?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-weak-campaigns': {
        const canonical = 'Show me underperforming campaigns with low CTR and high CPM';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-working': {
        const canonical = "Show me what's working well right now";
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-conversion-rate': {
        const canonical = "What's my current conversion rate and AOV?";
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-roi': {
        const roiAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = roiAcct.service === 'Accounts & Taxation'
          ? (roiAcct.businessType === 'ecommerce-restaurants'
            ? 'Show me my profitability and channel-wise ROI'
            : 'Show me my profitability and margin trend')
          : (roiAcct.businessType === 'leadgen'
            ? 'Analyze my pipeline ROI and return on investment'
            : 'Analyze my marketing ROI and return on investment');
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-pause-campaigns': {
        const pauseAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = pauseAcct.service === 'Performance Marketing' && pauseAcct.businessType === 'leadgen'
          ? 'Which campaigns should I pause to stop bleeding budget?'
          : 'Which campaigns should I pause to stop wasting spend?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-scale-winners': {
        const scaleAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
        const canonical = scaleAcct.service === 'Performance Marketing' && scaleAcct.businessType === 'leadgen'
          ? 'Which winning campaigns should I scale to close my pipeline gap?'
          : 'Which winning campaigns should I scale to hit my ROAS target?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-collection-priority': {
        const canonical = 'Which overdue receivables should I chase first?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-margin-recovery': {
        const canonical = 'How do I recover my gross margin compression?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-cost-cuts': {
        const canonical = 'Where can I cut costs to return to profitability?';
        handlePromptClick(label || canonical, canonical);
        break;
      }
      case 'prompt-d2c-growth': {
        const canonical = 'How do I grow my D2C website channel further?';
        handlePromptClick(label || canonical, canonical);
        break;
      }

      case 'view-incident-workspace':
        setWorkspaceInitialModule('incidents');
        setShowWorkspace(true);
        break;

      case 'view-task-workspace':
        setWorkspaceInitialModule('tasks');
        setShowWorkspace(true);
        break;

      default:
        // Handle navigate-dataroom:folderId:service actions
        if (action.startsWith('navigate-dataroom:')) {
          const parts = action.split(':');
          const folderId = parts[1];
          const svc = parts[2] as 'accounts' | 'performance';
          if (folderId && svc) {
            navigateToDataroomFolder(folderId, svc);
          }
        }
        break;
    }
  };

  const generateDiagnosticReport = () => {
    const bModel = diagnosticData.businessModel as 'ecommerce' | 'leadgen';
    
    // Show complete report immediately after brief delay
    setTimeout(() => {
      // Single comprehensive report message with all sections
      addSystemMessage(
        '',
        'full-marketing-report',
        [
          { label: 'Book Strategy Call', action: 'book-call', variant: 'primary' },
          { label: 'Download Report', action: 'download-report', variant: 'secondary' },
          { label: 'Explore BregoGPT', action: 'explore-ai', variant: 'secondary' }
        ],
        undefined,
        bModel
      );
    }, 1000);
  };

  const generateFinanceReport = () => {
    // Show analyzing message first
    setTimeout(() => {
      addSystemMessage(
        "✅ **Analysis Complete**",
        undefined
      );
    }, 500);

    // Finance Health Score (Hero Section)
    setTimeout(() => {
      addSystemMessage(
        '',
        'finance-health-metrics'
      );
    }, 1200);

    // What Needs Fixing FIRST - Most Important Section
    setTimeout(() => {
      addSystemMessage(
        '',
        'what-needs-fixing'
      );
    }, 2000);

    // Cash Flow Trend
    setTimeout(() => {
      addSystemMessage(
        '',
        'cash-health-snapshot'
      );
    }, 2800);

    // Receivables & Payables
    setTimeout(() => {
      addSystemMessage(
        '',
        'receivables-payables'
      );
    }, 3600);

    // Compliance Status
    setTimeout(() => {
      addSystemMessage(
        '',
        'compliance-risk'
      );
    }, 4400);

    // Disclaimer Footer
    setTimeout(() => {
      addSystemMessage(
        '',
        'finance-warning-footer'
      );
    }, 5200);

    // Action Buttons
    setTimeout(() => {
      addSystemMessage(
        '',
        'action-buttons',
        [
          { label: 'Book Strategy Call', action: 'book-finance-call', variant: 'primary' },
          { label: 'Download Report PDF', action: 'download-finance-report', variant: 'secondary' },
          { label: 'Explore BregoGPT', action: 'explore-ai', variant: 'secondary' }
        ]
      );
    }, 5800);
  };

  // ── Chat Input @Mention System ──────────────────────────────────────────
  // Roster mirrors teamSeedMessages TEAM_AUTHORS — Tejas is COO (cross-service),
  // Zubear & Irshad own Accounts & Taxation, Chinmay owns Performance Marketing.
  // Each person gets a section tag matching their service so the dropdown reads
  // like a real org chart, not a flat list of "account managers".
  const CHAT_MENTION_OPTIONS = [
    { value: '@Bregoteam', label: 'Brego Team', description: 'Notify the entire Brego team', icon: Users, bgColor: '#ecfdf5', iconColor: '#059669', action: 'team' as const, section: 'Teams', badge: 'Team Chat', badgeStyle: 'text-emerald-700 bg-emerald-50' },
    { value: '@BregoGPT', label: 'BregoGPT', description: 'Switch to AI mode for instant analysis', icon: Sparkles, bgColor: '#EEF1FB', iconColor: '#204CC7', action: 'ai' as const, section: 'AI', badge: 'AI Mode', badgeStyle: 'text-[#204CC7] bg-[#EEF1FB]' },
    { value: '@task', label: 'Create Task', description: 'Assign a to-do to your team without leaving chat', icon: CheckSquare, bgColor: '#ECFDF5', iconColor: '#059669', action: 'task' as const, section: 'Actions', badge: 'Quick Action', badgeStyle: 'text-emerald-700 bg-emerald-50' },
    { value: '@incident', label: 'Raise Incident', description: 'Report an issue instantly from chat', icon: AlertTriangle, bgColor: '#FEF2F2', iconColor: '#DC2626', action: 'incident' as const, section: 'Actions', badge: 'Quick Action', badgeStyle: 'text-red-700 bg-red-50' },
    { value: '@tejas', label: 'Tejas Atha', description: 'Cross-service strategic input', icon: User, bgColor: '#fff7ed', iconColor: '#ea580c', action: 'team' as const, section: 'Leadership', badge: 'COO', badgeStyle: 'text-orange-700 bg-orange-50' },
    { value: '@zubear', label: 'Zubear Shaikh', description: 'GST, compliance & reconciliation', icon: User, bgColor: '#fdf4ff', iconColor: '#c026d3', action: 'team' as const, section: 'Accounts & Taxation', badge: 'Lead', badgeStyle: 'text-fuchsia-700 bg-fuchsia-50' },
    { value: '@irshad', label: 'Irshad Qureshi', description: 'Bookkeeping & reconciliation support', icon: User, bgColor: '#eff6ff', iconColor: '#2563eb', action: 'team' as const, section: 'Accounts & Taxation', badge: 'Specialist', badgeStyle: 'text-blue-700 bg-blue-50' },
    { value: '@chinmay', label: 'Chinmay Pawar', description: 'Paid ads strategy & optimization', icon: User, bgColor: '#f5f3ff', iconColor: '#7c3aed', action: 'team' as const, section: 'Performance Marketing', badge: 'Lead', badgeStyle: 'text-violet-700 bg-violet-50' },
  ];

  const filteredChatMentions = showChatMentionDropdown
    ? CHAT_MENTION_OPTIONS.filter(m =>
        m.value.toLowerCase().includes(`@${chatMentionQuery}`) ||
        m.label.toLowerCase().includes(chatMentionQuery)
      )
    : [];

  const handleChatMentionSelect = (mention: typeof CHAT_MENTION_OPTIONS[0]) => {
    // Inline the selected handle *into the input text itself* — this is the
    // whole point of the mention system. The handle survives send, shows up
    // inside the user's bubble as a styled pill via renderChatMentions, and
    // drives handleSend's team-mention detection regex. A separate
    // "showMentionTag" chip used to stash the handle off to the side, but
    // that chip never made it into the message, so mentions vanished on
    // send. Now the text the user sees in the composer is the text that
    // gets sent. A trailing space keeps their cursor positioned for the
    // rest of the sentence.
    const atIdx = inputValue.lastIndexOf('@');
    const before = atIdx >= 0 ? inputValue.slice(0, atIdx) : inputValue;
    const newVal = `${before}${mention.value} `;
    setInputValue(newVal);
    setShowChatMentionDropdown(false);
    setChatMentionQuery('');
    setChatMentionIdx(0);

    if (mention.action === 'task') {
      // Open the same AddTodoModal used by the Workspace Tasks module.
      // Roster + project chip mirror the active service so the modal feels
      // native to wherever the user triggered it from.
      const isFinance = effectiveService === 'Accounts & Taxation';
      setInlineChatTaskDepartment(isFinance ? 'at' : 'pm');
      setInlineChatTaskProject(isFinance ? 'Accounts & Taxation' : 'Performance Marketing');
      setShowInlineChatTask(true);
    } else if (mention.action === 'incident') {
      // Open inline incident form right in the chat — no navigation
      const derivedService: 'Performance Marketing' | 'Accounts & Taxation' =
        effectiveService === 'Accounts & Taxation'
          ? 'Accounts & Taxation'
          : 'Performance Marketing';
      setInlineChatIncidentService(derivedService);
      setShowInlineChatIncident(true);
    } else if (mention.action === 'team') {
      if (chatMode !== 'team') switchChatMode('team', '@mention');
    } else {
      if (chatMode !== 'ai') switchChatMode('ai', '@mention');
    }

    // Refocus
    setTimeout(() => chatInputRef.current?.focus(), 0);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Stop speech recognition if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Disable first load flag on user interaction
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }

    // Detect team mentions and auto-switch to team mode. Detection reads
    // the input text directly — the composer no longer stashes a "pending"
    // handle off to the side, so whatever the user sees is whatever gets
    // inspected, sent, and rendered.
    const hasMention = /@bregoteam/i.test(inputValue);
    const mentionedPeople = ['zubear', 'irshad', 'tejas', 'chinmay'].filter(n =>
      new RegExp(`@${n}\\b`, 'i').test(inputValue)
    );
    const hasTeamMention = hasMention || mentionedPeople.length > 0;
    if (hasTeamMention && chatMode !== 'team') {
      switchChatMode('team', '@mention');
    }
    
    const sentText = inputValue;
    // In AI mode, make sure there's an active thread so the message tags
    // correctly and Recents surfaces this as a conversation. Team-mode
    // messages skip the thread system — they live in channels.
    if (!hasTeamMention && chatMode === 'ai') {
      ensureActiveThread(sentText);
    }
    addUserMessage(sentText);
    setInputValue('');
    setShowChatMentionDropdown(false);

    if (chatMode === 'team' || hasTeamMention) {
      // Brego Team mode response — personalized if individual is tagged
      const personalized = mentionedPeople.length > 0
        ? `Your message has been sent to **${mentionedPeople.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & ')}** (Brego Team). They'll respond shortly — typically within a few minutes during business hours.\n\nIn the meantime, you can switch back to **BregoGPT** for instant AI-powered answers.`
        : null;
      setTimeout(() => {
        addSystemMessage(
          personalized || "Your message has been sent to the **Brego Team**. A team member will respond shortly — typically within a few minutes during business hours.\n\nIn the meantime, you can switch back to **BregoGPT** for instant AI-powered answers.",
          undefined,
          [
            { label: 'Switch to BregoGPT', action: 'switch-to-ai', variant: 'secondary' }
          ]
        );
      }, 600);
    } else {
      // BregoGPT AI mode response — try to match against Dashboard data
      const activeAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
      const dashResponse = matchPromptToResponse(
        inputValue,
        activeAcct.service,
        activeAcct.businessType,
        activeAcct.name
      );

      if (dashResponse) {
        // Set contextual thinking label & show typing immediately
        setDashboardThinkingLabel(getThinkingLabelForPrompt(inputValue));
        setIsTyping(true);
        // Data-driven response from Dashboard
        setTimeout(() => {
          setDashboardThinkingLabel(null);
          addSystemMessage(
            dashResponse.narrative,
            'dashboard-response',
            undefined,
            undefined,
            undefined,
            dashResponse
          );
        }, 1400); // Slightly longer delay for richer responses
      } else {
        setDashboardThinkingLabel(null);
        setIsTyping(true);
        // Generic fallback response
        setTimeout(() => {
          addSystemMessage(
            "I'm analyzing your request. For now, you can use the action buttons above or complete the health check to unlock all features!",
            undefined,
            [
              { label: 'Continue Health Check', action: 'start-health-check', variant: 'primary' }
            ]
          );
        }, 800);
      }
    }
  };

  /**
   * Triggers a prompt-driven response.
   *
   * ── Principal Designer rationale ──
   * `displayText` is what the user actually clicked (e.g. the polished
   * button label "Why is my CAC at ₹850 (31% above target)?") and shows
   * up in their chat bubble. `matcherText` is the canonical phrase we
   * feed into the regex-based matcher engine (e.g. "Analyze my customer
   * acquisition cost trends") — kept separate so buttons stay readable
   * AND matchers stay reliable.
   *
   * When only one arg is passed, the display text is also used as matcher
   * input (the typical case when users type their own prompt).
   */
  const handlePromptClick = (displayText: string, matcherText?: string) => {
    // Disable first load flag on user interaction
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }

    const queryForMatcher = matcherText ?? displayText;

    // Pre-filled prompts always run in AI mode. Make sure there's an
    // active thread so the message tags correctly and Recents shows it.
    // Use the display text for the thread title — that's what the user
    // will recognize in Recents.
    ensureActiveThread(displayText);
    addUserMessage(displayText);

    // Generate data-driven response from Dashboard — use the canonical
    // matcher phrase so we route to the right response regardless of
    // how polished the button label is.
    const activeAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
    const dashResponse = matchPromptToResponse(
      queryForMatcher,
      activeAcct.service,
      activeAcct.businessType,
      activeAcct.name
    );

    if (dashResponse) {
      setDashboardThinkingLabel(getThinkingLabelForPrompt(queryForMatcher));
      setIsTyping(true);
      setTimeout(() => {
        setDashboardThinkingLabel(null);
        addSystemMessage(
          dashResponse.narrative,
          'dashboard-response',
          undefined,
          undefined,
          undefined,
          dashResponse
        );
      }, 1400);
    } else {
      setDashboardThinkingLabel(null);
      setIsTyping(true);
      setTimeout(() => {
        addSystemMessage(
          "I'm analyzing your request. For now, you can use the action buttons above or complete the health check to unlock all features!",
          undefined,
          [{ label: 'Continue Health Check', action: 'start-health-check', variant: 'primary' }]
        );
      }, 800);
    }
  };

  const content = (
    <div className="h-screen flex flex-col bg-[#f8f9fa]">
      {/* Top Navigation — Full-width, matching Dataroom */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center"><BregoLogo size={36} variant="full" /></div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: true },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: false, onClick: () => {
              // Source-of-truth: the active account's service. A user with any
              // business account has a valid dashboard to open — we should never
              // block the nav on diagnosticData alone (most accounts skip the
              // diagnostic form entirely via the switcher).
              const activeAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
              const hasAnyAccount = businessAccounts.length > 0;
              const hasPerformanceDiagnostic = businessAccounts.some(a => a.service === 'Performance Marketing') || !!diagnosticData.businessModel;
              const hasFinanceDiagnostic = businessAccounts.some(a => a.service === 'Accounts & Taxation') || !!diagnosticData.accountingSoftware;

              if (hasAnyAccount || hasPerformanceDiagnostic || hasFinanceDiagnostic) {
                // Align the report service to the active account so the Dashboard
                // opens on the service the user is actually using right now.
                if (activeAcct?.service === 'Accounts & Taxation') {
                  setActiveReportService('finance');
                } else if (activeAcct?.service === 'Performance Marketing') {
                  setActiveReportService('marketing');
                }
                setShowReports(true);
              } else {
                toast.info('Complete the onboarding first', {
                  description: 'Finish your diagnostic chat to unlock the Dashboard.',
                  duration: 3000,
                });
              }
            }},
            { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: false, onClick: () => setShowWorkspace(true) },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false, onClick: () => setShowDataroom(true) },
          ]} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell
            service={effectiveService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
            activeAccountId={activeAccountId}
            activeAccountName={businessAccounts.find(a => a.id === activeAccountId)?.name}
            accounts={businessAccounts.map(a => ({ id: a.id, name: a.name, service: a.service }))}
            onUnreadCountsChange={setNotificationCounts}
          />
          <ProfileDropdown 
            userInfo={userInfo} 
            onProfileSettingsClick={() => setShowProfileSettings(true)}
            onInviteTeamClick={() => {
              setProfileSettingsInvite(true);
              setShowProfileSettings(true);
            }}
            onAddBusiness={() => setShowAddBusinessPlanModal(true)}
            businessTypeLabel={businessAccounts.find(a => a.id === activeAccountId)?.businessTypeLabel}
            businessAccounts={businessAccounts}
            activeAccountId={activeAccountId}
            onSwitchAccount={(account) => switchBusinessAccount(account)}
            onDeleteAccount={(accountId) => deleteBusinessAccount(accountId)}
            notificationCounts={notificationCounts}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar — swaps between BregoGPT (AI) and Brego Team (channels) */}
      <div className="w-64 sidebar-glass flex flex-col">
        <AnimatePresence mode="wait">
          {chatMode === 'team' ? (
            <motion.div
              key="team-sidebar"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TeamChatSidebar
                activeChannel={activeChannel}
                onChannelSelect={(ch) => {
                  setActiveChannel(ch);
                  setChannelUnread((prev) => ({ ...prev, [ch]: 0 }));
                  // Clicking a channel always exits any open tab view — the
                  // channel and tab views compete for the main area, and the
                  // user's intent when tapping a channel is unambiguously
                  // "take me to that channel".
                  setTeamView('channel');
                  // A thread belongs to a specific channel. Switching
                  // channels orphans the thread visually, so close the pane
                  // — the user can always re-open from the summary strip.
                  setActiveThreadRootId(null);
                }}
                channelUnread={channelUnread}
                teamStatus={teamStatus}
                onExitTeamMode={() => switchChatMode('ai', 'sidebar-header')}
                onMentionTeammate={(handle) => {
                  // Prefill @mention in the input so the user can add a note
                  setInputValue((prev) => {
                    const prefix = prev && !prev.endsWith(' ') ? `${prev} ` : prev;
                    return `${prefix}@${handle} `;
                  });
                  chatInputRef.current?.focus();
                }}
                onInviteTeammates={() => {
                  // Route through the exact same path the Profile dropdown,
                  // Reports, Dataroom, and Workspace "Invite Team" CTAs use —
                  // opens ProfileSettings on the Users section with the
                  // canonical Invite modal auto-opened on top. One invite
                  // surface across the whole app means users learn the flow
                  // once. On close, they land back on the Users list (so they
                  // can verify the pending invite), and closing settings
                  // returns them here to team chat. `setShowWorkspace`/etc.
                  // aren't needed because we're already in the chat surface.
                  setProfileSettingsInvite(true);
                  setShowProfileSettings(true);
                }}
                activeView={teamView}
                onViewChange={(next) => {
                  setTeamView(next);
                  // Tab takeovers (Threads / Starred / Media) replace the
                  // main channel area — a lingering ThreadPane on the side
                  // would look orphaned. Close it so the pane's state stays
                  // truthful: it only exists while a channel transcript is
                  // actually visible on the left.
                  if (next !== 'channel') setActiveThreadRootId(null);
                }}
                tabCounts={teamTabCounts}
              />
            </motion.div>
          ) : (
            <motion.div
              key="ai-sidebar"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* New Chat — pinned at the top, Claude pattern. Always
                   clickable: in the worst case it's a gentle no-op that
                   refocuses the composer, which still feels right. */}
              <div className="px-3 pt-3 pb-2">
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-50 border border-gray-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all"
                  title="Start a new conversation"
                >
                  <SquarePen className="w-[15px] h-[15px]" strokeWidth={2} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>New chat</span>
                </button>
              </div>

              {/* Thread list — each entry is a full conversation. Clicking
                   an entry switches the main pane to that thread's messages.
                   No "Recents" header; the per-group date labels (Today /
                   Yesterday / …) are sufficient structure on their own. */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2">
                {threads.length === 0 ? (
                  <div className="px-2 py-6 text-center">
                    <MessageSquare className="w-4 h-4 text-gray-300 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>No conversations yet</p>
                    <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
                      Ask BregoGPT anything, or switch to <span className="text-emerald-600 font-medium">Brego Team</span> to chat with a human.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedThreads.map((group) => (
                      <div key={group.label} className="space-y-0.5">
                        <div
                          className="px-1.5 py-1 text-gray-400 uppercase tracking-wider"
                          style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}
                        >
                          {group.label}
                        </div>
                        {group.items.map((thread) => {
                          const isActive = thread.id === activeThreadId;
                          const isPendingDelete = thread.id === pendingDeleteThreadId;
                          return (
                            <div
                              key={thread.id}
                              className={`relative group rounded-md transition-colors ${
                                isActive
                                  ? 'bg-brand/10 text-brand'
                                  : 'text-gray-700 hover:bg-gray-100/80'
                              }`}
                            >
                              <button
                                onClick={() => selectThread(thread.id)}
                                className="w-full flex items-start gap-2 px-2 py-1.5 text-left pr-8"
                                title={`${thread.title}\nLast activity · ${formatDataAsOf(new Date(thread.updatedAt))}`}
                              >
                                <MessageSquare
                                  className={`w-[13px] h-[13px] flex-shrink-0 mt-[3px] ${
                                    isActive ? 'text-brand' : 'text-gray-400'
                                  }`}
                                  strokeWidth={isActive ? 2.2 : 2}
                                />
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`truncate ${
                                      isActive ? 'text-brand' : 'text-gray-800'
                                    }`}
                                    style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}
                                  >
                                    {thread.title}
                                  </div>
                                  {/* Relative-time subtitle — cheap temporal
                                       anchor without crowding the label. */}
                                  <div
                                    className={`truncate mt-0.5 ${
                                      isActive ? 'text-brand/70' : 'text-gray-400'
                                    }`}
                                    style={{ fontSize: '11px', fontWeight: 500 }}
                                  >
                                    {formatRelativeShort(thread.updatedAt)}
                                  </div>
                                </div>
                              </button>
                              {/* Hover-reveal delete, with a two-click confirm
                                   so an accidental click never nukes history. */}
                              {isPendingDelete ? (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteThread(thread.id);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    style={{ fontSize: '10px', fontWeight: 700 }}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPendingDeleteThreadId(null);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    style={{ fontSize: '10px', fontWeight: 600 }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingDeleteThreadId(thread.id);
                                  }}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 text-gray-400 transition-all"
                                  title="Delete conversation"
                                  aria-label="Delete conversation"
                                >
                                  <Trash2 className="w-[13px] h-[13px]" strokeWidth={2} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trial / Onboarding Status — lives below either sidebar variant */}
        <div className="p-4 border-t border-gray-200/40">
          <SidebarStatusCard
            onboardingProgress={(showSettingUp || onboardingProgress.isUpgraded) ? onboardingProgress : { ...onboardingProgress, isUpgraded: false }}
            onUpgradeClick={() => { setUpgradeResumeMode(false); setShowUpgradeFlow(true); }}
            onContinueOnboarding={() => { setUpgradeResumeMode(true); setShowUpgradeFlow(true); }}
            serviceType={effectiveService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
          />
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">

        {/* Account Switch Transition Overlay */}
        <AnimatePresence>
          {accountSwitching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-xl border border-gray-200/60"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-brand/20 border-t-brand rounded-full"
                />
                <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>Switching workspace...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team tab takeovers — Threads / Starred / Media, docs & links.
            These replace the channel header + transcript + composer while
            active. Tapping a row calls handleJumpToTeamMessage, which flips
            teamView back to 'channel' and scrolls to the message. */}
        {chatMode === 'team' && teamView === 'threads' && (
          <TeamThreadsView
            messages={teamChannelMessages}
            onJumpToMessage={handleJumpToTeamMessage}
            onOpenThread={(rootId, channel) => {
              // Jump back to the channel transcript, scroll to the root
              // (so context is visible behind the pane), then open the
              // pane itself. Order matters: setTeamView('channel') first
              // so the channel mounts before ThreadPane looks it up.
              setActiveChannel(channel);
              setChannelUnread((prev) => ({ ...prev, [channel]: 0 }));
              setTeamView('channel');
              setActiveThreadRootId(rootId);
              // Next tick so the channel transcript has rendered before
              // we try to scroll the root into view.
              setTimeout(() => scrollToMessage(rootId), 60);
            }}
          />
        )}
        {chatMode === 'team' && teamView === 'starred' && (
          <TeamStarredView
            messages={teamChannelMessages}
            bookmarkedMessageIds={bookmarkedMessageIds}
            onToggleBookmark={handleToggleBookmark}
            onJumpToMessage={handleJumpToTeamMessage}
          />
        )}
        {chatMode === 'team' && teamView === 'media' && (
          <TeamMediaView
            messages={teamChannelMessages}
            onJumpToMessage={handleJumpToTeamMessage}
          />
        )}

        {/* Channel Header — only visible in Brego Team + channel view.
            Tab-view takeovers render their own in-view headers. */}
        {chatMode === 'team' && teamView === 'channel' && (() => {
          const channelMeta = getChannelMeta(activeChannel);
          return (
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {activeChannel === 'announcements' ? (
                    <Megaphone className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Hash className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-gray-900 truncate" style={{ fontSize: '15px', fontWeight: 600 }}>
                    #{channelMeta.label}
                  </h2>
                  <p className="text-gray-500 truncate" style={{ fontSize: '12px' }}>
                    {channelMeta.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Channel members — compact avatar stack + hover roster.
                    The "who's in this channel?" answer belongs right next
                    to presence; together they give a complete snapshot of
                    the room without opening a sidebar. Brego team is
                    service-scoped so users only see the specialists they
                    actually work with. */}
                <ChannelMembersBadge
                  myTeam={MY_TEAM_ROSTER}
                  bregoTeam={BREGO_CHANNEL_TEAM}
                  onInvite={() => {
                    setProfileSettingsInvite(true);
                    setShowProfileSettings(true);
                  }}
                />
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                  teamStatus.status === 'online' ? 'bg-green-50 text-green-700' :
                  teamStatus.status === 'away' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    teamStatus.status === 'online' ? 'bg-green-500' :
                    teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                  }`} />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{teamStatus.label}</span>
                </div>
                {/* Huddle lives inside the team channel header — it's a
                    team-chat concept, not a global app action, so it
                    belongs alongside the channel's team-status pill
                    rather than in the top-bar chrome. */}
                <HuddleButton
                  onClick={() => setShowHuddle(true)}
                  isActive={showHuddle}
                  teamStatus={teamStatus}
                  scheduledCount={scheduledCallsCount}
                />
              </div>
            </div>
          );
        })()}

        {/* Messages Area + Input Area — suppressed when a team tab view
            takes over so the user isn't looking at two competing main
            panels. Both subtrees still mount for AI mode and for team
            mode's default channel view. */}
        {!(chatMode === 'team' && teamView !== 'channel') && (<>
        {/* Messages Area */}
        <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto bg-gray-50 scroll-smooth" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 28px, black calc(100% - 28px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 28px, black calc(100% - 28px), transparent 100%)' }}>
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="space-y-4">
              {/* Empty-channel welcome placeholder (team mode only) */}
              {chatMode === 'team' && visibleMessages.length === 0 && (
                <div className="py-8 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mx-auto mb-4">
                    {activeChannel === 'announcements' ? (
                      <Megaphone className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Hash className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
                    )}
                  </div>
                  <h3 className="text-gray-900 mb-1.5" style={{ fontSize: '16px', fontWeight: 600 }}>
                    Welcome to #{getChannelMeta(activeChannel).label}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed" style={{ fontSize: '13px' }}>
                    {activeChannel === 'announcements'
                      ? 'Product updates, release notes and important announcements from the Brego team will appear here.'
                      : 'This is the start of your conversation with the Brego Team. Share context, ask questions, and loop in specific teammates with @.'}
                  </p>
                </div>
              )}
              {/* Per-mode message list: Discussions / Announcements split is enforced
                  via the `channel` tag on each team message, so the two channels live
                  as independent threads over a single `messages` array. */}
              {visibleMessages.map((message, idx) => {
                // Day separator logic — show a divider before a message if
                // it's the very first one or if its calendar day differs
                // from the previous visible message. Mode-switch separators
                // already do their own visual break so we skip them.
                const prev = idx > 0 ? visibleMessages[idx - 1] : null;
                const showDayDivider =
                  message.component !== 'mode-switch' &&
                  (!prev || !isSameDay(prev.timestamp, message.timestamp));
                return (
                  <div key={message.id}>
                    {showDayDivider && (
                      <div className="flex items-center gap-3 py-3 select-none">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
                        <span
                          className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200/60"
                          style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' }}
                        >
                          {formatDaySeparator(message.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
                      </div>
                    )}
                    <motion.div
                      id={`msg-${message.id}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: idx < 3 ? idx * 0.12 : 0,
                      }}
                      className="transition-all duration-300"
                    >
                      <MessageBubble
                        message={message}
                        onActionClick={handleActionClick}
                        clickedActions={clickedActions}
                        diagnosticData={diagnosticData}
                        connectionFeedback={connectionFeedback}
                        showOtherIndustryInput={showOtherIndustryInput}
                        otherIndustryValue={otherIndustryValue}
                        setOtherIndustryValue={setOtherIndustryValue}
                        showOtherChallengeInput={showOtherChallengeInput}
                        otherChallengeValue={otherChallengeValue}
                        setOtherChallengeValue={setOtherChallengeValue}
                        bookmarkedMessageIds={bookmarkedMessageIds}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleReaction={handleToggleReaction}
                        navigateToDataroomFolder={navigateToDataroomFolder}
                        threadReplies={threadRepliesByParent.get(message.id)}
                        onOpenThread={handleOpenThread}
                        activeThreadRootId={activeThreadRootId}
                        onCreateTaskFromMessage={handleCreateTaskFromMessage}
                        onCreateIncidentFromMessage={handleCreateIncidentFromMessage}
                      />
                    </motion.div>
                  </div>
                );
              })}
              
              {/* Pre-filled Prompt Suggestions — account-aware, shows only for intro state.
                  Service+businessType are URL-first (scoped dashboard routes) with the
                  active account as fallback. This guarantees the Accounts & Taxation
                  prompt set loads when the URL says so, even if the active account's
                  metadata drifted. */}
              {chatMode === 'ai' && activeThreadId === null && !isTyping && (() => {
                const activeAcct = businessAccounts.find(a => a.id === activeAccountId) || businessAccounts[0];
                // URL-first: when mounted under /[service]/[model]/dashboard/chat,
                // trust the URL slugs. Fall back to the active account when not scoped.
                const promptService: string = urlIsFinance
                  ? 'Accounts & Taxation'
                  : urlIsMarketing
                  ? 'Performance Marketing'
                  : activeAcct.service;
                const promptBusinessType: string = urlIsFinance
                  ? (urlModelSlug === 'trading-manufacturing' ? 'trading-manufacturing' : 'ecommerce-restaurants')
                  : urlIsMarketing
                  ? (urlModelSlug === 'lead-generation' ? 'leadgen' : 'ecommerce')
                  : activeAcct.businessType;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <PromptSuggestions
                      service={promptService}
                      businessType={promptBusinessType}
                      onPromptClick={handlePromptClick}
                    />
                  </motion.div>
                );
              })()}
              <AnimatePresence>
              {isTyping && (chatMode === 'team' || typingThreadId === activeThreadId) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    chatMode === 'ai' ? 'bg-brand' : 'bg-emerald-600'
                  }`}>
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {chatMode === 'ai' ? (
                        <Sparkles className="w-4 h-4 text-white" />
                      ) : (
                        <Headphones className="w-4 h-4 text-white" />
                      )}
                    </motion.div>
                  </div>
                  <div className={`rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] border ${
                    chatMode === 'team' ? 'bg-emerald-50/40 border-emerald-100/80' : 'bg-white/90 border-gray-100/60'
                  }`}>
                    <div className="flex flex-col gap-2.5">
                      {/* Cycling pulsing label */}
                      <div className="relative h-4 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={thinkingLabelIndex}
                            className={`absolute tracking-wide ${
                              chatMode === 'team' ? 'text-emerald-500' : 'text-gray-400'
                            }`}
                            style={{ fontSize: '13px', fontWeight: 500 }}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 0.25, ease: 'easeOut' } }}
                          >
                            {dashboardThinkingLabel || (chatMode === 'team' ? TEAM_THINKING_LABELS[thinkingLabelIndex] : AI_THINKING_LABELS[thinkingLabelIndex])}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      {/* Shimmer skeleton lines */}
                      <div className="flex items-center gap-2">
                        {chatMode === 'team' ? (
                          <>
                            <div className="relative overflow-hidden h-[5px] w-24 rounded-full bg-emerald-100/80">
                              <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
                            </div>
                            <div className="relative overflow-hidden h-[5px] w-16 rounded-full bg-emerald-100/80">
                              <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative overflow-hidden h-[5px] w-28 rounded-full bg-gray-100/80">
                              <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(32,76,199,0.15) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
                            </div>
                            <div className="relative overflow-hidden h-[5px] w-14 rounded-full bg-gray-100/80">
                              <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(32,76,199,0.15) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {chatMode === 'team' ? (
                          <div className="relative overflow-hidden h-[5px] w-20 rounded-full bg-emerald-100/80">
                            <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }} />
                          </div>
                        ) : (
                          <div className="relative overflow-hidden h-[5px] w-20 rounded-full bg-gray-100/80">
                            <motion.div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(32,76,199,0.15) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </div>


        </div>

        {/* Input Area */}
        <div className="bg-transparent p-6">
          <div className="max-w-3xl mx-auto">
            <div className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border p-2 flex items-center gap-2 transition-all duration-300 ${
              isListening
                ? 'border-red-300/80 shadow-[0_2px_16px_rgba(239,68,68,0.12)] ring-1 ring-red-200/40'
                : chatMode === 'team' ? 'border-emerald-200/80' : 'border-gray-200/60'
            }`}>
              {/* Attachment Menu */}
              <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
                <motion.button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  animate={{ rotate: showAttachmentMenu ? 45 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  aria-label="Attach file"
                  aria-expanded={showAttachmentMenu}
                  aria-controls="attachment-menu"
                  aria-haspopup="true"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </motion.button>

                <AnimatePresence>
                  {showAttachmentMenu && (
                    <motion.div
                      id="attachment-menu"
                      role="menu"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute bottom-full left-0 mb-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 z-50"
                    >
                      <div className="px-3 py-1.5">
                        <p className="text-gray-400 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>Attach</p>
                      </div>
                      {[
                        { icon: FileText, label: 'Upload Document', sub: 'PDF, DOC, XLS, CSV', action: () => { setUploadModalType('file'); setShowUploadModal(true); setShowAttachmentMenu(false); } },
                        { icon: ImageIcon, label: 'Upload Image', sub: 'JPG, PNG, WEBP', action: () => { setUploadModalType('image'); setShowUploadModal(true); setShowAttachmentMenu(false); } },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => item.action()}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-light flex items-center justify-center transition-colors">
                            <item.icon className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
                          </div>
                          <div className="text-left">
                            <p className="text-gray-700 group-hover:text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</p>
                            <p className="text-gray-400" style={{ fontSize: '13px' }}>{item.sub}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Mode Toggle Dropdown */}
              <div className="relative flex-shrink-0" ref={modeDropdownRef}>
                <button
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer select-none ${
                    chatMode === 'ai'
                      ? 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/60'
                  }`}
                  aria-expanded={showModeDropdown}
                  aria-controls="chat-mode-dropdown"
                  aria-haspopup="true"
                >
                  <span className="relative">
                    {chatMode === 'ai' ? (
                      <BregoGPTIcon className="w-3.5 h-3.5" />
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5" />
                        <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white ${
                          teamStatus.status === 'online' ? 'bg-green-500' :
                          teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                        }`} />
                      </>
                    )}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {chatMode === 'ai' ? 'BregoGPT' : 'Brego Team'}
                  </span>
                  <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showModeDropdown && (
                  <div id="chat-mode-dropdown" role="menu" className="absolute bottom-full left-0 mb-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="px-3 py-2">
                      <p className="text-gray-400 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>Chat with</p>
                    </div>
                    
                    {/* BregoGPT Option */}
                    <button
                      onClick={() => { switchChatMode('ai', 'dropdown'); setShowModeDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-brand-light transition-colors ${
                        chatMode === 'ai' ? 'bg-brand-light' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        chatMode === 'ai'
                          ? 'bg-brand shadow-sm'
                          : 'bg-gray-100'
                      }`}>
                        <BregoGPTIcon className={`w-4 h-4 ${chatMode === 'ai' ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>BregoGPT</span>
                          <span className="text-brand bg-brand-light px-1.5 py-0.5 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>AI</span>
                        </div>
                        <p className="text-[13px] text-gray-500 mt-0.5">Instant AI-powered answers & analysis</p>
                      </div>
                      {chatMode === 'ai' && (
                        null
                      )}
                    </button>

                    {/* Brego Team Option */}
                    <button
                      onClick={() => { switchChatMode('team', 'dropdown'); setShowModeDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50/60 transition-colors ${
                        chatMode === 'team' ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        chatMode === 'team'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20'
                          : 'bg-gray-100'
                      }`}>
                        <Headphones className={`w-4 h-4 ${chatMode === 'team' ? 'text-white' : 'text-gray-500'}`} />
                        {/* Availability dot on icon */}
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          teamStatus.status === 'online' ? 'bg-green-500' :
                          teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                        }`}>
                          {teamStatus.status === 'online' && (
                            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
                          )}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Brego Team</span>
                          
                          <span className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                            teamStatus.status === 'online' ? 'text-green-700 bg-green-50' :
                            teamStatus.status === 'away' ? 'text-amber-700 bg-amber-50' :
                            'text-gray-500 bg-gray-100'
                          }`} style={{ fontSize: '13px', fontWeight: 500 }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              teamStatus.status === 'online' ? 'bg-green-500' :
                              teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                            }`} />
                            {teamStatus.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 mt-0.5">{teamStatus.detail}</p>
                      </div>
                      {chatMode === 'team' && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0" />
                      )}
                    </button>

                    {/* Tip */}
                    <div className="mx-3 mt-1.5 mb-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-500" style={{ fontSize: '13px' }}>
                        <span className="text-gray-600" style={{ fontWeight: 600 }}>Tip:</span> Type <span className="bg-white px-1 py-0.5 rounded text-brand border border-gray-200" style={{ fontFamily: 'monospace', fontSize: '13px' }}>@</span> in the chat input to switch modes, mention teammates, or raise an incident
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Field */}
              <div className="flex-1 relative flex items-center">
                {/* @Mention Autocomplete Dropdown */}
                <AnimatePresence>
                  {showChatMentionDropdown && filteredChatMentions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                      // Width constrained so it doesn't stretch across an
                      // 1100-px input and look like a sheet. Slack-style:
                      // the dropdown is a well-proportioned card that
                      // anchors to the left edge of the input (where the
                      // @ was typed), not a full-width panel.
                      className="absolute bottom-full left-0 mb-2 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-xl shadow-[0_12px_36px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)] border border-gray-200/70 overflow-hidden z-50 flex flex-col max-h-[340px]"
                    >
                      {/* Header — compact eyebrow, not a toolbar. */}
                      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 border-b border-gray-100/80">
                        <AtSign className="w-3 h-3 text-gray-400" strokeWidth={2.2} />
                        <p className="text-gray-500 uppercase" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>Mention</p>
                      </div>
                      {/* Scrollable body so only the list scrolls — header
                          + footer stay pinned as chrome. */}
                      <div className="flex-1 overflow-y-auto py-1">
                        {(() => {
                          let lastSection = '';
                          return filteredChatMentions.map((m, i) => {
                            const showSection = m.section !== lastSection;
                            lastSection = m.section;
                            const isActive = chatMentionIdx === i;
                            return (
                              <div key={m.value}>
                                {showSection && (
                                  <div className="px-3 pt-2 pb-0.5">
                                    <p
                                      className="text-gray-400 uppercase"
                                      style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}
                                    >
                                      {m.section}
                                    </p>
                                  </div>
                                )}
                                <button
                                  onMouseDown={(e) => { e.preventDefault(); handleChatMentionSelect(m); }}
                                  onMouseEnter={() => setChatMentionIdx(i)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                    isActive ? 'bg-gray-50' : 'hover:bg-gray-50/70'
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: m.bgColor }}
                                  >
                                    <m.icon className="w-3.5 h-3.5" strokeWidth={2} style={{ color: m.iconColor }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className="text-gray-900 truncate"
                                        style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.25' }}
                                      >
                                        {m.label}
                                      </span>
                                      <span
                                        className={`px-1.5 py-[1px] rounded-full flex-shrink-0 ${m.badgeStyle}`}
                                        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.01em' }}
                                      >
                                        {m.badge}
                                      </span>
                                    </div>
                                    <p
                                      className="text-gray-500 truncate mt-0.5"
                                      style={{ fontSize: '11.5px', lineHeight: '1.3' }}
                                    >
                                      {m.description}
                                    </p>
                                  </div>
                                  {/* Only reserve the right-side slot when
                                      selected — otherwise the row feels
                                      uneven and the empty space wastes width. */}
                                  {isActive && (
                                    <span
                                      className="text-[#204CC7] flex-shrink-0 inline-flex items-center gap-1"
                                      style={{ fontSize: '10.5px', fontWeight: 600 }}
                                    >
                                      <span
                                        className="px-1 py-0.5 rounded border border-[#204CC7]/20 bg-[#EEF1FB]"
                                        style={{ fontSize: '10px', fontWeight: 600 }}
                                      >
                                        ↵
                                      </span>
                                      Enter
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      {/* Footer — keyboard legend. Tight, small-caps,
                          reads like a status bar not a content row. */}
                      <div className="px-3 py-1.5 border-t border-gray-100/80 flex items-center gap-3 bg-gray-50/60">
                        <span className="inline-flex items-center gap-1 text-gray-500" style={{ fontSize: '10.5px' }}>
                          <kbd
                            className="px-1 py-0.5 bg-white rounded border border-gray-200 text-gray-600"
                            style={{ fontSize: '9.5px', fontWeight: 600, lineHeight: '1' }}
                          >↑↓</kbd>
                          navigate
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-500" style={{ fontSize: '10.5px' }}>
                          <kbd
                            className="px-1 py-0.5 bg-white rounded border border-gray-200 text-gray-600"
                            style={{ fontSize: '9.5px', fontWeight: 600, lineHeight: '1' }}
                          >↵</kbd>
                          select
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-500" style={{ fontSize: '10.5px' }}>
                          <kbd
                            className="px-1 py-0.5 bg-white rounded border border-gray-200 text-gray-600"
                            style={{ fontSize: '9.5px', fontWeight: 600, lineHeight: '1' }}
                          >esc</kbd>
                          dismiss
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mention chip is no longer a separate slot — the selected
                    handle is inlined directly into the input text so users
                    see (and send) exactly what they typed. Cleaner, simpler,
                    and the mention actually survives to the message. */}

                {/* Waveform visualizer when listening */}
                <AnimatePresence>
                  {isListening && !inputValue.trim() && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 overflow-hidden"
                    >
                      <WaveformVisualizer />
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={chatInputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValue(val);

                    // @mention autocomplete detection
                    const cursorPos = e.target.selectionStart || val.length;
                    const textBefore = val.slice(0, cursorPos);
                    const atMatch = textBefore.match(/@(\w*)$/);
                    if (atMatch) {
                      setShowChatMentionDropdown(true);
                      setChatMentionQuery(atMatch[1].toLowerCase());
                      setChatMentionIdx(0);
                    } else {
                      setShowChatMentionDropdown(false);
                      setChatMentionQuery('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (showChatMentionDropdown && filteredChatMentions.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setChatMentionIdx(prev => (prev + 1) % filteredChatMentions.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setChatMentionIdx(prev => (prev - 1 + filteredChatMentions.length) % filteredChatMentions.length);
                      } else if (e.key === 'Enter' || e.key === 'Tab') {
                        e.preventDefault();
                        handleChatMentionSelect(filteredChatMentions[chatMentionIdx]);
                        return;
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setShowChatMentionDropdown(false);
                        return;
                      }
                    } else if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowChatMentionDropdown(false), 200);
                  }}
                  placeholder={
                    isListening 
                      ? 'Listening...' 
                      : chatMode === 'ai' 
                        ? 'Ask BregoGPT anything... Type @ to mention' 
                        : 'Message Brego Team... Type @ to mention'
                  }
                  className={`w-full px-2 py-2 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 transition-colors duration-200 chat-input-clean ${
                    isListening ? 'placeholder:text-red-400' : ''
                  }`}
                  style={{ fontSize: '14px', fontFamily: 'Manrope, sans-serif' }}
                />
              </div>

              {/* Smart Mic / Send Button with Motion pop */}
              <div className="relative flex-shrink-0 w-9 h-9">
                <AnimatePresence mode="wait">
                  {inputValue.trim() ? (
                    <motion.button
                      key="send"
                      onClick={handleSend}
                      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.8 }}
                      whileTap={{ scale: 0.85 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                        chatMode === 'ai'
                          ? 'bg-brand text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                      }`}
                      aria-label="Send message"
                    >
                      <ArrowUp className="w-[18px] h-[18px]" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="mic"
                      onClick={toggleListening}
                      disabled={!speechSupported}
                      initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.8 }}
                      whileTap={{ scale: 0.85 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                        isListening
                          ? 'bg-red-50 text-red-500 ring-2 ring-red-200 shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      title={isListening ? 'Stop listening' : 'Voice input'}
                      aria-label={isListening ? 'Stop listening' : 'Voice input'}
                    >
                      {isListening ? (
                        <span className="relative flex items-center justify-center">
                          <motion.span
                            className="absolute w-7 h-7 rounded-full bg-red-400/20"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <motion.span
                            className="absolute w-5 h-5 rounded-full bg-red-400/30"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <Mic className="w-[18px] h-[18px] relative z-10" />
                        </span>
                      ) : (
                        <Mic className="w-[18px] h-[18px]" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-gray-500 mt-3 text-center" style={{ fontSize: '13px' }}>
              {chatMode === 'ai' 
                ? 'BregoGPT · AI can make mistakes. Always verify important information.'
                : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Brego Team · Messages are delivered to your account manager</span>
                    <span className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        teamStatus.status === 'online' ? 'bg-green-500' :
                        teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                      }`} />
                      <span className={`${
                        teamStatus.status === 'online' ? 'text-green-600' :
                        teamStatus.status === 'away' ? 'text-amber-600' : 'text-gray-400'
                      }`}>{teamStatus.label}</span>
                    </span>
                  </span>
                )}
            </p>
          </div>
        </div>
        </>)}
      </div>

      {/* Thread Pane — right-hand panel, slack-style. Rendered as a sibling
          to the main chat area so it takes its own 440px column and pushes
          nothing around. Only active in team mode + channel view; switching
          channels or leaving team mode closes the pane via the effects
          elsewhere. We hydrate from the current `messages` list on every
          render so reactions / bookmarks applied inside the pane stay in
          sync with the channel. */}
      <AnimatePresence>
        {chatMode === 'team' && teamView === 'channel' && activeThreadRootId && (() => {
          const parent = messages.find((m) => m.id === activeThreadRootId);
          if (!parent || !parent.channel) return null;
          const replies = threadRepliesByParent.get(parent.id) ?? [];
          const channelMeta = getChannelMeta(parent.channel);
          return (
            <ThreadPane
              key={parent.id}
              parent={parent as ThreadMessage}
              replies={replies as ThreadMessage[]}
              onToggleReaction={handleToggleReaction}
              onSendReply={(text, alsoSendToChannel) =>
                handleSendThreadReply(parent.id, text, alsoSendToChannel)
              }
              onClose={handleCloseThread}
              channelId={parent.channel}
              channelLabel={channelMeta.label}
            />
          );
        })()}
      </AnimatePresence>

      {/* All global modals (Upgrade Flow, Syncing, STO, Business modals) */}
      {renderGlobalModals()}

      {/* Keyboard Shortcuts Cheatsheet */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Upload Document Modal — unified system with Dataroom folder picker */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadType={uploadModalType}
        onBatchUploadComplete={handleBatchUploadComplete}
        defaultService={effectiveService === 'Accounts & Taxation' ? 'accounts' : 'performance'}
      />

      {/* Huddle Call Overlay */}
      <HuddleCall
        isOpen={showHuddle}
        onClose={() => setShowHuddle(false)}
        teamStatus={teamStatus}
      />

      {/* Sonner Toaster for account switch notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Manrope, sans-serif',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(229,231,235,0.6)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          },
          actionButtonStyle: {
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: '600',
            fontSize: '12px',
            padding: '4px 12px',
          },
        }}
      />
      </div>
    </div>
  );

  // Wrap entire component output in OnboardingDataProvider (DataroomProvider is at App.tsx level)
  return (
    <OnboardingDataProvider initialData={{
      companyName: userInfo.companyName || '',
      website: userInfo.companyWebsite || '',
      industry: userInfo.industry || '',
      monthlyBudget: userInfo.adSpendRange || '',
      primaryGoal: userInfo.goal || '',
      revenueRange: userInfo.revenueRange || '',
      accountingSoftware: userInfo.accountingSoftware || '',
    }}>
      {content}
    </OnboardingDataProvider>
  );
}

// Media Plan Message Component
function MediaPlanMessage({ plan }: { plan: MediaPlan }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Safety check for plan data
  if (!plan || !plan.combinedPlan) {
    return null;
  }
  
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-200/60 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{plan.month} {plan.year} Media Plan</h3>
                  <span className={`px-2 py-0.5 rounded-lg ${
                    plan.type === 'Monthly' 
                      ? 'bg-brand-light text-brand' 
                      : 'bg-purple-100 text-purple-700'
                  }`} style={{ fontSize: '13px', fontWeight: 600 }}>
                    {plan.type}
                  </span>
                </div>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>Received on {plan.receivedDate}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {isExpanded && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4 max-h-[400px] overflow-y-auto">
              {/* Combined Plan Metrics */}
              <div>
                <h4 className="text-gray-500 uppercase mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>Combined Plan</h4>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Campaign</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>Avg CPC (₹)</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>Conv. Rate</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>Purchases</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>Cost/Purchase (₹)</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>Purchase Value (₹)</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>ROAS</th>
                        <th className="text-right py-2 text-gray-600" style={{ fontWeight: 500 }}>CPM (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-900" style={{ fontWeight: 500 }}>Google</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.avgCPC || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.convRate || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.purchases || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.costPerPurchase || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.purchaseValue || 'N/A'}</td>
                        <td className="text-right py-2 text-green-600" style={{ fontWeight: 600 }}>{plan.combinedPlan?.google?.roas || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.google?.cpm || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-900" style={{ fontWeight: 500 }}>Meta</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.avgCPC || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.convRate || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.purchases || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.costPerPurchase || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.purchaseValue || 'N/A'}</td>
                        <td className="text-right py-2 text-green-600" style={{ fontWeight: 600 }}>{plan.combinedPlan?.meta?.roas || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-700">{plan.combinedPlan?.meta?.cpm || 'N/A'}</td>
                      </tr>
                      <tr className="bg-brand-light">
                        <td className="py-2 text-gray-900" style={{ fontWeight: 700 }}>Total</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.avgCPC || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.convRate || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.purchases || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.costPerPurchase || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.purchaseValue || 'N/A'}</td>
                        <td className="text-right py-2 text-green-600" style={{ fontWeight: 700 }}>{plan.combinedPlan?.total?.roas || 'N/A'}</td>
                        <td className="text-right py-2 text-gray-900" style={{ fontWeight: 600 }}>{plan.combinedPlan?.total?.cpm || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Offers */}
              {plan.offers && plan.offers.length > 0 && (
                <div>
                  <h4 className="text-gray-500 uppercase mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>Offers for the Coming Month</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Start Date</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>End Date</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Offer</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Communication</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Action on Website</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Targeting</th>
                          <th className="text-left py-2 text-gray-600" style={{ fontWeight: 500 }}>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.offers.map((offer, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 text-gray-700">{offer.startDate}</td>
                            <td className="py-2 text-gray-700">{offer.endDate}</td>
                            <td className="py-2 text-gray-900" style={{ fontWeight: 500 }}>{offer.offer}</td>
                            <td className="py-2 text-gray-700">{offer.communication}</td>
                            <td className="py-2 text-gray-700">{offer.actionOnWebsite || 'N/A'}</td>
                            <td className="py-2 text-gray-700">{offer.targeting || 'N/A'}</td>
                            <td className="py-2 text-gray-700">{offer.comments || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onActionClick, clickedActions, diagnosticData, connectionFeedback, showOtherIndustryInput, otherIndustryValue, setOtherIndustryValue, showOtherChallengeInput, otherChallengeValue, setOtherChallengeValue, bookmarkedMessageIds, onToggleBookmark, onToggleReaction, navigateToDataroomFolder, threadReplies, onOpenThread, activeThreadRootId, onCreateTaskFromMessage, onCreateIncidentFromMessage }: { message: Message; onActionClick: (action: string, label?: string) => void; clickedActions: Set<string>; diagnosticData: Partial<DiagnosticData>; connectionFeedback: string; showOtherIndustryInput: boolean; otherIndustryValue: string; setOtherIndustryValue: (value: string) => void; showOtherChallengeInput: boolean; otherChallengeValue: string; setOtherChallengeValue: (value: string) => void; bookmarkedMessageIds: Set<string>; onToggleBookmark: (id: string) => void; onToggleReaction: (id: string, emoji: string) => void; navigateToDataroomFolder: (folderId: string, service: 'accounts' | 'performance') => void; threadReplies?: Message[]; onOpenThread?: (rootId: string) => void; activeThreadRootId?: string | null; onCreateTaskFromMessage?: (id: string, content: string) => void; onCreateIncidentFromMessage?: (id: string, content: string) => void }) {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  // One ref per bubble — MessageBubble only ever renders one of the three
  // variant branches below, so a single shared ref is enough. The hover
  // "More" button calls menuRef.current?.openAt(e) to position the menu
  // under itself rather than at the cursor, which keeps the menu anchored
  // even when the user's mouse has already drifted off the trigger.
  const menuRef = useRef<MessageContextMenuHandle>(null);

  if (message.type === 'system') {
    // Render visual components based on component type
    
    // Full Marketing Report - All sections at once
    if (message.component === 'full-marketing-report') {
      // Get connected channels from diagnosticData
      const connectedChannels = diagnosticData.connectedAccounts ? Object.entries(diagnosticData.connectedAccounts)
        .filter(([_, isConnected]) => isConnected)
        .map(([channel, _]) => {
          const channelMap: Record<string, string> = {
            metaAds: 'Meta Ads',
            googleAds: 'Google Ads',
            linkedinAds: 'LinkedIn Ads',
            shopify: 'Shopify',
            ga4: 'GA4'
          };
          return channelMap[channel] || channel;
        }) : [];

      const channelOptions = ['All Channels', ...connectedChannels];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Report Header with Channel Filter */}
          <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 mb-1.5 flex items-center gap-2" style={{ fontSize: '20px', fontWeight: 700 }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <span>Marketing Health Report</span>
                </h2>
                <p className="text-gray-600" style={{ fontSize: '14px' }}>
                  <strong className="text-gray-900" style={{ fontWeight: 600 }}>{message.companyName || 'Your Business'}</strong>
                  <span className="text-gray-400 mx-2">•</span> 
                  <span className="text-gray-600">{message.businessModel === 'ecommerce' ? 'E-commerce' : 'Lead Gen'}</span>
                </p>
              </div>

              {/* Channel Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 transition-all duration-200 min-w-[180px] justify-between shadow-sm hover:shadow hover:border-gray-300"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-gray-700">{selectedChannel === 'all' ? 'All Channels' : selectedChannel}</span>
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isChannelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isChannelDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-gray-500 uppercase tracking-wide border-b border-gray-100" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Filter by Channel
                    </div>
                    {channelOptions.map((channel) => (
                      <button
                        key={channel}
                        onClick={() => {
                          setSelectedChannel(channel === 'All Channels' ? 'all' : channel);
                          setIsChannelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center justify-between ${
                          (selectedChannel === 'all' && channel === 'All Channels') || selectedChannel === channel
                            ? 'bg-brand-light text-brand'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{channel}</span>
                        {((selectedChannel === 'all' && channel === 'All Channels') || selectedChannel === channel) && (
                          <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-5">
              <span style={{ fontSize: '20px' }}>🎯</span>
              <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>Key Performance Metrics</h3>
              {selectedChannel !== 'all' && (
                <span className="ml-auto text-brand bg-brand-light px-3 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {selectedChannel}
                </span>
              )}
            </div>
            <MetricsCardsComponent businessModel={message.businessModel} selectedChannel={selectedChannel} />
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
            <PerformanceChartComponent businessModel={message.businessModel} selectedChannel={selectedChannel} />
          </div>

          {/* What Needs Fixing */}
          <div className="bg-gradient-to-br from-red-50/30 to-white rounded-2xl px-8 py-6 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-5">
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>What Needs Fixing</h3>
              <span className="ml-auto text-red-600 bg-red-100 px-2.5 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>4 Issues</span>
            </div>
            <WhatsBrokenComponent businessModel={message.businessModel} />
          </div>

          {/* What's Working */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl px-8 py-6 shadow-sm border border-emerald-100">
            <div className="flex items-center gap-2 mb-5">
              <span style={{ fontSize: '20px' }}>✨</span>
              <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>What's Working</h3>
              <span className="ml-auto text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>3 Wins</span>
            </div>
            <WhatsWorkingComponent businessModel={message.businessModel} />
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-2xl px-8 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60">
            <div className="flex items-center gap-2 mb-5">
              <span style={{ fontSize: '20px' }}>💡</span>
              <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>Action Plan</h3>
              <span className="ml-auto text-brand bg-brand-light px-2.5 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>3 Actions</span>
            </div>
            <RecommendationsComponent businessModel={message.businessModel} />
          </div>

          {/* Warning Footer */}
          <div className="bg-amber-50/50 rounded-2xl px-8 py-5 shadow-sm border border-amber-200">
            <WarningFooterComponent businessModel={message.businessModel} />
          </div>

          {/* Action Buttons */}
          {message.buttons && message.buttons.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {message.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick(button.action, button.label)}
                  className={`
                    px-6 py-3 rounded-xl transition-all duration-200
                    ${button.variant === 'primary' 
                      ? 'bg-brand text-white hover:bg-brand-hover shadow-sm active:scale-[0.98]' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-[0.99]'
                    }
                  `}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (message.component === 'metrics-cards') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60">
              <div className="flex items-center gap-2 mb-5">
                <span style={{ fontSize: '20px' }}>🎯</span>
                <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>Key Performance Metrics</h3>
              </div>
              <MetricsCardsComponent businessModel={message.businessModel} />
            </div>
          </div>
        </div>
      );
    }

    if (message.component === 'performance-chart') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <PerformanceChartComponent businessModel={message.businessModel} />
          </div>
        </div>
      );
    }

    if (message.component === 'whats-working') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60">
              <div className="flex items-center gap-2 mb-5">
                <span style={{ fontSize: '20px' }}>✨</span>
                <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>What's Working</h3>
                <span className="ml-auto text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>3 Wins</span>
              </div>
              <WhatsWorkingComponent businessModel={message.businessModel} />
            </div>
          </div>
        </div>
      );
    }

    if (message.component === 'whats-broken') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60">
              <div className="flex items-center gap-2 mb-5">
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>What Needs Fixing</h3>
                <span className="ml-auto text-red-600 bg-red-100 px-2 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>4 Issues</span>
              </div>
              <WhatsBrokenComponent businessModel={message.businessModel} />
            </div>
          </div>
        </div>
      );
    }

    if (message.component === 'recommendations') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60">
              <div className="flex items-center gap-2 mb-5">
                <span style={{ fontSize: '20px' }}>💡</span>
                <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>Action Plan</h3>
                <span className="ml-auto text-brand bg-brand-light px-2 py-1 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>3 Actions</span>
              </div>
              <RecommendationsComponent businessModel={message.businessModel} />
            </div>
            {message.buttons && message.buttons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {message.buttons.map((button, index) => {
                  const isClicked = clickedActions.has(button.action);
                  return (
                    <button
                      key={index}
                      onClick={() => !isClicked && onActionClick(button.action, button.label)}
                      disabled={isClicked}
                      className={`
                        px-4 py-2 rounded-lg transition-all flex items-center gap-1.5
                        ${isClicked
                          ? 'bg-gray-300 text-gray-600 cursor-default border border-gray-400'
                          : button.variant === 'primary' 
                            ? 'bg-brand text-white hover:bg-brand-hover shadow-sm' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      {isClicked && <CheckCircle2 className="w-4 h-4" />}
                      {button.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (message.component === 'warning-footer') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <WarningFooterComponent businessModel={message.businessModel} />
          </div>
        </div>
      );
    }

    if (message.component === 'action-buttons') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            {message.buttons && message.buttons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {message.buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => onActionClick(button.action, button.label)}
                    className={`
                      px-6 py-3 rounded-xl transition-all duration-200
                      ${button.variant === 'primary' 
                        ? 'bg-brand text-white hover:bg-brand-hover shadow-sm active:scale-[0.98]' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60 shadow-sm active:scale-[0.99]'
                      }
                    `}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Finance Components
    if (message.component === 'finance-health-metrics') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-gray-200">
              <p className="text-gray-700 mb-4" style={{ fontSize: '14px' }}>{message.content}</p>
              <FinanceHealthMetricsComponent />
            </div>
          </div>
        </div>
      );
    }

    if (message.component === 'cash-health-snapshot') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CashHealthSnapshotComponent />
          </div>
        </div>
      );
    }

    if (message.component === 'receivables-payables') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <ReceivablesPayablesComponent />
          </div>
        </div>
      );
    }

    if (message.component === 'compliance-risk') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <ComplianceRiskCheckComponent />
          </div>
        </div>
      );
    }

    if (message.component === 'finance-warning-footer') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <FinanceWarningFooterComponent />
          </div>
        </div>
      );
    }

    if (message.component === 'what-needs-fixing') {
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <WhatNeedsFixingComponent />
          </div>
        </div>
      );
    }

    // Media Plan Component
    if (message.component === 'media-plan' && message.mediaPlan) {
      return <MediaPlanMessage plan={message.mediaPlan} />;
    }

    // Incident Confirmation Card (from inline @incident form)
    if (message.component === 'incident-confirmation' && message.data) {
      const inc = message.data as InlineIncidentResult;
      const isPM = inc.service === 'Performance Marketing';
      const serviceColor = isPM ? '#204CC7' : '#7C3AED';
      const serviceBg = isPM ? '#EEF1FB' : '#F5F3FF';
      return (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="max-w-[440px]"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${serviceColor}, ${serviceColor}88)` }} />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' }}
                >
                  <AlertTriangle size={15} style={{ color: '#DC2626' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Incident Raised</p>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#ECFDF5', border: '1px solid rgba(5,150,105,0.1)' }}
                    >
                      <CheckCircle2 size={10} style={{ color: '#059669' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#059669' }}>Open</span>
                    </div>
                  </div>
                  <p className="truncate" style={{ fontSize: '14px', fontWeight: 500, color: '#374151', lineHeight: 1.4 }}>
                    {inc.title}
                  </p>
                </div>
              </div>

              {/* Description preview */}
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#64748B',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any,
                  overflow: 'hidden',
                  marginBottom: 12,
                  paddingLeft: 48,
                }}
              >
                {inc.description}
              </p>

              {/* Meta chips */}
              <div className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: 48 }}>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: serviceBg }}
                >
                  <span style={{ fontSize: '13px' }}>{isPM ? '📈' : '📊'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: serviceColor }}>{inc.service}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: '#F8FAFC' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>{inc.dateTime}</span>
                </div>
                {inc.attachmentCount > 0 && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ backgroundColor: '#F8FAFC' }}
                  >
                    <Paperclip size={11} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>
                      {inc.attachmentCount} file{inc.attachmentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: '#FFFBEB', border: '1px solid rgba(245,158,11,0.1)' }}
                >
                  <Zap size={10} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#D97706' }}>From Chat</span>
                </div>
              </div>

              {/* View in Workspace link */}
              <div style={{ paddingLeft: 48, marginTop: 10 }}>
                <button
                  onClick={() => onActionClick('view-incident-workspace')}
                  className="flex items-center gap-1.5 group/link"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={12} style={{ color: '#94A3B8', transition: 'color 0.15s' }} className="group-hover/link:!text-[#204CC7]" />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#94A3B8',
                      transition: 'color 0.15s',
                    }}
                    className="group-hover/link:!text-[#204CC7]"
                  >
                    View in Workspace
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Task Confirmation Card (from inline @task modal) — mirrors the
    // incident card so the two quick-action outputs feel like siblings.
    // Accent shifts to emerald to reinforce the "constructive action" tone
    // vs. the red "problem raised" tone of incidents.
    if (message.component === 'task-confirmation' && message.data) {
      const task = message.data as AssignTodoTask;
      const accent = '#059669';
      const accentBg = '#ECFDF5';
      // Priority chip styling — P1 red (urgent), P2 amber (important),
      // P3 slate (routine). Mirrors the Workspace PriorityBadge palette.
      const priorityStyle =
        task.priority === 'P1'
          ? { bg: '#FEF2F2', fg: '#DC2626', border: 'rgba(220,38,38,0.12)' }
          : task.priority === 'P2'
          ? { bg: '#FFFBEB', fg: '#D97706', border: 'rgba(245,158,11,0.12)' }
          : { bg: '#F8FAFC', fg: '#64748B', border: 'rgba(100,116,139,0.12)' };
      return (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="max-w-[440px]"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

            <div className="p-4">
              {/* Header: icon tile + title + status chip */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}
                >
                  <CheckSquare size={15} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Task Created</p>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: accentBg, border: `1px solid ${accent}1A` }}
                    >
                      <CheckCircle2 size={10} style={{ color: accent }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: accent }}>Open</span>
                    </div>
                  </div>
                  <p className="truncate" style={{ fontSize: '14px', fontWeight: 500, color: '#374151', lineHeight: 1.4 }}>
                    {task.title}
                  </p>
                </div>
              </div>

              {/* Assignee line — small meta so the card stays scannable */}
              <div className="flex items-center gap-2 mb-3" style={{ paddingLeft: 48 }}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: task.assigneeColor, color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}
                >
                  {task.assigneeInitials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748B' }}>
                  Assigned to <span style={{ fontWeight: 500, color: '#374151' }}>{task.assignee}</span>
                </span>
              </div>

              {/* Meta chips: project · priority · due date · from-chat */}
              <div className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: 48 }}>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: accentBg }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500, color: accent }}>{task.project}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: priorityStyle.bg, border: `1px solid ${priorityStyle.border}` }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500, color: priorityStyle.fg }}>{task.priority}</span>
                </div>
                {task.dueDate && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: '#F8FAFC' }}
                  >
                    <Clock size={11} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748B' }}>{task.dueDate}</span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: '#FFFBEB', border: '1px solid rgba(245,158,11,0.1)' }}
                >
                  <Zap size={10} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#D97706' }}>From Chat</span>
                </div>
              </div>

              {/* View in Workspace link — hover shifts from slate to brand to
                  cue "this opens the Tasks module". */}
              <div style={{ paddingLeft: 48, marginTop: 10 }}>
                <button
                  onClick={() => onActionClick('view-task-workspace')}
                  className="flex items-center gap-1.5 group/link"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={12} style={{ color: '#94A3B8', transition: 'color 0.15s' }} className="group-hover/link:!text-[#204CC7]" />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#94A3B8',
                      transition: 'color 0.15s',
                    }}
                    className="group-hover/link:!text-[#204CC7]"
                  >
                    View in Workspace
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // File Upload Card
    if (message.component === 'file-upload' && message.data) {
      const { fileName, fileSize, fileType, uploadType, folderPath, folderId, serviceKey, note } = message.data;
      return (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200/60 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              uploadType === 'image'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-brand-light text-brand'
            }`}>
              {uploadType === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 truncate" style={{ fontSize: '14px' }}>{fileName}</p>
              <p className="text-[13px] text-gray-500">{fileType} · {fileSize}</p>
              {folderPath && (
                <div className="flex items-center gap-1 mt-1.5 px-2 py-1 bg-[#EEF1FB]/60 rounded-md" style={{ border: '1px solid rgba(32,76,199,0.08)' }}>
                  <Database className="w-3 h-3 text-[#204CC7] flex-shrink-0" />
                  <span className="text-[#204CC7] truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{folderPath}</span>
                </div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 500, damping: 20 }}
              className="flex-shrink-0 mt-0.5"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </motion.div>
          </div>
          {note && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2.5 px-3 py-2 bg-white rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{renderChatMentions(note)}</p>
              </div>
            </motion.div>
          )}
          {folderId && serviceKey && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigateToDataroomFolder(folderId, serviceKey)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#204CC7] bg-[#EEF1FB]/80 hover:bg-[#E0E7F9] transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <FolderOpen className="w-3 h-3" />
              View in Dataroom
            </motion.button>
          )}
        </motion.div>
      );
    }

    // Batch Upload Card
    if (message.component === 'batch-upload' && message.data) {
      const { files, fileCount, folderPath, service, totalSize, folderId, serviceKey, note } = message.data;
      return (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200/60 max-w-sm"
        >
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800" style={{ fontSize: '14px', fontWeight: 600 }}>{fileCount} files uploaded</p>
              <p className="text-[13px] text-gray-500">{service}{totalSize ? ` · ${totalSize}` : ''}</p>
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 500, damping: 20 }}>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </motion.div>
          </div>
          <div className="space-y-1 mb-2">
            {(files as string[]).slice(0, 4).map((name: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-gray-500">
                <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{name}</span>
              </div>
            ))}
            {fileCount > 4 && (
              <p className="text-gray-400 pl-5" style={{ fontSize: '13px' }}>+{fileCount - 4} more</p>
            )}
          </div>
          {folderPath && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#EEF1FB]/60 rounded-md" style={{ border: '1px solid rgba(32,76,199,0.08)' }}>
              <Database className="w-3 h-3 text-[#204CC7] flex-shrink-0" />
              <span className="text-[#204CC7] truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{folderPath}</span>
            </div>
          )}
          {note && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 px-3 py-2 bg-white rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{renderChatMentions(note)}</p>
              </div>
            </motion.div>
          )}
          {folderId && serviceKey && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigateToDataroomFolder(folderId, serviceKey)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#204CC7] bg-[#EEF1FB]/80 hover:bg-[#E0E7F9] transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <FolderOpen className="w-3 h-3" />
              View in Dataroom
            </motion.button>
          )}
        </motion.div>
      );
    }

    // Dashboard Response — data-driven rich response
    if (message.component === 'dashboard-response' && message.dashboardResponse) {
      return (
        <MessageContextMenu ref={menuRef} messageId={message.id} content={message.content} timestamp={message.timestamp} isUser={false} isBookmarked={bookmarkedMessageIds.has(message.id)} onToggleBookmark={onToggleBookmark} onCreateTask={onCreateTaskFromMessage} onCreateIncident={onCreateIncidentFromMessage}>
        <div className="group/msg flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <motion.div
              className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 0.95, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              {/* Starred indicator — same badge used on AI / team bubbles
                  so the three message shapes all share one visual grammar
                  for "you've saved this". */}
              <div className="relative">
                {bookmarkedMessageIds.has(message.id) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -left-1.5 z-10"
                  >
                    <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Narrative text */}
              <div className="bg-white/90 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100/80 max-w-3xl">
                {/* Data-as-of pill — anchors the response in time so users
                    reviewing an older thread immediately know the data
                    snapshot's age. Uses the response's own timestamp which
                    is within ~1.4s of when the prompt was sent. */}
                <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/15">
                  <Clock className="w-3 h-3" strokeWidth={2.2} />
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.01em' }}>
                    Data as of {formatDataAsOf(message.timestamp)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  {message.content.split(/\\n|\n/).map((line, i) => {
                    if (line.trim() === '') return null;
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={i} className="text-gray-700 mb-2 last:mb-0" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-gray-900" style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </p>
                    );
                  })}
                </div>
                {/* Rich data cards */}
                <DashboardResponseRenderer
                  response={message.dashboardResponse}
                  onActionClick={onActionClick}
                />
              </div>
            </div>
          </div>
          <span className="text-gray-400 pl-11 opacity-0 translate-y-[-2px] group-hover/msg:opacity-100 group-hover/msg:translate-y-0 transition-all duration-200" style={{ fontSize: '13px' }}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        </MessageContextMenu>
      );
    }

    // Mode Switch Separator
    if (message.component === 'mode-switch') {
      const isAI = message.data?.mode === 'ai';
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
            isAI 
              ? 'bg-brand-light border-brand/10 text-brand'
              : 'bg-emerald-50/60 border-emerald-100 text-emerald-600'
          }`}>
            {isAI ? (
              <BregoGPTIcon className="w-3 h-3" />
            ) : (
              <Headphones className="w-3 h-3" />
            )}
            <span>Switched to {message.content}</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      );
    }

    // Default text rendering
    // Team-authored messages (from #discussions / #announcements) get a
    // personalised avatar + name chip so the chat reads as a real
    // multi-voice conversation rather than a single faceless bot.
    const isTeamAuthored = !!message.channel && message.from === 'team';
    const authorMeta = isTeamAuthored && message.author ? TEAM_AUTHORS[message.author] : null;
    const isAnnouncements = message.channel === 'announcements';
    return (
      <MessageContextMenu ref={menuRef} messageId={message.id} content={message.content} timestamp={message.timestamp} isUser={false} isBookmarked={bookmarkedMessageIds.has(message.id)} onToggleBookmark={onToggleBookmark} onCreateTask={onCreateTaskFromMessage} onCreateIncident={onCreateIncidentFromMessage}>
      <div className="group/msg flex flex-col gap-1">
        <div className="flex items-start gap-3">
          {authorMeta ? (
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br ${authorMeta.gradient} text-white`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 0.95, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              title={`${authorMeta.name} · ${authorMeta.role}`}
            >
              {isAnnouncements ? (
                <Megaphone className="w-4 h-4 text-white" strokeWidth={2.2} />
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em' }}>{authorMeta.initials}</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 0.95, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            {/* Author chip — surfaces who in the Brego team is speaking.
                Shown only for team-channel messages where a specific author
                is set; for BregoGPT / generic system messages we keep the
                bubble anonymous because the avatar already carries the
                identity. */}
            {authorMeta && (
              <div className="flex items-baseline gap-2 mb-1 pl-0.5">
                <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {authorMeta.name}
                </span>
                <span
                  className={`px-1.5 py-[1px] rounded ${isAnnouncements ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}
                  style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em' }}
                >
                  {authorMeta.role}
                </span>
                <span className="text-gray-400" style={{ fontSize: '11px' }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-[20px] rounded-tl-sm px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-gray-100/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300">
              {/* Starred indicator — filled amber star in a brand-blue disc
                  matches the visual language used on the Starred tab. */}
              {bookmarkedMessageIds.has(message.id) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1.5 -left-1.5 z-10"
                >
                  <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                </motion.div>
              )}
              {/* Overflow (3-dot) trigger — lives in place of the old Copy
                  hover button. A single entry point to every per-message
                  action (copy, star, share, create task, raise incident),
                  so the bubble chrome stays minimal while the surface area
                  actually grows. The button dispatches to the
                  MessageContextMenu via its imperative handle so the menu
                  anchors under the icon, not at the cursor. */}
              <button
                onClick={(e) => menuRef.current?.openAt(e)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-transparent opacity-0 group-hover/msg:opacity-100 hover:bg-gray-100 transition-all duration-200"
                title="More actions"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
              </button>
            <div className="prose prose-sm max-w-none pr-6">
              {message.content.split(/\\n|\n/).map((line, i) => {
                if (line.startsWith('##')) {
                  return <h2 key={i} className="text-gray-900 mt-0 mb-3" style={{ fontSize: '20px', fontWeight: 700 }}>{line.replace('##', '').trim()}</h2>;
                }
                if (line.startsWith('###')) {
                  return <h3 key={i} className="text-gray-900 mt-4 mb-2" style={{ fontSize: '16px', fontWeight: 700 }}>{line.replace('###', '').trim()}</h3>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="text-gray-900 mt-3 mb-1" style={{ fontWeight: 600 }}>{line.replace(/\*\*.*?\*\*/g, '')}</p>;
                }
                if (line.trim() === '') return null;
                
                // Parse emojis, formatting, and links. Plain-text runs are
                // then passed through renderChatMentions so @handles
                // inside team / AI replies show up as the same styled
                // pills used everywhere else in the chat.
                const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);
                return (
                  <p key={i} className="text-gray-700 leading-relaxed mb-2">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-gray-900" style={{ fontWeight: 600 }}>{part.replace(/\*\*/g, '')}</strong>;
                      }
                      // Detect and render URLs as clickable links
                      if (part.match(/^https?:\/\//)) {
                        return (
                          <a
                            key={j}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-hover underline transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            {part}
                          </a>
                        );
                      }
                      return <span key={j}>{renderChatMentions(part)}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
          
          {message.buttons && message.buttons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.buttons.map((button, index) => {
                const isClicked = clickedActions.has(button.action);
                
                // Hide Shopify button if business model is leadgen
                if (button.action === 'connect:shopify' && diagnosticData.businessModel === 'leadgen') {
                  return null;
                }
                
                // Hide LinkedIn Ads button if business model is ecommerce
                if (button.action === 'connect:linkedinAds' && diagnosticData.businessModel === 'ecommerce') {
                  return null;
                }
                
                // Check button types
                const isConnectionButton = button.action.startsWith('connect:');
                const isUploadButton = button.action.startsWith('upload-file:');
                const isContinueButton = button.action === 'generate-report' || button.action === 'generate-finance-report';
                
                // Check if any account is connected
                const hasAnyConnection = diagnosticData.connectedAccounts && 
                  Object.values(diagnosticData.connectedAccounts).some(val => val === true);
                
                // Disable Continue button if no accounts connected (for Performance Marketing only)
                const isDisabled = isClicked || (isContinueButton && button.action === 'generate-report' && !hasAnyConnection);
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={!isDisabled ? { y: -1 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                    onClick={() => {
                      if (!isClicked && !isDisabled) {
                        onActionClick(button.action, button.label);
                      }
                    }}
                    disabled={isDisabled}
                    className={`
                      ${isConnectionButton || isUploadButton ? 'w-full justify-start' : ''}
                      px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2.5
                      ${isDisabled
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                        : button.variant === 'primary' 
                          ? 'bg-brand text-white hover:bg-brand-hover active:scale-[0.98]' 
                          : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]'
                      }
                    `}
                  >
                    {isConnectionButton && !isClicked && <Plug className="w-4 h-4 text-gray-500" />}
                    {isUploadButton && !isClicked && <Upload className="w-4 h-4 text-gray-500" />}
                    {isClicked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    <span>{button.label}</span>
                  </motion.button>
                );
              })}
              
              {/* Feedback Tooltips */}
              {connectionFeedback && (message.content.includes('Connect your ad accounts') || message.content.includes('Upload your financial documents')) && (
                <div className="w-full flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 transition-all duration-300" style={{ fontSize: '13px' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span>{connectionFeedback}</span>
                </div>
              )}

              {/* Other Industry Input Field */}
              {showOtherIndustryInput && message.content.includes('Which industry do you operate in?') && (
                <div className="w-full mt-2 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={otherIndustryValue}
                      onChange={(e) => setOtherIndustryValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && otherIndustryValue.trim()) {
                          onActionClick('submit-other-industry');
                        }
                      }}
                      placeholder="Type your industry..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                      autoFocus
                    />
                    <button
                      onClick={() => onActionClick('submit-other-industry')}
                      disabled={!otherIndustryValue.trim()}
                      aria-label="Submit industry"
                      className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2
                        ${otherIndustryValue.trim()
                          ? 'bg-brand text-white hover:bg-brand-hover active:scale-[0.98]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Other Challenge Input Field */}
              {showOtherChallengeInput && message.content.includes('What challenges do you face') && (
                <div className="w-full mt-2 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={otherChallengeValue}
                      onChange={(e) => setOtherChallengeValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && otherChallengeValue.trim()) {
                          onActionClick('submit-other-challenge');
                        }
                      }}
                      placeholder="Describe your challenge..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                      autoFocus
                    />
                    <button
                      onClick={() => onActionClick('submit-other-challenge')}
                      disabled={!otherChallengeValue.trim()}
                      aria-label="Submit challenge"
                      className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2
                        ${otherChallengeValue.trim()
                          ? 'bg-brand text-white hover:bg-brand-hover active:scale-[0.98]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Reactions row — only on team-channel messages. We keep the row
              mounted even when there are no reactions so the picker (+)
              button stays available on hover; this is how most mature chat
              apps handle it and avoids "where do I react?" confusion.
              "Reply in thread" sits next to the emoji picker because the
              two affordances are conceptually siblings — both are the user
              saying "I'm responding to this message", just at different
              levels of commitment. Note: mode-switch is short-circuited
              earlier in this branch so we don't need to exclude it here.
              Replies themselves (parentId set) don't get a reply button —
              threads are flat, not nested. */}
          {message.channel && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <ReactionPillRow
                reactions={message.reactions}
                onToggle={(emoji) => onToggleReaction(message.id, emoji)}
              />
              <ReactionPicker
                onPick={(emoji) => onToggleReaction(message.id, emoji)}
                hoverOnly
              />
              {!message.parentId && onOpenThread && (
                <button
                  type="button"
                  onClick={() => onOpenThread(message.id)}
                  title="Reply in thread"
                  aria-label="Reply in thread"
                  className="opacity-0 group-hover/msg:opacity-100 inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  style={{ fontSize: '11.5px' }}
                >
                  <CornerDownRight className="w-3 h-3" strokeWidth={2.2} />
                  <span style={{ fontWeight: 500 }}>Reply in thread</span>
                </button>
              )}
            </div>
          )}
          {/* Thread summary strip — appears below the reactions when this
              parent has replies. Clicking opens the ThreadPane. Mirrors
              Slack's canonical "3 replies · Last reply 2m ago" affordance
              and doubles as the thread's entry point for anyone scrolling
              the main channel. */}
          {message.channel && !message.parentId && threadReplies && threadReplies.length > 0 && onOpenThread && (
            <div className={`mt-1 ${activeThreadRootId === message.id ? 'rounded-lg ring-1 ring-brand/20 bg-brand/5' : ''}`}>
              <ThreadSummaryStrip
                replies={threadReplies as ThreadMessage[]}
                onClick={() => onOpenThread(message.id)}
              />
            </div>
          )}
          </div>
        </div>
        {!authorMeta && (
          <span className="text-gray-400 pl-11 opacity-0 translate-y-[-2px] group-hover/msg:opacity-100 group-hover/msg:translate-y-0 transition-all duration-200" style={{ fontSize: '13px' }}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      </MessageContextMenu>
    );
  }

  // User message
  return (
    <MessageContextMenu ref={menuRef} messageId={message.id} content={message.content} timestamp={message.timestamp} isUser={true} isBookmarked={bookmarkedMessageIds.has(message.id)} onToggleBookmark={onToggleBookmark}>
    <div className="group/msg flex flex-col items-end gap-1">
      <div className="flex items-start gap-3 justify-end">
        <div className="relative bg-brand text-white rounded-[20px] rounded-tr-sm px-5 py-3.5 shadow-[0_1px_4px_rgba(32,76,199,0.2)] max-w-xl">
          {bookmarkedMessageIds.has(message.id) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1.5 -right-1.5 z-10"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-brand/20">
                <Star className="w-2.5 h-2.5 text-brand fill-brand" />
              </div>
            </motion.div>
          )}
          {/* Render the message text with @mention pills inlined. Splitting
              by newline first so multi-line sends keep their paragraph
              breaks, then letting renderChatMentions turn each @handle
              into a styled pill. On a brand-blue bubble we tweak the pill
              with a translucent white background so the colors still read
              against the dark backdrop without fighting the system palette. */}
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {message.content.split(/\r?\n/).map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {line.trim() === '' ? '\u00A0' : renderChatMentions(line)}
              </p>
            ))}
          </div>
        </div>
      </div>
      {/* Reactions — team-channel user bubbles get the same pill row +
          picker as team-authored messages, mirrored to the right so they
          read as "yours". The picker aligns its tray right-side to stay
          on-screen for the last user message. "Reply in thread" sits in
          the same row because the two are conceptual siblings (see the
          team-authored branch above for the rationale). */}
      {message.channel && (
        <div className="mt-2 flex items-center gap-2 flex-wrap justify-end">
          {!message.parentId && onOpenThread && (
            <button
              type="button"
              onClick={() => onOpenThread(message.id)}
              title="Reply in thread"
              aria-label="Reply in thread"
              className="opacity-0 group-hover/msg:opacity-100 inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
              style={{ fontSize: '11.5px' }}
            >
              <CornerDownRight className="w-3 h-3" strokeWidth={2.2} />
              <span style={{ fontWeight: 500 }}>Reply in thread</span>
            </button>
          )}
          <ReactionPillRow
            reactions={message.reactions}
            onToggle={(emoji) => onToggleReaction(message.id, emoji)}
            alignRight
          />
          <ReactionPicker
            onPick={(emoji) => onToggleReaction(message.id, emoji)}
            hoverOnly
            alignRight
          />
        </div>
      )}
      {/* Thread summary strip — right-aligned so it hangs off the user
          bubble's edge, same visual language as the reactions row. */}
      {message.channel && !message.parentId && threadReplies && threadReplies.length > 0 && onOpenThread && (
        <div className={`mt-1 flex justify-end ${activeThreadRootId === message.id ? 'rounded-lg ring-1 ring-brand/20 bg-brand/5' : ''}`}>
          <ThreadSummaryStrip
            replies={threadReplies as ThreadMessage[]}
            onClick={() => onOpenThread(message.id)}
            alignRight
          />
        </div>
      )}
      {/* Timestamp — always visible but low-contrast so it reads as
          chrome, not content. Full date+time so users reviewing a thread
          days later can tell at a glance when they asked. */}
      <span className="text-gray-400 pr-1" style={{ fontSize: '11px', fontWeight: 500 }}>
        {formatMessageTime(message.timestamp)}
      </span>
    </div>
    </MessageContextMenu>
  );
}