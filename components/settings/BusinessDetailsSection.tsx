'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInfo } from '../../types';
import { useOnboardingData } from '../context/OnboardingDataContext';
import { toast, Toaster } from 'sonner';
import {
  Building2, Globe, Target, MapPin, IndianRupee, ChevronDown,
  Briefcase, FileText, Users, Package, Shield, Phone,
  CheckCircle2, Pencil, X, Save, BarChart3,
  Receipt, Landmark, CreditCard, ShoppingBag,
  Megaphone, Filter as FilterIcon, Star, BookOpen,
  Check, TrendingUp, Lock, Clock, Send as SendIcon, ShieldCheck, Timer,
} from 'lucide-react';

// 24-hour expiry in production. Using 90s for demo so expiry is visible.
// To switch to real 24h: const ACCESS_EXPIRY_MS = 24 * 60 * 60 * 1000;
const ACCESS_EXPIRY_MS = 90 * 1000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Stagger animation wrapper ──
function StaggerItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

type ServiceType = 'marketing-ecommerce' | 'marketing-leadgen' | 'finance';
type EditAccessStatus = 'locked' | 'requesting' | 'pending' | 'granted';
type SectionKey = 'overview' | 'marketing' | 'finance' | 'competitors' | 'products';

interface BusinessDetailsSectionProps {
  userInfo: UserInfo;
  businessAccounts?: { id: string; service: 'Performance Marketing' | 'Accounts & Taxation' }[];
}

function deriveServiceType(userInfo: UserInfo): ServiceType {
  if (userInfo.selectedService === 'Accounts & Taxation') return 'finance';
  if (userInfo.businessModel === 'leadgen' || userInfo.goal === 'Generate Leads') return 'marketing-leadgen';
  return 'marketing-ecommerce';
}

function getServiceLabel(type: ServiceType): string {
  switch (type) {
    case 'finance': return 'Accounts & Taxation';
    case 'marketing-leadgen': return 'Performance Marketing — Lead Gen';
    case 'marketing-ecommerce': return 'Performance Marketing — E-Commerce';
  }
}

function getServiceShortLabel(type: ServiceType): string {
  switch (type) {
    case 'finance': return 'Accounts & Taxation';
    case 'marketing-leadgen': return 'Performance Marketing';
    case 'marketing-ecommerce': return 'Performance Marketing';
  }
}

function getServiceDescription(type: ServiceType): string {
  switch (type) {
    case 'finance': return 'GST, ITR, compliance & tax management';
    case 'marketing-leadgen': return 'Lead generation campaigns & optimization';
    case 'marketing-ecommerce': return 'E-commerce ads, ROAS & sales growth';
  }
}

function getServiceColor(type: ServiceType) {
  switch (type) {
    case 'finance': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'marketing-leadgen': return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' };
    case 'marketing-ecommerce': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
  }
}

const industryMap: Record<string, string> = {
  ecommerce: 'E-Commerce', saas: 'SaaS / Technology', retail: 'Retail', fmcg: 'FMCG',
  healthcare: 'Healthcare', education: 'Education', realestate: 'Real Estate',
  restaurant: 'Restaurant / F&B', manufacturing: 'Manufacturing', trading: 'Trading',
  services: 'Professional Services', other: 'Other',
};

const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-all duration-200';
const selectCls = `${inputCls} appearance-none`;

// ── Collapsible Section ──
function CollapsibleSection({
  title, icon, iconBg, badge, defaultOpen = false, children
}: {
  title: string; icon: React.ReactNode; iconBg: string; badge?: React.ReactNode;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50/60 transition-colors duration-200 cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex-1 text-left">{title}</span>
        {badge}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-gray-500 uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-sm text-gray-800">{value || '\u2014'}</span>
      </div>
    </div>
  );
}

function EditableField({
  label, value, onChange, placeholder, icon, type = 'text', options
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
  icon?: React.ReactNode; type?: 'text' | 'select' | 'multiselect'; options?: { value: string; label: string }[];
}) {
  const [multiOpen, setMultiOpen] = useState(false);
  const selectedItems = type === 'multiselect' && value ? value.split(', ').filter(Boolean) : [];

  const toggleItem = (item: string) => {
    const updated = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    onChange(updated.join(', '));
  };

  const removeItem = (item: string) => {
    onChange(selectedItems.filter(i => i !== item).join(', '));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {type === 'multiselect' && options ? (
        <div className="relative">
          <div
            onClick={() => setMultiOpen(!multiOpen)}
            className={`${inputCls} ${icon ? 'pl-9' : ''} pr-8 cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1.5`}
          >
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${multiOpen ? 'rotate-180' : ''}`} />
            {selectedItems.length === 0 ? (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            ) : (
              selectedItems.map(item => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md"
                >
                  {item}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-blue-900"
                    onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                  />
                </span>
              ))
            )}
          </div>
          {multiOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMultiOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto py-1">
                {options.map(o => (
                  <div
                    key={o.value}
                    onClick={() => toggleItem(o.value)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                      selectedItems.includes(o.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selectedItems.includes(o.value) ? 'bg-[#204CC7] border-[#204CC7]' : 'border-gray-300'
                    }`}>
                      {selectedItems.includes(o.value) && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {o.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : type === 'select' && options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputCls} ${icon ? 'pl-9' : ''}`}
          />
        </div>
      )}
    </div>
  );
}

function CompetitorRow({ index, name, website }: { index: number; name: string; website: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-gray-500">{index}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{name || 'Not specified'}</p>
        {website && <p className="text-xs text-gray-400 truncate">{website}</p>}
      </div>
    </div>
  );
}

// ── Service Switcher Pill Dropdown ──
function ServiceSwitcherPill({
  activeService, availableServices, isOpen, onToggle, onSelect, dropdownRef
}: {
  activeService: ServiceType;
  availableServices: ServiceType[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (s: ServiceType) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const color = getServiceColor(activeService);
  const label = getServiceLabel(activeService);
  const hasMultiple = availableServices.length > 1;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={hasMultiple ? onToggle : undefined}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 ${color.bg} ${color.border} ${
          hasMultiple ? 'cursor-pointer hover:shadow-sm active:scale-[0.97]' : 'cursor-default'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${color.dot}`} />
        <span className={`text-xs font-semibold ${color.text} whitespace-nowrap`}>{label}</span>
        {hasMultiple && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown className={`w-3 h-3 ${color.text} opacity-60`} />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && hasMultiple && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-900/8 overflow-hidden min-w-[220px]"
          >
            <div className="p-1.5">
              {availableServices.map((svc) => {
                const svcColor = getServiceColor(svc);
                const svcLabel = getServiceLabel(svc);
                const isActive = svc === activeService;
                const SvcIcon = svc === 'finance' ? FileText : TrendingUp;
                const svcDesc = getServiceDescription(svc);
                return (
                  <button
                    key={svc}
                    onClick={() => onSelect(svc)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 ${
                      isActive ? 'bg-gray-50' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${svcColor.bg} flex items-center justify-center flex-shrink-0`}>
                      <SvcIcon className={`w-3.5 h-3.5 ${svcColor.text}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{svcLabel}</p>
                      <p className="text-[10px] text-gray-400 truncate">{svcDesc}</p>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BusinessDetailsSection({ userInfo, businessAccounts }: BusinessDetailsSectionProps) {
  const { data: ctxData, updateData, hasData } = useOnboardingData();
  const defaultServiceType = deriveServiceType(userInfo);

  // ── Multi-service switcher ──
  // Detect both services from: (a) businessAccounts prop, (b) userInfo data fields, (c) onboarding context
  const accountHasMarketing = businessAccounts?.some(a => a.service === 'Performance Marketing') ?? false;
  const accountHasFinance = businessAccounts?.some(a => a.service === 'Accounts & Taxation') ?? false;
  const hasMarketingData = accountHasMarketing || !!(userInfo.goal || userInfo.adSpendRange || userInfo.businessModel);
  const hasFinanceData = accountHasFinance || !!(userInfo.businessType || userInfo.revenueRange || userInfo.accountingSoftware);
  const hasBothServices = hasMarketingData && hasFinanceData;

  // Determine the marketing sub-type from accounts or userInfo
  const marketingSubType: ServiceType = (() => {
    if (defaultServiceType === 'marketing-leadgen' || defaultServiceType === 'marketing-ecommerce') return defaultServiceType;
    // If default is finance but we also have marketing via accounts, infer sub-type
    if (userInfo.businessModel === 'leadgen' || userInfo.goal === 'Generate Leads') return 'marketing-leadgen';
    return 'marketing-ecommerce';
  })();

  const availableServices: ServiceType[] = hasBothServices
    ? (defaultServiceType === 'finance'
        ? ['finance', marketingSubType]
        : [marketingSubType, 'finance'])
    : [defaultServiceType];
  const [activeServiceType, setActiveServiceType] = useState<ServiceType>(defaultServiceType);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleServiceSwitch = (svc: ServiceType) => {
    setActiveServiceType(svc);
    setIsServiceDropdownOpen(false);
    // Close any open edit modes when switching
    setEditingOverview(false);
    setEditingMarketing(false);
    setEditingFinance(false);
    setEditingCompetitors(false);
    setEditingProducts(false);
    toast.success(`Switched to ${getServiceLabel(svc)}`, { duration: 2000 });
  };

  const serviceType = activeServiceType;
  const serviceColor = getServiceColor(activeServiceType);
  const serviceLabel = getServiceLabel(activeServiceType);

  const resolvedIndustry = userInfo.industry
    ? (industryMap[userInfo.industry] || userInfo.industry)
    : (userInfo.businessType || '');

  const [editingOverview, setEditingOverview] = useState(false);
  const [overview, setOverview] = useState({
    companyName: ctxData.companyName || userInfo.companyName || '',
    website: ctxData.website || userInfo.companyWebsite || '',
    industry: ctxData.industry || userInfo.industry || '',
  });

  const [editingMarketing, setEditingMarketing] = useState(false);
  const [marketingConfig, setMarketingConfig] = useState({
    monthlyBudget: ctxData.monthlyBudget || userInfo.adSpendRange || '',
    primaryGoal: ctxData.primaryGoal || userInfo.goal || '',
    targetAudience: ctxData.targetAudience || '',
    targetLocation: ctxData.targetLocation || '',
    primaryService: ctxData.primaryService || '',
    serviceAreas: ctxData.serviceAreas || '',
    avgDealValue: ctxData.avgDealValue || '',
    leadVolumeTarget: ctxData.leadVolumeTarget || '',
  });

  const [editingFinance, setEditingFinance] = useState(false);
  const [financeConfig, setFinanceConfig] = useState({
    gstNumber: ctxData.gstNumber || '',
    panNumber: ctxData.panNumber || '',
    financialYear: ctxData.financialYear || '2025-26',
    revenueRange: ctxData.revenueRange || userInfo.revenueRange || '',
    accountingSoftware: ctxData.accountingSoftware || userInfo.accountingSoftware || '',
  });

  const [editingCompetitors, setEditingCompetitors] = useState(false);
  const [competitors, setCompetitors] = useState(
    ctxData.competitors && ctxData.competitors.some((c: any) => c.name)
      ? ctxData.competitors
      : [{ name: '', website: '', offering: '' }, { name: '', website: '', offering: '' }, { name: '', website: '', offering: '' }]
  );

  const [editingProducts, setEditingProducts] = useState(false);
  const [products, setProducts] = useState(
    ctxData.products && ctxData.products.some((p: any) => p.name)
      ? ctxData.products
      : [{ name: '', category: '', priceRange: '' }]
  );

  const portalCredMap = ctxData.portalCredentials || {};
  const portalItems = [
    { id: 'gst-portal', label: 'GST Portal' },
    { id: 'itr-login', label: 'Income Tax Portal' },
    { id: 'tds-portal', label: 'TDS Portal' },
    { id: 'einvoice', label: 'E-Invoice Portal' },
  ];
  const portalStatuses = portalItems.map(p => ({
    id: p.id, label: p.label,
    status: (portalCredMap[p.id]?.saved ? 'saved' : 'pending') as 'saved' | 'pending',
  }));

  const uploadedDocsMap = ctxData.uploadedDocuments || {};
  const docItems = [
    { id: 'audited-fs', label: 'Audited Financial Statement' },
    { id: 'tally-backup', label: 'Latest Tally Backup' },
    { id: 'company-docs', label: 'Company / LLP Document' },
    { id: 'tds-gst-workings', label: 'Past TDS & GST Workings' },
  ];
  const docStatuses = docItems.map(d => ({
    label: d.label,
    status: (uploadedDocsMap[d.id] ? 'uploaded' : 'pending') as 'uploaded' | 'pending',
  }));

  useEffect(() => {
    if (!hasData) return;
    setOverview({ companyName: ctxData.companyName || userInfo.companyName || '', website: ctxData.website || userInfo.companyWebsite || '', industry: ctxData.industry || userInfo.industry || '' });
    setMarketingConfig({ monthlyBudget: ctxData.monthlyBudget || userInfo.adSpendRange || '', primaryGoal: ctxData.primaryGoal || userInfo.goal || '', targetAudience: ctxData.targetAudience || '', targetLocation: ctxData.targetLocation || '', primaryService: ctxData.primaryService || '', serviceAreas: ctxData.serviceAreas || '', avgDealValue: ctxData.avgDealValue || '', leadVolumeTarget: ctxData.leadVolumeTarget || '' });
    setFinanceConfig({ gstNumber: ctxData.gstNumber || '', panNumber: ctxData.panNumber || '', financialYear: ctxData.financialYear || '2025-26', revenueRange: ctxData.revenueRange || userInfo.revenueRange || '', accountingSoftware: ctxData.accountingSoftware || userInfo.accountingSoftware || '' });
    if (ctxData.competitors && ctxData.competitors.some((c: any) => c.name)) setCompetitors(ctxData.competitors);
    if (ctxData.products && ctxData.products.some((p: any) => p.name)) setProducts(ctxData.products);
  }, [hasData]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionLabels: Record<string, string> = {
    overview: 'Business Overview', marketing: 'Marketing Configuration', finance: 'Compliance & Tax Details',
    competitors: 'Competitors', products: serviceType === 'marketing-leadgen' ? 'Service Catalog' : 'Products & Services',
  };
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // ── Request Access state ──
  const [editAccess, setEditAccess] = useState<Record<SectionKey, EditAccessStatus>>({
    overview: 'locked',
    marketing: 'locked',
    finance: 'locked',
    competitors: 'locked',
    products: 'locked',
  });
  const [grantTimestamps, setGrantTimestamps] = useState<Record<SectionKey, number | null>>({
    overview: null, marketing: null, finance: null, competitors: null, products: null,
  });
  const [remainingTime, setRemainingTime] = useState<Record<SectionKey, number>>({
    overview: 0, marketing: 0, finance: 0, competitors: 0, products: 0,
  });
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalSection, setRequestModalSection] = useState<SectionKey>('overview');
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const requestReasonOptions = [
    'Updated business information',
    'Incorrect data entered during onboarding',
    'Business pivot / strategy change',
    'Adding new products or services',
    'Other',
  ];

  // ── Expiry countdown ticker ──
  const revokeAccess = useCallback((section: SectionKey) => {
    // Close editing if that section is currently being edited
    if (section === 'overview') setEditingOverview(false);
    if (section === 'marketing') setEditingMarketing(false);
    if (section === 'finance') setEditingFinance(false);
    if (section === 'competitors') setEditingCompetitors(false);
    if (section === 'products') setEditingProducts(false);

    setEditAccess(prev => ({ ...prev, [section]: 'locked' }));
    setGrantTimestamps(prev => ({ ...prev, [section]: null }));
    setRemainingTime(prev => ({ ...prev, [section]: 0 }));
    toast('Edit access expired', {
      description: `Your editing window for "${sectionLabels[section]}" has ended. Request again if needed.`,
      duration: 5000,
    });
  }, [sectionLabels]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const hasAnyGranted = Object.values(editAccess).some(s => s === 'granted');
    if (!hasAnyGranted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const sections: SectionKey[] = ['overview', 'marketing', 'finance', 'competitors', 'products'];
      const newRemaining: Record<string, number> = {};
      sections.forEach(key => {
        const ts = grantTimestamps[key];
        if (editAccess[key] === 'granted' && ts) {
          const elapsed = now - ts;
          const left = Math.max(0, ACCESS_EXPIRY_MS - elapsed);
          newRemaining[key] = left;
          if (left <= 0) {
            revokeAccess(key);
          }
        } else {
          newRemaining[key] = 0;
        }
      });
      setRemainingTime(prev => ({ ...prev, ...newRemaining }));
    }, 1000);

    return () => clearInterval(interval);
  }, [editAccess, grantTimestamps, revokeAccess]);

  const handleRequestAccess = (section: SectionKey) => {
    setRequestModalSection(section);
    setRequestReason('');
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!requestReason.trim()) return;
    setRequestSubmitting(true);
    setTimeout(() => {
      setEditAccess(prev => ({ ...prev, [requestModalSection]: 'pending' }));
      setRequestSubmitting(false);
      setRequestModalOpen(false);
      toast.success('Edit access requested', {
        description: `Your request for "${sectionLabels[requestModalSection]}" has been sent to your Brego account manager.`,
        duration: 4000,
      });
      // Auto-approve after 6 seconds for demo
      const sectionToApprove = requestModalSection;
      setTimeout(() => {
        setEditAccess(prev => {
          if (prev[sectionToApprove] !== 'pending') return prev;
          return { ...prev, [sectionToApprove]: 'granted' };
        });
        const grantTime = Date.now();
        setGrantTimestamps(prev => ({ ...prev, [sectionToApprove]: grantTime }));
        setRemainingTime(prev => ({ ...prev, [sectionToApprove]: ACCESS_EXPIRY_MS }));
        toast.success('Edit access granted', {
          description: `You can now edit "${sectionLabels[sectionToApprove]}". Access expires in ${formatCountdown(ACCESS_EXPIRY_MS)}.`,
          duration: 5000,
        });
      }, 6000);
    }, 1200);
  };

  const handleSave = (doneFn: () => void, section?: string) => {
    setSaveStatus('saving');
    setTimeout(() => {
      if (section === 'overview') updateData({ companyName: overview.companyName, website: overview.website, industry: overview.industry });
      else if (section === 'marketing') updateData({ monthlyBudget: marketingConfig.monthlyBudget, primaryGoal: marketingConfig.primaryGoal, targetAudience: marketingConfig.targetAudience, targetLocation: marketingConfig.targetLocation, primaryService: marketingConfig.primaryService, serviceAreas: marketingConfig.serviceAreas, avgDealValue: marketingConfig.avgDealValue, leadVolumeTarget: marketingConfig.leadVolumeTarget });
      else if (section === 'finance') updateData({ gstNumber: financeConfig.gstNumber, panNumber: financeConfig.panNumber, financialYear: financeConfig.financialYear, revenueRange: financeConfig.revenueRange, accountingSoftware: financeConfig.accountingSoftware });
      else if (section === 'competitors') updateData({ competitors });
      else if (section === 'products') updateData({ products });
      setSaveStatus('saved');
      doneFn();
      toast.success(`${section ? sectionLabels[section] || 'Section' : 'Section'} updated`, { description: 'Your changes have been saved.', duration: 2500 });
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 800);
  };

  const EditToggleBtn = ({ editing, onToggle, onSave, sectionKey }: { editing: boolean; onToggle: () => void; onSave: () => void; sectionKey: SectionKey }) => {
    const access = editAccess[sectionKey];
    const timeLeft = remainingTime[sectionKey] || 0;
    const expiryPct = grantTimestamps[sectionKey] ? Math.max(0, Math.min(100, (timeLeft / ACCESS_EXPIRY_MS) * 100)) : 0;
    // Urgency colors: green > 50%, amber 20-50%, red < 20%
    const urgencyColor = expiryPct > 50 ? 'text-emerald-600' : expiryPct > 20 ? 'text-amber-600' : 'text-red-500';
    const urgencyBg = expiryPct > 50 ? 'bg-emerald-50 border-emerald-200' : expiryPct > 20 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
    const urgencyIcon = expiryPct > 50 ? 'text-emerald-500' : expiryPct > 20 ? 'text-amber-500' : 'text-red-400';

    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {access === 'granted' && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${urgencyBg}`} title={`Edit access expires in ${formatCountdown(timeLeft)}`}>
            <Timer className={`w-3 h-3 ${urgencyIcon} ${expiryPct <= 20 ? 'animate-pulse' : ''}`} />
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', fontVariantNumeric: 'tabular-nums' }} className={`${urgencyColor} whitespace-nowrap`}>
              {formatCountdown(timeLeft)}
            </span>
          </div>
        )}
        {access === 'granted' && editing ? (
          <div className="flex items-center gap-1.5">
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Cancel" aria-label="Cancel editing"><X className="w-3.5 h-3.5 text-gray-400" /></button>
            <button onClick={onSave} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors" title="Save" aria-label="Save changes"><Save className="w-3.5 h-3.5 text-blue-600" /></button>
          </div>
        ) : access === 'granted' ? (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Edit" aria-label="Edit section"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
        ) : access === 'pending' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-amber-600 whitespace-nowrap">Pending</span>
          </div>
        ) : (
          <button
            onClick={() => handleRequestAccess(sectionKey)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
            title="Request edit access"
            aria-label="Request edit access"
          >
            <Lock className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-gray-500 group-hover:text-blue-600 whitespace-nowrap transition-colors">Request Edit</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-6">
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(229,231,235,0.8)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: '14px', fontFamily: 'Manrope, sans-serif', fontSize: '13px', color: '#1f2937' } }} />

      {/* Header */}
      <StaggerItem index={0}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Business Details</h1>
            <p className="text-sm text-gray-500">Your onboarding data and business configuration in one place</p>
          </div>
          <ServiceSwitcherPill
            activeService={activeServiceType}
            availableServices={availableServices}
            isOpen={isServiceDropdownOpen}
            onToggle={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            onSelect={handleServiceSwitch}
            dropdownRef={serviceDropdownRef}
          />
        </div>
      </StaggerItem>

      {/* Edit Access Info Banner */}
      <StaggerItem index={0}>
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/60 border border-blue-100 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-blue-800">
              Editing business details requires approval from your Brego account manager
            </p>
            <p style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-blue-600/70 mt-0.5">
              Click &ldquo;Request Edit&rdquo; on any section to submit a request. Once approved, you&rsquo;ll have a limited editing window before access reverts.
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* Request Access Modal */}
      <AnimatePresence>
        {requestModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => { if (!requestSubmitting) setRequestModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl border border-gray-200 w-full max-w-[440px] mx-4 overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }} className="text-gray-900">
                      Request Edit Access
                    </h2>
                    <p style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-500">
                      {sectionLabels[requestModalSection]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 pb-4">
                <p style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className="text-gray-600 mb-4">
                  To maintain data accuracy, changes to business details require approval. Select a reason and your account manager will review the request.
                </p>

                {/* Reason Selection */}
                <label style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }} className="text-gray-700 block mb-2">
                  Reason for editing
                </label>
                <div className="space-y-2 mb-4">
                  {requestReasonOptions.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRequestReason(reason)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                        requestReason === reason
                          ? 'border-blue-300 bg-blue-50/70 ring-1 ring-blue-200'
                          : 'border-gray-200 bg-white hover:bg-gray-50/60 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        requestReason === reason ? 'border-[#204CC7] bg-[#204CC7]' : 'border-gray-300'
                      }`}>
                        {requestReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Manrope, sans-serif' }} className={requestReason === reason ? 'text-blue-800' : 'text-gray-700'}>
                        {reason}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRequestModalOpen(false)}
                  disabled={requestSubmitting}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!requestReason || requestSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif',
                    background: requestReason && !requestSubmitting ? '#204CC7' : '#9CA3AF',
                  }}
                >
                  {requestSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Business Overview */}
      <StaggerItem index={1}>
        <CollapsibleSection title="Business Overview" icon={<Building2 className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-50" defaultOpen={true}
          badge={<EditToggleBtn editing={editingOverview} onToggle={() => setEditingOverview(!editingOverview)} onSave={() => handleSave(() => setEditingOverview(false), 'overview')} sectionKey="overview" />}>
          <AnimatePresence mode="wait">
            {editingOverview ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-4 mt-3">
                <EditableField label="Company Name" value={overview.companyName} onChange={(v) => setOverview(p => ({ ...p, companyName: v }))} placeholder="Enter company name" icon={<Building2 className="w-4 h-4 text-gray-400" />} />
                <EditableField label="Website" value={overview.website} onChange={(v) => setOverview(p => ({ ...p, website: v }))} placeholder="https://example.com" icon={<Globe className="w-4 h-4 text-gray-400" />} />
                <div className="col-span-2">
                  <EditableField label="Industry" value={overview.industry} onChange={(v) => setOverview(p => ({ ...p, industry: v }))} placeholder="Select industry" type="select" options={Object.entries(industryMap).map(([v, l]) => ({ value: v, label: l }))} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-x-5 gap-y-4 mt-3">
                <InfoRow label="Company Name" value={overview.companyName || userInfo.companyName} icon={<Building2 className="w-3.5 h-3.5" />} />
                <InfoRow label="Website" value={overview.website || userInfo.companyWebsite || ''} icon={<Globe className="w-3.5 h-3.5" />} />
                <InfoRow label="Industry" value={industryMap[overview.industry] || resolvedIndustry} icon={<Briefcase className="w-3.5 h-3.5" />} />
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleSection>
      </StaggerItem>

      {/* 2. Service-specific configuration - animated transition */}
      <AnimatePresence mode="wait">
        <motion.div key={serviceType} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <div className="space-y-5">
            <StaggerItem index={2}>
              {serviceType === 'finance' ? (
                <CollapsibleSection title="Compliance & Tax Details" icon={<Shield className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-50" defaultOpen={true}
                  badge={<EditToggleBtn editing={editingFinance} onToggle={() => setEditingFinance(!editingFinance)} onSave={() => handleSave(() => setEditingFinance(false), 'finance')} sectionKey="finance" />}>
                  <AnimatePresence mode="wait">
                    {editingFinance ? (
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-4 mt-3">
                        <EditableField label="GST Number" value={financeConfig.gstNumber} onChange={(v) => setFinanceConfig(p => ({ ...p, gstNumber: v }))} placeholder="22AAAAA0000A1Z5" />
                        <EditableField label="PAN Number" value={financeConfig.panNumber} onChange={(v) => setFinanceConfig(p => ({ ...p, panNumber: v }))} placeholder="AAAPZ1234C" />
                        <EditableField label="Financial Year" value={financeConfig.financialYear} onChange={(v) => setFinanceConfig(p => ({ ...p, financialYear: v }))} placeholder="Select FY" type="select" options={[{ value: '2025-26', label: 'FY 2025-26 (Apr 2025 - Mar 2026)' }, { value: '2024-25', label: 'FY 2024-25 (Apr 2024 - Mar 2025)' }]} />
                        <EditableField label="Revenue Range" value={financeConfig.revenueRange} onChange={(v) => setFinanceConfig(p => ({ ...p, revenueRange: v }))} placeholder="Select range" type="select" options={[{ value: '< \u20B950L', label: 'Under \u20B950 Lakhs' }, { value: '\u20B950L - \u20B92Cr', label: '\u20B950L - \u20B92 Crore' }, { value: '\u20B92Cr - \u20B910Cr', label: '\u20B92Cr - \u20B910 Crore' }, { value: '\u20B910Cr+', label: '\u20B910 Crore+' }]} />
                      </motion.div>
                    ) : (
                      <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-4 mt-3">
                        <InfoRow label="GST Number" value={financeConfig.gstNumber} icon={<Receipt className="w-3.5 h-3.5" />} />
                        <InfoRow label="PAN Number" value={financeConfig.panNumber} icon={<FileText className="w-3.5 h-3.5" />} />
                        <InfoRow label="Financial Year" value={financeConfig.financialYear === '2025-26' ? 'FY 2025-26' : 'FY 2024-25'} icon={<Landmark className="w-3.5 h-3.5" />} />
                        <InfoRow label="Revenue Range" value={financeConfig.revenueRange || userInfo.revenueRange || ''} icon={<BarChart3 className="w-3.5 h-3.5" />} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleSection>
              ) : serviceType === 'marketing-leadgen' ? (
                <CollapsibleSection title="Lead Generation Configuration" icon={<FilterIcon className="w-4 h-4 text-violet-600" />} iconBg="bg-violet-50" defaultOpen={true}
                  badge={<EditToggleBtn editing={editingMarketing} onToggle={() => setEditingMarketing(!editingMarketing)} onSave={() => handleSave(() => setEditingMarketing(false), 'marketing')} sectionKey="marketing" />}>
                  <AnimatePresence mode="wait">
                    {editingMarketing ? (
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-4 mt-3">
                        <EditableField label="Primary Service" value={marketingConfig.primaryService} onChange={(v) => setMarketingConfig(p => ({ ...p, primaryService: v }))} placeholder="e.g., Home Loans, Dental Implants" />
                        <EditableField label="Service Areas" value={marketingConfig.serviceAreas} onChange={(v) => setMarketingConfig(p => ({ ...p, serviceAreas: v }))} placeholder="e.g., Mumbai, Delhi NCR" icon={<MapPin className="w-4 h-4 text-gray-400" />} />
                        <EditableField label="Monthly Ad Budget" value={marketingConfig.monthlyBudget} onChange={(v) => setMarketingConfig(p => ({ ...p, monthlyBudget: v }))} placeholder="Select range" type="select" options={[{ value: '\u20B91.5L - \u20B92.5L', label: '\u20B91.5L - \u20B92.5L' }, { value: '\u20B92.5L - \u20B93.5L', label: '\u20B92.5L - \u20B93.5L' }, { value: '\u20B93.5L - \u20B94.5L', label: '\u20B93.5L - \u20B94.5L' }, { value: '\u20B94.5L - \u20B95.5L', label: '\u20B94.5L - \u20B95.5L' }, { value: '\u20B95.5L+', label: '\u20B95.5L+' }]} />
                        <EditableField label="Average Deal Value" value={marketingConfig.avgDealValue} onChange={(v) => setMarketingConfig(p => ({ ...p, avgDealValue: v }))} placeholder="e.g., \u20B950,000" icon={<IndianRupee className="w-4 h-4 text-gray-400" />} />
                        <EditableField label="Lead Volume Target" value={marketingConfig.leadVolumeTarget} onChange={(v) => setMarketingConfig(p => ({ ...p, leadVolumeTarget: v }))} placeholder="Select target" type="select" options={[{ value: '50-100', label: '50-100 leads/month' }, { value: '100-300', label: '100-300 leads/month' }, { value: '300-500', label: '300-500 leads/month' }, { value: '500-1000', label: '500-1,000 leads/month' }, { value: '1000+', label: '1,000+ leads/month' }]} />
                        <EditableField label="Primary Goal" value={marketingConfig.primaryGoal} onChange={(v) => setMarketingConfig(p => ({ ...p, primaryGoal: v }))} placeholder="Select goal" type="select" options={[{ value: 'Lead Generation', label: 'Lead Generation' }, { value: 'Brand Awareness', label: 'Brand Awareness' }, { value: 'Website Traffic', label: 'Website Traffic' }]} />
                      </motion.div>
                    ) : (
                      <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-x-5 gap-y-4 mt-3">
                        <InfoRow label="Primary Service" value={marketingConfig.primaryService} icon={<Megaphone className="w-3.5 h-3.5" />} />
                        <InfoRow label="Service Areas" value={marketingConfig.serviceAreas} icon={<MapPin className="w-3.5 h-3.5" />} />
                        <InfoRow label="Monthly Budget" value={marketingConfig.monthlyBudget || userInfo.adSpendRange || ''} icon={<IndianRupee className="w-3.5 h-3.5" />} />
                        <InfoRow label="Avg Deal Value" value={marketingConfig.avgDealValue} icon={<IndianRupee className="w-3.5 h-3.5" />} />
                        <InfoRow label="Lead Volume" value={marketingConfig.leadVolumeTarget} icon={<Users className="w-3.5 h-3.5" />} />
                        <InfoRow label="Primary Goal" value={marketingConfig.primaryGoal || userInfo.goal || ''} icon={<Target className="w-3.5 h-3.5" />} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleSection>
              ) : (
                <CollapsibleSection title="Marketing Configuration" icon={<Megaphone className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-50" defaultOpen={true}
                  badge={<EditToggleBtn editing={editingMarketing} onToggle={() => setEditingMarketing(!editingMarketing)} onSave={() => handleSave(() => setEditingMarketing(false), 'marketing')} sectionKey="marketing" />}>
                  <AnimatePresence mode="wait">
                    {editingMarketing ? (
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-4 mt-3">
                        <EditableField label="Target Audience" value={marketingConfig.targetAudience} onChange={(v) => setMarketingConfig(p => ({ ...p, targetAudience: v }))} placeholder="e.g., Women 25-34, Metro cities" icon={<Users className="w-4 h-4 text-gray-400" />} />
                        <EditableField label="Monthly Ad Budget" value={marketingConfig.monthlyBudget} onChange={(v) => setMarketingConfig(p => ({ ...p, monthlyBudget: v }))} placeholder="Select range" type="select" options={[{ value: '\u20B91.5L - \u20B92.5L', label: '\u20B91.5L - \u20B92.5L' }, { value: '\u20B92.5L - \u20B93.5L', label: '\u20B92.5L - \u20B93.5L' }, { value: '\u20B93.5L - \u20B94.5L', label: '\u20B93.5L - \u20B94.5L' }, { value: '\u20B94.5L - \u20B95.5L', label: '\u20B94.5L - \u20B95.5L' }, { value: '\u20B95.5L+', label: '\u20B95.5L+' }]} />
                        <EditableField label="Target Location" value={marketingConfig.targetLocation} onChange={(v) => setMarketingConfig(p => ({ ...p, targetLocation: v }))} placeholder="Select target locations" type="multiselect" icon={<MapPin className="w-4 h-4 text-gray-400" />} options={[{ value: 'Mumbai', label: 'Mumbai' }, { value: 'Delhi NCR', label: 'Delhi NCR' }, { value: 'Bangalore', label: 'Bangalore' }, { value: 'Hyderabad', label: 'Hyderabad' }, { value: 'Chennai', label: 'Chennai' }, { value: 'Pune', label: 'Pune' }, { value: 'Kolkata', label: 'Kolkata' }, { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'Jaipur', label: 'Jaipur' }, { value: 'Pan-India', label: 'Pan-India' }, { value: 'International', label: 'International' }]} />
                        <EditableField label="Primary Goal" value={marketingConfig.primaryGoal} onChange={(v) => setMarketingConfig(p => ({ ...p, primaryGoal: v }))} placeholder="Select goal" type="select" options={[{ value: 'Lead Generation', label: 'Lead Generation' }, { value: 'E-Commerce Sales', label: 'E-Commerce Sales' }, { value: 'Brand Awareness', label: 'Brand Awareness' }, { value: 'App Installs', label: 'App Installs' }, { value: 'Website Traffic', label: 'Website Traffic' }]} />
                      </motion.div>
                    ) : (
                      <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-5 gap-y-5 mt-3">
                        <InfoRow label="Target Audience" value={marketingConfig.targetAudience} icon={<Users className="w-3.5 h-3.5" />} />
                        <InfoRow label="Monthly Budget" value={marketingConfig.monthlyBudget || userInfo.adSpendRange || ''} icon={<IndianRupee className="w-3.5 h-3.5" />} />
                        <InfoRow label="Target Location" value={marketingConfig.targetLocation} icon={<MapPin className="w-3.5 h-3.5" />} />
                        <InfoRow label="Primary Goal" value={marketingConfig.primaryGoal || userInfo.goal || ''} icon={<Target className="w-3.5 h-3.5" />} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleSection>
              )}
            </StaggerItem>

            {/* 3. Competitors (Marketing only) */}
            {serviceType !== 'finance' && (
              <StaggerItem index={3}>
                <CollapsibleSection title="Competitors" icon={<Star className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-50"
                  badge={<EditToggleBtn editing={editingCompetitors} onToggle={() => setEditingCompetitors(!editingCompetitors)} onSave={() => handleSave(() => setEditingCompetitors(false), 'competitors')} sectionKey="competitors" />}>
                  <AnimatePresence mode="wait">
                    {editingCompetitors ? (
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 mt-3">
                        {competitors.map((c: any, i: number) => (
                          <div key={i} className="grid grid-cols-3 gap-3">
                            <input value={c.name} onChange={(e) => { const n = [...competitors]; n[i] = { ...n[i], name: e.target.value }; setCompetitors(n); }} placeholder="Competitor name" className={inputCls} />
                            <input value={c.website} onChange={(e) => { const n = [...competitors]; n[i] = { ...n[i], website: e.target.value }; setCompetitors(n); }} placeholder="Website URL" className={inputCls} />
                            <input value={c.offering} onChange={(e) => { const n = [...competitors]; n[i] = { ...n[i], offering: e.target.value }; setCompetitors(n); }} placeholder="Key offering" className={inputCls} />
                          </div>
                        ))}
                        {competitors.length < 5 && (
                          <button onClick={() => setCompetitors((p: any) => [...p, { name: '', website: '', offering: '' }])} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors">+ Add competitor</button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                        {competitors.filter((c: any) => c.name).length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {competitors.filter((c: any) => c.name).map((c: any, i: number) => (
                              <CompetitorRow key={i} index={i + 1} name={c.name} website={c.website} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 py-2">No competitors added yet. Request edit access to add.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleSection>
              </StaggerItem>
            )}

            {/* 4. Products / Services */}
            <StaggerItem index={serviceType === 'finance' ? 3 : 4}>
              <CollapsibleSection title={serviceType === 'marketing-leadgen' ? 'Service Catalog' : 'Products & Services'} icon={<Package className="w-4 h-4 text-indigo-600" />} iconBg="bg-indigo-50"
                badge={<EditToggleBtn editing={editingProducts} onToggle={() => setEditingProducts(!editingProducts)} onSave={() => handleSave(() => setEditingProducts(false), 'products')} sectionKey="products" />}>
                <AnimatePresence mode="wait">
                  {editingProducts ? (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 mt-3">
                      {products.map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 gap-3">
                          <input value={p.name} onChange={(e) => { const n = [...products]; n[i] = { ...n[i], name: e.target.value }; setProducts(n); }} placeholder={serviceType === 'marketing-leadgen' ? 'Service name' : 'Product name'} className={inputCls} />
                          <input value={p.category} onChange={(e) => { const n = [...products]; n[i] = { ...n[i], category: e.target.value }; setProducts(n); }} placeholder="Category" className={inputCls} />
                          <input value={p.priceRange} onChange={(e) => { const n = [...products]; n[i] = { ...n[i], priceRange: e.target.value }; setProducts(n); }} placeholder="Price range" className={inputCls} />
                        </div>
                      ))}
                      {products.length < 5 && (
                        <button onClick={() => setProducts((p: any) => [...p, { name: '', category: '', priceRange: '' }])} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors">+ Add {serviceType === 'marketing-leadgen' ? 'service' : 'product'}</button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                      {products.filter((p: any) => p.name).length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {products.filter((p: any) => p.name).map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 py-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Package className="w-3.5 h-3.5 text-indigo-500" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400">{[p.category, p.priceRange].filter(Boolean).join(' \u00B7 ') || 'No details'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 py-2">No {serviceType === 'marketing-leadgen' ? 'services' : 'products'} added yet. Request edit access to add.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleSection>
            </StaggerItem>

            {/* 5. Portal Credentials Status (Finance only) */}
            {serviceType === 'finance' && (
              <StaggerItem index={4}>
                <CollapsibleSection title="Portal Access Status" icon={<CreditCard className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-50"
                  badge={<span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{portalStatuses.filter(p => p.status === 'saved').length}/{portalStatuses.length} saved</span>}>
                  <div className="mt-3 space-y-2">
                    {portalStatuses.map((portal) => (
                      <div key={portal.id} className="flex items-center justify-between py-2 px-3 bg-gray-50/60 rounded-xl">
                        <div className="flex items-center gap-2.5"><Landmark className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{portal.label}</span></div>
                        {portal.status === 'saved' ? (<span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>) : (<span className="text-xs font-medium text-gray-400">Pending</span>)}
                      </div>
                    ))}
                    <p className="text-[13px] text-gray-500 pt-1">Credentials are encrypted and stored securely. Manage via Post-Payment Onboarding.</p>
                  </div>
                </CollapsibleSection>
              </StaggerItem>
            )}

            {/* 6. Documents Status (Finance only) */}
            {serviceType === 'finance' && (
              <StaggerItem index={5}>
                <CollapsibleSection title="Documents & Data" icon={<BookOpen className="w-4 h-4 text-cyan-600" />} iconBg="bg-cyan-50"
                  badge={<span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">{docStatuses.filter(d => d.status === 'uploaded').length}/{docStatuses.length} uploaded</span>}>
                  <div className="mt-3 space-y-2">
                    {docStatuses.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50/60 rounded-xl">
                        <div className="flex items-center gap-2.5"><FileText className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{doc.label}</span></div>
                        {doc.status === 'uploaded' ? (<span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />Uploaded</span>) : (<span className="text-xs font-medium text-gray-400">Pending</span>)}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </StaggerItem>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}