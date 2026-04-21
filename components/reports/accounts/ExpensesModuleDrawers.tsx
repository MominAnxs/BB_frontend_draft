'use client';

import { 
  X, 
  TrendingUp, 
  TrendingDown,
  Download,
  ChevronDown,
  ShoppingCart,
  Truck,
  CreditCard,
  Package,
  AlertTriangle,
  AlertCircle,
  Users,
  Target,
  Building,
  FileText,
  Wifi,
  IndianRupee,
  BarChart3,
  Activity,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  ChevronRight,
  Zap,
  Factory,
  Wrench,
  Briefcase,
  PieChart as PieChartIcon
} from 'lucide-react';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts';

// 1. Direct Expenses Drawer
export function DirectExpensesDrawer({ onClose, businessType = 'Trading' }: { onClose: () => void; businessType?: 'Trading' | 'Manufacturing' | 'Services' }) {
  const [periodFilter, setPeriodFilter] = useState('This Month');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cogs': true,
    'freight': false,
    'packaging': false,
    'payment': false,
    'returns': false,
    'other': false
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Business-specific direct expenses data
  const getDirectExpensesData = () => {
    if (businessType === 'Manufacturing') {
      return [
        {
          id: 'raw-materials',
          category: 'Raw Materials',
          amount: 12.5,
          percentOfSales: 31.7,
          change: 8.2,
          color: '#ef4444',
          icon: Package,
          subcategories: [
            { name: 'Primary Raw Materials', amount: 8.3, percentOfSales: 21.1, change: 7.5, vendor: 'ABC Suppliers Ltd.' },
            { name: 'Secondary Materials', amount: 2.8, percentOfSales: 7.1, change: 10.2, vendor: 'XYZ Materials Co.' },
            { name: 'Consumables', amount: 1.4, percentOfSales: 3.6, change: 6.8, vendor: 'Multiple Vendors' }
          ]
        },
        {
          id: 'direct-labor',
          category: 'Direct Labor',
          amount: 5.8,
          percentOfSales: 14.7,
          change: 4.5,
          color: '#204CC7',
          icon: Users,
          subcategories: [
            { name: 'Production Workers', amount: 4.2, percentOfSales: 10.7, change: 3.8, vendor: 'Payroll' },
            { name: 'Shift Supervisors', amount: 1.2, percentOfSales: 3.0, change: 5.5, vendor: 'Payroll' },
            { name: 'Overtime & Incentives', amount: 0.4, percentOfSales: 1.0, change: 8.2, vendor: 'Payroll' }
          ]
        },
        {
          id: 'factory-consumables',
          category: 'Factory Consumables',
          amount: 2.4,
          percentOfSales: 6.1,
          change: -3.2,
          color: '#3A5FD4',
          icon: Wrench,
          subcategories: [
            { name: 'Machine Parts & Tools', amount: 1.3, percentOfSales: 3.3, change: -2.5, vendor: 'Industrial Supplies Inc.' },
            { name: 'Lubricants & Oils', amount: 0.6, percentOfSales: 1.5, change: -4.2, vendor: 'Tech Lubricants' },
            { name: 'Safety Equipment', amount: 0.5, percentOfSales: 1.3, change: -2.8, vendor: 'SafetyFirst Corp.' }
          ]
        },
        {
          id: 'freight-inward',
          category: 'Freight Inward',
          amount: 1.8,
          percentOfSales: 4.6,
          change: -5.3,
          color: '#5A7ADF',
          icon: Truck,
          subcategories: [
            { name: 'Domestic Transportation', amount: 1.2, percentOfSales: 3.0, change: -4.8, vendor: 'FastMove Logistics' },
            { name: 'Import Freight', amount: 0.4, percentOfSales: 1.0, change: -6.5, vendor: 'Global Shipping Co.' },
            { name: 'Loading & Unloading', amount: 0.2, percentOfSales: 0.5, change: -5.2, vendor: 'Local Labor' }
          ]
        },
        {
          id: 'packaging',
          category: 'Packaging Materials',
          amount: 1.5,
          percentOfSales: 3.8,
          change: 2.8,
          color: '#7A96E4',
          icon: Package,
          subcategories: [
            { name: 'Primary Packaging', amount: 0.9, percentOfSales: 2.3, change: 3.2, vendor: 'PackPro Solutions' },
            { name: 'Cartons & Boxes', amount: 0.4, percentOfSales: 1.0, change: 2.5, vendor: 'Box Makers Ltd.' },
            { name: 'Labels & Stickers', amount: 0.2, percentOfSales: 0.5, change: 1.8, vendor: 'Print Express' }
          ]
        },
        {
          id: 'quality-waste',
          category: 'Quality Control & Waste',
          amount: 1.2,
          percentOfSales: 3.0,
          change: -8.5,
          color: '#9AB2EE',
          icon: AlertCircle,
          subcategories: [
            { name: 'Quality Testing', amount: 0.5, percentOfSales: 1.3, change: -2.2, vendor: 'QC Department' },
            { name: 'Waste & Scrap', amount: 0.5, percentOfSales: 1.3, change: -12.5, vendor: 'Waste Management' },
            { name: 'Rework Costs', amount: 0.2, percentOfSales: 0.5, change: -15.8, vendor: 'Internal' }
          ]
        }
      ];
    } else if (businessType === 'Services') {
      return [
        {
          id: 'direct-labor',
          category: 'Direct Labor / Consultants',
          amount: 8.5,
          percentOfSales: 21.6,
          change: 6.8,
          color: '#204CC7',
          icon: Users,
          subcategories: [
            { name: 'Project Consultants', amount: 5.2, percentOfSales: 13.2, change: 8.2, vendor: 'External Consultants' },
            { name: 'Billable Staff', amount: 2.8, percentOfSales: 7.1, change: 5.5, vendor: 'Payroll' },
            { name: 'Freelancers', amount: 0.5, percentOfSales: 1.3, change: 4.2, vendor: 'Multiple Freelancers' }
          ]
        },
        {
          id: 'subcontractor',
          category: 'Subcontractor Costs',
          amount: 4.2,
          percentOfSales: 10.7,
          change: 12.5,
          color: '#ef4444',
          icon: Briefcase,
          subcategories: [
            { name: 'Technical Services', amount: 2.5, percentOfSales: 6.3, change: 15.2, vendor: 'TechPro Services' },
            { name: 'Specialized Work', amount: 1.2, percentOfSales: 3.0, change: 10.5, vendor: 'Expert Solutions' },
            { name: 'Support Services', amount: 0.5, percentOfSales: 1.3, change: 8.2, vendor: 'Various Vendors' }
          ]
        },
        {
          id: 'project-tools',
          category: 'Project-specific Tools',
          amount: 2.1,
          percentOfSales: 5.3,
          change: 8.5,
          color: '#5A7ADF',
          icon: Wrench,
          subcategories: [
            { name: 'Software Licenses', amount: 1.2, percentOfSales: 3.0, change: 10.2, vendor: 'Software Vendors' },
            { name: 'Cloud Services', amount: 0.6, percentOfSales: 1.5, change: 7.5, vendor: 'AWS/Azure' },
            { name: 'Equipment Rental', amount: 0.3, percentOfSales: 0.8, change: 5.8, vendor: 'Rental Co.' }
          ]
        },
        {
          id: 'travel-client',
          category: 'Travel & Client Meetings',
          amount: 1.8,
          percentOfSales: 4.6,
          change: -12.5,
          color: '#7A96E4',
          icon: Truck,
          subcategories: [
            { name: 'Client Travel', amount: 1.0, percentOfSales: 2.5, change: -15.2, vendor: 'Travel Agency' },
            { name: 'Accommodation', amount: 0.5, percentOfSales: 1.3, change: -10.5, vendor: 'Hotels' },
            { name: 'Local Transport', amount: 0.3, percentOfSales: 0.8, change: -8.2, vendor: 'Uber/Ola' }
          ]
        },
        {
          id: 'training',
          category: 'Training & Certifications',
          amount: 0.8,
          percentOfSales: 2.0,
          change: 15.2,
          color: '#9AB2EE',
          icon: Target,
          subcategories: [
            { name: 'Professional Certifications', amount: 0.4, percentOfSales: 1.0, change: 18.5, vendor: 'Certification Bodies' },
            { name: 'Training Programs', amount: 0.3, percentOfSales: 0.8, change: 12.2, vendor: 'Training Institutes' },
            { name: 'Conference & Events', amount: 0.1, percentOfSales: 0.3, change: 10.5, vendor: 'Event Organizers' }
          ]
        },
        {
          id: 'client-entertainment',
          category: 'Client Entertainment',
          amount: 0.6,
          percentOfSales: 1.5,
          change: -5.8,
          color: '#B4C7F3',
          icon: IndianRupee,
          subcategories: [
            { name: 'Client Meals', amount: 0.3, percentOfSales: 0.8, change: -6.2, vendor: 'Restaurants' },
            { name: 'Gifts & Hampers', amount: 0.2, percentOfSales: 0.5, change: -5.5, vendor: 'Gift Shops' },
            { name: 'Entertainment', amount: 0.1, percentOfSales: 0.3, change: -4.8, vendor: 'Various' }
          ]
        }
      ];
    } else { // Trading
      return [
        {
          id: 'cogs',
          category: 'Purchase of Goods (COGS)',
          amount: 18.5,
          percentOfSales: 47.0,
          change: 5.2,
          color: '#ef4444',
          icon: ShoppingCart,
          subcategories: [
            { name: 'Product Category A', amount: 10.2, percentOfSales: 25.9, change: 6.5, vendor: 'Supplier A Ltd.' },
            { name: 'Product Category B', amount: 5.8, percentOfSales: 14.7, change: 4.2, vendor: 'Supplier B Corp.' },
            { name: 'Product Category C', amount: 2.5, percentOfSales: 6.3, change: 3.8, vendor: 'Supplier C Inc.' }
          ]
        },
        {
          id: 'freight',
          category: 'Freight & Transportation',
          amount: 2.8,
          percentOfSales: 7.1,
          change: -4.5,
          color: '#3A5FD4',
          icon: Truck,
          subcategories: [
            { name: 'Inbound Freight', amount: 1.6, percentOfSales: 4.1, change: -3.8, vendor: 'FastShip Logistics' },
            { name: 'Last Mile Delivery', amount: 0.8, percentOfSales: 2.0, change: -5.2, vendor: 'QuickDeliver' },
            { name: 'Warehousing Charges', amount: 0.4, percentOfSales: 1.0, change: -4.8, vendor: 'StorageHub' }
          ]
        },
        {
          id: 'customs',
          category: 'Customs & Import Duties',
          amount: 1.9,
          percentOfSales: 4.8,
          change: 8.5,
          color: '#5A7ADF',
          icon: FileText,
          subcategories: [
            { name: 'Import Duties', amount: 1.2, percentOfSales: 3.0, change: 10.2, vendor: 'Customs Authority' },
            { name: 'Clearance Charges', amount: 0.5, percentOfSales: 1.3, change: 6.5, vendor: 'ClearFast Services' },
            { name: 'Documentation Fees', amount: 0.2, percentOfSales: 0.5, change: 5.2, vendor: 'DocuPro' }
          ]
        },
        {
          id: 'payment',
          category: 'Payment Gateway Fees',
          amount: 1.2,
          percentOfSales: 3.0,
          change: 12.5,
          color: '#7A96E4',
          icon: CreditCard,
          subcategories: [
            { name: 'Credit Card Fees', amount: 0.7, percentOfSales: 1.8, change: 15.2, vendor: 'Razorpay' },
            { name: 'UPI Charges', amount: 0.3, percentOfSales: 0.8, change: 10.5, vendor: 'PhonePe' },
            { name: 'Net Banking', amount: 0.2, percentOfSales: 0.5, change: 8.2, vendor: 'Payment Gateway' }
          ]
        },
        {
          id: 'packaging',
          category: 'Packaging Materials',
          amount: 0.9,
          percentOfSales: 2.3,
          change: 2.8,
          color: '#9AB2EE',
          icon: Package,
          subcategories: [
            { name: 'Boxes & Cartons', amount: 0.5, percentOfSales: 1.3, change: 3.2, vendor: 'PackRight Co.' },
            { name: 'Bubble Wrap & Fillers', amount: 0.2, percentOfSales: 0.5, change: 2.5, vendor: 'ProtectPack' },
            { name: 'Branded Packaging', amount: 0.2, percentOfSales: 0.5, change: 2.2, vendor: 'BrandBox Ltd.' }
          ]
        },
        {
          id: 'returns',
          category: 'Returns & Damages',
          amount: 0.7,
          percentOfSales: 1.8,
          change: -15.2,
          color: '#B4C7F3',
          icon: AlertTriangle,
          subcategories: [
            { name: 'Product Returns', amount: 0.4, percentOfSales: 1.0, change: -18.5, vendor: 'Customer Returns' },
            { name: 'Damaged Goods', amount: 0.2, percentOfSales: 0.5, change: -12.2, vendor: 'Write-offs' },
            { name: 'Return Shipping', amount: 0.1, percentOfSales: 0.3, change: -10.5, vendor: 'Reverse Logistics' }
          ]
        }
      ];
    }
  };

  const directExpenses = getDirectExpensesData();
  
  const totalDirect = directExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalPercentOfSales = directExpenses.reduce((sum, item) => sum + item.percentOfSales, 0);
  const avgChange = directExpenses.reduce((sum, item) => sum + item.change, 0) / directExpenses.length;

  // Calculate Gross Margin - assuming total sales is 100% base
  const salesRevenue = businessType === 'Trading' ? 39.4 : businessType === 'Manufacturing' ? 39.4 : 39.4;
  const grossMarginPercent = ((salesRevenue - totalDirect) / salesRevenue) * 100;

  // Trend data based on business type
  const getTrendData = () => {
    if (businessType === 'Manufacturing') {
      return [
        { month: 'Aug', amount: 24.5, percentOfSales: 62.5, grossMargin: 37.5 },
        { month: 'Sep', amount: 24.8, percentOfSales: 61.8, grossMargin: 38.2 },
        { month: 'Oct', amount: 25.2, percentOfSales: 62.2, grossMargin: 37.8 },
        { month: 'Nov', amount: 25.5, percentOfSales: 61.5, grossMargin: 38.5 },
        { month: 'Dec', amount: 26.1, percentOfSales: 61.0, grossMargin: 39.0 },
        { month: 'Jan', amount: 25.2, percentOfSales: 63.9, grossMargin: 36.1 }
      ];
    } else if (businessType === 'Services') {
      return [
        { month: 'Aug', amount: 17.2, percentOfSales: 43.8, grossMargin: 56.2 },
        { month: 'Sep', amount: 17.5, percentOfSales: 43.5, grossMargin: 56.5 },
        { month: 'Oct', amount: 17.8, percentOfSales: 43.9, grossMargin: 56.1 },
        { month: 'Nov', amount: 18.2, percentOfSales: 44.2, grossMargin: 55.8 },
        { month: 'Dec', amount: 18.5, percentOfSales: 43.8, grossMargin: 56.2 },
        { month: 'Jan', amount: 18.0, percentOfSales: 45.7, grossMargin: 54.3 }
      ];
    } else {
      return [
        { month: 'Aug', amount: 24.8, percentOfSales: 63.2, grossMargin: 36.8 },
        { month: 'Sep', amount: 25.2, percentOfSales: 62.8, grossMargin: 37.2 },
        { month: 'Oct', amount: 25.5, percentOfSales: 63.0, grossMargin: 37.0 },
        { month: 'Nov', amount: 26.1, percentOfSales: 62.5, grossMargin: 37.5 },
        { month: 'Dec', amount: 26.8, percentOfSales: 62.0, grossMargin: 38.0 },
        { month: 'Jan', amount: 26.0, percentOfSales: 66.0, grossMargin: 34.0 }
      ];
    }
  };

  const trendData = getTrendData();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white transform transition-transform duration-300 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Direct Expenses Deep Dive</h2>
              <p className="text-sm text-white/90 mt-0.5">{businessType} Business - Detailed breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
                <option>MTD (Month-to-Date)</option>
                <option>YTD (Year-to-Date)</option>
                <option>LTD (Life-to-Date)</option>
              </select>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Direct Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalDirect.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{totalPercentOfSales.toFixed(1)}% of sales</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Gross Margin</p>
              <p className="text-2xl font-bold text-gray-900">{grossMarginPercent.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {avgChange > 0 ? <TrendingDown className="w-3 h-3 text-gray-400" /> : <TrendingUp className="w-3 h-3 text-brand" />}
                {avgChange > 0 ? 'Expenses up' : 'Expenses down'} {Math.abs(avgChange).toFixed(1)}%
              </p>
            </div>
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">COGS</p>
              <p className="text-2xl font-bold text-brand">₹{directExpenses[0].amount}L</p>
              <p className="text-xs text-gray-500 mt-1">{((directExpenses[0].amount / totalDirect) * 100).toFixed(1)}% of total</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Expense Categories</p>
              <p className="text-2xl font-bold text-gray-900">{directExpenses.length}</p>
              <p className="text-xs text-gray-500 mt-1">{directExpenses.reduce((sum, cat) => sum + cat.subcategories.length, 0)} line items</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Direct Expenses & Gross Margin Trend</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-400" />
                  <span className="text-gray-600">Expenses (₹L)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-brand" />
                  <span className="text-gray-600">Gross Margin %</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(val) => `₹${val}L`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-xs font-semibold mb-2">{payload[0].payload.month}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Expenses: ₹{payload[0].value}L ({payload[0].payload.percentOfSales}%)
                          </p>
                          <p className="text-xs text-brand flex items-center gap-1 font-semibold mt-1">
                            <span className="w-2 h-2 rounded-full bg-brand"></span>
                            Gross Margin: {payload[1].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                <Line yAxisId="right" type="monotone" dataKey="grossMargin" stroke="#204CC7" strokeWidth={2.5} dot={{ r: 4, fill: '#204CC7' }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* All Direct Expenses Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">All Direct Expenses - Detailed Breakdown</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Total % of Sales:</span>
                <span className="font-bold text-red-600">{totalPercentOfSales.toFixed(1)}%</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">% of Sales</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Change</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Primary Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {directExpenses.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedCategories[category.id];
                    
                    const rows = [
                      // Parent Row
                      <tr 
                        key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className="border-b border-gray-200 cursor-pointer transition-colors bg-gray-50/80 hover:bg-gray-100"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ChevronRight 
                                className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: category.color }} />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{category.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-sm font-bold text-gray-900">₹{category.amount.toFixed(1)}L</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                              {category.percentOfSales.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className={`flex items-center justify-center gap-1 ${
                              category.change > 0 ? 'text-red-600' : category.change < 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {category.change > 0 && <TrendingUp className="w-4 h-4" />}
                              {category.change < 0 && <TrendingDown className="w-4 h-4" />}
                              <span className="text-sm font-semibold">
                                {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-gray-600">{category.subcategories.length} vendors</span>
                          </td>
                        </tr>,
                        
                        // Child Rows
                        ...(isExpanded ? category.subcategories.map((subcat, index) => (
                          <tr 
                            key={`${category.id}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white"
                          >
                            <td className="py-2.5 px-4 pl-16">
                              <span className="text-sm text-gray-700">{subcat.name}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="text-sm font-semibold text-gray-900">₹{subcat.amount.toFixed(1)}L</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {subcat.percentOfSales.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className={`flex items-center justify-center gap-1 text-xs ${
                                subcat.change > 0 ? 'text-red-600' : subcat.change < 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {subcat.change > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                                {subcat.change < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                                <span className="font-medium">
                                  {subcat.change > 0 ? '+' : ''}{subcat.change.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-xs text-gray-600">{subcat.vendor}</span>
                            </td>
                          </tr>
                        )) : [])
                      ];
                      
                      return rows;
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Insights */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Strategic Insights & Recommendations
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                <TrendingUp className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">Gross Margin Health</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Current gross margin at {grossMarginPercent.toFixed(1)}% is {grossMarginPercent > 40 ? 'strong' : grossMarginPercent > 30 ? 'healthy' : 'needs attention'}. Direct expenses account for {totalPercentOfSales.toFixed(1)}% of revenue. {businessType === 'Trading' ? 'Focus on supplier negotiations and bulk discounts.' : businessType === 'Manufacturing' ? 'Optimize production efficiency and reduce waste.' : 'Maximize billable utilization and control subcontractor costs.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                <AlertCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">Category Concentration Risk</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-semibold">{directExpenses[0].category}</span> dominates at {((directExpenses[0].amount / totalDirect) * 100).toFixed(1)}% of direct expenses. Consider diversifying {businessType === 'Trading' ? 'product mix and suppliers' : businessType === 'Manufacturing' ? 'material sources and automation' : 'service offerings and resource mix'} to reduce dependency.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                <Target className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">Cost Optimization Opportunity</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {directExpenses.filter(e => e.change > 0).length} categories showing cost increases. {businessType === 'Trading' ? 'Renegotiate contracts, consolidate vendors, and leverage volume discounts.' : businessType === 'Manufacturing' ? 'Implement lean manufacturing, automate processes, and optimize supply chain.' : 'Improve resource utilization, standardize deliverables, and optimize project scoping.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                <IndianRupee className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">Positive Trends</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {directExpenses.filter(e => e.change < 0).length} categories showing cost reductions, averaging {Math.abs(directExpenses.filter(e => e.change < 0).reduce((sum, e) => sum + e.change, 0) / Math.max(directExpenses.filter(e => e.change < 0).length, 1)).toFixed(1)}% decrease. Continue these efficiency initiatives and replicate successful strategies across other categories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Indirect Expenses Drawer
export function IndirectExpensesDrawer({ onClose }: { onClose: () => void }) {
  const [periodFilter, setPeriodFilter] = useState('This Month');
  const [viewType, setViewType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'personnel': true,
    'marketing': false,
    'facilities': false,
    'technology': false,
    'professional': false,
    'admin': false
  });

  // Restructured data with parent-child relationships
  const indirectExpenseCategories = [
    {
      id: 'personnel',
      category: 'Personnel Costs',
      amount: 6.2,
      type: 'Fixed',
      percentOfSales: 17.1,
      change: 3.2,
      color: '#204CC7',
      icon: Users,
      subcategories: [
        { name: 'Employee Salaries', amount: 4.8, percentOfSales: 13.2, change: 2.5, type: 'Fixed' },
        { name: 'Benefits & Insurance', amount: 0.9, percentOfSales: 2.5, change: 4.2, type: 'Fixed' },
        { name: 'Recruitment & Training', amount: 0.3, percentOfSales: 0.8, change: 8.5, type: 'Semi-Variable' },
        { name: 'Employee Incentives', amount: 0.2, percentOfSales: 0.6, change: -3.2, type: 'Semi-Variable' }
      ]
    },
    {
      id: 'marketing',
      category: 'Marketing & Sales',
      amount: 4.1,
      type: 'Semi-Variable',
      percentOfSales: 11.3,
      change: 18.3,
      color: '#3A5FD4',
      icon: Target,
      subcategories: [
        { name: 'Digital Advertising', amount: 2.2, percentOfSales: 6.1, change: 22.5, type: 'Semi-Variable' },
        { name: 'Content & SEO', amount: 0.8, percentOfSales: 2.2, change: 15.3, type: 'Semi-Variable' },
        { name: 'Brand & PR', amount: 0.6, percentOfSales: 1.7, change: 12.8, type: 'Semi-Variable' },
        { name: 'Events & Sponsorships', amount: 0.3, percentOfSales: 0.8, change: 18.9, type: 'Semi-Variable' },
        { name: 'Sales Commissions', amount: 0.2, percentOfSales: 0.6, change: 9.4, type: 'Semi-Variable' }
      ]
    },
    {
      id: 'facilities',
      category: 'Facilities & Operations',
      amount: 2.8,
      type: 'Fixed',
      percentOfSales: 7.7,
      change: -1.2,
      color: '#5A7ADF',
      icon: Building,
      subcategories: [
        { name: 'Office Rent', amount: 1.8, percentOfSales: 5.0, change: 0.0, type: 'Fixed' },
        { name: 'Utilities (Power, Water)', amount: 0.5, percentOfSales: 1.4, change: -2.5, type: 'Fixed' },
        { name: 'Maintenance & Repairs', amount: 0.3, percentOfSales: 0.8, change: -5.8, type: 'Semi-Variable' },
        { name: 'Security Services', amount: 0.2, percentOfSales: 0.6, change: 0.0, type: 'Fixed' }
      ]
    },
    {
      id: 'technology',
      category: 'Technology & Software',
      amount: 1.4,
      type: 'Fixed',
      percentOfSales: 3.9,
      change: 12.0,
      color: '#7A96E4',
      icon: Wifi,
      subcategories: [
        { name: 'SaaS Subscriptions', amount: 0.6, percentOfSales: 1.7, change: 15.5, type: 'Fixed' },
        { name: 'Cloud Infrastructure', amount: 0.4, percentOfSales: 1.1, change: 10.2, type: 'Semi-Variable' },
        { name: 'IT Support & Maintenance', amount: 0.3, percentOfSales: 0.8, change: 8.5, type: 'Fixed' },
        { name: 'Cybersecurity', amount: 0.1, percentOfSales: 0.3, change: 12.0, type: 'Fixed' }
      ]
    },
    {
      id: 'professional',
      category: 'Professional Services',
      amount: 1.2,
      type: 'Semi-Variable',
      percentOfSales: 3.3,
      change: 5.8,
      color: '#9AB2EE',
      icon: FileText,
      subcategories: [
        { name: 'Legal & Compliance', amount: 0.5, percentOfSales: 1.4, change: 6.2, type: 'Semi-Variable' },
        { name: 'Accounting & Audit', amount: 0.4, percentOfSales: 1.1, change: 3.8, type: 'Fixed' },
        { name: 'Consulting', amount: 0.2, percentOfSales: 0.6, change: 8.5, type: 'Semi-Variable' },
        { name: 'Insurance Premiums', amount: 0.1, percentOfSales: 0.3, change: 4.2, type: 'Fixed' }
      ]
    },
    {
      id: 'admin',
      category: 'Administrative',
      amount: 0.9,
      type: 'Semi-Variable',
      percentOfSales: 2.5,
      change: -8.5,
      color: '#B4C7F3',
      icon: Activity,
      subcategories: [
        { name: 'Office Supplies', amount: 0.3, percentOfSales: 0.8, change: -12.5, type: 'Semi-Variable' },
        { name: 'Communication (Phone, Internet)', amount: 0.2, percentOfSales: 0.6, change: -5.2, type: 'Fixed' },
        { name: 'Travel & Conveyance', amount: 0.2, percentOfSales: 0.6, change: -8.8, type: 'Semi-Variable' },
        { name: 'Miscellaneous', amount: 0.2, percentOfSales: 0.6, change: -6.5, type: 'Semi-Variable' }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const fixedTotal = indirectExpenseCategories.reduce((sum, cat) => {
    if (cat.type === 'Fixed') return sum + cat.amount;
    // For Semi-Variable, count fixed portions from subcategories
    const fixedSubcats = cat.subcategories.filter(sub => sub.type === 'Fixed');
    return sum + fixedSubcats.reduce((s, sub) => s + sub.amount, 0);
  }, 0);

  const variableTotal = indirectExpenseCategories.reduce((sum, cat) => {
    if (cat.type === 'Semi-Variable') {
      const variableSubcats = cat.subcategories.filter(sub => sub.type === 'Semi-Variable');
      return sum + variableSubcats.reduce((s, sub) => s + sub.amount, 0);
    }
    return sum;
  }, 0);

  const totalIndirect = indirectExpenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const fixedPercentOfSales = indirectExpenseCategories.reduce((sum, cat) => {
    if (cat.type === 'Fixed') return sum + cat.percentOfSales;
    const fixedSubcats = cat.subcategories.filter(sub => sub.type === 'Fixed');
    return sum + fixedSubcats.reduce((s, sub) => s + sub.percentOfSales, 0);
  }, 0);

  const variablePercentOfSales = indirectExpenseCategories.reduce((sum, cat) => {
    if (cat.type === 'Semi-Variable') {
      const variableSubcats = cat.subcategories.filter(sub => sub.type === 'Semi-Variable');
      return sum + variableSubcats.reduce((s, sub) => s + sub.percentOfSales, 0);
    }
    return sum;
  }, 0);

  // Realistic growth trend data for line chart
  const growthData = [
    { month: 'Aug', fixed: 8.2, variable: 3.8, total: 12.0 },
    { month: 'Sep', fixed: 8.4, variable: 4.1, total: 12.5 },
    { month: 'Oct', fixed: 8.6, variable: 4.4, total: 13.0 },
    { month: 'Nov', fixed: 8.8, variable: 4.8, total: 13.6 },
    { month: 'Dec', fixed: 9.1, variable: 5.5, total: 14.6 },
    { month: 'Jan', fixed: 9.3, variable: 5.2, total: 14.5 }
  ];

  const filteredCategories = viewType === 'all' 
    ? indirectExpenseCategories 
    : indirectExpenseCategories.filter(cat => cat.type.toLowerCase() === viewType);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white transform transition-transform duration-300 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-brand p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Indirect Expenses Analysis</h2>
              <p className="text-sm text-white/90 mt-0.5">Fixed vs Variable breakdown with growth trends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
                <option>MTD (Month-to-Date)</option>
                <option>YTD (Year-to-Date)</option>
                <option>LTD (Life-to-Date)</option>
              </select>
            </div>


          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Indirect</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalIndirect.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{(fixedPercentOfSales + variablePercentOfSales).toFixed(1)}% of sales</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Fixed Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{fixedTotal.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{fixedPercentOfSales.toFixed(1)}% of sales</p>
            </div>
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Semi-Variable Expenses</p>
              <p className="text-2xl font-bold text-brand">₹{variableTotal.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{variablePercentOfSales.toFixed(1)}% of sales</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Fixed/Variable Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{(fixedTotal / variableTotal).toFixed(1)}:1</p>
              <p className="text-xs text-gray-500 mt-1">Fixed to variable</p>
            </div>
          </div>

          {/* Fixed vs Variable Line Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Fixed vs Semi-Variable Growth Trend</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-gray-400" />
                  <span className="text-gray-600">Fixed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-brand" />
                  <span className="text-gray-600">Semi-Variable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-gray-500" />
                  <span className="text-gray-600">Total</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
              <LineChart data={growthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                  tickFormatter={(val) => `₹${val}L`} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-xs font-semibold mb-2">{payload[0].payload.month}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Fixed: ₹{payload[0].value}L
                          </p>
                          <p className="text-xs text-brand flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-brand"></span>
                            Semi-Variable: ₹{payload[1].value}L
                          </p>
                          <p className="text-xs text-gray-700 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                            Total: ₹{payload[2].value}L
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fixed" 
                  stroke="#204CC7" 
                  strokeWidth={2.5}
                  dot={{ fill: '#204CC7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="variable" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6b7280', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* All Indirect Expenses Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">All Indirect Expenses</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Total Fixed % of Sales:</span>
                <span className="font-bold text-gray-900">{fixedPercentOfSales.toFixed(1)}%</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">% of Sales</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedCategories[category.id];
                    
                    const rows = [
                      // Parent Row
                      <tr 
                        key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={`border-b border-gray-200 cursor-pointer transition-colors ${
                            'bg-gray-50/80 hover:bg-gray-100'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ChevronRight 
                                className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: category.color }} />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{category.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-sm font-bold text-gray-900">₹{category.amount.toFixed(1)}L</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                              {category.percentOfSales.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              category.type === 'Fixed' 
                                ? 'bg-gray-100 text-gray-700' 
                                : 'bg-brand-light text-brand'
                            }`}>
                              {category.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className={`flex items-center justify-center gap-1 ${
                              category.change > 0 ? 'text-red-600' : category.change < 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {category.change > 0 && <TrendingUp className="w-4 h-4" />}
                              {category.change < 0 && <TrendingDown className="w-4 h-4" />}
                              <span className="text-sm font-semibold">
                                {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>,
                        
                        // Child Rows
                        ...(isExpanded ? category.subcategories.map((subcat, index) => (
                          <tr 
                            key={`${category.id}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white"
                          >
                            <td className="py-2.5 px-4 pl-16">
                              <span className="text-sm text-gray-700">{subcat.name}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="text-sm font-semibold text-gray-900">₹{subcat.amount.toFixed(1)}L</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {subcat.percentOfSales.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                subcat.type === 'Fixed' 
                                  ? 'bg-gray-100 text-gray-600' 
                                  : 'bg-brand-light text-brand'
                              }`}>
                                {subcat.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className={`flex items-center justify-center gap-1 text-xs ${
                                subcat.change > 0 ? 'text-red-600' : subcat.change < 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {subcat.change > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                                {subcat.change < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                                <span className="font-medium">
                                  {subcat.change > 0 ? '+' : ''}{subcat.change.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        )) : [])
                      ];
                      
                      return rows;
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Key Insights
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Personnel costs</span> at ₹{indirectExpenseCategories[0].amount.toFixed(1)}L ({indirectExpenseCategories[0].percentOfSales.toFixed(1)}% of sales) represent largest OpEx category - ensure headcount aligns with revenue growth.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Marketing spend surged 18.3%</span> - Digital advertising (₹2.2L) leads the increase. Track CAC and ROI metrics closely.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Administrative efficiency improved</span> - 8.5% reduction indicates successful cost control measures in office supplies and travel.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Technology investments up 12%</span> - SaaS subscriptions and cloud infrastructure scaling with business growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Expenses vs Sales Drawer
export function ExpenseSalesDrawer({ onClose }: { onClose: () => void }) {
  const [periodFilter, setPeriodFilter] = useState('Last 6 Months');
  const [compareWith, setCompareWith] = useState('Last Year');

  const currentPeriodData = [
    { month: 'Aug', sales: 35.2, expenses: 16.2, netProfit: 19.0, margin: 54.0 },
    { month: 'Sep', sales: 37.5, expenses: 17.5, netProfit: 20.0, margin: 53.3 },
    { month: 'Oct', sales: 38.8, expenses: 18.1, netProfit: 20.7, margin: 53.4 },
    { month: 'Nov', sales: 41.2, expenses: 19.3, netProfit: 21.9, margin: 53.2 },
    { month: 'Dec', sales: 45.6, expenses: 21.8, netProfit: 23.8, margin: 52.2 },
    { month: 'Jan', sales: 39.4, expenses: 18.4, netProfit: 21.0, margin: 53.3 }
  ];

  const previousPeriodData = [
    { month: 'Aug', sales: 32.8, expenses: 14.8, netProfit: 18.0, margin: 54.9 },
    { month: 'Sep', sales: 34.2, expenses: 15.3, netProfit: 18.9, margin: 55.3 },
    { month: 'Oct', sales: 35.6, expenses: 16.0, netProfit: 19.6, margin: 55.1 },
    { month: 'Nov', sales: 37.8, expenses: 17.2, netProfit: 20.6, margin: 54.5 },
    { month: 'Dec', sales: 42.1, expenses: 19.5, netProfit: 22.6, margin: 53.7 },
    { month: 'Jan', sales: 36.2, expenses: 16.8, netProfit: 19.4, margin: 53.6 }
  ];

  const totalSales = currentPeriodData.reduce((sum, item) => sum + item.sales, 0);
  const totalExpenses = currentPeriodData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalSales - totalExpenses;
  const avgMargin = (totalProfit / totalSales * 100).toFixed(1);

  const prevTotalSales = previousPeriodData.reduce((sum, item) => sum + item.sales, 0);
  const prevTotalExpenses = previousPeriodData.reduce((sum, item) => sum + item.expenses, 0);

  const salesGrowth = ((totalSales - prevTotalSales) / prevTotalSales * 100).toFixed(1);
  const expenseGrowth = ((totalExpenses - prevTotalExpenses) / prevTotalExpenses * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white transform transition-transform duration-300 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Expenses vs Sales Analysis</h2>
              <p className="text-sm text-white/90 mt-0.5">Profitability trends and period comparison</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium"
              >
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={compareWith}
                onChange={(e) => setCompareWith(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium"
              >
                <option>Last Year</option>
                <option>Last Period</option>
                <option>Previous Quarter</option>
              </select>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSales.toFixed(1)}L</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-brand" />
                <p className="text-xs text-brand font-semibold">+{salesGrowth}%</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toFixed(1)}L</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500 font-semibold">+{expenseGrowth}%</p>
              </div>
            </div>
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-brand">₹{totalProfit.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{avgMargin}% margin</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Expense Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{((totalExpenses / totalSales) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Of sales</p>
            </div>
          </div>

          {/* Main Comparison Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Sales vs Expenses Trend</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-brand" />
                  <span className="text-gray-600">Sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-400" />
                  <span className="text-gray-600">Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-brand" />
                  <span className="text-gray-600">Net Profit</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <LineChart data={currentPeriodData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(val) => `₹${val}L`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-xs font-semibold mb-2">{payload[0].payload.month}</p>
                          <p className="text-xs text-green-700">Sales: ₹{payload[0].value}L</p>
                          <p className="text-xs text-red-700">Expenses: ₹{payload[1].value}L</p>
                          <p className="text-xs text-brand">Profit: ₹{payload[2].value}L</p>
                          <p className="text-xs text-gray-700 mt-1">Margin: {payload[0].payload.margin}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Sales" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} name="Expenses" />
                <Line type="monotone" dataKey="netProfit" stroke="#204CC7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#204CC7' }} name="Net Profit" />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Period Comparison Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Month-by-Month Comparison</h3>
            
            {/* Table Header */}
            <div className="grid grid-cols-10 gap-2 px-3 py-2 bg-gray-100 rounded-lg text-[10px] font-semibold text-gray-700 mb-2">
              <div className="col-span-2">Month</div>
              <div className="col-span-2 text-right">Current Sales</div>
              <div className="col-span-2 text-right">Current Expenses</div>
              <div className="col-span-2 text-right">Previous Period</div>
              <div className="col-span-2 text-right">Margin %</div>
            </div>

            {/* Table Body */}
            <div className="space-y-1">
              {currentPeriodData.map((data, index) => {
                const prev = previousPeriodData[index];
                const salesChange = ((data.sales - prev.sales) / prev.sales * 100).toFixed(1);
                const expenseChange = ((data.expenses - prev.expenses) / prev.expenses * 100).toFixed(1);
                
                return (
                  <div key={index} className="grid grid-cols-10 gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors">
                    <div className="col-span-2 font-semibold text-gray-900">{data.month}</div>
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-green-600">₹{data.sales}L</p>
                      <p className="text-[10px] text-green-600">+{salesChange}%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-red-600">₹{data.expenses}L</p>
                      <p className="text-[10px] text-red-600">+{expenseChange}%</p>
                    </div>
                    <div className="col-span-2 text-right text-gray-600">
                      <p>₹{prev.sales}L / ₹{prev.expenses}L</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-brand">{data.margin}%</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Row */}
            <div className="grid grid-cols-10 gap-2 px-3 py-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold mt-3">
              <div className="col-span-2 text-gray-900">Total</div>
              <div className="col-span-2 text-right text-gray-900">₹{totalSales.toFixed(1)}L</div>
              <div className="col-span-2 text-right text-gray-600">₹{totalExpenses.toFixed(1)}L</div>
              <div className="col-span-2 text-right text-gray-700">₹{prevTotalSales.toFixed(1)}L / ₹{prevTotalExpenses.toFixed(1)}L</div>
              <div className="col-span-2 text-right text-brand">{avgMargin}%</div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Key Insights
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Healthy {avgMargin}% average margin</span> maintained across the period, indicating strong expense control relative to revenue growth.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Sales grew by <span className="font-semibold">+{salesGrowth}%</span> while expenses increased by <span className="font-semibold">+{expenseGrowth}%</span>, showing improved operational efficiency.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  December margin dipped to 52.2% due to seasonal expense spike - plan ahead for Q4 cost optimization next year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Expenses Breakdown Drawer
export function ExpensesBreakdownDrawer({ onClose }: { onClose: () => void }) {
  const [periodFilter, setPeriodFilter] = useState('This Month');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      name: 'Direct Expenses',
      current: 16.1,
      previous: 14.3,
      change: 12.6,
      vendors: [
        { name: 'ABC Suppliers Ltd', amount: 4.8, category: 'COGS', change: 8.2 },
        { name: 'BlueDart Logistics', amount: 2.2, category: 'Shipping', change: -3.5 },
        { name: 'PayU Gateway', amount: 1.1, category: 'Payment Fees', change: 12.0 },
        { name: 'PackCo Materials', amount: 0.8, category: 'Packaging', change: 5.1 },
        { name: 'DHL Express', amount: 0.8, category: 'Shipping', change: -8.2 },
        { name: 'Razorpay', amount: 0.7, category: 'Payment Fees', change: 6.5 },
        { name: 'Quality Assurance Inc', amount: 1.3, category: 'COGS', change: 15.3 },
        { name: 'XYZ Manufacturing', amount: 2.1, category: 'COGS', change: 11.8 }
      ]
    },
    {
      name: 'Indirect Expenses',
      current: 13.1,
      previous: 12.5,
      change: 4.8,
      vendors: [
        { name: 'Staff Payroll', amount: 5.8, category: 'Salaries', change: 3.2 },
        { name: 'Google Ads', amount: 2.1, category: 'Marketing', change: 22.5 },
        { name: 'Facebook Ads', amount: 1.3, category: 'Marketing', change: 15.8 },
        { name: 'WeWork Office Space', amount: 1.8, category: 'Rent', change: 0.0 },
        { name: 'Electricity Board', amount: 0.5, category: 'Utilities', change: 8.5 },
        { name: 'Internet Provider', amount: 0.2, category: 'Utilities', change: 0.0 },
        { name: 'Office Depot', amount: 0.5, category: 'Supplies', change: -12.3 },
        { name: 'Stationery Plus', amount: 0.3, category: 'Supplies', change: -5.2 },
        { name: 'AWS Cloud', amount: 0.3, category: 'Software', change: 18.5 },
        { name: 'Microsoft 365', amount: 0.2, category: 'Software', change: 0.0 },
        { name: 'Salesforce CRM', amount: 0.1, category: 'Software', change: 25.0 }
      ]
    },
    {
      name: 'Administrative',
      current: 2.4,
      previous: 2.3,
      change: 4.3,
      vendors: [
        { name: 'Legal Advisors LLP', amount: 0.8, category: 'Professional Fees', change: 12.5 },
        { name: 'CA & Associates', amount: 0.6, category: 'Accounting', change: 0.0 },
        { name: 'Insurance Provider', amount: 0.5, category: 'Insurance', change: 8.0 },
        { name: 'Govt Licensing', amount: 0.3, category: 'Licenses', change: 0.0 },
        { name: 'Travel Agency', amount: 0.2, category: 'Travel', change: -15.5 }
      ]
    },
    {
      name: 'Financial Charges',
      current: 0.8,
      previous: 0.9,
      change: -11.1,
      vendors: [
        { name: 'HDFC Bank - Interest', amount: 0.4, category: 'Interest', change: -8.5 },
        { name: 'ICICI Bank - Charges', amount: 0.2, category: 'Bank Charges', change: -15.2 },
        { name: 'Foreign Exchange', amount: 0.2, category: 'FX Charges', change: -12.8 }
      ]
    }
  ];

  const totalCurrent = categories.reduce((sum, cat) => sum + cat.current, 0);
  const totalPrevious = categories.reduce((sum, cat) => sum + cat.previous, 0);
  const overallChange = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white transform transition-transform duration-300 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Expenses Breakdown by Category & Vendor</h2>
              <p className="text-sm text-white/90 mt-0.5">Detailed vendor-level analysis with period comparison</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Month vs Last Month</option>
                <option>This Quarter vs Last Quarter</option>
                <option>This Year vs Last Year</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Current Period</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalCurrent.toFixed(1)}L</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500 font-semibold">+{overallChange}%</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Previous Period</p>
              <p className="text-2xl font-bold text-gray-600">₹{totalPrevious.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">Baseline comparison</p>
            </div>
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Categories</p>
              <p className="text-2xl font-bold text-brand">{categories.length}</p>
              <p className="text-xs text-gray-500 mt-1">Expense types</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{categories.reduce((sum, cat) => sum + cat.vendors.length, 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Active suppliers</p>
            </div>
          </div>

          {/* Category Breakdown with Vendor Drilldown */}
          <div className="space-y-4">
            {categories.map((category) => {
              const isExpanded = expandedCategory === category.name;
              const filteredVendors = searchQuery 
                ? category.vendors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                : category.vendors;

              return (
                <div key={category.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Category Header */}
                  <div 
                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    role="button"
                    aria-expanded={isExpanded}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedCategory(isExpanded ? null : category.name); } }}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{category.vendors.length} vendors</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Current</p>
                        <p className="text-base font-bold text-gray-900">₹{category.current}L</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Previous</p>
                        <p className="text-base font-semibold text-gray-600">₹{category.previous}L</p>
                      </div>
                      <div className={`text-right w-20 flex items-center justify-end gap-1 ${
                        category.change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {category.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-semibold">{category.change > 0 ? '+' : ''}{category.change}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor List */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white">
                      {/* Vendor Table Header */}
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-100 text-[10px] font-semibold text-gray-700">
                        <div className="col-span-4">Vendor Name</div>
                        <div className="col-span-3">Sub-Category</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-3 text-right">Change</div>
                      </div>

                      {/* Vendor Rows */}
                      <div className="divide-y divide-gray-100">
                        {filteredVendors.map((vendor, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-xs">
                            <div className="col-span-4 font-medium text-gray-900">{vendor.name}</div>
                            <div className="col-span-3 text-gray-600">{vendor.category}</div>
                            <div className="col-span-2 text-right font-bold text-gray-900">₹{vendor.amount}L</div>
                            <div className={`col-span-3 text-right flex items-center justify-end gap-1 ${
                              vendor.change > 0 ? 'text-red-600' : vendor.change < 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {vendor.change > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                              {vendor.change < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                              <span className="font-semibold">
                                {vendor.change === 0 ? '—' : `${vendor.change > 0 ? '+' : ''}${vendor.change}%`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Category Total */}
                      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-t-2 border-gray-200 text-xs font-bold">
                        <div className="col-span-4 text-gray-900">Category Total</div>
                        <div className="col-span-3 text-gray-700">{category.vendors.length} vendors</div>
                        <div className="col-span-2 text-right text-gray-900">₹{category.current}L</div>
                        <div className={`col-span-3 text-right ${category.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {category.change > 0 ? '+' : ''}{category.change}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Expense Summary</h3>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-600">Current Period Total</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalCurrent.toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Previous Period Total</p>
                    <p className="text-xl font-semibold text-gray-600">₹{totalPrevious.toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Period-over-Period Change</p>
                    <div className={`flex items-center gap-1 ${Number(overallChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(overallChange) > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <p className="text-xl font-bold">{Number(overallChange) > 0 ? '+' : ''}{overallChange}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Vendor Insights
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Direct expenses grew 12.6%</span> - primarily driven by COGS increases from ABC Suppliers and Quality Assurance Inc.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Marketing spend surged</span> - Google Ads (+22.5%) and Facebook Ads (+15.8%) driving indirect expense growth.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Financial charges down 11.1% - successful interest rate renegotiation with HDFC Bank paying off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
