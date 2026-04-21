'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, Building2, ChevronUp, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAdsIcon, MetaAdsIcon, GoogleAnalyticsIcon, ShopifyIcon } from '../BrandIcons';

// ── Business Account Type ──
export interface BusinessAccount {
  id: string;
  name: string;
  service: 'Performance Marketing' | 'Accounts & Taxation';
  businessType: string; // 'ecommerce' | 'leadgen' | 'ecommerce-restaurants' | 'trading-manufacturing'
  businessTypeLabel: string;
  status: 'connected' | 'setup' | 'pending';
  connectedPlatforms: string[];
  createdAt: Date;
}

// ── Platform icon map ──
function PlatformIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  switch (platform) {
    case 'google':
      return <GoogleAdsIcon size={size} />;
    case 'meta':
      return <MetaAdsIcon size={size} />;
    case 'ga4':
      return <GoogleAnalyticsIcon size={size} />;
    case 'shopify':
      return <ShopifyIcon size={size} />;
    default:
      return null;
  }
}

// ── Human-readable platform name map (for finance integrations without SVG icons) ──
const PLATFORM_LABELS: Record<string, string> = {
  google: 'Google Ads',
  meta: 'Meta Ads',
  ga4: 'Google Analytics',
  shopify: 'Shopify',
  quickbooks: 'QuickBooks',
  tally: 'Tally',
  zoho: 'Zoho Books',
};

// Marketing platforms that have recognizable SVG brand icons
const SVG_ICON_PLATFORMS = new Set(['google', 'meta', 'ga4', 'shopify']);

// Detect Mac vs Windows for shortcut display
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

interface BusinessAccountCardProps {
  currentAccount: BusinessAccount;
  accounts: BusinessAccount[];
  onAddNew: () => void;
  onSwitch: (account: BusinessAccount) => void;
  onDelete?: (accountId: string) => void;
  notificationCounts?: Record<string, number>;
}

export function BusinessAccountCard({ currentAccount, accounts, onAddNew, onSwitch, onDelete, notificationCounts }: BusinessAccountCardProps) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
        setMenuOpenId(null);
        setConfirmDeleteId(null);
      }
    };
    if (showSwitcher) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSwitcher]);

  // Close inline menu on outside click within the switcher
  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  const statusColor = currentAccount.status === 'connected' 
    ? 'bg-emerald-500' 
    : currentAccount.status === 'setup' 
      ? 'bg-amber-400' 
      : 'bg-gray-400';

  const statusLabel = currentAccount.status === 'connected' 
    ? 'Connected' 
    : currentAccount.status === 'setup' 
      ? 'Setting Up' 
      : 'Pending';

  const handleDeleteConfirm = (accountId: string) => {
    setConfirmDeleteId(null);
    setMenuOpenId(null);
    setShowSwitcher(false);
    onDelete?.(accountId);
  };

  return (
    <div className="relative" ref={switcherRef}>
      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/60 p-3.5 shadow-sm">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2">
          <div 
            className={`flex-1 min-w-0 ${accounts.length > 1 ? 'cursor-pointer' : ''} group`}
            onClick={() => accounts.length > 1 && setShowSwitcher(!showSwitcher)}
            role={accounts.length > 1 ? "button" : undefined}
            aria-expanded={accounts.length > 1 ? showSwitcher : undefined}
            tabIndex={accounts.length > 1 ? 0 : undefined}
            onKeyDown={accounts.length > 1 ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSwitcher(!showSwitcher); } } : undefined}
          >
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {currentAccount.name}
              </h4>
              {accounts.length > 1 && (
                <ChevronUp className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showSwitcher ? '' : 'rotate-180'}`} />
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {currentAccount.businessTypeLabel}
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="w-7 h-7 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 flex-shrink-0 ml-2"
            title="Add new business"
            aria-label="Add new business"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status + Service Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="text-gray-500" style={{ fontSize: '13px' }}>{statusLabel}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full ${
            currentAccount.service === 'Accounts & Taxation'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-blue-50 text-blue-700'
          }`} style={{ fontSize: '13px', fontWeight: 500 }}>
            {currentAccount.service === 'Accounts & Taxation' ? 'Finance' : 'Marketing'}
          </span>
          {accounts.length > 1 && (
            <span className="ml-auto text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded" style={{ fontSize: '13px', fontWeight: 500 }}>
              {accounts.length}
            </span>
          )}
        </div>

        {/* Connected Platforms — show brand SVG icons for marketing, labeled text pills for finance */}
        {currentAccount.connectedPlatforms.length > 0 && (() => {
          const svgPlatforms = currentAccount.connectedPlatforms.filter(p => SVG_ICON_PLATFORMS.has(p));
          const labelPlatforms = currentAccount.connectedPlatforms.filter(p => !SVG_ICON_PLATFORMS.has(p));
          
          if (svgPlatforms.length === 0 && labelPlatforms.length === 0) return null;
          
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* SVG brand icons (Google, Meta, GA4, Shopify) */}
              {svgPlatforms.map((platform) => (
                <PlatformIcon key={platform} platform={platform} />
              ))}
              {/* Readable text labels for finance integrations (QuickBooks, Tally, Zoho) */}
              {labelPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {PLATFORM_LABELS[platform] || platform}
                </span>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Account Switcher Dropdown */}
      <AnimatePresence>
        {showSwitcher && accounts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/60 shadow-xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-gray-100/80 flex items-center justify-between">
              <span className="text-gray-400 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Switch Business
              </span>
              <span className="text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                {isMac ? '⌘⇧' : 'Ctrl+Shift+'}1-{Math.min(accounts.length, 9)}
              </span>
            </div>
            <div className="p-1.5 max-h-48 overflow-y-auto">
              {accounts.map((account, index) => {
                const acctStatusColor = account.status === 'connected' 
                  ? 'bg-emerald-500' 
                  : account.status === 'setup' ? 'bg-amber-400' : 'bg-gray-400';
                const isActive = account.id === currentAccount.id;
                const isConfirmingDelete = confirmDeleteId === account.id;

                return (
                  <div key={account.id} className="relative group/item">
                    {/* Delete confirmation inline */}
                    <AnimatePresence>
                      {isConfirmingDelete && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0 z-10 bg-red-50/95 backdrop-blur-sm rounded-lg flex items-center justify-between px-3 py-2 border border-red-200/60"
                        >
                          <span className="text-red-700" style={{ fontSize: '13px', fontWeight: 500 }}>Remove this business?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="px-2 py-1 text-gray-600 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                              style={{ fontSize: '13px', fontWeight: 500 }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(account.id); }}
                              className="px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                              style={{ fontSize: '13px', fontWeight: 500 }}
                            >
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => {
                        if (!isActive) {
                          onSwitch(account);
                          setShowSwitcher(false);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
                        isActive
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        <Building2 className="w-3.5 h-3.5" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${acctStatusColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{account.name}</p>
                          <span className={`px-1.5 py-px rounded-full flex-shrink-0 ${
                            account.service === 'Accounts & Taxation'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-50 text-blue-600'
                          }`} style={{ fontSize: '13px', fontWeight: 500 }}>
                            {account.service === 'Accounts & Taxation' ? 'FIN' : 'MKT'}
                          </span>
                        </div>
                        <p className="text-gray-400 truncate" style={{ fontSize: '13px' }}>{account.businessTypeLabel}</p>
                      </div>

                      {/* Right side: notification badge + keyboard hint + check/menu */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Unread notification count badge */}
                        {notificationCounts && notificationCounts[account.id] > 0 && (
                          <span className="min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-white px-1 mr-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {notificationCounts[account.id]}
                          </span>
                        )}
                        {index < 9 && (
                          <span className="text-gray-300 w-3 text-center" style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 500 }}>
                            {index + 1}
                          </span>
                        )}
                        {isActive ? (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          /* More menu for non-active accounts — only visible on hover */
                          <div ref={menuOpenId === account.id ? menuRef : undefined} className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === account.id ? null : account.id);
                              }}
                              className="p-0.5 rounded opacity-0 group-hover/item:opacity-100 hover:bg-gray-200/60 transition-all duration-150"
                              aria-label="More options"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                            </button>

                            <AnimatePresence>
                              {menuOpenId === account.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-lg border border-gray-200/80 shadow-lg py-1 z-20"
                                >
                                  {accounts.length > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenId(null);
                                        setConfirmDeleteId(account.id);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Remove Business
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-1.5 border-t border-gray-100/80">
              <button
                onClick={() => {
                  setShowSwitcher(false);
                  onAddNew();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all duration-150"
              >
                <div className="w-7 h-7 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium">Add New Business</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
