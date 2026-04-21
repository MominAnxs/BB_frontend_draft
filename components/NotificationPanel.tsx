'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, MoreHorizontal, X, CheckCircle2, Target, MessageSquare, FolderOpen, AlertTriangle, Rocket, Bell, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type NotificationType = 'chat' | 'task' | 'metric_achieved' | 'metric_alert' | 'dataroom' | 'onboarding';

type ServiceType = 'marketing' | 'finance';

interface Notification {
  id: string;
  type: NotificationType;
  action: string;
  context: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  avatar?: 'brego' | 'team';
  priority?: 'high' | 'medium' | 'low';
  accountId?: string;
  accountName?: string;
}

interface NotificationBellProps {
  service?: ServiceType;
  activeAccountId?: string;
  activeAccountName?: string;
  accounts?: { id: string; name: string; service: string }[];
  onUnreadCountsChange?: (counts: Record<string, number>) => void;
}

const MARKETING_NOTIFICATIONS: Notification[] = [
  // Today
  {
    id: '1',
    type: 'metric_achieved',
    action: 'Target Achieved',
    context: 'Dashboard',
    description: 'ROAS target of 3.5x has been achieved this month. Current ROAS stands at 3.72x — a 6.3% overperformance.',
    timestamp: 'Today, 10:42 AM',
    isRead: false,
    avatar: 'brego',
    priority: 'high',
  },
  {
    id: '2',
    type: 'chat',
    action: 'New message',
    context: 'Chat',
    description: 'Ravi from Brego shared the updated Meta Ads strategy deck and is requesting your review before the next campaign launch.',
    timestamp: 'Today, 9:15 AM',
    isRead: false,
    avatar: 'team',
    priority: 'high',
  },
  {
    id: '3',
    type: 'metric_alert',
    action: 'Needs Attention',
    context: 'Dashboard',
    description: 'Cost Per Lead has increased 23% week-over-week on Google Ads. Current CPL is Rs.342 vs target Rs.280. Review recommended.',
    timestamp: 'Today, 8:30 AM',
    isRead: false,
    avatar: 'brego',
    priority: 'high',
  },
  {
    id: '4',
    type: 'task',
    action: 'Task completed',
    context: 'Workspace',
    description: 'Creative refresh for Q1 carousel ads has been completed. 6 new creatives are ready for your approval.',
    timestamp: 'Today, 7:50 AM',
    isRead: false,
    avatar: 'team',
  },
  // Last 7 Days
  {
    id: '5',
    type: 'dataroom',
    action: 'Folder updated',
    context: 'Dataroom',
    description: 'Feb 2026 Performance Report has been uploaded to the "Monthly Reports" folder. Download and review at your convenience.',
    timestamp: 'Feb 15',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: '6',
    type: 'chat',
    action: 'Replied',
    context: 'Chat',
    description: 'Your account manager responded to your query about audience segmentation for the upcoming LinkedIn campaign.',
    timestamp: 'Feb 14',
    isRead: true,
    avatar: 'team',
  },
  {
    id: '7',
    type: 'metric_achieved',
    action: 'Weekly milestone',
    context: 'Dashboard',
    description: 'Lead volume crossed 500 leads this week — 12% above the weekly target. Top performing channel: Meta Ads.',
    timestamp: 'Feb 14',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: '8',
    type: 'task',
    action: 'New task assigned',
    context: 'Workspace',
    description: 'Review and approve the updated landing page copy for the lead gen campaign. Due by Feb 18.',
    timestamp: 'Feb 13',
    isRead: true,
    avatar: 'team',
  },
  {
    id: '9',
    type: 'metric_alert',
    action: 'Budget alert',
    context: 'Dashboard',
    description: 'Meta Ads monthly budget is 78% spent with 14 days remaining. At current pace, budget will exhaust 5 days early.',
    timestamp: 'Feb 12',
    isRead: true,
    avatar: 'brego',
    priority: 'medium',
  },
  {
    id: '10',
    type: 'dataroom',
    action: 'New file added',
    context: 'Dataroom',
    description: 'Google Ads audit report (Jan 2026) has been uploaded by the Brego team to "Audit Reports" folder.',
    timestamp: 'Feb 11',
    isRead: true,
    avatar: 'brego',
  },
  // Older
  {
    id: '11',
    type: 'onboarding',
    action: 'Setup reminder',
    context: 'Onboarding',
    description: 'You haven\'t connected your Google Analytics 4 account yet. Connect it to unlock website funnel insights on your dashboard.',
    timestamp: 'Feb 8',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: '12',
    type: 'chat',
    action: 'Mentioned you',
    context: 'Chat',
    description: 'Priya from Brego mentioned you in a conversation about the monthly retainer review and next steps.',
    timestamp: 'Feb 7',
    isRead: true,
    avatar: 'team',
  },
  {
    id: '13',
    type: 'onboarding',
    action: 'Action needed',
    context: 'Onboarding',
    description: 'Complete your Finance module setup to get a comprehensive P&L view. Only 2 steps remaining.',
    timestamp: 'Feb 5',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: '14',
    type: 'metric_achieved',
    action: 'Monthly goal met',
    context: 'Dashboard',
    description: 'January ad spend efficiency improved by 18%. Cost per acquisition decreased from Rs.890 to Rs.730.',
    timestamp: 'Feb 3',
    isRead: true,
    avatar: 'brego',
  },
];

const FINANCE_NOTIFICATIONS: Notification[] = [
  // Today
  {
    id: 'f1',
    type: 'metric_alert',
    action: 'Compliance Deadline',
    context: 'Dashboard',
    description: 'GSTR-3B filing for January 2026 is due in 3 days (Feb 20). Ensure all input tax credits are reconciled before filing.',
    timestamp: 'Today, 10:42 AM',
    isRead: false,
    avatar: 'brego',
    priority: 'high',
  },
  {
    id: 'f2',
    type: 'chat',
    action: 'New message',
    context: 'Chat',
    description: 'Neha from Brego Accounts shared the reconciled bank statement for Jan 2026 and flagged 3 unmatched transactions for your review.',
    timestamp: 'Today, 9:30 AM',
    isRead: false,
    avatar: 'team',
    priority: 'high',
  },
  {
    id: 'f3',
    type: 'metric_achieved',
    action: 'Collections Update',
    context: 'Dashboard',
    description: 'Receivables collection rate improved to 87% this month. Rs.4.2L collected against Rs.4.8L outstanding — 3 invoices still overdue.',
    timestamp: 'Today, 8:45 AM',
    isRead: false,
    avatar: 'brego',
    priority: 'high',
  },
  {
    id: 'f4',
    type: 'task',
    action: 'Task assigned',
    context: 'Workspace',
    description: 'Review and approve 5 vendor invoices totalling Rs.1.8L. Payment due date: Feb 22. Approval needed to process on time.',
    timestamp: 'Today, 7:50 AM',
    isRead: false,
    avatar: 'team',
  },
  // Last 7 Days
  {
    id: 'f5',
    type: 'dataroom',
    action: 'Report uploaded',
    context: 'Dataroom',
    description: 'January 2026 Profit & Loss statement has been uploaded to the "Financial Statements" folder. Net margin stands at 14.2%.',
    timestamp: 'Feb 15',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: 'f6',
    type: 'metric_alert',
    action: 'Cash Flow Warning',
    context: 'Dashboard',
    description: 'Projected cash balance will drop below Rs.2L by month-end if Rs.3.5L in pending payables are cleared. Review payment scheduling.',
    timestamp: 'Feb 14',
    isRead: true,
    avatar: 'brego',
    priority: 'medium',
  },
  {
    id: 'f7',
    type: 'chat',
    action: 'Replied',
    context: 'Chat',
    description: 'Your CA responded to the query about TDS applicability on the new vendor contract. Recommendation: deduct at 2% under Section 194C.',
    timestamp: 'Feb 14',
    isRead: true,
    avatar: 'team',
  },
  {
    id: 'f8',
    type: 'task',
    action: 'Task completed',
    context: 'Workspace',
    description: 'TDS return filing for Q3 (Oct-Dec 2025) has been completed and submitted. Form 26Q acknowledgment uploaded to Dataroom.',
    timestamp: 'Feb 13',
    isRead: true,
    avatar: 'team',
  },
  {
    id: 'f9',
    type: 'metric_achieved',
    action: 'Expense Insight',
    context: 'Dashboard',
    description: 'Operating expenses decreased by 8% month-over-month. Largest savings from renegotiated logistics contract — Rs.45K monthly reduction.',
    timestamp: 'Feb 12',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: 'f10',
    type: 'dataroom',
    action: 'New file added',
    context: 'Dataroom',
    description: 'Bank reconciliation statement for HDFC Current Account (Jan 2026) has been uploaded. 2 entries pending clearance.',
    timestamp: 'Feb 11',
    isRead: true,
    avatar: 'brego',
  },
  // Older
  {
    id: 'f11',
    type: 'onboarding',
    action: 'Setup reminder',
    context: 'Onboarding',
    description: 'Connect your Tally/Zoho Books account to auto-sync your ledger data. This will unlock real-time P&L and balance sheet tracking.',
    timestamp: 'Feb 8',
    isRead: true,
    avatar: 'brego',
  },
  {
    id: 'f12',
    type: 'metric_alert',
    action: 'Receivables Alert',
    context: 'Dashboard',
    description: '2 invoices worth Rs.1.6L are overdue by 30+ days. Clients: Mehta Enterprises (Rs.95K) and Sunrise Retail (Rs.65K). Follow-up recommended.',
    timestamp: 'Feb 7',
    isRead: true,
    avatar: 'brego',
    priority: 'medium',
  },
  {
    id: 'f13',
    type: 'chat',
    action: 'Mentioned you',
    context: 'Chat',
    description: 'Amit from Brego mentioned you regarding the advance tax payment calculation for Q4. Review the estimated liability before Mar 15 deadline.',
    timestamp: 'Feb 5',
    isRead: true,
    avatar: 'team',
  },
  {
    id: 'f14',
    type: 'metric_achieved',
    action: 'Monthly Summary',
    context: 'Dashboard',
    description: 'January books closed successfully. Revenue: Rs.18.4L | Expenses: Rs.15.8L | Net Profit: Rs.2.6L. Current ratio healthy at 1.8x.',
    timestamp: 'Feb 3',
    isRead: true,
    avatar: 'brego',
  },
];

// One icon per notification type. The icon — not a colored avatar, not a pill,
// not a name line — is the only type signal each row carries. Colors are
// soft-bg + mid-weight icon so no single row dominates visually.
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'chat':
      return <MessageSquare className="w-4 h-4" />;
    case 'task':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'metric_achieved':
      return <Target className="w-4 h-4" />;
    case 'metric_alert':
      return <AlertTriangle className="w-4 h-4" />;
    case 'dataroom':
      return <FolderOpen className="w-4 h-4" />;
    case 'onboarding':
      return <Rocket className="w-4 h-4" />;
  }
}

function getIconTone(type: NotificationType) {
  switch (type) {
    case 'chat':
      return 'bg-brand-light text-brand';
    case 'task':
      return 'bg-emerald-50 text-emerald-600';
    case 'metric_achieved':
      return 'bg-green-50 text-green-600';
    case 'metric_alert':
      return 'bg-amber-50 text-amber-600';
    case 'dataroom':
      return 'bg-violet-50 text-violet-600';
    case 'onboarding':
      return 'bg-slate-50 text-slate-500';
  }
}

export function NotificationBell({ service, activeAccountId, activeAccountName, accounts, onUnreadCountsChange }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'active' | 'all'>('active');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Tag notifications with the active account info
    const base = service === 'finance' ? FINANCE_NOTIFICATIONS : MARKETING_NOTIFICATIONS;
    return base.map(n => ({
      ...n,
      accountId: activeAccountId || 'primary',
      accountName: activeAccountName || 'Primary Business',
    }));
  });
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });

  // Update notifications when account changes
  useEffect(() => {
    const base = service === 'finance' ? FINANCE_NOTIFICATIONS : MARKETING_NOTIFICATIONS;
    setNotifications(prev => {
      // Keep existing notifications from other accounts, add/update current account's
      const otherAcctNotifs = prev.filter(n => n.accountId && n.accountId !== (activeAccountId || 'primary'));
      const currentAcctNotifs = base.map(n => ({
        ...n,
        accountId: activeAccountId || 'primary',
        accountName: activeAccountName || 'Primary Business',
      }));
      return [...currentAcctNotifs, ...otherAcctNotifs];
    });
    // Reset to active-account view on switch & close panel
    setFilterMode('active');
    setIsOpen(false);
  }, [activeAccountId, activeAccountName, service]);

  const filteredNotifications = filterMode === 'active' && activeAccountId
    ? notifications.filter(n => n.accountId === activeAccountId)
    : notifications;

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
  const totalUnread = notifications.filter(n => !n.isRead).length;

  // Broadcast per-account unread counts to parent
  useEffect(() => {
    if (!onUnreadCountsChange) return;
    const counts: Record<string, number> = {};
    for (const n of notifications) {
      if (!n.isRead && n.accountId) {
        counts[n.accountId] = (counts[n.accountId] || 0) + 1;
      }
    }
    onUnreadCountsChange(counts);
  }, [notifications, onUnreadCountsChange]);

  // Calculate panel position based on bell button location
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPanelPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => {
      if (filterMode === 'active' && activeAccountId && n.accountId !== activeAccountId) return n;
      return { ...n, isRead: true };
    }));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const displayedNotifications = activeTab === 'unread'
    ? filteredNotifications.filter(n => !n.isRead)
    : filteredNotifications;

  // Group notifications
  const today = displayedNotifications.filter(n => n.timestamp.startsWith('Today'));
  const lastWeek = displayedNotifications.filter(n => {
    const ts = n.timestamp;
    return !ts.startsWith('Today') && (ts.includes('Feb 15') || ts.includes('Feb 14') || ts.includes('Feb 13') || ts.includes('Feb 12') || ts.includes('Feb 11') || ts.includes('Feb 10'));
  });
  const older = displayedNotifications.filter(n => {
    const ts = n.timestamp;
    return !ts.startsWith('Today') && !ts.includes('Feb 15') && !ts.includes('Feb 14') && !ts.includes('Feb 13') && !ts.includes('Feb 12') && !ts.includes('Feb 11') && !ts.includes('Feb 10');
  });

  const hasMultipleAccounts = accounts && accounts.length > 1;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-semibold px-1">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Notification Panel — rendered via portal to escape overflow clipping */}
      {isOpen && createPortal(
        <>
          {/* Full-screen backdrop */}
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />

          <div
            ref={panelRef}
            className="fixed w-[420px] bg-white rounded-2xl border border-gray-200/80 overflow-hidden"
            style={{
              zIndex: 9999,
              top: panelPosition.top,
              right: panelPosition.right,
              maxHeight: 'calc(100vh - 100px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900" style={{ fontSize: '16px' }}>Notifications</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close notifications"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Account Filter — only show when multiple accounts exist */}
              {hasMultipleAccounts && (
                <div className="flex items-center gap-1.5 mb-3 p-1 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => setFilterMode('active')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      filterMode === 'active'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{activeAccountName || 'Active'}</span>
                    {unreadCount > 0 && filterMode === 'active' && (
                      <span className="text-[10px] bg-red-500 text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      filterMode === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All Businesses
                    {totalUnread > 0 && filterMode === 'all' && (
                      <span className="text-[10px] bg-red-500 text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      activeTab === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                      activeTab === 'unread'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === 'unread'
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-light text-brand'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand hover:text-brand-hover font-medium hover:underline transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {displayedNotifications.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <>
                  {/* Today */}
                  {today.length > 0 && (
                    <NotificationGroup
                      label="Today"
                      notifications={today}
                      onMarkRead={markAsRead}
                      onDismiss={dismissNotification}
                      showAccountBadge={filterMode === 'all' && hasMultipleAccounts}
                    />
                  )}

                  {/* Last 7 Days */}
                  {lastWeek.length > 0 && (
                    <NotificationGroup
                      label="Last 7 Days"
                      notifications={lastWeek}
                      onMarkRead={markAsRead}
                      onDismiss={dismissNotification}
                      showAccountBadge={filterMode === 'all' && hasMultipleAccounts}
                    />
                  )}

                  {/* Older */}
                  {older.length > 0 && (
                    <NotificationGroup
                      label="Older"
                      notifications={older}
                      onMarkRead={markAsRead}
                      onDismiss={dismissNotification}
                      showAccountBadge={filterMode === 'all' && hasMultipleAccounts}
                    />
                  )}
                </>
              )}
            </div>

          </div>
        </>,
        document.body
      )}
    </>
  );
}

function NotificationGroup({ label, notifications, onMarkRead, onDismiss, showAccountBadge }: {
  label: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  showAccountBadge?: boolean;
}) {
  return (
    <div>
      <div className="px-5 py-2 bg-gray-50/80">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onDismiss={onDismiss}
            showAccountBadge={showAccountBadge}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ notification, onMarkRead, onDismiss, showAccountBadge }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  showAccountBadge?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Strip the "Today, " prefix for display — the Today group header already
  // frames the time. "10:42 AM" reads cleaner than "Today, 10:42 AM" inside
  // a section literally titled "Today".
  const displayTime = notification.timestamp.replace('Today, ', '');

  return (
    <div
      className="group px-5 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-100/80 last:border-b-0"
      onClick={() => onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon tile — the single type signal. Unread dot lives on the tile
            so we don't need a full-row tint. */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getIconTone(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>
          {!notification.isRead && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className={`text-sm leading-snug ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
              {notification.action}
            </p>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap">{displayTime}</span>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Notification options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -2 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Mark as read
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notification.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 leading-[1.5]">
            {notification.description}
          </p>

          {/* Account badge — only in multi-account "All" mode. Tucked under
              the description so it doesn't compete with the action title. */}
          {showAccountBadge && notification.accountName && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                <Building2 className="w-2.5 h-2.5" />
                {notification.accountName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
