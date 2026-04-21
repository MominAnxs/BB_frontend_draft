'use client';

// ─── Add To-Do Modal ─────────────────────────────────────────────────
// Standalone so it can be mounted from multiple surfaces:
//   • Workspace › Tasks detail view (+Add Task button)
//   • Chat composer via @task mention — keeps one visual + validation
//     contract across the product, so creating a task feels identical
//     whether you're browsing the Tasks board or mid-conversation.
//
// Props are deliberately minimal: a project label + a department routing
// hint ('at' vs 'pm' to pick the right Brego team roster), plus the
// submit/close callbacks. The consumer decides how to store the task.

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { X, Upload, AlertCircle, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { type Priority } from './PriorityBadge';
import { BREGO_AT_TEAM, BREGO_PM_TEAM, MY_TEAM_ROSTER } from './AssigneePickerPopover';

// Exported so ChatInterface (and anywhere else that handles task payloads)
// can type its own state without duplicating the shape.
export type TaskTarget = 'brego_at' | 'brego_pm' | 'my_team';

export interface AssignTodoTask {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  project: string;
  priority: Priority;
  assignedBy: string;
  target: TaskTarget;
}

const BRAND = '#204CC7';

export interface AddTodoModalProps {
  /** Project/module label shown in the modal header subtitle. */
  project: string;
  /** Picks which Brego roster to surface first in Assign To. */
  department: 'at' | 'pm';
  /**
   * Optional seed for the Notes field. Used when the modal is opened
   * from a specific chat bubble (via the 3-dot "Create task" action) so
   * the quoted excerpt lands in Notes instead of forcing the user to
   * paste context they already had in the chat. Still fully editable.
   */
  initialNotes?: string;
  onClose: () => void;
  onAddTask: (task: AssignTodoTask) => void;
}

export function AddTodoModal({ project, department, initialNotes, onClose, onAddTask }: AddTodoModalProps) {
  const [taskName, setTaskName] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notifyTo, setNotifyTo] = useState('');
  // Only the initial render honours `initialNotes`; after that the field
  // is fully user-owned. Re-seeding on every prop change would clobber
  // the user's edits if the parent re-rendered for unrelated reasons.
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [priority, setPriority] = useState<Priority>('P2');
  const [attempted, setAttempted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [shadowFlash, setShadowFlash] = useState(false);
  const taskNameRef = useRef<HTMLInputElement>(null);
  const shakeControls = useAnimationControls();

  const taskNameError = attempted && !taskName.trim();
  const emailFormatError = emailTouched && notifyTo.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyTo.trim());

  const triggerShake = useCallback(() => {
    setShadowFlash(true);
    shakeControls.start({
      x: [0, -10, 10, -7, 7, -3, 3, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    });
    setTimeout(() => setShadowFlash(false), 500);
  }, [shakeControls]);

  const bregoTeam = department === 'at' ? BREGO_AT_TEAM : BREGO_PM_TEAM;
  const myTeam = MY_TEAM_ROSTER;

  // Default to first Brego team member.
  useEffect(() => {
    if (bregoTeam.length > 0 && !assignTo) {
      setAssignTo(bregoTeam[0].name);
    }
  }, [bregoTeam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key closes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setAttempted(true);
    setEmailTouched(true);
    const emailInvalid = notifyTo.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyTo.trim());
    if (!taskName.trim() || !assignTo || emailInvalid) {
      triggerShake();
      if (!taskName.trim()) taskNameRef.current?.focus();
      return;
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'No date set';
      const d = new Date(dateStr + 'T00:00:00');
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    };

    const allMembers = [...bregoTeam, ...myTeam];
    const selectedMember = allMembers.find(m => m.name === assignTo);
    const isMyTeamMember = myTeam.some(m => m.name === assignTo);

    const newTask: AssignTodoTask = {
      id: `task-${Date.now()}`,
      title: taskName.trim(),
      dueDate: formatDate(dueDate),
      isCompleted: false,
      assignee: selectedMember?.name || assignTo,
      assigneeInitials: selectedMember?.initials || assignTo.split(' ').map(n => n[0]).join('').toUpperCase(),
      assigneeColor: selectedMember?.color || '#2563EB',
      project: project,
      priority: priority,
      assignedBy: 'You',
      target: isMyTeamMember ? 'my_team' : (department === 'at' ? 'brego_at' : 'brego_pm'),
    };
    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-[6px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{
          boxShadow: shadowFlash
            ? '0 24px 64px -16px rgba(220, 38, 38, 0.22), 0 12px 32px -8px rgba(220, 38, 38, 0.12), 0 0 0 1px rgba(220, 38, 38, 0.12)'
            : '0 24px 64px -16px rgba(32, 76, 199, 0.18), 0 12px 32px -8px rgba(32, 76, 199, 0.10), 0 0 0 1px rgba(32, 76, 199, 0.06)',
          maxHeight: '85vh',
          transition: 'box-shadow 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div animate={shakeControls} className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100" style={{ background: 'linear-gradient(to bottom, rgba(32,76,199,0.02), transparent)' }}>
            <div>
              <h2 className="text-lg text-gray-900" style={{ fontWeight: 700 }}>Add a To-Do</h2>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 500 }}>{project}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
            {/* Task */}
            <div>
              <label htmlFor="add-todo-task-name" className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Task <span className="text-red-400">*</span></label>
              <input
                ref={taskNameRef}
                id="add-todo-task-name"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-150 placeholder:text-gray-400 ${
                  taskNameError
                    ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50/40'
                    : 'border-gray-300 focus:ring-blue-500/40 focus:border-blue-500'
                }`}
                aria-invalid={taskNameError}
                aria-describedby={taskNameError ? 'task-name-error' : undefined}
                autoFocus
              />
              <AnimatePresence>
                {taskNameError && (
                  <motion.p
                    id="task-name-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500"
                    style={{ fontWeight: 500 }}
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Task is required
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Assign To */}
            <div>
              <label htmlFor="add-todo-assign" className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Assign To</label>
              <select
                id="add-todo-assign"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150 bg-white"
              >
                <optgroup label={`Brego ${department === 'at' ? 'A&T' : 'PM'} Team`}>
                  {bregoTeam.map(m => (
                    <option key={m.name} value={m.name}>{m.name} — {m.role}</option>
                  ))}
                </optgroup>
                <optgroup label="My Team">
                  {myTeam.map(m => (
                    <option key={m.name} value={m.name}>{m.name} — {m.role}</option>
                  ))}
                </optgroup>
              </select>
              {assignTo && (
                <p className="text-[13px] mt-1.5 flex items-center gap-1.5">
                  {myTeam.some(m => m.name === assignTo) ? (
                    <>
                      <Users className="w-3 h-3 text-purple-500" />
                      <span className="text-purple-600" style={{ fontWeight: 500 }}>This task will be assigned to your team member</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-600" style={{ fontWeight: 500 }}>This task will be assigned to Brego's {department === 'at' ? 'A&T' : 'PM'} team</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="add-todo-due-date" className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Due Date</label>
              <input
                id="add-todo-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
              />
            </div>

            {/* Notify To */}
            <div>
              <label htmlFor="add-todo-notify" className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Notify To</label>
              <input
                id="add-todo-notify"
                type="email"
                value={notifyTo}
                onChange={(e) => setNotifyTo(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Enter email address"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-150 placeholder:text-gray-400 ${
                  emailFormatError
                    ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50/40'
                    : 'border-gray-300 focus:ring-blue-500/40 focus:border-blue-500'
                }`}
                aria-invalid={emailFormatError}
                aria-describedby={emailFormatError ? 'notify-email-error' : undefined}
              />
              <AnimatePresence>
                {emailFormatError && (
                  <motion.p
                    id="notify-email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500"
                    style={{ fontWeight: 500 }}
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Please enter a valid email address
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="add-todo-notes" className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Notes</label>
              <textarea
                id="add-todo-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150 resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Attach Files */}
            <div>
              <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Attach Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, PNG, JPG up to 10MB</p>
                </label>
              </div>

              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Priority</label>
              <div className="flex items-center gap-2" role="radiogroup" aria-label="Task priority">
                {(['P1', 'P2', 'P3'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    role="radio"
                    aria-checked={priority === p}
                    className={`flex-1 py-2.5 text-sm rounded-xl transition-all duration-150 ${priority !== p ? 'hover:bg-gray-50' : ''}`}
                    style={priority === p ? {
                      border: `1.5px solid ${p === 'P1' ? 'rgba(220,38,38,0.3)' : p === 'P2' ? 'rgba(217,119,6,0.3)' : 'rgba(156,163,175,0.35)'}`,
                      backgroundColor: p === 'P1' ? '#FEF2F2' : p === 'P2' ? '#FFFBEB' : '#F9FAFB',
                      color: p === 'P1' ? '#DC2626' : p === 'P2' ? '#D97706' : '#6B7280',
                      fontWeight: 600,
                    } : { border: '1px solid rgba(0,0,0,0.14)', color: '#6B7280' }}
                  >
                    {p === 'P1' ? 'P1 Urgent' : p === 'P2' ? 'P2 High' : 'P3 Normal'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100" style={{ background: 'linear-gradient(to top, rgba(32,76,199,0.015), transparent)' }}>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm text-white rounded-xl hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: BRAND, fontWeight: 600, boxShadow: '0 4px 14px rgba(32,76,199,0.3)' }}
            >
              Add Task
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
