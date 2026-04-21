/**
 * DashboardDataEngine.tsx
 * 
 * Centralized data layer that connects Chat prompts to Dashboard report data.
 * Provides structured, data-driven responses for each prompt category,
 * keyed by service type and business type.
 */

// ── Types ──

export interface DashboardKPI {
  label: string;
  value: string;
  target?: string;
  delta: number; // positive = good, negative = bad
  status: 'good' | 'warning' | 'danger';
  unit?: string;
  deltaLabel?: string; // e.g. "QoQ" or "MoM" — shown when no target
}

export interface CampaignRow {
  name: string;
  spend: string;
  result: string;        // ROAS / CPL / Revenue etc.
  resultLabel: string;
  status: 'good' | 'warning' | 'danger';
  delta: number;
  channel: string;
}

export interface CreativeRow {
  name: string;
  type: string;           // 'Video' | 'Static' | 'Carousel'
  spend: string;
  result: string;
  resultLabel: string;
  ctr: string;
  status: 'good' | 'warning' | 'danger';
}

export interface TrendPoint {
  label: string;
  value: number;
  previousValue?: number;
}

export interface ComparisonItem {
  channel: string;
  metrics: { label: string; value: string; status: 'good' | 'warning' | 'danger' }[];
}

export interface AlertItem {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
}

export interface InsightItem {
  icon: 'lightbulb' | 'target' | 'trending' | 'alert' | 'dollar' | 'zap';
  title: string;
  description: string;
}

export interface StructuredResponse {
  narrative: string;           // Main text response with markdown
  kpis?: DashboardKPI[];       // KPI cards to show
  campaigns?: CampaignRow[];   // Campaign ranking table
  creatives?: CreativeRow[];   // Creative ranking table
  trend?: { title: string; data: TrendPoint[]; unit: string; color: string };
  comparison?: ComparisonItem[];
  alerts?: AlertItem[];
  insights?: InsightItem[];
  followUpButtons?: { label: string; action: string; variant: 'primary' | 'secondary' }[];
  componentType: 'dashboard-response';
}

// ── Dashboard Data Store ──
// This simulates the data that would come from the real Dashboard reports module.

// ─── MARKETING: E-COMMERCE ───

const MKTG_ECOM_KPIS: DashboardKPI[] = [
  { label: 'Ad Spend', value: '₹3.8L', target: '₹4.0L', delta: -5, status: 'good', unit: '₹' },
  { label: 'Revenue', value: '₹12.2L', target: '₹14.0L', delta: -13, status: 'warning', unit: '₹' },
  { label: 'ROAS', value: '3.2x', target: '4.0x', delta: -20, status: 'warning', unit: 'x' },
  { label: 'Orders', value: '428', target: '500', delta: -14, status: 'warning' },
  { label: 'AOV', value: '₹2,841', target: '₹3,000', delta: -5, status: 'good', unit: '₹' },
  { label: 'Conv. Rate', value: '2.8%', target: '3.5%', delta: -20, status: 'warning', unit: '%' },
  { label: 'CTR', value: '2.1%', target: '2.8%', delta: -25, status: 'warning', unit: '%' },
  { label: 'CAC', value: '₹850', target: '₹650', delta: -31, status: 'danger', unit: '₹' },
];

const MKTG_ECOM_CAMPAIGNS: CampaignRow[] = [
  { name: 'Summer Sale - Retargeting', spend: '₹45K', result: '5.8x', resultLabel: 'ROAS', status: 'good', delta: 22, channel: 'Meta Ads' },
  { name: 'Brand Search - Exact Match', spend: '₹32K', result: '4.9x', resultLabel: 'ROAS', status: 'good', delta: 12, channel: 'Google Ads' },
  { name: 'Lookalike - Top Purchasers', spend: '₹58K', result: '4.2x', resultLabel: 'ROAS', status: 'good', delta: 5, channel: 'Meta Ads' },
  { name: 'Shopping - Bestsellers', spend: '₹41K', result: '3.6x', resultLabel: 'ROAS', status: 'warning', delta: -10, channel: 'Google Ads' },
  { name: 'Dynamic Product Ads', spend: '₹65K', result: '2.4x', resultLabel: 'ROAS', status: 'danger', delta: -40, channel: 'Meta Ads' },
  { name: 'Discovery - New Audiences', spend: '₹52K', result: '1.8x', resultLabel: 'ROAS', status: 'danger', delta: -55, channel: 'Google Ads' },
];

const MKTG_ECOM_CREATIVES: CreativeRow[] = [
  { name: 'UGC Testimonial - Sarah', type: 'Video', spend: '₹28K', result: '₹1.62L', resultLabel: 'Revenue', ctr: '3.8%', status: 'good' },
  { name: 'Product Carousel - New Arrivals', type: 'Carousel', spend: '₹22K', result: '₹1.21L', resultLabel: 'Revenue', ctr: '3.2%', status: 'good' },
  { name: 'Lifestyle Shoot - Summer Collection', type: 'Static', spend: '₹18K', result: '₹89K', resultLabel: 'Revenue', ctr: '2.9%', status: 'good' },
  { name: 'Flash Sale Banner - 40% Off', type: 'Static', spend: '₹35K', result: '₹72K', resultLabel: 'Revenue', ctr: '1.6%', status: 'warning' },
  { name: 'Generic Brand Video', type: 'Video', spend: '₹42K', result: '₹48K', resultLabel: 'Revenue', ctr: '1.1%', status: 'danger' },
];

const MKTG_ECOM_PRODUCTS_DECLINING = [
  { name: 'Classic Cotton T-Shirt (White)', revenue: '₹1.2L → ₹68K', decline: -43, reason: 'Seasonal drop + increased competition' },
  { name: 'Premium Yoga Mat (Purple)', revenue: '₹89K → ₹52K', decline: -42, reason: 'Price undercut by competitors' },
  { name: 'Wireless Earbuds (Gen 2)', revenue: '₹2.1L → ₹1.4L', decline: -33, reason: 'Gen 3 launch cannibalizing sales' },
  { name: 'Organic Face Serum', revenue: '₹45K → ₹31K', decline: -31, reason: 'Out-of-stock for 8 days last month' },
];

const MKTG_ECOM_TREND: TrendPoint[] = [
  { label: 'Aug', value: 130000, previousValue: 98000 },
  { label: 'Sep', value: 145000, previousValue: 102000 },
  { label: 'Oct', value: 152000, previousValue: 108000 },
  { label: 'Nov', value: 162000, previousValue: 115000 },
  { label: 'Dec', value: 175000, previousValue: 125000 },
  { label: 'Jan', value: 182000, previousValue: 135000 },
];

const MKTG_ECOM_CAC_TREND: TrendPoint[] = [
  { label: 'Aug', value: 620 },
  { label: 'Sep', value: 685 },
  { label: 'Oct', value: 720 },
  { label: 'Nov', value: 780 },
  { label: 'Dec', value: 825 },
  { label: 'Jan', value: 850 },
];

const MKTG_ECOM_CHANNEL_COMPARISON: ComparisonItem[] = [
  {
    channel: 'Meta Ads',
    metrics: [
      { label: 'ROAS', value: '3.8x', status: 'warning' },
      { label: 'CTR', value: '2.4%', status: 'warning' },
      { label: 'CAC', value: '₹720', status: 'warning' },
      { label: 'Spend', value: '₹1.82L', status: 'good' },
    ]
  },
  {
    channel: 'Google Ads',
    metrics: [
      { label: 'ROAS', value: '2.9x', status: 'danger' },
      { label: 'CTR', value: '1.9%', status: 'danger' },
      { label: 'CAC', value: '₹920', status: 'danger' },
      { label: 'Spend', value: '₹1.56L', status: 'good' },
    ]
  },
];

// ─── MARKETING: LEAD GEN ───

const MKTG_LEAD_KPIS: DashboardKPI[] = [
  { label: 'Ad Spend', value: '₹2.75L', target: '₹3.0L', delta: -8, status: 'good', unit: '₹' },
  { label: 'Leads', value: '845', target: '1,000', delta: -16, status: 'warning' },
  { label: 'CPL', value: '₹428', target: '₹350', delta: -22, status: 'warning', unit: '₹' },
  { label: 'CTR', value: '1.8%', target: '2.5%', delta: -28, status: 'warning', unit: '%' },
  { label: 'CPM', value: '₹185', target: '₹150', delta: -23, status: 'warning', unit: '₹' },
  { label: 'Conv. Rate', value: '3.2%', target: '4.5%', delta: -29, status: 'warning', unit: '%' },
  { label: 'SQL Rate', value: '18%', target: '25%', delta: -28, status: 'warning', unit: '%' },
  { label: 'Pipeline Value', value: '₹42L', target: '₹55L', delta: -24, status: 'warning', unit: '₹' },
];

const MKTG_LEAD_CAMPAIGNS: CampaignRow[] = [
  { name: 'LinkedIn - CXO Targeting', spend: '₹52K', result: '₹285', resultLabel: 'CPL', status: 'good', delta: 19, channel: 'LinkedIn Ads' },
  { name: 'Google Search - Branded Keywords', spend: '₹38K', result: '₹310', resultLabel: 'CPL', status: 'good', delta: 11, channel: 'Google Ads' },
  { name: 'LinkedIn - InMail Outreach', spend: '₹45K', result: '₹365', resultLabel: 'CPL', status: 'warning', delta: -4, channel: 'LinkedIn Ads' },
  { name: 'Google Display - Remarketing', spend: '₹28K', result: '₹420', resultLabel: 'CPL', status: 'warning', delta: -20, channel: 'Google Ads' },
  { name: 'Meta Lead Forms - Broad', spend: '₹62K', result: '₹580', resultLabel: 'CPL', status: 'danger', delta: -66, channel: 'Meta Ads' },
  { name: 'Google - Competitor Keywords', spend: '₹48K', result: '₹625', resultLabel: 'CPL', status: 'danger', delta: -79, channel: 'Google Ads' },
];

const MKTG_LEAD_CREATIVES: CreativeRow[] = [
  { name: 'Case Study - 3x Revenue Growth', type: 'Carousel', spend: '₹22K', result: '85', resultLabel: 'Leads', ctr: '3.4%', status: 'good' },
  { name: 'Webinar Invite - CFO Masterclass', type: 'Static', spend: '₹18K', result: '72', resultLabel: 'Leads', ctr: '2.9%', status: 'good' },
  { name: 'ROI Calculator - Interactive', type: 'Video', spend: '₹15K', result: '58', resultLabel: 'Leads', ctr: '2.6%', status: 'good' },
  { name: 'Generic Service Overview', type: 'Video', spend: '₹32K', result: '42', resultLabel: 'Leads', ctr: '1.2%', status: 'danger' },
  { name: 'Brand Awareness - Logo Animation', type: 'Video', spend: '₹28K', result: '18', resultLabel: 'Leads', ctr: '0.8%', status: 'danger' },
];

const MKTG_LEAD_CHANNEL_COMPARISON: ComparisonItem[] = [
  {
    channel: 'LinkedIn Ads',
    metrics: [
      { label: 'CPL', value: '₹385', status: 'warning' },
      { label: 'CTR', value: '2.3%', status: 'warning' },
      { label: 'SQL Rate', value: '24%', status: 'good' },
      { label: 'Spend', value: '₹1.12L', status: 'good' },
    ]
  },
  {
    channel: 'Google Ads',
    metrics: [
      { label: 'CPL', value: '₹465', status: 'danger' },
      { label: 'CTR', value: '1.6%', status: 'danger' },
      { label: 'SQL Rate', value: '15%', status: 'danger' },
      { label: 'Spend', value: '₹1.14L', status: 'good' },
    ]
  },
];

const MKTG_LEAD_CONVERSION_TREND: TrendPoint[] = [
  { label: 'Aug', value: 3.8 },
  { label: 'Sep', value: 3.6 },
  { label: 'Oct', value: 3.4 },
  { label: 'Nov', value: 3.3 },
  { label: 'Dec', value: 3.1 },
  { label: 'Jan', value: 3.2 },
];

// ─── FINANCE: E-COMMERCE / RESTAURANTS ───

const FIN_ECOM_KPIS: DashboardKPI[] = [
  { label: 'Revenue', value: '₹28.5L', delta: 9, status: 'good', unit: '₹', deltaLabel: 'QoQ' },
  { label: 'Gross Margin', value: '42.3%', delta: -7, status: 'warning', unit: '%', deltaLabel: 'QoQ' },
  { label: 'Net Profit', value: '₹3.8L', delta: -16, status: 'danger', unit: '₹', deltaLabel: 'QoQ' },
  { label: 'Cash Balance', value: '₹8.2L', delta: -19, status: 'danger', unit: '₹', deltaLabel: 'QoQ' },
  { label: 'Receivables', value: '₹4.8L', delta: -37, status: 'danger', unit: '₹', deltaLabel: 'QoQ' },
  { label: 'Payables', value: '₹3.2L', delta: 16, status: 'good', unit: '₹', deltaLabel: 'QoQ' },
];

const FIN_ECOM_SALES_BREAKDOWN = [
  { channel: 'Website (D2C)', revenue: '₹14.2L', share: '49.8%', growth: 12 },
  { channel: 'Marketplace (Amazon/Flipkart)', revenue: '₹9.8L', share: '34.4%', growth: -8 },
  { channel: 'In-Store / Offline', revenue: '₹4.5L', share: '15.8%', growth: 3 },
];

const FIN_ECOM_OVERDUE_INVOICES: AlertItem[] = [
  { severity: 'critical', title: 'INV-2024-1847 — RetailMart India', description: '₹1.2L overdue by 45 days', metric: '₹1.2L' },
  { severity: 'critical', title: 'INV-2024-1823 — QuickShip Logistics', description: '₹82K overdue by 32 days', metric: '₹82K' },
  { severity: 'warning', title: 'INV-2024-1891 — FreshBasket Co.', description: '₹54K overdue by 18 days', metric: '₹54K' },
  { severity: 'warning', title: 'INV-2024-1902 — GreenLeaf Organics', description: '₹38K overdue by 12 days', metric: '₹38K' },
  { severity: 'info', title: 'INV-2024-1915 — StyleHouse Pvt Ltd', description: '₹1.05L due in 5 days', metric: '₹1.05L' },
];

const FIN_ECOM_PL_TREND: TrendPoint[] = [
  { label: 'Oct', value: 2650000, previousValue: 1850000 },
  { label: 'Nov', value: 2820000, previousValue: 1920000 },
  { label: 'Dec', value: 3150000, previousValue: 2100000 },
  { label: 'Jan', value: 2850000, previousValue: 2050000 },
];

const FIN_ECOM_COMPLIANCE = [
  { filing: 'GSTR-3B (January)', due: 'Feb 20, 2026', status: 'upcoming', daysLeft: -6 },
  { filing: 'GSTR-1 (January)', due: 'Feb 11, 2026', status: 'overdue', daysLeft: -15 },
  { filing: 'TDS Return - Q4 FY26', due: 'Mar 31, 2026', status: 'upcoming', daysLeft: 33 },
  { filing: 'Advance Tax - Q4 FY26', due: 'Mar 15, 2026', status: 'upcoming', daysLeft: 17 },
];

// ─── FINANCE: TRADING / MANUFACTURING ───

const FIN_TRADE_KPIS: DashboardKPI[] = [
  { label: 'Revenue', value: '₹1.85Cr', delta: 10, status: 'good', unit: '₹', deltaLabel: '6M' },
  { label: 'Working Capital', value: '₹32L', delta: -16, status: 'danger', unit: '₹', deltaLabel: '6M' },
  { label: 'Cash Flow', value: '₹8.5L', delta: -32, status: 'danger', unit: '₹', deltaLabel: '6M' },
  { label: 'Current Ratio', value: '1.35', delta: -18, status: 'danger', deltaLabel: '6M' },
  { label: 'Receivables', value: '₹48L', delta: -33, status: 'danger', unit: '₹', deltaLabel: '6M' },
  { label: 'Payables', value: '₹28L', delta: 7, status: 'good', unit: '₹', deltaLabel: '6M' },
];

const FIN_TRADE_RECEIVABLES_AGING = [
  { bracket: '0-30 days', amount: '₹12.5L', count: 18, status: 'good' as const },
  { bracket: '31-60 days', amount: '₹15.2L', count: 12, status: 'warning' as const },
  { bracket: '61-90 days', amount: '₹11.8L', count: 8, status: 'danger' as const },
  { bracket: '90+ days', amount: '₹8.5L', count: 5, status: 'danger' as const },
];

const FIN_TRADE_EXPENSE_VS_REVENUE: TrendPoint[] = [
  { label: 'Aug', value: 1520000, previousValue: 1680000 },
  { label: 'Sep', value: 1580000, previousValue: 1750000 },
  { label: 'Oct', value: 1640000, previousValue: 1820000 },
  { label: 'Nov', value: 1720000, previousValue: 1880000 },
  { label: 'Dec', value: 1810000, previousValue: 1950000 },
  { label: 'Jan', value: 1880000, previousValue: 1850000 },
];

const FIN_TRADE_CASHFLOW_TREND: TrendPoint[] = [
  { label: 'Aug', value: 1250000 },
  { label: 'Sep', value: 1180000 },
  { label: 'Oct', value: 985000 },
  { label: 'Nov', value: 920000 },
  { label: 'Dec', value: 875000 },
  { label: 'Jan', value: 850000 },
];

const FIN_TRADE_COMPLIANCE = [
  { filing: 'GSTR-3B (January)', due: 'Feb 20, 2026', status: 'upcoming', daysLeft: -6 },
  { filing: 'GSTR-1 (January)', due: 'Feb 11, 2026', status: 'overdue', daysLeft: -15 },
  { filing: 'TDS Return - Q4 FY26', due: 'Mar 31, 2026', status: 'upcoming', daysLeft: 33 },
  { filing: 'Advance Tax - Q4 FY26', due: 'Mar 15, 2026', status: 'upcoming', daysLeft: 17 },
  { filing: 'ITR Filing - AY 2026-27', due: 'Jul 31, 2026', status: 'upcoming', daysLeft: 155 },
];


// ── Prompt Matching Engine ──

type PromptMatcher = {
  patterns: RegExp[];
  generate: (companyName: string) => StructuredResponse;
};

function buildMatchers(service: string, businessType: string): PromptMatcher[] {
  if (service === 'Performance Marketing' && businessType === 'ecommerce') {
    return buildMarketingEcommerceMatchers();
  }
  if (service === 'Performance Marketing' && businessType === 'leadgen') {
    return buildMarketingLeadgenMatchers();
  }
  if (service === 'Accounts & Taxation' && businessType === 'ecommerce-restaurants') {
    return buildFinanceEcommerceMatchers();
  }
  if (service === 'Accounts & Taxation' && businessType === 'trading-manufacturing') {
    return buildFinanceTradingMatchers();
  }
  // Default fallback
  return buildMarketingEcommerceMatchers();
}

// ═══ MARKETING E-COMMERCE MATCHERS ═══
function buildMarketingEcommerceMatchers(): PromptMatcher[] {
  return [
    {
      patterns: [/top.*(campaign|performing).*roas/i, /best.*campaign/i, /campaign.*performance/i, /roas/i, /scale.*winner|scale.*winning|which.*scale|winning.*scale/i, /best.*keep.*cac.*low|lowest.*cac/i],
      generate: (companyName) => ({
        narrative: `Here's your **campaign performance ranked by ROAS** for ${companyName}. Your retargeting campaigns are significantly outperforming prospecting — with your top campaign delivering **5.8x ROAS** vs. your worst at **1.8x**.\n\n**Key insight:** 62% of your ad spend is going to campaigns below your 4.0x ROAS target. Reallocating budget from underperformers could unlock an estimated **₹2.4L in additional revenue** this month.`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['ROAS', 'Ad Spend', 'Revenue', 'Orders'].includes(k.label)),
        campaigns: MKTG_ECOM_CAMPAIGNS,
        insights: [
          { icon: 'zap', title: 'Quick Win', description: 'Pause "Discovery - New Audiences" (1.8x ROAS) and shift ₹52K budget to "Summer Sale - Retargeting" (5.8x ROAS)' },
          { icon: 'target', title: 'Optimization', description: 'Your retargeting ROAS is 2.4x higher than prospecting — increase retargeting audience pool by adding 60-day website visitors' },
        ],
        followUpButtons: [
          { label: 'Open Campaigns Report', action: 'open-dashboard-campaigns', variant: 'primary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'CAC trends', action: 'prompt-cac-trends', variant: 'secondary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/conversion.*rate.*aov/i, /aov/i, /conversion.*rate/i, /average.*order/i, /cart.*abandon|abandonment|checkout.*drop/i],
      generate: (companyName) => ({
        narrative: `Here's your **conversion rate and AOV analysis** for ${companyName}.\n\nYour current conversion rate is **2.8%** (target: 3.5%) and AOV is **₹2,841** (target: ₹3,000). While AOV is close to target, the conversion rate gap is costing you approximately **₹1.8L/month** in lost revenue.\n\n**Funnel breakdown:** Your cart abandonment rate is 68% — significantly above the 55% industry benchmark. The biggest drop-off happens at the payment page (42% exit rate).`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['Conv. Rate', 'AOV', 'Revenue', 'Orders'].includes(k.label)),
        trend: { title: 'Conversion Rate Trend (6M)', data: [
          { label: 'Aug', value: 3.2 }, { label: 'Sep', value: 3.0 }, { label: 'Oct', value: 2.9 },
          { label: 'Nov', value: 2.8 }, { label: 'Dec', value: 2.7 }, { label: 'Jan', value: 2.8 },
        ], unit: '%', color: '#f59e0b' },
        insights: [
          { icon: 'alert', title: 'Cart Abandonment', description: 'Add exit-intent popups with 10% discount — similar stores see 8-12% recovery rate' },
          { icon: 'dollar', title: 'AOV Boost', description: 'Implement "Free shipping above ₹3,500" threshold — could lift AOV by 12-15% based on your order distribution' },
        ],
        followUpButtons: [
          { label: 'Open Funnel Report', action: 'open-dashboard-funnel', variant: 'primary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'CAC trends', action: 'prompt-cac-trends', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/product.*declining/i, /declining.*sales/i, /drop.*product/i, /product.*performance/i, /revive.*t.?shirt|revive.*product/i],
      generate: (companyName) => ({
        narrative: `Here are the **products with declining sales** for ${companyName} over the past 30 days.\n\n**4 products** are showing significant revenue decline, with a combined revenue loss of **₹3.2L** compared to the previous period. The most impacted is your **Classic Cotton T-Shirt** which dropped 43%.`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['Revenue', 'Orders'].includes(k.label)),
        alerts: MKTG_ECOM_PRODUCTS_DECLINING.map(p => ({
          severity: (p.decline < -40 ? 'critical' : 'warning') as AlertItem['severity'],
          title: p.name,
          description: `Revenue: ${p.revenue} (${p.decline}%) — ${p.reason}`,
          metric: `${p.decline}%`,
        })),
        insights: [
          { icon: 'lightbulb', title: 'Recommendation', description: 'Bundle the declining Cotton T-Shirt with trending accessories at a 15% combo discount to revive demand' },
          { icon: 'zap', title: 'Quick Action', description: 'Re-stock the Organic Face Serum immediately — 8-day stockout caused ₹14K in estimated lost sales' },
        ],
        followUpButtons: [
          { label: 'Open Shopify Sales Report', action: 'open-dashboard-sales', variant: 'primary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/creative.*revenue/i, /ad.*creative/i, /creative.*driving/i, /best.*creative/i, /creative.*performance/i, /ugc|testimonial|lift.*aov/i, /revive.*t.?shirt/i],
      generate: (companyName) => ({
        narrative: `Here are your **top ad creatives ranked by revenue generated** for ${companyName}.\n\nYour **UGC testimonial video** is the clear winner — generating **₹1.62L revenue** from just ₹28K spend (5.8x ROAS). Meanwhile, your generic brand video is burning ₹42K for just ₹48K in returns (1.1x ROAS).\n\n**Creative insight:** Video content with real customer testimonials outperforms branded content by **3.2x** in your account.`,
        creatives: MKTG_ECOM_CREATIVES,
        insights: [
          { icon: 'trending', title: 'Creative Strategy', description: 'Double down on UGC content — commission 3-4 more customer testimonial videos. Expected ROAS: 4.5-6x' },
          { icon: 'alert', title: 'Budget Waste', description: 'Generic Brand Video is consuming 22% of creative budget but generating only 7% of revenue — pause immediately' },
        ],
        followUpButtons: [
          { label: 'Open Creatives Report', action: 'open-dashboard-creatives', variant: 'primary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Conversion rate & AOV', action: 'prompt-conversion-rate', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/cac|customer.*acquisition.*cost|acquisition.*trend/i],
      generate: (companyName) => ({
        narrative: `Here's your **Customer Acquisition Cost (CAC) trend** for ${companyName}.\n\nYour CAC has risen **37% over 6 months** — from ₹620 in August to ₹850 in January. At this rate, you're spending **₹200 more per customer** than your ₹650 target.\n\n**Impact:** This CAC inflation is eroding ₹85K/month in profit margin. The primary driver is Google Ads, where CAC has spiked to ₹920 (42% above target).`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['CAC', 'ROAS', 'Conv. Rate', 'CTR'].includes(k.label)),
        trend: { title: 'CAC Trend (6 Months)', data: MKTG_ECOM_CAC_TREND, unit: '₹', color: '#ef4444' },
        insights: [
          { icon: 'alert', title: 'Root Cause', description: 'Google Ads CAC (₹920) is 28% higher than Meta (₹720) — consider shifting 20% of Google budget to Meta retargeting' },
          { icon: 'target', title: 'Target Path', description: 'Improving conversion rate from 2.8% → 3.5% alone would bring CAC down to ~₹680, near your ₹650 target' },
        ],
        followUpButtons: [
          // Primary: Google Ads is the flagged culprit (₹920 CAC) — take the user
          // straight to the source where they can fix it.
          { label: 'Open Google Ads Report', action: 'open-dashboard-google-ads', variant: 'primary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
          { label: 'Conversion rate & AOV', action: 'prompt-conversion-rate', variant: 'secondary' },
          { label: 'Top campaigns', action: 'prompt-top-campaigns', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/meta.*google|google.*meta|channel.*comparison|platform.*comparison|compare.*channel/i],
      generate: (companyName) => ({
        narrative: `Here's your **Meta Ads vs Google Ads performance comparison** for ${companyName}.\n\n**Meta Ads is outperforming Google Ads** across all key metrics. Meta delivers 31% higher ROAS (3.8x vs 2.9x), 26% better CTR, and 22% lower CAC. Despite near-equal spend split, Meta drives 55% of your total ad revenue.\n\n**Recommendation:** Shift 15-20% of Google Ads budget to Meta retargeting campaigns to improve blended ROAS from 3.2x toward your 4.0x target.`,
        comparison: MKTG_ECOM_CHANNEL_COMPARISON,
        insights: [
          { icon: 'trending', title: 'Budget Reallocation', description: 'Moving ₹30K/month from Google Discovery to Meta Lookalike could add ₹1.1L in revenue based on current ROAS delta' },
          { icon: 'lightbulb', title: 'Google Optimization', description: 'Focus Google Ads purely on Search (branded + category) and pause Display/Discovery — Search ROAS is 4.1x vs Display 1.6x' },
        ],
        followUpButtons: [
          // Primary: Meta is the recommended winner for reallocation — the CTA
          // should promote the winning action, not the losing channel.
          { label: 'Open Meta Ads Report', action: 'open-dashboard-meta-ads', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    // ── NEW: Pause underperformers (high-value action for ecommerce) ──
    {
      patterns: [/pause.*campaign|which.*pause|bleed.*budget|stop.*waste|budget.*waste|bad.*campaign|trim.*budget|underperform.*campaign|weak.*campaign|save.*₹1\.17L/i],
      generate: (companyName) => ({
        narrative: `Here are the **2 campaigns you should pause immediately** for ${companyName} — they're collectively burning **₹1.17L/month** at sub-2x ROAS, well below your 4.0x target.\n\n**Combined impact of pausing:**\n- **Budget freed:** ₹1.17L/month (31% of total ad spend)\n- **Blended ROAS impact:** 3.2x → projected **3.9x**\n- **Revenue impact:** Neutral if reallocated to retargeting (5.8x ROAS)\n\nEvery rupee spent here is losing 60+ paise vs. your top campaigns.`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['ROAS', 'CAC', 'Ad Spend', 'Revenue'].includes(k.label)),
        campaigns: MKTG_ECOM_CAMPAIGNS.filter(c => c.status === 'danger'),
        alerts: [
          { severity: 'critical', title: 'Discovery - New Audiences', description: '₹52K spend at 1.8x ROAS — Google prospecting with 0.9% CTR. No clear audience fit.', metric: '1.8x ROAS' },
          { severity: 'critical', title: 'Dynamic Product Ads', description: '₹65K spend at 2.4x ROAS — catalog too broad, top SKUs underrepresented.', metric: '2.4x ROAS' },
        ],
        insights: [
          { icon: 'zap', title: 'Reallocate Today', description: 'Move full ₹1.17L to Summer Sale Retargeting (5.8x) and Brand Search Exact Match (4.9x) — projected +₹4.2L revenue with same spend' },
          { icon: 'target', title: 'Restart Criteria', description: "Don't relaunch Discovery until you've tested 3 new UGC hooks with 20-day retargeting windows" },
        ],
        followUpButtons: [
          { label: 'Open Campaigns Report', action: 'open-dashboard-campaigns', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'CAC trends', action: 'prompt-cac-trends', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    // ── Edge-case / natural language matchers ──
    {
      patterns: [/best.*channel|top.*channel|which.*channel|where.*spend|budget.*split|spend.*breakdown/i],
      generate: (companyName) => ({
        narrative: `Here's your **channel-wise spend and performance breakdown** for ${companyName}.\n\n**Meta Ads** takes 54% of your ₹3.8L budget and delivers **3.8x ROAS** — your strongest channel. **Google Ads** takes 46% but returns only **2.9x ROAS**, dragging down your blended performance.\n\n**Bottom line:** Meta is your best performing channel by every metric. For every ₹1 shifted from Google to Meta, you'd earn an additional ₹0.90 in revenue.`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['Ad Spend', 'ROAS', 'Revenue', 'CAC'].includes(k.label)),
        comparison: MKTG_ECOM_CHANNEL_COMPARISON,
        insights: [
          { icon: 'trending', title: 'Best Channel', description: 'Meta Ads: 3.8x ROAS, ₹720 CAC, 2.4% CTR — outperforms Google on every metric' },
          { icon: 'dollar', title: 'Budget Opportunity', description: 'Moving 20% of Google budget (₹31K) to Meta could generate an additional ₹28K in revenue monthly' },
        ],
        followUpButtons: [
          // Primary: Cross-channel question → Marketing Overview is the honest
          // landing page where users can toggle between Meta / Google / Website.
          { label: 'Open Marketing Overview', action: 'open-dashboard', variant: 'primary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/summary|overview|how.*doing|how.*perform|monthly.*report|weekly.*report|quick.*update|status|health/i],
      generate: (companyName) => ({
        narrative: `Here's your **business performance overview** for ${companyName} (January 2026).\n\n**Revenue:** ₹12.2L (87% of ₹14L target) — a 6% increase month-over-month\n**ROAS:** 3.2x (target: 4.0x) — needs improvement\n**Orders:** 428 (target: 500) — 14% below goal\n**CAC:** ₹850 (target: ₹650) — 31% above ideal\n\n**Overall health: ⚠️ Needs Attention** — Revenue is growing but efficiency metrics (ROAS, CAC) are trending the wrong way. Your retargeting campaigns are strong, but prospecting spend is dragging down blended performance.`,
        kpis: MKTG_ECOM_KPIS,
        trend: { title: 'Revenue Trend (6 Months)', data: MKTG_ECOM_TREND, unit: '₹', color: '#204CC7' },
        insights: [
          { icon: 'zap', title: 'Top Priority', description: 'Pause 2 underperforming campaigns (₹1.17L spend, <2x ROAS) — this alone would lift blended ROAS to 3.9x' },
          { icon: 'trending', title: 'Growth Lever', description: 'Your retargeting delivers 5.8x ROAS — expand the audience pool and allocate 60% of budget to retargeting' },
          { icon: 'alert', title: 'Watch Out', description: 'CAC has risen 37% in 6 months — if unchecked, profit margins will erode by ₹1L/month by Q2' },
        ],
        followUpButtons: [
          { label: 'Open Full Dashboard', action: 'open-dashboard', variant: 'primary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: "What's working", action: 'prompt-working', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*attention|what.*focus|priority|urgent|alert|red.*flag|what.*wrong|issue|problem|fix/i],
      generate: (companyName) => ({
        narrative: `Here are the **items requiring your immediate attention** for ${companyName}.\n\nI've identified **4 critical issues** that are collectively costing you an estimated **₹3.8L/month** in lost revenue or wasted spend:`,
        kpis: MKTG_ECOM_KPIS.filter(k => k.status === 'danger' || k.status === 'warning'),
        alerts: [
          { severity: 'critical', title: 'CAC Spiraling', description: 'Customer acquisition cost at ₹850 (31% above ₹650 target) — eroding ₹85K/month in profit margin', metric: '₹850' },
          { severity: 'critical', title: 'Google Ads Underperforming', description: 'ROAS at 2.9x (target: 4.0x) with ₹1.56L monthly spend — consider pausing Discovery campaigns', metric: '2.9x' },
          { severity: 'warning', title: 'Conversion Rate Decline', description: 'Conv. rate dropped from 3.2% to 2.8% over 3 months — cart abandonment at 68% is the primary cause', metric: '2.8%' },
          { severity: 'warning', title: '4 Products Declining', description: 'Combined revenue loss of ₹3.2L — T-Shirt (-43%), Yoga Mat (-42%), Earbuds (-33%), Face Serum (-31%)', metric: '-₹3.2L' },
        ],
        insights: [
          { icon: 'zap', title: '#1 Quick Win', description: 'Pause "Discovery - New Audiences" and shift ₹52K to retargeting — instant ROAS improvement' },
          { icon: 'target', title: '#2 This Week', description: 'Add exit-intent popup to checkout — expected 8-12% cart recovery rate (₹1.4-2.1L/month)' },
        ],
        followUpButtons: [
          { label: 'Pause the 2 worst campaigns (₹1.17L freed)', action: 'prompt-pause-campaigns', variant: 'primary' },
          { label: 'Declining products', action: 'prompt-declining-products', variant: 'secondary' },
          { label: 'CAC trends', action: 'prompt-cac-trends', variant: 'secondary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*working|win|highlight|good.*news|positive|strength/i],
      generate: (companyName) => ({
        narrative: `Here's **what's working well** for ${companyName} right now.\n\n**3 bright spots** in your current marketing performance:`,
        kpis: MKTG_ECOM_KPIS.filter(k => k.status === 'good'),
        campaigns: MKTG_ECOM_CAMPAIGNS.filter(c => c.status === 'good'),
        insights: [
          { icon: 'trending', title: 'Retargeting Excellence', description: 'Your top retargeting campaign delivers 5.8x ROAS — 45% above target. This is your most efficient growth lever.' },
          { icon: 'zap', title: 'UGC Content Winning', description: 'UGC testimonial video generates ₹1.62L revenue from ₹28K spend — 5.8x return. Invest in 3-4 more.' },
          { icon: 'dollar', title: 'AOV Near Target', description: 'At ₹2,841 (target: ₹3,000), your AOV is only 5% off — a "free shipping over ₹3,500" offer could close this gap.' },
        ],
        followUpButtons: [
          { label: 'Scale the 5.8x retargeting winner', action: 'prompt-scale-winners', variant: 'primary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
          { label: 'Conversion rate & AOV', action: 'prompt-conversion-rate', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/roi|return.*investment|profitab|margin|money.*worth|value.*money/i, /path.*4\.0x|4\.0x.*target|blended.*roas.*target/i],
      generate: (companyName) => ({
        narrative: `Here's your **marketing ROI analysis** for ${companyName}.\n\n**Blended ROAS: 3.2x** — for every ₹1 spent on ads, you're generating ₹3.20 in revenue. Your target is 4.0x, so there's a **20% efficiency gap** translating to approximately **₹3.04L in missed revenue** this month.\n\n**By channel:**\n- Meta Ads: **3.8x ROAS** (close to target)\n- Google Ads: **2.9x ROAS** (27.5% below target)\n\nYour overall marketing spend of ₹3.8L generated ₹12.2L in revenue — a net contribution of **₹8.4L** before operational costs.`,
        kpis: MKTG_ECOM_KPIS.filter(k => ['ROAS', 'Revenue', 'Ad Spend', 'CAC'].includes(k.label)),
        trend: { title: 'Revenue Trend (6 Months)', data: MKTG_ECOM_TREND, unit: '₹', color: '#10b981' },
        insights: [
          { icon: 'dollar', title: 'ROI Improvement Path', description: 'Optimizing Google Ads alone (from 2.9x to 3.5x) would add ₹93K/month to revenue at current spend levels' },
          { icon: 'target', title: 'Best ROI Campaign', description: '"Summer Sale - Retargeting" delivers 5.8x ROAS — scaling this campaign by 30% has the highest marginal ROI' },
        ],
        followUpButtons: [
          { label: 'Open Full Dashboard', action: 'open-dashboard', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'CAC trends', action: 'prompt-cac-trends', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
  ];
}

// ═══ MARKETING LEAD GEN MATCHERS ═══
function buildMarketingLeadgenMatchers(): PromptMatcher[] {
  return [
    {
      patterns: [/top.*(campaign|performing).*cpl/i, /best.*campaign/i, /campaign.*performance/i, /cpl/i, /scale.*winner|scale.*winning|which.*scale|close.*pipeline.*gap/i],
      generate: (companyName) => ({
        narrative: `Here's your **campaign performance ranked by CPL** for ${companyName}. Your LinkedIn CXO targeting is the most efficient at **₹285/lead**, while Meta broad targeting is costing **₹580/lead** — 66% above your ₹350 target.\n\n**Key insight:** Your top 2 campaigns generate 48% of leads at 15% below target CPL. Meanwhile, bottom 2 campaigns consume 40% of budget but deliver leads at 1.7x target cost.`,
        kpis: MKTG_LEAD_KPIS.filter(k => ['CPL', 'Leads', 'Ad Spend', 'Conv. Rate'].includes(k.label)),
        campaigns: MKTG_LEAD_CAMPAIGNS,
        insights: [
          { icon: 'zap', title: 'Quick Win', description: 'Pause "Meta Lead Forms - Broad" (₹580 CPL) and reallocate ₹62K to LinkedIn CXO targeting — projected to generate 217 leads vs current 107' },
          { icon: 'target', title: 'Scale Up', description: 'LinkedIn CXO Targeting has room to scale — audience saturation is only at 35%. Increase daily budget by 40%' },
        ],
        followUpButtons: [
          { label: 'Open Campaigns Report', action: 'open-dashboard-campaigns', variant: 'primary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Conversion trends', action: 'prompt-conversion-trends', variant: 'secondary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/ctr.*trend|cpm.*efficiency|ctr.*cpm/i, /click.*through/i],
      generate: (companyName) => ({
        narrative: `Here's your **CTR and CPM analysis** for ${companyName}.\n\nYour blended CTR is **1.8%** (target: 2.5%) and CPM is **₹185** (target: ₹150). The CTR gap means you're paying more per quality click, inflating your CPL.\n\n**Channel breakdown:** LinkedIn has the best CTR at 2.3% but highest CPM at ₹210. Meta has the lowest CPM (₹142) but worst CTR (1.4%). Google sits in the middle on both.`,
        kpis: MKTG_LEAD_KPIS.filter(k => ['CTR', 'CPM', 'CPL', 'Conv. Rate'].includes(k.label)),
        comparison: MKTG_LEAD_CHANNEL_COMPARISON,
        insights: [
          { icon: 'lightbulb', title: 'Creative Refresh', description: 'Your Meta CTR (1.4%) suggests ad fatigue — refresh creatives. A/B test case-study carousels which perform 2.4x better on LinkedIn' },
          { icon: 'dollar', title: 'CPM Optimization', description: 'LinkedIn CPM (₹210) is offset by higher SQL rate (24%). Cost per SQL is actually 18% lower than Google' },
        ],
        followUpButtons: [
          // Primary: Meta is flagged for 1.4% CTR fatigue — open Meta Ads to diagnose.
          { label: 'Open Meta Ads Report', action: 'open-dashboard-meta-ads', variant: 'primary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Conversion trends', action: 'prompt-conversion-trends', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/low.*ctr.*high.*cpm/i, /campaign.*underperform/i, /weak.*campaign/i, /poor.*campaign/i, /pause.*campaign|which.*pause|bleed.*budget|stop.*waste|budget.*waste|bad.*campaign|trim.*budget|save.*₹1\.1L/i],
      generate: (companyName) => ({
        narrative: `Here are your **underperforming campaigns** for ${companyName} — those with below-target CTR and above-target CPM.\n\n**3 campaigns** are flagged with a combined spend of **₹1.38L** generating leads at 1.5-1.8x your target CPL. These campaigns are collectively wasting an estimated **₹48K/month**.`,
        campaigns: MKTG_LEAD_CAMPAIGNS.filter(c => c.status === 'danger'),
        alerts: [
          { severity: 'critical', title: 'Meta Lead Forms - Broad', description: 'CPL ₹580 (66% above target), CTR 1.1% — audience targeting too broad', metric: '₹580 CPL' },
          { severity: 'critical', title: 'Google - Competitor Keywords', description: 'CPL ₹625 (79% above target), CTR 0.9% — low intent traffic', metric: '₹625 CPL' },
          { severity: 'warning', title: 'Google Display - Remarketing', description: 'CPL ₹420 (20% above target), decay observed over 3 weeks', metric: '₹420 CPL' },
        ],
        insights: [
          { icon: 'zap', title: 'Immediate Action', description: 'Pause Meta broad targeting and Google competitor keywords — saves ₹1.1L/month in wasted spend' },
          { icon: 'target', title: 'Reallocation Plan', description: 'Redirect budget to LinkedIn CXO (₹285 CPL) and Google Branded Search (₹310 CPL) for 52% lower blended CPL' },
        ],
        followUpButtons: [
          { label: 'Open Campaigns Report', action: 'open-dashboard-campaigns', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'Conversion trends', action: 'prompt-conversion-trends', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/creative.*lead/i, /ad.*creative/i, /creative.*driving/i, /best.*creative/i, /case.?study.*creative|refresh.*meta.*creative/i],
      generate: (companyName) => ({
        narrative: `Here are your **top ad creatives ranked by leads generated** for ${companyName}.\n\nYour **Case Study carousel** is the top performer — generating **85 leads** at ₹259/lead (26% below target CPL). Meanwhile, generic content is consuming 38% of creative budget but producing only 18% of leads.\n\n**Creative pattern:** Educational/value-first content outperforms brand-focused creative by **2.8x** in lead volume and **1.9x** in CTR.`,
        creatives: MKTG_LEAD_CREATIVES,
        insights: [
          { icon: 'trending', title: 'Scale Winners', description: 'Create 3 more case-study carousels highlighting different industry verticals — projected to add 45-60 leads/month' },
          { icon: 'alert', title: 'Stop the Bleed', description: 'Pause "Brand Awareness - Logo Animation" — 18 leads from ₹28K spend (₹1,556/lead) is 4.4x your target' },
        ],
        followUpButtons: [
          { label: 'Open Creatives Report', action: 'open-dashboard-creatives', variant: 'primary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Top campaigns', action: 'prompt-top-campaigns', variant: 'secondary' },
          { label: 'Conversion trends', action: 'prompt-conversion-trends', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/lead.*opportunity|conversion.*trend|funnel.*conversion/i, /lead.*conversion/i, /sql.*rate|mql.*sql|funnel.*leak/i],
      generate: (companyName) => ({
        narrative: `Here's your **lead-to-opportunity conversion trend** for ${companyName}.\n\nYour conversion rate has declined from **3.8% in August to 3.2% in January** — a 16% drop over 6 months. Your SQL rate is **18%** (target: 25%), meaning 82% of leads never progress beyond MQL stage.\n\n**Pipeline impact:** At current rates, you need 5,556 leads to hit your ₹55L pipeline target, but you're pacing for only 3,800. Improving SQL rate to 25% would close this gap entirely.`,
        kpis: MKTG_LEAD_KPIS.filter(k => ['SQL Rate', 'Conv. Rate', 'Leads', 'Pipeline Value'].includes(k.label)),
        trend: { title: 'Lead-to-Opportunity Rate (6M)', data: MKTG_LEAD_CONVERSION_TREND, unit: '%', color: '#f59e0b' },
        insights: [
          { icon: 'lightbulb', title: 'Lead Quality', description: 'LinkedIn leads convert at 24% SQL rate vs Google at 15% — prioritize LinkedIn for quality over volume' },
          { icon: 'target', title: 'Nurture Gap', description: 'Implement a 5-touch email nurture sequence for MQLs — similar B2B companies see 35-45% lift in SQL conversion' },
        ],
        followUpButtons: [
          { label: 'Open Funnel Report', action: 'open-dashboard-funnel', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/linkedin.*google|google.*linkedin|channel.*comparison|platform.*comparison|compare/i],
      generate: (companyName) => ({
        narrative: `Here's your **LinkedIn vs Google Ads performance comparison** for ${companyName}.\n\n**LinkedIn delivers higher quality leads at better efficiency.** Despite a higher CPM (₹210 vs ₹165), LinkedIn's SQL rate (24%) is 60% higher than Google (15%), making the effective cost-per-SQL **₹1,604 on LinkedIn vs ₹3,100 on Google**.\n\n**Bottom line:** Every ₹1L spent on LinkedIn generates ₹6.8L in pipeline value vs ₹3.2L on Google — a 2.1x efficiency advantage.`,
        comparison: MKTG_LEAD_CHANNEL_COMPARISON,
        insights: [
          { icon: 'trending', title: 'Budget Shift', description: 'Reallocate 25% of Google budget to LinkedIn — projected to add ₹4.2L in pipeline value per month' },
          { icon: 'lightbulb', title: 'Google Strategy', description: 'Focus Google purely on high-intent Search (branded + "near me") — pause Display and Discovery which have 0.8% CTR' },
        ],
        followUpButtons: [
          // Primary: Cross-channel comparison → Marketing Overview lets the user
          // pivot between Meta / Google / Website tabs in one place.
          { label: 'Open Marketing Overview', action: 'open-dashboard', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    // ── Edge-case / natural language matchers ──
    {
      patterns: [/best.*channel|top.*channel|which.*channel|where.*spend|budget.*split|spend.*breakdown/i],
      generate: (companyName) => ({
        narrative: `Here's your **channel-wise spend and performance breakdown** for ${companyName}.\n\n**LinkedIn Ads** delivers your highest quality leads at **₹385 CPL** with a **24% SQL rate** — making it your most efficient channel. **Google Ads** has the highest volume but worst efficiency at **₹465 CPL** and only **15% SQL rate**.\n\n**Bottom line:** LinkedIn generates 2.1x more pipeline value per rupee spent than Google.`,
        kpis: MKTG_LEAD_KPIS.filter(k => ['Ad Spend', 'CPL', 'Leads', 'SQL Rate'].includes(k.label)),
        comparison: MKTG_LEAD_CHANNEL_COMPARISON,
        insights: [
          { icon: 'trending', title: 'Best Channel', description: 'LinkedIn: ₹385 CPL, 24% SQL rate, ₹6.8L pipeline per ₹1L spent — your highest-efficiency channel' },
          { icon: 'dollar', title: 'Budget Opportunity', description: 'Shifting 25% of Google budget to LinkedIn projects an additional ₹4.2L in pipeline value per month' },
        ],
        followUpButtons: [
          // Primary: "Which channel is best?" → Marketing Overview is the honest
          // cross-channel rollup where the user can drill into each platform tab.
          { label: 'Open Marketing Overview', action: 'open-dashboard', variant: 'primary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/summary|overview|how.*doing|how.*perform|monthly.*report|weekly.*report|quick.*update|status|health/i],
      generate: (companyName) => ({
        narrative: `Here's your **lead generation performance overview** for ${companyName} (January 2026).\n\n**Leads:** 845 (target: 1,000) — 16% below goal\n**CPL:** ₹428 (target: ₹350) — 22% above ideal\n**SQL Rate:** 18% (target: 25%) — lead quality gap\n**Pipeline Value:** ₹42L (target: ₹55L) — 24% short\n\n**Overall health: ⚠️ Needs Attention** — Lead volume is reasonable but quality is lagging. Your LinkedIn campaigns outperform Google 2:1 on SQL rate, suggesting a channel mix optimization opportunity.`,
        kpis: MKTG_LEAD_KPIS,
        trend: { title: 'Conversion Rate Trend (6M)', data: MKTG_LEAD_CONVERSION_TREND, unit: '%', color: '#f59e0b' },
        insights: [
          { icon: 'zap', title: 'Top Priority', description: 'Pause 2 bottom campaigns (₹1.1L combined, 65%+ above CPL target) — saves budget for LinkedIn scaling' },
          { icon: 'trending', title: 'Growth Lever', description: 'LinkedIn CXO targeting is only at 35% audience saturation — scale daily budget by 40% for projected 65 additional leads' },
          { icon: 'alert', title: 'Watch Out', description: 'SQL rate has declined from 22% to 18% — implement lead scoring and nurture sequences to reverse this trend' },
        ],
        followUpButtons: [
          { label: 'Open Full Dashboard', action: 'open-dashboard', variant: 'primary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: "What's working", action: 'prompt-working', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*attention|what.*focus|priority|urgent|alert|red.*flag|what.*wrong|issue|problem|fix/i],
      generate: (companyName) => ({
        narrative: `Here are the **items requiring your immediate attention** for ${companyName}.\n\nI've identified **4 critical issues** dragging down your lead generation efficiency:`,
        kpis: MKTG_LEAD_KPIS.filter(k => k.status === 'danger' || k.status === 'warning'),
        alerts: [
          { severity: 'critical', title: 'Meta Broad Targeting Bleeding Budget', description: '₹62K/month at ₹580 CPL (66% above target) — generating low-quality leads with <8% SQL rate', metric: '₹580 CPL' },
          { severity: 'critical', title: 'Google Competitor Keywords Failing', description: '₹48K/month at ₹625 CPL (79% above target) — low intent clicks from competitor searches', metric: '₹625 CPL' },
          { severity: 'warning', title: 'SQL Rate Declining', description: 'SQL rate dropped from 22% to 18% over 4 months — 82% of leads stuck at MQL stage', metric: '18%' },
          { severity: 'warning', title: 'Pipeline Value Gap', description: '₹42L vs ₹55L target (24% short) — on track to miss quarterly pipeline goal by ₹39L', metric: '-₹13L' },
        ],
        insights: [
          { icon: 'zap', title: '#1 Quick Win', description: 'Pause Meta broad + Google competitor keywords — saves ₹1.1L/month, redirecting to LinkedIn adds ~175 quality leads' },
          { icon: 'target', title: '#2 This Week', description: 'Implement lead scoring to automatically route high-intent MQLs to sales — projected 35% lift in SQL conversion' },
        ],
        followUpButtons: [
          { label: 'Pause the 2 bleeding ₹1.1L/month', action: 'prompt-pause-campaigns', variant: 'primary' },
          { label: 'Conversion trends', action: 'prompt-conversion-trends', variant: 'secondary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*working|win|highlight|good.*news|positive|strength/i],
      generate: (companyName) => ({
        narrative: `Here's **what's working well** for ${companyName} right now.\n\n**3 bright spots** in your lead generation:`,
        kpis: MKTG_LEAD_KPIS.filter(k => k.status === 'good'),
        campaigns: MKTG_LEAD_CAMPAIGNS.filter(c => c.status === 'good'),
        insights: [
          { icon: 'trending', title: 'LinkedIn CXO Targeting', description: 'Best campaign at ₹285 CPL with 24% SQL rate — only at 35% audience saturation, massive room to scale.' },
          { icon: 'zap', title: 'Case Study Carousels', description: 'Top creative generating 85 leads at ₹259/lead — 26% below CPL target. Replicate this across verticals.' },
          { icon: 'dollar', title: 'Budget Efficiency', description: 'Ad spend is ₹2.75L (8% under ₹3L budget) — room to invest more in proven winners without overspending.' },
        ],
        followUpButtons: [
          { label: 'Scale LinkedIn CXO — 65% headroom left', action: 'prompt-scale-winners', variant: 'primary' },
          { label: 'Top creatives', action: 'prompt-creatives', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/roi|return.*investment|profitab|pipeline.*value|money.*worth|value.*money/i, /close.*pipeline.*gap|pipeline.*uplift/i],
      generate: (companyName) => ({
        narrative: `Here's your **lead generation ROI analysis** for ${companyName}.\n\n**Pipeline generated:** ₹42L from ₹2.75L ad spend — a **15.3x pipeline-to-spend ratio**. However, your target is ₹55L (20x), so there's a **₹13L pipeline gap**.\n\n**By channel:**\n- LinkedIn: **₹6.8L pipeline per ₹1L spent** (best ROI)\n- Google Search: **₹4.1L pipeline per ₹1L spent**\n- Meta: **₹2.2L pipeline per ₹1L spent** (worst ROI)\n\nAt a 25% close rate on pipeline, your current ₹42L pipeline converts to approximately **₹10.5L in revenue**.`,
        kpis: MKTG_LEAD_KPIS.filter(k => ['Pipeline Value', 'Ad Spend', 'CPL', 'SQL Rate'].includes(k.label)),
        comparison: MKTG_LEAD_CHANNEL_COMPARISON,
        insights: [
          { icon: 'dollar', title: 'ROI Improvement Path', description: 'Shifting Meta budget to LinkedIn would increase pipeline ROI from 15.3x to projected 18.5x — adding ₹8.8L to pipeline' },
          { icon: 'target', title: 'Best ROI Campaign', description: '"LinkedIn CXO Targeting" generates ₹12.4L pipeline per ₹1L spent — 3x more efficient than the average' },
        ],
        followUpButtons: [
          { label: 'Open Full Dashboard', action: 'open-dashboard', variant: 'primary' },
          { label: 'Campaigns to scale', action: 'prompt-scale-winners', variant: 'secondary' },
          { label: 'Campaigns to pause', action: 'prompt-pause-campaigns', variant: 'secondary' },
          { label: 'Channel comparison', action: 'prompt-channel-comparison', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
  ];
}

// ═══ FINANCE E-COMMERCE/RESTAURANTS MATCHERS ═══
function buildFinanceEcommerceMatchers(): PromptMatcher[] {
  return [
    {
      patterns: [/p&l|profit.*loss|gross.*margin|pl.*summary/i, /recover.*margin|margin.*recovery|margin.*compression/i],
      generate: (companyName) => ({
        narrative: `Here's your **P&L summary with gross margin trends** for ${companyName} (Q4 FY26).\n\nYour quarterly revenue is **₹28.5L** (+9% QoQ) with a gross margin of **42.3%** (down from 45.5% last quarter). Net profit stands at **₹3.8L** — down 16% from the previous quarter.\n\n**Margin pressure:** Your gross margin has compressed 3.2 percentage points over the quarter due to rising raw material costs (+18%) and increased marketplace commissions. COGS grew 14% while revenue grew only 8%.`,
        kpis: FIN_ECOM_KPIS.filter(k => ['Revenue', 'Gross Margin', 'Net Profit', 'Cash Balance'].includes(k.label)),
        trend: { title: 'Revenue vs Expenses (Quarterly)', data: FIN_ECOM_PL_TREND, unit: '₹', color: '#204CC7' },
        insights: [
          { icon: 'alert', title: 'Margin Alert', description: 'Marketplace commissions have risen to 22% of revenue — renegotiate terms or increase D2C share (currently 49.8%) to improve margins' },
          { icon: 'dollar', title: 'Cost Optimization', description: 'Bulk purchasing for top 5 SKUs could reduce COGS by 8-12%, adding ₹1.2L to quarterly profit' },
        ],
        followUpButtons: [
          { label: 'Open P&L Report', action: 'open-dashboard-finance-profitloss', variant: 'primary' },
          { label: 'D2C growth', action: 'prompt-d2c-growth', variant: 'secondary' },
          { label: 'Overdue invoices', action: 'prompt-overdue-invoices', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/sales.*channel|sales.*breakdown|revenue.*channel|website.*marketplace/i, /grow.*d2c|d2c.*grow|expand.*website|retention.*d2c/i],
      generate: (companyName) => ({
        narrative: `Here's your **sales revenue breakdown by channel** for ${companyName}.\n\nYour D2C website leads with **₹14.2L (49.8%)** followed by marketplaces at **₹9.8L (34.4%)** and in-store at **₹4.5L (15.8%)**.\n\n**Key trend:** Your website (D2C) revenue grew **+12%** while marketplace revenue **declined 8%** — this is actually a positive shift since D2C margins are 15-20% higher than marketplace. However, the marketplace decline needs monitoring.`,
        kpis: FIN_ECOM_KPIS.filter(k => ['Revenue', 'Gross Margin'].includes(k.label)),
        alerts: FIN_ECOM_SALES_BREAKDOWN.map(ch => ({
          severity: (ch.growth > 0 ? 'info' : 'warning') as AlertItem['severity'],
          title: ch.channel,
          description: `Revenue: ${ch.revenue} (${ch.share}) — ${ch.growth > 0 ? '+' : ''}${ch.growth}% growth`,
          metric: ch.revenue,
        })),
        insights: [
          { icon: 'trending', title: 'D2C Growth', description: 'Your D2C channel is approaching 50% of total revenue with +12% growth — invest in retention marketing to sustain momentum' },
          { icon: 'alert', title: 'Marketplace Watch', description: 'Amazon/Flipkart revenue dropped 8% — check for Buy Box loss, increased competition, or listing suppression' },
        ],
        followUpButtons: [
          { label: 'Open Sales Report', action: 'open-dashboard-finance-sales', variant: 'primary' },
          { label: 'P&L summary', action: 'prompt-pl-summary', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
          { label: 'Overdue invoices', action: 'prompt-overdue-invoices', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/overdue.*invoice|receivable.*follow/i, /overdue/i, /invoice/i, /chase.*first|priority.*collect|collect.*priority|chase.*receivable|retail.*mart|collection.*notice/i],
      generate: (companyName) => ({
        narrative: `Here are the **overdue invoices and receivables** that need immediate follow-up for ${companyName}.\n\n**Total overdue: ₹3.94L** across 4 invoices, with the oldest being 45 days past due. Additionally, **₹1.05L** is due within 5 days.\n\n**Cash impact:** Collecting these overdue receivables would extend your cash runway from 8.5 months to approximately **10.8 months** and eliminate the working capital gap.`,
        kpis: FIN_ECOM_KPIS.filter(k => ['Receivables', 'Cash Balance', 'Payables'].includes(k.label)),
        alerts: FIN_ECOM_OVERDUE_INVOICES,
        insights: [
          { icon: 'zap', title: 'Priority Collection', description: 'Focus on INV-1847 (₹1.2L, 45 days) — send formal demand notice and follow up with a call. This single collection improves cash position by 14.6%' },
          { icon: 'lightbulb', title: 'Prevention', description: 'Implement 7-day and 3-day pre-due reminders — businesses see 28% reduction in overdue invoices with automated reminders' },
        ],
        followUpButtons: [
          { label: 'Open Receivables Report', action: 'open-dashboard-finance-receivables', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Cash flow', action: 'prompt-cashflow', variant: 'secondary' },
          { label: 'P&L summary', action: 'prompt-pl-summary', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/gst.*return|compliance.*filing|tax.*due|gst.*due/i, /compliance/i],
      generate: (companyName) => ({
        narrative: `Here are your **upcoming GST and compliance filing deadlines** for ${companyName}.\n\n**1 filing is overdue** (GSTR-1 for January — 15 days past due), and **GSTR-3B** is due in less than a week. Missing these incurs late fees of ₹50/day + 18% interest on outstanding tax.\n\n**Estimated tax liability:** ₹2.8L for GSTR-3B (January) based on your current quarter's sales figures.`,
        alerts: FIN_ECOM_COMPLIANCE.map(c => ({
          severity: (c.status === 'overdue' ? 'critical' : c.daysLeft < 10 ? 'warning' : 'info') as AlertItem['severity'],
          title: c.filing,
          description: `Due: ${c.due} — ${c.status === 'overdue' ? `${Math.abs(c.daysLeft)} days overdue` : `${c.daysLeft} days remaining`}`,
          metric: c.due,
        })),
        insights: [
          { icon: 'alert', title: 'Urgent', description: 'File GSTR-1 (January) immediately — late fee accruing at ₹50/day. Current penalty: ₹750' },
          { icon: 'lightbulb', title: 'Preparation', description: 'Start preparing GSTR-3B data now — reconcile purchase register with vendor invoices to avoid input tax credit mismatches' },
        ],
        followUpButtons: [
          // Primary: There is no Compliance Calendar module. The Dataroom is
          // where GST working sheets + purchase registers actually live, so
          // that's the honest destination for a user preparing to file.
          { label: 'Open Dataroom for Returns', action: 'open-dataroom-finance', variant: 'primary' },
          { label: 'Dataroom files', action: 'prompt-dataroom', variant: 'secondary' },
          { label: 'Overdue invoices', action: 'prompt-overdue-invoices', variant: 'secondary' },
          { label: 'P&L summary', action: 'prompt-pl-summary', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/bank.*reconciliation|dataroom|document|report.*pull/i],
      generate: (companyName) => ({
        narrative: `Here's a summary of your **latest documents and reports** in the Dataroom for ${companyName}.\n\n**Recent uploads:**\n- Bank Reconciliation (Jan 2026) — uploaded 3 days ago\n- GSTR-3B Working Sheet (Jan) — uploaded 5 days ago  \n- P&L Statement (Q3 FY26) — uploaded 12 days ago\n- Balance Sheet (Dec 2025) — uploaded 15 days ago\n\n**Missing:** GSTR-1 Return (Jan) — required for the overdue filing.`,
        insights: [
          { icon: 'lightbulb', title: 'Next Step', description: 'Upload your January sales register and purchase register to enable automatic GSTR-1 preparation' },
          { icon: 'zap', title: 'Quick Access', description: 'Open the Dataroom to view, download, or share any of these documents with your CA/accountant' },
        ],
        followUpButtons: [
          { label: 'Open Dataroom', action: 'open-dataroom-finance', variant: 'primary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'P&L summary', action: 'prompt-pl-summary', variant: 'secondary' },
          { label: 'Overdue invoices', action: 'prompt-overdue-invoices', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    // ── Edge-case / natural language matchers ──
    {
      patterns: [/summary|overview|how.*doing|how.*perform|monthly.*report|weekly.*report|quick.*update|status|health/i],
      generate: (companyName) => ({
        narrative: `Here's your **financial health overview** for ${companyName} (January 2026).\n\n**Revenue:** ₹28.5L (+9% QoQ)\n**Gross Margin:** 42.3% (down from 45.5%) — compressed by rising costs\n**Net Profit:** ₹3.8L (down 16% QoQ)\n**Cash Balance:** ₹8.2L (down 19% QoQ) — needs attention\n**Receivables:** ₹4.8L outstanding (₹3.94L overdue)\n\n**Overall health: ⚠️ Needs Attention** — Revenue is growing but margins are under pressure from marketplace commissions and raw material costs. The receivables pile-up is the most urgent issue to address.`,
        kpis: FIN_ECOM_KPIS,
        trend: { title: 'Revenue vs Expenses (Quarterly)', data: FIN_ECOM_PL_TREND, unit: '₹', color: '#204CC7' },
        insights: [
          { icon: 'alert', title: 'Top Priority', description: 'Collect ₹3.94L in overdue receivables — this alone would significantly improve your cash position' },
          { icon: 'trending', title: 'Positive Trend', description: 'D2C revenue grew +12% and now represents 49.8% of sales — higher margin channel gaining share' },
          { icon: 'zap', title: 'Compliance', description: 'GSTR-1 (January) is 15 days overdue — file immediately to avoid mounting penalties' },
        ],
        followUpButtons: [
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'D2C growth', action: 'prompt-d2c-growth', variant: 'secondary' },
          { label: "What's working", action: 'prompt-working', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*attention|what.*focus|priority|urgent|alert|red.*flag|what.*wrong|issue|problem|fix/i],
      generate: (companyName) => ({
        narrative: `Here are the **items requiring your immediate attention** for ${companyName}.\n\nI've identified **4 critical financial issues** that need resolution:`,
        kpis: FIN_ECOM_KPIS.filter(k => k.status === 'danger' || k.status === 'warning'),
        alerts: [
          { severity: 'critical', title: 'GSTR-1 Filing Overdue', description: '15 days past due — penalty accruing at ₹50/day (₹750 so far). File immediately.', metric: '15 days' },
          { severity: 'critical', title: '₹3.94L in Overdue Receivables', description: '4 invoices overdue, oldest 45 days. RetailMart India (₹1.2L) needs immediate escalation.', metric: '₹3.94L' },
          { severity: 'warning', title: 'Gross Margin Compression', description: 'Margin dropped 3.2pp this quarter. Rising marketplace commissions (22%) and raw material costs (+18%) are the drivers.', metric: '42.3%' },
          { severity: 'warning', title: 'Cash Balance Declining', description: '₹8.2L, down 19% QoQ — collecting overdue receivables would significantly improve this position.', metric: '₹8.2L' },
        ],
        insights: [
          { icon: 'zap', title: '#1 Today', description: 'File GSTR-1 immediately and prepare GSTR-3B by Feb 18 — stop penalty accumulation' },
          { icon: 'dollar', title: '#2 This Week', description: 'Send formal collection notices for the 2 critical overdue invoices (₹2.02L combined, 30+ days overdue)' },
        ],
        followUpButtons: [
          // Primary: This matcher lists FOUR cross-domain critical issues
          // (GSTR-1 + receivables + margin + cash) — not just compliance. The
          // Financial Dashboard landing is the only destination that spans all
          // four, so it's the honest CTA.
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
          { label: 'Overdue invoices', action: 'prompt-overdue-invoices', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*working|win|highlight|good.*news|positive|strength/i],
      generate: (companyName) => ({
        narrative: `Here's **what's working well** for ${companyName} financially.\n\n**3 positive indicators** in your current financials:`,
        kpis: FIN_ECOM_KPIS.filter(k => k.status === 'good'),
        insights: [
          { icon: 'trending', title: 'D2C Channel Growing', description: 'Website revenue grew +12% and represents 49.8% of total sales — higher margins than marketplace (est. 15-20% better).' },
          { icon: 'dollar', title: 'Payables Well-Managed', description: 'Payables reduced to ₹3.2L (+16% improvement QoQ) — you have negotiating room with suppliers if needed.' },
          { icon: 'zap', title: 'Revenue Momentum', description: 'Revenue reached ₹28.5L (+9% QoQ) — the quarterly trajectory shows consistent month-over-month growth.' },
        ],
        followUpButtons: [
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'D2C growth', action: 'prompt-d2c-growth', variant: 'secondary' },
          { label: 'P&L summary', action: 'prompt-pl-summary', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
          { label: 'Sales by channel', action: 'prompt-sales-breakdown', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/roi|return|profitab|margin.*trend|money.*worth|best.*channel|top.*channel/i],
      generate: (companyName) => ({
        narrative: `Here's your **profitability and channel ROI breakdown** for ${companyName}.\n\n**Revenue by channel profitability:**\n- **Website (D2C):** ₹14.2L revenue, ~52% gross margin — **your most profitable channel**\n- **Marketplace:** ₹9.8L revenue, ~35% gross margin — commissions eroding margins\n- **In-Store:** ₹4.5L revenue, ~48% gross margin — stable but limited growth\n\n**Net margin:** 13.3% (₹3.8L / ₹28.5L) — down from 15.8% last quarter. Growing D2C share from 50% to 60% would add approximately ₹85K to quarterly profit.`,
        kpis: FIN_ECOM_KPIS.filter(k => ['Revenue', 'Gross Margin', 'Net Profit'].includes(k.label)),
        alerts: FIN_ECOM_SALES_BREAKDOWN.map(ch => ({
          severity: (ch.growth > 0 ? 'info' : 'warning') as AlertItem['severity'],
          title: ch.channel,
          description: `Revenue: ${ch.revenue} (${ch.share}) — ${ch.growth > 0 ? '+' : ''}${ch.growth}% growth`,
          metric: ch.revenue,
        })),
        insights: [
          { icon: 'trending', title: 'Most Profitable', description: 'D2C channel delivers ~52% gross margin — every 1% market share shift from marketplace to D2C adds ₹2.4K to monthly profit' },
          { icon: 'alert', title: 'Marketplace Margin Squeeze', description: 'Marketplace commissions at 22% — renegotiate or shift focus to D2C customer retention campaigns' },
        ],
        followUpButtons: [
          { label: 'Open P&L Report', action: 'open-dashboard-finance-profitloss', variant: 'primary' },
          { label: 'D2C growth', action: 'prompt-d2c-growth', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
          { label: 'Sales by channel', action: 'prompt-sales-breakdown', variant: 'secondary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
  ];
}

// ═══ FINANCE TRADING/MANUFACTURING MATCHERS ═══
function buildFinanceTradingMatchers(): PromptMatcher[] {
  return [
    {
      patterns: [/cash.*flow|working.*capital|cash.*position/i],
      generate: (companyName) => ({
        narrative: `Here's your **cash flow and working capital health** for ${companyName} (January 2026).\n\nYour cash flow has declined **32% over 6 months** — from ₹12.5L in August to ₹8.5L in January. Working capital is at **₹32L** (down 16%), with a current ratio of **1.35** (healthy threshold: 2.0).\n\n**Critical alert:** At current burn rate, your cash runway is approximately **4.5 months**. The primary drain is the ₹48L receivables pile-up — collecting even 50% would restore working capital to healthy levels.`,
        kpis: FIN_TRADE_KPIS.filter(k => ['Cash Flow', 'Working Capital', 'Current Ratio', 'Receivables'].includes(k.label)),
        trend: { title: 'Cash Flow Trend (6 Months)', data: FIN_TRADE_CASHFLOW_TREND, unit: '₹', color: '#ef4444' },
        insights: [
          { icon: 'alert', title: 'Urgent', description: 'Cash flow is trending negative — accelerate collections on the ₹20.3L in 60+ day receivables to stabilize within 30 days' },
          { icon: 'dollar', title: 'Working Capital', description: 'Negotiate 15-day payment extension with top 3 suppliers (₹18L payable) to ease immediate cash pressure' },
        ],
        followUpButtons: [
          { label: 'Open Cash Flow Report', action: 'open-dashboard-finance-cashflow', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Cost-cut opportunities', action: 'prompt-cost-cuts', variant: 'secondary' },
          { label: 'Expenses vs revenue', action: 'prompt-expense-vs-revenue', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/receivable.*aging|who.*owes|receivable.*breakdown/i, /receivable/i, /chase.*first|priority.*collect|collect.*priority|chase.*receivable|sharma|national.*distributor|legal.*notice/i],
      generate: (companyName) => ({
        narrative: `Here's your **receivables aging analysis** for ${companyName}.\n\n**Total receivables: ₹48L** across 43 invoices. The concerning part: **₹20.3L (42%)** is aged beyond 60 days, and **₹8.5L** has crossed 90 days — significantly increasing bad debt risk.\n\n**Top overdue accounts:**\n- **M/s Sharma Trading Co.** — ₹8.2L (92 days)\n- **National Distributors Pvt Ltd** — ₹6.1L (78 days)\n- **Excel Manufacturing** — ₹4.5L (65 days)\n- **Bharat Exports** — ₹3.8L (52 days)`,
        alerts: FIN_TRADE_RECEIVABLES_AGING.map(a => ({
          severity: a.status === 'good' ? 'info' as const : a.status as AlertItem['severity'],
          title: a.bracket,
          description: `${a.amount} across ${a.count} invoices`,
          metric: a.amount,
        })),
        insights: [
          { icon: 'zap', title: 'Priority Collection', description: 'Focus on Sharma Trading (₹8.2L, 92 days) — send legal notice if no response within 7 days' },
          { icon: 'lightbulb', title: 'Policy Change', description: 'Implement strict 45-day payment terms with 2% early payment discount — reduces average collection period by 18 days' },
        ],
        followUpButtons: [
          { label: 'Open Receivables Report', action: 'open-dashboard-finance-receivables', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Cash flow', action: 'prompt-cashflow', variant: 'secondary' },
          { label: 'Expenses vs revenue', action: 'prompt-expense-vs-revenue', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/expense.*revenue|operating.*expense|expense.*growth|cost.*growth/i, /expense/i, /cut.*cost|where.*cut|reduce.*cost|trim.*expense|cost.*saving|logistics.*save|raw.*material.*contract/i],
      generate: (companyName) => ({
        narrative: `Here's your **operating expenses vs revenue comparison** for ${companyName} over the last 6 months.\n\n**Revenue grew 10%** (₹1.68Cr → ₹1.85Cr) while **expenses grew 24%** (₹1.52Cr → ₹1.88Cr). Your expense-to-revenue ratio has deteriorated from 90.5% to 101.6% — meaning you're now **spending more than you earn**.\n\n**Biggest expense drivers:**\n- Raw materials: +22% (commodity price inflation)\n- Logistics: +31% (fuel surcharges + route changes)\n- Labour: +15% (minimum wage revision)`,
        kpis: FIN_TRADE_KPIS.filter(k => ['Revenue', 'Working Capital', 'Cash Flow'].includes(k.label)),
        trend: { title: 'Expenses vs Revenue (6M)', data: FIN_TRADE_EXPENSE_VS_REVENUE, unit: '₹', color: '#ef4444' },
        alerts: [
          { severity: 'critical', title: 'Expense Exceeds Revenue', description: 'January expenses (₹1.88Cr) exceeded revenue (₹1.85Cr) — operating at a loss', metric: '101.6%' },
          { severity: 'warning', title: 'Logistics Cost Spike', description: 'Logistics costs up 31% — renegotiate contracts or consolidate shipments', metric: '+31%' },
          { severity: 'warning', title: 'Raw Material Inflation', description: 'Raw material costs up 22% — explore alternative suppliers or forward contracts', metric: '+22%' },
        ],
        insights: [
          { icon: 'alert', title: 'Break-Even Risk', description: 'At current trajectory, monthly losses will reach ₹5-8L by Q1 FY27 — immediate cost review needed' },
          { icon: 'dollar', title: 'Quick Saves', description: 'Consolidating logistics (₹3.2L/month saving) and renegotiating raw material contracts (₹2.1L/month saving) can restore profitability' },
        ],
        followUpButtons: [
          { label: 'Open Expense Report', action: 'open-dashboard-finance-expenses', variant: 'primary' },
          { label: 'Cost-cut opportunities', action: 'prompt-cost-cuts', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
          { label: 'Receivables aging', action: 'prompt-receivables-aging', variant: 'secondary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/gst|tds|advance.*tax|tax.*deadline|compliance|filing/i],
      generate: (companyName) => ({
        narrative: `Here are your **upcoming GST, TDS, and advance tax deadlines** for ${companyName}.\n\n**1 filing is overdue** (GSTR-1 for January — 15 days past due) and **GSTR-3B** is imminent. Your estimated tax liabilities total **₹12.8L** across all upcoming filings this quarter.\n\n**TDS status:** Q4 TDS return covers ₹4.2L in deductions across 28 vendor payments. Ensure all challans are deposited before March 31.`,
        alerts: FIN_TRADE_COMPLIANCE.map(c => ({
          severity: (c.status === 'overdue' ? 'critical' : c.daysLeft < 20 ? 'warning' : 'info') as AlertItem['severity'],
          title: c.filing,
          description: `Due: ${c.due} — ${c.status === 'overdue' ? `${Math.abs(c.daysLeft)} days overdue` : `${c.daysLeft} days remaining`}`,
          metric: c.due,
        })),
        insights: [
          { icon: 'alert', title: 'Immediate', description: 'File GSTR-1 (January) today — penalty accruing at ₹50/day. Prepare GSTR-3B by Feb 18 for timely submission' },
          { icon: 'lightbulb', title: 'Tax Planning', description: 'Review advance tax estimate — with revenue trending down, you may qualify for reduced Q4 installment (save ₹1.8L in cash flow)' },
        ],
        followUpButtons: [
          // Primary: No Compliance Calendar module exists. The Dataroom is where
          // GST working sheets, TDS challans, and advance tax computations live —
          // the real destination for a user preparing to file ₹12.8L across 4 filings.
          { label: 'Open Dataroom for Returns', action: 'open-dataroom-finance', variant: 'primary' },
          { label: 'Cash flow', action: 'prompt-cashflow', variant: 'secondary' },
          { label: 'Dataroom files', action: 'prompt-dataroom', variant: 'secondary' },
          { label: 'Receivables aging', action: 'prompt-receivables-aging', variant: 'secondary' },
          { label: 'Expenses vs revenue', action: 'prompt-expense-vs-revenue', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/itr|balance.*sheet|dataroom|document|filing.*pull/i],
      generate: (companyName) => ({
        narrative: `Here's a summary of your **key financial documents** in the Dataroom for ${companyName}.\n\n**Available:**\n- Balance Sheet (Dec 2025) — uploaded 10 days ago\n- ITR-4 (AY 2025-26) — filed July 2025, copy available\n- Trial Balance (Jan 2026) — uploaded 5 days ago\n- Bank Statements (Oct-Jan) — synced automatically\n\n**Pending:**\n- Audited Financial Statements (FY25-26) — in preparation\n- Updated Cash Flow Statement (Jan) — needs reconciliation`,
        insights: [
          { icon: 'lightbulb', title: 'Next Step', description: 'Upload the latest stock register and debtor-wise outstanding report to enable automated balance sheet preparation' },
          { icon: 'zap', title: 'Quick Access', description: 'Open the Dataroom to view, download, or share documents with your auditor' },
        ],
        followUpButtons: [
          { label: 'Open Dataroom', action: 'open-dataroom-finance', variant: 'primary' },
          { label: 'Cash flow', action: 'prompt-cashflow', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'Receivables aging', action: 'prompt-receivables-aging', variant: 'secondary' },
          { label: 'Expenses vs revenue', action: 'prompt-expense-vs-revenue', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    // ── Edge-case / natural language matchers ──
    {
      patterns: [/summary|overview|how.*doing|how.*perform|monthly.*report|weekly.*report|quick.*update|status|health/i],
      generate: (companyName) => ({
        narrative: `Here's your **financial health overview** for ${companyName} (January 2026).\n\n**Revenue:** ₹1.85Cr (+10% over 6 months)\n**Working Capital:** ₹32L (down 16%) — critically low\n**Cash Flow:** ₹8.5L (down 32% over 6 months) — declining steadily\n**Current Ratio:** 1.35 (healthy: 2.0) — liquidity risk\n**Receivables:** ₹48L outstanding — ₹20.3L aged beyond 60 days\n\n**Overall health: 🔴 Critical** — Your business is cash-constrained with expenses exceeding revenue in January. The ₹48L receivables pile-up is the root cause — accelerating collections is the single most impactful action.`,
        kpis: FIN_TRADE_KPIS,
        trend: { title: 'Cash Flow Trend (6 Months)', data: FIN_TRADE_CASHFLOW_TREND, unit: '₹', color: '#ef4444' },
        insights: [
          { icon: 'alert', title: 'Top Priority', description: 'Collect ₹20.3L in 60+ day receivables — focus on Sharma Trading (₹8.2L, 92 days) and National Distributors (₹6.1L, 78 days)' },
          { icon: 'dollar', title: 'Cost Control', description: 'Expenses exceeded revenue in January (101.6% ratio) — immediate action needed on logistics (+31%) and raw materials (+22%)' },
          { icon: 'zap', title: 'Compliance', description: 'GSTR-1 is 15 days overdue and 4 more filings due this quarter — total estimated tax liability ₹12.8L' },
        ],
        followUpButtons: [
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Cost-cut opportunities', action: 'prompt-cost-cuts', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*attention|what.*focus|priority|urgent|alert|red.*flag|what.*wrong|issue|problem|fix/i],
      generate: (companyName) => ({
        narrative: `Here are the **critical items requiring immediate attention** for ${companyName}.\n\nYour business is facing **5 urgent financial issues** — failure to act on these within the next 30 days risks a severe cash crunch:`,
        kpis: FIN_TRADE_KPIS.filter(k => k.status === 'danger'),
        alerts: [
          { severity: 'critical', title: 'Operating at a Loss', description: 'January expenses (₹1.88Cr) exceeded revenue (₹1.85Cr) — 101.6% expense ratio. First loss month in 18 months.', metric: '101.6%' },
          { severity: 'critical', title: '₹20.3L in Aged Receivables', description: '42% of receivables are 60+ days old. Sharma Trading (₹8.2L, 92 days) requires legal escalation.', metric: '₹20.3L' },
          { severity: 'critical', title: 'Cash Runway at 4.5 Months', description: 'Cash balance declining ₹3.75L/month. Without receivables collection, operational funding runs out by June.', metric: '4.5 months' },
          { severity: 'warning', title: 'GSTR-1 Filing Overdue', description: '15 days past due. Additionally, GSTR-3B due in 6 days and advance tax due March 15.', metric: '15 days' },
          { severity: 'warning', title: 'Logistics Costs Spiked +31%', description: 'Fuel surcharges and route changes driving up logistics — consolidation could save ₹3.2L/month.', metric: '+31%' },
        ],
        insights: [
          { icon: 'zap', title: '#1 This Week', description: 'Send legal notices to top 3 overdue accounts (₹18.8L combined) — engage collection agency for 90+ day accounts' },
          { icon: 'dollar', title: '#2 Next 2 Weeks', description: 'Renegotiate logistics contracts and consolidate shipments — projected ₹3.2L/month in savings' },
        ],
        followUpButtons: [
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'Collection priority', action: 'prompt-collection-priority', variant: 'secondary' },
          { label: 'Cost-cut opportunities', action: 'prompt-cost-cuts', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: "What's working", action: 'prompt-working', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/what.*working|win|highlight|good.*news|positive|strength/i],
      generate: (companyName) => ({
        narrative: `Here's **what's working well** for ${companyName} despite the financial challenges.\n\n**3 positive indicators:**`,
        kpis: FIN_TRADE_KPIS.filter(k => k.status === 'good'),
        insights: [
          { icon: 'trending', title: 'Revenue Growth Trajectory', description: 'Revenue grew 10% (₹1.68Cr → ₹1.85Cr) over 6 months — the top-line is heading in the right direction.' },
          { icon: 'dollar', title: 'Payables Under Control', description: 'Payables at ₹28L, improved 7% — you have supplier credit headroom to manage short-term cash pressure.' },
          { icon: 'zap', title: 'Advance Tax Planning', description: 'With revenue trending lower, you may qualify for a reduced Q4 advance tax installment — saving ₹1.8L in immediate cash outflow.' },
        ],
        followUpButtons: [
          { label: 'Open Financial Dashboard', action: 'open-dashboard-finance', variant: 'primary' },
          { label: 'ROI breakdown', action: 'prompt-roi', variant: 'secondary' },
          { label: 'Cash flow', action: 'prompt-cashflow', variant: 'secondary' },
          { label: 'GST compliance', action: 'prompt-compliance', variant: 'secondary' },
          { label: 'What needs attention', action: 'prompt-attention', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
    {
      patterns: [/roi|return|profitab|margin|money.*worth|best.*product|top.*product/i],
      generate: (companyName) => ({
        narrative: `Here's your **profitability analysis** for ${companyName}.\n\n**Operating margin** has turned negative in January — expenses at ₹1.88Cr exceeded revenue of ₹1.85Cr, resulting in an **operating loss of ₹3L**.\n\n**Margin trajectory (6M):**\n- August: +9.5% operating margin\n- October: +6.2%\n- December: +2.4%\n- January: **-1.6%** (first loss)\n\n**Primary margin destroyers:** Raw materials (+22%), Logistics (+31%), and Labour (+15%) drove the 11.1 percentage point margin compression.`,
        kpis: FIN_TRADE_KPIS.filter(k => ['Revenue', 'Working Capital', 'Cash Flow'].includes(k.label)),
        trend: { title: 'Expenses vs Revenue (6M)', data: FIN_TRADE_EXPENSE_VS_REVENUE, unit: '₹', color: '#ef4444' },
        insights: [
          { icon: 'alert', title: 'Break-Even Path', description: 'You need to cut ₹3L+ in monthly costs or grow revenue 1.6% to return to profitability. Logistics consolidation (₹3.2L) is the fastest lever.' },
          { icon: 'dollar', title: 'Margin Recovery Plan', description: 'Forward contracts on raw materials + logistics renegotiation could restore 6-8% operating margin within 60 days' },
        ],
        followUpButtons: [
          { label: 'Open Expense Report', action: 'open-dashboard-finance-expenses', variant: 'primary' },
          { label: 'Cost-cut opportunities', action: 'prompt-cost-cuts', variant: 'secondary' },
          { label: 'Margin recovery', action: 'prompt-margin-recovery', variant: 'secondary' },
          { label: 'Expenses vs revenue', action: 'prompt-expense-vs-revenue', variant: 'secondary' },
          { label: 'Receivables aging', action: 'prompt-receivables-aging', variant: 'secondary' },
        ],
        componentType: 'dashboard-response',
      }),
    },
  ];
}


// ── Main Matching Function ──

export function matchPromptToResponse(
  userMessage: string,
  service: string,
  businessType: string,
  companyName: string,
): StructuredResponse | null {
  const matchers = buildMatchers(service, businessType);
  
  for (const matcher of matchers) {
    for (const pattern of matcher.patterns) {
      if (pattern.test(userMessage)) {
        return matcher.generate(companyName || 'Your Business');
      }
    }
  }
  
  return null;
}

// ── Utility: Get thinking label for prompt category ──

export function getThinkingLabelForPrompt(userMessage: string): string {
  if (/campaign|roas|cpl/i.test(userMessage)) return 'Analyzing campaign data...';
  if (/creative/i.test(userMessage)) return 'Reviewing creative performance...';
  if (/conversion|aov|funnel/i.test(userMessage)) return 'Pulling funnel metrics...';
  if (/cac|acquisition|cost/i.test(userMessage)) return 'Computing acquisition costs...';
  if (/channel|meta.*google|linkedin.*google|compare/i.test(userMessage)) return 'Comparing channel data...';
  if (/product|declining|sales/i.test(userMessage)) return 'Scanning product data...';
  if (/p&l|profit|margin/i.test(userMessage)) return 'Loading financial statements...';
  if (/invoice|overdue|receivable/i.test(userMessage)) return 'Checking receivables ledger...';
  if (/gst|tax|compliance|filing/i.test(userMessage)) return 'Reviewing compliance calendar...';
  if (/cash.*flow|working.*capital/i.test(userMessage)) return 'Analyzing cash flow data...';
  if (/expense|revenue.*growth|operating/i.test(userMessage)) return 'Comparing expenses vs revenue...';
  if (/dataroom|document|balance.*sheet|itr/i.test(userMessage)) return 'Scanning the Dataroom...';
  if (/team|@brego/i.test(userMessage)) return 'Summarizing team conversations...';
  if (/summary|overview|how.*doing|monthly.*report|status|health/i.test(userMessage)) return 'Building your performance overview...';
  if (/attention|focus|priority|urgent|alert|wrong|issue|problem|fix/i.test(userMessage)) return 'Scanning for critical issues...';
  if (/working|win|highlight|good.*news|positive|strength/i.test(userMessage)) return 'Finding your top performers...';
  if (/roi|return.*investment|profitab|money.*worth/i.test(userMessage)) return 'Calculating return on investment...';
  if (/budget|spend|where.*money/i.test(userMessage)) return 'Analyzing spend breakdown...';
  if (/underperform|weak|poor|low.*ctr/i.test(userMessage)) return 'Flagging underperformers...';
  return 'Analyzing your data...';
}
