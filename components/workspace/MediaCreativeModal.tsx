'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Mic,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  PlayCircle
} from 'lucide-react';

interface MediaCreativeModalProps {
  creative: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaCreativeModal({ creative, isOpen, onClose }: MediaCreativeModalProps) {
  const [status, setStatus] = useState(creative?.status || 'PENDING');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'round1' | 'round2'>('round1');
  const [newComment, setNewComment] = useState('');

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !creative) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-[6px]"
        onClick={onClose}
      ></div>

      {/* Modal - Same size as CreativeDetailModal */}
      <div className="relative w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', height: '85vh' }}>
        <div className="flex h-full">
          {/* Left Side - Main Content */}
          <div className={`flex flex-col transition-all duration-300 ${feedbackOpen ? 'w-[55%]' : 'w-full'}`}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">{creative.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Feedback Button */}
                <button 
                  onClick={() => setFeedbackOpen(!feedbackOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Feedback</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Media Preview */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Media Preview</label>
                  
                  {/* Media Container */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-100" style={{ aspectRatio: '9/16' }}>
                    {/* Instagram-style mockup */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {creative.type === 'video' ? (
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white/80" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-white text-sm font-medium">Video Content Preview</p>
                            <p className="text-white/80 text-xs mt-1">Click to play</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-center p-8">
                          {/* Sample Instagram Ad Layout */}
                          <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-4">
                            {/* Instagram Header */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-900">{creative.brand || 'Brand Name'}</p>
                                <p className="text-[10px] text-gray-500">Sponsored</p>
                              </div>
                            </div>
                            
                            {/* Image Placeholder */}
                            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg mb-3 flex items-center justify-center">
                              <Instagram className="w-12 h-12 text-white/50" />
                            </div>
                            
                            {/* Caption Preview */}
                            <div className="space-y-1">
                              <p className="text-xs text-gray-900 font-medium line-clamp-2">
                                {creative.caption || 'Your amazing ad caption goes here...'}
                              </p>
                              <p className="text-[10px] text-gray-500">View all comments</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100/50">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(creative.platforms[0])}
                        <span className="text-xs font-semibold text-gray-900 capitalize">{creative.platforms[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Media Info */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Instagram className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Format Details</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Optimized for {creative.platforms.join(', ')} • {creative.type === 'video' ? 'Video Ad' : 'Static Image'} • 1080x1920px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details Form */}
                <div className="space-y-5">
                  {/* Status & Month Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVE">Approve</option>
                      </select>
                    </div>

                    {/* Month Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900">
                        January 2025
                      </div>
                    </div>
                  </div>

                  {/* Platform Badges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {creative.platforms.map((platform: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
                          {getPlatformIcon(platform)}
                          <span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
                      {creative.reference || 'No reference provided'}
                    </div>
                  </div>

                  {/* Ad Copy / Caption */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Copy</label>
                    <div className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 min-h-[100px] max-h-[200px] overflow-y-auto">
                      {creative.caption || creative.adCopy || 'No ad copy provided yet. This will be updated once the creative is finalized.'}
                    </div>
                  </div>

                  {/* Content Type Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
                        <span className="text-sm font-semibold text-green-700">Feed</span>
                      </div>
                      <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200/50 rounded-lg">
                        <span className="text-sm font-semibold text-purple-700">Story</span>
                      </div>
                      {creative.type === 'video' && (
                        <div className="px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-lg">
                          <span className="text-sm font-semibold text-red-700">Video</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics (if LIVE) */}
                  {status === 'APPROVE' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Overview</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Impressions</p>
                          <p className="text-lg font-bold text-gray-900">12.4K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Clicks</p>
                          <p className="text-lg font-bold text-gray-900">847</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">CTR</p>
                          <p className="text-lg font-bold text-gray-900">6.8%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Close
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                Download Asset
              </button>
            </div>
          </div>

          {/* Right Side - Feedback Drawer (slides in from right within modal) */}
          {feedbackOpen && (
            <div className="w-[45%] border-l border-gray-100 flex flex-col bg-gray-50/50 animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 flex-shrink-0">
                <div>
                  <h3 className="font-semibold text-gray-900">Feedback</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Creative Discussion</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="px-6 pt-3 border-b border-gray-100 flex gap-1 bg-white/50 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('round1')}
                  className={`
                    px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
                    ${activeTab === 'round1'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>Round 1</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded">
                      2
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('round2')}
                  className={`
                    px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
                    ${activeTab === 'round2'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>Round 2</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                      0
                    </span>
                  </div>
                </button>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTab === 'round1' ? (
                  <>
                    {/* Round 1 Comments */}
                    <div className="space-y-4">
                      {/* Sample Comment 1 - Brego Team */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          BR
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900">Brego Team</span>
                            <span className="text-xs text-gray-500">1 hour ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Media asset has been created and is ready for review. The design follows the approved concept with updated brand colors.
                          </p>
                        </div>
                      </div>

                      {/* Sample Comment 2 - Client */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          YO
                        </div>
                        <div className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900">You</span>
                            <span className="text-xs text-gray-500">3 hours ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Looking forward to seeing the final creative! Please ensure the CTA is prominent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No Round 2 feedback yet</p>
                    <p className="text-xs text-gray-400 mt-1">Feedback from the second revision will appear here</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your feedback..."
                      rows={2}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-transparent border-0 focus:outline-none resize-none"
                    />
                    <div className="px-4 pb-3 flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-all duration-200">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-all duration-200">
                        <Mic className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleSendComment}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
