'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LayoutDashboard, ShoppingCart, Users as UsersIcon, Radio, Zap, Filter, TrendingUp, ArrowLeft, Calendar, Download, CheckCircle2, MessageSquare, BarChart3, Briefcase, Database, Sparkles, ChevronDown, Globe, Target, Plus, Lock } from 'lucide-react';
import { UserInfo } from '../../types';
import { BregoLogo } from '../BregoLogo';
import { ProfileDropdown } from '../ProfileDropdown';
import { ServiceSwitcher } from './ServiceSwitcher';
import { DateRangePicker } from '../DateRangePicker';
import { NotificationBell } from '../NotificationPanel';
import { SidebarStatusCard, OnboardingProgress } from '../upgrade/SidebarStatusCard';
import { BusinessAccountCard, BusinessAccount } from '../business/BusinessAccountCard';
import { NavTabs } from '../NavTabs';

// Dynamic imports — heavy modules loaded only when their tab is active
const OverviewModule = dynamic(() => import('./marketing/OverviewModule').then(m => ({ default: m.OverviewModule })), { ssr: false });
const WebsiteModule = dynamic(() => import('./marketing/WebsiteModule').then(m => ({ default: m.WebsiteModule })), { ssr: false });
const ChannelsModule = dynamic(() => import('./ChannelsModule').then(m => ({ default: m.ChannelsModule })), { ssr: false });
const CampaignsModule = dynamic(() => import('./CampaignsModule').then(m => ({ default: m.CampaignsModule })), { ssr: false });
const ExperimentsModule = dynamic(() => import('./ExperimentsModule').then(m => ({ default: m.ExperimentsModule })), { ssr: false });
const ShopifySalesModule = dynamic(() => import('./shopify/ShopifySalesModule').then(m => ({ default: m.ShopifySalesModule })), { ssr: false });
const Dataroom = dynamic(() => import('../dataroom/Dataroom').then(m => ({ default: m.Dataroom })), { ssr: false });
const Workspace = dynamic(() => import('../workspace/Workspace').then(m => ({ default: m.Workspace })), { ssr: false });
const UpgradeFlow = dynamic(() => import('../upgrade/UpgradeFlow').then(m => ({ default: m.UpgradeFlow })), { ssr: false });
const ServiceTeamOnboarding = dynamic(() => import('../upgrade/ServiceTeamOnboarding').then(m => ({ default: m.ServiceTeamOnboarding })), { ssr: false });
const AccountsTeamOnboarding = dynamic(() => import('../upgrade/AccountsTeamOnboarding').then(m => ({ default: m.AccountsTeamOnboarding })), { ssr: false });
const BregoGPTDrawer = dynamic(() => import('./BregoGPTDrawer').then(m => ({ default: m.BregoGPTDrawer })), { ssr: false });

interface PerformanceReportsProps {
  userInfo: UserInfo;
  businessModel: 'ecommerce' | 'leadgen';
  onBack: () => void;
  onServiceSwitch?: (service: 'marketing' | 'finance') => void;
  hasBothServices?: boolean;
  currentService?: 'marketing' | 'finance';
  onboardingProgress?: OnboardingProgress;
  onOnboardingProgressChange?: (progress: OnboardingProgress) => void;
  onAddBusiness?: () => void;
  /** Called when the sidebar cross-sell CTA ("Explore Finance") is clicked.
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
  initialModule?: ReportModule | null;
  /** When true, show "Setting Up" progress card instead of "Upgrade Now" */
  showSettingUp?: boolean;
  /** Called when user clicks "Upgrade Now" — delegates to parent */
  onUpgradeFlowTrigger?: () => void;
  /** Called when user clicks "Continue" on Setting Up card — delegates to parent */
  onContinueSetup?: () => void;
  /** Called when user switches modules via left nav — parent can update the URL */
  onModuleChange?: (module: ReportModule) => void;
}

type ReportModule = 'overview' | 'meta-ads' | 'google-ads' | 'sales' | 'campaigns' | 'website';

export function PerformanceReports({ userInfo, businessModel, onBack, onServiceSwitch, hasBothServices = false, currentService = 'marketing', onboardingProgress: externalProgress, onOnboardingProgressChange, onAddBusiness, onActivateCrossSell, businessAccounts, activeAccountId, onSwitchAccount, onDeleteAccount, notificationCounts, onProfileSettings, onInviteTeam, initialModule, showSettingUp, onUpgradeFlowTrigger, onContinueSetup, onModuleChange }: PerformanceReportsProps) {
  const [activeModule, setActiveModule] = useState<ReportModule>(initialModule || 'overview');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showDataroom, setShowDataroom] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google'>('meta');
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [upgradeResumeMode, setUpgradeResumeMode] = useState(false);
  const [showServiceTeamOnboarding, setShowServiceTeamOnboarding] = useState(false);
  const [showAccountsTeamOnboarding, setShowAccountsTeamOnboarding] = useState(false);
  const [showBregoGPT, setShowBregoGPT] = useState(false);
  const [showMetricsMenu, setShowMetricsMenu] = useState(false);
  const [additionalMetrics, setAdditionalMetrics] = useState<string[]>([]);
  
  // Use external progress if provided, otherwise local fallback
  const [localProgress, setLocalProgress] = useState<OnboardingProgress>({
    isUpgraded: false, selectedPlan: '', completedSteps: [], currentStep: 'connect',
  });
  
  // Close metrics dropdown on click outside
  const metricsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (metricsRef.current && !metricsRef.current.contains(e.target as Node)) {
        setShowMetricsMenu(false);
      }
    };
    if (showMetricsMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMetricsMenu]);

  // Default KPIs per module — these appear locked in the Add Metrics dropdown
  const defaultMetricsByModule: Record<string, string[]> = businessModel === 'ecommerce' ? {
    'overview': ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'AOV'],
    'meta-ads': ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'CAC'],
    'google-ads': ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'CAC'],
    'sales': ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'AOV'],
    'website': ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'AOV'],
  } : {
    'overview': ['Ad Spend', 'Leads', 'CPL', 'QL', 'CPL-Q'],
    'meta-ads': ['Ad Spend', 'Leads', 'CPL', 'QL', 'CTR'],
    'google-ads': ['Ad Spend', 'Leads', 'CPL', 'QL', 'CPC'],
    'website': ['Ad Spend', 'Leads', 'CPL', 'CTR', 'Impressions'],
  };
  const currentDefaults = defaultMetricsByModule[activeModule] || defaultMetricsByModule['overview'];

  // Brand Awareness metrics — Meta Ads Manager native fields (all available via
  // the Marketing API `/insights` endpoint, so they map 1:1 when we wire the API).
  // Shared across ecommerce & lead-gen — brand campaigns run for both models.
  const BRAND_AWARENESS_METRICS = [
    'Estimated Ad Recall Lift Rate',     // estimated_ad_recall_rate — Meta's flagship brand measure
    'Estimated Ad Recallers',            // estimated_ad_recallers — people likely to remember the ad
    'Cost per Estimated Ad Recaller',    // cost_per_estimated_ad_recallers — CPEAR efficiency
    'ThruPlays',                         // video_thruplay_watched_actions — Meta's video-completion unit
    'Cost per ThruPlay',                 // cost_per_thruplay — video efficiency
    'Video Plays at 100%',               // video_p100_watched_actions — full video completion
    '2-Second Continuous Video Plays',   // video_continuous_2_sec_watched_actions — attention/hook proxy
    'Video Average Play Time',           // video_avg_time_watched_actions — retention in seconds
  ];

  // App Installs metrics — Meta Ads Manager native fields for App Promotion campaigns.
  // Covers acquire → monetize → activation-quality story in a single group.
  const APP_INSTALL_METRICS = [
    'App Installs',                      // actions[mobile_app_install]
    'Cost per App Install',              // cost_per_action_type[mobile_app_install] — CPI
    'Install Rate',                      // installs / link_clicks (derived)
    'Mobile App Purchases',              // actions[app_custom_event.fb_mobile_purchase]
    'Cost per Mobile App Purchase',      // cost_per_action_type[app_custom_event.fb_mobile_purchase]
    'Mobile App Purchase ROAS',          // mobile_app_purchase_roas
    'App Activations',                   // actions[app_custom_event.fb_mobile_activate_app] — first-open after install
    'Complete Registrations (App)',      // actions[app_custom_event.fb_mobile_complete_registration]
  ];

  // Grouped metric catalog for the Add Metrics dropdown
  const metricGroups: { label: string; metrics: string[] }[] = businessModel === 'ecommerce' ? [
    {
      label: 'Performance',
      metrics: ['Ad Spend', 'Revenue', 'ROAS', 'Orders', 'AOV', 'CAC', 'LTV', 'Conversions', 'Conv. Rate', 'Profit Margin'],
    },
    {
      label: 'Engagement & Funnel',
      metrics: ['CPC', 'CPM', 'CTR', 'Impressions', 'Clicks', 'Frequency', 'Reach', 'Bounce Rate', 'Add to Cart', 'Cart Abandonment'],
    },
    {
      label: 'Brand Awareness',
      metrics: BRAND_AWARENESS_METRICS,
    },
    {
      label: 'App Installs',
      metrics: APP_INSTALL_METRICS,
    },
  ] : [
    {
      label: 'Performance',
      metrics: ['Ad Spend', 'Leads', 'CPL', 'QL', 'CPL-Q', 'Cost/MQL', 'MQL to SQL %', 'Pipeline Value', 'Lead Velocity', 'Conv. Rate'],
    },
    {
      label: 'Engagement & Funnel',
      metrics: ['CPC', 'CPM', 'CTR', 'Impressions', 'Clicks', 'Frequency', 'Reach', 'Bounce Rate', 'Form Fill Rate', 'Landing Page CVR'],
    },
    {
      label: 'Brand Awareness',
      metrics: BRAND_AWARENESS_METRICS,
    },
    {
      label: 'App Installs',
      metrics: APP_INSTALL_METRICS,
    },
  ];

  // Map internal module IDs to URL-friendly slugs
  const MODULE_TO_SLUG: Record<string, string> = { 'sales': 'shopify' };

  const handleModuleSwitch = (module: ReportModule) => {
    setActiveModule(module);
    const slug = MODULE_TO_SLUG[module] || module;
    if (onModuleChange) onModuleChange(slug as ReportModule);
  };

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
        userInfo={userInfo}
        onBack={() => setShowDataroom(false)}
        onNavigateToChat={onBack}
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
        userInfo={userInfo}
        onBack={() => setShowWorkspace(false)}
        onNavigateToChat={onBack}
        onNavigateToReports={() => setShowWorkspace(false)}
        onNavigateToDataroom={() => {
          setShowWorkspace(false);
          setShowDataroom(true);
        }}
      />
    );
  }

  const navigationItems = [
    { id: 'overview' as ReportModule, label: 'Overview', icon: LayoutDashboard },
    { id: 'meta-ads' as ReportModule, label: 'Meta Ads', icon: Zap },
    { id: 'google-ads' as ReportModule, label: 'Google Ads', icon: Target },
    ...(businessModel === 'ecommerce' ? [{ id: 'sales' as ReportModule, label: 'Shopify', icon: ShoppingCart }] : []),
    { id: 'website' as ReportModule, label: 'Website', icon: Globe },
  ];

  // Render the active module content
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'overview':
        return <OverviewModule businessModel={businessModel} selectedChannel={selectedChannel} onNavigateToWebsite={() => handleModuleSwitch('website')} additionalMetrics={additionalMetrics} />;
      case 'meta-ads':
        return <CampaignsModule businessModel={businessModel} selectedChannel={selectedChannel} selectedPlatform={'meta'} additionalMetrics={additionalMetrics} />;
      case 'google-ads':
        return <CampaignsModule businessModel={businessModel} selectedChannel={selectedChannel} selectedPlatform={'google'} additionalMetrics={additionalMetrics} />;
      case 'sales':
        return <ShopifySalesModule businessModel={businessModel} selectedChannel={selectedChannel} />;
      case 'campaigns':
        return <CampaignsModule businessModel={businessModel} selectedChannel={selectedChannel} selectedPlatform={selectedPlatform} additionalMetrics={additionalMetrics} />;
      case 'website':
        return <WebsiteModule businessModel={businessModel} selectedChannel={selectedChannel} />;
      default:
        return <OverviewModule businessModel={businessModel} selectedChannel={selectedChannel} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation — Full-width, matching Dataroom */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center"><BregoLogo size={36} variant="full" /></div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false, onClick: onBack },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: true },
            { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: false, onClick: () => setShowWorkspace(true) },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false, onClick: () => setShowDataroom(true) },
          ]} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell service="marketing" />
          <ProfileDropdown userInfo={userInfo} onProfileSettingsClick={onProfileSettings} onInviteTeamClick={onInviteTeam} onAddBusiness={onAddBusiness} businessTypeLabel={businessAccounts?.find(a => a.id === activeAccountId)?.businessTypeLabel} businessAccounts={businessAccounts} activeAccountId={activeAccountId} onSwitchAccount={onSwitchAccount} onDeleteAccount={onDeleteAccount} notificationCounts={notificationCounts} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Navigation */}
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

          {/* Scrollable nav content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ paddingTop: onServiceSwitch ? 0 : '16px' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reports</span>
            </div>
            
            {/* Navigation Items */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const hasDropdown = item.id === 'campaigns';
                const isDropdownOpen = openDropdown === item.id;
                const isDropdownActive = hasDropdown && (activeModule === item.id || isDropdownOpen);
                const isActive = activeModule === item.id && !hasDropdown;
                
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasDropdown) {
                          if (!isDropdownOpen) {
                            setOpenDropdown(item.id);
                            handleModuleSwitch(item.id);
                            if (item.id === 'campaigns') setSelectedPlatform('meta');
                          } else {
                            setOpenDropdown(null);
                          }
                        } else {
                          handleModuleSwitch(item.id);
                          setOpenDropdown(null);
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${(hasDropdown ? isDropdownActive : isActive)
                          ? 'bg-brand-light text-brand shadow-soft' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {hasDropdown && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Platform Dropdown Menu */}
                    {hasDropdown && isDropdownOpen && (
                      <div className="mt-1 ml-7 space-y-1 pb-2">
                        <button
                          onClick={() => {
                            if (item.id === 'campaigns') { setSelectedPlatform('meta'); handleModuleSwitch('meta-ads'); }
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${(item.id === 'campaigns' ? selectedPlatform : 'meta') === 'meta'
                              ? 'bg-brand-light text-brand'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          Meta Ads
                        </button>
                        <button
                          onClick={() => {
                            if (item.id === 'campaigns') { setSelectedPlatform('google'); handleModuleSwitch('google-ads'); }
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${(item.id === 'campaigns' ? selectedPlatform : 'google') === 'google'
                              ? 'bg-brand-light text-brand'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          Google Ads
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Company Info Footer */}
          <div className="p-4 border-t border-gray-200/40">
            {/* Trial / Onboarding Status */}
            <SidebarStatusCard
              onboardingProgress={(showSettingUp || progress.isUpgraded) ? progress : { ...progress, isUpgraded: false }}
              onUpgradeClick={() => {
                if (onUpgradeFlowTrigger) { onUpgradeFlowTrigger(); return; }
                setUpgradeResumeMode(false);
                setShowUpgradeFlow(true);
              }}
              onContinueOnboarding={() => {
                if (onContinueSetup) { onContinueSetup(); return; }
                setUpgradeResumeMode(true);
                setShowUpgradeFlow(true);
              }}
              serviceType={userInfo.selectedService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
            />


          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-header with Module Title and Date Range */}
          <div className="subheader-glass sticky top-0 z-10 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Module Title */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => item.id === activeModule)?.label}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Last updated: Jan 7, 2026
                </p>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-3">
                {/* Ask Brego AI Button */}
                <button 
                  onClick={() => setShowBregoGPT(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask BregoGPT</span>
                </button>

                {/* Date Range Picker */}
                <DateRangePicker />

                {/* Add Metrics Button — hidden on Shopify module */}
                {activeModule !== 'sales' && <div className="relative" ref={metricsRef}>
                  <button
                    onClick={() => setShowMetricsMenu(!showMetricsMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-soft"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Metrics</span>
                  </button>

                  {showMetricsMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200/60 rounded-xl shadow-dropdown py-1 z-10 max-h-[480px] overflow-y-auto">
                      {metricGroups.map((group, gIdx) => (
                        <div key={group.label} className={gIdx > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                          <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {group.label}
                          </p>
                          {group.metrics.map((name) => {
                            const isDefault = currentDefaults.includes(name);
                            const isAdded = additionalMetrics.includes(name);
                            return (
                              <button
                                key={name}
                                disabled={isDefault}
                                onClick={() => {
                                  if (isDefault) return;
                                  if (isAdded) {
                                    setAdditionalMetrics((prev) => prev.filter((m) => m !== name));
                                  } else {
                                    setAdditionalMetrics((prev) => [...prev, name]);
                                  }
                                }}
                                className={`w-full text-left px-4 py-1.5 text-sm flex items-center justify-between transition-colors ${
                                  isDefault
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isAdded
                                    ? 'text-brand bg-brand-light font-medium hover:bg-red-50 hover:text-red-600 cursor-pointer'
                                    : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                                }`}
                              >
                                <span>{name}</span>
                                {isDefault && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                                {isAdded && <span className="text-[11px] text-brand">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>}

                {/* Export Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-soft"
                  >
                    <Download className="w-4 h-4" />
                    <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200/60 rounded-xl shadow-dropdown py-1 z-10">
                      <button 
                        onClick={() => setShowExportMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export PDF
                      </button>
                      <button 
                        onClick={() => setShowExportMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Module Content */}
              {renderModuleContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Flow Overlay — local fallback when parent doesn't provide a trigger (e.g. standalone dashboard routes) */}
      {showUpgradeFlow && (
        <UpgradeFlow
          userInfo={userInfo}
          onClose={() => setShowUpgradeFlow(false)}
          onComplete={() => {
            setShowUpgradeFlow(false);
            const isFinance = userInfo.selectedService === 'Accounts & Taxation';
            updateProgress(prev => ({
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
          resumeOnboarding={upgradeResumeMode && progress.isUpgraded ? progress : undefined}
        />
      )}

      {/* Service Team Onboarding — Performance Marketing Setup Complete modal */}
      <ServiceTeamOnboarding
        isOpen={showServiceTeamOnboarding}
        onComplete={() => {
          setShowServiceTeamOnboarding(false);
          updateProgress(prev => ({ ...prev, stoCompleted: true }));
        }}
        businessType={businessModel === 'leadgen' ? 'leadgen' : 'ecommerce'}
        clientName={`${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim()}
        companyName={userInfo.companyName ?? ''}
        monthlyBudget={userInfo.adSpendRange}
        selectedPlan={progress.selectedPlan}
      />

      {/* Accounts Team Onboarding — Accounts & Taxation Setup Complete modal */}
      <AccountsTeamOnboarding
        isOpen={showAccountsTeamOnboarding}
        onComplete={() => {
          setShowAccountsTeamOnboarding(false);
          updateProgress(prev => ({ ...prev, stoCompleted: true }));
        }}
        clientName={`${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim()}
        companyName={userInfo.companyName ?? ''}
        selectedPlan={progress.selectedPlan}
        businessType={userInfo.businessType}
        revenueRange={userInfo.revenueRange}
      />

      {/* BregoGPT AI Assistant Drawer */}
      <BregoGPTDrawer
        isOpen={showBregoGPT}
        onClose={() => setShowBregoGPT(false)}
        moduleContext={activeModule}
      />
    </div>
  );
}
