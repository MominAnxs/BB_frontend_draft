'use client';

import { 
  TrendingUp, 
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Store,
  Package,
  X,
  ArrowRight,
  MapPin,
  IndianRupee,
  TrendingDown,
  Percent
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ChannelSalesDrawer, ProductProfitabilityDrawer } from './SalesModuleDrawers';
import { ServiceProjectDrawer } from './ServiceProjectDrawer';

interface SalesModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function SalesModule({ diagnosticData, onAskBregoGPT }: SalesModuleProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<null | 'gmv' | 'growth' | 'channel' | 'products'>(null);

  const businessType = diagnosticData?.businessType;
  const isServiceBusiness = businessType === 'Trading, Manufacturing or Services';

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Sub-header */}
      <div className="subheader-glass sticky top-0 z-20 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 600 }}>
              {isServiceBusiness ? 'Revenue' : 'Sales'}
            </h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>Last updated: Jan 8, 2026</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onAskBregoGPT} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[14px] hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40" style={{ fontWeight: 500 }}>
              <Sparkles className="w-4 h-4" />
              <span>Ask BregoGPT</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              <Calendar className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-[14px]" style={{ fontWeight: 500 }}>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontWeight: 500 }}
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="sales-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <div id="sales-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                  <button onClick={() => setShowExportMenu(false)} className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2" role="menuitem">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button onClick={() => setShowExportMenu(false)} className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2" role="menuitem">
                    <Download className="w-4 h-4" />
                    Export Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isServiceBusiness ? (
              <>
                <RevenueBreakdownCard />
                <RevenueGrowthCard />
                <ClientRevenueCard onDrillDown={() => setOpenDrawer('channel')} />
                <ProjectProfitabilityCard onDrillDown={() => setOpenDrawer('products')} />
              </>
            ) : (
              <>
                <GMVBreakdownCard />
                <SalesGrowthCard />
                <ChannelSalesCard onDrillDown={() => setOpenDrawer('channel')} />
                <TopProductsCard onDrillDown={() => setOpenDrawer('products')} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawers */}
      {openDrawer === 'channel' && <ChannelSalesDrawer onClose={() => setOpenDrawer(null)} isServiceBusiness={isServiceBusiness} />}
      {openDrawer === 'products' && !isServiceBusiness && <ProductProfitabilityDrawer onClose={() => setOpenDrawer(null)} />}
      {openDrawer === 'products' && isServiceBusiness && <ServiceProjectDrawer onClose={() => setOpenDrawer(null)} />}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function TooltipIcon({ content }: { content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
        <HelpCircle className="w-[18px] h-[18px]" />
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white text-[13px] p-4 rounded-xl z-[9999] pointer-events-none leading-relaxed" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <div className="absolute right-3 bottom-full w-2 h-2 bg-gray-900 rotate-45 mb-1"></div>
        </div>
      )}
    </div>
  );
}

function DateFilter({ value, onChange, options }: { value: string; onChange: (val: string) => void; options: string[] }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }} aria-expanded={showMenu} aria-label="Date filter">
        <Calendar className="w-3.5 h-3.5" />
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
          {options.map((option) => (
            <button key={option} onClick={() => { onChange(option); setShowMenu(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors ${value === option ? 'text-brand bg-brand-light' : 'text-gray-700'}`}
              style={{ fontWeight: value === option ? 500 : 400 }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Revenue Flow Row (shared by GMV & Revenue Breakdown) ───────────────────
function RevenueFlowRow({ icon, iconBg, label, value, badge, badgeColor }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  badge?: string; badgeColor?: string;
}) {
  // Flat pale fills — no gradients, no opacity modifiers. The earlier
  // `from-brand-light to-brand-light/50` rendered as heavy 50%-blue whenever
  // the stylesheet still pointed `brand-light` at an rgba token (stale build
  // cache). Flat hex-backed `bg-brand-light` is cache-safe.
  const bgMap: Record<string, string> = {
    brand: 'bg-brand-light border-brand/15',
    red: 'bg-red-50 border-red-200/40',
    gray: 'bg-gray-50 border-gray-200/40',
    green: 'bg-green-50 border-green-200/40',
  };
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${bgMap[iconBg] || bgMap.gray}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{label}</div>
          <div className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>{value}</div>
        </div>
      </div>
      {badge && (
        <div className={`text-[13px] px-2 py-0.5 rounded-full ${badgeColor || 'text-gray-600 bg-gray-100'}`} style={{ fontWeight: 500 }}>{badge}</div>
      )}
    </div>
  );
}

function FlowConnector() {
  return <div className="flex justify-center"><div className="h-2 w-px bg-gray-300" /></div>;
}

// ─── Insights + Drill Down (shared) ────────────────────────────────────────
function InsightsSection({ insights, showInsights, setShowInsights }: { insights: React.ReactNode[]; showInsights: boolean; setShowInsights: (v: boolean) => void }) {
  return (
    <div className="mt-4 space-y-3">
      <button onClick={() => setShowInsights(!showInsights)} className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors" aria-expanded={showInsights}>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
      </button>
      {showInsights && (
        <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrillDownButton({ onClick, label = 'Drill Down' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
      <ArrowRight className="w-4 h-4 text-brand" />
      <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>{label}</span>
    </button>
  );
}

// ─── 1. GMV Breakdown Card (E-commerce) ─────────────────────────────────────
function GMVBreakdownCard() {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const gmv = 52.80;
  const gst = 7.92;
  const nmv = gmv - gst;
  const discount = 5.38;
  const netSales = nmv - discount;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>GMV Breakdown</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>What is GMV Breakdown?</strong><br/><br/>GMV (Gross Merchandise Value) is the total sales value before any deductions.<br/><br/>• <strong>GMV:</strong> Total value of all sales<br/>• <strong>Tax (GST):</strong> Government tax collected<br/>• <strong>NMV:</strong> Net value after removing taxes<br/>• <strong>Discounts:</strong> Price reductions offered<br/>• <strong>Net Sales:</strong> Final revenue you keep" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Revenue Flow</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>}
            iconBg="brand" label="Gross Merchandise Value" value={`₹${gmv.toFixed(2)}L`} badge="Total Sales" badgeColor="text-brand-dark bg-brand-light"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>−</span></div>}
            iconBg="red" label="Tax (GST)" value={`₹${gst.toFixed(2)}L`} badge="15% of GMV" badgeColor="text-red-700"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>=</span></div>}
            iconBg="gray" label="Net Merchandise Value" value={`₹${nmv.toFixed(2)}L`} badge="After Tax" badgeColor="text-gray-600"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>−</span></div>}
            iconBg="red" label="Discounts" value={`₹${discount.toFixed(2)}L`} badge="12% of NMV" badgeColor="text-red-700"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
            iconBg="green" label="NET SALES" value={`₹${netSales.toFixed(2)}L`} badge="Final Revenue" badgeColor="text-green-700 bg-green-100"
          />
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <>Your <span style={{ fontWeight: 600 }}>discount rate of 12%</span> is within healthy range. Consider A/B testing to find the optimal discount level.</>,
          <><span style={{ fontWeight: 600 }}>Net Sales conversion is 74.8%</span> from GMV. This indicates efficient tax and discount management.</>
        ]} />
      </div>
    </div>
  );
}

// ─── 2. Sales Growth Card (E-commerce) ──────────────────────────────────────
function SalesGrowthCard() {
  const [fiscalYearFilter, setFiscalYearFilter] = useState('This Fiscal Year');
  const [showInsights, setShowInsights] = useState(false);
  
  const data = [
    { month: 'May', thisYear: 12.4, lastYear: 10.5 },
    { month: 'Jun', thisYear: 13.2, lastYear: 11.0 },
    { month: 'Jul', thisYear: 14.8, lastYear: 12.2 },
    { month: 'Aug', thisYear: 15.6, lastYear: 13.1 },
    { month: 'Sep', thisYear: 16.9, lastYear: 14.5 },
    { month: 'Oct', thisYear: 18.2, lastYear: 15.8 },
    { month: 'Nov', thisYear: 19.5, lastYear: 17.2 },
    { month: 'Dec', thisYear: 21.0, lastYear: 18.6 },
    { month: 'Jan', thisYear: 22.8, lastYear: 19.8 },
    { month: 'Feb', thisYear: 23.5, lastYear: 20.5 },
    { month: 'Mar', thisYear: 26.3, lastYear: 22.1 }
  ];

  const thisYearTotal = 193.5;
  const lastYearTotal = 223.8;
  const growthRate = 15.7;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 600 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[13px]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500">{entry.name}:</span>
              <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{entry.value.toFixed(1)}L</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Sales Growth Trend</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Sales Growth Trend</strong><br/><br/>Compares your sales this year vs last year, month by month.<br/><br/>• <strong>Gray Bars:</strong> Last year's sales<br/>• <strong>Blue Bars:</strong> This year's performance" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Year-over-Year Comparison</span>
          <DateFilter value={fiscalYearFilter} onChange={setFiscalYearFilter} options={['This Fiscal Year', 'Last Fiscal Year', 'Last 6 Months', 'Last 12 Months']} />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full" style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height={220} minWidth={0}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value}L`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar key="bar-lastYear" dataKey="lastYear" name="Last Year" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar key="bar-thisYear" dataKey="thisYear" name="This Year" fill="#204CC7" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-5 pt-3 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#cbd5e1]" />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Last Year</span>
              <span className="text-[13px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{lastYearTotal}L</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#204CC7]" />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>This Year</span>
              <span className="text-[13px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{thisYearTotal}L</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[13px] text-green-600" style={{ fontWeight: 600 }}>+{growthRate}% YoY</span>
            </div>
          </div>
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Consistent growth of {growthRate}%</span> year-over-year shows strong business momentum.</>,
          <>Peak months (Dec-Mar) show <span style={{ fontWeight: 600 }}>strongest performance</span>. Plan inventory accordingly.</>
        ]} />
      </div>
    </div>
  );
}

// ─── 3. Channel Sales Card (E-commerce) ─────────────────────────────────────
function ChannelSalesCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const data = [
    { channel: 'Online', sales: 15.2, color: '#204CC7' },
    { channel: 'Offline', sales: 10.8, color: '#4A6FD9' },
    { channel: 'B2B', sales: 7.5, color: '#7A96E4' },
    { channel: 'B2C', sales: 5.9, color: '#A3B8ED' }
  ];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>{payload[0].payload.channel}</p>
          <div className="flex items-center gap-2 text-[13px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
            <span className="text-gray-500">Sales:</span>
            <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{payload[0].value}L</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">{((payload[0].value / totalSales) * 100).toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Channel-wise Sales</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Channel-wise Sales</strong><br/><br/>How sales distribute across channels.<br/><br/>• <strong>Online:</strong> E-commerce website<br/>• <strong>Offline:</strong> Physical stores<br/>• <strong>B2B:</strong> Business orders<br/>• <strong>B2C:</strong> Direct consumer" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Sales by Distribution Channel</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value}L`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-2 pt-3 border-t border-gray-100">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{item.channel}</span>
              <span className="text-[13px] text-gray-900 ml-auto tabular-nums" style={{ fontWeight: 700 }}>₹{item.sales}L</span>
            </div>
          ))}
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Online channel dominates</span> with 38.8% of total sales (₹15.2L). Continue investing in digital marketing.</>,
          <>Consider an <span style={{ fontWeight: 600 }}>omnichannel strategy</span> to bridge online and offline experiences.</>
        ]} />

        <DrillDownButton onClick={onDrillDown} />
      </div>
    </div>
  );
}

// ─── 4. Top Products Card (E-commerce) ──────────────────────────────────────
function TopProductsCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const data = [
    { product: 'Premium Widget Pro', sales: 12.5, growth: '+18%', color: '#204CC7' },
    { product: 'Essential Kit Bundle', sales: 9.8, growth: '+12%', color: '#3A5FD4' },
    { product: 'Starter Package', sales: 7.2, growth: '+8%', color: '#5A7ADF' },
    { product: 'Enterprise Solution', sales: 5.4, growth: '+22%', color: '#7A96E4' },
    { product: 'Deluxe Edition', sales: 4.6, growth: '+15%', color: '#9AB2EE' }
  ];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Top Products</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Top Products</strong><br/><br/>Your best-selling products ranked by revenue.<br/><br/>• <strong>Rankings:</strong> Ordered by total sales<br/>• <strong>Growth %:</strong> Performance vs previous period" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Best Performing Products</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {data.map((product, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[13px] text-gray-600" style={{ fontWeight: 600 }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-gray-900" style={{ fontWeight: 500 }}>{product.product}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-green-600" style={{ fontWeight: 600 }}>{product.growth}</span>
                  <span className="text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{product.sales}L</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(product.sales / data[0].sales) * 100}%`, backgroundColor: product.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Total from Top 5</span>
          <span className="text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{totalSales.toFixed(1)}L</span>
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Premium Widget Pro</span> is your cash cow at ₹12.5L. Ensure inventory levels meet demand.</>,
          <>Enterprise Solution shows <span style={{ fontWeight: 600 }}>highest growth (+22%)</span>. Increase marketing focus.</>
        ]} />

        <DrillDownButton onClick={onDrillDown} />
      </div>
    </div>
  );
}

// ─── 5. Revenue Breakdown Card (Service) ────────────────────────────────────
function RevenueBreakdownCard() {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const totalBilled = 64.80;
  const gst = 9.72;
  const nmv = totalBilled - gst;
  const writeOffs = 2.15;
  const netRevenue = nmv - writeOffs;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Revenue Breakdown</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Revenue Breakdown</strong><br/><br/>Revenue flow from total billing to recognized revenue.<br/><br/>• <strong>Total Billed:</strong> Client invoices<br/>• <strong>GST:</strong> Tax collected<br/>• <strong>Write-offs:</strong> Bad debts<br/>• <strong>Net Revenue:</strong> Final recognized revenue" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Revenue Flow</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center"><IndianRupee className="w-4 h-4 text-white" /></div>}
            iconBg="brand" label="Total Billed" value={`₹${totalBilled.toFixed(2)}L`} badge="Client Invoices" badgeColor="text-brand-dark bg-brand-light"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>−</span></div>}
            iconBg="red" label="GST" value={`₹${gst.toFixed(2)}L`} badge="15% of Billing" badgeColor="text-red-700"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>=</span></div>}
            iconBg="gray" label="Net Merchandise Value" value={`₹${nmv.toFixed(2)}L`} badge="After GST" badgeColor="text-gray-600"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"><span className="text-white text-[15px]" style={{ fontWeight: 700 }}>−</span></div>}
            iconBg="red" label="Write-offs" value={`₹${writeOffs.toFixed(2)}L`} badge="3.9% Bad Debt" badgeColor="text-red-700"
          />
          <FlowConnector />
          <RevenueFlowRow
            icon={<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
            iconBg="green" label="NET REVENUE" value={`₹${netRevenue.toFixed(2)}L`} badge="Recognized" badgeColor="text-green-700 bg-green-100"
          />
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <>Your <span style={{ fontWeight: 600 }}>write-off rate of 3.9%</span> is below industry average (5-7%). Strong credit management and client selection.</>,
          <><span style={{ fontWeight: 600 }}>Net revenue realization is 81.2%</span> of total billing. Consider implementing advance payment terms to improve cash collection.</>,
          <><span style={{ fontWeight: 600 }}>₹8.2L in unbilled work</span> (WIP) from last month. Issue invoices within 7 days of milestone completion to improve cash velocity.</>
        ]} />
      </div>
    </div>
  );
}

// ─── 6. Revenue Growth Card (Service) ───────────────────────────────────────
function RevenueGrowthCard() {
  const [fiscalYearFilter, setFiscalYearFilter] = useState('This Fiscal Year');
  const [showInsights, setShowInsights] = useState(false);
  
  const data = [
    { month: 'May', thisYear: 12.4, lastYear: 10.5 },
    { month: 'Jun', thisYear: 13.2, lastYear: 11.0 },
    { month: 'Jul', thisYear: 14.8, lastYear: 12.2 },
    { month: 'Aug', thisYear: 15.6, lastYear: 13.1 },
    { month: 'Sep', thisYear: 16.9, lastYear: 14.5 },
    { month: 'Oct', thisYear: 18.2, lastYear: 15.8 },
    { month: 'Nov', thisYear: 19.5, lastYear: 17.2 },
    { month: 'Dec', thisYear: 21.0, lastYear: 18.6 },
    { month: 'Jan', thisYear: 22.8, lastYear: 19.8 },
    { month: 'Feb', thisYear: 23.5, lastYear: 20.5 },
    { month: 'Mar', thisYear: 26.3, lastYear: 22.1 }
  ];

  const thisYearTotal = 193.5;
  const lastYearTotal = 223.8;
  const growthRate = 15.7;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 600 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[13px]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500">{entry.name}:</span>
              <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{entry.value.toFixed(1)}L</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Revenue Growth Trend</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Revenue Growth Trend</strong><br/><br/>Compares revenue this year vs last year, month by month.<br/><br/>• <strong>Gray Bars:</strong> Last year's revenue<br/>• <strong>Blue Bars:</strong> This year's performance" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Year-over-Year Comparison</span>
          <DateFilter value={fiscalYearFilter} onChange={setFiscalYearFilter} options={['This Fiscal Year', 'Last Fiscal Year', 'Last 6 Months', 'Last 12 Months']} />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full" style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height={220} minWidth={0}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value}L`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar key="bar-lastYear" dataKey="lastYear" name="Last Year" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar key="bar-thisYear" dataKey="thisYear" name="This Year" fill="#204CC7" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-5 pt-3 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#cbd5e1]" />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Last Year</span>
              <span className="text-[13px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{lastYearTotal}L</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#204CC7]" />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>This Year</span>
              <span className="text-[13px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{thisYearTotal}L</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[13px] text-green-600" style={{ fontWeight: 600 }}>+{growthRate}% YoY</span>
            </div>
          </div>
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Strong {growthRate}% YoY growth</span> driven by new client acquisition and retainer expansion. MRR growing 12% quarterly.</>,
          <><span style={{ fontWeight: 600 }}>Q4 (Jan-Mar) revenue surge</span> shows 28% growth. Plan resource capacity to handle demand spikes.</>,
          <>Summer months (Jun-Aug) show slower growth. Consider <span style={{ fontWeight: 600 }}>off-season promotions</span> or focus on strategic planning.</>
        ]} />
      </div>
    </div>
  );
}

// ─── 7. Client Revenue Card (Service) ───────────────────────────────────────
function ClientRevenueCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const data = [
    { channel: 'Enterprise Clients', sales: 22.4, color: '#204CC7' },
    { channel: 'Mid-Market', sales: 15.8, color: '#4A6FD9' },
    { channel: 'Small Business', sales: 11.2, color: '#7A96E4' },
    { channel: 'Retainer Contracts', sales: 6.4, color: '#A3B8ED' }
  ];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>{payload[0].payload.channel}</p>
          <div className="flex items-center gap-2 text-[13px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
            <span className="text-gray-500">Sales:</span>
            <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{payload[0].value}L</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">{((payload[0].value / totalSales) * 100).toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Channel-wise Revenue</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Channel-wise Revenue</strong><br/><br/>Revenue distribution by client segment.<br/><br/>• <strong>Enterprise:</strong> Large accounts<br/>• <strong>Mid-Market:</strong> Growing businesses<br/>• <strong>Small Business:</strong> SMB clients<br/>• <strong>Retainers:</strong> Recurring contracts" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Revenue by Distribution Channel</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value}L`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-2 pt-3 border-t border-gray-100">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{item.channel}</span>
              <span className="text-[13px] text-gray-900 ml-auto tabular-nums" style={{ fontWeight: 700 }}>₹{item.sales}L</span>
            </div>
          ))}
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Enterprise clients drive 40% of revenue</span> (₹22.4L) but represent only 8% of client count. Protect these with dedicated account management.</>,
          <><span style={{ fontWeight: 600 }}>Small business churn is 18%</span> annually. Implement onboarding programs and quarterly business reviews to improve retention.</>,
          <><span style={{ fontWeight: 600 }}>Retainer contracts provide stable cash flow</span> (₹6.4L/month). Target 40% of revenue from retainers for predictable income.</>
        ]} />

        <DrillDownButton onClick={onDrillDown} />
      </div>
    </div>
  );
}

// ─── 8. Project Profitability Card (Service) ────────────────────────────────
function ProjectProfitabilityCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const [dateFilter, setDateFilter] = useState('This Month');

  const data = [
    { product: 'Digital Transformation - TechCorp', sales: 14.8, growth: '+22%', color: '#204CC7' },
    { product: 'Consulting - FinanceHub Ltd', sales: 11.2, growth: '+18%', color: '#3A5FD4' },
    { product: 'Marketing Campaign - RetailCo', sales: 8.6, growth: '+15%', color: '#5A7ADF' },
    { product: 'Strategy Audit - ManufacturePro', sales: 6.9, growth: '+28%', color: '#7A96E4' },
    { product: 'Training Program - StartupX', sales: 4.3, growth: '+12%', color: '#9AB2EE' }
  ];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Top Services</h3>
          </div>
          <TooltipIcon content="<strong style='color: #204CC7;'>Top Services</strong><br/><br/>Your most profitable services ranked by revenue.<br/><br/>• <strong>Rankings:</strong> Ordered by total revenue<br/>• <strong>Growth %:</strong> Performance vs previous period" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Best Performing Services</span>
          <DateFilter value={dateFilter} onChange={setDateFilter} options={['This Month', 'Last Month', 'This Quarter', 'This Year']} />
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {data.map((product, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[13px] text-gray-600" style={{ fontWeight: 600 }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-gray-900" style={{ fontWeight: 500 }}>{product.product}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-green-600" style={{ fontWeight: 600 }}>{product.growth}</span>
                  <span className="text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{product.sales}L</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(product.sales / data[0].sales) * 100}%`, backgroundColor: product.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Total from Top 5</span>
          <span className="text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>₹{totalSales.toFixed(1)}L</span>
        </div>

        <InsightsSection showInsights={showInsights} setShowInsights={setShowInsights} insights={[
          <><span style={{ fontWeight: 600 }}>Digital Transformation (TechCorp)</span> is your flagship engagement at ₹14.8L. Lock in the next phase early to protect pipeline continuity.</>,
          <>Strategy Audit shows <span style={{ fontWeight: 600 }}>highest growth (+28%)</span> — expand the offering and allocate senior capacity to similar accounts.</>
        ]} />

        <DrillDownButton onClick={onDrillDown} />
      </div>
    </div>
  );
}
