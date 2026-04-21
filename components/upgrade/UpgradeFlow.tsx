'use client';

import { useState, useEffect } from 'react';
import { UserInfo } from '../../types';
import { PricingPage } from './PricingPage';
import { PostPaymentOnboarding } from './PostPaymentOnboarding';
import { PostPaymentCompletionModal } from './PostPaymentCompletionModal';
import { OnboardingProgress } from './SidebarStatusCard';
import { ProgressRing } from '../ui/ProgressRing';
import { X } from 'lucide-react';

type UpgradeStage = 'pricing' | 'processing' | 'success' | 'onboarding';

interface UpgradeFlowProps {
  userInfo: UserInfo;
  onClose: () => void;
  onComplete: () => void;
  /** Called when payment is confirmed — sets upgraded state */
  onUpgradeConfirmed?: (plan: string) => void;
  /** Called when a step is completed in onboarding */
  onStepComplete?: (stepId: string) => void;
  /** Called when user navigates to a different step */
  onStepChange?: (stepId: string) => void;
  /** If provided, resume onboarding at this step (skip pricing/payment) */
  resumeOnboarding?: OnboardingProgress;
  /** Called after Connect Accounts step in initial flow — triggers syncing modal */
  onConnectAndSync?: () => void;
}

export function UpgradeFlow({ 
  userInfo, onClose, onComplete, 
  onUpgradeConfirmed, onStepComplete, onStepChange,
  resumeOnboarding, onConnectAndSync
}: UpgradeFlowProps) {
  const isResuming = resumeOnboarding && resumeOnboarding.isUpgraded;
  const [stage, setStage] = useState<UpgradeStage>(isResuming ? 'onboarding' : 'pricing');
  const [selectedPlan, setSelectedPlan] = useState<string>(resumeOnboarding?.selectedPlan || '');
  const [processingProgress, setProcessingProgress] = useState(0);

  const isFinanceService = userInfo.selectedService === 'Accounts & Taxation';

  // Derive businessType for the completion modal
  const businessType: 'leadgen' | 'ecommerce' | 'finance' = isFinanceService
    ? 'finance'
    : (userInfo.businessModel === 'leadgen' ? 'leadgen' : 'ecommerce');

  // Payment processing animation
  useEffect(() => {
    if (stage === 'processing') {
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage('success'), 300);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // NO auto-advance — user clicks "Setup your Dashboard" CTA to proceed

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    setStage('processing');
    // Fire upgrade confirmed callback
    onUpgradeConfirmed?.(planName);
  };

  // In initial (non-resume) flow, Connect Accounts triggers syncing modal
  const handleConnectOnlyComplete = () => {
    onStepComplete?.('connect');
    if (onConnectAndSync) {
      onConnectAndSync();
    } else {
      onComplete();
    }
  };

  // When "Setup your Dashboard" is clicked in the welcome modal
  const handleWelcomeContinue = () => {
    setStage('onboarding');
  };

  // Hide UpgradeFlow's own backdrop during success stage (the modal provides its own)
  const showOwnBackdrop = stage !== 'success';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop — hidden during success stage since the modal brings its own */}
      {showOwnBackdrop && (
        <div 
          className="absolute inset-0 bg-black/25 backdrop-blur-[6px]" 
          style={{ animation: 'fadeIn 0.3s ease-out' }}
          onClick={stage === 'pricing' || stage === 'onboarding' ? onClose : undefined}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        
        {/* Stage: Pricing */}
        {stage === 'pricing' && (
          <div 
            className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{ 
              boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-gray-100 transition-colors"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="overflow-y-auto flex-1">
              <PricingPage 
                service={isFinanceService ? 'finance' : 'marketing'}
                onSelectPlan={handlePlanSelect}
              />
            </div>
          </div>
        )}

        {/* Stage: Processing Payment */}
        {stage === 'processing' && (
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-10 text-center"
            style={{ 
              boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            {/* Animated loader — clean single-ring indicator */}
            <div className="mb-8">
              <ProgressRing
                value={processingProgress}
                size={84}
                strokeWidth={3}
                gradientId="upgrade-flow-progress"
              />
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontSize: '18px' }}>Processing your upgrade...</h3>
            <p className="text-sm text-gray-500">Setting up your {selectedPlan} plan</p>
            
            {/* Progress bar */}
            <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stage: Post-Payment Onboarding */}
        {stage === 'onboarding' && (
          isResuming ? (
            // Resume mode: Full multi-step onboarding
            <div 
              className="w-full h-full max-w-[1200px] max-h-[94vh] bg-white rounded-2xl overflow-hidden flex flex-col"
              style={{ 
                boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
                animation: 'slideUp 0.5s ease-out'
              }}
            >
              <PostPaymentOnboarding 
                userInfo={userInfo}
                selectedPlan={selectedPlan}
                onComplete={onComplete}
                onClose={onClose}
                onStepComplete={onStepComplete}
                onStepChange={onStepChange}
                initialStep={resumeOnboarding?.currentStep}
                completedSteps={resumeOnboarding?.completedSteps}
              />
            </div>
          ) : (
            // Initial flow: Connect Accounts only (compact modal)
            <div 
              className="w-full max-w-[640px] max-h-[88vh] bg-white rounded-2xl overflow-hidden flex flex-col min-h-0"
              style={{ 
                boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
                animation: 'slideUp 0.5s ease-out'
              }}
            >
              <PostPaymentOnboarding 
                userInfo={userInfo}
                selectedPlan={selectedPlan}
                onComplete={handleConnectOnlyComplete}
                onClose={onClose}
                onStepComplete={onStepComplete}
                onStepChange={onStepChange}
                connectOnly
              />
            </div>
          )
        )}
      </div>

      {/* Stage: Welcome to Brego Business — redesigned celebration modal */}
      {stage === 'success' && (
        <PostPaymentCompletionModal
          isOpen={true}
          onClose={handleWelcomeContinue}
          selectedPlan={selectedPlan}
          businessType={businessType}
          headline="Welcome to Brego Business"
          subheadline="Your dedicated growth engine is now active."
          ctaLabel="Setup your Dashboard"
          hideClose
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
