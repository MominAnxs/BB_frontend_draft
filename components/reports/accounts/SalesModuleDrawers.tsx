'use client';

import { 
  X,
  Users,
  Building2,
  Briefcase,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
  Shield,
  Sparkles,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { useState } from 'react';

// Client Segment Analysis Detailed Drawer
export function ChannelSalesDrawer({ onClose, isServiceBusiness }: { onClose: () => void; isServiceBusiness: boolean }) {
  const [activeView, setActiveView] = useState<'overall' | 'enterprise' | 'midmarket' | 'smb'>('overall');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<number, boolean>>({});

  // E-Commerce Channel Data (matching main card: Online 15.2L, Offline 10.8L, B2B 7.5L, B2C 5.9L)
  const ecommerceChannelData = [
    {
      name: 'Online',
      revenue: 15.2,
      orders: 842,
      avgOrderValue: 1805,
      commission: 2.28, // 15% commission
      shipping: 0.91,
      returns: 0.76,
      netIncome: 11.25,
      color: '#204CC7',
      percentage: 38.8,
      platforms: [
        { name: 'Amazon', revenue: 6.8, orders: 380, share: 44.7 },
        { name: 'Flipkart', revenue: 4.6, orders: 258, share: 30.3 },
        { name: 'Own Website', revenue: 3.8, orders: 204, share: 25.0 }
      ]
    },
    {
      name: 'Offline',
      revenue: 10.8,
      orders: 456,
      avgOrderValue: 2368,
      commission: 0, // No commission
      shipping: 0,
      returns: 0.54,
      netIncome: 10.26,
      color: '#3A5FD4',
      percentage: 27.6,
      platforms: [
        { name: 'Flagship Store - Mumbai', revenue: 4.8, orders: 205, share: 44.4 },
        { name: 'Outlet - Delhi', revenue: 3.6, orders: 148, share: 33.3 },
        { name: 'Outlet - Bangalore', revenue: 2.4, orders: 103, share: 22.2 }
      ]
    },
    {
      name: 'B2B',
      revenue: 7.5,
      orders: 124,
      avgOrderValue: 6048,
      commission: 0.38, // 5% commission
      shipping: 0.30,
      returns: 0.15,
      netIncome: 6.67,
      color: '#5A7ADF',
      percentage: 19.1,
      platforms: [
        { name: 'Corporate Orders', revenue: 4.2, orders: 68, share: 56.0 },
        { name: 'Bulk Retailers', revenue: 2.4, orders: 38, share: 32.0 },
        { name: 'Distributors', revenue: 0.9, orders: 18, share: 12.0 }
      ]
    },
    {
      name: 'B2C',
      revenue: 5.9,
      orders: 328,
      avgOrderValue: 1799,
      commission: 0.89, // 15% commission
      shipping: 0.35,
      returns: 0.30,
      netIncome: 4.36,
      color: '#7A96E4',
      percentage: 15.1,
      platforms: [
        { name: 'Instagram Shop', revenue: 2.8, orders: 156, share: 47.6 },
        { name: 'WhatsApp Commerce', revenue: 2.1, orders: 117, share: 35.7 },
        { name: 'Facebook Shop', revenue: 1.0, orders: 55, share: 16.7 }
      ]
    }
  ];

  // Client segment data matching main card: Total = 55.8L
  // Enterprise: 22.4L, Mid-Market: 15.8L, Small Business: 11.2L, Retainer: 6.4L
  const segmentData = [
    { 
      name: 'Enterprise', 
      revenue: 22.4, 
      clients: 8,
      avgDealSize: 2.8,
      deliveryCost: 12.5, // 55.8% delivery cost
      deliveryCostAmount: 12.50,
      operatingExpenses: 3.36,
      netIncome: 6.54,
      color: '#204CC7',
      percentage: 40.1,
      retention: 94,
      churn: 6
    },
    { 
      name: 'Mid-Market', 
      revenue: 15.8, 
      clients: 18,
      avgDealSize: 0.88,
      deliveryCost: 58.2,
      deliveryCostAmount: 9.20,
      operatingExpenses: 2.37,
      netIncome: 4.23,
      color: '#3A5FD4',
      percentage: 28.3,
      retention: 88,
      churn: 12
    },
    { 
      name: 'Small Business', 
      revenue: 11.2, 
      clients: 32,
      avgDealSize: 0.35,
      deliveryCost: 62.5,
      deliveryCostAmount: 7.00,
      operatingExpenses: 2.24,
      netIncome: 1.96,
      color: '#5A7ADF',
      percentage: 20.1,
      retention: 82,
      churn: 18
    },
    { 
      name: 'Retainer Contracts', 
      revenue: 6.4, 
      clients: 12,
      avgDealSize: 0.53,
      deliveryCost: 52.3,
      deliveryCostAmount: 3.35,
      operatingExpenses: 1.28,
      netIncome: 1.77,
      color: '#7A96E4',
      percentage: 11.5,
      retention: 96,
      churn: 4
    }
  ];

  // Top enterprise clients with health scores
  const topEnterpriseClients = [
    { client: 'TechCorp India', revenue: 5.8, percentage: 25.9, health: 'green', contracts: 3, renewal: 'Q3 2026' },
    { client: 'FinanceHub Ltd', revenue: 4.5, percentage: 20.1, health: 'green', contracts: 2, renewal: 'Q1 2027' },
    { client: 'ManufacturePro Solutions', revenue: 3.9, percentage: 17.4, health: 'amber', contracts: 2, renewal: 'Q4 2026' },
    { client: 'RetailCo Enterprises', revenue: 4.6, percentage: 20.5, health: 'green', contracts: 1, renewal: 'Q2 2027' },
    { client: 'StartupX Ventures', revenue: 3.6, percentage: 16.1, health: 'green', contracts: 2, renewal: 'Q1 2027' }
  ];

  // Top projects by active segment
  const topProjectsBySegment = {
    enterprise: [
      { project: 'Digital Transformation - TechCorp', value: 14.8, duration: '6 months', team: 5, status: 'On Track' },
      { project: 'Consulting - FinanceHub', value: 11.2, duration: '4 months', team: 3, status: 'Ahead' },
      { project: 'Strategy Audit - ManufacturePro', value: 6.9, duration: '3 months', team: 2, status: 'On Track' },
      { project: 'Marketing Campaign - RetailCo', value: 8.6, duration: '5 months', team: 4, status: 'On Track' },
      { project: 'Training Program - StartupX', value: 4.3, duration: '2 months', team: 2, status: 'Complete' }
    ],
    midmarket: [
      { project: 'Sales Optimization - MidCo A', value: 2.8, duration: '3 months', team: 2, status: 'On Track' },
      { project: 'Process Improvement - MidCo B', value: 2.4, duration: '2 months', team: 2, status: 'On Track' },
      { project: 'Digital Marketing - MidCo C', value: 2.1, duration: '4 months', team: 1, status: 'Ahead' },
      { project: 'Operations Review - MidCo D', value: 1.9, duration: '2 months', team: 1, status: 'On Track' }
    ],
    smb: [
      { project: 'Website Development - Client A', value: 0.8, duration: '1 month', team: 1, status: 'Complete' },
      { project: 'Marketing Setup - Client B', value: 0.6, duration: '1 month', team: 1, status: 'On Track' },
      { project: 'Process Consulting - Client C', value: 0.9, duration: '2 months', team: 1, status: 'On Track' },
      { project: 'Strategy Session - Client D', value: 0.4, duration: '1 month', team: 1, status: 'Complete' },
      { project: 'Brand Identity - Client E', value: 0.7, duration: '1 month', team: 1, status: 'On Track' }
    ]
  };

  // Client profitability with realistic cost structures
  const segmentProfitability = [
    { 
      segment: 'Enterprise', 
      revenue: 22.4, 
      deliveryCost: 12.50, 
      teamCost: 8.50,
      overhead: 1.40,
      netIncome: 10.54,
      margin: 47.1
    },
    { 
      segment: 'Mid-Market', 
      revenue: 15.8, 
      deliveryCost: 9.20, 
      teamCost: 6.20,
      overhead: 1.20,
      netIncome: 7.40,
      margin: 46.8
    },
    { 
      segment: 'Small Business', 
      revenue: 11.2, 
      deliveryCost: 7.00, 
      teamCost: 4.80,
      overhead: 0.80,
      netIncome: 5.60,
      margin: 50.0
    },
    { 
      segment: 'Retainer Contracts', 
      revenue: 6.4, 
      deliveryCost: 3.35, 
      teamCost: 2.20,
      overhead: 0.50,
      netIncome: 3.90,
      margin: 60.9
    }
  ];

  const totalRevenue = isServiceBusiness 
    ? segmentData.reduce((sum, p) => sum + p.revenue, 0)
    : ecommerceChannelData.reduce((sum, p) => sum + p.revenue, 0);
  
  const totalOrders = isServiceBusiness ? 70 : ecommerceChannelData.reduce((sum, p) => sum + p.orders, 0);
  const avgMetric = isServiceBusiness ? 73.9 : ecommerceChannelData.reduce((sum, p) => sum + (p.netIncome / p.revenue * 100), 0) / ecommerceChannelData.length;

  // E-Commerce: Render E-Commerce Channel Analysis
  if (!isServiceBusiness) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Drawer Panel - E-Commerce Channel Analysis */}
        <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-br from-gray-50 via-white to-gray-50 z-50 flex flex-col animate-slide-in-right" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-brand via-brand to-brand/90 p-8 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Channel-wise Sales Analysis</h2>
                  <p className="text-sm text-white/90 mt-1">Detailed breakdown by channel, platforms & profitability</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm group"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Summary Cards Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900">₹{totalRevenue.toFixed(1)}L</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-brand" />
                  <span className="text-brand font-semibold">+18.2%</span>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-brand" />
                  <span className="text-brand font-semibold">+14.5%</span>
                  <span className="text-gray-500">order volume</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                    <Percent className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Net Margin</p>
                    <p className="text-xl font-bold text-gray-900">{avgMetric.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5 text-brand" />
                  <span className="text-gray-500">After all expenses</span>
                </div>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Channel-wise Revenue Breakdown</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Sales channel performance & cost analysis</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {ecommerceChannelData.map((channel, idx) => (
                  <div key={idx} className="group p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${channel.color}15` }}>
                          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: channel.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-lg">{channel.name}</span>
                            <span className="px-2 py-0.5 bg-brand-light text-brand-dark text-xs font-semibold rounded-full">
                              {channel.percentage.toFixed(1)}% share
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{channel.orders.toLocaleString()} orders • AOV ₹{channel.avgOrderValue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{channel.revenue}L</p>
                        <p className="text-xs text-brand font-semibold">₹{channel.netIncome}L net</p>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Commission</p>
                        <p className="text-sm font-bold text-gray-600">-₹{channel.commission.toFixed(2)}L</p>
                        <p className="text-xs text-gray-500 mt-0.5">{channel.commission > 0 ? ((channel.commission / channel.revenue) * 100).toFixed(0) + '%' : '0%'} rate</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Shipping & Returns</p>
                        <p className="text-sm font-bold text-gray-600">-₹{(channel.shipping + channel.returns).toFixed(2)}L</p>
                        <p className="text-xs text-gray-500 mt-0.5">Logistics cost</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Net Income</p>
                        <p className="text-sm font-bold text-brand">₹{channel.netIncome}L</p>
                        <p className="text-xs text-gray-500 mt-0.5">Final profit</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Net Margin</p>
                        <p className="text-sm font-bold text-gray-900">{((channel.netIncome / channel.revenue) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500 mt-0.5">Profit %</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${channel.percentage}%`,
                          backgroundColor: channel.color 
                        }}
                      />
                    </div>

                    {/* Platform Breakdown */}
                    {/* Platform Breakdown - Collapsible */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setExpandedPlatforms(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="w-full flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                        aria-expanded={!!expandedPlatforms[idx]}
                      >
                        <p className="text-xs font-semibold text-gray-700">Platform Breakdown</p>
                        <ChevronDown 
                          className={`w-4 h-4 text-gray-600 transition-transform ${expandedPlatforms[idx] ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {expandedPlatforms[idx] && (
                        <div className="space-y-2 mt-3">
                          {channel.platforms.map((platform, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: `${channel.color}30` }} />
                                <span className="text-xs font-medium text-gray-900">{platform.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600">{platform.orders} orders</span>
                                <span className="text-xs font-bold text-gray-900">₹{platform.revenue}L</span>
                                <span className="text-xs text-gray-500">({platform.share.toFixed(1)}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Insights Card */}
            <div className="bg-gradient-to-br from-brand via-purple-500 to-pink-500 rounded-2xl p-[1px]">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Insights</h3>
                    <p className="text-xs text-gray-600 mt-0.5">AI-powered analysis from Brego Intelligence</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold">Online channel dominates with 38.8% share</span> (₹15.2L revenue, 842 orders). Amazon contributes 44.7% of online sales. However, 15% platform commission costs ₹2.28L monthly. Consider driving traffic to your own website (currently 25% of online sales) to reduce commission dependency.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold">Offline stores deliver highest net margins</span> at 95% (₹10.26L net from ₹10.8L revenue) with zero commission. Mumbai Flagship generates ₹4.8L (44.4% of offline revenue). Offline AOV of ₹2,368 is 31% higher than online—focus on premium in-store experiences.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold">B2B channel shows massive potential</span> with ₹6,048 AOV (3.4x higher than B2C) and 19.1% revenue share from just 124 orders. Corporate orders dominate at 56% of B2B revenue. Scale B2B outreach to add ₹5-8L monthly revenue with 89% net margins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Service Business: Render Client Segment Analysis
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-br from-gray-50 via-white to-gray-50 z-50 flex flex-col animate-slide-in-right" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand via-brand to-brand/90 p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Client Segment Analysis</h2>
                <p className="text-sm text-white/90 mt-1">Detailed breakdown by segment, revenue & profitability</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm group"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="relative flex items-center gap-2 mt-6 p-1.5 bg-white/20 backdrop-blur-md rounded-xl w-fit">
            <button
              onClick={() => setActiveView('overall')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'overall' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Overall Revenue
            </button>
            <button
              onClick={() => setActiveView('enterprise')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'enterprise' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Enterprise
            </button>
            <button
              onClick={() => setActiveView('midmarket')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'midmarket' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Mid-Market
            </button>
            <button
              onClick={() => setActiveView('smb')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'smb' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Small Business
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">₹{totalRevenue.toFixed(1)}L</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <span className="text-brand font-semibold">+15.7%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Clients</p>
                  <p className="text-xl font-bold text-gray-900">70</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <span className="text-brand font-semibold">+12.3%</span>
                <span className="text-gray-500">client volume</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Avg Net Margin</p>
                  <p className="text-xl font-bold text-gray-900">73.9%</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Target className="w-3.5 h-3.5 text-brand" />
                <span className="text-gray-500">After all expenses</span>
              </div>
            </div>
          </div>

          {/* Segment Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Segment-wise Revenue Breakdown</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Client segment performance & cost analysis</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {segmentData.map((segment, idx) => (
                <div key={idx} className="group p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${segment.color}15` }}>
                        <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: segment.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">{segment.name}</span>
                          <span className="px-2 py-0.5 bg-brand-light text-brand-dark text-xs font-semibold rounded-full">
                            {segment.percentage.toFixed(1)}% share
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{segment.clients.toLocaleString()} clients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{segment.revenue}L</p>
                      <p className="text-xs text-brand font-semibold">₹{segment.netIncome}L net</p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Delivery Cost</p>
                      <p className="text-sm font-bold text-gray-600">-₹{segment.deliveryCostAmount}L</p>
                      <p className="text-xs text-gray-500 mt-0.5">{segment.deliveryCost}% rate</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Operating Expense</p>
                      <p className="text-sm font-bold text-gray-600">-₹{segment.operatingExpenses}L</p>
                      <p className="text-xs text-gray-500 mt-0.5">Logistics & ops</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Net Income</p>
                      <p className="text-sm font-bold text-brand">₹{segment.netIncome}L</p>
                      <p className="text-xs text-gray-500 mt-0.5">Final profit</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Net Margin</p>
                      <p className="text-sm font-bold text-gray-900">{((segment.netIncome / segment.revenue) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Profit %</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${segment.percentage}%`,
                        backgroundColor: segment.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Enterprise Clients */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-brand-light p-5 border-b border-brand/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Top 5 Enterprise Clients</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Revenue leaders with health scores</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {topEnterpriseClients.map((client, idx) => {
                  const healthColor = client.health === 'green' ? 'bg-brand' : client.health === 'amber' ? 'bg-gray-400' : 'bg-gray-300';
                  const HealthIcon = client.health === 'green' ? CheckCircle2 : client.health === 'amber' ? AlertCircle : AlertCircle;
                  
                  return (
                    <div key={idx} className="group p-4 bg-brand-light rounded-xl border border-brand/10 hover:border-brand/20 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand text-white text-sm font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">{client.client}</p>
                              <HealthIcon className={`w-3.5 h-3.5 ${client.health === 'green' ? 'text-brand' : 'text-gray-400'}`} />
                            </div>
                            <p className="text-xs text-gray-600">{client.contracts} active contract{client.contracts > 1 ? 's' : ''} • {client.renewal}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-gray-900">₹{client.revenue}L</p>
                          <p className="text-xs text-brand font-semibold">{client.percentage.toFixed(1)}% share</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${healthColor}`} />
                          <span className="text-gray-600 font-medium capitalize">{client.health} health</span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${Math.min(client.percentage * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Projects by Segment */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Active Enterprise Projects</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Current high-value engagements</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-2">
                {topProjectsBySegment.enterprise.map((project, idx) => {
                  const statusColor = project.status === 'On Track' ? 'text-brand' : project.status === 'Ahead' ? 'text-brand' : 'text-gray-500';
                  const statusBg = project.status === 'On Track' ? 'bg-brand-light' : project.status === 'Ahead' ? 'bg-brand-light' : 'bg-gray-100';
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-brand transition-colors">{project.project}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-600">{project.duration} • {project.team} team</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusBg} ${statusColor}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{project.value}L</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Segment Profitability Deep Dive */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Profitability by Client Segment</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Delivery costs, overhead & net margin analysis</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {segmentProfitability.map((segment, idx) => (
                <div key={idx} className="p-5 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{segment.segment}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Complete profitability breakdown</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-brand">₹{segment.netIncome}L</p>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <div className="px-2 py-0.5 bg-brand-light rounded-full">
                          <span className="text-xs font-bold text-brand">{segment.margin.toFixed(1)}% margin</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-600 mb-1">Revenue</p>
                      <p className="text-sm font-bold text-gray-900">₹{segment.revenue}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-600 mb-1">Delivery Cost</p>
                      <p className="text-sm font-bold text-gray-600">-₹{segment.deliveryCost}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-600 mb-1">Team Cost</p>
                      <p className="text-sm font-bold text-gray-600">-₹{segment.teamCost}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-600 mb-1">Overhead</p>
                      <p className="text-sm font-bold text-gray-600">-₹{segment.overhead}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-600 mb-1">Net Income</p>
                      <p className="text-sm font-bold text-brand">₹{segment.netIncome}L</p>
                    </div>
                  </div>

                  {/* Margin visualization */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 font-medium">Net Profit Margin</span>
                      <span className="font-bold text-brand">{segment.margin.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                        style={{ width: `${segment.margin}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Insights Card */}
          <div className="bg-gradient-to-br from-brand via-purple-500 to-pink-500 rounded-2xl p-[1px]">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-brand to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Insights</h3>
                  <p className="text-xs text-gray-600 mt-0.5">AI-powered analysis from Brego Intelligence</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">Enterprise clients contribute 40.1% of revenue</span> (₹22.4L) with highest retention (94%). However, TechCorp alone represents 25.9% of enterprise revenue—implement quarterly business reviews and diversify client base to reduce concentration risk below 20% per client.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">Small Business segment shows 18% churn</span> vs 6% for Enterprise. Implement onboarding excellence programs and dedicated success managers for SMB clients to reduce churn below 10%. Each 1% churn reduction = ₹0.56L annual revenue saved.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">Retainer Contracts deliver 60.9% net margin</span> with 96% retention—highest profitability and stickiness. Convert 30% of project clients to retainer model to increase predictable revenue from ₹6.4L to ₹12L monthly while improving cash flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Product & Profitability Analysis Drawer (E-COMMERCE)
export function ProductProfitabilityDrawer({ onClose }: { onClose: () => void }) {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'amazon' | 'myntra' | 'offline'>('all');

  // Logical product profitability data with realistic COGS and expenses
  const productsByChannel = {
    all: [
      { product: 'Premium Widget Pro', sales: 12.5, units: 250, cogs: 5.0, directExpenses: 1.5, netProfit: 6.0, margin: 48.0, channel: 'Multi' },
      { product: 'Essential Kit Bundle', sales: 9.8, units: 196, cogs: 4.2, directExpenses: 1.2, netProfit: 4.4, margin: 44.9, channel: 'Multi' },
      { product: 'Enterprise Solution', sales: 8.2, units: 82, cogs: 3.5, directExpenses: 0.9, netProfit: 3.8, margin: 46.3, channel: 'Offline' },
      { product: 'Starter Package', sales: 7.2, units: 360, cogs: 3.0, directExpenses: 0.8, netProfit: 3.4, margin: 47.2, channel: 'Multi' },
      { product: 'Deluxe Edition', sales: 4.6, units: 92, cogs: 2.0, directExpenses: 0.5, netProfit: 2.1, margin: 45.7, channel: 'Multi' }
    ],
    amazon: [
      { product: 'Premium Widget Pro', sales: 5.2, units: 104, cogs: 2.1, directExpenses: 0.9, netProfit: 2.2, margin: 42.3, channel: 'Amazon', commission: 15 },
      { product: 'Starter Package', sales: 4.1, units: 205, cogs: 1.7, directExpenses: 0.7, netProfit: 1.7, margin: 41.5, channel: 'Amazon', commission: 15 },
      { product: 'Essential Kit Bundle', sales: 3.8, units: 76, cogs: 1.6, directExpenses: 0.6, netProfit: 1.6, margin: 42.1, channel: 'Amazon', commission: 15 },
      { product: 'Standard Kit', sales: 2.9, units: 145, cogs: 1.2, directExpenses: 0.5, netProfit: 1.2, margin: 41.4, channel: 'Amazon', commission: 15 },
      { product: 'Basic Bundle', sales: 1.8, units: 120, cogs: 0.8, directExpenses: 0.3, netProfit: 0.7, margin: 38.9, channel: 'Amazon', commission: 15 }
    ],
    myntra: [
      { product: 'Essential Kit Bundle', sales: 4.5, units: 90, cogs: 1.9, directExpenses: 0.8, netProfit: 1.8, margin: 40.0, channel: 'Myntra', commission: 18 },
      { product: 'Deluxe Edition', sales: 2.8, units: 56, cogs: 1.2, directExpenses: 0.5, netProfit: 1.1, margin: 39.3, channel: 'Myntra', commission: 18 },
      { product: 'Advanced Suite', sales: 2.2, units: 44, cogs: 0.9, directExpenses: 0.4, netProfit: 0.9, margin: 40.9, channel: 'Myntra', commission: 18 },
      { product: 'Pro Package', sales: 1.5, units: 75, cogs: 0.6, directExpenses: 0.3, netProfit: 0.6, margin: 40.0, channel: 'Myntra', commission: 18 },
      { product: 'Premium Set', sales: 1.1, units: 22, cogs: 0.5, directExpenses: 0.2, netProfit: 0.4, margin: 36.4, channel: 'Myntra', commission: 18 }
    ],
    offline: [
      { product: 'Enterprise Solution', sales: 6.8, units: 68, cogs: 2.9, directExpenses: 0.6, netProfit: 3.3, margin: 48.5, channel: 'Offline', commission: 0 },
      { product: 'Premium Widget Pro', sales: 5.5, units: 110, cogs: 2.3, directExpenses: 0.5, netProfit: 2.7, margin: 49.1, channel: 'Offline', commission: 0 },
      { product: 'Professional Pack', sales: 4.2, units: 84, cogs: 1.8, directExpenses: 0.4, netProfit: 2.0, margin: 47.6, channel: 'Offline', commission: 0 },
      { product: 'Executive Suite', sales: 3.1, units: 31, cogs: 1.3, directExpenses: 0.3, netProfit: 1.5, margin: 48.4, channel: 'Offline', commission: 0 },
      { product: 'Deluxe Edition', sales: 2.4, units: 48, cogs: 1.0, directExpenses: 0.2, netProfit: 1.2, margin: 50.0, channel: 'Offline', commission: 0 }
    ]
  };

  const currentProducts = productsByChannel[selectedChannel];

  // Calculate channel summary
  const channelSummary = {
    totalSales: currentProducts.reduce((sum, p) => sum + p.sales, 0),
    totalProfit: currentProducts.reduce((sum, p) => sum + p.netProfit, 0),
    totalUnits: currentProducts.reduce((sum, p) => sum + p.units, 0),
    avgMargin: currentProducts.reduce((sum, p) => sum + p.margin, 0) / currentProducts.length
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-br from-gray-50 via-white to-gray-50 z-50 flex flex-col animate-slide-in-right" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand via-brand to-brand/90 p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Product & Profitability Analysis</h2>
                <p className="text-sm text-white/90 mt-1">Product-level margins, COGS & net income breakdown</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm group"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Channel Filter */}
          <div className="relative flex items-center gap-2 mt-6 p-1.5 bg-white/20 backdrop-blur-md rounded-xl w-fit flex-wrap">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedChannel === 'all' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setSelectedChannel('amazon')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedChannel === 'amazon' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Amazon
            </button>
            <button
              onClick={() => setSelectedChannel('myntra')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedChannel === 'myntra' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Myntra
            </button>
            <button
              onClick={() => setSelectedChannel('offline')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedChannel === 'offline' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Offline Stores
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-600">Total Sales</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{channelSummary.totalSales.toFixed(1)}L</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-600">Expenses</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{(channelSummary.totalSales - channelSummary.totalProfit).toFixed(1)}L</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand" />
                </div>
                <p className="text-xs text-gray-600">Net Profitability</p>
              </div>
              <p className="text-2xl font-bold text-brand">₹{channelSummary.totalProfit.toFixed(1)}L</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">Avg. Margin</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{channelSummary.avgMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top 5 Products by Profitability */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Top 5 Products by Profitability</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Ranked by net profit margin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs font-semibold text-brand">
                    {selectedChannel === 'all' ? 'All Channels' : selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {currentProducts.slice(0, 5).map((product, idx) => (
                <div key={idx} className="group p-6 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand text-white text-base font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-base">{product.product}</span>
                          <span className="px-2 py-0.5 bg-brand-light text-brand-dark text-xs font-semibold rounded-full">
                            {product.channel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{product.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-brand">₹{product.netProfit}L</p>
                      <div className="mt-1 px-2.5 py-1 bg-brand-light rounded-lg inline-block">
                        <span className="text-sm font-bold text-brand">{product.margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed P&L Breakdown */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Sales</p>
                      <p className="text-base font-bold text-gray-900">₹{product.sales}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">COGS</p>
                      <p className="text-base font-bold text-gray-600">-₹{product.cogs}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Expenses</p>
                      <p className="text-base font-bold text-gray-600">-₹{product.directExpenses}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Net Profit</p>
                      <p className="text-base font-bold text-brand">₹{product.netProfit}L</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Margin</p>
                      <p className="text-base font-bold text-gray-900">{product.margin.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Profit Margin Visualization */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 font-medium">Net Profit Margin</span>
                      <span className="font-bold text-brand">{product.margin.toFixed(1)}% of sales</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                        style={{ width: `${product.margin}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Insights */}
          <div className="bg-gradient-to-br from-brand via-brand-dark to-purple-500 rounded-2xl p-[1px]">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Strategic Insights & Next Steps</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Data-driven recommendations to maximize profitability</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedChannel === 'offline' 
                          ? 'Offline products deliver 48-50% net margins with zero commission costs. "Enterprise Solution" leads at ₹3.3L profit from ₹6.8L sales. Expand offline catalog with similar high-margin enterprise products to maximize profitability.'
                          : selectedChannel === 'amazon'
                          ? 'Top 5 Amazon products average 41.5% margin after 15% commission. "Premium Widget Pro" generates ₹2.2L profit despite high commission. Focus marketing budget on proven winners to offset platform fees and scale volume.'
                          : selectedChannel === 'myntra'
                          ? '"Essential Kit Bundle" maintains 40% margin on Myntra despite 18% commission (₹1.8L profit on 90 units). Premium positioning justifies higher commission—double down on fashion-forward product lines to leverage Myntra\'s audience.'
                          : '"Premium Widget Pro" and "Essential Kit Bundle" maintain 45-48% margins across all channels. Prioritize inventory allocation and marketing spend on these consistent performers for predictable ROI regardless of sales channel.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Current COGS averages <span className="font-semibold">40-42% of sales</span> across products. A 3% COGS reduction through supplier renegotiation or bulk ordering would add <span className="font-semibold">₹1.2-1.5L to monthly net profit</span>. Start with high-volume products like "Starter Package" (360 units) for maximum impact.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-light rounded-xl border border-brand/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        "Starter Package" sells <span className="font-semibold">360 units (highest volume)</span> with 47.2% margin. Create premium bundles pairing this high-velocity product with "Premium Widget Pro" to increase average order value from ₹10k to ₹17.5k while maintaining 45%+ blended margins.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
