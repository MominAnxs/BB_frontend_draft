'use client';

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ChevronLeft, Calendar, Search, ChevronDown, GripVertical,
  Sparkles, X, Check, Trash2, Pencil,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { BregoGPTDrawer } from '../reports/BregoGPTDrawer';
import { TaskDetailDrawer, buildTaskDetail } from './TaskDetailDrawer';
import type { TaskDetail } from './TaskDetailDrawer';
import { parseDisplayDate } from './DatePickerPopover';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { type TeamMember } from './AssigneePickerPopover';
import { SourceBadge, type TaskSource } from './MyAssignmentsWidget';

// ─── Types ────────────────────────────────────────────────────────────
export interface DetailAssignment {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  assignees: { name: string; initials: string; color: string }[];
  project: string;
  group: string;
  priority: Priority;
  source: TaskSource;
  assignedBy: { name: string; role: string };
}

interface ProjectGroup {
  group: string;
  project: string;
  tasks: DetailAssignment[];
}

// ─── Mock Data ────────────────────────────────────────────────────────
const BRAND = '#204CC7';

const GROUP_COLORS: Record<string, string> = {
  'PERFORMANCE MARKETING': '#2563EB',
  'ACCOUNTS & TAXATION': '#059669',
};

const ALL_ASSIGNMENTS: DetailAssignment[] = [
  // Performance Marketing — assigned by Brego PM team
  {
    id: 'd1', title: 'Audit Google Ads account structure and reallocate budget to top-performing campaigns for Q1',
    dueDate: 'Tue, 24 Feb', isCompleted: false,
    assignees: [{ name: 'Sufyan Q.', initials: 'SQ', color: '#059669' }, { name: 'Mihir L.', initials: 'ML', color: '#7C3AED' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P1',
    source: 'brego_pm', assignedBy: { name: 'Priya S.', role: 'Ads Strategist' },
  },
  {
    id: 'd2', title: 'Set up Meta conversion tracking pixels on all new landing pages and verify event firing',
    dueDate: 'Wed, 25 Feb', isCompleted: false,
    assignees: [{ name: 'Priya S.', initials: 'PS', color: '#DC2626' }, { name: 'Mihir L.', initials: 'ML', color: '#7C3AED' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P2',
    source: 'brego_pm', assignedBy: { name: 'Kavita R.', role: 'Campaign Manager' },
  },
  {
    id: 'd3', title: 'Prepare monthly paid media performance report with ROAS and CAC breakdown',
    dueDate: 'Thu, 26 Feb', isCompleted: false,
    assignees: [{ name: 'Neha P.', initials: 'NP', color: '#D97706' }, { name: 'Sufyan Q.', initials: 'SQ', color: '#059669' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P3',
    source: 'brego_pm', assignedBy: { name: 'Rohit D.', role: 'Analytics Manager' },
  },
  {
    id: 'd4', title: 'Create A/B test variants for LinkedIn lead gen ad creatives — copy and visual',
    dueDate: 'Fri, 27 Feb', isCompleted: true,
    assignees: [{ name: 'Amit K.', initials: 'AK', color: '#2563EB' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P1',
    source: 'brego_pm', assignedBy: { name: 'Priya S.', role: 'Ads Strategist' },
  },
  {
    id: 'd5', title: 'Reposition social media strategy as Content Marketing Services — update all service FAQs with the sales team',
    dueDate: 'Mon, 2 Mar', isCompleted: false,
    assignees: [{ name: 'Sufyan Q.', initials: 'SQ', color: '#059669' }, { name: 'Priya S.', initials: 'PS', color: '#DC2626' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P2',
    source: 'brego_pm', assignedBy: { name: 'Anjali M.', role: 'SEO Specialist' },
  },
  // Accounts & Taxation — assigned by Brego A&T team
  {
    id: 'd6', title: 'Reconcile Q4 expense reports with bank statements and flag discrepancies',
    dueDate: 'Tue, 24 Feb', isCompleted: false,
    assignees: [{ name: 'Kiran B.', initials: 'KB', color: '#DC2626' }, { name: 'Deepa N.', initials: 'DN', color: '#059669' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P1',
    source: 'brego_at', assignedBy: { name: 'Deepa N.', role: 'Accounts Manager' },
  },
  {
    id: 'd7', title: 'Prepare and file monthly GST returns for all active client accounts',
    dueDate: 'Wed, 25 Feb', isCompleted: true,
    assignees: [{ name: 'Vikram S.', initials: 'VS', color: '#7C3AED' }, { name: 'Deepa N.', initials: 'DN', color: '#059669' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P2',
    source: 'brego_at', assignedBy: { name: 'Suresh I.', role: 'Tax Consultant' },
  },
  {
    id: 'd8', title: 'Review and update TDS computation sheet for February payroll cycle',
    dueDate: 'Thu, 26 Feb', isCompleted: false,
    assignees: [{ name: 'Vikram S.', initials: 'VS', color: '#7C3AED' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P3',
    source: 'brego_at', assignedBy: { name: 'Arjun R.', role: 'Compliance Lead' },
  },
  {
    id: 'd9', title: 'Compile tax compliance checklist for new client onboarding — RetailMax',
    dueDate: 'Fri, 27 Feb', isCompleted: true,
    assignees: [{ name: 'Deepa N.', initials: 'DN', color: '#059669' }, { name: 'Kiran B.', initials: 'KB', color: '#DC2626' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P1',
    source: 'brego_at', assignedBy: { name: 'Meera G.', role: 'Senior Accountant' },
  },
  {
    id: 'd10', title: 'Generate profit & loss statement and balance sheet for Q3 board review',
    dueDate: 'Mon, 2 Mar', isCompleted: false,
    assignees: [{ name: 'Kiran B.', initials: 'KB', color: '#DC2626' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P2',
    source: 'brego_at', assignedBy: { name: 'Pooja S.', role: 'Audit Associate' },
  },
  // My Team — assigned by own team members
  {
    id: 'd11', title: 'Review Q4 campaign performance deck and share feedback with Brego team',
    dueDate: 'Wed, 26 Feb', isCompleted: false,
    assignees: [{ name: 'Rahul M.', initials: 'RM', color: '#6366F1' }],
    project: 'Performance Marketing', group: 'PERFORMANCE MARKETING', priority: 'P2',
    source: 'my_team', assignedBy: { name: 'Sneha K.', role: 'Brand Manager' },
  },
  {
    id: 'd12', title: 'Consolidate all vendor invoices for Q4 and share with Brego A&T team',
    dueDate: 'Fri, 28 Feb', isCompleted: false,
    assignees: [{ name: 'Vivek T.', initials: 'VT', color: '#14B8A6' }],
    project: 'Accounts & Taxation', group: 'ACCOUNTS & TAXATION', priority: 'P1',
    source: 'my_team', assignedBy: { name: 'Anita J.', role: 'Operations Lead' },
  },
];

// ─── Progress Ring ────────────────────────────────────────────────────
function ProgressRing({ completed, total, size = 48 }: { completed: number; total: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={BRAND} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
}

// ─── Draggable Task Row ───────────────────────────────────────────────
const ITEM_TYPE = 'TASK';

interface DraggableTaskProps {
  task: DetailAssignment;
  index: number;
  projectKey: string;
  moveTask: (projectKey: string, dragIndex: number, hoverIndex: number) => void;
  onToggle: (id: string) => void;
  onTaskClick: (task: DetailAssignment) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  batchMode: boolean;
  isSelected: boolean;
  onBatchToggle: (id: string) => void;
  isFocused: boolean;
  onDateChange: (id: string, newDate: string) => void;
  onAssigneesChange: (id: string, newAssignees: TeamMember[]) => void;
}

function DraggableTask({ task, index, projectKey, moveTask, onToggle, onTaskClick, onRename, onDelete, batchMode, isSelected, onBatchToggle, isFocused, onDateChange, onAssigneesChange }: DraggableTaskProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ index, projectKey }),
    canDrag: !batchMode && !isEditing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { index: number; projectKey: string }, monitor) {
      if (!ref.current) return;
      if (item.projectKey !== projectKey) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddle = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClient = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClient < hoverMiddle) return;
      if (dragIndex > hoverIndex && hoverClient > hoverMiddle) return;

      moveTask(projectKey, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  drag(drop(ref));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (batchMode) return;
    setEditValue(task.title);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onRename(task.id, trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 px-5 py-4 transition-all duration-200 ease-out group ${
        batchMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-40 scale-[0.98]' : ''
      } ${isSelected ? 'bg-blue-50/60' : isFocused ? 'bg-blue-50/30' : isOver ? 'bg-blue-50/40' : 'hover:bg-gray-50/80'}`}
      style={{
        ...(isDragging ? { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } : {}),
        ...(isFocused ? { boxShadow: `inset 3px 0 0 0 ${BRAND}` } : {}),
        ...(!isFocused && (task.priority === 'P1') ? { boxShadow: 'inset 3px 0 0 0 rgba(220, 38, 38, 0.5)' } : {}),
      }}
      onClick={batchMode ? () => onBatchToggle(task.id) : undefined}
    >
      {/* Batch checkbox OR Grip Handle */}
      {batchMode ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Batch selection checkbox */}
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="mt-[3px] w-[20px] h-[20px] rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center cursor-pointer"
            style={{
              borderColor: isSelected ? BRAND : '#D1D5DB',
              backgroundColor: isSelected ? BRAND : 'transparent',
            }}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  width="10" height="8" viewBox="0 0 10 8" fill="none"
                >
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Completion checkbox — always visible in batch mode */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
            className="mt-[3px] w-[20px] h-[20px] rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center"
            style={{
              borderColor: task.isCompleted ? '#059669' : '#D1D5DB',
              backgroundColor: task.isCompleted ? '#059669' : 'transparent',
            }}
          >
            <AnimatePresence>
              {task.isCompleted && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  width="10" height="8" viewBox="0 0 10 8" fill="none"
                >
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      ) : (
        <div className="mt-[3px] opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Checkbox (only in normal mode) */}
      {!batchMode && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="mt-[3px] flex-shrink-0 w-[20px] h-[20px] rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center"
          style={{
            borderColor: task.isCompleted ? BRAND : '#D1D5DB',
            backgroundColor: task.isCompleted ? BRAND : 'transparent',
          }}
        >
          <AnimatePresence>
            {task.isCompleted && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                width="10" height="8" viewBox="0 0 10 8" fill="none"
              >
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Content — title + meta row below */}
      <div className="flex-1 min-w-0" onClick={(e) => { if (!batchMode && !isEditing) { e.stopPropagation(); onTaskClick(task); } }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm bg-transparent border-b-2 border-blue-400 outline-none py-0.5 text-gray-900"
          />
        ) : (
          <p
            className={`text-sm leading-[1.5] ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'} hover:text-blue-700 transition-colors cursor-pointer`}
            onDoubleClick={handleDoubleClick}
          >
            {task.title}
          </p>
        )}
        {/* Meta row: Source · Assigned by · Assignees · Due date */}
        {!isEditing && (
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <SourceBadge source={task.source} compact />
            <span className="text-[11.5px] text-gray-400" style={{ fontWeight: 400 }}>
              by <span style={{ fontWeight: 600, color: '#6B7280' }}>{task.assignedBy.name}</span>
            </span>

            <span className="text-gray-200 text-[13px]">·</span>

            {/* Assignees — read-only display */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center -space-x-1.5">
                {task.assignees.map((a, i) => (
                  <div
                    key={i}
                    className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white border-[1.5px] border-white"
                    style={{ backgroundColor: a.color, fontSize: '7px', fontWeight: 600, zIndex: task.assignees.length - i }}
                    title={a.name}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 500 }}>
                {task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} people`}
              </span>
            </div>

            <span className="text-gray-200 text-[13px]">·</span>

            {/* Due date — read-only display */}
            <div className={`flex items-center gap-1 ${!task.isCompleted && isDateOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              <span className="text-[13px] whitespace-nowrap" style={{ fontWeight: !task.isCompleted && isDateOverdue(task.dueDate) ? 600 : 500 }}>
                {task.dueDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inline action buttons (on hover, normal mode only) */}
      {!batchMode && !isEditing && (
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-[3px]">
          <button
            onClick={(e) => { e.stopPropagation(); handleDoubleClick(); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Rename"
            aria-label="Rename task"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
            aria-label="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      )}

      {/* Right side — only Priority badge */}
      <div className="flex-shrink-0 mt-[3px]">
        <PriorityBadge priority={task.priority} />
      </div>
    </div>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
  counts,
  icon,
  activeColor,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  counts?: Record<string, number>;
  icon?: ReactNode;
  activeColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accentColor = activeColor || BRAND;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-150"
      >
        {icon}
        {label}{selected !== 'All' ? `: ${selected}` : ''}
        {counts && selected !== 'All' && counts[selected] !== undefined && (
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700" style={{ fontSize: '10px', fontWeight: 600 }}>{counts[selected]}</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl overflow-hidden z-50"
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center justify-between ${
                  selected === opt ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt}
                  {counts && counts[opt] !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontSize: '10px', fontWeight: 600 }}>{counts[opt]}</span>
                  )}
                </span>
                {selected === opt && <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Toolbar Filter Dropdown ──────────────────────────────────────────
function ToolbarFilterDropdown({
  label,
  options,
  selected,
  onSelect,
  counts,
  icon,
  activeColor,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  counts?: Record<string, number>;
  icon?: ReactNode;
  activeColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accentColor = activeColor || BRAND;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-[7px] text-sm rounded-lg border border-gray-200/80
        text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
        style={{ fontWeight: 500 }}
      >
        {icon}
        {label}{selected !== 'All' ? `: ${selected}` : ''}
        {counts && selected !== 'All' && counts[selected] !== undefined && (
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700" style={{ fontSize: '10px', fontWeight: 600 }}>{counts[selected]}</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl overflow-hidden z-50"
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center justify-between ${
                  selected === opt ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt}
                  {counts && counts[opt] !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontSize: '10px', fontWeight: 600 }}>{counts[opt]}</span>
                  )}
                </span>
                {selected === opt && <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Task List Skeleton ──────────────────────────────────────────────
function TaskListSkeleton({ groups = 2 }: { groups?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: groups }).map((_, g) => (
        <div key={g}>
          <div className="mb-2 animate-pulse">
            <div className="h-2.5 bg-gray-100 rounded-full w-20 mb-1.5" />
            <div className="h-3.5 bg-gray-100 rounded-full w-36" />
          </div>
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100/80"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px -2px rgba(0,0,0,0.03)' }}
          >
            {Array.from({ length: 3 + g }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-[18px] animate-pulse">
                <div className="mt-[3px] w-[20px] h-[20px] rounded-md bg-gray-100" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 bg-gray-100 rounded-full" style={{ width: `${60 + (i * 11) % 35}%` }} />
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 bg-gray-50 rounded-full w-16" />
                    <div className="h-2.5 bg-gray-50 rounded-full w-20" />
                    <div className="w-1 h-1 rounded-full bg-gray-100" />
                    <div className="flex items-center gap-1"><div className="w-[18px] h-[18px] bg-gray-100 rounded-full" /><div className="h-2.5 bg-gray-50 rounded-full w-14" /></div>
                    <div className="w-1 h-1 rounded-full bg-gray-100" />
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-50 rounded" /><div className="h-2.5 bg-gray-50 rounded-full w-16" /></div>
                  </div>
                </div>
                <div className="mt-[3px] w-12 h-6 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
interface MyAssignmentsDetailProps {
  onBack: () => void;
}

export function MyAssignmentsDetail({ onBack }: MyAssignmentsDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<DetailAssignment[]>(ALL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [showGPT, setShowGPT] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [dueThisWeek, setDueThisWeek] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [overdueOnly, setOverdueOnly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Derive counts
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;

  // Compute counts for filter badges
  const overdueCount = tasks.filter(t => !t.isCompleted && isDateOverdue(t.dueDate)).length;
  const dueThisWeekCount = tasks.filter(t => isDateThisWeek(t.dueDate)).length;
  const statusCounts = { All: tasks.length, Pending: tasks.filter(t => !t.isCompleted).length, Completed: tasks.filter(t => t.isCompleted).length };
  const priorityCounts = { All: tasks.length, P1: tasks.filter(t => t.priority === 'P1').length, P2: tasks.filter(t => t.priority === 'P2').length, P3: tasks.filter(t => t.priority === 'P3').length };
  const sourceCounts = {
    All: tasks.length,
    'Brego A&T': tasks.filter(t => t.source === 'brego_at').length,
    'Brego PM': tasks.filter(t => t.source === 'brego_pm').length,
    'My Team': tasks.filter(t => t.source === 'my_team').length,
  };

  // Filter
  const filtered = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === 'Completed' && !t.isCompleted) return false;
    if (statusFilter === 'Pending' && t.isCompleted) return false;
    if (sourceFilter === 'Brego A&T' && t.source !== 'brego_at') return false;
    if (sourceFilter === 'Brego PM' && t.source !== 'brego_pm') return false;
    if (sourceFilter === 'My Team' && t.source !== 'my_team') return false;
    if (dueThisWeek && !isDateThisWeek(t.dueDate)) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (overdueOnly && !(isDateOverdue(t.dueDate) && !t.isCompleted)) return false;
    return true;
  });

  // Group by group → project
  const grouped: ProjectGroup[] = [];
  const groupMap = new Map<string, Map<string, DetailAssignment[]>>();
  filtered.forEach(t => {
    if (!groupMap.has(t.group)) groupMap.set(t.group, new Map());
    const projectMap = groupMap.get(t.group)!;
    if (!projectMap.has(t.project)) projectMap.set(t.project, []);
    projectMap.get(t.project)!.push(t);
  });
  groupMap.forEach((projects, group) => {
    projects.forEach((tasks, project) => {
      grouped.push({ group, project, tasks });
    });
  });

  // Unique projects for filter
  const allProjects = [...new Set(ALL_ASSIGNMENTS.map(t => t.project))];

  // Active filter count
  const activeFilterCount = [
    statusFilter !== 'All',
    sourceFilter !== 'All',
    dueThisWeek,
    priorityFilter !== 'All',
    overdueOnly,
    searchQuery.length > 0,
  ].filter(Boolean).length;

  // Toggle completion
  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      const newState = task ? !task.isCompleted : false;
      toast.success(newState ? 'Task completed' : 'Task reopened', {
        description: task?.title?.slice(0, 60) + (task && task.title.length > 60 ? '...' : ''),
      });
      return prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    });
  }, []);

  // Move task within a project group (drag & drop)
  const moveTask = useCallback((projectKey: string, dragIndex: number, hoverIndex: number) => {
    setTasks(prev => {
      const next = [...prev];
      const projectTasks = next.filter(t => `${t.group}::${t.project}` === projectKey);
      const dragItem = projectTasks[dragIndex];
      const hoverItem = projectTasks[hoverIndex];
      if (!dragItem || !hoverItem) return prev;
      
      const dragGlobalIdx = next.findIndex(t => t.id === dragItem.id);
      const hoverGlobalIdx = next.findIndex(t => t.id === hoverItem.id);
      
      next.splice(dragGlobalIdx, 1);
      const insertIdx = next.findIndex(t => t.id === hoverItem.id);
      next.splice(dragIndex < hoverIndex ? insertIdx + 1 : insertIdx, 0, dragItem);
      
      return next;
    });
  }, []);

  // Rename task
  const renameTask = useCallback((id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
    toast.success('Task renamed');
  }, []);

  // Delete task
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const task = prev[idx];
      if (!task) return prev;
      toast('Task deleted', {
        description: task.title.slice(0, 60) + (task.title.length > 60 ? '...' : ''),
        action: {
          label: 'Undo',
          onClick: () => {
            setTasks(curr => {
              const restored = [...curr];
              restored.splice(Math.min(idx, restored.length), 0, task);
              return restored;
            });
            toast.success('Task restored');
          },
        },
      });
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // Toggle batch mode
  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedBatch(new Set());
    setFocusedIndex(-1);
  };

  // Toggle task in batch selection
  const toggleBatchTask = useCallback((id: string) => {
    setSelectedBatch(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Batch actions
  const batchComplete = () => {
    const count = selectedBatch.size;
    setTasks(prev => prev.map(t => selectedBatch.has(t.id) ? { ...t, isCompleted: true } : t));
    toast.success(`${count} task${count > 1 ? 's' : ''} completed`);
    setSelectedBatch(new Set());
    setBatchMode(false);
  };

  const batchDelete = () => {
    const count = selectedBatch.size;
    const snapshot = tasks.filter(t => selectedBatch.has(t.id));
    setTasks(prev => prev.filter(t => !selectedBatch.has(t.id)));
    toast(`${count} task${count > 1 ? 's' : ''} deleted`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setTasks(curr => [...snapshot, ...curr]);
          toast.success(`${count} task${count > 1 ? 's' : ''} restored`);
        },
      },
    });
    setSelectedBatch(new Set());
    setBatchMode(false);
  };

  // Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedBatch.size === filtered.length) {
      setSelectedBatch(new Set());
    } else {
      setSelectedBatch(new Set(filtered.map(t => t.id)));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSourceFilter('All');
    setDueThisWeek(false);
    setPriorityFilter('All');
    setOverdueOnly(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (showGPT || selectedTask) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === ' ' && focusedIndex >= 0 && focusedIndex < filtered.length) {
        e.preventDefault();
        const task = filtered[focusedIndex];
        if (batchMode) {
          toggleBatchTask(task.id);
        } else {
          toggleComplete(task.id);
        }
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filtered.length) {
        e.preventDefault();
        if (!batchMode) {
          setSelectedTask(buildTaskDetail(filtered[focusedIndex]));
        }
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, focusedIndex, batchMode, showGPT, selectedTask, toggleComplete, toggleBatchTask]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* ═══ Structured Sub-Header ═══ */}
        <div className="bg-white rounded-2xl" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          {/* ── Title Row + Actions ── */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-150 flex-shrink-0" aria-label="Go back">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <ProgressRing completed={completedCount} total={totalCount} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-gray-500 mb-0.5" style={{ fontWeight: 500 }}>{completedCount}/{totalCount} Completed</p>
              <h1 className="text-gray-900 truncate" style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.3 }}>Your Assignments</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Ask BregoGPT — primary */}
              <button
                onClick={() => setShowGPT(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-xl hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: BRAND, fontWeight: 600, boxShadow: '0 2px 8px rgba(32,76,199,0.3)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask BregoGPT
              </button>
            </div>
          </div>

          {/* ── Toolbar Row ── */}
          <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative w-[220px] flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm bg-gray-50 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-150 placeholder:text-gray-400"
              />
            </div>

            {/* Source Filter */}
            <ToolbarFilterDropdown
              label="Source"
              options={['All', 'Brego A&T', 'Brego PM', 'My Team']}
              selected={sourceFilter}
              onSelect={setSourceFilter}
              counts={sourceCounts}
              icon={<Building2 className="w-3.5 h-3.5" />}
            />

            {/* Status Filter */}
            <ToolbarFilterDropdown
              label="Status"
              options={['All', 'Pending', 'Completed']}
              selected={statusFilter}
              onSelect={setStatusFilter}
              counts={statusCounts}
            />

            {/* Priority Filter */}
            <ToolbarFilterDropdown
              label="Priority"
              options={['All', 'P1', 'P2', 'P3']}
              selected={priorityFilter}
              onSelect={(v) => setPriorityFilter(v as 'All' | Priority)}
              counts={priorityCounts}
            />

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

            {/* Due This Week toggle */}
            <button
              onClick={() => setDueThisWeek(!dueThisWeek)}
              className={`flex items-center gap-1.5 px-3 py-[7px] text-sm rounded-lg transition-all duration-150 flex-shrink-0 ${
                dueThisWeek
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              style={{ fontWeight: 500 }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Due This Week
              {dueThisWeekCount > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] ${dueThisWeek ? 'bg-emerald-200/70 text-emerald-800' : 'bg-gray-200/80 text-gray-600'}`} style={{ fontWeight: 700 }}>{dueThisWeekCount}</span>
              )}
            </button>

            {/* Overdue toggle */}
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`flex items-center gap-1.5 px-3 py-[7px] text-sm rounded-lg transition-all duration-150 flex-shrink-0 ${
                overdueOnly
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              style={{ fontWeight: 500 }}
            >
              Overdue
              {overdueCount > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] ${overdueOnly ? 'bg-red-200/70 text-red-800' : 'bg-red-100 text-red-600'}`} style={{ fontWeight: 700 }}>{overdueCount}</span>
              )}
            </button>

            {/* Clear all filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2.5 py-[7px] text-xs text-gray-500 hover:text-red-500 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <X className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            )}

            <div className="flex-1" />
          </div>
        </div>

        {/* Batch Action Bar */}
        <AnimatePresence>
          {batchMode && selectedBatch.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-gray-100"
              style={{ boxShadow: '0 4px 16px -2px rgba(0,0,0,0.06)' }}
            >
              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                {selectedBatch.size} selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm hover:underline transition-colors"
                style={{ color: BRAND, fontWeight: 500 }}
              >
                {selectedBatch.size === filtered.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="flex-1" />
              <button
                onClick={batchComplete}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-white rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#059669', fontWeight: 500 }}
              >
                <Check className="w-3.5 h-3.5" />
                Complete All
              </button>
              <button
                onClick={() => selectedBatch.size >= 5 ? setShowConfirmDelete(true) : batchDelete()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-white rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#DC2626', fontWeight: 500 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grouped Task List */}
        {isLoading ? (
          <TaskListSkeleton groups={3} />
        ) : (
        <div className="space-y-4">
          {grouped.map((pg) => {
            const projectKey = `${pg.group}::${pg.project}`;
            return (
              <div key={projectKey}>
                {/* Group Label */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: GROUP_COLORS[pg.group] || '#9CA3AF' }}
                  />
                  <span className="text-[13px] uppercase tracking-widest text-gray-500" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>
                    {pg.group}
                  </span>
                  <span className="text-[13px] text-gray-300" style={{ fontWeight: 600 }}>
                    {pg.tasks.length} {pg.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Tasks */}
                <div
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 transition-shadow duration-300 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                  style={{ boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)' }}
                >
                  {pg.tasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3), ease: [0.25, 0.1, 0.25, 1] }}
                    >
                    <DraggableTask
                      task={task}
                      index={idx}
                      projectKey={projectKey}
                      moveTask={moveTask}
                      onToggle={toggleComplete}
                      onTaskClick={(t) => setSelectedTask(buildTaskDetail(t))}
                      onRename={renameTask}
                      onDelete={deleteTask}
                      batchMode={batchMode}
                      isSelected={selectedBatch.has(task.id)}
                      onBatchToggle={toggleBatchTask}
                      isFocused={focusedIndex >= 0 && filtered[focusedIndex]?.id === task.id}
                      onDateChange={(id, newDate) => {
                        setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: newDate } : t));
                        toast.success('Due date updated');
                      }}
                      onAssigneesChange={(id, newAssignees) => {
                        setTasks(prev => prev.map(t => t.id === id ? { ...t, assignees: newAssignees } : t));
                        toast.success('Assignees updated');
                      }}
                    />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {grouped.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No assignments match your filters</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 text-sm hover:underline"
                style={{ color: BRAND }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* BregoGPT Drawer */}
      <BregoGPTDrawer isOpen={showGPT} onClose={() => setShowGPT(false)} moduleContext="workspace" />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={(id) => {
          toggleComplete(id);
          setSelectedTask(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
        }}
      />

      {showConfirmDelete && (
        <ConfirmDeleteModal
          count={selectedBatch.size}
          onConfirm={() => { setShowConfirmDelete(false); batchDelete(); }}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </DndProvider>
  );
}

// ─── Helper Function ──────────────────────────────────────────────────
function isDateThisWeek(dateStr: string): boolean {
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const match = dateStr.match(/(\d{1,2})\s+(\w+)/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const monthIdx = SHORT_MONTHS.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
  if (monthIdx === -1) return false;
  const now = new Date();
  const year = now.getFullYear();
  const parsed = new Date(year, monthIdx, day);
  // Get Monday of this week
  const todayCopy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = todayCopy.getDay();
  const monday = new Date(todayCopy);
  monday.setDate(todayCopy.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return parsed >= monday && parsed <= sunday;
}

// ─── Helper Function to Check if Date is Overdue ─────────────────────
function isDateOverdue(dateStr: string): boolean {
  const parsed = parseDisplayDate(dateStr);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}