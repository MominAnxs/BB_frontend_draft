'use client';

import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  IndianRupee,
  PieChart as PieChartIcon,
  Target,
  AlertTriangle,
  Zap,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Users,
  Truck,
  CreditCard,
  Building,
  BarChart3,
  Activity,
  Package,
  ShoppingCart,
  Wallet,
  Home,
  Wifi,
  Phone,
  FileText,
  Table
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend } from 'recharts';
import { DirectExpensesDrawer, IndirectExpensesDrawer, ExpenseSalesDrawer, ExpensesBreakdownDrawer } from './ExpensesModuleDrawers';

interface ExpensesModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function ExpensesModule({ diagnosticData, onAskBregoGPT }: ExpensesModuleProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'directExpenses' | 'indirectExpenses' | 'expenseSales' | 'breakdown' | null>(null);

  const businessType = diagnosticData?.businessType;
  const isServiceBusiness = businessType === 'Trading, Manufacturing or Services';

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Sub-header */}
      <div className="subheader-glass sticky top-0 z-20 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 600 }}>Expenses</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Service delivery and operational costs' : 'Cost analysis and vendor tracking'}
            </p>
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
                aria-controls="expenses-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <div id="expenses-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
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
            {isServiceBusiness ? (
              <>
                <ExpensesVsRevenueCard onDrillDown={() => setActiveDrawer('expenseSales')} />
                <CostTypeBreakdownCard onDrillDown={() => setActiveDrawer('breakdown')} />
                <OperatingExpensesCard onDrillDown={() => setActiveDrawer('directExpenses')} />
                <EmployeeCostsCard onDrillDown={() => setActiveDrawer('indirectExpenses')} />
              </>
            ) : (
              <>
                <ExpensesVsSalesCard onDrillDown={() => setActiveDrawer('expenseSales')} />
                <ExpensesBreakdownTableCard onDrillDown={() => setActiveDrawer('breakdown')} />
                <Top5DirectExpensesCard onDrillDown={() => setActiveDrawer('directExpenses')} />
                <Top5IndirectExpensesCard onDrillDown={() => setActiveDrawer('indirectExpenses')} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Components */}
      {activeDrawer === 'directExpenses' && <DirectExpensesDrawer onClose={() => setActiveDrawer(null)} businessType={businessType} />}
      {activeDrawer === 'indirectExpenses' && <IndirectExpensesDrawer onClose={() => setActiveDrawer(null)} />}
      {activeDrawer === 'expenseSales' && <ExpenseSalesDrawer onClose={() => setActiveDrawer(null)} />}
      {activeDrawer === 'breakdown' && <ExpensesBreakdownDrawer onClose={() => setActiveDrawer(null)} />}
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

function TrendBadge({ change, trend }: { change: number; trend: string }) {
  if (trend === 'neutral') return <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>—</span>;
  const isUp = trend === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[13px] ${
      isUp ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
    }`} style={{ fontWeight: 600 }}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? '+' : ''}{change}%
    </span>
  );
}

// ─── Shared: Expense List Card (used by Direct, Indirect, Operating, Employee) ─
function ExpenseListCard({ 
  title, icon: Icon, tooltip, expenses, summaryLeft, summaryRight, insights, onDrillDown, headerRight, typeBadgeKey, typeBadgeColors
}: {
  title: string;
  icon: any;
  tooltip: string;
  expenses: { rank: number; category: string; amount: number; percentOfSales: number; change: number; trend: string; color: string; icon: any; type?: string }[];
  summaryLeft: { label: string; value: string; color?: string };
  summaryRight: { label: string; value: string; color?: string };
  insights: { text: React.ReactNode }[];
  onDrillDown: () => void;
  headerRight?: React.ReactNode;
  typeBadgeKey?: string;
  typeBadgeColors?: Record<string, string>;
}) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 min-h-[520px] flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>{title}</h3>
          </div>
          <TooltipIcon content={tooltip} />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Ranked by amount</span>
          {headerRight}
        </div>

        {/* Expense rows */}
        <div className="space-y-1 flex-1">
          {expenses.map((expense) => {
            const ItemIcon = expense.icon;
            return (
              <div key={expense.rank} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${expense.color}12` }}>
                  <ItemIcon className="w-[18px] h-[18px]" style={{ color: expense.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 500 }}>{expense.category}</p>
                    {typeBadgeKey && expense.type && (
                      <span className={`px-1.5 py-px rounded text-[13px] flex-shrink-0 ${
                        typeBadgeColors?.[expense.type] || 'bg-gray-100 text-gray-500'
                      }`} style={{ fontWeight: 600 }}>
                        {expense.type}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{expense.percentOfSales}% of sales</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{expense.amount}L</span>
                  <TrendBadge change={expense.change} trend={expense.trend} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{summaryLeft.label}</span>
          <span className={`text-[18px] tabular-nums ${summaryLeft.color || 'text-brand'}`} style={{ fontWeight: 700 }}>{summaryLeft.value}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{summaryRight.label}</span>
          <span className={`text-[18px] tabular-nums ${summaryRight.color || 'text-gray-900'}`} style={{ fontWeight: 700 }}>{summaryRight.value}</span>
        </div>

        {/* Insights */}
        <button onClick={() => setShowInsights(!showInsights)} className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
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
                <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>{insight.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Drill Down */}
        <button onClick={onDrillDown} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Drill Down</span>
        </button>
      </div>
    </div>
  );
}

// ─── 1. Top 5 Direct Expenses ───────────────────────────────────────────────
function Top5DirectExpensesCard({ onDrillDown }: { onDrillDown: () => void }) {
  const directExpenses = [
    { rank: 1, category: 'COGS', amount: 8.2, percentOfSales: 22.6, change: 12.5, trend: 'up', color: '#204CC7', icon: ShoppingCart },
    { rank: 2, category: 'Shipping & Logistics', amount: 3.5, percentOfSales: 9.6, change: -5.8, trend: 'down', color: '#3A5FD4', icon: Truck },
    { rank: 3, category: 'Payment Gateway Fees', amount: 1.8, percentOfSales: 5.0, change: 8.3, trend: 'up', color: '#5A7ADF', icon: CreditCard },
    { rank: 4, category: 'Packaging Materials', amount: 1.4, percentOfSales: 3.9, change: 3.2, trend: 'up', color: '#7A96E4', icon: Package },
    { rank: 5, category: 'Returns & Refunds', amount: 1.2, percentOfSales: 3.3, change: -12.4, trend: 'down', color: '#9AB2EE', icon: AlertTriangle }
  ];
  const totalDirect = directExpenses.reduce((sum, item) => sum + item.amount, 0);
  const avgPct = (directExpenses.reduce((sum, item) => sum + item.percentOfSales, 0) / directExpenses.length).toFixed(1);

  return (
    <ExpenseListCard
      title="Top 5 Direct Expenses"
      icon={ShoppingCart}
      tooltip="<strong style='color: #204CC7;'>Direct Expenses</strong><br/><br/>Costs directly linked to producing and delivering products:<br/>• COGS, Shipping, Payment fees<br/>• Packaging, Returns<br/>• Directly proportional to sales volume"
      expenses={directExpenses}
      summaryLeft={{ label: 'Avg % of Sales', value: `${avgPct}%`, color: 'text-gray-900' }}
      summaryRight={{ label: 'Total Direct', value: `₹${totalDirect.toFixed(1)}L` }}
      headerRight={<span className="text-[13px] text-brand" style={{ fontWeight: 600 }}>₹{totalDirect.toFixed(1)}L total</span>}
      insights={[
        { text: <><span style={{ fontWeight: 600 }}>COGS at 22.6% of sales</span> — negotiate bulk pricing with suppliers to reduce unit costs.</> },
        { text: <>Shipping costs decreased by <span style={{ fontWeight: 600 }}>5.8%</span> — logistics optimization is working well.</> }
      ]}
      onDrillDown={onDrillDown}
    />
  );
}

// ─── 2. Top 5 Indirect Expenses ─────────────────────────────────────────────
function Top5IndirectExpensesCard({ onDrillDown }: { onDrillDown: () => void }) {
  const indirectExpenses = [
    { rank: 1, category: 'Salaries & Wages', amount: 5.8, type: 'Fixed', percentOfSales: 16.0, change: 3.2, trend: 'up', color: '#204CC7', icon: Users },
    { rank: 2, category: 'Marketing & Advertising', amount: 3.4, type: 'Variable', percentOfSales: 9.4, change: 18.3, trend: 'up', color: '#3A5FD4', icon: Target },
    { rank: 3, category: 'Rent & Utilities', amount: 2.5, type: 'Fixed', percentOfSales: 6.9, change: 0.0, trend: 'neutral', color: '#5A7ADF', icon: Building },
    { rank: 4, category: 'Office Supplies', amount: 0.8, type: 'Variable', percentOfSales: 2.2, change: -8.5, trend: 'down', color: '#7A96E4', icon: FileText },
    { rank: 5, category: 'Software & Subscriptions', amount: 0.6, type: 'Fixed', percentOfSales: 1.7, change: 12.0, trend: 'up', color: '#9AB2EE', icon: Wifi }
  ];
  const fixedTotal = indirectExpenses.filter(e => e.type === 'Fixed').reduce((sum, item) => sum + item.amount, 0);
  const variableTotal = indirectExpenses.filter(e => e.type === 'Variable').reduce((sum, item) => sum + item.amount, 0);

  return (
    <ExpenseListCard
      title="Top 5 Indirect Expenses"
      icon={Building}
      tooltip="<strong style='color: #204CC7;'>Indirect Expenses</strong><br/><br/>Operating costs not directly tied to production:<br/>• <strong>Fixed:</strong> Salaries, Rent (constant)<br/>• <strong>Variable:</strong> Marketing, Supplies (fluctuate)<br/>• Support business operations"
      expenses={indirectExpenses}
      summaryLeft={{ label: 'Fixed Expenses', value: `₹${fixedTotal.toFixed(1)}L` }}
      summaryRight={{ label: 'Variable Expenses', value: `₹${variableTotal.toFixed(1)}L` }}
      headerRight={
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-brand-light rounded-md text-[13px] text-brand" style={{ fontWeight: 600 }}>Fixed ₹{fixedTotal.toFixed(1)}L</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[13px] text-gray-600" style={{ fontWeight: 600 }}>Variable ₹{variableTotal.toFixed(1)}L</span>
        </div>
      }
      typeBadgeKey="type"
      typeBadgeColors={{ Fixed: 'bg-brand-light text-brand', Variable: 'bg-gray-100 text-gray-500' }}
      insights={[
        { text: <><span style={{ fontWeight: 600 }}>Marketing spend up 18.3%</span> — ensure ROI justifies increased investment.</> },
        { text: <>Fixed costs at <span style={{ fontWeight: 600 }}>₹8.9L</span> remain stable, providing predictable baseline.</> }
      ]}
      onDrillDown={onDrillDown}
    />
  );
}

// ─── 3. Expenses vs Sales Card ──────────────────────────────────────────────
function ExpensesVsSalesCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const data = [
    { month: 'Aug', sales: 35.2, expenses: 16.2, netProfit: 19.0 },
    { month: 'Sep', sales: 37.5, expenses: 17.5, netProfit: 20.0 },
    { month: 'Oct', sales: 38.8, expenses: 18.1, netProfit: 20.7 },
    { month: 'Nov', sales: 41.2, expenses: 19.3, netProfit: 21.9 },
    { month: 'Dec', sales: 45.6, expenses: 21.8, netProfit: 23.8 },
    { month: 'Jan', sales: 39.4, expenses: 18.4, netProfit: 21.0 }
  ];
  const avgMargin = 53.2;
  const totalSales = 237.7;
  const totalExpenses = 111.3;

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
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 min-h-[520px] flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Expenses vs Sales</h3>
          </div>
          <TooltipIcon content="<strong>Expense-to-Sales Ratio</strong><br/><br/>Track profitability trends:<br/>• <strong>Green:</strong> Sales revenue<br/>• <strong>Red:</strong> Total expenses<br/>• <strong>Gap:</strong> Larger gap = higher profit" />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Revenue vs Cost Performance</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md text-[13px] text-green-600" style={{ fontWeight: 600 }}>
            <TrendingUp className="w-3.5 h-3.5" />
            {avgMargin}% Avg Margin
          </span>
        </div>

        <div className="w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Line key="line-sales" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Sales" />
              <Line key="line-expenses" type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} name="Expenses" />
              <Line key="line-netProfit" type="monotone" dataKey="netProfit" stroke="#204CC7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#204CC7' }} activeDot={{ r: 5 }} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
          {[
            { label: 'Sales', value: `₹${totalSales}L`, dotColor: 'bg-green-500', bg: 'bg-green-50/70' },
            { label: 'Expenses', value: `₹${totalExpenses}L`, dotColor: 'bg-red-500', bg: 'bg-red-50/70' },
            { label: 'Profit', value: `₹${(totalSales - totalExpenses).toFixed(1)}L`, dotColor: 'bg-brand', bg: 'bg-brand-light' },
          ].map((pill, i) => (
            <div key={i} className={`px-3.5 py-2.5 ${pill.bg} rounded-xl`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-2 h-2 rounded-full ${pill.dotColor}`} />
                <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{pill.label}</span>
              </div>
              <p className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>{pill.value}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setShowInsights(!showInsights)} className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand" />
            <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
        </button>

        {showInsights && (
          <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                Consistent <span style={{ fontWeight: 600 }}>53.2% avg margin</span> indicates healthy expense management.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                December margin dip to <span style={{ fontWeight: 600 }}>52.2%</span> due to seasonal expense spike.
              </p>
            </div>
          </div>
        )}

        <button onClick={onDrillDown} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Drill Down</span>
        </button>
      </div>
    </div>
  );
}

// ─── 4. Expenses Breakdown Table ────────────────────────────────────────────
function ExpensesBreakdownTableCard({ onDrillDown }: { onDrillDown: () => void }) {
  const categories = [
    { category: 'Direct Expenses', current: 16.1, previous: 14.3, change: 12.6, vendors: 8 },
    { category: 'Indirect Expenses', current: 13.1, previous: 12.5, change: 4.8, vendors: 12 },
    { category: 'Administrative', current: 2.4, previous: 2.3, change: 4.3, vendors: 6 },
    { category: 'Financial Charges', current: 0.8, previous: 0.9, change: -11.1, vendors: 3 }
  ];
  const totalCurrent = categories.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = categories.reduce((sum, item) => sum + item.previous, 0);
  const overallChange = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 min-h-[520px] flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Table className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Expenses Breakdown</h3>
          </div>
          <TooltipIcon content="<strong>Category-Level Breakdown</strong><br/><br/>Complete expense summary by category:<br/>• Compare current vs previous period<br/>• Track vendor count per category" />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Category-level summary</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-light rounded-md text-[13px] text-brand" style={{ fontWeight: 600 }}>
            <Calendar className="w-3.5 h-3.5" />
            This Month vs Last
          </span>
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-gray-50 rounded-lg">
          <div className="col-span-4 text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Category</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Current</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Previous</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Change</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Vendors</div>
        </div>

        <div className="space-y-1 flex-1">
          {categories.map((cat, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="col-span-4 text-[14px] text-gray-900 truncate" style={{ fontWeight: 500 }}>{cat.category}</div>
              <div className="col-span-2 text-right text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{cat.current}L</div>
              <div className="col-span-2 text-right text-[13px] text-gray-400 tabular-nums" style={{ fontWeight: 400 }}>₹{cat.previous}L</div>
              <div className={`col-span-2 text-right flex items-center justify-end gap-0.5 text-[13px] ${cat.change > 0 ? 'text-red-600' : 'text-green-600'}`} style={{ fontWeight: 600 }}>
                {cat.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{cat.change > 0 ? '+' : ''}{cat.change}%</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="px-2 py-0.5 bg-brand-light text-brand rounded-full text-[13px]" style={{ fontWeight: 600 }}>{cat.vendors}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 py-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
          <div className="col-span-4 text-[14px] text-gray-900" style={{ fontWeight: 700 }}>Total Expenses</div>
          <div className="col-span-2 text-right text-[14px] text-brand tabular-nums" style={{ fontWeight: 700 }}>₹{totalCurrent.toFixed(1)}L</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500 tabular-nums" style={{ fontWeight: 500 }}>₹{totalPrevious.toFixed(1)}L</div>
          <div className={`col-span-2 text-right flex items-center justify-end gap-0.5 text-[13px] ${Number(overallChange) > 0 ? 'text-red-600' : 'text-green-600'}`} style={{ fontWeight: 700 }}>
            {Number(overallChange) > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Number(overallChange) > 0 ? '+' : ''}{overallChange}%</span>
          </div>
          <div className="col-span-2 text-right text-[13px] text-gray-600" style={{ fontWeight: 600 }}>29</div>
        </div>

        <button onClick={onDrillDown} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>View Vendor Breakdown</span>
        </button>
      </div>
    </div>
  );
}

// ─── 5. Operating Expenses (Service) ────────────────────────────────────────
function OperatingExpensesCard({ onDrillDown }: { onDrillDown: () => void }) {
  const operatingExpenses = [
    { rank: 1, category: 'Salaries & Wages', amount: 5.8, type: 'Fixed', percentOfSales: 16.0, change: 3.2, trend: 'up', color: '#204CC7', icon: Users },
    { rank: 2, category: 'Marketing & Advertising', amount: 3.4, type: 'Variable', percentOfSales: 9.4, change: 18.3, trend: 'up', color: '#3A5FD4', icon: Target },
    { rank: 3, category: 'Rent & Utilities', amount: 2.5, type: 'Fixed', percentOfSales: 6.9, change: 0.0, trend: 'neutral', color: '#5A7ADF', icon: Building },
    { rank: 4, category: 'Office Supplies', amount: 0.8, type: 'Variable', percentOfSales: 2.2, change: -8.5, trend: 'down', color: '#7A96E4', icon: FileText },
    { rank: 5, category: 'Software & Subscriptions', amount: 0.6, type: 'Fixed', percentOfSales: 1.7, change: 12.0, trend: 'up', color: '#9AB2EE', icon: Wifi }
  ];
  const fixedTotal = operatingExpenses.filter(e => e.type === 'Fixed').reduce((sum, item) => sum + item.amount, 0);
  const variableTotal = operatingExpenses.filter(e => e.type === 'Variable').reduce((sum, item) => sum + item.amount, 0);

  return (
    <ExpenseListCard
      title="Top 5 Operating Expenses"
      icon={Building}
      tooltip="<strong style='color: #204CC7;'>Operating Expenses</strong><br/><br/>Operating costs not directly tied to production:<br/>• <strong>Fixed:</strong> Salaries, Rent (constant)<br/>• <strong>Variable:</strong> Marketing, Supplies (fluctuate)"
      expenses={operatingExpenses}
      summaryLeft={{ label: 'Fixed Expenses', value: `₹${fixedTotal.toFixed(1)}L` }}
      summaryRight={{ label: 'Variable Expenses', value: `₹${variableTotal.toFixed(1)}L` }}
      headerRight={
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-brand-light rounded-md text-[13px] text-brand" style={{ fontWeight: 600 }}>Fixed ₹{fixedTotal.toFixed(1)}L</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[13px] text-gray-600" style={{ fontWeight: 600 }}>Variable ₹{variableTotal.toFixed(1)}L</span>
        </div>
      }
      typeBadgeKey="type"
      typeBadgeColors={{ Fixed: 'bg-brand-light text-brand', Variable: 'bg-gray-100 text-gray-500' }}
      insights={[
        { text: <><span style={{ fontWeight: 600 }}>Marketing spend up 18.3%</span> — ensure ROI justifies increased investment.</> },
        { text: <>Fixed costs at <span style={{ fontWeight: 600 }}>₹8.9L</span> remain stable, providing predictable baseline.</> }
      ]}
      onDrillDown={onDrillDown}
    />
  );
}

// ─── 6. Employee Costs (Service) ────────────────────────────────────────────
function EmployeeCostsCard({ onDrillDown }: { onDrillDown: () => void }) {
  const employeeCosts = [
    { rank: 1, category: 'Full-Time Salaries', amount: 18.5, type: 'Billable', percentOfSales: 28.5, change: 5.2, trend: 'up', color: '#204CC7', icon: Users },
    { rank: 2, category: 'Contractor/Freelancer', amount: 12.3, type: 'Billable', percentOfSales: 18.9, change: 15.4, trend: 'up', color: '#3A5FD4', icon: Users },
    { rank: 3, category: 'Benefits & Insurance', amount: 3.8, type: 'Non-Billable', percentOfSales: 5.8, change: 4.2, trend: 'up', color: '#5A7ADF', icon: CreditCard },
    { rank: 4, category: 'Admin Staff', amount: 2.9, type: 'Non-Billable', percentOfSales: 4.5, change: 0.0, trend: 'neutral', color: '#7A96E4', icon: Building },
    { rank: 5, category: 'Training & Development', amount: 1.2, type: 'Non-Billable', percentOfSales: 1.8, change: 22.5, trend: 'up', color: '#9AB2EE', icon: FileText }
  ];
  const billableTotal = employeeCosts.filter(e => e.type === 'Billable').reduce((sum, item) => sum + item.amount, 0);
  const nonBillableTotal = employeeCosts.filter(e => e.type === 'Non-Billable').reduce((sum, item) => sum + item.amount, 0);

  return (
    <ExpenseListCard
      title="Top 5 Employee Costs"
      icon={Users}
      tooltip="<strong style='color: #204CC7;'>Employee Costs</strong><br/><br/>People-related expenses:<br/>• <strong>Billable:</strong> Revenue-generating roles<br/>• <strong>Non-Billable:</strong> Support & overhead"
      expenses={employeeCosts}
      summaryLeft={{ label: 'Billable Costs', value: `₹${billableTotal.toFixed(1)}L` }}
      summaryRight={{ label: 'Non-Billable Costs', value: `₹${nonBillableTotal.toFixed(1)}L` }}
      headerRight={
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-brand-light rounded-md text-[13px] text-brand" style={{ fontWeight: 600 }}>Billable ₹{billableTotal.toFixed(1)}L</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[13px] text-gray-600" style={{ fontWeight: 600 }}>Non-Billable ₹{nonBillableTotal.toFixed(1)}L</span>
        </div>
      }
      typeBadgeKey="type"
      typeBadgeColors={{ Billable: 'bg-brand-light text-brand', 'Non-Billable': 'bg-gray-100 text-gray-500' }}
      insights={[
        { text: <><span style={{ fontWeight: 600 }}>Contractor costs up 15.4%</span> — consider converting high-performers to full-time.</> },
        { text: <>Billable ratio at <span style={{ fontWeight: 600 }}>80%</span> of total — healthy balance for service businesses.</> }
      ]}
      onDrillDown={onDrillDown}
    />
  );
}

// ─── 7. Expenses vs Revenue (Service) ───────────────────────────────────────
function ExpensesVsRevenueCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [showInsights, setShowInsights] = useState(false);
  const data = [
    { month: 'Aug', sales: 35.2, expenses: 16.2, netProfit: 19.0 },
    { month: 'Sep', sales: 37.5, expenses: 17.5, netProfit: 20.0 },
    { month: 'Oct', sales: 38.8, expenses: 18.1, netProfit: 20.7 },
    { month: 'Nov', sales: 41.2, expenses: 19.3, netProfit: 21.9 },
    { month: 'Dec', sales: 45.6, expenses: 21.8, netProfit: 23.8 },
    { month: 'Jan', sales: 39.4, expenses: 18.4, netProfit: 21.0 }
  ];
  const avgMargin = 53.2;
  const totalSales = 237.7;
  const totalExpenses = 111.3;

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
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 min-h-[520px] flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Expenses vs Revenue</h3>
          </div>
          <TooltipIcon content="<strong>Expense-to-Revenue Ratio</strong><br/><br/>Track profitability trends:<br/>• <strong>Green:</strong> Revenue<br/>• <strong>Red:</strong> Total expenses<br/>• <strong>Gap:</strong> Larger gap = higher profit" />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Revenue vs Cost Performance</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md text-[13px] text-green-600" style={{ fontWeight: 600 }}>
            <TrendingUp className="w-3.5 h-3.5" />
            {avgMargin}% Avg Margin
          </span>
        </div>

        <div className="w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Line key="line-sales" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Sales" />
              <Line key="line-expenses" type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} name="Expenses" />
              <Line key="line-netProfit" type="monotone" dataKey="netProfit" stroke="#204CC7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#204CC7' }} activeDot={{ r: 5 }} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
          {[
            { label: 'Sales', value: `₹${totalSales}L`, dotColor: 'bg-green-500', bg: 'bg-green-50/70' },
            { label: 'Expenses', value: `₹${totalExpenses}L`, dotColor: 'bg-red-500', bg: 'bg-red-50/70' },
            { label: 'Profit', value: `₹${(totalSales - totalExpenses).toFixed(1)}L`, dotColor: 'bg-brand', bg: 'bg-brand-light' },
          ].map((pill, i) => (
            <div key={i} className={`px-3.5 py-2.5 ${pill.bg} rounded-xl`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-2 h-2 rounded-full ${pill.dotColor}`} />
                <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{pill.label}</span>
              </div>
              <p className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 700 }}>{pill.value}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setShowInsights(!showInsights)} className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand" />
            <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Insights</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-brand transition-transform ${showInsights ? 'rotate-180' : ''}`} />
        </button>

        {showInsights && (
          <div className="px-3.5 py-3 bg-brand-light rounded-xl border border-brand/10 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                Consistent <span style={{ fontWeight: 600 }}>53.2% avg margin</span> indicates healthy expense management.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed" style={{ fontWeight: 400 }}>
                December margin dip to <span style={{ fontWeight: 600 }}>52.2%</span> due to seasonal expense spike.
              </p>
            </div>
          </div>
        )}

        <button onClick={onDrillDown} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>Drill Down</span>
        </button>
      </div>
    </div>
  );
}

// ─── 8. Cost Type Breakdown (Service) ───────────────────────────────────────
function CostTypeBreakdownCard({ onDrillDown }: { onDrillDown: () => void }) {
  const categories = [
    { category: 'Direct Expenses', current: 16.1, previous: 14.3, change: 12.6, vendors: 8 },
    { category: 'Indirect Expenses', current: 13.1, previous: 12.5, change: 4.8, vendors: 12 },
    { category: 'Administrative', current: 2.4, previous: 2.3, change: 4.3, vendors: 6 },
    { category: 'Financial Charges', current: 0.8, previous: 0.9, change: -11.1, vendors: 3 }
  ];
  const totalCurrent = categories.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = categories.reduce((sum, item) => sum + item.previous, 0);
  const overallChange = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 hover:shadow-lg transition-all duration-200 min-h-[520px] flex flex-col">
      <div className="widget-header px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Table className="w-5 h-5 text-brand" />
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>Cost Type Breakdown</h3>
          </div>
          <TooltipIcon content="<strong>Category-Level Breakdown</strong><br/><br/>Complete expense summary by category:<br/>• Compare current vs previous period<br/>• Track vendor count per category" />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>Category-level summary</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-light rounded-md text-[13px] text-brand" style={{ fontWeight: 600 }}>
            <Calendar className="w-3.5 h-3.5" />
            This Month vs Last
          </span>
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-gray-50 rounded-lg">
          <div className="col-span-4 text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Category</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Current</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Previous</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Change</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500" style={{ fontWeight: 600 }}>Vendors</div>
        </div>

        <div className="space-y-1 flex-1">
          {categories.map((cat, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="col-span-4 text-[14px] text-gray-900 truncate" style={{ fontWeight: 500 }}>{cat.category}</div>
              <div className="col-span-2 text-right text-[14px] text-gray-900 tabular-nums" style={{ fontWeight: 600 }}>₹{cat.current}L</div>
              <div className="col-span-2 text-right text-[13px] text-gray-400 tabular-nums" style={{ fontWeight: 400 }}>₹{cat.previous}L</div>
              <div className={`col-span-2 text-right flex items-center justify-end gap-0.5 text-[13px] ${cat.change > 0 ? 'text-red-600' : 'text-green-600'}`} style={{ fontWeight: 600 }}>
                {cat.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{cat.change > 0 ? '+' : ''}{cat.change}%</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="px-2 py-0.5 bg-brand-light text-brand rounded-full text-[13px]" style={{ fontWeight: 600 }}>{cat.vendors}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 py-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
          <div className="col-span-4 text-[14px] text-gray-900" style={{ fontWeight: 700 }}>Total Expenses</div>
          <div className="col-span-2 text-right text-[14px] text-brand tabular-nums" style={{ fontWeight: 700 }}>₹{totalCurrent.toFixed(1)}L</div>
          <div className="col-span-2 text-right text-[13px] text-gray-500 tabular-nums" style={{ fontWeight: 500 }}>₹{totalPrevious.toFixed(1)}L</div>
          <div className={`col-span-2 text-right flex items-center justify-end gap-0.5 text-[13px] ${Number(overallChange) > 0 ? 'text-red-600' : 'text-green-600'}`} style={{ fontWeight: 700 }}>
            {Number(overallChange) > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Number(overallChange) > 0 ? '+' : ''}{overallChange}%</span>
          </div>
          <div className="col-span-2 text-right text-[13px] text-gray-600" style={{ fontWeight: 600 }}>29</div>
        </div>

        <button onClick={onDrillDown} className="w-full flex items-center gap-2 px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowRight className="w-4 h-4 text-brand" />
          <span className="text-[13px] text-brand" style={{ fontWeight: 500 }}>View Vendor Breakdown</span>
        </button>
      </div>
    </div>
  );
}
