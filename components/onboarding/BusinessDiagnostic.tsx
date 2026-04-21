'use client';

import { useState, type ReactNode } from 'react';
import { DiagnosticData } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { GoogleAdsIcon, MetaAdsIcon, GoogleAnalyticsIcon, ShopifyIcon } from '../BrandIcons';

interface BusinessDiagnosticProps {
  onSubmit: (data: DiagnosticData) => void;
  onBack: () => void;
}

export function BusinessDiagnostic({ onSubmit, onBack }: BusinessDiagnosticProps) {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData>({
    businessModel: '',
    adSpendRange: 50000,
    connectedAccounts: {
      metaAds: false,
      googleAds: false,
      linkedinAds: false,
      shopify: false,
      ga4: false
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBusinessModelChange = (model: 'ecommerce' | 'leadgen') => {
    setDiagnosticData(prev => ({ ...prev, businessModel: model }));
  };

  const handleAccountToggle = (account: keyof DiagnosticData['connectedAccounts']) => {
    setDiagnosticData(prev => ({
      ...prev,
      connectedAccounts: {
        ...prev.connectedAccounts,
        [account]: !prev.connectedAccounts[account]
      }
    }));
  };

  const handleAnalyze = () => {
    if (!diagnosticData.businessModel) {
      alert('Please select your business type');
      return;
    }

    setIsAnalyzing(true);
    // Simulate analysis time
    setTimeout(() => {
      onSubmit(diagnosticData);
    }, 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const connectedCount = Object.values(diagnosticData.connectedAccounts).filter(Boolean).length;

  return (
    <div className="animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Performance Marketing Health Check</h2>
        <p className="text-gray-600">Get instant insights on what's working and what needs fixing</p>
      </div>

      {/* Business Type Selection */}
      <div className="mb-8">
        <label className="block text-gray-700 mb-3">
          What type of business do you run? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleBusinessModelChange('ecommerce')}
            className={`p-5 border-2 rounded-lg transition-all text-left ${
              diagnosticData.businessModel === 'ecommerce'
                ? 'border-brand bg-brand-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                diagnosticData.businessModel === 'ecommerce' ? 'bg-brand' : 'bg-gray-100'
              }`}>
                <svg
                  className={`w-5 h-5 ${diagnosticData.businessModel === 'ecommerce' ? 'text-white' : 'text-gray-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-0.5">E-commerce</h4>
                <p className="text-gray-600 text-sm">Selling products online</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleBusinessModelChange('leadgen')}
            className={`p-5 border-2 rounded-lg transition-all text-left ${
              diagnosticData.businessModel === 'leadgen'
                ? 'border-brand bg-brand-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                diagnosticData.businessModel === 'leadgen' ? 'bg-brand' : 'bg-gray-100'
              }`}>
                <svg
                  className={`w-5 h-5 ${diagnosticData.businessModel === 'leadgen' ? 'text-white' : 'text-gray-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-0.5">Lead Generation</h4>
                <p className="text-gray-600 text-sm">Collecting & converting leads</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Ad Spend Range */}
      <div className="mb-8">
        <label className="block text-gray-700 mb-3">
          What's your monthly ad spend?
        </label>
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="text-center mb-4">
            <span className="text-3xl text-gray-900">{formatCurrency(diagnosticData.adSpendRange)}</span>
            <span className="text-gray-600 text-sm ml-1">/month</span>
          </div>
          <input
            type="range"
            min="10000"
            max="5000000"
            step="10000"
            value={diagnosticData.adSpendRange}
            onChange={(e) => setDiagnosticData(prev => ({ ...prev, adSpendRange: Number(e.target.value) }))}
            className="w-full h-2 bg-brand/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>₹10K</span>
            <span>₹50L+</span>
          </div>
        </div>
      </div>

      {/* Connect Accounts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-gray-700">
            Connect your marketing accounts
          </label>
          <span className="text-sm text-gray-500">{connectedCount}/4 connected</span>
        </div>
        <p className="text-sm text-gray-600 mb-4 bg-brand-light border border-brand/20 rounded-lg p-3">
          🔒 Connect your accounts to get a free performance audit - no changes will be made
        </p>

        <div className="space-y-2">
          <AccountConnectionCard
            icon={<MetaAdsIcon size={22} />}
            name="Meta Ads"
            description="Facebook & Instagram Ads"
            isConnected={diagnosticData.connectedAccounts.metaAds}
            onToggle={() => handleAccountToggle('metaAds')}
          />

          <AccountConnectionCard
            icon={<GoogleAdsIcon size={22} />}
            name="Google Ads"
            description="Search, Display & YouTube"
            isConnected={diagnosticData.connectedAccounts.googleAds}
            onToggle={() => handleAccountToggle('googleAds')}
          />

          <AccountConnectionCard
            icon={<ShopifyIcon size={22} />}
            name="Shopify"
            description="E-commerce platform"
            isConnected={diagnosticData.connectedAccounts.shopify}
            onToggle={() => handleAccountToggle('shopify')}
          />

          <AccountConnectionCard
            icon={<GoogleAnalyticsIcon size={22} />}
            name="Google Analytics 4"
            description="Website analytics"
            isConnected={diagnosticData.connectedAccounts.ga4}
            onToggle={() => handleAccountToggle('ga4')}
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !diagnosticData.businessModel}
        className="w-full bg-brand text-white py-3 rounded-lg hover:bg-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing your marketing performance...
          </>
        ) : (
          'Get Free Performance Audit'
        )}
      </button>

      {!diagnosticData.businessModel && (
        <p className="text-center text-sm text-gray-500 mt-3">Please select your business type to continue</p>
      )}
    </div>
  );
}

interface AccountConnectionCardProps {
  icon: ReactNode;
  name: string;
  description: string;
  isConnected: boolean;
  onToggle: () => void;
}

function AccountConnectionCard({
  icon,
  name,
  description,
  isConnected,
  onToggle,
}: AccountConnectionCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full p-4 border-2 rounded-lg transition-all ${
        isConnected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isConnected ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}>
          {isConnected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
