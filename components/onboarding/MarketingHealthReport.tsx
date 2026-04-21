'use client';

import { useState } from 'react';
import { 
  MetricsCardsComponent, 
  PerformanceChartComponent, 
  WhatsWorkingComponent, 
  WhatsBrokenComponent, 
  RecommendationsComponent,
  WarningFooterComponent 
} from '../chat/ReportComponents';

interface MarketingHealthReportProps {
  businessModel?: 'ecommerce' | 'leadgen';
  companyName?: string;
  connectedChannels?: string[];
}

export function MarketingHealthReport({ 
  businessModel = 'ecommerce', 
  companyName = 'Sample Business',
  connectedChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads']
}: MarketingHealthReportProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);

  const channelOptions = ['All Channels', ...connectedChannels];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Report Header with Channel Filter */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>Marketing Health Report</span>
            </h2>
            <p className="text-sm text-gray-600">
              <strong className="font-semibold text-gray-900">{companyName}</strong> 
              <span className="text-gray-400 mx-2">•</span> 
              <span className="text-gray-600">{businessModel === 'ecommerce' ? 'E-commerce' : 'Lead Gen'}</span>
            </p>
          </div>

          {/* Channel Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 min-w-[180px] justify-between shadow-sm hover:shadow hover:border-gray-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-gray-700">{selectedChannel === 'all' ? 'All Channels' : selectedChannel}</span>
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isChannelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isChannelDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Filter by Channel
                </div>
                {channelOptions.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      setSelectedChannel(channel === 'All Channels' ? 'all' : channel);
                      setIsChannelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                      (selectedChannel === 'all' && channel === 'All Channels') || selectedChannel === channel
                        ? 'bg-brand-light text-brand font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{channel}</span>
                    {((selectedChannel === 'all' && channel === 'All Channels') || selectedChannel === channel) && (
                      <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">🎯</span>
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Metrics</h3>
          {selectedChannel !== 'all' && (
            <span className="ml-auto text-xs font-medium text-brand bg-brand-light px-3 py-1 rounded-full">
              {selectedChannel}
            </span>
          )}
        </div>
        <MetricsCardsComponent businessModel={businessModel} selectedChannel={selectedChannel} />
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
        <PerformanceChartComponent businessModel={businessModel} selectedChannel={selectedChannel} />
      </div>

      {/* What Needs Fixing */}
      <div className="bg-gradient-to-br from-red-50/30 to-white rounded-2xl px-8 py-6 shadow-sm border border-red-100">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900">What Needs Fixing</h3>
          <span className="ml-auto text-xs font-medium text-red-600 bg-red-100 px-2.5 py-1 rounded-full">4 Issues</span>
        </div>
        <WhatsBrokenComponent businessModel={businessModel} />
      </div>

      {/* What's Working */}
      <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl px-8 py-6 shadow-sm border border-emerald-100">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">✨</span>
          <h3 className="text-lg font-semibold text-gray-900">What's Working</h3>
          <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">3 Wins</span>
        </div>
        <WhatsWorkingComponent businessModel={businessModel} />
      </div>

      {/* Action Plan */}
      <div className="bg-brand-light rounded-2xl px-8 py-6 shadow-sm border border-brand/10">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Action Plan</h3>
          <span className="ml-auto text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-full">3 Actions</span>
        </div>
        <RecommendationsComponent businessModel={businessModel} />
      </div>

      {/* Warning Footer */}
      <div className="bg-amber-50/50 rounded-2xl px-8 py-5 shadow-sm border border-amber-200">
        <WarningFooterComponent businessModel={businessModel} />
      </div>
    </div>
  );
}
