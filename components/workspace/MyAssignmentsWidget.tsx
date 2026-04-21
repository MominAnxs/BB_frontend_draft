'use client';

import { useState } from 'react';
import { Calendar, Building2, Users, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseDisplayDate } from './DatePickerPopover';

export type TaskSource = 'brego_at' | 'brego_pm' | 'my_team';

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  assignees: { name: string; initials: string; color: string }[];
  project: string;
  group: string;
  source: TaskSource;
  assignedBy: { name: string; role: string };
}

interface MyAssignmentsWidgetProps {
  onSeeAll: () => void;
}

const MOCK_WIDGET_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'Audit Google Ads account structure and reallocate budget to top-performing campaigns for Q1',
    dueDate: 'Tue, 11 Feb',
    isCompleted: false,
    assignees: [
      { name: 'Sufyan Q.', initials: 'SQ', color: '#059669' },
      { name: 'Mihir L.', initials: 'ML', color: '#7C3AED' },
    ],
    project: 'Performance Marketing',
    group: 'Performance Marketing',
    source: 'brego_pm',
    assignedBy: { name: 'Priya S.', role: 'Ads Strategist' },
  },
  {
    id: 'a2',
    title: 'Set up Meta conversion tracking pixels on all new landing pages and verify event firing',
    dueDate: 'Tue, 11 Feb',
    isCompleted: false,
    assignees: [
      { name: 'Priya S.', initials: 'PS', color: '#DC2626' },
      { name: 'Mihir L.', initials: 'ML', color: '#7C3AED' },
    ],
    project: 'Performance Marketing',
    group: 'Performance Marketing',
    source: 'brego_pm',
    assignedBy: { name: 'Kavita R.', role: 'Campaign Manager' },
  },
  {
    id: 'a3',
    title: 'Reconcile Q4 expense reports with bank statements and flag discrepancies',
    dueDate: 'Mon, 17 Feb',
    isCompleted: false,
    assignees: [
      { name: 'Kiran B.', initials: 'KB', color: '#DC2626' },
      { name: 'Deepa N.', initials: 'DN', color: '#059669' },
    ],
    project: 'Accounts & Taxation',
    group: 'Accounts & Taxation',
    source: 'brego_at',
    assignedBy: { name: 'Deepa N.', role: 'Accounts Manager' },
  },
  {
    id: 'a4',
    title: 'Prepare and file monthly GST returns for all active client accounts',
    dueDate: 'Fri, 14 Feb',
    isCompleted: false,
    assignees: [
      { name: 'Vikram S.', initials: 'VS', color: '#7C3AED' },
      { name: 'Deepa N.', initials: 'DN', color: '#059669' },
    ],
    project: 'Accounts & Taxation',
    group: 'Accounts & Taxation',
    source: 'brego_at',
    assignedBy: { name: 'Suresh I.', role: 'Tax Consultant' },
  },
  {
    id: 'a5',
    title: 'Review Q4 campaign performance deck and share feedback with Brego team',
    dueDate: 'Wed, 19 Feb',
    isCompleted: false,
    assignees: [
      { name: 'Rahul M.', initials: 'RM', color: '#6366F1' },
    ],
    project: 'Performance Marketing',
    group: 'Performance Marketing',
    source: 'my_team',
    assignedBy: { name: 'Sneha K.', role: 'Brand Manager' },
  },
];

// ─── Source Badge ─────────────────────────────────────────────────────
export function SourceBadge({ source, compact = false }: { source: TaskSource; compact?: boolean }) {
  const config = {
    brego_at: { label: 'Brego A&T', icon: Building2, bg: '#F0FDF4', color: '#059669', border: 'rgba(5, 150, 105, 0.12)' },
    brego_pm: { label: 'Brego PM', icon: Building2, bg: '#EFF6FF', color: '#2563EB', border: 'rgba(37, 99, 235, 0.12)' },
    my_team: { label: 'My Team', icon: Users, bg: '#F5F3FF', color: '#6366F1', border: 'rgba(99, 102, 241, 0.12)' },
  }[source];

  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
      style={{
        fontSize: compact ? '10px' : '10px',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {config.label}
    </span>
  );
}

export function MyAssignmentsWidget({ onSeeAll }: MyAssignmentsWidgetProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px -4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)', height: 440 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ minHeight: 56 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(32,76,199,0.06)' }}>
            <CheckSquare className="w-3.5 h-3.5" style={{ color: '#204CC7' }} />
          </div>
          <h3 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>Your Assignments</h3>
        </div>
        <button
          onClick={onSeeAll}
          className="px-3.5 py-1.5 rounded-lg border transition-all duration-200 hover:bg-gray-50"
          style={{ color: '#204CC7', borderColor: '#204CC730', fontSize: '13px', fontWeight: 500 }}
        >
          See All
        </button>
      </div>

      {/* Task List */}
      <div className="px-3 pb-3 flex-1 overflow-y-auto">
        {MOCK_WIDGET_ASSIGNMENTS.slice(0, 4).map((task, idx) => {
          const done = completedIds.has(task.id);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3), ease: [0.25, 0.1, 0.25, 1] }}
              className="px-3 py-3.5 rounded-xl hover:bg-gray-50/80 transition-all duration-200 ease-out cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded border-[1.5px] transition-all duration-200 flex items-center justify-center"
                  style={{
                    borderColor: done ? '#204CC7' : '#D1D5DB',
                    backgroundColor: done ? '#204CC7' : 'transparent',
                  }}
                >
                  <AnimatePresence>
                    {done && (
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-[1.4] transition-all duration-200 ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {task.title}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Source badge */}
                    <SourceBadge source={task.source} compact />

                    {/* Due date */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className={`w-3.5 h-3.5 ${!done && isDateOverdue(task.dueDate) ? 'text-red-500' : 'text-green-600'}`} />
                      <span className={`text-xs ${!done && isDateOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`} style={!done && isDateOverdue(task.dueDate) ? { fontWeight: 600 } : undefined}>{task.dueDate}</span>
                    </div>

                    {/* Assignees */}
                    <div className="flex items-center gap-1">
                      {task.assignees.map((a, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: a.color, fontSize: '8px', fontWeight: 600 }}
                          title={a.name}
                        >
                          {a.initials}
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-0.5">
                        {task.assignees.map(a => a.name).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Project */}
                  <p className="text-xs text-gray-400 mt-1.5">
                    {task.project} in {task.group}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helper Function to Check if Date is Overdue ─────────────────────
function isDateOverdue(dateStr: string): boolean {
  const parsed = parseDisplayDate(dateStr);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}
