'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  IndianRupee,
  Wallet,
  CreditCard,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Activity,
  Shield,
  BarChart3,
  Building2,
  Briefcase,
  Clock,
  FileText,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceSheetModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function BalanceSheetModule({ diagnosticData, onAskBregoGPT }: BalanceSheetModuleProps) {
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
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Balance Sheet</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Asset-light service business snapshot' : 'Financial position as of today'}
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
                <option>Q4 2025</option>
                <option>Q3 2025</option>
                <option>Q2 2025</option>
                <option>Q1 2025</option>
                <option>This Month</option>
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
                aria-controls="balancesheet-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div id="balancesheet-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
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
              title="Working Capital"
              value="₹18.6L"
              unit="current"
              change="+₹3.2L"
              status="green"
              trend="up"
              icon={Wallet}
            />
            <KPIWidget
              title="Total Assets"
              value="₹86.4L"
              unit="book value"
              change="+8%"
              status="green"
              trend="up"
              icon={Building2}
            />
            <KPIWidget
              title="Total Liabilities"
              value="₹34.2L"
              unit="outstanding"
              change="-₹2.4L"
              status="green"
              trend="down"
              icon={CreditCard}
            />
            <KPIWidget
              title="Net Worth / Equity"
              value="₹52.2L"
              unit="owner's equity"
              change="+12%"
              status="green"
              trend="up"
              icon={Shield}
            />
          </div>

          {/* Balance Sheet Breakdown T-Format Table */}
          <BalanceSheetBreakdownTable isServiceBusiness={isServiceBusiness} />

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
    down: status === 'green' ? 'text-green-600' : 'text-red-600',
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
        <span className="font-medium">{change} vs last quarter</span>
      </div>
    </div>
  );
}

// Balance Sheet Breakdown Table with Tabs Component
function BalanceSheetBreakdownTable({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'liability-capital': false,
    'liability-loans': false,
    'liability-current': false,
    'liability-pl': false,
    'asset-fixed': false,
    'asset-investments': false,
    'asset-current': false,
    'asset-misc': false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      'liability-capital': true,
      'liability-loans': true,
      'liability-current': true,
      'liability-pl': true,
      'asset-fixed': true,
      'asset-investments': true,
      'asset-current': true,
      'asset-misc': true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'liability-capital': false,
      'liability-loans': false,
      'liability-current': false,
      'liability-pl': false,
      'asset-fixed': false,
      'asset-investments': false,
      'asset-current': false,
      'asset-misc': false,
    });
  };

  // Liability data
  const capitalAccountChildren = [
    { name: 'Founder Equity', amount: '₹25.0L' },
    { name: 'Retained Earnings', amount: '₹18.8L' },
    { name: 'General Reserves', amount: '₹8.4L' },
  ];

  const loansChildren = [
    { name: 'Term Loan - Bank A', amount: '₹8.2L' },
    { name: 'Equipment Financing', amount: '₹3.4L' },
    { name: 'Working Capital Loan', amount: '₹6.2L' },
  ];

  const currentLiabilitiesChildren = [
    { name: 'Accounts Payable', amount: '₹8.4L' },
    { name: 'Accrued Expenses', amount: '₹3.2L' },
    { name: 'Tax Liabilities', amount: '₹4.8L' },
    { name: 'Short-term Debt Due', amount: '₹1.4L' },
  ];

  const profitLossChildren = [
    { name: 'Net Profit (Current Period)', amount: '₹4.2L' },
    { name: 'Undistributed Profit', amount: '₹1.8L' },
  ];

  // Asset data
  const fixedAssetsChildren = isServiceBusiness ? [
    { name: 'Computers & Software', amount: '₹14.6L' },
    { name: 'Office Furniture', amount: '₹8.2L' },
    { name: 'Professional Equipment', amount: '₹9.8L' },
  ] : [
    { name: 'Office Equipment', amount: '₹14.6L' },
    { name: 'Furniture & Fixtures', amount: '₹8.2L' },
    { name: 'Vehicles', amount: '₹9.8L' },
  ];

  const investmentsChildren = [
    { name: 'Mutual Funds', amount: '₹6.4L' },
    { name: 'Fixed Deposits', amount: '₹4.8L' },
    { name: 'Equity Investments', amount: '₹2.2L' },
  ];

  const currentAssetsChildren = isServiceBusiness ? [
    { name: 'Cash & Bank Balance', amount: '₹14.8L' },
    { name: 'Client Receivables', amount: '₹18.2L' },
    { name: 'Unbilled Revenue (WIP)', amount: '₹9.8L' },
  ] : [
    { name: 'Cash & Bank Balance', amount: '₹14.8L' },
    { name: 'Accounts Receivable', amount: '₹18.2L' },
    { name: 'Inventory', amount: '₹9.8L' },
  ];

  const miscExpensesChildren = isServiceBusiness ? [
    { name: 'Software Licenses (Prepaid)', amount: '₹1.2L' },
    { name: 'Security Deposits', amount: '₹0.8L' },
    { name: 'Prepaid Professional Fees', amount: '₹2.4L' },
  ] : [
    { name: 'Preliminary Expenses', amount: '₹1.2L' },
    { name: 'Deferred Revenue Expenditure', amount: '₹0.8L' },
    { name: 'Prepaid Expenses', amount: '₹2.4L' },
  ];

  const liabilityTotal = 34.2;
  const assetTotal = 86.4;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Balance Sheet Breakdown</h3>
        </div>
        {/* Expand/Collapse Toggle */}
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
            {/* Section Headers */}
            <tr className="bg-gray-50 border-b border-gray-200">
              <td colSpan={2} className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-sm text-red-700 uppercase">Liability</span>
                </div>
              </td>
              <td colSpan={2} className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand" />
                  <span className="font-bold text-sm text-brand uppercase">Assets</span>
                </div>
              </td>
            </tr>

            {/* Row 1: Capital Account vs Fixed Assets */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Capital Account */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Capital Account</span>
                  </div>
                  {expandedSections['liability-capital'] && (
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
              {/* Right: Fixed Assets */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Fixed Assets</span>
                  </div>
                  {expandedSections['asset-fixed'] && (
                    <div className="mt-2 space-y-2">
                      {fixedAssetsChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-brand">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Row 2: Loans (Liability) vs Investments */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Loans */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Loans (Liability)</span>
                  </div>
                  {expandedSections['liability-loans'] && (
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
              {/* Right: Investments */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Investments</span>
                  </div>
                  {expandedSections['asset-investments'] && (
                    <div className="mt-2 space-y-2">
                      {investmentsChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-brand">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Row 3: Current Liabilities vs Current Assets */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Current Liabilities */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Current Liabilities</span>
                  </div>
                  {expandedSections['liability-current'] && (
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
              {/* Right: Current Assets */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Current Assets</span>
                  </div>
                  {expandedSections['asset-current'] && (
                    <div className="mt-2 space-y-2">
                      {currentAssetsChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-brand">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Row 4: Profit & Loss A/C vs Misc. Expenses (ASSET) */}
            <tr className="border-b border-gray-100 align-top">
              {/* Left: Profit & Loss A/C */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Profit & Loss A/C</span>
                  </div>
                  {expandedSections['liability-pl'] && (
                    <div className="mt-2 space-y-2">
                      {profitLossChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-red-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              {/* Right: Misc. Expenses (ASSET) */}
              <td colSpan={2} className="p-0">
                <div className="py-3 px-4">
                  <div className="py-1">
                    <span className="font-semibold text-sm text-gray-900">Misc. Expenses (ASSET)</span>
                  </div>
                  {expandedSections['asset-misc'] && (
                    <div className="mt-2 space-y-2">
                      {miscExpensesChildren.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-600 py-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-brand">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="py-3 px-4 font-bold text-sm text-gray-900">Total Liability</td>
              <td className="py-3 px-4 text-right font-bold text-lg text-red-600">₹{liabilityTotal}L</td>
              <td className="py-3 px-4 font-bold text-sm text-gray-900">Total Assets</td>
              <td className="py-3 px-4 text-right font-bold text-lg text-brand">₹{assetTotal}L</td>
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
      title: 'Excellent balance sheet strength',
      description: 'Assets ₹86.4L (+26% YoY), Liabilities ₹34.2L (-20% YoY). Net worth ₹52.2L (+123%). Healthy 2.5:1 asset-to-liability ratio.',
      metric: '+123%',
      icon: TrendingUp,
    },
    {
      title: 'AR growing faster than revenue',
      description: 'Receivables up 22% to ₹18.2L vs 12% revenue growth. DSO increased 38→42 days. Focus collection on top 5 accounts (₹12.4L).',
      metric: '42d DSO',
      icon: AlertTriangle,
    },
    {
      title: 'Working capital at ₹18.6L',
      description: 'Current ratio 2.4x (₹42.8L vs ₹17.8L). Strong liquidity, but quick ratio low at 1.1x. Build cash reserves for ₹6.2L short-term debt due in 90 days.',
      metric: '2.4x',
      icon: Wallet,
    },
    {
      title: 'Optimize D/E ratio from 0.65',
      description: 'Long-term debt ₹11.6L at 12% interest (₹1.4L/year). Early repayment of ₹4.0L saves ₹48k annually, improves D/E to 0.50.',
      metric: '₹48k',
      icon: Target,
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
