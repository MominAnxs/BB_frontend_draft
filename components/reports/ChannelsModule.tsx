'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Radio, IndianRupee, Share2, Zap, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { KPIWidgets } from './KPIWidgets';
import { ActionPanel } from './ActionPanel';
import React from 'react';

interface ChannelsModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel?: string;
}

interface Campaign {
  name: string;
  spend: number;
  leads?: number;
  cpl?: number;
  orders?: number;
  revenue?: number;
  roas?: number;
  ctr: number;
  contribution: number;
  trend: number;
  status: 'green' | 'yellow' | 'red';
}

interface ChannelData {
  channel: string;
  spend: number;
  leads?: number;
  cpl?: number;
  orders?: number;
  revenue?: number;
  roas?: number;
  ctr: number;
  contribution: number;
  trend: number;
  status: 'green' | 'yellow' | 'red';
  campaigns: Campaign[];
}

export function ChannelsModule({ businessModel, selectedChannel }: ChannelsModuleProps) {
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [tableInsightsExpanded, setTableInsightsExpanded] = useState(false);

  // Channel data with campaigns
  const channelData: ChannelData[] = businessModel === 'ecommerce' 
    ? [
        {
          channel: 'Meta (Facebook/Instagram)',
          spend: 142000,
          orders: 162,
          revenue: 460080,
          roas: 3.2,
          ctr: 1.6,
          contribution: 38,
          trend: 8.5,
          status: 'green',
          campaigns: [
            { name: 'Dynamic Product Ads - Retargeting', spend: 68000, orders: 78, revenue: 221520, roas: 3.3, ctr: 1.8, contribution: 18, trend: 12.8, status: 'green' },
            { name: 'Advantage+ Shopping - Prospecting', spend: 52000, orders: 59, revenue: 167560, roas: 3.2, ctr: 1.5, contribution: 14, trend: 6.5, status: 'green' },
            { name: 'Instagram Reels - Brand Awareness', spend: 22000, orders: 25, revenue: 71000, roas: 3.2, ctr: 1.4, contribution: 6, trend: 2.8, status: 'yellow' }
          ]
        },
        {
          channel: 'Google Shopping',
          spend: 158000,
          orders: 185,
          revenue: 525500,
          roas: 3.3,
          ctr: 1.3,
          contribution: 43,
          trend: 15.2,
          status: 'green',
          campaigns: [
            { name: 'Shopping - High Intent Keywords', spend: 92000, orders: 108, revenue: 306800, roas: 3.3, ctr: 1.5, contribution: 25, trend: 18.5, status: 'green' },
            { name: 'Smart Shopping - Automated', spend: 46000, orders: 54, revenue: 153400, roas: 3.3, ctr: 1.2, contribution: 13, trend: 12.2, status: 'green' },
            { name: 'PLA - Brand Defense', spend: 20000, orders: 23, revenue: 65300, roas: 3.3, ctr: 1.1, contribution: 5, trend: 8.5, status: 'green' }
          ]
        },
        {
          channel: 'Google Search',
          spend: 80000,
          orders: 81,
          revenue: 230040,
          roas: 2.9,
          ctr: 2.1,
          contribution: 19,
          trend: -5.2,
          status: 'yellow',
          campaigns: [
            { name: 'Search - Brand Keywords', spend: 42000, orders: 46, revenue: 130640, roas: 3.1, ctr: 2.4, contribution: 11, trend: -2.5, status: 'yellow' },
            { name: 'Search - Generic Product Terms', spend: 28000, orders: 27, revenue: 76680, roas: 2.7, ctr: 1.9, contribution: 6, trend: -8.5, status: 'red' },
            { name: 'Display - Remarketing', spend: 10000, orders: 8, revenue: 22720, roas: 2.3, ctr: 0.8, contribution: 2, trend: -12.2, status: 'red' }
          ]
        }
      ]
    : [
        {
          channel: 'Meta (Facebook/Instagram)',
          spend: 33000,
          leads: 69,
          cpl: 478,
          ctr: 1.2,
          contribution: 8,
          trend: -22.4,
          status: 'red',
          campaigns: [
            { name: 'Lead Ads - Finance Services', spend: 18000, leads: 38, cpl: 474, ctr: 1.3, contribution: 5, trend: -18.5, status: 'red' },
            { name: 'Engagement - Carousel Ads', spend: 15000, leads: 31, cpl: 484, ctr: 1.1, contribution: 3, trend: -28.2, status: 'red' }
          ]
        },
        {
          channel: 'Google Ads',
          spend: 84000,
          leads: 287,
          cpl: 293,
          ctr: 2.3,
          contribution: 34,
          trend: -8.3,
          status: 'yellow',
          campaigns: [
            { name: 'Search - Finance Keywords', spend: 52000, leads: 178, cpl: 292, ctr: 2.6, contribution: 21, trend: -5.2, status: 'yellow' },
            { name: 'Display - Competitor Conquest', spend: 22000, leads: 75, cpl: 293, ctr: 0.9, contribution: 9, trend: -12.8, status: 'red' },
            { name: 'YouTube - Brand Awareness', spend: 10000, leads: 34, cpl: 294, ctr: 0.7, contribution: 4, trend: -15.5, status: 'red' }
          ]
        },
        {
          channel: 'LinkedIn',
          spend: 158000,
          leads: 489,
          cpl: 323,
          ctr: 0.8,
          contribution: 58,
          trend: 12.5,
          status: 'green',
          campaigns: [
            { name: 'B2B SaaS - Thought Leadership', spend: 82000, leads: 254, cpl: 323, ctr: 0.9, contribution: 30, trend: 18.2, status: 'green' },
            { name: 'Lead Gen Form - CFO Targeting', spend: 48000, leads: 149, cpl: 322, ctr: 0.8, contribution: 18, trend: 8.5, status: 'green' },
            { name: 'Retargeting - Website Visitors', spend: 28000, leads: 86, cpl: 326, ctr: 0.6, contribution: 10, trend: -3.2, status: 'yellow' }
          ]
        }
      ];

  // Channel comparison chart data
  const chartData = businessModel === 'ecommerce'
    ? channelData.map(ch => ({
        channel: ch.channel.split(' ')[0], // Shortened name for chart
        spend: ch.spend / 1000, // Convert to thousands
        orders: ch.orders,
        roas: ch.roas,
        contribution: ch.contribution
      }))
    : channelData.map(ch => ({
        channel: ch.channel.split(' ')[0], // Shortened name for chart
        spend: ch.spend / 1000, // Convert to thousands
        leads: ch.leads,
        cpl: ch.cpl,
        contribution: ch.contribution
      }));

  const toggleChannel = (channel: string) => {
    const newExpanded = new Set(expandedChannels);
    if (newExpanded.has(channel)) {
      newExpanded.delete(channel);
    } else {
      newExpanded.add(channel);
    }
    setExpandedChannels(newExpanded);
  };

  const getStatusStyles = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'yellow':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'red':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.name === 'Spend' ? `₹${entry.value}K` : 
                 entry.name === 'Orders' ? entry.value :
                 entry.name === 'ROAS' ? `${entry.value}x` :
                 entry.name === 'Leads' ? entry.value :
                 entry.name === 'CPL' ? `₹${entry.value}` :
                 entry.name === 'Contribution' ? `${entry.value}%` :
                 entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* KPI Widgets */}
      <KPIWidgets businessModel={businessModel} />

      {/* Actions & Recommendations */}
      <div className="mb-6">
        <ActionPanel businessModel={businessModel} moduleType="channels" selectedChannel={selectedChannel} />
      </div>

      {/* Channel Comparison Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Performance Comparison</h3>
          </div>
          <p className="text-sm text-gray-500">
            {businessModel === 'ecommerce' 
              ? 'Compare channel efficiency: Spend vs Orders vs ROAS - optimize your advertising budget'
              : 'Decide where the next ₹1 should go - compare channel efficiency and contribution'
            }
          </p>
        </div>

        <div className="w-full" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height={320} minHeight={320} minWidth={0}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="channel" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: businessModel === 'ecommerce' ? 'Spend (₹K) & Orders' : 'Spend (₹K) & Leads', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: 12, fill: '#6b7280' } 
                }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: businessModel === 'ecommerce' ? 'ROAS' : 'CPL (₹)', 
                  angle: 90, 
                  position: 'insideRight', 
                  style: { fontSize: 12, fill: '#6b7280' } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar yAxisId="left" dataKey="spend" fill="#204CC7" name="Spend" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`spend-cell-${index}`} fill={index === 0 ? '#204CC7' : index === 1 ? '#4A6FD9' : '#7A96E4'} />
                ))}
              </Bar>
              {businessModel === 'ecommerce' ? (
                <Bar yAxisId="left" dataKey="orders" fill="#10b981" name="Orders" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`orders-cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#34d399' : '#6ee7b7'} />
                  ))}
                </Bar>
              ) : (
                <Bar yAxisId="left" dataKey="leads" fill="#10b981" name="Leads" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`leads-cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#34d399' : '#6ee7b7'} />
                  ))}
                </Bar>
              )}
              {businessModel === 'ecommerce' ? (
                <Bar yAxisId="right" dataKey="roas" fill="#A3B8ED" name="ROAS" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`roas-cell-${index}`} fill={index === 0 ? '#A3B8ED' : index === 1 ? '#B4C7F3' : '#C5D4F7'} />
                  ))}
                </Bar>
              ) : (
                <Bar yAxisId="right" dataKey="cpl" fill="#A3B8ED" name="CPL" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cpl-cell-${index}`} fill={index === 0 ? '#A3B8ED' : index === 1 ? '#B4C7F3' : '#C5D4F7'} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights - Integrated within chart */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
            <span className="text-xs text-gray-500">Critical observations from your data</span>
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {businessModel === 'ecommerce' ? (
              // Ecommerce Insights
              <>
                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    Google Shopping dominates with 3.3x ROAS (highest efficiency) driving 43% of total revenue (₹5.3L). "High Intent Keywords" + "Smart Shopping" both scaling at +15% with headroom to 2x before saturation.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    Meta retargeting goldmine: DPA (Dynamic Product Ads) crushing at 3.3x ROAS with 18% revenue contribution. Cart abandoners converting 2.1x better than cold traffic. Scale opportunity: +₹1.2L/month.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Google Search underperforming: 2.9x ROAS (9% below target) with -5.2% decline. "Display Remarketing" bleeding ₹10K at 2.3x ROAS. Immediate shift to brand keywords (3.1x ROAS) recommended.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Critical diversification gap: 81% revenue from Google+Meta creates catastrophic platform risk. One algorithm update, policy change, or CPM spike could tank 4/5th of revenue overnight. Test Microsoft/Amazon Ads now.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-brand-light border-brand/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-brand">
                    Low-hanging fruit: Instagram Reels campaign slowing (+2.8% vs +12% on DPA). Shift that ₹12K to proven retargeting = instant +₹27K revenue/month. Feed optimization on Shopping could add +18% CTR without extra spend.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Advantage+ Shopping momentum declining: Growth slowed to +6.5% (vs +18.5% on High Intent Keywords). CPM rising 12% while CTR flat. Consider audience expansion limits—test lookalike refresh or new creative angles.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>
              </>
            ) : (
              // Lead Gen Insights
              <>
                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    LinkedIn efficiency champion: 58% of leads at ₹323 CPL (32% below avg). Thought Leadership campaign delivers 30% pipeline at +18% growth. 2-3x scale capacity before saturation.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Over-dependence risk: 58% on LinkedIn creates platform vulnerability. Best practice: max 40-45% per channel for B2B stability. Diversification critical to protect pipeline.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Google quality declining: SQL rate dropped 22% (38%→29%). Display & YouTube bleeding budget at -12.8% and -15.5%. Immediate action needed—pause underperformers and reallocate.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Meta value destroyer: ₹478 CPL (48% above target) with -22.4% declining trend. Contributing only 8% of leads while consuming 12% of budget. Both campaigns underperforming with poor engagement.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-brand-light border-brand/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-brand">
                    Budget reallocation opportunity: Shift ₹45K/month from Meta + underperforming Google campaigns to LinkedIn top performers. Expected: +85 leads/month, -18% blended CPL, improved 48/42/10 channel split.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    LinkedIn retargeting fatigue: Website Visitors campaign declining -3.2% with ₹326 CPL. Audience burnout likely—refresh creative, expand targeting parameters, or reduce frequency caps to reignite performance.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Channel Campaign Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Channel & Campaign Breakdown</h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Channel Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium">
                <option>All Channels</option>
                <option>Google Shopping</option>
                <option>Meta Ads</option>
                <option>Google Search</option>
                {businessModel === 'leadgen' && <option>LinkedIn</option>}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
                <option>This Month</option>
                <option>This Quarter</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Channel</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Spend</th>
                {businessModel === 'ecommerce' ? (
                  <>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Revenue</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">ROAS</th>
                  </>
                ) : (
                  <>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Leads</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">CPL</th>
                  </>
                )}
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">CTR</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">% Contribution</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Trend</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map((channel, idx) => {
                const rows = [
                  // Channel Row
                  <tr
                    key={channel.channel}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleChannel(channel.channel)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {expandedChannels.has(channel.channel) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900">{channel.channel}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      ₹{(channel.spend / 1000).toFixed(0)}K
                    </td>
                    {businessModel === 'ecommerce' ? (
                      <>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          ₹{(channel.revenue! / 100000).toFixed(1)}L
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          {channel.roas}x
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          {channel.leads}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          ₹{channel.cpl}
                        </td>
                      </>
                    )}
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {channel.ctr}%
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {channel.contribution}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 font-semibold ${
                          channel.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {channel.trend > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(channel.trend)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getStatusIcon(channel.status)}
                      </div>
                    </td>
                  </tr>,
                  
                  // Campaign Rows (Expanded)
                  ...(expandedChannels.has(channel.channel) ? 
                    channel.campaigns.map((campaign, campaignIdx) => (
                      <tr
                        key={`${channel.channel}-${campaignIdx}`}
                        className="border-b border-gray-50 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                      >
                        <td className="py-3 px-4 pl-12">
                          <span className="text-sm text-gray-700">{campaign.name}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-700">
                          ₹{(campaign.spend / 1000).toFixed(0)}K
                        </td>
                        {businessModel === 'ecommerce' ? (
                          <>
                            <td className="py-3 px-4 text-right text-sm text-gray-700">
                              ₹{(campaign.revenue! / 100000).toFixed(1)}L
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-700">
                              {campaign.roas}x
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-right text-sm text-gray-700">
                              {campaign.leads}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-700">
                              ₹{campaign.cpl}
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4 text-right text-sm text-gray-700">
                          {campaign.ctr}%
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-700">
                          {campaign.contribution}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div
                            className={`flex items-center justify-end gap-1 text-sm font-medium ${
                              campaign.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {campaign.trend > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{Math.abs(campaign.trend)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusStyles(campaign.status)}`}
                            >
                              {campaign.status === 'green'
                                ? 'Healthy'
                                : campaign.status === 'yellow'
                                ? 'Monitor'
                                : 'Action Needed'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )) : [])
                ];
                
                return rows;
              })}
            </tbody>
          </table>
        </div>

        {/* Key Insights - Integrated within table */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
            <span className="text-xs text-gray-500">Campaign-level analysis and recommendations</span>
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {businessModel === 'ecommerce' ? (
              // Ecommerce Campaign Insights
              <>
                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    Shopping "High Intent Keywords" is your MVP: ₹92K spend → ₹3.07L revenue (3.3x ROAS, 25% contribution). +18.5% growth with room to scale. Consider +30% budget increase for Q2.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    DPA retargeting outperforming prospecting: 3.3x ROAS vs 3.2x on Advantage+. Cart abandoners show 2.1x better conversion. Recommend shifting ₹8K from Advantage+ to DPA for immediate lift.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Critical: "Display Remarketing" destroying value at 2.3x ROAS with -12.2% decline. Pause immediately and reallocate ₹10K to Brand Keywords (3.1x ROAS). Potential monthly gain: +₹8K revenue.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    "Generic Product Terms" underperforming at 2.7x ROAS (-8.5% trend). High CPC eating margins. Test long-tail variations or shift budget to exact-match brand defense which maintains 3.3x efficiency.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-brand-light border-brand/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-brand">
                    Smart Shopping automation working: 3.3x ROAS at ₹46K spend with +12.2% growth. Google's ML optimizing well. Consider increasing daily budget by 20% and monitoring for 2 weeks before further scaling.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Instagram Reels slowing dramatically: +2.8% growth vs +12.8% on DPA. Creative fatigue likely. Refresh ad creative with UGC testimonials or pause for 2 weeks, then relaunch with fresh assets.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-brand-light border-brand/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-brand">
                    PLA Brand Defense protecting margins: Small ₹20K spend but critical 3.3x ROAS defending against competitor shopping ads. Maintain budget—losing brand clicks to competitors costs 4-5x more to win back.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Advantage+ hitting audience limits: Growth decelerated from +18% to +6.5%. CPM rising (12%) while CTR flat. Expand lookalike percentages (1%→3%) or test new interest layers to refresh audience pool.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Brand Keywords declining despite strong ROAS: -2.5% trend at 3.1x efficiency suggests competitor pressure or search volume drop. Check impression share loss—may need to increase bids by 8-12% to defend position.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </>
            ) : (
              // Lead Gen Campaign Insights
              <>
                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    Thought Leadership dominates: 254 leads at ₹323 CPL (30% pipeline contribution) with +18.2% growth. Content-first approach resonating with ICP. Scale to ₹120K/month before testing saturation.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-green-50 border-green-200">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-green-900">
                    CFO Targeting maintaining efficiency: ₹322 CPL (18% contribution) at +8.5% growth. Job title targeting working well. Test expanding to VP Finance and Finance Directors to capture adjacent decision-makers.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-yellow-900">
                    Website Visitors retargeting fatigue: -3.2% decline at ₹326 CPL suggests audience burnout. Reduce frequency from 5→3 impressions/week and refresh creative with case studies instead of generic CTAs.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Finance Keywords SQL quality collapsed: 38%→29% SQL rate (-22% drop) despite steady volume. Landing page mismatch or qualification criteria issues. Audit lead forms and tighten company size filters immediately.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Display Competitor Conquest failing: ₹293 CPL at -12.8% with poor engagement. Placement targeting likely off. Pause campaign, shift ₹22K to proven LinkedIn Thought Leadership for +68 quality leads/month.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    YouTube bleeding budget: -15.5% decline at ₹294 CPL (only 34 leads). Brand awareness doesn't convert for B2B finance. Pause and reallocate ₹10K to retargeting or LinkedIn for immediate pipeline impact.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Meta Lead Ads catastrophic: ₹474 CPL at -18.5% (47% above target). Low CTR suggests broad targeting and creative fatigue. If CTR stays &lt;1.5%, kill campaign entirely—Meta not viable for high-ticket B2B finance services.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-red-900">
                    Carousel Ads worst performer: -28.2% trend at ₹484 CPL. Format mismatch for decision-maker audience. Pause immediately. Total Meta budget (₹33K) should be redistributed to LinkedIn/Google Search winners.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg border relative group bg-brand-light border-brand/20">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-sm leading-snug flex-1 pr-6 text-brand">
                    Budget reallocation opportunity: Kill Meta (₹33K) + Google Display/YouTube (₹32K) = ₹65K freed. Reallocate to LinkedIn Thought Leadership (+₹40K) + CFO Targeting (+₹25K) for estimated +180 leads/month at lower CPL.
                  </p>
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
