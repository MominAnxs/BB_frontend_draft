'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  IndianRupee,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
  FileText,
  Wallet,
  ShieldCheck,
  Shield,
  CircleDot,
  Search,
  Share2,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import React from 'react';

interface PayablesModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function PayablesModule({ diagnosticData, onAskBregoGPT }: PayablesModuleProps) {
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
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Payables (AP)</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Contractor and vendor payment obligations' : 'Vendor payments and upcoming liabilities'}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
                compareEnabled 
                  ? 'bg-brand-light text-brand border border-brand/20' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Compare</span>
            </button>

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="payables-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div id="payables-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
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
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI Widgets - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Outstanding */}
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-2xl p-5 border border-amber-200/40 hover:shadow-md transition-all">
              {/* Status Indicator Dot */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
              </div>
              
              {/* Icon and Title */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <IndianRupee className="w-4.5 h-4.5 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-700">Total Outstanding</span>
              </div>
              
              {/* Value */}
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">₹24.8L</span>
                <span className="text-sm text-gray-500 ml-2">payables</span>
              </div>
              
              {/* Trend */}
              <div className="flex items-center gap-1 text-amber-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">+₹3.4L from last month</span>
              </div>
            </div>

            {/* Overdue Outstanding */}
            <div className="relative bg-gradient-to-br from-red-50 to-rose-50/30 rounded-2xl p-5 border border-red-200/40 hover:shadow-md transition-all">
              {/* Status Indicator Dot */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              
              {/* Icon and Title */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-4.5 h-4.5 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-700">Overdue Outstanding</span>
              </div>
              
              {/* Value */}
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">₹4.8L</span>
                <span className="text-sm text-gray-500 ml-2">past due</span>
              </div>
              
              {/* Trend */}
              <div className="flex items-center gap-1 text-red-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">+₹0.8L needs attention</span>
              </div>
            </div>

            {/* Ageing Frequency */}
            <div className="relative bg-gradient-to-br from-purple-50 to-violet-50/30 rounded-2xl p-5 border border-purple-200/40 hover:shadow-md transition-all">
              {/* Status Indicator Dot */}
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
              </div>
              
              {/* Icon and Title */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="w-4.5 h-4.5 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-700">Ageing Frequency</span>
              </div>
              
              {/* Ageing Buckets - 4 columns */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">&lt;15 Days</p>
                  <p className="text-xl font-bold text-gray-900">₹8.2L</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">16-30 Days</p>
                  <p className="text-xl font-bold text-gray-900">₹6.4L</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">31-45 Days</p>
                  <p className="text-xl font-bold text-gray-900">₹5.4L</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">&gt;61 Days</p>
                  <p className="text-xl font-bold text-red-600">₹4.8L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ageing Frequency Table */}
          <AgeingFrequencyTable />

          {/* Insights Panel */}
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}

// Ageing Frequency Table Component
function AgeingFrequencyTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedBuckets, setExpandedBuckets] = useState<Record<string, boolean>>({
    '0-30': true,
    '31-60': false,
    '61-90': false,
    '90+': false
  });

  const payablesData = [
    { 
      vendor: 'AWS Cloud Services', 
      outstanding: '₹2.8L', 
      dueDate: 'Aug 20, 2025',
      ageBucket: '90+',
      bucketStatus: 'critical'
    },
    { 
      vendor: 'Marketing Agency Co', 
      outstanding: '₹1.8L', 
      dueDate: 'Sep 15, 2025',
      ageBucket: '90+',
      bucketStatus: 'critical'
    },
    { 
      vendor: 'Office Supplies Inc', 
      outstanding: '₹0.8L', 
      dueDate: 'Oct 10, 2025',
      ageBucket: '61-90',
      bucketStatus: 'warning'
    },
    { 
      vendor: 'Telecom Provider', 
      outstanding: '₹0.6L', 
      dueDate: 'Nov 18, 2025',
      ageBucket: '31-60',
      bucketStatus: 'caution'
    },
    { 
      vendor: 'Software Licenses Ltd', 
      outstanding: '₹2.2L', 
      dueDate: 'Nov 5, 2025',
      ageBucket: '31-60',
      bucketStatus: 'caution'
    },
    { 
      vendor: 'Logistics Partner', 
      outstanding: '₹1.4L', 
      dueDate: 'Dec 8, 2025',
      ageBucket: '31-60',
      bucketStatus: 'caution'
    },
    { 
      vendor: 'Consultant Services', 
      outstanding: '₹3.2L', 
      dueDate: 'Dec 22, 2025',
      ageBucket: '0-30',
      bucketStatus: 'good'
    },
    { 
      vendor: 'Equipment Rental Co', 
      outstanding: '₹1.2L', 
      dueDate: 'Dec 28, 2025',
      ageBucket: '0-30',
      bucketStatus: 'good'
    },
    { 
      vendor: 'Legal Services LLC', 
      outstanding: '₹2.4L', 
      dueDate: 'Oct 2, 2025',
      ageBucket: '61-90',
      bucketStatus: 'warning'
    },
    { 
      vendor: 'Insurance Provider', 
      outstanding: '₹1.6L', 
      dueDate: 'Nov 25, 2025',
      ageBucket: '31-60',
      bucketStatus: 'caution'
    },
    { 
      vendor: 'Maintenance Services', 
      outstanding: '₹0.9L', 
      dueDate: 'Dec 30, 2025',
      ageBucket: '0-30',
      bucketStatus: 'good'
    },
    { 
      vendor: 'Design Agency Pro', 
      outstanding: '₹1.9L', 
      dueDate: 'Sep 8, 2025',
      ageBucket: '90+',
      bucketStatus: 'critical'
    }
  ];

  // Group data by age bucket
  const groupedData = {
    '0-30': payablesData.filter(item => item.ageBucket === '0-30'),
    '31-60': payablesData.filter(item => item.ageBucket === '31-60'),
    '61-90': payablesData.filter(item => item.ageBucket === '61-90'),
    '90+': payablesData.filter(item => item.ageBucket === '90+')
  };

  // Filter data based on search query
  const getFilteredGroupedData = () => {
    if (!searchQuery) return groupedData;
    
    return {
      '0-30': groupedData['0-30'].filter(item => 
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outstanding.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      '31-60': groupedData['31-60'].filter(item => 
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outstanding.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      '61-90': groupedData['61-90'].filter(item => 
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outstanding.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      '90+': groupedData['90+'].filter(item => 
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outstanding.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
  };

  const filteredGroupedData = getFilteredGroupedData();

  const toggleBucket = (bucket: string) => {
    setExpandedBuckets(prev => ({
      ...prev,
      [bucket]: !prev[bucket]
    }));
  };

  const getBucketStyle = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'caution':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBucketIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'caution':
        return <Clock className="w-3.5 h-3.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'critical':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getParentRowStyle = (bucket: string) => {
    switch (bucket) {
      case '0-30':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case '31-60':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case '61-90':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case '90+':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const calculateBucketTotal = (bucket: string) => {
    const items = filteredGroupedData[bucket as keyof typeof filteredGroupedData];
    const total = items.reduce((sum, item) => {
      const amount = parseFloat(item.outstanding.replace('₹', '').replace('L', ''));
      return sum + amount;
    }, 0);
    return `₹${total.toFixed(1)}L`;
  };

  const buckets = ['0-30', '31-60', '61-90', '90+'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header with Search and Share */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Payables Breakdown</h3>
          <p className="text-[14px] text-gray-500 mt-1" style={{ fontWeight: 400 }}>Vendor-level outstanding balances and aging status</p>
        </div>
        
        {/* Right: Search and Share */}
        <div className="flex items-center gap-2">
          {/* Search Input - Smaller */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="w-56 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand-light transition-all"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Share Button - Icon Only */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-all shadow-sm hover:shadow-md"
              title="Share"
              aria-label="Share report"
              aria-expanded={showShareMenu}
              aria-controls="payables-share-menu"
              aria-haspopup="true"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Share Dropdown Menu */}
            {showShareMenu && (
              <div id="payables-share-menu" role="menu" className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-10">
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    // Handle email share
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>Email Report</span>
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    // Handle CSV download
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    // Handle copy link
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Vendor</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Outstanding</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Due Date</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Age Bucket</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => {
              const bucketItems = filteredGroupedData[bucket as keyof typeof filteredGroupedData];
              const isExpanded = expandedBuckets[bucket];
              const bucketTotal = calculateBucketTotal(bucket);
              
              const rows = [
                // Parent Row
                <tr 
                  key={bucket}
                    onClick={() => toggleBucket(bucket)}
                    className={`border-b-2 border-gray-300 cursor-pointer transition-all ${getParentRowStyle(bucket)}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                        />
                        <span className="text-sm font-bold text-gray-900">{bucket} days</span>
                        <span className="text-xs text-gray-600">({bucketItems.length} vendors)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{bucketTotal}</span>
                    </td>
                    <td className="py-4 px-4" colSpan={3}></td>
                  </tr>,
                  
                  // Child Rows
                  ...(isExpanded ? bucketItems.map((item, index) => {
                    // Generate status based on index for variety
                    const isApproved = index % 3 !== 0;
                    
                    return (
                      <tr 
                        key={`${bucket}-${index}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white animate-expand-row"
                      >
                        <td className="py-3 px-4 pl-16 text-sm font-medium text-gray-900">{item.vendor}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{item.outstanding}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.dueDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border
                              ${getBucketStyle(item.bucketStatus)}
                            `}>
                              {getBucketIcon(item.bucketStatus)}
                              {item.ageBucket} days
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                              ${isApproved 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }
                            `}>
                              {isApproved ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  Unapproved
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : [])
                ];
                
                return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Insights Panel Component
function InsightsPanel() {
  const insights = [
    {
      title: 'Early Payment Discount Opportunity',
      description: 'You can save ₹48K by taking early payment discounts from 3 vendors offering 2% for payment within 10 days.',
      icon: IndianRupee
    },
    {
      title: 'Payment Schedule Optimization',
      description: 'Optimize cash flow by scheduling ₹6.2L in payments for week of Jan 15-22 when receivables are expected.',
      icon: Clock
    },
    {
      title: 'Vendor Concentration Risk',
      description: 'Top 3 vendors account for 52% of total payables. Consider diversifying to reduce dependency risk.',
      icon: AlertTriangle
    },
    {
      title: 'Strong Working Capital Position',
      description: 'Current 2.4x cash coverage ratio indicates healthy liquidity to meet all obligations comfortably.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-5">
        <h3 className="text-[18px] text-gray-900 flex items-center gap-2.5" style={{ fontWeight: 600 }}>
          <Zap className="w-5 h-5 text-brand" />
          Insights
        </h3>
        <p className="text-[13px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>Strategic insights to optimize payables and cash flow</p>
      </div>

      <div className="space-y-2.5 mb-5">
        {insights.map((ins, index) => {
          const Icon = ins.icon;
          return (
            <div key={index} className="bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-brand" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>{ins.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>{ins.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-brand" />
            </div>
            <div>
              <p className="text-[14px] text-gray-900" style={{ fontWeight: 600 }}>Optimize your payment strategy?</p>
              <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Get personalized cash flow recommendations</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] hover:bg-brand-hover transition-colors duration-200 shadow-sm" style={{ fontWeight: 500 }}>
            Get Report
          </button>
        </div>
      </div>
    </div>
  );
}
