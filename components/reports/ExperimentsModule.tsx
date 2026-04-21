'use client';

import { useState } from 'react';
import { Beaker, FlaskConical, CheckCircle, TrendingUp, TrendingDown, Calendar, Target, AlertCircle, CheckCircle2, Zap, ChevronDown, XCircle, MinusCircle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { ActionPanel } from './ActionPanel';

interface ExperimentsModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel?: string;
}

export function ExperimentsModule({ businessModel, selectedChannel }: ExperimentsModuleProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isEcommerce = businessModel === 'ecommerce';

  // E-Commerce Experiment Data
  const ecommerceExperiments = {
    active: 3,
    wins: 7,
    losses: 4,
    timeline: [
      {
        week: 'Week 1',
        experiment: 'Checkout Simplification',
        status: 'running',
        baseline: 2.8,
        variant: 3.1,
        result: null
      },
      {
        week: 'Week 2',
        experiment: 'Product Video Test',
        status: 'running',
        baseline: 3.2,
        variant: 3.5,
        result: null
      },
      {
        week: 'Week 3',
        experiment: 'Free Shipping Threshold',
        status: 'running',
        baseline: 3.0,
        variant: 2.9,
        result: null
      },
      {
        week: 'Week 4',
        experiment: 'Product Video Test',
        status: 'win',
        baseline: 3.2,
        variant: 3.8,
        result: 'win'
      },
      {
        week: 'Week 5',
        experiment: 'Trust Badge Test',
        status: 'loss',
        baseline: 2.9,
        variant: 2.6,
        result: 'loss'
      },
      {
        week: 'Week 6',
        experiment: 'Checkout Simplification',
        status: 'win',
        baseline: 2.8,
        variant: 3.4,
        result: 'win'
      },
      {
        week: 'Week 7',
        experiment: 'Popup Exit Intent',
        status: 'loss',
        baseline: 3.1,
        variant: 2.7,
        result: 'loss'
      },
      {
        week: 'Week 8',
        experiment: 'BNPL Payment Option',
        status: 'win',
        baseline: 3.0,
        variant: 3.6,
        result: 'win'
      }
    ],
    experiments: [
      {
        hypothesis: 'Product page videos increase purchase intent and reduce returns',
        changeTested: 'Added 30s product demo video above fold on top 200 SKUs',
        metric: 'Conversion Rate',
        baseline: '3.2%',
        variant: '3.8%',
        lift: '+18.8%',
        result: 'win',
        confidence: '95%',
        learnings: 'Video showing product in use lifted CVR +18.8%. 42% watched &gt;15s. Rollout to all 2,400 SKUs = +₹12.4L/month revenue. Investment: ₹8K/video × 2,400 = ₹1.92Cr (15.6-month payback). Unfair advantage: competitors still using photos.'
      },
      {
        hypothesis: 'Reducing checkout fields decreases abandonment and increases completion',
        changeTested: 'Reduced checkout form fields from 12→6 (removed optional fields, enabled autofill)',
        metric: 'Checkout Completion',
        baseline: '58%',
        variant: '71%',
        lift: '+22.4%',
        result: 'win',
        confidence: '98%',
        learnings: 'Fewer fields = +22.4% completion rate. Removed: company name, alternate phone, landmark, GST (made optional). Average checkout time reduced 45s → 28s. Deploy globally = +₹8.2L/month revenue.'
      },
      {
        hypothesis: 'Buy Now Pay Later options reduce purchase friction for high-AOV items',
        changeTested: 'Added Razorpay BNPL (Afterpay/Klarna) for orders >₹5,000',
        metric: 'Conversion Rate (>₹5K)',
        baseline: '3.0%',
        variant: '3.6%',
        lift: '+20.0%',
        result: 'win',
        confidence: '92%',
        learnings: 'BNPL lifted CVR +20% for high-ticket items. 18% of converters chose BNPL. Average order value ₹7,850. Rollout to all products >₹3K = +₹4.8L/month revenue. Razorpay fees 2.8% offset by volume gain.'
      },
      {
        hypothesis: 'Free shipping threshold optimization increases AOV without hurting conversion',
        changeTested: 'Tested ₹799 vs ₹1,299 free shipping threshold with progress bar',
        metric: 'AOV + CVR Combined',
        baseline: '₹1,842 @ 3.0% CVR',
        variant: '₹1,956 @ 2.9% CVR',
        lift: '+1.2%',
        result: 'inconclusive',
        confidence: '67%',
        learnings: 'Inconclusive - AOV improved +6.2% but CVR dropped -3.3%. Net revenue +1.2% (not statistically significant). Retest with ₹999 threshold as middle ground. Consider personalized thresholds by customer segment.'
      },
      {
        hypothesis: 'Above-fold trust badges reduce purchase anxiety and increase trust',
        changeTested: 'Added SSL seal, money-back guarantee, and payment logos above checkout button',
        metric: 'Conversion Rate',
        baseline: '2.9%',
        variant: '2.6%',
        lift: '-10.3%',
        result: 'loss',
        confidence: '89%',
        learnings: 'Trust badges cluttered UI and hurt CVR -10.3%. Hypothesis: badge overload = distrust signal. Learning: Less is more. Retest with single "Secure Checkout ✓" text badge instead of 4 logos.'
      },
      {
        hypothesis: 'Exit-intent popup with 10% discount recovers abandoning visitors',
        changeTested: 'Triggered popup on exit intent offering 10% discount code',
        metric: 'Bounce Rate + CVR',
        baseline: '42% bounce, 3.1% CVR',
        variant: '48% bounce, 2.7% CVR',
        lift: '-12.9%',
        result: 'loss',
        confidence: '94%',
        learnings: 'Aggressive popup increased bounce +14.3% and hurt CVR -12.9%. Users found it intrusive. Learning: Exit intent works for email capture, not for direct discounts. Killed test immediately. Focus on cart abandonment emails instead.'
      },
      {
        hypothesis: 'Customer reviews above fold increase social proof and purchase confidence',
        changeTested: 'Moved 5-star reviews and testimonials from bottom to above "Add to Cart"',
        metric: 'Conversion Rate',
        baseline: '3.3%',
        variant: '3.9%',
        lift: '+18.2%',
        result: 'win',
        confidence: '96%',
        learnings: 'Social proof above fold lifted CVR +18.2%. Best performers: 5-star ratings with photo reviews. 200-300 character testimonials performed better than 50-word essays. Rollout = +₹9.8L/month revenue.'
      },
      {
        hypothesis: 'Product comparison table helps decision-making for similar SKUs',
        changeTested: 'Added side-by-side comparison widget for similar products (price, features, ratings)',
        metric: 'Add-to-Cart Rate',
        baseline: '4.2%',
        variant: '4.8%',
        lift: '+14.3%',
        result: 'win',
        confidence: '91%',
        learnings: 'Comparison table reduced decision paralysis and lifted ATC +14.3%. Most used for electronics and fashion categories. 38% of users interacted with widget. Deploy to all categories with >3 similar SKUs.'
      },
      {
        hypothesis: 'Live chat widget increases support access and conversion for high-intent users',
        changeTested: 'Added Intercom live chat on product and checkout pages (9 AM - 9 PM)',
        metric: 'Conversion Rate',
        baseline: '3.1%',
        variant: '2.8%',
        lift: '-9.7%',
        result: 'loss',
        confidence: '87%',
        learnings: 'Live chat widget was distracting and hurt CVR -9.7%. Hypothesis: users felt pressured or annoyed. Only 4% engaged with chat. Learning: Retest with less intrusive "Help?" button instead of expanded chat box.'
      },
      {
        hypothesis: 'Countdown timer for limited-time offers creates urgency and speeds purchase decisions',
        changeTested: 'Added 24-hour countdown timer on flash sale products',
        metric: 'Conversion Rate',
        baseline: '3.4%',
        variant: '4.2%',
        lift: '+23.5%',
        result: 'win',
        confidence: '97%',
        learnings: 'Urgency timer lifted CVR +23.5% on flash sale items. FOMO effect real. Average decision time reduced 4.2 days → 1.8 days. Caution: Overuse = fatigue. Limit to genuine limited-time offers only. Deployed selectively.'
      },
      {
        hypothesis: 'Size guide modal reduces size-related returns for apparel',
        changeTested: 'Added interactive size guide modal with body measurement calculator',
        metric: 'Return Rate',
        baseline: '18.2%',
        variant: '12.4%',
        lift: '-31.9%',
        result: 'win',
        confidence: '93%',
        learnings: 'Size guide reduced returns -31.9% for apparel category. 62% of users opened guide before purchase. Saved ₹4.8L/month in return logistics + refunds. Deploy to footwear and accessories next.'
      }
    ]
  };

  // Lead Gen Experiment Data
  const leadgenExperiments = {
    active: 2,
    wins: 5,
    losses: 3,
    timeline: [
      {
        week: 'Week 1',
        experiment: 'CEO Video Testimonial',
        status: 'running',
        baseline: 14.2,
        variant: 15.8,
        result: null
      },
      {
        week: 'Week 2',
        experiment: 'Form Field Reduction',
        status: 'running',
        baseline: 13.8,
        variant: 14.5,
        result: null
      },
      {
        week: 'Week 3',
        experiment: 'CEO Video Testimonial',
        status: 'win',
        baseline: 14.2,
        variant: 17.1,
        result: 'win'
      },
      {
        week: 'Week 4',
        experiment: 'Exit Intent Popup',
        status: 'loss',
        baseline: 13.5,
        variant: 12.1,
        result: 'loss'
      },
      {
        week: 'Week 5',
        experiment: 'Form Field Reduction',
        status: 'win',
        baseline: 13.8,
        variant: 16.4,
        result: 'win'
      },
      {
        week: 'Week 6',
        experiment: 'Social Proof Badges',
        status: 'win',
        baseline: 14.0,
        variant: 15.8,
        result: 'win'
      },
      {
        week: 'Week 7',
        experiment: 'ROI Calculator Widget',
        status: 'running',
        baseline: 15.2,
        variant: 16.8,
        result: null
      },
      {
        week: 'Week 8',
        experiment: 'Case Study Carousel',
        status: 'win',
        baseline: 14.5,
        variant: 16.9,
        result: 'win'
      },
      {
        week: 'Week 9',
        experiment: 'Calendar Integration',
        status: 'loss',
        baseline: 14.8,
        variant: 13.2,
        result: 'loss'
      },
      {
        week: 'Week 10',
        experiment: 'Multi-Step Form',
        status: 'loss',
        baseline: 15.0,
        variant: 13.6,
        result: 'loss'
      },
      {
        week: 'Week 11',
        experiment: 'LinkedIn InMail Copy',
        status: 'win',
        baseline: 8.4,
        variant: 11.2,
        result: 'win'
      },
      {
        week: 'Week 12',
        experiment: 'Qualification Questions',
        status: 'running',
        baseline: 16.5,
        variant: 15.2,
        result: null
      }
    ],
    experiments: [
      {
        hypothesis: 'Video testimonials from C-level executives increase trust and lead quality for B2B services',
        changeTested: 'Added 45s CEO testimonial video above form on landing page (authentic story vs polished marketing)',
        metric: 'Landing Page CVR + SQL Rate',
        baseline: '14.2% CVR, 38% SQL',
        variant: '17.1% CVR, 44% SQL',
        lift: '+20.4% CVR, +16% SQL',
        result: 'win',
        confidence: '94%',
        learnings: 'CEO testimonial video lifted CVR +20.4% and engagement rate 3.2x higher than polished agency video. 68% watched >30s (B2B buyers invest time in authentic content). Deploy to all 8 landing pages = +285 leads/month at lower CPL. Unfair advantage: Most competitors use generic stock footage.'
      },
      {
        hypothesis: 'Reducing form fields improves completion rate without sacrificing lead quality',
        changeTested: 'Reduced form fields from 8→4 (kept: name, email, company, phone | removed: budget, timeline, message, industry)',
        metric: 'Form Completion Rate + SQL Rate',
        baseline: '13.8% completion, 39% SQL',
        variant: '16.4% completion, 38% SQL',
        lift: '+18.8% completion, -2.6% SQL',
        result: 'win',
        confidence: '96%',
        learnings: 'Form simplification delivered +18.8% completion with minimal SQL impact (39% → 38%). Every removed field = +3-4% completion. Deploy across all lead gen forms = +188 leads/month. Trade-off acceptable: Volume gain >> slight quality dip. Use progressive profiling in nurture emails to capture missing data later.'
      },
      {
        hypothesis: 'Social proof badges and client logos above form increase trust and conversion for B2B',
        changeTested: 'Added "Trusted by 500+ Companies" headline + 12 recognizable client logos in grid above CTA',
        metric: 'Landing Page CVR',
        baseline: '14.0%',
        variant: '15.8%',
        lift: '+12.9%',
        result: 'win',
        confidence: '91%',
        learnings: 'Social proof lifted CVR +12.9%. B2B buyers need validation from peers. Logo grid performed better than rotating carousel (static = more trust). Best logos: recognizable brands in same industry/size. Deploy to all pages = +142 leads/month. Pro tip: Use "Companies like [Prospect Company]" for personalization.'
      },
      {
        hypothesis: 'Exit-intent popup with lead magnet offer recovers abandoning B2B visitors',
        changeTested: 'Triggered exit-intent popup offering "Free Finance Health Audit" PDF download on exit',
        metric: 'Bounce Rate + CVR',
        baseline: '38% bounce, 13.5% CVR',
        variant: '42% bounce, 12.1% CVR',
        lift: '+10.5% bounce, -10.4% CVR',
        result: 'loss',
        confidence: '91%',
        learnings: 'Exit popup HURT B2B conversions -10.4% and increased bounce +10.5%. B2B buyers research carefully over days/weeks - interruption breaks trust and feels desperate. Killed immediately. Learning: B2B ≠ B2C tactics. Focus on retargeting campaigns, nurture email sequences, and multi-touch attribution instead of aggressive popups.'
      },
      {
        hypothesis: 'Interactive ROI calculator increases engagement and pre-qualifies high-intent leads',
        changeTested: 'Added interactive calculator showing potential cost savings with sliders (team size, current spend, inefficiency %)',
        metric: 'Time on Page + Lead Quality',
        baseline: '2:14 time, 39% SQL',
        variant: '4:38 time, 48% SQL',
        lift: '+106% time, +23% SQL',
        result: 'win',
        confidence: '89%',
        learnings: 'ROI calculator doubled time-on-page (2:14 → 4:38) and lifted SQL rate +23% (39% → 48%). 52% of visitors engaged with calculator. High-intent signal: users who played with sliders = 2.3x more likely to convert. Capture calculation inputs to personalize follow-up. Deploy to Finance service landing pages = +85 high-quality SQLs/month.'
      },
      {
        hypothesis: 'Case study carousel showcasing results increases credibility and conversion',
        changeTested: 'Added carousel with 5 case studies showing client results (before/after metrics, testimonial quote, industry)',
        metric: 'Landing Page CVR',
        baseline: '14.5%',
        variant: '16.9%',
        lift: '+16.6%',
        result: 'win',
        confidence: '93%',
        learnings: 'Case study carousel lifted CVR +16.6%. Best performers: Specific metrics ("+₹2.8Cr revenue in 6 months") > vague claims ("increased sales"). Industry-matched case studies converted 2.1x better. 44% clicked through to full case study. Deploy globally + create 15 more case studies across verticals = +178 leads/month.'
      },
      {
        hypothesis: 'Embedded calendar for instant meeting booking reduces friction and speeds sales cycle',
        changeTested: 'Replaced "Request Demo" form with embedded Calendly showing real-time availability',
        metric: 'Demo Booking Rate + Show-Up Rate',
        baseline: '14.8% booking, 68% show',
        variant: '13.2% booking, 58% show',
        lift: '-10.8% booking, -14.7% show',
        result: 'loss',
        confidence: '87%',
        learnings: 'Instant calendar booking backfired: -10.8% bookings, -14.7% show-up rate. B2B buyers felt pressured into commitment too early (not qualified yet). Lower-intent leads booked exploratory calls = waste of sales time. Killed test. Learning: For complex B2B sales, friction = qualification. Keep form to pre-qualify, then offer calendar in confirmation email.'
      },
      {
        hypothesis: 'Multi-step form reduces perceived effort and increases completion vs single-page form',
        changeTested: 'Split 4-field form into 2 steps with progress bar (Step 1: name/email, Step 2: company/phone)',
        metric: 'Form Completion Rate',
        baseline: '15.0%',
        variant: '13.6%',
        lift: '-9.3%',
        result: 'loss',
        confidence: '88%',
        learnings: 'Multi-step form hurt completion -9.3%. Hypothesis: B2B buyers saw 2 steps as "more work" despite same total fields. 22% abandoned after Step 1 (gave email but didn\'t complete). Learning: For short B2B forms (<6 fields), single page performs better. Multi-step only works for long forms (8+ fields) where chunking genuinely reduces cognitive load.'
      },
      {
        hypothesis: 'Testing personalized LinkedIn InMail copy (pain-focused) vs generic pitch improves response rate',
        changeTested: 'A/B tested InMail copy: "Struggling with X?" (pain-first) vs "We help companies achieve Y" (benefit-first)',
        metric: 'InMail Open Rate + Response Rate',
        baseline: '42% open, 8.4% response',
        variant: '48% open, 11.2% response',
        lift: '+14.3% open, +33.3% response',
        result: 'win',
        confidence: '92%',
        learnings: 'Pain-focused messaging crushed generic pitch: +14.3% opens, +33.3% responses. Opening with specific pain point ("Manual finance processes costing 15+ hours/week?") resonated 3x better than company-first intro. Personalized first line with prospect company name lifted response another +8%. Deploy pain-first framework to all cold outreach = +68 qualified conversations/month.'
      },
      {
        hypothesis: 'Adding pre-qualification questions to form improves lead quality (SQL rate) despite lower volume',
        changeTested: 'Added 2 qualifying questions: "Company size?" + "Current monthly marketing spend?" with dropdown options',
        metric: 'Form Completion + SQL Rate',
        baseline: '16.5% completion, 38% SQL',
        variant: '15.2% completion, 52% SQL',
        lift: '-7.9% completion, +36.8% SQL',
        result: 'win',
        confidence: '90%',
        learnings: 'Pre-qualification questions traded volume for intent: -7.9% form completion but +36.8% conversion rate (38% → 52%). Fewer leads but dramatically better fit. Sales team close rate improved 38% → 54%. Net result: +18% more closed deals despite -8% lead volume. Intent-based filtering works for B2B. Deploy selectively on high-touch service pages where sales time is expensive.'
      }
    ]
  };

  const experimentData = isEcommerce ? ecommerceExperiments : leadgenExperiments;

  // Custom dot for timeline chart
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    let fill = '#204CC7'; // default brand for running
    if (payload.result === 'win') fill = '#10b981'; // green for wins
    if (payload.result === 'loss') fill = '#ef4444'; // red for losses
    
    return (
      <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">{data.experiment}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Baseline:</span>
              <span className="font-semibold text-gray-900">{data.baseline}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Variant:</span>
              <span className="font-semibold text-gray-900">{data.variant}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${
                data.result === 'win' ? 'text-green-600' : 
                data.result === 'loss' ? 'text-red-600' : 
                'text-brand'
              }`}>
                {data.status === 'running' ? 'Running' : data.result === 'win' ? 'Win' : 'Loss'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Active Experiments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-gray-900">{experimentData.active}</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Experiments</div>
          <div className="text-xs text-gray-600 mt-1">Currently running</div>
        </div>

        {/* Wins */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-green-600">{experimentData.wins}</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wins</div>
          <div className="text-xs text-gray-600 mt-1">Positive results</div>
        </div>

        {/* Losses */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-red-600">{experimentData.losses}</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Losses</div>
          <div className="text-xs text-gray-600 mt-1">Negative results</div>
        </div>
      </div>

      {/* Action & Recommendation Panel */}
      <div className="mb-6">
        <ActionPanel businessModel={businessModel} moduleType="experiments" />
      </div>

      {/* Experiment Timeline Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Experiment Timeline</h3>
          </div>
          <p className="text-sm text-gray-500">
            {isEcommerce 
              ? 'A/B test performance over time - baseline vs variant conversion rates' 
              : 'A/B test performance over time - baseline vs variant lead conversion rates'
            }
          </p>
        </div>

        {/* Timeline Chart */}
        <div className="w-full" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height={320} minHeight={320} minWidth={0}>
            <LineChart 
              data={experimentData.timeline} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#94a3b8" 
                strokeWidth={2}
                name="Baseline"
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="variant" 
                stroke="#204CC7" 
                strokeWidth={2.5}
                name="Variant"
                dot={<CustomDot />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Win (Variant Better)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Loss (Variant Worse)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-brand rounded-full"></div>
            <span className="text-xs text-gray-600">Running (In Progress)</span>
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
              <span className="text-xs text-gray-500">Critical learnings from experimentation program</span>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[280px]">
            {isEcommerce ? (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Product page videos = +18.8% CVR (biggest win this quarter):</strong> 30s demo video showing product in use crushed static images. 42% watched &gt;15s. Rollout to all 2,400 SKUs = +₹12.4L/month revenue. Investment: ₹8K/video × 2,400 = ₹1.92Cr (15.6-month payback). Unfair advantage: competitors still using photos.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Checkout field reduction (12→6 fields) = +22.4% completion rate:</strong> Less is more. Removed optional fields (company, alternate phone, GST made optional). Checkout time: 45s → 28s. Deploy globally = +₹8.2L/month. Learning: Every extra field costs 3-5% drop-off. Ruthlessly cut friction.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Exit-intent discount popup = -12.9% CVR (killed immediately):</strong> Aggressive 10% discount popup increased bounce +14.3% and hurt CVR -12.9%. Users found it intrusive and spammy. Learning: Exit intent works for email capture, NOT direct discounts. Focus on cart abandonment emails instead.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-brand-light border-brand/20 text-brand">
                  <Target className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Experimentation velocity 1.3 tests/month vs 3.0 industry leaders:</strong> Testing too slow to compound learnings. Need to 2x testing cadence to 3 experiments/month. Top performers run 36+ tests/year = 10x learning speed. Recommendation: Hire dedicated CRO specialist, implement testing framework.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <MinusCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Free shipping threshold test inconclusive - retest with variation:</strong> ₹1,299 threshold increased AOV +6.2% but hurt CVR -3.3%. Net revenue +1.2% not statistically significant (67% confidence). Learning: Test middle ground at ₹999 or personalize by customer segment (new vs returning).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>CEO video testimonial = +20.4% CVR (biggest B2B win):</strong> Authentic executive story crushed polished marketing video by 3.2x engagement. 68% watched &gt;30s. B2B buyers invest time in real stories. Deploy to all 8 landing pages = +285 leads/month at lower CPL. Unfair advantage: Most competitors still use generic stock footage instead of authentic customer voices.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Form simplification (8→4 fields) = +18.8% completion without quality loss:</strong> Every removed field = +3-4% completion lift. Minimal SQL impact (39% → 38%). Deploy across all forms = +188 leads/month. Use progressive profiling in nurture emails to capture missing data post-conversion. Quality vs Quantity balance mastered.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>ROI calculator widget = +106% time-on-page + +23% SQL rate (engagement goldmine):</strong> Interactive calculator signals high intent. Users who engaged with sliders = 2.3x more likely to convert into qualified SQLs. 52% engagement rate. Capture calculation inputs to hyper-personalize sales follow-up. Deploy to Finance landing pages = +85 high-quality SQLs/month.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Exit-intent popups hurt B2B conversions -10.4% (aggressive = desperate):</strong> B2B buyers research carefully over days/weeks - interruption broke trust and increased bounce +10.5%. Killed immediately. Learning: B2B ≠ B2C tactics. Focus on retargeting campaigns, multi-touch nurture sequences, and building long-term relationships instead of desperate popups.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-purple-50 border-purple-200 text-purple-800">
                  <Target className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Pre-qualification questions = -7.9% volume but +36.8% conversion rate (intent &gt; quantity):</strong> Added "Company size?" + "Spend?" dropdowns. Fewer leads but dramatically better fit. Sales close rate improved 38% → 54%. Net result: +18% more closed deals despite -8% lead volume. B2B insight: Sales time is expensive - intent-based filtering always wins over raw volume.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Experiment Breakdown - Hidden for now, can be revived later */}
      <div className="hidden bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-hover rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Experiment Breakdown</h3>
          </div>
          <p className="text-sm text-gray-500">Detailed results and learnings from all experiments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Hypothesis</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Change Tested</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Metric</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Result</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Learnings</th>
              </tr>
            </thead>
            <tbody>
              {experimentData.experiments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((exp, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-xs text-gray-900 font-medium leading-snug">{exp.hypothesis}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs text-gray-700 leading-snug">{exp.changeTested}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs font-semibold text-gray-900">{exp.metric}</p>
                    <p className="text-xs text-gray-600 mt-1">Baseline: {exp.baseline}</p>
                    <p className="text-xs text-gray-600">Variant: {exp.variant}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      exp.result === 'win' ? 'text-green-600' : 
                      exp.result === 'loss' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {exp.lift}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {exp.result === 'win' && (
                        <>
                          <div className="w-16 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                            Win
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </>
                      )}
                      {exp.result === 'loss' && (
                        <>
                          <div className="w-16 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
                            Loss
                          </div>
                          <XCircle className="w-4 h-4 text-red-600" />
                        </>
                      )}
                      {exp.result === 'inconclusive' && (
                        <>
                          <div className="w-20 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                            Inconclusive
                          </div>
                          <MinusCircle className="w-4 h-4 text-gray-600" />
                        </>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{exp.confidence} conf.</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs text-gray-700 leading-relaxed">{exp.learnings}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span>Previous</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{Math.ceil(experimentData.experiments.length / itemsPerPage)}</span>
            </span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, experimentData.experiments.length)}</span>-<span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, experimentData.experiments.length)}</span> of <span className="font-semibold text-gray-900">{experimentData.experiments.length}</span> experiments
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * itemsPerPage >= experimentData.experiments.length}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <span>Next</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
