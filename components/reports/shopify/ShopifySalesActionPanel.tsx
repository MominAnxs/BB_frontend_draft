import { Target, TrendingUp, Package, ShoppingCart, Users, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface SalesRecommendation {
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  type: 'optimize' | 'expand' | 'retention' | 'pricing' | 'inventory' | 'conversion';
  priority: number;
}

export function ShopifySalesActionPanel() {
  // World-class Shopify Sales recommendations
  const recommendations: SalesRecommendation[] = [
    {
      title: 'Expedite Restock for Best-Selling Items',
      description: 'Trench coat and leather bomber projected to stock out in 12 days at current velocity. Combined potential loss: ₹8.2L revenue.',
      action: 'Fast-track restock order—air freight 200 units premium items',
      impact: 'high',
      type: 'inventory',
      priority: 1
    },
    {
      title: 'Fix Sizing Issues on New Apparel SKUs',
      description: 'Return rate spiked to 3.2% (₹1.4L) driven by sizing complaints on 3 January launches. Customer reviews cite "runs small."',
      action: 'Update size charts, add fit guides, offer free exchanges',
      impact: 'high',
      type: 'optimize',
      priority: 2
    },
    {
      title: 'Optimize Checkout Flow for Mobile Conversions',
      description: 'Mobile checkout abandonment at 41% (₹8.4L cart value). Payment page causing 62% of drop-offs—UX friction detected.',
      action: 'Implement one-click checkout, add digital wallets (GPay, PayTM)',
      impact: 'high',
      type: 'conversion',
      priority: 3
    },
    {
      title: 'Launch Premium Customer Loyalty Program',
      description: 'Premium tier (₹5K+ orders) grew 28% to 184 customers contributing 41% of revenue. High retention opportunity.',
      action: 'Create VIP tier with early access, free shipping, 15% loyalty discount',
      impact: 'high',
      type: 'retention',
      priority: 4
    },
    {
      title: 'Increase Free Shipping Threshold to ₹1,999',
      description: 'Current ₹1,499 threshold raised AOV by ₹285 (15.8%). Next tier projected +12% AOV with minimal abandonment risk.',
      action: 'Test ₹1,999 threshold with A/B experiment for 14 days',
      impact: 'medium',
      type: 'pricing',
      priority: 5
    },
    {
      title: 'Expand Product Bundling Strategy',
      description: '"Complete the Look" feature at 32% adoption driving ₹14.2L revenue. Underutilized across product categories.',
      action: 'Create 15 new bundles with 10% discount, promote on PDP',
      impact: 'high',
      type: 'optimize',
      priority: 6
    },
    {
      title: 'Launch Tier-2 City Marketing Campaigns',
      description: 'Jaipur, Ahmedabad, Lucknow showing 4.8% conversion (above metro avg). Untapped growth market with 15% traffic share.',
      action: 'Allocate ₹5L/month for regional campaigns + local influencers',
      impact: 'medium',
      type: 'expand',
      priority: 7
    },
    {
      title: 'Implement Dynamic Pricing for Slow-Moving Inventory',
      description: '18 SKUs with <20 sales/month occupying 24% warehouse space. Margin erosion from holding costs building up.',
      action: 'Launch automated discount strategy: 15% off after 60 days',
      impact: 'medium',
      type: 'pricing',
      priority: 8
    },
    {
      title: 'Optimize Peak Hour Inventory & Staffing',
      description: 'Peak sales window 6-10 PM driving ₹880-₹950 AOV, but fulfillment delays during surge leading to 12% late shipments.',
      action: 'Add evening shift, pre-pack popular items before 6 PM',
      impact: 'medium',
      type: 'optimize',
      priority: 9
    },
    {
      title: 'Launch Post-Purchase Upsell Campaigns',
      description: 'Cross-sell rate at 24% strong but post-purchase window underutilized. Email open rate 48% within 24hr of order.',
      action: 'Create 3-email upsell sequence with complementary products',
      impact: 'medium',
      type: 'retention',
      priority: 10
    }
  ];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'inventory':
        return {
          icon: <Package className="w-5 h-5" />,
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
        };
      case 'optimize':
        return {
          icon: <RefreshCw className="w-5 h-5" />,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      case 'conversion':
        return {
          icon: <ShoppingCart className="w-5 h-5" />,
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      case 'retention':
        return {
          icon: <Users className="w-5 h-5" />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
        };
      case 'pricing':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
        };
      case 'expand':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
        };
      default:
        return {
          icon: <Target className="w-5 h-5" />,
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
        };
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return (
          <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
            Medium Impact
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
            Low Impact
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Priority Action Plan
            </h3>
            <p className="text-sm text-gray-600">
              {recommendations.length} recommendations to accelerate sales growth
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List - Scrollable (show 3, tease 4th) */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[520px]">
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const config = getTypeConfig(rec.type);
            return (
              <div
                key={index}
                className={`${config.bg} ${config.border} border rounded-xl p-5 hover:shadow-md transition-all group`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${config.iconBg} ${config.iconColor} p-2.5 rounded-lg flex-shrink-0`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{rec.priority}</span>
                        <h4 className="text-base font-semibold text-gray-900">
                          {rec.title}
                        </h4>
                      </div>
                      {getImpactBadge(rec.impact)}
                    </div>

                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {rec.action}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                        Create Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Want personalized e-commerce recommendations?
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
            <Sparkles className="w-4 h-4" />
            <span>Talk to an E-commerce Specialist</span>
          </button>
        </div>
      </div>
    </div>
  );
}