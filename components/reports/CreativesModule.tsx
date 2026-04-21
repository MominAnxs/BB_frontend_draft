'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap, Target, Image as ImageIcon, Award, Palette, Play, Clock, ChevronLeft, ChevronRight, IndianRupee, ShoppingCart, ArrowRight, Search, BarChart3, Layout, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, Globe, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ActionPanel } from './ActionPanel';
import { CreativesDrawer } from './marketing/CreativesDrawer';

interface CreativesModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel?: string;
  selectedPlatform?: 'meta' | 'google';
}

interface CreativeData {
  id: string;
  thumbnail: string;
  campaignName: string;
  adSetName: string;
  format: string;
  hook: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  linkClicks: number;
  lpv: number;
  costPerResult: number;
  roas: number;
  cpl: number;
  leads: number;
  purchases?: number;
  cpa?: number;
  cvr: number;
  frequency: number;
  daysLive: number;
  status: 'fresh' | 'fatiguing' | 'dead';
  qualityScore?: number;
  impressionShare?: number;
  conversions?: number;
  searchImprShare?: string;
}

export function CreativesModule({ businessModel, selectedChannel, selectedPlatform = 'meta' }: CreativesModuleProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CreativeData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>('last30days');
  const [creativesDrawerOpen, setCreativesDrawerOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<CreativeData | null>(null);
  const itemsPerPage = 5;

  // ─── FILTER STATE ──────────────────────────────────────────────────
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [adGroupFilter, setAdGroupFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Reset filters when platform changes
  React.useEffect(() => {
    setCampaignFilter('all');
    setAdGroupFilter('all');
    setFormatFilter('all');
    setStatusFilter('all');
    setSortField('');
    setCurrentPage(1);
  }, [selectedPlatform]);

  // ─── META ADS CREATIVE DATA ───────────────────────────────────────
  const metaCreativeData: CreativeData[] = businessModel === 'ecommerce' ? [
    { id: 'CR-001', thumbnail: '', campaignName: 'Product Catalog Sales - Summer', adSetName: 'Retargeting - Engaged Users', format: 'Video', hook: 'Problem-Solution', spend: 85000, impressions: 425000, reach: 350000, clicks: 13600, ctr: 0.032, cpc: 6.25, cpm: 200, linkClicks: 13600, lpv: 11500, costPerResult: 265, roas: 3.8, cpl: 0, leads: 0, purchases: 44, cpa: 1931.82, cvr: 0.32, frequency: 2.3, daysLive: 12, status: 'fresh' },
    { id: 'CR-002', thumbnail: '', campaignName: 'Dynamic Retargeting', adSetName: 'Website Visitors - 7D', format: 'Video', hook: 'Before-After', spend: 72000, impressions: 320000, reach: 260000, clicks: 12160, ctr: 0.038, cpc: 5.92, cpm: 225, linkClicks: 12160, lpv: 10200, costPerResult: 230, roas: 3.6, cpl: 0, leads: 0, purchases: 37, cpa: 1945.95, cvr: 0.30, frequency: 2.8, daysLive: 18, status: 'fresh' },
    { id: 'CR-003', thumbnail: '', campaignName: 'Collection Ads - New Arrivals', adSetName: 'Prospecting - Lookalike 1%', format: 'Image', hook: 'Social Proof', spend: 58000, impressions: 290000, reach: 240000, clicks: 8120, ctr: 0.028, cpc: 7.13, cpm: 200, linkClicks: 8120, lpv: 6850, costPerResult: 285, roas: 3.4, cpl: 0, leads: 0, purchases: 31, cpa: 1870.97, cvr: 0.39, frequency: 3.2, daysLive: 22, status: 'fresh' },
    { id: 'CR-004', thumbnail: '', campaignName: 'Prospecting - Lookalike', adSetName: 'Lookalike 2-3%', format: 'Video', hook: 'Founder Story', spend: 64000, impressions: 275000, reach: 220000, clicks: 9625, ctr: 0.035, cpc: 6.65, cpm: 233, linkClicks: 9625, lpv: 8180, costPerResult: 255, roas: 3.3, cpl: 0, leads: 0, purchases: 25, cpa: 2560.00, cvr: 0.26, frequency: 2.6, daysLive: 15, status: 'fresh' },
    { id: 'CR-005', thumbnail: '', campaignName: 'Season Sale Campaign', adSetName: 'Broad Audience - Interest', format: 'Image', hook: 'Product Feature', spend: 48000, impressions: 220000, reach: 180000, clicks: 5500, ctr: 0.025, cpc: 8.73, cpm: 218, linkClicks: 5500, lpv: 4650, costPerResult: 320, roas: 3.2, cpl: 0, leads: 0, purchases: 18, cpa: 2666.67, cvr: 0.33, frequency: 3.8, daysLive: 28, status: 'fresh' },
    { id: 'CR-006', thumbnail: '', campaignName: 'UGC Campaign - Testimonials', adSetName: 'Interest Targeting - Beauty', format: 'Video', hook: 'UGC Testimonial', spend: 52000, impressions: 185000, reach: 150000, clicks: 4070, ctr: 0.022, cpc: 12.78, cpm: 281, linkClicks: 4070, lpv: 3450, costPerResult: 385, roas: 2.9, cpl: 0, leads: 0, purchases: 14, cpa: 3714.29, cvr: 0.34, frequency: 4.2, daysLive: 35, status: 'fatiguing' },
    { id: 'CR-007', thumbnail: '', campaignName: 'Flash Sale - Limited Time', adSetName: 'Cart Abandoners - 14D', format: 'Image', hook: 'Discount Offer', spend: 38000, impressions: 140000, reach: 120000, clicks: 2800, ctr: 0.020, cpc: 13.57, cpm: 271, linkClicks: 2800, lpv: 2380, costPerResult: 410, roas: 2.7, cpl: 0, leads: 0, purchases: 11, cpa: 3454.55, cvr: 0.39, frequency: 4.8, daysLive: 42, status: 'fatiguing' },
    { id: 'CR-008', thumbnail: '', campaignName: 'How-To Content Series', adSetName: 'Engaged Shoppers - 30D', format: 'Video', hook: 'How-To Demo', spend: 42000, impressions: 125000, reach: 100000, clicks: 2250, ctr: 0.018, cpc: 18.67, cpm: 336, linkClicks: 2250, lpv: 1900, costPerResult: 470, roas: 2.5, cpl: 0, leads: 0, purchases: 9, cpa: 4666.67, cvr: 0.40, frequency: 5.4, daysLive: 48, status: 'fatiguing' },
    { id: 'CR-009', thumbnail: '', campaignName: 'Lifestyle Content', adSetName: 'Broad - Demographics', format: 'Image', hook: 'Lifestyle Shot', spend: 28000, impressions: 95000, reach: 80000, clicks: 1425, ctr: 0.015, cpc: 19.65, cpm: 295, linkClicks: 1425, lpv: 1200, costPerResult: 540, roas: 2.2, cpl: 0, leads: 0, purchases: 5, cpa: 5600.00, cvr: 0.36, frequency: 6.2, daysLive: 56, status: 'dead' },
    { id: 'CR-010', thumbnail: '', campaignName: 'Unboxing Videos', adSetName: 'Interest - Shopping', format: 'Video', hook: 'Product Unboxing', spend: 22000, impressions: 72000, reach: 60000, clicks: 864, ctr: 0.012, cpc: 25.46, cpm: 306, linkClicks: 864, lpv: 730, costPerResult: 620, roas: 1.9, cpl: 0, leads: 0, purchases: 4, cpa: 5500.00, cvr: 0.46, frequency: 7.8, daysLive: 64, status: 'dead' },
  ] : [
    { id: 'CR-001', thumbnail: '', campaignName: 'Lead Gen Forms - Service Discovery', adSetName: 'Lookalike - Converted Leads', format: 'Video', hook: 'Thought Leadership', spend: 85000, impressions: 340000, reach: 280000, clicks: 8500, ctr: 0.025, cpc: 10.00, cpm: 250, linkClicks: 8500, lpv: 7200, costPerResult: 285, roas: 0, cpl: 285, leads: 298, cvr: 3.51, frequency: 2.1, daysLive: 14, status: 'fresh' },
    { id: 'CR-002', thumbnail: '', campaignName: 'Video - Founder Testimonials', adSetName: 'Cold Audience - LinkedIn', format: 'Image', hook: 'Case Study Results', spend: 72000, impressions: 288000, reach: 240000, clicks: 6336, ctr: 0.022, cpc: 11.36, cpm: 250, linkClicks: 6336, lpv: 5385, costPerResult: 310, roas: 0, cpl: 310, leads: 232, cvr: 3.66, frequency: 2.6, daysLive: 18, status: 'fresh' },
    { id: 'CR-003', thumbnail: '', campaignName: 'Problem-Agitation Campaign', adSetName: 'Interest Targeting - B2B', format: 'Video', hook: 'Problem-Agitation', spend: 68000, impressions: 272000, reach: 220000, clicks: 6528, ctr: 0.024, cpc: 10.42, cpm: 250, linkClicks: 6528, lpv: 5550, costPerResult: 295, roas: 0, cpl: 295, leads: 230, cvr: 3.52, frequency: 2.8, daysLive: 21, status: 'fresh' },
    { id: 'CR-004', thumbnail: '', campaignName: 'ROI Calculator Lead Magnet', adSetName: 'LinkedIn - Job Title', format: 'Image', hook: 'ROI Calculator', spend: 58000, impressions: 193000, reach: 160000, clicks: 3860, ctr: 0.020, cpc: 15.03, cpm: 300, linkClicks: 3860, lpv: 3280, costPerResult: 320, roas: 0, cpl: 320, leads: 181, cvr: 4.69, frequency: 3.1, daysLive: 25, status: 'fresh' },
    { id: 'CR-005', thumbnail: '', campaignName: 'Expert Interview Series', adSetName: 'Interest - Business Services', format: 'Video', hook: 'Expert Interview', spend: 52000, impressions: 173000, reach: 140000, clicks: 3114, ctr: 0.018, cpc: 16.69, cpm: 300, linkClicks: 3114, lpv: 2650, costPerResult: 340, roas: 0, cpl: 340, leads: 153, cvr: 4.91, frequency: 3.5, daysLive: 28, status: 'fresh' },
    { id: 'CR-006', thumbnail: '', campaignName: 'Industry Report Download', adSetName: 'Engaged - 30D', format: 'Image', hook: 'Industry Report', spend: 48000, impressions: 137000, reach: 110000, clicks: 2192, ctr: 0.016, cpc: 21.89, cpm: 350, linkClicks: 2192, lpv: 1865, costPerResult: 380, roas: 0, cpl: 380, leads: 126, cvr: 5.75, frequency: 4.2, daysLive: 35, status: 'fatiguing' },
    { id: 'CR-007', thumbnail: '', campaignName: 'Webinar Registration', adSetName: 'Lookalike - Webinar Attendees', format: 'Video', hook: 'Webinar Promo', spend: 42000, impressions: 112000, reach: 90000, clicks: 1568, ctr: 0.014, cpc: 26.79, cpm: 375, linkClicks: 1568, lpv: 1330, costPerResult: 420, roas: 0, cpl: 420, leads: 100, cvr: 6.38, frequency: 4.8, daysLive: 42, status: 'fatiguing' },
    { id: 'CR-008', thumbnail: '', campaignName: 'Free Consultation Offer', adSetName: 'Retargeting - Website', format: 'Image', hook: 'Free Consultation', spend: 38000, impressions: 95000, reach: 80000, clicks: 1140, ctr: 0.012, cpc: 33.33, cpm: 400, linkClicks: 1140, lpv: 970, costPerResult: 475, roas: 0, cpl: 475, leads: 80, cvr: 7.02, frequency: 5.4, daysLive: 49, status: 'fatiguing' },
    { id: 'CR-009', thumbnail: '', campaignName: 'Product Demo Videos', adSetName: 'Broad - Business Owners', format: 'Video', hook: 'Product Demo', spend: 32000, impressions: 74000, reach: 60000, clicks: 740, ctr: 0.010, cpc: 43.24, cpm: 432, linkClicks: 740, lpv: 630, costPerResult: 520, roas: 0, cpl: 520, leads: 62, cvr: 8.38, frequency: 6.2, daysLive: 56, status: 'dead' },
    { id: 'CR-010', thumbnail: '', campaignName: 'Generic Benefits Campaign', adSetName: 'Interest - All', format: 'Image', hook: 'Generic Benefits', spend: 28000, impressions: 56000, reach: 40000, clicks: 448, ctr: 0.008, cpc: 62.50, cpm: 500, linkClicks: 448, lpv: 380, costPerResult: 580, roas: 0, cpl: 580, leads: 48, cvr: 10.71, frequency: 7.1, daysLive: 63, status: 'dead' },
  ];

  // ─── GOOGLE ADS CREATIVE DATA ─────────────────────────────────────
  const googleCreativeData: CreativeData[] = businessModel === 'ecommerce' ? [
    { id: 'GC-001', thumbnail: '', campaignName: 'Brand Search - Exact Match', adSetName: 'Brand Keywords', format: 'RSA', hook: 'Brand + Offer', spend: 92000, impressions: 380000, reach: 310000, clicks: 19760, ctr: 0.052, cpc: 4.66, cpm: 242, linkClicks: 19760, lpv: 16800, costPerResult: 195, roas: 4.5, cpl: 0, leads: 0, purchases: 62, cpa: 1483.87, cvr: 0.31, frequency: 1.8, daysLive: 10, status: 'fresh', qualityScore: 9, impressionShare: 0.92, searchImprShare: '92%' },
    { id: 'GC-002', thumbnail: '', campaignName: 'Shopping - Top Products', adSetName: 'Product Group - Best Sellers', format: 'PMax', hook: 'Product Feed - Dynamic', spend: 78000, impressions: 520000, reach: 420000, clicks: 15600, ctr: 0.030, cpc: 5.00, cpm: 150, linkClicks: 15600, lpv: 13260, costPerResult: 210, roas: 4.2, cpl: 0, leads: 0, purchases: 55, cpa: 1418.18, cvr: 0.35, frequency: 2.1, daysLive: 14, status: 'fresh', qualityScore: 8, impressionShare: 0.78 },
    { id: 'GC-003', thumbnail: '', campaignName: 'YouTube - Product Demos', adSetName: 'In-Market - Shopping', format: 'Video', hook: 'Product Demo 15s', spend: 65000, impressions: 480000, reach: 390000, clicks: 9600, ctr: 0.020, cpc: 6.77, cpm: 135, linkClicks: 9600, lpv: 8160, costPerResult: 240, roas: 3.8, cpl: 0, leads: 0, purchases: 38, cpa: 1710.53, cvr: 0.40, frequency: 2.4, daysLive: 18, status: 'fresh', qualityScore: 7 },
    { id: 'GC-004', thumbnail: '', campaignName: 'Generic Search - Category', adSetName: 'Category Keywords', format: 'RSA', hook: 'Price + USP', spend: 58000, impressions: 290000, reach: 235000, clicks: 11020, ctr: 0.038, cpc: 5.26, cpm: 200, linkClicks: 11020, lpv: 9370, costPerResult: 250, roas: 3.5, cpl: 0, leads: 0, purchases: 28, cpa: 2071.43, cvr: 0.25, frequency: 2.2, daysLive: 20, status: 'fresh', qualityScore: 7, impressionShare: 0.65, searchImprShare: '65%' },
    { id: 'GC-005', thumbnail: '', campaignName: 'Display - Retargeting', adSetName: 'Website Visitors - 14D', format: 'RDA', hook: 'Dynamic Remarketing', spend: 45000, impressions: 620000, reach: 380000, clicks: 6200, ctr: 0.010, cpc: 7.26, cpm: 73, linkClicks: 6200, lpv: 5270, costPerResult: 280, roas: 3.3, cpl: 0, leads: 0, purchases: 22, cpa: 2045.45, cvr: 0.35, frequency: 3.4, daysLive: 25, status: 'fresh', qualityScore: 6 },
    { id: 'GC-006', thumbnail: '', campaignName: 'PMax - Seasonal Push', adSetName: 'Asset Group - Summer Sale', format: 'PMax', hook: 'Sale + Urgency', spend: 52000, impressions: 410000, reach: 320000, clicks: 7380, ctr: 0.018, cpc: 7.05, cpm: 127, linkClicks: 7380, lpv: 6270, costPerResult: 310, roas: 3.0, cpl: 0, leads: 0, purchases: 19, cpa: 2736.84, cvr: 0.26, frequency: 3.8, daysLive: 32, status: 'fresh', qualityScore: 6 },
    { id: 'GC-007', thumbnail: '', campaignName: 'YouTube - Brand Awareness', adSetName: 'Affinity - Shoppers', format: 'Video', hook: 'Brand Story 30s', spend: 42000, impressions: 350000, reach: 280000, clicks: 3500, ctr: 0.010, cpc: 12.00, cpm: 120, linkClicks: 3500, lpv: 2975, costPerResult: 380, roas: 2.6, cpl: 0, leads: 0, purchases: 12, cpa: 3500.00, cvr: 0.34, frequency: 4.2, daysLive: 38, status: 'fatiguing', qualityScore: 5 },
    { id: 'GC-008', thumbnail: '', campaignName: 'Display - Prospecting', adSetName: 'Custom Intent - Competitors', format: 'RDA', hook: 'Comparison Offer', spend: 38000, impressions: 540000, reach: 420000, clicks: 2700, ctr: 0.005, cpc: 14.07, cpm: 70, linkClicks: 2700, lpv: 2295, costPerResult: 430, roas: 2.3, cpl: 0, leads: 0, purchases: 9, cpa: 4222.22, cvr: 0.33, frequency: 5.1, daysLive: 45, status: 'fatiguing', qualityScore: 4 },
    { id: 'GC-009', thumbnail: '', campaignName: 'Competitor Keywords', adSetName: 'Competitor Brand Terms', format: 'RSA', hook: 'Competitor Conquest', spend: 32000, impressions: 180000, reach: 150000, clicks: 2340, ctr: 0.013, cpc: 13.68, cpm: 178, linkClicks: 2340, lpv: 1990, costPerResult: 490, roas: 2.0, cpl: 0, leads: 0, purchases: 6, cpa: 5333.33, cvr: 0.26, frequency: 5.8, daysLive: 52, status: 'dead', qualityScore: 3, impressionShare: 0.28, searchImprShare: '28%' },
    { id: 'GC-010', thumbnail: '', campaignName: 'Display - Broad Reach', adSetName: 'Similar Audiences', format: 'RDA', hook: 'Generic Banner', spend: 24000, impressions: 480000, reach: 380000, clicks: 1440, ctr: 0.003, cpc: 16.67, cpm: 50, linkClicks: 1440, lpv: 1220, costPerResult: 560, roas: 1.7, cpl: 0, leads: 0, purchases: 4, cpa: 6000.00, cvr: 0.28, frequency: 7.2, daysLive: 60, status: 'dead', qualityScore: 3 },
  ] : [
    { id: 'GC-001', thumbnail: '', campaignName: 'Search - Service Keywords', adSetName: 'Service Keywords - Exact', format: 'RSA', hook: 'Service + Trust', spend: 90000, impressions: 320000, reach: 260000, clicks: 12800, ctr: 0.040, cpc: 7.03, cpm: 281, linkClicks: 12800, lpv: 10880, costPerResult: 260, roas: 0, cpl: 260, leads: 346, cvr: 2.70, frequency: 1.9, daysLive: 12, status: 'fresh', qualityScore: 9, impressionShare: 0.88, searchImprShare: '88%' },
    { id: 'GC-002', thumbnail: '', campaignName: 'Search - Problem-Aware', adSetName: 'Problem Keywords - Phrase', format: 'RSA', hook: 'Solution Headline', spend: 75000, impressions: 280000, reach: 230000, clicks: 9520, ctr: 0.034, cpc: 7.88, cpm: 268, linkClicks: 9520, lpv: 8090, costPerResult: 280, roas: 0, cpl: 280, leads: 268, cvr: 2.81, frequency: 2.2, daysLive: 16, status: 'fresh', qualityScore: 8, impressionShare: 0.72, searchImprShare: '72%' },
    { id: 'GC-003', thumbnail: '', campaignName: 'YouTube - Thought Leadership', adSetName: 'In-Market - Business Services', format: 'Video', hook: 'Expert Insight 15s', spend: 62000, impressions: 420000, reach: 340000, clicks: 6720, ctr: 0.016, cpc: 9.23, cpm: 148, linkClicks: 6720, lpv: 5710, costPerResult: 295, roas: 0, cpl: 295, leads: 210, cvr: 3.13, frequency: 2.5, daysLive: 20, status: 'fresh', qualityScore: 7 },
    { id: 'GC-004', thumbnail: '', campaignName: 'PMax - Lead Generation', adSetName: 'Asset Group - Core Services', format: 'PMax', hook: 'Multi-Asset Lead', spend: 55000, impressions: 380000, reach: 310000, clicks: 5700, ctr: 0.015, cpc: 9.65, cpm: 145, linkClicks: 5700, lpv: 4845, costPerResult: 310, roas: 0, cpl: 310, leads: 177, cvr: 3.11, frequency: 2.6, daysLive: 22, status: 'fresh', qualityScore: 7 },
    { id: 'GC-005', thumbnail: '', campaignName: 'Display - Case Studies', adSetName: 'Custom Intent - B2B', format: 'RDA', hook: 'Case Study CTA', spend: 48000, impressions: 520000, reach: 400000, clicks: 4160, ctr: 0.008, cpc: 11.54, cpm: 92, linkClicks: 4160, lpv: 3540, costPerResult: 335, roas: 0, cpl: 335, leads: 143, cvr: 3.44, frequency: 3.0, daysLive: 26, status: 'fresh', qualityScore: 6 },
    { id: 'GC-006', thumbnail: '', campaignName: 'Search - Long-Tail Intent', adSetName: 'Long-Tail Keywords', format: 'RSA', hook: 'Specific Solution', spend: 44000, impressions: 160000, reach: 130000, clicks: 3520, ctr: 0.022, cpc: 12.50, cpm: 275, linkClicks: 3520, lpv: 2990, costPerResult: 370, roas: 0, cpl: 370, leads: 119, cvr: 3.38, frequency: 3.8, daysLive: 34, status: 'fatiguing', qualityScore: 5, impressionShare: 0.52, searchImprShare: '52%' },
    { id: 'GC-007', thumbnail: '', campaignName: 'YouTube - Retargeting', adSetName: 'Website Visitors - 30D', format: 'Video', hook: 'Reminder CTA 6s', spend: 36000, impressions: 280000, reach: 210000, clicks: 2240, ctr: 0.008, cpc: 16.07, cpm: 129, linkClicks: 2240, lpv: 1904, costPerResult: 400, roas: 0, cpl: 400, leads: 90, cvr: 4.02, frequency: 4.5, daysLive: 40, status: 'fatiguing', qualityScore: 5 },
    { id: 'GC-008', thumbnail: '', campaignName: 'Display - Remarketing', adSetName: 'Engaged Visitors - 60D', format: 'RDA', hook: 'Offer Reminder', spend: 32000, impressions: 420000, reach: 320000, clicks: 1680, ctr: 0.004, cpc: 19.05, cpm: 76, linkClicks: 1680, lpv: 1430, costPerResult: 450, roas: 0, cpl: 450, leads: 71, cvr: 4.23, frequency: 5.2, daysLive: 46, status: 'fatiguing', qualityScore: 4 },
    { id: 'GC-009', thumbnail: '', campaignName: 'PMax - Broad Discovery', adSetName: 'Asset Group - General', format: 'PMax', hook: 'Auto-Generated Mix', spend: 28000, impressions: 340000, reach: 270000, clicks: 1360, ctr: 0.004, cpc: 20.59, cpm: 82, linkClicks: 1360, lpv: 1156, costPerResult: 500, roas: 0, cpl: 500, leads: 56, cvr: 4.12, frequency: 6.0, daysLive: 54, status: 'dead', qualityScore: 3 },
    { id: 'GC-010', thumbnail: '', campaignName: 'Search - Broad Match Test', adSetName: 'Broad Match Keywords', format: 'RSA', hook: 'Generic Headline', spend: 22000, impressions: 120000, reach: 95000, clicks: 840, ctr: 0.007, cpc: 26.19, cpm: 183, linkClicks: 840, lpv: 714, costPerResult: 550, roas: 0, cpl: 550, leads: 40, cvr: 4.76, frequency: 6.8, daysLive: 62, status: 'dead', qualityScore: 3, impressionShare: 0.22, searchImprShare: '22%' },
  ];

  // ─── SELECT DATA BASED ON PLATFORM ────────────────────────────────
  const creativeData = selectedPlatform === 'google' ? googleCreativeData : metaCreativeData;

  // ─── FILTER & SORT LOGIC (Google Ads) ─────────────────────────────
  const uniqueCampaigns = [...new Set(creativeData.map(c => c.campaignName))];
  const uniqueAdGroups = [...new Set(
    creativeData
      .filter(c => campaignFilter === 'all' || c.campaignName === campaignFilter)
      .map(c => c.adSetName)
  )];
  const uniqueFormats = [...new Set(creativeData.map(c => c.format))];

  const handleCampaignChange = (val: string) => {
    setCampaignFilter(val);
    setAdGroupFilter('all');
    setCurrentPage(1);
  };

  const handleTableSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredSortedCreatives = useMemo(() => {
    let data = [...creativeData];
    if (campaignFilter !== 'all') data = data.filter(c => c.campaignName === campaignFilter);
    if (adGroupFilter !== 'all') data = data.filter(c => c.adSetName === adGroupFilter);
    if (formatFilter !== 'all') data = data.filter(c => c.format === formatFilter);
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (sortField) {
      data.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];
        if (aVal === undefined || bVal === undefined) return 0;
        if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [creativeData, selectedPlatform, campaignFilter, adGroupFilter, formatFilter, statusFilter, sortField, sortDir, sortConfig]);

  const activeFilterCount = [campaignFilter, adGroupFilter, formatFilter, statusFilter].filter(f => f !== 'all').length;

  // Pagination
  const totalPages = Math.ceil(filteredSortedCreatives.length / itemsPerPage);
  const paginatedCreatives = filteredSortedCreatives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate KPI metrics
  const totalCreatives = creativeData.length;
  const freshCreatives = creativeData.filter(c => c.status === 'fresh').length;
  const fatiguedCreatives = creativeData.filter(c => c.status === 'fatiguing' || c.status === 'dead').length;
  
  const totalRevenue = businessModel === 'ecommerce' 
    ? creativeData.reduce((sum, c) => sum + (c.roas * c.spend), 0)
    : 0;
  
  const bestCreative = businessModel === 'ecommerce' 
    ? [...creativeData].sort((a, b) => b.roas - a.roas)[0]
    : [...creativeData].sort((a, b) => a.cpl - b.cpl)[0];

  // ─── FATIGUE CURVE DATA ───────────────────────────────────────────
  const metaFatigueCurveData = businessModel === 'ecommerce' ? [
    { day: 0, value: 4.2, label: 'Launch' },
    { day: 7, value: 4.0, label: 'Week 1' },
    { day: 14, value: 3.8, label: 'Week 2' },
    { day: 21, value: 3.5, label: 'Week 3' },
    { day: 28, value: 3.2, label: 'Week 4' },
    { day: 35, value: 2.9, label: 'Week 5' },
    { day: 42, value: 2.6, label: 'Week 6' },
    { day: 49, value: 2.3, label: 'Week 7' },
    { day: 56, value: 2.0, label: 'Week 8' },
    { day: 63, value: 1.8, label: 'Week 9' },
  ] : [
    { day: 0, value: 280, label: 'Launch' },
    { day: 7, value: 285, label: 'Week 1' },
    { day: 14, value: 295, label: 'Week 2' },
    { day: 21, value: 310, label: 'Week 3' },
    { day: 28, value: 340, label: 'Week 4' },
    { day: 35, value: 380, label: 'Week 5' },
    { day: 42, value: 430, label: 'Week 6' },
    { day: 49, value: 485, label: 'Week 7' },
    { day: 56, value: 540, label: 'Week 8' },
    { day: 63, value: 600, label: 'Week 9' },
  ];

  const googleFatigueCurveData = businessModel === 'ecommerce' ? [
    { day: 0, value: 4.8, label: 'Launch' },
    { day: 7, value: 4.6, label: 'Week 1' },
    { day: 14, value: 4.3, label: 'Week 2' },
    { day: 21, value: 4.0, label: 'Week 3' },
    { day: 28, value: 3.6, label: 'Week 4' },
    { day: 35, value: 3.2, label: 'Week 5' },
    { day: 42, value: 2.8, label: 'Week 6' },
    { day: 49, value: 2.5, label: 'Week 7' },
    { day: 56, value: 2.2, label: 'Week 8' },
    { day: 63, value: 1.9, label: 'Week 9' },
  ] : [
    { day: 0, value: 250, label: 'Launch' },
    { day: 7, value: 258, label: 'Week 1' },
    { day: 14, value: 272, label: 'Week 2' },
    { day: 21, value: 295, label: 'Week 3' },
    { day: 28, value: 330, label: 'Week 4' },
    { day: 35, value: 375, label: 'Week 5' },
    { day: 42, value: 420, label: 'Week 6' },
    { day: 49, value: 470, label: 'Week 7' },
    { day: 56, value: 520, label: 'Week 8' },
    { day: 63, value: 570, label: 'Week 9' },
  ];

  const fatigueCurveData = selectedPlatform === 'google' ? googleFatigueCurveData : metaFatigueCurveData;

  // ─── HELPERS ──────────────────────────────────────────────────────
  const getStatusStyles = (status: 'fresh' | 'fatiguing' | 'dead') => {
    switch (status) {
      case 'fresh':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fatiguing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dead':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getFormatBadgeStyle = (format: string) => {
    switch (format) {
      case 'Video':
        return 'bg-purple-50 text-purple-600';
      case 'Image':
        return 'bg-brand-light text-brand';
      case 'RSA':
        return 'bg-emerald-50 text-emerald-600';
      case 'RDA':
        return 'bg-orange-50 text-orange-600';
      case 'PMax':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video':
        return <Play className="w-4 h-4" />;
      case 'Image':
        return <ImageIcon className="w-4 h-4" />;
      case 'RSA':
        return <Search className="w-4 h-4" />;
      case 'RDA':
        return <Layout className="w-4 h-4" />;
      case 'PMax':
        return <Layers className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getFormatIconBg = (format: string) => {
    switch (format) {
      case 'Video':
        return 'bg-purple-100 text-purple-600';
      case 'Image':
        return 'bg-brand-light text-brand';
      case 'RSA':
        return 'bg-emerald-100 text-emerald-600';
      case 'RDA':
        return 'bg-orange-100 text-orange-600';
      case 'PMax':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const adGroupLabel = selectedPlatform === 'google' ? 'Ad Group' : 'Ad Set';

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-brand ml-1" /> : <ArrowDown className="w-3 h-3 text-brand ml-1" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">{data.label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Day:</span>
              <span className="font-semibold text-gray-900">{data.day}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">{businessModel === 'ecommerce' ? 'ROAS:' : 'CPL:'}</span>
              {businessModel === 'ecommerce' ? (
                <span className={`font-semibold ${
                  data.value >= 3.0 ? 'text-green-600' :
                  data.value >= 2.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{data.value}x</span>
              ) : (
                <span className={`font-semibold ${
                  data.value <= 320 ? 'text-green-600' :
                  data.value <= 400 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{'\u20B9'}{data.value}</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* KPI Widgets - Single Row */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${businessModel === 'ecommerce' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
        {/* Ad Spends */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-gray-900">{'\u20B9'}{(creativeData.reduce((sum, c) => sum + c.spend, 0) / 100000).toFixed(1)}L</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ad Spends</div>
        </div>

        {/* Revenue - Only for E-commerce */}
        {businessModel === 'ecommerce' && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-gray-900">{'\u20B9'}{(totalRevenue / 100000).toFixed(1)}L</div>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {selectedPlatform === 'google' ? 'Conv. Value' : 'Revenue'}
            </div>
          </div>
        )}

        {/* Active Creatives */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-gray-900">{totalCreatives}</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {selectedPlatform === 'google' ? 'Active Assets' : 'Active Creatives'}
          </div>
        </div>

        {/* Fatigued Creatives */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl font-bold text-red-600">{fatiguedCreatives}</div>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {selectedPlatform === 'google' ? 'Fatigued Assets' : 'Fatigued Creatives'}
          </div>
        </div>

        {/* Best Creative ROAS/CPL */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-1">
            {businessModel === 'ecommerce' ? (
              <div className="text-2xl font-bold text-green-600">{bestCreative.roas}x</div>
            ) : (
              <div className="text-2xl font-bold text-green-600">{'\u20B9'}{bestCreative.cpl}</div>
            )}
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {businessModel === 'ecommerce' 
              ? (selectedPlatform === 'google' ? 'Best Asset ROAS' : 'Best Creative ROAS')
              : (selectedPlatform === 'google' ? 'Best Asset CPL' : 'Best Creative CPL')
            }
          </div>
          <div className="text-xs text-gray-600 truncate" title={bestCreative.hook}>{bestCreative.hook}</div>
        </div>
      </div>

      {/* Creative Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm mb-6 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPlatform === 'google' ? 'Ad Asset Breakdown' : 'Creative Breakdown'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Click on any row to view detailed performance analysis</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold">{activeFilterCount}</span>
                )}
              </div>

              <div className="h-4 w-px bg-gray-200" />

              {/* Campaign Filter */}
              <div className="relative">
                <select
                  value={campaignFilter}
                  onChange={(e) => handleCampaignChange(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                    campaignFilter !== 'all'
                      ? 'bg-brand-light border-brand/20 text-brand'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Campaigns</option>
                  {uniqueCampaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Ad Group Filter */}
              <div className="relative">
                <select
                  value={adGroupFilter}
                  onChange={(e) => { setAdGroupFilter(e.target.value); setCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                    adGroupFilter !== 'all'
                      ? 'bg-brand-light border-brand/20 text-brand'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">{selectedPlatform === 'google' ? 'All Ad Groups' : 'All Ad Sets'}</option>
                  {uniqueAdGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Format Type Filter Dropdown */}
              <div className="relative">
                <select
                  value={formatFilter}
                  onChange={(e) => { setFormatFilter(e.target.value); setCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                    formatFilter !== 'all'
                      ? 'bg-brand-light border-brand/20 text-brand'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Types</option>
                  {uniqueFormats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                    statusFilter !== 'all'
                      ? 'bg-brand-light border-brand/20 text-brand'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="fresh">Fresh</option>
                  <option value="fatiguing">Fatiguing</option>
                  <option value="dead">Dead</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setCampaignFilter('all');
                      setAdGroupFilter('all');
                      setFormatFilter('all');
                      setStatusFilter('all');
                      setSortField('');
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </>
              )}


            </div>
          </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {selectedPlatform === 'google' ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('campaignName')}>
                      <div className="flex items-center">Campaign <SortIcon field="campaignName" /></div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Asset</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Group</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('spend')}>
                      <div className="flex items-center justify-end">Spend <SortIcon field="spend" /></div>
                    </th>
                    {businessModel === 'ecommerce' ? (
                      <>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('roas')}>
                          <div className="flex items-center justify-end">Conv. Value <SortIcon field="roas" /></div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('roas')}>
                          <div className="flex items-center justify-end">ROAS <SortIcon field="roas" /></div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Conv.</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('leads')}>
                          <div className="flex items-center justify-end">Leads <SortIcon field="leads" /></div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('cpl')}>
                          <div className="flex items-center justify-end">Cost/Conv. <SortIcon field="cpl" /></div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">CVR</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide group/th cursor-pointer" onClick={() => handleTableSort('ctr')}>
                      <div className="flex items-center justify-end">CTR <SortIcon field="ctr" /></div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Impr. Share</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Creative</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ad Set</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Spend</th>
                    {businessModel === 'ecommerce' ? (
                      <>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">ROAS</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Purchases</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Leads</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">CPL</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">CVR</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">CTR</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCreatives.map((creative) => (
                <tr 
                  key={creative.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setCreativesDrawerOpen(true);
                    setSelectedCreative(creative);
                  }}
                >
                  {/* Campaign Column */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]" title={creative.campaignName}>
                      {creative.campaignName}
                    </p>
                  </td>
                  
                  {/* Creative / Ad Asset Column — Lucide icons instead of emojis */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getFormatIconBg(creative.format)}`}>
                        {getFormatIcon(creative.format)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{creative.hook}</p>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getFormatBadgeStyle(creative.format)}`}>
                            {creative.format}
                          </span>
                        </div>

                      </div>
                    </div>
                  </td>
                  
                  {/* Ad Set / Ad Group Column */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[180px]" title={creative.adSetName}>
                      {creative.adSetName}
                    </p>
                  </td>
                  
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    {'\u20B9'}{(creative.spend / 100000).toFixed(1)}L
                  </td>
                  {businessModel === 'ecommerce' ? (
                    <>
                      <td className="px-4 py-4 text-right text-sm font-medium text-green-600">
                        {'\u20B9'}{(creative.roas * creative.spend / 100000).toFixed(1)}L
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-sm font-semibold ${
                          creative.roas >= 3.5 ? 'text-green-600' :
                          creative.roas >= 3.0 ? 'text-brand' :
                          creative.roas >= 2.5 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          {creative.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {creative.purchases || Math.round(creative.roas * creative.spend / creative.costPerResult)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {creative.leads}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-sm font-semibold ${
                          creative.cpl <= 300 ? 'text-green-600' :
                          creative.cpl <= 350 ? 'text-brand' :
                          creative.cpl <= 400 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          {'\u20B9'}{creative.cpl}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {((creative.leads / creative.linkClicks) * 100).toFixed(1)}%
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    {(creative.ctr * 100).toFixed(1)}%
                  </td>
                  {selectedPlatform === 'google' && (
                    <td className="px-4 py-4 text-center">
                      {creative.searchImprShare ? (
                        <span className={`text-sm font-medium ${
                          parseFloat(creative.searchImprShare) >= 70 ? 'text-green-600' :
                          parseFloat(creative.searchImprShare) >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {creative.searchImprShare}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(creative.status)}`}>
                      {creative.status === 'fresh' ? '\u25CF Fresh' : 
                       creative.status === 'fatiguing' ? '\u25CF Fatiguing' : '\u25CF Dead'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSortedCreatives.length === 0 && (
                <tr>
                  <td colSpan={selectedPlatform === 'google' ? 10 : 8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-500 font-medium">No assets match your filters</p>
                      <button
                        onClick={() => {
                          setCampaignFilter('all');
                          setAdGroupFilter('all');
                          setFormatFilter('all');
                          setStatusFilter('all');
                          setCurrentPage(1);
                        }}
                        className="text-xs text-brand hover:text-brand-hover font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredSortedCreatives.length)} of {filteredSortedCreatives.length} {selectedPlatform === 'google' ? 'assets' : 'creatives'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    currentPage === page
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creative Fatigue Curve */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              {businessModel === 'ecommerce' ? (
                <TrendingDown className="w-4 h-4 text-white" />
              ) : (
                <TrendingUp className="w-4 h-4 text-white" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedPlatform === 'google' ? 'Ad Asset Fatigue Curve' : 'Creative Fatigue Curve'}
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            {selectedPlatform === 'google' ? (
              businessModel === 'ecommerce'
                ? 'Track ROAS decay over asset lifespan across Search, Display, YouTube & PMax - identify when to refresh ad copy and assets (typically 28-42 days)'
                : 'Track Cost/Conv. increase as ad assets fatigue - identify optimal refresh points before cost inefficiency (typically 28-42 days)'
            ) : (
              businessModel === 'ecommerce' 
                ? 'Track ROAS decay over creative lifespan - identify when to refresh creatives (typically 28-35 days)'
                : 'Track CPL increase as creatives fatigue - identify optimal refresh points before cost inefficiency (typically 28-35 days)'
            )}
          </p>
        </div>

        <div className="h-96 min-h-[384px] w-full" style={{ height: '384px' }}>
          <ResponsiveContainer width="100%" height={384} minWidth={0}>
            <LineChart data={fatigueCurveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Days Live', position: 'bottom', style: { fontSize: 12, fill: '#6b7280' } }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: businessModel === 'ecommerce' ? 'ROAS' : (selectedPlatform === 'google' ? 'Cost/Conv. (\u20B9)' : 'CPL (\u20B9)'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: 12, fill: '#6b7280' } 
                }}
                domain={businessModel === 'ecommerce' ? [0, 5] : [200, 650]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Line 
                type="monotone" 
                dataKey="value"
                stroke={selectedPlatform === 'google' ? '#4285F4' : '#204CC7'}
                strokeWidth={3}
                dot={{ fill: selectedPlatform === 'google' ? '#4285F4' : '#204CC7', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              {businessModel === 'ecommerce' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey={() => 3.0} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target ROAS (3.0x)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => 2.5} 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Warning Threshold (2.5x)"
                  />
                </>
              ) : (
                <>
                  <Line 
                    type="monotone" 
                    dataKey={() => 320} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={selectedPlatform === 'google' ? 'Target Cost/Conv. (\u20B9320)' : 'Target CPL (\u20B9320)'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => 400} 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={selectedPlatform === 'google' ? 'Warning Threshold (\u20B9400)' : 'Warning Threshold (\u20B9400)'}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-0.5 ${selectedPlatform === 'google' ? 'bg-[#4285F4]' : 'bg-brand'}`}></div>
            <span className="text-xs text-gray-600">
              {businessModel === 'ecommerce' ? 'Actual ROAS' : (selectedPlatform === 'google' ? 'Actual Cost/Conv.' : 'Actual CPL')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
            <span className="text-xs text-gray-600">
              {businessModel === 'ecommerce' ? 'Target (3.0x)' : 'Target (\u20B9320)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-yellow-500 border-dashed border-t-2 border-yellow-500"></div>
            <span className="text-xs text-gray-600">
              {businessModel === 'ecommerce' ? 'Warning (2.5x)' : 'Warning (\u20B9400)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 italic">
              {selectedPlatform === 'google' ? 'Refresh assets at Week 5-6' : 'Replace creatives at Week 5-6'}
            </span>
          </div>
        </div>

        {/* Key Insights - Integrated */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
              <span className="text-xs text-gray-500">Critical observations from your data</span>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[280px]">
          {selectedPlatform === 'google' ? (
            businessModel === 'ecommerce' ? (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Brand Search RSAs dominate at 4.5x ROAS with 92% impression share:</strong> "Brand + Offer" RSA (4.5x) and Shopping PMax (4.2x) are your top performers. High-intent Search captures bottom-funnel demand efficiently - maintain 90%+ impression share on brand terms to prevent competitor conquest.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>4 fatigued/dead assets bleeding {'\u20B9'}1.36L at 2.1x avg ROAS:</strong> Display Prospecting RDA (2.3x), YouTube Brand (2.6x), Competitor RSA (2.0x), and Broad Display (1.7x) all past 38+ days. Refresh RDA imagery and pause competitor RSAs with Quality Score &lt;4 - they're dragging account-level Quality Score down.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Asset fatigue cliff at Week 5 - Quality Score decay compounds cost:</strong> ROAS drops from 3.6x (Week 4) to 3.2x (Week 5) as ad relevance scores degrade. Unlike Meta, Google penalizes stale assets via Quality Score decay (avg drops from 7 to 4 after 35 days), directly inflating CPC. Set 35-day asset rotation rules.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Search RSAs win B2B at {'\u20B9'}260 Cost/Conv. with 88% impression share:</strong> "Service + Trust" RSA ({'\u20B9'}260) and "Solution Headline" RSA ({'\u20B9'}280) dominate with high-intent query matching. Search campaigns deliver 22% lower cost/conversion than Display/YouTube ({'\u20B9'}270 vs {'\u20B9'}347 avg) - prioritize search budget allocation.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>4 fatigued assets bleeding {'\u20B9'}1.18L at {'\u20B9'}475 avg Cost/Conv.:</strong> Long-tail RSA ({'\u20B9'}370), YouTube Retargeting ({'\u20B9'}400), Display Remarketing ({'\u20B9'}450), and PMax Broad ({'\u20B9'}500) all past 34+ days. Impression share for fatigued RSAs dropped below 52% - refresh headlines and pin high-performing descriptions to improve Ad Rank.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>B2B asset fatigue accelerates after Week 5 - Quality Score drops drive CPC inflation:</strong> Cost/Conv. jumps from {'\u20B9'}330 (Week 4) to {'\u20B9'}375 (Week 5) as Google's machine learning deprioritizes stale RSA combinations. Rotate headline variants every 30 days and test new responsive display images quarterly.
                  </p>
                </div>
              </>
            )
          ) : (
            businessModel === 'ecommerce' ? (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Video crushes image - 3.6x vs 2.8x avg ROAS:</strong> "Problem-Solution" (3.8x) and "Before-After" (3.6x) video creatives dominate top performers. Video format = 28% better performance with stronger storytelling and engagement.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>5 fatigued/dead creatives bleeding {'\u20B9'}1.52L at 2.2x ROAS:</strong> CR-006 through CR-010 all past 35+ days with 4.2-7.8 frequency causing ad blindness. Replace immediately - you're losing {'\u20B9'}52K/month vs target performance.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Creative fatigue cliff at Week 5:</strong> ROAS drops from 3.2x (Week 4) to 2.9x (Week 5) - 9% decline marks fatigue onset. Set 35-day auto-pause rules to protect margins. Data shows optimal refresh window = 28-35 days.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>Thought Leadership wins B2B - {'\u20B9'}285 CPL vs {'\u20B9'}425 avg:</strong> "Thought Leadership" video ({'\u20B9'}285) and "Problem-Agitation" ({'\u20B9'}295) dominate with professional storytelling. Video delivers 19% better CPL than image creatives ({'\u20B9'}308 vs {'\u20B9'}369 avg).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>5 fatigued creatives bleeding {'\u20B9'}1.40L at {'\u20B9'}492 avg CPL:</strong> CR-006 through CR-010 all past 35+ days with 4.2-7.1 frequency. Replace immediately - you're overpaying {'\u20B9'}172/lead vs target (55% premium).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <p className="text-xs font-medium leading-snug">
                    <strong>B2B creative fatigue cliff at Week 5:</strong> CPL jumps from {'\u20B9'}340 (Week 4) to {'\u20B9'}380 (Week 5) - 12% cost increase marks fatigue onset. Set 35-day auto-pause rules. LinkedIn/B2B audiences tire faster than B2C.
                  </p>
                </div>
              </>
            )
          )}
          </div>
        </div>
      </div>

      {/* Creatives Drawer */}
      <CreativesDrawer 
        isOpen={creativesDrawerOpen} 
        onClose={() => setCreativesDrawerOpen(false)}
        businessModel={businessModel}
        selectedCreative={selectedCreative}
      />
    </div>
  );
}
