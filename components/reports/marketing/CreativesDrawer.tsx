'use client';

import { X, Zap, ArrowRight, Target, Lightbulb, CheckCircle, AlertCircle, Eye, MousePointer, TrendingUp, TrendingDown, Smartphone, Monitor, Users, ShoppingCart, IndianRupee, Play, Image as ImageIcon, Globe, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DemographicsBreakdown } from './DemographicsBreakdown';

interface CreativeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  businessModel?: 'ecommerce' | 'leadgen';
  selectedCreative?: {
    id: string;
    thumbnail: string;
    campaignName: string;
    adSetName: string;
    format: string;
    hook: string;
    spend: number;
    impressions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    linkClicks: number;
    lpv: number;
    costPerResult: number;
    roas: number;
    cpl: number;
    leads: number;
    frequency: number;
    daysLive: number;
    status: 'fresh' | 'fatiguing' | 'dead';
  } | null;
}

interface CreativeDetails {
  id: string;
  thumbnail: string;
  format: string;
  hook: string;
  campaignName: string;
  adSetName: string;
  spend: number;
  revenue?: number;
  roas?: number;
  leads?: number;
  cpl?: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  purchases?: number;
  cpa?: number;
  cvr: number;
  daysLive: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

// Main Creatives Drawer with Table
export function CreativesDrawer({ isOpen, onClose, businessModel = 'ecommerce', selectedCreative }: CreativeDrawerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCreativeFromTable, setSelectedCreativeFromTable] = useState<CreativeDetails | null>(null);
  
  if (!isOpen) return null;

  // Convert selected creative from module to drawer format
  const convertToCreativeDetails = (creative: any): CreativeDetails => {
    // Map status from 'fresh'/'fatiguing'/'dead' to 'excellent'/'good'/'average'/'poor'
    let status: 'excellent' | 'good' | 'average' | 'poor' = 'good';
    if (businessModel === 'ecommerce') {
      if (creative.roas >= 3.5) status = 'excellent';
      else if (creative.roas >= 3.0) status = 'good';
      else if (creative.roas >= 2.5) status = 'average';
      else status = 'poor';
    } else {
      if (creative.cpl <= 300) status = 'excellent';
      else if (creative.cpl <= 350) status = 'good';
      else if (creative.cpl <= 450) status = 'average';
      else status = 'poor';
    }

    return {
      id: creative.id,
      thumbnail: creative.thumbnail,
      format: creative.format,
      hook: creative.hook,
      campaignName: creative.campaignName,
      adSetName: creative.adSetName,
      spend: creative.spend,
      revenue: businessModel === 'ecommerce' ? creative.roas * creative.spend : undefined,
      roas: businessModel === 'ecommerce' ? creative.roas : undefined,
      leads: businessModel === 'leadgen' ? creative.leads : undefined,
      cpl: businessModel === 'leadgen' ? creative.cpl : undefined,
      impressions: creative.impressions,
      reach: creative.reach,
      clicks: creative.clicks,
      ctr: creative.ctr * 100, // Convert to percentage
      cpc: creative.cpc,
      cpm: creative.cpm,
      frequency: creative.frequency,
      purchases: creative.purchases,
      cpa: creative.cpa,
      cvr: creative.cvr, // Already in percentage format
      daysLive: creative.daysLive,
      status: status
    };
  };

  // If selectedCreative is passed from the module, open drill-down directly
  if (selectedCreative) {
    const convertedCreative = convertToCreativeDetails(selectedCreative);
    return (
      <CreativeDrilldownDrawer 
        creative={convertedCreative} 
        onClose={onClose}
        businessModel={businessModel}
      />
    );
  }

  // E-commerce creative data
  const ecommerceCreatives: CreativeDetails[] = [
    {
      id: 'CR-001',
      thumbnail: '🎬',
      format: 'Video',
      hook: 'Problem-Solution',
      campaignName: 'Product Catalog Sales - Summer',
      adSetName: 'Retargeting - Engaged Users',
      spend: 240000,
      revenue: 680000,
      roas: 2.83,
      impressions: 2400000,
      reach: 1850000,
      clicks: 84200,
      ctr: 3.51,
      cpc: 2.85,
      cpm: 100,
      frequency: 1.3,
      purchases: 3536,
      cpa: 67.9,
      cvr: 4.2,
      daysLive: 12,
      status: 'excellent'
    },
    {
      id: 'CR-002',
      thumbnail: '🎬',
      format: 'Video',
      hook: 'Before-After',
      campaignName: 'Dynamic Retargeting',
      adSetName: 'Website Visitors - 7D',
      spend: 180000,
      revenue: 410000,
      roas: 2.28,
      impressions: 1800000,
      reach: 1520000,
      clicks: 68400,
      ctr: 3.8,
      cpc: 2.63,
      cpm: 100,
      frequency: 1.2,
      purchases: 3832,
      cpa: 47.0,
      cvr: 5.6,
      daysLive: 18,
      status: 'excellent'
    },
    {
      id: 'CR-003',
      thumbnail: '🖼️',
      format: 'Image',
      hook: 'Social Proof',
      campaignName: 'Collection Ads - New Arrivals',
      adSetName: 'Prospecting - Lookalike 1%',
      spend: 220000,
      revenue: 420000,
      roas: 1.91,
      impressions: 2800000,
      reach: 2250000,
      clicks: 78400,
      ctr: 2.8,
      cpc: 2.81,
      cpm: 78.57,
      frequency: 1.2,
      purchases: 2195,
      cpa: 100.2,
      cvr: 2.8,
      daysLive: 22,
      status: 'good'
    },
    {
      id: 'CR-004',
      thumbnail: '🎬',
      format: 'Video',
      hook: 'Founder Story',
      campaignName: 'Prospecting - Lookalike',
      adSetName: 'Lookalike 2-3%',
      spend: 160000,
      revenue: 220000,
      roas: 1.38,
      impressions: 3200000,
      reach: 2850000,
      clicks: 64000,
      ctr: 2.0,
      cpc: 2.50,
      cpm: 50,
      frequency: 1.1,
      purchases: 1216,
      cpa: 131.6,
      cvr: 1.9,
      daysLive: 15,
      status: 'average'
    },
  ];

  // Lead generation creative data
  const leadgenCreatives: CreativeDetails[] = [
    {
      id: 'CR-001',
      thumbnail: '🎬',
      format: 'Video',
      hook: 'Thought Leadership',
      campaignName: 'Lead Gen Forms - Service Discovery',
      adSetName: 'Lookalike - Converted Leads',
      spend: 120000,
      leads: 156,
      cpl: 769,
      impressions: 1800000,
      reach: 1450000,
      clicks: 54000,
      ctr: 3.0,
      cpc: 2.22,
      cpm: 66.67,
      frequency: 1.2,
      cvr: 22,
      daysLive: 14,
      status: 'excellent'
    },
    {
      id: 'CR-002',
      thumbnail: '🎬',
      format: 'Video',
      hook: 'Case Study Results',
      campaignName: 'Video - Founder Testimonials',
      adSetName: 'Cold Audience - LinkedIn',
      spend: 180000,
      leads: 98,
      cpl: 1837,
      impressions: 1200000,
      reach: 950000,
      clicks: 38400,
      ctr: 3.2,
      cpc: 4.69,
      cpm: 150,
      frequency: 1.3,
      cvr: 18,
      daysLive: 18,
      status: 'good'
    },
    {
      id: 'CR-003',
      thumbnail: '🖼️',
      format: 'Image',
      hook: 'ROI Calculator',
      campaignName: 'Lead Magnet - Case Studies',
      adSetName: 'Interest Targeting - B2B',
      spend: 150000,
      leads: 124,
      cpl: 1210,
      impressions: 2100000,
      reach: 1750000,
      clicks: 63000,
      ctr: 3.0,
      cpc: 2.38,
      cpm: 71.43,
      frequency: 1.2,
      cvr: 19.7,
      daysLive: 21,
      status: 'excellent'
    },
    {
      id: 'CR-004',
      thumbnail: '🖼️',
      format: 'Image',
      hook: 'Free Consultation',
      campaignName: 'Retargeting - Website Visitors',
      adSetName: 'Website - 30D',
      spend: 90000,
      leads: 82,
      cpl: 1098,
      impressions: 950000,
      reach: 820000,
      clicks: 28500,
      ctr: 3.0,
      cpc: 3.16,
      cpm: 94.74,
      frequency: 1.2,
      cvr: 20.5,
      daysLive: 25,
      status: 'good'
    },
  ];

  const creatives = businessModel === 'leadgen' ? leadgenCreatives : ecommerceCreatives;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-brand-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Creative Breakdown</h2>
                  <p className="text-xs text-gray-500">Detailed ad performance analysis</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {(businessModel === 'leadgen' ? [
                    { label: 'Active Creatives', value: '4', change: '+2', positive: true },
                    { label: 'Total Spend', value: '₹5.4L', change: '-5%', positive: true },
                    { label: 'Total Leads', value: '460', change: '+18%', positive: true },
                    { label: 'Avg CPL', value: '₹1,174', change: '-12%', positive: true },
                  ] : [
                    { label: 'Active Creatives', value: '4', change: '+2', positive: true },
                    { label: 'Total Spend', value: '₹8.0L', change: '-8%', positive: true },
                    { label: 'Total Revenue', value: '₹17.3L', change: '+15%', positive: true },
                    { label: 'Avg ROAS', value: '2.10x', change: '+8%', positive: true },
                  ]).map((stat, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className={`text-xs font-medium ${stat.positive ? 'text-brand' : 'text-gray-500'}`}>
                        {stat.change} vs last month
                      </p>
                    </div>
                  ))}
                </div>

                {/* Creatives Breakdown Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Creative Breakdown</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {(['7d', '30d', '90d'] as const).map((period) => (
                          <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedPeriod === period
                                ? 'bg-brand text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Creative</th>
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Spend</th>
                          {businessModel === 'leadgen' ? (
                            <>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Leads</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CPL</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CVR</th>
                            </>
                          ) : (
                            <>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Revenue</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">ROAS</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Purchases</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CPA</th>
                            </>
                          )}
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CTR</th>
                          <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                          <th className="px-3 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {creatives.map((creative) => (
                          <tr 
                            key={creative.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedCreativeFromTable(creative)}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {/* Thumbnail */}
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                                  <span className="text-2xl">{creative.thumbnail}</span>
                                </div>
                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{creative.hook}</p>
                                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                      creative.format === 'Video' 
                                        ? 'bg-gray-100 text-gray-600 border border-gray-200' 
                                        : 'bg-brand-light text-brand border border-brand/20'
                                    }`}>
                                      {creative.format}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {creative.campaignName}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {creative.adSetName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                              ₹{(creative.spend / 100000).toFixed(1)}L
                            </td>
                            {businessModel === 'leadgen' ? (
                              <>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {creative.leads}
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    creative.cpl! <= 800 ? 'text-brand' :
                                    creative.cpl! <= 1200 ? 'text-brand' :
                                    creative.cpl! <= 1800 ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    ₹{creative.cpl!.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {creative.cvr.toFixed(1)}%
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  ₹{(creative.revenue! / 100000).toFixed(1)}L
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    creative.roas! >= 2.5 ? 'text-brand' :
                                    creative.roas! >= 1.8 ? 'text-brand' :
                                    creative.roas! >= 1.2 ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    {creative.roas!.toFixed(2)}x
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {creative.purchases!.toLocaleString()}
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  ₹{creative.cpa!.toFixed(0)}
                                </td>
                              </>
                            )}
                            <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                              {creative.ctr.toFixed(1)}%
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                creative.status === 'excellent' ? 'bg-brand-light text-brand border border-brand/20' :
                                creative.status === 'good' ? 'bg-brand-light text-brand border border-brand/20' :
                                creative.status === 'average' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {creative.status === 'excellent' ? '✓ Excellent' :
                                 creative.status === 'good' ? '✓ Good' :
                                 creative.status === 'average' ? '⚠ Average' : '✗ Poor'}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Drill-down Drawer */}
      {selectedCreativeFromTable && (
        <CreativeDrilldownDrawer 
          creative={selectedCreativeFromTable} 
          onClose={() => setSelectedCreativeFromTable(null)}
          businessModel={businessModel}
        />
      )}
    </>
  );
}

// Creative Drill-down Drawer
function CreativeDrilldownDrawer({
  creative,
  onClose,
  businessModel
}: {
  creative: CreativeDetails;
  onClose: () => void;
  businessModel: 'ecommerce' | 'leadgen';
}) {
  const [previewCreative, setPreviewCreative] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Map CreativeDetails to the shape CreativePreviewDrawer expects
  const openPreview = () => {
    setPreviewCreative({
      name: `${creative.format} - "${creative.hook}"`,
      format: creative.format,
      channel: creative.campaignName?.split(' - ')[0] || 'Meta',
      impressions: creative.impressions >= 1000000 ? `${(creative.impressions / 1000000).toFixed(1)}M` : creative.impressions >= 1000 ? `${(creative.impressions / 1000).toFixed(1)}K` : String(creative.impressions),
      age: `${creative.daysLive} days`,
      spend: creative.spend >= 100000 ? `₹${(creative.spend / 100000).toFixed(0)}K` : `₹${(creative.spend / 1000).toFixed(0)}K`,
      cpl: creative.cpl || 0,
      roas: creative.roas || 0,
      campaign: creative.campaignName,
      adSet: creative.adSetName,
      elements: ['Hook', creative.format, creative.status].filter(Boolean),
    });
  };

  // Performance over time data (simulated)
  const performanceData = businessModel === 'ecommerce' ? [
    { day: 'Day 1', roas: 3.8, spend: 15000, revenue: 57000 },
    { day: 'Day 3', roas: 3.6, spend: 18000, revenue: 64800 },
    { day: 'Day 5', roas: 3.4, spend: 22000, revenue: 74800 },
    { day: 'Day 7', roas: 3.2, spend: 25000, revenue: 80000 },
    { day: 'Day 10', roas: 2.9, spend: 28000, revenue: 81200 },
    { day: 'Day 12', roas: 2.7, spend: 30000, revenue: 81000 },
  ] : [
    { day: 'Day 1', cpl: 650, spend: 8000, leads: 12 },
    { day: 'Day 3', cpl: 710, spend: 12000, leads: 17 },
    { day: 'Day 5', cpl: 780, spend: 18000, leads: 23 },
    { day: 'Day 7', cpl: 850, spend: 22000, leads: 26 },
    { day: 'Day 10', cpl: 920, spend: 28000, leads: 30 },
    { day: 'Day 12', cpl: 1050, spend: 32000, leads: 30 },
  ];

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60" onClick={() => { setPreviewCreative(null); onClose(); }} />

      {/* Left-side Creative Preview Drawer */}
      {previewCreative && (
        <CreativePreviewPanel creative={previewCreative} onClose={() => setPreviewCreative(null)} businessModel={businessModel} />
      )}

      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200">
                <span className="text-4xl">{creative.thumbnail}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">{creative.hook}</h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    creative.format === 'Video'
                      ? 'bg-gray-100 text-gray-600 border border-gray-200'
                      : 'bg-brand-light text-brand border border-brand/20'
                  }`}>
                    {creative.format}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    creative.status === 'excellent' ? 'bg-brand-light text-brand border border-brand/20' :
                    creative.status === 'good' ? 'bg-brand-light text-brand border border-brand/20' :
                    creative.status === 'average' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                    'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {creative.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{creative.campaignName} • {creative.adSetName}</p>
                <p className="text-xs text-gray-500 mt-0.5">ID: {creative.id} • Live for {creative.daysLive} days</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={openPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/20 text-brand hover:bg-brand hover:text-white transition-all duration-200"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <Eye className="w-3.5 h-3.5" />
                View Creative
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">Ad Spend</p>
                    <p className="text-xl font-bold text-gray-900">₹{(creative.spend / 100000).toFixed(2)}L</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total investment</p>
                  </div>
                  
                  {businessModel === 'ecommerce' ? (
                    <>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Revenue</p>
                        <p className="text-xl font-bold text-gray-900">₹{(creative.revenue! / 100000).toFixed(2)}L</p>
                        <p className="text-xs text-gray-500 mt-0.5">{creative.purchases} purchases</p>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">ROAS</p>
                        <p className={`text-xl font-bold ${
                          creative.roas! >= 2.5 ? 'text-brand' :
                          creative.roas! >= 1.8 ? 'text-brand' : 'text-gray-500'
                        }`}>{creative.roas!.toFixed(2)}x</p>
                        <p className="text-xs text-gray-500 mt-0.5">Return on ad spend</p>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Cost Per Purchase</p>
                        <p className="text-xl font-bold text-gray-900">₹{creative.cpa!.toFixed(0)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{creative.cvr}% conversion rate</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Total Leads</p>
                        <p className="text-xl font-bold text-gray-900">{creative.leads}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Lead generation</p>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Cost Per Lead</p>
                        <p className={`text-xl font-bold ${
                          creative.cpl! <= 800 ? 'text-brand' :
                          creative.cpl! <= 1200 ? 'text-brand' : 'text-gray-500'
                        }`}>₹{creative.cpl!.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Lead efficiency</p>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                        <p className="text-xl font-bold text-gray-900">{creative.cvr}%</p>
                        <p className="text-xs text-gray-500 mt-0.5">Click to lead</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Traffic & Engagement Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Traffic & Engagement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Impressions</p>
                        <p className="text-lg font-semibold text-gray-900">{(creative.impressions / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reach</p>
                        <p className="text-lg font-semibold text-gray-900">{(creative.reach / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Clicks</p>
                        <p className="text-lg font-semibold text-gray-900">{(creative.clicks / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CTR</p>
                        <p className="text-lg font-semibold text-brand">{creative.ctr.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CPC</p>
                        <p className="text-lg font-semibold text-gray-900">₹{creative.cpc.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CPM</p>
                        <p className="text-lg font-semibold text-gray-900">₹{creative.cpm.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Frequency</p>
                        <p className="text-lg font-semibold text-gray-900">{creative.frequency.toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Days Live</p>
                        <p className="text-lg font-semibold text-brand">{creative.daysLive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  <h3 className="text-sm font-semibold text-gray-900">Actionable Insights</h3>
                </div>
                
                <div className="space-y-4">
                  {businessModel === 'ecommerce' ? (
                    creative.status === 'excellent' || creative.status === 'good' ? (
                      <>
                        {/* Revenue Impact */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">💰 Revenue Impact:</span> {creative.roas!.toFixed(2)}x ROAS generating ₹{((creative.revenue! - creative.spend) / 100000).toFixed(2)}L net profit this month. At current performance, this creative will contribute ₹{(((creative.revenue! - creative.spend) * 12) / 100000).toFixed(1)}L in annual net profit - a key growth driver for the business.
                          </p>
                        </div>

                        {/* Efficiency Analysis */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📊 Efficiency Analysis:</span> {((creative.revenue! - creative.spend) / creative.revenue! * 100).toFixed(1)}% profit margin with {creative.ctr.toFixed(1)}% CTR places this in the top {creative.status === 'excellent' ? '10' : '20'}% of campaigns. Customer acquisition is highly efficient - cost per order is ₹{creative.cpa!.toFixed(0)}, well below industry benchmarks.
                          </p>
                        </div>

                        {/* Strategic Opportunity */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">🚀 Strategic Opportunity:</span> This creative is a proven winner. Recommend increasing budget allocation by {creative.status === 'excellent' ? '40-50' : '30-40'}% (additional ₹{((creative.spend * (creative.status === 'excellent' ? 0.45 : 0.35)) / 100000).toFixed(1)}L/month) to capture more market share. Expected additional net profit: ₹{(((creative.spend * (creative.status === 'excellent' ? 0.45 : 0.35)) * (creative.roas! - 1)) / 100000).toFixed(2)}L/month.
                          </p>
                        </div>

                        {/* Scale Strategy */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📈 Scale Strategy:</span> Replicate this "{creative.hook}" angle to similar audience segments or adjacent markets. Based on current CAC efficiency (₹{creative.cpa!.toFixed(0)}), you can sustainably scale acquisition spend by {creative.status === 'excellent' ? '3x' : '2x'} while maintaining profitability. Consider testing {creative.format === 'Video' ? 'image' : 'video'} variations of this winning hook.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Performance Warning */}
                        <div className="border-l-4 border-gray-300 bg-gray-50/80 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">⚠️ Performance Alert:</span> {creative.roas!.toFixed(2)}x ROAS is {creative.status === 'average' ? 'below optimal' : 'critically low'}, generating only ₹{((creative.revenue! - creative.spend) / 100000).toFixed(2)}L net profit margin. Current CAC of ₹{creative.cpa!.toFixed(0)} indicates {creative.status === 'average' ? 'room for improvement' : 'immediate action required'} to maintain sustainable unit economics.
                          </p>
                        </div>

                        {/* Creative Fatigue */}
                        <div className="border-l-4 border-gray-300 bg-gray-50/80 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📉 Creative Fatigue Detected:</span> At {creative.daysLive} days live with {creative.frequency.toFixed(1)}x frequency, this creative shows audience saturation. CTR of {creative.ctr.toFixed(1)}% and declining ROAS trend indicate diminishing returns. {creative.status === 'average' ? 'Prepare backup creatives now' : 'Pause and replace immediately'} to prevent further budget waste.
                          </p>
                        </div>

                        {/* Hook Analysis */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">🎯 Hook Optimization:</span> "{creative.hook}" angle may not resonate with target audience. Test proven formats like Problem-Solution or Before-After which typically achieve 2.5-3.5x ROAS in your category. Consider UGC testimonials or product demonstration approaches for better engagement.
                          </p>
                        </div>

                        {/* Action Plan */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">⚡ Immediate Action Required:</span> {creative.status === 'average' ? 'Reduce budget by 50% and' : 'Pause this creative and'} launch 3-4 new angle tests immediately. Reallocate ₹{(creative.spend * 0.7 / 100000).toFixed(1)}L monthly budget to fresh creative tests targeting {creative.ctr < 2.5 ? 'more relevant audiences with stronger hooks' : 'the same audience with different messaging'}.
                          </p>
                        </div>
                      </>
                    )
                  ) : (
                    // Lead Gen Insights
                    creative.status === 'excellent' || creative.status === 'good' ? (
                      <>
                        {/* Pipeline Impact */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">💰 Pipeline Impact:</span> ₹{creative.cpl!.toLocaleString()} CPL delivering {creative.leads} leads this month. Assuming {creative.status === 'excellent' ? '15-20' : '12-15'}% lead-to-customer conversion, this generates {Math.round(creative.leads! * (creative.status === 'excellent' ? 0.175 : 0.135))} potential customers. With average customer LTV of ₹5L, projected pipeline value: ₹{(Math.round(creative.leads! * (creative.status === 'excellent' ? 0.175 : 0.135)) * 5).toFixed(0)}L.
                          </p>
                        </div>

                        {/* Efficiency Benchmark */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📊 Efficiency Benchmark:</span> ₹{creative.cpl!.toLocaleString()} CPL with {creative.cvr.toFixed(1)}% conversion rate is {creative.status === 'excellent' ? 'exceptional' : 'strong'} for B2B services. Your CAC efficiency (CPL ÷ lead-to-customer rate) is ₹{(creative.cpl! / 0.15).toLocaleString()}, significantly below typical B2B CAC of ₹15-25K. This indicates highly qualified lead quality.
                          </p>
                        </div>

                        {/* Scale Opportunity */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">🚀 Scale Opportunity:</span> This "{creative.hook}" messaging resonates with decision-makers. Increase budget by {creative.status === 'excellent' ? '40-50' : '30-40'}% (additional ₹{((creative.spend * (creative.status === 'excellent' ? 0.45 : 0.35)) / 1000).toFixed(0)}K/month) to generate {Math.round((creative.spend * (creative.status === 'excellent' ? 0.45 : 0.35)) / creative.cpl!)} more leads monthly while maintaining current CPL efficiency.
                          </p>
                        </div>

                        {/* Expansion Strategy */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📈 Expansion Strategy:</span> Replicate this proven creative across LinkedIn Campaign Manager for senior decision-makers and Google Search for high-intent prospects. Test similar professional positioning in adjacent industries. At current ₹{creative.cpl!.toLocaleString()} CPL efficiency, you can scale spend {creative.status === 'excellent' ? '3-4x' : '2-3x'} profitably.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* CPL Alert */}
                        <div className="border-l-4 border-gray-300 bg-gray-50/80 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">⚠️ CPL Alert:</span> ₹{creative.cpl!.toLocaleString()} CPL is {creative.status === 'average' ? 'above target efficiency' : 'critically high'}. At this cost, you need {(creative.cpl! / 5000).toFixed(1)}x average customer LTV just to break even on CAC. Current spend of ₹{(creative.spend / 100000).toFixed(2)}L is generating {creative.status === 'average' ? 'suboptimal' : 'poor'} return on acquisition investment.
                          </p>
                        </div>

                        {/* Audience Fatigue */}
                        <div className="border-l-4 border-gray-300 bg-gray-50/80 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">📉 Audience Saturation:</span> At {creative.daysLive} days live with {creative.frequency.toFixed(1)}x frequency, B2B audience fatigue is evident. CTR of {creative.ctr.toFixed(1)}% and rising CPL indicate diminishing returns. {creative.status === 'average' ? 'Rotate in backup creatives within 7 days' : 'Pause immediately and launch fresh angle tests'}.
                          </p>
                        </div>

                        {/* Messaging Issue */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">🎯 Messaging Optimization:</span> "{creative.hook}" may be too {creative.hook.includes('Generic') ? 'generic' : 'indirect'} for B2B decision-makers. Test Thought Leadership, ROI Calculator, or Case Study Results formats which typically achieve ₹800-1,200 CPL in professional services. Focus on specific, quantifiable business outcomes.
                          </p>
                        </div>

                        {/* Reallocation Plan */}
                        <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold">⚡ Budget Reallocation:</span> {creative.status === 'average' ? 'Reduce budget by 60% and' : 'Pause this creative and'} reallocate ₹{(creative.spend * 0.75 / 1000).toFixed(0)}K to proven angles. Launch 2-3 new tests with professional, outcome-focused messaging. Target senior decision-makers on LinkedIn with {creative.ctr < 2.0 ? 'stronger value propositions' : 'more specific lead magnets'}.
                          </p>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>

              {/* Performance Over Time Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {businessModel === 'ecommerce' ? 'ROAS Trend' : 'CPL Trend'} Over Time
                </h3>
                <div className="h-64 min-h-[256px] w-full">
                  <ResponsiveContainer width="100%" height={256} minWidth={0}>
                    <LineChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis key="xaxis" dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis key="yaxis" tick={{ fontSize: 11 }} />
                      <Tooltip 
                        key="tooltip"
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        key="line"
                        type="monotone" 
                        dataKey={businessModel === 'ecommerce' ? 'roas' : 'cpl'}
                        stroke="#204CC7" 
                        strokeWidth={2}
                        dot={{ fill: '#204CC7', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Demographic Breakdown */}
              <DemographicsBreakdown
                data={{
                  age: [
                    { range: '18-24', percentage: 18, spend: 43200, ...(businessModel === 'ecommerce' ? { revenue: 122400, roas: 2.83, purchases: 637 } : { leads: 34, qualified: 22, cpl: 1271 }) },
                    { range: '25-34', percentage: 35, spend: 84000, ...(businessModel === 'ecommerce' ? { revenue: 237600, roas: 2.83, purchases: 1237 } : { leads: 59, qualified: 41, cpl: 1424 }) },
                    { range: '35-44', percentage: 28, spend: 67200, ...(businessModel === 'ecommerce' ? { revenue: 190400, roas: 2.83, purchases: 990 } : { leads: 44, qualified: 32, cpl: 1527 }) },
                    { range: '45-54', percentage: 13, spend: 31200, ...(businessModel === 'ecommerce' ? { revenue: 88400, roas: 2.83, purchases: 460 } : { leads: 16, qualified: 10, cpl: 1950 }) },
                    { range: '55+', percentage: 6, spend: 14400, ...(businessModel === 'ecommerce' ? { revenue: 40800, roas: 2.83, purchases: 212 } : { leads: 3, qualified: 1, cpl: 4800 }) },
                  ],
                  gender: [
                    { type: businessModel === 'ecommerce' ? 'Female' : 'Male', percentage: businessModel === 'ecommerce' ? 58 : 56, spend: businessModel === 'ecommerce' ? 139200 : 134400, ...(businessModel === 'ecommerce' ? { revenue: 394400, roas: 2.83, purchases: 2053 } : { leads: 87, qualified: 62, cpl: 1545 }) },
                    { type: businessModel === 'ecommerce' ? 'Male' : 'Female', percentage: businessModel === 'ecommerce' ? 40 : 42, spend: businessModel === 'ecommerce' ? 96000 : 100800, ...(businessModel === 'ecommerce' ? { revenue: 272000, roas: 2.83, purchases: 1416 } : { leads: 65, qualified: 44, cpl: 1551 }) },
                    { type: 'Other', percentage: 2, spend: 4800, ...(businessModel === 'ecommerce' ? { revenue: 13600, roas: 2.83, purchases: 71 } : { leads: 3, qualified: 1, cpl: 1600 }) },
                  ],
                  region: [
                    { name: 'Mumbai Metro', percentage: 28, spend: 67200, ...(businessModel === 'ecommerce' ? { revenue: 190400, roas: 2.83, purchases: 990 } : { leads: 43, qualified: 30, cpl: 1563 }) },
                    { name: 'Delhi NCR', percentage: 24, spend: 57600, ...(businessModel === 'ecommerce' ? { revenue: 163200, roas: 2.83, purchases: 849 } : { leads: 37, qualified: 26, cpl: 1557 }) },
                    { name: 'Bangalore', percentage: 22, spend: 52800, ...(businessModel === 'ecommerce' ? { revenue: 149600, roas: 2.83, purchases: 778 } : { leads: 34, qualified: 24, cpl: 1553 }) },
                    { name: 'Hyderabad', percentage: 12, spend: 28800, ...(businessModel === 'ecommerce' ? { revenue: 81600, roas: 2.83, purchases: 424 } : { leads: 19, qualified: 13, cpl: 1516 }) },
                    { name: 'Chennai', percentage: 8, spend: 19200, ...(businessModel === 'ecommerce' ? { revenue: 54400, roas: 2.83, purchases: 283 } : { leads: 12, qualified: 8, cpl: 1600 }) },
                    { name: 'Others', percentage: 6, spend: 14400, ...(businessModel === 'ecommerce' ? { revenue: 40800, roas: 2.83, purchases: 212 } : { leads: 10, qualified: 6, cpl: 1440 }) },
                  ],
                  platform: [
                    { type: 'Mobile', percentage: 68, spend: 163200, ...(businessModel === 'ecommerce' ? { revenue: 462400, roas: 2.83, purchases: 2407 } : { leads: 105, qualified: 74, cpl: 1554 }) },
                    { type: 'Desktop', percentage: 28, spend: 67200, ...(businessModel === 'ecommerce' ? { revenue: 190400, roas: 2.83, purchases: 990 } : { leads: 43, qualified: 30, cpl: 1563 }) },
                    { type: 'Tablet', percentage: 4, spend: 9600, ...(businessModel === 'ecommerce' ? { revenue: 27200, roas: 2.83, purchases: 142 } : { leads: 7, qualified: 4, cpl: 1371 }) },
                  ],
                }}
                businessModel={businessModel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


// ─── Creative Preview Panel (left-side drawer) ─────────────────────────────
function CreativePreviewPanel({ creative, onClose, businessModel = 'ecommerce' }: { creative: any | null; onClose: () => void; businessModel?: 'ecommerce' | 'leadgen' }) {
  if (!creative) return null;

  const isVideo = creative.format?.toLowerCase().includes('video');
  const isCarousel = creative.format?.toLowerCase().includes('carousel');
  const cardCount = isCarousel ? parseInt(creative.format.match(/\d+/)?.[0] || '4') : 1;
  const duration = creative.format.match(/\d+/)?.[0] || '15';
  const cleanName = creative.name.replace(/^(Video|Carousel|Static)\s*-\s*/, '').replace(/"/g, '');
  const primaryMetric = businessModel === 'leadgen' ? { label: 'CPL', value: `₹${creative.cpl}` } : { label: 'ROAS', value: `${creative.roas}x` };

  return (
    <div
      className="absolute left-0 top-0 h-full bg-gray-50 flex flex-col"
      style={{ width: 'calc(100% - 64rem)', minWidth: '380px', borderRight: '1px solid #E5E7EB' }}
    >
      {/* Minimal Header */}
      <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#204CC7' }}>
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}>Ad Preview</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Ad Mockup */}
        <div className="p-5 pb-4">
          <div className="mx-auto max-w-[340px] rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)' }}>
            {/* Platform bar */}
            <div className="px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #204CC7, #3B6EF6)' }}>
                <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>B</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>Brand Name</p>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400" style={{ fontSize: '11px', fontWeight: 400 }}>Sponsored</span>
                  <span className="text-gray-300" style={{ fontSize: '11px' }}>&middot;</span>
                  <Globe className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              <div className="text-gray-300" style={{ fontSize: '18px', letterSpacing: '2px', lineHeight: 1 }}>&middot;&middot;&middot;</div>
            </div>

            {/* Creative visual */}
            {isVideo ? (
              <div className="relative w-full" style={{ aspectRatio: '4/5', background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                    <div className="w-0 h-0 ml-1" style={{ borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '14px solid rgba(255,255,255,0.9)' }} />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-white" style={{ fontSize: '11px', fontWeight: 600 }}>0:{duration}</span>
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                  <span className="text-white/80" style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{creative.format}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
              </div>
            ) : isCarousel ? (
              <div className="w-full bg-gray-50">
                <div className="flex gap-2 overflow-x-auto px-1 py-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                  {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="snap-center flex-shrink-0 flex flex-col items-center justify-center gap-2" style={{ width: '82%', aspectRatio: '1/1', background: i === 0 ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', borderRadius: '4px' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: i === 0 ? 'rgba(32,76,199,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <Palette className="w-5 h-5" style={{ color: i === 0 ? '#204CC7' : '#94A3B8' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>Card {i + 1}/{cardCount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="rounded-full" style={{ width: i === 0 ? '16px' : '5px', height: '5px', background: i === 0 ? '#204CC7' : '#D1D5DB' }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)' }}>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)' }}>
                    <Palette className="w-7 h-7 text-brand/50" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#6366F1' }}>Static Image</span>
                </div>
              </div>
            )}

            {/* Ad copy + CTA */}
            <div className="px-3.5 pt-2.5 pb-3">
              <p className="text-gray-800 mb-2.5" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.45 }}>{cleanName}</p>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#F3F4F6' }}>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>brand.com</p>
                  <p className="text-gray-700" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                    {businessModel === 'leadgen' ? 'Sign Up Today' : 'Shop the Collection'}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-gray-200">
                  <span className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {businessModel === 'leadgen' ? 'Get Started' : 'Shop Now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="px-3.5 pb-3 flex items-center gap-3 text-gray-400" style={{ fontSize: '11px' }}>
              <span>👍 1.2K</span>
              <span>💬 89</span>
              <span>↗ 234 shares</span>
            </div>
          </div>
        </div>

        {/* Performance strip */}
        <div className="px-5 pb-4">
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)' }}>
            {[
              { label: 'Impressions', value: creative.impressions, highlight: false },
              { label: 'Spend', value: creative.spend, highlight: false },
              { label: primaryMetric.label, value: primaryMetric.value, highlight: true },
              { label: 'Age', value: creative.age, highlight: false },
            ].map((stat, i) => (
              <div key={i} className="flex-1 px-3 py-3 text-center" style={{ borderRight: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <p className="text-gray-400 mb-0.5" style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: stat.highlight ? '#204CC7' : '#111827' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="px-5 pb-4">
          <div className="rounded-xl bg-white p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)' }}>
            <p className="text-gray-900 mb-3" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</p>
            <div className="space-y-2.5">
              {[
                { label: 'Format', value: creative.format },
                { label: 'Channel', value: creative.channel },
                { label: 'Campaign', value: creative.campaign },
                { label: 'Ad Set', value: creative.adSet },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '13px', fontWeight: 400 }}>{row.label}</span>
                  <span className="text-gray-900 text-right truncate" style={{ fontSize: '13px', fontWeight: 500 }} title={row.value}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Elements */}
        {creative.elements?.length > 0 && (
          <div className="px-5 pb-5">
            <p className="text-gray-400 mb-2" style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Elements</p>
            <div className="flex flex-wrap gap-1.5">
              {creative.elements.map((el: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-white text-gray-600" style={{ fontSize: '12px', fontWeight: 500, border: '1px solid #E5E7EB' }}>
                  {el}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
