import { Target, PlayCircle, PauseCircle, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  type: 'scale' | 'pause' | 'reallocate' | 'refresh';
  priority: number;
  channel?: string; // Channel identifier for filtering
}

interface ActionRecommendationPanelProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

export function ActionRecommendationPanel({ businessModel, selectedChannel }: ActionRecommendationPanelProps) {
  // World-class E-commerce recommendations (11 total - channel-specific)
  const ecommerceRecommendations: Recommendation[] = [
    {
      title: 'Scale Top-Performing Meta Campaigns',
      description: 'Meta prospecting campaigns delivering 2.3x ROAS with stable CPMs. Opportunity to increase budget by 50% while maintaining efficiency.',
      action: 'Increase Meta budget from ₹28K to ₹42K/day',
      impact: 'high',
      type: 'scale',
      priority: 1,
      channel: 'Meta Ads'
    },
    {
      title: 'Pause Underperforming Google Shopping Ads',
      description: 'Google Shopping ROAS declined to 0.7x with rising CPCs. Immediate pause required to stop budget drain.',
      action: 'Pause 12 low-ROAS Shopping campaigns, reallocate ₹18K/day',
      impact: 'high',
      type: 'pause',
      priority: 2,
      channel: 'Google Ads'
    },
    {
      title: 'Launch Meta Dynamic Product Ads Refresh',
      description: 'Creative fatigue detected—CTR dropped 47% over 21 days. New video formats showing 2.1x better performance in tests.',
      action: 'Launch 15 new video creatives with UGC-style content',
      impact: 'high',
      type: 'refresh',
      priority: 3,
      channel: 'Meta Ads'
    },
    {
      title: 'Optimize Google Search for High-Intent Keywords',
      description: 'Top 20 branded + category keywords driving 68% revenue at 3.8x ROAS. Increase bids to capture more market share.',
      action: 'Increase bids 30% on top keywords, add 60 negatives',
      impact: 'high',
      type: 'scale',
      priority: 4,
      channel: 'Google Ads'
    },
    {
      title: 'Expedite Restock for Best-Selling Items',
      description: 'Trench coat and leather bomber projected to stock out in 12 days at current velocity. Combined potential loss: ₹8.2L revenue.',
      action: 'Fast-track restock order—air freight 200 units premium items',
      impact: 'high',
      type: 'scale',
      priority: 5,
      channel: 'Shopify'
    },
    {
      title: 'Launch Meta Advantage+ Shopping Campaigns',
      description: 'Traditional prospecting CPMs up 34%. Advantage+ leveraging AI showing 1.8x better ROAS in pilot tests with automated targeting.',
      action: 'Migrate 40% of Meta budget to Advantage+ Shopping',
      impact: 'high',
      type: 'scale',
      priority: 6,
      channel: 'Meta Ads'
    },
    {
      title: 'Implement Google Performance Max for Catalog',
      description: 'Product catalog with 450+ SKUs underutilized. Performance Max showing 2.6x ROAS in early tests vs Shopping alone.',
      action: 'Launch Performance Max with full catalog feed + creative assets',
      impact: 'high',
      type: 'scale',
      priority: 7,
      channel: 'Google Ads'
    },
    {
      title: 'Optimize Checkout Flow for Mobile Conversions',
      description: 'Mobile checkout abandonment at 41% (₹8.4L cart value). Payment page causing 62% of drop-offs—UX friction detected.',
      action: 'Implement one-click checkout, add digital wallets (GPay, PayTM)',
      impact: 'high',
      type: 'scale',
      priority: 8,
      channel: 'Shopify'
    },
    {
      title: 'Reallocate Budget to Peak Performance Hours',
      description: 'Data shows 6 PM–10 PM converting 2.4x better across all channels. Shift budget to high-conversion windows.',
      action: 'Implement dayparting strategy across Meta + Google',
      impact: 'medium',
      type: 'reallocate',
      priority: 9,
      channel: 'All Channels'
    },
    {
      title: 'Launch Cross-Channel Retargeting Sequences',
      description: 'Only 18% of cart abandoners seeing retargeting ads. Multi-touch sequences (Meta → Google → LinkedIn) show 3.4x recovery rate.',
      action: 'Build 7-day retargeting sequence across all channels',
      impact: 'high',
      type: 'scale',
      priority: 10,
      channel: 'All Channels'
    },
    {
      title: 'Increase Free Shipping Threshold to ₹1,999',
      description: 'Current ₹1,499 threshold raised AOV by ₹285 (15.8%). Next tier projected +12% AOV with minimal abandonment risk.',
      action: 'Test ₹1,999 threshold with A/B experiment for 14 days',
      impact: 'medium',
      type: 'scale',
      priority: 11,
      channel: 'Shopify'
    }
  ];

  // World-class Lead Generation recommendations (6 total - channel-specific)
  const leadgenRecommendations: Recommendation[] = [
    {
      title: 'Scale LinkedIn Lead Gen Forms—Highest SQL Rate',
      description: 'LinkedIn generating leads at ₹820 CPL with 48% SQL conversion. Best-performing channel by quality metrics.',
      action: 'Increase LinkedIn budget from ₹15K to ₹25K/day',
      impact: 'high',
      type: 'scale',
      priority: 1,
      channel: 'LinkedIn Ads'
    },
    {
      title: 'Expand LinkedIn Job Title Targeting',
      description: 'Decision-maker titles (VP, Director) converting 3.1x higher than broad targeting. Add 18 new job titles.',
      action: 'Launch 5 new campaigns with granular job title focus',
      impact: 'high',
      type: 'scale',
      priority: 2,
      channel: 'LinkedIn Ads'
    },
    {
      title: 'Pause Low-Quality Google Display Campaigns',
      description: 'Display generating high volume (450 leads/month) but only 4% SQL rate. Draining budget with poor quality.',
      action: 'Pause Display, shift ₹12K/day to Search + LinkedIn',
      impact: 'high',
      type: 'pause',
      priority: 3,
      channel: 'Google Ads'
    },
    {
      title: 'Optimize Meta Lead Forms with New Hooks',
      description: 'Meta lead forms showing 32% decline in submission rate. Ad fatigue on current messaging detected.',
      action: 'Test 10 new problem-solution hooks in video ads',
      impact: 'high',
      type: 'refresh',
      priority: 4,
      channel: 'Meta Ads'
    },
    {
      title: 'Launch Google Search Intent-Based Campaigns',
      description: 'Bottom-funnel keywords ("demo", "pricing") converting 5.2x better. Underutilized in current strategy.',
      action: 'Create 4 high-intent Search campaigns with ₹10K/day',
      impact: 'medium',
      type: 'scale',
      priority: 5,
      channel: 'Google Ads'
    },
    {
      title: 'A/B Test Landing Page Value Propositions',
      description: 'Conversion rate dropped from 4.8% to 2.3%. Competitor analysis shows stronger messaging opportunities.',
      action: 'Launch 3 landing page variants with new CTAs',
      impact: 'medium',
      type: 'refresh',
      priority: 6,
      channel: 'All Channels'
    }
  ];

  // Get base recommendations by business model
  const allRecommendations = businessModel === 'ecommerce' ? ecommerceRecommendations : leadgenRecommendations;

  // Filter by selected channel - strict filtering (default to all channels if 'all' or 'All Channels')
  const normalizedChannel = selectedChannel?.toLowerCase() || 'all';
  const filteredRecommendations = normalizedChannel === 'all' || selectedChannel === 'All Channels'
    ? allRecommendations
    : allRecommendations.filter(rec => rec.channel === selectedChannel);

  // Re-prioritize after filtering
  const recommendations = filteredRecommendations.map((rec, index) => ({
    ...rec,
    priority: index + 1
  }));

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'scale':
        return {
          icon: <PlayCircle className="w-5 h-5" />,
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          badge: 'bg-brand-light text-brand'
        };
      case 'pause':
        return {
          icon: <PauseCircle className="w-5 h-5" />,
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          badge: 'bg-gray-100 text-gray-700'
        };
      case 'reallocate':
        return {
          icon: <RefreshCw className="w-5 h-5" />,
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          badge: 'bg-brand-light text-brand'
        };
      case 'refresh':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          badge: 'bg-brand-light text-brand'
        };
      default:
        return {
          icon: <Target className="w-5 h-5" />,
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return (
          <span className="px-2.5 py-1 bg-brand-light text-brand rounded-lg text-xs font-semibold">
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 bg-brand-light text-brand rounded-lg text-xs font-semibold">
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
          <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Priority Action Plan
            </h3>
            <p className="text-sm text-gray-600">
              {recommendations.length} recommendations to improve performance
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
            Want personalized recommendations?
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-all shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Talk to a Performance Specialist</span>
          </button>
        </div>
      </div>
    </div>
  );
}