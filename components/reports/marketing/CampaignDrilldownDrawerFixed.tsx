import { X, Target, Lightbulb, CheckCircle, AlertCircle, Eye, MousePointer, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { DemographicsBreakdown } from './DemographicsBreakdown';

// Campaign Drill-down Drawer Component
export function CampaignDrilldownDrawer({ campaign, isOpen, onClose, businessModel = 'ecommerce' }: { campaign: any; isOpen: boolean; onClose: () => void; businessModel?: 'ecommerce' | 'leadgen' }) {
  if (!isOpen) return null;

  // Generate realistic demographics data based on business model and campaign type
  const getDemographicsData = () => {
    if (businessModel === 'leadgen') {
      // LEAD GENERATION DEMOGRAPHICS
      if (campaign.name.includes('Lead Gen Forms') || campaign.name.includes('Service Discovery')) {
        return {
          age: [
            { range: '35-44', percentage: 38, spend: 45600, leads: 59, cpl: 773, qualified: 42 },
            { range: '45-54', percentage: 32, spend: 38400, leads: 50, cpl: 768, qualified: 35 },
            { range: '25-34', percentage: 22, spend: 26400, leads: 34, cpl: 776, qualified: 22 },
            { range: '55+', percentage: 8, spend: 9600, leads: 13, cpl: 738, qualified: 9 },
          ],
          gender: [
            { type: 'Male', percentage: 68, spend: 81600, leads: 106, cpl: 770, qualified: 74 },
            { type: 'Female', percentage: 32, spend: 38400, leads: 50, cpl: 768, qualified: 35 },
          ],
          region: [
            { name: 'Bangalore', percentage: 35, spend: 42000, leads: 55, cpl: 764, qualified: 38 },
            { name: 'Mumbai', percentage: 28, spend: 33600, leads: 44, cpl: 764, qualified: 30 },
            { name: 'Delhi NCR', percentage: 22, spend: 26400, leads: 34, cpl: 776, qualified: 24 },
            { name: 'Hyderabad', percentage: 15, spend: 18000, leads: 23, cpl: 783, qualified: 16 },
          ],
          platform: [
            { type: 'Desktop', percentage: 58, spend: 69600, leads: 91, cpl: 765, qualified: 63 },
            { type: 'Mobile', percentage: 35, spend: 42000, leads: 54, cpl: 778, qualified: 38 },
            { type: 'Tablet', percentage: 7, spend: 8400, leads: 11, cpl: 764, qualified: 8 },
          ],
          jobTitle: [
            { title: 'Founder/CEO', percentage: 42, leads: 66, qualified: 58 },
            { title: 'COO/Operations', percentage: 28, leads: 44, qualified: 35 },
            { title: 'Finance Head', percentage: 18, leads: 28, qualified: 18 },
            { title: 'Other', percentage: 12, leads: 18, qualified: 9 },
          ]
        };
      } else if (campaign.name.includes('Video') || campaign.name.includes('Testimonial')) {
        return {
          age: [
            { range: '35-44', percentage: 42, spend: 75600, leads: 41, cpl: 1844, qualified: 30 },
            { range: '25-34', percentage: 30, spend: 54000, leads: 29, cpl: 1862, qualified: 20 },
            { range: '45-54', percentage: 20, spend: 36000, leads: 20, cpl: 1800, qualified: 14 },
            { range: '55+', percentage: 8, spend: 14400, leads: 8, cpl: 1800, qualified: 6 },
          ],
          gender: [
            { type: 'Male', percentage: 72, spend: 129600, leads: 71, cpl: 1825, qualified: 51 },
            { type: 'Female', percentage: 28, spend: 50400, leads: 27, cpl: 1867, qualified: 19 },
          ],
          region: [
            { name: 'Mumbai', percentage: 32, spend: 57600, leads: 31, cpl: 1858, qualified: 22 },
            { name: 'Delhi NCR', percentage: 28, spend: 50400, leads: 27, cpl: 1867, qualified: 19 },
            { name: 'Bangalore', percentage: 25, spend: 45000, leads: 25, cpl: 1800, qualified: 18 },
            { name: 'Other Metros', percentage: 15, spend: 27000, leads: 15, cpl: 1800, qualified: 11 },
          ],
          platform: [
            { type: 'Mobile', percentage: 65, spend: 117000, leads: 64, cpl: 1828, qualified: 46 },
            { type: 'Desktop', percentage: 30, spend: 54000, leads: 29, cpl: 1862, qualified: 21 },
            { type: 'Tablet', percentage: 5, spend: 9000, leads: 5, cpl: 1800, qualified: 4 },
          ],
          jobTitle: [
            { title: 'Founder/CEO', percentage: 45, leads: 44, qualified: 36 },
            { title: 'Marketing Head', percentage: 28, leads: 27, qualified: 20 },
            { title: 'Growth Manager', percentage: 18, leads: 18, qualified: 12 },
            { title: 'Other', percentage: 9, leads: 9, qualified: 4 },
          ]
        };
      } else if (campaign.name.includes('Lead Magnet') || campaign.name.includes('Case Studies')) {
        return {
          age: [
            { range: '35-44', percentage: 40, spend: 60000, leads: 50, cpl: 1200, qualified: 38 },
            { range: '25-34', percentage: 32, spend: 48000, leads: 40, cpl: 1200, qualified: 30 },
            { range: '45-54', percentage: 20, spend: 30000, leads: 25, cpl: 1200, qualified: 19 },
            { range: '55+', percentage: 8, spend: 12000, leads: 9, cpl: 1333, qualified: 6 },
          ],
          gender: [
            { type: 'Male', percentage: 65, spend: 97500, leads: 81, cpl: 1204, qualified: 61 },
            { type: 'Female', percentage: 35, spend: 52500, leads: 43, cpl: 1221, qualified: 32 },
          ],
          region: [
            { name: 'Bangalore', percentage: 38, spend: 57000, leads: 47, cpl: 1213, qualified: 36 },
            { name: 'Delhi NCR', percentage: 30, spend: 45000, leads: 37, cpl: 1216, qualified: 28 },
            { name: 'Mumbai', percentage: 22, spend: 33000, leads: 27, cpl: 1222, qualified: 20 },
            { name: 'Pune', percentage: 10, spend: 15000, leads: 13, cpl: 1154, qualified: 10 },
          ],
          platform: [
            { type: 'Desktop', percentage: 62, spend: 93000, leads: 77, cpl: 1208, qualified: 58 },
            { type: 'Mobile', percentage: 32, spend: 48000, leads: 40, cpl: 1200, qualified: 30 },
            { type: 'Tablet', percentage: 6, spend: 9000, leads: 7, cpl: 1286, qualified: 5 },
          ],
          jobTitle: [
            { title: 'Founder/CEO', percentage: 38, leads: 47, qualified: 40 },
            { title: 'COO/Operations', percentage: 30, leads: 37, qualified: 28 },
            { title: 'VP/Director', percentage: 22, leads: 27, qualified: 19 },
            { title: 'Manager', percentage: 10, leads: 13, qualified: 6 },
          ]
        };
      } else {
        // Default lead gen demographics
        return {
          age: [
            { range: '35-44', percentage: 38, spend: 34200, leads: 31, cpl: 1103, qualified: 18 },
            { range: '25-34', percentage: 32, spend: 28800, leads: 26, cpl: 1108, qualified: 15 },
            { range: '45-54', percentage: 22, spend: 19800, leads: 18, cpl: 1100, qualified: 11 },
            { range: '55+', percentage: 8, spend: 7200, leads: 7, cpl: 1029, qualified: 4 },
          ],
          gender: [
            { type: 'Male', percentage: 70, spend: 63000, leads: 57, cpl: 1105, qualified: 34 },
            { type: 'Female', percentage: 30, spend: 27000, leads: 25, cpl: 1080, qualified: 14 },
          ],
          region: [
            { name: 'Bangalore', percentage: 35, spend: 31500, leads: 29, cpl: 1086, qualified: 17 },
            { name: 'Mumbai', percentage: 30, spend: 27000, leads: 25, cpl: 1080, qualified: 14 },
            { name: 'Delhi NCR', percentage: 22, spend: 19800, leads: 18, cpl: 1100, qualified: 11 },
            { name: 'Other Metros', percentage: 13, spend: 11700, leads: 10, cpl: 1170, qualified: 6 },
          ],
          platform: [
            { type: 'Desktop', percentage: 55, spend: 49500, leads: 45, cpl: 1100, qualified: 26 },
            { type: 'Mobile', percentage: 38, spend: 34200, leads: 31, cpl: 1103, qualified: 18 },
            { type: 'Tablet', percentage: 7, spend: 6300, leads: 6, cpl: 1050, qualified: 4 },
          ],
          jobTitle: [
            { title: 'Founder/CEO', percentage: 35, leads: 29, qualified: 18 },
            { title: 'Department Head', percentage: 30, leads: 25, qualified: 14 },
            { title: 'Manager', percentage: 22, leads: 18, qualified: 11 },
            { title: 'Other', percentage: 13, leads: 10, qualified: 5 },
          ]
        };
      }
    } else {
      // E-COMMERCE DEMOGRAPHICS (existing code)
      if (campaign.name.includes('Catalog')) {
        return {
          age: [
            { range: '25-34', percentage: 42, spend: 100800, revenue: 285000, roas: 2.83, purchases: 1486 },
            { range: '35-44', percentage: 28, spend: 67200, revenue: 190400, roas: 2.83, purchases: 990 },
            { range: '18-24', percentage: 18, spend: 43200, revenue: 122400, roas: 2.83, purchases: 637 },
            { range: '45-54', percentage: 12, spend: 28800, revenue: 81600, roas: 2.83, purchases: 424 },
          ],
          gender: [
            { type: 'Female', percentage: 62, spend: 148800, revenue: 421440, roas: 2.83, purchases: 2192 },
            { type: 'Male', percentage: 38, spend: 91200, revenue: 258240, roas: 2.83, purchases: 1344 },
          ],
          region: [
            { name: 'Mumbai', percentage: 32, spend: 76800, revenue: 217344, roas: 2.83, purchases: 1131 },
            { name: 'Delhi NCR', percentage: 28, spend: 67200, revenue: 190176, roas: 2.83, purchases: 990 },
            { name: 'Bangalore', percentage: 22, spend: 52800, revenue: 149424, roas: 2.83, purchases: 778 },
            { name: 'Other Metros', percentage: 18, spend: 43200, revenue: 122256, roas: 2.83, purchases: 637 },
          ],
          platform: [
            { type: 'Mobile', percentage: 68, spend: 163200, revenue: 461856, roas: 2.83, purchases: 2404 },
            { type: 'Desktop', percentage: 22, spend: 52800, revenue: 149424, roas: 2.83, purchases: 778 },
            { type: 'Tablet', percentage: 10, spend: 24000, revenue: 67920, roas: 2.83, purchases: 354 },
          ]
        };
      } else {
        // Default e-commerce demographics
        return {
          age: [
            { range: '25-34', percentage: 40, spend: 64000, revenue: 88320, roas: 1.38, purchases: 486 },
            { range: '18-24', percentage: 30, spend: 48000, revenue: 66240, roas: 1.38, purchases: 365 },
            { range: '35-44', percentage: 20, spend: 32000, revenue: 44160, roas: 1.38, purchases: 243 },
            { range: '45-54', percentage: 10, spend: 16000, revenue: 22080, roas: 1.38, purchases: 122 },
          ],
          gender: [
            { type: 'Female', percentage: 55, spend: 88000, revenue: 121440, roas: 1.38, purchases: 669 },
            { type: 'Male', percentage: 45, spend: 72000, revenue: 99360, roas: 1.38, purchases: 547 },
          ],
          region: [
            { name: 'Mumbai', percentage: 28, spend: 44800, revenue: 61824, roas: 1.38, purchases: 340 },
            { name: 'Delhi NCR', percentage: 26, spend: 41600, revenue: 57408, roas: 1.38, purchases: 316 },
            { name: 'Bangalore', percentage: 24, spend: 38400, revenue: 52992, roas: 1.38, purchases: 292 },
            { name: 'Other Metros', percentage: 22, spend: 35200, revenue: 48576, roas: 1.38, purchases: 268 },
          ],
          platform: [
            { type: 'Mobile', percentage: 70, spend: 112000, revenue: 154560, roas: 1.38, purchases: 851 },
            { type: 'Desktop', percentage: 22, spend: 35200, revenue: 48576, roas: 1.38, purchases: 268 },
            { type: 'Tablet', percentage: 8, spend: 12800, revenue: 17664, roas: 1.38, purchases: 97 },
          ]
        };
      }
    }
  };

  const demographics = getDemographicsData();

  // Generate insights based on campaign performance and business model
  const getInsights = () => {
    const insights = [];
    
    if (businessModel === 'leadgen') {
      // LEAD GENERATION INSIGHTS
      const conversionRate = campaign.cvr || 20;
      
      if (campaign.cpl <= 800) {
        insights.push({
          type: 'success',
          title: 'Exceptional CPL Performance',
          description: `₹${campaign.cpl} CPL is 40% below industry benchmark of ₹${1200}. Highly efficient lead acquisition with ${campaign.leads} total leads generated.`,
          action: 'Scale budget by 30-40% to capture more market share while CPL remains efficient. Test similar audience segments.'
        });
      } else if (campaign.cpl > 1500) {
        insights.push({
          type: 'critical',
          title: 'High Cost Per Lead',
          description: `Current ₹${campaign.cpl} CPL is 50% above target. CTR at ${campaign.ctr}% indicates targeting or ad relevance issues.`,
          action: 'A/B test simplified lead forms, refine audience targeting, and test new ad creative focused on clear value proposition.'
        });
      }

      if (conversionRate >= 22) {
        insights.push({
          type: 'success',
          title: 'Strong Conversion Rate',
          description: `${conversionRate.toFixed(0)}% conversion rate from ${campaign.leads} leads shows strong alignment between targeting and ICP.`,
          action: 'Document winning audience parameters and replicate across other campaigns. Scale budget while maintaining efficiency.'
        });
      } else if (conversionRate < 15) {
        insights.push({
          type: 'critical',
          title: 'Low Conversion Rate',
          description: `Only ${conversionRate.toFixed(0)}% conversion rate indicates poor audience fit or unclear value proposition attracting low-intent clicks.`,
          action: 'Tighten targeting criteria, add qualification questions to form, and ensure ad messaging clearly communicates who you serve.'
        });
      }

      // Demographics insights for lead gen
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topAge = demographics.age[0] as any;
      if (topAge.percentage > 35) {
        insights.push({
          type: 'insight',
          title: `${topAge.range} Decision-Makers Dominate`,
          description: `${topAge.percentage}% of leads come from ${topAge.range} age group at ₹${topAge.cpl} CPL with strong engagement rates.`,
          action: 'Create age-specific landing pages and ad creative that speaks to career stage and business maturity of this segment.'
        });
      }

      const desktopPercentage = demographics.platform.find((p: any) => p.type === 'Desktop')?.percentage || 0;
      if (desktopPercentage > 55) {
        insights.push({
          type: 'insight',
          title: 'B2B Desktop Behavior Pattern',
          description: `${desktopPercentage}% of leads convert on desktop, typical for business decision-makers researching during work hours.`,
          action: 'Optimize landing pages for desktop experience with detailed case studies, ROI calculators, and professional imagery.'
        });
      }

    } else {
      // E-COMMERCE INSIGHTS (existing)
      if (campaign.roas >= 2.5) {
        insights.push({
          type: 'success',
          title: 'Exceptional ROAS Performance',
          description: `This campaign is delivering ${campaign.roas.toFixed(2)}x ROAS, significantly above the 2.0x benchmark. Strong product-market fit with effective targeting.`,
          action: 'Consider increasing budget by 20-30% to scale winning strategy while maintaining ROAS.'
        });
      } else if (campaign.roas < 1.5) {
        insights.push({
          type: 'critical',
          title: 'ROAS Below Target',
          description: `Current ${campaign.roas.toFixed(2)}x ROAS is below the 2.0x target. High CPA of ₹${campaign.cpa.toFixed(0)} indicates targeting or creative issues.`,
          action: 'Test new audience segments and refresh creative assets. Consider pausing until improvements are made.'
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topAgeGroup = demographics.age[0] as any;
      if (topAgeGroup.percentage > 40) {
        insights.push({
          type: 'insight',
          title: `${topAgeGroup.range} Age Group Dominates`,
          description: `${topAgeGroup.percentage}% of spend and ${topAgeGroup.purchases.toLocaleString()} purchases come from ${topAgeGroup.range} demographic with ${topAgeGroup.roas.toFixed(2)}x ROAS.`,
          action: 'Create age-specific ad sets with tailored messaging and visual styles for this high-performing segment.'
        });
      }

      const mobilePercentage = demographics.platform.find((p: any) => p.type === 'Mobile')?.percentage || 0;
      if (mobilePercentage > 65) {
        insights.push({
          type: 'insight',
          title: 'Mobile-First Audience Behavior',
          description: `${mobilePercentage}% of purchases happen on mobile devices. Mobile optimization is critical for success.`,
          action: 'Ensure mobile landing pages load under 2 seconds and checkout is optimized for thumb-friendly navigation.'
        });
      }
    }

    return insights.slice(0, 4);
  };

  const insights = getInsights();

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-brand-light">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {campaign.objective}
                  </span>
                  <span>•</span>
                  <span>₹{campaign.budget.toLocaleString()} {campaign.budgetType} budget</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    campaign.status === 'excellent' ? 'text-brand' :
                    campaign.status === 'good' ? 'text-brand' :
                    campaign.status === 'average' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {campaign.status === 'excellent' ? '✓ Excellent' :
                     campaign.status === 'good' ? '✓ Good' :
                     campaign.status === 'average' ? '⚠ Average' : '✗ Needs Work'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              {(businessModel === 'leadgen' ? [
                { label: 'Spend', value: `₹${(campaign.spend / 100000).toFixed(1)}L`, change: '-5%', positive: true },
                { label: 'Leads', value: campaign.leads.toLocaleString(), change: '+22%', positive: true },
                { label: 'CPL', value: `₹${campaign.cpl.toLocaleString()}`, change: '-12%', positive: true },
                { label: 'CTR', value: `${campaign.ctr.toFixed(1)}%`, change: '+8%', positive: true },
              ] : [
                { label: 'Spend', value: `₹${(campaign.spend / 100000).toFixed(1)}L`, change: '-5%', positive: true },
                { label: 'Revenue', value: `₹${(campaign.revenue / 100000).toFixed(1)}L`, change: '+18%', positive: true },
                { label: 'ROAS', value: `${campaign.roas.toFixed(2)}x`, change: '+12%', positive: true },
                { label: 'CPA', value: `₹${campaign.cpa.toFixed(0)}`, change: '-15%', positive: true },
              ]).map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-base font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.positive ? 'text-brand' : 'text-gray-500'}`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Key Insights */}
              <div className="bg-brand-light rounded-xl border border-brand/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-brand" />
                  <h3 className="text-sm font-semibold text-gray-900">Actionable Insights & Strategic Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        insight.type === 'success' ? 'bg-gray-50/80 border-gray-100' :
                        insight.type === 'critical' ? 'bg-gray-50/80 border-gray-100' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {insight.type === 'success' && <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />}
                        {insight.type === 'critical' && <AlertCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />}
                        {insight.type === 'insight' && <Target className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">{insight.title}</p>
                          <p className="text-xs text-gray-700 mb-2">{insight.description}</p>
                          <div className="flex items-start gap-1.5 p-2 bg-white/60 rounded border border-gray-200/60">
                            <ArrowRight className="w-3 h-3 text-brand mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-medium text-brand-dark">{insight.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(businessModel === 'leadgen' ? [
                    { label: 'Impressions', value: (campaign.impressions / 1000000).toFixed(1) + 'M', icon: Eye },
                    { label: 'Clicks', value: (campaign.clicks / 1000).toFixed(1) + 'K', icon: MousePointer },
                    { label: 'Lead Conv. Rate', value: campaign.cvr.toFixed(1) + '%', icon: Target },
                    { label: 'CPM', value: '₹' + (campaign.cpm?.toLocaleString() || Math.round(campaign.spend / (campaign.impressions / 1000)).toLocaleString()), icon: CheckCircle },
                    { label: 'Frequency', value: campaign.frequency.toFixed(1), icon: RefreshCw },
                    { label: 'Avg. CPC', value: '₹' + Math.round(campaign.spend / campaign.clicks).toLocaleString(), icon: TrendingUp },
                  ] : [
                    { label: 'Impressions', value: (campaign.impressions / 1000000).toFixed(1) + 'M', icon: Eye },
                    { label: 'Clicks', value: (campaign.clicks / 1000).toFixed(1) + 'K', icon: MousePointer },
                    { label: 'CTR', value: campaign.ctr.toFixed(2) + '%', icon: TrendingUp },
                    { label: 'Conversion Rate', value: campaign.cvr.toFixed(1) + '%', icon: Target },
                    { label: 'Frequency', value: campaign.frequency.toFixed(1), icon: RefreshCw },
                    { label: 'Purchases', value: campaign.purchases.toLocaleString(), icon: CheckCircle },
                  ]).map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <p className="text-xs text-gray-600">{metric.label}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Demographics Breakdown */}
              <DemographicsBreakdown data={demographics} businessModel={businessModel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}