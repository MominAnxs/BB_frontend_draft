import { CheckCircle, AlertCircle, XCircle, Globe, BarChart3, Lightbulb, ChevronDown } from 'lucide-react';

interface FunnelStageCardProps {
  stage: any;
  idx: number;
  selectedChannel: 'all' | 'meta' | 'google';
  nextStage?: any;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function FunnelStageCard({ stage, idx, selectedChannel, nextStage, isExpanded = false, onToggle }: FunnelStageCardProps) {
  const conversionToNext = nextStage ? (nextStage.count / stage.count * 100) : null;
  const hasDetails = idx > 0 && (stage.detail || stage.insight || stage.dropRate || stage.benchmark);
  
  return (
    <div className="relative">
      {/* Funnel Stage Card */}
      <div className={`
        relative bg-white/80 backdrop-blur-sm rounded-xl border-2 shadow-sm transition-all
        ${idx === 0 ? 'border-brand/20 bg-brand-light' :
          stage.status === 'critical' ? 'border-gray-300' :
          stage.status === 'warning' ? 'border-gray-300' :
          stage.status === 'excellent' ? 'border-brand/20' :
          'border-brand/20'
        }
        ${hasDetails ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={hasDetails ? onToggle : undefined}
      >
        <div className="p-3">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{stage.stage}</span>
              
              {/* Platform Badge */}
              {stage.platform === 'website' && <Globe className="w-3.5 h-3.5 text-gray-500" />}
              
              {/* Status Icon */}
              {idx > 0 && (
                <>
                  {stage.status === 'excellent' && <CheckCircle className="w-4 h-4 text-brand" />}
                  {stage.status === 'good' && <CheckCircle className="w-4 h-4 text-brand" />}
                  {stage.status === 'warning' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                  {stage.status === 'critical' && <XCircle className="w-4 h-4 text-gray-400" />}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Volume */}
              <div className="text-xl font-bold text-gray-900">
                {stage.count.toLocaleString()}
              </div>
              
              {/* Expand/Collapse Icon */}
              {hasDetails && (
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              )}
            </div>
          </div>
          
          {/* Channel Breakdown for "all" view */}
          {selectedChannel === 'all' && stage.meta && stage.google && (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-brand-light rounded-lg border border-brand/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                  <span className="text-xs font-semibold text-brand-dark">
                    {stage.meta.count.toLocaleString()}
                  </span>
                </div>
                {idx > 0 && stage.meta.convRate && (
                  <span className="text-xs font-bold text-brand">
                    {stage.meta.convRate.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-gray-50/80 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                  <span className="text-xs font-semibold text-gray-700">
                    {stage.google.count.toLocaleString()}
                  </span>
                </div>
                {idx > 0 && stage.google.convRate && (
                  <span className="text-xs font-bold text-gray-600">
                    {stage.google.convRate.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Expandable Details Section */}
          {isExpanded && hasDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2.5">
              {/* Drop Rate & Benchmark */}
              {(stage.dropRate || stage.benchmark) && (
                <div className="flex items-center gap-2">
                  {stage.dropRate && (
                    <div className="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-gray-600 mb-0.5">Drop-off Rate</p>
                      <p className="text-lg font-bold text-gray-500">
                        {stage.dropRate}%
                      </p>
                    </div>
                  )}
                  {stage.benchmark && (
                    <div className="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-gray-600 mb-0.5">Benchmark</p>
                      <p className="text-lg font-bold text-brand">{stage.benchmark}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* Detail */}
              {stage.detail && (
                <div className="flex items-start gap-1.5 p-2 bg-gray-50/80 rounded-lg border border-gray-200">
                  <BarChart3 className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-gray-700 leading-snug">{stage.detail}</p>
                </div>
              )}

              {/* Insight */}
              {stage.insight && (
                <div className="flex items-start gap-1.5 p-2 bg-gray-50/80 rounded-lg border border-gray-200">
                  <Lightbulb className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                    stage.status === 'critical' ? 'text-gray-400' :
                    stage.status === 'warning' ? 'text-gray-400' :
                    'text-brand'
                  }`} />
                  <p className="text-[13px] text-gray-700 leading-snug">{stage.insight}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Conversion Metrics Between Stages */}
      {nextStage && (
        <div className="relative flex items-center justify-center gap-2 py-2">
          {/* Conversion Rate Badge */}
          <div className={`
            px-2.5 py-1 rounded-full text-[13px] font-bold shadow-sm
            ${conversionToNext! >= 50 ? 'bg-brand text-white' :
              conversionToNext! >= 30 ? 'bg-brand/80 text-white' :
              conversionToNext! >= 15 ? 'bg-gray-500 text-white' :
              'bg-gray-400 text-white'
            }
          `}>
            {conversionToNext!.toFixed(1)}% convert
          </div>
          
          {/* Drop-off indicator */}
          {stage.dropRate && (
            <div className="px-2.5 py-1 bg-gray-100 rounded-full text-[13px] font-bold text-gray-600 border border-gray-200">
              {stage.dropRate}% drop
            </div>
          )}
          
          {/* Arrow */}
          <ChevronDown className="w-4 h-4 text-gray-300 absolute -bottom-1" />
        </div>
      )}
    </div>
  );
}