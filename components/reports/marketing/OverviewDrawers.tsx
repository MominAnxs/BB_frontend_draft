'use client';

import { X, Zap, Globe, Palette, Filter, Download, TrendingUp, TrendingDown, CheckCircle, AlertCircle, XCircle, ArrowRight, Clock, Eye, MousePointer, Smartphone, Monitor, RefreshCw, Target, Lightbulb, BarChart3, ChevronDown, Info, Activity, Tablet, MapPin } from 'lucide-react';
import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FunnelStageCard } from './FunnelStageCard';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import { ChartContainer, type ChartConfig } from '../../ui/chart';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Metric Card Component with Tooltip
function MetricCard({ item }: { item: any }) {
  const [showRec, setShowRec] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div 
              className="flex items-center gap-1.5 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{item.metric}</p>
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded" style={{ fontSize: '13px', fontWeight: 500 }}>
                {item.acronym}
              </span>
            </div>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-full mt-1 z-10 w-64 p-2.5 bg-gray-900 text-white rounded-lg shadow-lg" style={{ fontSize: '13px', fontWeight: 400 }}>
                {item.tooltip}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
          
          {item.status === 'excellent' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : item.status === 'good' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-gray-500 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Current</p>
            <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>{item.value}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Score</p>
            <p className={`${
              item.status === 'excellent' ? 'text-gray-900' :
              item.status === 'good' ? 'text-gray-900' : 'text-gray-500'
            }`} style={{ fontSize: '16px', fontWeight: 700 }}>
              {item.score}
            </p>
          </div>
        </div>
      </div>
      
      {/* Simple Progress Bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              item.status === 'excellent' ? 'bg-green-500' :
              item.status === 'good' ? 'bg-green-500' : 'bg-gray-400'
            } transition-all duration-500`}
            style={{ width: `${item.score}%` }}
          />
        </div>
      </div>

      {/* Target Info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>Target: <span className="text-gray-900" style={{ fontWeight: 500 }}>{item.target}</span></span>
        <span className={`${
          item.status === 'excellent' || item.status === 'good' ? 'text-green-600' : 'text-gray-500'
        }`} style={{ fontSize: '13px', fontWeight: 500 }}>
          {item.status === 'excellent' ? '✓ Excellent' : 
           item.status === 'good' ? '✓ Good' : '⚠ Needs Improvement'}
        </span>
      </div>

      {/* Recommendation Dropdown */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => setShowRec(!showRec)}
          className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Recommendation</span>
            {item.priority === 'High' && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>
                High Priority
              </span>
            )}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showRec ? 'rotate-180' : ''}`} />
        </button>

        {showRec && (
          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>{item.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Tooltip — appears on hover for technical terms
function MetricTooltip({ children, tooltip }: { children: ReactNode; tooltip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center cursor-help"
      >
        {children}
        <Info className="w-3 h-3 text-gray-400 ml-1 flex-shrink-0" />
      </span>
      {show && (
        <span className="absolute left-0 bottom-full mb-2 z-20 w-56 px-3 py-2 bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.625 }}>
          {tooltip}
          <span className="absolute left-4 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

// Status tag for metric health
function StatusTag({ status }: { status: string }) {
  const config = {
    good: { label: 'Good', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    warning: { label: 'Needs Improvement', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    bad: { label: 'Poor', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }[status] || { label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <span className={`px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`} style={{ fontSize: '13px', fontWeight: 500 }}>
      {config.label}
    </span>
  );
}

// Full PageSpeed Tab — used in both Overview Drawer and Website Drawers
export function PageSpeedTab({
  speedDevice,
  setSpeedDevice,
  activeData,
  getScoreColor,
  getScoreBorder,
  getScoreBg,
  getStatusDot,
  getStatusText,
  hideDeviceToggle = false,
}: {
  speedDevice: 'mobile' | 'desktop';
  setSpeedDevice: (d: 'mobile' | 'desktop') => void;
  activeData: any;
  getScoreColor: (n: number) => string;
  getScoreBorder: (n: number) => string;
  getScoreBg: (n: number) => string;
  getStatusDot: (s: string) => string;
  getStatusText: (s: string) => string;
  hideDeviceToggle?: boolean;
}) {
  const metricExplanations: Record<string, { full: string; tooltip: string }> = {
    LCP: { full: 'Page Load Speed', tooltip: 'Largest Contentful Paint (LCP) — how fast the main content like your hero image or heading loads. Slower LCP means users stare at a blank screen longer.' },
    FID: { full: 'Interaction Speed', tooltip: 'First Input Delay (FID) — how quickly your site responds when a user first clicks or taps something. High FID means buttons and links feel unresponsive.' },
    CLS: { full: 'Visual Stability', tooltip: 'Cumulative Layout Shift (CLS) — how much things jump around while the page loads. High CLS means users accidentally click the wrong thing.' },
    FCP: { full: 'Initial Display Speed', tooltip: 'First Contentful Paint (FCP) — when the first text or image appears on screen. Faster FCP means users know the page is loading.' },
    SI: { full: 'Visual Load Speed', tooltip: 'Speed Index (SI) — how quickly the visible content fills the page. Lower is better — measures overall visual loading speed.' },
    TTI: { full: 'Ready to Use', tooltip: 'Time to Interactive (TTI) — when the page becomes fully usable, buttons work, and forms are fillable. High TTI means a frustrating wait for your visitors.' },
  };

  return (
    <div className="space-y-5">
      {/* Device Toggle */}
      {!hideDeviceToggle && (
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl max-w-xs ml-auto">
        <button
          onClick={() => setSpeedDevice('mobile')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            speedDevice === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ fontSize: '14px', fontWeight: speedDevice === 'mobile' ? 600 : 400 }}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </button>
        <button
          onClick={() => setSpeedDevice('desktop')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            speedDevice === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ fontSize: '14px', fontWeight: speedDevice === 'desktop' ? 600 : 400 }}
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </button>
      </div>
      )}

      {/* Performance Score + Core Web Vitals — horizontal 20/80 */}
      <div className="flex gap-4">
        {/* Performance Score — narrow left column */}
        <div className={`flex-shrink-0 rounded-2xl p-5 border flex flex-col items-center ${getScoreBg(activeData.score)} ${getScoreBorder(activeData.score)}/30`} style={{ width: '22%', minWidth: 160 }}>
          <p className="text-gray-600 mb-4" style={{ fontSize: '14px', fontWeight: 500 }}>Performance Score</p>
          {(() => {
            const hexColor = activeData.score >= 90 ? '#10b981' : activeData.score >= 50 ? '#f59e0b' : '#ef4444';
            const bgColor = activeData.score >= 90 ? 'rgba(16,185,129,0.08)' : activeData.score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
            const r = 38;
            const circ = 2 * Math.PI * r;
            const offset = circ - (activeData.score / 100) * circ;
            return (
              <div key={speedDevice} className="relative" style={{ width: 96, height: 96 }}>
                <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                  <circle cx="48" cy="48" r={r} fill="none" stroke={bgColor} strokeWidth="6" />
                  <motion.circle
                    cx="48" cy="48" r={r}
                    fill="none"
                    stroke={hexColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontSize: 24, fontWeight: 700, color: hexColor, lineHeight: 1 }}>{activeData.score}</span>
                  <span className="text-gray-400 mt-0.5" style={{ fontSize: 13, fontWeight: 500 }}>/ 100</span>
                </div>
              </div>
            );
          })()}
          <p className="text-gray-500 mt-auto text-center" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.4 }}>
            {activeData.score >= 90 ? 'Good — page is fast and optimized' : activeData.score >= 50 ? 'Needs improvement — users may experience delays' : 'Poor — significant performance issues detected'}
          </p>
        </div>

        {/* Core Web Vitals — wider right column */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Core Web Vitals</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'LCP', ...activeData.lcp },
              { key: 'FID', ...activeData.fid },
              { key: 'CLS', ...activeData.cls },
            ].map((vital, i) => (
              <div key={i} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <MetricTooltip tooltip={metricExplanations[vital.key].tooltip}>
                    <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{vital.key}</span>
                  </MetricTooltip>
                  <StatusTag status={vital.status} />
                </div>
                <p className={`mb-1.5 ${getStatusText(vital.status)}`} style={{ fontSize: 28, fontWeight: 700 }}>{vital.value}</p>
                <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>{metricExplanations[vital.key].full}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Other Metrics — with tooltips & status tags */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Other Performance Metrics</h3>
        <div className="space-y-2">
          {[
            { key: 'FCP', ...activeData.fcp },
            { key: 'SI', ...activeData.si },
            { key: 'TTI', ...activeData.tti },
          ].map((metric, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50/60 rounded-xl hover:bg-gray-50 transition-colors">
              <MetricTooltip tooltip={metricExplanations[metric.key].tooltip}>
                <span className="text-gray-700" style={{ fontSize: '14px' }}>{metricExplanations[metric.key].full}</span>
              </MetricTooltip>
              <div className="flex items-center gap-2.5">
                <span className={`${getStatusText(metric.status)}`} style={{ fontSize: '14px', fontWeight: 600 }}>{metric.value}</span>
                <StatusTag status={metric.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile vs Desktop — compact comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Mobile vs Desktop</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { device: 'Mobile', icon: Smartphone, score: 72, lcp: '3.1s', fid: '120ms', cls: '0.12', lcpS: 'warning', fidS: 'warning', clsS: 'warning' },
            { device: 'Desktop', icon: Monitor, score: 91, lcp: '1.8s', fid: '45ms', cls: '0.04', lcpS: 'good', fidS: 'good', clsS: 'good' },
          ].map((d, idx) => {
            const DevIcon = d.icon;
            const isActive = speedDevice === d.device.toLowerCase();
            const scoreColor = d.score >= 90 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444';
            const scoreBg = d.score >= 90 ? 'rgba(16,185,129,0.08)' : d.score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
            const circleRadius = 38;
            const circleCircumference = 2 * Math.PI * circleRadius;
            const circleOffset = circleCircumference - (d.score / 100) * circleCircumference;
            return (
              <div key={idx} className={`p-5 rounded-xl transition-all ${isActive ? 'bg-blue-50/50 border border-blue-200' : 'bg-gray-50/80 border border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DevIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{d.device}</span>
                  </div>
                  <StatusTag status={d.score >= 90 ? 'good' : d.score >= 50 ? 'warning' : 'bad'} />
                </div>
                {/* Circular Score Ring */}
                <div className="flex items-center justify-center mb-5">
                  <div className="relative" style={{ width: 96, height: 96 }}>
                    <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                      <circle
                        cx="48" cy="48" r={circleRadius}
                        fill="none"
                        stroke={scoreBg}
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="48" cy="48" r={circleRadius}
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circleCircumference}
                        initial={{ strokeDashoffset: circleCircumference }}
                        animate={{ strokeDashoffset: circleOffset }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.15 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{d.score}</span>
                      <span className="text-gray-400 mt-0.5" style={{ fontSize: 13, fontWeight: 500 }}>/ 100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5" style={{ fontSize: '13px' }}>
                  {[
                    { label: 'LCP', val: d.lcp, s: d.lcpS },
                    { label: 'FID', val: d.fid, s: d.fidS },
                    { label: 'CLS', val: d.cls, s: d.clsS },
                  ].map((row, ri) => (
                    <div key={ri} className="flex justify-between items-center">
                      <span className="text-gray-500" style={{ fontWeight: 400 }}>{row.label}</span>
                      <span className={`${row.s === 'good' ? 'text-green-600' : 'text-amber-600'}`} style={{ fontWeight: 600 }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-amber-50/70 rounded-xl border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400 }}>
              <span style={{ fontWeight: 600 }}>19-point gap</span> between mobile (72) and desktop (91). Mobile accounts for 62% of your traffic — prioritize mobile optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Optimization Opportunities</h3>
        <div className="space-y-2">
          {[
            { title: 'Properly size images', saving: '1.8s', impact: 'High', desc: 'Serve images that are appropriately sized for the user\'s viewport' },
            { title: 'Eliminate render-blocking resources', saving: '1.2s', impact: 'High', desc: 'Defer or async load CSS/JS that blocks first paint' },
            { title: 'Reduce unused JavaScript', saving: '0.8s', impact: 'Medium', desc: 'Remove dead code and split bundles for lazy loading' },
            { title: 'Serve images in next-gen formats', saving: '0.6s', impact: 'Medium', desc: 'Use WebP or AVIF instead of PNG/JPEG' },
            { title: 'Enable text compression', saving: '0.3s', impact: 'Low', desc: 'Enable gzip/brotli compression on server' },
          ].map((opp, idx) => (
            <div key={idx} className="p-3 bg-gray-50/60 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{opp.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{opp.saving}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${
                    opp.impact === 'High' ? 'bg-red-50 text-red-700 border-red-200' : opp.impact === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`} style={{ fontSize: '13px', fontWeight: 500 }}>{opp.impact}</span>
                </div>
              </div>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>{opp.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50/70 rounded-xl border border-green-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400 }}>
              <span style={{ fontWeight: 600 }}>{speedDevice === 'mobile' ? '18' : '24'} of 30</span> audits passed successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversion Path Card Component
function ConversionPathCard({ path, idx }: { path: any; idx: number }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full" style={{ fontSize: '13px', fontWeight: 500 }}>
              #{idx + 1}
            </span>
            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{path.sessions.toLocaleString()} sessions</p>
          </div>
          <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>{path.path}</p>
        </div>
        <div className="text-right ml-3">
          <p className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700 }}>{path.convRate}%</p>
          <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>Conv. Rate</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Conversions</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{path.conversions}</p>
        </div>
        <div className="flex-1">
          <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Revenue</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{path.revenue}</p>
        </div>
        <div className="flex-1">
          <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Avg Time</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{path.avgTime}</p>
        </div>
      </div>

      {/* Drop-off Warning */}
      <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 mb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Critical Drop-off</span>
        </div>
        <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>{path.dropoffPoint}</span>
      </div>

      {/* Details Dropdown */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded transition-colors"
      >
        <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>View Details</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Avg Order Value</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{path.avgValue}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Path Rank</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>#{idx + 1}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exit Page Card Component
function ExitPageCard({ page }: { page: any }) {
  const [showReasons, setShowReasons] = useState(false);
  const [showFix, setShowFix] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>{page.page}</p>
          <div className="flex items-center gap-3 text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>
            <span>{page.exits.toLocaleString()} exits</span>
            <span>•</span>
            <span className="text-gray-500" style={{ fontWeight: 600 }}>{page.exitRate}% exit rate</span>
          </div>
        </div>
        <div className="text-right ml-3">
          <p className="text-gray-600" style={{ fontSize: '16px', fontWeight: 700 }}>{page.lostRevenue}</p>
          <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>Lost/month</p>
        </div>
      </div>

      {/* Exit Reasons Dropdown */}
      <div className="mb-2">
        <button
          onClick={() => setShowReasons(!showReasons)}
          className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Exit Reasons</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showReasons ? 'rotate-180' : ''}`} />
        </button>

        {showReasons && (
          <div className="mt-2 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 space-y-1">
            {page.reasons.map((reason: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5" />
                <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400 }}>{reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Fix Dropdown */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => setShowFix(!showFix)}
          className="w-full flex items-center justify-between py-1 hover:bg-gray-50 rounded transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Recommended Fix</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showFix ? 'rotate-180' : ''}`} />
        </button>

        {showFix && (
          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>{page.fix}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Creative Format Card Component
function CreativeFormatCard({ format, businessModel = 'ecommerce' }: { format: any; businessModel?: 'ecommerce' | 'leadgen' }) {
  const [showInsights, setShowInsights] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-blue-100/50 p-4 hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] hover:border-blue-200/70 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{format.format}</p>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100" style={{ fontSize: '13px', fontWeight: 500 }}>
              {format.count} ads
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600" style={{ fontSize: '13px', fontWeight: 400 }}>
            <span>{format.metrics.impressions} impressions</span>
            <span>•</span>
            <span>{format.metrics.spend} spend</span>
          </div>
        </div>
        <div className="ml-3">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className={`inline-block px-2 py-0.5 rounded-full ${
              format.status === 'excellent' ? 'bg-green-50 text-green-700 border border-green-200' :
              format.status === 'good' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-gray-100 text-gray-600 border border-gray-200'
            }`} style={{ fontSize: '13px', fontWeight: 500 }}>
              {format.status === 'excellent' ? '✓ Excellent' :
               format.status === 'good' ? '✓ Good' : '⚠ Needs Work'}
            </span>
            <p className={`${
              format.status === 'excellent' ? 'text-gray-900' :
              format.status === 'good' ? 'text-gray-900' : 'text-gray-500'
            }`} style={{ fontSize: '24px', fontWeight: 700 }}>
              {businessModel === 'leadgen' ? format.metrics.cpl : `${format.metrics.roas}x`}
            </p>
          </div>
          <p className="text-gray-500 text-right" style={{ fontSize: '13px', fontWeight: 400 }}>{businessModel === 'leadgen' ? 'CPL' : 'ROAS'}</p>
        </div>
      </div>

      {/* Key Metrics Row - Simplified */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-50">
        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/30">
          <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>Hook</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{format.metrics.hookRate}%</p>
        </div>
        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/30">
          <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CTR</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{format.metrics.ctr}%</p>
        </div>
        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/30">
          <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CVR</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{format.metrics.cvr}%</p>
        </div>
        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/30">
          <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>{businessModel === 'leadgen' ? 'CPL' : 'CPA'}</p>
          <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{businessModel === 'leadgen' ? format.metrics.cpl : format.metrics.cpa}</p>
        </div>
      </div>

      {/* Insights Dropdown */}
      <div className="mb-2">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full flex items-center justify-between py-1.5 hover:bg-blue-50/40 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-brand/60" />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Key Insights</span>
            <span className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400 }}>({format.insights.length})</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-brand/40 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
        </button>

        {showInsights && (
          <div className="mt-2 p-2.5 bg-blue-50/40 rounded-lg border border-blue-100/50 space-y-1.5">
            {format.insights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-1 h-1 bg-brand/40 rounded-full mt-1.5" />
                <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400 }}>{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendation Dropdown */}
      <div className="pt-2 border-t border-blue-50">
        <button
          onClick={() => setShowRecommendation(!showRecommendation)}
          className="w-full flex items-center justify-between py-1.5 hover:bg-blue-50/40 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand/60" />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Strategic Recommendation</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-brand/40 transition-transform ${showRecommendation ? 'rotate-180' : ''}`} />
        </button>

        {showRecommendation && (
          <div className="mt-2 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-lg border border-blue-100/50">
            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>{format.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Top Performing Creative Card Component
function TopCreativeCard({ creative, idx, businessModel = 'ecommerce', onViewCreative }: { creative: any; idx: number; businessModel?: 'ecommerce' | 'leadgen'; onViewCreative?: (creative: any) => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-blue-100/60 p-4 hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] hover:border-blue-200/80 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ fontSize: '13px', fontWeight: 700, background: idx === 0 ? 'linear-gradient(135deg, #204CC7, #3B6EF6)' : idx === 1 ? 'linear-gradient(135deg, #3B6EF6, #60A5FA)' : 'linear-gradient(135deg, #93C5FD, #BFDBFE)', color: idx >= 2 ? '#1E40AF' : 'white' }}>
              {idx + 1}
            </span>
            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{creative.name}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2 flex-wrap" style={{ fontSize: '13px', fontWeight: 400 }}>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100" style={{ fontWeight: 500 }}>{creative.format}</span>
            {creative.channel && creative.campaign && (
              <>
                <span className="px-1.5 py-0.5 bg-white text-gray-600 rounded border border-blue-100/60" style={{ fontWeight: 500 }}>
                  {creative.channel}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200 max-w-[100px] truncate cursor-help"
                  style={{ fontWeight: 500 }}
                  title={`Campaign: ${creative.campaign} • Ad Set: ${creative.adSet}`}
                >
                  {creative.campaign}
                </span>
              </>
            )}
            <span>•</span>
            <span>{creative.impressions} impressions</span>
            <span>•</span>
            <span>Age: {creative.age}</span>
          </div>
        </div>
        <div className="text-right ml-3">
          {businessModel === 'leadgen' ? (
            <>
              <p className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>₹{creative.cpl}</p>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>CPL</p>
            </>
          ) : (
            <>
              <p className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>{creative.roas}x</p>
              <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>ROAS</p>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-50">
        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
          <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>Spend</p>
          <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.spend}</p>
        </div>
        {businessModel === 'leadgen' ? (
          <>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>Leads</p>
              <p className="text-brand" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.leads}</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CTR</p>
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.ctr}%</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CVR</p>
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.cvr}%</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>Revenue</p>
              <p className="text-green-600" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.revenue}</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CTR</p>
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.ctr}%</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-blue-50/40">
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '12px', fontWeight: 500 }}>CVR</p>
              <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>{creative.cvr}%</p>
            </div>
          </>
        )}
      </div>

      {/* Creative Elements Dropdown */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-1.5 hover:bg-blue-50/40 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-brand/60" />
          <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Creative Elements</span>
          <span className="text-gray-400" style={{ fontSize: '13px', fontWeight: 400 }}>({creative.elements.length})</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-brand/40 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-blue-50">
          <div className="flex flex-wrap gap-1.5">
            {creative.elements.map((element: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-blue-50/60 text-blue-700 rounded-full border border-blue-100/60" style={{ fontSize: '13px', fontWeight: 500 }}>
                {element}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Creative CTA */}
      {onViewCreative && (
        <button
          onClick={() => onViewCreative(creative)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand/20 text-brand hover:bg-brand hover:text-white transition-all duration-200 group"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Eye className="w-4 h-4" />
          View Creative
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
        </button>
      )}
    </div>
  );
}


// Creative Preview Drawer — slides from LEFT, shown alongside the right-side data drawer
function CreativePreviewDrawer({ creative, onClose, businessModel = 'ecommerce' }: { creative: any | null; onClose: () => void; businessModel?: 'ecommerce' | 'leadgen' }) {
  if (!creative) return null;

  const isVideo = creative.format?.toLowerCase().includes('video');
  const isCarousel = creative.format?.toLowerCase().includes('carousel');
  const cardCount = isCarousel ? parseInt(creative.format.match(/\d+/)?.[0] || '4') : 1;
  const duration = creative.format.match(/\d+/)?.[0] || '15';
  const cleanName = creative.name.replace(/^(Video|Carousel|Static)\s*-\s*/, '').replace(/"/g, '');
  const primaryMetric = businessModel === 'leadgen' ? { label: 'CPL', value: `₹${creative.cpl}` } : { label: 'ROAS', value: `${creative.roas}x` };

  return (
    <div
      className="absolute left-0 top-0 h-full bg-gray-50 flex flex-col"
      style={{ width: 'calc(100% - 56rem)', minWidth: '380px', borderRight: '1px solid #E5E7EB' }}
    >
      {/* Minimal Header */}
      <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#204CC7' }}>
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}>Ad Preview</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Ad Mockup — centered phone-like frame */}
        <div className="p-5 pb-4">
          <div className="mx-auto max-w-[340px] rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)' }}>
            {/* Platform bar */}
            <div className="px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #204CC7, #3B6EF6)' }}>
                <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>B</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>Brand Name</p>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400" style={{ fontSize: '11px', fontWeight: 400 }}>Sponsored</span>
                  <span className="text-gray-300" style={{ fontSize: '11px' }}>&middot;</span>
                  <Globe className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              <div className="text-gray-300" style={{ fontSize: '18px', letterSpacing: '2px', lineHeight: 1 }}>&middot;&middot;&middot;</div>
            </div>

            {/* Creative visual — proper aspect ratios */}
            {isVideo ? (
              <div className="relative w-full" style={{ aspectRatio: '4/5', background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                    <div className="w-0 h-0 ml-1" style={{ borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '14px solid rgba(255,255,255,0.9)' }} />
                  </div>
                </div>
                {/* Duration pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-white" style={{ fontSize: '11px', fontWeight: 600 }}>0:{duration}</span>
                </div>
                {/* Format badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                  <span className="text-white/80" style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{creative.format}</span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
              </div>
            ) : isCarousel ? (
              <div className="w-full bg-gray-50">
                <div className="flex gap-2 overflow-x-auto px-1 py-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                  {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="snap-center flex-shrink-0 flex flex-col items-center justify-center gap-2" style={{ width: '82%', aspectRatio: '1/1', background: i === 0 ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', borderRadius: '4px' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: i === 0 ? 'rgba(32,76,199,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <Palette className="w-5 h-5" style={{ color: i === 0 ? '#204CC7' : '#94A3B8' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>Card {i + 1}/{cardCount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="rounded-full" style={{ width: i === 0 ? '16px' : '5px', height: '5px', background: i === 0 ? '#204CC7' : '#D1D5DB', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)' }}>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)' }}>
                    <Palette className="w-7 h-7 text-brand/50" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#6366F1' }}>Static Image</span>
                </div>
              </div>
            )}

            {/* Ad copy + CTA */}
            <div className="px-3.5 pt-2.5 pb-3">
              <p className="text-gray-800 mb-2.5" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.45 }}>{cleanName}</p>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#F3F4F6' }}>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>brand.com</p>
                  <p className="text-gray-700" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                    {businessModel === 'leadgen' ? 'Sign Up Today' : 'Shop the Collection'}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-gray-200">
                  <span className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {businessModel === 'leadgen' ? 'Get Started' : 'Shop Now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social proof row */}
            <div className="px-3.5 pb-3 flex items-center gap-3 text-gray-400" style={{ fontSize: '11px' }}>
              <span>👍 1.2K</span>
              <span>💬 89</span>
              <span>↗ 234 shares</span>
            </div>
          </div>
        </div>

        {/* Performance snapshot — horizontal strip */}
        <div className="px-5 pb-4">
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)' }}>
            {[
              { label: 'Impressions', value: creative.impressions, highlight: false },
              { label: 'Spend', value: creative.spend, highlight: false },
              { label: primaryMetric.label, value: primaryMetric.value, highlight: true },
              { label: 'Age', value: creative.age, highlight: false },
            ].map((stat, i) => (
              <div key={i} className="flex-1 px-3 py-3 text-center" style={{ borderRight: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <p className="text-gray-400 mb-0.5" style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: stat.highlight ? '#204CC7' : '#111827' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details section */}
        <div className="px-5 pb-4">
          <div className="rounded-xl bg-white p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)' }}>
            <p className="text-gray-900 mb-3" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</p>
            <div className="space-y-2.5">
              {[
                { label: 'Format', value: creative.format },
                { label: 'Channel', value: creative.channel },
                { label: 'Campaign', value: creative.campaign },
                { label: 'Ad Set', value: creative.adSet },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '13px', fontWeight: 400 }}>{row.label}</span>
                  <span className="text-gray-900 text-right truncate" style={{ fontSize: '13px', fontWeight: 500 }} title={row.value}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Elements */}
        {creative.elements?.length > 0 && (
          <div className="px-5 pb-5">
            <p className="text-gray-400 mb-2" style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Elements</p>
            <div className="flex flex-wrap gap-1.5">
              {creative.elements.map((el: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-white text-gray-600" style={{ fontSize: '12px', fontWeight: 500, border: '1px solid #E5E7EB' }}>
                  {el}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// Interactive Donut Chart with active segment rendering
export const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.95} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 8} outerRadius={outerRadius + 12} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#111827" fontSize={20} fontWeight={700}>{`${(percent * 100).toFixed(1)}%`}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" fontSize={11} fontWeight={500}>{payload.name}</text>
    </g>
  );
};

// Traffic Sources Section — Stacked bar + cards
export const trafficSourcesData = [
  { source: 'Organic Search', users: '28,456', sessions: '38,240', bounce: '32.4%', convRate: '3.8%', share: 41.5, color: '#3B82F6' },
  { source: 'Paid Search', users: '15,420', sessions: '22,840', bounce: '42.8%', convRate: '2.4%', share: 22.5, color: '#6366F1' },
  { source: 'Social', users: '12,648', sessions: '16,420', bounce: '48.2%', convRate: '1.8%', share: 18.5, color: '#EC4899' },
  { source: 'Direct', users: '8,240', sessions: '10,840', bounce: '28.5%', convRate: '4.2%', share: 12.0, color: '#10B981' },
  { source: 'Referral', users: '3,760', sessions: '4,500', bounce: '35.6%', convRate: '3.1%', share: 5.5, color: '#F59E0B' },
];

export function TrafficSourcesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Traffic Sources</h3>

      {/* Stacked Distribution Bar */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden">
          {trafficSourcesData.map((item, idx) => (
            <div
              key={idx}
              className="relative transition-all duration-200 cursor-pointer"
              style={{
                width: `${item.share}%`,
                backgroundColor: item.color,
                opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.4 : 1,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {hoveredIdx === idx && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-gray-900 text-white rounded-md z-10" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {item.source} - {item.share}%
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Legend Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
          {trafficSourcesData.map((item, idx) => (
            <button
              key={idx}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              style={{ fontSize: '13px', fontWeight: hoveredIdx === idx ? 600 : 400 }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              {item.source}
              <span className="text-gray-400" style={{ fontWeight: 500 }}>{item.share}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards */}
      <div className="space-y-2">
        {trafficSourcesData.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-200 cursor-default"
            style={{
              borderLeftWidth: '3px',
              borderLeftColor: item.color,
              backgroundColor: hoveredIdx === idx ? `${item.color}08` : undefined,
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="px-4 py-3">
              {/* Top Row: Source name + share */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{item.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.share}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-gray-900 tabular-nums min-w-[40px] text-right" style={{ fontSize: '14px', fontWeight: 700 }}>{item.share}%</span>
                </div>
              </div>
              {/* Metrics Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Users', value: item.users },
                  { label: 'Sessions', value: item.sessions },
                  { label: 'Bounce', value: item.bounce },
                  { label: 'Conv. Rate', value: item.convRate },
                ].map((metric) => (
                  <div key={metric.label}>
                    <p className="text-gray-500 mb-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>{metric.label}</p>
                    <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Device Breakdown & Top Locations Pie Charts
export function GA4PieChartsSection() {
  const [activeDeviceIdx, setActiveDeviceIdx] = useState(0);
  const [activeLocationIdx, setActiveLocationIdx] = useState(0);

  const deviceData = [
    { name: 'Mobile', value: 42568, users: '42,568', share: 62.1, sessions: '58,420', duration: '3m 24s', bounce: '48.5%', convRate: '2.8%', fill: '#3B82F6' },
    { name: 'Desktop', value: 21356, users: '21,356', share: 31.2, sessions: '28,450', duration: '6m 12s', bounce: '35.2%', convRate: '4.1%', fill: '#6366F1' },
    { name: 'Tablet', value: 4600, users: '4,600', share: 6.7, sessions: '6,240', duration: '4m 48s', bounce: '42.1%', convRate: '3.2%', fill: '#A78BFA' },
  ];

  const locationData = [
    { name: 'Mumbai', value: 12450, users: '12,450', sessions: '18,650', bounce: '38.2%', convRate: '3.6%', topPage: '/products', fill: '#10B981' },
    { name: 'Bangalore', value: 10825, users: '10,825', sessions: '16,240', bounce: '35.6%', convRate: '4.2%', topPage: '/services', fill: '#3B82F6' },
    { name: 'Delhi', value: 9680, users: '9,680', sessions: '14,520', bounce: '42.1%', convRate: '2.9%', topPage: '/products', fill: '#F59E0B' },
    { name: 'Hyderabad', value: 7245, users: '7,245', sessions: '10,870', bounce: '39.8%', convRate: '3.4%', topPage: '/blog', fill: '#EC4899' },
    { name: 'Chennai', value: 6420, users: '6,420', sessions: '9,630', bounce: '41.2%', convRate: '3.1%', topPage: '/products', fill: '#8B5CF6' },
  ];

  const deviceChartConfig: ChartConfig = {
    Mobile: { label: 'Mobile', color: '#3B82F6' },
    Desktop: { label: 'Desktop', color: '#6366F1' },
    Tablet: { label: 'Tablet', color: '#A78BFA' },
  };

  const locationChartConfig: ChartConfig = {
    Mumbai: { label: 'Mumbai', color: '#10B981' },
    Bangalore: { label: 'Bangalore', color: '#3B82F6' },
    Delhi: { label: 'Delhi', color: '#F59E0B' },
    Hyderabad: { label: 'Hyderabad', color: '#EC4899' },
    Chennai: { label: 'Chennai', color: '#8B5CF6' },
  };

  const activeDevice = deviceData[activeDeviceIdx];
  const activeLocation = locationData[activeLocationIdx];
  const totalLocationUsers = locationData.reduce((s, l) => s + l.value, 0);

  const deviceIcons: Record<string, any> = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet };

  return (
    <div className="grid grid-cols-2 gap-4 items-stretch">
      {/* Device Breakdown Pie Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Device Breakdown</h3>
        </div>

        <ChartContainer config={deviceChartConfig} className="mx-auto h-[190px] w-full !aspect-auto">
          <PieChart>
            <Pie
              activeIndex={activeDeviceIdx}
              activeShape={renderActiveShape}
              data={deviceData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveDeviceIdx(index)}
              strokeWidth={2}
              stroke="#fff"
            >
              {deviceData.map((entry, index) => (
                <Cell key={`device-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend — consistent min-height for cross-card alignment */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-4 min-h-[52px] content-center">
          {deviceData.map((d, idx) => {
            const Icon = deviceIcons[d.name];
            return (
              <button
                key={d.name}
                onClick={() => setActiveDeviceIdx(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${activeDeviceIdx === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                <Icon className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: activeDeviceIdx === idx ? 600 : 400 }}>{d.name}</span>
                <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>{d.users}</span>
              </button>
            );
          })}
        </div>

        {/* Flex spacer — pushes detail card to bottom */}
        <div className="flex-1 min-h-4" />

        {/* Detail Card */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            {(() => { const Icon = deviceIcons[activeDevice.name]; return <Icon className="w-4 h-4 text-gray-500" />; })()}
            <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{activeDevice.name}</span>
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '13px', fontWeight: 600, backgroundColor: activeDevice.fill + '14', color: activeDevice.fill }}>{activeDevice.share}%</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5" style={{ fontSize: '13px' }}>
            <div className="flex justify-between">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Sessions</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{activeDevice.sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Avg. Duration</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{activeDevice.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Bounce Rate</span>
              <span className={parseFloat(activeDevice.bounce) > 45 ? 'text-amber-600' : 'text-gray-900'} style={{ fontWeight: 600 }}>{activeDevice.bounce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Conv. Rate</span>
              <span className="text-green-600" style={{ fontWeight: 600 }}>{activeDevice.convRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Locations Pie Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Top Locations</h3>
        </div>

        <ChartContainer config={locationChartConfig} className="mx-auto h-[190px] w-full !aspect-auto">
          <PieChart>
            <Pie
              activeIndex={activeLocationIdx}
              activeShape={renderActiveShape}
              data={locationData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveLocationIdx(index)}
              strokeWidth={2}
              stroke="#fff"
            >
              {locationData.map((entry, index) => (
                <Cell key={`loc-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend — consistent min-height for cross-card alignment */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-4 min-h-[52px] content-center">
          {locationData.map((loc, idx) => (
            <button
              key={loc.name}
              onClick={() => setActiveLocationIdx(idx)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${activeLocationIdx === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: loc.fill }} />
              <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: activeLocationIdx === idx ? 600 : 400 }}>{loc.name}</span>
              <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>{loc.users}</span>
            </button>
          ))}
        </div>

        {/* Flex spacer — pushes detail card to bottom */}
        <div className="flex-1 min-h-4" />

        {/* Detail Card */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{activeLocation.name}</span>
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '13px', fontWeight: 600, backgroundColor: activeLocation.fill + '14', color: activeLocation.fill }}>
              {((activeLocation.value / totalLocationUsers) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5" style={{ fontSize: '13px' }}>
            <div className="flex justify-between">
              <span className="text-gray-500" style={{ fontWeight: 400 }}>Users</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{activeLocation.users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sessions</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{activeLocation.sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bounce Rate</span>
              <span className={parseFloat(activeLocation.bounce) > 40 ? 'text-amber-600' : 'text-gray-900'} style={{ fontWeight: 600 }}>{activeLocation.bounce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Conv. Rate</span>
              <span className="text-green-600" style={{ fontWeight: 600 }}>{activeLocation.convRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Website Performance Drawer — Portal-rendered
export function WebsiteDrawer({ isOpen, onClose }: DrawerProps) {
  const [selectedTab, setSelectedTab] = useState<'ga4' | 'pagespeed'>('ga4');
  const [speedDevice, setSpeedDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  const pagespeedData = {
    mobile: {
      score: 72,
      lcp: { value: '3.1s', status: 'warning', target: '≤ 2.5s' },
      fid: { value: '120ms', status: 'warning', target: '≤ 100ms' },
      cls: { value: '0.12', status: 'warning', target: '≤ 0.1' },
      fcp: { value: '2.4s', status: 'warning', target: '≤ 1.8s' },
      si: { value: '4.2s', status: 'warning', target: '≤ 3.4s' },
      tti: { value: '4.8s', status: 'bad', target: '≤ 3.8s' },
    },
    desktop: {
      score: 91,
      lcp: { value: '1.8s', status: 'good', target: '≤ 2.5s' },
      fid: { value: '45ms', status: 'good', target: '≤ 100ms' },
      cls: { value: '0.04', status: 'good', target: '≤ 0.1' },
      fcp: { value: '1.2s', status: 'good', target: '≤ 1.8s' },
      si: { value: '1.8s', status: 'good', target: '≤ 3.4s' },
      tti: { value: '2.1s', status: 'good', target: '≤ 3.8s' },
    }
  };

  const activeData = pagespeedData[speedDevice];

  const getScoreColor = (score: number) => score >= 90 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const getScoreBorder = (score: number) => score >= 90 ? 'border-green-500' : score >= 50 ? 'border-amber-500' : 'border-red-500';
  const getScoreBg = (score: number) => score >= 90 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50';
  const getStatusDot = (status: string) => status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  const getStatusText = (status: string) => status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-amber-600' : 'text-red-600';

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>Website Performance</h2>
                <p className="text-gray-500" style={{ fontSize: '13px', fontWeight: 400 }}>Google Analytics 4 & PageSpeed Insights</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-gray-200">
            {[
              { id: 'ga4', label: 'Google Analytics 4', icon: BarChart3 },
              { id: 'pagespeed', label: 'PageSpeed Insights', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ fontWeight: selectedTab === tab.id ? 500 : 400 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTab === 'ga4' && (
              <div className="space-y-6">
                {/* GA4 Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: '68,524', change: '+8.2%', positive: true },
                    { label: 'Sessions', value: '92,840', change: '+12.4%', positive: true },
                    { label: 'Bounce Rate', value: '42.5%', change: '-3.1%', positive: true },
                    { label: 'Avg. Duration', value: '4m 32s', change: '-12s', positive: false },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                      <p className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>{stat.label}</p>
                      <p className="text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value}</p>
                      <p className={`${stat.positive ? 'text-green-600' : 'text-amber-600'}`} style={{ fontSize: '13px', fontWeight: 500 }}>
                        {stat.change} vs last period
                      </p>
                    </div>
                  ))}
                </div>

                {/* User Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>New vs Returning Users</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-blue-50/60 rounded-xl">
                      <p className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>New Users</p>
                      <p className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>42,856</p>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>62.5% of total</p>
                    </div>
                    <div className="p-4 bg-indigo-50/60 rounded-xl">
                      <p className="text-gray-600 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>Returning Users</p>
                      <p className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>25,668</p>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>37.5% of total</p>
                    </div>
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Top Pages</h3>
                  <div className="space-y-2">
                    {[
                      { page: '/products/bestsellers', views: '18,245', duration: '5m 24s', bounce: '32.4%', convRate: '4.6%' },
                      { page: '/summer-collection', views: '14,856', duration: '4m 18s', bounce: '38.2%', convRate: '4.4%' },
                      { page: '/products/new-arrivals', views: '10,645', duration: '3m 54s', bounce: '42.1%', convRate: '4.8%' },
                      { page: '/blog/style-guide-2026', views: '8,420', duration: '6m 12s', bounce: '28.6%', convRate: '1.2%' },
                      { page: '/checkout', views: '6,840', duration: '2m 36s', bounce: '68.2%', convRate: '38.5%' },
                    ].map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-gray-400" style={{ fontSize: '13px', fontWeight: 700 }}>#{idx + 1}</span>
                          <span className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 500 }}>{page.page}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-right ml-4" style={{ fontSize: '13px' }}>
                          <div>
                            <p className="text-gray-500" style={{ fontWeight: 400 }}>Views</p>
                            <p className="text-gray-900" style={{ fontWeight: 600 }}>{page.views}</p>
                          </div>
                          <div>
                            <p className="text-gray-500" style={{ fontWeight: 400 }}>Duration</p>
                            <p className="text-gray-900" style={{ fontWeight: 600 }}>{page.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500" style={{ fontWeight: 400 }}>Bounce</p>
                            <p className={`${parseFloat(page.bounce) > 50 ? 'text-amber-600' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>{page.bounce}</p>
                          </div>
                          <div>
                            <p className="text-gray-500" style={{ fontWeight: 400 }}>Conv.</p>
                            <p className="text-green-600" style={{ fontWeight: 600 }}>{page.convRate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Breakdown & Top Locations — Pie Charts */}
                <GA4PieChartsSection />

                {/* Traffic Sources */}
                <TrafficSourcesSection />
              </div>
            )}

            {selectedTab === 'pagespeed' && (
              <PageSpeedTab
                speedDevice={speedDevice}
                setSpeedDevice={setSpeedDevice}
                activeData={activeData}
                getScoreColor={getScoreColor}
                getScoreBorder={getScoreBorder}
                getScoreBg={getScoreBg}
                getStatusDot={getStatusDot}
                getStatusText={getStatusText}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Fatigue Creative Card Component with Collapsible Details
function FatigueCreativeCard({ creative, businessModel = 'ecommerce' }: { creative: any; businessModel?: 'ecommerce' | 'leadgen' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-blue-100/50 hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] hover:border-blue-200/70 transition-all duration-200">
      {/* Collapsed View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{creative.name}</p>
              {creative.channel && creative.campaign && (
                <>
                  <span className="px-1.5 py-0.5 bg-white text-gray-600 rounded border border-blue-100/60" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {creative.channel}
                  </span>
                  <span
                    className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200 max-w-[100px] truncate cursor-help"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    title={`Campaign: ${creative.campaign} • Ad Set: ${creative.adSet}`}
                  >
                    {creative.campaign}
                  </span>
                </>
              )}
              <span className={`px-2 py-0.5 rounded-full border ${
                creative.status === 'severe' ? 'bg-red-50 text-red-600 border-red-200' :
                creative.status === 'moderate' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-blue-50 text-blue-600 border-blue-200'
              }`} style={{ fontSize: '13px', fontWeight: 500 }}>
                {creative.status === 'severe' ? 'Action Needed' :
                 creative.status === 'moderate' ? 'Review Soon' : 'Early Signal'}
              </span>
            </div>
            
            {/* Key Metrics Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>CTR</span>
                <span className={`${
                  creative.status === 'severe' ? 'text-gray-500' :
                  creative.status === 'moderate' ? 'text-gray-500' : 'text-brand'
                }`} style={{ fontSize: '14px', fontWeight: 700 }}>
                  {creative.metrics.ctrDecline}%
                </span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Frequency</span>
                <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{creative.metrics.frequencyCap}x</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Age</span>
                <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>{creative.age}</span>
              </div>
            </div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-blue-50">
          {/* All Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-3">
            <div className="p-3 rounded-lg text-center bg-blue-50/40 border border-blue-100/30">
              <p className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 500 }}>CTR Decline</p>
              <p className={`${
                creative.status === 'severe' ? 'text-red-500' :
                creative.status === 'moderate' ? 'text-amber-500' : 'text-blue-500'
              }`} style={{ fontSize: '20px', fontWeight: 700 }}>{creative.metrics.ctrDecline}%</p>
            </div>
            <div className="p-3 rounded-lg text-center bg-blue-50/40 border border-blue-100/30">
              <p className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 500 }}>CVR Decline</p>
              <p className={`${
                creative.status === 'severe' ? 'text-red-500' :
                creative.status === 'moderate' ? 'text-amber-500' : 'text-blue-500'
              }`} style={{ fontSize: '20px', fontWeight: 700 }}>{creative.metrics.cvrDecline}%</p>
            </div>
            <div className="p-3 rounded-lg text-center bg-blue-50/40 border border-blue-100/30">
              <p className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 500 }}>{businessModel === 'leadgen' ? 'CPL' : 'CPA'} Increase</p>
              <p className={`${
                creative.status === 'severe' ? 'text-red-500' :
                creative.status === 'moderate' ? 'text-amber-500' : 'text-blue-500'
              }`} style={{ fontSize: '20px', fontWeight: 700 }}>+{creative.metrics.cplIncrease || creative.metrics.cpaIncrease}%</p>
            </div>
            <div className="p-3 rounded-lg text-center bg-blue-50/40 border border-blue-100/30">
              <p className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 500 }}>Frequency</p>
              <p className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700 }}>{creative.metrics.frequencyCap}x</p>
            </div>
          </div>

          {/* Signals */}
          <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-100/30">
            <p className="text-gray-900 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>Fatigue Signals</p>
            <div className="space-y-1.5">
              {creative.signs.map((sign: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 bg-brand/40 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-700" style={{ fontSize: '13px' }}>{sign}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className={`flex items-start gap-2.5 p-3 rounded-lg ${
            creative.status === 'severe' ? 'bg-red-50/50 border border-red-100/60' :
            creative.status === 'moderate' ? 'bg-amber-50/50 border border-amber-100/60' :
            'bg-blue-50/50 border border-blue-100/60'
          }`}>
            <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              creative.status === 'severe' ? 'text-red-500' :
              creative.status === 'moderate' ? 'text-amber-500' : 'text-brand'
            }`} />
            <div>
              <p className="text-gray-900 mb-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>Recommended Action</p>
              <p className="text-gray-700" style={{ fontSize: '13px' }}>{creative.action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Refresh Schedule Card Component with Collapsible Best Practices
function RefreshScheduleCard() {
  const [showBestPractices, setShowBestPractices] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-blue-100/40 p-5 shadow-[0_1px_4px_rgba(32,76,199,0.06)] hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] transition-all duration-200">
      <h3 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
        <span className="w-1 h-4 bg-brand rounded-full" />
        Optimal Refresh Timeline
      </h3>

      {/* Timeline Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-xl p-4 text-center border border-blue-100/50">
          <p className="text-brand mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>10-14</p>
          <p className="text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>days</p>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>Static Images</p>
        </div>
        <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-xl p-4 text-center border border-blue-100/50">
          <p className="text-brand mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>14-18</p>
          <p className="text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>days</p>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>Short Videos</p>
        </div>
        <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-xl p-4 text-center border border-blue-100/50">
          <p className="text-brand mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>18-24</p>
          <p className="text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>days</p>
          <p className="text-gray-500" style={{ fontSize: '13px' }}>Carousels</p>
        </div>
      </div>

      {/* Best Practices Dropdown */}
      <button
        onClick={() => setShowBestPractices(!showBestPractices)}
        className="w-full flex items-center justify-between p-3 bg-blue-50/40 hover:bg-blue-50/70 rounded-lg transition-colors border border-blue-100/30"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-brand" />
          <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 500 }}>Best Practices</span>
          <span className="text-gray-400" style={{ fontSize: '13px' }}>(5 tips)</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-brand/40 transition-transform ${showBestPractices ? 'rotate-180' : ''}`} />
      </button>

      {showBestPractices && (
        <div className="mt-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100/30 space-y-2">
          {[
            'Keep frequency cap below 3.5 impressions per user',
            'Have 3-4 variations ready before launching',
            'Monitor CTR decline - pause if drops >20% from peak',
            'Rotate creatives every 10-14 days proactively',
            'Test new hooks/angles before old creatives fatigue'
          ].map((practice, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-brand mt-0.5 flex-shrink-0" />
              <p className="text-gray-700" style={{ fontSize: '13px' }}>{practice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Winning Test Card Component with Collapsible Details
function WinningTestCard({ test }: { test: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Collapsed View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{test.test}</p>
              <span className="px-2 py-0.5 rounded-full bg-brand-light text-brand border border-brand/20" style={{ fontSize: '13px', fontWeight: 500 }}>
                {test.confidence}% confidence
              </span>
            </div>
            
            {/* Key Metrics Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Winner</span>
                <span className="text-brand" style={{ fontSize: '14px', fontWeight: 700 }}>{test.winner}</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Sample</span>
                <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>{test.sample}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-brand" style={{ fontSize: '24px', fontWeight: 700 }}>{test.lift}</p>
              <p className="text-gray-500" style={{ fontSize: '13px' }}>Lift</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Key Findings */}
          <div className="pt-3">
            <p className="text-gray-700 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>Key Findings</p>
            <div className="space-y-1.5">
              {test.findings.map((finding: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-700" style={{ fontSize: '13px' }}>{finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Target className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-brand-dark mb-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>How to Implement</p>
              <p className="text-gray-700" style={{ fontSize: '13px' }}>{test.implement}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Active Test Card Component with Collapsible Details
function ActiveTestCard({ test }: { test: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Collapsed View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{test.test}</p>
              <span className="px-2 py-0.5 rounded-full bg-brand-light text-brand border border-brand/20" style={{ fontSize: '13px', fontWeight: 500 }}>
                {test.progress}% complete
              </span>
            </div>
            
            {/* Key Metrics Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Progress</span>
                <span className="text-brand" style={{ fontSize: '14px', fontWeight: 700 }}>{test.impressions}</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Days Left</span>
                <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>{test.daysLeft}</span>
              </div>
            </div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Progress Bar */}
          <div className="pt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand transition-all duration-500"
                style={{ width: `${test.progress}%` }}
              />
            </div>
          </div>

          {/* Early Leader */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-brand flex-shrink-0" />
            <div>
              <p className="text-gray-900 mb-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>Early Leader</p>
              <p className="text-gray-700" style={{ fontSize: '13px' }}>{test.earlyLeader}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Suggested Test Card Component with Collapsible Details
function SuggestedTestCard({ test }: { test: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Collapsed View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>{test.test}</p>
              <span className={`px-2 py-0.5 rounded-full border ${
                test.priority === 'High' 
                  ? 'bg-brand-light text-brand border-brand/20' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`} style={{ fontSize: '13px', fontWeight: 500 }}>
                {test.priority} Priority
              </span>
            </div>
            
            {/* Key Metrics Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Impact</span>
                <span className="text-brand" style={{ fontSize: '14px', fontWeight: 700 }}>{test.expectedImpact}</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" style={{ fontSize: '13px' }}>Effort</span>
                <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>{test.effort}</span>
              </div>
            </div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-900 mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>Hypothesis</p>
            <p className="text-gray-700" style={{ fontSize: '13px' }}>{test.hypothesis}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Creative Performance Drawer (Enhanced) — Portal-rendered to escape nav stacking context
export function CreativesDrawer({ isOpen, onClose, businessModel = 'ecommerce' }: DrawerProps & { businessModel?: 'ecommerce' | 'leadgen' }) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'fatigue' | 'testing'>('overview');
  const [creativePeriod, setCreativePeriod] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months'>('thisMonth');
  const [previewCreative, setPreviewCreative] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60" onClick={() => { setPreviewCreative(null); onClose(); }} />

      {/* Left-side Creative Preview Drawer */}
      <CreativePreviewDrawer creative={previewCreative} onClose={() => setPreviewCreative(null)} businessModel={businessModel} />

      <div
        className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white"
        style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #E0E7FF 100%)' }}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #204CC7 0%, #3B6EF6 100%)' }}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Creative Overview Drilldown</h2>
                <p className="text-blue-600/60" style={{ fontSize: '13px', fontWeight: 500 }}>Deep analysis of ad creative performance, fatigue, and optimization</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 px-6 bg-white border-b border-gray-200">
            {[
              { id: 'overview', label: 'Format Analysis', icon: BarChart3 },
              { id: 'fatigue', label: 'Creative Fatigue', icon: RefreshCw },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 transition-colors ${
                    isActive
                      ? 'text-brand'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-brand rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Top Performing Creatives */}
                <div className="bg-white rounded-xl p-5 border border-blue-100/40 shadow-[0_1px_4px_rgba(32,76,199,0.06)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      <span className="w-1 h-4 bg-brand rounded-full" />
                      Top 5 Performing Creatives
                    </h3>
                    <div className="relative">
                      <select
                        value={creativePeriod}
                        onChange={(e) => setCreativePeriod(e.target.value as any)}
                        className="text-gray-700 bg-blue-50/50 border border-blue-200/60 rounded-lg px-3 py-1.5 pr-8 appearance-none cursor-pointer hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
                        style={{ fontSize: '13px', fontWeight: 500 }}
                      >
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                        <option value="last6Months">Last 6 Months</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const creativesByPeriod = {
                        thisMonth: businessModel === 'leadgen' ? [
                          { 
                            name: 'Video - "Real Customer Review" UGC Style',
                            format: 'Video 15s',
                            channel: 'Meta',
                            campaign: 'Lead Gen Forms - Service Discovery',
                            adSet: 'B2B Decision Makers',
                            impressions: '1.8M',
                            spend: '₹84K',
                            leads: 108,
                            cpl: 778,
                            ctr: 5.8,
                            cvr: 22,
                            age: '12 days',
                            elements: ['UGC style', 'Text overlay', 'Fast pacing']
                          },
                          { 
                            name: 'Carousel - "Client Success Stories"',
                            format: 'Carousel 4-card',
                            channel: 'Google',
                            campaign: 'Case Studies - Lead Magnet',
                            adSet: 'Enterprise Prospects',
                            impressions: '1.2M',
                            spend: '₹68K',
                            leads: 86,
                            cpl: 791,
                            ctr: 4.8,
                            cvr: 19.5,
                            age: '8 days',
                            elements: ['Client logos', 'Results stats', 'Professional']
                          },
                          { 
                            name: 'Video - Service Benefits Overview',
                            format: 'Video 12s',
                            channel: 'Meta',
                            campaign: 'Video Campaign - Founder Testimonials',
                            adSet: 'Retargeting - Website Visitors',
                            impressions: '980K',
                            spend: '₹52K',
                            leads: 64,
                            cpl: 813,
                            ctr: 4.2,
                            cvr: 18.2,
                            age: '18 days',
                            elements: ['Service demo', 'Benefits', 'Call-to-action']
                          },
                        ] : [
                          { 
                            name: 'Video - "Real Customer Review" UGC Style',
                            format: 'Video 15s',
                            channel: 'Meta',
                            campaign: 'Summer Sale 2024',
                            adSet: 'Catalog - All Products',
                            impressions: '1.8M',
                            spend: '₹84K',
                            revenue: '₹2.8L',
                            roas: 3.33,
                            ctr: 5.8,
                            cvr: 4.2,
                            age: '12 days',
                            elements: ['UGC style', 'Text overlay', 'Fast pacing']
                          },
                          { 
                            name: 'Carousel - "Summer Collection Lookbook"',
                            format: 'Carousel 4-card',
                            channel: 'Google',
                            campaign: 'Shopping - High Intent Buyers',
                            adSet: 'Smart Shopping',
                            impressions: '1.2M',
                            spend: '₹68K',
                            revenue: '₹2.1L',
                            roas: 3.09,
                            ctr: 4.8,
                            cvr: 3.8,
                            age: '8 days',
                            elements: ['Lifestyle images', 'Price callout', 'Social proof']
                          },
                          { 
                            name: 'Video - Product Demo with Benefits',
                            format: 'Video 12s',
                            channel: 'Meta',
                            campaign: 'Retargeting Q2',
                            adSet: 'Cart Abandoners',
                            impressions: '980K',
                            spend: '₹52K',
                            revenue: '₹1.5L',
                            roas: 2.88,
                            ctr: 4.2,
                            cvr: 3.4,
                            age: '18 days',
                            elements: ['Product demo', 'Text captions', 'Bright colors']
                          },
                        ],
                        lastMonth: businessModel === 'leadgen' ? [
                          { 
                            name: 'Static - "ROI Calculator Lead Magnet"',
                            format: 'Static Image',
                            channel: 'Meta',
                            campaign: 'Lead Magnet - Industry Case Studies',
                            adSet: 'Finance Decision Makers',
                            impressions: '2.4M',
                            spend: '₹92K',
                            leads: 115,
                            cpl: 800,
                            ctr: 4.9,
                            cvr: 20.5,
                            age: '45 days',
                            elements: ['Calculator visual', 'Value prop', 'CTA button']
                          },
                          { 
                            name: 'Video - "How Our Service Works"',
                            format: 'Video 20s',
                            channel: 'Google',
                            campaign: 'Educational Content - Service Discovery',
                            adSet: 'Research Phase Prospects',
                            impressions: '1.6M',
                            spend: '₹78K',
                            leads: 96,
                            cpl: 813,
                            ctr: 4.5,
                            cvr: 19.8,
                            age: '38 days',
                            elements: ['Educational', 'Step-by-step', 'Professional']
                          },
                          { 
                            name: 'Carousel - "Client Success Stories"',
                            format: 'Carousel 5-card',
                            channel: 'Meta',
                            campaign: 'Social Proof - Case Studies',
                            adSet: 'Warm Prospects',
                            impressions: '1.4M',
                            spend: '₹72K',
                            leads: 88,
                            cpl: 818,
                            ctr: 4.1,
                            cvr: 18.5,
                            age: '42 days',
                            elements: ['Client logos', 'Results metrics', 'Testimonials']
                          },
                        ] : [
                          { 
                            name: 'Static - "Diwali Festival Sale Banner"',
                            format: 'Static Image',
                            channel: 'Meta',
                            campaign: 'Festival Campaigns',
                            adSet: 'Diwali Shoppers',
                            impressions: '2.4M',
                            spend: '₹92K',
                            revenue: '₹3.2L',
                            roas: 3.48,
                            ctr: 4.9,
                            cvr: 3.9,
                            age: '45 days',
                            elements: ['Festival theme', 'Urgency messaging', 'Price discount']
                          },
                          { 
                            name: 'Video - "How It Works" Tutorial',
                            format: 'Video 20s',
                            channel: 'Google',
                            campaign: 'Educational Content',
                            adSet: 'Discovery Ads',
                            impressions: '1.6M',
                            spend: '₹78K',
                            revenue: '₹2.4L',
                            roas: 3.08,
                            ctr: 4.5,
                            cvr: 3.6,
                            age: '38 days',
                            elements: ['Educational', 'Step-by-step', 'Voice-over']
                          },
                          { 
                            name: 'Carousel - "Customer Testimonials"',
                            format: 'Carousel 5-card',
                            channel: 'Meta',
                            campaign: 'Social Proof Campaign',
                            adSet: 'Warm Audiences',
                            impressions: '1.4M',
                            spend: '₹72K',
                            revenue: '₹2.0L',
                            roas: 2.78,
                            ctr: 4.1,
                            cvr: 3.2,
                            age: '42 days',
                            elements: ['Social proof', 'Real customers', 'Star ratings']
                          },
                        ],
                        last3Months: businessModel === 'leadgen' ? [
                          { 
                            name: 'Video - "Client Transformation Story"',
                            format: 'Video 18s',
                            channel: 'Meta',
                            campaign: 'Success Stories - Lead Gen',
                            adSet: 'Enterprise Prospects',
                            impressions: '5.2M',
                            spend: '₹2.4L',
                            leads: 298,
                            cpl: 805,
                            ctr: 5.2,
                            cvr: 21.2,
                            age: '78 days',
                            elements: ['Client results', 'ROI metrics', 'Before/after']
                          },
                          { 
                            name: 'Carousel - "Service Feature Breakdown"',
                            format: 'Carousel 6-card',
                            channel: 'Google',
                            campaign: 'Service Education - Lead Magnet',
                            adSet: 'High Intent Searches',
                            impressions: '4.8M',
                            spend: '₹2.1L',
                            leads: 260,
                            cpl: 808,
                            ctr: 4.8,
                            cvr: 20.5,
                            age: '68 days',
                            elements: ['Feature highlights', 'Benefit-driven', 'Professional']
                          },
                          { 
                            name: 'Video - "Founder Story & Vision"',
                            format: 'Video 25s',
                            channel: 'Meta',
                            campaign: 'Brand Awareness - Thought Leadership',
                            adSet: 'Lookalike - High-Intent Leads',
                            impressions: '3.9M',
                            spend: '₹1.8L',
                            leads: 222,
                            cpl: 811,
                            ctr: 4.4,
                            cvr: 19.8,
                            age: '85 days',
                            elements: ['Brand story', 'Thought leadership', 'Credibility']
                          },
                        ] : [
                          { 
                            name: 'Video - "Before & After Transformation"',
                            format: 'Video 18s',
                            channel: 'Meta',
                            campaign: 'Transformation Stories',
                            adSet: 'Interest Targeting',
                            impressions: '5.2M',
                            spend: '₹2.4L',
                            revenue: '₹8.6L',
                            roas: 3.58,
                            ctr: 5.2,
                            cvr: 4.4,
                            age: '78 days',
                            elements: ['Transformation', 'Emotional hook', 'Results-focused']
                          },
                          { 
                            name: 'Carousel - "Product Feature Breakdown"',
                            format: 'Carousel 6-card',
                            channel: 'Google',
                            campaign: 'Product Education',
                            adSet: 'High Intent Keywords',
                            impressions: '4.8M',
                            spend: '₹2.1L',
                            revenue: '₹7.2L',
                            roas: 3.43,
                            ctr: 4.8,
                            cvr: 4.0,
                            age: '68 days',
                            elements: ['Feature highlights', 'Benefit-driven', 'Professional']
                          },
                          { 
                            name: 'Video - "Founder Story & Mission"',
                            format: 'Video 25s',
                            channel: 'Meta',
                            campaign: 'Brand Awareness',
                            adSet: 'Lookalike Audiences',
                            impressions: '3.9M',
                            spend: '₹1.8L',
                            revenue: '₹5.8L',
                            roas: 3.22,
                            ctr: 4.4,
                            cvr: 3.7,
                            age: '85 days',
                            elements: ['Brand story', 'Authenticity', 'Emotional']
                          },
                        ],
                        last6Months: businessModel === 'leadgen' ? [
                          { 
                            name: 'Video - "Industry Report Launch"',
                            format: 'Video 15s',
                            channel: 'Meta',
                            campaign: 'Content Marketing - Lead Magnets',
                            adSet: 'Industry Professionals',
                            impressions: '8.4M',
                            spend: '₹4.2L',
                            leads: 522,
                            cpl: 805,
                            ctr: 5.6,
                            cvr: 22.5,
                            age: '152 days',
                            elements: ['Exclusivity', 'Value prop', 'Credibility']
                          },
                          { 
                            name: 'Carousel - "Complete Service Suite"',
                            format: 'Carousel 8-card',
                            channel: 'Google',
                            campaign: 'Service Showcase - Enterprise',
                            adSet: 'High-Value Keywords',
                            impressions: '7.6M',
                            spend: '₹3.8L',
                            leads: 471,
                            cpl: 807,
                            ctr: 5.1,
                            cvr: 21.8,
                            age: '168 days',
                            elements: ['Comprehensive', 'Service benefits', 'Professional']
                          },
                          { 
                            name: 'Video - "Industry Expert Interview"',
                            format: 'Video 22s',
                            channel: 'Meta',
                            campaign: 'Thought Leadership Content',
                            adSet: 'Decision Maker Targeting',
                            impressions: '6.2M',
                            spend: '₹3.2L',
                            leads: 396,
                            cpl: 808,
                            ctr: 4.7,
                            cvr: 20.2,
                            age: '145 days',
                            elements: ['Expert endorsement', 'Authority', 'High quality']
                          },
                        ] : [
                          { 
                            name: 'Video - "Limited Edition Launch"',
                            format: 'Video 15s',
                            channel: 'Meta',
                            campaign: 'Product Launches',
                            adSet: 'VIP Customers',
                            impressions: '8.4M',
                            spend: '₹4.2L',
                            revenue: '₹15.8L',
                            roas: 3.76,
                            ctr: 5.6,
                            cvr: 4.8,
                            age: '152 days',
                            elements: ['Exclusivity', 'FOMO', 'Product showcase']
                          },
                          { 
                            name: 'Carousel - "Complete Collection Tour"',
                            format: 'Carousel 8-card',
                            channel: 'Google',
                            campaign: 'Showcase Shopping',
                            adSet: 'Smart Bidding',
                            impressions: '7.6M',
                            spend: '₹3.8L',
                            revenue: '₹13.2L',
                            roas: 3.47,
                            ctr: 5.1,
                            cvr: 4.3,
                            age: '168 days',
                            elements: ['Comprehensive', 'Variety showcase', 'Lifestyle']
                          },
                          { 
                            name: 'Video - "Celebrity Collaboration Reveal"',
                            format: 'Video 22s',
                            channel: 'Meta',
                            campaign: 'Influencer Collaborations',
                            adSet: 'Celebrity Fans',
                            impressions: '6.2M',
                            spend: '₹3.2L',
                            revenue: '₹10.4L',
                            roas: 3.25,
                            ctr: 4.7,
                            cvr: 3.9,
                            age: '145 days',
                            elements: ['Celebrity endorsement', 'Hype', 'High production']
                          },
                        ],
                      };
                      
                      return creativesByPeriod[creativePeriod].map((creative, idx) => (
                        <TopCreativeCard key={idx} creative={creative} idx={idx} businessModel={businessModel} onViewCreative={setPreviewCreative} />
                      ));
                    })()}
                  </div>
                </div>

                {/* Format Performance Detailed */}
                <div className="bg-white rounded-xl p-5 border border-blue-100/40 shadow-[0_1px_4px_rgba(32,76,199,0.06)]">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    <span className="w-1 h-4 bg-brand rounded-full" />
                    Performance by Creative Format
                  </h3>
                  <div className="space-y-3">
                    {(businessModel === 'leadgen' ? [
                      { 
                        format: 'Short-Form Video (15s)', 
                        count: 42,
                        status: 'excellent',
                        metrics: {
                          impressions: '8.4M',
                          spend: '₹4.2L',
                          hookRate: 68.5,
                          holdRate: 42.3,
                          ctr: 4.8,
                          cvr: 21.2,
                          cpl: '₹785',
                          leads: 535
                        },
                        insights: [
                          'Hook rate 68.5% (industry avg: 45%)',
                          'Best performing: Client testimonial with UGC style',
                          'Optimal length: 12-15 seconds for B2B'
                        ],
                        recommendation: 'Increase budget allocation by 30%. Create 8 more variations with founder/client testimonial UGC-style videos.'
                      },
                      { 
                        format: 'Carousel Ads (3-5 cards)', 
                        count: 38,
                        status: 'good',
                        metrics: {
                          impressions: '6.8M',
                          spend: '₹3.6L',
                          hookRate: 52.8,
                          holdRate: 64.2,
                          ctr: 3.9,
                          cvr: 19.5,
                          cpl: '₹815',
                          leads: 442
                        },
                        insights: [
                          'High engagement on cards 2-3 (64% swipe-through)',
                          'Case studies perform +32% better than service features',
                          'ROI-focused headlines driving +18% CTR'
                        ],
                        recommendation: 'Focus on 4-card case study carousels. Test client logos vs metrics. A/B test value prop formulas.'
                      },
                      { 
                        format: 'Static Image', 
                        count: 52,
                        status: 'average',
                        metrics: {
                          impressions: '12.2M',
                          spend: '₹5.8L',
                          hookRate: 38.2,
                          holdRate: 100,
                          ctr: 2.1,
                          cvr: 16.8,
                          cpl: '₹1,085',
                          leads: 535
                        },
                        insights: [
                          'Underperforming video by 56% in CTR',
                          'Generic service images: worst performance',
                          'Data visualization images: +42% better engagement'
                        ],
                        recommendation: 'Reduce static image budget by 40%. Replace with video. Keep only top 15 data/results-focused images.'
                      },
                    ] : [
                      { 
                        format: 'Short-Form Video (15s)', 
                        count: 42,
                        status: 'excellent',
                        metrics: {
                          impressions: '8.4M',
                          spend: '₹4.2L',
                          hookRate: 68.5,
                          holdRate: 42.3,
                          ctr: 4.8,
                          cvr: 3.2,
                          cpa: '₹850',
                          roas: 2.85
                        },
                        insights: [
                          'Hook rate 68.5% (industry avg: 45%)',
                          'Best performing: Product demo with UGC style',
                          'Optimal length: 12-15 seconds'
                        ],
                        recommendation: 'Increase budget allocation by 30%. Create 8 more variations with UGC-style product demos.'
                      },
                      { 
                        format: 'Carousel Ads (3-5 cards)', 
                        count: 38,
                        status: 'good',
                        metrics: {
                          impressions: '6.8M',
                          spend: '₹3.6L',
                          hookRate: 52.8,
                          holdRate: 64.2,
                          ctr: 3.9,
                          cvr: 2.8,
                          cpa: '₹980',
                          roas: 2.42
                        },
                        insights: [
                          'High engagement on cards 2-3 (64% swipe-through)',
                          'Collections perform +32% better than single products',
                          'Benefit-focused headlines driving +18% CTR'
                        ],
                        recommendation: 'Focus on 4-card collections. Test lifestyle images vs product-only. A/B test headline formulas.'
                      },
                      { 
                        format: 'Static Image', 
                        count: 52,
                        status: 'average',
                        metrics: {
                          impressions: '12.2M',
                          spend: '₹5.8L',
                          hookRate: 38.2,
                          holdRate: 100,
                          ctr: 2.1,
                          cvr: 1.6,
                          cpa: '₹1,420',
                          roas: 1.68
                        },
                        insights: [
                          'Underperforming video by 56% in CTR',
                          'Product-on-white background: worst performance',
                          'Lifestyle context images: +42% better engagement'
                        ],
                        recommendation: 'Reduce static image budget by 40%. Replace with video. Keep only top 15 lifestyle-context images.'
                      },
                    ]).map((format, idx) => (
                      <CreativeFormatCard key={idx} format={format} businessModel={businessModel} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'fatigue' && (
              <div className="space-y-5">
                {/* Creative Fatigue Analysis */}
                <div className="space-y-3">
                  {[
                    ...(businessModel === 'leadgen' ? [
                    {
                      name: 'Static - "ROI Calculator Lead Magnet"',
                      channel: 'Meta',
                      campaign: 'Lead Magnet - Case Studies',
                      adSet: 'Retargeting - Website Visitors',
                      age: '28 days',
                      impressions: '4.2M',
                      status: 'severe',
                      metrics: {
                        ctrDecline: -42,
                        cvrDecline: -38,
                        cplIncrease: +58,
                        frequencyCap: 8.4
                      },
                      signs: [
                        'CTR dropped from 3.2% to 1.8% in 14 days',
                        'Frequency at 8.4 (optimal: <3.5)',
                        'CPL increased by 58% in 2 weeks (₹650 → ₹1,027)',
                        'Form abandonment up 45%'
                      ],
                      action: 'Pause immediately. Replace with fresh creative. Audience has seen 8.4x on average.'
                    },
                  ] : [
                    {
                      name: 'Static - "50% Off Flash Sale Banner"',
                      channel: 'Meta',
                      campaign: 'Flash Sale Q2',
                      adSet: 'Retargeting - Past Purchasers',
                      age: '28 days',
                      impressions: '4.2M',
                      status: 'severe',
                      metrics: {
                        ctrDecline: -42,
                        cvrDecline: -38,
                        cpaIncrease: +58,
                        frequencyCap: 8.4
                      },
                      signs: [
                        'CTR dropped from 3.2% to 1.8% in 14 days',
                        'Frequency at 8.4 (optimal: <3.5)',
                        'CPA increased by 58% in 2 weeks',
                        'Negative feedback up 120%'
                      ],
                      action: 'Pause immediately. Replace with fresh creative. Audience has seen 8.4x on average.'
                    }]),
                    ...(businessModel === 'leadgen' ? [{
                      name: 'Video - "Service Demo Walkthrough"',
                      channel: 'Google',
                      campaign: 'Video Campaign - Founder Testimonials',
                      adSet: 'YouTube Discovery',
                      age: '21 days',
                      impressions: '2.8M',
                      status: 'moderate',
                      metrics: {
                        ctrDecline: -28,
                        cvrDecline: -22,
                        cplIncrease: +32,
                        frequencyCap: 5.8
                      },
                      signs: [
                        'CTR declining steadily (4.2% → 3.0%)',
                        'Hook rate dropped from 72% to 58%',
                        'Watch time decreased by 18%',
                        'Frequency climbing (5.8)'
                      ],
                      action: 'Create 3 variations with different value props. Refresh messaging. Rotate every 10 days.'
                    }] : [{
                      name: 'Video - "Product Launch Announcement"',
                      channel: 'Google',
                      campaign: 'Product Launch Campaign',
                      adSet: 'Video Discovery',
                      age: '21 days',
                      impressions: '2.8M',
                      status: 'moderate',
                      metrics: {
                        ctrDecline: -28,
                        cvrDecline: -22,
                        cpaIncrease: +32,
                        frequencyCap: 5.8
                      },
                      signs: [
                        'CTR declining steadily (4.2% → 3.0%)',
                        'Hook rate dropped from 72% to 58%',
                        'Engagement time decreased by 18%',
                        'Frequency climbing (5.8)'
                      ],
                      action: 'Create 3 variations with different hooks. Refresh messaging. Rotate every 10 days.'
                    }]),
                    ...(businessModel === 'leadgen' ? [{
                      name: 'Carousel - "Client Success Gallery"',
                      channel: 'Meta',
                      campaign: 'Case Studies - Lead Magnet',
                      adSet: 'Lookalike - High-Intent Leads',
                      age: '18 days',
                      impressions: '1.6M',
                      status: 'early',
                      metrics: {
                        ctrDecline: -15,
                        cvrDecline: -12,
                        cplIncrease: +18,
                        frequencyCap: 4.2
                      },
                      signs: [
                        'Early decline signals detected',
                        'Swipe-through rate down 12%',
                        'CPL starting to creep up',
                        'Performance plateau at day 15'
                      ],
                      action: 'Proactively prepare 2-3 variations. Update case studies. Refresh client testimonials.'
                    }] : [{
                      name: 'Carousel - "Top Trending Products"',
                      channel: 'Meta',
                      campaign: 'Trending Collections',
                      adSet: 'Lookalike - Top Buyers',
                      age: '18 days',
                      impressions: '1.6M',
                      status: 'early',
                      metrics: {
                        ctrDecline: -15,
                        cvrDecline: -12,
                        cpaIncrease: +18,
                        frequencyCap: 4.2
                      },
                      signs: [
                        'Early decline signals detected',
                        'Swipe-through rate down 12%',
                        'CPA starting to creep up',
                        'Performance plateau at day 15'
                      ],
                      action: 'Proactively prepare 2-3 variations. Update product selection. Refresh imagery.'
                    }]),
                  ].map((creative, idx) => (
                    <FatigueCreativeCard key={idx} creative={creative} businessModel={businessModel} />
                  ))}
                </div>

                {/* Refresh Schedule */}
                <RefreshScheduleCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Funnel Analysis Drawer (Enhanced) — Portal-rendered
export function FunnelDrawer({ isOpen, onClose, businessModel = 'ecommerce' }: DrawerProps & { businessModel?: 'ecommerce' | 'leadgen' }) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'device' | 'optimization'>('overview');
  const [expandedStages, setExpandedStages] = useState<{[key: number]: boolean}>({});
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'meta' | 'google'>('all');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>Funnel Analysis Intelligence</h2>
                <p className="text-gray-500" style={{ fontSize: '13px' }}>Deep conversion funnel analysis with actionable optimization opportunities</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Funnel Breakdown', icon: BarChart3 },
              { id: 'device', label: 'Device & Channel', icon: Smartphone },
              // { id: 'optimization', label: 'Optimization Plan', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-white text-brand border-t border-x border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Channel Filter Dropdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 p-3 bg-brand-light rounded-xl border border-brand/10">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                          <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>M</span>
                        </div>
                        <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Meta</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                          <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>G</span>
                        </div>
                        <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Google</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <Globe className="w-5 h-5 text-brand" />
                        <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Website Analytics</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as 'all' | 'meta' | 'google')}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-brand/30 focus:outline-none focus:border-brand transition-colors cursor-pointer"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    >
                      <option value="all">All Channels</option>
                      <option value="meta">Meta Only</option>
                      <option value="google">Google Only</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Simplified Funnel - 5 Key Stages */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Customer Journey Overview</h3>
                    <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: '13px' }}>
                      {selectedChannel === 'all' && (
                        <>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-brand rounded-full" />
                            Meta
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full" />
                            Google
                          </span>
                        </>
                      )}
                      {selectedChannel === 'meta' && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-brand rounded-full" />
                          Meta Only
                        </span>
                      )}
                      {selectedChannel === 'google' && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                          Google Only
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {(() => {
                      // Define channel-specific data
                      const funnelData = businessModel === 'ecommerce' ? {
                        all: [
                          { 
                            stage: 'Ad Impressions',
                            count: 2400000,
                            percentage: 100,
                            platform: 'both',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false,
                            meta: { count: 1500000, percentage: 62.5 },
                            google: { count: 900000, percentage: 37.5 }
                          },
                          { 
                            stage: 'Website Visits',
                            count: 68500,
                            percentage: 2.85,
                            platform: 'both',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '3.0% CTR (Meta) • 2.7% CTR (Google)',
                            insight: 'Strong ad performance across both platforms',
                            meta: { count: 45000, percentage: 65.7, convRate: 3.0 },
                            google: { count: 23500, percentage: 34.3, convRate: 2.61 }
                          },
                          { 
                            stage: 'Product Views',
                            count: 45200,
                            percentage: 1.88,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-purple-500',
                            dropRate: 34,
                            detail: '34% visitors leave without viewing products',
                            insight: 'Landing page needs optimization',
                            meta: { count: 29800, percentage: 65.9, convRate: 66.2 },
                            google: { count: 15400, percentage: 34.1, convRate: 65.5 }
                          },
                          { 
                            stage: 'Add to Cart',
                            count: 12800,
                            percentage: 0.53,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-orange-500',
                            dropRate: 72,
                            detail: '72% leave without adding to cart',
                            insight: 'Critical: Product page friction point',
                            benchmark: 35,
                            meta: { count: 8400, percentage: 65.6, convRate: 28.2 },
                            google: { count: 4400, percentage: 34.4, convRate: 28.6 }
                          },
                          { 
                            stage: 'Purchase Complete',
                            count: 2100,
                            percentage: 0.0875,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-green-500',
                            dropRate: 84,
                            detail: '84% cart abandonment',
                            insight: 'Checkout optimization needed urgently',
                            benchmark: 30,
                            meta: { count: 1380, percentage: 65.7, convRate: 16.4 },
                            google: { count: 720, percentage: 34.3, convRate: 16.4 }
                          },
                        ],
                        meta: [
                          { 
                            stage: 'Ad Impressions',
                            count: 1500000,
                            percentage: 100,
                            platform: 'meta',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false
                          },
                          { 
                            stage: 'Website Visits',
                            count: 45000,
                            percentage: 3.0,
                            platform: 'meta',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '3.0% CTR from Meta Ads',
                            insight: 'Meta campaigns showing strong engagement'
                          },
                          { 
                            stage: 'Product Views',
                            count: 29800,
                            percentage: 66.2,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-purple-500',
                            dropRate: 34,
                            detail: '34% Meta visitors leave without viewing',
                            insight: 'Meta landing pages need optimization'
                          },
                          { 
                            stage: 'Add to Cart',
                            count: 8400,
                            percentage: 28.2,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-orange-500',
                            dropRate: 72,
                            detail: '72% Meta traffic drops at product page',
                            insight: 'Product pages not resonating with Meta audience',
                            benchmark: 35
                          },
                          { 
                            stage: 'Purchase Complete',
                            count: 1380,
                            percentage: 16.4,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-green-500',
                            dropRate: 84,
                            detail: '84% cart abandonment from Meta traffic',
                            insight: 'Checkout optimization critical for Meta conversions',
                            benchmark: 30
                          },
                        ],
                        google: [
                          { 
                            stage: 'Ad Impressions',
                            count: 900000,
                            percentage: 100,
                            platform: 'google',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false
                          },
                          { 
                            stage: 'Website Visits',
                            count: 23500,
                            percentage: 2.61,
                            platform: 'google',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '2.7% CTR from Google Ads',
                            insight: 'Google search intent driving quality traffic'
                          },
                          { 
                            stage: 'Product Views',
                            count: 15400,
                            percentage: 65.5,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-purple-500',
                            dropRate: 34,
                            detail: '34% Google visitors leave without viewing',
                            insight: 'Search landing pages need better alignment'
                          },
                          { 
                            stage: 'Add to Cart',
                            count: 4400,
                            percentage: 28.6,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-orange-500',
                            dropRate: 71,
                            detail: '71% Google traffic drops at product page',
                            insight: 'Product pages not matching search intent',
                            benchmark: 35
                          },
                          { 
                            stage: 'Purchase Complete',
                            count: 720,
                            percentage: 16.4,
                            platform: 'website',
                            status: 'critical',
                            color: 'bg-green-500',
                            dropRate: 84,
                            detail: '84% cart abandonment from Google traffic',
                            insight: 'High-intent searchers abandoning at checkout',
                            benchmark: 30
                          },
                        ]
                      } : {
                        // LEAD GENERATION FUNNEL
                        all: [
                          { 
                            stage: 'Ad Impressions',
                            count: 1800000,
                            percentage: 100,
                            platform: 'both',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false,
                            meta: { count: 1200000, percentage: 66.7 },
                            google: { count: 600000, percentage: 33.3 }
                          },
                          { 
                            stage: 'Website Visits',
                            count: 52800,
                            percentage: 2.93,
                            platform: 'both',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '2.9% CTR (Meta) • 3.0% CTR (Google)',
                            insight: 'Strong ad engagement from B2B audiences',
                            meta: { count: 34800, percentage: 65.9, convRate: 2.9 },
                            google: { count: 18000, percentage: 34.1, convRate: 3.0 }
                          },
                          { 
                            stage: 'Form Views',
                            count: 18480,
                            percentage: 1.03,
                            platform: 'website',
                            status: 'good',
                            color: 'bg-purple-500',
                            dropRate: 65,
                            detail: '35% of visitors view lead form pages',
                            insight: 'Solid landing page engagement',
                            meta: { count: 12180, percentage: 65.9, convRate: 35.0 },
                            google: { count: 6300, percentage: 34.1, convRate: 35.0 }
                          },
                          { 
                            stage: 'Form Submissions',
                            count: 2772,
                            percentage: 0.154,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-orange-500',
                            dropRate: 85,
                            detail: '15% form completion rate',
                            insight: 'Form abandonment needs attention',
                            benchmark: 20,
                            meta: { count: 1827, percentage: 65.9, convRate: 15.0 },
                            google: { count: 945, percentage: 34.1, convRate: 15.0 }
                          },
                          { 
                            stage: 'High-Intent Leads',
                            count: 1940,
                            percentage: 0.108,
                            platform: 'website',
                            status: 'excellent',
                            color: 'bg-green-500',
                            dropRate: 30,
                            detail: '70% lead quality rate',
                            insight: 'Excellent lead qualification - most submissions are high-quality',
                            benchmark: 65,
                            meta: { count: 1278, percentage: 65.9, convRate: 70.0 },
                            google: { count: 662, percentage: 34.1, convRate: 70.0 }
                          },
                        ],
                        meta: [
                          { 
                            stage: 'Ad Impressions',
                            count: 1200000,
                            percentage: 100,
                            platform: 'meta',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false
                          },
                          { 
                            stage: 'Website Visits',
                            count: 34800,
                            percentage: 2.9,
                            platform: 'meta',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '2.9% CTR from Meta Ads',
                            insight: 'Meta campaigns engaging B2B decision-makers well'
                          },
                          { 
                            stage: 'Form Views',
                            count: 12180,
                            percentage: 35.0,
                            platform: 'website',
                            status: 'good',
                            color: 'bg-purple-500',
                            dropRate: 65,
                            detail: '35% Meta visitors reach form pages',
                            insight: 'Strong landing page to form navigation'
                          },
                          { 
                            stage: 'Form Submissions',
                            count: 1827,
                            percentage: 15.0,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-orange-500',
                            dropRate: 85,
                            detail: '15% form completion from Meta traffic',
                            insight: 'Form optimization needed for Meta audience',
                            benchmark: 20
                          },
                          { 
                            stage: 'High-Intent Leads',
                            count: 1278,
                            percentage: 70.0,
                            platform: 'website',
                            status: 'excellent',
                            color: 'bg-green-500',
                            dropRate: 30,
                            detail: '70% of Meta submissions are qualified',
                            insight: 'Excellent targeting - Meta delivers quality leads',
                            benchmark: 65
                          },
                        ],
                        google: [
                          { 
                            stage: 'Ad Impressions',
                            count: 600000,
                            percentage: 100,
                            platform: 'google',
                            status: 'baseline',
                            color: 'bg-brand',
                            showDetails: false
                          },
                          { 
                            stage: 'Website Visits',
                            count: 18000,
                            percentage: 3.0,
                            platform: 'google',
                            status: 'good',
                            color: 'bg-brand',
                            detail: '3.0% CTR from Google Ads',
                            insight: 'High-intent search traffic performing well'
                          },
                          { 
                            stage: 'Form Views',
                            count: 6300,
                            percentage: 35.0,
                            platform: 'website',
                            status: 'good',
                            color: 'bg-purple-500',
                            dropRate: 65,
                            detail: '35% Google visitors reach form pages',
                            insight: 'Search intent aligns with landing content'
                          },
                          { 
                            stage: 'Form Submissions',
                            count: 945,
                            percentage: 15.0,
                            platform: 'website',
                            status: 'warning',
                            color: 'bg-orange-500',
                            dropRate: 85,
                            detail: '15% form completion from Google traffic',
                            insight: 'Form friction affecting search traffic',
                            benchmark: 20
                          },
                          { 
                            stage: 'High-Intent Leads',
                            count: 662,
                            percentage: 70.0,
                            platform: 'website',
                            status: 'excellent',
                            color: 'bg-green-500',
                            dropRate: 30,
                            detail: '70% of Google submissions are qualified',
                            insight: 'Search intent driving high-quality leads',
                            benchmark: 65
                          },
                        ]
                      };

                      const stages = funnelData[selectedChannel];
                      
                      return (
                        <div className="space-y-3">
                          {stages.map((stage, idx) => (
                            <FunnelStageCard 
                              key={idx}
                              stage={stage}
                              idx={idx}
                              selectedChannel={selectedChannel}
                              nextStage={stages[idx + 1]}
                              isExpanded={expandedStages[idx] || false}
                              onToggle={() => setExpandedStages(prev => ({
                                ...prev,
                                [idx]: !prev[idx]
                              }))}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Overall Health Summary - Simplified */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 text-center">
                    <p className="text-gray-500 mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>64/100</p>
                    <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>Funnel Health</p>
                    <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>Needs Attention</p>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 text-center">
                    <p className="text-gray-600 mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>₹28L</p>
                    <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>Lost Revenue</p>
                    <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>per month</p>
                  </div>
                  <div className="bg-brand-light rounded-xl border border-brand/20 p-4 text-center">
                    <p className="text-brand mb-1" style={{ fontSize: '24px', fontWeight: 700 }}>+42%</p>
                    <p className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>Potential Gain</p>
                    <p className="text-brand mt-1" style={{ fontSize: '13px' }}>if optimized</p>
                  </div>
                </div>

                {/* Quick Insights */}
                <div className="bg-brand-light rounded-xl border border-brand/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-brand" />
                    <h4 className="text-brand-dark" style={{ fontSize: '14px', fontWeight: 600 }}>Key Insights</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: 'Product pages losing 72% of visitors', icon: Globe, color: 'text-gray-500' },
                      { text: 'Checkout abandonment at 84% - industry avg is 30%', icon: Globe, color: 'text-gray-500' },
                      { text: 'Mobile conversion 38% lower than desktop', icon: Smartphone, color: 'text-gray-500' },
                    ].map((insight, idx) => {
                      const Icon = insight.icon;
                      return (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                          <Icon className={`w-3.5 h-3.5 mt-0.5 ${insight.color}`} />
                          <p className="text-gray-700" style={{ fontSize: '13px' }}>{insight.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'device' && (
              <div className="space-y-6">
                {/* Device Comparison */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Funnel Performance by Device</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        device: 'Mobile',
                        icon: Smartphone,
                        traffic: 62,
                        overallConv: businessModel === 'leadgen' ? 3.2 : 0.9,
                        stages: businessModel === 'leadgen' ? [
                          { stage: 'Ad to Website', rate: 92.8, status: 'warning' },
                          { stage: 'Website to Form View', rate: 48.2, status: 'critical' },
                          { stage: 'Form View to Start', rate: 52.4, status: 'warning' },
                          { stage: 'Form Start to Submit', rate: 38.6, status: 'critical' },
                          { stage: 'Submit to Qualified', rate: 72.8, status: 'good' },
                        ] : [
                          { stage: 'Click to Visit', rate: 92.8, status: 'warning' },
                          { stage: 'Visit to Product', rate: 58.2, status: 'critical' },
                          { stage: 'Product to Cart', rate: 22.4, status: 'critical' },
                          { stage: 'Cart to Checkout', rate: 42.8, status: 'critical' },
                          { stage: 'Checkout to Payment', rate: 45.2, status: 'critical' },
                          { stage: 'Payment to Order', rate: 58.6, status: 'warning' },
                        ],
                        criticalIssues: businessModel === 'leadgen' ? [
                          'Form View to Start: 52% vs 68% desktop',
                          'Form abandonment: 61% vs 42% desktop',
                          'Mobile form UX issues: 2.5x higher drop-off'
                        ] : [
                          'Product to Cart: 22% vs 35% desktop',
                          'Checkout abandonment: 57% vs 38% desktop',
                          'Payment form errors: 3x higher than desktop'
                        ]
                      },
                      {
                        device: 'Desktop',
                        icon: Monitor,
                        traffic: 38,
                        overallConv: businessModel === 'leadgen' ? 5.8 : 1.8,
                        stages: businessModel === 'leadgen' ? [
                          { stage: 'Ad to Website', rate: 96.2, status: 'good' },
                          { stage: 'Website to Form View', rate: 68.4, status: 'good' },
                          { stage: 'Form View to Start', rate: 68.2, status: 'good' },
                          { stage: 'Form Start to Submit', rate: 58.4, status: 'good' },
                          { stage: 'Submit to Qualified', rate: 78.2, status: 'good' },
                        ] : [
                          { stage: 'Click to Visit', rate: 96.2, status: 'good' },
                          { stage: 'Visit to Product', rate: 78.4, status: 'good' },
                          { stage: 'Product to Cart', rate: 35.8, status: 'good' },
                          { stage: 'Cart to Checkout', rate: 62.4, status: 'good' },
                          { stage: 'Checkout to Payment', rate: 58.2, status: 'warning' },
                          { stage: 'Payment to Order', rate: 72.8, status: 'good' },
                        ],
                        criticalIssues: businessModel === 'leadgen' ? [
                          'Form Start to Submit: 58% (room for improvement)',
                          'Overall strong performance across stages'
                        ] : [
                          'Checkout to Payment: 58% (room for improvement)',
                          'Overall strong performance across stages'
                        ]
                      },
                    ].map((device, idx) => {
                      const Icon = device.icon;
                      return (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-5 h-5 text-gray-700" />
                            <div className="flex-1">
                              <h4 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{device.device}</h4>
                              <p className="text-gray-600" style={{ fontSize: '13px' }}>{device.traffic}% of traffic</p>
                            </div>
                            <div className="text-right">
                              <p className={`${idx === 0 ? 'text-gray-500' : 'text-brand'}`} style={{ fontSize: '20px', fontWeight: 700 }}>
                                {device.overallConv}%
                              </p>
                              <p className="text-gray-500" style={{ fontSize: '13px' }}>Conv Rate</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            {device.stages.map((stage, i) => (
                              <div key={i}>
                                <div className="flex items-center justify-between mb-1" style={{ fontSize: '13px' }}>
                                  <span className="text-gray-700">{stage.stage}</span>
                                  <span className={`${
                                    stage.status === 'critical' ? 'text-gray-500' :
                                    stage.status === 'warning' ? 'text-gray-500' :
                                    'text-brand'
                                  }`} style={{ fontWeight: 600 }}>
                                    {stage.rate}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      stage.status === 'critical' ? 'bg-gray-400' :
                                      stage.status === 'warning' ? 'bg-gray-400' :
                                      'bg-brand'
                                    } transition-all duration-500`}
                                    style={{ width: `${stage.rate}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-gray-700 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>Critical Issues:</p>
                            <div className="space-y-1">
                              {device.criticalIssues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5" />
                                  <p className="text-gray-700" style={{ fontSize: '13px' }}>{issue}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-4 bg-brand-light rounded-lg border border-brand/20">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-brand mt-0.5" />
                      <div>
                        <p className="text-brand-dark mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                          {businessModel === 'leadgen' ? 'Lead Generation Impact' : 'Revenue Impact'}
                        </p>
                        <p className="text-brand-dark" style={{ fontSize: '13px' }}>
                          {businessModel === 'leadgen' ? (
                            <>
                              Improving mobile funnel to match desktop performance would add <span style={{ fontWeight: 700 }}>+385 leads/month</span>. 
                              Mobile accounts for 62% of traffic but only 42% of lead conversions.
                            </>
                          ) : (
                            <>
                              Improving mobile funnel to match desktop performance would add <span style={{ fontWeight: 700 }}>₹12.8L/month revenue</span>. 
                              Mobile accounts for 62% of traffic but only 38% of revenue.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Channel Performance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Funnel Performance by Traffic Channel</h3>
                  <div className="space-y-3">
                    {(businessModel === 'leadgen' ? [
                      {
                        channel: 'Google Search (Brand)',
                        traffic: 18,
                        convRate: 12.4,
                        avgOrderValue: '₹1,250 CPL',
                        quality: 'Excellent',
                        dropoffPoint: 'Minimal drop-offs',
                        color: 'green'
                      },
                      {
                        channel: 'Meta Retargeting',
                        traffic: 24,
                        convRate: 8.2,
                        avgOrderValue: '₹1,580 CPL',
                        quality: 'Good',
                        dropoffPoint: 'Form abandonment: 42%',
                        color: 'blue'
                      },
                      {
                        channel: 'Google Performance Max',
                        traffic: 22,
                        convRate: 5.8,
                        avgOrderValue: '₹2,120 CPL',
                        quality: 'Average',
                        dropoffPoint: 'Landing to form: 58% drop',
                        color: 'amber'
                      },
                      {
                        channel: 'Meta Prospecting',
                        traffic: 36,
                        convRate: 2.4,
                        avgOrderValue: '₹3,480 CPL',
                        quality: 'Poor',
                        dropoffPoint: 'Landing to form view: 78% drop',
                        color: 'red'
                      },
                    ] : [
                      {
                        channel: 'Google Search (Brand)',
                        traffic: 18,
                        convRate: 4.2,
                        avgOrderValue: '₹2,850',
                        quality: 'Excellent',
                        dropoffPoint: 'Minimal drop-offs',
                        color: 'green'
                      },
                      {
                        channel: 'Meta Retargeting',
                        traffic: 24,
                        convRate: 2.8,
                        avgOrderValue: '₹2,420',
                        quality: 'Good',
                        dropoffPoint: 'Cart abandonment: 48%',
                        color: 'blue'
                      },
                      {
                        channel: 'Google Shopping',
                        traffic: 22,
                        convRate: 1.8,
                        avgOrderValue: '₹2,180',
                        quality: 'Average',
                        dropoffPoint: 'Product to cart: 68% drop',
                        color: 'amber'
                      },
                      {
                        channel: 'Meta Prospecting',
                        traffic: 36,
                        convRate: 0.6,
                        avgOrderValue: '₹1,920',
                        quality: 'Poor',
                        dropoffPoint: 'Landing to product: 72% drop',
                        color: 'red'
                      },
                    ]).map((channel, idx) => (
                      <div key={idx} className="p-4 rounded-xl border bg-gray-50/80 border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{channel.channel}</p>
                              <span className="px-2 py-0.5 rounded-full bg-brand text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                                {channel.quality}
                              </span>
                            </div>
                            <p className="text-gray-600" style={{ fontSize: '13px' }}>{channel.traffic}% of traffic</p>
                          </div>
                          <div className="text-right">
                            <p className="text-brand" style={{ fontSize: '20px', fontWeight: 700 }}>
                              {channel.convRate}%
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '13px' }}>Conv Rate</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px' }}>
                              {businessModel === 'leadgen' ? 'Cost Per Lead' : 'Avg Order Value'}
                            </p>
                            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{channel.avgOrderValue}</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px' }}>Critical Drop-off</p>
                            <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{channel.dropoffPoint}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'optimization' && (
              <div className="space-y-6">
                {/* Priority Fixes */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-brand" />
                    <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Priority 1: Critical Fixes (Immediate Action)</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        issue: 'Product to Cart: 72% Drop-off',
                        lostRevenue: '₹14.2L/month',
                        currentRate: '28.3%',
                        targetRate: '35%',
                        fixes: [
                          'Add prominent "Free Shipping" callout above ATC button',
                          'Display trust badges (secure checkout, money-back guarantee)',
                          'Add urgency indicator ("Only 3 left in stock")',
                          'Show related products that others bought together',
                          'Add size/fit guide for apparel products',
                          'Display customer reviews above the fold (social proof)'
                        ],
                        expectedImpact: '+₹8.4L/month revenue',
                        timeline: '3-5 days',
                        effort: 'Medium'
                      },
                      {
                        issue: 'Checkout to Payment: 50% Drop-off',
                        lostRevenue: '₹8.6L/month',
                        currentRate: '50%',
                        targetRate: '65%',
                        fixes: [
                          'Show shipping costs on cart page (before checkout)',
                          'Add guest checkout option prominently',
                          'Reduce form fields from 12 to 6 essential fields',
                          'Add progress indicator (Step 1 of 3)',
                          'Display security badges at payment step',
                          'Enable autofill for address fields'
                        ],
                        expectedImpact: '+₹5.2L/month revenue',
                        timeline: '4-6 days',
                        effort: 'High'
                      },
                      {
                        issue: 'Mobile Funnel: 38% Lower Conversion',
                        lostRevenue: '₹12.8L/month',
                        currentRate: '0.9%',
                        targetRate: '1.5%',
                        fixes: [
                          'Optimize mobile checkout form (larger tap targets)',
                          'Fix iOS Safari viewport issues',
                          'Reduce product page load time by 1.2s',
                          'Implement one-tap payment options (Apple Pay, Google Pay)',
                          'Add mobile-optimized image carousel',
                          'Simplify mobile navigation'
                        ],
                        expectedImpact: '+₹7.8L/month revenue',
                        timeline: '5-7 days',
                        effort: 'High'
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 700 }}>{item.issue}</p>
                            <div className="flex items-center gap-3 text-gray-600 mb-2" style={{ fontSize: '13px' }}>
                              <span className="text-gray-500" style={{ fontWeight: 600 }}>Lost: {item.lostRevenue}</span>
                              <span>•</span>
                              <span>Current: {item.currentRate}</span>
                              <span>→</span>
                              <span>Target: {item.targetRate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>Action Items:</p>
                          {item.fixes.map((fix, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                              <span className="text-gray-500 mt-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>{i + 1}.</span>
                              <p className="text-gray-700" style={{ fontSize: '13px' }}>{fix}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-white rounded-lg text-center">
                            <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px' }}>Expected Impact</p>
                            <p className="text-brand" style={{ fontSize: '14px', fontWeight: 700 }}>{item.expectedImpact}</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px' }}>Timeline</p>
                            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{item.timeline}</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <p className="text-gray-600 mb-0.5" style={{ fontSize: '13px' }}>Effort</p>
                            <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>{item.effort}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-brand-light rounded-lg border border-brand/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand mt-0.5" />
                      <div>
                        <p className="text-brand-dark mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>Total Potential Revenue Gain</p>
                        <p className="text-brand-dark" style={{ fontSize: '13px' }}>
                          Implementing all Priority 1 fixes could add <span style={{ fontSize: '20px', fontWeight: 700 }}>₹21.4L/month</span> in additional revenue 
                          (estimated +42% overall funnel improvement).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Wins */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-brand" />
                    <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Quick Wins (High Impact, Low Effort)</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        fix: 'Add "Free Shipping Above ₹999" Banner',
                        impact: '+₹2.4L/month',
                        improvement: '+8% cart conversion',
                        effort: '1 hour',
                        steps: 'Add sticky banner on cart page. Highlight how much more needed for free shipping.'
                      },
                      {
                        fix: 'Enable Guest Checkout',
                        impact: '+₹4.2L/month',
                        improvement: '+15% checkout conversion',
                        effort: '2 hours',
                        steps: 'Add "Continue as Guest" button. Make account creation optional post-purchase.'
                      },
                      {
                        fix: 'Add Exit-Intent Popup with 10% Discount',
                        impact: '+₹1.8L/month',
                        improvement: 'Recover 12% of exits',
                        effort: '1 hour',
                        steps: 'Trigger on cart/checkout pages only. Offer code valid for 24 hours.'
                      },
                      {
                        fix: 'Display "Others Also Bought" on Product Page',
                        impact: '+₹2.1L/month',
                        improvement: '+18% cart additions',
                        effort: '3 hours',
                        steps: 'Show 4 related products below ATC button. Use collaborative filtering algorithm.'
                      },
                      {
                        fix: 'Add Product Reviews Above Fold',
                        impact: '+₹3.2L/month',
                        improvement: '+12% product to cart',
                        effort: '2 hours',
                        steps: 'Move reviews section up. Display star rating + count near product title.'
                      },
                    ].map((win, idx) => (
                      <div key={idx} className="p-3 bg-gray-50/80 rounded-lg border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>{win.fix}</p>
                            <div className="flex items-center gap-3 mb-2" style={{ fontSize: '13px' }}>
                              <span className="text-brand" style={{ fontWeight: 600 }}>{win.impact}</span>
                              <span>•</span>
                              <span className="text-brand" style={{ fontWeight: 600 }}>{win.improvement}</span>
                              <span>•</span>
                              <span className="text-gray-600">Effort: {win.effort}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 bg-white p-2 rounded" style={{ fontSize: '13px' }}>{win.steps}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testing Roadmap */}
                <div className="bg-white rounded-xl border border-brand/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-brand" />
                    <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>A/B Testing Roadmap (Next 30 Days)</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        week: 'Week 1',
                        tests: [
                          'Product page: Large ATC button vs Small ATC button',
                          'Cart page: Show shipping costs vs Hide until checkout'
                        ]
                      },
                      {
                        week: 'Week 2',
                        tests: [
                          'Checkout: 12 fields vs 6 fields form',
                          'Product page: 4 images vs 8 images gallery'
                        ]
                      },
                      {
                        week: 'Week 3',
                        tests: [
                          'Cart: Urgency timer (30 mins) vs No timer',
                          'Checkout: Guest checkout first vs Login first'
                        ]
                      },
                      {
                        week: 'Week 4',
                        tests: [
                          'Product page: Reviews above fold vs Reviews below',
                          'Checkout: One-page vs Multi-step checkout'
                        ]
                      },
                    ].map((week, idx) => (
                      <div key={idx} className="p-3 bg-brand-light rounded-lg border border-brand/20">
                        <p className="text-brand-dark mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>{week.week}</p>
                        <div className="space-y-1">
                          {week.tests.map((test, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded">
                              <span className="text-brand mt-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>{i + 1}.</span>
                              <p className="text-gray-700" style={{ fontSize: '13px' }}>{test}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
