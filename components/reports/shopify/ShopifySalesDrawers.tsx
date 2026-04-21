'use client';

import { X, Download, TrendingUp, TrendingDown, CheckCircle, AlertCircle, XCircle, Target, Zap, IndianRupee, Package, Users, ShoppingCart, ChevronDown, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Revenue Performance Drawer
export function RevenuePerformanceDrawer({ isOpen, onClose }: DrawerProps) {
  const [selectedDateRange, setSelectedDateRange] = useState('last30days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  if (!isOpen) return null;

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
    { value: 'thisQuarter', label: 'This quarter' },
    { value: 'lastQuarter', label: 'Last quarter' },
    { value: 'thisYear', label: 'This year' },
  ];

  const selectedLabel = dateRangeOptions.find(opt => opt.value === selectedDateRange)?.label || 'Last 30 days';

  const salesData = [
    { date: '1 Aug', current: 28000, previous: 15000 },
    { date: '3 Aug', current: 18000, previous: 14000 },
    { date: '5 Aug', current: 32000, previous: 16000 },
    { date: '7 Aug', current: 30000, previous: 20000 },
    { date: '9 Aug', current: 42000, previous: 28000 },
    { date: '11 Aug', current: 46000, previous: 30000 },
    { date: '13 Aug', current: 48000, previous: 32000 },
    { date: '15 Aug', current: 38000, previous: 28000 },
  ];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">current :</span>
              <span className="text-xs font-semibold text-blue-600">{payload[0]?.value?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-xs text-gray-400">previous :</span>
              <span className="text-xs font-semibold text-gray-400">{payload[1]?.value?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Revenue Performance Analysis</h2>
                <p className="text-xs text-gray-500">Comprehensive sales breakdown and trends</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{selectedLabel}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDateDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDateDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {dateRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedDateRange(option.value);
                            setShowDateDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            selectedDateRange === option.value 
                              ? 'text-blue-600 font-medium bg-blue-50' 
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* 2x2 Hero Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Gross Sales</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">₹44.3L</p>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">+60.6%</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Net Sales</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">₹40.1L</p>
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">+68.0%</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-100/30 rounded-xl border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Total Sales (incl. tax + shipping)</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">₹51.3L</p>
                  <div className="flex items-center gap-1 text-purple-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">+72.0%</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-100/30 rounded-xl border border-amber-200">
                  <p className="text-xs text-gray-600 mb-1">Net Margin</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">90.5%</p>
                  <div className="flex items-center gap-1 text-amber-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">+2.4%</span>
                    <span className="text-xs text-gray-500 ml-1">improvement</span>
                  </div>
                </div>
              </div>

              {/* Sales Trend Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales Trend Comparison</h3>
                <div className="w-full" style={{ height: '224px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} domain={[0, 60000]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="current" stroke="#204CC7" strokeWidth={2.5} dot={{ fill: '#204CC7', r: 4 }} />
                      <Line type="monotone" dataKey="previous" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#cbd5e1', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2x3 Revenue Breakdown Grid */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Discounts</span>
                      <div className="flex items-center text-blue-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-semibold ml-0.5">+6%</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₹2.8L</p>
                    <p className="text-xs text-gray-600 mt-0.5">6.3% of gross sales</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-red-50 to-red-100/30 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Returns</span>
                      <div className="flex items-center text-green-600">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-xs font-semibold ml-0.5">-6%</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₹1.4L</p>
                    <p className="text-xs text-gray-600 mt-0.5">3.2% return rate</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100/30 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Shipping</span>
                      <div className="flex items-center text-purple-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-semibold ml-0.5">+45%</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₹3.2L</p>
                    <p className="text-xs text-gray-600 mt-0.5">Avg ₹150/order</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/30 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Taxes (GST)</span>
                      <div className="flex items-center text-indigo-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-semibold ml-0.5">+58%</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₹7.2L</p>
                    <p className="text-xs text-gray-600 mt-0.5">18% avg tax rate</p>
                  </div>
                </div>
              </div>

              {/* Key Insights - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">142% of target achieved</span> - Festive promotions drove 60.6% growth to ₹44.3L gross sales</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Margin improved to 90.5%</span> - Discount rate decreased from 8.5% to 6.3% while maintaining sales velocity</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Return spike to 3.2%</span> - Focus on 3 new apparel SKUs with sizing issues (₹1.4L impact)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Performance Drawer
export function ProductPerformanceDrawer({ isOpen, onClose }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Product Performance Analysis</h2>
                <p className="text-xs text-gray-500">Top performers and inventory insights</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* 2x2 Top Products Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Revenue Drivers</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { rank: 1, name: 'Premium Trench Coat', revenue: '₹1.85L', growth: '+61%', units: 142, stock: 'critical', badge: '#1 Bestseller' },
                    { rank: 2, name: 'Navy Peacoat', revenue: '₹1.64L', growth: '+68%', units: 128, stock: 'low', badge: null },
                    { rank: 3, name: 'Cashmere Overcoat', revenue: '₹1.42L', growth: '+61%', units: 98, stock: 'healthy', badge: 'Premium' },
                    { rank: 4, name: 'Leather Bomber', revenue: '₹1.28L', growth: '+71%', units: 86, stock: 'critical', badge: 'Trending' },
                  ].map((product) => (
                    <div key={product.rank} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">#{product.rank}</span>
                          {product.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              product.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                              product.badge === 'Premium' ? 'bg-purple-100 text-purple-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          product.stock === 'critical' ? 'bg-red-500' : 
                          product.stock === 'low' ? 'bg-amber-500' : 
                          'bg-green-500'
                        }`} />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">{product.name}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{product.revenue}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{product.units} units sold</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span className="text-sm font-semibold">{product.growth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2x2 Category Performance Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Category Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { category: 'Premium Outerwear', revenue: '₹16.9L', share: 38, items: 1247, color: 'bg-indigo-500', trend: '+58%' },
                    { category: 'Casual Wear', revenue: '₹12.4L', share: 28, items: 892, color: 'bg-purple-500', trend: '+42%' },
                    { category: 'Accessories', revenue: '₹8.8L', share: 20, items: 1584, color: 'bg-pink-500', trend: '+71%' },
                    { category: 'Formal Wear', revenue: '₹6.2L', share: 14, items: 423, color: 'bg-blue-500', trend: '+35%' },
                  ].map((cat, idx) => (
                    <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-3 h-3 ${cat.color} rounded-full`} />
                        <span className="text-xs font-semibold text-gray-500">{cat.share}% of sales</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">{cat.category}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{cat.revenue}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{cat.items} items</span>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-semibold ml-0.5">{cat.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Alerts - Compact */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Critical Stock Alerts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-900">Premium Trench Coat</p>
                      <span className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded font-semibold">12d</span>
                    </div>
                    <p className="text-xs text-gray-700">Stock out in 12 days - expedite restock</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-900">Leather Bomber</p>
                      <span className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded font-semibold">Viral</span>
                    </div>
                    <p className="text-xs text-gray-700">High demand - secure additional inventory</p>
                  </div>
                </div>
              </div>

              {/* Key Insights - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Premium outerwear dominates</span> - 38% of sales (₹16.9L) driven by influencer partnerships</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Leather bomber viral hit</span> - 71% growth from Instagram reel (2.4M views), urgent restock needed</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Cross-sell rate at 24%</span> - Blazer + trouser bundles averaging ₹8,450 per transaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Customer Purchase Behavior Drawer
export function CustomerBehaviorDrawer({ isOpen, onClose }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Purchase Behavior</h2>
                <p className="text-xs text-gray-500">Segmentation and lifetime value analysis</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* 2x2 Customer Split */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">New Customers</p>
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-4xl font-bold text-green-600 mb-1">71.6%</p>
                    <p className="text-sm text-gray-700 mb-2">1,528 customers</p>
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">AOV</span>
                        <span className="font-bold text-gray-900">₹1,842</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-bold text-gray-900">₹2.81L</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Returning Customers</p>
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-4xl font-bold text-blue-600 mb-1">28.4%</p>
                    <p className="text-sm text-gray-700 mb-2">606 customers</p>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">AOV</span>
                        <span className="font-bold text-gray-900">₹2,654</span>
                        <span className="text-green-600 font-semibold">+44%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-bold text-gray-900">₹1.61L</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-100/30 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Repeat Purchase Rate</p>
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-4xl font-bold text-purple-600 mb-1">28.4%</p>
                    <p className="text-sm text-gray-700 mb-2">Industry avg: 24%</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">+4.2%</span>
                      <span className="text-xs text-gray-500">improvement</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-100/30 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Avg Customer LTV</p>
                      <IndianRupee className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-4xl font-bold text-amber-600 mb-1">₹4,280</p>
                    <p className="text-sm text-gray-700 mb-2">Projected over 12 months</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">+18%</span>
                      <span className="text-xs text-gray-500">vs last year</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2x2 Customer Segments by Value */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Value Segments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { tier: 'Premium VIP', range: '₹5K+', customers: 184, percent: 8.6, revenue: 41, orders: 3.2, color: 'bg-yellow-500', badge: 'VIP' },
                    { tier: 'Regular', range: '₹2K-5K', customers: 842, percent: 39.4, revenue: 43, orders: 2.1, color: 'bg-blue-500', badge: null },
                    { tier: 'Occasional', range: '₹1K-2K', customers: 756, percent: 35.4, revenue: 12, orders: 1.4, color: 'bg-indigo-500', badge: null },
                    { tier: 'Low Value', range: '<₹1K', customers: 352, percent: 16.6, revenue: 4, orders: 1.0, color: 'bg-gray-400', badge: null },
                  ].map((segment, idx) => (
                    <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${segment.color} rounded-full`} />
                          <span className="text-sm font-semibold text-gray-900">{segment.tier}</span>
                        </div>
                        {segment.badge && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">{segment.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{segment.range}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Customers</p>
                          <p className="font-bold text-gray-900 mt-0.5">{segment.customers}</p>
                          <p className="text-gray-500 text-xs">{segment.percent}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-bold text-gray-900 mt-0.5">{segment.revenue}%</p>
                          <p className="text-gray-500 text-xs">of total</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Orders</p>
                          <p className="font-bold text-gray-900 mt-0.5">{segment.orders}</p>
                          <p className="text-gray-500 text-xs">per cust.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Frequency - Compact Horizontal */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Purchase Frequency</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'One-time buyers', percent: 71.6, count: 1528, color: 'bg-gray-400' },
                    { label: '2-3 purchases', percent: 21.8, count: 465, color: 'bg-blue-500' },
                    { label: '4-6 purchases', percent: 4.8, count: 102, color: 'bg-purple-500' },
                    { label: '7+ purchases', percent: 1.8, count: 39, color: 'bg-yellow-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 ${item.color} rounded-full`} />
                          <span className="text-xs font-medium text-gray-900">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">{item.percent}%</span>
                      </div>
                      <p className="text-xs text-gray-600">{item.count} customers</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Returning customers 44% more valuable</span> - AOV ₹2,654 vs ₹1,842, focus retention for LTV growth</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Premium VIP segment drives 41% revenue</span> - 184 customers (8.6%) need exclusive loyalty program</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Repeat rate at 28.4%</span> - Above industry avg (24%), driven by email nurture and product quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversion & Funnel Drawer
export function ConversionFunnelDrawer({ isOpen, onClose }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Conversion & Funnel Analysis</h2>
                <p className="text-xs text-gray-500">Customer journey optimization insights</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* Overall Conversion Hero */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Overall Conversion Rate</p>
                    <p className="text-5xl font-bold text-green-600 mb-2">4.42%</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-green-700">Top 15% of Shopify fashion stores</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">+1.14%</span>
                      <span className="text-xs text-gray-600">improvement from 3.28%</span>
                    </div>
                  </div>
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>

              {/* Funnel Stages - Clean Visualization */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
                <div className="space-y-2.5">
                  {[
                    { stage: 'Sessions', value: 48240, rate: 100, color: '#204CC7', continue: null },
                    { stage: 'Product Views', value: 24120, rate: 50, color: '#204CC7', continue: '50% continue' },
                    { stage: 'Add to Cart', value: 7236, rate: 15, color: '#204CC7', continue: '30% continue' },
                    { stage: 'Checkout', value: 3618, rate: 7.5, color: '#7A96E4', continue: '50% continue' },
                    { stage: 'Orders', value: 2134, rate: 4.42, color: '#10b981', continue: '59% complete' },
                  ].map((stage, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{stage.value.toLocaleString()}</span>
                          <span className="text-sm font-bold text-gray-900 min-w-[50px] text-right">{stage.rate}%</span>
                          {stage.continue && (
                            null
                          )}
                        </div>
                      </div>
                      <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full rounded-lg flex items-center px-4"
                          style={{ 
                            width: `${stage.rate}%`,
                            backgroundColor: stage.color
                          }}
                        >
                          <span className="text-white font-semibold text-sm">{stage.value.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2x2 Device + Channel Performance */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance by Segment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Mobile Conversion</p>
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-1">3.8%</p>
                    <p className="text-xs text-gray-700 mb-2">58% of total orders</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-semibold">+45% improvement</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Desktop Conversion</p>
                      <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-indigo-600 mb-1">5.2%</p>
                    <p className="text-xs text-gray-700 mb-2">42% of total orders</p>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-xs font-semibold">Baseline performance</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Add to Cart Rate</p>
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-1">15.0%</p>
                    <p className="text-xs text-gray-700 mb-2">Industry avg: 11%</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-semibold">Up from 11.5%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100/30 rounded-xl border border-pink-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Checkout Completion</p>
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                    </div>
                    <p className="text-3xl font-bold text-pink-600 mb-1">59.0%</p>
                    <p className="text-xs text-gray-700 mb-2">Industry avg: 45%</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-semibold">Strong performance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Abandonment Analysis */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Cart Abandonment Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Abandoned Carts</p>
                    <p className="text-2xl font-bold text-gray-900">1,484</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">Lost Revenue</span>
                      <span className="text-xs font-bold text-red-600">₹8.4L</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Abandonment Rate</p>
                    <p className="text-2xl font-bold text-gray-900">41%</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">Recovery Potential</span>
                      <span className="text-xs font-bold text-green-600">₹4.2L</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-900">Primary Drop-off Reasons:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-700">Payment issues</span>
                      <span className="font-bold text-gray-900">62%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-700">Shipping costs</span>
                      <span className="font-bold text-gray-900">24%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-700">Account friction</span>
                      <span className="font-bold text-gray-900">14%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Top 15% conversion rate</span> - 4.42% validates strong product-market fit and optimized checkout experience</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">₹8.4L in abandoned carts</span> - Recovering 50% (₹4.2L) would boost monthly revenue by 8.2%</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Mobile now drives majority</span> - 3.8% conversion (+45%) after optimization, accounts for 58% of orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Fulfillment & Operations Drawer
export function OperationsDrawer({ isOpen, onClose }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Fulfillment & Operations</h2>
                <p className="text-xs text-gray-500">Delivery performance and returns analysis</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* 2x2 Fulfillment Overview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Fulfillment Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-xs text-gray-600 mb-1">Orders Fulfilled</p>
                    <p className="text-4xl font-bold text-green-600 mb-1">86.5%</p>
                    <p className="text-sm text-gray-700">1,847 of 2,134 orders</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-100/30 rounded-xl border border-amber-200">
                    <AlertCircle className="w-8 h-8 text-amber-600 mb-3" />
                    <p className="text-xs text-gray-600 mb-1">Pending Orders</p>
                    <p className="text-4xl font-bold text-amber-600 mb-1">13.5%</p>
                    <p className="text-sm text-gray-700">287 orders in queue</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                    <Package className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-xs text-gray-600 mb-1">Avg Processing Time</p>
                    <p className="text-4xl font-bold text-blue-600 mb-1">18.5h</p>
                    <p className="text-sm text-gray-700">Target: &lt;24h</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200">
                    <Target className="w-8 h-8 text-purple-600 mb-3" />
                    <p className="text-xs text-gray-600 mb-1">On-time Delivery</p>
                    <p className="text-4xl font-bold text-purple-600 mb-1">92.4%</p>
                    <p className="text-sm text-gray-700">1,706 orders on time</p>
                  </div>
                </div>
              </div>

              {/* Delivery Performance - Compact */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Performance</h3>
                <div className="space-y-3">
                  {[
                    { status: 'On-time delivery', percent: 92.4, count: 1706, color: 'bg-green-500' },
                    { status: 'Delayed (1-2 days)', percent: 6.2, count: 115, color: 'bg-amber-500' },
                    { status: 'Late (3+ days)', percent: 1.4, count: 26, color: 'bg-red-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{item.status}</span>
                          <span className="text-xs font-semibold text-gray-900">{item.count} ({item.percent}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2x2 Shipping & Returns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-100/30 rounded-xl border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Shipping Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">₹3.2L</p>
                  <div className="flex items-center gap-1 text-purple-600 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">+45%</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expedited</span>
                      <span className="font-bold text-gray-900">18%</span>
                    </div>
                    <p className="text-gray-600 mt-1">Avg premium: ₹150</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-100/30 rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Return Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">3.2%</p>
                  <div className="flex items-center gap-1 text-red-600 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">vs 2.1% baseline</span>
                  </div>
                  <div className="pt-2 border-t border-orange-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Value</span>
                      <span className="font-bold text-gray-900">₹1.4L</span>
                    </div>
                    <p className="text-red-600 mt-1 font-semibold">Needs attention</p>
                  </div>
                </div>
              </div>

              {/* Returns Analysis */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Return Reasons Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Sizing Issues</p>
                    <p className="text-2xl font-bold text-gray-900">68%</p>
                    <p className="text-xs text-gray-700 mt-1">3 new SKUs</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Color Mismatch</p>
                    <p className="text-2xl font-bold text-gray-900">18%</p>
                    <p className="text-xs text-gray-700 mt-1">Photography</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Quality Issues</p>
                    <p className="text-2xl font-bold text-gray-900">14%</p>
                    <p className="text-xs text-gray-700 mt-1">Vendor QC</p>
                  </div>
                </div>
              </div>

              {/* Key Insights - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">92.4% on-time delivery</span> - Strong operational excellence with reliable courier partnerships</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Target className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">Expedited shipping at ₹3.2L</span> - 18% adoption rate shows customers value fast delivery premium</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700"><span className="font-semibold">3.2% return rate (₹1.4L)</span> - 68% from sizing on 3 January SKUs, urgent size chart fix needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
