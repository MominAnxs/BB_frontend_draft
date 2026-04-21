import { Zap, PauseCircle, RefreshCw, TrendingUp, AlertCircle, Copy, Layers } from 'lucide-react';

interface ActionPanelProps {
  businessModel: 'ecommerce' | 'leadgen';
  moduleType?: 'sales' | 'channels' | 'campaigns' | 'creatives' | 'funnel' | 'experiments';
  selectedChannel?: string;
}

export function ActionPanel({ businessModel, moduleType = 'sales', selectedChannel = 'all' }: ActionPanelProps) {
  // Recommendations for Campaigns module
  const campaignRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'pause',
          icon: PauseCircle,
          title: 'Pause Display Remarketing Immediately - Burning ₹10K',
          description: 'Campaign at 2.3x ROAS (27% below target) with 5.8 frequency causing ad fatigue. Hemorrhaging budget with declining performance. Pause today and reallocate ₹10K to high-performing Shopping campaigns.',
          impact: 'Save ₹10K/month wasted spend, add +₹33K revenue via reallocation',
          confidence: 'Very High (96%)',
          timeline: 'Today',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'duplicate',
          icon: Copy,
          title: 'Duplicate 3.3x ROAS Winners - Clone Success Formula',
          description: 'Create variants of your 4 peak performers (Shopping High Intent, DPA Retargeting, Smart Shopping, PLA Brand). Test new audiences, creative angles, and product sets using proven campaign structures. Winners deserve expansion.',
          impact: '+₹85K-120K revenue/month from duplicated campaigns at similar efficiency',
          confidence: 'High (88%)',
          timeline: '3-5 days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'consolidate',
          icon: Layers,
          title: 'Consolidate Fragmented Shopping Campaigns - Simplify & Scale',
          description: 'Merge "Smart Shopping" and "PLA Brand Defense" into main "High Intent Keywords" campaign. Both have identical 3.3x ROAS. Consolidation improves budget flexibility, reduces management overhead, and leverages Google\'s ML across larger dataset.',
          impact: 'Reduce campaign count from 9→7, gain +₹22K efficiency via improved ML signals',
          confidence: 'High (85%)',
          timeline: '1 week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'optimize',
          icon: RefreshCw,
          title: 'Fix Frequency Overload - Instagram Reels & Display',
          description: 'Instagram Reels at 4.2x frequency and Display at 5.8x causing creative burnout. Expand audience targeting by 30-40%, refresh creatives weekly, or reduce daily budgets by 25%. Keep frequency under 3.5x for healthy performance.',
          impact: 'Recover +12-15% ROAS improvement, extend campaign lifespan 2-3 months',
          confidence: 'High (87%)',
          timeline: '3-5 days',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale Top 3 Campaigns by ₹75K - Capture Market Share',
          description: 'Increase budgets: High Intent Keywords +₹40K, DPA Retargeting +₹25K, Advantage+ Shopping +₹10K. All showing green status with runway to 2x before saturation. Use saved budget from paused Display campaign.',
          impact: '+₹2.48L revenue/month at 3.3x ROAS, dominate peak shopping season',
          confidence: 'Very High (91%)',
          timeline: 'Immediate',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ]
    : [
        {
          type: 'pause',
          icon: PauseCircle,
          title: 'Pause Bottom 3 Losers Immediately - Stop Bleeding ₹74K',
          description: 'Video Awareness (₹750 CPL), Display Retargeting (₹643 CPL), and Meta Founders (₹552 CPL) delivering junk leads at 2.3x target cost. Pause all 3 today and shift ₹74K/month to LinkedIn winners under ₹350 CPL.',
          impact: 'Save ₹74K/month wasted spend, add +186 quality leads via reallocation',
          confidence: 'Very High (97%)',
          timeline: 'Today',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'duplicate',
          icon: Copy,
          title: 'Duplicate LinkedIn Winners - Clone Winning Formula',
          description: 'Create variants of "Thought Leadership" (₹306 CPL) and "CFO Targeting" (₹319 CPL). Test new decision-maker personas (VP Finance, Head of Operations), content angles (case studies vs thought leadership), and LinkedIn audience expansion. Proven winners deserve expansion.',
          impact: '+120-150 leads/month at ₹310-340 CPL',
          confidence: 'High (86%)',
          timeline: '3-5 days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'consolidate',
          icon: Layers,
          title: 'Consolidate 3 LinkedIn Campaigns - Simplify & Learn Faster',
          description: 'Merge "Thought Leadership", "CFO Targeting", and "Document Gated" into 2 streamlined campaigns: "Decision Maker Prospecting" (₹110K budget) + "InMail Outreach" (₹38K). Similar CPL and targeting - consolidation accelerates audience learning and reduces management.',
          impact: 'Reduce 8→6 campaigns, improve targeting efficiency +8-12%',
          confidence: 'High (84%)',
          timeline: '1 week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'optimize',
          icon: RefreshCw,
          title: 'Fix Ad Fatigue - Display & Meta Hitting Frequency Ceiling',
          description: 'Display Retargeting (6.2x) and Meta Founders (4.8x) burning out B2B decision makers. B2B best practice: <3.0x frequency. Expand audiences to 200K+ or reduce budgets 40%. Refresh creatives with new value props weekly.',
          impact: 'Recover ₹18K/month on rescued campaigns, reduce CPL 25-30%',
          confidence: 'High (88%)',
          timeline: '3-5 days',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale LinkedIn Winners by ₹90K - Dominate B2B Finance',
          description: 'Increase LinkedIn budgets using saved ₹74K from paused losers + ₹16K fresh: Thought Leadership +₹50K, CFO Targeting +₹25K, InMail Outreach +₹15K. All green status with 2.5x headroom before saturation.',
          impact: '+282 B2B leads/month at ₹310-340 CPL',
          confidence: 'Very High (92%)',
          timeline: 'Immediate',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ];

  // Recommendations for Channels module
  const channelRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale Google Shopping - Your Revenue Engine',
          description: 'Google Shopping delivers 3.3x ROAS (highest efficiency) with 43% revenue contribution. Increase budget by ₹60K/month on "High Intent Keywords" and "Smart Shopping" campaigns. Both showing 15%+ growth with significant headroom before saturation.',
          impact: '+₹1.98L revenue/month at current ROAS, strengthen market position',
          confidence: 'Very High (93%)',
          timeline: 'Immediate',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          channel: 'Google Ads'
        },
        {
          type: 'optimize',
          icon: RefreshCw,
          title: 'Fix Google Search Underperformance - ROAS Recovery',
          description: 'Google Search declining -5.2% with below-target 2.9x ROAS. Shift ₹18K from "Generic Product Terms" (2.7x ROAS) to "Brand Keywords" (3.1x ROAS). Kill "Display Remarketing" (2.3x ROAS, -12% trend) immediately - bleeding ₹10K/month.',
          impact: '+₹31K revenue/month, improve ROAS to 3.1x, save ₹10K wasted spend',
          confidence: 'High (89%)',
          timeline: 'This week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20',
          channel: 'Google Ads'
        },
        {
          type: 'enhance',
          icon: Zap,
          title: 'Supercharge Meta DPA - 3x Retargeting Opportunity',
          description: 'Meta "Dynamic Product Ads" performing at 3.3x ROAS with 18% revenue share. Increase retargeting budget by ₹35K/month targeting 30-day site visitors and cart abandoners. Instagram Reels showing fatigue (2.8% trend) - shift ₹12K to proven DPA.',
          impact: '+₹1.16L revenue/month, capture lost conversions, maximize Meta efficiency',
          confidence: 'High (87%)',
          timeline: '3-5 days',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          channel: 'Meta Ads'
        },
        {
          type: 'diversify',
          icon: AlertCircle,
          title: 'Reduce Channel Concentration Risk - Strategic Diversification',
          description: 'Critical: 81% revenue from Google+Meta creates platform dependency. Test ₹25K on Amazon Ads (if applicable) or Microsoft Shopping Ads. Protect against algorithm changes, CPM inflation, or policy shifts that could crush revenue overnight.',
          impact: 'Build resilience, discover 15-20% efficiency gains in untapped channels',
          confidence: 'Medium (76%)',
          timeline: '2 weeks',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          channel: 'all'
        },
        {
          type: 'test',
          icon: TrendingUp,
          title: 'A/B Test Product Feed Optimization - Hidden ROAS Gains',
          description: 'Audit Google Shopping feed quality. Test enhanced titles (brand + product + benefit), high-res images, promotional badges, and dynamic pricing. Feed optimization typically lifts CTR 18-25% and conversion rate 12-15% without extra spend.',
          impact: '+₹68K revenue/month from existing traffic, improve Quality Score',
          confidence: 'High (84%)',
          timeline: '1 week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20',
          channel: 'Google Ads'
        }
      ]
    : [
        {
          type: 'reallocate',
          icon: RefreshCw,
          title: 'Reallocate Budget from Meta to LinkedIn',
          description: 'Shift ₹25K/month from underperforming Meta campaigns (₹478 CPL, -22% trend) to high-performing LinkedIn "Thought Leadership" campaign (₹323 CPL, +18% growth)',
          impact: '+52 leads/month, -15% blended CPL',
          confidence: 'Very High (94%)',
          timeline: 'Immediate',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20',
          channel: 'Meta Ads'
        },
        {
          type: 'pause',
          icon: PauseCircle,
          title: 'Pause Google Display & YouTube Campaigns',
          description: 'Stop "Display - Competitor Conquest" (-12.8% trend) and "YouTube - Brand Awareness" (-15.5% trend). Combined ₹32K/month bleeding budget with declining ROMI',
          impact: 'Save ₹32K/month, reallocate to proven channels',
          confidence: 'High (91%)',
          timeline: 'This week',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          channel: 'Google Ads'
        },
        {
          type: 'diversify',
          icon: AlertCircle,
          title: 'Mitigate Over-Dependence Risk on LinkedIn',
          description: 'Critical: 58% of leads from single channel creates platform vulnerability. Launch test budget on Quora Ads (₹15K) and Reddit Ads (₹12K) targeting B2B finance decision makers',
          impact: 'Reduce LinkedIn dependency to <45%, discover new efficient channels',
          confidence: 'Medium (78%)',
          timeline: '1-2 weeks',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          channel: 'LinkedIn Ads'
        },
        {
          type: 'optimize',
          icon: TrendingUp,
          title: 'Double Down on LinkedIn "CFO Targeting" Campaign',
          description: 'Increase budget by ₹20K/month on "Lead Gen Form - CFO Targeting" (₹322 CPL, 37% SQL rate). Campaign has consistent performance with room to scale 2x before saturation',
          impact: '+62 leads/month at target CPL',
          confidence: 'High (88%)',
          timeline: '3-5 days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          channel: 'LinkedIn Ads'
        },
        {
          type: 'test',
          icon: Zap,
          title: 'Fix Google Ads CTR & Targeting Issue',
          description: 'Google Ads CTR dropped from 2.8% to 1.6% and CPM rising. Add negative keywords, tighten audience targeting on "Finance Keywords" campaign, and refresh ad creatives',
          impact: 'Recover +25 leads/month without increasing spend, improve CTR by 15%',
          confidence: 'High (86%)',
          timeline: '1 week',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          channel: 'Google Ads'
        }
      ];

  // Recommendations for Sales/Leads module
  const salesRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale Top Performing Campaign',
          description: 'Increase budget on "Summer Sale - UGC" campaign by 40%',
          impact: '+₹2.8L projected revenue/month',
          confidence: 'High (89%)',
          timeline: '2-3 days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'pause',
          icon: PauseCircle,
          title: 'Pause 3 Low-Performing Campaigns',
          description: 'Stop campaigns with ROAS < 1.5x: "Generic Targeting - March", "Broad Interest - April", "Lookalike Test 3"',
          impact: 'Save ₹52K/month immediately',
          confidence: 'Very High (96%)',
          timeline: 'Today',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        },
        {
          type: 'refresh',
          icon: RefreshCw,
          title: 'Creative Refresh Required',
          description: 'Launch 5 new creative variations with UGC + testimonials',
          impact: 'Expected +35% CTR, -22% CAC',
          confidence: 'High (84%)',
          timeline: '5-7 days',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'reallocate',
          icon: Zap,
          title: 'Budget Reallocation - Meta to Google',
          description: 'Shift ₹45K from underperforming Meta campaigns to Google Shopping',
          impact: '+₹1.2L additional revenue potential',
          confidence: 'Medium (72%)',
          timeline: '3-5 days',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ]
    : [
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale LinkedIn Campaign',
          description: 'Increase budget on "B2B SaaS - Decision Makers" by 50%',
          impact: '+180 leads/month, -12% CPL',
          confidence: 'High (91%)',
          timeline: '2-3 days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'pause',
          icon: PauseCircle,
          title: 'Pause Facebook Lead Gen',
          description: 'Stop "Broad Interest - Facebook" campaign (CPL ₹890, quality score 2.1/10)',
          impact: 'Save ₹38K/month, reallocate to LinkedIn',
          confidence: 'Very High (94%)',
          timeline: 'Today',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        },
        {
          type: 'refresh',
          icon: RefreshCw,
          title: 'Landing Page Optimization',
          description: 'A/B test new landing page with video testimonials + trust badges',
          impact: 'Expected +28% conversion rate',
          confidence: 'High (82%)',
          timeline: '5-7 days',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'warning',
          icon: AlertCircle,
          title: 'CPL Efficiency Alert',
          description: 'Google Ads CPL improved but CTR dropped 22%. Review targeting criteria and ad relevance.',
          impact: 'Save ₹65K/month by improving targeting, reduce CPL by 22%',
          confidence: 'High (88%)',
          timeline: '1-2 days',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      ];

  // Recommendations for Creatives module
  const creativeRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'replace',
          icon: AlertCircle,
          title: 'Replace 5 Fatigued/Dead Creatives Immediately - Bleeding ₹1.52L',
          description: 'CR-006 through CR-010 all past 35+ days delivering 2.2x avg ROAS with 4.2-7.8 frequency = ad blindness. Replace with fresh Problem-Solution + Before-After video angles. You\'re losing ₹52K/month vs target performance.',
          impact: 'Recover +₹52K revenue/month, lift ROAS from 2.2x → 3.4x',
          confidence: 'Very High (94%)',
          timeline: 'Today',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale Top 2 Video Winners - Problem-Solution & Before-After',
          description: 'CR-001 (3.8x ROAS) and CR-002 (3.6x ROAS) crushing it with video storytelling. Increase spend +₹45K on these angles, create 3 variants each testing different hooks, voiceovers, and opening frames. Winners deserve aggressive scaling.',
          impact: '+₹1.62L revenue/month from scaled winners at 3.7x ROAS',
          confidence: 'Very High (91%)',
          timeline: 'Immediate',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'produce',
          icon: Zap,
          title: 'Trigger Production: 8 New Video Creatives (Week 5-6 Refresh)',
          description: 'Data shows creative cliff at Week 5 (ROAS drops 3.2x → 2.9x). You need 8 fresh videos ready for 28-35 day refresh cycle. Priority angles: Problem-Solution (4 variants), Before-After (2 variants), UGC Testimonial (2 variants). Start production NOW.',
          impact: 'Maintain 3.5x ROAS, prevent ₹78K monthly revenue decay from fatigue',
          confidence: 'High (89%)',
          timeline: '5-7 days',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        },
        {
          type: 'optimize',
          icon: RefreshCw,
          title: 'Fix Image Creative Underperformance - 28% Gap vs Video',
          description: 'Image creatives averaging 2.8x ROAS vs video\'s 3.6x. Either shift ₹68K from underperforming images to video formats, OR upgrade image quality with motion graphics, carousel formats, and stronger CTAs. Static images losing attention war.',
          impact: '+₹23K revenue/month via format optimization',
          confidence: 'High (86%)',
          timeline: '1 week',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          type: 'automate',
          icon: Copy,
          title: 'Set 35-Day Auto-Pause Rules - Prevent Future Fatigue',
          description: 'Install automation: Any creative past 35 days with <3.0x ROAS or >4.5 frequency = auto-pause + Slack alert. Stop manual monitoring - let data protect your margins. Creative fatigue is predictable = automate the kill switch.',
          impact: 'Save 6 hours/week, prevent ₹40K monthly fatigue losses',
          confidence: 'High (88%)',
          timeline: '2-3 days',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        }
      ]
    : [
        {
          type: 'replace',
          icon: AlertCircle,
          title: 'Replace 5 Fatigued Creatives Immediately - Bleeding ₹1.40L at ₹492 CPL',
          description: 'CR-006 through CR-010 all past 35+ days delivering ₹492 avg CPL with 4.2-7.1 frequency = B2B decision-maker burnout. Replace with fresh Thought Leadership + Case Study angles. You\'re overpaying ₹172/lead vs ₹320 target (55% premium waste).',
          impact: 'Save ₹48K/month wasted spend, drop CPL from ₹492 → ₹310',
          confidence: 'Very High (95%)',
          timeline: 'Today',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale "Thought Leadership" Video Creative - ₹285 CPL Winner',
          description: 'CR-001 crushing with ₹285 CPL (19% better than avg) delivering 298 leads. Increase spend +₹55K/month on this angle, create 3 variants testing different executive speakers, value propositions, and LinkedIn placements. Professional storytelling wins B2B.',
          impact: '+180 leads/month at ₹285-295 CPL efficiency',
          confidence: 'Very High (92%)',
          timeline: '3-5 Days',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'produce',
          icon: Zap,
          title: 'Trigger B2B Creative Production - 6 Educational Hook Videos',
          description: 'Data proves educational hooks crush promotional (₹303 vs ₹465 CPL). You need 6 fresh videos ready for Week 5-6 refresh: Thought Leadership (2), Case Study Results (2), ROI Calculator (1), Problem-Agitation (1). B2B buyers want insights, not sales pitches.',
          impact: 'Maintain ₹310 CPL efficiency, prevent ₹65K/month fatigue decay',
          confidence: 'High (88%)',
          timeline: '1-2 Weeks',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        },
        {
          type: 'automate',
          icon: Copy,
          title: 'Set 35-Day Auto-Pause Rules - B2B Fatigue Cliff Protection',
          description: 'Install LinkedIn/B2B specific automation: Any creative past 35 days with >₹400 CPL or >4.0 frequency = auto-pause + alert. Data shows 12% CPL jump at Week 5 (₹340→₹380). B2B audiences fatigue faster than B2C - automate protection.',
          impact: 'Save 5 hours/week monitoring, prevent ₹38K monthly fatigue losses',
          confidence: 'High (90%)',
          timeline: 'This Week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        }
      ];

  // Recommendations for Funnel module
  const funnelRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'fix',
          icon: AlertCircle,
          title: 'Fix Cart Abandonment - 40% Drop-off = ₹8.2L Lost Revenue',
          description: 'Cart abandonment at 40% vs 25% benchmark (512 carts lost/month). Deploy automated 3-email cart recovery sequence within 1hr, 6hrs, 24hrs. Add exit-intent popups with 10% discount, show shipping cost upfront, enable guest checkout, add trust badges. Cart recovery typically saves 15-20% of abandons.',
          impact: '+₹1.6L-2.4L revenue/month from recovered carts (15-20% recovery rate)',
          confidence: 'Very High (93%)',
          timeline: '3-5 Days',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'warning',
          icon: AlertCircle,
          title: 'Reduce Checkout Friction - 67% Abandonment (512 Lost Purchases)',
          description: 'Checkout abandonment 67% vs 55% benchmark = ₹5.2L monthly revenue leak. Remove mandatory account creation (enable guest checkout), reduce form fields from 12→6, show progress indicator, add multiple payment options (UPI/wallets/BNPL), display security badges, eliminate surprise shipping costs. Every removed field = +2-3% CVR lift.',
          impact: '+₹2.8L-4.2L revenue/month from checkout optimization',
          confidence: 'Very High (91%)',
          timeline: '1 Week',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        },
        {
          type: 'optimize',
          icon: RefreshCw,
          title: 'Fix Product Page Friction - ATC Rate 2.8% vs 3.5% Benchmark',
          description: 'Add-to-Cart rate 20% below standard = 320 lost carts/month. Optimize: A/B test hero images (show product in use), add video demos, display customer reviews above fold, implement size guides, add \"Customers Also Bought\" recommendations, optimize for mobile (58% of traffic), improve page speed <2s. Product page is your conversion engine.',
          impact: '+320 carts/month, unlock +₹2.2L revenue potential',
          confidence: 'High (88%)',
          timeline: '1-2 Weeks',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          type: 'mismatch',
          icon: Zap,
          title: 'Creative-Landing Disconnect - Ad Shows Fast Shipping, LP Hides It',
          description: 'Facebook/Instagram ads promise \"Free 2-Day Shipping\" but product pages bury shipping info in FAQ section. Message mismatch causing 18% bounce spike on paid traffic. Make shipping promise prominent: hero badge, sticky bar, checkout preview widget. Visual + message consistency = trust = conversion.',
          impact: '+142 purchases/month from message-match, reduce bounce rate -18%',
          confidence: 'High (86%)',
          timeline: 'This Week',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'test',
          icon: TrendingUp,
          title: 'Payment Trust Signals - Add Buy Now Pay Later & Trust Badges',
          description: 'Checkout trust deficit killing conversions. Implement: Razorpay/Stripe BNPL options (Afterpay, Klarna), display SSL security seal, add \"Safe Checkout Guaranteed\" badge, show accepted payment logos prominently, enable Apple Pay/Google Pay one-click. Payment flexibility = +25-35% checkout CVR improvement.',
          impact: '+₹1.8L revenue/month from payment optimization & trust building',
          confidence: 'High (84%)',
          timeline: '5-7 Days',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ]
    : [
        {
          type: 'fix',
          icon: AlertCircle,
          title: 'Fix Landing Page CVR - 27% Below Benchmark (Largest Leak)',
          description: 'Landing page converting 13.5% vs 18.5% industry benchmark = losing 622 leads/month. Implement: A/B test hero section, reduce form fields from 8→4, add trust badges, optimize page speed <2s, add video testimonial above fold. Quick wins available.',
          impact: '+622 leads/month (+218 qualified), unlock ₹1.93L pipeline value',
          confidence: 'Very High (94%)',
          timeline: 'This Week',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'warning',
          icon: AlertCircle,
          title: 'Offer Mismatch Alert - Ad Promise vs Landing Page Disconnect',
          description: 'Critical: LinkedIn ads promise "Free ROI Audit" but landing page headline says "Schedule a Consultation". Message mismatch causing 18% bounce rate spike. Align LP headline, form CTA, and confirmation copy to match ad promise exactly. Broken trust = lost conversions.',
          impact: 'Recover +12% CVR improvement, add +187 leads/month from trust alignment',
          confidence: 'Very High (91%)',
          timeline: 'Today',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        },
        {
          type: 'qualification',
          icon: TrendingUp,
          title: 'Fix Qualification Crisis - 65% Lead Drop at Qualification Stage',
          description: 'Only 35% of leads qualify vs 45% benchmark = 1,092 rejected leads costing ₹3.38L wasted ad spend. Add pre-qualification questions to landing page (company size, budget, timeline), tighten LinkedIn targeting to decision-makers only, implement lead scoring automation.',
          impact: 'Save ₹3.38L/month on junk leads, improve SQL rate 35%→45%',
          confidence: 'High (88%)',
          timeline: '1-2 Weeks',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        },
        {
          type: 'mismatch',
          icon: Zap,
          title: 'Creative-Landing Disconnect - Video Talks ROI, LP Shows Generic Form',
          description: 'Top LinkedIn video ad showcases "ROI Calculator Tool" but landing page is generic "Contact Us" form with no calculator mention. Visual and messaging disconnect causing 23% drop-off. Create dedicated LP matching creative promise: embed interactive ROI calculator, show sample results, maintain visual consistency.',
          impact: '+142 leads/month from message-match improvement, lift CVR +9%',
          confidence: 'High (85%)',
          timeline: '5-7 Days',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'sales',
          icon: RefreshCw,
          title: 'Improve Sales Close Rate - 29.9% vs 38% Benchmark',
          description: 'Qualified → Converted at 21% below industry standard = losing 48 deals/month. Implement: automated lead nurturing sequences, reduce sales cycle from 45→30 days, create battle cards for objection handling, add customer proof points to sales deck, set 48hr follow-up SLA.',
          impact: '+48 conversions/month, recover ₹4.2L ARR pipeline leakage',
          confidence: 'High (86%)',
          timeline: '2 Weeks',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      ];

  // Recommendations for Experiments module
  const experimentsRecommendations = businessModel === 'ecommerce'
    ? [
        {
          type: 'rollout',
          icon: TrendingUp,
          title: 'Roll Out Winner - Product Page Videos to All 2,400 SKUs',
          description: 'Product video test crushed it with +18.8% CVR lift (42% watched >15s). Deploy 30s demo videos to all SKUs showing product in use. Investment: ₹8K/video × 2,400 = ₹1.92Cr. Expected return: +₹12.4L/month revenue = 15.6-month payback. Unfair advantage: 87% of competitors still using static photos only.',
          impact: '+₹12.4L revenue/month, 15.6-month ROI payback, market differentiation',
          confidence: 'Very High (95%)',
          timeline: '6-8 Weeks',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'deploy',
          icon: Zap,
          title: 'Deploy Checkout Simplification Globally - +22.4% Completion',
          description: 'Checkout field reduction (12→6 fields) delivered +22.4% completion rate. Remove: company name, alternate phone, landmark, make GST optional. Checkout time reduced 45s → 28s. Deploy to all checkout flows immediately. Every extra field costs 3-5% drop-off - ruthlessly cut friction.',
          impact: '+₹8.2L revenue/month from improved checkout completion',
          confidence: 'Very High (98%)',
          timeline: '2-3 Days',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'kill',
          icon: AlertCircle,
          title: 'Kill Exit-Intent Popup Immediately - Hurting CVR -12.9%',
          description: 'Exit-intent discount popup backfired badly: increased bounce +14.3%, hurt CVR -12.9%. Users found 10% discount offer intrusive and spammy. Kill this test immediately and remove from all pages. Learning: Exit intent works for email capture, NOT aggressive discounts. Focus on cart abandonment email flows instead.',
          impact: 'Recover +12.9% CVR, reduce bounce rate -14.3%, improve brand perception',
          confidence: 'Very High (94%)',
          timeline: 'Today',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'retest',
          icon: RefreshCw,
          title: 'Retest Free Shipping Threshold with ₹999 Variation',
          description: 'Original test (₹799 vs ₹1,299) was inconclusive: AOV +6.2% but CVR -3.3%, net +1.2% not significant (67% confidence). Hypothesis: ₹1,299 too high, ₹799 too low. Retest with ₹999 as middle ground. Alternative: Personalize threshold by customer segment (new vs returning, mobile vs desktop).',
          impact: 'Unlock +₹2.8L revenue/month if sweet spot found (AOV + CVR balanced)',
          confidence: 'Medium (72%)',
          timeline: '2-3 Weeks',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Scale Testing Velocity to 3 Experiments/Month',
          description: 'Currently running 1.3 tests/month vs 3.0 for industry leaders = 10x learning gap over 3 years. Accelerate to 3 concurrent experiments/month minimum. Recommendation: Hire dedicated CRO specialist, implement testing framework (Optimizely/VWO), build 12-month test roadmap. Compounding learning = unfair advantage.',
          impact: '2.3x faster optimization, unlock ₹18-25L annual revenue gains from learnings',
          confidence: 'High (89%)',
          timeline: '1-2 Months',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ]
    : [
        {
          type: 'rollout',
          icon: TrendingUp,
          title: 'Roll Out CEO Testimonial Video to All Landing Pages',
          description: '45s CEO testimonial video lifted CVR +20.4%. Authentic executive story > polished marketing video. 68% of visitors watched >30s. Deploy to all 8 landing pages immediately. Expected impact: +285 B2B leads/month.',
          impact: '+285 leads/month, +20.4% CVR improvement',
          confidence: 'Very High (94%)',
          timeline: '1 Week',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        },
        {
          type: 'deploy',
          icon: Zap,
          title: 'Deploy Form Field Reduction Across All Forms',
          description: 'Form simplification (8→4 fields) delivered +18.8% completion without hurting lead quality (SQL 39% → 38%). Keep only: name, email, company, phone. Remove: budget, timeline, message. Deploy to all lead gen forms today.',
          impact: '+188 leads/month from improved form completion',
          confidence: 'Very High (96%)',
          timeline: 'Today',
          iconColor: 'text-brand',
          bgColor: 'bg-brand-light',
          borderColor: 'border-brand/20'
        },
        {
          type: 'kill',
          icon: AlertCircle,
          title: 'Kill Exit-Intent Popup - B2B Buyers Need Time',
          description: 'Exit-intent popup hurt B2B conversions -10.4%. B2B buyers research carefully over days/weeks - interruption breaks trust. Killed immediately. Learning: B2B ≠ B2C tactics. Focus on retargeting campaigns and email nurture sequences instead.',
          impact: 'Recover +10.4% CVR, improve brand trust perception',
          confidence: 'Very High (91%)',
          timeline: 'Done',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          type: 'scale',
          icon: TrendingUp,
          title: 'Accelerate Testing Cadence to 2-3 Tests/Month',
          description: 'Currently 0.8 tests/month vs 2.5 for top B2B performers. Need to 3x testing velocity. Build 12-month test roadmap prioritizing: social proof variations, CTA copy tests, form layout experiments, mobile optimization. B2B testing = slower but higher-value learnings.',
          impact: '3x faster optimization cycle, unlock +₹65L annual pipeline value',
          confidence: 'High (87%)',
          timeline: '1-2 Months',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      ];

  const recommendations = moduleType === 'campaigns' ? campaignRecommendations : moduleType === 'channels' ? channelRecommendations : moduleType === 'creatives' ? creativeRecommendations : moduleType === 'funnel' ? funnelRecommendations : moduleType === 'experiments' ? experimentsRecommendations : salesRecommendations;

  // Filter recommendations by selected channel (for channels module only)
  const filteredRecommendations = moduleType === 'channels' && selectedChannel && selectedChannel !== 'all'
    ? recommendations.filter((rec: any) => rec.channel === 'all' || rec.channel === selectedChannel)
    : recommendations;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Action & Recommendations
        </h3>
      </div>

      {/* Scrollable container - shows 3 items + teases 4th */}
      <div className="max-h-[580px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredRecommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className={`
                bg-gray-50/80 
                border border-gray-100
                rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-gray-100
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {rec.title}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      Priority #{index + 1}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Expected Impact
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rec.impact}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Confidence Level
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rec.confidence}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Timeline
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rec.timeline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <button className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-all duration-200 shadow-sm hover:shadow-md">
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Total Potential Impact
            </p>
            <p className="text-xs text-gray-600">
              {businessModel === 'ecommerce' 
                ? 'Est. +₹4L revenue/month, Save ₹52K wasted spend'
                : 'Est. +180 leads/month, Save ₹38K wasted spend'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}