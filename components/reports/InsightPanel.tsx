import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface InsightItem {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  icon: 'trend-up' | 'trend-down' | 'alert';
}

interface InsightPanelProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

export function InsightPanel({ businessModel, selectedChannel }: InsightPanelProps) {
  // E-commerce insights
  const ecommerceInsights: InsightItem[] = [
    {
      text: 'Meta driving 68% of revenue at 2.1x ROAS, outperforming Google Ads by 40%',
      type: 'positive',
      icon: 'trend-up'
    },
    {
      text: 'Spend increased 122% but revenue only grew 19% → efficiency dropped significantly',
      type: 'negative',
      icon: 'trend-down'
    },
    {
      text: 'December ROAS at 1.65x is below target of 2.5x, indicating urgent optimization needed',
      type: 'negative',
      icon: 'alert'
    },
    {
      text: 'Shopping campaign CTR dropped 45% in last 14 days - creative fatigue detected',
      type: 'negative',
      icon: 'trend-down'
    },
    {
      text: 'Mobile ROAS at 2.8x outperforming desktop 1.4x - shift 30% budget to mobile',
      type: 'positive',
      icon: 'trend-up'
    },
    {
      text: 'Black Friday surge poorly captured - missed ₹4.2L revenue opportunity due to budget caps',
      type: 'neutral',
      icon: 'alert'
    }
  ];

  // Lead generation insights
  const leadgenInsights: InsightItem[] = [
    {
      text: 'Google CPL improved by 23% to ₹450 but CTR dropped from 2.8% to 1.6% — ad relevance declining',
      type: 'neutral',
      icon: 'alert'
    },
    {
      text: 'LinkedIn campaigns generating highest CTR with 0.9% and lowest CPL at ₹323',
      type: 'positive',
      icon: 'trend-up'
    },
    {
      text: 'Overall lead volume up 67% but CPL increased 34% — focus on improving CTR and reducing CPM',
      type: 'negative',
      icon: 'trend-down'
    },
    {
      text: 'Retargeting campaigns have 3.2x higher SQL rate but only getting 12% of budget',
      type: 'positive',
      icon: 'trend-up'
    },
    {
      text: 'Form abandonment at 68% - implementing auto-save could recover 340 leads/month',
      type: 'neutral',
      icon: 'alert'
    },
    {
      text: 'Demo booking rate from webinar leads is 4x higher than cold outreach',
      type: 'positive',
      icon: 'trend-up'
    }
  ];

  const insights = businessModel === 'ecommerce' ? ecommerceInsights : leadgenInsights;

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'trend-up':
        return <TrendingUp className="w-5 h-5" />;
      case 'trend-down':
        return <TrendingDown className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          textColor: 'text-gray-900'
        };
      case 'negative':
        return {
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          textColor: 'text-gray-900'
        };
      default:
        return {
          bg: 'bg-gray-50/80',
          border: 'border-gray-100',
          iconBg: 'bg-brand-light',
          iconColor: 'text-brand',
          textColor: 'text-gray-900'
        };
    }
  };

  return null;
}