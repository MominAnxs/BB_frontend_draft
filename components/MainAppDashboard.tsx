import { BregoLogo } from './BregoLogo';
import { NavTabs } from './NavTabs';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Users, 
  Database,
  Bell,
  ChevronDown,
  Share2,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Crown
} from 'lucide-react';

export function MainAppDashboard() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <BregoLogo size={36} variant="full" />
          </div>

          {/* Main Nav */}
          <div className="flex items-center gap-1">
            <button className="nav-pill">
              Performance Market...
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </div>

          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false },
            { id: 'reports', label: 'Reports', icon: FileText, isActive: true },
            { id: 'workspace', label: 'Workspace', icon: Users, isActive: false },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false },
          ]} />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-black/4 rounded-full transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">
            B
          </button>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-44 sidebar-glass flex flex-col">
          <div className="p-4">
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-brand-light text-brand rounded-lg text-sm">
              <LayoutDashboard className="w-4 h-4" />
              Business Overview
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 mb-2 px-3">Reports</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm transition-colors">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                Meta Ads
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm transition-colors">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                Google Ads
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm transition-colors">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                Shopify
              </button>
            </div>
          </div>

          {/* Free Trial Reminder - Push to bottom */}
          <div className="mt-auto p-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/60">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-gray-900">Free Trial</span>
                <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">7 Days Left</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Upgrade to unlock all features and keep your data.</p>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  Ask Brego
                </button>
                <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Filter">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Share">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                  All
                  <span className="bg-brand text-white text-xs px-1.5 py-0.5 rounded">24</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <MetricCard
                label="Revenue"
                value="₹3,538.95"
                avatars={2}
                trend={-13.6}
                negative
              />
              <MetricCard
                label="Spends"
                value="22"
                avatars={2}
                trend={22.6}
                positive
              />
              <MetricCard
                label="ROAS"
                value="₹2.00"
                avatars={2}
                trend={-13.6}
                negative
              />
              <MetricCard
                label="Purchase"
                value="₹77,856.87"
                avatars={2}
                trend={22.6}
                positive
              />
              <MetricCard
                label="Cost Per Purchase"
                value="₹77,856.87"
                avatars={2}
                trend={22.6}
                positive
              />
              <MetricCard
                label="AOV"
                value="₹77,856.87"
                avatars={2}
                trend={22.6}
                positive
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ChartCard
                title="Spends"
                subtitle="KSM Achieved"
                percentage={54}
                value="₹3.0M"
                target="₹1.6M"
              />
              <ChartCard
                title="Revenue"
                subtitle="KSM Achieved"
                percentage={62}
                value="₹7.6M"
                target="₹12.3M"
              />
              <ChartCard
                title="ROAS"
                subtitle="KSM Achieved"
                percentage={111}
                value="3.37"
                target="3.37"
              />
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900">Month on Month Performance Report</h3>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" aria-label="Performance report info">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                    </svg>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-brand hover:bg-brand-light rounded-lg text-sm transition-colors">
                  Filter by
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs text-gray-600">MOM</th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Spends</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">Revenue</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-brand text-white text-xs rounded">ROAS</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-400 text-white text-xs rounded">Purchases</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-300 text-white text-xs rounded">Cost per purchase</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">AOV</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-400 text-white text-xs rounded">Conversion rate</span>
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-gray-600">Impr...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow month="Jan-24" />
                    <TableRow month="Feb-24" />
                    <TableRow month="Mar-25" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  avatars, 
  trend, 
  positive, 
  negative 
}: { 
  label: string; 
  value: string; 
  avatars: number; 
  trend: number; 
  positive?: boolean; 
  negative?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      <div className="text-xl text-gray-900 mb-2">{value}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center -space-x-1">
          <div className="w-5 h-5 bg-brand rounded-full border-2 border-white flex items-center justify-center text-white text-xs">B</div>
          <div className="w-5 h-5 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">A</div>
        </div>
        <div className={`flex items-center gap-1 text-xs ${negative ? 'text-red-500' : 'text-green-500'}`}>
          {negative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}

function ChartCard({ 
  title, 
  subtitle, 
  percentage, 
  value, 
  target 
}: { 
  title: string; 
  subtitle: string; 
  percentage: number; 
  value: string; 
  target: string; 
}) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {title}
          <span className="w-2 h-2 bg-brand rounded-full"></span>
          <span className="text-gray-500">{subtitle}</span>
          <span className="text-gray-400 text-xs">KSM Target</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors" aria-label="More options">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="24"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="none"
            stroke="#204CC7"
            strokeWidth="24"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-3xl text-gray-900">{percentage}%</div>
        </div>
        {/* Value labels */}
        <div className="absolute top-8 right-8 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
          {value}
        </div>
        <div className="absolute bottom-16 right-12 text-xs text-gray-500">
          {target}
        </div>
      </div>
    </div>
  );
}

function TableRow({ month }: { month: string }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{month}</td>
      <td className="px-4 py-3 text-sm text-gray-900">55,55,555</td>
      <td className="px-4 py-3 text-sm text-gray-900">55,555</td>
      <td className="px-4 py-3 text-sm text-gray-900">0.55%</td>
      <td className="px-4 py-3 text-sm text-gray-900">55.55</td>
      <td className="px-4 py-3 text-sm text-gray-900">555</td>
      <td className="px-4 py-3 text-sm text-gray-900">555</td>
      <td className="px-4 py-3 text-sm text-gray-900">555</td>
      <td className="px-4 py-3 text-sm text-gray-900">55,55,5</td>
    </tr>
  );
}