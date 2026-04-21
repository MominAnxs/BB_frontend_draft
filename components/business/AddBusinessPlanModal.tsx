'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Sparkles, PartyPopper, TrendingUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PricingPage } from '../upgrade/PricingPage';
import { ProgressRing } from '../ui/ProgressRing';

type Stage = 'service' | 'pricing' | 'processing' | 'success';

interface AddBusinessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after payment success — passes selected service + plan name */
  onComplete: (service: 'Performance Marketing' | 'Accounts & Taxation', plan: string) => void;
  /** If provided, skip the service-picker and open the pricing page directly
   *  for this service (e.g. when entering from a cross-sell CTA like
   *  "Explore Finance"). */
  preSelectedService?: 'Performance Marketing' | 'Accounts & Taxation';
}

export function AddBusinessPlanModal({ isOpen, onClose, onComplete, preSelectedService }: AddBusinessPlanModalProps) {
  const [stage, setStage] = useState<Stage>('service');
  const [selectedService, setSelectedService] = useState<'Performance Marketing' | 'Accounts & Taxation' | ''>('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Stable ref for onComplete to avoid re-triggering effects
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Reset on open — if a service was preselected (from cross-sell CTA), jump
  // straight to the pricing stage for that service.
  useEffect(() => {
    if (isOpen) {
      if (preSelectedService) {
        setStage('pricing');
        setSelectedService(preSelectedService);
      } else {
        setStage('service');
        setSelectedService('');
      }
      setSelectedPlan('');
      setProcessingProgress(0);
    }
  }, [isOpen, preSelectedService]);

  // Payment processing animation
  useEffect(() => {
    if (stage === 'processing') {
      setProcessingProgress(0);
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

  // Auto-advance from success → fire onComplete
  useEffect(() => {
    if (stage === 'success' && selectedService) {
      const timer = setTimeout(() => {
        onCompleteRef.current(selectedService as 'Performance Marketing' | 'Accounts & Taxation', selectedPlan);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [stage, selectedService, selectedPlan]);

  const handleServiceSelect = (service: 'Performance Marketing' | 'Accounts & Taxation') => {
    setSelectedService(service);
    setStage('pricing');
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    setStage('processing');
  };

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
            onClick={stage === 'service' || stage === 'pricing' ? onClose : undefined}
          />

          {/* Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4">

            {/* Stage: Service Selection */}
            {stage === 'service' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                <div className="px-7 pt-7 pb-3 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-gray-900 mb-1.5" style={{ fontSize: '20px' }}>Add a New Business</h2>
                  <p className="text-sm text-gray-500">
                    Choose the service to view plans & pricing
                  </p>
                </div>

                <div className="px-7 pb-7 pt-4 space-y-3">
                  {/* Performance Marketing */}
                  <button
                    onClick={() => handleServiceSelect('Performance Marketing')}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 text-left transition-all duration-200 group hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:shadow-lg group-hover:shadow-blue-500/25 flex items-center justify-center transition-all duration-200">
                        <TrendingUp className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Performance Marketing</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Paid ads, campaigns, ROAS tracking</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50 flex items-center justify-center transition-all">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Accounts & Taxation */}
                  <button
                    onClick={() => handleServiceSelect('Accounts & Taxation')}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 text-left transition-all duration-200 group hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:shadow-lg group-hover:shadow-emerald-500/25 flex items-center justify-center transition-all duration-200">
                        <FileText className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Accounts & Taxation</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Bookkeeping, compliance, P&L, tax</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 flex items-center justify-center transition-all">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage: Plan Selection (PricingPage) */}
            {stage === 'pricing' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Back to service selection — hidden when a service was
                    preselected (user entered from a cross-sell CTA and has no
                    picker to go back to). */}
                {!preSelectedService && (
                  <button
                    onClick={() => { setStage('service'); setSelectedService(''); }}
                    className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-gray-100 rounded-full text-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                <div className="overflow-y-auto flex-1">
                  <PricingPage
                    service={selectedService === 'Accounts & Taxation' ? 'finance' : 'marketing'}
                    onSelectPlan={handlePlanSelect}
                  />
                </div>
              </motion.div>
            )}

            {/* Stage: Processing Payment */}
            {stage === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-white rounded-2xl p-10 text-center"
                style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
              >
                <div className="mb-8">
                  <ProgressRing
                    value={processingProgress}
                    size={84}
                    strokeWidth={3}
                    gradientId="add-business-plan-progress"
                  />
                </div>
                <h3 className="text-gray-900 mb-2" style={{ fontSize: '18px' }}>Processing payment...</h3>
                <p className="text-sm text-gray-500">Setting up your {selectedPlan} plan</p>

                <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* Stage: Payment Success */}
            {stage === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-white rounded-2xl p-10 text-center"
                style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
              >
                <div className="mb-6 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none"
                  >
                    <Sparkles className="absolute top-0 left-2 w-5 h-5 text-amber-400" style={{ animation: 'float 2s ease-in-out infinite' }} />
                    <PartyPopper className="absolute top-4 right-0 w-5 h-5 text-blue-500" style={{ animation: 'float 2s ease-in-out infinite 0.5s' }} />
                    <Sparkles className="absolute bottom-8 left-0 w-4 h-4 text-pink-400" style={{ animation: 'float 2s ease-in-out infinite 1s' }} />
                  </motion.div>
                </div>

                <h3 className="text-gray-900 mb-2" style={{ fontSize: '22px' }}>Payment Successful!</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Your {selectedPlan} plan is active. Let's set up your business.
                </p>
                <p className="text-xs text-gray-400">Continuing to onboarding...</p>

                <div className="mt-6 flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full" style={{ animation: 'pulse 1s ease-in-out infinite 0.2s' }} />
                  <div className="w-2 h-2 bg-blue-300 rounded-full" style={{ animation: 'pulse 1s ease-in-out infinite 0.4s' }} />
                </div>
              </motion.div>
            )}
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
