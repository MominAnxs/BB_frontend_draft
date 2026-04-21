import { 
  FinanceHealthMetricsComponent,
  WhatNeedsFixingComponent,
  CashHealthSnapshotComponent,
  ReceivablesPayablesComponent,
  ComplianceRiskCheckComponent,
  FinanceWarningFooterComponent
} from '../chat/FinanceReportComponents';

interface FinanceHealthReportProps {
  companyName?: string;
  revenueRange?: string;
}

export function FinanceHealthReport({ 
  companyName = 'Sample Business',
  revenueRange = '₹1-5 Cr'
}: FinanceHealthReportProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>Finance Health Report</span>
            </h2>
            <p className="text-sm text-gray-600">
              <strong className="font-semibold text-gray-900">{companyName}</strong> 
              <span className="text-gray-400 mx-2">•</span> 
              <span className="text-gray-600">Annual Revenue: {revenueRange}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Finance Health Score */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
        <FinanceHealthMetricsComponent />
      </div>

      {/* What Needs Fixing */}
      <div className="bg-gradient-to-br from-red-50/30 to-white rounded-2xl px-8 py-6 shadow-sm border border-red-100">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900">What Needs Fixing</h3>
          <span className="ml-auto text-xs font-medium text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Critical Issues</span>
        </div>
        <WhatNeedsFixingComponent />
      </div>

      {/* Cash Flow Trend */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📊</span>
          <h3 className="text-lg font-semibold text-gray-900">Cash Flow Trend</h3>
        </div>
        <CashHealthSnapshotComponent />
      </div>

      {/* Receivables & Payables */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">💳</span>
          <h3 className="text-lg font-semibold text-gray-900">Receivables & Payables</h3>
        </div>
        <ReceivablesPayablesComponent />
      </div>

      {/* Compliance Risk Check */}
      <div className="bg-gradient-to-br from-amber-50/30 to-white rounded-2xl px-8 py-6 shadow-sm border border-amber-100">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">🛡️</span>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Risk Check</h3>
        </div>
        <ComplianceRiskCheckComponent />
      </div>

      {/* Warning Footer */}
      <div className="bg-amber-50/50 rounded-2xl px-8 py-5 shadow-sm border border-amber-200">
        <FinanceWarningFooterComponent />
      </div>
    </div>
  );
}
