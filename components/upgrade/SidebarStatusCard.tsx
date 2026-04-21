import { Crown, CheckCircle2, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { WeeklyPulseCard } from './WeeklyPulseCard';

export interface OnboardingProgress {
  isUpgraded: boolean;
  selectedPlan: string;
  completedSteps: string[];
  currentStep: string;
  serviceType?: 'marketing' | 'finance';
  stoCompleted?: boolean;
}

type ServiceType = 'marketing' | 'finance';

const PM_STEPS = [
  { id: 'connect', label: 'Connect Accounts' },
  { id: 'basics', label: 'Setup Basics' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'products', label: 'Product Info' },
];

const FINANCE_STEPS = [
  { id: 'connect', label: 'Connect Accounts' },
  { id: 'basics', label: 'Setup Basics' },
  { id: 'dataAccess', label: 'Data Access' },
  { id: 'documents', label: 'Documents & Data' },
];

function getStepsForService(serviceType: ServiceType) {
  return serviceType === 'finance' ? FINANCE_STEPS : PM_STEPS;
}

interface SidebarStatusCardProps {
  onboardingProgress: OnboardingProgress | null;
  onUpgradeClick: () => void;
  onContinueOnboarding: () => void;
  serviceType?: ServiceType;
}

export function SidebarStatusCard({ onboardingProgress, onUpgradeClick, onContinueOnboarding, serviceType = 'marketing' }: SidebarStatusCardProps) {
  // If not upgraded, show Free Trial card
  if (!onboardingProgress || !onboardingProgress.isUpgraded) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/60 mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-900">Free Trial</span>
          <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">7 Days Left</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Upgrade to unlock all features and keep your data.</p>
        <button 
          onClick={onUpgradeClick}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  // Derive service type: prefer progress-embedded value > prop > auto-detect from completedSteps
  const resolvedServiceType: ServiceType = 
    onboardingProgress.serviceType || 
    (onboardingProgress.completedSteps.some(s => s === 'dataAccess' || s === 'documents') ? 'finance' : serviceType);
  
  const STEPS = getStepsForService(resolvedServiceType);
  const completedCount = onboardingProgress.completedSteps.filter(s => 
    STEPS.some(step => step.id === s)
  ).length;
  const totalSteps = STEPS.length;
  const allComplete = completedCount >= totalSteps;
  const progressPercent = (completedCount / totalSteps) * 100;

  // All steps complete — show Weekly Pulse (post-STO) or Setup Complete (pre-STO)
  if (allComplete) {
    if (onboardingProgress.stoCompleted) {
      return (
        <WeeklyPulseCard
          serviceType={resolvedServiceType}
          selectedPlan={onboardingProgress.selectedPlan}
        />
      );
    }
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/60 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Setup Complete</span>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          Your <span className="font-medium text-emerald-700">{onboardingProgress.selectedPlan}</span> plan is fully configured.
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full w-full" />
          </div>
          <span className="text-[10px] font-medium text-emerald-600">100%</span>
        </div>
      </div>
    );
  }

  // Onboarding in progress — show progress card with resume CTA
  const nextStepId = onboardingProgress.currentStep;
  const nextStep = STEPS.find(s => s.id === nextStepId && !onboardingProgress.completedSteps.includes(s.id)) 
    || STEPS.find(s => !onboardingProgress.completedSteps.includes(s.id));

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-4 border border-blue-200/60 mb-3 relative overflow-hidden">
      {/* Subtle shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" 
        style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Rocket className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Setting Up</span>
          <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {completedCount}/{totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-blue-600">{Math.round(progressPercent)}%</span>
        </div>

        {/* Step checklist */}
        <div className="space-y-1.5 mb-3">
          {STEPS.map((step) => {
            const isCompleted = onboardingProgress.completedSteps.includes(step.id);
            const isCurrent = step.id === nextStep?.id && !isCompleted;
            
            return (
              <div key={step.id} className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-xs ${
                  isCompleted ? 'text-gray-400 line-through' : isCurrent ? 'text-blue-700 font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Continue CTA */}
        <button
          onClick={onContinueOnboarding}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm shadow-blue-500/20 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 group"
        >
          {nextStep ? `Continue: ${nextStep.label}` : 'Continue Setup'}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}