'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle, Zap, Target, Award, IndianRupee, Calendar, Users, MousePointer, ShoppingBag, X, BarChart3, PieChart, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Play, Image as ImageIcon, Layout, Layers, ChevronLeft, ChevronRight, Lightbulb, CheckCircle, Eye, Sparkles, Clock, Smartphone, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DemographicsBreakdown } from './marketing/DemographicsBreakdown';

// Lazy-load heavy drawer so it doesn't ship with the main bundle
const CreativesDrawer = dynamic(
  () => import('./marketing/CreativesDrawer').then((m) => ({ default: m.CreativesDrawer })),
  { ssr: false }
);

interface CampaignsModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
  selectedPlatform: 'meta' | 'google';
  additionalMetrics?: string[];
}

interface CampaignData {
  id: string;
  name: string;
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  impressions: string;
  clicks: string;
  ctr: string;
  status: 'excellent' | 'good' | 'average' | 'poor';
  conversions?: number; // for Google Ads & Lead Gen
  cpc?: number; // for Google Ads
  cpl?: number; // for Lead Gen
  leads?: number; // for Lead Gen
  ql?: number; // Qualified Leads
  cplQ?: number; // Cost Per Qualified Lead
}

interface AdSetData {
  id: string;
  campaignName: string;
  adSetName: string;
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  impressions: string;
  clicks: string;
  ctr: string;
  status: 'excellent' | 'good' | 'average' | 'poor';
  cpl?: number; // for Lead Gen
  leads?: number; // for Lead Gen
  ql?: number; // Qualified Leads
  cplQ?: number; // Cost Per Qualified Lead
  cvr?: number; // for Lead Gen - conversion rate
  cpc?: number; // Cost per click (optional, computed when missing)
}

interface AdGroupData {
  id: string;
  campaignName: string;
  adGroupName: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  cpl?: number; // for Lead Gen
  leads?: number; // for Lead Gen
  ql?: number; // Qualified Leads
  cplQ?: number; // Cost Per Qualified Lead
  cvr?: number; // for Lead Gen - conversion rate
}

interface KeywordData {
  id: string;
  campaignName: string;
  adGroupName: string;
  keyword: string;
  matchType: 'Exact' | 'Phrase' | 'Broad';
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: number;
  qualityScore: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  cpl?: number; // for Lead Gen
  leads?: number; // for Lead Gen
  ql?: number; // Qualified Leads
  cplQ?: number; // Cost Per Qualified Lead
}

// Campaign demographic data for drill-down
interface CampaignDemographics {
  age: { range: string; percentage: number; spend: number; revenue: number; roas: number }[];
  gender: { type: string; percentage: number; spend: number; revenue: number; roas: number }[];
  region: { name: string; percentage: number; spend: number; revenue: number; roas: number }[];
  platform: { name: string; percentage: number; spend: number; revenue: number; roas: number }[];
  placement: { name: string; percentage: number; spend: number; revenue: number; roas: number }[];
}

type MetaViewMode = 'campaigns' | 'adsets' | 'ads';
type GoogleViewMode = 'campaigns' | 'adgroups' | 'ads' | 'keywords';

interface CreativeData {
  id: string;
  thumbnail: string;
  campaignName: string;
  adSetName: string;
  format: string;
  hook: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  linkClicks: number;
  lpv: number;
  costPerResult: number;
  roas: number;
  cpl: number;
  leads: number;
  ql?: number; // Qualified Leads
  cplQ?: number; // Cost Per Qualified Lead
  purchases?: number;
  cpa?: number;
  cvr: number;
  frequency: number;
  daysLive: number;
  status: 'fresh' | 'fatiguing' | 'dead';
  qualityScore?: number;
  impressionShare?: number;
  conversions?: number;
  searchImprShare?: string;
}

// ── Audience Breakdown Table ──
type AudienceSegment = 'platform' | 'placement' | 'age' | 'gender' | 'device' | 'category' | 'service';

interface AudienceRow {
  label: string;
  isTop?: boolean;
  spend: string;
  spendPct: number;
  purchases: string;
  roas: number;
  leads?: string;
  cpl?: string;
  ql?: string;
  cplQ?: string;
}

function AudienceBreakdownTable({ businessModel, platform }: { businessModel: 'ecommerce' | 'leadgen'; platform: 'meta' | 'google' }) {
  const [segment, setSegment] = useState<AudienceSegment>('platform');
  const [segmentOpen, setSegmentOpen] = useState(false);

  const allSegmentLabels: Record<AudienceSegment, string> = {
    platform: 'Platform',
    placement: 'Placement',
    age: 'Age',
    gender: 'Gender',
    device: 'Device',
    category: 'Category',
    service: 'Service',
  };

  // Ecommerce gets Category, Leadgen gets Service
  const segmentLabels = Object.fromEntries(
    Object.entries(allSegmentLabels).filter(([key]) =>
      businessModel === 'ecommerce' ? key !== 'service' : key !== 'category'
    )
  ) as Record<AudienceSegment, string>;

  const getRoasColor = (roas: number) => {
    if (roas >= 3.0) return 'text-green-600';
    if (roas >= 2.5) return 'text-blue-600';
    if (roas >= 2.0) return 'text-amber-600';
    return 'text-red-500';
  };

  // ── Data by segment and platform ──
  const audienceData: Record<'meta' | 'google', Record<AudienceSegment, AudienceRow[]>> = {
    meta: {
      platform: [
        { label: 'Instagram', isTop: true, spend: '₹636.4K', spendPct: 44.0, purchases: '1,776', roas: 2.79, leads: '228', cpl: '₹742' },
        { label: 'Facebook', spend: '₹607.1K', spendPct: 42.0, purchases: '1,546', roas: 2.55, leads: '198', cpl: '₹814' },
        { label: 'Audience Network', spend: '₹130.1K', spendPct: 9.0, purchases: '268', roas: 2.06, leads: '34', cpl: '₹1,017' },
        { label: 'Threads', spend: '₹72.3K', spendPct: 5.0, purchases: '156', roas: 2.16, leads: '20', cpl: '₹962' },
      ],
      placement: [
        { label: 'Feed', isTop: true, spend: '₹578.2K', spendPct: 40.0, purchases: '1,684', roas: 2.91, leads: '216', cpl: '₹712' },
        { label: 'Stories', spend: '₹376.8K', spendPct: 26.0, purchases: '1,012', roas: 2.68, leads: '130', cpl: '₹771' },
        { label: 'Reels', spend: '₹289.2K', spendPct: 20.0, purchases: '824', roas: 2.85, leads: '106', cpl: '₹725' },
        { label: 'Explore', spend: '₹115.7K', spendPct: 8.0, purchases: '268', roas: 2.32, leads: '34', cpl: '₹905' },
        { label: 'Right Column', spend: '₹86.8K', spendPct: 6.0, purchases: '158', roas: 1.82, leads: '20', cpl: '₹1,153' },
      ],
      age: [
        { label: '25-34', isTop: true, spend: '₹520.6K', spendPct: 36.0, purchases: '1,542', roas: 2.96, leads: '198', cpl: '₹699' },
        { label: '18-24', spend: '₹346.8K', spendPct: 24.0, purchases: '892', roas: 2.57, leads: '114', cpl: '₹808' },
        { label: '35-44', spend: '₹303.5K', spendPct: 21.0, purchases: '864', roas: 2.85, leads: '111', cpl: '₹727' },
        { label: '45-54', spend: '₹173.4K', spendPct: 12.0, purchases: '324', roas: 1.87, leads: '42', cpl: '₹1,097' },
        { label: '55+', spend: '₹101.6K', spendPct: 7.0, purchases: '124', roas: 1.22, leads: '16', cpl: '₹1,688' },
      ],
      gender: [
        { label: 'Female', isTop: true, spend: '₹693.5K', spendPct: 48.0, purchases: '2,012', roas: 2.90, leads: '258', cpl: '₹714' },
        { label: 'Male', spend: '₹636.4K', spendPct: 44.0, purchases: '1,586', roas: 2.49, leads: '203', cpl: '₹834' },
        { label: 'Unknown', spend: '₹115.7K', spendPct: 8.0, purchases: '148', roas: 1.28, leads: '19', cpl: '₹1,619' },
      ],
      device: [
        { label: 'Mobile', isTop: true, spend: '₹996.4K', spendPct: 69.0, purchases: '2,808', roas: 2.82, leads: '360', cpl: '₹736' },
        { label: 'Desktop', spend: '₹346.8K', spendPct: 24.0, purchases: '812', roas: 2.34, leads: '104', cpl: '₹886' },
        { label: 'Tablet', spend: '₹101.6K', spendPct: 7.0, purchases: '126', roas: 1.24, leads: '16', cpl: '₹1,688' },
      ],
      category: [
        { label: "Women's Fashion", isTop: true, spend: '₹506.3K', spendPct: 35.0, purchases: '1,628', roas: 3.22, leads: '0', cpl: '—' },
        { label: "Men's Fashion", spend: '₹346.8K', spendPct: 24.0, purchases: '982', roas: 2.83, leads: '0', cpl: '—' },
        { label: 'Accessories', spend: '₹260.1K', spendPct: 18.0, purchases: '748', roas: 2.88, leads: '0', cpl: '—' },
        { label: 'Footwear', spend: '₹187.3K', spendPct: 13.0, purchases: '412', roas: 2.20, leads: '0', cpl: '—' },
        { label: 'Beauty & Skincare', spend: '₹144.8K', spendPct: 10.0, purchases: '376', roas: 2.60, leads: '0', cpl: '—' },
      ],
      service: [
        { label: 'Performance Marketing', isTop: true, spend: '₹520.6K', spendPct: 36.0, purchases: '1,584', roas: 3.04, leads: '182', cpl: '₹761', ql: '69', cplQ: '₹2,006' },
        { label: 'Finance & Accounting', spend: '₹376.8K', spendPct: 26.0, purchases: '1,024', roas: 2.72, leads: '128', cpl: '₹783', ql: '41', cplQ: '₹2,443' },
        { label: 'Tech Solutions', spend: '₹260.5K', spendPct: 18.0, purchases: '698', roas: 2.68, leads: '86', cpl: '₹806', ql: '24', cplQ: '₹2,885' },
        { label: 'HR & Recruitment', spend: '₹173.4K', spendPct: 12.0, purchases: '362', roas: 2.09, leads: '58', cpl: '₹795', ql: '14', cplQ: '₹3,293' },
        { label: 'Legal & Compliance', spend: '₹115.7K', spendPct: 8.0, purchases: '178', roas: 1.54, leads: '26', cpl: '₹1,183', ql: '4', cplQ: '₹7,694' },
      ],
    },
    google: {
      platform: [
        { label: 'Search', isTop: true, spend: '₹472.5K', spendPct: 45.0, purchases: '1,892', roas: 3.12, leads: '243', cpl: '₹651' },
        { label: 'Shopping', spend: '₹346.5K', spendPct: 33.0, purchases: '1,468', roas: 2.84, leads: '188', cpl: '₹776' },
        { label: 'Performance Max', spend: '₹157.5K', spendPct: 15.0, purchases: '524', roas: 2.32, leads: '67', cpl: '₹990' },
        { label: 'Display', spend: '₹73.5K', spendPct: 7.0, purchases: '226', roas: 1.94, leads: '29', cpl: '₹1,069' },
      ],
      placement: [
        { label: 'Search Results', isTop: true, spend: '₹472.5K', spendPct: 45.0, purchases: '1,892', roas: 3.12, leads: '243', cpl: '₹651' },
        { label: 'Shopping Tab', spend: '₹252.0K', spendPct: 24.0, purchases: '1,086', roas: 2.92, leads: '139', cpl: '₹764' },
        { label: 'YouTube', spend: '₹157.5K', spendPct: 15.0, purchases: '412', roas: 2.18, leads: '53', cpl: '₹994' },
        { label: 'Display Network', spend: '₹105.0K', spendPct: 10.0, purchases: '286', roas: 1.86, leads: '37', cpl: '₹1,196' },
        { label: 'Discover', spend: '₹63.0K', spendPct: 6.0, purchases: '134', roas: 1.68, leads: '17', cpl: '₹1,562' },
      ],
      age: [
        { label: '25-34', isTop: true, spend: '₹378.0K', spendPct: 36.0, purchases: '1,424', roas: 3.04, leads: '183', cpl: '₹691' },
        { label: '35-44', spend: '₹283.5K', spendPct: 27.0, purchases: '1,086', roas: 2.92, leads: '139', cpl: '₹682' },
        { label: '18-24', spend: '₹189.0K', spendPct: 18.0, purchases: '628', roas: 2.48, leads: '81', cpl: '₹781' },
        { label: '45-54', spend: '₹136.5K', spendPct: 13.0, purchases: '426', roas: 2.14, leads: '55', cpl: '₹831' },
        { label: '55+', spend: '₹63.0K', spendPct: 6.0, purchases: '146', roas: 1.52, leads: '19', cpl: '₹1,110' },
      ],
      gender: [
        { label: 'Male', isTop: true, spend: '₹567.0K', spendPct: 54.0, purchases: '2,148', roas: 2.86, leads: '276', cpl: '₹687' },
        { label: 'Female', spend: '₹399.0K', spendPct: 38.0, purchases: '1,412', roas: 2.68, leads: '181', cpl: '₹738' },
        { label: 'Unknown', spend: '₹84.0K', spendPct: 8.0, purchases: '150', roas: 1.42, leads: '19', cpl: '₹1,479' },
      ],
      device: [
        { label: 'Mobile', isTop: true, spend: '₹577.5K', spendPct: 55.0, purchases: '2,086', roas: 2.78, leads: '268', cpl: '₹721' },
        { label: 'Desktop', spend: '₹378.0K', spendPct: 36.0, purchases: '1,486', roas: 2.92, leads: '191', cpl: '₹662' },
        { label: 'Tablet', spend: '₹94.5K', spendPct: 9.0, purchases: '238', roas: 1.86, leads: '31', cpl: '₹1,021' },
      ],
      category: [
        { label: "Women's Fashion", isTop: true, spend: '₹367.5K', spendPct: 35.0, purchases: '1,524', roas: 3.14, leads: '0', cpl: '—' },
        { label: "Men's Fashion", spend: '₹252.0K', spendPct: 24.0, purchases: '924', roas: 2.76, leads: '0', cpl: '—' },
        { label: 'Accessories', spend: '₹199.5K', spendPct: 19.0, purchases: '698', roas: 2.94, leads: '0', cpl: '—' },
        { label: 'Footwear', spend: '₹136.5K', spendPct: 13.0, purchases: '386', roas: 2.12, leads: '0', cpl: '—' },
        { label: 'Beauty & Skincare', spend: '₹94.5K', spendPct: 9.0, purchases: '278', roas: 2.48, leads: '0', cpl: '—' },
      ],
      service: [
        { label: 'Performance Marketing', isTop: true, spend: '₹378.0K', spendPct: 36.0, purchases: '1,486', roas: 3.18, leads: '198', cpl: '₹639', ql: '83', cplQ: '₹1,523' },
        { label: 'Finance & Accounting', spend: '₹283.5K', spendPct: 27.0, purchases: '1,024', roas: 2.88, leads: '142', cpl: '₹668', ql: '51', cplQ: '₹1,860' },
        { label: 'Tech Solutions', spend: '₹189.0K', spendPct: 18.0, purchases: '642', roas: 2.62, leads: '78', cpl: '₹811', ql: '22', cplQ: '₹2,875' },
        { label: 'HR & Recruitment', spend: '₹126.0K', spendPct: 12.0, purchases: '348', roas: 2.14, leads: '52', cpl: '₹812', ql: '13', cplQ: '₹3,243' },
        { label: 'Legal & Compliance', spend: '₹73.5K', spendPct: 7.0, purchases: '210', roas: 1.72, leads: '17', cpl: '₹1,150', ql: '3', cplQ: '₹8,167' },
      ],
    },
  };

  const rows = audienceData[platform][segment];
  const totalSpend = rows.reduce((s, r) => s + parseFloat(r.spend.replace(/[₹,K]/g, '')) * (r.spend.includes('K') ? 1 : 1), 0);
  const totalPurchases = rows.reduce((s, r) => s + parseInt(r.purchases.replace(/,/g, '')), 0);
  const totalLeads = rows.reduce((s, r) => s + parseInt((r.leads || '0').replace(/,/g, '')), 0);

  // Compute totals display
  const totalSpendDisplay = rows.reduce((s, r) => {
    const val = parseFloat(r.spend.replace(/[₹,K]/g, ''));
    return s + (r.spend.includes('K') ? val * 1000 : val);
  }, 0);
  const formatTotal = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(1)}K`;

  // Weighted average ROAS
  const avgRoas = rows.reduce((s, r) => {
    const spend = parseFloat(r.spend.replace(/[₹,K]/g, '')) * (r.spend.includes('K') ? 1000 : 1);
    return s + r.roas * spend;
  }, 0) / totalSpendDisplay;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 className="text-base text-gray-900" style={{ fontWeight: 600 }}>{segmentLabels[segment]}-wise Breakdown</h3>
          <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>Analyse spend distribution and performance across {segmentLabels[segment].toLowerCase()} segments</p>
        </div>
        {/* Segment Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSegmentOpen(!segmentOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-soft"
          >
            {segmentLabels[segment]}
            <ChevronDown className={`w-4 h-4 transition-transform ${segmentOpen ? 'rotate-180' : ''}`} />
          </button>
          {segmentOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200/60 rounded-xl shadow-dropdown py-1 z-10">
              {(Object.keys(segmentLabels) as AudienceSegment[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setSegment(key); setSegmentOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    segment === key ? 'text-brand bg-brand-light font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {segmentLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {segmentLabels[segment]}
              </th>
              <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Spend</th>
              <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Spend %</th>
              <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {businessModel === 'ecommerce' ? 'Purchases' : 'Leads'}
              </th>
              <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {businessModel === 'ecommerce' ? 'ROAS' : 'CPL'}
              </th>
              {businessModel === 'leadgen' && segment === 'service' && (
                <>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>QL</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>CPL-Q</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{row.label}</span>
                  {row.isTop && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] rounded-md uppercase" style={{ fontWeight: 700 }}>Top</span>
                  )}
                </td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">{row.spend}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand/60 rounded-full" style={{ width: `${row.spendPct}%` }} />
                    </div>
                    <span className="text-sm text-gray-700 w-12 text-right">{row.spendPct.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {businessModel === 'ecommerce' ? row.purchases : row.leads}
                </td>
                <td className={`text-right px-4 py-4 whitespace-nowrap text-sm ${businessModel === 'ecommerce' ? getRoasColor(row.roas) : 'text-gray-700'}`} style={{ fontWeight: 600 }}>
                  {businessModel === 'ecommerce' ? `${row.roas.toFixed(2)}x` : row.cpl}
                </td>
                {businessModel === 'leadgen' && segment === 'service' && (
                  <>
                    <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{ fontWeight: 500 }}>{row.ql || '—'}</td>
                    <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{ fontWeight: 600 }}>{row.cplQ || '—'}</td>
                  </>
                )}
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-gray-50/80 border-t border-gray-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Total</span>
              </td>
              <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{formatTotal(totalSpendDisplay)}</td>
              <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>100.0%</td>
              <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>
                {businessModel === 'ecommerce' ? totalPurchases.toLocaleString() : totalLeads.toLocaleString()}
              </td>
              <td className={`text-right px-4 py-4 whitespace-nowrap text-sm ${businessModel === 'ecommerce' ? getRoasColor(avgRoas) : 'text-gray-900'}`} style={{ fontWeight: 700 }}>
                {businessModel === 'ecommerce' ? `${avgRoas.toFixed(2)}x` : '-'}
              </td>
              {businessModel === 'leadgen' && segment === 'service' && (() => {
                const totalQL = rows.reduce((s, r) => s + parseInt((r.ql || '0').replace(/,/g, '')), 0);
                const avgCplQ = totalQL > 0 ? Math.round(totalSpendDisplay / totalQL) : 0;
                return (
                  <>
                    <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>{totalQL.toLocaleString()}</td>
                    <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>₹{avgCplQ.toLocaleString('en-IN')}</td>
                  </>
                );
              })()}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Key Takeaways */}
      {(() => {
        const metaTakeaways = businessModel === 'ecommerce'
          ? {
              platform: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Instagram drives highest ROAS at 2.79x with 44% of spend', description: 'Instagram outperforms Facebook by +9.4% in ROAS while commanding a similar budget share. Consider shifting 5–8% of Facebook spend to Instagram Reels and Stories to maximize returns.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Audience Network underperforming — 9% spend yielding only 2.06x ROAS', description: 'Audience Network consumes ₹1.3L but delivers the weakest ROAS. Reallocating this budget to Instagram could generate ~130 additional purchases at current conversion rates.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Threads showing early promise — monitor for scale opportunity', description: 'At 5% of spend, Threads is delivering 2.16x ROAS — above Audience Network. As the platform matures, early investment could unlock a lower-CPM channel before competition heats up.' },
              ],
              placement: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Feed and Reels are your highest-efficiency placements', description: 'Feed leads with 2.91x ROAS (40% of spend), and Reels closely follows at 2.85x with only 20% — Reels is underinvested relative to its efficiency. Scaling Reels spend by 30% could significantly boost overall returns.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Right Column placement dragging down overall performance', description: 'Right Column delivers only 1.82x ROAS with 6% spend share. This is the only placement below the 2.0x break-even threshold — consider pausing or restricting to retargeting-only campaigns.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Stories capturing 26% spend with solid 2.68x ROAS', description: 'Stories maintain strong performance as the second-highest placement. Experimenting with interactive Story formats (polls, quizzes) could push CTR higher and improve cost-per-purchase.' },
              ],
              age: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: '25-34 age group is your power segment — 2.96x ROAS at 36% spend', description: 'This cohort delivers the best return and highest purchase volume (1,542). Doubling down on this demographic with lookalike audiences could scale revenue without diluting efficiency.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: '45+ audiences costing more with diminishing returns', description: '45-54 delivers 1.87x and 55+ only 1.22x ROAS. Combined they consume 19% of budget but contribute just 12% of purchases. Tightening age caps on broad campaigns could reclaim ₹2.7L in budget.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: '35-44 is an underutilized high-performer at 2.85x ROAS', description: 'This cohort matches 25-34 in efficiency but gets 15% less spend. Allocating more budget here — especially for high-AOV products — could unlock incremental revenue.' },
              ],
              gender: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Female audiences outperform by 16.5% in ROAS', description: 'Female segment delivers 2.90x ROAS vs. Male at 2.49x, with 30% more purchases despite similar spend. Creative messaging tailored to female preferences is clearly resonating.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Unknown gender segment bleeding budget — 1.28x ROAS', description: '8% of spend goes to "Unknown" gender with the lowest ROAS. Excluding this segment or restricting it to awareness-only campaigns could save ₹1.15L monthly without impacting conversions.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Male segment has room for creative optimization', description: 'Male audiences convert at 2.49x — solid but 14% below female. Testing different creative angles, product bundles, or offers targeted at male interests could close this performance gap.' },
              ],
              device: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Mobile dominates with 69% spend and highest ROAS at 2.82x', description: 'Mobile is your best-performing device by volume and efficiency. Ensure landing pages are mobile-first optimized — even a 0.5s load time reduction could lift conversions by 8-12%.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Tablet spend is underperforming — 1.24x ROAS on 7% of budget', description: 'Tablet delivers the lowest ROAS and smallest purchase volume. Unless targeting a specific tablet-heavy demographic, reallocating this ₹1L to mobile would generate ~35 more purchases.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Desktop converts at 2.34x — potential for B2B and high-AOV optimization', description: 'Desktop users typically have higher purchase intent for premium products. Running separate high-AOV campaigns targeting desktop could improve overall revenue without competing with mobile traffic.' },
              ],
              category: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: "Women's Fashion leads with 3.22x ROAS at 35% of spend — your hero category", description: "Women's Fashion delivers the strongest return and highest purchase volume (1,628). Carousel ads with seasonal collections and UGC-style creatives are driving conversions. Scale lookalike audiences from top purchasers and test dynamic product ads for cross-selling within the category." },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Footwear at 2.20x ROAS on 13% spend — needs creative refresh', description: 'Footwear consumes ₹1.87L but delivers the weakest ROAS among major categories. Shoe purchases often require stronger size-confidence signals — adding size guides, fit videos, and customer review highlights to ad creatives could lift conversion rates and push ROAS above 2.5x.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Accessories at 2.88x ROAS is underinvested — scale for high-margin impulse buys', description: 'Accessories delivers near-top ROAS at only 18% of spend. These are high-margin, low-AOV impulse products perfect for Stories and Reels placements. Increasing budget by 25% with add-to-cart retargeting could generate ~185 additional purchases without diluting efficiency.' },
              ],
              service: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Performance Marketing drives 3.04x ROAS at 36% of spend — flagship service', description: 'Your highest-margin service delivers the strongest return on Meta. This service likely attracts digitally-savvy buyers who convert faster. Scale branded content campaigns showcasing case studies and client results to push ROAS past 3.2x.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Legal & Compliance at 1.54x ROAS on 8% spend — below break-even', description: 'Legal services generate only 178 purchases at the weakest ROAS. High-ticket legal products need longer consideration cycles — retargeting website visitors with authority-building content (expert videos, whitepapers) could improve conversion rates and lift ROAS above 2.0x.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Finance & Accounting at 2.72x ROAS — cross-sell opportunity with Performance Marketing buyers', description: 'Finance services perform solidly at 26% of spend. Customers who purchase Performance Marketing services often need Finance support too — running cross-sell campaigns to existing marketing buyers could reduce CAC by 40% and lift Finance ROAS past 3.0x.' },
              ],
            }
          : {
              platform: [
                { title: 'Instagram lead-to-QL conversion likely highest at ₹742 CPL', description: 'With 228 leads at the lowest CPL, Instagram\'s native lead forms pre-fill user data — reducing friction and improving lead quality. At a 32% QL rate, that\'s ~73 qualified leads at an estimated CPL-Q of ₹2,178, well below the ₹2,440 blended average. Scale Instagram Instant Forms with conditional logic to pre-qualify before submission.' },
                { title: 'Audience Network generating ₹1,017 CPL leads with suspected low QL rates', description: '34 leads at 37% above benchmark CPL — and Audience Network traffic typically has the lowest lead-to-qualified conversion (estimated 18-22% QL rate vs. 32% average). That projects CPL-Q at ₹4,600+, more than 2x your target. Pause this placement entirely and redirect ₹1.3L toward Instagram lead forms for ~175 additional higher-quality leads.' },
                { title: 'Facebook 198 leads need form optimization to improve qualification funnel', description: 'Facebook generates 41% of total leads but at ₹814 CPL — ₹72 above Instagram. The gap likely stems from longer form completion times on Facebook. Switching to Instant Forms with 3-field max, adding a qualifying question ("What\'s your budget range?"), and enabling WhatsApp follow-up could cut CPL to ₹740 and lift QL rate from ~30% to 35%.' },
              ],
              placement: [
                { title: 'Feed drives 216 leads at ₹712 CPL — best placement for qualified pipeline', description: 'Feed\'s native format allows users to submit lead forms without leaving the app, reducing drop-off. At an estimated 34% QL rate (highest among placements), Feed generates ~73 QLs at ₹2,094 CPL-Q. Test multi-step lead forms in Feed that ask budget and timeline questions to pre-qualify — this can lift QL rate to 40%+ while keeping CPL flat.' },
                { title: 'Right Column ₹1,153 CPL is destroying blended lead quality metrics', description: 'Right Column + Explore together burn ₹2.02L for just 54 leads. At their placement quality, QL rate is estimated at 15-20%, projecting CPL-Q above ₹5,700. These leads dilute your pipeline with unqualified contacts that waste sales team bandwidth. Excluding Right Column immediately frees ₹86K — enough for ~120 Feed leads at 3x better qualification.' },
                { title: 'Reels at ₹725 CPL is your highest-leverage scaling opportunity for lead gen', description: 'Reels generates 106 leads with only 20% of spend — meaning it\'s underinvested relative to efficiency. Video-based lead magnets (webinar signups, free audit offers, demo requests) on Reels capture intent-rich leads. Increasing Reels budget by 30% (~₹87K) could generate ~120 additional leads, and video-engaged leads typically qualify at 36-40% vs. 32% average.' },
              ],
              age: [
                { title: '25-34 is your ICP — 198 leads at ₹699 CPL with highest pipeline velocity', description: 'This segment delivers the most leads at the lowest cost and likely has the fastest lead-to-QL cycle. At 36% of spend generating 41% of leads, the efficiency is clear. Build 1% lookalike audiences from 25-34 QL converters, and create dedicated nurture sequences with case studies targeting early-career decision-makers to accelerate MQL→SQL conversion.' },
                { title: '45+ cohorts burning ₹2.75L for ~58 leads with estimated 15% QL rate', description: '45-54 (₹1,097 CPL) and 55+ (₹1,688 CPL) generate just 58 leads combined. Worse, older demographics in lead gen typically have 15-18% QL rates due to lower digital engagement, projecting CPL-Q above ₹6,000. That\'s 2.5x your target. Cap age targeting at 44 on all lead gen campaigns — the ₹2.75L saved can generate ~394 leads in the 25-34 segment.' },
                { title: '35-44 decision-makers show ₹727 CPL with likely highest QL-to-SQL conversion', description: '111 leads at near-benchmark CPL, but this age group\'s real value is downstream — 35-44 professionals are typically budget holders and final decision-makers. Their QL-to-SQL rate is estimated 25-30% higher than 25-34. Create a separate nurture track with ROI calculators, executive briefs, and direct demo CTAs to exploit their higher conversion intent.' },
              ],
              gender: [
                { title: 'Female leads at ₹714 CPL outperform on volume AND estimated qualification', description: '258 leads at 14.4% lower CPL than male — and female audiences on Meta tend to complete more form fields, improving lead data quality. With better data completeness, estimated QL rate is 35% vs. 28% for male, projecting CPL-Q at ₹2,040 (female) vs. ₹2,979 (male). Increase female audience budget share from 48% to 55% and tailor landing pages with testimonials from female decision-makers.' },
                { title: 'Unknown gender: 19 leads at ₹1,619 CPL with near-zero pipeline value', description: 'These 19 leads cost ₹1.15L and are almost certainly bot traffic or incomplete form fills — QL rate for "Unknown" segments typically drops to 5-10%. That\'s 1-2 qualified leads at ₹57K-₹115K CPL-Q. Exclude this segment from every lead gen campaign immediately. The budget recovered funds ~161 female leads or ~138 male leads with real pipeline potential.' },
                { title: 'Male CPL gap of ₹120 vs. female signals a lead form experience problem', description: '203 leads at ₹834 CPL means male audiences are engaging but dropping off during form submission. Test shorter forms (name + phone only), add male-oriented social proof, and implement a callback CTA instead of a detailed form. Closing even half the CPL gap would save ₹12K+ monthly and generate ~15 additional qualified leads from the same spend.' },
              ],
              device: [
                { title: 'Mobile: 360 leads at ₹736 CPL — optimize for thumb-zone form completion', description: '75% of all leads come from mobile at the best CPL. But mobile form abandonment rates are typically 40-60% — meaning you\'re losing potentially 240-540 additional leads. Implement single-screen Instant Forms, enable autofill for name/email/phone, keep qualifying questions to 1 dropdown, and add a progress indicator. Even a 10% form completion lift generates ~36 additional leads at zero extra spend.' },
                { title: 'Tablet: 16 leads at ₹1,688 CPL — a pipeline dead zone', description: 'Tablet generates just 3.3% of leads at 2.3x the mobile CPL. At an estimated 12% QL rate on tablet, that\'s ~2 qualified leads at ₹50K+ CPL-Q — effectively non-existent pipeline value. Exclude tablet from all lead gen campaigns. The ₹1.01L saved redirected to mobile generates ~137 leads, of which ~44 would qualify — a 22x improvement in qualified output.' },
                { title: 'Desktop 104 leads at ₹886 CPL — higher CPL but likely best lead-to-SQL ratio', description: 'Desktop users research more thoroughly before submitting forms, meaning higher intent. Desktop QL rates typically run 38-42% vs. 30% on mobile, projecting CPL-Q at ₹2,110-₹2,332 — competitive with mobile\'s ₹2,453. Don\'t cut desktop budget based on CPL alone. Instead, add multi-field progressive forms on desktop (company size, budget, timeline) to capture richer lead data that accelerates the SQL pipeline.' },
              ],
              service: [
                { title: 'Performance Marketing leads at ₹761 CPL with highest estimated QL rate of 38%', description: '182 leads at 36% of spend — and these leads are searching for marketing services, meaning they understand the buying process and qualify faster. At 38% QL rate, that\'s ~69 qualified leads at ₹2,003 CPL-Q, well below target. These leads also have the shortest MQL→SQL cycle (~21 days) because they already know what they need. Scale lookalike audiences from PM converters and test "free audit" lead magnets to push volume past 220.' },
                { title: 'Legal & Compliance: 26 leads at ₹1,183 CPL with projected 18% QL rate = ₹6,572 CPL-Q', description: 'Legal services consume 8% of budget but generate just 5.4% of leads at the highest CPL. Worse, legal leads have the longest qualification cycle (~65 days) and lowest QL rate because prospects are often just researching, not ready to buy. Estimated 4-5 qualified leads per month at catastrophic CPL-Q. Reduce Meta spend on Legal by 50%, redirect to Search where legal intent is explicit, and use retargeting-only on Meta for Legal service visitors.' },
                { title: 'Finance & Accounting at ₹783 CPL — cross-funnel with PM leads could cut CPL-Q by 30%', description: '128 leads at ₹783 CPL with estimated 32% QL rate (~41 QLs at ₹2,447 CPL-Q). But here\'s the opportunity: 40% of Performance Marketing clients eventually need Finance services too. Instead of acquiring Finance leads from cold, build a cross-sell nurture sequence targeting existing PM qualified leads. This second-service conversion typically costs 60-70% less than cold acquisition, projecting Finance CPL-Q below ₹1,000 for cross-sold leads.' },
              ],
            };

        const googleTakeaways = businessModel === 'ecommerce'
          ? {
              platform: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Search delivers 3.12x ROAS — your highest-performing channel type', description: 'Search captures 45% of spend and produces the best ROAS across all Google campaign types. High purchase intent on Search makes it ideal for scaling — increasing branded keyword bids could amplify returns.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Display at 1.94x ROAS — repositioning to retargeting could double efficiency', description: 'Display consumes 7% of budget but lags behind in performance. Restricting Display to retargeting audiences only and pausing prospecting Display could lift ROAS above 2.5x.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Performance Max capturing 15% spend at 2.32x — monitor asset group performance', description: 'PMax is Google\'s automation-heavy format. Breaking down performance by asset group and excluding underperforming placements could push ROAS toward 2.6x while maintaining scale.' },
              ],
              placement: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Search Results + Shopping Tab deliver 69% of spend at 3.0x+ ROAS', description: 'These two high-intent placements are your efficiency core. Prioritizing feed quality for Shopping and bid optimization for Search could push combined ROAS past 3.1x.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Display Network and Discover underperforming below 2.0x threshold', description: 'These placements consume 16% of budget at 1.86x and 1.68x ROAS respectively. Pausing Discover and limiting Display to remarketing could free ₹1.68L for Search expansion.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'YouTube at 2.18x ROAS — strong for upper-funnel with conversion potential', description: 'YouTube captures 15% of spend with decent returns. Testing shoppable YouTube ads and Video Action Campaigns could improve direct conversions while maintaining brand awareness.' },
              ],
              age: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: '25-44 age range delivers 3.0x ROAS — your core conversion demographic', description: '25-34 (3.04x) and 35-44 (2.92x) together represent 63% of budget with the strongest returns. Allocating incremental budget exclusively to this range maximizes profitability.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: '55+ segment delivers only 1.52x ROAS — below break-even for most margins', description: 'At 6% of spend, the 55+ cohort generates the weakest returns. Unless your product specifically targets seniors, excluding this age group from performance campaigns is recommended.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: '18-24 cohort at 2.48x ROAS — potential for LTV-focused growth', description: 'Younger audiences convert slightly below average but may have higher lifetime value as repeat buyers. Running separate campaigns with student/first-purchase offers could build a long-term customer base.' },
              ],
              gender: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Male audiences lead on Google with 2.86x ROAS — inverse of Meta pattern', description: 'Unlike Meta where female outperforms, Google\'s male segment delivers the highest ROAS at 54% of spend. This platform-gender insight suggests different creative strategies per channel.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Unknown gender costing ₹84K at 1.42x ROAS — exclude from performance campaigns', description: '8% of budget goes to unidentified gender segments with severely below-average returns. Excluding this segment from conversion-focused campaigns could improve blended ROAS by 0.08x.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Cross-platform gender strategy: target females on Meta, males on Google', description: 'Female on Meta (2.90x) and Male on Google (2.86x) are each platform\'s top segment. Aligning creative and budget allocation by platform-gender could lift overall portfolio ROAS by 5-8%.' },
              ],
              device: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Desktop delivers best Google ROAS at 2.92x — a key differentiator from Meta', description: 'Unlike Meta where mobile leads, Google Desktop outperforms at 2.92x ROAS with 36% of spend. Users researching on desktop have higher purchase intent — optimizing landing pages for desktop is critical.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Tablet at 1.86x ROAS on 9% of budget — underperforming across both platforms', description: 'Tablet is the weakest device on both Meta and Google. Reducing tablet bid adjustments by 30-40% or excluding tablets from high-spend campaigns could recover ₹94K in monthly budget.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Mobile captures 55% of Google spend at 2.78x — strong but below desktop', description: 'Mobile is efficient but trails desktop by 5%. Implementing AMP landing pages and streamlined mobile checkout could close this gap and boost mobile ROAS past 2.85x.' },
              ],
              category: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Women\'s Fashion at 3.08x ROAS on Google Search — cross-platform category leader', description: 'Women\'s Fashion leads Google spend at 34% share with the strongest ROAS, consistent with Meta\'s 3.22x performance. Google Shopping ads for women\'s fashion have the highest CTR. Optimize Shopping feed titles with trending style keywords ("summer maxi dress 2026") and implement dynamic remarketing for cart abandoners to push ROAS past 3.2x.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Footwear at 2.08x ROAS on 14% budget — Google Shopping feed quality is the bottleneck', description: 'Footwear underperforms on Google even more than Meta (2.20x). Size-related returns and low Shopping ad CTR drag efficiency down. Implement size guide overlays on landing pages, add "true to size" badges in Shopping ads, and segment campaigns by shoe type (sneakers vs. formal) — brands doing this see 18-22% ROAS improvement.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'Beauty & Skincare at 2.52x ROAS — Search intent signals high purchase readiness', description: 'Beauty captures 11% of Google spend with solid returns driven by ingredient-specific searches ("niacinamide serum", "vitamin C moisturizer"). These high-intent queries convert at 2x the rate of generic beauty terms. Build SKU-level Shopping campaigns for top 20 products and bid aggressively on ingredient keywords to capture purchase-ready traffic — projected ROAS lift to 2.75x.' },
              ],
              service: [
                { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', title: 'Performance Marketing at 3.18x ROAS on Google — strongest cross-platform service', description: 'PM leads on Google Search deliver the highest ROAS at 36% of spend, beating even Meta\'s 3.04x. Branded keyword searches for marketing services have the highest conversion intent. Increase branded keyword bids by 15% and expand exact match coverage to capture competitor comparison searches.' },
                { icon: Target, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', title: 'Legal & Compliance at 1.72x ROAS on 7% of budget — needs a content-first approach', description: 'Legal services underperform on Google too, but at 1.72x ROAS it\'s better than Meta\'s 1.54x — suggesting Search intent helps. Focus Legal budget exclusively on high-intent Search keywords ("compliance audit services", "legal advisory for startups") and pause Display/PMax for Legal entirely.' },
                { icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', title: 'HR & Recruitment at 2.14x ROAS — seasonal opportunity window', description: 'HR services at 12% of spend deliver moderate returns. HR buying cycles are seasonal (Q1 and Q3 hiring pushes). Increasing Google Ads budget by 25% during Jan-Mar and Jul-Sep hiring peaks while reducing off-season spend could lift annual HR ROAS past 2.5x.' },
              ],
            }
          : {
              platform: [
                { title: 'Search captures 243 high-intent leads at ₹651 CPL — best qualified pipeline source', description: 'Search leads are actively looking for solutions, meaning they enter the funnel pre-educated. Estimated QL rate on Search is 38-42% (~97-102 QLs), projecting CPL-Q at ₹1,550-₹1,632 — nearly 37% below your blended ₹2,440 target. Add lead form extensions with qualifying dropdowns (budget range, company size) to pre-filter and push QL rate past 45%.' },
                { title: 'Display generating 29 leads at ₹1,069 CPL — likely <15% QL rate is bleeding pipeline quality', description: 'Display leads come from passive browsing, not active search intent. At an estimated 12-15% QL rate, that\'s only 3-4 qualified leads at ₹18K-₹24K CPL-Q — a pipeline black hole. Restrict Display exclusively to remarketing audiences who visited your pricing/demo pages, and add lead form extensions instead of landing pages to reduce 60%+ drop-off.' },
                { title: 'PMax at ₹990 CPL needs audience signal pruning — QL quality is unpredictable', description: '67 leads from PMax at 52% above Search CPL. PMax mixes Search, Display, YouTube, and Discovery traffic without transparency, making QL rates wildly inconsistent (estimated 20-35% range). Review asset group reports, exclude URL-based audience signals that don\'t match your ICP, and add negative keywords. Target: bring CPL to ₹800 and stabilize QL rate above 30%.' },
              ],
              placement: [
                { title: 'Search Results drive 243 leads with estimated 40% QL rate — your pipeline engine', description: 'At ₹651 CPL and ~40% qualification, Search Results deliver ~97 QLs at ₹1,630 CPL-Q — the most efficient qualified pipeline source across both platforms. Expand exact-match coverage for high-intent keywords ("get quote", "pricing", "demo request") and implement RLSA bid adjustments for returning visitors to push QL rate toward 45%.' },
                { title: 'Discover at ₹1,562 CPL with estimated 8-12% QL rate is a pipeline vanity metric', description: '17 leads sounds harmless but at ₹63K spend, the projected 1-2 qualified leads cost ₹31K-₹63K each in CPL-Q. Discover leads are passive browsers with no search intent — they fill forms out of curiosity, not buying interest. Pause Discover for lead gen entirely. The saved ₹63K funds ~97 Search leads, yielding ~39 qualified leads.' },
                { title: 'YouTube ₹994 CPL can become ₹750 with in-stream lead form extensions', description: '53 leads from YouTube at high CPL, but video-engaged leads show 25-30% QL rates due to deeper content consumption. The CPL problem isn\'t quality — it\'s the landing page redirect killing conversions. Enable YouTube lead form extensions (form submits without leaving video), add a qualifying question ("When are you looking to buy?"), and test 15-second hook videos with direct CTA overlays.' },
              ],
              age: [
                { title: '35-44 delivers ₹682 CPL on Google — highest estimated QL-to-SQL conversion of any segment', description: '139 leads at the lowest Google CPL, but the real insight is downstream: 35-44 professionals on Google Search are actively evaluating solutions with budget authority. Estimated QL rate of 40% yields ~56 QLs at ₹1,705 CPL-Q, and their SQL conversion is projected 25-30% higher than younger cohorts. Build a dedicated nurture track with ROI calculators, competitor comparisons, and direct "talk to sales" CTAs.' },
                { title: '55+ cohort: 19 leads at ₹1,110 CPL with projected 12% QL rate = ₹9,250 CPL-Q', description: 'At 6% of budget, this segment produces an estimated 2 qualified leads per month at catastrophic unit economics. The ₹63K monthly spend on 55+ generates less pipeline value than a single qualified lead from the 35-44 segment. Exclude 55+ from all Search and PMax campaigns. Use saved budget to fund 25-34 and 35-44 keyword expansion for ~92 additional leads with 35%+ QL rates.' },
                { title: '25-34 and 35-44 at ₹691 and ₹682 CPL — unified 25-44 targeting maximizes pipeline', description: 'The ₹9 CPL gap between these segments is statistically insignificant, but their qualification patterns differ: 25-34 leads need more nurturing (longer MQL→SQL cycle, ~45 days) while 35-44 converts faster (~28 days). Run unified 25-44 campaigns for acquisition efficiency, then split nurture sequences — educational drip for 25-34, bottom-funnel urgency for 35-44 — to optimize the full funnel.' },
              ],
              gender: [
                { title: 'Male 276 leads at ₹687 CPL — Google\'s top-performing segment for qualified pipeline', description: 'Male audiences generate the highest lead volume at the lowest Google CPL. On Search, male users tend to use more specific, solution-oriented queries ("pricing", "vs competitor") which signals higher qualification intent. Estimated QL rate of 38% projects ~105 QLs at ₹1,808 CPL-Q. Optimize ad copy with direct ROI language, feature comparisons, and "get a quote" CTAs to push QL rate past 42%.' },
                { title: 'Unknown gender: 19 leads at ₹1,479 CPL are likely bot or accidental form fills', description: '₹84K spent on leads with no identifiable demographic data. These leads typically have 5-8% QL rates (estimated 1 qualified lead at ₹84K CPL-Q) because they\'re often incomplete submissions, bot traffic, or privacy-masked users who never intended to convert. Exclude from all lead gen campaigns. The budget saved generates ~122 male-targeted Search leads with ~46 projected QLs.' },
                { title: 'Female at ₹738 CPL cross-platform consistency enables unified nurture strategy', description: 'Female CPL on Google (₹738) nearly matches Meta (₹714) — rare cross-platform consistency that enables a unified nurture approach. Combine female leads from both channels into a single qualification workflow with shared lead scoring rules. This eliminates duplicate nurture sequences, reduces marketing ops overhead, and ensures consistent MQL criteria. Estimated combined female QL rate of 34% across platforms.' },
              ],
              device: [
                { title: 'Desktop at ₹662 CPL delivers highest-quality leads — your best CPL-Q source', description: 'Desktop Google leads are your most valuable pipeline asset. Users who research on desktop complete longer forms, provide more data points, and show 42-45% QL rates — projecting CPL-Q at ₹1,472-₹1,576, nearly 40% below blended target. These leads also show fastest SQL conversion (median 22 days vs. 35 days on mobile). Add progressive profiling forms on desktop with 5-6 fields to capture company size, budget, and timeline upfront.' },
                { title: 'Tablet: 31 leads at ₹1,021 CPL with sub-15% QL rate across both platforms', description: 'Combined tablet spend across Meta (₹1.01L) and Google (₹94.5K) = ₹1.95L for an estimated 5-7 total qualified leads at ₹27K-₹39K CPL-Q. Tablet users have the highest form abandonment rates (65-70%) due to awkward form UX on mid-sized screens. Blanket-exclude tablets from all lead gen campaigns on both platforms. The ₹1.95L saved redirected to Desktop Search alone generates ~295 leads and ~125 QLs.' },
                { title: 'Mobile 268 leads need form simplification — QL rate estimated 8% below desktop', description: 'Mobile generates 51% of Google lead volume but at ₹721 CPL with estimated 32-35% QL rate vs. desktop\'s 42-45%. The gap is a form UX problem: mobile users abandon multi-field forms at 2x the rate. Implement tap-to-call lead capture, reduce form to name + phone + one qualifier, and add a "We\'ll call you in 2 minutes" CTA. Closing even half the QL gap adds ~13 qualified leads monthly at zero extra spend.' },
              ],
              service: [
                { title: 'Performance Marketing: 198 leads at ₹639 CPL — lowest CPL-Q across all services at ₹1,523', description: 'PM leads on Google Search are actively searching for marketing solutions with budget in hand. At an estimated 42% QL rate, that\'s ~83 qualified leads at ₹1,523 CPL-Q — 38% below your blended target. These leads also convert to SQL fastest (median 18 days) because they understand the buying process. Expand long-tail keyword coverage ("performance marketing agency for D2C", "paid ads management pricing") and bid aggressively on competitor brand terms to capture in-market switchers.' },
                { title: 'Legal & Compliance: 17 leads at ₹1,150 CPL with estimated 15% QL rate = ₹7,667 CPL-Q', description: 'Legal generates the fewest leads at the highest CPL on Google, and the QL rate is abysmal because most legal searchers are researching regulations, not buying advisory services. The 2-3 qualified leads per month cost more than your entire PM qualified pipeline. Slash Legal Google spend by 60%, keep only high-intent exact match keywords ("[compliance advisory firm]", "[startup legal services pricing]"), and redirect ₹44K to PM and Finance Search campaigns for ~69 additional leads with 35%+ QL rates.' },
                { title: 'Finance & Accounting at ₹668 CPL shows strong Google Search intent — scale with landing page personalization', description: '142 leads at ₹668 CPL with estimated 36% QL rate (~51 QLs at ₹1,856 CPL-Q). Finance leads on Google have high purchase intent because they\'re searching for specific solutions ("startup CFO services", "outsourced accounting"). Build service-specific landing pages for each Finance sub-service (bookkeeping, CFO advisory, tax planning) with tailored forms. Personalized landing pages typically lift QL rates by 12-18%, which could push Finance CPL-Q below ₹1,600.' },
              ],
            };

        const takeaways = platform === 'meta' ? metaTakeaways[segment] : googleTakeaways[segment];

        return (
          <div className="mx-6 mb-5 mt-4 px-5 py-4 bg-amber-50/60 border border-amber-200/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-900 font-semibold">Key Takeaways</span>
            </div>
            <div className="space-y-2.5">
              {(takeaways ?? []).map((t: any, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-[7px] flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed font-normal">
                    <span className="font-semibold text-gray-900">{t.title}</span>
                    {' — '}{t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Additional metrics data pool for CampaignsModule
const CAMPAIGNS_ADDITIONAL_METRICS: Record<string, { value: string; trend: string; isUp: boolean; higherIsBetter: boolean; icon: any; bgColor: string; iconColor: string }> = {
  'CPC': { value: '₹18.4', trend: '-₹2.1', isUp: false, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  'CPM': { value: '₹142', trend: '+₹8', isUp: true, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  'CTR': { value: '3.2%', trend: '+0.4%', isUp: true, higherIsBetter: true, icon: MousePointer, bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  'Impressions': { value: '24.8M', trend: '+12%', isUp: true, higherIsBetter: true, icon: Users, bgColor: 'bg-sky-100', iconColor: 'text-sky-600' },
  'Clicks': { value: '792K', trend: '+8.3%', isUp: true, higherIsBetter: true, icon: MousePointer, bgColor: 'bg-teal-100', iconColor: 'text-teal-600' },
  'Conversions': { value: '2,841', trend: '+14%', isUp: true, higherIsBetter: true, icon: Award, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  'Conv. Rate': { value: '3.58%', trend: '+0.22%', isUp: true, higherIsBetter: true, icon: TrendingUp, bgColor: 'bg-lime-100', iconColor: 'text-lime-600' },
  'LTV': { value: '₹8,420', trend: '+₹620', isUp: true, higherIsBetter: true, icon: TrendingUp, bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
  'Frequency': { value: '2.4x', trend: '+0.3', isUp: true, higherIsBetter: false, icon: Users, bgColor: 'bg-rose-100', iconColor: 'text-rose-600' },
  'Reach': { value: '10.3M', trend: '+18%', isUp: true, higherIsBetter: true, icon: Users, bgColor: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600' },
  'Bounce Rate': { value: '42.5%', trend: '-3.1%', isUp: false, higherIsBetter: false, icon: TrendingDown, bgColor: 'bg-red-100', iconColor: 'text-red-600' },
  'Add to Cart': { value: '12,450', trend: '+9%', isUp: true, higherIsBetter: true, icon: ShoppingBag, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  'Cart Abandonment': { value: '68.2%', trend: '-2.4%', isUp: false, higherIsBetter: false, icon: ShoppingBag, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
  'Profit Margin': { value: '24.8%', trend: '+1.6%', isUp: true, higherIsBetter: true, icon: TrendingUp, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  'AOV': { value: '₹1,932', trend: '+₹84', isUp: true, higherIsBetter: true, icon: IndianRupee, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
  // ── Brand Awareness: Meta Ads Manager native fields (map 1:1 to Marketing API) ──
  'Estimated Ad Recall Lift Rate': { value: '8.4%', trend: '+1.2%', isUp: true, higherIsBetter: true, icon: Sparkles, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
  'Estimated Ad Recallers': { value: '142K', trend: '+18K', isUp: true, higherIsBetter: true, icon: Users, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  'Cost per Estimated Ad Recaller': { value: '₹4.80', trend: '-₹0.60', isUp: false, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
  'ThruPlays': { value: '386K', trend: '+22%', isUp: true, higherIsBetter: true, icon: Play, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  'Cost per ThruPlay': { value: '₹2.20', trend: '-₹0.30', isUp: false, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  'Video Plays at 100%': { value: '58.2%', trend: '+3.4%', isUp: true, higherIsBetter: true, icon: CheckCircle, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  '2-Second Continuous Video Plays': { value: '1.8M', trend: '+24%', isUp: true, higherIsBetter: true, icon: Eye, bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  'Video Average Play Time': { value: '12.4s', trend: '+1.8s', isUp: true, higherIsBetter: true, icon: Clock, bgColor: 'bg-pink-100', iconColor: 'text-pink-600' },
  // ── App Installs: Meta Ads Manager native fields for App Promotion campaigns ──
  'App Installs': { value: '48,240', trend: '+28%', isUp: true, higherIsBetter: true, icon: Smartphone, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  'Cost per App Install': { value: '₹82', trend: '-₹12', isUp: false, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  'Install Rate': { value: '14.6%', trend: '+2.4%', isUp: true, higherIsBetter: true, icon: Target, bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  'Mobile App Purchases': { value: '2,840', trend: '+18%', isUp: true, higherIsBetter: true, icon: ShoppingBag, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  'Cost per Mobile App Purchase': { value: '₹1,420', trend: '-₹180', isUp: false, higherIsBetter: false, icon: IndianRupee, bgColor: 'bg-teal-100', iconColor: 'text-teal-600' },
  'Mobile App Purchase ROAS': { value: '3.8x', trend: '+0.4x', isUp: true, higherIsBetter: true, icon: TrendingUp, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  'App Activations': { value: '42,180', trend: '+26%', isUp: true, higherIsBetter: true, icon: Zap, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  'Complete Registrations (App)': { value: '18,640', trend: '+22%', isUp: true, higherIsBetter: true, icon: UserPlus, bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
};

// ── Per-row data generator for additional metric columns ──
// Generates a realistic-looking value for each metric based on row index (deterministic)
function getAdditionalMetricCellValue(metricName: string, rowIndex: number, spend: number): string {
  const seed = rowIndex + 1;
  const spendK = spend / 1000;
  switch (metricName) {
    case 'CPC': return `₹${(12 + (seed * 2.3) % 18).toFixed(1)}`;
    case 'CPM': return `₹${(90 + (seed * 11.7) % 120).toFixed(0)}`;
    case 'CTR': return `${(1.4 + (seed * 0.37) % 3.6).toFixed(1)}%`;
    case 'Impressions': {
      const imp = Math.round(spendK * (4.5 + (seed * 1.2) % 8));
      return imp >= 1000 ? `${(imp / 1000).toFixed(1)}K` : imp.toLocaleString();
    }
    case 'Clicks': {
      const cl = Math.round(spendK * (0.3 + (seed * 0.08) % 0.6));
      return cl >= 1000 ? `${(cl / 1000).toFixed(1)}K` : cl.toLocaleString();
    }
    case 'Conversions': return Math.round(40 + (seed * 47) % 600).toLocaleString();
    case 'Conv. Rate': return `${(1.2 + (seed * 0.53) % 5.8).toFixed(2)}%`;
    case 'LTV': return `₹${(4200 + (seed * 1130) % 8000).toLocaleString('en-IN')}`;
    case 'Frequency': return `${(1.2 + (seed * 0.31) % 2.8).toFixed(1)}x`;
    case 'Reach': {
      const r = Math.round(spendK * (2.8 + (seed * 0.9) % 5));
      return r >= 1000 ? `${(r / 1000).toFixed(1)}K` : r.toLocaleString();
    }
    case 'Bounce Rate': return `${(28 + (seed * 5.3) % 35).toFixed(1)}%`;
    case 'Add to Cart': return Math.round(80 + (seed * 123) % 2400).toLocaleString();
    case 'Cart Abandonment': return `${(52 + (seed * 4.7) % 28).toFixed(1)}%`;
    case 'Profit Margin': return `${(14 + (seed * 3.1) % 22).toFixed(1)}%`;
    case 'AOV': return `₹${Math.round(1200 + (seed * 243) % 2000).toLocaleString('en-IN')}`;
    // Lead Generation specific metrics
    case 'Leads': return Math.round(20 + (seed * 37) % 400).toLocaleString();
    case 'CPL': return `₹${Math.round(150 + (seed * 67) % 500).toLocaleString('en-IN')}`;
    case 'QL': return Math.round(8 + (seed * 11) % 120).toLocaleString();
    case 'CPL-Q': return `₹${Math.round(800 + (seed * 193) % 2200).toLocaleString('en-IN')}`;
    case 'Form Fill Rate': return `${(3.2 + (seed * 0.71) % 8.5).toFixed(1)}%`;
    case 'Cost/MQL': return `₹${Math.round(600 + (seed * 157) % 1800).toLocaleString('en-IN')}`;
    case 'MQL to SQL %': return `${(18 + (seed * 3.7) % 22).toFixed(1)}%`;
    case 'Landing Page CVR': return `${(4.5 + (seed * 0.83) % 9.2).toFixed(1)}%`;
    case 'Lead Velocity': return `${seed % 2 === 0 ? '+' : '-'}${(2 + (seed * 1.9) % 18).toFixed(1)}%`;
    case 'Pipeline Value': return `₹${(Math.round(50 + (seed * 23) % 200) / 10).toFixed(1)}L`;
    // ── Brand Awareness: Meta Ads Manager native fields ──
    case 'Estimated Ad Recall Lift Rate': return `${(5 + (seed * 0.9) % 8).toFixed(1)}%`;
    case 'Estimated Ad Recallers': {
      const n = Math.round(spendK * (1.4 + (seed * 0.32) % 3.2));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}M` : `${n}K`;
    }
    case 'Cost per Estimated Ad Recaller': return `₹${(3 + (seed * 0.5) % 4.5).toFixed(2)}`;
    case 'ThruPlays': {
      const n = Math.round(spendK * (4 + (seed * 1.1) % 9));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}M` : `${n}K`;
    }
    case 'Cost per ThruPlay': return `₹${(1.2 + (seed * 0.22) % 2.8).toFixed(2)}`;
    case 'Video Plays at 100%': return `${(45 + (seed * 2.3) % 28).toFixed(1)}%`;
    case '2-Second Continuous Video Plays': {
      const n = Math.round(spendK * (12 + (seed * 3.4) % 22));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}M` : `${n}K`;
    }
    case 'Video Average Play Time': return `${(6 + (seed * 1.3) % 14).toFixed(1)}s`;
    // ── App Installs: Meta Ads Manager native fields ──
    case 'App Installs': {
      const n = Math.round(spendK * (18 + (seed * 4.2) % 28));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
    }
    case 'Cost per App Install': return `₹${Math.round(55 + (seed * 9.3) % 110).toLocaleString('en-IN')}`;
    case 'Install Rate': return `${(8 + (seed * 1.4) % 14).toFixed(1)}%`;
    case 'Mobile App Purchases': {
      const n = Math.round(spendK * (0.8 + (seed * 0.23) % 2.4));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
    }
    case 'Cost per Mobile App Purchase': return `₹${Math.round(850 + (seed * 167) % 1800).toLocaleString('en-IN')}`;
    case 'Mobile App Purchase ROAS': return `${(1.8 + (seed * 0.47) % 4.2).toFixed(1)}x`;
    case 'App Activations': {
      const n = Math.round(spendK * (15 + (seed * 3.8) % 26));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
    }
    case 'Complete Registrations (App)': {
      const n = Math.round(spendK * (6 + (seed * 1.9) % 14));
      return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
    }
    default: return '—';
  }
}

export function CampaignsModule({ businessModel, selectedPlatform, additionalMetrics = [] }: CampaignsModuleProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<AdSetData | null>(null);
  const [selectedAdGroup, setSelectedAdGroup] = useState<AdGroupData | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [metaViewMode, setMetaViewMode] = useState<MetaViewMode>('campaigns');
  const [googleViewMode, setGoogleViewMode] = useState<GoogleViewMode>('campaigns');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Campaigns tab filter & sort state
  const [campPlatformFilter, setCampPlatformFilter] = useState<string>('all');
  const [campSortField, setCampSortField] = useState<string>('');
  const [campSortDir, setCampSortDir] = useState<'asc' | 'desc'>('desc');

  // Ad Groups / Ad Sets tab filter & sort state
  const [agCampaignFilter, setAgCampaignFilter] = useState<string>('all');
  const [agSortField, setAgSortField] = useState<string>('');
  const [agSortDir, setAgSortDir] = useState<'asc' | 'desc'>('desc');

  // Keywords filter & sort state
  const [kwCampaignFilter, setKwCampaignFilter] = useState<string>('all');
  const [kwAdGroupFilter, setKwAdGroupFilter] = useState<string>('all');
  const [kwMatchTypeFilter, setKwMatchTypeFilter] = useState<string>('all');
  const [kwSortField, setKwSortField] = useState<string>('');
  const [kwSortDir, setKwSortDir] = useState<'asc' | 'desc'>('desc');
  const [kwCurrentPage, setKwCurrentPage] = useState(1);
  const kwItemsPerPage = 8;

  // Ads tab state
  const [adsCampaignFilter, setAdsCampaignFilter] = useState<string>('all');
  const [adsAdGroupFilter, setAdsAdGroupFilter] = useState<string>('all');
  const [adsFormatFilter, setAdsFormatFilter] = useState<string>('all');
  const [adsSortField, setAdsSortField] = useState<string>('');
  const [adsSortDir, setAdsSortDir] = useState<'asc' | 'desc'>('desc');
  const [adsCurrentPage, setAdsCurrentPage] = useState(1);
  const adsItemsPerPage = 5;
  const [creativesDrawerOpen, setCreativesDrawerOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<CreativeData | null>(null);

  // Meta Ads campaign data
  const metaCampaignData: CampaignData[] = businessModel === 'ecommerce' ? [
    { id: '1', name: 'Product Catalog Sales', platform: 'Facebook & Instagram', spend: 240000, revenue: 680000, roas: 2.83, orders: 847, impressions: '2.4M', clicks: '84.2K', ctr: '3.5%', status: 'excellent' },
    { id: '2', name: 'Dynamic Retargeting', platform: 'Facebook & Instagram', spend: 180000, revenue: 410000, roas: 2.28, orders: 584, impressions: '1.8M', clicks: '68.4K', ctr: '3.8%', status: 'good' },
    { id: '3', name: 'Collection Ads - New Arrivals', platform: 'Facebook & Instagram', spend: 220000, revenue: 420000, roas: 1.91, orders: 568, impressions: '2.8M', clicks: '78.4K', ctr: '2.8%', status: 'average' },
    { id: '4', name: 'Advantage+ Shopping', platform: 'Facebook & Instagram', spend: 195000, revenue: 486000, roas: 2.49, orders: 634, impressions: '2.1M', clicks: '73.5K', ctr: '3.5%', status: 'excellent' },
    { id: '5', name: 'Prospecting Lookalike (1-3%)', platform: 'Facebook', spend: 160000, revenue: 220000, roas: 1.38, orders: 286, impressions: '3.2M', clicks: '64.0K', ctr: '2.0%', status: 'poor' },
    { id: '6', name: 'Instagram Stories - Flash Sale', platform: 'Instagram', spend: 145000, revenue: 378000, roas: 2.61, orders: 492, impressions: '1.9M', clicks: '61.2K', ctr: '3.2%', status: 'excellent' },
    { id: '7', name: 'Instagram Reels - UGC Content', platform: 'Instagram', spend: 175000, revenue: 367500, roas: 2.10, orders: 478, impressions: '2.6M', clicks: '70.2K', ctr: '2.7%', status: 'good' },
    { id: '8', name: 'Broad Targeting - Cold Audience', platform: 'Facebook & Instagram', spend: 130000, revenue: 169000, roas: 1.30, orders: 221, impressions: '2.9M', clicks: '52.2K', ctr: '1.8%', status: 'poor' },
  ] : [
    // Lead Gen Campaigns - Meta Ads
    { id: '1', name: 'Lead Gen Forms - Service Discovery', platform: 'Facebook & Instagram', spend: 185000, revenue: 0, roas: 0, orders: 0, leads: 520, cpl: 356, ql: 166, cplQ: 1114, impressions: '1.8M', clicks: '54.0K', ctr: '3.0%', status: 'excellent' },
    { id: '2', name: 'Thought Leadership - Video Series', platform: 'Facebook & Instagram', spend: 165000, revenue: 0, roas: 0, orders: 0, leads: 458, cpl: 360, ql: 147, cplQ: 1122, impressions: '1.5M', clicks: '48.0K', ctr: '3.2%', status: 'excellent' },
    { id: '3', name: 'Case Study Carousel - B2B', platform: 'Facebook & Instagram', spend: 142000, revenue: 0, roas: 0, orders: 0, leads: 352, cpl: 403, ql: 113, cplQ: 1257, impressions: '1.3M', clicks: '42.3K', ctr: '3.3%', status: 'good' },
    { id: '4', name: 'ROI Calculator Lead Magnet', platform: 'Facebook', spend: 128000, revenue: 0, roas: 0, orders: 0, leads: 298, cpl: 429, ql: 95, cplQ: 1347, impressions: '1.4M', clicks: '38.5K', ctr: '2.8%', status: 'good' },
    { id: '5', name: 'Webinar Registration - LinkedIn', platform: 'Facebook', spend: 118000, revenue: 0, roas: 0, orders: 0, leads: 245, cpl: 482, ql: 78, cplQ: 1513, impressions: '1.2M', clicks: '32.4K', ctr: '2.7%', status: 'average' },
    { id: '6', name: 'Free Consultation Offer', platform: 'Instagram', spend: 105000, revenue: 0, roas: 0, orders: 0, leads: 208, cpl: 505, ql: 67, cplQ: 1567, impressions: '980K', clicks: '27.4K', ctr: '2.8%', status: 'average' },
    { id: '7', name: 'Industry Report Download', platform: 'Facebook & Instagram', spend: 98000, revenue: 0, roas: 0, orders: 0, leads: 165, cpl: 594, ql: 53, cplQ: 1849, impressions: '1.1M', clicks: '24.2K', ctr: '2.2%', status: 'poor' },
    { id: '8', name: 'Generic Benefits Campaign', platform: 'Facebook & Instagram', spend: 82000, revenue: 0, roas: 0, orders: 0, leads: 128, cpl: 641, ql: 41, cplQ: 2000, impressions: '950K', clicks: '19.0K', ctr: '2.0%', status: 'poor' },
  ];

  // Meta Ads ad set data
  const metaAdSetData: AdSetData[] = businessModel === 'ecommerce' ? [
    { id: 'as1', campaignName: 'Product Catalog Sales', adSetName: 'Women Apparel 25-34', platform: 'Facebook & Instagram', spend: 95000, revenue: 285000, roas: 3.0, orders: 356, impressions: '980K', clicks: '34.3K', ctr: '3.5%', status: 'excellent' },
    { id: 'as2', campaignName: 'Product Catalog Sales', adSetName: 'Men Accessories 18-45', platform: 'Facebook & Instagram', spend: 78000, revenue: 218000, roas: 2.79, orders: 272, impressions: '760K', clicks: '26.6K', ctr: '3.5%', status: 'excellent' },
    { id: 'as3', campaignName: 'Product Catalog Sales', adSetName: 'Home Decor 35-54', platform: 'Instagram', spend: 67000, revenue: 177000, roas: 2.64, orders: 219, impressions: '660K', clicks: '23.3K', ctr: '3.5%', status: 'excellent' },
    { id: 'as4', campaignName: 'Dynamic Retargeting', adSetName: 'Cart Abandoners - 1 Day', platform: 'Facebook & Instagram', spend: 72000, revenue: 180000, roas: 2.50, orders: 225, impressions: '720K', clicks: '27.4K', ctr: '3.8%', status: 'excellent' },
    { id: 'as5', campaignName: 'Dynamic Retargeting', adSetName: 'Product View - 3 Days', platform: 'Facebook', spend: 65000, revenue: 143000, roas: 2.20, orders: 179, impressions: '650K', clicks: '24.7K', ctr: '3.8%', status: 'good' },
    { id: 'as6', campaignName: 'Dynamic Retargeting', adSetName: 'Website Visitors - 7 Days', platform: 'Instagram', spend: 43000, revenue: 87000, roas: 2.02, orders: 180, impressions: '430K', clicks: '16.3K', ctr: '3.8%', status: 'good' },
    { id: 'as7', campaignName: 'Collection Ads - New Arrivals', adSetName: 'Spring Collection - Women', platform: 'Facebook & Instagram', spend: 88000, revenue: 176000, roas: 2.0, orders: 227, impressions: '1.1M', clicks: '30.8K', ctr: '2.8%', status: 'good' },
    { id: 'as8', campaignName: 'Collection Ads - New Arrivals', adSetName: 'Summer Sale - All', platform: 'Instagram', spend: 76000, revenue: 137000, roas: 1.80, orders: 178, impressions: '950K', clicks: '26.6K', ctr: '2.8%', status: 'average' },
    { id: 'as9', campaignName: 'Collection Ads - New Arrivals', adSetName: 'Kids Collection', platform: 'Facebook', spend: 56000, revenue: 107000, roas: 1.91, orders: 163, impressions: '750K', clicks: '21.0K', ctr: '2.8%', status: 'average' },
    { id: 'as10', campaignName: 'Advantage+ Shopping', adSetName: 'ASC - Automated Audience', platform: 'Facebook & Instagram', spend: 195000, revenue: 486000, roas: 2.49, orders: 634, impressions: '2.1M', clicks: '73.5K', ctr: '3.5%', status: 'excellent' },
  ] : [
    // Lead Gen Ad Sets
    { id: 'as1', campaignName: 'Lead Gen Forms - Service Discovery', adSetName: 'Founders & CEOs 35-50', platform: 'Facebook & Instagram', spend: 48000, revenue: 0, roas: 0, orders: 0, leads: 62, cpl: 774, ql: 20, cplQ: 2400, impressions: '720K', clicks: '21.6K', ctr: '3.0%', cvr: 22.0, status: 'excellent' },
    { id: 'as2', campaignName: 'Lead Gen Forms - Service Discovery', adSetName: 'COOs & Operations 30-45', platform: 'Facebook & Instagram', spend: 38000, revenue: 0, roas: 0, orders: 0, leads: 48, cpl: 792, ql: 15, cplQ: 2533, impressions: '570K', clicks: '17.1K', ctr: '3.0%', cvr: 21.5, status: 'excellent' },
    { id: 'as3', campaignName: 'Lead Gen Forms - Service Discovery', adSetName: 'Finance Heads 35-55', platform: 'Instagram', spend: 34000, revenue: 0, roas: 0, orders: 0, leads: 46, cpl: 739, ql: 15, cplQ: 2267, impressions: '510K', clicks: '15.3K', ctr: '3.0%', cvr: 23.0, status: 'excellent' },
    { id: 'as4', campaignName: 'Video Campaign - Founder Testimonials', adSetName: 'B2B Decision Makers', platform: 'Facebook & Instagram', spend: 72000, revenue: 0, roas: 0, orders: 0, leads: 39, cpl: 1846, ql: 12, cplQ: 6000, impressions: '480K', clicks: '15.4K', ctr: '3.2%', cvr: 19.5, status: 'good' },
    { id: 'as5', campaignName: 'Video Campaign - Founder Testimonials', adSetName: 'Startup Founders Mobile', platform: 'Facebook', spend: 58000, revenue: 0, roas: 0, orders: 0, leads: 32, cpl: 1813, ql: 10, cplQ: 5800, impressions: '390K', clicks: '12.5K', ctr: '3.2%', cvr: 18.0, status: 'good' },
    { id: 'as6', campaignName: 'Video Campaign - Founder Testimonials', adSetName: 'Enterprise Decision Makers', platform: 'Instagram', spend: 50000, revenue: 0, roas: 0, orders: 0, leads: 27, cpl: 1852, ql: 9, cplQ: 5556, impressions: '330K', clicks: '10.5K', ctr: '3.2%', cvr: 17.5, status: 'good' },
    { id: 'as7', campaignName: 'Lead Magnet - Industry Case Studies', adSetName: 'SaaS Founders Desktop', platform: 'Facebook & Instagram', spend: 60000, revenue: 0, roas: 0, orders: 0, leads: 50, cpl: 1200, ql: 16, cplQ: 3750, impressions: '840K', clicks: '25.2K', ctr: '3.0%', cvr: 19.8, status: 'excellent' },
    { id: 'as8', campaignName: 'Lead Magnet - Industry Case Studies', adSetName: 'E-commerce Businesses', platform: 'Instagram', spend: 52000, revenue: 0, roas: 0, orders: 0, leads: 43, cpl: 1209, ql: 14, cplQ: 3714, impressions: '730K', clicks: '21.9K', ctr: '3.0%', cvr: 19.6, status: 'excellent' },
    { id: 'as9', campaignName: 'Lead Magnet - Industry Case Studies', adSetName: 'Growth Stage Startups', platform: 'Facebook', spend: 38000, revenue: 0, roas: 0, orders: 0, leads: 31, cpl: 1226, ql: 10, cplQ: 3800, impressions: '530K', clicks: '15.9K', ctr: '3.0%', cvr: 19.5, status: 'excellent' },
    { id: 'as10', campaignName: 'Retargeting - Website Visitors', adSetName: 'Engaged Website Visitors 7d', platform: 'Facebook & Instagram', spend: 90000, revenue: 0, roas: 0, orders: 0, leads: 82, cpl: 1098, ql: 26, cplQ: 3462, impressions: '950K', clicks: '28.5K', ctr: '3.0%', cvr: 20.5, status: 'average' },
  ];

  // Google Ads campaign data
  const googleCampaignData: CampaignData[] = businessModel === 'ecommerce' ? [
    { id: 'g1', name: 'Brand - Exact Match', platform: 'Google Search', spend: 185000, revenue: 925000, roas: 5.0, orders: 1234, conversions: 1234, impressions: '1.2M', clicks: '42.8K', ctr: '3.6%', cpc: 4.32, status: 'excellent' },
    { id: 'g2', name: 'Shopping - High Priority', platform: 'Google Shopping', spend: 320000, revenue: 1152000, roas: 3.6, orders: 1542, conversions: 1542, impressions: '3.8M', clicks: '95.2K', ctr: '2.5%', cpc: 3.36, status: 'excellent' },
    { id: 'g3', name: 'Performance Max - All Products', platform: 'Performance Max', spend: 275000, revenue: 797500, roas: 2.9, orders: 1065, conversions: 1065, impressions: '5.2M', clicks: '87.5K', ctr: '1.7%', cpc: 3.14, status: 'excellent' },
    { id: 'g4', name: 'Search - Category Terms', platform: 'Google Search', spend: 245000, revenue: 588000, roas: 2.4, orders: 785, conversions: 785, impressions: '2.9M', clicks: '78.4K', ctr: '2.7%', cpc: 3.12, status: 'good' },
    { id: 'g5', name: 'Display - Remarketing', platform: 'Google Display', spend: 165000, revenue: 363000, roas: 2.2, orders: 484, conversions: 484, impressions: '8.4M', clicks: '84.0K', ctr: '1.0%', cpc: 1.96, status: 'good' },
    { id: 'g6', name: 'Discovery - Lookalike Audiences', platform: 'Google Discovery', spend: 195000, revenue: 370500, roas: 1.9, orders: 495, conversions: 495, impressions: '4.7M', clicks: '75.6K', ctr: '1.6%', cpc: 2.58, status: 'average' },
    { id: 'g7', name: 'YouTube - Product Videos', platform: 'YouTube Ads', spend: 215000, revenue: 365500, roas: 1.7, orders: 488, conversions: 488, impressions: '12.5M', clicks: '62.5K', ctr: '0.5%', cpc: 3.44, status: 'average' },
    { id: 'g8', name: 'Search - Competitor Terms', platform: 'Google Search', spend: 180000, revenue: 216000, roas: 1.2, orders: 288, conversions: 288, impressions: '1.8M', clicks: '45.0K', ctr: '2.5%', cpc: 4.0, status: 'poor' },
  ] : [
    // Lead Gen Campaigns - Google Ads
    { id: 'g1', name: 'Brand - Exact Match', platform: 'Google Search', spend: 192000, revenue: 0, roas: 0, orders: 0, leads: 1234, cpl: 156, ql: 395, cplQ: 486, conversions: 1234, impressions: '1.2M', clicks: '42.8K', ctr: '3.6%', cpc: 4.48, status: 'excellent' },
    { id: 'g2', name: 'Shopping - High Priority', platform: 'Google Shopping', spend: 318000, revenue: 0, roas: 0, orders: 0, leads: 1542, cpl: 206, ql: 493, cplQ: 645, conversions: 1542, impressions: '3.8M', clicks: '95.2K', ctr: '2.5%', cpc: 3.34, status: 'excellent' },
    { id: 'g3', name: 'Performance Max - All Products', platform: 'Performance Max', spend: 282000, revenue: 0, roas: 0, orders: 0, leads: 1065, cpl: 265, ql: 341, cplQ: 827, conversions: 1065, impressions: '5.2M', clicks: '87.5K', ctr: '1.7%', cpc: 3.22, status: 'excellent' },
    { id: 'g4', name: 'Search - Industry Terms', platform: 'Google Search', spend: 248000, revenue: 0, roas: 0, orders: 0, leads: 785, cpl: 316, ql: 251, cplQ: 988, conversions: 785, impressions: '2.9M', clicks: '78.4K', ctr: '2.7%', cpc: 3.16, status: 'good' },
    { id: 'g5', name: 'Display - Remarketing', platform: 'Google Display', spend: 168000, revenue: 0, roas: 0, orders: 0, leads: 484, cpl: 347, ql: 155, cplQ: 1084, conversions: 484, impressions: '8.4M', clicks: '84.0K', ctr: '1.0%', cpc: 2.0, status: 'good' },
    { id: 'g6', name: 'Discovery - B2B Audiences', platform: 'Google Discovery', spend: 198000, revenue: 0, roas: 0, orders: 0, leads: 495, cpl: 400, ql: 158, cplQ: 1253, conversions: 495, impressions: '4.7M', clicks: '75.6K', ctr: '1.6%', cpc: 2.62, status: 'average' },
    { id: 'g7', name: 'YouTube - Thought Leadership', platform: 'YouTube Ads', spend: 218000, revenue: 0, roas: 0, orders: 0, leads: 488, cpl: 447, ql: 156, cplQ: 1397, conversions: 488, impressions: '12.5M', clicks: '62.5K', ctr: '0.5%', cpc: 3.49, status: 'average' },
    { id: 'g8', name: 'Search - Competitor Terms', platform: 'Google Search', spend: 182000, revenue: 0, roas: 0, orders: 0, leads: 288, cpl: 632, ql: 92, cplQ: 1978, conversions: 288, impressions: '1.8M', clicks: '45.0K', ctr: '2.5%', cpc: 4.04, status: 'poor' },
  ];

  // Google Ads ad group data
  const googleAdGroupData: AdGroupData[] = businessModel === 'ecommerce' ? [
    { id: 'ag1', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', spend: 95000, revenue: 475000, roas: 5.0, conversions: 634, impressions: '620K', clicks: '22.3K', ctr: '3.6%', cpc: 4.26, status: 'excellent' },
    { id: 'ag2', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', spend: 90000, revenue: 450000, roas: 5.0, conversions: 600, impressions: '580K', clicks: '20.5K', ctr: '3.5%', cpc: 4.39, status: 'excellent' },
    { id: 'ag3', campaignName: 'Shopping - High Priority', adGroupName: 'Best Sellers', spend: 145000, revenue: 522000, roas: 3.6, conversions: 698, impressions: '1.7M', clicks: '43.1K', ctr: '2.5%', cpc: 3.36, status: 'excellent' },
    { id: 'ag4', campaignName: 'Shopping - High Priority', adGroupName: 'New Arrivals', spend: 98000, revenue: 352800, roas: 3.6, conversions: 471, impressions: '1.2M', clicks: '29.2K', ctr: '2.4%', cpc: 3.36, status: 'excellent' },
    { id: 'ag5', campaignName: 'Shopping - High Priority', adGroupName: 'Clearance Items', spend: 77000, revenue: 277200, roas: 3.6, conversions: 373, impressions: '900K', clicks: '22.9K', ctr: '2.5%', cpc: 3.36, status: 'excellent' },
    { id: 'ag6', campaignName: 'Search - Category Terms', adGroupName: 'Women Clothing', spend: 88000, revenue: 211200, roas: 2.4, conversions: 282, impressions: '1.0M', clicks: '28.2K', ctr: '2.8%', cpc: 3.12, status: 'good' },
    { id: 'ag7', campaignName: 'Search - Category Terms', adGroupName: 'Men Accessories', spend: 92000, revenue: 220800, roas: 2.4, conversions: 295, impressions: '1.1M', clicks: '29.5K', ctr: '2.7%', cpc: 3.12, status: 'good' },
    { id: 'ag8', campaignName: 'Search - Category Terms', adGroupName: 'Home Decor', spend: 65000, revenue: 156000, roas: 2.4, conversions: 208, impressions: '800K', clicks: '20.7K', ctr: '2.6%', cpc: 3.14, status: 'good' },
    { id: 'ag9', campaignName: 'Display - Remarketing', adGroupName: 'Cart Abandoners', spend: 72000, revenue: 158400, roas: 2.2, conversions: 211, impressions: '3.6M', clicks: '36.7K', ctr: '1.0%', cpc: 1.96, status: 'good' },
    { id: 'ag10', campaignName: 'Display - Remarketing', adGroupName: 'Product Viewers', spend: 93000, revenue: 204600, roas: 2.2, conversions: 273, impressions: '4.8M', clicks: '47.3K', ctr: '1.0%', cpc: 1.97, status: 'good' },
  ] : [
    // Lead Gen Ad Groups - Google Ads
    { id: 'ag1', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', spend: 96000, revenue: 0, roas: 0, conversions: 634, leads: 634, cpl: 151, ql: 203, cplQ: 473, impressions: '620K', clicks: '22.3K', ctr: '3.6%', cpc: 4.30, cvr: 28.4, status: 'excellent' },
    { id: 'ag2', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', spend: 88000, revenue: 0, roas: 0, conversions: 600, leads: 600, cpl: 147, ql: 192, cplQ: 458, impressions: '580K', clicks: '20.5K', ctr: '3.5%', cpc: 4.29, cvr: 29.3, status: 'excellent' },
    { id: 'ag3', campaignName: 'Shopping - High Priority', adGroupName: 'Best Sellers', spend: 148000, revenue: 0, roas: 0, conversions: 698, leads: 698, cpl: 212, ql: 223, cplQ: 664, impressions: '1.7M', clicks: '43.1K', ctr: '2.5%', cpc: 3.43, cvr: 16.2, status: 'excellent' },
    { id: 'ag4', campaignName: 'Shopping - High Priority', adGroupName: 'New Arrivals', spend: 95000, revenue: 0, roas: 0, conversions: 471, leads: 471, cpl: 202, ql: 151, cplQ: 629, impressions: '1.2M', clicks: '29.2K', ctr: '2.4%', cpc: 3.25, cvr: 16.1, status: 'excellent' },
    { id: 'ag5', campaignName: 'Shopping - High Priority', adGroupName: 'Clearance Items', spend: 75000, revenue: 0, roas: 0, conversions: 373, leads: 373, cpl: 201, ql: 119, cplQ: 630, impressions: '900K', clicks: '22.9K', ctr: '2.5%', cpc: 3.27, cvr: 16.3, status: 'excellent' },
    { id: 'ag6', campaignName: 'Search - Industry Terms', adGroupName: 'B2B Services', spend: 92000, revenue: 0, roas: 0, conversions: 282, leads: 282, cpl: 326, ql: 90, cplQ: 1022, impressions: '1.0M', clicks: '28.2K', ctr: '2.8%', cpc: 3.26, cvr: 10.0, status: 'good' },
    { id: 'ag7', campaignName: 'Search - Industry Terms', adGroupName: 'Digital Marketing', spend: 88000, revenue: 0, roas: 0, conversions: 295, leads: 295, cpl: 298, ql: 94, cplQ: 936, impressions: '1.1M', clicks: '29.5K', ctr: '2.7%', cpc: 2.98, cvr: 10.0, status: 'good' },
    { id: 'ag8', campaignName: 'Search - Industry Terms', adGroupName: 'Finance Solutions', spend: 68000, revenue: 0, roas: 0, conversions: 208, leads: 208, cpl: 327, ql: 67, cplQ: 1015, impressions: '800K', clicks: '20.7K', ctr: '2.6%', cpc: 3.28, cvr: 10.0, status: 'good' },
    { id: 'ag9', campaignName: 'Display - Remarketing', adGroupName: 'Website Visitors', spend: 74000, revenue: 0, roas: 0, conversions: 211, leads: 211, cpl: 351, ql: 68, cplQ: 1088, impressions: '3.6M', clicks: '36.7K', ctr: '1.0%', cpc: 2.02, cvr: 5.8, status: 'good' },
    { id: 'ag10', campaignName: 'Display - Remarketing', adGroupName: 'Engaged Prospects', spend: 94000, revenue: 0, roas: 0, conversions: 273, leads: 273, cpl: 344, ql: 87, cplQ: 1080, impressions: '4.8M', clicks: '47.3K', ctr: '1.0%', cpc: 1.99, cvr: 5.8, status: 'good' },
  ];

  // Google Ads keyword data
  const googleKeywordData: KeywordData[] = businessModel === 'ecommerce' ? [
    { id: 'kw1', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: '[brand name]', matchType: 'Exact', spend: 42000, revenue: 210000, roas: 5.0, conversions: 280, impressions: '280K', clicks: '10.1K', ctr: '3.6%', cpc: 4.16, qualityScore: 10, status: 'excellent' },
    { id: 'kw2', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: '"brand name online"', matchType: 'Phrase', spend: 28000, revenue: 140000, roas: 5.0, conversions: 187, impressions: '185K', clicks: '6.7K', ctr: '3.6%', cpc: 4.18, qualityScore: 9, status: 'excellent' },
    { id: 'kw3', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: 'brand name products', matchType: 'Broad', spend: 25000, revenue: 125000, roas: 5.0, conversions: 167, impressions: '155K', clicks: '5.5K', ctr: '3.5%', cpc: 4.55, qualityScore: 8, status: 'excellent' },
    { id: 'kw4', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', keyword: '[brand name women clothing]', matchType: 'Exact', spend: 38000, revenue: 190000, roas: 5.0, conversions: 253, impressions: '245K', clicks: '8.6K', ctr: '3.5%', cpc: 4.42, qualityScore: 9, status: 'excellent' },
    { id: 'kw5', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', keyword: '"brand name accessories"', matchType: 'Phrase', spend: 32000, revenue: 160000, roas: 5.0, conversions: 213, impressions: '205K', clicks: '7.2K', ctr: '3.5%', cpc: 4.44, qualityScore: 9, status: 'excellent' },
    { id: 'kw6', campaignName: 'Search - Category Terms', adGroupName: 'Women Clothing', keyword: '[women summer dresses]', matchType: 'Exact', spend: 35000, revenue: 84000, roas: 2.4, conversions: 112, impressions: '420K', clicks: '11.2K', ctr: '2.7%', cpc: 3.13, qualityScore: 8, status: 'good' },
    { id: 'kw7', campaignName: 'Search - Category Terms', adGroupName: 'Women Clothing', keyword: '"buy women tops online"', matchType: 'Phrase', spend: 28000, revenue: 67200, roas: 2.4, conversions: 90, impressions: '330K', clicks: '9.0K', ctr: '2.7%', cpc: 3.11, qualityScore: 7, status: 'good' },
    { id: 'kw8', campaignName: 'Search - Category Terms', adGroupName: 'Women Clothing', keyword: 'women fashion online', matchType: 'Broad', spend: 25000, revenue: 60000, roas: 2.4, conversions: 80, impressions: '250K', clicks: '8.0K', ctr: '3.2%', cpc: 3.13, qualityScore: 7, status: 'good' },
    { id: 'kw9', campaignName: 'Search - Category Terms', adGroupName: 'Men Accessories', keyword: '[men leather wallet]', matchType: 'Exact', spend: 38000, revenue: 91200, roas: 2.4, conversions: 122, impressions: '480K', clicks: '12.2K', ctr: '2.5%', cpc: 3.11, qualityScore: 8, status: 'good' },
    { id: 'kw10', campaignName: 'Search - Category Terms', adGroupName: 'Men Accessories', keyword: '"men sunglasses online"', matchType: 'Phrase', spend: 32000, revenue: 76800, roas: 2.4, conversions: 102, impressions: '390K', clicks: '10.3K', ctr: '2.6%', cpc: 3.11, qualityScore: 7, status: 'good' },
    { id: 'kw11', campaignName: 'Search - Competitor Terms', adGroupName: 'Competitor Brand A', keyword: '[competitor brand]', matchType: 'Exact', spend: 52000, revenue: 62400, roas: 1.2, conversions: 83, impressions: '520K', clicks: '13.0K', ctr: '2.5%', cpc: 4.0, qualityScore: 5, status: 'poor' },
    { id: 'kw12', campaignName: 'Search - Competitor Terms', adGroupName: 'Competitor Brand A', keyword: '"competitor alternative"', matchType: 'Phrase', spend: 48000, revenue: 57600, roas: 1.2, conversions: 77, impressions: '480K', clicks: '12.0K', ctr: '2.5%', cpc: 4.0, qualityScore: 5, status: 'poor' },
  ] : [
    // Lead Gen Keywords - Google Ads
    { id: 'kw1', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: '[brego business]', matchType: 'Exact', spend: 43000, revenue: 0, roas: 0, conversions: 280, leads: 280, cpl: 154, ql: 90, cplQ: 478, impressions: '280K', clicks: '10.1K', ctr: '3.6%', cpc: 4.26, qualityScore: 10, status: 'excellent' },
    { id: 'kw2', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: '"brego business services"', matchType: 'Phrase', spend: 28000, revenue: 0, roas: 0, conversions: 187, leads: 187, cpl: 150, ql: 60, cplQ: 467, impressions: '185K', clicks: '6.7K', ctr: '3.6%', cpc: 4.18, qualityScore: 9, status: 'excellent' },
    { id: 'kw3', campaignName: 'Brand - Exact Match', adGroupName: 'Brand Core Terms', keyword: 'brego business solutions', matchType: 'Broad', spend: 25000, revenue: 0, roas: 0, conversions: 167, leads: 167, cpl: 150, ql: 53, cplQ: 472, impressions: '155K', clicks: '5.5K', ctr: '3.5%', cpc: 4.55, qualityScore: 8, status: 'excellent' },
    { id: 'kw4', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', keyword: '[brego digital marketing]', matchType: 'Exact', spend: 36000, revenue: 0, roas: 0, conversions: 253, leads: 253, cpl: 142, ql: 81, cplQ: 444, impressions: '245K', clicks: '8.6K', ctr: '3.5%', cpc: 4.19, qualityScore: 9, status: 'excellent' },
    { id: 'kw5', campaignName: 'Brand - Exact Match', adGroupName: 'Brand + Product', keyword: '"brego finance services"', matchType: 'Phrase', spend: 32000, revenue: 0, roas: 0, conversions: 213, leads: 213, cpl: 150, ql: 68, cplQ: 471, impressions: '205K', clicks: '7.2K', ctr: '3.5%', cpc: 4.44, qualityScore: 9, status: 'excellent' },
    { id: 'kw6', campaignName: 'Search - Industry Terms', adGroupName: 'B2B Services', keyword: '[b2b marketing services]', matchType: 'Exact', spend: 37000, revenue: 0, roas: 0, conversions: 112, leads: 112, cpl: 330, ql: 36, cplQ: 1028, impressions: '420K', clicks: '11.2K', ctr: '2.7%', cpc: 3.30, qualityScore: 8, status: 'good' },
    { id: 'kw7', campaignName: 'Search - Industry Terms', adGroupName: 'B2B Services', keyword: '"startup marketing agency"', matchType: 'Phrase', spend: 28000, revenue: 0, roas: 0, conversions: 90, leads: 90, cpl: 311, ql: 29, cplQ: 966, impressions: '330K', clicks: '9.0K', ctr: '2.7%', cpc: 3.11, qualityScore: 7, status: 'good' },
    { id: 'kw8', campaignName: 'Search - Industry Terms', adGroupName: 'B2B Services', keyword: 'business growth services', matchType: 'Broad', spend: 27000, revenue: 0, roas: 0, conversions: 80, leads: 80, cpl: 338, ql: 26, cplQ: 1038, impressions: '250K', clicks: '8.0K', ctr: '3.2%', cpc: 3.38, qualityScore: 7, status: 'good' },
    { id: 'kw9', campaignName: 'Search - Industry Terms', adGroupName: 'Digital Marketing', keyword: '[digital marketing for startups]', matchType: 'Exact', spend: 36000, revenue: 0, roas: 0, conversions: 122, leads: 122, cpl: 295, ql: 39, cplQ: 923, impressions: '480K', clicks: '12.2K', ctr: '2.5%', cpc: 2.95, qualityScore: 8, status: 'good' },
    { id: 'kw10', campaignName: 'Search - Industry Terms', adGroupName: 'Digital Marketing', keyword: '"performance marketing agency"', matchType: 'Phrase', spend: 31000, revenue: 0, roas: 0, conversions: 102, leads: 102, cpl: 304, ql: 33, cplQ: 939, impressions: '390K', clicks: '10.3K', ctr: '2.6%', cpc: 3.01, qualityScore: 7, status: 'good' },
    { id: 'kw11', campaignName: 'Search - Industry Terms', adGroupName: 'Finance Solutions', keyword: '[startup finance services]', matchType: 'Exact', spend: 35000, revenue: 0, roas: 0, conversions: 108, leads: 108, cpl: 324, ql: 35, cplQ: 1000, impressions: '410K', clicks: '10.7K', ctr: '2.6%', cpc: 3.27, qualityScore: 8, status: 'good' },
    { id: 'kw12', campaignName: 'Search - Industry Terms', adGroupName: 'Finance Solutions', keyword: '"accounting services for businesses"', matchType: 'Phrase', spend: 33000, revenue: 0, roas: 0, conversions: 100, leads: 100, cpl: 330, ql: 32, cplQ: 1031, impressions: '390K', clicks: '10.0K', ctr: '2.6%', cpc: 3.30, qualityScore: 7, status: 'good' },
  ];

  // ─── META ADS CREATIVE DATA (for Ads tab) ────────────────────────
  const metaCreativeData: CreativeData[] = businessModel === 'ecommerce' ? [
    { id: 'CR-001', thumbnail: '', campaignName: 'Product Catalog Sales - Summer', adSetName: 'Retargeting - Engaged Users', format: 'Video', hook: 'Problem-Solution', spend: 85000, impressions: 425000, reach: 350000, clicks: 13600, ctr: 0.032, cpc: 6.25, cpm: 200, linkClicks: 13600, lpv: 11500, costPerResult: 265, roas: 3.8, cpl: 0, ql: 1, cplQ: 85000, leads: 0, purchases: 44, cpa: 1931.82, cvr: 0.32, frequency: 2.3, daysLive: 12, status: 'fresh' },
    { id: 'CR-002', thumbnail: '', campaignName: 'Dynamic Retargeting', adSetName: 'Website Visitors - 7D', format: 'Video', hook: 'Before-After', spend: 72000, impressions: 320000, reach: 260000, clicks: 12160, ctr: 0.038, cpc: 5.92, cpm: 225, linkClicks: 12160, lpv: 10200, costPerResult: 230, roas: 3.6, cpl: 0, ql: 1, cplQ: 72000, leads: 0, purchases: 37, cpa: 1945.95, cvr: 0.30, frequency: 2.8, daysLive: 18, status: 'fresh' },
    { id: 'CR-003', thumbnail: '', campaignName: 'Collection Ads - New Arrivals', adSetName: 'Prospecting - Lookalike 1%', format: 'Image', hook: 'Social Proof', spend: 58000, impressions: 290000, reach: 240000, clicks: 8120, ctr: 0.028, cpc: 7.13, cpm: 200, linkClicks: 8120, lpv: 6850, costPerResult: 285, roas: 3.4, cpl: 0, ql: 1, cplQ: 58000, leads: 0, purchases: 31, cpa: 1870.97, cvr: 0.39, frequency: 3.2, daysLive: 22, status: 'fresh' },
    { id: 'CR-004', thumbnail: '', campaignName: 'Prospecting - Lookalike', adSetName: 'Lookalike 2-3%', format: 'Video', hook: 'Founder Story', spend: 64000, impressions: 275000, reach: 220000, clicks: 9625, ctr: 0.035, cpc: 6.65, cpm: 233, linkClicks: 9625, lpv: 8180, costPerResult: 255, roas: 3.3, cpl: 0, ql: 1, cplQ: 64000, leads: 0, purchases: 25, cpa: 2560.00, cvr: 0.26, frequency: 2.6, daysLive: 15, status: 'fresh' },
    { id: 'CR-005', thumbnail: '', campaignName: 'Season Sale Campaign', adSetName: 'Broad Audience - Interest', format: 'Image', hook: 'Product Feature', spend: 48000, impressions: 220000, reach: 180000, clicks: 5500, ctr: 0.025, cpc: 8.73, cpm: 218, linkClicks: 5500, lpv: 4650, costPerResult: 320, roas: 3.2, cpl: 0, ql: 1, cplQ: 48000, leads: 0, purchases: 18, cpa: 2666.67, cvr: 0.33, frequency: 3.8, daysLive: 28, status: 'fresh' },
    { id: 'CR-006', thumbnail: '', campaignName: 'UGC Campaign - Testimonials', adSetName: 'Interest Targeting - Beauty', format: 'Video', hook: 'UGC Testimonial', spend: 52000, impressions: 185000, reach: 150000, clicks: 4070, ctr: 0.022, cpc: 12.78, cpm: 281, linkClicks: 4070, lpv: 3450, costPerResult: 385, roas: 2.9, cpl: 0, ql: 1, cplQ: 52000, leads: 0, purchases: 14, cpa: 3714.29, cvr: 0.34, frequency: 4.2, daysLive: 35, status: 'fatiguing' },
    { id: 'CR-007', thumbnail: '', campaignName: 'Flash Sale - Limited Time', adSetName: 'Cart Abandoners - 14D', format: 'Image', hook: 'Discount Offer', spend: 38000, impressions: 140000, reach: 120000, clicks: 2800, ctr: 0.020, cpc: 13.57, cpm: 271, linkClicks: 2800, lpv: 2380, costPerResult: 410, roas: 2.7, cpl: 0, ql: 1, cplQ: 38000, leads: 0, purchases: 11, cpa: 3454.55, cvr: 0.39, frequency: 4.8, daysLive: 42, status: 'fatiguing' },
    { id: 'CR-008', thumbnail: '', campaignName: 'How-To Content Series', adSetName: 'Engaged Shoppers - 30D', format: 'Video', hook: 'How-To Demo', spend: 42000, impressions: 125000, reach: 100000, clicks: 2250, ctr: 0.018, cpc: 18.67, cpm: 336, linkClicks: 2250, lpv: 1900, costPerResult: 470, roas: 2.5, cpl: 0, ql: 1, cplQ: 42000, leads: 0, purchases: 9, cpa: 4666.67, cvr: 0.40, frequency: 5.4, daysLive: 48, status: 'fatiguing' },
    { id: 'CR-009', thumbnail: '', campaignName: 'Lifestyle Content', adSetName: 'Broad - Demographics', format: 'Image', hook: 'Lifestyle Shot', spend: 28000, impressions: 95000, reach: 80000, clicks: 1425, ctr: 0.015, cpc: 19.65, cpm: 295, linkClicks: 1425, lpv: 1200, costPerResult: 540, roas: 2.2, cpl: 0, ql: 1, cplQ: 28000, leads: 0, purchases: 5, cpa: 5600.00, cvr: 0.36, frequency: 6.2, daysLive: 56, status: 'dead' },
    { id: 'CR-010', thumbnail: '', campaignName: 'Unboxing Videos', adSetName: 'Interest - Shopping', format: 'Video', hook: 'Product Unboxing', spend: 22000, impressions: 72000, reach: 60000, clicks: 864, ctr: 0.012, cpc: 25.46, cpm: 306, linkClicks: 864, lpv: 730, costPerResult: 620, roas: 1.9, cpl: 0, ql: 1, cplQ: 22000, leads: 0, purchases: 4, cpa: 5500.00, cvr: 0.46, frequency: 7.8, daysLive: 64, status: 'dead' },
  ] : [
    { id: 'CR-001', thumbnail: '', campaignName: 'Lead Gen Forms - Service Discovery', adSetName: 'Lookalike - Converted Leads', format: 'Video', hook: 'Thought Leadership', spend: 85000, impressions: 340000, reach: 280000, clicks: 8500, ctr: 0.025, cpc: 10.00, cpm: 250, linkClicks: 8500, lpv: 7200, costPerResult: 285, roas: 0, cpl: 285, ql: 95, cplQ: 895, leads: 298, cvr: 3.51, frequency: 2.1, daysLive: 14, status: 'fresh' },
    { id: 'CR-002', thumbnail: '', campaignName: 'Video - Founder Testimonials', adSetName: 'Cold Audience - LinkedIn', format: 'Image', hook: 'Case Study Results', spend: 72000, impressions: 288000, reach: 240000, clicks: 6336, ctr: 0.022, cpc: 11.36, cpm: 250, linkClicks: 6336, lpv: 5385, costPerResult: 310, roas: 0, cpl: 310, ql: 74, cplQ: 973, leads: 232, cvr: 3.66, frequency: 2.6, daysLive: 18, status: 'fresh' },
    { id: 'CR-003', thumbnail: '', campaignName: 'Problem-Agitation Campaign', adSetName: 'Interest Targeting - B2B', format: 'Video', hook: 'Problem-Agitation', spend: 68000, impressions: 272000, reach: 220000, clicks: 6528, ctr: 0.024, cpc: 10.42, cpm: 250, linkClicks: 6528, lpv: 5550, costPerResult: 295, roas: 0, cpl: 295, ql: 74, cplQ: 919, leads: 230, cvr: 3.52, frequency: 2.8, daysLive: 21, status: 'fresh' },
    { id: 'CR-004', thumbnail: '', campaignName: 'ROI Calculator Lead Magnet', adSetName: 'LinkedIn - Job Title', format: 'Image', hook: 'ROI Calculator', spend: 58000, impressions: 193000, reach: 160000, clicks: 3860, ctr: 0.020, cpc: 15.03, cpm: 300, linkClicks: 3860, lpv: 3280, costPerResult: 320, roas: 0, cpl: 320, ql: 58, cplQ: 1000, leads: 181, cvr: 4.69, frequency: 3.1, daysLive: 25, status: 'fresh' },
    { id: 'CR-005', thumbnail: '', campaignName: 'Expert Interview Series', adSetName: 'Interest - Business Services', format: 'Video', hook: 'Expert Interview', spend: 52000, impressions: 173000, reach: 140000, clicks: 3114, ctr: 0.018, cpc: 16.69, cpm: 300, linkClicks: 3114, lpv: 2650, costPerResult: 340, roas: 0, cpl: 340, ql: 49, cplQ: 1061, leads: 153, cvr: 4.91, frequency: 3.5, daysLive: 28, status: 'fresh' },
    { id: 'CR-006', thumbnail: '', campaignName: 'Industry Report Download', adSetName: 'Engaged - 30D', format: 'Image', hook: 'Industry Report', spend: 48000, impressions: 137000, reach: 110000, clicks: 2192, ctr: 0.016, cpc: 21.89, cpm: 350, linkClicks: 2192, lpv: 1865, costPerResult: 380, roas: 0, cpl: 380, ql: 40, cplQ: 1200, leads: 126, cvr: 5.75, frequency: 4.2, daysLive: 35, status: 'fatiguing' },
    { id: 'CR-007', thumbnail: '', campaignName: 'Webinar Registration', adSetName: 'Lookalike - Webinar Attendees', format: 'Video', hook: 'Webinar Promo', spend: 42000, impressions: 112000, reach: 90000, clicks: 1568, ctr: 0.014, cpc: 26.79, cpm: 375, linkClicks: 1568, lpv: 1330, costPerResult: 420, roas: 0, cpl: 420, ql: 32, cplQ: 1312, leads: 100, cvr: 6.38, frequency: 4.8, daysLive: 42, status: 'fatiguing' },
    { id: 'CR-008', thumbnail: '', campaignName: 'Free Consultation Offer', adSetName: 'Retargeting - Website', format: 'Image', hook: 'Free Consultation', spend: 38000, impressions: 95000, reach: 80000, clicks: 1140, ctr: 0.012, cpc: 33.33, cpm: 400, linkClicks: 1140, lpv: 970, costPerResult: 475, roas: 0, cpl: 475, ql: 26, cplQ: 1462, leads: 80, cvr: 7.02, frequency: 5.4, daysLive: 49, status: 'fatiguing' },
    { id: 'CR-009', thumbnail: '', campaignName: 'Product Demo Videos', adSetName: 'Broad - Business Owners', format: 'Video', hook: 'Product Demo', spend: 32000, impressions: 74000, reach: 60000, clicks: 740, ctr: 0.010, cpc: 43.24, cpm: 432, linkClicks: 740, lpv: 630, costPerResult: 520, roas: 0, cpl: 520, ql: 20, cplQ: 1600, leads: 62, cvr: 8.38, frequency: 6.2, daysLive: 56, status: 'dead' },
    { id: 'CR-010', thumbnail: '', campaignName: 'Generic Benefits Campaign', adSetName: 'Interest - All', format: 'Image', hook: 'Generic Benefits', spend: 28000, impressions: 56000, reach: 40000, clicks: 448, ctr: 0.008, cpc: 62.50, cpm: 500, linkClicks: 448, lpv: 380, costPerResult: 580, roas: 0, cpl: 580, ql: 15, cplQ: 1867, leads: 48, cvr: 10.71, frequency: 7.1, daysLive: 63, status: 'dead' },
  ];

  // ─── GOOGLE ADS CREATIVE DATA (for Ads/Keywords tab) ─────────────
  const googleCreativeData: CreativeData[] = businessModel === 'ecommerce' ? [
    { id: 'GC-001', thumbnail: '', campaignName: 'Brand Search - Exact Match', adSetName: 'Brand Keywords', format: 'RSA', hook: 'Brand + Offer', spend: 92000, impressions: 380000, reach: 310000, clicks: 19760, ctr: 0.052, cpc: 4.66, cpm: 242, linkClicks: 19760, lpv: 16800, costPerResult: 195, roas: 4.5, cpl: 0, ql: 1, cplQ: 92000, leads: 0, purchases: 62, cpa: 1483.87, cvr: 0.31, frequency: 1.8, daysLive: 10, status: 'fresh', qualityScore: 9, impressionShare: 0.92, searchImprShare: '92%' },
    { id: 'GC-002', thumbnail: '', campaignName: 'Shopping - Top Products', adSetName: 'Product Group - Best Sellers', format: 'PMax', hook: 'Product Feed - Dynamic', spend: 78000, impressions: 520000, reach: 420000, clicks: 15600, ctr: 0.030, cpc: 5.00, cpm: 150, linkClicks: 15600, lpv: 13260, costPerResult: 210, roas: 4.2, cpl: 0, ql: 1, cplQ: 78000, leads: 0, purchases: 55, cpa: 1418.18, cvr: 0.35, frequency: 2.1, daysLive: 14, status: 'fresh', qualityScore: 8, impressionShare: 0.78 },
    { id: 'GC-003', thumbnail: '', campaignName: 'YouTube - Product Demos', adSetName: 'In-Market - Shopping', format: 'Video', hook: 'Product Demo 15s', spend: 65000, impressions: 480000, reach: 390000, clicks: 9600, ctr: 0.020, cpc: 6.77, cpm: 135, linkClicks: 9600, lpv: 8160, costPerResult: 240, roas: 3.8, cpl: 0, ql: 1, cplQ: 65000, leads: 0, purchases: 38, cpa: 1710.53, cvr: 0.40, frequency: 2.4, daysLive: 18, status: 'fresh', qualityScore: 7 },
    { id: 'GC-004', thumbnail: '', campaignName: 'Generic Search - Category', adSetName: 'Category Keywords', format: 'RSA', hook: 'Price + USP', spend: 58000, impressions: 290000, reach: 235000, clicks: 11020, ctr: 0.038, cpc: 5.26, cpm: 200, linkClicks: 11020, lpv: 9370, costPerResult: 250, roas: 3.5, cpl: 0, ql: 1, cplQ: 58000, leads: 0, purchases: 28, cpa: 2071.43, cvr: 0.25, frequency: 2.2, daysLive: 20, status: 'fresh', qualityScore: 7, impressionShare: 0.65, searchImprShare: '65%' },
    { id: 'GC-005', thumbnail: '', campaignName: 'Display - Retargeting', adSetName: 'Website Visitors - 14D', format: 'RDA', hook: 'Dynamic Remarketing', spend: 45000, impressions: 620000, reach: 380000, clicks: 6200, ctr: 0.010, cpc: 7.26, cpm: 73, linkClicks: 6200, lpv: 5270, costPerResult: 280, roas: 3.3, cpl: 0, ql: 1, cplQ: 45000, leads: 0, purchases: 22, cpa: 2045.45, cvr: 0.35, frequency: 3.4, daysLive: 25, status: 'fresh', qualityScore: 6 },
    { id: 'GC-006', thumbnail: '', campaignName: 'PMax - Seasonal Push', adSetName: 'Asset Group - Summer Sale', format: 'PMax', hook: 'Sale + Urgency', spend: 52000, impressions: 410000, reach: 320000, clicks: 7380, ctr: 0.018, cpc: 7.05, cpm: 127, linkClicks: 7380, lpv: 6270, costPerResult: 310, roas: 3.0, cpl: 0, ql: 1, cplQ: 52000, leads: 0, purchases: 19, cpa: 2736.84, cvr: 0.26, frequency: 3.8, daysLive: 32, status: 'fresh', qualityScore: 6 },
    { id: 'GC-007', thumbnail: '', campaignName: 'YouTube - Brand Awareness', adSetName: 'Affinity - Shoppers', format: 'Video', hook: 'Brand Story 30s', spend: 42000, impressions: 350000, reach: 280000, clicks: 3500, ctr: 0.010, cpc: 12.00, cpm: 120, linkClicks: 3500, lpv: 2975, costPerResult: 380, roas: 2.6, cpl: 0, ql: 1, cplQ: 42000, leads: 0, purchases: 12, cpa: 3500.00, cvr: 0.34, frequency: 4.2, daysLive: 38, status: 'fatiguing', qualityScore: 5 },
    { id: 'GC-008', thumbnail: '', campaignName: 'Display - Prospecting', adSetName: 'Custom Intent - Competitors', format: 'RDA', hook: 'Comparison Offer', spend: 38000, impressions: 540000, reach: 420000, clicks: 2700, ctr: 0.005, cpc: 14.07, cpm: 70, linkClicks: 2700, lpv: 2295, costPerResult: 430, roas: 2.3, cpl: 0, ql: 1, cplQ: 38000, leads: 0, purchases: 9, cpa: 4222.22, cvr: 0.33, frequency: 5.1, daysLive: 45, status: 'fatiguing', qualityScore: 4 },
    { id: 'GC-009', thumbnail: '', campaignName: 'Competitor Keywords', adSetName: 'Competitor Brand Terms', format: 'RSA', hook: 'Competitor Conquest', spend: 32000, impressions: 180000, reach: 150000, clicks: 2340, ctr: 0.013, cpc: 13.68, cpm: 178, linkClicks: 2340, lpv: 1990, costPerResult: 490, roas: 2.0, cpl: 0, ql: 1, cplQ: 32000, leads: 0, purchases: 6, cpa: 5333.33, cvr: 0.26, frequency: 5.8, daysLive: 52, status: 'dead', qualityScore: 3, impressionShare: 0.28, searchImprShare: '28%' },
    { id: 'GC-010', thumbnail: '', campaignName: 'Display - Broad Reach', adSetName: 'Similar Audiences', format: 'RDA', hook: 'Generic Banner', spend: 24000, impressions: 480000, reach: 380000, clicks: 1440, ctr: 0.003, cpc: 16.67, cpm: 50, linkClicks: 1440, lpv: 1220, costPerResult: 560, roas: 1.7, cpl: 0, ql: 1, cplQ: 24000, leads: 0, purchases: 4, cpa: 6000.00, cvr: 0.28, frequency: 7.2, daysLive: 60, status: 'dead', qualityScore: 3 },
  ] : [
    { id: 'GC-001', thumbnail: '', campaignName: 'Search - Service Keywords', adSetName: 'Service Keywords - Exact', format: 'RSA', hook: 'Service + Trust', spend: 90000, impressions: 320000, reach: 260000, clicks: 12800, ctr: 0.040, cpc: 7.03, cpm: 281, linkClicks: 12800, lpv: 10880, costPerResult: 260, roas: 0, cpl: 260, ql: 111, cplQ: 811, leads: 346, cvr: 2.70, frequency: 1.9, daysLive: 12, status: 'fresh', qualityScore: 9, impressionShare: 0.88, searchImprShare: '88%' },
    { id: 'GC-002', thumbnail: '', campaignName: 'Search - Problem-Aware', adSetName: 'Problem Keywords - Phrase', format: 'RSA', hook: 'Solution Headline', spend: 75000, impressions: 280000, reach: 230000, clicks: 9520, ctr: 0.034, cpc: 7.88, cpm: 268, linkClicks: 9520, lpv: 8090, costPerResult: 280, roas: 0, cpl: 280, ql: 86, cplQ: 872, leads: 268, cvr: 2.81, frequency: 2.2, daysLive: 16, status: 'fresh', qualityScore: 8, impressionShare: 0.72, searchImprShare: '72%' },
    { id: 'GC-003', thumbnail: '', campaignName: 'YouTube - Thought Leadership', adSetName: 'In-Market - Business Services', format: 'Video', hook: 'Expert Insight 15s', spend: 62000, impressions: 420000, reach: 340000, clicks: 6720, ctr: 0.016, cpc: 9.23, cpm: 148, linkClicks: 6720, lpv: 5710, costPerResult: 295, roas: 0, cpl: 295, ql: 67, cplQ: 925, leads: 210, cvr: 3.13, frequency: 2.5, daysLive: 20, status: 'fresh', qualityScore: 7 },
    { id: 'GC-004', thumbnail: '', campaignName: 'PMax - Lead Generation', adSetName: 'Asset Group - Core Services', format: 'PMax', hook: 'Multi-Asset Lead', spend: 55000, impressions: 380000, reach: 310000, clicks: 5700, ctr: 0.015, cpc: 9.65, cpm: 145, linkClicks: 5700, lpv: 4845, costPerResult: 310, roas: 0, cpl: 310, ql: 57, cplQ: 965, leads: 177, cvr: 3.11, frequency: 2.6, daysLive: 22, status: 'fresh', qualityScore: 7 },
    { id: 'GC-005', thumbnail: '', campaignName: 'Display - Case Studies', adSetName: 'Custom Intent - B2B', format: 'RDA', hook: 'Case Study CTA', spend: 48000, impressions: 520000, reach: 400000, clicks: 4160, ctr: 0.008, cpc: 11.54, cpm: 92, linkClicks: 4160, lpv: 3540, costPerResult: 335, roas: 0, cpl: 335, ql: 46, cplQ: 1043, leads: 143, cvr: 3.44, frequency: 3.0, daysLive: 26, status: 'fresh', qualityScore: 6 },
    { id: 'GC-006', thumbnail: '', campaignName: 'Search - Long-Tail Intent', adSetName: 'Long-Tail Keywords', format: 'RSA', hook: 'Specific Solution', spend: 44000, impressions: 160000, reach: 130000, clicks: 3520, ctr: 0.022, cpc: 12.50, cpm: 275, linkClicks: 3520, lpv: 2990, costPerResult: 370, roas: 0, cpl: 370, ql: 38, cplQ: 1158, leads: 119, cvr: 3.38, frequency: 3.8, daysLive: 34, status: 'fatiguing', qualityScore: 5, impressionShare: 0.52, searchImprShare: '52%' },
    { id: 'GC-007', thumbnail: '', campaignName: 'YouTube - Retargeting', adSetName: 'Website Visitors - 30D', format: 'Video', hook: 'Reminder CTA 6s', spend: 36000, impressions: 280000, reach: 210000, clicks: 2240, ctr: 0.008, cpc: 16.07, cpm: 129, linkClicks: 2240, lpv: 1904, costPerResult: 400, roas: 0, cpl: 400, ql: 29, cplQ: 1241, leads: 90, cvr: 4.02, frequency: 4.5, daysLive: 40, status: 'fatiguing', qualityScore: 5 },
    { id: 'GC-008', thumbnail: '', campaignName: 'Display - Remarketing', adSetName: 'Engaged Visitors - 60D', format: 'RDA', hook: 'Offer Reminder', spend: 32000, impressions: 420000, reach: 320000, clicks: 1680, ctr: 0.004, cpc: 19.05, cpm: 76, linkClicks: 1680, lpv: 1430, costPerResult: 450, roas: 0, cpl: 450, ql: 23, cplQ: 1391, leads: 71, cvr: 4.23, frequency: 5.2, daysLive: 46, status: 'fatiguing', qualityScore: 4 },
    { id: 'GC-009', thumbnail: '', campaignName: 'PMax - Broad Discovery', adSetName: 'Asset Group - General', format: 'PMax', hook: 'Auto-Generated Mix', spend: 28000, impressions: 340000, reach: 270000, clicks: 1360, ctr: 0.004, cpc: 20.59, cpm: 82, linkClicks: 1360, lpv: 1156, costPerResult: 500, roas: 0, cpl: 500, ql: 18, cplQ: 1556, leads: 56, cvr: 4.12, frequency: 6.0, daysLive: 54, status: 'dead', qualityScore: 3 },
    { id: 'GC-010', thumbnail: '', campaignName: 'Search - Broad Match Test', adSetName: 'Broad Match Keywords', format: 'RSA', hook: 'Generic Headline', spend: 22000, impressions: 120000, reach: 95000, clicks: 840, ctr: 0.007, cpc: 26.19, cpm: 183, linkClicks: 840, lpv: 714, costPerResult: 550, roas: 0, cpl: 550, ql: 13, cplQ: 1692, leads: 40, cvr: 4.76, frequency: 6.8, daysLive: 62, status: 'dead', qualityScore: 3, impressionShare: 0.22, searchImprShare: '22%' },
  ];

  // ─── ADS TAB: select data based on platform ─────────────────────
  const adsCreativeData = selectedPlatform === 'google' ? googleCreativeData : metaCreativeData;
  const adsUniqueCampaigns = [...new Set(adsCreativeData.map(c => c.campaignName))];
  const adsUniqueAdGroups = [...new Set(
    adsCreativeData
      .filter(c => adsCampaignFilter === 'all' || c.campaignName === adsCampaignFilter)
      .map(c => c.adSetName)
  )];
  const adsUniqueFormats = [...new Set(adsCreativeData.map(c => c.format))];

  const handleAdsCampaignChange = (val: string) => {
    setAdsCampaignFilter(val);
    setAdsAdGroupFilter('all');
    setAdsCurrentPage(1);
  };

  const handleAdsSort = (field: string) => {
    if (adsSortField === field) {
      setAdsSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAdsSortField(field);
      setAdsSortDir('desc');
    }
  };

  const filteredSortedAds = useMemo(() => {
    let data = [...adsCreativeData];
    if (adsCampaignFilter !== 'all') data = data.filter(c => c.campaignName === adsCampaignFilter);
    if (adsAdGroupFilter !== 'all') data = data.filter(c => c.adSetName === adsAdGroupFilter);
    if (adsFormatFilter !== 'all') data = data.filter(c => c.format === adsFormatFilter);
    if (adsSortField) {
      data.sort((a, b) => {
        const aVal = (a as any)[adsSortField];
        const bVal = (b as any)[adsSortField];
        if (aVal === undefined || bVal === undefined) return 0;
        if (typeof aVal === 'string') return adsSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return adsSortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return data;
  }, [adsCreativeData, adsCampaignFilter, adsAdGroupFilter, adsFormatFilter, adsSortField, adsSortDir]);

  const adsActiveFilterCount = [adsCampaignFilter, adsAdGroupFilter, adsFormatFilter].filter(f => f !== 'all').length;
  const adsTotalPages = Math.ceil(filteredSortedAds.length / adsItemsPerPage);
  const paginatedAds = filteredSortedAds.slice((adsCurrentPage - 1) * adsItemsPerPage, adsCurrentPage * adsItemsPerPage);

  // Reset ads filters when platform changes
  React.useEffect(() => {
    setAdsCampaignFilter('all');
    setAdsAdGroupFilter('all');
    setAdsFormatFilter('all');
    setAdsSortField('');
    setAdsCurrentPage(1);
  }, [selectedPlatform]);

  // ─── ADS TAB HELPERS ─────────────────────────────────────────────
  const getFormatBadgeStyle = (format: string) => {
    switch (format) {
      case 'Video': return 'bg-purple-50 text-purple-600';
      case 'Image': return 'bg-gray-100 text-gray-600';
      case 'RSA': return 'bg-emerald-50 text-emerald-600';
      case 'RDA': return 'bg-orange-50 text-orange-600';
      case 'PMax': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Image': return <ImageIcon className="w-4 h-4" />;
      case 'RSA': return <Search className="w-4 h-4" />;
      case 'RDA': return <Layout className="w-4 h-4" />;
      case 'PMax': return <Layers className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getFormatIconBg = (format: string) => {
    switch (format) {
      case 'Video': return 'bg-purple-100 text-purple-600';
      case 'Image': return 'bg-gray-100 text-gray-600';
      case 'RSA': return 'bg-emerald-100 text-emerald-600';
      case 'RDA': return 'bg-orange-100 text-orange-600';
      case 'PMax': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const AdsSortIcon = ({ field }: { field: string }) => {
    if (adsSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return adsSortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-gray-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-gray-600 ml-1" />;
  };

  // Keyword filter/sort helpers
  const kwUniqueCampaigns = [...new Set(googleKeywordData.map(k => k.campaignName))];
  const kwUniqueAdGroups = [...new Set(
    googleKeywordData
      .filter(k => kwCampaignFilter === 'all' || k.campaignName === kwCampaignFilter)
      .map(k => k.adGroupName)
  )];

  // Reset ad group filter when campaign filter changes
  const handleKwCampaignChange = (val: string) => {
    setKwCampaignFilter(val);
    setKwAdGroupFilter('all');
  };

  const handleKwSort = (field: string) => {
    if (kwSortField === field) {
      setKwSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setKwSortField(field);
      setKwSortDir('desc');
    }
  };

  const filteredSortedKeywords = React.useMemo(() => {
    let data = [...googleKeywordData];
    if (kwCampaignFilter !== 'all') data = data.filter(k => k.campaignName === kwCampaignFilter);
    if (kwAdGroupFilter !== 'all') data = data.filter(k => k.adGroupName === kwAdGroupFilter);
    if (kwMatchTypeFilter !== 'all') data = data.filter(k => k.matchType === kwMatchTypeFilter);
    if (kwSortField) {
      data.sort((a, b) => {
        const aVal = (a as any)[kwSortField];
        const bVal = (b as any)[kwSortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return kwSortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return kwSortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return data;
  }, [googleKeywordData, kwCampaignFilter, kwAdGroupFilter, kwMatchTypeFilter, kwSortField, kwSortDir]);

  const kwActiveFilterCount = [kwCampaignFilter, kwAdGroupFilter, kwMatchTypeFilter].filter(f => f !== 'all').length;

  const KwSortIcon = ({ field }: { field: string }) => {
    if (kwSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return kwSortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-gray-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-gray-600 ml-1" />;
  };

  // Sort helpers for campaigns & ad groups
  const handleCampSort = (field: string) => {
    if (campSortField === field) { setCampSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); }
    else { setCampSortField(field); setCampSortDir('desc'); }
  };
  const handleAgSort = (field: string) => {
    if (agSortField === field) { setAgSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); }
    else { setAgSortField(field); setAgSortDir('desc'); }
  };

  const CampSortIcon = ({ field }: { field: string }) => {
    if (campSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return campSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-gray-600 ml-1" /> : <ArrowDown className="w-3 h-3 text-gray-600 ml-1" />;
  };
  const AgSortIcon = ({ field }: { field: string }) => {
    if (agSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return agSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-gray-600 ml-1" /> : <ArrowDown className="w-3 h-3 text-gray-600 ml-1" />;
  };

  // Generic sort helper
  const sortData = <T,>(data: T[], field: string, dir: 'asc' | 'desc'): T[] => {
    if (!field) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number') return dir === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    const data = selectedPlatform === 'meta' ? metaCampaignData : googleCampaignData;
    let result = [...data];
    if (campPlatformFilter !== 'all') result = result.filter(c => c.platform === campPlatformFilter);
    return sortData(result, campSortField, campSortDir);
  }, [selectedPlatform, metaCampaignData, googleCampaignData, campPlatformFilter, campSortField, campSortDir]);

  const campUniquePlatforms = [...new Set((selectedPlatform === 'meta' ? metaCampaignData : googleCampaignData).map(c => c.platform))];
  const campActiveFilterCount = [campPlatformFilter].filter(f => f !== 'all').length;

  // Filtered ad groups / ad sets
  const filteredAdGroupsOrSets = useMemo(() => {
    let data: any[];
    if (selectedPlatform === 'meta') {
      data = [...metaAdSetData];
    } else {
      data = [...googleAdGroupData];
    }
    if (agCampaignFilter !== 'all') data = data.filter(d => d.campaignName === agCampaignFilter);
    return sortData(data, agSortField, agSortDir);
  }, [selectedPlatform, metaAdSetData, googleAdGroupData, agCampaignFilter, agSortField, agSortDir]);

  const agUniqueCampaigns = [...new Set(
    (selectedPlatform === 'meta' ? metaAdSetData : googleAdGroupData).map((d: any) => d.campaignName)
  )];
  const agActiveFilterCount = [agCampaignFilter].filter(f => f !== 'all').length;

  // Total active filter count across current tab
  const totalActiveFilterCount = useMemo(() => {
    if (selectedPlatform === 'meta') {
      if (metaViewMode === 'campaigns') return campActiveFilterCount;
      if (metaViewMode === 'adsets') return agActiveFilterCount;
      if (metaViewMode === 'ads') return [adsCampaignFilter, adsAdGroupFilter, adsFormatFilter].filter(f => f !== 'all').length;
    } else {
      if (googleViewMode === 'campaigns') return campActiveFilterCount;
      if (googleViewMode === 'adgroups') return agActiveFilterCount;
      if (googleViewMode === 'ads') return [adsCampaignFilter, adsAdGroupFilter, adsFormatFilter].filter(f => f !== 'all').length;
      if (googleViewMode === 'keywords') return kwActiveFilterCount;
    }
    return 0;
  }, [selectedPlatform, metaViewMode, googleViewMode, campActiveFilterCount, agActiveFilterCount, adsCampaignFilter, adsAdGroupFilter, adsFormatFilter, kwActiveFilterCount]);

  // Keywords pagination
  const kwTotalPages = Math.ceil(filteredSortedKeywords.length / kwItemsPerPage);
  const paginatedKeywords = filteredSortedKeywords.slice((kwCurrentPage - 1) * kwItemsPerPage, kwCurrentPage * kwItemsPerPage);

  // Reset filters on platform change
  React.useEffect(() => {
    setCampPlatformFilter('all');
    setCampSortField(''); setCampSortDir('desc');
    setAgCampaignFilter('all');
    setAgSortField(''); setAgSortDir('desc');
    setKwCampaignFilter('all');
    setKwAdGroupFilter('all');
    setKwMatchTypeFilter('all');
    setKwCurrentPage(1);
    setFiltersOpen(false);
  }, [selectedPlatform]);

  // Calculate KPIs based on platform and business model
  const currentCampaignData = selectedPlatform === 'meta' ? metaCampaignData : googleCampaignData;
  const totalSpend = currentCampaignData.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = businessModel === 'ecommerce' ? currentCampaignData.reduce((sum, c) => sum + c.revenue, 0) : 0;
  const totalLeads = businessModel === 'leadgen' ? currentCampaignData.reduce((sum, c) => sum + (c.leads || 0), 0) : 0;
  const avgRoas = businessModel === 'ecommerce' ? totalRevenue / totalSpend : 0;
  const avgCpl = businessModel === 'leadgen' && totalLeads > 0 ? totalSpend / totalLeads : 0;
  const totalOrders = businessModel === 'ecommerce' ? currentCampaignData.reduce((sum, c) => sum + (c.orders || c.conversions || 0), 0) : 0;
  const totalConversions = businessModel === 'leadgen' ? totalLeads : totalOrders;
  const cac = businessModel === 'ecommerce' && totalOrders > 0 ? totalSpend / totalOrders : 0;
  const costPerConversion = businessModel === 'leadgen' ? avgCpl : cac;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-gray-700 bg-gray-100';
      case 'average': return 'text-amber-600 bg-amber-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'average': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-gray-700 bg-gray-100';
    if (score >= 4) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case 'Exact': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Phrase': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Broad': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCampaignDemographics = (campaignId: string): CampaignDemographics => {
    return {
      age: [
        { range: '18-24', percentage: 18, spend: 43200, revenue: 122400, roas: 2.83 },
        { range: '25-34', percentage: 35, spend: 84000, revenue: 237600, roas: 2.83 },
        { range: '35-44', percentage: 28, spend: 67200, revenue: 190400, roas: 2.83 },
        { range: '45-54', percentage: 13, spend: 31200, revenue: 88400, roas: 2.83 },
        { range: '55+', percentage: 6, spend: 14400, revenue: 40800, roas: 2.83 },
      ],
      gender: [
        { type: 'Female', percentage: 58, spend: 139200, revenue: 394400, roas: 2.83 },
        { type: 'Male', percentage: 40, spend: 96000, revenue: 272000, roas: 2.83 },
        { type: 'Other', percentage: 2, spend: 4800, revenue: 13600, roas: 2.83 },
      ],
      region: [
        { name: 'Mumbai Metro', percentage: 28, spend: 67200, revenue: 190400, roas: 2.83 },
        { name: 'Delhi NCR', percentage: 24, spend: 57600, revenue: 163200, roas: 2.83 },
        { name: 'Bangalore', percentage: 22, spend: 52800, revenue: 149600, roas: 2.83 },
        { name: 'Hyderabad', percentage: 12, spend: 28800, revenue: 81600, roas: 2.83 },
        { name: 'Chennai', percentage: 8, spend: 19200, revenue: 54400, roas: 2.83 },
        { name: 'Others', percentage: 6, spend: 14400, revenue: 40800, roas: 2.83 },
      ],
      platform: [
        { name: 'Mobile', percentage: 68, spend: 163200, revenue: 462400, roas: 2.83 },
        { name: 'Desktop', percentage: 28, spend: 67200, revenue: 190400, roas: 2.83 },
        { name: 'Tablet', percentage: 4, spend: 9600, revenue: 27200, roas: 2.83 },
      ],
      placement: [
        { name: 'Facebook Feed', percentage: 32, spend: 76800, revenue: 217600, roas: 2.83 },
        { name: 'Instagram Feed', percentage: 28, spend: 67200, revenue: 190400, roas: 2.83 },
        { name: 'Facebook Stories', percentage: 15, spend: 36000, revenue: 102000, roas: 2.83 },
        { name: 'Instagram Stories', percentage: 13, spend: 31200, revenue: 88400, roas: 2.83 },
        { name: 'Instagram Explore', percentage: 8, spend: 19200, revenue: 54400, roas: 2.83 },
        { name: 'Facebook Marketplace', percentage: 4, spend: 9600, revenue: 27200, roas: 2.83 },
      ],
    };
  };

  const getCampaignInsights = (campaign: CampaignData) => {
    if (businessModel === 'leadgen') {
      // LEAD GENERATION INSIGHTS
      const monthlySpend = campaign.spend;
      const totalLeads = campaign.leads || 0;
      const cpl = campaign.cpl || 0;
      
      if (campaign.status === 'excellent') {
        return [
          { type: 'success', text: `💰 Lead Efficiency: Exceptional ₹${cpl.toLocaleString()} CPL with ${totalLeads} leads generated. This is 45% below industry benchmark, indicating highly efficient lead acquisition.` },
          { type: 'success', text: `📊 Campaign Health: CTR of ${campaign.ctr} shows excellent ad-audience resonance with B2B decision-makers. Strong conversion rate indicates well-targeted landing pages.` },
          { type: 'action', text: `🚀 Scale Opportunity: Increase budget by 40-50% to capture more leads while CPL remains efficient. Expected additional ${Math.round(totalLeads * 0.45)} leads/month.` },
          { type: 'action', text: `📈 Replication Strategy: Document winning parameters and replicate to similar segments while maintaining CPL efficiency.` },
        ];
      } else if (campaign.status === 'good') {
        return [
          { type: 'success', text: `💵 Solid Performance: ₹${cpl.toLocaleString()} CPL generating ${totalLeads} leads. Meeting baseline targets with room for optimization.` },
          { type: 'warning', text: `⚠️ Growth Constraint: CTR of ${campaign.ctr} and form optimization could reduce CPL by 20-25% and unlock additional lead volume.` },
          { type: 'action', text: `🎯 Improvement Plan: Test simplified forms and refresh creative for 15-20% conversion lift and improved lead volume.` },
          { type: 'action', text: `💡 Resource Allocation: Focus on demographics with highest conversion rates and test lookalike audiences for scale.` },
        ];
      } else {
        return [
          { type: 'danger', text: `🚨 Critical Inefficiency: ₹${cpl.toLocaleString()} CPL significantly above target with ${totalLeads} leads of questionable quality. Poor use of marketing capital.` },
          { type: 'danger', text: `💸 Efficiency Risk: Low CTR of ${campaign.ctr} and high CPM indicates fundamental targeting or creative issues driving up costs.` },
          { type: 'action', text: `🔴 Immediate Action Required: Pause to stop inefficient spend. Conduct full audit before restart. Expected savings: ₹${(monthlySpend/100000).toFixed(1)}L/month.` },
        ];
      }
    }
    
    // E-COMMERCE INSIGHTS
    const monthlySpend = campaign.spend;
    const monthlyRevenue = campaign.revenue;
    const profitMargin = ((monthlyRevenue - monthlySpend) / monthlyRevenue * 100).toFixed(1);
    const projectedAnnualRevenue = ((monthlyRevenue * 12) / 100000).toFixed(1);
    
    if (campaign.status === 'excellent') {
      return [
        { type: 'success', text: `💰 Revenue Impact: ${campaign.roas}x ROAS generating ₹${((monthlyRevenue - monthlySpend)/100000).toFixed(1)}L net profit this month. At current performance, this campaign will contribute ₹${projectedAnnualRevenue}L in annual revenue - a key growth driver for the business.` },
        { type: 'success', text: `📊 Efficiency Analysis: ${profitMargin}% profit margin with ${campaign.ctr} CTR places this in the top 10% of campaigns. Customer acquisition is highly efficient - cost per ${selectedPlatform === 'google' ? 'conversion' : 'order'} is ₹${(campaign.spend / (campaign.orders || campaign.conversions || 1)).toLocaleString()}, well below industry benchmarks.` },
        { type: 'action', text: `🚀 Strategic Opportunity: This campaign is a proven winner. Recommend increasing budget allocation by 40-50% (additional ₹${((monthlySpend * 0.45)/100000).toFixed(1)}L/month) to capture more market share. Expected additional net profit: ₹${((monthlyRevenue - monthlySpend) * 0.45 / 100000).toFixed(1)}L/month.` },
        { type: 'action', text: `📈 Scale Strategy: Replicate this campaign structure to similar audience segments or adjacent markets. Based on current CAC efficiency, you can sustainably scale acquisition spend by 3x while maintaining profitability.` },
      ];
    } else if (campaign.status === 'good') {
      return [
        { type: 'success', text: `💵 Financial Health: ${campaign.roas}x ROAS delivering ₹${((monthlyRevenue - monthlySpend)/100000).toFixed(1)}L monthly profit (${profitMargin}% margin). Campaign is profitable and meeting baseline ROI expectations. Annualized revenue potential: ₹${projectedAnnualRevenue}L.` },
        { type: 'warning', text: `⚠️ Growth Constraint: CTR of ${campaign.ctr} indicates room for 20-30% efficiency improvement. Current CAC of ₹${(campaign.spend / (campaign.orders || campaign.conversions || 1)).toLocaleString()} can be optimized to unlock ₹${((monthlyRevenue - monthlySpend) * 0.25 / 100000).toFixed(1)}L additional monthly profit.` },
        { type: 'action', text: `🎯 Optimization Priority: Invest in creative refresh and landing page optimization. A 15% improvement in conversion rate would increase monthly profit by ₹${((monthlyRevenue * 0.15 - monthlySpend * 0.15) / 100000).toFixed(1)}L without additional spend.` },
        { type: 'action', text: `💡 Resource Allocation: This campaign warrants continued investment but needs optimization. Allocate 20% of marketing team bandwidth to improving ad creative and targeting precision to move this into "excellent" category.` },
      ];
    } else if (campaign.status === 'average') {
      return [
        { type: 'warning', text: `⚠️ Profitability Alert: ${campaign.roas}x ROAS yielding only ${profitMargin}% margin (₹${((monthlyRevenue - monthlySpend)/100000).toFixed(1)}L net profit). Below target efficiency - this campaign is at risk of becoming unprofitable with any market shift.` },
        { type: 'danger', text: `📉 CAC Concern: Customer acquisition cost of ₹${(campaign.spend / (campaign.orders || campaign.conversions || 1)).toLocaleString()} per ${selectedPlatform === 'google' ? 'conversion' : 'order'} is 35-40% higher than top performers. Current spending of ₹${(monthlySpend/100000).toFixed(1)}L/month may not be sustainable at this efficiency level.` },
        { type: 'action', text: `🔴 Immediate Action Required: Reduce budget by 30% (save ₹${(monthlySpend * 0.3 / 100000).toFixed(1)}L/month) and reallocate to better performing campaigns. Run diagnostic A/B tests with 15% of remaining budget to identify root cause of underperformance.` },
        { type: 'action', text: `📊 Strategic Review: This campaign needs executive attention. Evaluate if target audience quality has declined, if competition has intensified, or if product-market fit has shifted. Consider pausing if performance doesn't improve within 2 weeks.` },
      ];
    } else {
      return [
        { type: 'danger', text: `🚨 Critical P&L Impact: ${campaign.roas}x ROAS is burning capital - currently losing ₹${((monthlySpend - monthlyRevenue)/100000).toFixed(1)}L per month (negative ${Math.abs(parseFloat(profitMargin))}% margin). This represents a significant cash drain that impacts overall business profitability.` },
        { type: 'danger', text: `💸 Unsustainable CAC: Paying ₹${(campaign.spend / (campaign.orders || campaign.conversions || 1)).toLocaleString()} per ${selectedPlatform === 'google' ? 'conversion' : 'order'} - 2-3x higher than profitable campaigns. At current trajectory, this campaign will consume ₹${((monthlySpend - monthlyRevenue) * 3 / 100000).toFixed(1)}L over next quarter with no path to profitability.` },
        { type: 'danger', text: `📊 Executive Action Required: Poor CTR (${campaign.ctr}) and conversion metrics indicate fundamental issues. Every day this campaign runs costs the business ₹${((monthlySpend - monthlyRevenue) / 30 / 1000).toFixed(0)}K in losses. Immediate pause recommended to protect cash flow.` },
        { type: 'action', text: `🔄 Recovery Plan: PAUSE immediately and save ₹${(monthlySpend/100000).toFixed(1)}L/month in losses. Conduct full campaign audit covering targeting, creative, landing pages, and offer positioning. Reallocate entire budget to campaigns with positive ROAS. Only restart after complete strategic overhaul and small-scale validation testing.` },
      ];
    }
  };

  return (
    <div>
      {/* KPI Widgets — Target vs Achieved (same as Overview) */}
      {(() => {
        const fmtVal = (val: number, unit: string) => {
          if (unit === '₹') {
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
            return `₹${val.toLocaleString('en-IN')}`;
          }
          if (unit === 'x') return `${val.toFixed(2)}x`;
          if (unit === '%') return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`;
          if (val >= 1000) return val.toLocaleString();
          return String(val);
        };

        const higherIsBetterLabels = ['Total Revenue', 'Average ROAS', 'Total Orders', 'Total Leads', 'Total Conversions'];

        const costLabels = ['Total Ad Spend', 'CAC', 'Average CPL', 'Cost Per Conv.'];
        const deriveStatus = (achieved: number, target: number, label: string): 'good' | 'warning' | 'bad' => {
          const isCost = costLabels.includes(label);
          if (isCost) return achieved <= target ? 'good' : 'warning';
          const pct = target > 0 ? (achieved / target) * 100 : 0;
          return pct >= 90 ? 'good' : pct >= 60 ? 'warning' : 'bad';
        };

        const kpisRaw = businessModel === 'ecommerce' ? [
          { label: 'Total Ad Spend', achieved: totalSpend, target: selectedPlatform === 'meta' ? 1200000 : 1500000, unit: '₹', icon: IndianRupee, trend: '+12%' },
          { label: 'Total Revenue', achieved: totalRevenue, target: selectedPlatform === 'meta' ? 3200000 : 4000000, unit: '₹', icon: TrendingUp, trend: '+18%' },
          { label: 'Average ROAS', achieved: avgRoas, target: selectedPlatform === 'meta' ? 2.80 : 2.60, unit: 'x', icon: Target, trend: '+0.12' },
          { label: 'Total Orders', achieved: totalConversions, target: selectedPlatform === 'meta' ? 1200 : 1500, unit: '', icon: ShoppingBag, trend: '+9%' },
          { label: 'CAC', achieved: costPerConversion, target: selectedPlatform === 'meta' ? 950 : 1000, unit: '₹', icon: Users, trend: '-₹28' },
        ] : [
          { label: 'Total Ad Spend', achieved: totalSpend, target: selectedPlatform === 'meta' ? 1200000 : 800000, unit: '₹', icon: IndianRupee, trend: '+8%' },
          { label: 'Total Leads', achieved: totalLeads, target: selectedPlatform === 'meta' ? 2800 : 1800, unit: '', icon: TrendingUp, trend: '+14%' },
          { label: 'Average CPL', achieved: avgCpl, target: selectedPlatform === 'meta' ? 420 : 440, unit: '₹', icon: Target, trend: '-₹44' },
          { label: 'Total Conversions', achieved: totalConversions, target: selectedPlatform === 'meta' ? 2800 : 1800, unit: '', icon: ShoppingBag, trend: '+11%' },
          { label: 'Cost Per Conv.', achieved: costPerConversion, target: selectedPlatform === 'meta' ? 420 : 440, unit: '₹', icon: Users, trend: '-₹32' },
        ];
        const kpis = kpisRaw.map(k => ({ ...k, status: deriveStatus(k.achieved, k.target, k.label) }));

        const statusConfig = {
          good: { bgColor: 'bg-green-50', ringColor: 'ring-green-500/20', textColor: 'text-green-600' },
          warning: { bgColor: 'bg-amber-50', ringColor: 'ring-amber-500/20', textColor: 'text-amber-600' },
          bad: { bgColor: 'bg-red-50', ringColor: 'ring-red-500/20', textColor: 'text-red-600' },
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              const percentage = kpi.target > 0 ? (kpi.achieved / kpi.target) * 100 : 0;
              const cfg = statusConfig[kpi.status];
              const isUp = kpi.trend.startsWith('+');
              const higherIsBetter = higherIsBetterLabels.includes(kpi.label);
              const trendIsGood = higherIsBetter ? isUp : !isUp;
              return (
                <div key={kpi.label} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-10 h-10 ${cfg.bgColor} rounded-xl flex items-center justify-center ring-4 ${cfg.ringColor} transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    {kpi.trend && (
                      <span className={`text-[13px] flex items-center gap-0.5 ${trendIsGood ? 'text-green-600' : 'text-red-500'}`} style={{ fontWeight: 600 }}>
                        {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                        {kpi.trend}
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>{kpi.label}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-gray-900 tracking-tight" style={{ fontWeight: 700 }}>{fmtVal(kpi.achieved, kpi.unit)}</span>
                      <span className="text-sm text-gray-400" style={{ fontWeight: 500 }}>/ {fmtVal(kpi.target, kpi.unit)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          kpi.status === 'good' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          kpi.status === 'warning' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        } transition-all duration-700 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] ${cfg.textColor}`} style={{ fontWeight: 600 }}>
                        {percentage.toFixed(0)}%
                      </span>
                      {percentage >= 100 ? (
                        <span className="text-[13px] text-green-600 flex items-center gap-1" style={{ fontWeight: 500 }}>
                          <TrendingUp className="w-3 h-3" />
                          Target met
                        </span>
                      ) : (
                        <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>
                          {(100 - percentage).toFixed(0)}% to go
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Campaigns Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedPlatform === 'meta' 
                  ? (metaViewMode === 'campaigns' ? 'Campaigns' : metaViewMode === 'adsets' ? 'Ad Sets' : 'Creative')
                  : (googleViewMode === 'campaigns' ? 'Campaigns' : googleViewMode === 'adgroups' ? 'Ad Groups' : googleViewMode === 'keywords' ? 'Keywords' : 'Ad Asset')
                } Breakdown
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Click on any row to view detailed performance analysis
              </p>
            </div>
            
            <div className="flex items-center gap-2">
            {/* Toggle Switch - Meta Ads (3 options) */}
            {selectedPlatform === 'meta' && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setMetaViewMode('campaigns')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    metaViewMode === 'campaigns'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Campaigns
                </button>
                <button
                  onClick={() => setMetaViewMode('adsets')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    metaViewMode === 'adsets'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ad Sets
                </button>
                <button
                  onClick={() => setMetaViewMode('ads')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    metaViewMode === 'ads'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ads
                </button>
              </div>
            )}

            {/* Toggle Switch - Google Ads (4 options) */}
            {selectedPlatform === 'google' && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {([
                  { key: 'campaigns', label: 'Campaigns' },
                  { key: 'adgroups', label: 'Ad Groups' },
                  { key: 'ads', label: 'Ads' },
                  { key: 'keywords', label: 'Keywords' },
                ] as { key: GoogleViewMode; label: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setGoogleViewMode(tab.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      googleViewMode === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filter Toggle Button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                filtersOpen || totalActiveFilterCount > 0
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {totalActiveFilterCount > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  filtersOpen || totalActiveFilterCount > 0 ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'
                }`}>
                  {totalActiveFilterCount}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Campaigns Filter Bar */}
        {filtersOpen && ((selectedPlatform === 'meta' && metaViewMode === 'campaigns') || (selectedPlatform === 'google' && googleViewMode === 'campaigns')) && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                {campActiveFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gray-800 text-white text-[10px] font-bold">{campActiveFilterCount}</span>
                )}
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="relative">
                <select
                  value={campPlatformFilter}
                  onChange={(e) => setCampPlatformFilter(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    campPlatformFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Types</option>
                  {campUniquePlatforms.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              {campActiveFilterCount > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <button
                    onClick={() => { setCampPlatformFilter('all'); }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Ad Groups / Ad Sets Filter Bar */}
        {filtersOpen && ((selectedPlatform === 'meta' && metaViewMode === 'adsets') || (selectedPlatform === 'google' && googleViewMode === 'adgroups')) && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                {agActiveFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gray-800 text-white text-[10px] font-bold">{agActiveFilterCount}</span>
                )}
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="relative">
                <select
                  value={agCampaignFilter}
                  onChange={(e) => { setAgCampaignFilter(e.target.value); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    agCampaignFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Campaigns</option>
                  {agUniqueCampaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              {agActiveFilterCount > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <button
                    onClick={() => { setAgCampaignFilter('all'); }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Keywords Filter Bar (Google Ads only) */}
        {filtersOpen && selectedPlatform === 'google' && googleViewMode === 'keywords' && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                {kwActiveFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gray-800 text-white text-[10px] font-bold">{kwActiveFilterCount}</span>
                )}
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="relative">
                <select
                  value={kwCampaignFilter}
                  onChange={(e) => { handleKwCampaignChange(e.target.value); setKwCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    kwCampaignFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Campaigns</option>
                  {kwUniqueCampaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={kwAdGroupFilter}
                  onChange={(e) => { setKwAdGroupFilter(e.target.value); setKwCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    kwAdGroupFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Ad Groups</option>
                  {kwUniqueAdGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={kwMatchTypeFilter}
                  onChange={(e) => { setKwMatchTypeFilter(e.target.value); setKwCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    kwMatchTypeFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Match Types</option>
                  <option value="Exact">Exact</option>
                  <option value="Phrase">Phrase</option>
                  <option value="Broad">Broad</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              {kwActiveFilterCount > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setKwCampaignFilter('all');
                      setKwAdGroupFilter('all');
                      setKwMatchTypeFilter('all');
                      setKwSortField('');
                      setKwCurrentPage(1);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Ads Filter Bar (Meta Ads tab & Google Ads tab) */}
        {filtersOpen && ((selectedPlatform === 'meta' && metaViewMode === 'ads') || (selectedPlatform === 'google' && googleViewMode === 'ads')) && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                {adsActiveFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gray-800 text-white text-[10px] font-bold">{adsActiveFilterCount}</span>
                )}
              </div>

              <div className="h-4 w-px bg-gray-200" />

              {/* Campaign Filter */}
              <div className="relative">
                <select
                  value={adsCampaignFilter}
                  onChange={(e) => handleAdsCampaignChange(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    adsCampaignFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Campaigns</option>
                  {adsUniqueCampaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Ad Set/Ad Group Filter */}
              <div className="relative">
                <select
                  value={adsAdGroupFilter}
                  onChange={(e) => { setAdsAdGroupFilter(e.target.value); setAdsCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    adsAdGroupFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">{selectedPlatform === 'google' ? 'All Ad Groups' : 'All Ad Sets'}</option>
                  {adsUniqueAdGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Format Type Filter */}
              <div className="relative">
                <select
                  value={adsFormatFilter}
                  onChange={(e) => { setAdsFormatFilter(e.target.value); setAdsCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 ${
                    adsFormatFilter !== 'all'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Types</option>
                  {adsUniqueFormats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {adsActiveFilterCount > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setAdsCampaignFilter('all');
                      setAdsAdGroupFilter('all');
                      setAdsFormatFilter('all');
                      setAdsSortField('');
                      setAdsCurrentPage(1);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {/* Meta Ads Headers (campaigns & adsets only) */}
                {selectedPlatform === 'meta' && metaViewMode !== 'ads' && (
                  <>
                    <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort('name') : handleAgSort('campaignName')}>
                      <div className="flex items-center">Campaign {metaViewMode === 'campaigns' ? <CampSortIcon field="name" /> : <AgSortIcon field="campaignName" />}</div>
                    </th>
                    {metaViewMode === 'adsets' && (
                      <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('adSetName')}>
                        <div className="flex items-center">Ad Set <AgSortIcon field="adSetName" /></div>
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort('spend') : handleAgSort('spend')}>
                      <div className="flex items-center justify-end">Spend {metaViewMode === 'campaigns' ? <CampSortIcon field="spend" /> : <AgSortIcon field="spend" />}</div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort(businessModel === 'ecommerce' ? 'revenue' : 'leads') : handleAgSort(businessModel === 'ecommerce' ? 'revenue' : 'leads')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Revenue' : 'Leads'} {metaViewMode === 'campaigns' ? <CampSortIcon field={businessModel === 'ecommerce' ? 'revenue' : 'leads'} /> : <AgSortIcon field={businessModel === 'ecommerce' ? 'revenue' : 'leads'} />}</div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort(businessModel === 'ecommerce' ? 'roas' : 'cpl') : handleAgSort(businessModel === 'ecommerce' ? 'roas' : 'cpl')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'ROAS' : 'CPL'} {metaViewMode === 'campaigns' ? <CampSortIcon field={businessModel === 'ecommerce' ? 'roas' : 'cpl'} /> : <AgSortIcon field={businessModel === 'ecommerce' ? 'roas' : 'cpl'} />}</div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort(businessModel === 'ecommerce' ? 'orders' : 'ql') : handleAgSort(businessModel === 'ecommerce' ? 'orders' : 'ql')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Orders' : 'QL'} {metaViewMode === 'campaigns' ? <CampSortIcon field={businessModel === 'ecommerce' ? 'orders' : 'ql'} /> : <AgSortIcon field={businessModel === 'ecommerce' ? 'orders' : 'ql'} />}</div>
                    </th>
                    {businessModel === 'leadgen' && (
                      <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort('cplQ') : handleAgSort('cplQ')}>
                        <div className="flex items-center justify-end">CPL-Q {metaViewMode === 'campaigns' ? <CampSortIcon field="cplQ" /> : <AgSortIcon field="cplQ" />}</div>
                      </th>
                    )}
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => metaViewMode === 'campaigns' ? handleCampSort('ctr') : handleAgSort('ctr')}>
                      <div className="flex items-center justify-end">CTR {metaViewMode === 'campaigns' ? <CampSortIcon field="ctr" /> : <AgSortIcon field="ctr" />}</div>
                    </th>
                    {additionalMetrics.map((metric) => (
                      <th key={metric} className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {metric}
                      </th>
                    ))}
                  </>
                )}

                {/* Google Ads Headers - Campaigns */}
                {selectedPlatform === 'google' && googleViewMode === 'campaigns' && (
                  <>
                    <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort('name')}>
                      <div className="flex items-center">Campaign <CampSortIcon field="name" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort('spend')}>
                      <div className="flex items-center justify-end">Spend <CampSortIcon field="spend" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort(businessModel === 'ecommerce' ? 'revenue' : 'leads')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Revenue' : 'Leads'} <CampSortIcon field={businessModel === 'ecommerce' ? 'revenue' : 'leads'} /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort(businessModel === 'ecommerce' ? 'roas' : 'cpl')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'ROAS' : 'CPL'} <CampSortIcon field={businessModel === 'ecommerce' ? 'roas' : 'cpl'} /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort(businessModel === 'ecommerce' ? 'conversions' : 'ql')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Conv.' : 'QL'} <CampSortIcon field={businessModel === 'ecommerce' ? 'conversions' : 'ql'} /></div>
                    </th>
                    {businessModel === 'leadgen' && (
                      <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort('cplQ')}>
                        <div className="flex items-center justify-end">CPL-Q <CampSortIcon field="cplQ" /></div>
                      </th>
                    )}
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort('cpc')}>
                      <div className="flex items-center justify-end">CPC <CampSortIcon field="cpc" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleCampSort('ctr')}>
                      <div className="flex items-center justify-end">CTR <CampSortIcon field="ctr" /></div>
                    </th>
                    {additionalMetrics.map((metric) => (
                      <th key={metric} className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {metric}
                      </th>
                    ))}
                  </>
                )}

                {/* Google Ads Headers - Ad Groups */}
                {selectedPlatform === 'google' && googleViewMode === 'adgroups' && (
                  <>
                    <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('campaignName')}>
                      <div className="flex items-center">Campaign <AgSortIcon field="campaignName" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('adGroupName')}>
                      <div className="flex items-center">Ad Group <AgSortIcon field="adGroupName" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('spend')}>
                      <div className="flex items-center justify-end">Spend <AgSortIcon field="spend" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort(businessModel === 'ecommerce' ? 'revenue' : 'leads')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Revenue' : 'Leads'} <AgSortIcon field={businessModel === 'ecommerce' ? 'revenue' : 'leads'} /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort(businessModel === 'ecommerce' ? 'roas' : 'cpl')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'ROAS' : 'CPL'} <AgSortIcon field={businessModel === 'ecommerce' ? 'roas' : 'cpl'} /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort(businessModel === 'ecommerce' ? 'conversions' : 'ql')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Conv.' : 'QL'} <AgSortIcon field={businessModel === 'ecommerce' ? 'conversions' : 'ql'} /></div>
                    </th>
                    {businessModel === 'leadgen' && (
                      <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('cplQ')}>
                        <div className="flex items-center justify-end">CPL-Q <AgSortIcon field="cplQ" /></div>
                      </th>
                    )}
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('cpc')}>
                      <div className="flex items-center justify-end">CPC <AgSortIcon field="cpc" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleAgSort('ctr')}>
                      <div className="flex items-center justify-end">CTR <AgSortIcon field="ctr" /></div>
                    </th>
                    {additionalMetrics.map((metric) => (
                      <th key={metric} className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {metric}
                      </th>
                    ))}
                  </>
                )}

                {/* Google Ads Headers - Keywords */}
                {selectedPlatform === 'google' && googleViewMode === 'keywords' && (
                  <>
                    <th className="group/th px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('keyword')}>
                      <div className="flex items-center">Keyword <KwSortIcon field="keyword" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Match</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('spend')}>
                      <div className="flex items-center justify-end">Spend <KwSortIcon field="spend" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort(businessModel === 'ecommerce' ? 'roas' : 'cpl')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'ROAS' : 'CPL'} <KwSortIcon field={businessModel === 'ecommerce' ? 'roas' : 'cpl'} /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort(businessModel === 'ecommerce' ? 'conversions' : 'ql')}>
                      <div className="flex items-center justify-end">{businessModel === 'ecommerce' ? 'Conv.' : 'QL'} <KwSortIcon field={businessModel === 'ecommerce' ? 'conversions' : 'ql'} /></div>
                    </th>
                    {businessModel === 'leadgen' && (
                      <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('cplQ')}>
                        <div className="flex items-center justify-end">CPL-Q <KwSortIcon field="cplQ" /></div>
                      </th>
                    )}
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('cpc')}>
                      <div className="flex items-center justify-end">CPC <KwSortIcon field="cpc" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('ctr')}>
                      <div className="flex items-center justify-end">CTR <KwSortIcon field="ctr" /></div>
                    </th>
                    <th className="group/th px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleKwSort('qualityScore')}>
                      <div className="flex items-center justify-center">QS <KwSortIcon field="qualityScore" /></div>
                    </th>
                    {additionalMetrics.map((metric) => (
                      <th key={metric} className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {metric}
                      </th>
                    ))}
                  </>
                )}

                {/* Ads Tab Headers (Meta Creative Breakdown / Google Ad Asset Breakdown) */}
                {((selectedPlatform === 'meta' && metaViewMode === 'ads') || (selectedPlatform === 'google' && googleViewMode === 'ads')) && (
                  <>
                    {selectedPlatform === 'google' ? (
                      <>
                        <th className="group/th px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('campaignName')}>
                          <div className="flex items-center">Campaign <AdsSortIcon field="campaignName" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Asset</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Group</th>
                        <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('spend')}>
                          <div className="flex items-center justify-end">Spend <AdsSortIcon field="spend" /></div>
                        </th>
                        {businessModel === 'ecommerce' ? (
                          <>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('roas')}>
                              <div className="flex items-center justify-end">Conv. Value <AdsSortIcon field="roas" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('roas')}>
                              <div className="flex items-center justify-end">ROAS <AdsSortIcon field="roas" /></div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Conv.</th>
                          </>
                        ) : (
                          <>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('leads')}>
                              <div className="flex items-center justify-end">Leads <AdsSortIcon field="leads" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('cpl')}>
                              <div className="flex items-center justify-end">CPL <AdsSortIcon field="cpl" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('ql')}>
                              <div className="flex items-center justify-end">QL <AdsSortIcon field="ql" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('cplQ')}>
                              <div className="flex items-center justify-end">CPL-Q <AdsSortIcon field="cplQ" /></div>
                            </th>
                          </>
                        )}
                        <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('ctr')}>
                          <div className="flex items-center justify-end">CTR <AdsSortIcon field="ctr" /></div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Impr. Share</th>
                        {additionalMetrics.map((metric) => (
                          <th key={metric} className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {metric}
                          </th>
                        ))}
                      </>
                    ) : (
                      <>
                        <th className="group/th px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('campaignName')}>
                          <div className="flex items-center">Campaign <AdsSortIcon field="campaignName" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Set</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Creative</th>
                        <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('spend')}>
                          <div className="flex items-center justify-end">Spend <AdsSortIcon field="spend" /></div>
                        </th>
                        {businessModel === 'ecommerce' ? (
                          <>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('roas')}>
                              <div className="flex items-center justify-end">Revenue <AdsSortIcon field="roas" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('roas')}>
                              <div className="flex items-center justify-end">ROAS <AdsSortIcon field="roas" /></div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Purchases</th>
                          </>
                        ) : (
                          <>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('leads')}>
                              <div className="flex items-center justify-end">Leads <AdsSortIcon field="leads" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('cpl')}>
                              <div className="flex items-center justify-end">CPL <AdsSortIcon field="cpl" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('ql')}>
                              <div className="flex items-center justify-end">QL <AdsSortIcon field="ql" /></div>
                            </th>
                            <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('cplQ')}>
                              <div className="flex items-center justify-end">CPL-Q <AdsSortIcon field="cplQ" /></div>
                            </th>
                          </>
                        )}
                        <th className="group/th px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => handleAdsSort('ctr')}>
                          <div className="flex items-center justify-end">CTR <AdsSortIcon field="ctr" /></div>
                        </th>
                        {additionalMetrics.map((metric) => (
                          <th key={metric} className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {metric}
                          </th>
                        ))}
                      </>
                    )}
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Meta Ads - Campaigns View */}
              {selectedPlatform === 'meta' && metaViewMode === 'campaigns' && filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{(campaign.spend / 100000).toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    {businessModel === 'ecommerce'
                      ? `₹${(campaign.revenue / 100000).toFixed(1)}L`
                      : (campaign.leads || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getStatusColor(campaign.status)}`}>
                      {businessModel === 'ecommerce'
                        ? `${campaign.roas.toFixed(2)}x`
                        : `₹${campaign.cpl || 0}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {businessModel === 'ecommerce'
                      ? campaign.orders.toLocaleString()
                      : (campaign.ql || 0).toLocaleString()}
                  </td>
                  {businessModel === 'leadgen' && (
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      ₹{(campaign.cplQ || 0).toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    {campaign.ctr}
                  </td>
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(campaign.id), campaign.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Meta Ads - Ad Sets View */}
              {selectedPlatform === 'meta' && metaViewMode === 'adsets' && (filteredAdGroupsOrSets as AdSetData[]).map((adSet) => (
                <tr
                  key={adSet.id}
                  onClick={() => setSelectedAdSet(adSet)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700">{adSet.campaignName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{adSet.adSetName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {adSet.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{(adSet.spend / 100000).toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    {businessModel === 'ecommerce'
                      ? `₹${(adSet.revenue / 100000).toFixed(1)}L`
                      : (adSet.leads || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getStatusColor(adSet.status)}`}>
                      {businessModel === 'ecommerce'
                        ? `${adSet.roas.toFixed(2)}x`
                        : `₹${adSet.cpl || 0}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {businessModel === 'ecommerce'
                      ? adSet.orders.toLocaleString()
                      : (adSet.ql || 0).toLocaleString()}
                  </td>
                  {businessModel === 'leadgen' && (
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      ₹{(adSet.cplQ || 0).toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    {adSet.ctr}
                  </td>
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(adSet.id), adSet.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Google Ads - Campaigns View */}
              {selectedPlatform === 'google' && googleViewMode === 'campaigns' && filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{(campaign.spend / 100000).toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    {businessModel === 'ecommerce'
                      ? `₹${(campaign.revenue / 100000).toFixed(1)}L`
                      : (campaign.leads || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getStatusColor(campaign.status)}`}>
                      {businessModel === 'ecommerce'
                        ? `${campaign.roas.toFixed(2)}x`
                        : `₹${campaign.cpl || 0}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {businessModel === 'ecommerce'
                      ? campaign.conversions?.toLocaleString()
                      : (campaign.ql || 0).toLocaleString()}
                  </td>
                  {businessModel === 'leadgen' && (
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      ₹{(campaign.cplQ || 0).toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    ₹{campaign.cpc?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    {campaign.ctr}
                  </td>
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(campaign.id), campaign.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Google Ads - Ad Groups View */}
              {selectedPlatform === 'google' && googleViewMode === 'adgroups' && (filteredAdGroupsOrSets as AdGroupData[]).map((adGroup) => (
                <tr
                  key={adGroup.id}
                  onClick={() => setSelectedAdGroup(adGroup)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700">{adGroup.campaignName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{adGroup.adGroupName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{(adGroup.spend / 100000).toFixed(2)}L
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    {businessModel === 'ecommerce'
                      ? `₹${(adGroup.revenue / 100000).toFixed(2)}L`
                      : (adGroup.leads || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getStatusColor(adGroup.status)}`}>
                      {businessModel === 'ecommerce'
                        ? `${adGroup.roas.toFixed(2)}x`
                        : `₹${adGroup.cpl || 0}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {businessModel === 'ecommerce'
                      ? adGroup.conversions.toLocaleString()
                      : (adGroup.ql || 0).toLocaleString()}
                  </td>
                  {businessModel === 'leadgen' && (
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      ₹{(adGroup.cplQ || 0).toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    ₹{adGroup.cpc.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    {adGroup.ctr}
                  </td>
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(adGroup.id), adGroup.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Google Ads - Keywords View */}
              {selectedPlatform === 'google' && googleViewMode === 'keywords' && paginatedKeywords.map((keyword) => (
                <tr
                  key={keyword.id}
                  onClick={() => setSelectedKeyword(keyword)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getMatchTypeBadge(keyword.matchType)}`}>
                      {keyword.matchType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{keyword.campaignName}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{(keyword.spend / 1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getStatusColor(keyword.status)}`}>
                      {businessModel === 'ecommerce'
                        ? `${keyword.roas.toFixed(2)}x`
                        : `₹${keyword.cpl || (keyword.spend / keyword.conversions).toFixed(0)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {businessModel === 'ecommerce'
                      ? keyword.conversions.toLocaleString()
                      : (keyword.ql || 0).toLocaleString()}
                  </td>
                  {businessModel === 'leadgen' && (
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      ₹{(keyword.cplQ || 0).toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    ₹{keyword.cpc.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    {keyword.ctr}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${getQualityScoreColor(keyword.qualityScore)}`}>
                      {keyword.qualityScore}
                    </span>
                  </td>
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(keyword.id), keyword.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Keywords empty state */}
              {selectedPlatform === 'google' && googleViewMode === 'keywords' && filteredSortedKeywords.length === 0 && (
                <tr>
                  <td colSpan={(businessModel === 'leadgen' ? 11 : 9) + additionalMetrics.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-500 font-medium">No keywords match your filters</p>
                      <button
                        onClick={() => {
                          setKwCampaignFilter('all');
                          setKwAdGroupFilter('all');
                          setKwMatchTypeFilter('all');
                          setKwCurrentPage(1);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Ads Tab Rows (Meta Creative Breakdown / Google Ad Asset Breakdown) */}
              {((selectedPlatform === 'meta' && metaViewMode === 'ads') || (selectedPlatform === 'google' && googleViewMode === 'ads')) && paginatedAds.map((creative) => (
                <tr
                  key={creative.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setCreativesDrawerOpen(true);
                    setSelectedCreative(creative);
                  }}
                >
                  {/* Campaign Column */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]" title={creative.campaignName}>
                      {creative.campaignName}
                    </p>
                  </td>

                  {/* Ad Set / Ad Group Column */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[180px]" title={creative.adSetName}>
                      {creative.adSetName}
                    </p>
                  </td>

                  {/* Creative / Ad Asset Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getFormatIconBg(creative.format)}`}>
                        {getFormatIcon(creative.format)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{creative.hook}</p>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getFormatBadgeStyle(creative.format)}`}>
                            {creative.format}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    {'\u20B9'}{(creative.spend / 100000).toFixed(1)}L
                  </td>
                  {businessModel === 'ecommerce' ? (
                    <>
                      <td className="px-4 py-4 text-right text-sm font-medium text-green-600">
                        {'\u20B9'}{(creative.roas * creative.spend / 100000).toFixed(1)}L
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${
                          creative.roas >= 3.5 ? 'text-green-600 bg-green-50' :
                          creative.roas >= 3.0 ? 'text-gray-700 bg-gray-100' :
                          creative.roas >= 2.5 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {creative.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {creative.purchases || Math.round(creative.roas * creative.spend / creative.costPerResult)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {creative.leads}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${
                          creative.cpl <= 300 ? 'text-green-600 bg-green-50' :
                          creative.cpl <= 350 ? 'text-gray-700 bg-gray-100' :
                          creative.cpl <= 400 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {'\u20B9'}{creative.cpl}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {(creative.ql || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-700">
                        ₹{(creative.cplQ || 0).toLocaleString()}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    {(creative.ctr * 100).toFixed(1)}%
                  </td>
                  {selectedPlatform === 'google' && (
                    <td className="px-4 py-4 text-center">
                      {creative.searchImprShare ? (
                        <span className={`text-sm font-medium ${
                          parseFloat(creative.searchImprShare) >= 70 ? 'text-green-600' :
                          parseFloat(creative.searchImprShare) >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {creative.searchImprShare}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                  )}
                  {additionalMetrics.map((metric) => (
                    <td key={metric} className="px-4 py-4 text-right text-sm font-medium text-gray-600">
                      {getAdditionalMetricCellValue(metric, parseInt(creative.id), creative.spend)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty state for filtered ads */}
              {((selectedPlatform === 'meta' && metaViewMode === 'ads') || (selectedPlatform === 'google' && googleViewMode === 'ads')) && filteredSortedAds.length === 0 && (
                <tr>
                  <td colSpan={(selectedPlatform === 'google' ? (businessModel === 'leadgen' ? 11 : 9) : (businessModel === 'leadgen' ? 9 : 7)) + additionalMetrics.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-500 font-medium">No {selectedPlatform === 'google' ? 'assets' : 'creatives'} match your filters</p>
                      <button
                        onClick={() => {
                          setAdsCampaignFilter('all');
                          setAdsAdGroupFilter('all');
                          setAdsFormatFilter('all');
                          setAdsCurrentPage(1);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Keywords Pagination */}
        {selectedPlatform === 'google' && googleViewMode === 'keywords' && kwTotalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {((kwCurrentPage - 1) * kwItemsPerPage) + 1}-{Math.min(kwCurrentPage * kwItemsPerPage, filteredSortedKeywords.length)} of {filteredSortedKeywords.length} keywords
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setKwCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={kwCurrentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: kwTotalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setKwCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    kwCurrentPage === page
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setKwCurrentPage(prev => Math.min(kwTotalPages, prev + 1))}
                disabled={kwCurrentPage === kwTotalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Ads Tab Pagination */}
        {((selectedPlatform === 'meta' && metaViewMode === 'ads') || (selectedPlatform === 'google' && googleViewMode === 'ads')) && adsTotalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {((adsCurrentPage - 1) * adsItemsPerPage) + 1}-{Math.min(adsCurrentPage * adsItemsPerPage, filteredSortedAds.length)} of {filteredSortedAds.length} {selectedPlatform === 'google' ? 'assets' : 'creatives'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAdsCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={adsCurrentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: adsTotalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setAdsCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    adsCurrentPage === page
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setAdsCurrentPage(prev => Math.min(adsTotalPages, prev + 1))}
                disabled={adsCurrentPage === adsTotalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audience Breakdown Table */}
      <AudienceBreakdownTable businessModel={businessModel} platform={selectedPlatform} />

      {/* Campaign Drill-Down Drawer (works for both Meta and Google campaigns) */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedCampaign(null)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white animate-in slide-in-from-right duration-300" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(selectedCampaign.status)}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedCampaign.name}</h2>
                    <p className="text-xs text-gray-500">Detailed performance analysis and demographics</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close campaign details"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {businessModel === 'leadgen' ? (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedCampaign.spend / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Leads</p>
                          <p className="text-xl font-bold text-green-600">{selectedCampaign.leads}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">CPL</p>
                          <p className="text-xl font-bold text-purple-600">₹{selectedCampaign.cpl}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">CTR</p>
                          <p className="text-xl font-bold text-orange-600">{selectedCampaign.ctr || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedCampaign.spend / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Revenue</p>
                          <p className="text-xl font-bold text-green-600">₹{(selectedCampaign.revenue / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">ROAS</p>
                          <p className="text-xl font-bold text-purple-600">{selectedCampaign.roas.toFixed(2)}x</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">{selectedPlatform === 'google' ? 'Conversions' : 'Orders'}</p>
                          <p className="text-xl font-bold text-orange-600">{selectedCampaign.orders || selectedCampaign.conversions}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Impressions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCampaign.impressions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Clicks</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCampaign.clicks}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Avg. CPC</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{selectedCampaign.cpc?.toFixed(2) || (selectedCampaign.spend / parseFloat(String(selectedCampaign.clicks).replace(/[^0-9.]/g, '') || '1')).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Actionable Insights */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Actionable Insights</h3>
                    </div>
                    <div className="space-y-3">
                      {getCampaignInsights(selectedCampaign).map((insight, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            insight.type === 'success'
                              ? 'bg-green-50/50 border-green-500'
                              : insight.type === 'warning'
                              ? 'bg-amber-50/50 border-amber-500'
                              : insight.type === 'danger'
                              ? 'bg-red-50/50 border-red-500'
                              : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demographics Breakdown */}
                  <DemographicsBreakdown
                    data={getCampaignDemographics(selectedCampaign.id)}
                    businessModel={businessModel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Set Drill-Down Drawer (Meta Ads) */}
      {selectedAdSet && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedAdSet(null)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white animate-in slide-in-from-right duration-300" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(selectedAdSet.status)}`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedAdSet.adSetName}</h2>
                    <p className="text-xs text-gray-500">{selectedAdSet.campaignName} • Detailed performance analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAdSet(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close ad set details"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {businessModel === 'leadgen' ? (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedAdSet.spend / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">CPL</p>
                          <p className="text-xl font-bold text-green-600">₹{selectedAdSet.cpl?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">Leads</p>
                          <p className="text-xl font-bold text-purple-600">{selectedAdSet.leads?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">CTR</p>
                          <p className="text-xl font-bold text-orange-600">{selectedAdSet.ctr || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedAdSet.spend / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Revenue</p>
                          <p className="text-xl font-bold text-green-600">₹{(selectedAdSet.revenue / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">ROAS</p>
                          <p className="text-xl font-bold text-purple-600">{selectedAdSet.roas.toFixed(2)}x</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Orders</p>
                          <p className="text-xl font-bold text-orange-600">{selectedAdSet.orders}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Impressions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAdSet.impressions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Clicks</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAdSet.clicks}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Avg. CPC</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{selectedAdSet.cpc?.toFixed(2) || (selectedAdSet.spend / parseFloat(String(selectedAdSet.clicks).replace(/[^0-9.]/g, '') || '1')).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Ad Set Insights */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Ad Set Performance Insights</h3>
                    </div>
                    <div className="space-y-3">
                      {businessModel === 'leadgen' ? (
                        <>
                          <div className="p-4 rounded-lg border-l-4 bg-gray-50 border-gray-400">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              This ad set is performing {selectedAdSet.status === 'excellent' ? 'exceptionally well' : selectedAdSet.status === 'good' ? 'well' : selectedAdSet.status === 'average' ? 'adequately' : 'poorly'} with a ₹{selectedAdSet.cpl?.toLocaleString() || 0} CPL. Target audience: {selectedAdSet.adSetName}.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-green-50/50 border-green-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Generated {selectedAdSet.leads || 0} leads at ₹{selectedAdSet.cpl?.toLocaleString() || 0} CPL with {selectedAdSet.ctr} CTR, indicating {parseFloat(selectedAdSet.ctr) > 3 ? 'strong' : parseFloat(selectedAdSet.ctr) > 2 ? 'moderate' : 'weak'} ad relevance to the target audience.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-lg border-l-4 bg-gray-50 border-gray-400">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              This ad set is performing {selectedAdSet.status === 'excellent' ? 'exceptionally well' : selectedAdSet.status === 'good' ? 'well' : selectedAdSet.status === 'average' ? 'adequately' : 'poorly'} with a {selectedAdSet.roas.toFixed(2)}x ROAS. Target audience: {selectedAdSet.adSetName}.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-green-50/50 border-green-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Generated {selectedAdSet.orders} orders with a CTR of {selectedAdSet.ctr}, indicating {parseFloat(selectedAdSet.ctr) > 3 ? 'strong' : parseFloat(selectedAdSet.ctr) > 2 ? 'moderate' : 'weak'} ad relevance to the target audience.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Audience Demographics */}
                  <DemographicsBreakdown
                    data={{
                      age: businessModel === 'leadgen' ? [
                        { range: '25-34', percentage: 22, spend: 26400, leads: 18, qualified: 12, cpl: 1467, ql: 6, cplQ: 4400 },
                        { range: '35-44', percentage: 42, spend: 50400, leads: 35, qualified: 25, cpl: 1440, ql: 11, cplQ: 4582 },
                        { range: '45-54', percentage: 24, spend: 28800, leads: 20, qualified: 14, cpl: 1440, ql: 6, cplQ: 4800 },
                        { range: '55+', percentage: 12, spend: 14400, leads: 8, qualified: 5, cpl: 1800, ql: 3, cplQ: 4800 },
                      ] : [
                        { range: '18-24', percentage: 15, spend: 18000, revenue: 51000, roas: 2.83, purchases: 265 },
                        { range: '25-34', percentage: 42, spend: 50400, revenue: 142800, roas: 2.83, purchases: 743 },
                        { range: '35-44', percentage: 26, spend: 31200, revenue: 88400, roas: 2.83, purchases: 460 },
                        { range: '45-54', percentage: 12, spend: 14400, revenue: 40800, roas: 2.83, purchases: 212 },
                        { range: '55+', percentage: 5, spend: 6000, revenue: 17000, roas: 2.83, purchases: 88 },
                      ],
                      gender: businessModel === 'leadgen' ? [
                        { type: 'Male', percentage: 68, spend: 81600, leads: 55, qualified: 39, cpl: 1484, ql: 18, cplQ: 4533 },
                        { type: 'Female', percentage: 30, spend: 36000, leads: 24, qualified: 16, cpl: 1500, ql: 8, cplQ: 4500 },
                        { type: 'Other', percentage: 2, spend: 2400, leads: 2, qualified: 1, cpl: 1200, ql: 1, cplQ: 2400 },
                      ] : [
                        { type: 'Female', percentage: 62, spend: 74400, revenue: 210800, roas: 2.83, purchases: 1097 },
                        { type: 'Male', percentage: 36, spend: 43200, revenue: 122400, roas: 2.83, purchases: 637 },
                        { type: 'Other', percentage: 2, spend: 2400, revenue: 6800, roas: 2.83, purchases: 35 },
                      ],
                      region: businessModel === 'leadgen' ? [
                        { name: 'Bangalore', percentage: 38, spend: 45600, leads: 31, qualified: 22, cpl: 1471, ql: 10, cplQ: 4560 },
                        { name: 'Mumbai', percentage: 24, spend: 28800, leads: 19, qualified: 13, cpl: 1516, ql: 6, cplQ: 4800 },
                        { name: 'Delhi NCR', percentage: 20, spend: 24000, leads: 16, qualified: 11, cpl: 1500, ql: 5, cplQ: 4800 },
                        { name: 'Hyderabad', percentage: 10, spend: 12000, leads: 8, qualified: 6, cpl: 1500, ql: 3, cplQ: 4000 },
                        { name: 'Others', percentage: 8, spend: 9600, leads: 7, qualified: 4, cpl: 1371, ql: 2, cplQ: 4800 },
                      ] : [
                        { name: 'Mumbai Metro', percentage: 32, spend: 38400, revenue: 108800, roas: 2.83, purchases: 566 },
                        { name: 'Delhi NCR', percentage: 26, spend: 31200, revenue: 88400, roas: 2.83, purchases: 460 },
                        { name: 'Bangalore', percentage: 20, spend: 24000, revenue: 68000, roas: 2.83, purchases: 354 },
                        { name: 'Hyderabad', percentage: 12, spend: 14400, revenue: 40800, roas: 2.83, purchases: 212 },
                        { name: 'Others', percentage: 10, spend: 12000, revenue: 34000, roas: 2.83, purchases: 177 },
                      ],
                      platform: businessModel === 'leadgen' ? [
                        { type: 'Desktop', percentage: 58, spend: 69600, leads: 47, qualified: 33, cpl: 1481, ql: 15, cplQ: 4640 },
                        { type: 'Mobile', percentage: 35, spend: 42000, leads: 28, qualified: 20, cpl: 1500, ql: 9, cplQ: 4667 },
                        { type: 'Tablet', percentage: 7, spend: 8400, leads: 6, qualified: 3, cpl: 1400, ql: 2, cplQ: 4200 },
                      ] : [
                        { type: 'Mobile', percentage: 71, spend: 85200, revenue: 241400, roas: 2.83, purchases: 1257 },
                        { type: 'Desktop', percentage: 25, spend: 30000, revenue: 85000, roas: 2.83, purchases: 442 },
                        { type: 'Tablet', percentage: 4, spend: 4800, revenue: 13600, roas: 2.83, purchases: 71 },
                      ],
                    }}
                    businessModel={businessModel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Group Drill-Down Drawer (Google Ads) */}
      {selectedAdGroup && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedAdGroup(null)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white animate-in slide-in-from-right duration-300" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(selectedAdGroup.status)}`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedAdGroup.adGroupName}</h2>
                    <p className="text-xs text-gray-500">{selectedAdGroup.campaignName} • Detailed performance analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAdGroup(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close ad group details"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {businessModel === 'leadgen' ? (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedAdGroup.spend / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">CPL</p>
                          <p className="text-xl font-bold text-green-600">₹{selectedAdGroup.cpl?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">Leads</p>
                          <p className="text-xl font-bold text-purple-600">{selectedAdGroup.leads?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">CTR</p>
                          <p className="text-xl font-bold text-orange-600">{selectedAdGroup.ctr || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Spend</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedAdGroup.spend / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Revenue</p>
                          <p className="text-xl font-bold text-green-600">₹{(selectedAdGroup.revenue / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">ROAS</p>
                          <p className="text-xl font-bold text-purple-600">{selectedAdGroup.roas.toFixed(2)}x</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Conversions</p>
                          <p className="text-xl font-bold text-orange-600">{selectedAdGroup.conversions}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Impressions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAdGroup.impressions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Clicks</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAdGroup.clicks}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Conv. Rate</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAdGroup.cvr?.toFixed(1) || ((selectedAdGroup.conversions / parseFloat(String(selectedAdGroup.clicks).replace(/[^0-9.]/g, '') || '1')) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Avg. CPC</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{selectedAdGroup.cpc.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Ad Group Insights */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Ad Group Performance Insights</h3>
                    </div>
                    <div className="space-y-3">
                      {businessModel === 'leadgen' ? (
                        <>
                          <div className={`p-4 rounded-lg border-l-4 ${
                            selectedAdGroup.status === 'excellent' ? 'bg-green-50/50 border-green-500' :
                            selectedAdGroup.status === 'good' ? 'bg-gray-50 border-gray-400' :
                            selectedAdGroup.status === 'average' ? 'bg-amber-50/50 border-amber-500' :
                            'bg-red-50/50 border-red-500'
                          }`}>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              This ad group is generating {selectedAdGroup.leads || 0} leads at ₹{selectedAdGroup.cpl?.toLocaleString() || 0} CPL with {selectedAdGroup.ctr} CTR and a conversion rate of {selectedAdGroup.cvr?.toFixed(1) || 0}% at an average CPC of ₹{selectedAdGroup.cpc.toFixed(2)}.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-gray-50 border-gray-400">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              CTR of {selectedAdGroup.ctr} indicates {parseFloat(selectedAdGroup.ctr) > 3 ? 'excellent' : parseFloat(selectedAdGroup.ctr) > 2 ? 'good' : 'moderate'} keyword and ad relevance. Lead conversion rate of {selectedAdGroup.cvr?.toFixed(1)}% from {selectedAdGroup.clicks} clicks.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-purple-50/50 border-purple-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedAdGroup.status === 'excellent' ? 'Maintain current strategy and consider scaling budget for this high-performing ad group.' : 
                               selectedAdGroup.status === 'good' ? 'Test additional keywords and refine landing pages to improve CTR and conversion rate further.' :
                               selectedAdGroup.status === 'average' ? 'Review keyword quality scores, ad copy relevance, and lead form friction.' :
                               'Consider pausing low-performing keywords and optimizing lead capture forms.'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`p-4 rounded-lg border-l-4 ${
                            selectedAdGroup.status === 'excellent' ? 'bg-green-50/50 border-green-500' :
                            selectedAdGroup.status === 'good' ? 'bg-gray-50 border-gray-400' :
                            selectedAdGroup.status === 'average' ? 'bg-amber-50/50 border-amber-500' :
                            'bg-red-50/50 border-red-500'
                          }`}>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {/* We're in the ecommerce branch; businessModel is narrowed to 'ecommerce'. */}
                              {`This ad group is delivering a ${selectedAdGroup.roas.toFixed(2)}x ROAS with ${selectedAdGroup.conversions} conversions at an average CPC of ₹${selectedAdGroup.cpc.toFixed(2)}.`}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-brand-light border-brand">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              CTR of {selectedAdGroup.ctr} indicates {parseFloat(selectedAdGroup.ctr) > 3 ? 'excellent' : parseFloat(selectedAdGroup.ctr) > 2 ? 'good' : 'moderate'} keyword and ad relevance. {selectedAdGroup.conversions} conversions generated from {selectedAdGroup.clicks} clicks.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border-l-4 bg-purple-50/50 border-purple-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedAdGroup.status === 'excellent' ? 'Maintain current strategy and consider scaling budget.' : 
                               selectedAdGroup.status === 'good' ? 'Test additional keywords to improve performance further.' :
                               selectedAdGroup.status === 'average' ? 'Review keyword quality scores and ad copy relevance.' :
                               'Consider pausing low-performing keywords and optimizing ad copy.'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Keywords in this Ad Group */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-brand" />
                      <h3 className="text-sm font-semibold text-gray-900">Top Keywords in this Ad Group</h3>
                    </div>
                    <div className="space-y-2">
                      {googleKeywordData
                        .filter(kw => kw.adGroupName === selectedAdGroup.adGroupName)
                        .slice(0, 5)
                        .map((keyword, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <Search className="w-4 h-4 text-purple-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{keyword.keyword}</p>
                                <p className="text-xs text-gray-500">{keyword.matchType} Match</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {businessModel === 'leadgen' ? (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">CPL</p>
                                  <p className="text-sm font-semibold text-gray-900">₹{keyword.cpl?.toLocaleString() || '-'}</p>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">ROAS</p>
                                  <p className="text-sm font-semibold text-gray-900">{keyword.roas.toFixed(2)}x</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Search Terms Analysis */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <PieChart className="w-5 h-5 text-brand" />
                      <h3 className="text-sm font-semibold text-gray-900">Search Terms Performance</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-gray-600 mb-2">Exact Match Performance</p>
                        <p className="text-lg font-bold text-green-700">High</p>
                        <p className="text-xs text-gray-500 mt-1">75% conversion rate</p>
                      </div>
                      <div className="p-4 bg-brand-light rounded-xl border border-brand/10">
                        <p className="text-xs text-gray-600 mb-2">Phrase Match Performance</p>
                        <p className="text-lg font-bold text-brand">Good</p>
                        <p className="text-xs text-gray-500 mt-1">62% conversion rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Drill-Down Drawer (Google Ads) */}
      {selectedKeyword && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedKeyword(null)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white animate-in slide-in-from-right duration-300" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-purple-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedKeyword.keyword}</h2>
                    <p className="text-xs text-gray-500">{selectedKeyword.adGroupName} • {selectedKeyword.campaignName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close keyword details"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-brand-light rounded-xl border border-brand/10">
                      <p className="text-xs text-gray-600 mb-1">Spend</p>
                      <p className="text-xl font-bold text-gray-900">₹{(selectedKeyword.spend / 1000).toFixed(0)}K</p>
                    </div>
                    {businessModel === 'leadgen' ? (
                      <>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Leads</p>
                          <p className="text-xl font-bold text-green-600">{selectedKeyword.conversions}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">CPL</p>
                          <p className="text-xl font-bold text-purple-600">₹{(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Revenue</p>
                          <p className="text-xl font-bold text-green-600">₹{(selectedKeyword.revenue / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">ROAS</p>
                          <p className="text-xl font-bold text-purple-600">{selectedKeyword.roas.toFixed(2)}x</p>
                        </div>
                      </>
                    )}
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <p className="text-xs text-gray-600 mb-1">Conv.</p>
                      <p className="text-xl font-bold text-orange-600">{selectedKeyword.conversions}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Impressions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedKeyword.impressions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Clicks</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedKeyword.clicks}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">{businessModel === 'leadgen' ? 'Leads' : 'Conversions'}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedKeyword.conversions}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">{businessModel === 'leadgen' ? 'Cost/Lead' : 'Cost/Conv.'}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Keyword Performance Insights */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-brand" />
                      <h3 className="text-sm font-semibold text-gray-900">Keyword Performance Insights</h3>
                    </div>
                    <div className="space-y-3">
                      <div className={`p-4 rounded-lg border-l-4 ${
                        selectedKeyword.status === 'excellent' ? 'bg-green-50/50 border-green-500' :
                        selectedKeyword.status === 'good' ? 'bg-brand-light border-brand' :
                        selectedKeyword.status === 'average' ? 'bg-amber-50/50 border-amber-500' :
                        'bg-red-50/50 border-red-500'
                      }`}>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>Performance Status:</strong> {
                            businessModel === 'leadgen' ? (
                              selectedKeyword.status === 'excellent' ? `Outstanding ₹${(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)} CPL with ${selectedKeyword.conversions} leads. Scale this keyword by increasing bids by 20-30%.` :
                              selectedKeyword.status === 'good' ? `Solid ₹${(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)} CPL. Consider testing broader match types to expand reach.` :
                              selectedKeyword.status === 'average' ? `Above target CPL at ₹${(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)}. Review and optimize ad copy and landing pages.` :
                              `High CPL at ₹${(selectedKeyword.spend / selectedKeyword.conversions).toFixed(0)}. Consider pausing or reducing bids significantly.`
                            ) : (
                              selectedKeyword.status === 'excellent' ? `Outstanding ${selectedKeyword.roas.toFixed(2)}x ROAS with ${selectedKeyword.conversions} conversions. Scale this keyword by increasing bids by 20-30%.` :
                              selectedKeyword.status === 'good' ? `Solid ${selectedKeyword.roas.toFixed(2)}x ROAS. Consider testing broader match types to expand reach.` :
                              selectedKeyword.status === 'average' ? `Below target ROAS at ${selectedKeyword.roas.toFixed(2)}x. Review and optimize ad copy and landing pages.` :
                              `Poor performance at ${selectedKeyword.roas.toFixed(2)}x ROAS. Consider pausing or reducing bids significantly.`
                            )
                          }
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border-l-4 bg-purple-50/50 border-purple-500">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>Cost Efficiency:</strong> CPC of ₹{selectedKeyword.cpc.toFixed(2)} with {selectedKeyword.ctr} CTR. {
                            parseFloat(selectedKeyword.ctr) > 3 ? 'High CTR indicates strong keyword-ad-landing page alignment.' :
                            parseFloat(selectedKeyword.ctr) > 2 ? 'Moderate CTR. Test different ad copy variations to improve click-through rate.' :
                            'Low CTR suggests poor keyword-ad relevance. Review search terms and refine targeting.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Keyword Details */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-purple-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Keyword Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-xs text-gray-600 mb-2">Match Type</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getMatchTypeBadge(selectedKeyword.matchType)}`}>
                          {selectedKeyword.matchType}
                        </span>
                      </div>
                      <div className="p-4 bg-brand-light rounded-xl border border-brand/10">
                        <p className="text-xs text-gray-600 mb-2">Average CPC</p>
                        <p className="text-lg font-bold text-gray-900">₹{selectedKeyword.cpc.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-gray-600 mb-2">Click-Through Rate</p>
                        <p className="text-lg font-bold text-gray-900">{selectedKeyword.ctr}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <p className="text-xs text-gray-600 mb-2">Conversion Rate</p>
                        <p className="text-lg font-bold text-gray-900">
                          {((selectedKeyword.conversions / parseInt(selectedKeyword.clicks.replace('K', '000'))) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Search Terms for this Keyword */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-purple-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Top Search Terms</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { term: selectedKeyword.keyword, impressions: '45%', conversions: '52%', status: 'excellent' },
                        { term: selectedKeyword.keyword.replace(/[\[\]"]/g, '') + ' online', impressions: '28%', conversions: '31%', status: 'good' },
                        { term: selectedKeyword.keyword.replace(/[\[\]"]/g, '') + ' buy', impressions: '18%', conversions: '12%', status: 'average' },
                        { term: selectedKeyword.keyword.replace(/[\[\]"]/g, '') + ' price', impressions: '9%', conversions: '5%', status: 'average' }
                      ].map((searchTerm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <Search className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{searchTerm.term}</p>
                              <p className="text-xs text-gray-500">{searchTerm.impressions} of impressions</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Conv. Share</p>
                              <p className="text-sm font-semibold text-gray-900">{searchTerm.conversions}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(searchTerm.status)}`}>
                              {searchTerm.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Recommendations */}
                  <div className="bg-brand-light rounded-xl border border-brand/20 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-brand" />
                      <h3 className="text-sm font-semibold text-gray-900">Optimization Recommendations</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                        <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Add Negative Keywords</p>
                          <p className="text-xs text-gray-600">Review search terms report and add irrelevant terms as negative keywords to improve CTR and reduce wasted spend.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                        <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Test Ad Variations</p>
                          <p className="text-xs text-gray-600">Create 2-3 ad variations with different headlines focusing on your unique value proposition to improve CTR.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                        <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Landing Page Optimization</p>
                          <p className="text-xs text-gray-600">Ensure landing page content matches keyword intent. Add trust signals and clear CTAs to improve quality score and conversion rate.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creatives Drawer (for Ads tab drill-down) */}
      {creativesDrawerOpen && selectedCreative && (
        <CreativesDrawer
          isOpen={creativesDrawerOpen}
          onClose={() => { setCreativesDrawerOpen(false); setSelectedCreative(null); }}
          selectedCreative={selectedCreative}
          businessModel={businessModel}
        />
      )}
    </div>
  );
}
