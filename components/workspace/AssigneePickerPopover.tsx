'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, X, Building2, Users } from 'lucide-react';

const BRAND = '#204CC7';

export interface TeamMember {
  name: string;
  initials: string;
  color: string;
  role?: string;
  section?: 'brego_at' | 'brego_pm' | 'my_team';
}

// ─── Brego Accounts & Taxation Team ──────────────────────────────────
export const BREGO_AT_TEAM: TeamMember[] = [
  { name: 'Suresh I.', initials: 'SI', color: '#059669', role: 'Tax Consultant', section: 'brego_at' },
  { name: 'Meera G.', initials: 'MG', color: '#7C3AED', role: 'Senior Accountant', section: 'brego_at' },
  { name: 'Arjun R.', initials: 'AR', color: '#2563EB', role: 'Compliance Lead', section: 'brego_at' },
  { name: 'Deepa N.', initials: 'DN', color: '#DC2626', role: 'Accounts Manager', section: 'brego_at' },
  { name: 'Kiran B.', initials: 'KB', color: '#D97706', role: 'Financial Analyst', section: 'brego_at' },
  { name: 'Pooja S.', initials: 'PS', color: '#0891B2', role: 'Audit Associate', section: 'brego_at' },
  { name: 'Sanjay V.', initials: 'SV', color: '#059669', role: 'Tax Filing Specialist', section: 'brego_at' },
];

// ─── Brego Performance Marketing Team ────────────────────────────────
export const BREGO_PM_TEAM: TeamMember[] = [
  { name: 'Priya S.', initials: 'PS', color: '#DC2626', role: 'Ads Strategist', section: 'brego_pm' },
  { name: 'Amit K.', initials: 'AK', color: '#2563EB', role: 'PPC Specialist', section: 'brego_pm' },
  { name: 'Neha P.', initials: 'NP', color: '#D97706', role: 'Creative Lead', section: 'brego_pm' },
  { name: 'Rohit D.', initials: 'RD', color: '#059669', role: 'Analytics Manager', section: 'brego_pm' },
  { name: 'Kavita R.', initials: 'KR', color: '#7C3AED', role: 'Campaign Manager', section: 'brego_pm' },
  { name: 'Anjali M.', initials: 'AM', color: '#0891B2', role: 'SEO Specialist', section: 'brego_pm' },
  { name: 'Sufyan Q.', initials: 'SQ', color: '#059669', role: 'Growth Lead', section: 'brego_pm' },
  { name: 'Mihir L.', initials: 'ML', color: '#7C3AED', role: 'Media Buyer', section: 'brego_pm' },
];

// ─── Client's Own Team ───────────────────────────────────────────────
export const MY_TEAM_ROSTER: TeamMember[] = [
  { name: 'Rahul M.', initials: 'RM', color: '#6366F1', role: 'Marketing Head', section: 'my_team' },
  { name: 'Sneha K.', initials: 'SK', color: '#EC4899', role: 'Brand Manager', section: 'my_team' },
  { name: 'Vivek T.', initials: 'VT', color: '#14B8A6', role: 'Finance Director', section: 'my_team' },
  { name: 'Anita J.', initials: 'AJ', color: '#F97316', role: 'Operations Lead', section: 'my_team' },
  { name: 'Nikhil S.', initials: 'NS', color: '#8B5CF6', role: 'Product Manager', section: 'my_team' },
];

// Combined roster (backwards compat)
export const TEAM_ROSTER: TeamMember[] = [...BREGO_AT_TEAM, ...BREGO_PM_TEAM];

// All rosters combined
export const ALL_MEMBERS: TeamMember[] = [...BREGO_AT_TEAM, ...BREGO_PM_TEAM, ...MY_TEAM_ROSTER];

// ─── Section Header ──────────────────────────────────────────────────
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
      <span style={{ color, opacity: 0.7 }}>{icon}</span>
      <span className="text-[10px] uppercase tracking-wider" style={{ fontWeight: 600, color, opacity: 0.8 }}>{label}</span>
    </div>
  );
}

// ─── Single Assignee Picker (for Assign To-Do views) ────────────────
interface SingleAssigneePickerProps {
  currentAssignee: string;
  currentInitials: string;
  currentColor: string;
  onAssigneeChange: (member: TeamMember) => void;
  roster?: TeamMember[];
  showSections?: boolean;
  compact?: boolean;
}

export function SingleAssigneePickerPopover({ currentAssignee, currentInitials, currentColor, onAssigneeChange, roster, showSections = false, compact = false }: SingleAssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const members = roster || TEAM_ROSTER;
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by section if showSections
  const renderMembers = () => {
    if (!showSections) {
      return filtered.map((member) => <MemberRow key={member.name} member={member} isSelected={member.name === currentAssignee} onSelect={() => { onAssigneeChange(member); setOpen(false); setSearchQuery(''); }} />);
    }

    const bregoAT = filtered.filter(m => m.section === 'brego_at');
    const bregoPM = filtered.filter(m => m.section === 'brego_pm');
    const myTeam = filtered.filter(m => m.section === 'my_team');

    return (
      <>
        {bregoAT.length > 0 && (
          <>
            <SectionHeader icon={<Building2 className="w-3 h-3" />} label="Brego A&T Team" color="#059669" />
            {bregoAT.map(m => <MemberRow key={m.name} member={m} isSelected={m.name === currentAssignee} onSelect={() => { onAssigneeChange(m); setOpen(false); setSearchQuery(''); }} />)}
          </>
        )}
        {bregoPM.length > 0 && (
          <>
            <SectionHeader icon={<Building2 className="w-3 h-3" />} label="Brego PM Team" color="#2563EB" />
            {bregoPM.map(m => <MemberRow key={m.name} member={m} isSelected={m.name === currentAssignee} onSelect={() => { onAssigneeChange(m); setOpen(false); setSearchQuery(''); }} />)}
          </>
        )}
        {myTeam.length > 0 && (
          <>
            <SectionHeader icon={<Users className="w-3 h-3" />} label="My Team" color="#6366F1" />
            {myTeam.map(m => <MemberRow key={m.name} member={m} isSelected={m.name === currentAssignee} onSelect={() => { onAssigneeChange(m); setOpen(false); setSearchQuery(''); }} />)}
          </>
        )}
      </>
    );
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1.5 hover:bg-gray-50/80 rounded-lg transition-colors group/assignee ${compact ? 'px-0.5 py-0.5 -mx-0.5 -my-0.5' : 'px-1.5 py-1 -mx-1.5 -my-1 gap-2'}`}
      >
        <div
          className={`rounded-full flex items-center justify-center text-white group-hover/assignee:ring-2 group-hover/assignee:ring-blue-100 transition-all ${compact ? 'w-[20px] h-[20px]' : 'w-[30px] h-[30px] border-2 border-white'}`}
          style={{ backgroundColor: currentColor, fontSize: compact ? '8px' : '10px', fontWeight: 600 }}
          title={currentAssignee}
        >
          {currentInitials}
        </div>
        <span className={`whitespace-nowrap group-hover/assignee:text-gray-800 transition-colors ${compact ? 'text-[11.5px] text-gray-500' : 'text-[13px] text-gray-600 hidden lg:inline'}`} style={{ fontWeight: 500 }}>{currentAssignee}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={`absolute ${compact ? 'left-0' : 'right-0'} top-full mt-2 w-[240px] bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden z-50`}
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Assigned People</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50/60 rounded-lg focus:outline-none focus:ring-1 focus:border-transparent placeholder:text-gray-400"
                  style={{ focusRingColor: BRAND, border: '1px solid rgba(0,0,0,0.06)' } as any}
                />
              </div>
            </div>

            {/* Members list */}
            <div className="max-h-[260px] overflow-y-auto px-1.5 pb-2">
              {renderMembers()}
              {filtered.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">No matches</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Member Row ──────────────────────────────────────────────────────
function MemberRow({ member, isSelected, onSelect }: { member: TeamMember; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors duration-100 ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: member.color, fontSize: '8px', fontWeight: 600 }}
      >
        {member.initials}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-xs block ${isSelected ? 'text-blue-700' : 'text-gray-700'}`} style={{ fontWeight: isSelected ? 600 : 400 }}>
          {member.name}
        </span>
        {member.role && (
          <span className="text-[10px] text-gray-400 block truncate">{member.role}</span>
        )}
      </div>
      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: BRAND }} />}
    </button>
  );
}

// ─── Multi Assignee Picker (My Assignments) ──────────────────────────
interface MultiAssigneePickerProps {
  assignees: TeamMember[];
  onAssigneesChange: (newAssignees: TeamMember[]) => void;
  roster?: TeamMember[];
  compact?: boolean;
}

export function MultiAssigneePickerPopover({ assignees, onAssigneesChange, roster, compact = false }: MultiAssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const members = roster || TEAM_ROSTER;
  const assigneeNames = new Set(assignees.map(a => a.name));

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleMember = (member: TeamMember) => {
    if (assigneeNames.has(member.name)) {
      // Don't remove if it's the last one
      if (assignees.length <= 1) return;
      onAssigneesChange(assignees.filter(a => a.name !== member.name));
    } else {
      onAssigneesChange([...assignees, member]);
    }
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center hover:bg-gray-100 rounded-lg transition-colors group/assignee ${compact ? 'gap-1.5 px-0.5 py-0.5 -mx-0.5 -my-0.5' : 'gap-2 px-1.5 py-1 -mx-1.5 -my-1'}`}
      >
        <div className="flex items-center -space-x-1.5">
          {assignees.map((a, i) => (
            <div
              key={i}
              className={`rounded-full flex items-center justify-center text-white border-2 border-white group-hover/assignee:ring-1 group-hover/assignee:ring-blue-100 transition-all ${compact ? 'w-[20px] h-[20px]' : 'w-6 h-6'}`}
              style={{ backgroundColor: a.color, fontSize: compact ? '7px' : '8px', fontWeight: 600, zIndex: assignees.length - i }}
              title={a.name}
            >
              {a.initials}
            </div>
          ))}
        </div>
        <span className={`whitespace-nowrap group-hover/assignee:text-gray-700 transition-colors ${compact ? 'text-[11.5px] text-gray-500' : 'text-xs text-gray-500 hidden xl:inline'}`} style={{ fontWeight: 500 }}>
          {assignees.length === 1 ? assignees[0].name : `${assignees.length} people`}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-[240px] bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden z-50"
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Assigned People</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50/60 rounded-lg focus:outline-none focus:ring-1 focus:border-transparent placeholder:text-gray-400"
                  style={{ focusRingColor: BRAND, border: '1px solid rgba(0,0,0,0.06)' } as any}
                />
              </div>
            </div>

            {/* Members list */}
            <div className="max-h-[220px] overflow-y-auto px-1.5 py-1.5">
              {filtered.map((member) => {
                const isAssigned = assigneeNames.has(member.name);
                return (
                  <button
                    key={member.name}
                    onClick={() => toggleMember(member)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors duration-100 ${
                      isAssigned ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: member.color, fontSize: '8px', fontWeight: 600 }}
                    >
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs block ${isAssigned ? 'text-blue-700' : 'text-gray-700'}`} style={{ fontWeight: isAssigned ? 600 : 400 }}>
                        {member.name}
                      </span>
                      {member.role && (
                        <span className="text-[10px] text-gray-400 block truncate">{member.role}</span>
                      )}
                    </div>
                    {isAssigned ? (
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.12)' }} />
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">No matches</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
