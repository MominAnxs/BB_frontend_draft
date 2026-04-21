'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  ChevronDown,
  Sparkles,
  IndianRupee,
  Percent,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  Briefcase,
  Users,
  Shield,
  Activity,
  ChevronRight,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProfitLossModuleProps {
  diagnosticData: any;
  onAskBregoGPT?: () => void;
}

export function ProfitLossModule({ diagnosticData, onAskBregoGPT }: ProfitLossModuleProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);
  const [compareMode, setCompareMode] = useState<'none' | 'monthly' | 'yearly'>('none');

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
            <h1 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Profit & Loss Statement</h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
              {isServiceBusiness ? 'Service business P&L analysis' : 'Comprehensive income statement'}
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Ask Brego AI Button */}
            <button onClick={onAskBregoGPT} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
              style={{ fontWeight: 500 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask BregoGPT</span>
            </button>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                aria-label="Export report"
                aria-expanded={showExportMenu}
                aria-controls="profitloss-export-menu"
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div id="profitloss-export-menu" role="menu" className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
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
          {/* KPI Widgets - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPIWidget
              title={isServiceBusiness ? "Revenue" : "Revenue"}
              value="₹42.8L"
              unit="this month"
              change="+12%"
              status="green"
              trend="up"
              icon={IndianRupee}
            />
            <KPIWidget
              title={isServiceBusiness ? "Operating Profit" : "Gross Profit"}
              value="₹28.6L"
              unit={isServiceBusiness ? "63% margin" : "67% margin"}
              change="+8%"
              status="green"
              trend="up"
              icon={TrendingUp}
            />
            <KPIWidget
              title="Net Margin"
              value="19.6%"
              unit="prev: 19.1%"
              change="+0.5%"
              status="amber"
              trend="up"
              icon={Percent}
            />
          </div>

          {/* P&L Breakdown Table */}
          <PLBreakdownTable 
            budgetMode={budgetMode}
            setBudgetMode={setBudgetMode}
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            isServiceBusiness={isServiceBusiness}
          />

          {/* Insights Panel */}
          <InsightsPanel isServiceBusiness={isServiceBusiness} />
        </div>
      </div>
    </div>
  );
}

// KPI Widget Component
interface KPIWidgetProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  status: 'green' | 'amber' | 'red';
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}

function KPIWidget({ title, value, unit, change, status, trend, icon: Icon }: KPIWidgetProps) {
  const statusColors = {
    green: 'bg-green-50/80 border-green-200 hover:bg-green-50',
    amber: 'bg-amber-50/80 border-amber-200 hover:bg-amber-50',
    red: 'bg-red-50/80 border-red-200 hover:bg-red-50'
  };

  const statusDotColors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };

  const trendColors = {
    up: status === 'green' ? 'text-green-600' : status === 'amber' ? 'text-green-600' : 'text-red-600',
    down: status === 'green' ? 'text-red-600' : 'text-green-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`
      relative rounded-xl border p-4 transition-all duration-200 hover:shadow-md
      ${statusColors[status]}
    `}>
      {/* Status Indicator Dot */}
      <div className="absolute top-3 right-3">
        <div className={`w-2 h-2 rounded-full ${statusDotColors[status]} animate-pulse`} />
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-700" />
        </div>
        <p className="text-xs font-semibold text-gray-700">{title}</p>
      </div>

      {/* Current Value */}
      <div className="mb-1.5">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>

      {/* Change vs Last Period */}
      <div className={`flex items-center gap-1 text-xs ${trendColors[trend]}`}>
        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
        <span className="font-medium">{change} vs last month</span>
      </div>
    </div>
  );
}

// Insights Panel Component
interface InsightsPanelProps {
  isServiceBusiness: boolean;
}

function InsightsPanel({ isServiceBusiness }: InsightsPanelProps) {
  const insights = [
    { title: 'Strong Revenue Growth', description: 'Revenue grew 32% from ₹32.4L (Jul) to ₹42.8L (Dec). Product X accounts for 45% of growth.', icon: CheckCircle2 },
    { title: 'Net Margin Needs Improvement', description: 'Current net margin is 19.6%, up slightly from 19.1% last month. OpEx increased 18% MoM, led by marketing spend.', icon: AlertTriangle },
    { title: 'Gross Margin Stable', description: 'Gross margin maintained at 67% over 6 months, indicating strong pricing power on COGS.', icon: TrendingUp },
    { title: 'Product Y Margin Leak', description: 'Product Y has -8% net margin despite 18% gross margin. High CAC (₹12.4k) is eating profits.', icon: AlertTriangle },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-shrink-0 w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center">
          <Activity className="w-[18px] h-[18px] text-brand" />
        </div>
        <div>
          <h3 className="text-[18px] text-gray-900" style={{ fontWeight: 600 }}>Insights</h3>
          <p className="text-[13px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>Key observations and strategic recommendations</p>
        </div>
      </div>
      
      <div className="space-y-2.5">
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
    </div>
  );
}

// P&L Breakdown Table Component
interface PLBreakdownTableProps {
  budgetMode: boolean;
  setBudgetMode: (value: boolean) => void;
  compareMode: 'none' | 'monthly' | 'yearly';
  setCompareMode: (value: 'none' | 'monthly' | 'yearly') => void;
  isServiceBusiness: boolean;
}

function PLBreakdownTable({ budgetMode, setBudgetMode, compareMode, setCompareMode, isServiceBusiness }: PLBreakdownTableProps) {
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    revenue: false,
    cogs: false,
    opex: false
  });

  // Toggle section expansion
  const toggleSection = (section: 'revenue' | 'cogs' | 'opex') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Expand all sections
  const expandAll = () => {
    setExpandedSections({ revenue: true, cogs: true, opex: true });
  };

  // Collapse all sections
  const collapseAll = () => {
    setExpandedSections({ revenue: false, cogs: false, opex: false });
  };

  // Monthly comparison data (April to July)
  const monthlyData = {
    april: {
      revenue: { amount: 38.8, budget: 42.0 },
      productX: { amount: 22.5, budget: 24.0 },
      productY: { amount: 11.3, budget: 12.6 },
      productZ: { amount: 5.0, budget: 5.4 },
      cogs: { amount: 12.8, budget: 13.9 },
      directMaterials: { amount: 7.4, budget: 8.0 },
      productionLabor: { amount: 4.2, budget: 4.5 },
      manufacturingOverhead: { amount: 1.2, budget: 1.4 },
      grossProfit: { amount: 26.0, budget: 28.1 },
      opex: { amount: 18.2, budget: 19.5 },
      salaries: { amount: 7.4, budget: 7.8 },
      marketing: { amount: 5.8, budget: 6.2 },
      technology: { amount: 2.5, budget: 2.7 },
      office: { amount: 1.4, budget: 1.6 },
      other: { amount: 1.1, budget: 1.2 },
      netProfit: { amount: 7.8, budget: 8.6 }
    },
    may: {
      revenue: { amount: 38.8, budget: 42.0 },
      productX: { amount: 22.5, budget: 24.0 },
      productY: { amount: 11.3, budget: 12.6 },
      productZ: { amount: 5.0, budget: 5.4 },
      cogs: { amount: 12.8, budget: 13.9 },
      directMaterials: { amount: 7.4, budget: 8.0 },
      productionLabor: { amount: 4.2, budget: 4.5 },
      manufacturingOverhead: { amount: 1.2, budget: 1.4 },
      grossProfit: { amount: 26.0, budget: 28.1 },
      opex: { amount: 18.2, budget: 19.5 },
      salaries: { amount: 7.4, budget: 7.8 },
      marketing: { amount: 5.8, budget: 6.2 },
      technology: { amount: 2.5, budget: 2.7 },
      office: { amount: 1.4, budget: 1.6 },
      other: { amount: 1.1, budget: 1.2 },
      netProfit: { amount: 7.8, budget: 8.6 }
    },
    june: {
      revenue: { amount: 42.8, budget: 45.0 },
      productX: { amount: 24.8, budget: 26.0 },
      productY: { amount: 12.4, budget: 13.5 },
      productZ: { amount: 5.6, budget: 5.5 },
      cogs: { amount: 14.2, budget: 15.0 },
      directMaterials: { amount: 8.2, budget: 8.6 },
      productionLabor: { amount: 4.6, budget: 4.8 },
      manufacturingOverhead: { amount: 1.4, budget: 1.6 },
      grossProfit: { amount: 28.6, budget: 30.0 },
      opex: { amount: 20.2, budget: 21.0 },
      salaries: { amount: 8.2, budget: 8.4 },
      marketing: { amount: 6.4, budget: 6.8 },
      technology: { amount: 2.8, budget: 2.9 },
      office: { amount: 1.6, budget: 1.7 },
      other: { amount: 1.2, budget: 1.2 },
      netProfit: { amount: 8.4, budget: 9.0 }
    },
    july: {
      revenue: { amount: 42.8, budget: 45.0 },
      productX: { amount: 24.8, budget: 26.0 },
      productY: { amount: 12.4, budget: 13.5 },
      productZ: { amount: 5.6, budget: 5.5 },
      cogs: { amount: 14.2, budget: 15.0 },
      directMaterials: { amount: 8.2, budget: 8.6 },
      productionLabor: { amount: 4.6, budget: 4.8 },
      manufacturingOverhead: { amount: 1.4, budget: 1.6 },
      grossProfit: { amount: 28.6, budget: 30.0 },
      opex: { amount: 20.2, budget: 21.0 },
      salaries: { amount: 8.2, budget: 8.4 },
      marketing: { amount: 6.4, budget: 6.8 },
      technology: { amount: 2.8, budget: 2.9 },
      office: { amount: 1.6, budget: 1.7 },
      other: { amount: 1.2, budget: 1.2 },
      netProfit: { amount: 8.4, budget: 9.0 }
    }
  };

  // Calculate totals
  const calculateTotal = (field: string) => {
    const keys = ['april', 'may', 'june', 'july'] as const;
    return keys.reduce((sum, month) => {
      const value = monthlyData[month][field as keyof typeof monthlyData.april];
      return sum + (typeof value === 'object' ? value.amount : 0);
    }, 0);
  };

  // Current month data (for single column view)
  const currentData = budgetMode ? monthlyData.july : monthlyData.july;

  // Structured P&L data with parent-child relationships
  const plStructure = isServiceBusiness ? [
    // Revenue Section - Service Business
    {
      id: 'revenue',
      category: 'Service Revenue',
      field: 'revenue',
      type: 'revenue',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Professional Fees', field: 'productX', type: 'revenue' },
        { category: 'Retainer Contracts', field: 'productY', type: 'revenue' },
        { category: 'Project Billing', field: 'productZ', type: 'revenue' },
      ]
    },
    
    // Direct Costs Section - Service Business
    {
      id: 'cogs',
      category: 'Less: Direct Costs',
      field: 'cogs',
      type: 'cogs',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Subcontractor Costs', field: 'directMaterials', type: 'cogs' },
        { category: 'Direct Labor', field: 'productionLabor', type: 'cogs' },
        { category: 'Materials & Supplies', field: 'manufacturingOverhead', type: 'cogs' },
      ]
    },
    
    // Gross Profit
    {
      id: 'gross-profit',
      category: 'Gross Profit',
      field: 'grossProfit',
      type: 'gross-profit',
      isParent: true,
      isExpandable: false,
      showContribution: true
    },
    
    // OpEx Section - Service Business
    {
      id: 'opex',
      category: 'Less: Operating Expenses',
      field: 'opex',
      type: 'opex',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Employee Salaries', field: 'salaries', type: 'opex' },
        { category: 'Marketing & Business Development', field: 'marketing', type: 'opex' },
        { category: 'Technology & Tools', field: 'technology', type: 'opex' },
        { category: 'Office & Facilities', field: 'office', type: 'opex' },
        { category: 'Professional Services', field: 'other', type: 'opex' },
      ]
    },
    
    // Net Profit
    {
      id: 'net-profit',
      category: 'Net Profit',
      field: 'netProfit',
      type: 'net-profit',
      isParent: true,
      isExpandable: false,
      showContribution: true
    },
  ] : [
    // Revenue Section - E-commerce
    {
      id: 'revenue',
      category: 'Sales Revenue',
      field: 'revenue',
      type: 'revenue',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Product X Revenue', field: 'productX', type: 'revenue' },
        { category: 'Product Y Revenue', field: 'productY', type: 'revenue' },
        { category: 'Product Z Revenue', field: 'productZ', type: 'revenue' },
      ]
    },
    
    // COGS Section - E-commerce
    {
      id: 'cogs',
      category: 'Less: Cost of Goods Sold',
      field: 'cogs',
      type: 'cogs',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Direct Materials', field: 'directMaterials', type: 'cogs' },
        { category: 'Production Labor', field: 'productionLabor', type: 'cogs' },
        { category: 'Manufacturing Overhead', field: 'manufacturingOverhead', type: 'cogs' },
      ]
    },
    
    // Gross Profit
    {
      id: 'gross-profit',
      category: 'Gross Profit',
      field: 'grossProfit',
      type: 'gross-profit',
      isParent: true,
      isExpandable: false,
      showContribution: true
    },
    
    // OpEx Section - E-commerce
    {
      id: 'opex',
      category: 'Less: Operating Expenses',
      field: 'opex',
      type: 'opex',
      isParent: true,
      isExpandable: true,
      children: [
        { category: 'Salaries & Benefits', field: 'salaries', type: 'opex' },
        { category: 'Marketing & Advertising', field: 'marketing', type: 'opex' },
        { category: 'Technology & Software', field: 'technology', type: 'opex' },
        { category: 'Office & Administration', field: 'office', type: 'opex' },
        { category: 'Other Operating Expenses', field: 'other', type: 'opex' },
      ]
    },
    
    // Net Profit
    {
      id: 'net-profit',
      category: 'Net Profit',
      field: 'netProfit',
      type: 'net-profit',
      isParent: true,
      isExpandable: false,
      showContribution: true
    },
  ];

  const getRowStyle = (type: string, isParent: boolean, isChild: boolean = false) => {
    if (isParent) {
      if (type === 'revenue') return 'bg-brand-light border-t-2 border-brand/20 hover:bg-brand-light';
      if (type === 'cogs') return 'bg-red-50 border-t-2 border-red-200 hover:bg-red-100';
      if (type === 'gross-profit') return 'bg-green-50 border-y-2 border-green-300';
      if (type === 'opex') return 'bg-amber-50 border-t-2 border-amber-200 hover:bg-amber-100';
      if (type === 'net-profit') return 'bg-indigo-50 border-y-2 border-indigo-300';
    }
    if (isChild) {
      return 'hover:bg-gray-50 border-b border-gray-100 bg-gray-50/30';
    }
    return 'hover:bg-gray-50 border-b border-gray-100';
  };

  const getAmountColor = (type: string, isParent: boolean) => {
    if (!isParent) return 'text-gray-900';
    if (type === 'revenue') return 'text-brand';
    if (type === 'cogs') return 'text-red-700';
    if (type === 'gross-profit') return 'text-green-700';
    if (type === 'opex') return 'text-amber-700';
    if (type === 'net-profit') return 'text-indigo-700';
    return 'text-gray-900';
  };

  const formatAmount = (amount: number) => `₹${amount.toFixed(1)}L`;
  
  const calculatePercentage = (amount: number, revenue: number) => {
    return `${((amount / revenue) * 100).toFixed(0)}%`;
  };

  const renderVariance = (actual: number, budget: number) => {
    const variance = actual - budget;
    const percentVariance = ((variance / budget) * 100).toFixed(1);
    const isPositive = variance >= 0;
    
    return (
      <div className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{formatAmount(variance)}
        <span className="ml-1">({isPositive ? '+' : ''}{percentVariance}%)</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[22px] text-gray-900" style={{ fontWeight: 700 }}>Profit & Loss Statement</h3>
          <p className="text-[14px] text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
            {isServiceBusiness ? 'Service business P&L analysis' : 'Comprehensive income statement'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Budget vs Actual Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setBudgetMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !budgetMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Actual
            </button>
            <button
              onClick={() => setBudgetMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                budgetMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Budget vs Actual
            </button>
          </div>

          {/* Compare Mode Dropdown */}
          <div className="relative">
            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value as 'none' | 'monthly' | 'yearly')}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer outline-none"
            >
              <option value="none">No Comparison</option>
              <option value="monthly">Monthly Comparison</option>
              <option value="yearly">Yearly Comparison</option>
            </select>
          </div>

          {/* Expand/Collapse Toggle Button */}
          <button
            onClick={() => {
              const allExpanded = expandedSections.revenue && expandedSections.cogs && expandedSections.opex;
              if (allExpanded) {
                collapseAll();
              } else {
                expandAll();
              }
            }}
            className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 border border-gray-200 bg-white"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${
              expandedSections.revenue && expandedSections.cogs && expandedSections.opex ? 'rotate-180' : ''
            }`} />
            <span>{expandedSections.revenue && expandedSections.cogs && expandedSections.opex ? 'Collapse All' : 'Expand All'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Particulars</th>
              
              {compareMode === 'none' && (
                <>
                  {budgetMode && (
                    <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actual</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Budget</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Variance</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">% of Revenue</th>
                    </>
                  )}
                  {!budgetMode && (
                    <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">% of Revenue</th>
                    </>
                  )}
                </>
              )}

              {compareMode === 'monthly' && (
                <>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">April</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">May</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">June</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">July</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">%</th>
                </>
              )}

              {compareMode === 'yearly' && (
                <>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">FY 2024-25</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">FY 2023-24</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">YoY Change</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">%</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {plStructure.map((section, sectionIndex) => {
              const rows = [
                // Parent Row
                <tr 
                  key={section.id}
                  className={`transition-colors ${getRowStyle(section.type, true)} ${section.isExpandable ? 'cursor-pointer' : ''}`}
                  onClick={() => section.isExpandable && section.id && toggleSection(section.id as 'revenue' | 'cogs' | 'opex')}
                >
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      {section.isExpandable && (
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                            expandedSections[section.id as keyof typeof expandedSections] ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                      {!section.isExpandable && section.showContribution && (
                        <span className="w-4" />
                      )}
                      <span>{section.category}</span>
                      {section.showContribution && section.type === 'gross-profit' && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                          Contribution Margin
                        </span>
                      )}
                      {section.showContribution && section.type === 'net-profit' && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                          Bottom Line
                        </span>
                      )}
                    </div>
                  </td>

                  {/* No Comparison Mode */}
                  {compareMode === 'none' && budgetMode && (
                    <>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${getAmountColor(section.type, true)}`}>
                        {formatAmount(currentData[section.field as keyof typeof currentData].amount)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-600">
                        {formatAmount(currentData[section.field as keyof typeof currentData].budget)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {renderVariance(
                          currentData[section.field as keyof typeof currentData].amount,
                          currentData[section.field as keyof typeof currentData].budget
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          {calculatePercentage(
                            currentData[section.field as keyof typeof currentData].amount,
                            currentData.revenue.amount
                          )}
                        </span>
                      </td>
                    </>
                  )}

                  {compareMode === 'none' && !budgetMode && (
                    <>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${getAmountColor(section.type, true)}`}>
                        {formatAmount(currentData[section.field as keyof typeof currentData].amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          {calculatePercentage(
                            currentData[section.field as keyof typeof currentData].amount,
                            currentData.revenue.amount
                          )}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Monthly Comparison Mode */}
                  {compareMode === 'monthly' && (
                    <>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatAmount(monthlyData.april[section.field as keyof typeof monthlyData.april].amount)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatAmount(monthlyData.may[section.field as keyof typeof monthlyData.may].amount)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatAmount(monthlyData.june[section.field as keyof typeof monthlyData.june].amount)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                        {formatAmount(monthlyData.july[section.field as keyof typeof monthlyData.july].amount)}
                      </td>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${getAmountColor(section.type, true)}`}>
                        {formatAmount(calculateTotal(section.field))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          {calculatePercentage(calculateTotal(section.field), calculateTotal('revenue'))}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Yearly Comparison Mode */}
                  {compareMode === 'yearly' && (
                    <>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${getAmountColor(section.type, true)}`}>
                        {formatAmount(calculateTotal(section.field))}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-gray-600">
                        {formatAmount(calculateTotal(section.field) * 0.85)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-xs font-semibold text-green-600">
                          +{formatAmount(calculateTotal(section.field) * 0.15)} (+15%)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          {calculatePercentage(calculateTotal(section.field), calculateTotal('revenue'))}
                        </span>
                      </td>
                    </>
                  )}
                </tr>,
                
                // Child Rows - Only show if expanded
                ...(section.children && expandedSections[section.id as keyof typeof expandedSections] ? section.children.map((child, childIndex) => (
                  <tr 
                    key={`${section.id}-child-${childIndex}`}
                    className={`transition-colors ${getRowStyle(child.type, false, true)}`}
                  >
                    <td className="py-2.5 px-4 text-sm font-medium text-gray-700 pl-12">
                      {child.category}
                    </td>

                    {/* No Comparison Mode */}
                    {compareMode === 'none' && budgetMode && (
                      <>
                        <td className="py-2.5 px-4 text-sm font-semibold text-right text-gray-900">
                          {formatAmount(currentData[child.field as keyof typeof currentData].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-600">
                          {formatAmount(currentData[child.field as keyof typeof currentData].budget)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {renderVariance(
                            currentData[child.field as keyof typeof currentData].amount,
                            currentData[child.field as keyof typeof currentData].budget
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {calculatePercentage(
                              currentData[child.field as keyof typeof currentData].amount,
                              currentData.revenue.amount
                            )}
                          </span>
                        </td>
                      </>
                    )}

                    {compareMode === 'none' && !budgetMode && (
                      <>
                        <td className="py-2.5 px-4 text-sm font-semibold text-right text-gray-900">
                          {formatAmount(currentData[child.field as keyof typeof currentData].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {calculatePercentage(
                              currentData[child.field as keyof typeof currentData].amount,
                              currentData.revenue.amount
                            )}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Monthly Comparison Mode */}
                    {compareMode === 'monthly' && (
                      <>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-700">
                          {formatAmount(monthlyData.april[child.field as keyof typeof monthlyData.april].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-700">
                          {formatAmount(monthlyData.may[child.field as keyof typeof monthlyData.may].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-700">
                          {formatAmount(monthlyData.june[child.field as keyof typeof monthlyData.june].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-700">
                          {formatAmount(monthlyData.july[child.field as keyof typeof monthlyData.july].amount)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-semibold text-right text-gray-900">
                          {formatAmount(calculateTotal(child.field))}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {calculatePercentage(calculateTotal(child.field), calculateTotal('revenue'))}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Yearly Comparison Mode */}
                    {compareMode === 'yearly' && (
                      <>
                        <td className="py-2.5 px-4 text-sm font-semibold text-right text-gray-900">
                          {formatAmount(calculateTotal(child.field))}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-right text-gray-600">
                          {formatAmount(calculateTotal(child.field) * 0.85)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="text-xs font-medium text-green-600">
                            +{formatAmount(calculateTotal(child.field) * 0.15)} (+15%)
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {calculatePercentage(calculateTotal(child.field), calculateTotal('revenue'))}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                )) : [])
              ];
              
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
