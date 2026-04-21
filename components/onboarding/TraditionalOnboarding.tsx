'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Megaphone, Calculator, Layers, ShoppingCart, Heart, GraduationCap,
  Briefcase, Home, UtensilsCrossed, Code, MoreHorizontal, BarChart3,
  Target, Check, ChevronLeft, TrendingUp, Users, PenTool,
  X, Building2, FileSpreadsheet, BookOpen, Sparkles, Wallet, Calendar,
  ArrowRight, Download
} from 'lucide-react';
import { UserInfo } from '../../types';
import { BregoLogo } from '../BregoLogo';
import { MarketingHealthReport } from './MarketingHealthReport';
import { FinanceHealthReport } from './FinanceHealthReport';
import { OnboardingSidebar } from './OnboardingSidebar';

interface TraditionalOnboardingProps {
  userInfo: UserInfo;
  onComplete: (
    goal?: string, 
    businessModel?: 'ecommerce' | 'leadgen',
    financeData?: {
      businessType?: string;
      financeManagement?: string;
      revenueRange?: string;
      accountingSoftware?: string;
    },
    selectedService?: string,
    adSpendRange?: string,
    industry?: string
  ) => void;
}

type ServiceType = 'Performance Marketing' | 'Accounts & Taxation' | 'Both Services' | '';

interface OnboardingState {
  selectedService: ServiceType;
  industry: string;
  goal: string;
  adSpendRange: string;
  connectedAccounts: {
    metaAds: boolean;
    googleAds: boolean;
    linkedinAds: boolean;
    shopify: boolean;
    ga4: boolean;
  };
  businessType: string;
  financeManagement: string;
  revenueRange: string;
  accountingSoftware: string;
  financeChallenge: string;
}

export function TraditionalOnboarding({ userInfo, onComplete }: TraditionalOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [onboardingData, setOnboardingData] = useState<OnboardingState>({
    selectedService: '',
    industry: '',
    goal: '',
    adSpendRange: '',
    connectedAccounts: {
      metaAds: false,
      googleAds: false,
      linkedinAds: false,
      shopify: false,
      ga4: false
    },
    businessType: '',
    financeManagement: '',
    revenueRange: '',
    accountingSoftware: '',
    financeChallenge: ''
  });

  const getTotalSteps = () => {
    if (onboardingData.selectedService === 'Accounts & Taxation') return 5;
    return 4; // PM flow: Service, Industry, Goal, Budget
  };

  const totalSteps = getTotalSteps();

  const handleNext = () => {
    setDirection('forward');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      const businessModel = onboardingData.selectedService === 'Accounts & Taxation'
        ? undefined
        : (onboardingData.goal === 'Increase ROAS' ? 'ecommerce' : 'leadgen');
      onComplete(onboardingData.goal, businessModel as 'ecommerce' | 'leadgen' | undefined, {
        businessType: onboardingData.businessType,
        financeManagement: onboardingData.financeManagement,
        revenueRange: onboardingData.revenueRange,
        accountingSoftware: onboardingData.accountingSoftware
      }, onboardingData.selectedService, onboardingData.adSpendRange, onboardingData.industry);
    }
  };

  // Ref-based access to the latest handleNext so the deferred auto-advance
  // timer picks up freshly-applied onboardingData (e.g. service → totalSteps).
  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // Debounced advance timer — clicking a new option cancels the pending
  // advance from the previous click, so mis-clicks don't skip a step.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== null) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAdvanceTimer();
  }, []);

  /** Apply a patch to onboarding data and auto-advance after a short delay.
   *  The delay lets the selection "click" animation play and keeps an easy
   *  escape hatch — if the user keeps tapping, timers re-debounce. */
  const selectAndAdvance = (patch: Partial<OnboardingState>) => {
    setOnboardingData((prev) => ({ ...prev, ...patch }));
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      handleNextRef.current();
    }, 260);
  };

  const handleBack = () => {
    clearAdvanceTimer();
    setDirection('backward');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.selectedService !== '';
      case 2:
        if (onboardingData.selectedService === 'Performance Marketing' || onboardingData.selectedService === 'Both Services') {
          return onboardingData.industry !== '';
        } else if (onboardingData.selectedService === 'Accounts & Taxation') {
          return onboardingData.businessType !== '';
        }
        return false;
      case 3:
        if (onboardingData.selectedService === 'Performance Marketing' || onboardingData.selectedService === 'Both Services') {
          return onboardingData.goal !== '';
        } else if (onboardingData.selectedService === 'Accounts & Taxation') {
          return onboardingData.financeManagement !== '';
        }
        return false;
      case 4:
        if (onboardingData.selectedService === 'Performance Marketing' || onboardingData.selectedService === 'Both Services') {
          return onboardingData.adSpendRange !== '';
        } else if (onboardingData.selectedService === 'Accounts & Taxation') {
          return onboardingData.revenueRange !== '';
        }
        return false;
      case 5:
        if (onboardingData.selectedService === 'Accounts & Taxation') {
          return onboardingData.accountingSoftware !== '';
        }
        return true;
      default:
        return false;
    }
  };

  // Check if this is the final step with CTA buttons (no Continue button needed)
  const isFinalStep = () => {
    return false; // Final CTA step removed — all steps now have Continue button
  };

  // Get step label for the progress indicator
  const getStepLabels = (): string[] => {
    if (onboardingData.selectedService === 'Accounts & Taxation') {
      return ['Service', 'Business', 'Finance', 'Revenue', 'Tools'];
    }
    return ['Service', 'Industry', 'Goal', 'Budget'];
  };

  const stepLabels = getStepLabels();

  const renderStepContent = () => {
    // Step 1: Service Selection
    if (currentStep === 1) {
      const services: { label: string; value: ServiceType; icon: ReactNode; description: string }[] = [
        { 
          label: 'Performance Marketing', 
          value: 'Performance Marketing',
          icon: <Megaphone className="w-5 h-5" />,
          description: 'Ads management, ROAS optimization & lead generation',
        },
        { 
          label: 'Accounts & Taxation', 
          value: 'Accounts & Taxation',
          icon: <Calculator className="w-5 h-5" />,
          description: 'Bookkeeping, GST filing, tax planning & compliance',
        },
        // { 
        //   label: 'Both Services', 
        //   value: 'Both Services',
        //   icon: <Layers className="w-5 h-5" />,
        //   description: 'Full-stack growth — marketing + finance under one roof',
        // },
      ];

      return (
        <StepContainer
          title="What can we help you with?"
          subtitle="Choose the service that fits your business needs"
        >
          <div className="space-y-3">
            {services.map((option) => {
              const isSelected = onboardingData.selectedService === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => selectAndAdvance({ selectedService: option.value })}
                  className={`
                    w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 group
                    ${isSelected
                      ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_4px_18px_rgba(32,76,199,0.1)]'
                      : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${isSelected
                        ? 'bg-brand-light text-brand'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${isSelected
                        ? 'bg-brand scale-100'
                        : 'border-2 border-gray-300 scale-90'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </StepContainer>
      );
    }

    // Performance Marketing Flow
    if (onboardingData.selectedService === 'Performance Marketing' || onboardingData.selectedService === 'Both Services') {
      // Step 2: Industry Selection
      if (currentStep === 2) {
        const industries: { label: string; icon: ReactNode }[] = [
          { label: 'E-Commerce', icon: <ShoppingCart className="w-4 h-4" /> },
          { label: 'Healthcare / Wellness', icon: <Heart className="w-4 h-4" /> },
          { label: 'Education / EdTech', icon: <GraduationCap className="w-4 h-4" /> },
          { label: 'B2B Services', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Real Estate', icon: <Home className="w-4 h-4" /> },
          { label: 'Food & Beverage', icon: <UtensilsCrossed className="w-4 h-4" /> },
          { label: 'Technology / SaaS', icon: <Code className="w-4 h-4" /> },
          { label: 'Other', icon: <MoreHorizontal className="w-4 h-4" /> },
        ];

        return (
          <StepContainer
            title="Which industry do you operate in?"
            subtitle="This helps us benchmark your performance against competitors"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {industries.map((option) => {
                const isSelected = onboardingData.industry === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAndAdvance({ industry: option.label })}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_2px_12px_rgba(32,76,199,0.08)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'bg-brand-light text-brand'
                        : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 3: Goal Selection
      if (currentStep === 3) {
        const goals: { label: string; value: string; icon: ReactNode; description: string }[] = [
          { 
            label: 'Increase ROAS', 
            value: 'Increase ROAS',
            icon: <BarChart3 className="w-5 h-5" />,
            description: 'Maximize return on ad spend for your e-commerce store',
          },
          { 
            label: 'Generate Leads', 
            value: 'Generate Leads',
            icon: <Target className="w-5 h-5" />,
            description: 'Drive high-quality leads and grow your sales pipeline',
          },
        ];

        return (
          <StepContainer
            title="What's your primary marketing objective?"
            subtitle="We'll tailor your strategy and KPIs around this goal"
          >
            <div className="space-y-3">
              {goals.map((option) => {
                const isSelected = onboardingData.goal === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => selectAndAdvance({ goal: option.value })}
                    className={`
                      w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_4px_18px_rgba(32,76,199,0.1)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isSelected
                          ? 'bg-brand-light text-brand'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500'
                        }
                      `}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isSelected
                          ? 'bg-brand scale-100'
                          : 'border-2 border-gray-300 scale-90'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 4: Ad Spend Range
      if (currentStep === 4) {
        const spendRanges = [
          { label: '₹1.5L - ₹2.5L', tag: '' },
          { label: '₹2.5L - ₹3.5L', tag: '' },
          { label: '₹3.5L - ₹4.5L', tag: 'Popular' },
          { label: '₹4.5L - ₹5.5L', tag: '' },
          { label: '₹5.5L+', tag: '' },
        ];

        return (
          <StepContainer
            title="How much are you spending on ads monthly?"
            subtitle="Excluding GST — this helps us recommend the right plan"
          >
            <div className="space-y-2">
              {spendRanges.map((option) => {
                const isSelected = onboardingData.adSpendRange === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAndAdvance({ adSpendRange: option.label })}
                    className={`
                      w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 text-left transition-all duration-200 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_2px_12px_rgba(32,76,199,0.08)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-brand-light text-brand'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        <span className="text-sm font-semibold">₹</span>
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                      {option.tag && (
                        null
                      )}
                    </div>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'bg-brand'
                        : 'border-2 border-gray-300'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 5: Final - Book a Call / Explore AI
      if (currentStep === 5) {
        const handleScheduleCall = () => {
          window.open('https://calendly.com/brego-business', '_blank');
        };

        const handleViewReport = () => {
          setShowReportModal(true);
        };

        const handleExploreAI = () => {
          const businessModel = onboardingData.goal === 'Increase ROAS' ? 'ecommerce' : 'leadgen';
          onComplete(onboardingData.goal, businessModel, undefined, onboardingData.selectedService, onboardingData.adSpendRange, onboardingData.industry);
        };

        return (
          <FinalStepContent
            onScheduleCall={handleScheduleCall}
            onExploreAI={handleExploreAI}
            onViewReport={handleViewReport}
          />
        );
      }
    }

    // Accounts & Taxation Flow
    if (onboardingData.selectedService === 'Accounts & Taxation') {
      // Step 2: Business Type
      if (currentStep === 2) {
        const businessTypes: { label: string; value: string; icon: ReactNode; description: string }[] = [
          { 
            label: 'E-Commerce or Restaurants', 
            value: 'E-Commerce or Restaurants',
            icon: <ShoppingCart className="w-5 h-5" />,
            description: 'Online stores, D2C brands, QSRs & dine-in restaurants'
          },
          { 
            label: 'Trading, Manufacturing or Services', 
            value: 'Trading, Manufacturing or Services',
            icon: <Building2 className="w-5 h-5" />,
            description: 'B2B trading, production units & professional services'
          },
        ];

        return (
          <StepContainer
            title="What is your business type?"
            subtitle="This helps us set up the right accounting structure"
          >
            <div className="space-y-3">
              {businessTypes.map((option) => {
                const isSelected = onboardingData.businessType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => selectAndAdvance({ businessType: option.value })}
                    className={`
                      w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_4px_18px_rgba(32,76,199,0.1)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isSelected
                          ? 'bg-brand-light text-brand'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500'
                        }
                      `}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isSelected
                          ? 'bg-brand scale-100'
                          : 'border-2 border-gray-300 scale-90'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 3: Finance Department Management
      if (currentStep === 3) {
        const financeOptions: { label: string; icon: ReactNode }[] = [
          { label: 'In-house Team', icon: <Users className="w-4 h-4" /> },
          { label: 'CA Firm / Freelancer', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Managing Personally', icon: <PenTool className="w-4 h-4" /> },
          { label: 'Not Managing at All', icon: <X className="w-4 h-4" /> },
        ];

        return (
          <StepContainer
            title="How are you managing your finance department?"
            subtitle="Understanding your current setup helps us plan the transition"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {financeOptions.map((option) => {
                const isSelected = onboardingData.financeManagement === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAndAdvance({ financeManagement: option.label })}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_2px_12px_rgba(32,76,199,0.08)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'bg-brand-light text-brand'
                        : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 4: Annual Revenue Range
      if (currentStep === 4) {
        const revenueRanges = [
          { label: 'Below ₹1 Cr', tag: '' },
          { label: '₹1 Cr - ₹10 Cr', tag: '' },
          { label: '₹10 Cr - ₹25 Cr', tag: '' },
          { label: 'Above ₹25 Cr', tag: '' },
        ];

        return (
          <StepContainer
            title="What is your annual revenue range?"
            subtitle="This helps us understand your business scale and needs"
          >
            <div className="space-y-2">
              {revenueRanges.map((option) => {
                const isSelected = onboardingData.revenueRange === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAndAdvance({ revenueRange: option.label })}
                    className={`
                      w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 text-left transition-all duration-200 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_2px_12px_rgba(32,76,199,0.08)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-brand-light text-brand'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </div>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'bg-brand'
                        : 'border-2 border-gray-300'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 5: Accounting Software
      if (currentStep === 5) {
        const softwareOptions: { label: string; icon: ReactNode; description: string }[] = [
          { label: 'Custom Accounting Tool', icon: <Code className="w-[18px] h-[18px]" />, description: 'ERP or custom-built solution' },
          { label: 'Tally', icon: <BookOpen className="w-[18px] h-[18px]" />, description: 'Tally Prime / Tally ERP' },
          { label: 'Zoho Books', icon: <FileSpreadsheet className="w-[18px] h-[18px]" />, description: 'Zoho accounting suite' },
          { label: 'Excel / Manual', icon: <PenTool className="w-[18px] h-[18px]" />, description: 'Spreadsheets or manual books' },
        ];

        return (
          <StepContainer
            title="Which tool do you use to manage accounts?"
            subtitle="We'll integrate directly or help you transition smoothly"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {softwareOptions.map((option) => {
                const isSelected = onboardingData.accountingSoftware === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAndAdvance({ accountingSoftware: option.label })}
                    className={`
                      flex flex-col items-center text-center gap-2.5 px-4 py-5 rounded-xl border-2 transition-all duration-200 group
                      ${isSelected
                        ? 'border-brand bg-[rgba(32,76,199,0.025)] shadow-[0_2px_12px_rgba(32,76,199,0.08)]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                      ${isSelected
                        ? 'bg-brand-light text-brand'
                        : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {option.label}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </StepContainer>
        );
      }

      // Step 6: Final - Book a Call / Explore AI
      if (currentStep === 6) {
        const handleScheduleCall = () => {
          window.open('https://calendly.com/brego-business', '_blank');
        };

        const handleViewReport = () => {
          setShowReportModal(true);
        };

        const handleExploreAI = () => {
          onComplete(undefined, undefined, {
            businessType: onboardingData.businessType,
            financeManagement: onboardingData.financeManagement,
            revenueRange: onboardingData.revenueRange,
            accountingSoftware: onboardingData.accountingSoftware
          }, onboardingData.selectedService);
        };

        return (
          <FinalStepContent
            onScheduleCall={handleScheduleCall}
            onExploreAI={handleExploreAI}
            onViewReport={handleViewReport}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Left Panel - Brego Business Introduction */}
      <OnboardingSidebar />

      {/* Right Content Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/[0.02] rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="w-full max-w-[560px] relative z-10">
          {/* Mobile Logo - Only show on mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BregoLogo size={32} variant="full" />
            </div>
          </div>

          {/* Progress Indicator - Segmented */}
          <div className="mb-8">
            <div className="flex items-center gap-1.5 mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200 transition-all duration-500"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      index + 1 <= currentStep 
                        ? 'bg-brand w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-gray-500 font-medium">
                Step {currentStep} of {totalSteps}
              </p>
              {currentStep <= stepLabels.length && (
                <p className="text-[13px] text-brand font-medium">
                  {stepLabels[currentStep - 1]}
                </p>
              )}
            </div>
          </div>

          {/* Main Card */}
          <div 
            className="bg-white rounded-2xl border border-gray-200/70 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {/* Content Area */}
            <div 
              key={currentStep} 
              className="p-7 md:p-8 min-h-[420px] flex flex-col"
              style={{
                animation: direction === 'forward' 
                  ? 'stepSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' 
                  : 'stepSlideBack 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div className="flex-1">
                {renderStepContent()}
              </div>
            </div>

            {/* Navigation Footer — selections auto-advance, so only Back is
                needed. The right-side hint reassures users the flow is moving. */}
            {!isFinalStep() && (
              <div className="bg-gray-50/60 px-7 md:px-8 py-4 flex items-center justify-between border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200
                    ${currentStep === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.97]'
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <p className="text-[12px] text-gray-400 hidden sm:block">
                  Tap an option to continue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sample Report Modal */}
      {showReportModal && (
        <SampleReportModal onClose={() => setShowReportModal(false)} serviceType={onboardingData.selectedService} revenueRange={onboardingData.revenueRange} />
      )}

      <style>{`
        @keyframes stepSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes stepSlideBack {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}


// ===== Step Container =====
interface StepContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function StepContainer({ title, subtitle, children }: StepContainerProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-gray-900 leading-snug" style={{ fontSize: '20px' }}>{title}</h2>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}


// ===== Final Step (shared between PM & Finance) =====
function FinalStepContent({ 
  onScheduleCall, 
  onExploreAI,
  onViewReport 
}: { 
  onScheduleCall: () => void; 
  onExploreAI: () => void;
  onViewReport: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-3 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
          style={{ animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        >
          <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-gray-900 leading-snug" style={{ fontSize: '20px' }}>
          You're all set! What's next?
        </h2>
        <p className="text-sm text-gray-400">
          Choose how you'd like to continue with Brego Business
        </p>
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        {/* Schedule a Call */}
        <button
          onClick={onScheduleCall}
          className="w-full group"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200/80 bg-white hover:border-brand/30 hover:bg-brand-light hover:shadow-[0_4px_20px_rgba(32,76,199,0.1)] transition-all duration-300 active:scale-[0.98]">
            <div className="flex-shrink-0 w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-sm transition-all duration-300">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-sm">Schedule a Call</h3>
              <p className="text-xs text-gray-500 mt-0.5">Book a personalized consultation with our experts</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </button>

        {/* Explore Brego AI */}
        <button
          onClick={onExploreAI}
          className="w-full group"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200/80 bg-white hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)] transition-all duration-300 active:scale-[0.98]">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_2px_12px_rgba(139,92,246,0.25)] group-hover:shadow-[0_4px_16px_rgba(139,92,246,0.35)] transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-sm">Explore BregoGPT</h3>
              <p className="text-xs text-gray-500 mt-0.5">Discover our AI-powered growth assistant</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


// ===== Sample Report Modal =====
interface SampleReportModalProps {
  onClose: () => void;
  serviceType: ServiceType;
  revenueRange?: string;
}

function SampleReportModal({ onClose, serviceType, revenueRange }: SampleReportModalProps) {
  const isFinanceService = serviceType === 'Accounts & Taxation';
  
  const handleDownloadReport = () => {
    window.print();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold">
                {isFinanceService ? 'Sample Finance Health Report' : 'Sample Marketing Health Report'}
              </h2>
              <p className="text-xs text-gray-500">See what insights you'll receive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Close onboarding"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isFinanceService ? (
            <FinanceHealthReport 
              companyName="Sample Business"
              revenueRange={revenueRange || '₹1-5 Cr'}
            />
          ) : (
            <MarketingHealthReport 
              businessModel="ecommerce"
              companyName="Sample Business"
              connectedChannels={['Meta Ads', 'Google Ads', 'LinkedIn Ads']}
            />
          )}
        </div>
      </div>
    </div>
  );
}
