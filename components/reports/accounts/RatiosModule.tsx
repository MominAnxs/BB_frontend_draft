'use client';

import { 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Calendar,
  Download,
  ChevronDown,
  Droplets,
  Clock,
  IndianRupee,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';

interface RatiosModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function RatiosModule({ diagnosticData, onAskBregoGPT }: RatiosModuleProps) {
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
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Financial Ratios</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Service business key performance indicators' : 'Key financial health metrics'}
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Ask Brego AI Button */}
            <button onClick={onAskBregoGPT} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40" style={{ fontWeight: 500 }}>
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

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                style={{ fontWeight: 500 }}
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="ratios-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div id="ratios-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
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
          {/* Ratio Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Liquidity Card */}
            <LiquidityRatioCard />

            {/* 2. Collection Efficiency Card */}
            <CollectionEfficiencyCard />

            {/* 3. Profitability Card */}
            <ProfitabilityCard />

            {/* 4. Cash Health Card */}
            <CashHealthCard />
          </div>

          {/* Action Panel */}
          <RatioActionPanel />
        </div>
      </div>
    </div>
  );
}

// Tooltip Component
function Tooltip({ content, variant = 'default' }: { content: string; variant?: 'default' | 'blue' }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={variant === 'blue' ? 'text-brand hover:text-brand-dark transition-colors' : 'text-gray-400 hover:text-gray-500 transition-colors'}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg z-[9999] pointer-events-none" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
          {content}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-2 h-2 bg-gray-900 rotate-45 mb-1"></div>
        </div>
      )}
    </div>
  );
}

// 1. Liquidity Ratio Card
function LiquidityRatioCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Clean Header */}
      <div className="widget-header p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-brand" />
            <h3 className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>Liquidity</h3>
          </div>
          <Tooltip content="Measures your ability to pay short-term bills. Higher is safer, but too high means idle cash." />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Current Ratio - Simplified */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Current Ratio</span>
              <Tooltip content="Current Assets ÷ Current Liabilities. Healthy range: 1.5x - 3.0x" variant="blue" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">2.4x</span>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">Healthy</span>
          </div>

          {/* Simple visual bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-green-500 h-full" style={{ width: '80%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>1.5x</span>
            <span className="text-green-600 font-medium">You're here</span>
            <span>3.0x</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Quick Ratio - Simplified */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quick Ratio</span>
              <Tooltip content="(Assets - Inventory) ÷ Liabilities. Tests if you can pay bills without selling inventory. Ideal: 1.5x+" variant="blue" />
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">1.1x</span>
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">Build reserves</span>
          </div>

          {/* Simple visual bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-amber-500 h-full" style={{ width: '55%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>1.0x</span>
            <span className="text-amber-600 font-medium">You're here</span>
            <span>2.0x</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Simple breakdown - collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-brand font-medium hover:text-brand-dark flex items-center gap-2">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            View calculation
          </summary>
          <div className="mt-3 text-xs space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Assets</span>
              <span className="font-semibold">₹42.8L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Liabilities</span>
              <span className="font-semibold">₹17.8L</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">Current Ratio</span>
              <span className="font-bold text-green-600">2.4x</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

// 2. Collection Efficiency Card
function CollectionEfficiencyCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Clean Header */}
      <div className="widget-header p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand" />
            <h3 className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>Collection Speed</h3>
          </div>
          <Tooltip content="How quickly you collect cash from customers. Lower days = better cash flow." />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* DSO Metric - Simplified */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Days Sales Outstanding</span>
              <Tooltip content="Average days to collect payment after a sale. Ideally under 35 days for healthy cash flow." variant="blue" />
            </div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <TrendingUp className="w-3 h-3" />
              <span>+4 days</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">42</span>
            <span className="text-2xl text-gray-500">days</span>
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">Needs improvement</span>
          </div>

          {/* Simple visual bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-amber-500 h-full" style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="text-green-600 font-medium">30 days (Target)</span>
            <span className="text-amber-600 font-medium">You're here</span>
            <span className="text-red-600">60+ days</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Key Insight */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>Collections are slowing</p>
              <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>
                You have <span style={{ fontWeight: 600 }}>₹18.2L locked in receivables</span>. Reducing DSO to 35 days would free up <span style={{ fontWeight: 600 }}>₹4.2L cash</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 600 }}>Quick wins:</p>
              <ul className="text-[13px] text-gray-500 space-y-1 leading-relaxed" style={{ fontWeight: 400 }}>
                <li>• Send invoices immediately after delivery</li>
                <li>• Offer 2% discount for payment within 10 days</li>
                <li>• Weekly follow-ups on overdue accounts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simple breakdown - collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-brand font-medium hover:text-brand-dark flex items-center gap-2">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            View calculation
          </summary>
          <div className="mt-3 text-xs space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Accounts Receivable</span>
              <span className="font-semibold">₹18.2L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Revenue</span>
              <span className="font-semibold">₹4.33L</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">DSO</span>
              <span className="font-bold text-amber-600">42 days</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

// 3. Profitability Card
function ProfitabilityCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Clean Header */}
      <div className="widget-header p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-brand" />
            <h3 className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>Profitability</h3>
          </div>
          <Tooltip content="How much profit you keep from each rupee of revenue after all expenses." />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Net Margin - Simplified */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Net Profit Margin</span>
              <Tooltip content="Net Profit ÷ Revenue. Shows profitability after all costs. Strong: 10-20%, Excellent: 20%+" variant="blue" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+2%</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">18%</span>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">Strong</span>
          </div>

          {/* Simple visual bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-green-500 h-full" style={{ width: '72%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="text-red-600">5%</span>
            <span className="text-green-600 font-medium">You're here (18%)</span>
            <span>25%</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Profit Breakdown - Visual */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Where does ₹100 revenue go?</span>
          </div>
          
          <div className="space-y-2">
            {/* Revenue bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">COGS</span>
              <div className="flex-1 bg-red-100 h-8 rounded-lg flex items-center px-3" style={{ width: '40%' }}>
                <span className="text-xs font-semibold text-red-700">₹40</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">Operating</span>
              <div className="flex-1 bg-orange-100 h-8 rounded-lg flex items-center px-3" style={{ width: '35%' }}>
                <span className="text-xs font-semibold text-orange-700">₹35</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">Other</span>
              <div className="flex-1 bg-amber-100 h-8 rounded-lg flex items-center px-3" style={{ width: '7%' }}>
                <span className="text-xs font-semibold text-amber-700">₹7</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">Profit</span>
              <div className="flex-1 bg-green-100 h-8 rounded-lg flex items-center px-3" style={{ width: '18%' }}>
                <span className="text-xs font-semibold text-green-700">₹18</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Key Insight */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>Strong profitability</p>
              <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>
                Your 18% margin is well above the 10-15% average. Every 1% reduction in COGS would add <span style={{ fontWeight: 600 }}>₹1.6L profit</span> annually.
              </p>
            </div>
          </div>
        </div>

        {/* Simple breakdown - collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-brand font-medium hover:text-brand-dark flex items-center gap-2">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            View calculation
          </summary>
          <div className="mt-3 text-xs space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">₹158.2L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-semibold text-red-600">-₹129.7L</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">Net Profit</span>
              <span className="font-bold text-green-600">₹28.5L (18%)</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

// 4. Cash Health Card
function CashHealthCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Clean Header */}
      <div className="widget-header p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>Cash Runway</h3>
          </div>
          <Tooltip content="How long you can operate at current burn rate before running out of cash." />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Runway - Simplified */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cash Runway</span>
              <Tooltip content="Cash Balance ÷ Monthly Burn Rate. Safe: 6-12 months, Critical: under 3 months." variant="blue" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-brand" />
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">6.8</span>
            <span className="text-2xl text-gray-500">months</span>
            <span className="text-sm text-brand bg-brand-light px-2 py-1 rounded-lg font-medium">Safe</span>
          </div>

          {/* Timeline visualization */}
          <div className="bg-gradient-to-r from-green-500 via-brand to-amber-500 h-2 rounded-full mb-2"></div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="text-green-600 font-medium">Today</span>
            <span className="text-brand font-medium">Q1 End</span>
            <span className="text-amber-600 font-medium">Aug '26</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Operating Cashflow Ratio */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cashflow Ratio</span>
              <Tooltip content="Operating Cashflow ÷ Current Liabilities. Shows cash generation strength. Healthy: 1.0x+" variant="blue" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-gray-900">1.8x</span>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">Strong</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Key Insight */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>Runway ends August 2026</p>
              <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>
                Start fundraising discussions now. Aim to close funding by <span style={{ fontWeight: 600 }}>May 2026</span> (3 months before runway ends).
              </p>
            </div>
          </div>
        </div>

        {/* Extend runway tips */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>Ways to extend runway</p>
              <ul className="text-[13px] text-gray-500 space-y-1 leading-relaxed" style={{ fontWeight: 400 }}>
                <li>• Reduce DSO by 7 days → <span style={{ fontWeight: 600 }}>+2 months</span></li>
                <li>• Clear slow inventory → <span style={{ fontWeight: 600 }}>+1 month</span></li>
                <li>• Cut burn by 20% → <span style={{ fontWeight: 600 }}>+1.7 months</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simple breakdown - collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-brand font-medium hover:text-brand-dark flex items-center gap-2">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            View calculation
          </summary>
          <div className="mt-3 text-xs space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Balance</span>
              <span className="font-semibold">₹14.8L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Burn</span>
              <span className="font-semibold">₹2.18L</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">Runway</span>
              <span className="font-bold text-brand">6.8 months</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

// Ratio Action Panel - Simplified
function RatioActionPanel() {
  const actions = [
    {
      priority: 'HIGH PRIORITY',
      timeline: 'This Week',
      title: 'Reduce DSO from 42 → 35 days',
      description: 'Implement weekly AR follow-ups and 2% early payment discount.',
      impact: 'Impact: Free up ₹4.2L cash, +2 months runway',
      icon: AlertTriangle,
    },
    {
      priority: 'MEDIUM',
      timeline: 'Next 2 Weeks',
      title: 'Clear slow-moving inventory',
      description: '₹2.8L in slow inventory. Run promotions or bundle deals.',
      impact: 'Impact: Free up ₹2.0L cash, +1 month runway',
      icon: Clock,
    },
    {
      priority: 'MEDIUM',
      timeline: 'This Month',
      title: 'Reduce COGS from 40% → 38%',
      description: 'Renegotiate supplier contracts for volume discounts.',
      impact: 'Impact: 18% → 20% margin, +₹3.2L profit',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[18px] text-gray-900 flex items-center gap-2.5" style={{ fontWeight: 600 }}>
            <Zap className="w-5 h-5 text-brand" />
            Top Priority Actions
          </h3>
          <p className="text-[13px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>Biggest impact opportunities</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={index} className="flex items-start gap-3.5 px-4 py-3.5 bg-gray-50/80 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <div className="flex-shrink-0 w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center">
                <Icon className="w-[18px] h-[18px] text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] bg-brand text-white px-2 py-0.5 rounded-md" style={{ fontWeight: 600 }}>{action.priority}</span>
                  <span className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{action.timeline}</span>
                </div>
                <h4 className="text-[14px] text-gray-900 mb-0.5" style={{ fontWeight: 600 }}>{action.title}</h4>
                <p className="text-[13px] text-gray-500 mb-2" style={{ fontWeight: 400 }}>{action.description}</p>
                <div className="flex items-center gap-1.5 text-[13px] text-brand" style={{ fontWeight: 500 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{action.impact}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-brand text-white rounded-lg text-[13px] hover:bg-brand-hover transition-all flex-shrink-0" style={{ fontWeight: 500 }}>
                Create Task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
