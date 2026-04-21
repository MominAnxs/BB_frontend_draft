'use client';

import { useState } from 'react';
import { DiagnosticData, UserInfo } from '../../types';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Target, IndianRupee, Users, BarChart3, Sparkles } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DiagnosticReportProps {
  data: DiagnosticData;
  onBack?: () => void;
}

export function DiagnosticReport({ data, onBack }: DiagnosticReportProps) {
  const [showAIChat, setShowAIChat] = useState(false);

  // Mock data based on business model
  const isEcommerce = data.businessModel === 'ecommerce';
  
  const mockData = {
    spends: data.adSpendRange,
    revenue: isEcommerce ? data.adSpendRange * 3.2 : null,
    leads: isEcommerce ? null : Math.floor(data.adSpendRange / 250),
    roas: isEcommerce ? 3.2 : null,
    cpl: isEcommerce ? null : 250,
    cac: isEcommerce ? Math.floor(data.adSpendRange * 0.12) : Math.floor(data.adSpendRange / 200),
    costPerPurchase: isEcommerce ? Math.floor(data.adSpendRange * 0.15) : null,
    trend: 12.5,
    bestChannel: 'Meta Ads',
    bestCampaign: 'Product Launch - Winter Collection',
    bestCreative: 'Video Ad - Customer Testimonial',
    issues: [
      { title: 'High Creative Fatigue', metric: 'Frequency: 8.2x', severity: 'high' },
      { title: 'Channel Inefficiency', metric: 'Google Ads ROAS: 1.2x', severity: 'medium' }
    ],
    risks: [
      { title: 'Over-dependence on Meta Ads', value: '78% of budget', severity: 'high' },
      { title: 'Declining Efficiency', value: 'ROAS down 15% MoM', severity: 'medium' },
      { title: 'No Creative Refresh', value: 'Same ads for 45 days', severity: 'medium' }
    ],
    recommendations: [
      { action: 'Reallocate Budget', detail: `Move ₹${(data.adSpendRange * 0.15).toLocaleString('en-IN')} from Meta to Google Shopping`, impact: '+25% ROAS' },
      { action: 'Pause Underperforming', detail: '3 campaigns with ROAS < 1.5x', impact: 'Save ₹12,000/mo' },
      { action: 'Launch Creative Tests', detail: 'Test 5 new video formats with UGC content', impact: '+30% CTR' }
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-5">
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand px-4 py-2 rounded-full mb-3" style={{ fontSize: '14px' }}>
          <Sparkles className="w-4 h-4" />
          <span>Performance Marketing Diagnostic</span>
        </div>
        <h2 className="text-gray-900 mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>Your Marketing Analysis is Ready! 🎉</h2>
        <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400 }}>
          Here's what we found analyzing your performance data
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="bg-brand rounded-xl shadow-md p-6 text-white">
        <div className="text-white/70 mb-4" style={{ fontSize: '14px', fontWeight: 400 }}>Key Performance Metrics</div>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Total Spends"
            value={formatCurrency(mockData.spends)}
            trend={-mockData.trend}
            icon={<IndianRupee className="w-4 h-4" />}
          />
          {isEcommerce ? (
            <>
              <MetricCard
                label="Revenue"
                value={formatCurrency(mockData.revenue!)}
                trend={mockData.trend}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <MetricCard
                label="ROAS"
                value={`${mockData.roas}x`}
                trend={-5.2}
                icon={<Target className="w-4 h-4" />}
              />
              <MetricCard
                label="Cost per Purchase"
                value={formatCurrency(mockData.costPerPurchase!)}
                trend={-7.3}
                icon={<IndianRupee className="w-4 h-4" />}
              />
            </>
          ) : (
            <>
              <MetricCard
                label="Leads Generated"
                value={mockData.leads!.toString()}
                trend={mockData.trend}
                icon={<Users className="w-4 h-4" />}
              />
              <MetricCard
                label="Cost Per Lead"
                value={formatCurrency(mockData.cpl!)}
                trend={-8.5}
                icon={<Target className="w-4 h-4" />}
              />
            </>
          )}
          <MetricCard
            label="CAC"
            value={formatCurrency(mockData.cac)}
            trend={-6.8}
            icon={<Users className="w-4 h-4" />}
          />
          <MetricCard
            label="Trend"
            value={`${mockData.trend > 0 ? '+' : ''}${mockData.trend}%`}
            trend={mockData.trend}
            icon={<BarChart3 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Performance Snapshot Chart */}
      <PerformanceSnapshotChart isEcommerce={isEcommerce} adSpendRange={data.adSpendRange} />

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">AI Marketing Assistant</h3>
            <button
              onClick={() => setShowAIChat(false)}
              className="text-gray-400 hover:text-gray-600"
              style={{ fontSize: '20px' }}
            >
              ✕
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              <AIMessage message="Hi! I've analyzed your marketing data. What would you like to know?" />
              <AIMessage message="Here are some quick insights I can help with:" />
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-brand-light transition-colors border border-gray-200" style={{ fontSize: '14px' }}>
                  💡 Why is my Meta Ads frequency so high?
                </button>
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-brand-light transition-colors border border-gray-200" style={{ fontSize: '14px' }}>
                  📊 How can I improve my Google Ads performance?
                </button>
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-brand-light transition-colors border border-gray-200" style={{ fontSize: '14px' }}>
                  🎯 What's the best budget allocation for my campaigns?
                </button>
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Ask me anything about your marketing performance..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white"
            style={{ fontSize: '14px' }}
          />
        </div>
      )}

      <div className="space-y-6">
        {/* What's Working */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-gray-900">What's Working</h3>
          </div>
          <p className="text-gray-600 mb-5 ml-13" style={{ fontSize: '14px', fontWeight: 400 }}>We know where your wins are</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Best Channel */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <div className="text-green-700 mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>Best Channel</div>
              
              {/* Channel Name */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>M</span>
                </div>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>{mockData.bestChannel}</span>
              </div>
              
              {/* Outcome (ROAS) */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                <div className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>ROAS</div>
                <div className="text-green-600" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {isEcommerce ? '4.2x' : '2.8x'}
                </div>
              </div>
              
              {/* % Contribution */}
              <div className="flex items-center justify-between mb-3 bg-white rounded-lg p-3 border border-green-200">
                <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Contribution</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>78%</span>
              </div>
              
              {/* Insight Context */}
              <div className="bg-green-600 text-white rounded-lg p-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>This channel drives majority of your conversions with highest efficiency</span>
                </div>
              </div>
            </div>

            {/* Card 2: Best Campaign */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <div className="text-green-700 mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>Best Campaign</div>
              
              {/* Campaign Name */}
              <div className="mb-3">
                <div className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4 }}>
                  {mockData.bestCampaign}
                </div>
                <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Meta Ads • Active Campaign</div>
              </div>
              
              {/* Spend vs Result */}
              <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Spend</div>
                    <div className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
                      {formatCurrency(data.adSpendRange * 0.25)}
                    </div>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Result</div>
                    <div className="text-green-600" style={{ fontSize: '14px', fontWeight: 700 }}>
                      {isEcommerce ? formatCurrency(data.adSpendRange * 1.05) : '285 Leads'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600" style={{ fontSize: '13px' }}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{isEcommerce ? '4.2x ROAS' : '₹176 CPL'}</span>
                </div>
              </div>
              
              {/* Insight Context */}
              <div className="bg-green-600 text-white rounded-lg p-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Outperforming other campaigns by 85% with consistent conversion rates</span>
                </div>
              </div>
            </div>

            {/* Card 3: Best Creative */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <div className="text-green-700 mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>Best Creative</div>
              
              {/* Creative Thumbnail */}
              <div className="mb-3 rounded-lg overflow-hidden border-2 border-green-300">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
                  alt="Best performing creative"
                  className="w-full h-24 object-cover"
                />
              </div>
              
              {/* Creative Name */}
              <div className="text-gray-900 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
                Video Ad - Customer Testimonial
              </div>
              
              {/* ROAS & Days Active */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white rounded-lg p-2.5 border border-green-200">
                  <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>ROAS</div>
                  <div className="text-green-600" style={{ fontSize: '18px', fontWeight: 700 }}>5.8x</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-green-200">
                  <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Days Active</div>
                  <div className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>12</div>
                </div>
              </div>
              
              {/* Insight Context */}
              <div className="bg-green-600 text-white rounded-lg p-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Highest CTR at 8.5% with strong engagement and low frequency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Broken */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-900">What's Broken</h3>
                <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>Critical diagnosis from our AI + Human analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>8 Issues Detected</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-5 ml-13" style={{ fontSize: '14px', fontWeight: 400 }}>We've identified performance gaps that are costing you money</p>
          
          {/* Scrollable Diagnosis Cards */}
          <div className="max-h-[420px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
            {/* Diagnosis Card 1: Creative Fatigue */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-orange-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>High</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Creative Fatigue Detected
                    </h4>
                    <div className="bg-orange-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      -34%
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    Your audience has seen the same ads too many times. Frequency crossed <span className="text-orange-700" style={{ fontWeight: 700 }}>3.8x</span> with no new creatives in last <span style={{ fontWeight: 700 }}>28 days</span>
                  </p>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Frequency</div>
                      <div className="text-orange-600" style={{ fontSize: '14px', fontWeight: 700 }}>3.8x</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>CTR Drop</div>
                      <div className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>-34%</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Days Stale</div>
                      <div className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>28</div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-orange-700" style={{ fontWeight: 600 }}>Wasting ₹42K/month on fatigued creatives</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 2: Efficiency Drop */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-red-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Critical</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Spend-Outcome Mismatch
                    </h4>
                    <div className="bg-red-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      Urgent
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    You increased spend by <span className="text-green-600" style={{ fontWeight: 700 }}>↑21%</span> but outcomes dropped by <span className="text-red-600" style={{ fontWeight: 700 }}>↓16%</span> — Your efficiency is collapsing
                  </p>
                  
                  {/* Comparison Visual */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>Last Month</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700" style={{ fontSize: '13px' }}>Spend:</span>
                          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>₹1.2L</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700" style={{ fontSize: '13px' }}>ROAS:</span>
                          <span className="text-green-600" style={{ fontSize: '14px', fontWeight: 700 }}>3.8x</span>
                        </div>
                      </div>
                      <div className="text-gray-400" style={{ fontSize: '18px' }}>→</div>
                      <div className="flex-1">
                        <div className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>This Month</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700" style={{ fontSize: '13px' }}>Spend:</span>
                          <span className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>₹1.45L ↑21%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700" style={{ fontSize: '13px' }}>ROAS:</span>
                          <span className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>3.2x ↓16%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-red-700" style={{ fontWeight: 600 }}>Losing ₹25K more per month vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 3: Channel Dependency */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-amber-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Medium</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Channel Over-Dependency Risk
                    </h4>
                    <div className="bg-amber-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      Risk
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    <span className="text-amber-700" style={{ fontWeight: 700 }}>82%</span> of your outcomes come from Google Ads alone. One algorithm change could destroy your pipeline
                  </p>
                  
                  {/* Channel Breakdown */}
                  <div className="space-y-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Google Ads</span>
                        <span className="text-amber-700" style={{ fontSize: '13px', fontWeight: 700 }}>82%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Meta Ads</span>
                        <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 700 }}>14%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '14%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Others</span>
                        <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 700 }}>4%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '4%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-amber-700" style={{ fontWeight: 600 }}>High vulnerability to platform changes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 4: Funnel Leakage */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-orange-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>High</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Massive Funnel Leaks Detected
                    </h4>
                    <div className="bg-orange-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      -62%
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    <span className="text-orange-700" style={{ fontWeight: 700 }}>62%</span> cart abandonment rate — You're paying for traffic but losing them before checkout
                  </p>
                  
                  {/* Funnel Visual */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-orange-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Ad Clicks</span>
                        <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>10,000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Add to Cart</span>
                        <span className="text-orange-600" style={{ fontSize: '13px', fontWeight: 700 }}>2,400 (24%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Purchases</span>
                        <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 700 }}>912 (38% of carts)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-orange-700" style={{ fontWeight: 600 }}>Potential ₹3.2L recovery opportunity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 5: Budget Misallocation */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-amber-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Medium</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Budget Allocated to Low Performers
                    </h4>
                    <div className="bg-amber-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      Fix
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    <span className="text-amber-700" style={{ fontWeight: 700 }}>35%</span> of your budget goes to campaigns with ROAS below 2.0x — You're funding losers
                  </p>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Wasted Budget</div>
                      <div className="text-amber-700" style={{ fontSize: '14px', fontWeight: 700 }}>₹52K/mo</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Low ROAS Campaigns</div>
                      <div className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>7 of 12</div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-amber-700" style={{ fontWeight: 600 }}>Reallocation could save ₹52K monthly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 6: Targeting Issues */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-orange-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>High</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Audience Overlap & Inefficiency
                    </h4>
                    <div className="bg-orange-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      -28%
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    <span className="text-orange-700" style={{ fontWeight: 700 }}>43%</span> audience overlap across campaigns — You're competing with yourself and inflating CPMs
                  </p>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Overlap</div>
                      <div className="text-orange-600" style={{ fontSize: '14px', fontWeight: 700 }}>43%</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>CPM Increase</div>
                      <div className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>+28%</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Wasted Reach</div>
                      <div className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>2.1M</div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-orange-700" style={{ fontWeight: 600 }}>Paying 28% more for the same audience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 7: Landing Page Issues */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-amber-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Medium</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      Landing Page Conversion Drop
                    </h4>
                    <div className="bg-amber-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      -41%
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    Page speed at <span className="text-amber-700" style={{ fontWeight: 700 }}>4.8s</span> and bounce rate at <span className="text-amber-700" style={{ fontWeight: 700 }}>68%</span> — Traffic quality is good, page experience is killing conversions
                  </p>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Load Time</div>
                      <div className="text-amber-700" style={{ fontSize: '14px', fontWeight: 700 }}>4.8s</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Bounce Rate</div>
                      <div className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>68%</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>CVR Drop</div>
                      <div className="text-red-600" style={{ fontSize: '14px', fontWeight: 700 }}>-41%</div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-amber-700" style={{ fontWeight: 600 }}>Losing 41% potential conversions at landing page</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card 8: No Testing Framework */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 hover:border-orange-400 transition-all">
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-amber-700 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Medium</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      No Structured Testing Process
                    </h4>
                    <div className="bg-amber-600 text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '13px' }}>
                      Missing
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                    Zero A/B tests running. No creative testing. No audience experiments. You're flying blind with <span className="text-amber-700" style={{ fontWeight: 700 }}>no data-driven optimization</span>
                  </p>
                  
                  {/* Stats */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-amber-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Active A/B Tests</span>
                        <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 700 }}>0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Creative Variations Tested</span>
                        <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 700 }}>0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700" style={{ fontSize: '13px' }}>Last Test Conducted</span>
                        <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>Never</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                    <span className="text-gray-600">Impact:</span>
                    <span className="text-amber-700" style={{ fontWeight: 600 }}>Missing 20-30% potential performance gains</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Flags */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Risk Flags</h3>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>Forward-looking risks that need immediate attention</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>6 Risks Identified</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-5 ml-13" style={{ fontSize: '14px', fontWeight: 400 }}>Predictive insights to prevent future losses</p>
        
        {/* Alert-Style Risk Stack */}
        <div className="space-y-3">
          {/* Risk 1: Scaling Risk */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-l-4 border-yellow-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-yellow-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Scaling Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>Creative Refresh Required Before Scale</h4>
                  </div>
                  <div className="bg-yellow-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    7-10 Days
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  Scaling without creative refresh may increase <span className="text-yellow-700" style={{ fontWeight: 700 }}>CAC by 40-60%</span> in next 7-10 days due to audience saturation
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Current CAC:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>₹850</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Projected CAC:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>₹1,360 (+60%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk 2: Efficiency Risk */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-l-4 border-orange-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-orange-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Efficiency Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>ROAS Declining 2.3% Week-over-Week</h4>
                  </div>
                  <div className="bg-orange-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    -2.3%/wk
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  At current rate, ROAS will drop below <span className="text-orange-700" style={{ fontWeight: 700 }}>2.0x breakeven</span> within 4 weeks — budget cuts or profitability crisis imminent
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Current ROAS:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>3.2x</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">4-Week Projection:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>1.9x (below breakeven)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk 3: Dependency Risk */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-red-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Dependency Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>Single Channel Concentration at 82%</h4>
                  </div>
                  <div className="bg-red-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Critical
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  <span className="text-red-700" style={{ fontWeight: 700 }}>82% revenue dependency</span> on Google Ads — One algorithm update, policy change, or account suspension would collapse your business
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Google Ads Revenue:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>₹4.8L/mo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Business Risk:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>Existential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk 4: Funnel Mismatch Risk */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-yellow-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Funnel Mismatch Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>Bottom-Funnel Traffic With Top-Funnel Metrics</h4>
                  </div>
                  <div className="bg-yellow-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Mismatch
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  You're driving <span className="text-yellow-700" style={{ fontWeight: 700 }}>cold traffic</span> to product pages meant for warm audiences — Creating friction and losing 62% at checkout
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Add-to-Cart Rate:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>24%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Purchase Rate:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>38% (should be 70%+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk 5: Budget Sustainability Risk */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border-l-4 border-orange-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-orange-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Budget Sustainability Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>Burn Rate Exceeds Growth Rate</h4>
                  </div>
                  <div className="bg-orange-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    High
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  Monthly ad spend growing <span className="text-orange-700" style={{ fontWeight: 700 }}>+21%</span> while revenue growth is only <span className="text-red-600" style={{ fontWeight: 700 }}>+8%</span> — Unsustainable trajectory towards negative cash flow
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Spend Growth:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>+21% MoM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Revenue Growth:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>+8% MoM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk 6: Market Saturation Risk */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-l-4 border-yellow-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-yellow-700 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 700 }}>Market Saturation Risk</span>
                    <h4 className="text-gray-900 mt-0.5" style={{ fontSize: '14px', fontWeight: 600 }}>Audience Exhaustion in Core Segments</h4>
                  </div>
                  <div className="bg-yellow-600 text-white px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                    14 Days
                  </div>
                </div>
                <p className="text-gray-700 mb-3" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                  Frequency at <span className="text-yellow-700" style={{ fontWeight: 700 }}>8.2x</span> and CPM rising +18% monthly — Your best audience segments are exhausted and costs will spike further
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">Current CPM:</span>
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>₹240</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">30-Day Projection:</span>
                    <span className="text-red-600" style={{ fontWeight: 700 }}>₹340 (+42%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Alert */}
        <div className="mt-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>⚠️ Critical Risk Window: Next 7-14 Days</h4>
              <p className="text-white/90" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                Without immediate action, these risks compound into a <span style={{ fontWeight: 700 }}>performance collapse scenario</span>. Our recommendation: Address scaling + efficiency risks first (highest ROI), then tackle dependency diversification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Action Plan Recommendations</h3>
              <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Data-driven actions to fix what's broken and scale what's working</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>6 Actions</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-5 ml-13" style={{ fontSize: '14px', fontWeight: 400 }}>Prioritized by ROI and ease of implementation</p>
        
        <div className="space-y-3">
          {/* Recommendation 1: Budget Reallocation */}
          <div className="bg-white rounded-xl p-5 border-2 border-green-300 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-start gap-4">
              {/* Priority Number */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>1</span>
                </div>
                <span className="text-green-700 uppercase" style={{ fontSize: '13px', fontWeight: 700 }}>High ROI</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                      Reallocate ₹2.5L from Google to Meta Advantage+
                    </h4>
                    <p className="text-gray-600" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                      Move budget from underperforming Google Search campaigns to Meta Advantage+ Shopping which shows 2.8x better ROAS potential
                    </p>
                  </div>
                </div>
                
                {/* Impact & Confidence */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Expected Impact</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-green-600" style={{ fontSize: '18px', fontWeight: 700 }}>+₹3.8L</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>additional revenue/mo</span>
                    </div>
                    <div className="text-green-700 mt-1" style={{ fontSize: '13px' }}>152% ROI improvement</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Confidence Level</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>92%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>High</span>
                      <span className="text-gray-500" style={{ fontSize: '13px' }}>• Based on 8 similar cases</span>
                    </div>
                  </div>
                </div>
                
                {/* Implementation Details */}
                <div className="flex items-center gap-4 text-gray-600" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    <span>Effort: <span className="text-gray-900" style={{ fontWeight: 600 }}>Low</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-green-600" />
                    <span>Timeline: <span className="text-gray-900" style={{ fontWeight: 600 }}>2-3 days</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-green-600" />
                    <span>Impact Speed: <span className="text-gray-900" style={{ fontWeight: 600 }}>Immediate</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation 2: Pause Campaigns */}
          <div className="bg-white rounded-xl p-5 border-2 border-green-300 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-start gap-4">
              {/* Priority Number */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>2</span>
                </div>
                <span className="text-green-700 uppercase" style={{ fontSize: '13px', fontWeight: 700 }}>Quick Win</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                      Pause 3 Low-Performing Campaigns Immediately
                    </h4>
                    <p className="text-gray-600" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                      Stop bleeding money on campaigns with ROAS below 1.5x — "Summer Sale Retargeting", "Lookalike 5%", and "Broad Interest Campaign"
                    </p>
                  </div>
                </div>
                
                {/* Impact & Confidence */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Expected Impact</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-green-600" style={{ fontSize: '18px', fontWeight: 700 }}>₹52K</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>saved per month</span>
                    </div>
                    <div className="text-green-700 mt-1" style={{ fontSize: '13px' }}>Stop wasting 35% of budget</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Confidence Level</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>98%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>Very High</span>
                      <span className="text-gray-500" style={{ fontSize: '13px' }}>• Data-backed</span>
                    </div>
                  </div>
                </div>
                
                {/* Implementation Details */}
                <div className="flex items-center gap-4 text-gray-600" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    <span>Effort: <span className="text-gray-900" style={{ fontWeight: 600 }}>Very Low</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-green-600" />
                    <span>Timeline: <span className="text-gray-900" style={{ fontWeight: 600 }}>Today</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-green-600" />
                    <span>Impact Speed: <span className="text-gray-900" style={{ fontWeight: 600 }}>Instant</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation 3: Creative Refresh */}
          <div className="bg-white rounded-xl p-5 border-2 border-green-300 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-start gap-4">
              {/* Priority Number */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>3</span>
                </div>
                <span className="text-green-700 uppercase" style={{ fontSize: '13px', fontWeight: 700 }}>Critical</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                      Launch 5 New Creative Variations to Reset Fatigue
                    </h4>
                    <p className="text-gray-600" style={{ fontSize: '13px', lineHeight: 1.625 }}>
                      Introduce UGC videos, customer testimonial carousels, and product demo reels to combat 8.2x frequency and restore CTR
                    </p>
                  </div>
                </div>
                
                {/* Impact & Confidence */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Expected Impact</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-green-600" style={{ fontSize: '18px', fontWeight: 700 }}>+45%</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>CTR improvement</span>
                    </div>
                    <div className="text-green-700 mt-1" style={{ fontSize: '13px' }}>-28% CAC reduction expected</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="text-gray-600 mb-1 uppercase" style={{ fontSize: '13px', fontWeight: 600 }}>Confidence Level</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>88%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>High</span>
                      <span className="text-gray-500" style={{ fontSize: '13px' }}>• Industry benchmarks</span>
                    </div>
                  </div>
                </div>
                
                {/* Implementation Details */}
                <div className="flex items-center gap-4 text-gray-600" style={{ fontSize: '13px' }}>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    <span>Effort: <span className="text-gray-900" style={{ fontWeight: 600 }}>Medium</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-green-600" />
                    <span>Timeline: <span className="text-gray-900" style={{ fontWeight: 600 }}>5-7 days</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-green-600" />
                    <span>Impact Speed: <span className="text-gray-900" style={{ fontWeight: 600 }}>3-5 days</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Impact Summary */}
        <div className="mt-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2" style={{ fontSize: '18px', fontWeight: 700 }}>Combined Potential Impact</h4>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-green-100 mb-1" style={{ fontSize: '13px' }}>Revenue Increase</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>+₹4.3L/mo</div>
                </div>
                <div>
                  <div className="text-green-100 mb-1" style={{ fontSize: '13px' }}>Cost Savings</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>₹52K/mo</div>
                </div>
                <div>
                  <div className="text-green-100 mb-1" style={{ fontSize: '13px' }}>ROAS Improvement</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>+1.2x</div>
                </div>
              </div>
              <p className="text-white/90" style={{ fontSize: '14px', lineHeight: 1.625 }}>
                Implementing these 3 recommendations could transform your marketing from <span style={{ fontWeight: 700 }}>losing money</span> to <span style={{ fontWeight: 700 }}>gaining ₹12.9L/quarter</span> within 60 days. Let's make it happen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-light rounded-xl shadow-md p-8 text-center border-2 border-brand/20">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full mb-4" style={{ fontSize: '14px' }}>
            <Sparkles className="w-4 h-4" />
            <span>Your Performance Plan is Ready</span>
          </div>
          <h3 className="text-gray-900 mb-3" style={{ fontSize: '24px', fontWeight: 700 }}>Ready to Scale Your Business?</h3>
          <p className="text-gray-600 mb-8" style={{ fontSize: '18px' }}>
            Get a detailed 90-day action plan with our marketing experts + AI-powered insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-brand text-white px-8 py-4 rounded-xl hover:bg-brand-hover transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Get a Detailed Performance Plan
            </button>
            <button className="border-2 border-brand text-brand px-8 py-4 rounded-xl hover:bg-brand-light transition-all flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Talk to a Performance Specialist
            </button>
          </div>
          <p className="text-gray-500 mt-6" style={{ fontSize: '14px' }}>
            🎯 Trusted by 500+ businesses • 💬 Free 30-min consultation • ⚡ Implementation support included
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon }: { label: string; value: string; trend: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70" style={{ fontSize: '13px' }}>{label}</span>
        <span className="text-white/60">{icon}</span>
      </div>
      <div className="text-white mb-1" style={{ fontSize: '20px' }}>{value}</div>
      <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-300' : 'text-red-300'}`} style={{ fontSize: '13px' }}>
        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(trend)}%</span>
      </div>
    </div>
  );
}

function InsightCard({ label, value, metric, positive }: { label: string; value: string; metric: string; positive: boolean }) {
  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="text-gray-600 mb-1" style={{ fontSize: '13px' }}>{label}</div>
      <div className="text-gray-900 mb-1.5" style={{ fontSize: '14px' }}>{value}</div>
      <div className="flex items-center gap-1 text-green-600" style={{ fontSize: '13px' }}>
        <TrendingUp className="w-3 h-3" />
        <span>{metric}</span>
      </div>
    </div>
  );
}

function IssueCard({ title, metric, severity }: { title: string; metric: string; severity: string }) {
  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-600',
    medium: 'bg-orange-50 border-orange-200 text-orange-600',
    low: 'bg-yellow-50 border-yellow-200 text-yellow-600'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[severity as keyof typeof severityColors]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 mb-1" style={{ fontSize: '14px' }}>{title}</div>
          <div className="text-gray-600" style={{ fontSize: '13px' }}>{metric}</div>
        </div>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      </div>
    </div>
  );
}

function RiskCard({ title, value, severity }: { title: string; value: string; severity: string }) {
  const severityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-orange-300 bg-orange-50',
    low: 'border-yellow-300 bg-yellow-50'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${severityColors[severity as keyof typeof severityColors]}`}>
      <div className="flex items-start gap-2 mb-2">
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
          severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
        }`} />
        <div className="text-gray-900 flex-1" style={{ fontSize: '14px' }}>{title}</div>
      </div>
      <div className="text-gray-600 ml-6" style={{ fontSize: '13px' }}>{value}</div>
    </div>
  );
}

function RecommendationCard({ number, action, detail, impact }: { number: number; action: string; detail: string; impact: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-green-200">
      <div className="flex gap-3">
        <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ fontSize: '14px' }}>
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 mb-1" style={{ fontSize: '14px' }}>{action}</div>
          <div className="text-gray-600 mb-2" style={{ fontSize: '13px' }}>{detail}</div>
          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full" style={{ fontSize: '13px' }}>
            <TrendingUp className="w-3 h-3" />
            <span>{impact}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIMessage({ message }: { message: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white rounded-lg p-3 text-gray-700 flex-1 border border-gray-200" style={{ fontSize: '14px' }}>
        {message}
      </div>
    </div>
  );
}

function PerformanceSnapshotChart({ isEcommerce, adSpendRange }: { isEcommerce: boolean; adSpendRange: number }) {
  // Generate 6 months of performance data showing DECLINING performance (panic mode)
  const generateMonthlyData = () => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, index) => {
      const baseSpend = adSpendRange * (0.8 + index * 0.08); // Ad spend INCREASING
      // Revenue is LESS than spends and DECLINING - creating urgency
      const revenueMultiplier = isEcommerce ? (0.75 - index * 0.08) : (0.70 - index * 0.07); // Getting worse over time
      const revenue = baseSpend * Math.max(0.4, revenueMultiplier); // Revenue declining but not going to zero
      
      return {
        month,
        spends: Math.round(baseSpend),
        revenue: Math.round(revenue),
        loss: Math.round(baseSpend - revenue), // The gap - money being burned
        roas: isEcommerce ? +(revenue / baseSpend).toFixed(2) : null
      };
    });
  };

  const chartData = generateMonthlyData();
  
  // Calculate ALARMING insights
  const totalSpends = chartData.reduce((sum, d) => sum + d.spends, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalLoss = totalSpends - totalRevenue;
  const lossPercentage = ((totalLoss / totalSpends) * 100).toFixed(0);
  const metaContribution = 78; // Over-dependent on Meta
  const efficiencyDecline = -34; // Massive decline
  const worstMonth = chartData[chartData.length - 1].month; // Current month is worst
  const roasDecline = ((chartData[0].roas || 0) - (chartData[chartData.length - 1].roas || 0)) / (chartData[0].roas || 1) * 100;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-gray-900">Performance Snapshot</h3>
            <p className="text-gray-500" style={{ fontSize: '13px' }}>6-month trend analysis</p>
          </div>
        </div>
        
        {/* Chart Area - 70% of space */}
        <div className="relative w-full" style={{ height: '256px' }}>
          {/* CRITICAL WARNING Banner */}
          <div className="absolute top-0 right-0 z-10 bg-red-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1 shadow-lg animate-pulse" style={{ fontSize: '13px' }}>
            <AlertTriangle className="w-3 h-3" />
            <span style={{ fontWeight: 600 }}>REVENUE BELOW SPENDS</span>
          </div>
          
          <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Red gradient for INCREASING ad spends (bad - money going out) */}
                <linearGradient id="colorSpends" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.4}/>
                </linearGradient>
                {/* Orange/Red gradient for DECLINING revenue (danger!) */}
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.2}/>
                </linearGradient>
                {/* Pattern to show the LOSS area (the gap between bars and line) */}
                <pattern id="lossPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                  <rect width="4" height="8" fill="#fee2e2" />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#991b1b' }}
                axisLine={{ stroke: '#fca5a5' }}
                tickLine={{ stroke: '#fca5a5' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#991b1b' }}
                axisLine={{ stroke: '#fca5a5' }}
                tickLine={{ stroke: '#fca5a5' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomPanicTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="square"
              />
              {/* Tall RED bars showing money being SPENT */}
              <Bar 
                dataKey="spends" 
                fill="url(#colorSpends)" 
                radius={[8, 8, 0, 0]}
                name="💸 Ad Spends (Increasing)"
                maxBarSize={50}
              />
              {/* LOW line showing poor revenue - the visual gap creates panic */}
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#dc2626" 
                strokeWidth={4}
                strokeDasharray="0"
                dot={{ fill: '#dc2626', r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="📉 Revenue (Declining)"
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Loss Indicator Overlay */}
          <div className="absolute bottom-2 left-2 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2" style={{ fontSize: '13px' }}>
            <TrendingDown className="w-3.5 h-3.5" />
            <span>You're losing <span style={{ fontWeight: 700 }}>{formatCurrency(totalLoss)}</span> ({lossPercentage}% of spend)</span>
          </div>
        </div>
      </div>

      {/* Insights Row - 30% of space */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-t-4 border-red-500">
        <h4 className="text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
          <span style={{ fontWeight: 600 }}>Critical Insights - Immediate Action Required</span>
        </h4>
        <div className="max-h-36 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-transparent">
          <InsightBullet
            icon={<AlertTriangle className="w-4 h-4" />}
            text={`🔥 BURNING ${formatCurrency(totalLoss)} in the last 6 months - You're losing ${lossPercentage}% of every rupee spent on ads`}
            highlight={formatCurrency(totalLoss)}
            color="red"
          />
          <InsightBullet
            icon={<TrendingDown className="w-4 h-4" />}
            text={`💔 Revenue efficiency COLLAPSED by ${Math.abs(efficiencyDecline)}% - Your ads are becoming less effective every month`}
            highlight={`${Math.abs(efficiencyDecline)}%`}
            color="red"
          />
          <InsightBullet
            icon={<Target className="w-4 h-4" />}
            text={`⚠️ Over-dependent on Meta Ads (${metaContribution}% of budget) - One algorithm change could destroy your business`}
            highlight={`${metaContribution}%`}
            color="red"
          />
          <InsightBullet
            icon={<IndianRupee className="w-4 h-4" />}
            text={`📉 ROAS dropped ${roasDecline.toFixed(0)}% from August to ${worstMonth} - Your return on investment is dying`}
            highlight={`${roasDecline.toFixed(0)}%`}
            color="red"
          />
          <InsightBullet
            icon={<BarChart3 className="w-4 h-4" />}
            text="🚨 Ad spends increasing +40% while revenue declining -30% - You're in a death spiral"
            highlight="death spiral"
            color="red"
          />
          <InsightBullet
            icon={<Zap className="w-4 h-4" />}
            text="⏰ At this rate, you'll waste ₹2.8L more in next 6 months if nothing changes - Time is running out"
            highlight="₹2.8L"
            color="red"
          />
          <InsightBullet
            icon={<AlertTriangle className="w-4 h-4" />}
            text="💸 Creative fatigue at 8.2x frequency (3x over benchmark) - Your audience is sick of seeing your ads"
            highlight="8.2x"
            color="red"
          />
        </div>
      </div>
    </div>
  );
}

function InsightBullet({ 
  icon, 
  text, 
  highlight, 
  color 
}: { 
  icon: React.ReactNode; 
  text: string; 
  highlight: string; 
  color: 'blue' | 'red' | 'green'; 
}) {
  const colorClasses = {
    blue: 'bg-brand-light text-brand',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700'
  };

  return (
    <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: 1.4 }}>{text}</p>
      </div>
    </div>
  );
}

// Custom Tooltip Component for Panic-Inducing Chart
function CustomPanicTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const spends = payload[0]?.value || 0;
  const revenue = payload[1]?.value || 0;
  const loss = spends - revenue;
  const lossPercentage = ((loss / spends) * 100).toFixed(1);

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${(value / 1000).toFixed(1)}K`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-red-500 p-2.5 min-w-[220px]" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200">
        <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{label} 2024</span>
        <div className="flex items-center gap-0.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full" style={{ fontSize: '13px' }}>
          <TrendingDown className="w-2.5 h-2.5" />
          <span>Declining</span>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="space-y-1.5 mb-2">
        {/* Ad Spends */}
        <div className="flex items-center justify-between bg-red-50 rounded-md p-1.5 border border-red-200">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
              <IndianRupee className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-600" style={{ fontSize: '13px' }}>Ad Spends</span>
          </div>
          <span className="text-red-700" style={{ fontSize: '13px', fontWeight: 700 }}>{formatCurrency(spends)}</span>
        </div>

        {/* Revenue */}
        <div className="flex items-center justify-between bg-orange-50 rounded-md p-1.5 border border-orange-200">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
              <TrendingDown className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-600" style={{ fontSize: '13px' }}>Revenue</span>
          </div>
          <span className="text-orange-700" style={{ fontSize: '13px', fontWeight: 700 }}>{formatCurrency(revenue)}</span>
        </div>
      </div>

      {/* Loss Highlight */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-md p-2 text-white">
        <div className="flex items-center gap-1.5 mb-0.5">
          <AlertTriangle className="w-3 h-3" />
          <span className="opacity-90" style={{ fontSize: '13px' }}>You Lost This Month</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(loss)}</span>
          <span className="opacity-75" style={{ fontSize: '13px' }}>({lossPercentage}% loss)</span>
        </div>
      </div>

      {/* Warning Message */}
      <div className="mt-2 pt-1.5 border-t border-gray-200">
        <p className="text-red-600 flex items-start gap-1" style={{ fontSize: '13px', lineHeight: 1.3 }}>
          <span>⚠️</span>
          <span>Revenue is {lossPercentage}% below your ad spend - immediate action needed</span>
        </p>
      </div>
    </div>
  );
}
