'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Building2, TrendingUp, FileText, ShoppingCart, Users, Store, Factory, Globe, Briefcase, CheckCircle2, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessAccount } from './BusinessAccountCard';

// ── Industry Options ──
const INDUSTRIES = [
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Food & Beverage',
  'Health & Wellness',
  'Electronics & Tech',
  'Home & Living',
  'Education & EdTech',
  'SaaS & Software',
  'Real Estate',
  'Professional Services',
  'Hospitality & Travel',
  'Other',
];

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (account: BusinessAccount) => void;
  existingAccounts: BusinessAccount[];
  /** If provided, skip the service selection step and use this service */
  preSelectedService?: 'Performance Marketing' | 'Accounts & Taxation';
}

type Step = 'service' | 'businessType' | 'details' | 'review';

export function AddBusinessModal({ isOpen, onClose, onComplete, existingAccounts, preSelectedService }: AddBusinessModalProps) {
  const [step, setStep] = useState<Step>('service');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [isCreating, setIsCreating] = useState(false);

  // ── Form Data ──
  const [selectedService, setSelectedService] = useState<'Performance Marketing' | 'Accounts & Taxation' | ''>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      if (preSelectedService) {
        setStep('businessType');
        setSelectedService(preSelectedService);
      } else {
        setStep('service');
        setSelectedService('');
      }
      setDirection(1);
      setSelectedBusinessType('');
      setBusinessName('');
      setWebsiteUrl('');
      setIndustry('');
      setIsCreating(false);
    }
  }, [isOpen, preSelectedService]);

  // Close industry dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setShowIndustryDropdown(false);
      }
    };
    if (showIndustryDropdown) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showIndustryDropdown]);

  // ── Step Navigation ──
  const stepOrder: Step[] = preSelectedService 
    ? ['businessType', 'details', 'review'] 
    : ['service', 'businessType', 'details', 'review'];
  const currentIndex = stepOrder.indexOf(step);

  const goNext = () => {
    if (currentIndex < stepOrder.length - 1) {
      setDirection(1);
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  // ── Business Type Options ──
  const getBusinessTypeOptions = () => {
    if (selectedService === 'Performance Marketing') {
      return [
        {
          id: 'ecommerce',
          label: 'E-Commerce',
          description: 'Online stores selling physical or digital products',
          icon: ShoppingCart,
          color: 'from-blue-500 to-indigo-600',
          bgLight: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: '#204CC7',
        },
        {
          id: 'leadgen',
          label: 'Lead Generation',
          description: 'Service businesses focused on generating client inquiries',
          icon: Users,
          color: 'from-emerald-500 to-teal-600',
          bgLight: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          borderColor: '#10b981',
        },
      ];
    }
    // Accounts & Taxation
    return [
      {
        id: 'ecommerce-restaurants',
        label: 'E-Commerce or Restaurants',
        description: 'Product-based businesses with inventory and cost of goods',
        icon: Store,
        color: 'from-orange-500 to-amber-600',
        bgLight: 'bg-orange-50',
        textColor: 'text-orange-600',
        borderColor: '#f97316',
      },
      {
        id: 'trading-manufacturing',
        label: 'Trading, Manufacturing & Services',
        description: 'B2B, wholesale, or service-oriented businesses',
        icon: Factory,
        color: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50',
        textColor: 'text-violet-600',
        borderColor: '#8b5cf6',
      },
    ];
  };

  // ── Get display label for business type ──
  const getBusinessTypeLabel = () => {
    if (selectedService === 'Performance Marketing') {
      return selectedBusinessType === 'ecommerce' ? 'E-Commerce Business' : 'Lead Generation Business';
    }
    return selectedBusinessType === 'ecommerce-restaurants' 
      ? 'E-Commerce / Restaurant' 
      : 'Trading / Manufacturing / Services';
  };

  // ── Default connected platforms by service (used for display reference only) ──
  const getDefaultPlatforms = () => {
    if (selectedService === 'Performance Marketing') {
      return selectedBusinessType === 'ecommerce' 
        ? ['google', 'meta', 'ga4', 'shopify'] 
        : ['google', 'meta', 'ga4'];
    }
    // Finance accounts — integrations are configured after account creation
    return [];
  };

  // ── Validation ──
  const canProceed = () => {
    switch (step) {
      case 'service': return selectedService !== '';
      case 'businessType': return selectedBusinessType !== '';
      case 'details': return businessName.trim() !== '' && industry !== '';
      case 'review': return true;
      default: return false;
    }
  };

  // ── Handle Create ──
  const handleCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newAccount: BusinessAccount = {
        id: `biz-${Date.now()}`,
        name: businessName.trim(),
        service: selectedService as 'Performance Marketing' | 'Accounts & Taxation',
        businessType: selectedBusinessType,
        businessTypeLabel: getBusinessTypeLabel(),
        status: 'pending',
        connectedPlatforms: [],
        createdAt: new Date(),
      };
      onComplete(newAccount);
      // Toast handled by parent (ChatInterface) to avoid duplicates
      setIsCreating(false);
    }, 1200);
  };

  // ── Step Indicator ──
  const stepLabels = preSelectedService 
    ? ['Type', 'Details', 'Review'] 
    : ['Service', 'Type', 'Details', 'Review'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-[6px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl border border-gray-200/60 overflow-hidden flex flex-col"
            style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#204CC7] rounded-xl flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">Add New Business</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Step {currentIndex + 1} of {stepLabels.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-1.5">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex-1">
                    <div
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        i <= currentIndex
                          ? 'bg-[#204CC7]'
                          : 'bg-gray-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait" custom={direction}>
                {/* Step 1: Service Selection */}
                {step === 'service' && (
                  <motion.div
                    key="service"
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      What service are you looking for?
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">
                      Select the primary service for this business account.
                    </p>

                    <div className="space-y-3">
                      {/* Performance Marketing */}
                      <button
                        onClick={() => setSelectedService('Performance Marketing')}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                          selectedService === 'Performance Marketing'
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-500/10'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                            selectedService === 'Performance Marketing'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25'
                              : 'bg-blue-100 group-hover:bg-blue-200'
                          }`}>
                            <TrendingUp className={`w-5 h-5 ${
                              selectedService === 'Performance Marketing' ? 'text-white' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${
                              selectedService === 'Performance Marketing' ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              Performance Marketing
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Paid ads, campaigns, ROAS tracking & optimization
                            </p>
                          </div>
                          {selectedService === 'Performance Marketing' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </button>

                      {/* Accounts & Taxation */}
                      <button
                        onClick={() => setSelectedService('Accounts & Taxation')}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                          selectedService === 'Accounts & Taxation'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                            selectedService === 'Accounts & Taxation'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
                              : 'bg-emerald-100 group-hover:bg-emerald-200'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              selectedService === 'Accounts & Taxation' ? 'text-white' : 'text-emerald-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${
                              selectedService === 'Accounts & Taxation' ? 'text-emerald-900' : 'text-gray-900'
                            }`}>
                              Accounts & Taxation
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Bookkeeping, compliance, P&L, and tax management
                            </p>
                          </div>
                          {selectedService === 'Accounts & Taxation' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Business Type */}
                {step === 'businessType' && (
                  <motion.div
                    key="businessType"
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      What type of business is this?
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">
                      This helps us tailor your experience and reports.
                    </p>

                    <div className="space-y-3">
                      {getBusinessTypeOptions().map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedBusinessType === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelectedBusinessType(option.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                              isSelected
                                ? `${option.bgLight} shadow-sm`
                                : `hover:bg-gray-50/50`
                            }`}
                            style={{ borderColor: isSelected ? option.borderColor : `${option.borderColor}40` }}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected
                                  ? `bg-gradient-to-br ${option.color} shadow-lg`
                                  : `${option.bgLight} group-hover:opacity-80`
                              }`}>
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : option.textColor}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">{option.label}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`w-5 h-5 bg-gradient-to-br ${option.color} rounded-full flex items-center justify-center`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Business Details */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Tell us about the business
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">
                      Basic details to set up your workspace.
                    </p>

                    <div className="space-y-4">
                      {/* Business Name */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Business Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Website URL — hidden for finance */}
                      {selectedService === 'Performance Marketing' && (
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Website URL
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Industry */}
                      <div ref={industryRef} className="relative">
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Industry <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                          <button
                            onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                            className={`w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur border rounded-xl text-sm transition-all ${
                              industry ? 'text-gray-900 border-gray-200' : 'text-gray-400 border-gray-200'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400`}
                            aria-expanded={showIndustryDropdown}
                            aria-controls="industry-dropdown-menu"
                            aria-haspopup="listbox"
                          >
                            <span>{industry || 'Select industry'}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showIndustryDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {showIndustryDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              id="industry-dropdown-menu"
                              role="listbox"
                              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-44 overflow-y-auto z-50"
                            >
                              {INDUSTRIES.map((ind) => (
                                <button
                                  key={ind}
                                  onClick={() => {
                                    setIndustry(ind);
                                    setShowIndustryDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    industry === ind
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {ind}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {step === 'review' && (
                  <motion.div
                    key="review"
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Review & Create
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">
                      Confirm the details before creating your business workspace.
                    </p>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 rounded-xl border border-gray-200/60 overflow-hidden">
                      {/* Business Name Header */}
                      <div className="px-5 py-4 border-b border-gray-100/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white text-sm font-bold">
                              {businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{businessName}</h4>
                            <p className="text-xs text-gray-500">{getBusinessTypeLabel()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="px-5 py-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Service</span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                            selectedService === 'Performance Marketing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {selectedService}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Business Type</span>
                          <span className="text-xs font-medium text-gray-900">
                            {getBusinessTypeLabel()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Industry</span>
                          <span className="text-xs font-medium text-gray-900">{industry}</span>
                        </div>

                        {websiteUrl && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Website</span>
                            <span className="text-xs font-medium text-blue-600 truncate max-w-[200px]">
                              {websiteUrl}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* What's Next */}
                      <div className="px-5 py-3.5 bg-blue-50/50 border-t border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-900">What happens next</span>
                        </div>
                        <ul className="space-y-1.5">
                          <li className="flex items-center gap-2 text-xs text-blue-700">
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            Your workspace will be created instantly
                          </li>
                          <li className="flex items-center gap-2 text-xs text-blue-700">
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            Connect your accounts to start syncing data
                          </li>
                          <li className="flex items-center gap-2 text-xs text-blue-700">
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            {selectedService === 'Performance Marketing'
                              ? 'BregoGPT will analyze your campaigns within minutes'
                              : 'BregoGPT will structure your financial data automatically'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between flex-shrink-0">
              {currentIndex > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}

              {step === 'review' ? (
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Business
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
