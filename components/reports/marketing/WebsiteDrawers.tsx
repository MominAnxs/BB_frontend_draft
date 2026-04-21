'use client';

import { X, Users, TrendingUp, Download, Activity, FileText, CheckCircle, AlertCircle, Smartphone, Monitor, Zap, Info } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const psiMetrics: Record<string, { full: string; tip: string }> = {
  LCP: { full: 'Page Load Speed', tip: 'Largest Contentful Paint (LCP) — how fast the main content like your hero image or heading loads. Slower LCP means users stare at a blank screen longer.' },
  FID: { full: 'Interaction Speed', tip: 'First Input Delay (FID) — how quickly your site responds when a user first clicks or taps something. High FID means buttons feel unresponsive.' },
  CLS: { full: 'Visual Stability', tip: 'Cumulative Layout Shift (CLS) — how much things jump around while the page loads. High CLS means users accidentally click the wrong thing.' },
  FCP: { full: 'Initial Display Speed', tip: 'First Contentful Paint (FCP) — when the first text or image appears on screen. Faster FCP means users know the page is loading.' },
  SI: { full: 'Visual Load Speed', tip: 'Speed Index (SI) — how quickly the visible content fills the page. Lower is better.' },
  TTI: { full: 'Ready to Use', tip: 'Time to Interactive (TTI) — when the page becomes fully usable, buttons work, and forms are fillable. High TTI means a frustrating wait.' },
};

function PSITooltip({ label, tipKey }: { label: string; tipKey: string }) {
  const [show, setShow] = useState(false);
  const info = psiMetrics[tipKey];
  if (!info) return <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{label}</span>;
  return (
    <span className="relative inline-flex items-center">
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="inline-flex items-center gap-1 cursor-help">
        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{label}</span>
        <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
      </span>
      {show && (
        <span className="absolute left-0 bottom-full mb-2 z-20 w-56 px-3 py-2 bg-gray-900 text-white text-[13px] rounded-lg shadow-lg pointer-events-none" style={{ fontWeight: 400, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>{info.full}</span><br />{info.tip}
          <span className="absolute left-4 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

function PSIStatusTag({ status }: { status: string }) {
  const c = {
    good: { label: 'Good', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    warning: { label: 'Needs Improvement', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    bad: { label: 'Poor', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }[status] || { label: '—', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  return <span className={`text-[13px] px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`} style={{ fontWeight: 500 }}>{c.label}</span>;
}

// Users Overview Drawer — GA4 focused
export function UsersOverviewDrawer({ isOpen, onClose }: DrawerProps) {
  const [dateFilter, setDateFilter] = useState('Last 30 Days');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white transform transition-transform duration-300 ease-out" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>Users & Traffic Overview</h2>
                <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Google Analytics 4 — User demographics and traffic analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg bg-white"
                style={{ fontWeight: 400 }}
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: '68,524', change: '+8.2%', positive: true },
                  { label: 'New Users', value: '42,856', change: '+12.4%', positive: true },
                  { label: 'Returning Users', value: '25,668', change: '+2.8%', positive: true },
                  { label: 'Avg. Session Duration', value: '4m 32s', change: '-5.2%', positive: false },
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-[13px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>{stat.label}</p>
                    <p className="text-xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>{stat.value}</p>
                    <p className={`text-[13px] ${stat.positive ? 'text-green-600' : 'text-amber-600'}`} style={{ fontWeight: 500 }}>
                      {stat.change} vs last period
                    </p>
                  </div>
                ))}
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Device Distribution</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Mobile', icon: Smartphone, users: 42568, percentage: 62.1, sessions: 58420, avgTime: '3m 24s' },
                    { device: 'Desktop', icon: Monitor, users: 21356, percentage: 31.2, sessions: 28450, avgTime: '6m 12s' },
                    { device: 'Tablet', icon: Smartphone, users: 4600, percentage: 6.7, sessions: 6240, avgTime: '4m 48s' },
                  ].map((item, idx) => {
                    const DeviceIcon = item.icon;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.device}</span>
                          </div>
                          <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{item.users.toLocaleString()} users ({item.percentage}%)</span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: ['#3B82F6','#6366F1','#A78BFA'][idx] }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[13px] text-gray-600 pl-6">
                          <div style={{ fontWeight: 400 }}>Sessions: <span className="text-gray-900" style={{ fontWeight: 600 }}>{item.sessions.toLocaleString()}</span></div>
                          <div style={{ fontWeight: 400 }}>Avg Time: <span className="text-gray-900" style={{ fontWeight: 600 }}>{item.avgTime}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Traffic Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: 'Organic Search', users: 28456, percentage: 41.5, bounce: '32.4%', convRate: '3.8%' },
                    { source: 'Paid Search', users: 15420, percentage: 22.5, bounce: '42.8%', convRate: '2.4%' },
                    { source: 'Social', users: 12648, percentage: 18.5, bounce: '48.2%', convRate: '1.8%' },
                    { source: 'Direct', users: 8240, percentage: 12.0, bounce: '28.5%', convRate: '4.2%' },
                    { source: 'Referral', users: 3760, percentage: 5.5, bounce: '35.6%', convRate: '3.1%' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3B82F6','#6366F1','#EC4899','#10B981','#F59E0B'][idx] }} />
                          <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{item.source}</span>
                        </div>
                        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{item.users.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[13px]">
                        <div>
                          <p className="text-gray-500" style={{ fontWeight: 400 }}>Bounce Rate</p>
                          <p className="text-gray-900" style={{ fontWeight: 600 }}>{item.bounce}</p>
                        </div>
                        <div>
                          <p className="text-gray-500" style={{ fontWeight: 400 }}>Conv. Rate</p>
                          <p className="text-gray-900" style={{ fontWeight: 600 }}>{item.convRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Top Locations</h3>
                <div className="space-y-2">
                  {[
                    { city: 'Mumbai', users: '12,450', sessions: '18,650' },
                    { city: 'Bangalore', users: '10,825', sessions: '16,240' },
                    { city: 'Delhi', users: '9,680', sessions: '14,520' },
                    { city: 'Hyderabad', users: '7,245', sessions: '10,870' },
                    { city: 'Chennai', users: '6,420', sessions: '9,630' },
                  ].map((location, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-900 w-24" style={{ fontWeight: 500 }}>{location.city}</span>
                      <div className="grid grid-cols-2 gap-6 text-[13px] text-right">
                        <div>
                          <p className="text-gray-500" style={{ fontWeight: 400 }}>Users</p>
                          <p className="text-gray-900" style={{ fontWeight: 600 }}>{location.users}</p>
                        </div>
                        <div>
                          <p className="text-gray-500" style={{ fontWeight: 400 }}>Sessions</p>
                          <p className="text-gray-900" style={{ fontWeight: 600 }}>{location.sessions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance Drawer — PageSpeed Insights focused
export function PerformanceDrawer({ isOpen, onClose }: DrawerProps) {
  const [speedDevice, setSpeedDevice] = useState<'mobile' | 'desktop'>('mobile');

  if (!isOpen) return null;

  const data = {
    mobile: {
      score: 72,
      lcp: { value: '3.1s', status: 'warning' as const },
      fid: { value: '120ms', status: 'warning' as const },
      cls: { value: '0.12', status: 'warning' as const },
      fcp: { value: '2.4s', status: 'warning' as const },
      si: { value: '4.2s', status: 'warning' as const },
      tti: { value: '4.8s', status: 'bad' as const },
    },
    desktop: {
      score: 91,
      lcp: { value: '1.8s', status: 'good' as const },
      fid: { value: '45ms', status: 'good' as const },
      cls: { value: '0.04', status: 'good' as const },
      fcp: { value: '1.2s', status: 'good' as const },
      si: { value: '1.8s', status: 'good' as const },
      tti: { value: '2.1s', status: 'good' as const },
    }
  };

  const active = data[speedDevice];
  const getColor = (s: string) => s === 'good' ? 'text-green-600' : s === 'warning' ? 'text-amber-600' : 'text-red-600';
  const getDot = (s: string) => s === 'good' ? 'bg-green-500' : s === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  const getScoreColor = (n: number) => n >= 90 ? 'text-green-600' : n >= 50 ? 'text-amber-600' : 'text-red-600';
  const getScoreBorder = (n: number) => n >= 90 ? 'border-green-500' : n >= 50 ? 'border-amber-500' : 'border-red-500';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>PageSpeed Insights</h2>
                <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Core Web Vitals & performance optimization</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Device Toggle */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl max-w-xs ml-auto">
                <button
                  onClick={() => setSpeedDevice('mobile')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm transition-all ${speedDevice === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  style={{ fontWeight: speedDevice === 'mobile' ? 500 : 400 }}
                >
                  <Smartphone className="w-3.5 h-3.5" />Mobile
                </button>
                <button
                  onClick={() => setSpeedDevice('desktop')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm transition-all ${speedDevice === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  style={{ fontWeight: speedDevice === 'desktop' ? 500 : 400 }}
                >
                  <Monitor className="w-3.5 h-3.5" />Desktop
                </button>
              </div>

              {/* Performance Score + Core Web Vitals — horizontal 20/80 */}
              <div className="flex gap-4">
                {/* Performance Score — narrow left column */}
                <div className={`flex-shrink-0 rounded-2xl p-5 border flex flex-col items-center ${active.score >= 90 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`} style={{ width: '22%', minWidth: 160 }}>
                  <p className="text-sm text-gray-600 mb-4" style={{ fontWeight: 500 }}>Performance Score</p>
                  {(() => {
                    const scoreColor = active.score >= 90 ? '#10b981' : active.score >= 50 ? '#f59e0b' : '#ef4444';
                    const scoreBg = active.score >= 90 ? 'rgba(16,185,129,0.08)' : active.score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
                    const r = 38;
                    const circ = 2 * Math.PI * r;
                    const offset = circ - (active.score / 100) * circ;
                    return (
                      <div key={speedDevice} className="relative" style={{ width: 96, height: 96 }}>
                        <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                          <circle cx="48" cy="48" r={r} fill="none" stroke={scoreBg} strokeWidth="6" />
                          <motion.circle
                            cx="48" cy="48" r={r}
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{active.score}</span>
                          <span className="text-gray-400 mt-0.5" style={{ fontSize: 13, fontWeight: 500 }}>/ 100</span>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[13px] text-gray-500 mt-auto text-center" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                    {active.score >= 90
                      ? 'Good — fast and responsive experience'
                      : 'Needs improvement — users may experience delays'}
                  </p>
                </div>

                {/* Core Web Vitals — wider right column */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Core Web Vitals</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'LCP', ...active.lcp },
                      { key: 'FID', ...active.fid },
                      { key: 'CLS', ...active.cls },
                    ].map((v, i) => (
                      <div key={i} className="p-4 bg-gray-50/80 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <PSITooltip label={v.key} tipKey={v.key} />
                          <PSIStatusTag status={v.status} />
                        </div>
                        <p className={`mb-1.5 ${getColor(v.status)}`} style={{ fontSize: 28, fontWeight: 700 }}>{v.value}</p>
                        <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>{psiMetrics[v.key].full}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Metrics — with tooltips & status tags */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Additional Metrics</h3>
                <div className="space-y-2">
                  {[
                    { key: 'FCP', ...active.fcp },
                    { key: 'SI', ...active.si },
                    { key: 'TTI', ...active.tti },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50/60 rounded-xl hover:bg-gray-50 transition-colors">
                      <PSITooltip label={psiMetrics[m.key].full} tipKey={m.key} />
                      <div className="flex items-center gap-2.5">
                        <span className={`text-sm ${getColor(m.status)}`} style={{ fontWeight: 600 }}>{m.value}</span>
                        <PSIStatusTag status={m.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile vs Desktop */}
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
                    <div key={idx} className={`rounded-xl border p-5 transition-all ${isActive ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/80 border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <DevIcon className="w-4 h-4 text-gray-600" />
                          <h3 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{d.device}</h3>
                        </div>
                        <PSIStatusTag status={d.score >= 90 ? 'good' : 'warning'} />
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
                      <div className="space-y-2.5 text-[13px]">
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

              {/* Optimization Opportunities */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Top Optimization Opportunities</h3>
                <div className="space-y-3">
                  {[
                    { opportunity: 'Properly size images', saving: '1.8s', impact: 'High' },
                    { opportunity: 'Eliminate render-blocking resources', saving: '1.2s', impact: 'High' },
                    { opportunity: 'Reduce unused JavaScript', saving: '0.8s', impact: 'Medium' },
                    { opportunity: 'Serve images in next-gen formats', saving: '0.6s', impact: 'Medium' },
                    { opportunity: 'Enable text compression', saving: '0.3s', impact: 'Low' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{item.opportunity}</p>
                        <p className="text-[13px] text-gray-600 mt-0.5" style={{ fontWeight: 400 }}>Potential saving: {item.saving}</p>
                      </div>
                      <span className={`text-[13px] px-2 py-1 rounded-full ${
                        item.impact === 'High' ? 'bg-red-50 text-red-700' :
                        item.impact === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`} style={{ fontWeight: 500 }}>
                        {item.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Pages Drawer — GA4 focused
export function TopPagesDrawer({ isOpen, onClose }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>Pages Performance</h2>
                <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>Google Analytics 4 — Top pages and engagement metrics</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Top Performing Pages */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Top Performing Pages</h3>
                <div className="space-y-3">
                  {[
                    { page: '/products/bestsellers', views: '18,245', uniqueViews: '14,820', avgTime: '5m 24s', bounce: '32.4%', convRate: '4.6%' },
                    { page: '/summer-collection', views: '14,856', uniqueViews: '12,240', avgTime: '4m 18s', bounce: '38.2%', convRate: '4.4%' },
                    { page: '/products/new-arrivals', views: '10,645', uniqueViews: '8,920', avgTime: '3m 54s', bounce: '42.1%', convRate: '4.8%' },
                    { page: '/blog/style-guide-2026', views: '8,420', uniqueViews: '7,240', avgTime: '6m 12s', bounce: '28.6%', convRate: '1.2%' },
                  ].map((page, idx) => (
                    <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] text-gray-400" style={{ fontWeight: 700 }}>#{idx + 1}</span>
                            <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{page.page}</p>
                          </div>
                          <p className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>{page.views} views · {page.uniqueViews} unique</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-white rounded-lg">
                          <p className="text-[13px] text-gray-500 mb-0.5" style={{ fontWeight: 400 }}>Avg Time</p>
                          <p className="text-[13px] text-gray-900" style={{ fontWeight: 600 }}>{page.avgTime}</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <p className="text-[13px] text-gray-500 mb-0.5" style={{ fontWeight: 400 }}>Bounce</p>
                          <p className={`text-[13px] ${parseFloat(page.bounce) > 50 ? 'text-amber-600' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>{page.bounce}</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <p className="text-[13px] text-gray-500 mb-0.5" style={{ fontWeight: 400 }}>Conv Rate</p>
                          <p className="text-[13px] text-green-600" style={{ fontWeight: 600 }}>{page.convRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages Needing Attention */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>Pages Needing Attention</h3>
                <div className="space-y-3">
                  {[
                    { page: '/checkout', issue: 'High Bounce Rate', views: '6,840', bounce: '68.2%', avgTime: '2m 36s', recommendation: 'Simplify checkout form and add trust signals.' },
                    { page: '/products/winter-sale', issue: 'Low Engagement', views: '4,240', bounce: '58.4%', avgTime: '1m 12s', recommendation: 'Refresh product images, add urgency indicators.' },
                    { page: '/about-us', issue: 'High Exit Rate', views: '3,820', bounce: '72.6%', avgTime: '45s', recommendation: 'Add clear CTAs and link to product categories.' },
                  ].map((page, idx) => (
                    <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{page.page}</p>
                          <span className="text-[13px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700" style={{ fontWeight: 500 }}>{page.issue}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3 text-[13px]">
                        <div><p className="text-gray-500" style={{ fontWeight: 400 }}>Views</p><p className="text-gray-900" style={{ fontWeight: 600 }}>{page.views}</p></div>
                        <div><p className="text-gray-500" style={{ fontWeight: 400 }}>Bounce</p><p className="text-amber-600" style={{ fontWeight: 600 }}>{page.bounce}</p></div>
                        <div><p className="text-gray-500" style={{ fontWeight: 400 }}>Avg Time</p><p className="text-gray-900" style={{ fontWeight: 600 }}>{page.avgTime}</p></div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                        <p className="text-[13px] text-gray-700" style={{ fontWeight: 400 }}><span style={{ fontWeight: 600 }}>Action:</span> {page.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
