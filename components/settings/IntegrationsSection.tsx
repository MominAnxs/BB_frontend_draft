'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInfo } from '../../types';
import {
  Link2, CheckCircle2, ExternalLink,
  BookOpen, FileText, Receipt, FileSpreadsheet, Users,
  ShoppingBag, BarChart3,
} from 'lucide-react';
import { GoogleAdsIcon, MetaAdsIcon, GoogleAnalyticsIcon, ShopifyIcon } from '../BrandIcons';

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

type ServiceType = 'marketing-ecommerce' | 'marketing-leadgen' | 'finance';

interface IntegrationsSectionProps {
  userInfo: UserInfo;
}

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  brandIcon?: boolean;
  colorFrom: string;
  colorTo: string;
  category: 'ad-platform' | 'analytics' | 'commerce' | 'crm' | 'accounting' | 'manual';
}

function deriveServiceType(userInfo: UserInfo): ServiceType {
  if (userInfo.selectedService === 'Accounts & Taxation') return 'finance';
  if (userInfo.businessModel === 'leadgen' || userInfo.goal === 'Generate Leads') return 'marketing-leadgen';
  return 'marketing-ecommerce';
}

const marketingIntegrations: IntegrationItem[] = [
  { id: 'meta', name: 'Meta Ads', description: 'Facebook & Instagram ad accounts', icon: <MetaAdsIcon size={20} />, brandIcon: true, colorFrom: 'from-blue-500', colorTo: 'to-blue-600', category: 'ad-platform' },
  { id: 'google', name: 'Google Ads', description: 'Search, Display & YouTube campaigns', icon: <GoogleAdsIcon size={20} />, brandIcon: true, colorFrom: 'from-red-500', colorTo: 'to-orange-500', category: 'ad-platform' },
  { id: 'ga4', name: 'Google Analytics 4', description: 'Website performance and user behavior', icon: <GoogleAnalyticsIcon size={20} />, brandIcon: true, colorFrom: 'from-amber-500', colorTo: 'to-yellow-500', category: 'analytics' },
  { id: 'shopify', name: 'Shopify', description: 'Store data and revenue metrics', icon: <ShopifyIcon size={20} />, brandIcon: true, colorFrom: 'from-green-500', colorTo: 'to-emerald-500', category: 'commerce' },
  { id: 'crm', name: 'Zoho CRM', description: 'Sync leads and manage your sales pipeline', icon: <Users className="w-4.5 h-4.5" />, colorFrom: 'from-purple-500', colorTo: 'to-violet-600', category: 'crm' },
];

const financeIntegrations: IntegrationItem[] = [
  { id: 'tally', name: 'Tally Prime', description: 'Ledger, P&L, and balance sheet sync', icon: <BookOpen className="w-4.5 h-4.5" />, colorFrom: 'from-blue-600', colorTo: 'to-indigo-600', category: 'accounting' },
  { id: 'zoho', name: 'Zoho Books', description: 'Automated bookkeeping reconciliation', icon: <FileText className="w-4.5 h-4.5" />, colorFrom: 'from-red-500', colorTo: 'to-red-600', category: 'accounting' },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Invoices, expenses, and financial reports', icon: <Receipt className="w-4.5 h-4.5" />, colorFrom: 'from-green-500', colorTo: 'to-emerald-600', category: 'accounting' },
  { id: 'manual', name: 'Manual / Excel Upload', description: 'Upload books via spreadsheets', icon: <FileSpreadsheet className="w-4.5 h-4.5" />, colorFrom: 'from-slate-500', colorTo: 'to-gray-600', category: 'manual' },
  { id: 'shopify-fin', name: 'Shopify', description: 'E-commerce revenue & transaction data', icon: <ShopifyIcon size={20} />, brandIcon: true, colorFrom: 'from-green-500', colorTo: 'to-emerald-500', category: 'commerce' },
  { id: 'amazon', name: 'Amazon Seller', description: 'Seller Central order & settlement data', icon: <ShoppingBag className="w-4.5 h-4.5" />, colorFrom: 'from-orange-500', colorTo: 'to-amber-600', category: 'commerce' },
];

function getCategoryLabel(category: IntegrationItem['category']): string {
  switch (category) {
    case 'ad-platform': return 'Ad Platforms';
    case 'analytics': return 'Analytics';
    case 'commerce': return 'Commerce & Storefronts';
    case 'crm': return 'CRM & Pipeline';
    case 'accounting': return 'Accounting Software';
    case 'manual': return 'Manual Import';
  }
}

function groupByCategory(items: IntegrationItem[]) {
  const groups: Record<string, IntegrationItem[]> = {};
  items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });
  return groups;
}

export function IntegrationsSection({ userInfo }: IntegrationsSectionProps) {
  const serviceType = deriveServiceType(userInfo);
  const integrations = serviceType === 'finance' ? financeIntegrations : marketingIntegrations;
  const grouped = groupByCategory(integrations);

  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    if (connectedAccounts[id]) {
      // Disconnect
      setConnectedAccounts(prev => ({ ...prev, [id]: false }));
      return;
    }
    setConnecting(id);
    setTimeout(() => {
      setConnectedAccounts(prev => ({ ...prev, [id]: true }));
      setConnecting(null);
    }, 1500);
  };

  const connectedCount = Object.values(connectedAccounts).filter(Boolean).length;
  const totalCount = integrations.length;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <StaggerItem index={0}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Integrations</h1>
            <p className="text-sm text-gray-500">Connect your platforms and tools to power your dashboard</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <Link2 className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">{connectedCount} of {totalCount} connected</span>
          </div>
        </div>
      </StaggerItem>

      {/* Connection status banner */}
      {connectedCount > 0 && (
        <StaggerItem index={1}>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/60 px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">
                {connectedCount} integration{connectedCount !== 1 ? 's' : ''} active
              </p>
              <p className="text-xs text-emerald-600/80">Data is syncing and feeding into your dashboard</p>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Integration groups */}
      {Object.entries(grouped).map(([category, items], groupIdx) => (
        <StaggerItem key={category} index={groupIdx + 2}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/40">
              <span className="text-[13px] text-gray-500 uppercase tracking-wider font-semibold">
                {getCategoryLabel(category as IntegrationItem['category'])}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const isConnected = connectedAccounts[item.id];
                const isConnecting = connecting === item.id;

                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/40 transition-colors duration-150">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.colorFrom} ${item.colorTo} flex items-center justify-center flex-shrink-0 ${item.brandIcon ? '' : 'text-white'}`}>
                      {item.brandIcon ? item.icon : item.icon}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        {isConnected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-semibold rounded-md border border-green-100"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Connected
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                    {/* Action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isConnected && (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Open dashboard">
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleConnect(item.id)}
                        disabled={isConnecting}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isConnecting
                            ? 'bg-blue-50 text-blue-500 cursor-wait'
                            : isConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20'
                        }`}
                      >
                        {isConnecting ? (
                          <span className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            Connecting...
                          </span>
                        ) : isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </StaggerItem>
      ))}

      {/* Footer tip */}
      <StaggerItem index={Object.keys(grouped).length + 3}>
        <div className="flex items-start gap-3 px-5 py-4 bg-blue-50/60 rounded-2xl border border-blue-100">
          <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-800 font-medium">More integrations coming soon</p>
            <p className="text-[13px] text-blue-600/70 mt-0.5">
              {serviceType === 'finance'
                ? 'Direct bank feeds, GST Portal sync, and more accounting tools are on the roadmap.'
                : 'LinkedIn Ads, TikTok Ads, WooCommerce, and more platforms are on the roadmap.'}
            </p>
          </div>
        </div>
      </StaggerItem>
    </div>
  );
}
