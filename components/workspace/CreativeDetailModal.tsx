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
  Globe
} from 'lucide-react';

interface CreativeDetailModalProps {
  creative: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CreativeDetailModal({ creative, isOpen, onClose }: CreativeDetailModalProps) {
  const [status, setStatus] = useState(creative?.status || 'PENDING');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [storyTexts, setStoryTexts] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'round1' | 'round2'>('round1');
  const [newComment, setNewComment] = useState('');
  const [ctaNotes, setCtaNotes] = useState('');

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

      {/* Modal - Now larger and contains drawer */}
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
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
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

              {/* Content Type Badges (Feed, Story, Video) */}
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

              {/* Reference URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
                <input
                  type="text"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://example.com/reference"
                  className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter your caption here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Story/Texts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story/Texts</label>
                <textarea
                  value={storyTexts}
                  onChange={(e) => setStoryTexts(e.target.value)}
                  placeholder="Enter story texts or additional content..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA / Notes</label>
                <textarea
                  value={ctaNotes}
                  onChange={(e) => setCtaNotes(e.target.value)}
                  placeholder="Add CTA or additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                Save Changes
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
                      3
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
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Great concept! We love the direction. Could you adjust the primary color to match the brand guidelines? Also, let's make the CTA button more prominent.
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
                            <span className="text-xs text-gray-500">5 hours ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Thank you for the initial draft! The headline looks perfect. Can we try a different background image that's more vibrant?
                          </p>
                        </div>
                      </div>

                      {/* Sample Comment 3 - Brego Team */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          BR
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900">Brego Team</span>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Here's the first draft for your Spring Sale Campaign. We've included variations for Feed and Story formats. Looking forward to your feedback!
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
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-all duration-200" aria-label="Attach file">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-all duration-200" aria-label="Voice message">
                        <Mic className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleSendComment}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex-shrink-0"
                    aria-label="Send feedback"
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
