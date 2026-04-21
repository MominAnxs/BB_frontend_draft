'use client';

/**
 * DashboardResponseCards.tsx
 * 
 * Beautiful, compact card components for rendering data-driven
 * AI chat responses linked to the Dashboard.
 */

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle,
  XCircle, ChevronDown, ChevronUp, Lightbulb, Target,
  Zap, IndianRupee, AlertCircle, ArrowRight, ExternalLink, Sparkles
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import type { 
  StructuredResponse, DashboardKPI, CampaignRow, 
  CreativeRow, ComparisonItem, AlertItem, InsightItem, TrendPoint 
} from './DashboardDataEngine';

// ── KPI Grid ──

function KPICard({ kpi, index }: { kpi: DashboardKPI; index: number }) {
  const statusColors = {
    good: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', border: 'border-emerald-100' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-100' },
    danger: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-100' },
  };
  const c = statusColors[kpi.status];
  const isPositive = kpi.delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`relative bg-white rounded-xl p-4 border ${c.border} hover:shadow-md transition-all duration-200`}
    >
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${c.dot}`} />
      <p className="text-gray-500 uppercase tracking-wider mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>{kpi.label}</p>
      <p className="text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 700 }}>{kpi.value}</p>
      <div className="flex items-center justify-between">
        {kpi.target ? (
          <span className="text-gray-400" style={{ fontSize: '13px' }}>Target: <span className="text-gray-600" style={{ fontWeight: 500 }}>{kpi.target}</span></span>
        ) : (
          <span className={`flex items-center gap-0.5 ${c.text}`} style={{ fontSize: '13px', fontWeight: 600 }}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(kpi.delta)}%
          </span>
        )}
        {kpi.target && (
          <span className={`flex items-center gap-0.5 ${c.text}`} style={{ fontSize: '13px', fontWeight: 600 }}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(kpi.delta)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

function KPIGrid({ kpis }: { kpis: DashboardKPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.label} kpi={kpi} index={i} />
      ))}
    </div>
  );
}

// ── Campaign Ranking Table ──

function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? campaigns : campaigns.slice(0, 4);

  return (
    <div className="my-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <h4 className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 600 }}>Campaign Ranking</h4>
        <span className="text-gray-400" style={{ fontSize: '13px', fontWeight: 500 }}>{campaigns.length} campaigns</span>
      </div>
      <div className="divide-y divide-gray-50">
        {visible.map((c, i) => {
          const statusColors = {
            good: 'bg-emerald-50 text-emerald-600',
            warning: 'bg-amber-50 text-amber-600',
            danger: 'bg-red-50 text-red-600',
          };
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                i === 0 ? 'bg-brand/10 text-brand' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
              }`} style={{ fontSize: '13px', fontWeight: 700 }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>{c.channel} · Spend: {c.spend}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-flex px-2 py-0.5 rounded-md ${statusColors[c.status]}`} style={{ fontSize: '13px', fontWeight: 700 }}>
                  {c.result}
                </span>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>{c.resultLabel}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {campaigns.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 text-[13px] text-brand hover:bg-brand/5 transition-colors flex items-center justify-center gap-1 border-t border-gray-50"
          style={{ fontWeight: 500 }}
          aria-expanded={expanded}
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {campaigns.length} campaigns</>}
        </button>
      )}
    </div>
  );
}

// ── Creative Ranking Table ──

function CreativeTable({ creatives }: { creatives: CreativeRow[] }) {
  return (
    <div className="my-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <h4 className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '13px', fontWeight: 600 }}>Creative Performance</h4>
        <span className="text-gray-400" style={{ fontSize: '13px', fontWeight: 500 }}>{creatives.length} creatives</span>
      </div>
      <div className="divide-y divide-gray-50">
        {creatives.map((c, i) => {
          const statusColors = {
            good: 'bg-emerald-50 text-emerald-600',
            warning: 'bg-amber-50 text-amber-600',
            danger: 'bg-red-50 text-red-600',
          };
          const typeColors: Record<string, string> = {
            Video: 'bg-purple-50 text-purple-600',
            Static: 'bg-blue-50 text-blue-600',
            Carousel: 'bg-teal-50 text-teal-600',
          };
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                i === 0 ? 'bg-brand/10 text-brand' : 'bg-gray-50 text-gray-400'
              }`} style={{ fontSize: '13px', fontWeight: 700 }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded ${typeColors[c.type] || 'bg-gray-50 text-gray-500'}`} style={{ fontSize: '13px', fontWeight: 600 }}>{c.type}</span>
                  <span className="text-gray-400" style={{ fontSize: '13px' }}>CTR: {c.ctr}</span>
                  <span className="text-gray-400" style={{ fontSize: '13px' }}>Spend: {c.spend}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-flex px-2 py-0.5 rounded-md ${statusColors[c.status]}`} style={{ fontSize: '13px', fontWeight: 700 }}>
                  {c.result}
                </span>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>{c.resultLabel}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Trend Mini Chart ──

function TrendChart({ title, data, unit, color }: { title: string; data: TrendPoint[]; unit: string; color: string }) {
  const formatValue = (v: number) => {
    if (unit === '₹') {
      if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
      if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
      return `₹${v}`;
    }
    if (unit === '%') return `${v.toFixed(1)}%`;
    return v.toLocaleString();
  };

  const hasPrevious = data.some(d => d.previousValue !== undefined);

  return (
    <div className="my-4 bg-white rounded-xl border border-gray-100 p-4">
      <h4 className="text-gray-900 mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>{title}</h4>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis key="xaxis" dataKey="label" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatValue} />
            <Tooltip
              key="tooltip"
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              labelStyle={{ fontSize: 10, fontWeight: 600, color: '#111827' }}
              formatter={(value: number, name: string) => [formatValue(value), name === 'value' ? 'Current' : 'Previous']}
            />
            <Line key="line-value" type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ fill: '#fff', stroke: color, strokeWidth: 2, r: 3.5 }} />
            {hasPrevious && (
              <Line key="line-previous" type="monotone" dataKey="previousValue" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Channel Comparison ──

function ChannelComparison({ items }: { items: ComparisonItem[] }) {
  const statusDot = { good: 'bg-emerald-400', warning: 'bg-amber-400', danger: 'bg-red-400' };

  return (
    <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <motion.div
          key={item.channel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-brand" />
            <h4 className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{item.channel}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {item.metrics.map(m => (
              <div key={m.label} className="bg-gray-50/80 rounded-lg p-2.5">
                <p className="text-gray-500 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>{m.label}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{m.value}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[m.status]}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Alert Cards ──

function AlertCards({ alerts }: { alerts: AlertItem[] }) {
  const severityConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-500', labelBg: 'bg-red-100 text-red-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', labelBg: 'bg-amber-100 text-amber-700' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: AlertCircle, iconColor: 'text-blue-500', labelBg: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div className="my-4 space-y-2">
      {alerts.map((alert, i) => {
        const cfg = severityConfig[alert.severity];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${cfg.bg} ${cfg.border} border rounded-xl px-4 py-3 flex items-start gap-3`}
          >
            <Icon className={`w-4 h-4 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{alert.title}</p>
              <p className="text-gray-600 mt-0.5" style={{ fontSize: '13px' }}>{alert.description}</p>
            </div>
            {alert.metric && (
              <span className={`px-2 py-0.5 rounded-md flex-shrink-0 ${cfg.labelBg}`} style={{ fontSize: '13px', fontWeight: 700 }}>
                {alert.metric}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Insight Cards ──

function InsightCards({ insights }: { insights: InsightItem[] }) {
  const iconMap: Record<string, typeof Lightbulb> = {
    lightbulb: Lightbulb,
    target: Target,
    trending: TrendingUp,
    alert: AlertTriangle,
    dollar: IndianRupee,
    zap: Zap,
  };

  const colorMap: Record<string, string> = {
    lightbulb: 'bg-amber-50 text-amber-600',
    target: 'bg-brand/10 text-brand',
    trending: 'bg-emerald-50 text-emerald-600',
    alert: 'bg-red-50 text-red-500',
    dollar: 'bg-teal-50 text-teal-600',
    zap: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="my-4 space-y-2">
      {insights.map((insight, i) => {
        const Icon = iconMap[insight.icon] || Lightbulb;
        const color = colorMap[insight.icon] || 'bg-gray-50 text-gray-600';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3 hover:shadow-sm transition-all"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{insight.title}</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed" style={{ fontSize: '13px' }}>{insight.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard Response Renderer ──

interface DashboardResponseProps {
  response: StructuredResponse;
  onActionClick: (action: string, label: string) => void;
}

export function DashboardResponseRenderer({ response, onActionClick }: DashboardResponseProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* KPI Grid */}
      {response.kpis && response.kpis.length > 0 && (
        <KPIGrid kpis={response.kpis} />
      )}

      {/* Campaign Table */}
      {response.campaigns && response.campaigns.length > 0 && (
        <CampaignTable campaigns={response.campaigns} />
      )}

      {/* Creative Table */}
      {response.creatives && response.creatives.length > 0 && (
        <CreativeTable creatives={response.creatives} />
      )}

      {/* Trend Chart */}
      {response.trend && (
        <TrendChart 
          title={response.trend.title} 
          data={response.trend.data} 
          unit={response.trend.unit} 
          color={response.trend.color} 
        />
      )}

      {/* Channel Comparison */}
      {response.comparison && response.comparison.length > 0 && (
        <ChannelComparison items={response.comparison} />
      )}

      {/* Alert Cards */}
      {response.alerts && response.alerts.length > 0 && (
        <AlertCards alerts={response.alerts} />
      )}

      {/* Insight Cards */}
      {response.insights && response.insights.length > 0 && (
        <InsightCards insights={response.insights} />
      )}

      {/* Follow-up Buttons */}
      {response.followUpButtons && response.followUpButtons.length > 0 && (() => {
        const primaryBtn = response.followUpButtons.find(b => b.variant === 'primary');
        const secondaryBtns = response.followUpButtons.filter(b => b.variant === 'secondary');
        return (
          <div className="mt-6">
            {/* Primary CTA */}
            {primaryBtn && (
              <motion.button
                key={primaryBtn.action}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => onActionClick(primaryBtn.action, primaryBtn.label)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-hover shadow-[0_2px_8px_rgba(32,76,199,0.18)] hover:shadow-[0_4px_14px_rgba(32,76,199,0.25)] transition-all duration-200"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                <span>{primaryBtn.label}</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
            )}

            {/* Secondary Prompt Suggestions */}
            {secondaryBtns.length > 0 && (
              <div className={primaryBtn ? 'mt-5' : ''}>
                {/* Section label with subtle divider */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex items-center gap-2.5 mb-3"
                >
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Sparkles className="w-3 h-3 text-brand/70" strokeWidth={2.5} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Continue exploring
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200/80 via-gray-100 to-transparent" />
                </motion.div>

                <div className="flex flex-col gap-1.5">
                  {secondaryBtns.map((btn, i) => (
                    <motion.button
                      key={btn.action}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      onClick={() => onActionClick(btn.action, btn.label)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-gray-50/90 to-gray-50/60 hover:from-brand/5 hover:to-brand/[0.02] border border-gray-100 hover:border-brand/20 transition-all duration-200 text-left overflow-hidden"
                    >
                      {/* Accent bar on hover */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-6 bg-brand rounded-full transition-all duration-300 ease-out" />

                      <span className="w-6 h-6 rounded-lg bg-white border border-gray-150 flex items-center justify-center flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:border-brand/25 group-hover:bg-brand/5 transition-all duration-200">
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={2.5} />
                      </span>
                      <span className="text-gray-700 group-hover:text-gray-900 flex-1 transition-colors" style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
                        {btn.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
