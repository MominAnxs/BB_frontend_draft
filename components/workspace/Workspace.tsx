'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect, type ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  BarChart3,
  Briefcase,
  Database,
  Calendar,
  ChevronLeft,
  X,
  Plus,
  Upload,
  Search,
  Check,
  ChevronDown,
  GripVertical,
  Sparkles,
  CheckSquare,
  Trash2,
  Pencil,
  Building2,
  Users,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  AlertTriangle,
  Filter,
  Clock,
  ChevronRight,
  Download,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Zap,
  Rocket,
} from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster, toast } from 'sonner';
import { UserInfo } from '../../types';
import { ProfileDropdown } from '../ProfileDropdown';
import { NotificationBell } from '../NotificationPanel';
import { BregoLogo } from '../BregoLogo';
import { NavTabs } from '../NavTabs';
import { MyAssignmentsWidget } from './MyAssignmentsWidget';
import { MyAssignmentsDetail } from './MyAssignmentsDetail';
import { TaskDetailDrawer, buildTaskDetail } from './TaskDetailDrawer';
import { BregoGPTDrawer } from '../reports/BregoGPTDrawer';
import type { TaskDetail } from './TaskDetailDrawer';
import { DatePickerPopover, parseDisplayDate } from './DatePickerPopover';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { SingleAssigneePickerPopover, type TeamMember, BREGO_AT_TEAM, BREGO_PM_TEAM, MY_TEAM_ROSTER } from './AssigneePickerPopover';
import { AddTodoModal, type AssignTodoTask } from './AddTodoModal';
import type { BusinessAccount } from '../business/BusinessAccountCard';
import { SidebarStatusCard, type OnboardingProgress } from '../upgrade/SidebarStatusCard';

// Dynamic imports — upgrade flow + setup complete modals only load when triggered
const UpgradeFlow = dynamic(() => import('../upgrade/UpgradeFlow').then(m => ({ default: m.UpgradeFlow })), { ssr: false });
const ServiceTeamOnboarding = dynamic(() => import('../upgrade/ServiceTeamOnboarding').then(m => ({ default: m.ServiceTeamOnboarding })), { ssr: false });
const AccountsTeamOnboarding = dynamic(() => import('../upgrade/AccountsTeamOnboarding').then(m => ({ default: m.AccountsTeamOnboarding })), { ssr: false });

// Re-export MediaPlan type for ChatInterface compatibility
export interface MediaPlanOffer {
  startDate: string;
  endDate: string;
  offer: string;
  communication: string;
  actionOnWebsite?: string;
  targeting?: string;
  comments?: string;
}

export interface MediaPlan {
  month: string;
  year: string;
  type: 'Monthly' | 'Quarterly';
  combinedPlan: any;
  /** Human-readable date string set by producer (optional). */
  receivedDate?: string;
  /** Promotional offers attached to this plan (optional). */
  offers?: MediaPlanOffer[];
}

const BRAND = '#204CC7';

interface WorkspaceProps {
  userInfo: UserInfo;
  onNavigateToChat: (plan?: MediaPlan) => void;
  onNavigateToReports: () => void;
  onNavigateToDataroom: () => void;
  onBack: () => void;
  onProfileSettings?: () => void;
  onInviteTeam?: () => void;
  onAddBusiness?: () => void;
  businessTypeLabel?: string;
  businessAccounts?: BusinessAccount[];
  activeAccountId?: string;
  onSwitchAccount?: (account: BusinessAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  notificationCounts?: Record<string, number>;
  /** Onboarding progress state from parent */
  onboardingProgress?: OnboardingProgress | null;
  /** When true, show "Setting Up" progress card instead of "Upgrade Now" */
  showSettingUp?: boolean;
  /** Called when user clicks "Upgrade Now" */
  onUpgradeClick?: () => void;
  /** Called when user clicks "Continue" on Setting Up card */
  onContinueSetup?: () => void;
  /** Service type for the Setting Up card steps */
  serviceType?: 'marketing' | 'finance';
  /** When true, auto-open the Raise Incident drawer on mount */
  initialRaiseIncident?: boolean;
  /** Pre-fill service field when raising incident from chat */
  initialIncidentService?: 'Performance Marketing' | 'Accounts & Taxation' | '';
  /** Called after the initialRaiseIncident flag has been consumed */
  onRaiseIncidentConsumed?: () => void;
  /** Incidents created from the inline chat form */
  chatIncidents?: Incident[];
  /** Override the initial active module tab */
  initialModule?: 'tasks' | 'incidents';
}

export function Workspace({ 
  userInfo, 
  onNavigateToChat, 
  onNavigateToReports,
  onNavigateToDataroom,
  onBack,
  onProfileSettings,
  onInviteTeam,
  onAddBusiness,
  businessTypeLabel,
  businessAccounts,
  activeAccountId,
  onSwitchAccount,
  onDeleteAccount,
  notificationCounts,
  onboardingProgress,
  showSettingUp,
  onUpgradeClick,
  onContinueSetup,
  serviceType = 'marketing',
  initialRaiseIncident,
  initialIncidentService,
  onRaiseIncidentConsumed,
  chatIncidents,
  initialModule,
}: WorkspaceProps) {
  const [activeModule, setActiveModule] = useState<'tasks' | 'incidents'>(initialModule || (initialRaiseIncident ? 'incidents' : 'tasks'));
  const [tasksDetailView, setTasksDetailView] = useState<string>('home');

  // ─── Local fallback for the Upgrade Now / Setup Complete flow ──────────
  // Used when parent doesn't wire `onUpgradeClick` / `onContinueSetup` (e.g. when
  // Workspace is rendered standalone from the /workspace route). Guarantees
  // parity with the Chat Module's flow.
  const [localShowUpgradeFlow, setLocalShowUpgradeFlow] = useState(false);
  const [localUpgradeResumeMode, setLocalUpgradeResumeMode] = useState(false);
  const [showServiceTeamOnboarding, setShowServiceTeamOnboarding] = useState(false);
  const [showAccountsTeamOnboarding, setShowAccountsTeamOnboarding] = useState(false);
  const [localProgress, setLocalProgress] = useState<OnboardingProgress>({
    isUpgraded: false, selectedPlan: '', completedSteps: [], currentStep: 'connect',
  });
  const activeProgress = onboardingProgress ?? localProgress;
  const updateLocalProgress = (updater: (prev: OnboardingProgress) => OnboardingProgress) => {
    setLocalProgress(updater);
  };

  const workspaceNavItems = [
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    // { id: 'media-plans' as const, label: 'Media Plans', icon: BarChart3 }, // temporarily hidden
    { id: 'incidents' as const, label: 'Incidents', icon: AlertTriangle },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Manrope, sans-serif',
            borderRadius: '14px',
            fontSize: '13px',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
          },
        }}
      />
      {/* Global Top Navigation */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Brego Logo */}
        <div className="flex items-center">
          <BregoLogo size={36} variant="full" />
        </div>

        {/* Center: Navigation Buttons */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false, onClick: () => onNavigateToChat() },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: false, onClick: onNavigateToReports },
            { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: true },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false, onClick: onNavigateToDataroom },
          ]} />
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-3">
          <NotificationBell service={userInfo.selectedService === 'Accounts & Taxation' ? 'finance' : 'marketing'} />
          <ProfileDropdown userInfo={userInfo} onProfileSettingsClick={onProfileSettings} onInviteTeamClick={onInviteTeam} onAddBusiness={onAddBusiness} businessTypeLabel={businessTypeLabel} businessAccounts={businessAccounts} activeAccountId={activeAccountId} onSwitchAccount={onSwitchAccount} onDeleteAccount={onDeleteAccount} notificationCounts={notificationCounts} />
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Navigation */}
        <div className="w-64 sidebar-glass flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em' }}>Workspace</span>
            </div>

            <nav className="space-y-1">
              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-brand-light text-brand shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Trial / Onboarding Status — pushed to bottom */}
          <div className="p-4 border-t border-gray-200/40">
            <SidebarStatusCard
              onboardingProgress={
                activeProgress.isUpgraded
                  ? activeProgress
                  : { isUpgraded: false, selectedPlan: '', completedSteps: [], currentStep: 'connect' }
              }
              onUpgradeClick={() => {
                if (onUpgradeClick) { onUpgradeClick(); return; }
                setLocalUpgradeResumeMode(false);
                setLocalShowUpgradeFlow(true);
              }}
              onContinueOnboarding={() => {
                if (onContinueSetup) { onContinueSetup(); return; }
                setLocalUpgradeResumeMode(true);
                setLocalShowUpgradeFlow(true);
              }}
              serviceType={serviceType}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Sub-header — hidden when inside a detail view */}
          {!(activeModule === 'tasks' && tasksDetailView !== 'home') && <div className="subheader-glass sticky top-0 z-10 px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {workspaceNavItems.find(item => item.id === activeModule)?.label}
                </h1>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>
                  {activeModule === 'tasks' && 'Manage and assign tasks across your teams'}
                  {activeModule === 'incidents' && 'Monitor and resolve service incidents'}
                </p>
              </div>
            </div>
          </div>}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {activeModule === 'tasks' && <TasksModuleView onViewChange={setTasksDetailView} />}
            {/* MediaPlansModuleView temporarily hidden */}
            {activeModule === 'incidents' && <IncidentsModuleView initialRaiseIncident={initialRaiseIncident} initialIncidentService={initialIncidentService} onRaiseIncidentConsumed={onRaiseIncidentConsumed} chatIncidents={chatIncidents} />}
          </div>
        </div>
      </div>

      {/* Upgrade Flow Overlay — local fallback when parent doesn't provide a trigger */}
      {localShowUpgradeFlow && (
        <UpgradeFlow
          userInfo={userInfo}
          onClose={() => setLocalShowUpgradeFlow(false)}
          onComplete={() => {
            setLocalShowUpgradeFlow(false);
            const isFinance = userInfo.selectedService === 'Accounts & Taxation';
            updateLocalProgress(prev => ({
              ...prev,
              completedSteps: isFinance
                ? ['connect', 'basics', 'dataAccess', 'documents']
                : ['connect', 'basics', 'competitors', 'products'],
              currentStep: 'complete',
              serviceType: isFinance ? 'finance' : 'marketing',
            }));
            // Fire the Setup Complete flow — parity with the Chat Module
            if (isFinance) {
              setShowAccountsTeamOnboarding(true);
            } else {
              setShowServiceTeamOnboarding(true);
            }
          }}
          onUpgradeConfirmed={(plan) => {
            updateLocalProgress(prev => ({ ...prev, isUpgraded: true, selectedPlan: plan }));
          }}
          onStepComplete={(stepId) => {
            updateLocalProgress(prev => ({
              ...prev,
              completedSteps: prev.completedSteps.includes(stepId) ? prev.completedSteps : [...prev.completedSteps, stepId],
            }));
          }}
          onStepChange={(stepId) => {
            updateLocalProgress(prev => ({ ...prev, currentStep: stepId }));
          }}
          resumeOnboarding={localUpgradeResumeMode && activeProgress.isUpgraded ? activeProgress : undefined}
        />
      )}

      {/* Service Team Onboarding — Performance Marketing Setup Complete modal */}
      <ServiceTeamOnboarding
        isOpen={showServiceTeamOnboarding}
        onComplete={() => {
          setShowServiceTeamOnboarding(false);
          updateLocalProgress(prev => ({ ...prev, stoCompleted: true }));
        }}
        businessType={(userInfo.businessModel === 'leadgen' ? 'leadgen' : 'ecommerce')}
        clientName={`${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim()}
        companyName={userInfo.companyName ?? ''}
        monthlyBudget={userInfo.adSpendRange}
        selectedPlan={activeProgress.selectedPlan}
      />

      {/* Accounts Team Onboarding — Accounts & Taxation Setup Complete modal */}
      <AccountsTeamOnboarding
        isOpen={showAccountsTeamOnboarding}
        onComplete={() => {
          setShowAccountsTeamOnboarding(false);
          updateLocalProgress(prev => ({ ...prev, stoCompleted: true }));
        }}
        clientName={`${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim()}
        companyName={userInfo.companyName ?? ''}
        selectedPlan={activeProgress.selectedPlan}
        businessType={userInfo.businessType}
        revenueRange={userInfo.revenueRange}
      />
    </div>
  );
}

// Shared task data types (AssignTodoTask, TaskTarget) now live alongside
// AddTodoModal — both producers of these tasks (the modal) and consumers
// (this file's task tables) import them from there.

// ─── Realistic task data for Assign To-Do › Accounts & Taxation ──────
const ACCOUNTS_TASKS: AssignTodoTask[] = [
  { id: 'at1', title: 'Prepare and file monthly GST returns for active client accounts', dueDate: 'Tue, 24 Feb', isCompleted: false, assignee: 'Suresh I.', assigneeInitials: 'SI', assigneeColor: '#059669', project: 'Accounts & Taxation', priority: 'P1', assignedBy: 'You', target: 'brego_at' },
  { id: 'at2', title: 'Submit Q4 bank reconciliation statements', dueDate: 'Wed, 25 Feb', isCompleted: false, assignee: 'Meera G.', assigneeInitials: 'MG', assigneeColor: '#7C3AED', project: 'Accounts & Taxation', priority: 'P2', assignedBy: 'You', target: 'brego_at' },
  { id: 'at3', title: 'Review and update TDS computation sheet for February payroll', dueDate: 'Thu, 26 Feb', isCompleted: true, assignee: 'Arjun R.', assigneeInitials: 'AR', assigneeColor: '#2563EB', project: 'Accounts & Taxation', priority: 'P3', assignedBy: 'Vivek T.', target: 'brego_at' },
  { id: 'at4', title: 'Complete compliance audit checklist for RetailMax onboarding', dueDate: 'Fri, 27 Feb', isCompleted: false, assignee: 'Deepa N.', assigneeInitials: 'DN', assigneeColor: '#DC2626', project: 'Accounts & Taxation', priority: 'P2', assignedBy: 'You', target: 'brego_at' },
  { id: 'at5', title: 'Reconcile Q4 expense reports and flag discrepancies', dueDate: 'Mon, 2 Mar', isCompleted: false, assignee: 'Kiran B.', assigneeInitials: 'KB', assigneeColor: '#D97706', project: 'Accounts & Taxation', priority: 'P1', assignedBy: 'Anita J.', target: 'brego_at' },
  { id: 'at6', title: 'Generate P&L statement and balance sheet for Q3 board review', dueDate: 'Tue, 3 Mar', isCompleted: false, assignee: 'Pooja S.', assigneeInitials: 'PS', assigneeColor: '#0891B2', project: 'Accounts & Taxation', priority: 'P2', assignedBy: 'You', target: 'brego_at' },
  { id: 'at7', title: 'Prepare statutory audit documentation package', dueDate: 'Wed, 4 Mar', isCompleted: false, assignee: 'Sanjay V.', assigneeInitials: 'SV', assigneeColor: '#059669', project: 'Accounts & Taxation', priority: 'P1', assignedBy: 'Vivek T.', target: 'brego_at' },
];

// ─── Realistic task data for Assign To-Do › Performance Marketing ────
const PERFORMANCE_TASKS: AssignTodoTask[] = [
  { id: 'pm1', title: 'Review Google Ads campaign structure and pause underperforming ad groups', dueDate: 'Tue, 24 Feb', isCompleted: false, assignee: 'Priya S.', assigneeInitials: 'PS', assigneeColor: '#DC2626', project: 'Performance Marketing', priority: 'P1', assignedBy: 'You', target: 'brego_pm' },
  { id: 'pm2', title: 'Set up conversion tracking pixels on new landing pages', dueDate: 'Wed, 25 Feb', isCompleted: false, assignee: 'Amit K.', assigneeInitials: 'AK', assigneeColor: '#2563EB', project: 'Performance Marketing', priority: 'P1', assignedBy: 'Rahul M.', target: 'brego_pm' },
  { id: 'pm3', title: 'Create A/B test variants for LinkedIn lead gen creatives', dueDate: 'Thu, 26 Feb', isCompleted: true, assignee: 'Neha P.', assigneeInitials: 'NP', assigneeColor: '#D97706', project: 'Performance Marketing', priority: 'P3', assignedBy: 'You', target: 'brego_pm' },
  { id: 'pm4', title: 'Optimize Meta Ads audience targeting based on Q4 lookalike data', dueDate: 'Fri, 27 Feb', isCompleted: false, assignee: 'Rohit D.', assigneeInitials: 'RD', assigneeColor: '#059669', project: 'Performance Marketing', priority: 'P2', assignedBy: 'Sneha K.', target: 'brego_pm' },
  { id: 'pm5', title: 'Prepare monthly ROAS and CAC performance report', dueDate: 'Mon, 2 Mar', isCompleted: false, assignee: 'Kavita R.', assigneeInitials: 'KR', assigneeColor: '#7C3AED', project: 'Performance Marketing', priority: 'P1', assignedBy: 'You', target: 'brego_pm' },
  { id: 'pm6', title: 'Update keyword strategy for branded search campaigns', dueDate: 'Tue, 3 Mar', isCompleted: false, assignee: 'Anjali M.', assigneeInitials: 'AM', assigneeColor: '#0891B2', project: 'Performance Marketing', priority: 'P2', assignedBy: 'Rahul M.', target: 'brego_pm' },
  { id: 'pm7', title: 'Launch retargeting campaign for abandoned cart segment', dueDate: 'Wed, 4 Mar', isCompleted: false, assignee: 'Priya S.', assigneeInitials: 'PS', assigneeColor: '#DC2626', project: 'Performance Marketing', priority: 'P1', assignedBy: 'You', target: 'brego_pm' },
];

// ─── Progress Ring (shared) ──────────────────────────────────────────
function ProgressRing({ completed, total, size = 44 }: { completed: number; total: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference - progress * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={BRAND} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-500" />
      </svg>
    </div>
  );
}

// ─── Task List Skeleton ──────────────────────────────────────────────
function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100/80"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px -2px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-[18px] animate-pulse">
          <div className="mt-[3px] w-[20px] h-[20px] rounded-md bg-gray-100" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 bg-gray-100 rounded-full" style={{ width: `${65 + (i * 7) % 30}%` }} />
            <div className="flex items-center gap-3">
              <div className="h-2.5 bg-gray-50 rounded-full w-24" />
              <div className="w-1 h-1 rounded-full bg-gray-100" />
              <div className="flex items-center gap-1.5"><div className="w-[18px] h-[18px] bg-gray-100 rounded-full" /><div className="h-2.5 bg-gray-50 rounded-full w-14" /></div>
              <div className="w-1 h-1 rounded-full bg-gray-100" />
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-50 rounded" /><div className="h-2.5 bg-gray-50 rounded-full w-16" /></div>
            </div>
          </div>
          <div className="mt-[3px] w-12 h-6 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Assign To-Do Detail View (Basecamp-style) ──────────────────────
function AssignTodoDetail({
  title,
  initialTasks,
  onBack,
  department,
}: {
  title: string;
  initialTasks: AssignTodoTask[];
  onBack: () => void;
  department: 'at' | 'pm';
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [showGPT, setShowGPT] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<'manual' | 'date' | 'status' | 'assignee' | 'priority'>('manual');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [dueThisWeek, setDueThisWeek] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [assignerFilter, setAssignerFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Simulate initial data loading for premium feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;

  // Unique assigners for filter
  const allAssigners = [...new Set(tasks.map(t => t.assignedBy))];
  const assignerCounts: Record<string, number> = { All: tasks.length };
  allAssigners.forEach(a => { assignerCounts[a] = tasks.filter(t => t.assignedBy === a).length; });

  // Compute counts for filter badges
  const overdueCount = tasks.filter(t => !t.isCompleted && isDateOverdue(t.dueDate)).length;
  const dueThisWeekCount = tasks.filter(t => isDateThisWeek(t.dueDate)).length;
  const statusCounts = { All: tasks.length, Pending: tasks.filter(t => !t.isCompleted).length, Completed: tasks.filter(t => t.isCompleted).length };
  const priorityCounts = { All: tasks.length, P1: tasks.filter(t => t.priority === 'P1').length, P2: tasks.filter(t => t.priority === 'P2').length, P3: tasks.filter(t => t.priority === 'P3').length };

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

  const renameTask = useCallback((id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
    toast.success('Task renamed');
  }, []);

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

  const filtered = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === 'Completed' && !t.isCompleted) return false;
    if (statusFilter === 'Pending' && t.isCompleted) return false;
    if (dueThisWeek && !isDateThisWeek(t.dueDate)) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (overdueOnly && !(isDateOverdue(t.dueDate) && !t.isCompleted)) return false;
    if (assignerFilter !== 'All' && t.assignedBy !== assignerFilter) return false;
    return true;
  });

  // Sort filtered results
  const sorted = sortBy === 'manual' ? filtered : [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const aOverdue = !a.isCompleted && isDateOverdue(a.dueDate) ? 0 : 1;
      const bOverdue = !b.isCompleted && isDateOverdue(b.dueDate) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const aDate = parseDisplayDate(a.dueDate)?.getTime() ?? 0;
      const bDate = parseDisplayDate(b.dueDate)?.getTime() ?? 0;
      return aDate - bDate;
    }
    if (sortBy === 'status') return Number(a.isCompleted) - Number(b.isCompleted);
    if (sortBy === 'assignee') return a.assignee.localeCompare(b.assignee);
    if (sortBy === 'priority') {
      const order: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  const updateDueDate = useCallback((id: string, newDate: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: newDate } : t));
    toast.success('Due date updated', { description: newDate });
  }, []);

  const updatePriority = useCallback((id: string, newPriority: Priority) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
    toast.success('Priority updated', { description: newPriority === 'P1' ? 'Urgent' : newPriority === 'P2' ? 'High' : 'Normal' });
  }, []);

  const updateAssignee = useCallback((id: string, member: TeamMember) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, assignee: member.name, assigneeInitials: member.initials, assigneeColor: member.color } : t));
    toast.success('Assignee updated', { description: member.name });
  }, []);

  const openTaskDetail = (task: AssignTodoTask) => {
    if (batchMode) return;
    const detail = buildTaskDetail({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
      assignees: [{ name: task.assignee, initials: task.assigneeInitials, color: task.assigneeColor }],
      project: task.project,
    });
    setSelectedTask(detail);
  };

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setTasks(prev => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, removed);
      return next;
    });
  }, []);

  const addTask = useCallback((newTask: AssignTodoTask) => {
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task created', { description: newTask.title.slice(0, 60) });
  }, []);

  // Batch actions
  const toggleBatchSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const batchComplete = () => {
    const count = selectedIds.size;
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, isCompleted: true } : t));
    toast.success(`${count} task${count > 1 ? 's' : ''} completed`);
    setSelectedIds(new Set());
    setBatchMode(false);
  };

  const batchDelete = () => {
    const count = selectedIds.size;
    const snapshot = tasks.filter(t => selectedIds.has(t.id));
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
    toast(`${count} task${count > 1 ? 's' : ''} deleted`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setTasks(curr => [...snapshot, ...curr]);
          toast.success(`${count} task${count > 1 ? 's' : ''} restored`);
        },
      },
    });
    setSelectedIds(new Set());
    setBatchMode(false);
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
    setFocusedIndex(-1);
  };

  // Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(t => t.id)));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDueThisWeek(false);
    setPriorityFilter('All');
    setOverdueOnly(false);
    setAssignerFilter('All');
  };

  // Active filter count
  const activeFilterCount = [
    statusFilter !== 'All',
    dueThisWeek,
    priorityFilter !== 'All',
    overdueOnly,
    assignerFilter !== 'All',
    searchQuery.length > 0,
  ].filter(Boolean).length;

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (showAddModal || selectedTask || showGPT) return;

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
          toggleBatchSelect(task.id);
        } else {
          toggleComplete(task.id);
        }
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filtered.length) {
        e.preventDefault();
        openTaskDetail(filtered[focusedIndex]);
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, focusedIndex, batchMode, showAddModal, selectedTask, showGPT, toggleComplete]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listContainerRef.current) {
      const rows = listContainerRef.current.children;
      if (rows[focusedIndex]) {
        (rows[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const teamRoster = department === 'at' ? BREGO_AT_TEAM : BREGO_PM_TEAM;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-5xl mx-auto">
        {/* ═══ Structured Sub-Header ═══ */}
        <div className="bg-white rounded-2xl mb-5" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          {/* ── Title Row + Actions ── */}
          <div className="px-6 pt-5 pb-4 flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-150 flex-shrink-0" aria-label="Go back">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <ProgressRing completed={completedCount} total={totalCount} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-gray-500 mb-0.5" style={{ fontWeight: 500 }}>{completedCount}/{totalCount} Completed</p>
              <h1 className="text-gray-900 truncate" style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.3 }}>Assign To-Do &rsaquo; {title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Ask BregoGPT — secondary */}
              <button
                onClick={() => setShowGPT(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl border border-gray-200/80 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                style={{ fontWeight: 500 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask BregoGPT
              </button>
              {/* Add a To-Do — primary */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-xl hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: BRAND, fontWeight: 600, boxShadow: '0 2px 8px rgba(32,76,199,0.3)' }}
              >
                <Plus className="w-4 h-4" />
                Add a To-Do
              </button>
            </div>
          </div>

          {/* ── Toolbar Row ── */}
          <div className="px-6 pb-4 flex items-center gap-2">
            {/* Search */}
            <div className="relative w-[220px] flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm bg-gray-50 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-150 placeholder:text-gray-400"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-[7px] text-sm rounded-lg border transition-all duration-200 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              }`}
              style={{ fontWeight: 500 }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[10px]" style={{ backgroundColor: BRAND, fontWeight: 700 }}>{activeFilterCount}</span>
              )}
            </button>

            {/* Sort */}
            <SortDropdown selected={sortBy} onSelect={setSortBy} />

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

            {/* Quick toggle filters */}
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
              This Week
              {dueThisWeekCount > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] ${dueThisWeek ? 'bg-emerald-200/70 text-emerald-800' : 'bg-gray-200/80 text-gray-600'}`} style={{ fontWeight: 700 }}>{dueThisWeekCount}</span>
              )}
            </button>
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

            <div className="flex-1" />
          </div>

          {/* ── Expandable Filter Panel (ClickUp-style) ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Status dropdown */}
                    <FilterDropdown
                      label="Status"
                      value={statusFilter}
                      options={['All', 'Pending', 'Completed']}
                      onSelect={setStatusFilter}
                      counts={statusCounts}
                    />

                    {/* Priority dropdown */}
                    <FilterDropdown
                      label="Priority"
                      value={priorityFilter}
                      options={['All', 'P1', 'P2', 'P3']}
                      optionLabels={{ All: 'All', P1: 'Urgent', P2: 'High', P3: 'Normal' }}
                      optionDots={{ P1: '#DC2626', P2: '#D97706', P3: '#9CA3AF' }}
                      onSelect={(v) => setPriorityFilter(v as 'All' | Priority)}
                      counts={priorityCounts}
                    />

                    {/* Assigned By dropdown */}
                    <FilterDropdown
                      label="Assigned By"
                      value={assignerFilter}
                      options={['All', ...allAssigners]}
                      onSelect={setAssignerFilter}
                      counts={assignerCounts}
                    />

                    {/* Clear all */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1.5 px-3 py-[7px] text-xs text-red-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-150"
                        style={{ fontWeight: 600 }}
                      >
                        <X className="w-3 h-3" />
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Batch Action Bar */}
        <AnimatePresence>
          {batchMode && selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-5 py-3 mb-4 bg-white rounded-2xl border border-gray-100"
              style={{ boxShadow: '0 4px 16px -2px rgba(0,0,0,0.06)' }}
            >
              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm hover:underline transition-colors"
                style={{ color: BRAND, fontWeight: 500 }}
              >
                {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
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
                onClick={() => selectedIds.size >= 5 ? setShowConfirmDelete(true) : batchDelete()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-white rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#DC2626', fontWeight: 500 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        {isLoading ? (
          <TaskListSkeleton count={initialTasks.length} />
        ) : (
        <div
          className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100/80 transition-shadow duration-300 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_20px_-4px_rgba(0,0,0,0.05)]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px -2px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
          ref={listContainerRef}
        >
          {sorted.map((task, idx) => {
            const showOverdueDivider = sortBy === 'date' && idx === 0 && !task.isCompleted && isDateOverdue(task.dueDate);
            const showUpcomingDivider = sortBy === 'date' && idx > 0 && (!isDateOverdue(task.dueDate) || task.isCompleted) && !sorted[idx - 1].isCompleted && isDateOverdue(sorted[idx - 1].dueDate);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3), ease: [0.25, 0.1, 0.25, 1] }}
              >
                {showOverdueDivider && (
                  <div className="px-5 py-2 bg-red-50/60 border-b border-red-100">
                    <span className="text-xs text-red-600 uppercase tracking-wider" style={{ fontWeight: 700, fontSize: '10px' }}>Overdue</span>
                  </div>
                )}
                {showUpcomingDivider && (
                  <div className="px-5 py-2 bg-gray-50/60 border-b border-gray-100">
                    <span className="text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 700, fontSize: '10px' }}>Upcoming</span>
                  </div>
                )}
                <DraggableAssignTask
                  task={task}
                  index={idx}
                  moveTask={moveTask}
                  onToggle={toggleComplete}
                  onTaskClick={openTaskDetail}
                  onRename={renameTask}
                  onDelete={deleteTask}
                  batchMode={batchMode}
                  isSelected={selectedIds.has(task.id)}
                  onBatchToggle={toggleBatchSelect}
                  isFocused={focusedIndex === idx}
                  onUpdateDueDate={updateDueDate}
                  onUpdatePriority={updatePriority}
                  onUpdateAssignee={updateAssignee}
                  teamRoster={teamRoster}
                />
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tasks match your filters</p>
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

        {showAddModal && (
          <AddTodoModal
            project={title}
            department={department}
            onClose={() => setShowAddModal(false)}
            onAddTask={addTask}
          />
        )}

        <TaskDetailDrawer
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={(id) => {
            toggleComplete(id);
            setSelectedTask(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
          }}
        />

        <BregoGPTDrawer isOpen={showGPT} onClose={() => setShowGPT(false)} moduleContext="workspace" />

        {showConfirmDelete && (
          <ConfirmDeleteModal
            count={selectedIds.size}
            onConfirm={() => { setShowConfirmDelete(false); batchDelete(); }}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

// ─── Draggable Assign Task ──────────────────────────────────────────
function DraggableAssignTask({
  task,
  index,
  moveTask,
  onToggle,
  onTaskClick,
  onRename,
  onDelete,
  batchMode,
  isSelected,
  onBatchToggle,
  isFocused,
  onUpdateDueDate,
  onUpdatePriority,
  onUpdateAssignee,
  teamRoster,
}: {
  task: AssignTodoTask;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onToggle: (id: string) => void;
  onTaskClick: (task: AssignTodoTask) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  batchMode: boolean;
  isSelected: boolean;
  onBatchToggle: (id: string) => void;
  isFocused: boolean;
  onUpdateDueDate: (id: string, newDate: string) => void;
  onUpdatePriority: (id: string, newPriority: Priority) => void;
  onUpdateAssignee: (id: string, member: TeamMember) => void;
  teamRoster?: TeamMember[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index },
    canDrag: !batchMode && !isEditing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item: { id: string; index: number }) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref) as any);

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

  const isMyTeamMember = MY_TEAM_ROSTER.some(m => m.name === task.assignedBy && task.assignedBy !== 'You');

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 px-5 py-[18px] transition-all duration-200 ease-out group ${
        batchMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${isSelected ? 'bg-blue-50/60' : isFocused ? 'bg-blue-50/30' : 'hover:bg-gray-50/80'}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        ...(isFocused ? { boxShadow: `inset 3px 0 0 0 ${BRAND}` } : {}),
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
        <div className="mt-[3px] flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity">
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

      {/* Title + Meta row — all context below the title */}
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
            className={`text-sm leading-[1.5] transition-colors cursor-pointer ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 hover:text-blue-700'}`}
            onDoubleClick={handleDoubleClick}
          >
            {task.title}
          </p>
        )}

        {/* Meta row: Assigned by · Assignee · Due date */}
        {!isEditing && (
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            {/* Assigned by */}
            <span className="text-[11.5px] text-gray-400" style={{ fontWeight: 400 }}>
              Assigned by{' '}
              <span style={{ fontWeight: 600, color: isMyTeamMember ? '#6366F1' : '#6B7280' }}>
                {task.assignedBy}
              </span>
            </span>
            {isMyTeamMember && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px]" style={{ fontWeight: 600, backgroundColor: '#F5F3FF', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                <Users className="w-2.5 h-2.5" />
                My Team
              </span>
            )}

            <span className="text-gray-200 text-[13px]">·</span>

            {/* Assignee — inline in meta row */}
            <div onClick={(e) => e.stopPropagation()}>
              <SingleAssigneePickerPopover
                currentAssignee={task.assignee}
                currentInitials={task.assigneeInitials}
                currentColor={task.assigneeColor}
                onAssigneeChange={(member) => onUpdateAssignee(task.id, member)}
                roster={teamRoster}
                compact
              />
            </div>

            <span className="text-gray-200 text-[13px]">·</span>

            {/* Due date — inline in meta row */}
            <div onClick={(e) => e.stopPropagation()}>
              <DatePickerPopover
                currentDate={task.dueDate}
                onDateChange={(newDate) => onUpdateDueDate(task.id, newDate)}
                isOverdue={!task.isCompleted && isDateOverdue(task.dueDate)}
                compact
              />
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
        <PriorityBadge
          priority={task.priority}
          onPriorityChange={(p) => onUpdatePriority(task.id, p)}
        />
      </div>
    </div>
  );
}

// ─── Filter Dropdown (scalable, ClickUp-style, portaled) ────────────
function FilterDropdown({
  label,
  value,
  options,
  optionLabels,
  optionDots,
  onSelect,
  counts,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  optionDots?: Record<string, string>;
  onSelect: (v: string) => void;
  counts?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Position the portal menu below the button
  useLayoutEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll (reposition would be complex)
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const displayValue = optionLabels?.[value] ?? value;
  const isActive = value !== 'All' && value !== options[0];

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 pl-3 pr-2.5 py-[7px] text-sm rounded-lg border transition-all duration-150 ${
          isActive
            ? 'bg-blue-50/70 border-blue-200 text-blue-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }`}
        style={{ fontWeight: 500 }}
      >
        <span className="text-gray-400 text-xs" style={{ fontWeight: 600 }}>{label}:</span>
        <span style={{ fontWeight: 600 }}>{displayValue}</span>
        {optionDots?.[value] && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: optionDots[value] }} />
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed w-52 bg-white border border-gray-200/80 rounded-xl overflow-hidden"
          style={{
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)',
            animation: 'filterDropIn 0.15s ease-out',
          }}
        >
          <div className="px-3 pt-2.5 pb-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>{label}</p>
          </div>
          <div className="py-1 px-1.5 pb-1.5">
            {options.map((opt) => {
              const lbl = optionLabels?.[opt] ?? opt;
              const dot = optionDots?.[opt];
              const count = counts?.[opt];
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  onClick={() => { onSelect(opt); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100 ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {dot && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />}
                  <span className="flex-1 text-left" style={{ fontWeight: isSelected ? 600 : 400 }}>{lbl}</span>
                  {count !== undefined && (
                    <span className={`text-xs tabular-nums ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} style={{ fontWeight: 500 }}>{count}</span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: BRAND }} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Sort Dropdown ──────────────────────���───────────────────────────
const SORT_LABELS: Record<string, string> = { manual: 'Manual', date: 'Due Date', status: 'Status', assignee: 'Assignee', priority: 'Priority' };

function SortDropdown({ selected, onSelect }: { selected: 'manual' | 'date' | 'status' | 'assignee' | 'priority'; onSelect: (v: 'manual' | 'date' | 'status' | 'assignee' | 'priority') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3.5 py-[7px] text-sm rounded-lg border transition-all duration-200 ${
          selected !== 'manual'
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
        }`}
        style={{ fontWeight: 500 }}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        Sort{selected !== 'manual' ? `: ${SORT_LABELS[selected]}` : ''}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-40 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl overflow-hidden z-50"
            style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {(['manual', 'date', 'status', 'assignee', 'priority'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center justify-between ${
                  selected === opt ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {SORT_LABELS[opt]}
                {selected === opt && <Check className="w-3.5 h-3.5" style={{ color: BRAND }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Widget Card for Assign To-Do (Basecamp style) ──────────────────
function AssignTodoWidget({
  title,
  tasks,
  onSeeAll,
}: {
  title: string;
  tasks: AssignTodoTask[];
  onSeeAll: () => void;
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(tasks.filter(t => t.isCompleted).map(t => t.id))
  );

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayTasks = tasks.slice(0, 4);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px -4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)', height: 440 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ minHeight: 56 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: title.includes('Accounts') ? 'rgba(5,150,105,0.06)' : 'rgba(37,99,235,0.06)' }}>
            <CheckSquare className="w-3.5 h-3.5" style={{ color: title.includes('Accounts') ? '#059669' : '#2563EB' }} />
          </div>
          <h3 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>Assign To-Do &rsaquo; {title}</h3>
        </div>
        <button
          onClick={onSeeAll}
          className="px-3.5 py-1.5 rounded-lg border transition-all duration-200 hover:bg-gray-50"
          style={{ color: BRAND, borderColor: `${BRAND}30`, fontSize: '13px', fontWeight: 500 }}
        >
          See All
        </button>
      </div>

      {/* Task List */}
      <div className="px-3 pb-3 flex-1 overflow-y-auto">
        {displayTasks.map((task, idx) => {
          const done = completedIds.has(task.id);
          const isMyTeamAssigner = MY_TEAM_ROSTER.some(m => m.name === task.assignedBy);
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
                    borderColor: done ? BRAND : '#D1D5DB',
                    backgroundColor: done ? BRAND : 'transparent',
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

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className={`w-3.5 h-3.5 ${!done && isDateOverdue(task.dueDate) ? 'text-red-500' : 'text-green-600'}`} />
                      <span className={`text-xs ${!done && isDateOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`} style={!done && isDateOverdue(task.dueDate) ? { fontWeight: 600 } : undefined}>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: task.assigneeColor, fontSize: '8px', fontWeight: 600 }}
                        title={task.assignee}
                      >
                        {task.assigneeInitials}
                      </div>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                  </div>

                  {/* Assigned by — subtle label */}
                  {task.assignedBy !== 'You' && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Assigned by <span style={{ fontWeight: 500, color: isMyTeamAssigner ? '#6366F1' : '#6B7280' }}>{task.assignedBy}</span>
                      {isMyTeamAssigner && (
                        <span className="inline-flex items-center gap-0.5 ml-1 px-1 py-0.5 rounded text-[9px]" style={{ fontWeight: 600, backgroundColor: '#F5F3FF', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                          <Users className="w-2 h-2" />
                          My Team
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Media Plan Mock Data ────────────────────────────────────────────
interface MediaPlanEntry {
  id: string;
  channel: string;
  channelIcon: 'google' | 'meta' | 'linkedin' | 'programmatic';
  budget: number;
  spent: number;
  impressions: string;
  clicks: string;
  ctr: string;
  status: 'Active' | 'Paused' | 'Scheduled';
  month: string;
}

const MEDIA_PLAN_DATA: MediaPlanEntry[] = [
  { id: 'mp1', channel: 'Google Ads', channelIcon: 'google', budget: 120000, spent: 87400, impressions: '4.2L', clicks: '12.8K', ctr: '3.05%', status: 'Active', month: 'Mar 2026' },
  { id: 'mp2', channel: 'Meta Ads', channelIcon: 'meta', budget: 95000, spent: 61200, impressions: '6.8L', clicks: '18.4K', ctr: '2.71%', status: 'Active', month: 'Mar 2026' },
  { id: 'mp3', channel: 'LinkedIn Ads', channelIcon: 'linkedin', budget: 45000, spent: 28900, impressions: '1.1L', clicks: '3.2K', ctr: '2.91%', status: 'Active', month: 'Mar 2026' },
  { id: 'mp4', channel: 'Programmatic', channelIcon: 'programmatic', budget: 40000, spent: 0, impressions: '—', clicks: '—', ctr: '—', status: 'Scheduled', month: 'Apr 2026' },
];

// ─── Incidents Mock Data ─────────────────────────────────────────────
export interface IncidentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  service: 'Performance Marketing' | 'Accounts & Taxation';
  dateTime: string;
  sortDate: number;
  description: string;
  impact: string;
  actionTaken?: string;
  raisedBy: string;
  attachments?: IncidentAttachment[];
  /** True when raised via @incident in the chat interface */
  raisedFromChat?: boolean;
  /** True when raised during onboarding kickoff */
  raisedFromOnboarding?: boolean;
}

const INCIDENTS_DATA: Incident[] = [
  {
    id: 'inc1', title: 'Google Ads account suspended — policy violation flagged',
    status: 'Open', service: 'Performance Marketing',
    dateTime: '16 Mar 2026, 09:14 AM', sortDate: 20260316.0914,
    description: 'Account flagged for circumventing automated bidding policies. All active campaigns paused by Google.',
    impact: 'All 12 active Search & Shopping campaigns are offline. Estimated ₹1.8L/day in lost ad spend delivery.',
    raisedBy: 'Priya S.',
  },
  {
    id: 'inc2', title: 'GSTR-3B filing deadline missed for RetailMax',
    status: 'In Progress', service: 'Accounts & Taxation',
    dateTime: '15 Mar 2026, 06:45 PM', sortDate: 20260315.1845,
    description: 'March GSTR-3B return not filed before 11:59 PM deadline. Late fee of ₹50/day applicable under GST Act.',
    impact: 'Late fee accumulating at ₹50/day. Interest at 18% p.a. on outstanding tax liability of ₹2.4L.',
    actionTaken: 'Filing in progress — portal queue expected to clear by tomorrow morning.',
    raisedBy: 'Suresh I.',
  },
  {
    id: 'inc3', title: 'Meta pixel firing duplicate Purchase events on checkout',
    status: 'Open', service: 'Performance Marketing',
    dateTime: '14 Mar 2026, 02:30 PM', sortDate: 20260314.1430,
    description: 'Pixel installed on both checkout and thank-you page, causing double-counted conversions.',
    impact: 'Reported ROAS inflated by ~35%. Audience lookalikes being built on corrupted data.',
    raisedBy: 'Amit K.',
  },
  {
    id: 'inc4', title: 'TDS computation error in February payroll batch',
    status: 'Resolved', service: 'Accounts & Taxation',
    dateTime: '12 Mar 2026, 11:00 AM', sortDate: 20260312.1100,
    description: 'Section 192 TDS deducted at old slab rates for 14 employees due to FY config not updated in payroll system.',
    impact: 'Short deduction of ₹68,400 across 14 salary disbursements. Revised TDS returns filed with TRACES.',
    actionTaken: 'Corrected challan deposited on 13 Mar. Revised 24Q filed and acknowledged.',
    raisedBy: 'Arjun R.',
  },
  {
    id: 'inc5', title: 'LinkedIn campaign budget overspent by ₹12,400',
    status: 'Resolved', service: 'Performance Marketing',
    dateTime: '10 Mar 2026, 04:15 PM', sortDate: 20260310.1615,
    description: 'Daily budget cap not enforced on "Brand Awareness — Q1" campaign group due to accelerated delivery setting.',
    impact: 'Monthly budget of ₹85K exhausted 6 days early. CPM increased to ₹380 vs ₹220 target.',
    actionTaken: 'Switched to standard delivery. Reallocated ₹12.4K from Search budget to cover overspend.',
    raisedBy: 'Kavita R.',
  },
  {
    id: 'inc6', title: 'E-way bill expired for inter-state shipment to Mumbai warehouse',
    status: 'Open', service: 'Accounts & Taxation',
    dateTime: '14 Mar 2026, 08:20 AM', sortDate: 20260314.0820,
    description: 'E-way bill EWB-4821 expired during transit delay. Goods worth ₹4.2L held at Nashik checkpoint.',
    impact: 'Shipment detained — potential penalty of ₹10,000 or 200% of tax evaded, whichever is higher.',
    raisedBy: 'Meera P.',
  },
  {
    id: 'inc7', title: 'Google Analytics 4 data stream disconnected for 48 hours',
    status: 'In Progress', service: 'Performance Marketing',
    dateTime: '13 Mar 2026, 10:05 AM', sortDate: 20260313.1005,
    description: 'GA4 measurement ID removed during website migration. No traffic or conversion data recorded since 11 Mar.',
    impact: '48 hours of attribution data permanently lost. Campaign optimisation paused due to missing signals.',
    actionTaken: 'Measurement ID re-added. Verifying data flow in real-time reports.',
    raisedBy: 'Rohan D.',
  },
  {
    id: 'inc8', title: 'Vendor TDS certificate (Form 16A) not issued for Q3',
    status: 'In Progress', service: 'Accounts & Taxation',
    dateTime: '11 Mar 2026, 03:40 PM', sortDate: 20260311.1540,
    description: 'Form 16A for Oct–Dec 2025 not generated for 8 vendors despite TDS deposited. Vendors raising compliance queries.',
    impact: 'Vendor relationships at risk. Deadline for Q3 certificate issuance is 15 Feb — already overdue.',
    actionTaken: 'Bulk generation initiated via TRACES. 5 of 8 certificates downloaded, remaining 3 have PAN mismatch.',
    raisedBy: 'Nisha T.',
  },
  {
    id: 'inc9', title: 'Shopify conversion tracking broken after theme update',
    status: 'Resolved', service: 'Performance Marketing',
    dateTime: '8 Mar 2026, 01:50 PM', sortDate: 20260308.1350,
    description: 'Theme update removed custom checkout.liquid snippets containing Google and Meta conversion tags.',
    impact: 'Zero conversions reported for 3 days across all paid channels. ₹2.1L ad spend ran without tracking.',
    actionTaken: 'Tags restored via GTM server-side container. Verified with Tag Assistant and Meta Events Manager.',
    raisedBy: 'Amit K.',
  },
  {
    id: 'inc10', title: 'Input tax credit mismatch flagged in GSTR-2A reconciliation',
    status: 'Resolved', service: 'Accounts & Taxation',
    dateTime: '6 Mar 2026, 05:30 PM', sortDate: 20260306.1730,
    description: 'ITC claimed: ₹3.8L vs GSTR-2A available: ₹3.2L. Difference of ₹60,000 across 4 vendor invoices.',
    impact: 'Excess ITC of ₹60,000 may attract reversal with interest under Section 16(2). Notice risk in next assessment.',
    actionTaken: 'Contacted vendors — 3 have filed amended returns. 1 invoice (₹14K) confirmed as ineligible, reversed.',
    raisedBy: 'Suresh I.',
  },
];

// ─── Channel Icon ────────────────────────────────────────────────────
function ChannelIcon({ type, size = 16 }: { type: string; size?: number }) {
  const colors: Record<string, string> = {
    google: '#4285F4',
    meta: '#0081FB',
    linkedin: '#0A66C2',
    programmatic: '#059669',
  };
  const labels: Record<string, string> = {
    google: 'G',
    meta: 'M',
    linkedin: 'in',
    programmatic: 'P',
  };
  return (
    <div
      className="rounded-md flex items-center justify-center text-white"
      style={{ width: size + 8, height: size + 8, backgroundColor: colors[type] || '#6B7280', fontSize: size * 0.55, fontWeight: 700 }}
    >
      {labels[type] || '?'}
    </div>
  );
}

// ─── Incident Status Badge (refined) ─────────────────────────────────
function IncidentStatusBadge({ status }: { status: Incident['status'] }) {
  const configMap: Record<Incident['status'], { bg: string; color: string; dot: string }> = {
    'Open': { bg: 'rgba(220, 38, 38, 0.08)', color: '#DC2626', dot: '#DC2626' },
    'In Progress': { bg: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', dot: '#2563EB' },
    'Resolved': { bg: 'rgba(22, 163, 74, 0.08)', color: '#16A34A', dot: '#16A34A' },
  };
  const config = configMap[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ fontSize: '13px', fontWeight: 500, backgroundColor: config.bg, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: config.dot }} />
      {status}
    </span>
  );
}

// ─── Service Badge ───────────────────────────────────────────────────
function ServiceBadge({ service }: { service: Incident['service'] }) {
  const isPM = service === 'Performance Marketing';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md"
      style={{
        fontSize: '13px', fontWeight: 500,
        color: isPM ? '#2563EB' : '#7C3AED',
        backgroundColor: isPM ? 'rgba(37,99,235,0.06)' : 'rgba(124,58,237,0.06)',
      }}
    >
      {isPM ? 'Performance Marketing' : 'Accounts & Taxation'}
    </span>
  );
}

// ─── Tasks Module View ───────────────────────────────────────────────
function TasksModuleView({ onViewChange }: { onViewChange?: (view: string) => void }) {
  const [activeView, setActiveView] = useState<'home' | 'my-assignments' | 'performance' | 'accounts'>('home');
  const changeView = (v: 'home' | 'my-assignments' | 'performance' | 'accounts') => { setActiveView(v); onViewChange?.(v); };

  if (activeView === 'my-assignments') {
    return <MyAssignmentsDetail onBack={() => changeView('home')} />;
  }

  if (activeView === 'performance') {
    return (
      <AssignTodoDetail
        title="Performance Marketing"
        initialTasks={PERFORMANCE_TASKS}
        onBack={() => changeView('home')}
        department="pm"
      />
    );
  }

  if (activeView === 'accounts') {
    return (
      <AssignTodoDetail
        title="Accounts & Taxation"
        initialTasks={ACCOUNTS_TASKS}
        onBack={() => changeView('home')}
        department="at"
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'assignments', delay: 0, node: <MyAssignmentsWidget onSeeAll={() => changeView('my-assignments')} /> },
          { key: 'at', delay: 0.06, node: <AssignTodoWidget title="Accounts & Taxation" tasks={ACCOUNTS_TASKS} onSeeAll={() => changeView('accounts')} /> },
          { key: 'pm', delay: 0.12, node: <AssignTodoWidget title="Performance Marketing" tasks={PERFORMANCE_TASKS} onSeeAll={() => changeView('performance')} /> },
        ].map(({ key, delay, node }) => (
          <motion.div
            key={key}
            className="flex"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex-1 flex flex-col">{node}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Media Plans Module View ─────────────────────────────────────────
function MediaPlansModuleView() {
  const totalBudget = MEDIA_PLAN_DATA.reduce((s, e) => s + e.budget, 0);
  const totalSpent = MEDIA_PLAN_DATA.reduce((s, e) => s + e.spent, 0);
  const spentPercent = Math.round((totalSpent / totalBudget) * 100);
  const activeChannels = MEDIA_PLAN_DATA.filter(e => e.status === 'Active').length;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  return (
    <div>
      {/* Summary Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget), sub: 'Mar 2026', color: '#0F172A' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), sub: `${spentPercent}% utilised`, color: BRAND },
          { label: 'Remaining', value: formatCurrency(totalBudget - totalSpent), sub: `${100 - spentPercent}% left`, color: '#16A34A' },
          { label: 'Active Channels', value: String(activeChannels), sub: `of ${MEDIA_PLAN_DATA.length} total`, color: '#7C3AED' },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>{card.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: card.color }}>{card.value}</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: '11px', fontWeight: 500 }}>{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Budget Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl p-5 mb-6"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>Budget Utilisation</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: BRAND }}>{spentPercent}% spent</p>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${BRAND}, #4F6ADB)` }}
            initial={{ width: 0 }}
            animate={{ width: `${spentPercent}%` }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>{formatCurrency(totalSpent)} spent</span>
          <span className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>{formatCurrency(totalBudget - totalSpent)} remaining</span>
        </div>
      </motion.div>

      {/* Channel Cards */}
      <div className="grid grid-cols-2 gap-4">
        {MEDIA_PLAN_DATA.map((entry, idx) => {
          const channelSpentPercent = entry.budget > 0 ? Math.round((entry.spent / entry.budget) * 100) : 0;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + idx * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-2xl p-5 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-300 cursor-pointer"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ChannelIcon type={entry.channelIcon} size={18} />
                  <div>
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>{entry.channel}</p>
                    <p className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>{entry.month}</p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-lg"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: entry.status === 'Active' ? '#F0FDF4' : entry.status === 'Paused' ? '#FFF7ED' : '#F0F9FF',
                    color: entry.status === 'Active' ? '#16A34A' : entry.status === 'Paused' ? '#EA580C' : '#0284C7',
                    border: `1px solid ${entry.status === 'Active' ? 'rgba(22,163,74,0.12)' : entry.status === 'Paused' ? 'rgba(234,88,12,0.12)' : 'rgba(2,132,199,0.12)'}`,
                  }}
                >
                  {entry.status}
                </span>
              </div>

              {/* Spend bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-500" style={{ fontSize: '12px', fontWeight: 500 }}>
                    {formatCurrency(entry.spent)} <span className="text-gray-300">/</span> {formatCurrency(entry.budget)}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND }}>{channelSpentPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: BRAND }}
                    initial={{ width: 0 }}
                    animate={{ width: `${channelSpentPercent}%` }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 + idx * 0.06 }}
                  />
                </div>
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div>
                  <p className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>Impressions</p>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{entry.impressions}</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>Clicks</p>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{entry.clicks}</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: '11px', fontWeight: 500 }}>CTR</p>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{entry.ctr}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Export Incidents as Report ───────────────────────────────────────
function exportIncidentsReport(incidents: Incident[]) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const statusColor = (s: string) => s === 'Open' ? '#DC2626' : s === 'In Progress' ? '#2563EB' : '#16A34A';

  const rows = incidents.map(inc => `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 12px 16px; font-size: 13px; color: #374151; white-space: nowrap;">${inc.dateTime}</td>
      <td style="padding: 12px 16px;">
        <div style="font-size: 13px; font-weight: 500; color: #0F172A; margin-bottom: 2px;">${inc.title}</div>
        <div style="font-size: 12px; color: #94A3B8;">Raised by ${inc.raisedBy}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 13px; color: #64748B;">${inc.service}</td>
      <td style="padding: 12px 16px;">
        <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; color: ${statusColor(inc.status)}; background: ${statusColor(inc.status)}12;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor(inc.status)};"></span>
          ${inc.status}
        </span>
      </td>
    </tr>
  `).join('');

  const openCount = incidents.filter(i => i.status === 'Open').length;
  const ipCount = incidents.filter(i => i.status === 'In Progress').length;
  const resCount = incidents.filter(i => i.status === 'Resolved').length;

  const html = `<!DOCTYPE html><html><head><title>Incident Report — Brego Business</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Manrope', system-ui, sans-serif; background: #fff; color: #0F172A; padding: 48px; }
      @media print { body { padding: 24px; } }
    </style></head><body>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #F1F5F9;">
      <div>
        <h1 style="font-size: 20px; font-weight: 700; color: #0F172A;">Incident Report</h1>
        <p style="font-size: 13px; color: #64748B; margin-top: 4px;">Generated on ${dateStr} at ${timeStr}</p>
      </div>
      <div style="font-size: 14px; font-weight: 700; color: #204CC7;">Brego Business</div>
    </div>
    <div style="display: flex; gap: 16px; margin-bottom: 28px;">
      <div style="flex: 1; padding: 16px; border-radius: 12px; background: rgba(220,38,38,0.04); border: 1px solid rgba(220,38,38,0.08);">
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Open</div>
        <div style="font-size: 24px; font-weight: 700; color: #DC2626;">${openCount}</div>
      </div>
      <div style="flex: 1; padding: 16px; border-radius: 12px; background: rgba(37,99,235,0.04); border: 1px solid rgba(37,99,235,0.08);">
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">In Progress</div>
        <div style="font-size: 24px; font-weight: 700; color: #2563EB;">${ipCount}</div>
      </div>
      <div style="flex: 1; padding: 16px; border-radius: 12px; background: rgba(22,163,74,0.04); border: 1px solid rgba(22,163,74,0.08);">
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Resolved</div>
        <div style="font-size: 24px; font-weight: 700; color: #16A34A;">${resCount}</div>
      </div>
    </div>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #F1F5F9; border-radius: 12px; overflow: hidden;">
      <thead>
        <tr style="background: #FAFBFC;">
          <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</th>
          <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Incident</th>
          <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Service</th>
          <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center;">
      Confidential — Brego Business © 2026. Total incidents: ${incidents.length}
    </div>
    <script>window.print();</script>
  </body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

// ─── Raise Incident Drawer ──────────────────────────────────────────
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_EXT_LABEL = 'PNG, JPG, GIF, WebP, PDF, CSV, XLSX';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function RaiseIncidentDrawer({
  onClose,
  onSubmit,
  defaultService,
}: {
  onClose: () => void;
  onSubmit: (incident: Incident) => void;
  defaultService?: 'Performance Marketing' | 'Accounts & Taxation' | '';
}) {
  const [service, setService] = useState<'' | 'Performance Marketing' | 'Accounts & Taxation'>(defaultService || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<IncidentAttachment[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = service !== '' && title.trim().length >= 10 && description.trim().length >= 20;

  const processFiles = (files: FileList | File[]) => {
    setFileError('');
    const fileArr = Array.from(files);
    const remaining = MAX_FILES - attachments.length;

    if (remaining <= 0) {
      setFileError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const toAdd = fileArr.slice(0, remaining);
    const rejected: string[] = [];

    const validFiles: IncidentAttachment[] = [];
    toAdd.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push(`"${file.name}" — unsupported format`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`"${file.name}" — exceeds 10 MB`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const att: IncidentAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      if (isImage) {
        att.previewUrl = URL.createObjectURL(file);
      }
      validFiles.push(att);
    });

    if (rejected.length > 0) {
      setFileError(rejected[0]);
    }
    if (fileArr.length > remaining) {
      setFileError(`Only ${remaining} more file${remaining === 1 ? '' : 's'} can be added (max ${MAX_FILES})`);
    }
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const removed = prev.find(a => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter(a => a.id !== id);
    });
    setFileError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (!isValid) return;
    setSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
      const sortNum = parseFloat(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`);

      const newIncident: Incident = {
        id: `inc-new-${Date.now()}`,
        title: title.trim(),
        status: 'Open',
        service: service as 'Performance Marketing' | 'Accounts & Taxation',
        dateTime: `${dateStr}, ${timeStr}`,
        sortDate: sortNum,
        description: description.trim(),
        impact: 'Impact assessment pending.',
        raisedBy: 'You',
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      onSubmit(newIncident);
      toast.success('Incident raised successfully');
    }, 600);
  };

  const fieldError = (condition: boolean) => attempted && !condition;

  const isImage = (type: string) => type.startsWith('image/');

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white h-full flex flex-col"
          style={{ width: 520, boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(32,76,199,0.10) 0%, rgba(32,76,199,0.05) 100%)' }}
                >
                  <AlertTriangle size={18} style={{ color: '#204CC7' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>Raise an Incident</p>
                  <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', marginTop: 2 }}>Report an issue to your service team</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors mt-0.5"
              >
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-6">

              {/* Service */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                  Service <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="flex gap-3">
                  {([
                    { key: 'Performance Marketing', label: 'Performance Marketing', color: '#204CC7', icon: '📈' },
                    { key: 'Accounts & Taxation', label: 'Accounts & Taxation', color: '#7C3AED', icon: '📊' },
                  ] as const).map(s => {
                    const isSelected = service === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setService(s.key)}
                        className="flex-1 py-3 px-3.5 rounded-xl text-left transition-all duration-200"
                        style={{
                          border: `1.5px solid ${isSelected ? s.color : fieldError(service !== '') ? '#FCA5A5' : 'rgba(0,0,0,0.07)'}`,
                          backgroundColor: isSelected ? s.color + '06' : '#FAFBFC',
                          boxShadow: isSelected ? `0 2px 8px ${s.color}15` : 'none',
                          transform: isSelected ? 'scale(1)' : 'scale(1)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              border: `2px solid ${isSelected ? s.color : '#D1D5DB'}`,
                              backgroundColor: isSelected ? s.color : 'transparent',
                            }}
                          >
                            {isSelected && <Check size={11} style={{ color: '#FFFFFF' }} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400, color: isSelected ? s.color : '#6B7280' }}>
                            {s.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldError(service !== '') && (
                  <p style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626', marginTop: 6 }}>Please select a service</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                  Incident Title <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Google Ads account suspended due to policy violation"
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={{
                    fontSize: '14px', fontWeight: 400, color: '#0F172A',
                    border: `1.5px solid ${fieldError(title.trim().length >= 10) ? '#FCA5A5' : 'rgba(0,0,0,0.07)'}`,
                    backgroundColor: '#FAFBFC',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#204CC7', e.target.style.boxShadow = '0 0 0 3px rgba(32,76,199,0.08)', e.target.style.backgroundColor = '#FFFFFF')}
                  onBlur={(e) => (e.target.style.borderColor = fieldError(title.trim().length >= 10) ? '#FCA5A5' : 'rgba(0,0,0,0.07)', e.target.style.boxShadow = 'none', e.target.style.backgroundColor = '#FAFBFC')}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {fieldError(title.trim().length >= 10) ? (
                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626' }}>
                      {title.trim().length === 0 ? 'Title is required' : 'Minimum 10 characters'}
                    </p>
                  ) : <span />}
                  <p style={{ fontSize: '13px', fontWeight: 400, color: title.length > 100 ? '#F59E0B' : '#94A3B8' }}>{title.length}/120</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                  Description <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, when it started, and any error messages or symptoms you noticed…"
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 resize-none"
                  style={{
                    fontSize: '14px', fontWeight: 400, color: '#0F172A', lineHeight: 1.6,
                    border: `1.5px solid ${fieldError(description.trim().length >= 20) ? '#FCA5A5' : 'rgba(0,0,0,0.07)'}`,
                    backgroundColor: '#FAFBFC',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#204CC7', e.target.style.boxShadow = '0 0 0 3px rgba(32,76,199,0.08)', e.target.style.backgroundColor = '#FFFFFF')}
                  onBlur={(e) => (e.target.style.borderColor = fieldError(description.trim().length >= 20) ? '#FCA5A5' : 'rgba(0,0,0,0.07)', e.target.style.boxShadow = 'none', e.target.style.backgroundColor = '#FAFBFC')}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {fieldError(description.trim().length >= 20) ? (
                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626' }}>
                      {description.trim().length === 0 ? 'Description is required' : 'Minimum 20 characters'}
                    </p>
                  ) : <span />}
                  <p style={{ fontSize: '13px', fontWeight: 400, color: description.length > 450 ? '#F59E0B' : '#94A3B8' }}>{description.length}/500</p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', margin: '4px 0' }} />

              {/* ─── Attachments Section ─── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Attachments <span style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>(optional)</span>
                  </label>
                  <p style={{ fontSize: '13px', fontWeight: 400, color: attachments.length >= MAX_FILES ? '#F59E0B' : '#94A3B8' }}>
                    {attachments.length}/{MAX_FILES} files
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
                />

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => attachments.length < MAX_FILES && fileInputRef.current?.click()}
                  className="rounded-xl transition-all duration-200"
                  style={{
                    border: `1.5px dashed ${dragOver ? '#204CC7' : fileError ? '#FCA5A5' : 'rgba(0,0,0,0.12)'}`,
                    backgroundColor: dragOver ? 'rgba(32,76,199,0.04)' : '#FAFBFC',
                    padding: attachments.length === 0 ? '28px 16px' : '16px',
                    cursor: attachments.length < MAX_FILES ? 'pointer' : 'default',
                  }}
                >
                  {attachments.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center gap-2.5 text-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: dragOver ? 'rgba(32,76,199,0.1)' : '#F1F5F9' }}
                      >
                        <Upload size={18} style={{ color: dragOver ? '#204CC7' : '#94A3B8' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: dragOver ? '#204CC7' : '#374151' }}>
                          {dragOver ? 'Drop files here' : 'Drop files or click to upload'}
                        </p>
                        <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', marginTop: 3, lineHeight: 1.5 }}>
                          {ALLOWED_EXT_LABEL} — Max {MAX_FILES} files, 10 MB each
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Attachment list */
                    <div className="flex flex-col gap-2">
                      {attachments.map((att) => (
                        <motion.div
                          key={att.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg group"
                          style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Thumbnail / Icon */}
                          {att.previewUrl ? (
                            <div
                              className="w-10 h-10 rounded-lg flex-shrink-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${att.previewUrl})`,
                                border: '1px solid rgba(0,0,0,0.06)',
                              }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: '#F1F5F9' }}
                            >
                              {att.type.includes('pdf') ? (
                                <FileText size={16} style={{ color: '#DC2626' }} />
                              ) : (
                                <FileText size={16} style={{ color: '#64748B' }} />
                              )}
                            </div>
                          )}

                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
                              {att.name}
                            </p>
                            <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', marginTop: 1 }}>
                              {formatFileSize(att.size)}
                              {isImage(att.type) && ' · Image'}
                              {att.type.includes('pdf') && ' · PDF'}
                              {att.type.includes('csv') && ' · CSV'}
                              {att.type.includes('spreadsheet') && ' · Excel'}
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                            title="Remove file"
                          >
                            <X size={14} style={{ color: '#DC2626' }} />
                          </button>
                        </motion.div>
                      ))}

                      {/* Add more button */}
                      {attachments.length < MAX_FILES && (
                        <button
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          style={{ border: '1px dashed rgba(0,0,0,0.1)' }}
                        >
                          <Plus size={13} style={{ color: '#94A3B8' }} />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Add more files</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* File error */}
                {fileError && (
                  <p className="mt-1.5" style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626' }}>{fileError}</p>
                )}
              </div>

              {/* Info Note */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(32,76,199,0.03)', border: '1px solid rgba(32,76,199,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(32,76,199,0.08)' }}
                >
                  <AlertCircle size={14} style={{ color: '#204CC7' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748B', lineHeight: 1.6 }}>
                  Your incident will be assigned to the relevant service team immediately. You'll receive updates as the status changes.
                </p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#FAFBFC' }}
          >
            {/* Progress hint */}
            {attempted && !isValid && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#DC2626' }} />
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626' }}>Please fill in all required fields above</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-150"
                style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {attachments.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <Paperclip size={13} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>
                      {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all duration-200"
                  style={{
                    fontSize: '14px', fontWeight: 600,
                    backgroundColor: submitting ? '#93B4FF' : BRAND,
                    opacity: submitting ? 0.8 : 1,
                    boxShadow: submitting ? 'none' : '0 2px 10px rgba(32,76,199,0.30)',
                  }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full"
                        style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }}
                      />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} />
                      Raise Incident
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Incidents Module View ───────────────────────────────────────────
function IncidentsModuleView({ initialRaiseIncident, initialIncidentService, onRaiseIncidentConsumed, chatIncidents }: { initialRaiseIncident?: boolean; initialIncidentService?: 'Performance Marketing' | 'Accounts & Taxation' | ''; onRaiseIncidentConsumed?: () => void; chatIncidents?: Incident[] }) {
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS_DATA);
  // Merge chat-created incidents into local state when they arrive
  const mergedChatIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (chatIncidents && chatIncidents.length > 0) {
      const newOnes = chatIncidents.filter(ci => !mergedChatIdsRef.current.has(ci.id));
      if (newOnes.length > 0) {
        newOnes.forEach(ci => mergedChatIdsRef.current.add(ci.id));
        setIncidents(prev => [...newOnes, ...prev]);
      }
    }
  }, [chatIncidents]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [serviceFilter, setServiceFilter] = useState<'All' | 'Performance Marketing' | 'Accounts & Taxation'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRaiseDrawer, setShowRaiseDrawer] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Auto-open Raise Incident drawer when triggered from chat @incident
  // 200ms delay lets the toast register before the drawer slides in
  useEffect(() => {
    if (initialRaiseIncident) {
      const timer = setTimeout(() => {
        setShowRaiseDrawer(true);
      }, 200);
      onRaiseIncidentConsumed?.();
      return () => clearTimeout(timer);
    }
  }, [initialRaiseIncident]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    if (showFilters) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilters]);

  const openCount = incidents.filter(i => i.status === 'Open').length;
  const inProgressCount = incidents.filter(i => i.status === 'In Progress').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  const filtered = incidents
    .filter(i => statusFilter === 'All' || i.status === statusFilter)
    .filter(i => serviceFilter === 'All' || i.service === serviceFilter)
    .filter(i => !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.sortDate - a.sortDate);

  const activeFilterCount = (statusFilter !== 'All' ? 1 : 0) + (serviceFilter !== 'All' ? 1 : 0);

  const clearAllFilters = () => {
    setStatusFilter('All');
    setServiceFilter('All');
    setSearchQuery('');
  };

  const handleNewIncident = (inc: Incident) => {
    setIncidents(prev => [inc, ...prev]);
    setShowRaiseDrawer(false);
    setStatusFilter('All');
    setServiceFilter('All');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open', count: openCount, color: '#DC2626', lightBg: 'rgba(220,38,38,0.05)', filter: 'Open' as const, icon: AlertCircle },
          { label: 'In Progress', count: inProgressCount, color: '#2563EB', lightBg: 'rgba(37,99,235,0.05)', filter: 'In Progress' as const, icon: Clock },
          { label: 'Resolved', count: resolvedCount, color: '#16A34A', lightBg: 'rgba(22,163,74,0.05)', filter: 'Resolved' as const, icon: Check },
        ].map((card, idx) => {
          const isActive = statusFilter === card.filter;
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => {
                setStatusFilter(isActive ? 'All' : card.filter);
                setShowFilters(false);
              }}
              className="rounded-2xl p-5 text-left transition-all duration-200 group"
              style={{
                backgroundColor: isActive ? card.lightBg : '#FFFFFF',
                border: `1.5px solid ${isActive ? card.color + '20' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isActive ? `0 4px 16px ${card.color}12` : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '13px', fontWeight: 500, color: isActive ? card.color : '#6B7280' }}>{card.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: isActive ? card.color + '15' : '#F3F4F6' }}
                >
                  <Icon size={16} style={{ color: isActive ? card.color : '#9CA3AF' }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: card.color, lineHeight: 1 }}>{card.count}</p>
              <p className="mt-2" style={{ fontSize: '13px', fontWeight: 400, color: '#9CA3AF' }}>
                {isActive ? 'Showing filtered' : 'Click to filter'}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
              Incidents
              <span className="ml-2" style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>({filtered.length})</span>
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}
              >
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incidents…"
                className="pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border-0 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                style={{ fontSize: '13px', fontWeight: 400, color: '#0F172A', width: 200 }}
              />
            </div>
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
                style={{
                  fontSize: '13px', fontWeight: 500,
                  color: activeFilterCount > 0 ? BRAND : '#6B7280',
                  backgroundColor: activeFilterCount > 0 ? BRAND + '08' : '#F9FAFB',
                  border: `1px solid ${activeFilterCount > 0 ? BRAND + '20' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-white"
                    style={{ fontSize: '10px', fontWeight: 700, backgroundColor: BRAND, width: 18, height: 18 }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-white rounded-xl overflow-hidden z-50"
                    style={{
                      width: 260,
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Status Filter */}
                    <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Status</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="px-2.5 py-1 rounded-md transition-all duration-150"
                            style={{
                              fontSize: '13px', fontWeight: statusFilter === s ? 600 : 400,
                              color: statusFilter === s ? '#FFFFFF' : '#6B7280',
                              backgroundColor: statusFilter === s ? BRAND : '#F3F4F6',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Service Filter */}
                    <div className="px-4 pt-3 pb-4">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Service</p>
                      <div className="flex flex-col gap-1.5">
                        {([
                          { key: 'All', label: 'All Services' },
                          { key: 'Performance Marketing', label: 'Performance Marketing' },
                          { key: 'Accounts & Taxation', label: 'Accounts & Taxation' },
                        ] as const).map(s => (
                          <button
                            key={s.key}
                            onClick={() => setServiceFilter(s.key)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all duration-150"
                            style={{
                              fontSize: '13px', fontWeight: serviceFilter === s.key ? 500 : 400,
                              color: serviceFilter === s.key ? BRAND : '#6B7280',
                              backgroundColor: serviceFilter === s.key ? BRAND + '08' : 'transparent',
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                              style={{
                                border: `1.5px solid ${serviceFilter === s.key ? BRAND : '#D1D5DB'}`,
                                backgroundColor: serviceFilter === s.key ? BRAND : 'transparent',
                              }}
                            >
                              {serviceFilter === s.key && <Check size={10} style={{ color: '#FFFFFF' }} />}
                            </div>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Export Button */}
            <button
              onClick={() => exportIncidentsReport(filtered)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 hover:bg-gray-100"
              style={{
                fontSize: '13px', fontWeight: 500, color: '#6B7280',
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
              title="Export as PDF"
            >
              <Download size={14} />
              Export
            </button>
            {/* Raise Incident Button */}
            <button
              onClick={() => setShowRaiseDrawer(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white transition-all duration-150"
              style={{
                fontSize: '13px', fontWeight: 600,
                backgroundColor: BRAND,
                boxShadow: '0 2px 6px rgba(32,76,199,0.2)',
              }}
            >
              <Plus size={14} />
              Raise Incident
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div
          className="grid px-5 py-2.5"
          style={{
            gridTemplateColumns: '160px 1fr 180px 120px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            backgroundColor: '#FAFBFC',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Date & Time</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Incident</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Service</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', textAlign: 'right' }}>Status</p>
        </div>

        {/* Table Rows */}
        <div>
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <AlertTriangle size={24} style={{ color: '#D1D5DB', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#9CA3AF' }}>No incidents match your filters</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 hover:underline"
                style={{ fontSize: '13px', fontWeight: 500, color: BRAND }}
              >
                Clear all filters
              </button>
            </div>
          )}
          {filtered.map((incident, idx) => {
            const isExpanded = expandedId === incident.id;
            const dateParts = incident.dateTime.split(', ');
            const dateStr = dateParts[0] || '';
            const timeStr = dateParts[1] || '';
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.025 }}
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  className="w-full grid items-center px-5 py-3.5 text-left transition-colors duration-150 hover:bg-gray-50/70 group"
                  style={{
                    gridTemplateColumns: '160px 1fr 180px 120px',
                    borderBottom: isExpanded ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: isExpanded ? '#FAFBFC' : 'transparent',
                  }}
                >
                  {/* Date & Time */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{dateStr}</p>
                    <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>
                      <Clock size={11} /> {timeStr}
                    </p>
                  </div>

                  {/* Incident */}
                  <div className="pr-4 flex items-start gap-2.5">
                    <ChevronRight
                      size={14}
                      className="mt-0.5 flex-shrink-0 transition-transform duration-200"
                      style={{ color: '#94A3B8', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                    <div className="min-w-0">
                      <p
                        className="truncate"
                        style={{
                          fontSize: '14px', fontWeight: 500,
                          color: incident.status === 'Resolved' ? '#94A3B8' : '#0F172A',
                          textDecoration: incident.status === 'Resolved' ? 'line-through' : 'none',
                          textDecorationColor: '#D1D5DB',
                        }}
                      >
                        {incident.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="truncate" style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>
                          Raised by {incident.raisedBy}
                        </p>
                        {incident.raisedFromChat && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: '#FFFBEB', border: '1px solid rgba(245,158,11,0.08)', fontSize: '13px', fontWeight: 500, color: '#D97706' }}
                          >
                            <Zap size={9} />
                            Chat
                          </span>
                        )}
                        {incident.raisedFromOnboarding && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: '#EEF1FB', border: '1px solid rgba(32,76,199,0.08)', fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', color: '#204CC7' }}
                          >
                            <Rocket size={9} />
                            Onboarding
                          </span>
                        )}
                        {incident.attachments && incident.attachments.length > 0 && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: '#F1F5F9', fontSize: '13px', fontWeight: 500, color: '#64748B' }}
                          >
                            <Paperclip size={10} />
                            {incident.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <ServiceBadge service={incident.service} />
                  </div>

                  {/* Status */}
                  <div className="flex justify-end">
                    <IncidentStatusBadge status={incident.status} />
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-5 mb-4 p-4 rounded-xl"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)' }}
                      >
                        <div>
                          {/* Description */}
                          <div>
                            <p className="mb-1.5" style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Description</p>
                            <p style={{ fontSize: '14px', fontWeight: 400, color: '#374151', lineHeight: 1.6 }}>
                              {incident.description}
                            </p>
                          </div>
                        </div>
                        {incident.actionTaken && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <p className="mb-1.5" style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>Action Taken</p>
                            <p style={{ fontSize: '14px', fontWeight: 400, color: '#374151', lineHeight: 1.6 }}>
                              {incident.actionTaken}
                            </p>
                          </div>
                        )}
                        {incident.attachments && incident.attachments.length > 0 && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <p className="mb-2 flex items-center gap-1.5" style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                              <Paperclip size={12} />
                              Attachments ({incident.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {incident.attachments.map(att => (
                                <div
                                  key={att.id}
                                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                                  style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                                >
                                  {att.previewUrl ? (
                                    <div
                                      className="w-8 h-8 rounded flex-shrink-0 bg-cover bg-center"
                                      style={{ backgroundImage: `url(${att.previewUrl})`, border: '1px solid rgba(0,0,0,0.06)' }}
                                    />
                                  ) : (
                                    <div
                                      className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center"
                                      style={{ backgroundColor: '#F1F5F9' }}
                                    >
                                      <FileText size={14} style={{ color: att.type.includes('pdf') ? '#DC2626' : '#64748B' }} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', maxWidth: 140 }}>{att.name}</p>
                                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8' }}>{formatFileSize(att.size)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Raise Incident Drawer */}
      {showRaiseDrawer && (
        <RaiseIncidentDrawer
          onClose={() => setShowRaiseDrawer(false)}
          onSubmit={handleNewIncident}
          defaultService={initialIncidentService}
        />
      )}
    </div>
  );
}

// AddTodoModal moved to ./AddTodoModal.tsx


// ─── Helper Function to Check if Date is This Week ──────────────────
function isDateThisWeek(dateStr: string): boolean {
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const match = dateStr.match(/(\d{1,2})\s+(\w+)/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const monthIdx = SHORT_MONTHS.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
  if (monthIdx === -1) return false;
  const now = new Date();
  let year = now.getFullYear();
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
