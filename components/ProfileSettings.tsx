'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { UserManagementSection } from './settings/UserManagementSection';
import { BusinessDetailsSection } from './settings/BusinessDetailsSection';
import { SubscriptionBillingSection } from './settings/SubscriptionBillingSection';
import { ChangePasswordSection } from './ChangePasswordSection';
import { NotificationSettings } from './NotificationSettings';
import { NavTabs } from './NavTabs';
import { BregoLogo } from './BregoLogo';
import { ProfileDropdown } from './ProfileDropdown';
import { UserInfo } from '../types';
import { MessageSquare, BarChart3, Briefcase, Database, User, Building2, Lock, Users, Bell, CreditCard, ChevronRight, Camera, Globe, MapPin, Mail, Phone, Shield, CheckCircle2 } from 'lucide-react';

// ── Stagger animation wrapper ──
function StaggerItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

export type SettingsSection = 'personal' | 'business' | 'password' | 'users' | 'notifications' | 'billing';

interface ProfileSettingsProps {
  userInfo: UserInfo;
  onClose: () => void;
  onNavigate: (screen: 'chat' | 'reports' | 'workspace' | 'dataroom') => void;
  /**
   * Which section is currently active. When provided (e.g. driven by the
   * URL segment on a `/settings/[section]` route), the component runs in
   * "controlled" mode and the prop is the source of truth — the left-nav
   * tabs render as Next.js <Link> elements so clicking one mutates the URL
   * rather than component state. When omitted, the component falls back
   * to internal useState and the tabs behave as plain buttons. That keeps
   * the overlay/modal mount in ChatInterface working unchanged.
   */
  activeSection?: SettingsSection;
  /**
   * Builder that maps a section id to its URL. Required for URL-driven
   * mode — pass e.g. `(s) => buildPath(`settings/${s}`)` from the page.
   * When omitted, the tabs use internal state instead of routing.
   */
  buildSectionHref?: (section: SettingsSection) => string;
  /** Fired when the user clicks a tab in URL-driven mode so the parent
   *  can piggyback (e.g. close an overlay). Optional. */
  onSectionChange?: (section: SettingsSection) => void;
  initialSection?: SettingsSection;
  initialAutoInvite?: boolean;
  businessAccounts?: { id: string; service: 'Performance Marketing' | 'Accounts & Taxation' }[];
}

export function ProfileSettings({
  userInfo,
  onClose,
  onNavigate,
  activeSection: controlledSection,
  buildSectionHref,
  onSectionChange,
  initialSection,
  initialAutoInvite,
  businessAccounts,
}: ProfileSettingsProps) {
  const router = useRouter();
  // Internal state backs "uncontrolled" consumers (the ChatInterface
  // overlay). When `controlledSection` is supplied, the URL is the source
  // of truth — the tab <Link>s mutate the URL, which feeds back in as a
  // new `controlledSection` on the next render. We still keep an internal
  // mirror for backward-compat paths that call setActiveSection directly
  // (they should be rare once everything is URL-driven).
  const [internalSection, setInternalSection] = useState<SettingsSection>(
    controlledSection ?? initialSection ?? 'personal'
  );
  useEffect(() => {
    if (controlledSection !== undefined) setInternalSection(controlledSection);
  }, [controlledSection]);
  const activeSection = controlledSection ?? internalSection;
  // Programmatic section change (e.g. "Invite team" in the header
  // dropdown jumping straight to Users). URL-driven mode routes; overlay
  // mode just updates local state. Either way `onSectionChange` fires so
  // the parent can react (close overlays, etc).
  const setActiveSection = useCallback(
    (next: SettingsSection) => {
      if (buildSectionHref) {
        router.push(buildSectionHref(next));
      } else {
        setInternalSection(next);
      }
      onSectionChange?.(next);
    },
    [buildSectionHref, onSectionChange, router]
  );
  const [autoOpenInvite, setAutoOpenInvite] = useState(initialAutoInvite || false);
  const [profileData, setProfileData] = useState({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    email: userInfo.email || '',
    phone: userInfo.phoneNumber || userInfo.phone || '',
    country: userInfo.country || '',
    city: userInfo.city || '',
    companyName: userInfo.companyName || '',
    companyWebsite: userInfo.companyWebsite || '',
    avatar: ''
  });

  const [personalExtra, setPersonalExtra] = useState({
    phoneCode: '+91',
    timezone: 'Asia/Kolkata',
    language: 'en',
    role: 'Admin',
    emailVerified: true,
    phoneVerified: false,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const navigationItems = [
    { id: 'personal' as SettingsSection, label: 'Personal Info', icon: User },
    { id: 'business' as SettingsSection, label: 'Business Details', icon: Building2 },
    { id: 'password' as SettingsSection, label: 'Change Password', icon: Lock },
    { id: 'users' as SettingsSection, label: 'User Management', icon: Users },
    { id: 'notifications' as SettingsSection, label: 'Notification Settings', icon: Bell },
    { id: 'billing' as SettingsSection, label: 'Subscription & Billing', icon: CreditCard },
  ];

  const handleSavePersonalInfo = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      toast.success('Personal Information updated', {
        description: 'Your changes have been saved.',
        duration: 2500,
      });
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1200);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleInviteTeamClick = useCallback(() => {
    setActiveSection('users');
    setAutoOpenInvite(true);
  }, []);

  const handleInviteOpened = useCallback(() => {
    setAutoOpenInvite(false);
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            borderRadius: '14px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            color: '#1f2937',
          },
        }}
      />
      {/* Top Navigation - Consistent with other screens */}
      <div className="nav-glass sticky top-0 z-50">
        <div className="px-6 h-14 flex items-center justify-between relative">
          {/* Left - Logo */}
          <div className="flex items-center">
            <BregoLogo size={36} variant="full" />
          </div>
            
          {/* Center - Navigation Buttons */}
          <nav className="absolute left-1/2 transform -translate-x-1/2">
            <NavTabs items={[
              { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false, onClick: () => onNavigate('chat') },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: false, onClick: () => onNavigate('reports') },
              { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: false, onClick: () => onNavigate('workspace') },
              { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: false, onClick: () => onNavigate('dataroom') },
            ]} />
          </nav>

          {/* Right - Profile */}
          <div className="flex items-center gap-3">
            <ProfileDropdown userInfo={userInfo} onInviteTeamClick={handleInviteTeamClick} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-72 sidebar-glass overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 600 }}>Profile Settings</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Close"
                aria-label="Close settings"
              >
                
              </button>
            </div>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                // Shared visual shell — keeps the Link and button branches
                // pixel-identical so the only real difference is whether a
                // click mutates the URL or just local state.
                const className = `w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-light text-brand'
                    : 'text-gray-700 hover:bg-gray-100'
                }`;
                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                          isActive ? 'bg-brand/10' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand' : 'text-gray-600'}`} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-brand" />}
                  </>
                );

                // URL-driven mode: render a real <Link> so the tab gets
                // prefetching, middle-click-to-new-tab, and proper
                // back-button behavior for free. Fires `onSectionChange`
                // for parents who still want the callback (e.g. closing
                // a parent overlay before the route transition resolves).
                if (buildSectionHref) {
                  return (
                    <Link
                      key={item.id}
                      href={buildSectionHref(item.id)}
                      onClick={() => onSectionChange?.(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                }

                // Overlay / uncontrolled mode: plain button + setState.
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Personal Info Section */}
            {activeSection === 'personal' && (
              <div className="space-y-5 pb-6">
                {/* Header */}
                <StaggerItem index={0}>
                  <div>
                    <h1 className="text-gray-900 mb-1" style={{ fontSize: '24px', fontWeight: 600 }}>Personal Information</h1>
                    <p className="text-gray-500" style={{ fontSize: '14px' }}>Manage your identity, contact details and preferences</p>
                  </div>
                </StaggerItem>

                {/* Profile Card */}
                <StaggerItem index={1}>
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="relative group flex-shrink-0">
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white shadow-md"
                          style={{ fontSize: '24px', fontWeight: 600 }}
                          whileHover={{ scale: 1.04 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          {profileData.firstName.charAt(0)}
                        </motion.div>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200"
                        >
                          <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={() => {}}
                        />
                      </div>
                      {/* Name & meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-gray-900 truncate" style={{ fontSize: '20px', fontWeight: 600 }}>
                            {profileData.firstName} {profileData.lastName}
                          </h2>
                          <span className="px-2 py-0.5 bg-brand-light text-brand text-[13px] rounded-md border border-brand/10 flex-shrink-0" style={{ fontWeight: 600 }}>
                            Admin
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-gray-500 truncate" style={{ fontSize: '14px' }}>{profileData.email || 'No email set'}</p>
                          {profileData.country && (
                            <span className="flex items-center gap-1 text-gray-400 flex-shrink-0" style={{ fontSize: '13px' }}>
                              <MapPin className="w-3 h-3" />
                              {profileData.city ? `${profileData.city}, ` : ''}{profileData.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Basic Information */}
                <StaggerItem index={2}>
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
                        <User className="w-4 h-4 text-brand" />
                      </div>
                      <h3 className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '14px', fontWeight: 600 }}>Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>First Name</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => handleProfileChange('firstName', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                            placeholder="Enter first name"
                          />
                        </div>
                      </div>
                      {/* Last Name */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Last Name</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => handleProfileChange('lastName', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      {/* Country */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Country</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Globe className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.country}
                            onChange={(e) => handleProfileChange('country', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                      {/* City */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>City</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <MapPin className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => handleProfileChange('city', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                            placeholder="Enter city"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Contact Information */}
                <StaggerItem index={3}>
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '14px', fontWeight: 600 }}>Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      {/* Email */}
                      <div>
                        <label className="flex items-center gap-2 text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                          Email Address
                          {personalExtra.emailVerified && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100" style={{ fontSize: '13px', fontWeight: 600 }}>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-2 text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                          Phone Number
                          {!personalExtra.phoneVerified && profileData.phone && (
                            <button className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100 hover:bg-amber-100 transition-colors" style={{ fontSize: '13px', fontWeight: 600 }}>
                              <Shield className="w-2.5 h-2.5" />
                              Verify
                            </button>
                          )}
                        </label>
                        <div className="relative flex gap-2">
                          <select
                            value={personalExtra.phoneCode}
                            onChange={(e) => { setPersonalExtra(prev => ({ ...prev, phoneCode: e.target.value })); setHasUnsavedChanges(true); }}
                            className="w-[76px] px-2 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200 flex-shrink-0"
                            style={{ fontSize: '14px' }}
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+971">+971</option>
                          </select>
                          <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Phone className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => handleProfileChange('phone', e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                              placeholder="98765 43210"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Preferences */}
                <StaggerItem index={4}>
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="text-gray-900 uppercase tracking-wide" style={{ fontSize: '14px', fontWeight: 600 }}>Preferences</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                      {/* Timezone */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Timezone</label>
                        <select
                          value={personalExtra.timezone}
                          onChange={(e) => { setPersonalExtra(prev => ({ ...prev, timezone: e.target.value })); setHasUnsavedChanges(true); }}
                          className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                          style={{ fontSize: '14px' }}
                        >
                          <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                          <option value="America/New_York">EST (UTC-5)</option>
                          <option value="America/Los_Angeles">PST (UTC-8)</option>
                          <option value="Europe/London">GMT (UTC+0)</option>
                          <option value="Asia/Dubai">GST (UTC+4)</option>
                        </select>
                      </div>
                      {/* Language */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Language</label>
                        <select
                          value={personalExtra.language}
                          onChange={(e) => { setPersonalExtra(prev => ({ ...prev, language: e.target.value })); setHasUnsavedChanges(true); }}
                          className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                          style={{ fontSize: '14px' }}
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                      {/* Role (read-only) */}
                      <div>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Account Role</label>
                        <div className="px-3.5 py-2.5 rounded-xl bg-gray-50/60 border border-dashed border-gray-200 text-gray-600 flex items-center gap-2" style={{ fontSize: '14px' }}>
                          <Shield className="w-3.5 h-3.5 text-gray-400" />
                          {personalExtra.role}
                          <span className="text-gray-400 ml-auto" style={{ fontSize: '13px' }}>Admin managed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Sticky Save Bar */}
                <AnimatePresence>
                  {hasUnsavedChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="sticky bottom-6 z-10"
                    >
                      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-white/80" style={{ fontSize: '14px' }}>You have unsaved changes</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setProfileData({
                                firstName: userInfo.firstName,
                                lastName: userInfo.lastName,
                                email: userInfo.email || '',
                                phone: userInfo.phoneNumber || userInfo.phone || '',
                                country: userInfo.country || '',
                                city: userInfo.city || '',
                                companyName: userInfo.companyName || '',
                                companyWebsite: userInfo.companyWebsite || '',
                                avatar: ''
                              });
                              setHasUnsavedChanges(false);
                            }}
                            className="px-4 py-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                            style={{ fontSize: '14px', fontWeight: 500 }}
                          >
                            Discard
                          </button>
                          <motion.button
                            onClick={handleSavePersonalInfo}
                            disabled={saveStatus === 'saving'}
                            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-xl shadow-sm hover:bg-brand-hover transition-all duration-200 disabled:opacity-70"
                            style={{ fontSize: '14px', fontWeight: 500 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <AnimatePresence mode="wait">
                              {saveStatus === 'saving' ? (
                                <motion.div
                                  key="saving"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                />
                              ) : saveStatus === 'saved' ? (
                                <motion.div
                                  key="saved"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Business Details Section */}
            {activeSection === 'business' && (
              <BusinessDetailsSection userInfo={userInfo} businessAccounts={businessAccounts} />
            )}

            {/* Change Password Section */}
            {activeSection === 'password' && (
              <ChangePasswordSection />
            )}

            {/* User Management Section */}
            {activeSection === 'users' && (
              <UserManagementSection userInfo={userInfo} autoOpenInvite={autoOpenInvite} onInviteOpened={handleInviteOpened} />
            )}

            {/* Notification Settings Section */}
            {activeSection === 'notifications' && (
              <NotificationSettings />
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <SubscriptionBillingSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}