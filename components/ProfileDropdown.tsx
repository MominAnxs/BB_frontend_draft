'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Settings, Smartphone, LogOut, UserPlus, Check, ExternalLink, Plus, Building2, ChevronUp, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInfo } from '../types';
import { BusinessAccount } from './business/BusinessAccountCard';

interface ProfileDropdownProps {
  userInfo: UserInfo;
  onProfileSettingsClick?: () => void;
  onInviteTeamClick?: () => void;
  onAddBusiness?: () => void;
  businessTypeLabel?: string;
  businessAccounts?: BusinessAccount[];
  activeAccountId?: string;
  onSwitchAccount?: (account: BusinessAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  notificationCounts?: Record<string, number>;
  teamMemberCount?: number;
}

// Mock team members for the avatar row
const TEAM_MEMBERS = [
  { initials: 'AS', color: 'from-violet-500 to-purple-600' },
  { initials: 'RK', color: 'from-emerald-500 to-teal-600' },
  { initials: 'PM', color: 'from-amber-500 to-orange-600' },
];

// Detect Mac vs Windows for shortcut display
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

// Platform icon SVG components
function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function ShopifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.337 3.415c-.022-.165-.153-.247-.256-.263a3.5 3.5 0 0 0-.485-.032s-1.223-.126-1.679-.182c-.457-.056-.641-.577-.641-.577l-2.324 20.4 8.64-1.872S15.36 3.58 15.338 3.415zm-2.965 1.99l-.838 2.55s-.934-.472-2.067-.394c-1.651.114-1.67 1.142-1.651 1.403.089 1.39 3.747 1.694 3.952 4.95.162 2.561-1.357 4.31-3.547 4.448-2.627.166-4.074-1.383-4.074-1.383l.557-2.366s1.456 1.098 2.625 1.024c.763-.048 1.036-.843 1.007-1.395-.116-1.815-3.093-1.708-3.282-4.68-.158-2.502 1.486-5.037 5.117-5.268 1.4-.089 2.115.268 2.115.268z" fill="#96BF48" />
    </svg>
  );
}

function GAIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.84 8.28V22.5a1.5 1.5 0 0 1-1.5 1.5h-2.67a1.5 1.5 0 0 1-1.5-1.5V8.28a1.5 1.5 0 0 1 1.5-1.5h2.67a1.5 1.5 0 0 1 1.5 1.5z" fill="#F9AB00"/>
      <path d="M15.17 14.39V22.5a1.5 1.5 0 0 1-1.5 1.5h-2.67a1.5 1.5 0 0 1-1.5-1.5v-8.11a1.5 1.5 0 0 1 1.5-1.5h2.67a1.5 1.5 0 0 1 1.5 1.5z" fill="#E37400"/>
      <path d="M7.5 20.5V22.5a1.5 1.5 0 0 1-1.5 1.5H3.33a1.5 1.5 0 0 1-1.5-1.5V20.5a1.5 1.5 0 0 1 1.5-1.5H6a1.5 1.5 0 0 1 1.5 1.5z" fill="#E37400"/>
    </svg>
  );
}

export function ProfileDropdown({ userInfo, onProfileSettingsClick, onInviteTeamClick, onAddBusiness, businessTypeLabel, businessAccounts, activeAccountId, onSwitchAccount, onDeleteAccount, notificationCounts, teamMemberCount = 3 }: ProfileDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const currentAccount = businessAccounts?.find(a => a.id === activeAccountId);
  const hasMultipleAccounts = (businessAccounts?.length || 0) > 1;

  const isMarketing = currentAccount
    ? currentAccount.service !== 'Accounts & Taxation'
    : userInfo.selectedService !== 'Accounts & Taxation';
  const serviceBadge = isMarketing ? 'Marketing' : 'Finance';
  const displayBusinessType = currentAccount?.businessTypeLabel || businessTypeLabel || (isMarketing ? 'E-Commerce Business' : 'Trading / Manufacturing');
  const displayCompanyName = currentAccount?.name || userInfo.companyName;

  // Calculate dropdown position based on button position
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right
      });
    }
  }, [showDropdown]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowSwitcher(false);
        setMenuOpenId(null);
        setConfirmDeleteId(null);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSwitcher) {
          setShowSwitcher(false);
          setMenuOpenId(null);
          setConfirmDeleteId(null);
        } else {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown, showSwitcher]);

  // Close inline menu on outside click
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

  const handleDeleteConfirm = (accountId: string) => {
    setConfirmDeleteId(null);
    setMenuOpenId(null);
    setShowSwitcher(false);
    onDeleteAccount?.(accountId);
  };

  return (
    <>
      {/* Profile Button */}
      <button 
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
          showDropdown ? 'bg-gray-100' : 'hover:bg-gray-50'
        }`}
        aria-label="Profile menu"
        aria-expanded={showDropdown}
        aria-controls="profile-dropdown-menu"
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ fontWeight: 600, fontSize: '14px' }}>
          {userInfo.firstName.charAt(0)}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {showDropdown && createPortal(
        <div 
          ref={dropdownRef}
          id="profile-dropdown-menu"
          role="menu"
          className="w-[300px] bg-white rounded-2xl border border-gray-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ 
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            zIndex: 999999,
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)'
          }}
        >
          {/* ── Business Card Section (clickable for switching) ── */}
          <div className="p-4 pb-3.5">
            <div className="flex items-start gap-3">
              {/* Company Avatar */}
              <div className="w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-700 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-gray-900/20 flex-shrink-0" style={{ fontWeight: 700, fontSize: '18px' }}>
                {displayCompanyName.charAt(0)}
              </div>
              <div 
                className={`flex-1 min-w-0 pt-0.5 ${hasMultipleAccounts ? 'cursor-pointer' : ''}`}
                onClick={() => hasMultipleAccounts && setShowSwitcher(!showSwitcher)}
                role={hasMultipleAccounts ? "button" : undefined}
                tabIndex={hasMultipleAccounts ? 0 : undefined}
                onKeyDown={hasMultipleAccounts ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSwitcher(!showSwitcher); } } : undefined}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 600 }}>{displayCompanyName}</h3>
                  {/* Connected dot */}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  {hasMultipleAccounts && (
                    <ChevronUp className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showSwitcher ? '' : 'rotate-180'}`} />
                  )}
                </div>
                <p className="text-[13px] text-gray-500 truncate mt-0.5">{displayBusinessType}</p>
              </div>
              {/* Add New Business button - top right */}
              {onAddBusiness && (
                <button
                  onClick={() => { setShowDropdown(false); onAddBusiness(); }}
                  className="flex-shrink-0 transition-all duration-200"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: '1.5px dashed #d1d5db',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#93a3f8';
                    e.currentTarget.style.background = '#f0f3ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.background = '#fff';
                  }}
                  title="Add new business"
                  aria-label="Add new business"
                >
                  <Plus className="w-[14px] h-[14px] text-gray-400 hover:text-[#204CC7] transition-colors duration-200" />
                </button>
              )}
            </div>

            {/* Service Badge + Platform Icons Row */}
            <div className="flex items-center justify-between mt-3">
              {/* Service Badge */}
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex items-center gap-1 px-2.5 py-[4px] rounded-md text-[13px] ${
                    isMarketing 
                      ? 'bg-[#EEF1FB] text-[#204CC7]' 
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isMarketing ? 'bg-[#204CC7]' : 'bg-emerald-600'}`} />
                  {serviceBadge}
                </span>
                {hasMultipleAccounts && (
                  <span className="text-[13px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>
                    {businessAccounts!.length}
                  </span>
                )}
              </div>

              {/* Platform Icons */}
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center" title="Meta Ads">
                  <MetaIcon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="w-7 h-7 bg-red-50/80 rounded-lg flex items-center justify-center" title="Google Ads">
                  <GoogleIcon className="w-3.5 h-3.5" />
                </div>
                {isMarketing && (
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center" title="Shopify">
                    <ShopifyIcon className="w-3.5 h-3.5 text-green-600" />
                  </div>
                )}
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center" title="Google Analytics">
                  <GAIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Business Switcher (inline, appears when clicking business name) ── */}
          <AnimatePresence>
            {showSwitcher && businessAccounts && businessAccounts.length > 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mx-3 mb-2 bg-gray-50/80 rounded-xl border border-gray-200/60">
                  <div className="px-3 py-2 border-b border-gray-200/50 flex items-center justify-between">
                    <span className="text-[13px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Switch Business
                    </span>
                    <span className="text-[13px] text-gray-300" style={{ fontWeight: 500 }}>
                      {isMac ? '⌘⇧' : 'Ctrl+Shift+'}1-{Math.min(businessAccounts.length, 9)}
                    </span>
                  </div>
                  <div className="p-1.5 max-h-48 overflow-y-auto">
                    {businessAccounts.map((account, index) => {
                      const acctStatusColor = account.status === 'connected' 
                        ? 'bg-emerald-500' 
                        : account.status === 'setup' ? 'bg-amber-400' : 'bg-gray-400';
                      const isActive = account.id === activeAccountId;
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
                                <span className="text-[13px] text-red-700" style={{ fontWeight: 500 }}>Remove?</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                    className="px-2 py-1 text-[13px] text-gray-600 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                                    style={{ fontWeight: 500 }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(account.id); }}
                                    className="px-2 py-1 text-[13px] text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                    style={{ fontWeight: 500 }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            onClick={() => {
                              if (!isActive && onSwitchAccount) {
                                onSwitchAccount(account);
                                setShowSwitcher(false);
                                setShowDropdown(false);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-white'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
                              isActive ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Building2 className="w-3.5 h-3.5" />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${acctStatusColor}`} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[13px] truncate" style={{ fontWeight: 500 }}>{account.name}</p>
                                <span className={`text-[13px] px-1.5 py-px rounded-full flex-shrink-0 ${
                                  account.service === 'Accounts & Taxation'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`} style={{ fontWeight: 500 }}>
                                  {account.service === 'Accounts & Taxation' ? 'FIN' : 'MKT'}
                                </span>
                              </div>
                              <p className="text-[13px] text-gray-400 truncate">{account.businessTypeLabel}</p>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {notificationCounts && notificationCounts[account.id] > 0 && (
                                <span className="min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-white text-[13px] px-1 mr-0.5" style={{ fontWeight: 600 }}>
                                  {notificationCounts[account.id]}
                                </span>
                              )}
                              {index < 9 && (
                                <span className="text-[13px] text-gray-300 w-3 text-center" style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                  {index + 1}
                                </span>
                              )}
                              {isActive ? (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
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
                                        {businessAccounts.length > 1 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setMenuOpenId(null);
                                              setConfirmDeleteId(account.id);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                            style={{ fontWeight: 500 }}
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
                  {/* Add New Business row inside switcher */}
                  <div className="p-1.5 border-t border-gray-200/50">
                    <button
                      onClick={() => {
                        setShowSwitcher(false);
                        setShowDropdown(false);
                        onAddBusiness?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-blue-600 transition-all duration-150"
                    >
                      <div className="w-7 h-7 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px]" style={{ fontWeight: 500 }}>Add New Business</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-px bg-gray-100 mx-3" />

          {/* ── User Section ── */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white text-[13px] shadow-sm" style={{ fontWeight: 600 }}>
                {userInfo.firstName.charAt(0)}{userInfo.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 500 }}>{userInfo.firstName} {userInfo.lastName}</p>
                <p className="text-[13px] text-gray-500 truncate">{userInfo.email || `${userInfo.firstName.toLowerCase()}@${userInfo.companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
              </div>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded-md">
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-[13px] text-gray-600" style={{ fontWeight: 500 }}>Active</span>
              </div>
            </div>

            {/* Team Members Row */}
            <div className="flex items-center gap-2 mt-3 px-0.5">
              <div className="flex items-center -space-x-1.5">
                {TEAM_MEMBERS.slice(0, teamMemberCount > 3 ? 3 : teamMemberCount).map((member, idx) => (
                  <div 
                    key={idx}
                    className={`w-6 h-6 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white ring-2 ring-white`}
                    style={{ fontWeight: 600, fontSize: '13px' }}
                  >
                    {member.initials}
                  </div>
                ))}
                {teamMemberCount > 3 && (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 ring-2 ring-white" style={{ fontWeight: 600, fontSize: '13px' }}>
                    +{teamMemberCount - 3}
                  </div>
                )}
              </div>
              <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{teamMemberCount} team member{teamMemberCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-3" />

          {/* ── Menu Items ── */}
          <div className="p-1.5">
            {/* Profile Settings */}
            <button 
              onClick={() => { setShowDropdown(false); onProfileSettingsClick?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-[10px] flex items-center justify-center group-hover:bg-gray-200/70 transition-colors duration-200">
                <Settings className="w-[16px] h-[16px] text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>Profile Settings</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Invite Team Member */}
            <button 
              onClick={() => { setShowDropdown(false); onInviteTeamClick?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-emerald-50 rounded-[10px] flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-200">
                <UserPlus className="w-[16px] h-[16px] text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>Invite Team Member</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Download Mobile App (Deactivated) */}
            <button 
              disabled
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 cursor-not-allowed opacity-50"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-[16px] h-[16px] text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[13px] block" style={{ fontWeight: 500 }}>Download Mobile App</span>
                <span className="text-[13px] text-gray-400" style={{ fontWeight: 400 }}>Coming soon</span>
              </div>
            </button>
          </div>

          <div className="h-px bg-gray-100 mx-3" />

          {/* ── Logout ── */}
          <div className="p-1.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50/60 transition-all duration-200 group">
              <div className="w-8 h-8 bg-red-50 rounded-[10px] flex items-center justify-center group-hover:bg-red-100 transition-colors duration-200">
                <LogOut className="w-[16px] h-[16px] text-red-500" />
              </div>
              <span className="text-[13px]" style={{ fontWeight: 500 }}>Logout</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
