import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Clock, IndianRupee, FileText, Users, Calendar, Shield, Zap, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

// Finance Health Metrics Component - Minimal & Clean
export function FinanceHealthMetricsComponent() {
  const healthScore = 62;
  const scoreColor = healthScore >= 75 ? 'text-emerald-600' : healthScore >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = healthScore >= 75 ? 'bg-emerald-50' : healthScore >= 50 ? 'bg-amber-50' : 'bg-red-50';

  const criticalMetrics = [
    {
      label: 'Cash Runway',
      value: '8.5 months',
      insight: 'Below safety threshold',
      icon: Clock
    },
    {
      label: 'Overdue Receivables',
      value: '₹3.2L',
      insight: 'Collect = +2 months runway',
      icon: AlertTriangle
    },
    {
      label: 'Monthly Burn',
      value: '₹52K',
      insight: 'Up 18% last month',
      icon: TrendingDown
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 mb-0.5" style={{ fontSize: '20px', fontWeight: 600 }}>Finance Health Score</h2>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>Based on data completeness and key indicators</p>
        </div>
        <div className={`${scoreBg} rounded-xl px-5 py-3 border border-gray-100`}>
          <div className={`${scoreColor} mb-0.5`} style={{ fontSize: '30px', fontWeight: 700 }}>{healthScore}</div>
          <div className="text-gray-500 text-center" style={{ fontSize: '13px', fontWeight: 500 }}>out of 100</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {criticalMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 500 }}>{metric.label}</span>
              </div>
              <div className="text-gray-900 mb-0.5" style={{ fontSize: '20px', fontWeight: 700 }}>{metric.value}</div>
              <div className="text-gray-600" style={{ fontSize: '13px' }}>{metric.insight}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cash Health Snapshot - Minimal
export function CashHealthSnapshotComponent() {
  const cashData = [
    { month: 'Oct', inflows: 8.5, outflows: 9.2, net: -0.7 },
    { month: 'Nov', inflows: 7.8, outflows: 8.5, net: -0.7 },
    { month: 'Dec', inflows: 9.2, outflows: 8.8, net: 0.4 }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="mb-4">
        <h3 className="text-gray-900 mb-0.5" style={{ fontSize: '16px', fontWeight: 600 }}>Cash Flow Trend</h3>
        <p className="text-gray-500" style={{ fontSize: '13px' }}>Last 3 months • In lakhs (₹)</p>
      </div>
      
      <div className="w-full" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height={180} minWidth={0}>
          <ComposedChart data={cashData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tickFormatter={(value) => `₹${value}L`}
            />
            <Tooltip 
              formatter={(value: number) => `₹${value}L`}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '11px',
                padding: '8px 10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            <Bar dataKey="inflows" fill="#10b981" name="Money In" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflows" fill="#ef4444" name="Money Out" radius={[4, 4, 0, 0]} />
            <Line 
              type="monotone" 
              dataKey="net" 
              stroke="#6366f1" 
              strokeWidth={2}
              name="Net"
              dot={{ fill: '#6366f1', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insight - Minimal */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-gray-900 mb-0.5" style={{ fontSize: '13px', fontWeight: 500 }}>Burn Rate Increasing</div>
            <div className="text-gray-600" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              Burning ₹52K/month. At this pace, cash runs out by <strong className="text-gray-900">Sep 2026</strong>. 
              Collect ₹3.2L overdue to extend by 2 months.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// What Needs Fixing - Cleaner, more minimal
export function WhatNeedsFixingComponent() {
  const priorities = [
    {
      priority: 1,
      title: 'Collect ₹3.2L Overdue Receivables',
      impact: '+2 months cash runway',
      why: '38% of receivables are 60+ days overdue',
      action: 'Send payment reminders to top 3 clients',
      timeline: '2 weeks',
      savings: '₹3.2L'
    },
    {
      priority: 2,
      title: 'Fix GST ITC Mismatch',
      impact: 'Unlock ₹85K blocked credit',
      why: 'GST returns show mismatches—risking penalties',
      action: 'Reconcile vendor invoices and refile GSTR-3B',
      timeline: '3-5 days',
      savings: '₹85K'
    },
    {
      priority: 3,
      title: 'Cut Overlapping Software Costs',
      impact: 'Save ₹1.8L annually',
      why: 'Paying for 3 tools that do the same thing',
      action: 'Cancel 2 subscriptions, consolidate to one',
      timeline: '1 day',
      savings: '₹15K/mo'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-gray-900" />
        <div>
          <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>What Needs Fixing First</h3>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>3 actions that will make the biggest impact</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {priorities.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-sm">
                <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{item.priority}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</h4>
                  <div className="bg-white px-2.5 py-1 rounded-md border border-gray-200">
                    <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{item.savings}</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 mb-2" style={{ fontSize: '13px' }}>
                  <div>
                    <span className="text-gray-900" style={{ fontWeight: 500 }}>Impact:</span>
                    <span className="ml-1 text-gray-600">{item.impact}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-900" style={{ fontWeight: 500 }}>Why:</span>
                    <span className="ml-1 text-gray-600">{item.why}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-md p-2.5 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 500 }}>Action</span>
                  </div>
                  <p className="text-gray-700" style={{ fontSize: '13px', lineHeight: '1.6' }}>{item.action}</p>
                  <div className="mt-1.5 text-gray-500" style={{ fontSize: '13px' }}>⏱️ {item.timeline}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Potential - Minimal */}
      <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Total Quick Win Potential</div>
            <div className="text-gray-500" style={{ fontSize: '13px' }}>If you fix these 3 in next 30 days</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-600" style={{ fontSize: '24px', fontWeight: 700 }}>₹5.05L</div>
            <div className="text-gray-500" style={{ fontSize: '13px' }}>One-time + Annual</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compliance Risk - Minimal
export function ComplianceRiskCheckComponent() {
  const risks = [
    {
      issue: 'Books not audit-ready',
      consequence: 'Can\'t raise funding or file taxes properly',
      icon: XCircle,
      severity: 'High'
    },
    {
      issue: 'GST ITC mismatch detected',
      consequence: '₹85K credit blocked + penalty risk',
      icon: AlertTriangle,
      severity: 'Medium'
    },
    {
      issue: 'TDS filings up to date',
      consequence: 'No action needed',
      icon: CheckCircle2,
      severity: 'Good'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-gray-900" />
        <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>Compliance Status</h3>
      </div>
      
      <div className="space-y-2.5">
        {risks.map((risk, index) => {
          const Icon = risk.icon;
          const severityColor = risk.severity === 'Good' ? 'text-emerald-600' : risk.severity === 'High' ? 'text-red-600' : 'text-amber-600';
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-start gap-2.5">
                <Icon className={`w-4 h-4 ${severityColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 500 }}>{risk.issue}</span>
                    <span className={`${severityColor} uppercase tracking-wide`} style={{ fontSize: '13px', fontWeight: 600 }}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>{risk.consequence}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Receivables & Payables - Minimal and compact
export function ReceivablesPayablesComponent() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Receivables */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Money Owed to You</h4>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-gray-500 mb-1" style={{ fontSize: '13px' }}>Total Outstanding</div>
            <div className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>₹8.4L</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>60+ days overdue</span>
              <span className="text-red-600" style={{ fontSize: '16px', fontWeight: 700 }}>₹3.2L</span>
            </div>
            <div className="text-gray-500" style={{ fontSize: '13px' }}>38% very old—collect first</div>
          </div>

          <div>
            <div className="text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 500 }}>Top 3 Overdue</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Client A</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹2.8L</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Client B</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹1.6L</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Client C</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹1.2L</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payables */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Money You Owe</h4>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-gray-500 mb-1" style={{ fontSize: '13px' }}>Total Due</div>
            <div className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>₹6.2L</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Due in 30 days</span>
              <span className="text-amber-600" style={{ fontSize: '16px', fontWeight: 700 }}>₹4.1L</span>
            </div>
            <div className="text-gray-500" style={{ fontSize: '13px' }}>Have cash ready to pay</div>
          </div>

          <div>
            <div className="text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 500 }}>Largest Obligations</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Vendor X</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹2.3L</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Vendor Y</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹1.8L</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                <span className="text-gray-600">Tax Dues</span>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>₹1.2L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Finance Warning Footer - Minimal
export function FinanceWarningFooterComponent() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-gray-600 leading-relaxed" style={{ fontSize: '13px' }}>
            This analysis is based on the data you provided. For a comprehensive finance audit and personalized action plan, 
            <strong className="text-gray-900"> book a free consultation with our finance team.</strong> We'll verify these insights, 
            identify hidden risks, and build you a custom roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}