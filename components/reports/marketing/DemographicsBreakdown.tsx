'use client';

import { useState } from 'react';
import { ChevronDown, Users, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import { ChartContainer, type ChartConfig } from '../../ui/chart';

// ── Colors ──
const PALETTES = {
  age: ['#204CC7', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
  gender: ['#8b5cf6', '#204CC7', '#94a3b8'],
  region: ['#14b8a6', '#204CC7', '#6366f1', '#a855f7', '#ec4899', '#f97316'],
  device: ['#f97316', '#204CC7', '#94a3b8'],
  placement: ['#204CC7', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#64748b'],
  jobTitle: ['#204CC7', '#6366f1', '#a855f7', '#ec4899'],
};

type DemoMetric = 'impressions' | 'clicks' | 'avgCpc';

const METRIC_OPTIONS: { value: DemoMetric; label: string }[] = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'avgCpc', label: 'Avg. CPC' },
];

// ── Formatting helpers ──
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

function fmtCurr(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_000).toFixed(1)}K`;
  if (n >= 100) return `₹${n.toFixed(0)}`;
  return `₹${n.toFixed(2)}`;
}

// ── Normalize raw segment data into a consistent shape ──
interface NormalizedSegment {
  label: string;
  impressions: number;
  clicks: number;
  avgCpc: number;
  spend: number;
  revenue?: number;
  roas?: number;
  purchases?: number;
  leads?: number;
  qualified?: number;
  cpl?: number;
  percentage: number;
}

function normalizeSegments(raw: any[], totalSpend: number): NormalizedSegment[] {
  return raw.map((item) => {
    const label = item.label || item.range || item.type || item.name || item.title || item.age || item.gender || item.device || item.location || 'Unknown';
    const pct = item.percentage || 0;
    const spend = item.spend || (totalSpend * pct / 100);

    // Derive impressions/clicks/cpc from spend and percentage using realistic multipliers
    const impressions = item.impressions || Math.round(spend * 12 + pct * 800);
    const clicks = item.clicks || Math.round(spend * 0.15 + pct * 20);
    const avgCpc = clicks > 0 ? spend / clicks : 0;

    return {
      label,
      impressions,
      clicks,
      avgCpc,
      spend,
      percentage: pct,
      revenue: item.revenue,
      roas: item.roas,
      purchases: item.purchases,
      leads: item.leads,
      qualified: item.qualified,
      cpl: item.cpl,
    };
  });
}

// ── Props ──
export interface DemographicsBreakdownProps {
  data: {
    age: any[];
    gender: any[];
    region: any[];
    platform: any[];
    placement?: any[];
    jobTitle?: any[];
  };
  businessModel?: 'ecommerce' | 'leadgen';
}

// ── Active shape renderer ──
const activeShapeRenderer = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 5}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} />
    </g>
  );
};

// ── Pie Section ──
function DemoPieSection({
  title, data, selectedMetric, businessModel, colors,
}: {
  title: string;
  data: NormalizedSegment[];
  selectedMetric: DemoMetric;
  businessModel: 'ecommerce' | 'leadgen';
  colors: string[];
}) {
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

  const total = data.reduce((s, d) => s + (d[selectedMetric] || 0), 0);

  const chartData = data.map((d, i) => ({
    ...d,
    value: selectedMetric === 'avgCpc' ? d.clicks : d[selectedMetric],
    pct: total > 0 ? ((d[selectedMetric] || 0) / total) * 100 : 0,
    fill: colors[i % colors.length],
  }));

  const cfg: ChartConfig = {};
  data.forEach((d, i) => { cfg[d.label] = { label: d.label, color: colors[i % colors.length] }; });

  const topSeg = [...chartData].sort((a, b) => (b[selectedMetric] || 0) - (a[selectedMetric] || 0))[0];

  return (
    <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100">
      <p className="text-[13px] text-gray-500 uppercase tracking-wider mb-0.5" style={{ fontWeight: 600 }}>{title}</p>
      {topSeg && (
        <p className="text-[13px] text-gray-400 mb-3">
          <span style={{ fontWeight: 500 }}>{topSeg.label}</span> leads at {topSeg.pct.toFixed(0)}%
        </p>
      )}

      <div className="flex items-center gap-2">
        {/* Pie */}
        <div className="flex-shrink-0">
          <ChartContainer config={cfg} className="w-[126px] h-[126px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={54}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
                activeIndex={activeIdx}
                activeShape={activeShapeRenderer}
                onMouseEnter={(_: any, i: number) => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(undefined)}
                strokeWidth={0}
              >
                {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        {/* Legend — vertically centered */}
        <div className="flex-1 flex flex-col justify-center space-y-0.5 min-w-0">
          {chartData.map((item, idx) => {
            const dv = selectedMetric === 'avgCpc' ? fmtCurr(item.avgCpc) : fmt(item[selectedMetric]);
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 rounded-md px-1.5 py-[5px] transition-colors cursor-default ${activeIdx === idx ? 'bg-gray-100' : 'hover:bg-gray-100/60'}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(undefined)}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-[13px] text-gray-700 truncate flex-1" style={{ fontWeight: 500 }}>{item.label}</span>
                <span className="text-[13px] text-gray-900 flex-shrink-0 tabular-nums" style={{ fontWeight: 600 }}>{dv}</span>
                <span className="text-[10px] text-gray-400 flex-shrink-0 w-8 text-right tabular-nums" style={{ fontWeight: 500 }}>{item.pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export function DemographicsBreakdown({ data, businessModel = 'ecommerce' }: DemographicsBreakdownProps) {
  const [selectedMetric, setSelectedMetric] = useState<DemoMetric>('impressions');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentLabel = METRIC_OPTIONS.find(m => m.value === selectedMetric)?.label || 'Impressions';

  // Estimate total spend from age data
  const totalSpend = data.age.reduce((s: number, d: any) => s + (d.spend || 0), 0) || 240000;

  // Normalize all sections
  const age = normalizeSegments(data.age, totalSpend);
  const gender = normalizeSegments(data.gender, totalSpend);
  const region = normalizeSegments(data.region, totalSpend);
  const device = normalizeSegments(data.platform, totalSpend);
  const placement = data.placement ? normalizeSegments(data.placement, totalSpend) : null;
  const jobTitle = data.jobTitle ? normalizeSegments(data.jobTitle, totalSpend) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-[18px] h-[18px] text-brand" />
          <h3 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Demographics Breakdown</h3>
        </div>

        {/* Metric Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[13px] text-gray-700"
            style={{ fontWeight: 500 }}
          >
            <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
            {currentLabel}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-40 w-40 bg-white rounded-lg border border-gray-200 shadow-dropdown py-1">
                {METRIC_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedMetric(opt.value); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${
                      selectedMetric === opt.value ? 'bg-brand-light text-brand' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{ fontWeight: selectedMetric === opt.value ? 600 : 400 }}
                  >
                    {opt.label}
                    {selectedMetric === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2×2 Pie Grid */}
      <div className="grid grid-cols-2 gap-3">
        <DemoPieSection title="Age Distribution" data={age} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.age} />
        <DemoPieSection title="Gender Distribution" data={gender} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.gender} />
        <DemoPieSection title="Top Regions" data={region} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.region} />
        <DemoPieSection title="Device Distribution" data={device} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.device} />
        {/* Placement */}
        {placement && placement.length > 0 && (
          <DemoPieSection title="Platform Placement" data={placement} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.placement} />
        )}
        {/* Job Title (leadgen) */}
        {businessModel === 'leadgen' && jobTitle && jobTitle.length > 0 && (
          <DemoPieSection title="Decision-Maker Titles" data={jobTitle} selectedMetric={selectedMetric} businessModel={businessModel} colors={PALETTES.jobTitle} />
        )}
      </div>
    </div>
  );
}