'use client';

import { X, Zap, ArrowRight, Target, Lightbulb, CheckCircle, AlertCircle, Eye, MousePointer, TrendingUp, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import { CampaignDrilldownDrawer } from './CampaignDrilldownDrawerFixed';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  businessModel?: 'ecommerce' | 'leadgen';
}

// Main Campaigns Drawer with Table
export function CampaignsDrawer({ isOpen, onClose, businessModel = 'ecommerce' }: DrawerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  if (!isOpen) return null;

  // Meta campaigns data for e-commerce
  const metaCampaigns = [
    { 
      id: 1,
      name: 'Product Catalog Sales - Summer Collection',
      objective: 'Conversions',
      spend: 240000,
      revenue: 680000,
      roas: 2.83,
      status: 'excellent',
      impressions: 2400000,
      clicks: 84200,
      ctr: 3.51,
      cvr: 4.2,
      purchases: 3536,
      cpa: 67.9,
      frequency: 2.8,
      budget: 8000,
      budgetType: 'daily'
    },
    { 
      id: 2,
      name: 'Dynamic Retargeting - Cart Abandoners',
      objective: 'Conversions', 
      spend: 180000,
      revenue: 410000,
      roas: 2.28,
      status: 'good',
      impressions: 1800000,
      clicks: 68400,
      ctr: 3.8,
      cvr: 5.6,
      purchases: 3832,
      cpa: 47.0,
      frequency: 4.2,
      budget: 6000,
      budgetType: 'daily'
    },
    { 
      id: 3,
      name: 'Collection Ads - New Arrivals',
      objective: 'Traffic',
      spend: 220000,
      revenue: 420000,
      roas: 1.91,
      status: 'average',
      impressions: 2800000,
      clicks: 78400,
      ctr: 2.8,
      cvr: 2.8,
      purchases: 2195,
      cpa: 100.2,
      frequency: 2.3,
      budget: 7500,
      budgetType: 'daily'
    },
    { 
      id: 4,
      name: 'Prospecting - Lookalike Audiences',
      objective: 'Conversions',
      spend: 160000,
      revenue: 220000,
      roas: 1.38,
      status: 'poor',
      impressions: 3200000,
      clicks: 64000,
      ctr: 2.0,
      cvr: 1.9,
      purchases: 1216,
      cpa: 131.6,
      frequency: 3.5,
      budget: 5500,
      budgetType: 'daily'
    },
  ];

  // Meta campaigns data for lead generation
  const metaLeadGenCampaigns = [
    { 
      id: 1,
      name: 'Lead Gen Forms - Service Discovery',
      objective: 'Lead Generation',
      spend: 120000,
      leads: 156,
      cpl: 769,
      cpm: 67,
      status: 'excellent',
      impressions: 1800000,
      clicks: 54000,
      ctr: 3.0,
      cvr: 22,
      frequency: 2.4,
      budget: 4000,
      budgetType: 'daily'
    },
    { 
      id: 2,
      name: 'Video Campaign - Founder Testimonials',
      objective: 'Lead Generation', 
      spend: 180000,
      leads: 98,
      cpl: 1837,
      cpm: 150,
      status: 'good',
      impressions: 1200000,
      clicks: 38400,
      ctr: 3.2,
      cvr: 18,
      frequency: 3.1,
      budget: 6000,
      budgetType: 'daily'
    },
    { 
      id: 3,
      name: 'Lead Magnet - Industry Case Studies',
      objective: 'Lead Generation',
      spend: 150000,
      leads: 124,
      cpl: 1210,
      cpm: 71,
      status: 'excellent',
      impressions: 2100000,
      clicks: 63000,
      ctr: 3.0,
      cvr: 19.7,
      frequency: 2.8,
      budget: 5000,
      budgetType: 'daily'
    },
    { 
      id: 4,
      name: 'Retargeting - Website Visitors',
      objective: 'Lead Generation',
      spend: 90000,
      leads: 82,
      cpl: 1098,
      cpm: 95,
      status: 'average',
      impressions: 950000,
      clicks: 28500,
      ctr: 3.0,
      cvr: 20.5,
      frequency: 4.2,
      budget: 3000,
      budgetType: 'daily'
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaigns: any[] = businessModel === 'leadgen' ? metaLeadGenCampaigns : metaCampaigns;

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
                  <h2 className="text-lg font-semibold text-gray-900">Meta Ads Campaigns</h2>
                  <p className="text-xs text-gray-500">Detailed campaign performance breakdown</p>
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
                    { label: 'Active Campaigns', value: '4', change: '+1', positive: true },
                    { label: 'Total Spend', value: '₹5.4L', change: '-5%', positive: true },
                    { label: 'Total Leads', value: '460', change: '+18%', positive: true },
                    { label: 'Avg CPL', value: '₹1,174', change: '-12%', positive: true },
                  ] : [
                    { label: 'Active Campaigns', value: '4', change: '+1', positive: true },
                    { label: 'Total Spend', value: '₹8.0L', change: '-8%', positive: true },
                    { label: 'Total Revenue', value: '₹17.3L', change: '+15%', positive: true },
                    { label: 'Avg ROAS', value: '2.16x', change: '+12%', positive: true },
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

                {/* Campaigns Breakdown Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Campaigns Breakdown</h3>
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
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Campaign</th>
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Spend</th>
                          {businessModel === 'leadgen' ? (
                            <>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">Leads</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CPL</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">CPM</th>
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
                        {campaigns.map((campaign) => (
                          <tr 
                            key={campaign.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{campaign.name}</p>
                                <p className="text-xs text-gray-500">{campaign.objective} • ₹{campaign.budget.toLocaleString()} {campaign.budgetType}</p>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                              ₹{(campaign.spend / 100000).toFixed(1)}L
                            </td>
                            {businessModel === 'leadgen' ? (
                              <>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {campaign.leads}
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    campaign.cpl <= 800 ? 'text-brand' :
                                    campaign.cpl <= 1200 ? 'text-brand' :
                                    campaign.cpl <= 1800 ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    ₹{campaign.cpl.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    campaign.cpm <= 800 ? 'text-brand' :
                                    campaign.cpm <= 1200 ? 'text-brand' :
                                    campaign.cpm <= 1800 ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    ₹{campaign.cpm.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {campaign.cvr.toFixed(1)}%
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  ₹{(campaign.revenue / 100000).toFixed(1)}L
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    campaign.roas >= 2.5 ? 'text-brand' :
                                    campaign.roas >= 1.8 ? 'text-brand' :
                                    campaign.roas >= 1.2 ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    {campaign.roas.toFixed(2)}x
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  {campaign.purchases.toLocaleString()}
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                                  ₹{campaign.cpa.toFixed(0)}
                                </td>
                              </>
                            )}
                            <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                              {campaign.ctr.toFixed(1)}%
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                campaign.status === 'excellent' ? 'bg-brand-light text-brand border border-brand/20' :
                                campaign.status === 'good' ? 'bg-brand-light text-brand border border-brand/20' :
                                campaign.status === 'average' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {campaign.status === 'excellent' ? '✓ Excellent' :
                                 campaign.status === 'good' ? '✓ Good' :
                                 campaign.status === 'average' ? '⚠ Average' : '✗ Poor'}
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

      {/* Campaign Drill-down Drawer */}
      {selectedCampaign && (
        <CampaignDrilldownDrawer 
          campaign={selectedCampaign}
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          businessModel={businessModel}
        />
      )}
    </>
  );
}
