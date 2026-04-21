'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  ChevronDown, 
  Lightbulb,
  ArrowRight,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle,
  IndianRupee,
  TrendingUp as TrendUpIcon
} from 'lucide-react';

// Widget Component (Same structure as Website module)
function SummaryWidget({ 
  title, 
  icon: Icon,
  iconBg,
  iconColor,
  data,
  onViewDetails
}: { 
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  data: any;
  onViewDetails: () => void;
}) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={onViewDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content - Flexible height */}
      <div className="flex-1 mb-3">
        {data.content}
      </div>

      {/* Insights Dropdown - Fixed at bottom */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Insights</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
        </button>

        {showInsights && (
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
            {data.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopifySalesWidgets({ onOpenDrawer }: { onOpenDrawer: (drawer: string) => void }) {
  // 1. Revenue Performance Widget
  const revenueData = {
    content: (
      <div className="space-y-4">
        {/* Hero Metric */}
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gross Sales</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">₹44.3L</span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">+61%</span>
                </div>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Net Sales Split */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border border-gray-200 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Net Sales</p>
            <p className="text-2xl font-bold text-gray-900">₹40.1L</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">+68% growth</p>
          </div>
          <div className="p-3 bg-white border border-gray-200 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">₹51.3L</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">+72% growth</p>
          </div>
        </div>

        {/* Critical Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
              <div>
                <p className="text-xs text-gray-600">Discounts</p>
                <p className="text-sm font-bold text-gray-900">₹2.8L</p>
              </div>
            </div>
            <span className="text-xs font-medium text-blue-700">6.3% of sales</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
              <div>
                <p className="text-xs text-gray-600">Returns</p>
                <p className="text-sm font-bold text-gray-900">₹1.4L</p>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700">3.2% return rate</span>
          </div>
        </div>

        {/* Margin Indicator */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-700">Net Sales Margin</p>
            <CheckCircle className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">90.5%</p>
          <p className="text-xs text-gray-600 mt-0.5">+2.4% improvement from last period</p>
        </div>
      </div>
    ),
    insights: [
      <span key="1"><span className="font-semibold">142% of target achieved</span> - festive season promotions drove ₹44.3L gross sales with strong conversion</span>,
      <span key="2"><span className="font-semibold">Discount efficiency improved</span> - reduced from 8.5% to 6.3% while maintaining growth, saving ₹1.7L</span>,
      <span key="3"><span className="font-semibold">Return rate increased to 3.2%</span> - primarily from 3 new apparel SKUs with sizing issues, needs immediate fix</span>,
      <span key="4"><span className="font-semibold">Weekend sales dominate</span> - Saturday & Sunday account for 42% of monthly revenue, optimize campaigns for weekends</span>
    ]
  };

  // 2. Product Performance Widget
  const productData = {
    content: (
      <div className="space-y-4">
        {/* Top Product Hero */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700 font-semibold">Best Seller</p>
                <p className="text-sm font-bold text-gray-900">Premium Trench Coat</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <p className="text-xs text-gray-600">Revenue</p>
              <p className="text-lg font-bold text-gray-900">₹1.85L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Growth</p>
              <p className="text-lg font-bold text-green-600">+60%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Units</p>
              <p className="text-lg font-bold text-gray-900">142</p>
            </div>
          </div>
        </div>

        {/* Top 3 Products */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Top Products</p>
          {[
            { name: 'Navy Peacoat', revenue: '₹1.64L', growth: '+68%' },
            { name: 'Cashmere Overcoat', revenue: '₹1.42L', growth: '+61%' },
          ].map((product, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">#{idx + 2}</span>
                <span className="text-sm font-medium text-gray-900">{product.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{product.revenue}</span>
                <span className="text-xs font-medium text-green-600">{product.growth}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Performance */}
        

        {/* Stock Alert */}
        <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Stock Alert</p>
              <p className="text-xs text-gray-700">Top 2 items stock out in 12 days - expedite restock</p>
            </div>
          </div>
        </div>
      </div>
    ),
    insights: [
      <span key="1"><span className="font-semibold">Premium outerwear drives 38% revenue</span> - ₹16.9L from trench coats & peacoats via influencer partnerships</span>,
      <span key="2"><span className="font-semibold">Leather bomber had viral moment</span> - 71% growth from Instagram reel (2.4M views, 18K saves)</span>,
      <span key="3"><span className="font-semibold">Top 6 products = 52% of revenue</span> - healthy concentration, indicates strong product-market fit</span>,
      <span key="4"><span className="font-semibold">Cross-sell rate at 24%</span> - customers bundling blazers with trousers, avg bundle value ₹8,450</span>
    ]
  };

  // 3. Customer Purchase Behavior Widget
  const customerData = {
    content: (
      <div className="space-y-4">
        {/* Hero Metric - Customer Split */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600 mb-1">New Customers</p>
            <p className="text-3xl font-bold text-green-600">71.6%</p>
            <p className="text-xs text-gray-700 mt-1">1,528 orders</p>
          </div>
          <div className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Returning</p>
            <p className="text-3xl font-bold text-blue-600">28.4%</p>
            <p className="text-xs text-gray-700 mt-1">606 orders</p>
          </div>
        </div>

        {/* AOV Comparison */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-medium text-gray-700 mb-3">Average Order Value</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-gray-900">₹1,842</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Returning</p>
              <p className="text-2xl font-bold text-purple-600">₹2,654</p>
              <p className="text-xs text-purple-600 font-medium">+44% higher</p>
            </div>
          </div>
        </div>

        {/* Purchase Frequency */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer Segments</p>
          <div className="p-3 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">Premium Tier (₹5K+)</span>
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">VIP</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">184 customers · 8.6%</span>
              <span className="font-bold text-gray-900">41% of revenue</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">Regular (₹2K-5K)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">842 customers · 39.4%</span>
              <span className="font-bold text-gray-900">43% of revenue</span>
            </div>
          </div>
        </div>

        {/* Loyalty Metric */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Repeat Purchase Rate</p>
              <p className="text-lg font-bold text-gray-900">28.4%</p>
            </div>
          </div>
          <span className="text-xs font-medium text-green-600">+4.2% ↑</span>
        </div>
      </div>
    ),
    insights: [
      <span key="1"><span className="font-semibold">Returning customers spend 44% more</span> - ₹2,654 vs ₹1,842 AOV, focus on retention to maximize LTV</span>,
      <span key="2"><span className="font-semibold">Premium tier drives 41% revenue</span> - 184 customers (8.6%) are your VIPs, create exclusive loyalty program</span>,
      <span key="3"><span className="font-semibold">28.4% repeat rate is strong</span> - increased 4.2% with email nurture campaigns and product quality improvements</span>,
      <span key="4"><span className="font-semibold">First-time buyers dominate</span> - 71.6% new customers shows strong acquisition, now optimize for retention</span>
    ]
  };

  // 4. Conversion & Funnel Widget
  const conversionData = {
    content: (
      <div className="space-y-4">
        {/* Overall Conversion Hero */}
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100/30 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Conversion Rate</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-green-600">4.42%</span>
                <span className="text-sm text-gray-500">Top 15%</span>
              </div>
              <p className="text-xs text-green-700 font-medium">2,134 orders from 48,240 sessions</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Key Funnel Stages */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Funnel Performance</p>
          
          <div className="p-3 bg-white border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Product Views</span>
              <span className="text-sm font-bold text-gray-900">50%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[50%] transition-all duration-500" />
            </div>
            <p className="text-xs text-gray-600 mt-1">24,120 views from 48,240 sessions</p>
          </div>

          <div className="p-3 bg-white border border-indigo-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Add to Cart</span>
              <span className="text-sm font-bold text-gray-900">15%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[15%] transition-all duration-500" />
            </div>
            <p className="text-xs text-gray-600 mt-1">7,236 carts · Up from 11.5%</p>
          </div>
        </div>

        {/* Critical Issue */}
        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900">Checkout Abandonment</p>
                <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full font-semibold">41%</span>
              </div>
              <p className="text-xs text-gray-700 mb-1">1,484 carts worth ₹8.4L abandoned</p>
              <p className="text-xs text-red-700 font-medium">Primary drop-off: Payment page (62%)</p>
            </div>
          </div>
        </div>

        {/* Mobile Performance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 text-center bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Mobile Conv.</p>
            <p className="text-2xl font-bold text-blue-600">3.8%</p>
            <span className="text-xs text-green-600 font-medium">+45% ↑</span>
          </div>
          <div className="p-3 text-center bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Desktop Conv.</p>
            <p className="text-2xl font-bold text-indigo-600">5.2%</p>
            <span className="text-xs text-gray-500">Baseline</span>
          </div>
        </div>
      </div>
    ),
    insights: [
      <span key="1"><span className="font-semibold">4.42% conversion in top 15%</span> - improved from 3.28%, strong validation of product-market fit</span>,
      <span key="2"><span className="font-semibold">41% checkout abandonment = ₹8.4L lost</span> - payment page drop-off (62%), add trust badges & simplify</span>,
      <span key="3"><span className="font-semibold">Mobile conversion up 45%</span> - now at 3.8% after checkout optimization, mobile drives 58% of orders</span>,
      <span key="4"><span className="font-semibold">Add-to-cart rate at 15%</span> - up from 11.5%, credited to improved product photos and size guide clarity</span>
    ]
  };

  // 5. Order Fulfillment & Operations Widget
  const operationsData = {
    content: (
      <div className="space-y-4">
        {/* Fulfillment Rate Hero */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">Fulfilled</p>
            <p className="text-3xl font-bold text-green-600">86.5%</p>
            <p className="text-xs text-gray-700 mt-1">1,847 orders</p>
          </div>
          <div className="p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-600">13.5%</p>
            <p className="text-xs text-gray-700 mt-1">287 orders</p>
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-xs font-medium text-gray-700 mb-3">Delivery Performance</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-700">On-time delivery</span>
              </div>
              <span className="text-sm font-bold text-gray-900">92.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-xs text-gray-700">Delayed (1-2 days)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">6.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs text-gray-700">Late (3+ days)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">1.4%</span>
            </div>
          </div>
        </div>

        {/* Shipping Revenue */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700">Shipping Revenue</p>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">₹3.2L</span>
            <span className="text-xs font-medium text-purple-600">+45% growth</span>
          </div>
          <p className="text-xs text-gray-600">Expedited delivery: 18% adoption, ₹150 premium</p>
        </div>

        {/* Return Rate Alert */}
        <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Return Rate: 3.2%</p>
              <p className="text-xs text-gray-700 mb-1">₹1.4L in returns · Up from 2.1% baseline</p>
              <p className="text-xs text-orange-700 font-medium">Primary issue: Sizing on 3 new apparel SKUs</p>
            </div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Processing Time</p>
            <p className="text-lg font-bold text-gray-900">18.5 hours</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      </div>
    ),
    insights: [
      <span key="1"><span className="font-semibold">86.5% fulfillment rate is strong</span> - 1,847 orders shipped, 287 pending due to inventory constraints</span>,
      <span key="2"><span className="font-semibold">92.4% on-time delivery</span> - customer satisfaction high, but 7.6% delayed orders need courier optimization</span>,
      <span key="3"><span className="font-semibold">Expedited shipping at ₹3.2L revenue</span> - 18% adoption rate, customers willing to pay ₹150 premium</span>,
      <span key="4"><span className="font-semibold">3.2% return rate needs attention</span> - up from 2.1%, fix sizing charts for 3 problematic SKUs immediately</span>
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <SummaryWidget
        title="Revenue Performance"
        icon={IndianRupee}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        data={revenueData}
        onViewDetails={() => onOpenDrawer('revenue')}
      />
      
      <SummaryWidget
        title="Product Performance"
        icon={Package}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        data={productData}
        onViewDetails={() => onOpenDrawer('products')}
      />
      
      <SummaryWidget
        title="Customer Purchase Behavior"
        icon={Users}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        data={customerData}
        onViewDetails={() => onOpenDrawer('customers')}
      />
      
      <SummaryWidget
        title="Conversion & Funnel"
        icon={Target}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        data={conversionData}
        onViewDetails={() => onOpenDrawer('conversion')}
      />
      
      {/* Temporarily hidden - Order Fulfillment & Operations */}
      {/* <div className="lg:col-span-2">
        <SummaryWidget
          title="Order Fulfillment & Operations"
          icon={Zap}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          data={operationsData}
          onViewDetails={() => onOpenDrawer('operations')}
        />
      </div> */}
    </div>
  );
}
