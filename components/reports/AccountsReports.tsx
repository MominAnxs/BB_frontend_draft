'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Waves, 
  PieChart, 
  Scale,
  X,
  MessageSquare,
  BarChart3,
  Briefcase,
  Database,
  Activity
} from 'lucide-react';
import { OverviewModule } from './accounts/OverviewModule';
import { SalesModule } from './accounts/SalesModule';
import { ReceivablesModule } from './accounts/ReceivablesModule';
import { ExpensesModule } from './accounts/ExpensesModule';
import { PayablesModule } from './accounts/PayablesModule';
import { CashflowModule } from './accounts/CashflowModule';
import { ProfitLossModule } from './accounts/ProfitLossModule';
import { BalanceSheetModule } from './accounts/BalanceSheetModule';
import { RatiosModule } from './accounts/RatiosModule';
import { Dataroom } from '../dataroom/Dataroom';
import { Workspace } from '../workspace/Workspace';
import { UserInfo } from '../../types';
import { BregoLogo } from '../BregoLogo';
import { ProfileDropdown } from '../ProfileDropdown';
import { ServiceSwitcher } from './ServiceSwitcher';
import { NotificationBell } from '../NotificationPanel';
import { UpgradeFlow } from '../upgrade/UpgradeFlow';
import { SidebarStatusCard, OnboardingProgress } from '../upgrade/SidebarStatusCard';
import { BregoGPTDrawer } from './BregoGPTDrawer';
import { BusinessAccountCard, BusinessAccount } from '../business/BusinessAccountCard';
import { NavTabs } from '../NavTabs';

interface AccountsReportsProps {
  onClose: () => void;
  diagnosticData: any;
  onServiceSwitch?: (service: 'marketing' | 'finance') => void;
  hasBothServices?: boolean;
  currentService?: 'marketing' | 'finance';
  onboardingProgress?: OnboardingProgress;
  onOnboardingProgressChange?: (progress: OnboardingProgress) => void;
  onAddBusiness?: () => void;
  /** Called when the sidebar cross-sell CTA ("Explore Marketing") is clicked.
   *  Receives the target service so the parent can preselect it in the
   *  Add Business / Plan flow. Falls back to onAddBusiness if not provided. */
  onActivateCrossSell?: (service: 'marketing' | 'finance') => void;
  businessAccounts?: BusinessAccount[];
  activeAccountId?: string;
  onSwitchAccount?: (account: BusinessAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  notificationCounts?: Record<string, number>;
  onProfileSettings?: () => void;
  onInviteTeam?: () => void;
  initialModule?: AccountsModule | null;
  userInfo?: UserInfo;
  /** When true, show "Setting Up" progress card instead of "Upgrade Now" */
  showSettingUp?: boolean;
  /** Called when user clicks "Upgrade Now" — delegates to parent */
  onUpgradeFlowTrigger?: () => void;
  /** Called when user clicks "Continue" on Setting Up card — delegates to parent */
  onContinueSetup?: () => void;
  /** Receives the URL slug (e.g. "sales", "profit-loss") when the user picks a
   *  new left-nav module. Pages hosting this component should router.push() to
   *  the corresponding dashboard segment so deep links and the back button work.
   *  When absent (e.g. rendered inside ChatInterface without a route), the
   *  component falls back to internal activeModule state. */
  onModuleChange?: (slug: AccountsModuleSlug) => void;
}

type AccountsModule = 'overview' | 'sales' | 'receivables' | 'expenses' | 'payables' | 'cashflow' | 'profitloss' | 'balancesheet' | 'ratios';

// URL slugs for each accounts module. Two of them (profitloss, balancesheet)
// have kebab-cased URL variants to match the marketing convention and read
// cleanly in the address bar. Everything else is identical to the module id.
export type AccountsModuleSlug =
  | 'overview'
  | 'sales'
  | 'receivables'
  | 'expenses'
  | 'payables'
  | 'cashflow'
  | 'profit-loss'
  | 'balance-sheet'
  | 'ratios';

export const ACCOUNTS_MODULE_TO_SLUG: Record<AccountsModule, AccountsModuleSlug> = {
  overview: 'overview',
  sales: 'sales',
  receivables: 'receivables',
  expenses: 'expenses',
  payables: 'payables',
  cashflow: 'cashflow',
  profitloss: 'profit-loss',
  balancesheet: 'balance-sheet',
  ratios: 'ratios',
};

export const ACCOUNTS_SLUG_TO_MODULE: Record<AccountsModuleSlug, AccountsModule> = {
  overview: 'overview',
  sales: 'sales',
  receivables: 'receivables',
  expenses: 'expenses',
  payables: 'payables',
  cashflow: 'cashflow',
  'profit-loss': 'profitloss',
  'balance-sheet': 'balancesheet',
  ratios: 'ratios',
};

export function AccountsReports({ onClose, diagnosticData, onServiceSwitch, hasBothServices = false, currentService = 'finance', onboardingProgress: externalProgress, onOnboardingProgressChange, onAddBusiness, onActivateCrossSell, businessAccounts, activeAccountId, onSwitchAccount, onDeleteAccount, notificationCounts, onProfileSettings, onInviteTeam, initialModule, userInfo, showSettingUp, onUpgradeFlowTrigger, onContinueSetup, onModuleChange }: AccountsReportsProps) {
  const [activeModule, setActiveModule] = useState<AccountsModule>(initialModule || 'overview');

  // Keep the module in sync if the parent reroutes between module pages —
  // without this, clicking a sidebar link would navigate but the local
  // state would stay stuck on the previous module on subsequent visits.
  // Guarded by equality so we don't re-render the tree on every render.
  if (initialModule && initialModule !== activeModule) {
    setActiveModule(initialModule);
  }

  // Unified click handler for the left-nav. Always updates local state so
  // surfaces without routing (e.g. ChatInterface's modal-style dashboard)
  // still work, and calls onModuleChange so the hosting page can push the
  // new URL. Passing the slug (not the module id) keeps the URL concern
  // where it belongs — inside this component.
  const handleModuleSelect = (module: AccountsModule) => {
    setActiveModule(module);
    if (onModuleChange) onModuleChange(ACCOUNTS_MODULE_TO_SLUG[module]);
  };
  const [showDataroom, setShowDataroom] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [showBregoGPT, setShowBregoGPT] = useState(false);
  
  // Mock userInfo for Dataroom component (extract from diagnosticData if available)
  const defaultUserInfo: UserInfo = {
    firstName: diagnosticData?.firstName || 'User',
    lastName: diagnosticData?.lastName || '',
    country: '',
    city: '',
    phoneNumber: '',
    businessType: '',
    companyName: diagnosticData?.companyName || 'Company',
    selectedService: 'Accounts & Taxation',
    selectedSector: ''
  };
  
  // Use external progress if provided, otherwise local fallback
  const [localProgress, setLocalProgress] = useState<OnboardingProgress>({
    isUpgraded: false, selectedPlan: '', completedSteps: [], currentStep: 'connect',
  });
  
  const progress = externalProgress || localProgress;
  const updateProgress = (updater: (prev: OnboardingProgress) => OnboardingProgress) => {
    if (onOnboardingProgressChange) {
      onOnboardingProgressChange(updater(progress));
    } else {
      setLocalProgress(updater);
    }
  };

  // If showing Dataroom, render it
  if (showDataroom) {
    return (
      <Dataroom
        userInfo={userInfo || defaultUserInfo}
        onBack={() => setShowDataroom(false)}
        onNavigateToChat={onClose}
        onNavigateToWorkspace={() => {
          setShowDataroom(false);
          setShowWorkspace(true);
        }}
      />
    );
  }

  // If showing Workspace, render it
  if (showWorkspace) {
    return (
      <Workspace
        userInfo={userInfo || defaultUserInfo}
        onBack={() => setShowWorkspace(false)}
        onNavigateToChat={onClose}
        onNavigateToReports={() => setShowWorkspace(false)}
        onNavigateToDataroom={() => {
          setShowWorkspace(false);
          setShowDataroom(true);
        }}
      />
    );
  }

  const navItems = [
    { id: 'overview' as AccountsModule, label: 'Overview', icon: LayoutDashboard },
    { id: 'sales' as AccountsModule, label: 'Sales', icon: TrendingUp },
    { id: 'expenses' as AccountsModule, label: 'Expenses', icon: CreditCard },
    { id: 'receivables' as AccountsModule, label: 'Receivables (AR)', icon: FileText },
    { id: 'payables' as AccountsModule, label: 'Payables (AP)', icon: Briefcase },
    { id: 'profitloss' as AccountsModule, label: 'Profit & Loss', icon: PieChart },
    { id: 'balancesheet' as AccountsModule, label: 'Balance Sheet', icon: Scale },
    { id: 'cashflow' as AccountsModule, label: 'Cashflow', icon: Waves },
    { id: 'ratios' as AccountsModule, label: 'Ratios', icon: Activity },
  ];

  // Map accounts module to BregoGPT context
  const getBregoGPTContext = () => {
    const mapping: Record<AccountsModule, string> = {
      overview: 'accounts-overview',
      sales: 'accounts-sales',
      expenses: 'accounts-expenses',
      receivables: 'accounts-receivables',
      payables: 'accounts-payables',
      profitloss: 'accounts-profit-loss',
      balancesheet: 'accounts-balance-sheet',
      cashflow: 'accounts-cashflow',
      ratios: 'accounts-ratios',
    };
    return mapping[activeModule] as any;
  };

  const renderModule = () => {
    const onAskBregoGPT = () => setShowBregoGPT(true);
    switch (activeModule) {
      case 'overview':
        return <OverviewModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'sales':
        return <SalesModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'receivables':
        return <ReceivablesModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'expenses':
        return <ExpensesModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'payables':
        return <PayablesModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'cashflow':
        return <CashflowModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'profitloss':
        return <ProfitLossModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'balancesheet':
        return <BalanceSheetModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      case 'ratios':
        return <RatiosModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
      default:
        return <OverviewModule diagnosticData={diagnosticData} onAskBregoGPT={onAskBregoGPT} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Top Navigation — Full-width, matching Dataroom */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center"><BregoLogo size={36} variant="full" /></div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false, onClick: onClose },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: true },
            { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: false, onClick: () => setShowWorkspace(true) },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false, onClick: () => setShowDataroom(true) },
          ]} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell service="finance" />
          <ProfileDropdown userInfo={userInfo || defaultUserInfo} onProfileSettingsClick={onProfileSettings} onInviteTeamClick={onInviteTeam} onAddBusiness={onAddBusiness} businessTypeLabel={businessAccounts?.find(a => a.id === activeAccountId)?.businessTypeLabel} businessAccounts={businessAccounts} activeAccountId={activeAccountId} onSwitchAccount={onSwitchAccount} onDeleteAccount={onDeleteAccount} notificationCounts={notificationCounts} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
      {/* Side Navigation */}
      <div className="w-64 sidebar-glass flex flex-col">
        {/* Service Switcher - sits outside scroll area so dropdown isn't clipped */}
        {onServiceSwitch && (
          <div className="px-4 pt-4 pb-0 relative z-20">
            <div className="mb-4">
              <ServiceSwitcher
                currentService={currentService}
                onSwitch={onServiceSwitch}
                hasBothServices={hasBothServices}
                onActivateService={(service) => {
                  // Prefer the cross-sell-aware handler so the parent can
                  // preselect the target service in the Plan modal. Fall
                  // back to the generic Add Business handler otherwise.
                  if (onActivateCrossSell) onActivateCrossSell(service);
                  else if (onAddBusiness) onAddBusiness();
                }}
                onAddBusiness={onAddBusiness}
              />
            </div>
          </div>
        )}

        {/* Header - Aligned with Top Nav Height */}
        <div className="px-4 pb-3 border-b border-gray-200/40">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reports</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleModuleSelect(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-light text-brand shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/40">
          {/* Trial / Onboarding Status */}
          <SidebarStatusCard
            onboardingProgress={(showSettingUp || progress.isUpgraded) ? progress : { ...progress, isUpgraded: false }}
            onUpgradeClick={() => { if (onUpgradeFlowTrigger) onUpgradeFlowTrigger(); else setShowUpgradeFlow(true); }}
            onContinueOnboarding={() => { if (onContinueSetup) onContinueSetup(); else setShowUpgradeFlow(true); }}
            serviceType="finance"
          />


        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Module Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {renderModule()}
        </div>
      </div>
      </div>

      {/* Upgrade Flow Overlay */}
      {showUpgradeFlow && (
        <UpgradeFlow
          userInfo={userInfo || defaultUserInfo}
          onClose={() => setShowUpgradeFlow(false)}
          onComplete={() => {
            setShowUpgradeFlow(false);
            updateProgress(prev => ({
              ...prev,
              completedSteps: ['connect', 'basics', 'competitors', 'products'],
              currentStep: 'complete',
            }));
          }}
          onUpgradeConfirmed={(plan) => {
            updateProgress(prev => ({ ...prev, isUpgraded: true, selectedPlan: plan }));
          }}
          onStepComplete={(stepId) => {
            updateProgress(prev => ({
              ...prev,
              completedSteps: prev.completedSteps.includes(stepId) ? prev.completedSteps : [...prev.completedSteps, stepId],
            }));
          }}
          onStepChange={(stepId) => {
            updateProgress(prev => ({ ...prev, currentStep: stepId }));
          }}
          resumeOnboarding={progress.isUpgraded ? progress : undefined}
        />
      )}

      {/* BregoGPT Drawer */}
      <BregoGPTDrawer
        isOpen={showBregoGPT}
        onClose={() => setShowBregoGPT(false)}
        moduleContext={getBregoGPTContext()}
      />
    </div>
  );
}
