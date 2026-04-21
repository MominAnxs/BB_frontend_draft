'use client';

import { 
  X,
  Building2,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Percent,
  Sparkles,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import { useState } from 'react';

// Project Profitability Analysis Drawer (SERVICE BUSINESS)
export function ServiceProjectDrawer({ onClose }: { onClose: () => void }) {
  const [selectedView, setSelectedView] = useState<'all' | 'enterprise' | 'midmarket' | 'smb'>('all');

  // Realistic project profitability data for service businesses
  const projectsBySegment = {
    all: [
      { project: 'Digital Transformation - TechCorp', revenue: 14.8, deliveryCost: 7.4, teamCost: 3.7, overhead: 1.2, netProfit: 2.5, margin: 16.9, duration: '6 months', team: 5, status: 'On Track', client: 'Enterprise' },
      { project: 'Consulting - FinanceHub Ltd', revenue: 11.2, deliveryCost: 5.6, teamCost: 2.8, overhead: 0.9, netProfit: 1.9, margin: 17.0, duration: '4 months', team: 3, status: 'Ahead', client: 'Enterprise' },
      { project: 'Marketing Campaign - RetailCo', revenue: 8.6, deliveryCost: 4.3, teamCost: 2.2, overhead: 0.7, netProfit: 1.4, margin: 16.3, duration: '5 months', team: 4, status: 'On Track', client: 'Enterprise' },
      { project: 'Strategy Audit - ManufacturePro', revenue: 6.9, deliveryCost: 3.5, teamCost: 1.7, overhead: 0.6, netProfit: 1.1, margin: 15.9, duration: '3 months', team: 2, status: 'On Track', client: 'Enterprise' },
      { project: 'Training Program - StartupX', revenue: 4.3, deliveryCost: 2.2, teamCost: 1.1, overhead: 0.3, netProfit: 0.7, margin: 16.3, duration: '2 months', team: 2, status: 'Complete', client: 'Enterprise' }
    ],
    enterprise: [
      { project: 'Digital Transformation - TechCorp', revenue: 14.8, deliveryCost: 7.4, teamCost: 3.7, overhead: 1.2, netProfit: 2.5, margin: 16.9, duration: '6 months', team: 5, status: 'On Track', client: 'TechCorp India' },
      { project: 'Consulting - FinanceHub Ltd', revenue: 11.2, deliveryCost: 5.6, teamCost: 2.8, overhead: 0.9, netProfit: 1.9, margin: 17.0, duration: '4 months', team: 3, status: 'Ahead', client: 'FinanceHub Ltd' },
      { project: 'Marketing Campaign - RetailCo', revenue: 8.6, deliveryCost: 4.3, teamCost: 2.2, overhead: 0.7, netProfit: 1.4, margin: 16.3, duration: '5 months', team: 4, status: 'On Track', client: 'RetailCo Enterprises' },
      { project: 'Strategy Audit - ManufacturePro', revenue: 6.9, deliveryCost: 3.5, teamCost: 1.7, overhead: 0.6, netProfit: 1.1, margin: 15.9, duration: '3 months', team: 2, status: 'On Track', client: 'ManufacturePro Solutions' },
      { project: 'Training Program - StartupX', revenue: 4.3, deliveryCost: 2.2, teamCost: 1.1, overhead: 0.3, netProfit: 0.7, margin: 16.3, duration: '2 months', team: 2, status: 'Complete', client: 'StartupX Ventures' }
    ],
    midmarket: [
      { project: 'Sales Optimization - MidCo A', revenue: 2.8, deliveryCost: 1.5, teamCost: 0.7, overhead: 0.2, netProfit: 0.4, margin: 14.3, duration: '3 months', team: 2, status: 'On Track', client: 'MidMarket Client A' },
      { project: 'Process Improvement - MidCo B', revenue: 2.4, deliveryCost: 1.3, teamCost: 0.6, overhead: 0.2, netProfit: 0.3, margin: 12.5, duration: '2 months', team: 2, status: 'On Track', client: 'MidMarket Client B' },
      { project: 'Digital Marketing - MidCo C', revenue: 2.1, deliveryCost: 1.1, teamCost: 0.5, overhead: 0.2, netProfit: 0.3, margin: 14.3, duration: '4 months', team: 1, status: 'Ahead', client: 'MidMarket Client C' },
      { project: 'Operations Review - MidCo D', revenue: 1.9, deliveryCost: 1.0, teamCost: 0.5, overhead: 0.1, netProfit: 0.3, margin: 15.8, duration: '2 months', team: 1, status: 'On Track', client: 'MidMarket Client D' }
    ],
    smb: [
      { project: 'Website Development - Client A', revenue: 0.8, deliveryCost: 0.4, teamCost: 0.2, overhead: 0.1, netProfit: 0.1, margin: 12.5, duration: '1 month', team: 1, status: 'Complete', client: 'SMB Client A' },
      { project: 'Marketing Setup - Client B', revenue: 0.6, deliveryCost: 0.3, teamCost: 0.2, overhead: 0.05, netProfit: 0.05, margin: 8.3, duration: '1 month', team: 1, status: 'On Track', client: 'SMB Client B' },
      { project: 'Process Consulting - Client C', revenue: 0.9, deliveryCost: 0.5, teamCost: 0.2, overhead: 0.1, netProfit: 0.1, margin: 11.1, duration: '2 months', team: 1, status: 'On Track', client: 'SMB Client C' },
      { project: 'Strategy Session - Client D', revenue: 0.4, deliveryCost: 0.2, teamCost: 0.1, overhead: 0.05, netProfit: 0.05, margin: 12.5, duration: '1 month', team: 1, status: 'Complete', client: 'SMB Client D' },
      { project: 'Brand Identity - Client E', revenue: 0.7, deliveryCost: 0.4, teamCost: 0.2, overhead: 0.05, netProfit: 0.05, margin: 7.1, duration: '1 month', team: 1, status: 'On Track', client: 'SMB Client E' }
    ]
  };

  const currentProjects = projectsBySegment[selectedView];

  // Calculate summary
  const summary = {
    totalRevenue: currentProjects.reduce((sum, p) => sum + p.revenue, 0),
    totalProfit: currentProjects.reduce((sum, p) => sum + p.netProfit, 0),
    totalProjects: currentProjects.length,
    avgMargin: currentProjects.reduce((sum, p) => sum + p.margin, 0) / currentProjects.length
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-br from-gray-50 via-white to-gray-50 z-50 flex flex-col animate-slide-in-right" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand via-brand to-brand/90 p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Project Profitability Analysis</h2>
                <p className="text-sm text-white/90 mt-1">Complete cost breakdown & net margins by project</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm group"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="relative flex items-center gap-2 mt-6 p-1.5 bg-white/20 backdrop-blur-md rounded-xl w-fit flex-wrap">
            <button
              onClick={() => setSelectedView('all')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedView === 'all' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setSelectedView('enterprise')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedView === 'enterprise' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Enterprise
            </button>
            <button
              onClick={() => setSelectedView('midmarket')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedView === 'midmarket' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Mid-Market
            </button>
            <button
              onClick={() => setSelectedView('smb')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedView === 'smb' 
                  ? 'bg-white text-brand' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Small Business
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-600">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalRevenue.toFixed(1)}L</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand" />
                </div>
                <p className="text-xs text-gray-600">Net Profit</p>
              </div>
              <p className="text-2xl font-bold text-brand">₹{summary.totalProfit.toFixed(1)}L</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-brand" />
                </div>
                <p className="text-xs text-gray-600">Projects</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalProjects}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">Avg Margin</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.avgMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top 5 Projects by Profitability */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Top Projects by Profitability</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Ranked by net profit and margin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs font-semibold text-brand">
                    {selectedView === 'all' ? 'All Segments' : selectedView === 'enterprise' ? 'Enterprise' : selectedView === 'midmarket' ? 'Mid-Market' : 'Small Business'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {currentProjects.map((project, idx) => {
                const statusColor = project.status === 'On Track' ? 'text-brand' : project.status === 'Ahead' ? 'text-brand' : 'text-gray-500';
                const statusBg = project.status === 'On Track' ? 'bg-brand-light' : project.status === 'Ahead' ? 'bg-brand-light' : 'bg-gray-100';
                
                return (
                  <div key={idx} className="group p-6 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand text-white text-base font-bold flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-base">{project.project}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusBg} ${statusColor}`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{project.client} • {project.duration} • {project.team} team members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Net Profit</p>
                        <p className="text-2xl font-bold text-brand">₹{project.netProfit.toFixed(1)}L</p>
                        <div className="mt-1 px-2.5 py-1 bg-brand-light rounded-lg inline-block">
                          <span className="text-sm font-bold text-brand">{project.margin.toFixed(1)}% margin</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed P&L Breakdown */}
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Revenue</p>
                        <p className="text-base font-bold text-gray-900">₹{project.revenue.toFixed(1)}L</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Delivery Cost</p>
                        <p className="text-base font-bold text-gray-600">-₹{project.deliveryCost.toFixed(1)}L</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Team Cost</p>
                        <p className="text-base font-bold text-gray-600">-₹{project.teamCost.toFixed(1)}L</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Overhead</p>
                        <p className="text-base font-bold text-gray-600">-₹{project.overhead.toFixed(1)}L</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Net Profit</p>
                        <p className="text-base font-bold text-brand">₹{project.netProfit.toFixed(1)}L</p>
                      </div>
                    </div>

                    {/* Profit Margin Visualization */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600 font-medium">Net Profit Margin</span>
                        <span className="font-bold text-brand">{project.margin.toFixed(1)}% of revenue</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(project.margin * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic Insights */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Insights</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Project-level insights & optimization opportunities</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedView === 'enterprise' 
                          ? <><span className="font-semibold">Enterprise projects average 16.5% net margin</span> with ₹9.3L average revenue. "Digital Transformation - TechCorp" (₹14.8L revenue, ₹2.5L profit) sets the standard. Structure more 6-month transformation projects to maximize client impact and profitability.</>
                          : selectedView === 'midmarket'
                          ? <><span className="font-semibold">Mid-market projects deliver 14.2% average margin</span> on ₹2.3L average deal size. "Operations Review - MidCo D" achieves 15.8% margin with lean 1-person teams. Replicate this model for 2-month consulting sprints to optimize resource utilization.</>
                          : selectedView === 'smb'
                          ? <><span className="font-semibold">SMB projects show 10.3% average margin</span> vs 16.5% for Enterprise—margin compression due to smaller deal sizes. Bundle 3-5 SMB projects into retainer packages (₹3-4L total) to reduce overhead allocation and improve margins to 18-20%.</>
                          : <><span className="font-semibold">Top 5 projects contribute ₹7.6L net profit</span> (15.8% average margin) from ₹45.8L revenue. Enterprise projects (16.5% margin) outperform SMB projects (10.3% margin) by 60%. Prioritize enterprise sales to maximize profitability per delivery hour.</>
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">Delivery costs average 50% of project revenue</span> across all segments. Reducing delivery costs by 5% through better resource allocation would add ₹2.3L monthly profit. Focus on billable utilization (target: 75-85%) and strategic contractor use for peak demand.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">"Ahead of schedule" projects show 16.7% margin</span> vs 15.2% for "On Track" projects—better project execution = higher profitability. Implement agile project management and weekly client check-ins to identify scope creep early and maintain healthy margins.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
