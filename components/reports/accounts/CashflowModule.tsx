'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  IndianRupee,
  Activity,
  Clock as CalendarClock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Target,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';

interface CashflowModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function CashflowModule({ diagnosticData, onAskBregoGPT }: CashflowModuleProps) {
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Determine business type from diagnosticData
  const businessType = diagnosticData?.businessType;
  const isServiceBusiness = businessType === 'Trading, Manufacturing or Services';

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Sub-header with Controls */}
      <div className="subheader-glass sticky top-0 z-20 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Module Info */}
          <div>
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Cashflow Statement</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Service business cash management' : 'Cash inflows and outflows tracking'}
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Ask Brego AI Button */}
            <button 
              onClick={onAskBregoGPT}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
              style={{ fontWeight: 500 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask BregoGPT</span>
            </button>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              <Calendar className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-sm" style={{ fontWeight: 500 }}>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Comparison Toggle */}
            <button 
              onClick={() => setCompareEnabled(!compareEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all shadow-sm ${
                compareEnabled 
                  ? 'bg-brand-light text-brand border border-brand/20' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              style={{ fontWeight: 500 }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Compare</span>
            </button>

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontWeight: 500 }}
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="cashflow-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div id="cashflow-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                  <button 
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <Download className="w-3.5 h-3.5" />
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
          {/* KPI Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIWidget
              title="Cash Balance Today"
              value="₹14.8L"
              unit="available"
              change="+₹2.4L"
              status="green"
              trend="up"
              icon={Wallet}
            />
            <KPIWidget
              title="Net Cash Change"
              value="+₹2.4L"
              unit="this month"
              change="+18%"
              status="green"
              trend="up"
              icon={Activity}
            />
            <KPIWidget
              title="Burn / Surplus"
              value="-₹8.2L"
              unit="per month"
              change="+₹1.2L"
              status="amber"
              trend="down"
              icon={TrendingDown}
            />
            <KPIWidget
              title="Runway"
              value="18 mo"
              unit="at current burn"
              change="+2 mo"
              status="green"
              trend="up"
              icon={CalendarClock}
            />
          </div>

          {/* Cashflow Waterfall Chart */}
          <CashflowWaterfallChart isServiceBusiness={isServiceBusiness} />

          {/* Cashflow Breakdown T-Format Table */}
          <CashflowBreakdownTable isServiceBusiness={isServiceBusiness} />

          {/* Insights Panel */}
          <InsightsPanel isServiceBusiness={isServiceBusiness} />
        </div>
      </div>
    </div>
  );
}

// KPI Widget Component
interface KPIWidgetProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  status: 'green' | 'amber' | 'red';
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}

function KPIWidget({ title, value, unit, change, status, trend, icon: Icon }: KPIWidgetProps) {
  const statusColors = {
    green: 'bg-green-50/80 border-green-200 hover:bg-green-50',
    amber: 'bg-amber-50/80 border-amber-200 hover:bg-amber-50',
    red: 'bg-red-50/80 border-red-200 hover:bg-red-50'
  };

  const statusDotColors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };

  const trendColors = {
    up: status === 'green' ? 'text-green-600' : 'text-red-600',
    down: status === 'green' ? 'text-red-600' : 'text-green-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`
      relative rounded-xl border p-4 transition-all duration-200 hover:shadow-md
      ${statusColors[status]}
    `}>
      {/* Status Indicator Dot */}
      <div className="absolute top-3 right-3">
        <div className={`w-2 h-2 rounded-full ${statusDotColors[status]} animate-pulse`} />
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-700" />
        </div>
        <p className="text-xs font-semibold text-gray-700">{title}</p>
      </div>

      {/* Current Value */}
      <div className="mb-1.5">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>

      {/* Change vs Last Period */}
      <div className={`flex items-center gap-1 text-xs ${trendColors[trend]}`}>
        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
        <span className="font-medium">{change}</span>
      </div>
    </div>
  );
}

// Cashflow Waterfall Chart Component
function CashflowWaterfallChart({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const data = [
    { 
      name: 'Opening Balance', 
      value: 12.4,
      displayValue: 12.4,
      type: 'opening',
      start: 0
    },
    { 
      name: 'Inflows', 
      value: 22.6,
      displayValue: 22.6,
      type: 'inflow',
      start: 12.4
    },
    { 
      name: 'Outflows', 
      value: -20.2,
      displayValue: 20.2,
      type: 'outflow',
      start: 12.4
    },
    { 
      name: 'Closing Balance', 
      value: 14.8,
      displayValue: 14.8,
      type: 'closing',
      start: 0
    }
  ];

  const getBarColor = (type: string) => {
    switch (type) {
      case 'opening':
        return '#6b7280'; // Gray
      case 'inflow':
        return '#10b981'; // Green
      case 'outflow':
        return '#ef4444'; // Red
      case 'closing':
        return '#204CC7'; // Brand
      default:
        return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-xs text-gray-600">
            Amount: <span className="font-semibold text-gray-900">₹{Math.abs(data.value).toFixed(1)}L</span>
          </p>
          {data.type === 'inflow' && (
            <p className="text-xs text-green-600 mt-1">Collections & Income</p>
          )}
          {data.type === 'outflow' && (
            <p className="text-xs text-red-600 mt-1">Payments & Expenses</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Cashflow Waterfall</h3>
          <p className="text-[14px] text-gray-500 mt-1" style={{ fontWeight: 400 }}>Opening balance → Inflows → Outflows → Closing balance</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-semibold">Net Change</p>
          <p className="text-2xl font-bold text-green-600">+₹2.4L</p>
        </div>
      </div>

      <div className="h-80 w-full" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height={320} minWidth={0}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Amount (₹L)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="displayValue" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
              <LabelList 
                dataKey="value" 
                position="top" 
                formatter={(value: number) => `${value > 0 ? '+' : ''}₹${Math.abs(value).toFixed(1)}L`}
                style={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Opening</p>
          <p className="text-lg font-bold text-gray-700">₹12.4L</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Inflows</p>
          <p className="text-lg font-bold text-green-600">+₹22.6L</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Outflows</p>
          <p className="text-lg font-bold text-red-600">-₹20.2L</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Closing</p>
          <p className="text-lg font-bold text-brand">₹14.8L</p>
        </div>
      </div>
    </div>
  );
}

// Cashflow Breakdown T-Format Table Component
function CashflowBreakdownTable({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'inflow-current-assets': false,
    'outflow-capital': false,
    'outflow-loans': false,
    'outflow-liabilities': false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      'inflow-current-assets': true,
      'outflow-capital': true,
      'outflow-loans': true,
      'outflow-liabilities': true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'inflow-current-assets': false,
      'outflow-capital': false,
      'outflow-loans': false,
      'outflow-liabilities': false,
    });
  };

  // Inflow data
  const currentAssetsChildren = isServiceBusiness ? [
    { name: 'Client Payments Received', amount: '₹18.4L' },
    { name: 'Retainer Billings Collected', amount: '₹2.8L' },
    { name: 'Project Milestone Payments', amount: '₹0.8L' },
    { name: 'Reimbursements & Other Income', amount: '₹0.6L' },
  ] : [
    { name: 'Cash Collected from Customers', amount: '₹18.4L' },
    { name: 'Short-term Investments Liquidated', amount: '₹2.8L' },
    { name: 'Interest & Dividend Income', amount: '₹0.8L' },
    { name: 'Other Receivables Collected', amount: '₹0.6L' },
  ];

  // Outflow data
  const capitalAccountChildren = [
    { name: 'Owner Withdrawals', amount: '₹2.4L' },
    { name: 'Dividend Payments', amount: '₹1.8L' },
  ];

  const loansChildren = [
    { name: 'Term Loan Repayment', amount: '₹3.2L' },
    { name: 'Working Capital Loan Interest', amount: '₹1.4L' },
    { name: 'Credit Line Payment', amount: '₹0.8L' },
  ];

  const currentLiabilitiesChildren = isServiceBusiness ? [
    { name: 'Employee Salaries & Benefits', amount: '₹6.4L' },
    { name: 'Subcontractor & Freelancer Payments', amount: '₹3.6L' },
    { name: 'Tax Payments (GST, TDS, Payroll)', amount: '₹2.1L' },
    { name: 'Office Rent & Software Subscriptions', amount: '₹1.5L' },
  ] : [
    { name: 'Vendor Payments (AP)', amount: '₹6.4L' },
    { name: 'Payroll & Benefits', amount: '₹3.6L' },
    { name: 'Tax Payments (GST, TDS)', amount: '₹2.1L' },
    { name: 'Utilities & Rent', amount: '₹1.5L' },
  ];

  const inflowTotal = 22.6;
  const outflowTotal = 20.2;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Cashflow Breakdown</h3>
        </div>
        {/* Expand/Collapse Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allExpanded = Object.values(expandedSections).every(val => val === true);
              if (allExpanded) {
                collapseAll();
              } else {
                expandAll();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {Object.values(expandedSections).every(val => val === true) ? (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* T-Format Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Particulars</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase">Amount (₹L)</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Particulars</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase">Amount (₹L)</th>
            </tr>
          </thead>
          <tbody>
            {/* Inflow Section Header */}
            <tr className="bg-green-50 border-b border-gray-200">
              <td colSpan={2} className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-sm text-green-700 uppercase">Inflow</span>
                </div>
              </td>
              {/* Outflow Section Header */}
              <td colSpan={2} className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-sm text-red-700 uppercase">Outflow</span>
                </div>
              </td>
            </tr>

            {/* Row 1: Current Assets vs Capital Account */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Current Assets */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Current Assets</span>
                  </div>
                  {expandedSections['inflow-current-assets'] && (
                    <div className="mt-2 space-y-2">
                      {currentAssetsChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-green-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              {/* Right: Capital Account */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Capital Account</span>
                  </div>
                  {expandedSections['outflow-capital'] && (
                    <div className="mt-2 space-y-2">
                      {capitalAccountChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-red-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Row 2: Empty vs Loans (Liability) */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Empty */}
              <td colSpan={2} className="py-3 px-4"></td>
              {/* Right: Loans (Liability) */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Loans (Liability)</span>
                  </div>
                  {expandedSections['outflow-loans'] && (
                    <div className="mt-2 space-y-2">
                      {loansChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-red-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Row 3: Empty vs Current Liabilities */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Empty */}
              <td colSpan={2} className="py-3 px-4"></td>
              {/* Right: Current Liabilities */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Current Liabilities</span>
                  </div>
                  {expandedSections['outflow-liabilities'] && (
                    <div className="mt-2 space-y-2">
                      {currentLiabilitiesChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-red-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="py-3 px-4 font-bold text-sm text-gray-900">Total Inflow</td>
              <td className="py-3 px-4 text-right font-bold text-lg text-green-600">₹{inflowTotal}L</td>
              <td className="py-3 px-4 font-bold text-sm text-gray-900">Total Outflow</td>
              <td className="py-3 px-4 text-right font-bold text-lg text-red-600">₹{outflowTotal}L</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Insights Panel Component
function InsightsPanel({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const insights = [
    {
      title: 'Strong cashflow momentum',
      description: 'Net change +₹2.4L (18% up) with ₹18.4L customer collections. Healthy runway at 18 months.',
      metric: '+₹2.4L',
      icon: TrendingUp,
    },
    {
      title: 'Extend runway to 21 months',
      description: 'Reduce burn from ₹8.2L to ₹7.0L by optimizing marketing (₹0.6L), vendor terms (₹0.4L), and non-critical expenses (₹0.2L).',
      metric: '+3 mo',
      icon: CalendarClock,
    },
    {
      title: 'Collect ₹4.8L overdue AR',
      description: 'TechCorp (₹1.8L, 45d) and StartupX (₹1.2L, 38d) are top priorities. Collecting adds 7 months runway.',
      metric: '+7 mo',
      icon: Target,
    },
    {
      title: 'Compliance: ₹4.3L due soon',
      description: 'GST ₹2.1L (Jan 20), TDS ₹1.4L (Jan 25), PF ₹0.8L (Jan 28). Avoid ₹0.4L penalties.',
      metric: 'Jan 20-28',
      icon: FileText,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6">
      <div className="mb-5">
        <h3 className="text-[18px] text-gray-900 flex items-center gap-2.5" style={{ fontWeight: 600 }}>
          <Lightbulb className="w-5 h-5 text-brand" />
          Insights
        </h3>
        <p className="text-[13px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>Key observations and strategic recommendations</p>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-[14px] text-gray-900" style={{ fontWeight: 600 }}>{insight.title}</h4>
                    <span className="bg-brand text-white text-[13px] px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0" style={{ fontWeight: 600 }}>
                      {insight.metric}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
