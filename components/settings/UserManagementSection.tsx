'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Users, UserPlus, Search, MoreHorizontal, Shield, Eye, Pencil,
  Mail, Send, X, Check, ChevronDown, Loader2, RefreshCw,
  UserX, UserCheck, Trash2, Crown, Copy, CheckCircle2, AlertTriangle,
  Clock, ArrowUpRight, Info, MessageSquare, BarChart3, Briefcase,
  Database, Minus, CreditCard, Building2,
} from 'lucide-react';
import { UserInfo } from '../../types';

// ── Types ──
type Role = 'Admin' | 'Editor' | 'Viewer';
type Status = 'Active' | 'Pending' | 'Deactivated';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: Status;
  isOwner: boolean;
  avatarGradient: string;
  joinedDate: string;
  lastActive?: string;
  inviteSentAt?: string;  // ISO timestamp for pending invites
}

// ── Stagger wrapper ──
function StaggerItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

// ── Role badge colors ──
const roleBadge: Record<Role, { bg: string; text: string; border: string }> = {
  Admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  Editor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  Viewer: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

const statusBadge: Record<Status, { bg: string; text: string; border: string; dot: string }> = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
  Deactivated: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' },
};

// ── Role description ──
const roleDescriptions: Record<Role, string> = {
  Admin: 'Full access to all settings, billing, and team management',
  Editor: 'Can manage campaigns, view reports, and edit content',
  Viewer: 'Read-only access to dashboards and reports',
};

// ── Avatar gradient pool ──
const gradients = [
  'from-gray-900 to-gray-700',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];

// ── Time ago helper ──
function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// ── Permission level indicator ──
type PermLevel = 'full' | 'view' | 'none';

function PermissionIndicator({ level }: { level: PermLevel }) {
  if (level === 'full')
    return (
      <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
    );
  if (level === 'view')
    return (
      <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
        <Eye className="w-3 h-3 text-blue-500" />
      </div>
    );
  return (
    <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
      <Minus className="w-3 h-3 text-gray-400" />
    </div>
  );
}

// ── Permissions Matrix Data ──
// One row per real top-level area in the app. The permission model is
// intentionally minimal: work modules (Chat / Reports / Workspace / Dataroom)
// are usable by Editors and read-only for Viewers; admin-only areas (Team,
// Billing, Business) are reserved for Admins. Everything else (editing your
// own profile, notification prefs) is universally allowed and therefore
// isn't a "permission" — it stays out of the matrix by design.
type PermissionRow = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  admin: PermLevel;
  editor: PermLevel;
  viewer: PermLevel;
  /** Visual break above this row (separates work vs admin-only areas). */
  groupStart?: boolean;
};

const permissionsMatrix: readonly PermissionRow[] = [
  // Work modules — everyday surfaces that most team members use.
  { label: 'Chat',              icon: MessageSquare, admin: 'full', editor: 'full', viewer: 'view' },
  { label: 'Reports',           icon: BarChart3,     admin: 'full', editor: 'full', viewer: 'view' },
  { label: 'Workspace',         icon: Briefcase,     admin: 'full', editor: 'full', viewer: 'view' },
  { label: 'Dataroom',          icon: Database,      admin: 'full', editor: 'full', viewer: 'view' },
  // Admin-only — account-level controls reserved for Admins.
  { label: 'Invite team members', icon: Users,       admin: 'full', editor: 'none', viewer: 'none', groupStart: true },
  { label: 'Billing & Plan',    icon: CreditCard,    admin: 'full', editor: 'none', viewer: 'none' },
  { label: 'Business Settings', icon: Building2,     admin: 'full', editor: 'none', viewer: 'none' },
];

// ── Invite Modal ──
function InviteModal({ open, onClose, onInvite, seatLimit, currentCount }: {
  open: boolean;
  onClose: () => void;
  onInvite: (emails: string[], role: Role, message: string) => void;
  seatLimit: number;
  currentCount: number;
}) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('Viewer');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [emailError, setEmailError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const seatsRemaining = seatLimit - currentCount;

  // Close role dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    if (showRoleDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRoleDropdown]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const addEmail = useCallback(() => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!validateEmail(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setEmailError('This email has already been added');
      return;
    }
    if (emails.length >= seatsRemaining) {
      setEmailError(`You can only invite ${seatsRemaining} more member${seatsRemaining !== 1 ? 's' : ''}`);
      return;
    }
    setEmails(prev => [...prev, trimmed]);
    setEmailInput('');
    setEmailError('');
  }, [emailInput, emails, seatsRemaining]);

  const removeEmail = (email: string) => {
    setEmails(prev => prev.filter(e => e !== email));
    setEmailError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && !emailInput && emails.length) {
      setEmails(prev => prev.slice(0, -1));
    }
  };

  const handleSend = () => {
    if (!emails.length) {
      setEmailError('Add at least one email address');
      return;
    }
    setSending(true);
    setTimeout(() => {
      onInvite(emails, selectedRole, personalMessage);
      setSending(false);
      // Reset
      setEmails([]);
      setEmailInput('');
      setSelectedRole('Viewer');
      setPersonalMessage('');
      setEmailError('');
    }, 1200);
  };

  const handleClose = () => {
    if (sending) return;
    setEmails([]);
    setEmailInput('');
    setSelectedRole('Viewer');
    setPersonalMessage('');
    setEmailError('');
    onClose();
  };

  const assignableRoles: Role[] = ['Editor', 'Viewer'];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[520px] bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-blue-50/40 to-indigo-50/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{seatsRemaining} seat{seatsRemaining !== 1 ? 's' : ''} remaining on your plan</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Email Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email Addresses
                </label>
                <div
                  className={`min-h-[44px] px-3 py-2 bg-gray-50/80 border rounded-xl flex flex-wrap items-center gap-1.5 cursor-text transition-all duration-200 ${
                    emailError ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300'
                  }`}
                  onClick={() => inputRef.current?.focus()}
                >
                  <AnimatePresence>
                    {emails.map(email => (
                      <motion.span
                        key={email}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
                      >
                        {email}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
                          className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input
                    ref={inputRef}
                    type="email"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => emailInput.trim() && addEmail()}
                    placeholder={emails.length ? 'Add another...' : 'Enter email addresses (press Enter to add)'}
                    className="flex-1 min-w-[180px] bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none py-0.5"
                  />
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {emailError}
                  </motion.p>
                )}
              </div>

              {/* Role Selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  Assign Role
                </label>
                <div className="relative" ref={roleDropdownRef}>
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 text-[13px] font-semibold rounded-md border ${roleBadge[selectedRole].bg} ${roleBadge[selectedRole].text} ${roleBadge[selectedRole].border}`}>
                        {selectedRole}
                      </span>
                      <span className="text-xs text-gray-500">{roleDescriptions[selectedRole]}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showRoleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                      >
                        {assignableRoles.map(role => (
                          <button
                            key={role}
                            onClick={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                              role === selectedRole ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[13px] font-semibold rounded-md border ${roleBadge[role].bg} ${roleBadge[role].text} ${roleBadge[role].border}`}>
                                  {role}
                                </span>
                                {role === selectedRole && <Check className="w-3.5 h-3.5 text-blue-600" />}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{roleDescriptions[role]}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  Personal Message
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a note to the invitation email..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 resize-none"
                />
              </div>

              {/* Info tip */}
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-blue-50/60 rounded-xl border border-blue-100/60">
                <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[13px] text-blue-600/80 leading-relaxed">
                  Invitees will receive an email with a link to join your workspace. They'll need to create an account or sign in to accept.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <button
                onClick={handleClose}
                disabled={sending}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSend}
                disabled={sending || !emails.length}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Invites...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invite{emails.length > 1 ? 's' : ''}{emails.length > 0 ? ` (${emails.length})` : ''}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Confirmation Dialog ──
function ConfirmDialog({ open, title, description, confirmLabel, confirmVariant, loading, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'danger' | 'primary';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-[400px] bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${confirmVariant === 'danger' ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Role Change Modal ──
function RoleChangeModal({ open, member, onClose, onConfirm }: {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onConfirm: (memberId: string, newRole: Role) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>('Viewer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) setSelectedRole(member.role);
  }, [member]);

  if (!open || !member) return null;

  const assignableRoles: Role[] = ['Editor', 'Viewer'];

  const handleConfirm = () => {
    if (selectedRole === member.role) {
      onClose();
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onConfirm(member.id, selectedRole);
      setSaving(false);
      onClose();
    }, 800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[420px] bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Change Role</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Update role for <span className="font-medium text-gray-700">{member.firstName} {member.lastName}</span>
          </p>
        </div>
        <div className="p-6 space-y-2">
          {assignableRoles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                role === selectedRole
                  ? 'border-blue-200 bg-blue-50/50 ring-1 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                role === 'Editor' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {role === 'Editor' ? <Pencil className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4 text-gray-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{role}</span>
                  {role === selectedRole && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  {role === member.role && (
                    <span className="text-[10px] text-gray-400 font-medium">Current</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{roleDescriptions[role]}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {saving ? 'Updating...' : 'Update Role'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Action menu for a member row ──
function MemberActionMenu({ member, onChangeRole, onResendInvite, onToggleActive, onRemove }: {
  member: TeamMember;
  onChangeRole: () => void;
  onResendInvite: () => void;
  onToggleActive: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (member.isOwner) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-[10px] text-gray-400 font-medium px-2 py-1 bg-gray-50 rounded-md">Owner</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
          open ? 'bg-gray-200' : 'hover:bg-gray-100'
        }`}
        whileTap={{ scale: 0.92 }}
        aria-label="User actions"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1"
          >
            {/* Change Role */}
            <button
              onClick={() => { setOpen(false); onChangeRole(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-gray-400" />
              Change Role
            </button>

            {/* Resend Invite - only for Pending */}
            {member.status === 'Pending' && (
              <button
                onClick={() => { setOpen(false); onResendInvite(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
                Resend Invitation
              </button>
            )}

            {/* Copy Email */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(member.email);
                toast.success('Email copied', { description: member.email, duration: 2000 });
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              Copy Email
            </button>

            <div className="my-1 border-t border-gray-100" />

            {/* Deactivate / Activate */}
            <button
              onClick={() => { setOpen(false); onToggleActive(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {member.status === 'Deactivated' ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  Reactivate User
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 text-amber-500" />
                  Deactivate User
                </>
              )}
            </button>

            {/* Remove */}
            <button
              onClick={() => { setOpen(false); onRemove(); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove from Team
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── MAIN COMPONENT ──
// ══════════════════════════════════════════════

interface UserManagementSectionProps {
  userInfo: UserInfo;
  autoOpenInvite?: boolean;
  onInviteOpened?: () => void;
}

export function UserManagementSection({ userInfo, autoOpenInvite = false, onInviteOpened }: UserManagementSectionProps) {
  const SEAT_LIMIT = 10; // from Professional plan

  // ── Team members state ──
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'owner-1',
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email || 'admin@company.com',
      role: 'Admin',
      status: 'Active',
      isOwner: true,
      avatarGradient: gradients[0],
      joinedDate: 'Jan 1, 2026',
      lastActive: 'Just now',
    },
    {
      id: 'member-2',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@company.com',
      role: 'Editor',
      status: 'Active',
      isOwner: false,
      avatarGradient: gradients[1],
      joinedDate: 'Jan 15, 2026',
      lastActive: '2 hours ago',
    },
    {
      id: 'member-3',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@company.com',
      role: 'Viewer',
      status: 'Pending',
      isOwner: false,
      avatarGradient: gradients[2],
      joinedDate: 'Feb 10, 2026',
      inviteSentAt: '2026-02-10T14:30:00Z',
    },
  ]);

  // ── UI state ──
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'All'>('All');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const roleFilterRef = useRef<HTMLDivElement>(null);

  // ── Modals ──
  const [roleChangeTarget, setRoleChangeTarget] = useState<TeamMember | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'deactivate' | 'reactivate';
    member: TeamMember;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ── Auto-open invite from ProfileDropdown ──
  useEffect(() => {
    if (autoOpenInvite) {
      // Small delay so the tab switch animation completes first
      const timer = setTimeout(() => {
        setShowInviteModal(true);
        onInviteOpened?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoOpenInvite, onInviteOpened]);

  // Close role filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleFilterRef.current && !roleFilterRef.current.contains(e.target as Node)) setShowRoleFilter(false);
    };
    if (showRoleFilter) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRoleFilter]);

  // ── Filtered members ──
  const filteredMembers = members.filter(m => {
    const matchesSearch = !searchQuery ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ── Stats ──
  const activeCount = members.filter(m => m.status === 'Active').length;
  const pendingCount = members.filter(m => m.status === 'Pending').length;
  const pendingMembers = members.filter(m => m.status === 'Pending');

  // ── Handlers ──
  const handleInvite = (emails: string[], role: Role, message: string) => {
    const newMembers: TeamMember[] = emails.map((email, i) => {
      const parts = email.split('@')[0].split('.');
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Team';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Member';
      return {
        id: `member-${Date.now()}-${i}`,
        firstName,
        lastName,
        email,
        role,
        status: 'Pending' as Status,
        isOwner: false,
        avatarGradient: gradients[(members.length + i) % gradients.length],
        joinedDate: 'Feb 22, 2026',
        inviteSentAt: new Date().toISOString(),
      };
    });

    setMembers(prev => [...prev, ...newMembers]);
    setShowInviteModal(false);

    toast.success(
      emails.length === 1 ? 'Invitation sent' : `${emails.length} invitations sent`,
      {
        description: emails.length === 1
          ? `${emails[0]} will receive an invite as ${role}`
          : `Team members will receive invites as ${role}`,
        duration: 3000,
      }
    );
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    const member = members.find(m => m.id === memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    setRoleChangeTarget(null);
    toast.success('Role updated', {
      description: `${member?.firstName} ${member?.lastName} is now ${newRole === 'Editor' ? 'an' : 'a'} ${newRole}`,
      duration: 2500,
    });
  };

  const handleResendInvite = (member: TeamMember) => {
    toast.success('Invitation resent', {
      description: `A new invite email has been sent to ${member.email}`,
      duration: 2500,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    setConfirmLoading(true);

    setTimeout(() => {
      const { type, member } = confirmAction;

      if (type === 'remove') {
        setMembers(prev => prev.filter(m => m.id !== member.id));
        toast.success('Member removed', {
          description: `${member.firstName} ${member.lastName} has been removed from the team`,
          duration: 2500,
        });
      } else if (type === 'deactivate') {
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'Deactivated' as Status } : m));
        toast.success('User deactivated', {
          description: `${member.firstName} ${member.lastName}'s access has been suspended`,
          duration: 2500,
        });
      } else if (type === 'reactivate') {
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'Active' as Status } : m));
        toast.success('User reactivated', {
          description: `${member.firstName} ${member.lastName}'s access has been restored`,
          duration: 2500,
        });
      }

      setConfirmLoading(false);
      setConfirmAction(null);
    }, 800);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <StaggerItem index={0}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
            <p className="text-sm text-gray-500">Manage team members and their access levels</p>
          </div>
          <motion.button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            whileTap={{ scale: 0.97 }}
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </motion.button>
        </div>
      </StaggerItem>

      {/* Stats Bar */}
      <StaggerItem index={1}>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Members', value: members.length, icon: Users, color: 'blue' },
            { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'emerald' },
            { label: 'Pending Invites', value: pendingCount, icon: Clock, color: 'amber' },
            { label: 'Available Seats', value: SEAT_LIMIT - members.length, icon: ArrowUpRight, color: 'violet' },
          ].map((stat) => {
            const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
              blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
              emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
              amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
              violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
            };
            const c = colorMap[stat.color];
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-[13px] text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </StaggerItem>

      {/* Search + Filter Bar */}
      <StaggerItem index={2}>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
            />
          </div>
          <div className="relative" ref={roleFilterRef}>
            <button
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                filterRole !== 'All'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              {filterRole === 'All' ? 'All Roles' : filterRole}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoleFilter ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showRoleFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1"
                >
                  {(['All', 'Admin', 'Editor', 'Viewer'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => { setFilterRole(role); setShowRoleFilter(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        filterRole === role ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                      }`}
                    >
                      {role === 'All' ? 'All Roles' : role}
                      {filterRole === role && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </StaggerItem>

      {/* Team Members Table */}
      <StaggerItem index={3}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_120px_110px_60px] gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
            <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">User</span>
            <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Email</span>
            <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Role</span>
            <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Status</span>
            <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</span>
          </div>

          {/* Members List */}
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredMembers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No members found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </motion.div>
              ) : (
                filteredMembers.map((member, i) => {
                  const rb = roleBadge[member.role];
                  const sb = statusBadge[member.status];
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className={`grid grid-cols-[1fr_1fr_120px_110px_60px] gap-4 px-6 py-3.5 items-center group hover:bg-gray-50/40 transition-colors duration-150 ${
                        member.status === 'Deactivated' ? 'opacity-60' : ''
                      }`}
                    >
                      {/* User */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-sm`}>
                          {member.firstName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.firstName} {member.lastName}</p>
                            {member.isOwner && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[13px] text-gray-500">
                            {member.isOwner ? 'Owner' : 'Team Member'}
                            {member.lastActive && <span className="ml-1.5">&middot; {member.lastActive}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600 truncate">{member.email}</p>
                      </div>

                      {/* Role */}
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${rb.bg} ${rb.text} ${rb.border}`}>
                          {member.role === 'Admin' && <Shield className="w-3 h-3" />}
                          {member.role === 'Editor' && <Pencil className="w-3 h-3" />}
                          {member.role === 'Viewer' && <Eye className="w-3 h-3" />}
                          {member.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${sb.bg} ${sb.text} ${sb.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                          {member.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center">
                        <MemberActionMenu
                          member={member}
                          onChangeRole={() => setRoleChangeTarget(member)}
                          onResendInvite={() => handleResendInvite(member)}
                          onToggleActive={() => {
                            if (member.status === 'Deactivated') {
                              setConfirmAction({ type: 'reactivate', member });
                            } else {
                              setConfirmAction({ type: 'deactivate', member });
                            }
                          }}
                          onRemove={() => setConfirmAction({ type: 'remove', member })}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {filteredMembers.length} of {members.length} member{members.length !== 1 ? 's' : ''}
              {filterRole !== 'All' && ` (filtered by ${filterRole})`}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{members.length} / {SEAT_LIMIT} seats used</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${members.length / SEAT_LIMIT > 0.8 ? 'bg-amber-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(members.length / SEAT_LIMIT) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Pending Invites Section ── */}
      {pendingCount > 0 && (
        <StaggerItem index={4}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Pending Invitations</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">{pendingCount} invite{pendingCount !== 1 ? 's' : ''} awaiting response</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {pendingMembers.map((member, i) => {
                  const rb = roleBadge[member.role];
                  const timeAgo = member.inviteSentAt ? getTimeAgo(member.inviteSentAt) : 'Recently';
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-amber-50/20 transition-colors duration-150"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-sm ring-2 ring-amber-200/50`}>
                        {member.firstName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.email}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[13px] font-semibold rounded-md border ${rb.bg} ${rb.text} ${rb.border}`}>
                            {member.role === 'Editor' && <Pencil className="w-2.5 h-2.5" />}
                            {member.role === 'Viewer' && <Eye className="w-2.5 h-2.5" />}
                            {member.role === 'Admin' && <Shield className="w-2.5 h-2.5" />}
                            {member.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[13px] text-amber-600">
                            <Clock className="w-3 h-3" />
                            Sent {timeAgo}
                          </span>
                          <span className="text-[13px] text-gray-300">&middot;</span>
                          <span className="text-[13px] text-gray-500">Expires in 7 days</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          onClick={() => handleResendInvite(member)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all duration-200"
                          whileTap={{ scale: 0.95 }}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend
                        </motion.button>
                        <motion.button
                          onClick={() => setConfirmAction({ type: 'remove', member })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all duration-200"
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-3 h-3" />
                          Revoke
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* ── Role Permissions Matrix ── */}
      <StaggerItem index={pendingCount > 0 ? 5 : 4}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Role Permissions</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">What each role can do across the app</p>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_96px_96px_96px] gap-0 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
            <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Module</div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[13px] font-semibold rounded-md border bg-purple-50 text-purple-700 border-purple-100">
                <Crown className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[13px] font-semibold rounded-md border bg-blue-50 text-blue-700 border-blue-100">
                <Pencil className="w-2.5 h-2.5" />
                Editor
              </span>
            </div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[13px] font-semibold rounded-md border bg-gray-50 text-gray-600 border-gray-200">
                <Eye className="w-2.5 h-2.5" />
                Viewer
              </span>
            </div>
          </div>

          {/* Rows — flat, one per module */}
          <div>
            {permissionsMatrix.map((row, i) => {
              const Icon = row.icon;
              const isLast = i === permissionsMatrix.length - 1;
              return (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1fr_96px_96px_96px] gap-0 px-6 py-3 items-center hover:bg-gray-50/40 transition-colors duration-100 ${
                    isLast ? '' : 'border-b border-gray-50'
                  } ${row.groupStart ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-800">{row.label}</span>
                  </div>
                  <div className="flex justify-center">
                    <PermissionIndicator level={row.admin} />
                  </div>
                  <div className="flex justify-center">
                    <PermissionIndicator level={row.editor} />
                  </div>
                  <div className="flex justify-center">
                    <PermissionIndicator level={row.viewer} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center gap-5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mr-1">Legend</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <span className="text-[13px] text-gray-500">Full access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Eye className="w-2.5 h-2.5 text-blue-500" />
              </div>
              <span className="text-[13px] text-gray-500">View only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Minus className="w-2.5 h-2.5 text-gray-400" />
              </div>
              <span className="text-[13px] text-gray-500">No access</span>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Modals ── */}
      <InviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        seatLimit={SEAT_LIMIT}
        currentCount={members.length}
      />

      <RoleChangeModal
        open={!!roleChangeTarget}
        member={roleChangeTarget}
        onClose={() => setRoleChangeTarget(null)}
        onConfirm={handleRoleChange}
      />

      <AnimatePresence>
        {confirmAction && (
          <ConfirmDialog
            open={!!confirmAction}
            title={
              confirmAction.type === 'remove'
                ? 'Remove Team Member'
                : confirmAction.type === 'deactivate'
                  ? 'Deactivate User'
                  : 'Reactivate User'
            }
            description={
              confirmAction.type === 'remove'
                ? `Are you sure you want to remove ${confirmAction.member.firstName} ${confirmAction.member.lastName}? They will lose access to all workspace data immediately.`
                : confirmAction.type === 'deactivate'
                  ? `${confirmAction.member.firstName} ${confirmAction.member.lastName} will be unable to access the platform until reactivated. Their data will be preserved.`
                  : `${confirmAction.member.firstName} ${confirmAction.member.lastName} will regain access to the platform with their previous role and permissions.`
            }
            confirmLabel={
              confirmAction.type === 'remove'
                ? 'Remove Member'
                : confirmAction.type === 'deactivate'
                  ? 'Deactivate'
                  : 'Reactivate'
            }
            confirmVariant={confirmAction.type === 'remove' ? 'danger' : confirmAction.type === 'deactivate' ? 'danger' : 'primary'}
            loading={confirmLoading}
            onConfirm={handleConfirmAction}
            onCancel={() => { if (!confirmLoading) setConfirmAction(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}