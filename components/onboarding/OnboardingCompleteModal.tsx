'use client';

import { useState } from 'react';
import { CheckCircle2, Sparkles, Star, ArrowRight, Clock } from 'lucide-react';

interface OnboardingCompleteModalProps {
  stepsCompleted: number;
  onExploreBregoGPT: () => void;
}

export function OnboardingCompleteModal({ stepsCompleted, onExploreBregoGPT }: OnboardingCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop — soft blur so the chat app is visible underneath */}
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-[6px]"
        style={{ animation: 'obcFadeIn 0.35s ease-out' }}
      />

      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-[420px] mx-4"
        style={{ animation: 'obcSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div 
          className="bg-white rounded-2xl overflow-hidden border border-gray-200/60"
          style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
        >
          {/* Top accent bar */}
          <div className="h-[3px] bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500" />

          <div className="px-8 pt-8 pb-7 text-center">
            {/* Success icon with floating decorations */}
            <div className="relative mb-6 flex items-center justify-center h-[80px]">
              {/* Subtle pulse rings */}
              <div 
                className="absolute w-[72px] h-[72px] rounded-full border-2 border-emerald-200/40"
                style={{ animation: 'obcPulse 2.5s ease-out infinite' }}
              />
              <div 
                className="absolute w-[92px] h-[92px] rounded-full border border-emerald-100/25"
                style={{ animation: 'obcPulse 2.5s ease-out infinite 0.6s' }}
              />

              {/* Main checkmark circle */}
              <div 
                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative z-10"
                style={{ animation: 'obcScaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s both' }}
              >
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>

              {/* Floating decorative elements */}
              <Star 
                className="absolute top-1 left-[28%] w-4 h-4 text-amber-400/60 fill-amber-400/30" 
                style={{ animation: 'obcFloat 3s ease-in-out infinite' }} 
              />
              <Sparkles 
                className="absolute top-0 right-[26%] w-4 h-4 text-brand/30" 
                style={{ animation: 'obcFloat 3s ease-in-out infinite 1.2s' }} 
              />
            </div>

            {/* Headline */}
            <h2 
              className="text-gray-900 mb-3"
              style={{ fontSize: '22px', animation: 'obcFadeUp 0.4s ease-out 0.3s both' }}
            >
              You're all set!
            </h2>

            {/* Status line — what's happening now */}
            <div 
              className="inline-flex items-center gap-2 bg-amber-50/80 border border-amber-200/50 rounded-full px-4 py-1.5 mb-4"
              style={{ animation: 'obcFadeUp 0.4s ease-out 0.38s both' }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: 'obcStatusPulse 2s ease-in-out infinite' }} />
              </div>
              <span className="text-[13px] text-amber-700">Our team is setting up your account</span>
            </div>

            {/* Body copy — the while-you-wait invitation */}
            <p 
              className="text-gray-500 max-w-[310px] mx-auto mb-7"
              style={{ fontSize: '14px', lineHeight: '1.7', animation: 'obcFadeUp 0.4s ease-out 0.46s both' }}
            >While we get everything ready —<br />take <span className="text-gray-700">BregoGPT</span> for a spin and explore all the features<br />.</p>

            {/* Explore BregoGPT CTA */}
            <div style={{ animation: 'obcFadeUp 0.4s ease-out 0.56s both' }}>
              <button
                onClick={onExploreBregoGPT}
                className="group w-full relative overflow-hidden rounded-2xl bg-brand p-[1px] transition-all duration-300 hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="relative rounded-[15px] bg-brand px-5 py-4">
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 rounded-[15px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <div className="relative flex items-center gap-3.5">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white" style={{ fontSize: '14px' }}>Explore BregoGPT</p>
                      <p className="text-white/60 text-xs">Your AI-powered growth assistant</p>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer note */}
            <p 
              className="mt-5 text-[13px] text-gray-500"
              style={{ animation: 'obcFadeUp 0.4s ease-out 0.66s both' }}
            >
              Your dedicated manager will be in touch shortly
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes obcFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes obcSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes obcScaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes obcFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes obcPulse {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes obcFloat {
          0%, 100% { opacity: 0.4; transform: translateY(0) scale(0.85); }
          50% { opacity: 0.8; transform: translateY(-5px) scale(1); }
        }
        @keyframes obcStatusPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
