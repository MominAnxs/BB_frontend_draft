'use client';

import { useState } from 'react';
import { MousePointer, UserCheck, Award, TrendingDown, AlertCircle, CheckCircle2, Zap, ChevronDown, Target, Users, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ActionPanel } from './ActionPanel';

interface FunnelModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel?: string;
}

export function FunnelModule({ businessModel, selectedChannel }: FunnelModuleProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  // E-Commerce Funnel Data
  const ecommerceFunnelData = {
    sessions: 45680,
    addToCart: 1280,
    checkout: 768,
    purchases: 256,
    benchmarks: {
      sessionToCart: 3.5, // Industry benchmark %
      cartToCheckout: 75.0, // Industry benchmark %
      checkoutToPurchase: 45.0, // Industry benchmark %
    }
  };

  // Lead Gen Funnel Data - B2B Focus
  const leadgenFunnelData = {
    clicks: 12450,
    leads: 1680,
    qualified: 588,
    converted: 176,
    benchmarks: {
      clickToLead: 18.5, // Industry benchmark %
      leadToQualified: 45.0, // Industry benchmark %
      qualifiedToConverted: 38.0, // Industry benchmark %
    }
  };

  // Select appropriate data based on business model
  const isEcommerce = businessModel === 'ecommerce';

  // E-Commerce calculations
  const sessionToCartRate = (ecommerceFunnelData.addToCart / ecommerceFunnelData.sessions) * 100; // 2.8%
  const cartToCheckoutRate = (ecommerceFunnelData.checkout / ecommerceFunnelData.addToCart) * 100; // 60%
  const checkoutToPurchaseRate = (ecommerceFunnelData.purchases / ecommerceFunnelData.checkout) * 100; // 33.3%
  const overallEcommerceConversionRate = (ecommerceFunnelData.purchases / ecommerceFunnelData.sessions) * 100; // 0.56%

  const sessionToCartGap = sessionToCartRate - ecommerceFunnelData.benchmarks.sessionToCart; // -0.7%
  const cartToCheckoutGap = cartToCheckoutRate - ecommerceFunnelData.benchmarks.cartToCheckout; // -15%
  const checkoutToPurchaseGap = checkoutToPurchaseRate - ecommerceFunnelData.benchmarks.checkoutToPurchase; // -11.7%

  // Cart and Checkout abandonment rates
  const cartAbandonmentRate = 100 - cartToCheckoutRate; // 40%
  const checkoutAbandonmentRate = 100 - checkoutToPurchaseRate; // 66.7%

  // Lead Gen calculations
  const clickToLeadRate = (leadgenFunnelData.leads / leadgenFunnelData.clicks) * 100; // 13.5%
  const leadToQualifiedRate = (leadgenFunnelData.qualified / leadgenFunnelData.leads) * 100; // 35%
  const qualifiedToConvertedRate = (leadgenFunnelData.converted / leadgenFunnelData.qualified) * 100; // 29.9%
  const overallLeadgenConversionRate = (leadgenFunnelData.converted / leadgenFunnelData.clicks) * 100; // 1.41%

  const clickToLeadGap = clickToLeadRate - leadgenFunnelData.benchmarks.clickToLead; // -5%
  const leadToQualifiedGap = leadToQualifiedRate - leadgenFunnelData.benchmarks.leadToQualified; // -10%
  const qualifiedToConvertedGap = qualifiedToConvertedRate - leadgenFunnelData.benchmarks.qualifiedToConverted; // -8.1%

  // Identify largest leak for E-Commerce
  const ecommerceLeaks = [
    { stage: 'Session → Add-to-Cart', gap: Math.abs(sessionToCartGap), name: 'Product Page', value: sessionToCartGap },
    { stage: 'Cart → Checkout', gap: Math.abs(cartToCheckoutGap), name: 'Cart Abandonment', value: cartToCheckoutGap },
    { stage: 'Checkout → Purchase', gap: Math.abs(checkoutToPurchaseGap), name: 'Checkout Drop-off', value: checkoutToPurchaseGap }
  ];
  const ecommerceLargestLeak = ecommerceLeaks.reduce((max, leak) => leak.gap > max.gap ? leak : max, ecommerceLeaks[0]);

  // Identify largest leak for Lead Gen
  const leadgenLeaks = [
    { stage: 'Click → Lead', gap: Math.abs(clickToLeadGap), name: 'Landing Page', value: clickToLeadGap },
    { stage: 'Lead → Qualified', gap: Math.abs(leadToQualifiedGap), name: 'Qualification', value: leadToQualifiedGap },
    { stage: 'Qualified → Converted', gap: Math.abs(qualifiedToConvertedGap), name: 'Sales Close', value: qualifiedToConvertedGap }
  ];
  const leadgenLargestLeak = leadgenLeaks.reduce((max, leak) => leak.gap > max.gap ? leak : max, leadgenLeaks[0]);

  // E-Commerce Funnel Flow Data
  const ecommerceFunnelFlowData = [
    {
      stage: 'Sessions',
      count: ecommerceFunnelData.sessions,
      percentage: 100,
      benchmark: 100,
      gap: 0,
      color: '#204CC7',
      isLeak: false
    },
    {
      stage: 'Add-to-Cart',
      count: ecommerceFunnelData.addToCart,
      percentage: sessionToCartRate,
      benchmark: ecommerceFunnelData.benchmarks.sessionToCart,
      gap: sessionToCartGap,
      color: Math.abs(sessionToCartGap) > 0.5 ? '#ef4444' : '#204CC7',
      isLeak: Math.abs(sessionToCartGap) > 0.5
    },
    {
      stage: 'Checkout',
      count: ecommerceFunnelData.checkout,
      percentage: (ecommerceFunnelData.checkout / ecommerceFunnelData.sessions) * 100,
      benchmark: (ecommerceFunnelData.benchmarks.sessionToCart * ecommerceFunnelData.benchmarks.cartToCheckout) / 100,
      gap: cartToCheckoutGap,
      color: cartToCheckoutGap < -5 ? '#ef4444' : '#f59e0b',
      isLeak: cartToCheckoutGap < -5
    },
    {
      stage: 'Purchases',
      count: ecommerceFunnelData.purchases,
      percentage: overallEcommerceConversionRate,
      benchmark: (ecommerceFunnelData.benchmarks.sessionToCart * ecommerceFunnelData.benchmarks.cartToCheckout * ecommerceFunnelData.benchmarks.checkoutToPurchase) / 10000,
      gap: checkoutToPurchaseGap,
      color: checkoutToPurchaseGap < -5 ? '#ef4444' : '#10b981',
      isLeak: checkoutToPurchaseGap < -5
    }
  ];

  // Lead Gen Funnel Flow Data
  const leadgenFunnelFlowData = [
    {
      stage: 'Clicks',
      count: leadgenFunnelData.clicks,
      percentage: 100,
      benchmark: 100,
      gap: 0,
      color: '#204CC7',
      isLeak: false
    },
    {
      stage: 'Leads',
      count: leadgenFunnelData.leads,
      percentage: clickToLeadRate,
      benchmark: leadgenFunnelData.benchmarks.clickToLead,
      gap: clickToLeadGap,
      color: clickToLeadGap < -3 ? '#ef4444' : '#204CC7',
      isLeak: clickToLeadGap < -3
    },
    {
      stage: 'Qualified',
      count: leadgenFunnelData.qualified,
      percentage: (leadgenFunnelData.qualified / leadgenFunnelData.clicks) * 100,
      benchmark: (leadgenFunnelData.benchmarks.clickToLead * leadgenFunnelData.benchmarks.leadToQualified) / 100,
      gap: leadToQualifiedGap,
      color: leadToQualifiedGap < -3 ? '#ef4444' : '#10b981',
      isLeak: leadToQualifiedGap < -3
    },
    {
      stage: 'Converted',
      count: leadgenFunnelData.converted,
      percentage: overallLeadgenConversionRate,
      benchmark: (leadgenFunnelData.benchmarks.clickToLead * leadgenFunnelData.benchmarks.leadToQualified * leadgenFunnelData.benchmarks.qualifiedToConverted) / 10000,
      gap: qualifiedToConvertedGap,
      color: qualifiedToConvertedGap < -3 ? '#ef4444' : '#10b981',
      isLeak: qualifiedToConvertedGap < -3
    }
  ];

  const funnelFlowData = isEcommerce ? ecommerceFunnelFlowData : leadgenFunnelFlowData;
  const largestLeak = isEcommerce ? ecommerceLargestLeak : leadgenLargestLeak;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">{data.stage}</p>
          <div className="space-y-1 text-sm">
            {data.count !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">Count:</span>
                <span className="font-semibold text-gray-900">{data.count.toLocaleString()}</span>
              </div>
            )}
            {data.percentage !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">{isEcommerce ? '% of Sessions' : '% of Clicks'}:</span>
                <span className="font-semibold text-gray-900">{data.percentage.toFixed(2)}%</span>
              </div>
            )}
            {data.benchmark !== undefined && data.stage !== 'Sessions' && data.stage !== 'Clicks' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Benchmark:</span>
                  <span className="font-semibold text-gray-500">{data.benchmark.toFixed(2)}%</span>
                </div>
                {data.gap !== undefined && data.gap !== 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Gap:</span>
                    <span className={`font-semibold ${data.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {data.gap > 0 ? '+' : ''}{data.gap.toFixed(2)}%
                    </span>
                  </div>
                )}
              </>
            )}
            {data.isLeak && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Major Leak Detected
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* KPI Widgets */}
      {isEcommerce ? (
        // E-Commerce KPI Widgets
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Sessions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{ecommerceFunnelData.sessions.toLocaleString()}</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Sessions</div>
          </div>

          {/* Add-to-Cart % */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{sessionToCartRate.toFixed(1)}%</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Add-to-Cart Rate</div>
            <div className="text-xs text-gray-600">{ecommerceFunnelData.addToCart} carts</div>
          </div>

          {/* Checkout % */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-green-600">{cartToCheckoutRate.toFixed(1)}%</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Checkout Rate</div>
            <div className="text-xs text-gray-600">{ecommerceFunnelData.checkout} checkouts</div>
          </div>

          {/* Conversion % */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{overallEcommerceConversionRate.toFixed(2)}%</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Conversion Rate</div>
            <div className="text-xs text-gray-600">{ecommerceFunnelData.purchases} purchases</div>
          </div>
        </div>
      ) : (
        // Lead Gen KPI Widgets
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Clicks */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{leadgenFunnelData.clicks.toLocaleString()}</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Clicks</div>
          </div>

          {/* Leads */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{leadgenFunnelData.leads.toLocaleString()}</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Leads Generated</div>
            <div className="text-xs text-gray-600">{clickToLeadRate.toFixed(1)}% CVR</div>
          </div>

          {/* Qualified % */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-green-600">{leadToQualifiedRate.toFixed(1)}%</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Lead-to-Intent Rate</div>
            <div className="text-xs text-gray-600">{leadgenFunnelData.qualified} high-intent leads</div>
          </div>

          {/* Final Conversion % */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{overallLeadgenConversionRate.toFixed(2)}%</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Conversion Rate</div>
            <div className="text-xs text-gray-600">{leadgenFunnelData.qualified} converted leads</div>
          </div>
        </div>
      )}

      {/* Action & Recommendation Panel */}
      <div className="mb-6">
        <ActionPanel businessModel={businessModel} moduleType="funnel" />
      </div>

      {/* Funnel Drop-off Visualization */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Funnel Drop-off Trend</h3>
          </div>
          <p className="text-sm text-gray-500">
            {isEcommerce 
              ? 'Step-wise drop % vs benchmarks - identify where customers are abandoning' 
              : 'Step-wise conversion rates vs industry benchmarks - identify where leads are leaking'
            }
          </p>
        </div>

        {/* Largest Leak Alert */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">
                🚨 Largest Leak Detected: {largestLeak.name} Stage
              </p>
              <p className="text-xs text-red-700">
                {largestLeak.stage} is {largestLeak.gap.toFixed(1)}% below industry benchmark - this is your primary conversion bottleneck
              </p>
            </div>
          </div>
        </div>

        {/* Funnel Flow Visualization */}
        <div className="w-full" style={{ height: '384px' }}>
          <ResponsiveContainer width="100%" height={384} minWidth={0}>
            <BarChart 
              data={funnelFlowData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="stage" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {funnelFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-brand rounded"></div>
            <span className="text-xs text-gray-600">Actual Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Major Leak ({isEcommerce ? '> 5%' : '> 3%'} below benchmark)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Healthy Stage</span>
          </div>
        </div>

        {/* Key Insights - Integrated */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
              <span className="text-xs text-gray-500">Critical observations from your data</span>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[280px]">
            {isEcommerce ? (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Cart abandonment crisis - 40% drop-off vs 25% benchmark:</strong> Only 60% of carts proceed to checkout (vs 75% industry standard). 512 abandoned carts = ₹8.2L potential revenue lost/month. Root causes: shipping cost shock, complex checkout, lack of trust signals, or payment friction.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Checkout abandonment 67% vs 55% benchmark - losing 512 purchases/month:</strong> Checkout-to-purchase at 33% vs 45% standard. Payment failures, shipping delays, mandatory account creation, or hidden fees killing conversions. Fix could recover +₹5.2L revenue/month.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Add-to-Cart rate 2.8% vs 3.5% benchmark - product page friction:</strong> Session-to-cart conversion 20% below industry standard. Poor product images, missing reviews, unclear pricing, or slow load times preventing cart adds. Improvement could unlock +320 carts/month.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-brand-light border-brand/20 text-brand">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Overall funnel efficiency 0.56% vs 1.18% industry avg:</strong> Session-to-purchase running at 47% of benchmark performance. Multi-stage leak compounding losses. Fix top 2 leaks (cart + checkout abandonment) to recover 78% of gap = +284 purchases/month.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Quick win opportunity - cart abandonment emails = +₹3.2L revenue:</strong> Implement automated cart recovery flow (3 emails over 24hrs) with 15-20% recovery rate = +77 recovered purchases/month. Low-hanging fruit with Shopify/WooCommerce abandonment apps or custom automation.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Qualification crisis - 65% lead drop at qualification stage:</strong> Only 35% of leads qualify (vs 45% benchmark). 1,092 leads rejected = ₹3.38L wasted ad spend on junk leads. Root cause: weak landing page pre-qualification or targeting too broad.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Landing page CVR 13.5% vs 18.5% benchmark - losing 622 leads/month:</strong> Click-to-lead conversion 27% below industry standard. Form abandonment, slow load times, or messaging mismatch bleeding leads. Fix could unlock +₹1.93L pipeline value.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Sales close rate 29.9% vs 38% benchmark - losing 48 deals/month:</strong> Lead → Converted at 21% below standard. Sales process bottleneck, long sales cycles, or poor lead nurturing. 412 leads stuck in pipeline needing follow-up.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-brand-light border-brand/20 text-brand">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Overall funnel efficiency 1.41% vs 2.61% industry avg:</strong> Click-to-conversion running at 54% of benchmark performance. Multi-stage leak compounding losses. Fix top 2 leaks (landing page + qualification) to recover 85% of gap = +142 conversions/month.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Quick win opportunity - landing page fixes = +₹1.93L pipeline:</strong> Improving click-to-lead from 13.5% → 18.5% (benchmark) adds 622 leads/month. At current CVR of 3.2% = +20 additional conversions. Low-hanging fruit with A/B testing, form optimization, and page speed fixes.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
