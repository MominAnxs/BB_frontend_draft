/**
 * teamSeedMessages
 * ────────────────
 * Dummy but realistic conversation history for the Brego Team chat — so a
 * first-time user lands on a channel that already feels like a live
 * workspace instead of an empty shell.
 *
 * What we seed:
 *   • #announcements  — a short, mostly-recent run of product / release
 *                       notes from the Brego Team. One-way broadcasts.
 *   • #discussions    — a mixed back-and-forth with the Brego growth team,
 *                       spread across the last four days. Includes a file
 *                       upload (for the Media tab) and an external link
 *                       (also Media).
 *
 * Roster in discussions:
 *   • Tejas Atha — COO. Chimes in across services with light strategic
 *                   pickup notes. Doesn't own day-to-day execution.
 *   • Zubear Shaikh / Irshad Qureshi — Accounts & Taxation. Handle GST,
 *                   filing drafts, reconciliation.
 *   • Chinmay Pawar — Performance Marketing. Owns Meta / Google Ads,
 *                   CAC / ROAS, Performance Max pilots.
 *
 * Timestamps are relative to "now" so the chat always reads as fresh —
 * "today", "yesterday", "2d ago" etc. All minutes are offset so each day
 * renders in the correct order within the channel.
 *
 * Reactions are seeded on a handful of messages so the pill-row UI isn't
 * a dead feature on first paint.
 *
 * Deliberately decoupled from ChatInterface: we only depend on the
 * TeamChannelId type, and we export plain objects that match the host's
 * Message shape. The host casts them at the seed point — this keeps the
 * seed file small and free of the giant ChatInterface type graph.
 */

import type { TeamChannelId } from './TeamChatSidebar';

/**
 * Reaction as stored on a Message. `users` holds opaque handles — the
 * special value `'you'` represents the current user so toggling doesn't
 * need to thread userInfo through the render tree. Everything else is a
 * teammate handle (`zubear`, `irshad`, `tejas`, `chinmay`, or a freeform
 * label).
 */
export interface MessageReaction {
  emoji: string;
  users: string[];
}

/**
 * The Brego Team "voices" that author seeded messages. Kept as a small
 * enumerated set so the display strings stay on-brand and so the seed
 * reads like a recognisable team, not a faceless bot.
 *
 * Division of labour:
 *   • `tejas`     — COO, cross-service strategic input
 *   • `zubear`    — Accounts & Taxation Lead
 *   • `irshad`    — Accounts & Taxation Specialist
 *   • `chinmay`   — Performance Marketing Lead
 *   • `brego-team`— Official broadcast voice (announcements channel)
 */
export type TeamAuthor = 'zubear' | 'irshad' | 'tejas' | 'chinmay' | 'brego-team';

export interface TeamAuthorMeta {
  id: TeamAuthor;
  name: string;
  role: string;
  /** Two-char avatar fallback. Keeps the visual consistent with the teammate
   *  chips used elsewhere. */
  initials: string;
  /** Tailwind gradient classes — for the small circular avatar on bubbles. */
  gradient: string;
}

export const TEAM_AUTHORS: Record<TeamAuthor, TeamAuthorMeta> = {
  zubear: {
    id: 'zubear',
    name: 'Zubear Shaikh',
    role: 'Accounts & Taxation Lead',
    initials: 'Z',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  irshad: {
    id: 'irshad',
    name: 'Irshad Qureshi',
    role: 'Accounts & Taxation Specialist',
    initials: 'I',
    gradient: 'from-sky-500 to-blue-600',
  },
  tejas: {
    id: 'tejas',
    name: 'Tejas Atha',
    // COO — shown with a warmer, more executive gradient so he visually
    // reads as senior relative to the service leads.
    role: 'COO',
    initials: 'T',
    gradient: 'from-amber-500 to-orange-600',
  },
  chinmay: {
    id: 'chinmay',
    name: 'Chinmay Pawar',
    role: 'Performance Marketing Lead',
    initials: 'C',
    gradient: 'from-violet-500 to-purple-600',
  },
  'brego-team': {
    id: 'brego-team',
    name: 'Brego Team',
    role: 'Official Updates',
    initials: 'B',
    gradient: 'from-emerald-500 to-teal-600',
  },
};

/** Shape of each entry returned by `buildTeamSeedMessages` — mirrors the
 *  Message interface from ChatInterface so the host can spread them
 *  directly. `component`/`data` are loose on purpose (kept as `string` /
 *  `Record<string, unknown>`) since the ChatInterface side owns the richer
 *  union types and we want to stay decoupled.
 *
 *  `parentId` — when set, this message is a *thread reply* to another
 *  message, Slack-style. The parent stays in the channel view; replies
 *  are hidden from the main channel and only appear inside the thread
 *  pane. See ThreadPane.tsx for the rendering side of this contract. */
export interface SeededMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
  channel: TeamChannelId;
  from: 'user' | 'team';
  author?: TeamAuthor;
  component?: string;
  data?: Record<string, unknown>;
  reactions?: MessageReaction[];
  parentId?: string;
}

/* ── Timestamp helpers ──────────────────────────────────────────────────
 *
 * Relative offsets produce a feed that always reads as "fresh" regardless
 * of the real calendar date. Minute granularity is coarse on purpose — we
 * want the timestamps to feel human, not synthetic.
 * ───────────────────────────────────────────────────────────────────── */

function daysAgo(days: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/* ── Seed builder ───────────────────────────────────────────────────── */

/**
 * Build the dummy conversation.
 * @param firstName Current user's first name — used inside the welcome
 *   / greeting messages so the seeded chat feels personalised rather than
 *   copy-pasted. Falls back gracefully to "there" if missing.
 */
export function buildTeamSeedMessages(firstName?: string): SeededMessage[] {
  const name = (firstName && firstName.trim()) || 'there';

  /*
   * Note on the selection below: these ids are also referenced by
   * `DEFAULT_STARRED_MESSAGE_IDS` (exported at the bottom of this file) to
   * pre-populate the Starred tab on a first visit. If you rename or delete
   * one of them, update that list too or the Starred view will silently
   * drop the entry.
   */
  const msgs: SeededMessage[] = [
    /* ─────────── #announcements (broadcast-only) ─────────── */
    {
      id: 'seed-ann-01',
      type: 'system',
      content:
        '📦 **Release 2.18** is live — daily data reconciliation is now **4× faster**, and the Finance dashboard loads in under 1.2s on first paint.\n\nNo action needed. Everything just got quicker.',
      timestamp: daysAgo(3, 9, 30),
      channel: 'announcements',
      from: 'team',
      author: 'brego-team',
      reactions: [{ emoji: '🎉', users: ['zubear', 'irshad', 'you'] }],
    },
    {
      id: 'seed-ann-02',
      type: 'system',
      content:
        '🛠️ **Scheduled maintenance** — Saturday 23:00–23:45 IST. Dashboards may be read-only during this window. No data loss expected.',
      timestamp: daysAgo(2, 14, 5),
      channel: 'announcements',
      from: 'team',
      author: 'brego-team',
    },
    {
      id: 'seed-ann-03',
      type: 'system',
      content:
        '✅ **Meta Ads API upgrade** complete. All connected accounts are re-synced and backfilled for the last 90 days. You should see a small jump in historical spend numbers — that\'s the upgrade catching events Meta previously dropped.',
      timestamp: daysAgo(1, 10, 45),
      channel: 'announcements',
      from: 'team',
      author: 'brego-team',
      reactions: [
        { emoji: '👍', users: ['you', 'tejas'] },
        { emoji: '🙌', users: ['chinmay'] },
      ],
    },
    {
      id: 'seed-ann-04',
      type: 'system',
      content:
        '🚀 **New dashboards** for Trading & Manufacturing customers are rolling out this week. If you run a trading or manufacturing business, ping us in #discussions to enable yours early.',
      timestamp: daysAgo(0, 9, 15),
      channel: 'announcements',
      from: 'team',
      author: 'brego-team',
    },

    /* ─────────── #discussions (mixed conversation) ─────────── */

    // 4 days ago — user reports a marketing problem, Chinmay (Performance
    // Marketing Lead) owns the fix, Tejas (COO) chimes in with a light
    // strategic nod at the end so the cross-service hierarchy reads right.
    {
      id: 'seed-disc-01',
      type: 'user',
      content:
        `Hey team — seeing a CAC spike on our prospecting campaigns over the last few days. Can someone take a look when you get a sec?`,
      timestamp: daysAgo(4, 10, 12),
      channel: 'discussions',
      from: 'user',
    },
    {
      id: 'seed-disc-02',
      type: 'system',
      content:
        `On it, ${name} — pulling the numbers now. Which platforms, and what date range are you looking at?`,
      timestamp: daysAgo(4, 10, 18),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
    },
    {
      id: 'seed-disc-03',
      type: 'user',
      content: 'Last 7 days, Meta only. Google looks normal.',
      timestamp: daysAgo(4, 10, 21),
      channel: 'discussions',
      from: 'user',
    },
    {
      id: 'seed-disc-04',
      type: 'system',
      content:
        'Found it. Your top lookalike audience hit its budget cap Tuesday and auto-paused — prospecting fell back to broader cold audiences which always cost more. Reactivated the cap-hit set and pushed **3 new lookalikes** as insurance. Let\'s watch it for 24h.',
      timestamp: daysAgo(4, 11, 22),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
      reactions: [
        { emoji: '🙌', users: ['you', 'tejas'] },
        { emoji: '👍', users: ['zubear'] },
      ],
    },
    {
      id: 'seed-disc-04b',
      type: 'system',
      content:
        'Great pickup, Chinmay. Let\'s also set a soft-alert on the lookalike cap so we catch this before the CAC blips next time.',
      timestamp: daysAgo(4, 11, 40),
      channel: 'discussions',
      from: 'team',
      author: 'tejas',
      reactions: [{ emoji: '👍', users: ['chinmay', 'you'] }],
    },

    // 3 days ago — Chinmay follows up with a ROAS win.
    {
      id: 'seed-disc-05',
      type: 'system',
      content:
        '📊 **ROAS update** overnight: **3.2×** yesterday vs a **2.4× baseline**. The new lookalikes are already pulling weight. Keeping an eye — will share a proper recap Friday.',
      timestamp: daysAgo(3, 9, 5),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
      reactions: [
        { emoji: '🎉', users: ['you'] },
        { emoji: '🔥', users: ['tejas', 'zubear'] },
      ],
    },
    {
      id: 'seed-disc-06',
      type: 'user',
      content: 'Love that. Thanks for jumping on it so fast 🙏',
      timestamp: daysAgo(3, 9, 12),
      channel: 'discussions',
      from: 'user',
    },

    // 2 days ago — Zubear (Accounts & Taxation Lead) owns the GST flow.
    {
      id: 'seed-disc-07',
      type: 'system',
      content:
        `Quick heads-up, ${name} — the **GST filing deadline for Q4** is the 20th. Want us to draft and share for your review before we file?`,
      timestamp: daysAgo(2, 16, 40),
      channel: 'discussions',
      from: 'team',
      author: 'zubear',
    },
    {
      id: 'seed-disc-08',
      type: 'user',
      content: 'Yes please — draft and send over when ready.',
      timestamp: daysAgo(2, 16, 55),
      channel: 'discussions',
      from: 'user',
    },
    {
      id: 'seed-disc-09',
      type: 'system',
      content: 'Perfect. Will share the draft by EOD tomorrow.',
      timestamp: daysAgo(2, 17, 10),
      channel: 'discussions',
      from: 'team',
      author: 'zubear',
    },

    // 1 day ago — Zubear ships the draft (file upload → populates Media
    // tab), Irshad verifies the reconciliation, then user signs off and
    // Zubear files. Putting the sharing-message text into `note` so it
    // renders inside the file-upload card (the card ignores the top-level
    // `content`). Folder path / service metadata reflect the Accounts &
    // Taxation service.
    {
      id: 'seed-disc-10',
      type: 'system',
      content: 'Sharing the GST-Q4 draft for review.',
      timestamp: daysAgo(1, 11, 30),
      channel: 'discussions',
      from: 'team',
      author: 'zubear',
      component: 'file-upload',
      data: {
        fileName: 'GST-Q4-Draft.pdf',
        fileSize: '1.4 MB',
        fileType: 'PDF',
        uploadType: 'file',
        folderPath: 'Accounts & Taxation / GST / Q4',
        service: 'Accounts & Taxation',
        folderId: 'gst-q4',
        serviceKey: 'accounts',
        note: 'Full return plus a one-page summary on page 1. Let me know if anything looks off.',
      },
    },
    {
      id: 'seed-disc-10b',
      type: 'system',
      content:
        'I\'ve verified the reconciliation against the bank statements — input tax credit and sales totals tie out. ✅ Ready for filing once you sign off.',
      timestamp: daysAgo(1, 11, 48),
      channel: 'discussions',
      from: 'team',
      author: 'irshad',
      reactions: [{ emoji: '👍', users: ['zubear', 'you'] }],
    },
    {
      id: 'seed-disc-11',
      type: 'user',
      content: 'Looks good — signing off. Go ahead and file.',
      timestamp: daysAgo(1, 12, 5),
      channel: 'discussions',
      from: 'user',
      reactions: [{ emoji: '👍', users: ['zubear'] }],
    },
    {
      id: 'seed-disc-12',
      type: 'system',
      content: 'Filing now. You\'ll get the acknowledgement in your inbox within the hour.',
      timestamp: daysAgo(1, 12, 6),
      channel: 'discussions',
      from: 'team',
      author: 'zubear',
    },

    // Today — fresh activity. Chinmay proposes a Performance Max pilot,
    // user says yes, Tejas adds a COO-level "good call" comment on the
    // parallel-baseline approach, Chinmay ships. Reads as cross-service
    // collaboration without Tejas stepping on the execution.
    {
      id: 'seed-disc-13',
      type: 'system',
      content:
        'Heads up — Google Ads just rolled out their **new Performance Max** creative format. Want me to pilot it on Campaign X at a small daily cap (~$200/day) to see if it lifts CTR?',
      timestamp: daysAgo(0, 9, 12),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
    },
    {
      id: 'seed-disc-14',
      type: 'user',
      content: 'Let\'s do it. $200/day sounds right — keep the existing campaign running in parallel.',
      timestamp: daysAgo(0, 9, 15),
      channel: 'discussions',
      from: 'user',
    },
    {
      id: 'seed-disc-14b',
      type: 'system',
      content:
        'Good call running the baseline in parallel — gives us a clean read on whether PMax actually lifts performance or just reshuffles spend. 👍',
      timestamp: daysAgo(0, 9, 15),
      channel: 'discussions',
      from: 'team',
      author: 'tejas',
    },
    {
      id: 'seed-disc-15',
      type: 'system',
      content: 'On it 🚀 Spinning up the pilot now. Will share a 7-day readout next Monday.',
      timestamp: daysAgo(0, 9, 16),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
      reactions: [{ emoji: '🔥', users: ['you', 'tejas'] }],
    },

    // Link share — feeds the Media tab's Links sub-filter. Still a
    // marketing / PMax topic so this belongs with Chinmay.
    {
      id: 'seed-disc-16',
      type: 'system',
      content:
        'For anyone curious about the PMax change, here\'s a decent write-up → https://brego.io/blog/pmax-launch-playbook',
      timestamp: daysAgo(0, 14, 2),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
    },

    /* ─────────── Thread replies ────────────────────────────────────────
     *
     * Two realistic threads demonstrate how side-conversations branch off
     * a main channel message without polluting the flow. Each reply carries
     * `parentId` pointing at its thread root; the host filters these out of
     * the main channel view and only renders them inside ThreadPane.
     *
     * Thread A — replies on seed-disc-13 (Chinmay's PMax pilot proposal).
     * Mixed back-and-forth that shows a natural stakeholder question ladder:
     * user asks about risk, Chinmay quantifies, Tejas (COO) adds a
     * monitoring guard-rail, Chinmay commits to a daily readout cadence.
     *
     * Thread B — replies on seed-disc-10 (Zubear's GST draft upload).
     * A compliance-detail question kicks off; Irshad explains the new ITC
     * rule, Zubear wraps with the remediation plan. Tight, factual,
     * information-dense — exactly the content that shouldn't clutter the
     * main channel but needs to live somewhere.
     * ───────────────────────────────────────────────────────────────── */

    // Thread A — on seed-disc-13 (PMax pilot proposal, today)
    {
      id: 'seed-thread-13-r1',
      type: 'user',
      content: "Quick one — what CPA range should I expect during the first 7 days while it's learning?",
      timestamp: daysAgo(0, 9, 18),
      channel: 'discussions',
      from: 'user',
      parentId: 'seed-disc-13',
    },
    {
      id: 'seed-thread-13-r2',
      type: 'system',
      content:
        "Good question. Based on similar PMax pilots we've run, expect CPA ~15-20% above baseline days 1-3 while the algorithm is learning, then converging to baseline by day 5-6. By day 7 you should be at baseline or slightly better. Anything worse than **+30% on day 3** is my signal to pause.",
      timestamp: daysAgo(0, 9, 24),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
      parentId: 'seed-disc-13',
      reactions: [{ emoji: '👍', users: ['you', 'tejas'] }],
    },
    {
      id: 'seed-thread-13-r3',
      type: 'system',
      content:
        "Let's also set an alert on day 2 spend pacing — if it burns through >60% of the daily cap before noon two days running, I'd rather catch it early than find out Friday afternoon.",
      timestamp: daysAgo(0, 9, 31),
      channel: 'discussions',
      from: 'team',
      author: 'tejas',
    },
    {
      id: 'seed-thread-13-r4',
      type: 'system',
      content:
        "Will do. I'll also drop a 2-line daily readout in this thread — CPA, CTR, pacing — so you both have a single place to check.",
      timestamp: daysAgo(0, 9, 34),
      channel: 'discussions',
      from: 'team',
      author: 'chinmay',
      parentId: 'seed-disc-13',
      reactions: [{ emoji: '🙌', users: ['you'] }],
    },
    {
      id: 'seed-thread-13-r5',
      type: 'user',
      content: 'Perfect, thanks both 🙏',
      timestamp: daysAgo(0, 9, 36),
      channel: 'discussions',
      from: 'user',
      parentId: 'seed-disc-13',
    },

    // Thread B — on seed-disc-10 (GST draft upload, 1 day ago)
    {
      id: 'seed-thread-10-r1',
      type: 'user',
      content:
        'One thing — the ITC number on page 3 looks lower than last quarter. Is that just the new rules, or did something change on our side?',
      timestamp: daysAgo(1, 11, 42),
      channel: 'discussions',
      from: 'user',
      parentId: 'seed-disc-10',
    },
    {
      id: 'seed-thread-10-r2',
      type: 'system',
      content:
        "New rules — nothing on your side. From Oct 1, ITC can only be claimed on invoices where the vendor has actually filed their GSTR-1. So we've provisionally parked **~₹80K** of credit against 4 vendors whose filings are still pending. The moment they file, that credit unlocks automatically next cycle.",
      timestamp: daysAgo(1, 11, 55),
      channel: 'discussions',
      from: 'team',
      author: 'irshad',
      parentId: 'seed-disc-10',
      reactions: [{ emoji: '👍', users: ['you', 'zubear'] }],
    },
    {
      id: 'seed-thread-10-r3',
      type: 'system',
      content:
        "I've already flagged the 4 vendors and our team is chasing their accountants this week. Based on past patterns most file within 10-15 days of the deadline, so we should see the parked ITC unlock by end of month. I'll ping here when it does.",
      timestamp: daysAgo(1, 12, 0),
      channel: 'discussions',
      from: 'team',
      author: 'zubear',
      parentId: 'seed-disc-10',
    },
    {
      id: 'seed-thread-10-r4',
      type: 'user',
      content: 'Got it, thanks for the context — makes sense.',
      timestamp: daysAgo(1, 12, 2),
      channel: 'discussions',
      from: 'user',
      parentId: 'seed-disc-10',
    },
  ];

  return msgs;
}

/**
 * Message ids that should be pre-starred the first time a user lands on
 * the Starred tab. We keep this list here — next to the seed itself — so
 * ids can never drift out of sync with the seeded content.
 *
 * Selection rationale: five messages, spread deliberately so the tab
 * shows off its range on first render rather than looking like five
 * copies of the same thing.
 *
 *   • seed-ann-03         — Meta Ads API upgrade. A release note users
 *                            come back to weeks later ("why did spend jump?").
 *   • seed-disc-04        — Chinmay's CAC-spike root-cause + fix. The
 *                            kind of diagnosis teams bookmark so they can
 *                            point newcomers at it.
 *   • seed-disc-10        — The GST-Q4 draft file upload. Proves the view
 *                            handles attachment rows, not just plain text.
 *   • seed-thread-10-r2   — Irshad's new-ITC-rule explainer. A compliance
 *                            reference that's easier to re-find than to
 *                            re-derive. Also shows a thread reply can be
 *                            starred, not just channel roots.
 *   • seed-thread-13-r2   — Chinmay's CPA-learning expectations for the
 *                            PMax pilot. Concrete numbers worth keeping
 *                            one tap away while the pilot runs.
 *
 * Users can unstar any of these and the removal persists through
 * localStorage — see the `brego_bookmarked_messages` handling in
 * ChatInterface. This list is only consulted on *first* visit.
 */
export const DEFAULT_STARRED_MESSAGE_IDS: readonly string[] = [
  'seed-ann-03',
  'seed-disc-04',
  'seed-disc-10',
  'seed-thread-10-r2',
  'seed-thread-13-r2',
];
