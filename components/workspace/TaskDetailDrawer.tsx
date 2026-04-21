'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Calendar, Clock, User, MessageSquare, Activity,
  Paperclip, Send, Check, AlertCircle, Tag
} from 'lucide-react';

const BRAND = '#204CC7';

export interface TaskDetail {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'High' | 'Medium' | 'Low';
  project: string;
  assignees: { name: string; initials: string; color: string }[];
  comments: { id: string; author: string; initials: string; color: string; text: string; timestamp: string }[];
  activity: { id: string; text: string; timestamp: string; type: 'created' | 'completed' | 'comment' | 'assigned' | 'updated' }[];
}

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (id: string) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' },
  Medium: { bg: '#FEF9C3', text: '#CA8A04', dot: '#CA8A04' },
  Low: { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A' },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  created: <Tag className="w-3 h-3" />,
  completed: <Check className="w-3 h-3" />,
  comment: <MessageSquare className="w-3 h-3" />,
  assigned: <User className="w-3 h-3" />,
  updated: <AlertCircle className="w-3 h-3" />,
};

export function TaskDetailDrawer({ task, isOpen, onClose, onToggleComplete }: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<TaskDetail['comments']>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) setLocalComments(task.comments);
  }, [task]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `c-${Date.now()}`,
      author: 'You',
      initials: 'YO',
      color: BRAND,
      text: newComment.trim(),
      timestamp: 'Just now',
    };
    setLocalComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const tabs = [
    { id: 'details' as const, label: 'Details', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'comments' as const, label: `Comments (${localComments.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'activity' as const, label: 'Activity', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-[6px] z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white/95 backdrop-blur-xl z-50 flex flex-col"
            style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.08)', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: PRIORITY_STYLES[task.priority].bg,
                        color: PRIORITY_STYLES[task.priority].text,
                        fontWeight: 500,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIORITY_STYLES[task.priority].dot }} />
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-400">{task.project}</span>
                  </div>
                  <h2 className="text-gray-900 leading-snug" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {task.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {/* Status toggle */}
                <button
                  onClick={() => onToggleComplete?.(task.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    backgroundColor: task.isCompleted ? '#F0FDF4' : '#F9FAFB',
                    color: task.isCompleted ? '#16A34A' : '#6B7280',
                    fontWeight: 500,
                    border: `1px solid ${task.isCompleted ? '#BBF7D0' : '#E5E7EB'}`,
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: task.isCompleted ? '#16A34A' : 'transparent',
                      border: task.isCompleted ? 'none' : '1.5px solid #D1D5DB',
                    }}
                  >
                    {task.isCompleted && (
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {task.isCompleted ? 'Completed' : 'Pending'}
                </button>

                {/* Due date */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-green-600" />
                  {task.dueDate}
                </div>

                {/* Assignees */}
                <div className="flex items-center gap-1">
                  {task.assignees.map((a, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white"
                      style={{ backgroundColor: a.color, fontSize: '8px', fontWeight: 600, zIndex: task.assignees.length - i }}
                      title={a.name}
                    >
                      {a.initials}
                    </div>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {task.assignees.map(a => a.name).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    backgroundColor: activeTab === tab.id ? `${BRAND}0A` : 'transparent',
                    color: activeTab === tab.id ? BRAND : '#6B7280',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'details' && (
                <div className="p-6 space-y-5">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                  </div>

                  {/* Attachments */}
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Attachments</h4>
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">No attachments yet</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-6 space-y-4">
                    {localComments.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No comments yet. Start the conversation.</p>
                      </div>
                    ) : (
                      localComments.map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: c.color, fontSize: '9px', fontWeight: 600 }}
                          >
                            {c.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{c.author}</span>
                              <span className="text-xs text-gray-400">{c.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                      />
                      <button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                        style={{ backgroundColor: newComment.trim() ? BRAND : '#E5E7EB', color: newComment.trim() ? 'white' : '#9CA3AF' }}
                        aria-label="Send comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="p-6">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-100" />
                    
                    <div className="space-y-4">
                      {task.activity.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 relative">
                          <div
                            className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 z-10"
                            style={{
                              color: item.type === 'completed' ? '#16A34A' : item.type === 'comment' ? BRAND : '#6B7280',
                            }}
                          >
                            {ACTIVITY_ICONS[item.type]}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm text-gray-700">{item.text}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Helper: Build TaskDetail from assignment data ──────────────────────
export function buildTaskDetail(task: {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  assignees: { name: string; initials: string; color: string }[];
  project: string;
}): TaskDetail {
  const descriptions: Record<string, string> = {
    'Audit Google Ads account structure and reallocate budget to top-performing campaigns for Q1':
      'Conduct a full audit of the current Google Ads account structure. Identify underperforming campaigns and ad groups, pause low-ROAS keywords, and shift budget to proven high-converting campaigns ahead of Q1 targets.',
    'Set up Meta conversion tracking pixels on all new landing pages and verify event firing':
      'Install Meta Pixel and Conversions API on all newly launched landing pages. Configure standard events (Lead, ViewContent, CompleteRegistration) and verify firing through Events Manager. Document pixel IDs and event mappings.',
    'Prepare monthly paid media performance report with ROAS and CAC breakdown':
      'Compile data across Google Ads, Meta, and LinkedIn. Generate a monthly performance report breaking down ROAS, CAC, CTR, and conversion rates by channel. Include month-over-month trend analysis and optimization recommendations.',
    'Create A/B test variants for LinkedIn lead gen ad creatives — copy and visual':
      'Design 3 ad creative variants for LinkedIn Sponsored Content targeting B2B decision-makers. Include variations in headline copy, CTA phrasing, and hero imagery. Set up the test framework in Campaign Manager.',
    'Reposition social media strategy as Content Marketing Services — update all service FAQs with the sales team':
      'Collaborate with the sales team to reposition our social media management offering as a comprehensive Content Marketing Services package. Update all FAQ documentation, sales collateral, and service descriptions.',
    'Reconcile Q4 expense reports with bank statements and flag discrepancies':
      'Cross-reference all Q4 expense reports against bank statements. Flag any discrepancies exceeding ₹500 for review. Prepare a reconciliation summary with categorized adjustments for the finance team.',
    'Prepare and file monthly GST returns for all active client accounts':
      'Compile GST input/output data for all active client accounts. Prepare GSTR-1 and GSTR-3B filings, verify ITC claims, and submit returns before the 20th deadline. Maintain filing confirmation records.',
    'Review and update TDS computation sheet for February payroll cycle':
      'Update the TDS computation sheet with current salary data, investment declarations, and regime selections for all employees. Calculate revised TDS deductions for the February payroll run.',
    'Compile tax compliance checklist for new client onboarding — RetailMax':
      'Create a comprehensive tax compliance checklist tailored to RetailMax\'s retail business structure. Include GST registration status, TDS obligations, advance tax schedules, and statutory audit requirements.',
    'Generate profit & loss statement and balance sheet for Q3 board review':
      'Prepare accurate P&L statements and balance sheets for Q3 FY2025-26. Include departmental cost breakdowns, revenue recognition notes, and variance analysis against projections for the board presentation.',
  };

  const desc = descriptions[task.title] || 'Review the task requirements, coordinate with assigned team members, and ensure timely completion. Update status and notify stakeholders upon completion.';

  const assigneeNames = task.assignees.map(a => a.name).join(' and ');

  return {
    ...task,
    description: desc,
    priority: task.isCompleted ? 'Low' : (task.dueDate.includes('11 Feb') || task.dueDate.includes('12 Feb') ? 'High' : 'Medium'),
    comments: [
      {
        id: `c1-${task.id}`,
        author: task.assignees[0]?.name || 'Team',
        initials: task.assignees[0]?.initials || 'TM',
        color: task.assignees[0]?.color || '#6B7280',
        text: 'Started working on this. Will have an initial draft ready by tomorrow.',
        timestamp: '2 days ago',
      },
      {
        id: `c2-${task.id}`,
        author: 'Zeel M.',
        initials: 'ZM',
        color: '#7C3AED',
        text: 'Looks good — let me know if you need any support or access to shared docs.',
        timestamp: '1 day ago',
      },
    ],
    activity: [
      { id: `a1-${task.id}`, text: `Task created and added to ${task.project}`, timestamp: 'Feb 8, 10:30 AM', type: 'created' },
      { id: `a2-${task.id}`, text: `Assigned to ${assigneeNames}`, timestamp: 'Feb 8, 10:31 AM', type: 'assigned' },
      { id: `a3-${task.id}`, text: `${task.assignees[0]?.name || 'Team'} left a comment`, timestamp: 'Feb 9, 2:15 PM', type: 'comment' },
      { id: `a4-${task.id}`, text: 'Due date updated to ' + task.dueDate, timestamp: 'Feb 9, 4:00 PM', type: 'updated' },
      ...(task.isCompleted ? [{ id: `a5-${task.id}`, text: 'Task marked as completed', timestamp: 'Feb 10, 11:00 AM', type: 'completed' as const }] : []),
    ],
  };
}
