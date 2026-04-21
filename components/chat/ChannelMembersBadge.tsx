'use client';

// ─── Channel Members Badge ───────────────────────────────────────────
// Compact overlapping-avatar stack that lives in the team channel header,
// next to the Online pill. Hovering it reveals a popover split into two
// clearly labelled sections:
//   1. Your team — people the user invited and who accepted.
//   2. Brego team — the Brego specialists serving the active service.
//
// Intent: answer "who's actually in this room?" at a glance, without
// adding a full roster pane or another header-level button. The hover
// pattern matches how Slack / Linear surface channel members, which is
// the mental model our users already have.
//
// The popover is portalled into document.body so it can't be clipped or
// stacked-under by the chat transcript's mask-image / overflow-y-auto
// container. Position is computed from the trigger's bounding rect on
// open (and kept fresh on scroll/resize) rather than anchored with CSS.

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Building2, Users } from 'lucide-react';
import { type TeamMember } from '../workspace/AssigneePickerPopover';

export interface ChannelMembersBadgeProps {
  /** Members the user invited who have accepted. Shown under "Your team". */
  myTeam: TeamMember[];
  /** Brego specialists on this account. Shown under "Brego team". */
  bregoTeam: TeamMember[];
  /** Triggered when the user clicks the invite affordance inside the popover. */
  onInvite?: () => void;
}

// How many avatars to stack visibly before collapsing into a "+N" chip.
// Three reads as a crowd without eating header real estate; anything more
// makes the stack drift into the channel title area.
const MAX_VISIBLE = 3;
const POPOVER_WIDTH = 280;

// ─── Brego channel roster ────────────────────────────────────────────
// The people the user *actually* sees posting across the channels — one
// unified Brego roster, service-agnostic, so transparency is absolute:
// the user can see every Brego person on their account at a glance,
// regardless of which service module they're currently in.
//
// Kept separate from AssigneePickerPopover's BREGO_AT_TEAM / BREGO_PM_TEAM
// (which are a larger pool used for task assignment) so the "who's in this
// room?" popover stays tight and matches the chat cast 1:1.
//
// Order: Founder → COO → Accounts & Taxation (Lead → Specialists) →
// Performance Marketing (Lead → Specialists). This mirrors the chain of
// responsibility so the list reads as an org chart, not a random roster.

export const BREGO_CHANNEL_TEAM: TeamMember[] = [
  { name: 'Mihir Lunia', initials: 'ML', color: '#0F172A', role: 'Founder' },
  { name: 'Tejas Atha', initials: 'TA', color: '#EA580C', role: 'COO' },
  { name: 'Zubear Shaikh', initials: 'ZS', color: '#C026D3', role: 'Accounts & Taxation Lead' },
  { name: 'Irshad Qureshi', initials: 'IQ', color: '#2563EB', role: 'Accounts & Taxation Specialist' },
  { name: 'Suman Shetty', initials: 'SS', color: '#059669', role: 'Accounts & Taxation Specialist' },
  { name: 'Chinmay Pawar', initials: 'CP', color: '#7C3AED', role: 'Performance Marketing Lead' },
  { name: 'Amisha Jain', initials: 'AJ', color: '#DC2626', role: 'Performance Marketing Specialist' },
  { name: 'Piyush Sharma', initials: 'PS', color: '#0891B2', role: 'Performance Marketing Specialist' },
];

function Avatar({ member, ring = true }: { member: TeamMember; ring?: boolean }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center ${ring ? 'ring-2 ring-white' : ''}`}
      style={{
        backgroundColor: member.color,
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 600,
      }}
      title={member.name}
      aria-label={member.name}
    >
      {member.initials}
    </div>
  );
}

// One row in the popover — avatar + name + role. Kept tight so both
// sections stay visible in a single glance instead of scrolling.
function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 transition-colors">
      <div className="relative flex-shrink-0">
        <Avatar member={member} ring={false} />
        {/* Simulated presence dot — everyone's online for now. Matches the
            channel-level Online pill so the signals don't contradict. */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-gray-900" style={{ fontSize: '13px', fontWeight: 500 }}>
          {member.name}
        </p>
        {member.role && (
          <p className="truncate text-gray-500" style={{ fontSize: '11px' }}>
            {member.role}
          </p>
        )}
      </div>
    </div>
  );
}

export function ChannelMembersBadge({
  myTeam,
  bregoTeam,
  onInvite,
}: ChannelMembersBadgeProps) {
  // Hover interaction with a short open/close delay — keeps the popover
  // stable when the user's cursor traverses the gap between trigger and
  // popover, a classic hover-menu pitfall.
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SSR guard — `createPortal` needs `document`, which only exists after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Recompute popover anchor coordinates relative to the viewport. The
  // popover pins to the trigger's right edge, 8px below. Clamped to the
  // viewport's right so it never clips off-screen on narrow windows.
  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rightEdge = rect.right;
    const left = Math.min(
      rightEdge - POPOVER_WIDTH,
      window.innerWidth - POPOVER_WIDTH - 12,
    );
    setPosition({ top: rect.bottom + 8, left: Math.max(12, left) });
  }, []);

  // Keep coordinates fresh while the popover is open — the user may
  // scroll the page or resize the window during interaction.
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, updatePosition]);

  const scheduleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 80);
  };
  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Dismiss on Escape for keyboard parity.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Combine for the visible avatar stack: Brego first (always present) then
  // Your team (variable). Limits to MAX_VISIBLE so the stack is scannable.
  const combined = [...bregoTeam, ...myTeam];
  const visible = combined.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, combined.length - MAX_VISIBLE);
  const total = combined.length;

  return (
    <div
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger — overlapping avatar stack + "+N" chip if needed.
          Pulls in-line with the Online pill next to it so the header
          reads as one horizontal strip of channel meta. */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${total} member${total === 1 ? '' : 's'} in this channel`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          updatePosition();
          setOpen((v) => !v);
        }}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
        className="flex items-center rounded-full hover:bg-gray-100/80 px-1 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <div className="flex items-center">
          {visible.map((m, i) => (
            <div key={`${m.section ?? 'brego'}-${m.name}`} style={{ marginLeft: i === 0 ? 0 : -6 }}>
              <Avatar member={m} />
            </div>
          ))}
          {overflow > 0 && (
            <div
              style={{ marginLeft: -6 }}
              className="w-6 h-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <span style={{ fontSize: '11px', fontWeight: 600 }}>+{overflow}</span>
            </div>
          )}
        </div>
      </button>

      {/* Portal popover — lives in document.body so the chat transcript's
          mask-image + overflow containers can't clip it. Position is a
          viewport-anchored fixed rectangle computed from the trigger's
          bounding rect, so stacking contexts elsewhere don't matter. */}
      {mounted && position
        ? createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'fixed',
                    top: position.top,
                    left: position.left,
                    width: POPOVER_WIDTH,
                    zIndex: 10000,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)',
                  }}
                  className="rounded-xl bg-white border border-gray-200/70 overflow-hidden"
                  onMouseEnter={scheduleOpen}
                  onMouseLeave={scheduleClose}
                  role="dialog"
                >
                  {/* Compact summary strip so users know the total at a glance. */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 500 }}>
                      {total} member{total === 1 ? '' : 's'} in this channel
                    </span>
                  </div>

                  {/* Your team */}
                  <div className="py-1">
                    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                      <Users className="w-3 h-3 text-gray-400" strokeWidth={2.2} />
                      <span className="text-[10px] uppercase tracking-wider text-gray-500" style={{ fontWeight: 600 }}>
                        Your team
                      </span>
                      <span className="ml-auto text-gray-400" style={{ fontSize: '11px' }}>
                        {myTeam.length}
                      </span>
                    </div>
                    {myTeam.length === 0 ? (
                      // Empty state doubles as an invite nudge — the most
                      // useful follow-up when the user has no teammates yet.
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onInvite?.();
                        }}
                        className="mx-3 mb-1.5 mt-0.5 w-[calc(100%-24px)] flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-gray-600 hover:bg-brand/5 hover:text-brand transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>Invite team members</span>
                      </button>
                    ) : (
                      <div className="max-h-[168px] overflow-y-auto">
                        {myTeam.map((m) => (
                          <MemberRow key={`my-${m.name}`} member={m} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brego team */}
                  <div className="py-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                      <Building2 className="w-3 h-3 text-gray-400" strokeWidth={2.2} />
                      <span className="text-[10px] uppercase tracking-wider text-gray-500" style={{ fontWeight: 600 }}>
                        Brego team
                      </span>
                      <span className="ml-auto text-gray-400" style={{ fontSize: '11px' }}>
                        {bregoTeam.length}
                      </span>
                    </div>
                    <div className="max-h-[192px] overflow-y-auto">
                      {bregoTeam.map((m) => (
                        <MemberRow key={`brego-${m.name}`} member={m} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
