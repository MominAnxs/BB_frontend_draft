import { KPIWidget, KPIData } from './KPIWidget';
import { RevenueVsSpendChart } from './RevenueVsSpendChart';
import { InsightPanel } from './InsightPanel';
import { ActionRecommendationPanel } from './ActionRecommendationPanel';
import { BreakdownTable } from './BreakdownTable';
import { TargetVsAchievedPanel } from './TargetVsAchievedWidget';
import { LeadGenTargetPanel } from './LeadGenTargetWidget';

interface OverviewModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

export function OverviewModule({ businessModel, selectedChannel }: OverviewModuleProps) {
  // Channel-specific KPI data for E-commerce
  const getEcommerceKPIs = (channel: string): KPIData[] => {
    const kpisByChannel: Record<string, KPIData[]> = {
      all: [
        {
          label: 'Ad Spend',
          value: '₹16.2L',
          delta: -12,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Revenue',
          value: '₹26.8L',
          delta: -19,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'currency'
        },
        {
          label: 'ROAS',
          value: '1.65x',
          delta: -34,
          deltaLabel: 'vs last period',
          status: 'bad',
          format: 'number'
        },
        {
          label: 'CAC',
          value: '₹1,245',
          delta: 28,
          deltaLabel: 'vs last period',
          status: 'bad',
          format: 'currency'
        },
        {
          label: 'Orders',
          value: '783',
          delta: -24,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'number'
        }
      ],
      meta: [
        {
          label: 'Ad Spend',
          value: '₹6.2L',
          delta: -8,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Revenue',
          value: '₹11.5L',
          delta: -12,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'currency'
        },
        {
          label: 'ROAS',
          value: '1.85x',
          delta: -5,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'number'
        },
        {
          label: 'CAC',
          value: '₹1,058',
          delta: 15,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'currency'
        },
        {
          label: 'Orders',
          value: '401',
          delta: -18,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'number'
        }
      ],
      google: [
        {
          label: 'Ad Spend',
          value: '₹5.1L',
          delta: -15,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Revenue',
          value: '₹8.9L',
          delta: -28,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'currency'
        },
        {
          label: 'ROAS',
          value: '1.74x',
          delta: -15,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'number'
        },
        {
          label: 'CAC',
          value: '₹1,647',
          delta: 42,
          deltaLabel: 'vs last period',
          status: 'bad',
          format: 'currency'
        },
        {
          label: 'Orders',
          value: '309',
          delta: -35,
          deltaLabel: 'vs last period',
          status: 'bad',
          format: 'number'
        }
      ],
      shopify: [
        {
          label: 'Traffic Source',
          value: 'Organic',
          delta: 0,
          deltaLabel: '',
          status: 'neutral',
          format: 'text'
        },
        {
          label: 'Revenue',
          value: '₹6.4L',
          delta: -8,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Orders',
          value: '73',
          delta: -12,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'number'
        },
        {
          label: 'AOV',
          value: '₹8,767',
          delta: 4,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Conv. Rate',
          value: '2.8%',
          delta: -15,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'percentage'
        }
      ]
    };
    
    return kpisByChannel[channel] || kpisByChannel.all;
  };

  // Channel-specific KPI data for Lead Generation
  const getLeadgenKPIs = (channel: string): KPIData[] => {
    const kpisByChannel: Record<string, KPIData[]> = {
      all: [
        {
          label: 'Ad Spend',
          value: '₹8.5L',
          delta: -8,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Total Leads',
          value: '1,248',
          delta: 67,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'number'
        },
        {
          label: 'CPL',
          value: '₹681',
          delta: -23,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'CTR',
          value: '2.8%',
          delta: 12,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'percentage'
        },
        {
          label: 'CPM',
          value: '₹185',
          delta: -6,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        }
      ],
      meta: [
        {
          label: 'Ad Spend',
          value: '₹2.5L',
          delta: -5,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Total Leads',
          value: '501',
          delta: 85,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'number'
        },
        {
          label: 'CPL',
          value: '₹499',
          delta: -32,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'CTR',
          value: '3.2%',
          delta: 18,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'percentage'
        },
        {
          label: 'CPM',
          value: '₹142',
          delta: -9,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        }
      ],
      google: [
        {
          label: 'Ad Spend',
          value: '₹4.5L',
          delta: -12,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Total Leads',
          value: '503',
          delta: 48,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'number'
        },
        {
          label: 'CPL',
          value: '₹894',
          delta: -18,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'CTR',
          value: '2.4%',
          delta: 8,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'percentage'
        },
        {
          label: 'CPM',
          value: '₹215',
          delta: -4,
          deltaLabel: 'vs last period',
          status: 'warning',
          format: 'currency'
        }
      ],
      shopify: [
        {
          label: 'Ad Spend',
          value: '₹1.5L',
          delta: -3,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'Total Leads',
          value: '244',
          delta: 52,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'number'
        },
        {
          label: 'CPL',
          value: '₹615',
          delta: -22,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        },
        {
          label: 'CTR',
          value: '3.0%',
          delta: 14,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'percentage'
        },
        {
          label: 'CPM',
          value: '₹158',
          delta: -8,
          deltaLabel: 'vs last period',
          status: 'good',
          format: 'currency'
        }
      ]
    };
    
    return kpisByChannel[channel] || kpisByChannel.all;
  };

  const kpis = businessModel === 'ecommerce' 
    ? getEcommerceKPIs(selectedChannel) 
    : getLeadgenKPIs(selectedChannel);

  return (
    <div className="space-y-6">
      {/* KPI Widgets - 5 metrics in a grid */}
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <KPIWidget key={index} data={kpi} />
        ))}
      </div>

      {/* Target vs Achieved Panel - Only for Ecommerce */}
      <TargetVsAchievedPanel businessModel={businessModel} />

      {/* Lead Gen Target vs Achieved Panel - Only for Lead Generation */}
      <LeadGenTargetPanel businessModel={businessModel} />

      {/* Action/Recommendation Panel - Priority Action Plan */}
      <ActionRecommendationPanel businessModel={businessModel} selectedChannel={selectedChannel} />

      {/* Main Insight Chart - Revenue vs Spend Trends */}
      <RevenueVsSpendChart businessModel={businessModel} selectedChannel={selectedChannel} />

      {/* Insight Panel - Key observations */}
      <InsightPanel businessModel={businessModel} selectedChannel={selectedChannel} />

      {/* Breakdown Table - Month on Month Performance Report */}
      <BreakdownTable businessModel={businessModel} selectedChannel={selectedChannel} />
    </div>
  );
}