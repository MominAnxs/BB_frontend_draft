'use client';

import { useState } from 'react';
import { UserInfo } from '../../types';
import { 
  CheckCircle2, ArrowRight, ArrowLeft,
  Link2, ExternalLink, Shield, Globe, BarChart3, Search, 
  ShoppingBag, FileText, Landmark, CreditCard, BookOpen, 
  Package, Target, Star, Sparkles, Briefcase,
  Rocket, PartyPopper, Crown, X, Users, Phone,
  MessageSquare, MapPin, IndianRupee, Filter, Megaphone, 
  ClipboardList, Zap, PhoneCall, Mail,
  Lock, FolderOpen, Upload, Building2,
  Receipt, Banknote, ShoppingCart, Wallet,
  Database, FileSpreadsheet, FileCheck,
  Eye, EyeOff, ChevronDown, User as UserIcon,
  CloudUpload, File, Trash2, Clock
} from 'lucide-react';
import { GoogleAdsIcon, MetaAdsIcon, GoogleAnalyticsIcon, ShopifyIcon } from '../BrandIcons';
import { useOnboardingData } from '../context/OnboardingDataContext';
import { BregoLogo } from '../BregoLogo';
type OnboardingStep = 'connect' | 'basics' | 'competitors' | 'products' | 'dataAccess' | 'documents';

type BusinessType = 'leadgen' | 'ecommerce' | 'finance';

// Finance sub-variants — only applies when the user is on the Accounts & Taxation service
type FinanceVariant = 'ecommerce-restaurants' | 'trading-manufacturing';

function resolveFinanceVariant(bt?: string): FinanceVariant {
  if (!bt) return 'trading-manufacturing';
  const n = bt.toLowerCase();
  if (
    n.includes('e-commerce') ||
    n.includes('ecommerce') ||
    n.includes('restaurant') ||
    n === 'ecommerce-restaurants'
  ) {
    return 'ecommerce-restaurants';
  }
  return 'trading-manufacturing';
}

function getSteps(businessType: BusinessType): { id: OnboardingStep; label: string; shortLabel: string }[] {
  if (businessType === 'finance') {
    return [
      { id: 'connect', label: 'Connect Accounts', shortLabel: 'Accounts' },
      { id: 'basics', label: 'Setup Basics', shortLabel: 'Basics' },
      { id: 'dataAccess', label: 'Data Access', shortLabel: 'Access' },
      { id: 'documents', label: 'Documents & Data', shortLabel: 'Documents' },
    ];
  }

  const step4Label = businessType === 'leadgen' ? 'Lead Funnel' : 'Product Info';
  const step4Short = businessType === 'leadgen' ? 'Funnel' : 'Products';

  return [
    { id: 'connect', label: 'Connect Accounts', shortLabel: 'Accounts' },
    { id: 'basics', label: 'Setup Basics', shortLabel: 'Basics' },
    { id: 'competitors', label: 'Competitor Details', shortLabel: 'Competitors' },
    { id: 'products', label: step4Label, shortLabel: step4Short },
  ];
}

interface PostPaymentOnboardingProps {
  userInfo: UserInfo;
  selectedPlan: string;
  onComplete: () => void;
  onClose: () => void;
  onStepComplete?: (stepId: string) => void;
  onStepChange?: (stepId: string) => void;
  initialStep?: string;
  completedSteps?: string[];
  /** When true, only show Connect Accounts step in a compact layout */
  connectOnly?: boolean;
}

export function PostPaymentOnboarding({ 
  userInfo, selectedPlan, onComplete, onClose,
  onStepComplete, onStepChange, initialStep, completedSteps: initialCompletedSteps,
  connectOnly = false
}: PostPaymentOnboardingProps) {
  // Smart business type detection (must be before getStartStep)
  const isFinance = userInfo.selectedService === 'Accounts & Taxation';
  const isLeadGen = !isFinance && (
    userInfo.businessModel === 'leadgen' || 
    userInfo.goal === 'Generate Leads'
  );
  const businessType: BusinessType = isFinance ? 'finance' : isLeadGen ? 'leadgen' : 'ecommerce';

  // Determine starting step
  const getStartStep = (): OnboardingStep => {
    if (initialStep) {
      const validSteps: OnboardingStep[] = ['connect', 'basics', 'competitors', 'products', 'dataAccess', 'documents'];
      if (validSteps.includes(initialStep as OnboardingStep)) return initialStep as OnboardingStep;
    }
    if (initialCompletedSteps && initialCompletedSteps.length > 0) {
      const actionableSteps: OnboardingStep[] = isFinance 
        ? ['connect', 'basics', 'dataAccess', 'documents']
        : ['connect', 'basics', 'competitors', 'products'];
      const firstIncomplete = actionableSteps.find(s => !initialCompletedSteps.includes(s));
      if (!firstIncomplete) return 'connect'; // all done, default to first step
    }
    return 'connect';
  };

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(getStartStep);
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(initialCompletedSteps || []));
  const [showResumeBanner, setShowResumeBanner] = useState(!!initialCompletedSteps && initialCompletedSteps.length > 0);
  
  const STEPS = getSteps(businessType);
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);
  const progressPercent = ((currentIndex) / (STEPS.length - 1)) * 100;

  const markStepComplete = (stepId: string) => {
    setLocalCompleted(prev => new Set([...prev, stepId]));
    onStepComplete?.(stepId);
  };

  const goNext = () => {
    markStepComplete(currentStep);
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex].id;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      // All steps done — complete the flow
      onComplete();
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex].id;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  // ── Connect-Only Mode: compact layout, no sidebar ──
  if (connectOnly) {
    return (
      <div className="flex flex-col" style={{ flex: 1, minHeight: 0 }}>
        {/* Compact header */}
        <div className="bg-white border-b border-gray-100 px-7 py-4 flex items-center justify-between" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <BregoLogo size={36} variant="full" />
            <div>
              <h2 className="text-gray-900" style={{ fontSize: '15px' }}>Quick Setup</h2>
              <p className="text-xs text-gray-400">Connect your accounts to get started</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Connect Accounts content */}
        {businessType === 'finance' ? (
          <ConnectAccountsStep 
            businessType={businessType} 
            onNext={onComplete}
            compact
          />
        ) : (
          <div className="flex-1 overflow-y-auto px-7 py-6" style={{ minHeight: 0 }}>
            <ConnectAccountsStep 
              businessType={businessType} 
              onNext={onComplete}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Progress Tracker */}
      <div className="w-[280px] bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col flex-shrink-0">
        {/* Logo area */}
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BregoLogo size={36} variant="full" />
            <div>
              <p className="text-gray-500 text-xs">Account Setup</p>
            </div>
          </div>
        </div>

        {/* Plan Badge */}
        <div className="px-6 py-4">
          <div className="px-3 py-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-blue-300">{selectedPlan} Plan</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex-1 px-6 py-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-5 font-medium">Setup Progress</p>
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = localCompleted.has(step.id);
              
              return (
                <div key={step.id}>
                  <button
                    onClick={() => {
                      if (isCompleted) setCurrentStep(step.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : isCompleted 
                          ? 'text-green-400 hover:bg-white/5 cursor-pointer' 
                          : 'text-gray-600 cursor-default'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 ring-2 ring-blue-400/30' 
                        : isCompleted 
                          ? 'bg-green-600' 
                          : 'bg-gray-800 border border-gray-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : isActive ? (
                        <span className="text-xs font-semibold text-white">{index + 1}</span>
                      ) : (
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  </button>
                  
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="ml-[22px] h-4 flex items-center">
                      <div className={`w-0.5 h-full rounded-full transition-colors duration-300 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-800'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-500">Your data is encrypted & secure</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200/60 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Step {currentIndex + 1} of {STEPS.length}</p>
            <h2 className="text-gray-900" style={{ fontSize: '18px' }}>{STEPS[currentIndex].label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{Math.round(progressPercent)}%</span>
            {(
              <button
                onClick={onClose}
                className="ml-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Save & exit</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {showResumeBanner && (
            <div 
              className="max-w-2xl mx-auto mb-6 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              style={{ animation: 'slideUp 0.4s ease-out' }}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Welcome back! Your progress is saved.</p>
                <p className="text-xs text-blue-600">Pick up right where you left off.</p>
              </div>
              <button 
                onClick={() => setShowResumeBanner(false)}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          )}

          {currentStep === 'connect' && (
            <ConnectAccountsStep businessType={businessType} onNext={goNext} />
          )}
          {currentStep === 'basics' && (
            <SetupBasicsStep businessType={businessType} userInfo={userInfo} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'competitors' && (
            <CompetitorDetailsStep businessType={businessType} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'products' && (
            businessType === 'leadgen' 
              ? <LeadFunnelStep onNext={goNext} onBack={goBack} />
              : <ProductInfoStep businessType={businessType} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'dataAccess' && (
            <DataAccessStep financeVariant={resolveFinanceVariant(userInfo.businessType)} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'documents' && (
            <DocumentsDataStep financeVariant={resolveFinanceVariant(userInfo.businessType)} onNext={goNext} onBack={goBack} />
          )}

        </div>
      </div>

    </div>
  );
}


// ===== Shared input classes =====
const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all';
const selectCls = `${inputCls} appearance-none`;


// ===== Step 1: Connect Accounts =====
function ConnectAccountsStep({ businessType, onNext, compact = false }: { businessType: BusinessType; onNext: () => void; compact?: boolean }) {
  const { updateData } = useOnboardingData();
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({});

  // Finance-specific: Tally upload state
  const [tallyFiles, setTallyFiles] = useState<{ name: string; size: string; id: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const toggleAccount = (id: string) => {
    setConnectedAccounts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleTallyFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const allowedExts = ['.xml', '.json', '.xlsx', '.xls', '.csv', '.zip'];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const newFiles: { name: string; size: string; id: string }[] = [];
    
    Array.from(fileList).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext)) return;
      if (file.size > maxSize) return;
      if (tallyFiles.length + newFiles.length >= 10) return;
      newFiles.push({
        name: file.name,
        size: formatFileSize(file.size),
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      });
    });
    
    if (newFiles.length > 0) {
      setTallyFiles(prev => [...prev, ...newFiles]);
      // Auto-mark as uploaded immediately — no extra click needed
      setUploadSuccess(true);
      setConnectedAccounts(prev => ({ ...prev, tally: true }));
    }
  };

  const removeTallyFile = (id: string) => {
    const updated = tallyFiles.filter(f => f.id !== id);
    setTallyFiles(updated);
    if (updated.length === 0) {
      setUploadSuccess(false);
      setConnectedAccounts(prev => ({ ...prev, tally: false }));
    }
  };

  const leadGenAccounts = [
    { id: 'meta', name: 'Meta Ads', description: 'Lead forms, Instant Forms & conversion campaigns on Facebook & Instagram', icon: <MetaAdsIcon size={22} />, color: 'from-blue-500 to-blue-600', required: true, brandIcon: true },
    { id: 'google', name: 'Google Ads', description: 'Search ads, call extensions & lead-focused campaign imports', icon: <GoogleAdsIcon size={22} />, color: 'from-red-500 to-orange-500', required: true, brandIcon: true },
    { id: 'ga4', name: 'Google Analytics 4', description: 'Track landing page performance, form fills & conversion paths', icon: <GoogleAnalyticsIcon size={22} />, color: 'from-amber-500 to-yellow-500', required: false, brandIcon: true },
    { id: 'crm', name: 'Zoho CRM', description: 'Sync leads to Zoho CRM for pipeline tracking', icon: <Users className="w-5 h-5" />, color: 'from-purple-500 to-violet-600', required: false, brandIcon: false },
  ];

  const ecommerceAccounts = [
    { id: 'meta', name: 'Meta Ads', description: 'Connect your Facebook & Instagram ad accounts', icon: <MetaAdsIcon size={22} />, color: 'from-blue-500 to-blue-600', required: true, brandIcon: true },
    { id: 'google', name: 'Google Ads', description: 'Import your Search, Display & YouTube campaigns', icon: <GoogleAdsIcon size={22} />, color: 'from-red-500 to-orange-500', required: true, brandIcon: true },
    { id: 'ga4', name: 'Google Analytics 4', description: 'Track website performance and user behavior', icon: <GoogleAnalyticsIcon size={22} />, color: 'from-amber-500 to-yellow-500', required: false, brandIcon: true },
    { id: 'shopify', name: 'Shopify', description: 'Sync your store data and revenue metrics', icon: <ShopifyIcon size={22} />, color: 'from-green-500 to-emerald-500', required: false, brandIcon: true },
  ];

  const accounts = businessType === 'leadgen' 
    ? leadGenAccounts 
    : ecommerceAccounts;

  const connectedCount = Object.values(connectedAccounts).filter(Boolean).length;

  // ── Finance: Upload Tally Data ──
  if (businessType === 'finance') {
    const financeFooter = (
      <div
        className="flex items-center justify-between flex-shrink-0 bg-white"
        style={{
          padding: compact ? '16px 28px 20px' : '16px 0 0',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <button
          onClick={() => { updateData({ connectedAccounts }); onNext(); }}
          className="flex items-center gap-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
          style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', padding: '8px 14px' }}
        >
          <Clock className="w-4 h-4" />
          Do it later
        </button>
        <button
          onClick={() => { updateData({ connectedAccounts }); onNext(); }}
          disabled={!uploadSuccess}
          className={`rounded-xl transition-all duration-300 flex items-center gap-2 group ${
            uploadSuccess
              ? 'text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          style={uploadSuccess ? {
            backgroundColor: '#204CC7',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 4px 14px rgba(32, 76, 199, 0.25)',
            padding: '10px 24px',
          } : {
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Manrope, sans-serif',
            padding: '10px 24px',
          }}
        >
          Continue
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );

    const financeContent = (
      <>
        <div style={{ marginBottom: '20px' }}>
          <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: '6px' }}>
            Upload Tally Data
          </h3>
          <p className="text-gray-500" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', lineHeight: '1.5' }}>
            Upload your Tally export files to power your financial dashboard. We accept XML, JSON, Excel, CSV, and ZIP formats.
          </p>
        </div>

        {/* Tally branding header */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/40" style={{ padding: '12px 16px', marginBottom: '16px' }}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white" style={{ boxShadow: '0 2px 8px rgba(32, 76, 199, 0.18)' }}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>Tally Prime</p>
            <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', marginTop: '2px' }}>Ledger, P&L, Balance Sheet & Trial Balance exports</p>
          </div>
          {uploadSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl" style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>
              <CheckCircle2 className="w-4 h-4" />
              Uploaded
            </span>
          )}
        </div>

        {/* Drag & Drop Zone — always clickable to add more files */}
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleTallyFiles(e.dataTransfer.files);
          }}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-[#204CC7] bg-blue-50/60 scale-[1.01]'
              : uploadSuccess
                ? 'border-green-300 bg-green-50/30'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
          }`}
          style={{ boxShadow: isDragging ? '0 0 0 4px rgba(32, 76, 199, 0.08)' : 'none' }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.xml,.json,.xlsx,.xls,.csv,.zip';
            input.onchange = (e) => handleTallyFiles((e.target as HTMLInputElement).files);
            input.click();
          }}
        >
          <div className="flex flex-col items-center justify-center" style={{ padding: '28px 24px' }}>
            <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
              isDragging
                ? 'bg-[#204CC7]/10 text-[#204CC7] scale-110'
                : uploadSuccess
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
            }`} style={{ width: '44px', height: '44px', marginBottom: '10px' }}>
              {uploadSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <CloudUpload className="w-5 h-5" />
              )}
            </div>
            {isDragging ? (
              <p className="text-[#204CC7]" style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>
                Drop your files here
              </p>
            ) : uploadSuccess ? (
              <>
                <p className="text-green-700" style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>
                  Files uploaded successfully
                </p>
                <p className="text-green-600" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
                  Click to add more files or drag & drop
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>
                  Drag & drop your Tally files here
                </p>
                <p className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
                  or <span className="text-[#204CC7]" style={{ fontWeight: 500 }}>browse files</span> from your computer
                </p>
                <p className="text-gray-300" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif', marginTop: '6px' }}>
                  XML, JSON, Excel, CSV, ZIP — up to 25 MB each
                </p>
              </>
            )}
          </div>
        </div>

        {/* Uploaded Files List */}
        {tallyFiles.length > 0 && (
          <div className="space-y-2" style={{ marginTop: '12px' }}>
            {tallyFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-all duration-200"
                style={{ padding: '10px 16px' }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <File className="w-4 h-4 text-[#204CC7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }}>{file.name}</p>
                  <p className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }}>{file.size}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTallyFile(file.id); }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all duration-200"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );

    // Compact mode (connectOnly): component owns scroll + fixed footer
    if (compact) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px 28px' }}>
            {financeContent}
          </div>
          {financeFooter}
        </div>
      );
    }

    // Full onboarding mode: content flows normally, footer at bottom with spacing
    return (
      <div>
        {financeContent}
        <div style={{ marginTop: '24px' }}>
          {financeFooter}
        </div>
      </div>
    );
  }

  // ── Marketing (Lead Gen / E-Commerce) — unchanged ──
  const headings = {
    leadgen: {
      title: 'Connect your lead generation platforms',
      subtitle: 'We\'ll sync your ad platforms and CRM to build your lead performance dashboard. You can always add more later.'
    },
    ecommerce: {
      title: 'Connect your ad platforms',
      subtitle: 'We\'ll import your campaign data to set up your performance dashboard. You can connect optional ones later.'
    },
  };

  const heading = headings[businessType as 'leadgen' | 'ecommerce'] || headings.ecommerce;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-gray-900 mb-1.5" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
          {heading.title}
        </h3>
        <p className="text-gray-500 leading-relaxed" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }}>
          {heading.subtitle}
        </p>
      </div>

      <div className="space-y-2.5 mb-6">
        {accounts.map((account) => {
          const isConnected = connectedAccounts[account.id];
          return (
            <div
              key={account.id}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                isConnected 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                account.brandIcon 
                  ? 'bg-white border border-gray-200 shadow-sm' 
                  : `bg-gradient-to-br ${account.color} text-white shadow-sm`
              }`}>
                {account.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">{account.name}</p>
                  {account.required && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded" style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }}>Required</span>
                  )}
                </div>
                <p className="text-gray-500 mt-0.5 leading-relaxed" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }}>{account.description}</p>
              </div>
              <button
                onClick={() => toggleAccount(account.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  isConnected
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
                }`}
                style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }}
              >
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Connect
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        <p className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }}>
          {connectedCount > 0 
            ? `${connectedCount} of ${accounts.length} connected` 
            : 'Connect at least 1 account to continue'}
        </p>
        <button
          onClick={() => { updateData({ connectedAccounts }); onNext(); }}
          className="px-6 py-2.5 text-white rounded-xl transition-all duration-300 flex items-center gap-2 group"
          style={{
            backgroundColor: '#204CC7',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 4px 14px rgba(32, 76, 199, 0.25)',
          }}
        >
          Continue
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


// ===== Step 2: Setup Basics =====
function SetupBasicsStep({ businessType, userInfo, onNext, onBack }: { businessType: BusinessType; userInfo: UserInfo; onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();

  const mapGoalFromOnboarding = (goal?: string): string => {
    if (!goal) return '';
    switch (goal) {
      case 'Generate Leads': return 'Lead Generation';
      case 'Increase ROAS': return 'E-Commerce Sales';
      default: return goal;
    }
  };

  const mapIndustryFromOnboarding = (industry?: string): string => {
    if (!industry) return '';
    switch (industry) {
      case 'E-Commerce': return 'ecommerce';
      case 'Healthcare / Wellness': return 'healthcare';
      case 'Education / EdTech': return 'education';
      case 'B2B Services': return 'services';
      case 'Real Estate': return 'realestate';
      case 'Food & Beverage': return 'restaurant';
      case 'Technology / SaaS': return 'saas';
      case 'Other': return 'other';
      default: return '';
    }
  };

  // For finance users, map businessType to industry when industry wasn't collected
  const mapFinanceBusinessTypeToIndustry = (bt?: string): string => {
    if (!bt) return '';
    switch (bt) {
      case 'E-Commerce or Restaurants': return 'ecommerce';
      case 'Trading, Manufacturing or Services': return 'trading';
      default: return '';
    }
  };

  const resolvedIndustry = mapIndustryFromOnboarding(userInfo.industry) || mapFinanceBusinessTypeToIndustry(userInfo.businessType);

  const [formData, setFormData] = useState({
    companyName: userInfo.companyName || '',
    website: userInfo.companyWebsite || '',
    industry: resolvedIndustry,
    // Finance-specific
    gstNumber: '',
    panNumber: '',
    financialYear: '2025-26',
    // Marketing-shared
    monthlyBudget: userInfo.adSpendRange || '',
    primaryGoal: mapGoalFromOnboarding(userInfo.goal),
    // E-Commerce specific
    targetAudience: '',
    targetLocation: '',
    // Lead Gen specific
    serviceAreas: '',
    avgDealValue: '',
    leadVolumeTarget: '',
    primaryService: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [serviceAreaOpen, setServiceAreaOpen] = useState(false);
  const [targetLocationOpen, setTargetLocationOpen] = useState(false);

  const locationOptions = [
    'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Pan-India', 'International'
  ];

  const serviceAreaOptions = locationOptions;

  const selectedServiceAreas = formData.serviceAreas ? formData.serviceAreas.split(', ').filter(Boolean) : [];

  const toggleServiceArea = (area: string) => {
    const updated = selectedServiceAreas.includes(area)
      ? selectedServiceAreas.filter(a => a !== area)
      : [...selectedServiceAreas, area];
    handleChange('serviceAreas', updated.join(', '));
  };

  const removeServiceArea = (area: string) => {
    const updated = selectedServiceAreas.filter(a => a !== area);
    handleChange('serviceAreas', updated.join(', '));
  };

  const selectedTargetLocations = formData.targetLocation ? formData.targetLocation.split(', ').filter(Boolean) : [];

  const toggleTargetLocation = (loc: string) => {
    const updated = selectedTargetLocations.includes(loc)
      ? selectedTargetLocations.filter(l => l !== loc)
      : [...selectedTargetLocations, loc];
    handleChange('targetLocation', updated.join(', '));
  };

  const removeTargetLocation = (loc: string) => {
    const updated = selectedTargetLocations.filter(l => l !== loc);
    handleChange('targetLocation', updated.join(', '));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>
          {businessType === 'leadgen' ? 'Configure your lead generation setup' : 'Tell us about your business'}
        </h3>
        <p className="text-sm text-gray-500">
          {businessType === 'leadgen'
            ? 'This helps us set up your lead tracking, cost-per-lead benchmarks, and funnel analytics.'
            : 'This helps us personalize your dashboard and recommendations.'}
        </p>
      </div>

      <div className="space-y-5 mb-8">
        {/* Common fields — finance shows Company Name + Industry in 2-col grid; others keep Company Name + Website URL then full-width Industry */}
        {businessType === 'finance' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Your company name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className={selectCls}
              >
                <option value="">Select your industry</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="saas">SaaS / Technology</option>
                <option value="retail">Retail</option>
                <option value="fmcg">FMCG</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="realestate">Real Estate</option>
                <option value="restaurant">Restaurant / F&B</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="trading">Trading</option>
                <option value="services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Your company name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className={selectCls}
              >
                <option value="">Select your industry</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="saas">SaaS / Technology</option>
                <option value="retail">Retail</option>
                <option value="fmcg">FMCG</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="realestate">Real Estate</option>
                <option value="restaurant">Restaurant / F&B</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="trading">Trading</option>
                <option value="services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}

        {/* Conditional fields */}
        {businessType === 'finance' ? (
          <>
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Compliance Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleChange('gstNumber', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleChange('panNumber', e.target.value)}
                    placeholder="AAAPZ1234C"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Financial Year</label>
              <select
                value={formData.financialYear}
                onChange={(e) => handleChange('financialYear', e.target.value)}
                className={selectCls}
              >
                <option value="2025-26">FY 2025-26 (Apr 2025 - Mar 2026)</option>
                <option value="2024-25">FY 2024-25 (Apr 2024 - Mar 2025)</option>
              </select>
            </div>
          </>
        ) : businessType === 'leadgen' ? (
          <>
            {/* Lead Gen: Service & Location */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Lead Generation Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Service Offered</label>
                  <input
                    type="text"
                    value={formData.primaryService}
                    onChange={(e) => handleChange('primaryService', e.target.value)}
                    placeholder="e.g., Home Loans, Dental Implants, Legal Consulting"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Areas</label>
                  <div className="relative">
                    <div
                      onClick={() => setServiceAreaOpen(!serviceAreaOpen)}
                      className={`${inputCls} pl-10 pr-8 cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1.5`}
                    >
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${serviceAreaOpen ? 'rotate-180' : ''}`} />
                      {selectedServiceAreas.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select service areas</span>
                      ) : (
                        selectedServiceAreas.map(area => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md"
                          >
                            {area}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-blue-900"
                              onClick={(e) => { e.stopPropagation(); removeServiceArea(area); }}
                            />
                          </span>
                        ))
                      )}
                    </div>
                    {serviceAreaOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setServiceAreaOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto py-1">
                          {serviceAreaOptions.map(area => (
                            <div
                              key={area}
                              onClick={() => toggleServiceArea(area)}
                              className={`flex items-center gap-2.5 px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                                selectedServiceAreas.includes(area) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                selectedServiceAreas.includes(area) ? 'bg-[#204CC7] border-[#204CC7]' : 'border-gray-300'
                              }`}>
                                {selectedServiceAreas.includes(area) && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              {area}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Gen: Budget & Economics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Ad Budget</label>
                <select
                  value={formData.monthlyBudget}
                  onChange={(e) => handleChange('monthlyBudget', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select budget range</option>
                  <option value="₹1.5L - ₹2.5L">₹1.5L - ₹2.5L</option>
                  <option value="₹2.5L - ₹3.5L">₹2.5L - ₹3.5L</option>
                  <option value="₹3.5L - ₹4.5L">₹3.5L - ₹4.5L</option>
                  <option value="₹4.5L - ₹5.5L">₹4.5L - ₹5.5L</option>
                  <option value="₹5.5L+">₹5.5L+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Average Deal Value</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.avgDealValue}
                    onChange={(e) => handleChange('avgDealValue', e.target.value)}
                    className={`${selectCls} pl-10`}
                  >
                    <option value="">Select deal value</option>
                    <option value="Under ₹10,000">Under ₹10,000</option>
                    <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                    <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                    <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                    <option value="₹10,00,000+">₹10,00,000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lead Gen: Volume Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Lead Volume Target</label>
              <select
                value={formData.leadVolumeTarget}
                onChange={(e) => handleChange('leadVolumeTarget', e.target.value)}
                className={selectCls}
              >
                <option value="">How many leads do you want per month?</option>
                <option value="50-100">50 - 100 leads</option>
                <option value="100-300">100 - 300 leads</option>
                <option value="300-500">300 - 500 leads</option>
                <option value="500-1000">500 - 1,000 leads</option>
                <option value="1000+">1,000+ leads</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* E-Commerce specific */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Marketing Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    placeholder="e.g., Women 25-34, Metro cities"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Ad Budget</label>
                  <select
                    value={formData.monthlyBudget}
                    onChange={(e) => handleChange('monthlyBudget', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select budget range</option>
                    <option value="₹1.5L - ₹2.5L">₹1.5L - ₹2.5L</option>
                    <option value="₹2.5L - ₹3.5L">₹2.5L - ₹3.5L</option>
                    <option value="₹3.5L - ₹4.5L">₹3.5L - ₹4.5L</option>
                    <option value="₹4.5L - ₹5.5L">₹4.5L - ₹5.5L</option>
                    <option value="₹5.5L+">₹5.5L+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Location</label>
                  <div className="relative">
                    <div
                      onClick={() => setTargetLocationOpen(!targetLocationOpen)}
                      className={`${inputCls} pl-10 pr-8 cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1.5`}
                    >
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${targetLocationOpen ? 'rotate-180' : ''}`} />
                      {selectedTargetLocations.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select target locations</span>
                      ) : (
                        selectedTargetLocations.map(loc => (
                          <span
                            key={loc}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md"
                          >
                            {loc}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-blue-900"
                              onClick={(e) => { e.stopPropagation(); removeTargetLocation(loc); }}
                            />
                          </span>
                        ))
                      )}
                    </div>
                    {targetLocationOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setTargetLocationOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto py-1">
                          {locationOptions.map(loc => (
                            <div
                              key={loc}
                              onClick={() => toggleTargetLocation(loc)}
                              className={`flex items-center gap-2.5 px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                                selectedTargetLocations.includes(loc) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                selectedTargetLocations.includes(loc) ? 'bg-[#204CC7] border-[#204CC7]' : 'border-gray-300'
                              }`}>
                                {selectedTargetLocations.includes(loc) && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              {loc}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Goal</label>
                  <select
                    value={formData.primaryGoal}
                    onChange={(e) => handleChange('primaryGoal', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select your primary goal</option>
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="E-Commerce Sales">E-Commerce Sales</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="App Installs">App Installs</option>
                    <option value="Website Traffic">Website Traffic</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => {
            updateData({
              companyName: formData.companyName,
              website: formData.website,
              industry: formData.industry,
              gstNumber: formData.gstNumber,
              panNumber: formData.panNumber,
              financialYear: formData.financialYear,
              monthlyBudget: formData.monthlyBudget,
              primaryGoal: formData.primaryGoal,
              targetAudience: formData.targetAudience,
              targetLocation: formData.targetLocation,
              primaryService: formData.primaryService,
              serviceAreas: formData.serviceAreas,
              avgDealValue: formData.avgDealValue,
              leadVolumeTarget: formData.leadVolumeTarget,
            });
            onNext();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
        >
          Continue
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


// ===== Step 3: Competitor Details =====
function CompetitorDetailsStep({ businessType, onNext, onBack }: { businessType: BusinessType; onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();
  const [competitors, setCompetitors] = useState([
    { name: '', website: '', offering: '' },
    { name: '', website: '', offering: '' },
    { name: '', website: '', offering: '' },
  ]);

  const updateCompetitor = (index: number, field: string, value: string) => {
    setCompetitors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors(prev => [...prev, { name: '', website: '', offering: '' }]);
    }
  };

  const headings = {
    leadgen: {
      title: 'Who else are your prospects considering?',
      subtitle: 'We\'ll analyze their landing pages, ad copy, and lead magnets to uncover gaps you can exploit.',
      infoTitle: 'Why this matters for lead generation',
      infoBody: 'Understanding competitor positioning reveals where their messaging is weak and where your offer can differentiate — whether it\'s pricing, speed-to-response, or trust signals.'
    },
    ecommerce: {
      title: 'Who are you competing against?',
      subtitle: 'We\'ll analyze their ad strategies, keywords, and positioning to find opportunities for you.',
      infoTitle: 'Why competitor analysis matters',
      infoBody: 'By analyzing your competitors\' ad strategies, we can identify keyword gaps, creative opportunities, and positioning advantages that give you an edge.'
    },
    finance: {
      title: 'Who are your key competitors?',
      subtitle: 'We\'ll benchmark your financial health against industry peers. This is optional but helps us provide better insights.',
      infoTitle: 'Why competitor analysis matters',
      infoBody: 'Understanding industry benchmarks helps us tailor your financial KPIs and identify areas where your business can optimize costs and improve margins.'
    }
  };

  const h = headings[businessType];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>{h.title}</h3>
        <p className="text-sm text-gray-500">{h.subtitle}</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900 mb-0.5">{h.infoTitle}</p>
          <p className="text-xs text-blue-700">{h.infoBody}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {competitors.map((competitor, index) => (
          <div 
            key={index} 
            className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            style={{ animation: `slideUp 0.3s ease-out ${index * 0.1}s both` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">{index + 1}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Competitor {index + 1}</p>
              {index === 0 && <span className="text-[10px] text-gray-400 ml-1">(Primary)</span>}
            </div>
            <div className={`grid ${businessType === 'leadgen' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company Name</label>
                <input
                  type="text"
                  value={competitor.name}
                  onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                  placeholder="e.g., Competitor brand"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Website</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="url"
                    value={competitor.website}
                    onChange={(e) => updateCompetitor(index, 'website', e.target.value)}
                    placeholder="https://competitor.com"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
              {businessType === 'leadgen' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Key Offering</label>
                  <input
                    type="text"
                    value={competitor.offering}
                    onChange={(e) => updateCompetitor(index, 'offering', e.target.value)}
                    placeholder="e.g., Free consultations"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {competitors.length < 5 && (
        <button
          onClick={addCompetitor}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
        >
          + Add another competitor
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => {
            updateData({ competitors });
            onNext();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
        >
          Continue
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


// ===== Step 4a: Lead Funnel (Lead Gen specific) =====
function LeadFunnelStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();
  const [funnelData, setFunnelData] = useState({
    followUpMethod: [] as string[],
  });

  const [qualCriteria, setQualCriteria] = useState([
    { label: 'Budget confirmed', enabled: true },
    { label: 'Decision-maker identified', enabled: true },
    { label: 'Timeline within 30 days', enabled: false },
    { label: 'Location match', enabled: false },
    { label: 'Service need validated', enabled: true },
  ]);

  const [services, setServices] = useState([
    { name: '', avgValue: '', conversionTime: '' },
  ]);

  const toggleQual = (index: number) => {
    setQualCriteria(prev => prev.map((q, i) => i === index ? { ...q, enabled: !q.enabled } : q));
  };

  const followUpOptions = [
    { id: 'call', label: 'Phone Call', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <Phone className="w-4 h-4" /> },
  ];

  const toggleFollowUp = (id: string) => {
    setFunnelData(prev => ({
      ...prev,
      followUpMethod: prev.followUpMethod.includes(id)
        ? prev.followUpMethod.filter(m => m !== id)
        : [...prev.followUpMethod, id]
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addService = () => {
    if (services.length < 5) {
      setServices(prev => [...prev, { name: '', avgValue: '', conversionTime: '' }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>
          Design your lead funnel
        </h3>
        <p className="text-sm text-gray-500">
          Configure how leads enter your pipeline, how they're qualified, and how your team follows up.
        </p>
      </div>

      {/* Section 1: Services */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Services You Offer</p>
            <p className="text-xs text-gray-500">What are your prospects buying?</p>
          </div>
        </div>

        <div className="space-y-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all"
              style={{ animation: `slideUp 0.3s ease-out ${index * 0.1}s both` }}
            >
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    placeholder="e.g., Home Loan Advisory"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Avg. Deal Value</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <select
                      value={service.avgValue}
                      onChange={(e) => updateService(index, 'avgValue', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Select deal value</option>
                      <option value="Under ₹10,000">Under ₹10,000</option>
                      <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                      <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                      <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                      <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                      <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                      <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                      <option value="₹10,00,000+">₹10,00,000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Avg. Sales Cycle</label>
                  <select
                    value={service.conversionTime}
                    onChange={(e) => updateService(index, 'conversionTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select duration</option>
                    <option value="same-day">Same day</option>
                    <option value="1-3-days">1 - 3 days</option>
                    <option value="1-2-weeks">1 - 2 weeks</option>
                    <option value="2-4-weeks">2 - 4 weeks</option>
                    <option value="1-3-months">1 - 3 months</option>
                    <option value="3-6-months">3 - 6 months</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length < 5 && (
          <button
            onClick={addService}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 mt-3"
          >
            + Add another service
          </button>
        )}
      </div>

      {/* Section 2: Lead Qualification */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Lead Qualification Criteria</p>
            <p className="text-xs text-gray-500">Which signals indicate a quality lead?</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200">
          <div className="space-y-2">
            {qualCriteria.map((criteria, index) => (
              <button
                key={index}
                onClick={() => toggleQual(index)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  criteria.enabled 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    criteria.enabled ? 'bg-blue-600' : 'border-2 border-gray-300'
                  }`}>
                    {criteria.enabled && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${criteria.enabled ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>
                    {criteria.label}
                  </span>
                </div>
                {criteria.enabled && (
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Follow-up Method */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Follow-up Channels</p>
            <p className="text-xs text-gray-500">How does your team contact leads?</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {followUpOptions.map(option => {
            const isSelected = funnelData.followUpMethod.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleFollowUp(option.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {option.icon}
                </div>
                <span className="text-xs font-medium">{option.label}</span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => {
            updateData({
              products: services.map(s => ({ name: s.name, category: s.avgValue, priceRange: s.conversionTime })),
            });
            onNext();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
        >
          Complete Setup
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


// ===== Step 4b: Product Info (E-Commerce / Finance) =====
function ProductInfoStep({ businessType, onNext, onBack }: { businessType: BusinessType; onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();
  const isFinance = businessType === 'finance';
  const [products, setProducts] = useState([
    { name: '', category: '', priceRange: '', description: '' },
  ]);
  const [usps, setUsps] = useState<string[]>(['', '', '']);

  const updateProduct = (index: number, field: string, value: string) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const updateUsp = (index: number, value: string) => {
    setUsps(prev => prev.map((u, i) => i === index ? value : u));
  };

  const addProduct = () => {
    if (products.length < 5) {
      setProducts(prev => [...prev, { name: '', category: '', priceRange: '', description: '' }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>
          {isFinance ? 'Your products & services' : 'What are you selling?'}
        </h3>
        <p className="text-sm text-gray-500">
          {isFinance
            ? 'Understanding your product mix helps us categorize revenue streams and provide better financial insights.'
            : 'Knowing your products helps us optimize ad targeting, creative messaging, and landing page strategy.'}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {products.map((product, index) => (
          <div 
            key={index} 
            className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            style={{ animation: `slideUp 0.3s ease-out ${index * 0.1}s both` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {isFinance ? 'Service' : 'Product'} {index + 1}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{isFinance ? 'Service Name' : 'Product Name'}</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(index, 'name', e.target.value)}
                  placeholder={isFinance ? 'e.g., IT Consulting' : 'e.g., Premium Skincare Kit'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => updateProduct(index, 'category', e.target.value)}
                  placeholder={isFinance ? 'e.g., Professional Services' : 'e.g., Skincare'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price Range</label>
                <input
                  type="text"
                  value={product.priceRange}
                  onChange={(e) => updateProduct(index, 'priceRange', e.target.value)}
                  placeholder="e.g., Rs.500 - Rs.2,000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Brief Description</label>
              <textarea
                value={product.description}
                onChange={(e) => updateProduct(index, 'description', e.target.value)}
                placeholder={isFinance 
                  ? 'Describe this service offering briefly...' 
                  : 'What makes this product special? Key features, benefits...'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {products.length < 5 && (
        <button
          onClick={addProduct}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 mb-8"
        >
          + Add another {isFinance ? 'service' : 'product'}
        </button>
      )}

      {/* USPs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Unique Selling Points (USPs)</p>
            <p className="text-xs text-gray-500">What makes your business stand out?</p>
          </div>
        </div>
        <div className="space-y-2">
          {usps.map((usp, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4 text-center">{index + 1}.</span>
              <input
                type="text"
                value={usp}
                onChange={(e) => updateUsp(index, e.target.value)}
                placeholder={
                  index === 0 
                    ? 'e.g., Free shipping on all orders' 
                    : index === 1 
                      ? 'e.g., 100% organic ingredients' 
                      : 'e.g., 30-day money-back guarantee'
                }
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => {
            updateData({
              products: products.map(p => ({ name: p.name, category: p.category, priceRange: p.priceRange })),
            });
            onNext();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
        >
          Complete Setup
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}


// ===== Shared Upload Item Component for Finance Steps =====
type ItemStatus = 'uploaded' | 'need-time' | 'not-applicable' | 'pending';

interface UploadFileInfo {
  name: string;
  size: string;
}

interface OnboardingItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  accepts?: string;
  tag?: string;
}

function UploadItemRow({ 
  item, status, file, onUpload, onStatusChange, onRemoveFile, showNA = true
}: { 
  item: OnboardingItem;
  status: ItemStatus;
  file?: UploadFileInfo;
  onUpload: (id: string, file: File) => void;
  onStatusChange: (id: string, status: ItemStatus) => void;
  onRemoveFile: (id: string) => void;
  showNA?: boolean;
}) {
  const inputId = `file-${item.id}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onUpload(item.id, f);
    e.target.value = '';
  };

  if (status === 'uploaded' && file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 transition-all duration-200">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">{item.label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FileText className="w-3 h-3 text-emerald-500" />
            <span className="text-[13px] text-emerald-600 truncate">{file.name}</span>
            <span className="text-[10px] text-emerald-400">{file.size}</span>
          </div>
        </div>
        <button
          onClick={() => onRemoveFile(item.id)}
          className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors flex-shrink-0"
          title="Remove file"
        >
          <X className="w-3.5 h-3.5 text-emerald-400 hover:text-red-500" />
        </button>
      </div>
    );
  }

  if (status === 'need-time') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 transition-all duration-200">
        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 flex-shrink-0">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700">{item.label}</p>
          <p className="text-[13px] text-amber-500">Will provide later</p>
        </div>
        <button
          onClick={() => onStatusChange(item.id, 'pending')}
          className="text-[13px] text-amber-600 hover:text-amber-800 font-medium px-2 py-1 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
        >
          Undo
        </button>
      </div>
    );
  }

  if (status === 'not-applicable') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 line-through">{item.label}</p>
          <p className="text-[13px] text-gray-500">Not applicable</p>
        </div>
        <button
          onClick={() => onStatusChange(item.id, 'pending')}
          className="text-[13px] text-gray-500 hover:text-gray-600 font-medium px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          Undo
        </button>
      </div>
    );
  }

  // Default: pending — show upload + fallback actions
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-800">{item.label}</p>
          {item.tag && (
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-medium border border-amber-200">{item.tag}</span>
          )}
        </div>
        <p className="text-[13px] text-gray-500">{item.hint}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <label
          htmlFor={inputId}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-medium cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3 h-3" />
          Upload
        </label>
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept={item.accepts || '.pdf,.xlsx,.xls,.csv,.doc,.docx,.zip,.png,.jpg'}
          onChange={handleFileChange}
        />
        <button
          onClick={() => onStatusChange(item.id, 'need-time')}
          className="px-2 py-1.5 text-[13px] text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
          title="Will provide later"
        >
          Later
        </button>
        {showNA && (
          <button
            onClick={() => onStatusChange(item.id, 'not-applicable')}
            className="px-1.5 py-1.5 text-[13px] text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            title="Not applicable"
          >
            N/A
          </button>
        )}
      </div>
    </div>
  );
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}


// ===== Step 3 (Finance): Data Access — Portal Credentials (Inline Username/Password) =====
interface CredentialItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tag?: string;
  usernamePlaceholder?: string;
  passwordPlaceholder?: string;
}

type CredentialStatus = 'pending' | 'saved' | 'later';

interface CredentialData {
  username: string;
  password: string;
}

function DataAccessStep({ financeVariant = 'trading-manufacturing', onNext, onBack }: { financeVariant?: FinanceVariant; onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();
  const [statuses, setStatuses] = useState<Record<string, CredentialStatus>>({});
  const [credentials, setCredentials] = useState<Record<string, CredentialData>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  // Drafts for the currently-editing item so we can cancel without losing saved data
  const [draftCreds, setDraftCreds] = useState<CredentialData>({ username: '', password: '' });

  // ── Tax portals — shared across both finance variants ──
  const taxCompliancePortals: CredentialItem[] = [
    { id: 'gst-portal', label: 'GST Portal', hint: 'GSTR filing access', icon: <Receipt className="w-4 h-4" />, usernamePlaceholder: 'GST username or GSTIN', passwordPlaceholder: 'Portal password' },
    { id: 'tds-portal', label: 'TDS Portal', hint: 'TDS return e-filing', icon: <FileText className="w-4 h-4" />, usernamePlaceholder: 'TAN or login ID', passwordPlaceholder: 'Portal password' },
    { id: 'itr-login', label: 'Income Tax Portal', hint: 'ITR e-filing access', icon: <Landmark className="w-4 h-4" />, usernamePlaceholder: 'PAN or user ID', passwordPlaceholder: 'Portal password' },
    { id: 'pt-cpt', label: 'PT/CPT Portal', hint: 'PTEC & PTRC access', icon: <Building2 className="w-4 h-4" />, usernamePlaceholder: 'Enrollment number', passwordPlaceholder: 'Portal password' },
    { id: 'einvoice', label: 'E-Invoice Portal', hint: 'E-invoice generation', icon: <FileCheck className="w-4 h-4" />, usernamePlaceholder: 'Username or GSTIN', passwordPlaceholder: 'Portal password' },
  ];

  // ── Accounting software — shared ──
  const accountingSoftware: CredentialItem[] = [
    { id: 'tally', label: 'Tally Prime', hint: 'Tally / ERP access', icon: <BookOpen className="w-4 h-4" />, usernamePlaceholder: 'Tally login ID', passwordPlaceholder: 'Tally password' },
    { id: 'internal-software', label: 'Internal Software', hint: 'ERP, billing, or custom tools', icon: <Lock className="w-4 h-4" />, usernamePlaceholder: 'Login ID or email', passwordPlaceholder: 'Password' },
  ];

  // ── Variant A: E-Commerce / Restaurants — marketplace, POS, aggregator access ──
  const ecomRestaurantChannels: CredentialItem[] = [
    { id: 'ecommerce-portals', label: 'E-Commerce Portals', hint: 'Amazon Seller, Flipkart, Meesho, Myntra', icon: <ShoppingBag className="w-4 h-4" />, tag: 'E-COM', usernamePlaceholder: 'Seller ID or email', passwordPlaceholder: 'Password' },
    { id: 'shopify-admin', label: 'Shopify / Website Admin', hint: 'D2C store back-office', icon: <ShoppingCart className="w-4 h-4" />, usernamePlaceholder: 'Admin email', passwordPlaceholder: 'Password' },
    { id: 'food-aggregators', label: 'Food Aggregators', hint: 'Swiggy, Zomato restaurant partner portals', icon: <Wallet className="w-4 h-4" />, tag: 'FOOD', usernamePlaceholder: 'Partner login ID', passwordPlaceholder: 'Password' },
    { id: 'payment-gateway', label: 'Payment Gateway', hint: 'Razorpay, Stripe, Paytm, PayU', icon: <CreditCard className="w-4 h-4" />, usernamePlaceholder: 'Merchant login', passwordPlaceholder: 'Password' },
    { id: 'pos-system', label: 'POS System', hint: 'Petpooja, Posist, Square, Restaurant POS', icon: <ShoppingCart className="w-4 h-4" />, usernamePlaceholder: 'POS login ID', passwordPlaceholder: 'Password' },
    { id: 'delivery-partner', label: 'Delivery / COD Partners', hint: 'Shiprocket, Delhivery, Dunzo COD remittance', icon: <Banknote className="w-4 h-4" />, usernamePlaceholder: 'Login ID', passwordPlaceholder: 'Password' },
  ];

  // ── Variant B: Trading / Manufacturing / Services — E-way, vendor systems ──
  const tradingManufacturingChannels: CredentialItem[] = [
    { id: 'eway-bill', label: 'E-way Bill Portal', hint: 'Inter-state movement of goods', icon: <FileCheck className="w-4 h-4" />, tag: 'E-WAY', usernamePlaceholder: 'GSTIN or user ID', passwordPlaceholder: 'Portal password' },
    { id: 'vendor-portals', label: 'Vendor / B2B Portals', hint: 'IndiaMART, TradeIndia, buyer portals', icon: <Building2 className="w-4 h-4" />, usernamePlaceholder: 'Login ID', passwordPlaceholder: 'Password' },
    { id: 'banking-rtgs', label: 'Corporate Banking', hint: 'RTGS / NEFT / bulk payments', icon: <Landmark className="w-4 h-4" />, usernamePlaceholder: 'Corporate login ID', passwordPlaceholder: 'Password' },
    { id: 'payroll', label: 'Payroll System', hint: 'Keka, Zoho People, greytHR', icon: <Users className="w-4 h-4" />, usernamePlaceholder: 'Login ID or email', passwordPlaceholder: 'Password' },
    { id: 'service-portals', label: 'Client / Service Portals', hint: 'Professional services invoicing logins', icon: <Lock className="w-4 h-4" />, usernamePlaceholder: 'Login ID', passwordPlaceholder: 'Password' },
  ];

  const channelsSection =
    financeVariant === 'ecommerce-restaurants'
      ? { title: 'Marketplaces, Payments & POS', items: ecomRestaurantChannels }
      : { title: 'Logistics, Vendors & Banking', items: tradingManufacturingChannels };

  const sections: { title: string; items: CredentialItem[] }[] = [
    { title: 'Tax & Compliance Portals', items: taxCompliancePortals },
    { title: 'Accounting & Software', items: accountingSoftware },
    channelsSection,
  ];

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    // Load existing credentials into draft or start fresh
    const existing = credentials[id];
    setDraftCreds(existing ? { ...existing } : { username: '', password: '' });
    setExpandedId(id);
  };

  const handleSave = (id: string) => {
    if (!draftCreds.username.trim() || !draftCreds.password.trim()) return;
    setCredentials(prev => ({ ...prev, [id]: { ...draftCreds } }));
    setStatuses(prev => ({ ...prev, [id]: 'saved' }));
    setExpandedId(null);
  };

  const handleLater = (id: string) => {
    setStatuses(prev => ({ ...prev, [id]: 'later' }));
    if (expandedId === id) setExpandedId(null);
  };

  const handleEdit = (id: string) => {
    const existing = credentials[id];
    setDraftCreds(existing ? { ...existing } : { username: '', password: '' });
    setExpandedId(id);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const savedCount = Object.values(statuses).filter(s => s === 'saved').length;
  const laterCount = Object.values(statuses).filter(s => s === 'later').length;
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>
          Share your portal credentials
        </h3>
        <p className="text-sm text-gray-500">
          Enter the login details for each portal below. One place, fully encrypted — no more scattered credentials.
        </p>
      </div>

      {/* Security callout */}
      <div className="mb-6 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-xs text-blue-700">All credentials are <strong className="text-blue-800">encrypted & secure</strong>. Your data is never shared with third parties.</p>
      </div>

      {/* Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((section, sIndex) => (
          <div key={sIndex} style={{ animation: `slideUp 0.3s ease-out ${sIndex * 0.08}s both` }}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2.5 px-1">{section.title}</p>
            <div className="space-y-2">
              {section.items.map(item => {
                const status = statuses[item.id] || 'pending';
                const isExpanded = expandedId === item.id;
                const isPasswordVisible = showPasswords[item.id] || false;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? 'border-blue-200 bg-white shadow-lg shadow-blue-50/60 ring-1 ring-blue-100/50'
                        : status === 'saved'
                          ? 'border-green-200/80 bg-green-50/30 hover:border-green-300'
                          : status === 'later'
                            ? 'border-amber-200/60 bg-amber-50/20 hover:border-amber-300'
                            : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Collapsed row — always visible */}
                    <div
                      className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer select-none ${isExpanded ? '' : ''}`}
                      onClick={() => status === 'saved' ? handleEdit(item.id) : handleExpand(item.id)}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        status === 'saved'
                          ? 'bg-green-100 text-green-600'
                          : status === 'later'
                            ? 'bg-amber-100 text-amber-600'
                            : isExpanded
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.icon}
                      </div>

                      {/* Label & hint */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{item.label}</p>
                          {item.tag && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-medium">{item.tag}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
                      </div>

                      {/* Status indicator / actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {status === 'saved' && !isExpanded && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[13px] text-green-700 font-medium">Saved</span>
                          </div>
                        )}
                        {status === 'later' && !isExpanded && (
                          <span className="text-[13px] text-amber-500 font-medium px-2 py-1 bg-amber-50 rounded-lg">Later</span>
                        )}
                        {status === 'pending' && !isExpanded && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLater(item.id); }}
                            className="px-2 py-1.5 text-[13px] text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                          >
                            Later
                          </button>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded credential fields */}
                    {isExpanded && (
                      <div
                        className="px-4 pb-4 pt-1"
                        style={{ animation: 'credExpand 0.25s ease-out' }}
                      >
                        <div className="ml-[52px]">
                          {/* Credential inputs */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-[13px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Username</label>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  value={draftCreds.username}
                                  onChange={(e) => setDraftCreds(prev => ({ ...prev, username: e.target.value }))}
                                  placeholder={item.usernamePlaceholder || 'Username or ID'}
                                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-all placeholder:text-gray-300"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[13px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Password</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type={isPasswordVisible ? 'text' : 'password'}
                                  value={draftCreds.password}
                                  onChange={(e) => setDraftCreds(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder={item.passwordPlaceholder || 'Password'}
                                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-all placeholder:text-gray-300"
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(item.id); }}
                                />
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(item.id)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  tabIndex={-1}
                                >
                                  {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedId(null)}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-lg transition-colors font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSave(item.id)}
                                disabled={!draftCreds.username.trim() || !draftCreds.password.trim()}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                  draftCreds.username.trim() && draftCreds.password.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {(savedCount > 0 || laterCount > 0) && (
            <span className="text-[13px] text-gray-500">
              {savedCount > 0 && <span className="text-emerald-600">{savedCount} saved</span>}
              {savedCount > 0 && laterCount > 0 && ' · '}
              {laterCount > 0 && <span className="text-amber-500">{laterCount} later</span>}
              <span className="text-gray-300"> / {totalItems}</span>
            </span>
          )}
          <button
            onClick={() => {
              const portalCredentials: Record<string, { username: string; password: string; saved: boolean }> = {};
              Object.entries(credentials).forEach(([id, cred]) => {
                portalCredentials[id] = { username: cred.username, password: cred.password, saved: statuses[id] === 'saved' };
              });
              updateData({ portalCredentials });
              onNext();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
          >
            Continue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes credExpand {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


// ===== Step 4 (Finance): Documents & Data =====
function DocumentsDataStep({ financeVariant = 'trading-manufacturing', onNext, onBack }: { financeVariant?: FinanceVariant; onNext: () => void; onBack: () => void }) {
  const { updateData } = useOnboardingData();
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [files, setFiles] = useState<Record<string, UploadFileInfo>>({});

  const handleUpload = (id: string, file: File) => {
    setFiles(prev => ({ ...prev, [id]: { name: file.name, size: formatFileSize(file.size) } }));
    setStatuses(prev => ({ ...prev, [id]: 'uploaded' }));
  };

  const handleStatusChange = (id: string, status: ItemStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
    if (status === 'pending') {
      setFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
  };

  // ── Financial statements — shared across both variants ──
  const financialStatementItems: OnboardingItem[] = [
    { id: 'audited-fs', label: 'Audited Financial Statement', hint: 'Latest audited P&L and Balance Sheet', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'tally-backup', label: 'Latest Tally Backup', hint: 'Most recent Tally data backup (.tbk)', icon: <Database className="w-4 h-4" />, accepts: '.tbk,.zip,.rar' },
    { id: 'company-docs', label: 'Company / LLP Document', hint: 'Incorporation cert, MOA/AOA', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bank-statement', label: 'Latest Bank Statement', hint: 'Current A/C statements (last 6 months)', icon: <Landmark className="w-4 h-4" /> },
  ];

  // ── Tax & compliance — shared ──
  const taxComplianceItems: OnboardingItem[] = [
    { id: 'tds-gst-workings', label: 'Past TDS & GST Workings', hint: 'Previous period computation sheets', icon: <FileText className="w-4 h-4" /> },
    { id: 'nbfc', label: 'NBFC Loan Repayment Schedule', hint: 'Loan statement or repayment schedule', icon: <Receipt className="w-4 h-4" /> },
  ];

  // ── Variant A: E-Commerce / Restaurants ──
  const ecomRestaurantRevenueItems: OnboardingItem[] = [
    { id: 'marketplace-settlements', label: 'Marketplace Settlement Reports', hint: 'Amazon, Flipkart, Meesho — last 12 months', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'aggregator-payouts', label: 'Food Aggregator Payouts', hint: 'Swiggy / Zomato payout statements', icon: <Wallet className="w-4 h-4" /> },
    { id: 'pg-settlement', label: 'Payment Gateway Settlement', hint: 'Razorpay, Stripe, Paytm settlement files', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'pos-reports', label: 'POS Daily Sales Reports', hint: 'Petpooja, Posist, restaurant POS exports', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'shopify-orders', label: 'Shopify / D2C Orders Export', hint: 'Orders, refunds & discounts CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];
  const ecomRestaurantExpenseItems: OnboardingItem[] = [
    { id: 'purchase-expense', label: 'Purchase / Expense Data', hint: 'Vendor invoices, purchase registers', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'cod-remittance', label: 'COD Remittance Data', hint: 'Shiprocket, Delhivery, Dunzo COD reports', icon: <Banknote className="w-4 h-4" /> },
    { id: 'ad-spends', label: 'Ad Spend Invoices', hint: 'Meta, Google & marketplace ads billing', icon: <Receipt className="w-4 h-4" /> },
    { id: 'credit-card', label: 'Credit Card Statement', hint: 'Business credit card statements', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'salary-register', label: 'Salary Register', hint: 'Monthly payroll & salary breakdowns', icon: <Users className="w-4 h-4" /> },
    { id: 'petty-cash', label: 'Petty Cash Register', hint: 'Store, kitchen & miscellaneous cash expenses', icon: <Wallet className="w-4 h-4" /> },
  ];

  // ── Variant B: Trading / Manufacturing / Services ──
  const tradingManufacturingRevenueItems: OnboardingItem[] = [
    { id: 'sales-register', label: 'Sales Register', hint: 'Sales invoices & party-wise revenue register', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'debtor-ageing', label: 'Debtor Ageing / Outstanding', hint: 'Party-wise receivables statement', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'service-agreements', label: 'Client / Service Agreements', hint: 'Contracts & SOWs for recurring revenue', icon: <FileText className="w-4 h-4" /> },
  ];
  const tradingManufacturingExpenseItems: OnboardingItem[] = [
    { id: 'purchase-register', label: 'Purchase Register', hint: 'Vendor invoices & GRNs', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'debit-credit-notes', label: 'Debit / Credit Notes', hint: 'Purchase returns, rate differences', icon: <Receipt className="w-4 h-4" /> },
    { id: 'stock-ledger', label: 'Stock / Inventory Ledger', hint: 'Warehouse stock valuation register', icon: <Database className="w-4 h-4" /> },
    { id: 'jobwork-register', label: 'Job-Work Register', hint: 'Movement of goods & labour charges', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'salary-register', label: 'Salary Register', hint: 'Monthly payroll & salary breakdowns', icon: <Users className="w-4 h-4" /> },
    { id: 'petty-cash', label: 'Petty Cash Register', hint: 'Factory / office miscellaneous cash expenses', icon: <Wallet className="w-4 h-4" /> },
  ];

  const isEcom = financeVariant === 'ecommerce-restaurants';
  const sections: { title: string; items: OnboardingItem[] }[] = [
    { title: 'Financial Statements', items: financialStatementItems },
    { title: 'Tax & Compliance', items: taxComplianceItems },
    {
      title: isEcom ? 'Revenue & Channel Data' : 'Revenue',
      items: isEcom ? ecomRestaurantRevenueItems : tradingManufacturingRevenueItems,
    },
    {
      title: isEcom ? 'Expense & Operations' : 'Purchases, Stock & Operations',
      items: isEcom ? ecomRestaurantExpenseItems : tradingManufacturingExpenseItems,
    },
  ];

  const uploadedCount = Object.values(statuses).filter(s => s === 'uploaded').length;
  const laterCount = Object.values(statuses).filter(s => s === 'need-time').length;
  const naCount = Object.values(statuses).filter(s => s === 'not-applicable').length;
  const actionedCount = uploadedCount + laterCount + naCount;
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>
          Upload your documents
        </h3>
        <p className="text-sm text-gray-500">
          Everything in one place — upload PDFs, Excel sheets, or any file format. No more chasing documents across WhatsApp and email.
        </p>
      </div>

      {/* Value prop callout */}
      <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/80 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-xs text-emerald-700">Upload what you have now, mark the rest as <strong className="text-emerald-800">"Later"</strong>. We'll follow up on pending items.</p>
      </div>

      {/* Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((section, sIndex) => (
          <div key={sIndex} style={{ animation: `slideUp 0.3s ease-out ${sIndex * 0.08}s both` }}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2.5 px-1">{section.title}</p>
            <div className="space-y-2">
              {section.items.map(item => (
                <UploadItemRow
                  key={item.id}
                  item={item}
                  status={statuses[item.id] || 'pending'}
                  file={files[item.id]}
                  onUpload={handleUpload}
                  onStatusChange={handleStatusChange}
                  onRemoveFile={handleRemoveFile}
                  showNA={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress summary */}
      {actionedCount > 0 && (
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${(actionedCount / totalItems) * 100}%` }} 
            />
          </div>
          <span className="text-[13px] text-gray-500 flex-shrink-0">{actionedCount}/{totalItems}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {actionedCount > 0 && (
            <span className="text-[13px] text-gray-500">
              {uploadedCount > 0 && <span className="text-emerald-600">{uploadedCount} uploaded</span>}
              {uploadedCount > 0 && laterCount > 0 && ' · '}
              {laterCount > 0 && <span className="text-amber-500">{laterCount} later</span>}
            </span>
          )}
          <button
            onClick={() => {
              const uploadedDocuments: Record<string, boolean> = {};
              Object.entries(statuses).forEach(([id, status]) => {
                uploadedDocuments[id] = status === 'uploaded';
              });
              updateData({ uploadedDocuments });
              onNext();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/20"
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}


// CompletionStep removed — flow now completes directly after the last onboarding step.
