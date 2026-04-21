'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  IndianRupee,
  Shield,
  Zap,
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  HelpCircle,
  PieChart as PieChartIcon,
  Droplets,
  Activity,
  Info,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';

interface OverviewModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function OverviewModule({ diagnosticData, onAskBregoGPT }: OverviewModuleProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const businessType = diagnosticData?.businessType;
  const isServiceBusiness = businessType === 'Trading, Manufacturing or Services';

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Sub-header */}
      <div className="subheader-glass sticky top-0 z-20 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 600 }}>Financial Overview</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness 
                ? 'Service business financial health metrics' 
                : 'Comprehensive view of your business health'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onAskBregoGPT}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[14px] hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
              style={{ fontWeight: 500 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask BregoGPT</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              <Calendar className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-[14px]" style={{ fontWeight: 500 }}>
                <option>Q4 2025</option>
                <option>Q3 2025</option>
                <option>Q2 2025</option>
                <option>Q1 2025</option>
                <option>This Month</option>
                <option>Custom</option>
              </select>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontWeight: 500 }}
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="overview-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <div id="overview-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                  <button 
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
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
            <PLPerformanceCard isServiceBusiness={isServiceBusiness} />
            <BalanceSheetCard isServiceBusiness={isServiceBusiness} />
            <CashflowCard isServiceBusiness={isServiceBusiness} />
            <KeyRatiosCard isServiceBusiness={isServiceBusiness} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Tooltip Helper Component
function TooltipIcon({ content }: { content: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-500 transition-colors"
      >
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

// ─── 1. P&L Performance Card ────────────────────────────────────────────────
function PLPerformanceCard({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [showInsights, setShowInsights] = useState(false);

  const serviceData = {
    revenue: 32500000,
    directCosts: 13000000,
    grossProfit: 19500000,
    operatingExp: 11375000,
    otherExp: 1625000,
    netProfit: 6500000
  };

  const ecommerceData = {
    revenue: 28600000,
    directCosts: 15730000,
    grossProfit: 12870000,
    operatingExp: 9152000,
    otherExp: 858000,
    netProfit: 2860000
  };

  const data = isServiceBusiness ? serviceData : ecommerceData;
  const netProfitMargin = ((data.netProfit / data.revenue) * 100).toFixed(1);
  const directCostsPct = ((data.directCosts / data.revenue) * 100).toFixed(1);
  const operatingPct = ((data.operatingExp / data.revenue) * 100).toFixed(1);
  const otherPct = ((data.otherExp / data.revenue) * 100).toFixed(1);
  const industryAvgMargin = isServiceBusiness ? 15 : 8;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PieChartIcon className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>P&L Performance</h3>
          </div>
          <TooltipIcon content="<strong>What is P&L?</strong><br/><br/>Think of it like your bank statement. It shows:<br/><br/>• <strong>Money IN</strong>: All sales/revenue you made<br/>• <strong>Money OUT</strong>: All costs & expenses<br/>• <strong>What's Left</strong>: Your actual profit" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        {/* Section label + trend */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Net Profit (Q4 2025)</span>
          <div className="flex items-center gap-1 text-[13px] text-green-600" style={{ fontWeight: 500 }}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isServiceBusiness ? '+18% vs Q3' : '+15% vs Q3'}</span>
          </div>
        </div>
        
        {/* Hero metric */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-[30px] text-gray-900 tracking-tight tabular-nums" style={{ fontWeight: 700 }}>
            ₹{(data.netProfit / 100000).toFixed(1)}L
          </span>
          <span className="text-[13px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{netProfitMargin}% margin</span>
        </div>

        {/* Industry comparison */}
        <div className="mb-5">
          <div className="flex justify-between text-[13px] mb-1.5">
            <span className="text-gray-500" style={{ fontWeight: 400 }}>vs Industry Average</span>
            <span className="text-green-600" style={{ fontWeight: 600 }}>+{(parseFloat(netProfitMargin) - industryAvgMargin).toFixed(1)}%</span>
          </div>
          <div className="relative bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="absolute top-0 h-full w-0.5 bg-gray-400 z-10" 
              style={{ left: `${(industryAvgMargin / 25) * 100}%` }}
            ></div>
            <div 
              className="bg-brand h-full rounded-full" 
              style={{ width: `${(parseFloat(netProfitMargin) / 25) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[13px] text-gray-500 mt-1">
            <span>0%</span>
            <span className="text-gray-500" style={{ fontWeight: 500 }}>Avg: {industryAvgMargin}%</span>
            <span>25%</span>
          </div>
        </div>

        {/* Waterfall */}
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <span className="text-[13px] text-gray-600 mb-1" style={{ fontWeight: 500 }}>From Revenue to Profit</span>
          
          {[
            { label: 'Revenue', value: `₹${(data.revenue / 10000000).toFixed(2)}Cr`, pct: '100%', color: 'bg-brand', textColor: 'text-white', valueColor: 'text-gray-900', width: '100%' },
            { label: isServiceBusiness ? 'Direct' : 'COGS', value: `-₹${(data.directCosts / 10000000).toFixed(2)}Cr`, pct: `${directCostsPct}%`, color: 'bg-brand-light', textColor: 'text-brand', valueColor: 'text-gray-700', width: `${directCostsPct}%` },
            { label: 'Operating', value: `-₹${(data.operatingExp / 10000000).toFixed(2)}Cr`, pct: `${operatingPct}%`, color: 'bg-brand-light', textColor: 'text-brand', valueColor: 'text-gray-700', width: `${operatingPct}%` },
            { label: 'Other', value: `-₹${(data.otherExp / 10000000).toFixed(2)}Cr`, pct: `${otherPct}%`, color: 'bg-brand-light', textColor: 'text-brand', valueColor: 'text-gray-700', width: `${otherPct}%` },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0">
                <div className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{row.label}</div>
                <div className={`text-[13px] ${row.valueColor}`} style={{ fontWeight: 600 }}>{row.value}</div>
              </div>
              <div className={`flex-1 h-7 ${row.color} rounded-md flex items-center justify-end pr-2.5`} style={{ width: row.width }}>
                <span className={`text-[13px] ${row.textColor}`} style={{ fontWeight: 600 }}>{row.pct}</span>
              </div>
            </div>
          ))}

          <div className="border-t border-gray-100 my-1"></div>

          <div className="flex items-center gap-3">
            <div className="w-20 flex-shrink-0">
              <div className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Net Profit</div>
              <div className="text-[13px] text-green-700" style={{ fontWeight: 700 }}>₹{(data.netProfit / 10000000).toFixed(2)}Cr</div>
            </div>
            <div className="flex-1 h-7 bg-green-500 rounded-md flex items-center justify-end pr-2.5" style={{ width: `${netProfitMargin}%` }}>
              <span className="text-[13px] text-white" style={{ fontWeight: 600 }}>{netProfitMargin}%</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand" />
              <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
          </button>

          {showInsights && (
            <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                  Your <span style={{ fontWeight: 600 }}>{netProfitMargin}% net margin outperforms</span> the industry average of {industryAvgMargin}%. Every ₹1Cr in revenue generates ₹{netProfitMargin}L profit.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                  {isServiceBusiness 
                    ? <>Operating expenses at {operatingPct}%. Reducing by 10% adds <span style={{ fontWeight: 600 }}>₹{(data.operatingExp * 0.1 / 100000).toFixed(0)}L annually</span> to profit.</>
                    : <>COGS at {directCostsPct}%. Negotiating 5% better rates adds <span style={{ fontWeight: 600 }}>₹{(data.directCosts * 0.05 / 100000).toFixed(0)}L quarterly</span>.</>
                  }
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                  {isServiceBusiness 
                    ? <>Growing revenue by 20% while maintaining margins adds <span style={{ fontWeight: 600 }}>₹{(data.netProfit * 0.2 / 100000).toFixed(0)}L</span> to quarterly profit.</>
                    : <>Growing revenue by 25% with stable fixed costs pushes margin to <span style={{ fontWeight: 600 }}>{(parseFloat(netProfitMargin) + 3).toFixed(1)}%</span>.</>
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Balance Sheet Card ──────────────────────────────────────────────────
function BalanceSheetCard({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [showInsights, setShowInsights] = useState(false);

  const serviceAssets = [
    { name: 'Fixed Assets', value: 4500000 },
    { name: 'Current Assets', value: 16000000 },
    { name: 'Investments', value: 3500000 },
  ];
  const serviceLiabilities = [
    { name: 'Capital A/C', value: 15500000 },
    { name: 'Loans (Liability)', value: 6000000 },
    { name: 'Current Liabilities', value: 2500000 },
  ];
  const ecommerceAssets = [
    { name: 'Fixed Assets', value: 10500000 },
    { name: 'Current Assets', value: 12000000 },
    { name: 'Investments', value: 2500000 },
  ];
  const ecommerceLiabilities = [
    { name: 'Capital A/C', value: 13500000 },
    { name: 'Loans (Liability)', value: 8000000 },
    { name: 'Current Liabilities', value: 3500000 },
  ];

  const assetsData = isServiceBusiness ? serviceAssets : ecommerceAssets;
  const liabilitiesData = isServiceBusiness ? serviceLiabilities : ecommerceLiabilities;
  const assetsTotal = assetsData.reduce((sum, item) => sum + item.value, 0);
  const liabilitiesTotal = liabilitiesData.reduce((sum, item) => sum + item.value, 0);
  const netWorth = assetsTotal - liabilitiesTotal;
  const debtToEquity = ((liabilitiesTotal - liabilitiesData[0].value) / liabilitiesData[0].value).toFixed(2);

  const assetShades = ['#204CC7', '#4A6FD9', '#7A96E4'];
  const liabilityShades = ['#204CC7', '#6B7280', '#9CA3AF'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Balance Sheet</h3>
          </div>
          <TooltipIcon content="<strong>What is a Balance Sheet?</strong><br/><br/>Simple equation: <strong>What you OWN - What you OWE = Your Net Worth</strong><br/><br/>• <strong>Assets</strong>: Things you own (cash, equipment, inventory)<br/>• <strong>Liabilities</strong>: Money you owe (loans, bills to pay)<br/>• <strong>Net Worth</strong>: The difference (your actual value)" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Net Worth</span>
          <CheckCircle2 className="w-5 h-5 text-brand" />
        </div>
        
        {/* Hero metric */}
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-[30px] text-gray-900 tracking-tight tabular-nums" style={{ fontWeight: 700 }}>
            ₹{(netWorth / 10000000).toFixed(2)}Cr
          </span>
          <span className="text-[13px] text-brand bg-brand-light px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>Healthy</span>
        </div>

        {/* Assets vs Liabilities bars */}
        <div className="space-y-3 mb-5">
          <div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Current Assets</span>
              <span className="text-brand" style={{ fontWeight: 600 }}>₹{((assetsTotal * 0.45) / 10000000).toFixed(2)}Cr</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-brand h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Current Liabilities</span>
              <span className="text-gray-700" style={{ fontWeight: 600 }}>₹{(((liabilitiesTotal - liabilitiesData[0].value) * 0.40) / 10000000).toFixed(2)}Cr</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gray-400 h-full rounded-full" style={{ width: `${((liabilitiesTotal - liabilitiesData[0].value) * 0.40 / assetsTotal) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="flex-1 flex flex-col justify-center">
          <h4 className="text-[13px] text-gray-600 mb-3" style={{ fontWeight: 500 }}>Detailed Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[13px] text-brand mb-2.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <div className="w-2 h-2 rounded-full bg-brand"></div>
                Assets
              </div>
              <div className="space-y-2.5">
                {assetsData.map((item, index) => {
                  const percentage = ((item.value / assetsTotal) * 100).toFixed(1);
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-gray-500" style={{ fontWeight: 400 }}>{item.name}</span>
                        <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{(item.value / 100000).toFixed(0)}L</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div 
                          className="h-full flex items-center justify-center rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: assetShades[index] }}
                        >
                          <span className="text-[10px] text-white" style={{ fontWeight: 600 }}>{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[13px] text-gray-600 mb-2.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                Liabilities
              </div>
              <div className="space-y-2.5">
                {liabilitiesData.map((item, index) => {
                  const percentage = ((item.value / liabilitiesTotal) * 100).toFixed(1);
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-gray-500" style={{ fontWeight: 400 }}>{item.name}</span>
                        <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{(item.value / 100000).toFixed(0)}L</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div 
                          className="h-full flex items-center justify-center rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: liabilityShades[index] }}
                        >
                          <span className="text-[10px] text-white" style={{ fontWeight: 600 }}>{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand" />
              <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
          </button>

          {showInsights && (
            <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                  {isServiceBusiness 
                    ? <><span style={{ fontWeight: 600 }}>Asset-light model</span> with 67% current assets. High flexibility and lower capital needs for growth.</>
                    : <><span style={{ fontWeight: 600 }}>Net worth of ₹{(netWorth / 10000000).toFixed(2)}Cr</span> with debt-to-equity of {debtToEquity}:1 indicates prudent leverage.</>
                  }
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                  {isServiceBusiness 
                    ? <><span style={{ fontWeight: 600 }}>Debt-to-equity of {debtToEquity}:1</span> is conservative yet prudent for a service business.</>
                    : <><span style={{ fontWeight: 600 }}>48% current assets</span> provide liquidity flexibility. Fixed assets at 42% support operations efficiently.</>
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Cashflow Card ───────────────────────────────────────────────────────
function CashflowCard({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [showInsights, setShowInsights] = useState(false);

  const serviceData = {
    openingBalance: 1150000,
    totalInflow: 2850000,
    totalOutflow: 1920000,
    monthlyBurn: 380000
  };
  const ecommerceData = {
    openingBalance: 850000,
    totalInflow: 2420000,
    totalOutflow: 1750000,
    monthlyBurn: 330000
  };

  const data = isServiceBusiness ? serviceData : ecommerceData;
  const netCashflow = data.totalInflow - data.totalOutflow;
  const closingBalance = data.openingBalance + netCashflow;
  const runway = (closingBalance / data.monthlyBurn).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Droplets className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Cashflow</h3>
          </div>
          <TooltipIcon content="<strong>What is Cashflow?</strong><br/><br/>It's like water in a bucket:<br/><br/>• <strong>Inflow</strong>: Money coming into your bank<br/>• <strong>Outflow</strong>: Money leaving your bank<br/>• <strong>Runway</strong>: How long before bucket runs dry?" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Cash Runway</span>
          {parseFloat(runway) < 5 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
        </div>
        
        {/* Hero metric */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[30px] text-gray-900 tracking-tight tabular-nums" style={{ fontWeight: 700 }}>{runway}</span>
          <span className="text-[16px] text-gray-400" style={{ fontWeight: 400 }}>months</span>
          <span className={`text-[13px] px-2 py-0.5 rounded-full ${
            parseFloat(runway) < 5 ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'
          }`} style={{ fontWeight: 600 }}>
            {parseFloat(runway) < 5 ? 'Action needed' : 'Healthy'}
          </span>
        </div>

        {/* Runway timeline */}
        <div className="mb-5">
          <div className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 h-2 rounded-full mb-1.5"></div>
          <div className="flex justify-between text-[13px] text-gray-500">
            <span className="text-green-600" style={{ fontWeight: 500 }}>Today</span>
            <span className="text-amber-600" style={{ fontWeight: 500 }}>Mar '26</span>
            <span className="text-red-500" style={{ fontWeight: 500 }}>May '26</span>
          </div>
        </div>

        {/* Cashflow Breakdown */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-[13px] text-gray-600 mb-3" style={{ fontWeight: 500 }}>December 2025 Summary</span>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-3 bg-green-50/80 rounded-xl border border-green-100/50">
              <span className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>Total Inflow</span>
              <span className="text-[14px] text-green-700 tabular-nums" style={{ fontWeight: 600 }}>₹{(data.totalInflow / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-red-50/80 rounded-xl border border-red-100/50">
              <span className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>Total Outflow</span>
              <span className="text-[14px] text-red-700 tabular-nums" style={{ fontWeight: 600 }}>₹{(data.totalOutflow / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-brand-light rounded-xl border border-brand/15">
              <span className="text-[13px] text-gray-900" style={{ fontWeight: 500 }}>Net Cashflow</span>
              <span className="text-[14px] text-brand tabular-nums" style={{ fontWeight: 700 }}>₹{(netCashflow / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand" />
              <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
          </button>

          {showInsights && (
            <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
              {isServiceBusiness ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }}>{runway} months runway</span> provides good cushion. Service businesses typically have better cash flow due to lower inventory needs.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      Reducing DSO from 42 to 30 days would free <span style={{ fontWeight: 600 }}>₹12L cash</span>, extending runway to {(parseFloat(runway) + 3.2).toFixed(1)} months.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      With <span style={{ fontWeight: 600 }}>{runway} months of runway</span>, start fundraising or revenue acceleration efforts now.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      Reducing DSO from 54 to 40 days would free <span style={{ fontWeight: 600 }}>₹16L cash</span>, adding 4.8 months to runway.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 4. Key Ratios Card ─────────────────────────────────────────────────────
function KeyRatiosCard({ isServiceBusiness }: { isServiceBusiness: boolean }) {
  const [showInsights, setShowInsights] = useState(false);

  const serviceRatios = [
    { label: 'Current Ratio', value: '6.40:1', status: 'excellent' },
    { label: 'Quick Ratio', value: '5.92:1', status: 'excellent' },
    { label: 'Debt/Equity', value: '0.55:1', status: 'excellent' },
    { label: 'DSO', value: '42 days', status: 'good' },
    { label: 'Net Profit %', value: '30.2%', status: 'excellent' },
    { label: 'ROI', value: '40.8%', status: 'excellent' },
  ];
  const ecommerceRatios = [
    { label: 'Current Ratio', value: '3.43:1', status: 'excellent' },
    { label: 'Quick Ratio', value: '2.71:1', status: 'excellent' },
    { label: 'Debt/Equity', value: '0.85:1', status: 'good' },
    { label: 'DSO', value: '54 days', status: 'warning' },
    { label: 'Net Profit %', value: '20.2%', status: 'excellent' },
    { label: 'ROI', value: '22.9%', status: 'excellent' },
  ];

  const ratios = isServiceBusiness ? serviceRatios : ecommerceRatios;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50/80 border-green-100/50 text-green-800';
      case 'good': return 'bg-brand-light border-brand/10 text-brand-dark';
      case 'warning': return 'bg-amber-50/80 border-amber-100/50 text-amber-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const excellentCount = ratios.filter(r => r.status === 'excellent').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Key Ratios</h3>
          </div>
          <TooltipIcon content="<strong>What are Financial Ratios?</strong><br/><br/>Think of them as your business health checkup:<br/><br/>• <strong>Current Ratio</strong>: Can you pay this month's bills?<br/>• <strong>DSO</strong>: How fast customers pay you<br/>• <strong>Debt/Equity</strong>: How much you borrowed vs own<br/>• <strong>ROI</strong>: Profit per ₹100 invested" />
        </div>
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Financial Health Metrics</span>
          <span className="text-[13px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
            {excellentCount}/{ratios.length} Excellent
          </span>
        </div>

        {/* Ratio Grid */}
        <div className="grid grid-cols-2 gap-2.5 flex-1">
          {ratios.map((ratio, index) => (
            <div key={index} className={`px-4 py-3.5 rounded-xl border ${getStatusStyle(ratio.status)}`}>
              <div className="text-[13px] text-gray-500 mb-1" style={{ fontWeight: 400 }}>{ratio.label}</div>
              <div className="text-[18px] tabular-nums" style={{ fontWeight: 700 }}>{ratio.value}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 px-4 py-3 bg-green-50/80 rounded-xl border border-green-100/50">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[13px] text-green-800" style={{ fontWeight: 600 }}>
              Overall: {isServiceBusiness ? 'Excellent' : 'Strong'}
            </span>
          </div>
          <p className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>
            {excellentCount} of {ratios.length} ratios are excellent.
            {isServiceBusiness 
              ? ' Outstanding financial health across all metrics.' 
              : ' Focus area: Reduce DSO from 54 to 40 days.'}
          </p>
        </div>

        {/* Insights */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand" />
              <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
          </button>

          {showInsights && (
            <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
              {isServiceBusiness ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }}>Current ratio of 6.40:1</span> is outstanding — ₹6.40 in assets for every ₹1 of obligations.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }}>ROI of 40.8%</span> significantly outperforms service industry averages (25-30%).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }}>Current ratio of 3.43:1</span> — well above the 1.5-2.0x healthy benchmark.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }}>54-day DSO</span> locks up ₹42L in receivables. Tightening credit terms frees working capital.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
