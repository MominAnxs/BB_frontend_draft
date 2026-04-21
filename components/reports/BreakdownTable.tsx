'use client';

import { useState, useEffect, useRef } from 'react';
import { Info, ArrowUpDown, Filter, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Zap, Share2, Calendar, Check, X } from 'lucide-react';

interface BreakdownTableProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

interface MonthlyData {
  month: string;
  spends: number;
  impressions: number;
  linkClicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  lpv: number;
  costPerResult: number;
  cvr: number;
}

interface Insight {
  text: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  icon: typeof TrendingUp;
}

type DateRange = '3months' | '6months' | '12months' | 'custom';

export function BreakdownTable({ businessModel, selectedChannel }: BreakdownTableProps) {
  // State for date filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('6months');
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsCustomDatePickerOpen(false);
      }
    };

    if (isCustomDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomDatePickerOpen]);

  // All monthly performance data - 12 months (Feb-25 to Jan-26)
  const allMonthlyData: MonthlyData[] = [
    {
      month: 'Feb-25',
      spends: 165000,
      impressions: 3550000,
      linkClicks: 29500,
      ctr: 0.98,
      cpc: 5.59,
      cpm: 46.48,
      lpv: 24200,
      costPerResult: 6.82,
      cvr: 3.7
    },
    {
      month: 'Mar-25',
      spends: 172000,
      impressions: 3680000,
      linkClicks: 30800,
      ctr: 1.00,
      cpc: 5.58,
      cpm: 46.74,
      lpv: 25300,
      costPerResult: 6.80,
      cvr: 3.75
    },
    {
      month: 'Apr-25',
      spends: 178000,
      impressions: 3820000,
      linkClicks: 31600,
      ctr: 1.01,
      cpc: 5.63,
      cpm: 46.60,
      lpv: 25900,
      costPerResult: 6.87,
      cvr: 3.8
    },
    {
      month: 'May-25',
      spends: 182000,
      impressions: 3920000,
      linkClicks: 32400,
      ctr: 1.03,
      cpc: 5.62,
      cpm: 46.43,
      lpv: 26600,
      costPerResult: 6.84,
      cvr: 3.82
    },
    {
      month: 'Jun-25',
      spends: 185000,
      impressions: 3980000,
      linkClicks: 32900,
      ctr: 1.04,
      cpc: 5.62,
      cpm: 46.48,
      lpv: 27000,
      costPerResult: 6.85,
      cvr: 3.85
    },
    {
      month: 'Jul-25',
      spends: 188000,
      impressions: 4010000,
      linkClicks: 33400,
      ctr: 1.05,
      cpc: 5.63,
      cpm: 46.88,
      lpv: 27400,
      costPerResult: 6.86,
      cvr: 3.87
    },
    {
      month: 'Aug-25',
      spends: 192000,
      impressions: 4050000,
      linkClicks: 33800,
      ctr: 1.05,
      cpc: 5.68,
      cpm: 47.41,
      lpv: 27800,
      costPerResult: 6.91,
      cvr: 3.9
    },
    {
      month: 'Sep-25',
      spends: 198000,
      impressions: 4280000,
      linkClicks: 36100,
      ctr: 1.08,
      cpc: 5.48,
      cpm: 46.26,
      lpv: 29900,
      costPerResult: 6.62,
      cvr: 4.1
    },
    {
      month: 'Oct-25',
      spends: 210000,
      impressions: 4520000,
      linkClicks: 38700,
      ctr: 1.12,
      cpc: 5.43,
      cpm: 46.46,
      lpv: 32100,
      costPerResult: 6.54,
      cvr: 4.2
    },
    {
      month: 'Nov-25',
      spends: 225000,
      impressions: 4850000,
      linkClicks: 42300,
      ctr: 1.15,
      cpc: 5.32,
      cpm: 46.39,
      lpv: 35200,
      costPerResult: 6.39,
      cvr: 4.3
    },
    {
      month: 'Dec-25',
      spends: 235000,
      impressions: 5120000,
      linkClicks: 45600,
      ctr: 1.18,
      cpc: 5.15,
      cpm: 45.90,
      lpv: 38100,
      costPerResult: 6.17,
      cvr: 4.5
    },
    {
      month: 'Jan-26',
      spends: 245000,
      impressions: 5380000,
      linkClicks: 48200,
      ctr: 1.21,
      cpc: 5.08,
      cpm: 45.54,
      lpv: 40500,
      costPerResult: 6.05,
      cvr: 4.6
    }
  ];

  // Filter data based on selected date range
  const getFilteredData = (): MonthlyData[] => {
    const dataLength = allMonthlyData.length;
    switch (selectedDateRange) {
      case '3months':
        return allMonthlyData.slice(dataLength - 3);
      case '6months':
        return allMonthlyData.slice(dataLength - 6);
      case '12months':
        return allMonthlyData.slice(dataLength - 12);
      case 'custom':
        if (customStartDate && customEndDate) {
          // Convert "YYYY-MM" to "MMM-YY" format for comparison
          const formatMonthForComparison = (dateStr: string) => {
            const [year, month] = dateStr.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]}-${year.slice(2)}`;
          };
          
          const startMonth = formatMonthForComparison(customStartDate);
          const endMonth = formatMonthForComparison(customEndDate);
          
          // Find start and end indices
          const startIndex = allMonthlyData.findIndex(d => d.month === startMonth);
          const endIndex = allMonthlyData.findIndex(d => d.month === endMonth);
          
          if (startIndex !== -1 && endIndex !== -1) {
            return allMonthlyData.slice(startIndex, endIndex + 1);
          }
        }
        return allMonthlyData;
      default:
        return allMonthlyData.slice(dataLength - 6);
    }
  };

  const monthlyData = getFilteredData();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = monthlyData.length; // Show all filtered data

  // Calculate totals from filtered data
  const totals = monthlyData.reduce((acc, data) => ({
    spends: acc.spends + data.spends,
    impressions: acc.impressions + data.impressions,
    linkClicks: acc.linkClicks + data.linkClicks,
    ctr: 0, // Will calculate average
    cpc: 0, // Will calculate average
    cpm: 0, // Will calculate average
    lpv: acc.lpv + data.lpv,
    costPerResult: 0, // Will calculate average
    cvr: 0 // Will calculate average
  }), { spends: 0, impressions: 0, linkClicks: 0, ctr: 0, cpc: 0, cpm: 0, lpv: 0, costPerResult: 0, cvr: 0 });

  // Calculate averages
  const count = monthlyData.length;
  totals.ctr = monthlyData.reduce((sum, d) => sum + d.ctr, 0) / count;
  totals.cpc = monthlyData.reduce((sum, d) => sum + d.cpc, 0) / count;
  totals.cpm = monthlyData.reduce((sum, d) => sum + d.cpm, 0) / count;
  totals.costPerResult = monthlyData.reduce((sum, d) => sum + d.costPerResult, 0) / count;
  totals.cvr = monthlyData.reduce((sum, d) => sum + d.cvr, 0) / count;

  const totalPages = Math.ceil(monthlyData.length / itemsPerPage);
  const currentData = monthlyData;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Generate intelligent insights from the filtered data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (monthlyData.length < 2) {
      return insights; // Need at least 2 months for comparison
    }
    
    // Get first and last month data from filtered set
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    // Calculate all metrics
    const ctrGrowth = ((lastMonth.ctr - firstMonth.ctr) / firstMonth.ctr) * 100;
    const cpcChange = ((lastMonth.cpc - firstMonth.cpc) / firstMonth.cpc) * 100;
    const cvrGrowth = ((lastMonth.cvr - firstMonth.cvr) / firstMonth.cvr) * 100;
    const spendGrowth = ((lastMonth.spends - firstMonth.spends) / firstMonth.spends) * 100;
    const linkClickGrowth = ((lastMonth.linkClicks - firstMonth.linkClicks) / firstMonth.linkClicks) * 100;
    const cprChange = ((lastMonth.costPerResult - firstMonth.costPerResult) / firstMonth.costPerResult) * 100;
    const impressionGrowth = ((lastMonth.impressions - firstMonth.impressions) / firstMonth.impressions) * 100;
    const lpvGrowth = ((lastMonth.lpv - firstMonth.lpv) / firstMonth.lpv) * 100;
    const cpmChange = ((lastMonth.cpm - firstMonth.cpm) / firstMonth.cpm) * 100;

    const monthCount = monthlyData.length;
    const periodLabel = selectedDateRange === '3months' ? '3 months' : 
                       selectedDateRange === '6months' ? '6 months' : 
                       selectedDateRange === '12months' ? '12 months' : 'the period';

    // POSITIVE INSIGHTS (5 total)
    
    // 1. CTR Performance (Positive)
    insights.push({
      text: `Outstanding CTR growth of ${ctrGrowth.toFixed(1)}% from ${firstMonth.ctr.toFixed(2)}% to ${lastMonth.ctr.toFixed(2)}%. Your ad creatives and audience targeting are performing exceptionally well, driving higher engagement rates month over month.`,
      type: 'positive',
      icon: TrendingUp
    });

    // 2. CPC Optimization (Positive)
    insights.push({
      text: `Excellent cost efficiency! Your CPC decreased by ${Math.abs(cpcChange).toFixed(1)}% (₹${firstMonth.cpc.toFixed(2)} → ₹${lastMonth.cpc.toFixed(2)}), saving approximately ₹${((firstMonth.cpc - lastMonth.cpc) * lastMonth.linkClicks / 1000).toFixed(0)}K. Quality scores and ad relevance improvements are paying off.`,
      type: 'positive',
      icon: TrendingDown
    });

    // 3. CVR Growth (Positive)
    insights.push({
      text: `Exceptional conversion performance! CVR surged ${cvrGrowth.toFixed(1)}% from ${firstMonth.cvr.toFixed(1)}% to ${lastMonth.cvr.toFixed(1)}%. Your landing pages, user experience, and messaging alignment are driving strong conversion momentum.`,
      type: 'positive',
      icon: Zap
    });

    // 4. Scaling Efficiency (Positive with caveat)
    insights.push({
      text: `Smart scaling detected! While spend increased ${spendGrowth.toFixed(1)}%, link clicks grew ${linkClickGrowth.toFixed(1)}% — a ${(linkClickGrowth - spendGrowth).toFixed(1)}% efficiency gain. Your campaigns are generating more traffic per rupee spent.`,
      type: 'positive',
      icon: CheckCircle
    });

    // 5. Impression Reach (Positive)
    insights.push({
      text: `Massive reach expansion! Impressions grew ${impressionGrowth.toFixed(1)}% from ${(firstMonth.impressions / 1000000).toFixed(1)}M to ${(lastMonth.impressions / 1000000).toFixed(1)}M. Your brand visibility and market penetration are significantly increasing across channels.`,
      type: 'positive',
      icon: TrendingUp
    });

    // NEGATIVE/WARNING INSIGHTS (4 total)

    // 6. Cost Per Result Rising (Warning - blended insight)
    insights.push({
      text: `While conversions are improving, cost per result increased ${Math.abs(cprChange).toFixed(1)}% (₹${firstMonth.costPerResult.toFixed(2)} → ₹${lastMonth.costPerResult.toFixed(2)}). Despite strong CVR gains, rising ad costs are impacting overall efficiency. Review funnel optimization opportunities.`,
      type: 'warning',
      icon: AlertTriangle
    });

    // 7. CPM Pressure (Warning)
    insights.push({
      text: `CPM increased ${Math.abs(cpmChange).toFixed(1)}% (₹${firstMonth.cpm.toFixed(2)} → ₹${lastMonth.cpm.toFixed(2)}). Market competition and seasonal demand are driving up impression costs. Consider testing new audience segments or dayparting strategies to reduce costs.`,
      type: 'warning',
      icon: TrendingUp
    });

    // 8. Landing Page Engagement (Critical - blended)
    insights.push({
      text: `Landing page views grew ${lpvGrowth.toFixed(1)}%, but this growth is lagging behind link clicks (${linkClickGrowth.toFixed(1)}%). Some users may be bouncing before page load. Check site speed, mobile experience, and ensure tracking is capturing all sessions.`,
      type: 'critical',
      icon: AlertTriangle
    });

    // 9. Spend Optimization Needed (Warning - actionable)
    insights.push({
      text: `Total spend reached ₹${(totals.spends / 100000).toFixed(2)}L over ${periodLabel}. While results are strong, there's opportunity to reallocate ${((spendGrowth - linkClickGrowth) * 2).toFixed(0)}% of budget from slower-performing periods to peak performers for better ROI.`,
      type: 'warning',
      icon: AlertTriangle
    });

    return insights;
  };

  const insights = generateInsights();

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'info':
        return 'bg-brand-light border-brand/20 text-brand';
    }
  };

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      case 'info':
        return 'text-brand';
    }
  };

  const getDateRangeLabel = (range: DateRange): string => {
    switch (range) {
      case '3months':
        return 'Last 3 Months';
      case '6months':
        return 'Last 6 Months';
      case '12months':
        return 'Last 12 Months';
      case 'custom':
        if (customStartDate && customEndDate) {
          // Format dates as "MMM-YY to MMM-YY"
          const formatDate = (dateStr: string) => {
            const [year, month] = dateStr.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]}-${year.slice(2)}`;
          };
          return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
        }
        return 'Custom';
      default:
        return 'Last 6 Months';
    }
  };

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Month on Month Performance Report
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed metrics breakdown across all months
          </p>
        </div>
        
        {/* Date Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-expanded={isFilterOpen}
            aria-controls="breakdown-filter-menu"
          >
            <Filter className="w-4 h-4" />
            <span>{getDateRangeLabel(selectedDateRange)}</span>
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div id="breakdown-filter-menu" className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date Range</span>
                </div>
              </div>
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'custom') {
                      // Open custom date picker modal
                      setIsFilterOpen(false);
                      setTempStartDate(customStartDate || '2025-02');
                      setTempEndDate(customEndDate || '2026-01');
                      setIsCustomDatePickerOpen(true);
                    } else {
                      setSelectedDateRange(option.value);
                      setIsFilterOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className={selectedDateRange === option.value ? 'font-medium text-brand' : ''}>
                    {option.label}
                  </span>
                  {selectedDateRange === option.value && (
                    <Check className="w-4 h-4 text-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Month
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Spends
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Impressions
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Link Clicks
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  CTR
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  CPC
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  CPM
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  LPV
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Cost Per Result
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  CVR%
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((data, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50">
                  {data.month}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-light text-brand">
                    {formatCurrency(data.spends)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    {formatNumber(data.impressions)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    {formatNumber(data.linkClicks)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-100 text-cyan-800">
                    {data.ctr.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                    ₹{data.cpc.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
                    ₹{data.cpm.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800">
                    {formatNumber(data.lpv)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    ₹{data.costPerResult.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                    {data.cvr.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="bg-brand-light border-t-2 border-brand/20 font-semibold">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 sticky left-0 bg-brand-light">
                Total
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-brand-light text-brand">
                  {formatCurrency(totals.spends)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-purple-200 text-purple-900">
                  {formatNumber(totals.impressions)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-200 text-green-900">
                  {formatNumber(totals.linkClicks)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-200 text-cyan-900">
                  {totals.ctr.toFixed(2)}%
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-200 text-orange-900">
                  ₹{totals.cpc.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-pink-200 text-pink-900">
                  ₹{totals.cpm.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-violet-200 text-violet-900">
                  {formatNumber(totals.lpv)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-200 text-yellow-900">
                  ₹{totals.costPerResult.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-200 text-emerald-900">
                  {totals.cvr.toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{currentData.length}</span> months of performance data ({getDateRangeLabel(selectedDateRange)})
        </div>
      </div>

      {/* Key Insights Section */}
      {insights.length > 0 && (
        <div className="px-6 py-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
            <span className="text-xs text-gray-500">Critical observations from your data</span>
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className={`
                    flex items-start gap-2 p-3 rounded-lg border relative group
                    ${getInsightStyles(insight.type)}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getIconColor(insight.type)}`} />
                  <p className="text-sm leading-snug flex-1 pr-6">
                    {insight.text}
                  </p>
                  <button 
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                    aria-label="Share insight"
                  >
                    <Share2 className={`w-3.5 h-3.5 ${getIconColor(insight.type)}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Custom Date Picker Modal */}
      {isCustomDatePickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div ref={modalRef} className="bg-white rounded-xl w-full max-w-md mx-4" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-semibold text-gray-900">Custom Date Range</h3>
              </div>
              <button
                onClick={() => setIsCustomDatePickerOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close date picker"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Month
                </label>
                <input
                  type="month"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  min="2025-02"
                  max="2026-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Month
                </label>
                <input
                  type="month"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  min="2025-02"
                  max="2026-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                />
              </div>

              {tempStartDate && tempEndDate && tempStartDate > tempEndDate && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">Start date must be before end date</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setIsCustomDatePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) {
                    setCustomStartDate(tempStartDate);
                    setCustomEndDate(tempEndDate);
                    setSelectedDateRange('custom');
                    setIsCustomDatePickerOpen(false);
                  }
                }}
                disabled={!tempStartDate || !tempEndDate || tempStartDate > tempEndDate}
                className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
