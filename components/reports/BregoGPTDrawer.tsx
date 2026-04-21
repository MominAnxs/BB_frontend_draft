'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, 
  TrendingUp, Target, IndianRupee, Eye, 
  Zap, BarChart3, ShoppingCart, Globe,
  Palette, PieChart, AlertTriangle, Lightbulb,
  Clock, Bot, Users, CalendarDays, List,
  FileText, Wallet, Receipt, Scale,
  Star, History, Trash2, RotateCcw,
  ArrowLeft, Copy, Check, Volume2, VolumeX, RefreshCw, Mic, ArrowUp,
  Download
} from 'lucide-react';

type ModuleContext =
  | 'overview'
  | 'campaigns'
  | 'meta-ads'
  | 'google-ads'
  | 'creatives'
  | 'website'
  | 'sales'
  | 'accounts-overview'
  | 'accounts-sales'
  | 'accounts-expenses'
  | 'accounts-profit-loss'
  | 'accounts-balance-sheet'
  | 'accounts-cashflow'
  | 'accounts-receivables'
  | 'accounts-payables'
  | 'accounts-ratios'
  | 'workspace';

interface SuggestedPrompt {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  prompt: string;
  category: 'insight' | 'action' | 'summary' | 'alert';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  promptId?: string | null;
  promptLabel?: string;
}

interface HistoryEntry {
  id: string;
  promptId: string | null;
  promptText: string;
  label: string;
  moduleContext: ModuleContext;
  timestamp: number;
  isFavorite: boolean;
  useCount: number;
}

type DrawerView = 'home' | 'chat' | 'recent' | 'favorites';

interface BregoGPTDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleContext: ModuleContext;
}

// ─── localStorage helpers ────────────────────────────────────────────
const STORAGE_KEY = 'brego-gpt-history';

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* silently ignore */ }
}

// ─── Relative time formatter ─────────────────────────────────────────
function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Strip markdown for TTS ──────────────────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[•\-]\s*/gm, '')
    .replace(/^\d+\.\s*/gm, '')
    .replace(/\|[^|]*\|/g, '')
    .replace(/[📊🚨💰🎯💡]/g, '')
    .replace(/[✅⚠️🔴∞]/g, '')
    .trim();
}

// ─── Markdown → HTML converter for PDF export ───────────────────────
function markdownToHtml(md: string): string {
  let html = md
    // Tables: convert markdown tables to HTML tables
    .replace(/^(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, header: string, _sep: string, body: string) => {
      const thCells = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${thCells}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headings (lines starting with emoji + bold)
    .replace(/^(📊|🚨|💰|🎯|💡|⚠️|🔍|📈|📅|🏆|🚧)\s*/gm, '<span class="emoji">$1</span> ')
    // Bullet points
    .replace(/^[•]\s+(.+)/gm, '<li>$1</li>')
    .replace(/^[-]\s+(.+)/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  return `<p>${html}</p>`;
}

// ─── PDF Export via Print ────────────────────────────────────────────
function exportReportAsPDF(content: string, title: string, moduleLabel: string) {
  const htmlContent = markdownToHtml(content);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — Brego Business</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.65;
      color: #1a1a1a;
      padding: 48px 40px;
      max-width: 780px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #204CC7;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .header-left h1 {
      font-size: 20px;
      font-weight: 700;
      color: #111;
      margin-bottom: 4px;
    }
    .header-left .meta {
      font-size: 13px;
      font-weight: 400;
      color: #666;
    }
    .header-right {
      text-align: right;
    }
    .header-right .brand {
      font-size: 14px;
      font-weight: 700;
      color: #204CC7;
    }
    .header-right .date {
      font-size: 13px;
      font-weight: 400;
      color: #666;
      margin-top: 2px;
    }

    .content p { margin-bottom: 12px; }
    .content strong { font-weight: 600; color: #111; }
    .content em { font-style: italic; }
    .content .emoji { font-size: 15px; }

    .content ul {
      list-style: none;
      padding-left: 0;
      margin: 8px 0 12px 0;
    }
    .content ul li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 5px;
      font-size: 13px;
    }
    .content ul li::before {
      content: '•';
      position: absolute;
      left: 4px;
      color: #204CC7;
      font-weight: 700;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 12.5px;
    }
    thead tr {
      background: #f0f4ff;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      font-size: 12px;
      color: #204CC7;
      border-bottom: 2px solid #d0daf5;
      white-space: nowrap;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #eee;
      color: #333;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tbody tr:nth-child(even) {
      background: #fafbfe;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #999;
    }

    @media print {
      body { padding: 24px 20px; }
      .header { margin-bottom: 20px; padding-bottom: 12px; }
      table { page-break-inside: avoid; }
      .footer { position: fixed; bottom: 20px; left: 20px; right: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>${title}</h1>
      <div class="meta">${moduleLabel} Report • Generated by BregoGPT</div>
    </div>
    <div class="header-right">
      <div class="brand">Brego Business</div>
      <div class="date">${dateStr} at ${timeStr}</div>
    </div>
  </div>
  <div class="content">
    ${htmlContent}
  </div>
  <div class="footer">
    <span>Brego Business — Accounts & Taxation</span>
    <span>Confidential • ${dateStr}</span>
  </div>
</body>
</html>`);

  printWindow.document.close();
  // Allow fonts to load before triggering print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 600);
}

// Set of prompt IDs that qualify for PDF export (substantial A&T reports)
const pdfExportPromptIds = new Set([
  'acc-overview-1', 'acc-overview-2', 'acc-overview-3', 'acc-overview-4',
  'acc-sales-1', 'acc-sales-2', 'acc-sales-3',
  'acc-exp-1', 'acc-exp-2', 'acc-exp-3',
  'acc-pl-1', 'acc-pl-2', 'acc-pl-3',
  'acc-bs-1', 'acc-bs-2', 'acc-bs-3',
  'acc-cf-1', 'acc-cf-2', 'acc-cf-3',
  'acc-rec-1', 'acc-rec-2', 'acc-rec-3',
  'acc-pay-1', 'acc-pay-2', 'acc-pay-3',
  'acc-ratio-1', 'acc-ratio-2', 'acc-ratio-3',
]);

// ─── Module-specific prompts ─────────────────────────────────────────
const getModulePrompts = (context: ModuleContext): SuggestedPrompt[] => {
  const commonPrompts: Record<string, SuggestedPrompt[]> = {
    overview: [
      { id: 'overview-1', icon: <TrendingUp className="w-4 h-4" />, label: 'Quick Performance Summary', description: 'Get a 30-second overview of all KPIs', prompt: 'Summarize my marketing performance for the last 30 days. Highlight what\'s working well and what needs attention.', category: 'summary' },
      { id: 'overview-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'Red Flags & Alerts', description: 'Spot issues before they escalate', prompt: 'Which KPIs are underperforming or trending downward? What should I prioritize fixing this week?', category: 'alert' },
      { id: 'overview-3', icon: <IndianRupee className="w-4 h-4" />, label: 'Revenue vs Spend Analysis', description: 'Understand your ROI at a glance', prompt: 'Break down my revenue vs ad spend ratio across all channels. Where am I getting the best return?', category: 'insight' },
      { id: 'overview-4', icon: <Target className="w-4 h-4" />, label: 'Target Gap Analysis', description: 'How close are you to monthly goals', prompt: 'How am I tracking against my monthly targets? Which metrics are on track and which are behind?', category: 'action' },
      { id: 'overview-5', icon: <Lightbulb className="w-4 h-4" />, label: 'Top 3 Growth Actions', description: 'Actionable recommendations right now', prompt: 'Based on my current data, give me the top 3 actions I should take this week to improve performance.', category: 'action' },
    ],
    campaigns: [
      { id: 'campaigns-1', icon: <Zap className="w-4 h-4" />, label: 'Best & Worst Campaigns', description: 'Instantly spot winners and losers', prompt: 'Which campaigns have the best and worst ROAS? Should I pause or scale any of them?', category: 'insight' },
      { id: 'campaigns-2', icon: <IndianRupee className="w-4 h-4" />, label: 'Budget Optimization', description: 'Reallocate spend for max ROI', prompt: 'Analyze my budget allocation across campaigns. How should I redistribute spend to maximize returns?', category: 'action' },
      { id: 'campaigns-3', icon: <TrendingUp className="w-4 h-4" />, label: 'Campaign Trends', description: 'Week-over-week performance shifts', prompt: 'Show me which campaigns improved or declined compared to last week and what might have caused it.', category: 'insight' },
      { id: 'campaigns-4', icon: <Target className="w-4 h-4" />, label: 'Scaling Opportunities', description: 'Find campaigns ready to scale', prompt: 'Which campaigns are performing well enough to increase budget? What\'s the recommended scale strategy?', category: 'action' },
    ],
    creatives: [
      { id: 'creatives-1', icon: <Palette className="w-4 h-4" />, label: 'Top Performing Creatives', description: 'Which ads are driving results', prompt: 'Which creatives are generating the highest CTR and conversions? What do they have in common?', category: 'insight' },
      { id: 'creatives-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'Creative Fatigue Check', description: 'Detect ads losing effectiveness', prompt: 'Are any of my creatives showing signs of fatigue? Which ones should I refresh or replace?', category: 'alert' },
      { id: 'creatives-3', icon: <Lightbulb className="w-4 h-4" />, label: 'Creative Strategy Tips', description: 'Data-driven creative suggestions', prompt: 'Based on my top-performing creatives, what patterns should I follow for new ad designs?', category: 'action' },
      { id: 'creatives-4', icon: <Eye className="w-4 h-4" />, label: 'Format Performance', description: 'Compare image vs video vs carousel', prompt: 'Compare the performance of different creative formats (image, video, carousel). Which format works best?', category: 'insight' },
    ],
    website: [
      { id: 'website-1', icon: <Globe className="w-4 h-4" />, label: 'Conversion Bottlenecks', description: 'Where visitors are dropping off', prompt: 'Analyze my website conversion funnel. Where are the biggest drop-offs and how can I fix them?', category: 'alert' },
      { id: 'website-2', icon: <Clock className="w-4 h-4" />, label: 'Speed & UX Health', description: 'Page load and user experience', prompt: 'How is my website\'s page load time and mobile optimization score? What should I improve?', category: 'insight' },
      { id: 'website-3', icon: <TrendingUp className="w-4 h-4" />, label: 'Traffic Source Breakdown', description: 'Where your visitors come from', prompt: 'Break down my website traffic by source. Which channels drive the most engaged visitors?', category: 'insight' },
      { id: 'website-4', icon: <Target className="w-4 h-4" />, label: 'Bounce Rate Fixes', description: 'Reduce bounce, increase engagement', prompt: 'My bounce rate seems high. What are the most impactful changes I can make to improve it?', category: 'action' },
    ],
    sales: [
      { id: 'sales-1', icon: <ShoppingCart className="w-4 h-4" />, label: 'Sales Performance Summary', description: 'Orders, revenue, and AOV at a glance', prompt: 'Summarize my Shopify sales performance. What are my top products and how is AOV trending?', category: 'summary' },
      { id: 'sales-2', icon: <TrendingUp className="w-4 h-4" />, label: 'Product Trends', description: 'Rising and declining products', prompt: 'Which products are trending up in sales and which are declining? Any seasonal patterns?', category: 'insight' },
      { id: 'sales-3', icon: <IndianRupee className="w-4 h-4" />, label: 'Revenue Optimization', description: 'Increase order value and frequency', prompt: 'How can I increase my average order value? Suggest upsell or bundle strategies based on my data.', category: 'action' },
      { id: 'sales-4', icon: <PieChart className="w-4 h-4" />, label: 'Customer Insights', description: 'Who is buying and how often', prompt: 'Analyze my customer purchase patterns. What percentage are repeat buyers vs new customers?', category: 'insight' },
    ],
    'accounts-overview': [
      { id: 'acc-overview-1', icon: <BarChart3 className="w-4 h-4" />, label: 'How did my business do this month?', description: 'Revenue, profit, and key numbers in plain language', prompt: 'Summarize this month\'s financial performance in simple terms. What was my total revenue, total expenses, and net profit? How does this compare to last month — am I making more or less money? Highlight the 2-3 most important things I should know.', category: 'summary' },
      { id: 'acc-overview-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'Will I have enough cash this month?', description: 'Upcoming payments vs money coming in', prompt: 'Look at my upcoming expenses (GST, TDS, vendor payments, salaries, rent, EMIs) and compare them against expected collections. Will I face a cash shortfall in the next 30 days? If yes, how much and when exactly? Suggest what I can do now to avoid it.', category: 'alert' },
      { id: 'acc-overview-3', icon: <TrendingUp className="w-4 h-4" />, label: 'Where is my money going vs coming from?', description: 'Top revenue sources and biggest expenses side by side', prompt: 'Show me my top 5 revenue sources and top 5 expense categories side by side. Which revenue stream grew the most? Which expense category increased the most? Are there any expenses growing faster than my revenue — flag those as a warning.', category: 'insight' },
      { id: 'acc-overview-4', icon: <Lightbulb className="w-4 h-4" />, label: 'Am I paying more tax than I should?', description: 'Check if you\'re claiming all eligible deductions and ITC', prompt: 'Review my current tax position — am I claiming all eligible input tax credit under GST? Are there any business expenses I\'m not deducting (depreciation, travel, insurance, interest)? Estimate how much tax I could save this quarter if I optimise my claims.', category: 'action' },
    ],
    'accounts-sales': [
      { id: 'acc-sales-1', icon: <IndianRupee className="w-4 h-4" />, label: 'What\'s driving my revenue this month?', description: 'Revenue by product, service, or customer segment', prompt: 'Break down my revenue by product/service line or customer segment. Which ones contributed the most this month? Which ones declined compared to last month? If any single client or product makes up more than 30% of my revenue, flag that concentration risk.', category: 'summary' },
      { id: 'acc-sales-2', icon: <TrendingUp className="w-4 h-4" />, label: 'Is my revenue actually growing?', description: 'Month-on-month and quarter-on-quarter revenue trend', prompt: 'Show my revenue trend for the last 6 months. Is it consistently growing, flat, or declining? Calculate my month-on-month growth rate. If growth is slowing, identify which revenue stream is causing the slowdown and by how much.', category: 'insight' },
      { id: 'acc-sales-3', icon: <Target className="w-4 h-4" />, label: 'Who owes me money right now?', description: 'All unpaid invoices with amounts and due dates', prompt: 'List every unpaid customer invoice — the customer name, invoice amount, invoice date, and how many days overdue. Sort by highest amount first. Total up the overdue amount. For invoices past 60 days, flag them as high-risk for non-payment.', category: 'alert' },
    ],
    'accounts-expenses': [
      { id: 'acc-exp-1', icon: <Wallet className="w-4 h-4" />, label: 'Where exactly is my money going?', description: 'Every expense category ranked by amount spent', prompt: 'List all my expense categories for this month ranked from highest to lowest — salaries, rent, raw materials, logistics, utilities, professional fees, marketing, etc. For each, show the amount and what percentage of total revenue it represents. Flag any category above 15% of revenue.', category: 'summary' },
      { id: 'acc-exp-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'Which costs jumped unexpectedly?', description: 'Expenses that spiked compared to your 3-month average', prompt: 'Compare each expense category this month against my 3-month average. Flag any category where spending jumped 15% or more. For each flagged item, explain what likely caused the increase (e.g., vendor price hike, additional hires, one-time purchase) so I know if it\'s a one-off or a trend.', category: 'alert' },
      { id: 'acc-exp-3', icon: <Lightbulb className="w-4 h-4" />, label: 'What can I cut without hurting the business?', description: 'Realistic cost reduction areas with estimated savings', prompt: 'Identify the top 5 expense categories where I can realistically reduce costs. For each, explain how much I could save per month, what the trade-off is, and whether it\'s a quick win (this month) or a medium-term change (1-2 months). Don\'t suggest cutting things that would hurt operations — be practical.', category: 'action' },
    ],
    'accounts-profit-loss': [
      { id: 'acc-pl-1', icon: <Scale className="w-4 h-4" />, label: 'Am I actually making money?', description: 'Revenue minus all costs \u2014 your real profit this month', prompt: 'Show my P&L in simple terms: total revenue, minus cost of goods/services, equals gross profit (and gross margin %). Then subtract operating expenses (salaries, rent, utilities, etc.) to get net profit (and net margin %). Compare both margins to last month. Am I keeping more or less of every rupee I earn?', category: 'summary' },
      { id: 'acc-pl-2', icon: <TrendingUp className="w-4 h-4" />, label: 'Why did my profit go up or down?', description: 'The specific items that moved your margins', prompt: 'Compare this month\'s P&L line-by-line against last month. Identify the top 3 reasons my net profit increased or decreased. Was it higher revenue, rising material costs, salary hikes, or something else? Quantify each factor \u2014 e.g., "Raw material costs increased by \u20b91.2L, which alone reduced your margin by 2%."', category: 'insight' },
      { id: 'acc-pl-3', icon: <Lightbulb className="w-4 h-4" />, label: 'How do I make \u20b91L more profit next month?', description: 'Actionable steps to improve your bottom line', prompt: 'Based on my current P&L, give me 3-4 specific, realistic actions I can take to increase net profit by at least \u20b91L next month. For each action, estimate the impact in rupees, explain how to implement it, and rate the difficulty (easy/medium/hard). Focus on things within my control \u2014 pricing, cost negotiation, collection speed, expense timing.', category: 'action' },
    ],
    'accounts-balance-sheet': [
      { id: 'acc-bs-1', icon: <FileText className="w-4 h-4" />, label: 'What do I own vs what do I owe?', description: 'Your assets, liabilities, and net worth at a glance', prompt: 'Summarize my balance sheet in plain language: total assets (cash in bank, receivables, inventory, fixed assets), total liabilities (vendor payables, loans, tax dues), and net worth (equity). Has my net worth increased or decreased compared to last quarter? Highlight the biggest changes and what caused them.', category: 'summary' },
      { id: 'acc-bs-2', icon: <TrendingUp className="w-4 h-4" />, label: 'Can I cover my bills for the next 90 days?', description: 'Working capital check \u2014 current assets vs current liabilities', prompt: 'Calculate my working capital: current assets (cash + receivables + inventory) minus current liabilities (payables + short-term loans + upcoming tax payments). Is the number positive or negative? If I collected all receivables and paid all current dues, how much cash would I have left? Flag if my current ratio drops below 1.2.', category: 'insight' },
      { id: 'acc-bs-3', icon: <AlertTriangle className="w-4 h-4" />, label: 'Is my debt under control?', description: 'Total borrowings vs your ability to repay', prompt: 'List all my current borrowings \u2014 term loans, working capital limits, credit card dues, overdrafts. For each, show the outstanding balance, monthly EMI, and interest rate. Calculate my total debt-to-equity ratio and my monthly EMI burden as a percentage of revenue. Flag if EMIs exceed 25% of monthly revenue \u2014 that\'s a warning sign.', category: 'alert' },
    ],
    'accounts-cashflow': [
      { id: 'acc-cf-1', icon: <Receipt className="w-4 h-4" />, label: 'How much cash came in and went out?', description: 'This month\'s actual cash movement \u2014 not just invoices', prompt: 'Show me actual cash received (not invoiced \u2014 what actually hit my bank account) vs actual cash paid out this month. Break cash inflows by customer payments, other income, loans received. Break outflows by vendor payments, salaries, rent, EMIs, tax payments. What\'s the net cash position? Is it better or worse than last month?', category: 'summary' },
      { id: 'acc-cf-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'When will I run low on cash?', description: 'Week-by-week cash projection for the next 30 days', prompt: 'Project my cash position week by week for the next 4 weeks. Factor in expected customer collections, scheduled vendor payments, upcoming salaries (around the 1st), GST payment (around the 20th), TDS deposit (7th), loan EMIs, and rent. Flag any week where my projected bank balance drops below \u20b92L \u2014 that\'s my danger zone.', category: 'alert' },
      { id: 'acc-cf-3', icon: <Lightbulb className="w-4 h-4" />, label: 'How do I free up cash this month?', description: 'Practical steps to improve cash in hand right now', prompt: 'Give me 4-5 practical actions I can take this month to improve my cash position. Consider: collecting overdue receivables (how much is collectible?), negotiating extended payment terms with vendors, timing my tax deposits optimally, reducing inventory if applicable, and deferring non-critical expenses. For each, estimate how much cash it frees up.', category: 'action' },
    ],
    'accounts-receivables': [
      { id: 'acc-rec-1', icon: <Receipt className="w-4 h-4" />, label: 'Who owes me money and how old is it?', description: 'All receivables sorted by ageing \u2014 30, 60, 90+ days', prompt: 'Show my total receivables broken down by ageing buckets: 0-30 days, 31-60 days, 61-90 days, and 90+ days. For each bucket, list the top customers and amounts. What percentage of my total receivables is older than 60 days? If it\'s above 20%, that\'s a collection problem I need to fix immediately.', category: 'summary' },
      { id: 'acc-rec-2', icon: <AlertTriangle className="w-4 h-4" />, label: 'Which customers are payment risks?', description: 'Clients consistently paying late or not paying at all', prompt: 'Identify customers who have a pattern of late payment \u2014 they\'ve paid late more than twice in the last 6 months or currently have invoices overdue by 45+ days. For each, show total outstanding, average payment delay, and suggest whether to continue credit terms, reduce credit limits, or move to advance payment.', category: 'alert' },
      { id: 'acc-rec-3', icon: <Lightbulb className="w-4 h-4" />, label: 'How do I collect my money faster?', description: 'Actionable plan to reduce your collection cycle', prompt: 'My current average collection period is too high. Give me a step-by-step plan to reduce it by at least 10 days. Include: which specific invoices to follow up on this week (with amounts), whether I should offer early payment discounts (and the math on whether it\'s worth it), and template language for a firm but professional payment reminder.', category: 'action' },
    ],
    'accounts-payables': [
      { id: 'acc-pay-1', icon: <Wallet className="w-4 h-4" />, label: 'What bills are due and when?', description: 'All vendor payments, EMIs, and statutory dues scheduled', prompt: 'List everything I need to pay in the next 30 days: vendor invoices (with due dates), loan EMIs, rent, salaries, PF/ESI deposits (15th), TDS (7th), GST (20th), and any other recurring payments. Total it up. Compare this against my current bank balance \u2014 do I have enough to cover everything, or do I need to prioritise?', category: 'summary' },
      { id: 'acc-pay-2', icon: <Clock className="w-4 h-4" />, label: 'What should I pay first?', description: 'Priority order \u2014 statutory dues, then vendors, then others', prompt: 'Prioritise my pending payments: statutory dues (GST, TDS, PF \u2014 these carry penalties), then loan EMIs (credit score impact), then vendors with early payment discounts, then remaining vendors by relationship importance. Create a payment calendar for the next 4 weeks showing what to pay and when, so I never miss a deadline or penalty.', category: 'insight' },
      { id: 'acc-pay-3', icon: <IndianRupee className="w-4 h-4" />, label: 'Can I save money by paying differently?', description: 'Early payment discounts vs holding cash longer', prompt: 'Review my vendor payment terms. Are any vendors offering 1-2% early payment discounts? Calculate the annualised return of taking each discount (e.g., 2% discount for paying 20 days early = ~36% annualised). Compare this against my cost of capital. If the discount return exceeds my borrowing cost, I should pay early. List specific vendors and potential savings.', category: 'action' },
    ],
    'accounts-ratios': [
      { id: 'acc-ratio-1', icon: <PieChart className="w-4 h-4" />, label: 'Is my business financially healthy?', description: 'Key ratios explained in simple terms \u2014 not jargon', prompt: 'Calculate and explain my key ratios in plain language: Current Ratio (can I pay short-term bills?), Gross Margin (how much do I keep after direct costs?), Net Profit Margin (what\'s my actual take-home?), Debt-to-Equity (am I over-leveraged?), and Receivable Days (how fast do customers pay?). For each, tell me if my number is healthy, okay, or concerning \u2014 and what the number actually means for my business.', category: 'summary' },
      { id: 'acc-ratio-2', icon: <TrendingUp className="w-4 h-4" />, label: 'How do I compare to similar businesses?', description: 'Your numbers vs industry averages for your sector', prompt: 'Compare my key financial ratios against typical benchmarks for my industry. For gross margin, net margin, current ratio, inventory turnover (if applicable), and receivable days \u2014 show my number vs the industry average. Where am I doing better than peers? Where am I behind? Focus on the gaps that are costing me the most money.', category: 'insight' },
      { id: 'acc-ratio-3', icon: <Target className="w-4 h-4" />, label: 'Which number should I fix first?', description: 'The one ratio that will improve your business the most', prompt: 'Look at all my financial ratios and pick the single most impactful one to improve. Explain why this specific ratio matters more than the others right now. Give me 3 concrete steps to improve it over the next 60 days, with realistic targets. For example, if my receivable days are 55, tell me how to bring it to 40 \u2014 and estimate how much extra cash that puts in my bank.', category: 'action' },
    ],
    'workspace': [
      { id: 'ws-1', icon: <AlertTriangle className="w-4 h-4" />, label: 'Overdue Tasks', description: 'Show tasks past their due date', prompt: 'Which of my assignments are overdue and need immediate attention?', category: 'alert' },
      { id: 'ws-2', icon: <Target className="w-4 h-4" />, label: 'Priority Recommendations', description: 'AI-suggested task prioritization', prompt: 'Based on due dates and project importance, what should I prioritize today?', category: 'insight' },
      { id: 'ws-3', icon: <BarChart3 className="w-4 h-4" />, label: 'Workload Analysis', description: 'Distribution across projects', prompt: 'Give me an analysis of my workload distribution across all projects.', category: 'summary' },
      { id: 'ws-4', icon: <Clock className="w-4 h-4" />, label: 'Identify Blockers', description: 'Tasks that may block progress', prompt: 'Which tasks are likely blocking other team members or downstream work?', category: 'alert' },
      { id: 'ws-5', icon: <CalendarDays className="w-4 h-4" />, label: 'Weekly Summary', description: 'What you completed this week', prompt: 'Summarize what I completed this week and what carries over to next week.', category: 'summary' },
      { id: 'ws-6', icon: <Users className="w-4 h-4" />, label: 'Delegation Suggestions', description: 'Tasks to potentially delegate', prompt: 'Which tasks could be delegated to team members based on their expertise?', category: 'action' },
      { id: 'ws-7', icon: <TrendingUp className="w-4 h-4" />, label: 'Completion Forecast', description: 'Projected timeline for pending tasks', prompt: 'At my current completion rate, when will all pending assignments be done?', category: 'insight' },
      { id: 'ws-8', icon: <Lightbulb className="w-4 h-4" />, label: 'Productivity Tips', description: 'Suggestions to improve workflow', prompt: 'Based on my task patterns, how can I optimize my daily workflow?', category: 'action' },
    ],
  };
  return commonPrompts[context] || commonPrompts['overview'];
};

// ─── Simulated AI responses ──────────────────────────────────────────
const getSimulatedResponse = (context: ModuleContext, promptId: string): string => {
  const responses: Record<string, string> = {
    'overview-1': `📊 **30-Day Performance Summary**

Your marketing performance shows a mixed picture:

**Doing Well:**
• Ad Spend efficiency improved — ROAS at **1.93x** (up from 1.7x last month)
• Revenue hit **₹28.5L**, a 12% increase week-over-week
• AOV increased to **₹3.4K**, surpassing your ₹3.2K target by 6%

**Needs Attention:**
• Ad Spend is at **₹14.8L** (90% of ₹16.5L budget) — you're spending fast
• Orders at **842** vs 1.0K target — 16% gap to close
• 5 campaigns showing declining ROAS this week

**Bottom Line:** You're generating good revenue, but order volume is lagging. Consider shifting budget from low-ROAS campaigns to your top performers to close the target gap.`,

    'overview-2': `🚨 **KPI Alerts — Action Required**

**Critical (Fix This Week):**
1. **Orders are 16% below target** (842 vs 1,000) — This is your biggest gap. Your conversion rate may have dropped.
2. **Ad Spend burn rate is high** — At 90% utilization with 10 days left, you'll overshoot budget by ~₹2L.

**Warning (Monitor Closely):**
3. **ROAS dipped on Google Ads** — Down from 2.1x to 1.7x in the last 7 days. Check for audience fatigue.
4. **Revenue per order declining** — While AOV looks healthy, repeat purchase rate dropped 8%.

**Recommended Priority:** Focus on order volume first. Pause the bottom 3 campaigns and redistribute budget to your top 2 performers.`,

    'overview-3': `💰 **Revenue vs Spend Analysis**

| Channel | Spend | Revenue | ROAS |
|---------|-------|---------|------|
| Meta Ads | ₹8.2L | ₹17.1L | **2.09x** ✅ |
| Google Ads | ₹5.1L | ₹8.7L | **1.71x** ⚠️ |
| Organic | ₹0 | ₹2.7L | **∞** 🎯 |

**Key Insight:** Meta is your strongest paid channel with 2.09x ROAS. Google Ads underperforms at 1.71x — the search campaigns are dragging it down while Shopping performs well.

**Recommendation:** Shift ₹50K from Google Search to Meta Catalog Ads where your ROAS is 2.83x. This alone could generate an additional ₹1.4L in revenue.`,

    'overview-4': `🎯 **Target Gap Analysis**

| Metric | Target | Actual | Gap | Status |
|--------|--------|--------|-----|--------|
| Ad Spend | ₹16.5L | ₹14.8L | 10% under | ✅ On track |
| Revenue | ₹32.0L | ₹28.5L | 11% behind | ⚠️ At risk |
| ROAS | 2.20x | 1.93x | 12% behind | ⚠️ At risk |
| Orders | 1,000 | 842 | 16% behind | 🔴 Behind |
| AOV | ₹3.2K | ₹3.4K | 6% ahead | ✅ Exceeded |

**Verdict:** AOV is your bright spot — you're making more per order. But order volume is significantly behind. With 10 days left in the month, you need ~16 more orders/day to hit target. Focus all optimization on conversion rate.`,

    'overview-5': `💡 **Top 3 Growth Actions for This Week**

**1. Pause & Redistribute Budget** (Impact: High)
Your bottom 3 campaigns are burning ₹1.8L with only 0.9x ROAS. Pause them and move that budget to Meta Product Catalog Sales (2.83x ROAS). Expected additional revenue: ₹1.2L.

**2. Fix Landing Page Conversion** (Impact: High)
Your product pages have a 2.1% conversion rate vs 3.2% last month. Run A/B tests on CTA placement and add urgency elements (countdown timer, stock indicators). Even a 0.5% improvement = 40+ more orders.

**3. Launch Retargeting Campaign** (Impact: Medium)
You have 12,000 cart abandoners from the last 14 days who haven't been retargeted. A simple dynamic retargeting campaign could recover 5-8% of them = 60-95 additional orders.`,

    // ─── Accounts & Taxation responses ──────────────────

    'acc-overview-1': `📊 **March 2026 — Business Performance Summary**

**Revenue:** ₹18.4L (↑ 6.2% vs Feb)
**Total Expenses:** ₹15.7L (↑ 3.8% vs Feb)
**Net Profit:** ₹2.7L (net margin: 14.7%)

**What improved:**
• Revenue grew by ₹1.07L — driven mainly by a ₹82K increase in online orders and ₹25K from a new wholesale client
• Operating expenses grew slower than revenue (3.8% vs 6.2%), which means your profit margin actually expanded by 0.9%

**What needs your attention:**
• Raw material costs jumped ₹47K (12% increase) — your packaging supplier revised prices. This ate into your gross margin, bringing it from 45.1% to 43.6%
• Staff overtime pay was ₹38K this month vs ₹12K average — likely linked to month-end order rush

**Bottom line:** You made more money and kept costs relatively controlled. But watch the raw material cost trend — if it continues, renegotiate with your supplier or explore alternatives before it erodes another 1-2% of margin.`,

    'acc-overview-2': `⚠️ **Cash Flow Forecast — Next 30 Days**

**Current bank balance:** ₹6.8L
**Expected collections (next 30 days):** ₹9.2L
**Scheduled outflows (next 30 days):** ₹13.1L

**Week-by-week breakdown:**

| Week | Inflows | Outflows | Closing Balance |
|------|---------|----------|-----------------|
| Week 1 (Mar 16-22) | ₹1.8L | ₹4.2L (salaries + PF/ESI) | ₹4.4L |
| Week 2 (Mar 23-29) | ₹3.1L | ₹3.7L (GST + vendors) | ₹3.8L |
| Week 3 (Mar 30-Apr 5) | ₹2.4L | ₹2.8L (rent + EMIs) | ₹3.4L |
| Week 4 (Apr 6-12) | ₹1.9L | ₹2.4L (TDS + vendors) | ⚠️ ₹2.9L |

**⚠️ Shortfall risk in Week 2:** GST payment of ₹1.4L on the 20th coincides with ₹2.3L in vendor payments. Your balance could dip to ₹3.8L — tight if any collection delays.

**What to do now:**
1. Follow up on ₹2.1L in overdue receivables this week — even collecting ₹1L early solves the Week 2 squeeze
2. Request 7-day extension from Mehta Traders (₹87K due Mar 25) — they've agreed before
3. Hold non-urgent purchases until after the 25th`,

    'acc-overview-3': `📊 **Money In vs Money Out — March 2026**

**Top 5 Revenue Sources:**
| Source | Amount | % of Total | vs Last Month |
|--------|--------|-----------|---------------|
| Online orders (Shopify/Amazon) | ₹8.2L | 44.6% | ↑ 11% |
| Wholesale (3 clients) | ₹5.1L | 27.7% | ↑ 4% |
| Direct / walk-in sales | ₹3.4L | 18.5% | ↓ 2% |
| Service contracts | ₹1.2L | 6.5% | — flat |
| Other income (interest, refunds) | ₹0.5L | 2.7% | ↑ 8% |

**Top 5 Expense Categories:**
| Category | Amount | % of Revenue | vs Last Month |
|----------|--------|-------------|---------------|
| Salaries & wages | ₹5.8L | 31.5% | ↑ 2% |
| Raw materials / COGS | ₹4.3L | 23.4% | ⚠️ ↑ 12% |
| Rent & utilities | ₹1.9L | 10.3% | — flat |
| Logistics & delivery | ₹1.4L | 7.6% | ↑ 5% |
| Professional fees & subscriptions | ₹0.8L | 4.3% | ↓ 3% |

**⚠️ Warning:** Raw material costs grew at 12% while revenue grew at 6.2%. If this continues for 2 more months, your gross margin drops below 40% — the threshold where your current pricing becomes unsustainable. Consider revising product prices by 3-5% or switching to your backup supplier for packaging materials.`,

    'acc-overview-4': `💡 **Tax Optimisation Check — Potential Savings: ₹1.4L–₹1.9L This Quarter**

**GST Input Tax Credit:**
• You claimed ₹1.8L in ITC this month — but we found ₹32K in eligible ITC that wasn't claimed because 4 vendor invoices had GSTIN mismatches
• **Action:** We've flagged these with the vendors. Once corrected and uploaded to GSTR-2B, you'll recover ₹32K in the next filing

**Business Deductions You're Missing:**
| Deduction | Estimated Annual Savings |
|-----------|------------------------|
| Mobile & internet (business use 70%) | ₹18K |
| Vehicle depreciation (delivery van) | ₹1.2L |
| Insurance premiums (keyman + fire) | ₹35K |
| Professional development / training | ₹12K |
| Home office (if applicable) | ₹24K |

**Advance Tax Check:**
Your estimated tax liability for FY26 is ₹8.4L. You've paid ₹4.2L in advance tax so far (2 instalments). The Mar 15 instalment of ₹2.1L was filed on time. Next due: Jun 15 — we'll calculate the exact amount by May.

**Quick wins this quarter:** Claim the vehicle depreciation (₹1.2L) and get vendor invoices corrected (₹32K ITC). Combined impact: ~₹1.5L in tax savings.`,

    'acc-sales-1': `📊 **Revenue Breakdown — March 2026**

**Total Revenue: ₹18.4L**

**By Channel / Segment:**
| Segment | Revenue | % Share | vs Feb | Trend |
|---------|---------|---------|--------|-------|
| Online (Shopify + Amazon) | ₹8.2L | 44.6% | ↑ ₹82K | 3rd consecutive month of growth |
| Wholesale — Patel Enterprises | ₹2.3L | 12.5% | — flat | Stable, pays on time |
| Wholesale — GreenLeaf Retail | ₹1.8L | 9.8% | ↑ ₹25K | New SKUs added in Feb |
| Wholesale — Metro Distributors | ₹1.0L | 5.4% | ↓ ₹15K | Ordered less this month |
| Direct / walk-in | ₹3.4L | 18.5% | ↓ ₹8K | Seasonal dip, expected |
| Service contracts | ₹1.2L | 6.5% | — flat | Annual contracts, predictable |
| Other | ₹0.5L | 2.7% | — | Interest income + credit notes |

**⚠️ Concentration risk:** Online channel is 44.6% of revenue. If your Shopify store goes down for 3 days or Amazon suspends your listing temporarily, you lose ₹82K+ in sales. Consider diversifying — your wholesale channel has room to grow.

**Strongest performer:** GreenLeaf Retail is growing steadily since you added 4 new SKUs. Worth exploring 2-3 more product additions with them next quarter.`,

    'acc-sales-2': `📈 **Revenue Trend — Last 6 Months**

| Month | Revenue | MoM Growth | Cumulative |
|-------|---------|-----------|------------|
| Oct 2025 | ₹14.8L | — | ₹14.8L |
| Nov 2025 | ₹16.2L | +9.5% | ₹31.0L |
| Dec 2025 | ₹17.9L | +10.5% | ₹48.9L |
| Jan 2026 | ₹16.5L | −7.8% | ₹65.4L |
| Feb 2026 | ₹17.3L | +4.8% | ₹82.7L |
| Mar 2026 | ₹18.4L | +6.4% | ₹101.1L |

**Growth pattern:** Your revenue grew steadily from Oct–Dec (Diwali/festive boost), dipped in January (post-festive slowdown — normal), and has been recovering since. March is your highest non-festive month yet.

**Average monthly growth (6-month):** +4.7%
**If this holds:** You'll cross ₹20L/month by June 2026 — a milestone worth planning for (inventory, hiring, cash reserves).

**What's slowing growth:** Wholesale from Metro Distributors has been flat/declining for 3 months. They ordered ₹1.4L in Oct but only ₹1.0L in March. Worth a conversation — are they shifting to a competitor, or is it a seasonal pattern?`,

    'acc-sales-3': `🚨 **Unpaid Invoices — Total Outstanding: ₹4.7L**

| Customer | Invoice # | Amount | Invoice Date | Days Overdue | Risk |
|----------|-----------|--------|-------------|-------------|------|
| Metro Distributors | INV-2026-0187 | ₹1.04L | 12 Feb 2026 | 30 days | ⚠️ Medium |
| Sunrise Retail | INV-2026-0165 | ₹72K | 28 Jan 2026 | 45 days | 🔴 High |
| KN Enterprises | INV-2026-0201 | ₹38K | 22 Feb 2026 | 20 days | Low |
| Patel Enterprises | INV-2026-0215 | ₹1.12L | 03 Mar 2026 | 11 days | Low |
| GreenLeaf Retail | INV-2026-0198 | ₹89K | 18 Feb 2026 | 24 days | Low |
| Others (4 invoices) | — | ₹55K | Various | 5-18 days | Low |

**🔴 Priority follow-ups:**
1. **Sunrise Retail (₹72K, 45 days overdue)** — They've been late 3 of the last 5 invoices. This is becoming a pattern. Call this week and consider moving them to advance payment for the next order.
2. **Metro Distributors (₹1.04L, 30 days)** — Large amount. They usually pay in 25-28 days but this one has slipped. Send a formal reminder today.

**Total at risk (60+ days):** ₹72K (Sunrise only, for now)
**Total collectible this week with follow-up:** ~₹1.9L (Metro + Patel + KN)`,

    'acc-exp-1': `📊 **Expense Breakdown — March 2026**

**Total Expenses: ₹15.7L**

| Category | Amount | % of Revenue | Flag |
|----------|--------|-------------|------|
| Salaries & wages | ₹5.8L | 31.5% | ⚠️ Above 30% threshold |
| Raw materials / COGS | ₹4.3L | 23.4% | ⚠️ Jumped 12% vs Feb |
| Rent & maintenance | ₹1.52L | 8.3% | ✅ Normal |
| Utilities (power, water, internet) | ₹38K | 2.1% | ✅ Normal |
| Logistics & delivery | ₹1.4L | 7.6% | ↑ 5% — more online orders |
| Professional fees (CA, legal) | ₹45K | 2.4% | ✅ Normal |
| Software & subscriptions | ₹32K | 1.7% | ✅ Normal |
| Marketing & advertising | ₹28K | 1.5% | ✅ Low |
| Insurance premiums | ₹18K | 1.0% | ✅ Normal |
| Staff welfare & travel | ₹22K | 1.2% | ✅ Normal |
| Loan EMIs (interest portion) | ₹67K | 3.6% | ✅ Fixed |
| Miscellaneous / petty cash | ₹48K | 2.6% | ⚠️ High for petty cash |

**⚠️ Flagged items:**
• **Salaries at 31.5% of revenue** — The healthy benchmark is 25-30%. You added a new hire in Feb (₹35K/month). Revenue needs to grow another ₹1.5L/month to absorb this cost comfortably.
• **Petty cash at ₹48K** — This is higher than usual (₹28K average). Check for uncategorised expenses hiding in this bucket.`,

    'acc-exp-2': `⚠️ **Expense Spike Alert — March vs 3-Month Average**

| Category | March | 3-Month Avg | Spike | Likely Cause |
|----------|-------|------------|-------|-------------|
| Raw materials | ₹4.3L | ₹3.78L | ⚠️ **+13.7%** | Packaging supplier revised prices by 15% from March 1. This alone added ₹37K to your materials bill |
| Logistics | ₹1.4L | ₹1.24L | ⚠️ **+12.9%** | Online orders grew 11%, so shipping volume went up proportionally. This is a "good" cost increase — it came with revenue |
| Staff overtime | ₹38K | ₹14K | 🔴 **+171%** | Month-end order rush required weekend overtime for warehouse staff. Recurring 3 of last 4 months — consider adding a part-time hire instead |
| Petty cash | ₹48K | ₹28K | ⚠️ **+71%** | ₹18K of this was office supplies bulk purchase (quarterly, not recurring). Remaining ₹2K over average is normal variance |

**One-off vs trend:**
• **Raw materials:** 🔴 Trend — supplier has permanently revised prices. Impact: ₹37K/month = ₹4.4L/year if unchanged. Action: renegotiate or switch suppliers.
• **Logistics:** ✅ Revenue-linked — acceptable as long as delivery cost per order stays under ₹170 (currently ₹162).
• **Overtime:** 🔴 Trend — happening monthly. A part-time warehouse hire at ₹15K/month would save ₹23K/month vs overtime rates.
• **Petty cash:** ✅ One-off — quarterly bulk buy. No action needed.`,

    'acc-exp-3': `💡 **Cost Reduction Opportunities — Realistic Savings: ₹1.2L–₹1.8L/Month**

**1. Switch packaging supplier (Save ₹30K–₹40K/month)** 🟢 Quick Win
Your current supplier raised prices 15%. We've sourced 2 alternatives: Packmate India (12% cheaper, same quality, MOQ 500 units) and Flexipack (8% cheaper, 3-day faster delivery). Request samples this week. Switching takes ~2 weeks.

**2. Replace overtime with a part-time hire (Save ₹20K–₹25K/month)** 🟡 Medium-term
You're paying ₹38K/month in overtime (2x rate). A part-time warehouse assistant at ₹15K/month handles the same workload during normal hours. Net saving: ₹23K/month. Takes 2-3 weeks to hire.

**3. Negotiate annual contracts with top 3 vendors (Save ₹15K–₹20K/month)** 🟡 Medium-term
You buy from Mehta Traders, KN Supplies, and Raj Enterprises monthly at spot rates. Committing to 12-month contracts typically gets 5-8% discount. At your ₹4.3L monthly spend, even 5% = ₹21.5K savings.

**4. Review software subscriptions (Save ₹8K–₹12K/month)** 🟢 Quick Win
You're paying for 3 tools with overlapping features (CRM, project management, communication). Consolidating to 2 saves ₹8K/month. We'll audit the full list next week.

**5. Optimise delivery routing (Save ₹10K–₹15K/month)** 🟡 Medium-term
Your average delivery cost is ₹162/order. Businesses your size typically achieve ₹130-₹140 by batching deliveries by pincode. Speak with your logistics partner about zone-based pricing.

**Not recommended to cut:** Salaries (retention risk), marketing (already lean at 1.5%), insurance (compliance risk).`,

    'acc-pl-1': `📊 **Profit & Loss — March 2026 (Simplified)**

| | March | Feb | Change |
|--|-------|-----|--------|
| **Revenue** | ₹18.4L | ₹17.3L | ↑ ₹1.07L (+6.2%) |
| − Cost of goods sold | ₹7.6L | ₹7.1L | ↑ ₹50K |
| **= Gross Profit** | **₹10.8L** | **₹10.2L** | ↑ ₹57K |
| Gross Margin | **58.7%** | **59.0%** | ↓ 0.3% |
| − Salaries & wages | ₹5.8L | ₹5.6L | ↑ ₹20K |
| − Rent & utilities | ₹1.9L | ₹1.9L | — flat |
| − Logistics | ₹1.4L | ₹1.3L | ↑ ₹10K |
| − Other operating expenses | ₹1.0L | ₹0.95L | ↑ ₹5K |
| **= Net Profit** | **₹2.7L** | **₹2.45L** | ↑ ₹25K |
| Net Margin | **14.7%** | **14.2%** | ↑ 0.5% |

**In plain language:** For every ₹100 you earned this month, you kept ₹14.70 as profit (up from ₹14.20 last month). You earned more, and your expenses didn't grow as fast — that's the right direction.

**Watch out:** Your gross margin dipped slightly (59.0% → 58.7%) because raw material costs rose faster than revenue. If this continues, it'll eat into the net margin gains you made on the operating side.`,

    'acc-pl-2': `🔍 **Why Your Profit Changed — March vs February**

**Net profit increased by ₹25K.** Here's exactly why:

**Factors that INCREASED profit:**
| Factor | Impact | Explanation |
|--------|--------|-------------|
| Higher revenue | +₹1.07L | More online orders (₹82K) + new wholesale client (₹25K) |
| Lower marketing spend | +₹8K | You paused one social campaign that wasn't converting |
| Professional fees saved | +₹12K | No legal consultation needed this month (Feb had a contract review) |

**Factors that DECREASED profit:**
| Factor | Impact | Explanation |
|--------|--------|-------------|
| Raw material cost increase | −₹50K | Packaging supplier price hike (15%). This is your biggest margin killer right now |
| New hire salary | −₹35K | Warehouse assistant hired in Feb — first full month on payroll |
| Overtime payments | −₹26K | ₹38K this month vs ₹12K average — month-end order rush |
| Higher logistics costs | −₹10K | Proportional to online order growth — acceptable |

**Net impact:** +₹1.07L revenue − ₹82K in higher costs = +₹25K net profit

**The one thing to fix:** The packaging cost increase (₹50K/month = ₹6L/year) is the single biggest drag. Switching suppliers would turn your ₹25K profit improvement into ₹62K — more than doubling it.`,

    'acc-pl-3': `💡 **How to Make ₹1L More Profit Next Month — Action Plan**

**Current net profit: ₹2.7L → Goal: ₹3.7L (+₹1L improvement)**

**Action 1: Switch packaging supplier (Impact: +₹37K)** 🟢 Easy
Switch from current supplier to Packmate India (12% cheaper). At your current volume, this saves ₹37K/month. Lead time: request samples today, switch within 2 weeks. No quality compromise based on sample reports.

**Action 2: Raise prices 3% on online products (Impact: +₹25K)** 🟡 Medium
Your online channel does ₹8.2L/month. A 3% price increase = ₹24.6K more revenue. At your category, 3% is within customer tolerance — especially since competitors raised prices 5-8% last quarter. Test on your top 10 SKUs first.

**Action 3: Collect overdue receivables (Impact: +₹18K in interest savings)** 🟢 Easy
₹4.7L in receivables is sitting idle. If you collect even ₹2L faster and avoid 15 days of working capital borrowing, you save ₹18K in interest cost (at 18% OD rate). Just call Metro Distributors and Sunrise Retail this week.

**Action 4: Replace overtime with part-time hire (Impact: +₹23K)** 🟡 Medium
Overtime costs ₹38K/month. A part-time hire at ₹15K handles the same workload. Net saving: ₹23K/month. Takes 2-3 weeks to find and onboard.

**Total projected impact: +₹1.03L** — That gets you to ₹3.73L net profit, crossing your target.`,

    'acc-bs-1': `📊 **Balance Sheet Summary — As of March 31, 2026**

**What you OWN (Assets): ₹42.6L**
| Asset | Amount | Notes |
|-------|--------|-------|
| Cash in bank (HDFC Current) | ₹6.8L | Healthy for day-to-day operations |
| Fixed deposits | ₹5.0L | Emergency reserve — don't touch |
| Accounts receivable | ₹4.7L | Money customers owe you |
| Inventory (stock in hand) | ₹8.3L | ~45 days of stock at current sales rate |
| Fixed assets (equipment, vehicle, computers) | ₹14.2L | After depreciation |
| Other (deposits, prepaid expenses) | ₹3.6L | Rent deposit ₹2.4L + insurance prepaid |

**What you OWE (Liabilities): ₹18.9L**
| Liability | Amount | Notes |
|-----------|--------|-------|
| Vendor payables | ₹5.2L | Due within 30 days |
| Business loan (HDFC) | ₹8.4L | EMI ₹67K/month, 14 months remaining |
| GST payable | ₹1.4L | Due March 20 — already filed |
| TDS payable | ₹42K | Due April 7 |
| Salary & PF payable | ₹3.4L | Current month, due by 1st/15th |

**Your Net Worth (Equity): ₹23.7L** (up from ₹21.8L in December)

**In simple terms:** Your business owns ₹42.6L in assets and owes ₹18.9L. Your net worth — what actually belongs to you — is ₹23.7L. It grew by ₹1.9L this quarter, meaning your business is building value.`,

    'acc-bs-2': `📊 **Working Capital Health Check**

**Current Assets (can convert to cash within 12 months):** ₹24.8L
• Cash in bank: ₹6.8L
• Receivables: ₹4.7L
• Inventory: ₹8.3L
• FD + deposits: ₹5.0L

**Current Liabilities (due within 12 months):** ₹18.2L
• Vendor payables: ₹5.2L
• Loan EMIs (next 12 months): ₹8.0L
• Tax dues (GST + TDS): ₹1.8L
• Salaries & statutory (PF/ESI): ₹3.2L

**Working Capital = ₹24.8L − ₹18.2L = ₹6.6L** ✅
**Current Ratio = 1.36** ✅ (healthy is above 1.2)

**Stress test — what if things go wrong?**
• If you collected ALL receivables and paid ALL current dues: **₹6.6L cash remaining** ✅
• If 30% of receivables become uncollectible (₹1.4L bad debt): **₹5.2L remaining** — still okay
• If a major customer delays 60 days AND a vendor demands early payment: **₹3.1L remaining** — tight but manageable

**Verdict:** Your working capital is healthy today. The risk area is receivables — ₹4.7L outstanding with ₹72K already at 45+ days. Keep your collection cycle under 35 days and you'll stay comfortable.`,

    'acc-bs-3': `⚠️ **Debt Position — March 2026**

**All Current Borrowings:**
| Loan | Outstanding | Monthly EMI | Interest Rate | Remaining |
|------|------------|-------------|---------------|-----------|
| HDFC Business Loan | ₹8.4L | ₹67K | 12.5% p.a. | 14 months |
| CC OD (working capital) | ₹0 (limit ₹5L) | — | 16.5% p.a. | Revolving |
| **Total** | **₹8.4L** | **₹67K** | | |

**Key ratios:**
• **Debt-to-Equity:** 0.35 (₹8.4L debt ÷ ₹23.7L equity) ✅ Healthy — below 1.0 is good
• **EMI as % of revenue:** 3.6% (₹67K ÷ ₹18.4L) ✅ Very comfortable — warning threshold is 25%
• **Interest cost this month:** ₹67K EMI includes ~₹28K interest + ₹39K principal
• **Loan fully repaid by:** May 2027

**Assessment:** Your debt is well under control. The HDFC loan was taken for equipment and will be fully repaid in 14 months. Your EMI burden is only 3.6% of revenue — extremely manageable. You haven't used your OD facility at all, which means you have ₹5L in emergency borrowing capacity if needed.

**One suggestion:** Since your cash position is stable and you have ₹5L in FD, consider a ₹2L prepayment on the HDFC loan. This would save ~₹18K in interest over the remaining tenure and free up cash flow 2 months earlier.`,

    'acc-cf-1': `📊 **Cash Flow — March 2026 (Actual Bank Movement)**

**Opening balance (1 Mar):** ₹5.9L
**Closing balance (31 Mar):** ₹6.8L
**Net cash flow:** +₹0.9L ✅

**Cash IN (what actually hit your bank): ₹16.8L**
| Source | Amount | Notes |
|--------|--------|-------|
| Customer payments received | ₹14.6L | ₹3.8L less than invoiced — collection gap |
| GST refund (previous quarter) | ₹1.4L | One-time credit |
| FD interest credited | ₹0.3L | Quarterly interest |
| Other (misc credits) | ₹0.5L | |

**Cash OUT (what left your bank): ₹15.9L**
| Category | Amount | Notes |
|----------|--------|-------|
| Vendor payments | ₹5.8L | Paid 12 invoices |
| Salaries (net of TDS) | ₹4.9L | 18 employees |
| PF + ESI deposit | ₹62K | Deposited on 14th ✅ |
| GST payment (GSTR-3B) | ₹1.4L | Filed on 18th ✅ |
| TDS deposit | ₹42K | Deposited on 6th ✅ |
| Rent | ₹1.2L | Office + warehouse |
| Loan EMI | ₹67K | HDFC auto-debit |
| Other (utilities, petty cash, misc) | ₹89K | |

**Important distinction:** You invoiced ₹18.4L in revenue but only collected ₹14.6L in cash. The ₹3.8L gap is your collection lag — money earned but not yet in your bank. This is the single biggest factor affecting your cash position.`,

    'acc-cf-2': `⚠️ **Cash Runway — Next 4 Weeks**

**Current bank balance:** ₹6.8L

| Week | Key Outflows | Key Inflows | Projected Balance | Status |
|------|-------------|-------------|-------------------|--------|
| **Week 1** (Mar 16-22) | Salaries ₹4.9L + PF ₹62K | Collections ₹1.8L | **₹3.1L** | ⚠️ Tight |
| **Week 2** (Mar 23-29) | GST ₹1.4L + Vendors ₹2.3L | Collections ₹3.1L | **₹2.5L** | 🔴 Danger zone |
| **Week 3** (Mar 30-Apr 5) | Rent ₹1.2L + EMI ₹67K | Collections ₹2.4L | **₹2.5L** | ⚠️ Tight |
| **Week 4** (Apr 6-12) | TDS ₹42K + Vendors ₹1.8L | Collections ₹1.9L | **₹2.6L** | ⚠️ Tight |

**🔴 Critical window: March 23-29**
Your bank balance could drop to ₹2.5L when GST (₹1.4L) and vendor payments (₹2.3L) land in the same week. If even one expected collection of ₹3.1L gets delayed, you'll need to dip into your OD facility.

**Safety actions for this week:**
1. **Collect from Metro Distributors (₹1.04L overdue)** — one phone call could shift your Week 2 balance from ₹2.5L to ₹3.5L
2. **Defer Mehta Traders payment to April 2** — it's ₹87K due March 25, and they've accepted 7-day extensions before
3. **Keep ₹2L as absolute floor** — below this, activate your OD facility rather than bouncing any payments`,

    'acc-cf-3': `💡 **Free Up Cash This Month — Action Plan**

**Goal: Improve cash position by ₹2L–₹3L within 30 days**

**1. Collect overdue receivables aggressively (Potential: +₹2.1L)** 🟢 This Week
You have ₹4.7L outstanding. Focus on:
• Metro Distributors (₹1.04L, 30 days overdue) — call today, they usually respond to direct follow-up
• Sunrise Retail (₹72K, 45 days overdue) — send a formal demand notice. If unpaid by April 7, halt further credit supply
• Patel Enterprises (₹1.12L, 11 days) — send a polite reminder; they typically pay within 5 days of reminder
**Realistic collection this month:** ₹1.8L–₹2.1L

**2. Negotiate 15-day payment extension with 2 vendors (Potential: +₹1.5L timing benefit)** 🟢 This Week
Delay ₹1.5L in vendor payments by 15 days without penalty. Mehta Traders and Raj Enterprises both have 30-day terms — request 45 days for March citing month-end cash cycle. This doesn't save money but gives you breathing room.

**3. Time your GST deposit strategically (Benefit: better cash alignment)** 🟢 Quick Win
You have until the 20th to pay GST. Don't pay early — deposit on the 19th to keep funds in your account as long as legally possible. This frees up ₹1.4L for an extra 5-7 days.

**4. Review inventory for slow-moving stock (Potential: +₹50K–₹80K)** 🟡 This Month
You have ₹8.3L in inventory. If even 10% is slow-moving (90+ days old), that's ₹83K locked up. Run a clearance promotion or return to supplier. Even recovering ₹50K helps.

**5. Defer non-critical purchases to April (Potential: ₹30K–₹50K)** 🟢 Quick Win
Any office supplies, equipment upgrades, or subscription renewals that aren't urgent — push to the first week of April when your collections cycle resets.

**Combined realistic impact: +₹2.3L–₹3.2L** in improved cash position within 30 days.`,

    'acc-rec-1': `📊 **Receivables Ageing Report — March 2026**

**Total Outstanding: ₹4.7L across 9 invoices**

**By Ageing Bucket:**
| Bucket | Amount | % of Total | # Invoices | Status |
|--------|--------|-----------|------------|--------|
| 0–30 days | ₹2.54L | 54% | 5 | ✅ Normal — within payment terms |
| 31–60 days | ₹1.44L | 31% | 3 | ⚠️ Needs follow-up |
| 61–90 days | ₹72K | 15% | 1 | 🔴 High risk |
| 90+ days | ₹0 | 0% | 0 | ✅ Clean |

**Top customers by outstanding amount:**
| Customer | Total Owed | Oldest Invoice | Avg Payment Days | Status |
|----------|-----------|---------------|-----------------|--------|
| Patel Enterprises | ₹1.12L | 11 days old | 22 days (good) | ✅ Will pay on time |
| Metro Distributors | ₹1.04L | 30 days old | 28 days (usually) | ⚠️ Slightly late |
| GreenLeaf Retail | ₹89K | 24 days old | 20 days (fast payer) | ✅ Expected this week |
| Sunrise Retail | ₹72K | 45 days old | 38 days (slow payer) | 🔴 Pattern of delay |
| KN Enterprises | ₹38K | 20 days old | 25 days (normal) | ✅ On track |
| Others (4 small) | ₹55K | Various | Various | ✅ Low risk |

**⚠️ Key concern:** 15% of your receivables (₹72K from Sunrise Retail) is in the 61-90 day bucket. Industry benchmark is to keep 60+ day receivables below 10%.

**Your average collection period: 32 days** (industry benchmark: 25-30 days). Reducing this by even 5 days frees up ₹30K in working capital permanently.`,

    'acc-rec-2': `🚨 **Payment Risk Assessment — Problem Customers**

**Customer 1: Sunrise Retail** 🔴 High Risk
• **Currently owes:** ₹72K (45 days overdue)
• **Payment history (last 6 months):** Late 4 out of 6 times. Average delay: 18 days past due date.
• **Pattern:** They consistently place orders mid-month, receive goods, then delay payment until pressed. Last time they paid only after a direct phone call on day 52.
• **Recommendation:** **Move to 50% advance payment** for next order. Inform them in writing: "Due to consistent payment delays, we're updating terms to 50% advance + 50% on delivery."

**Customer 2: Metro Distributors** ⚠️ Medium Risk
• **Currently owes:** ₹1.04L (30 days — just crossing due date)
• **Payment history:** Usually pays in 25-28 days. This is the first time they've hit 30 days.
• **Pattern:** Their Feb payment was also 3 days late. Could be a cash flow issue on their end, or just operational delay.
• **Recommendation:** **Send a friendly reminder today.** If this becomes a 2nd consecutive late payment, have a direct conversation about their situation. Don't reduce credit yet — they're a ₹1L+/month customer.

**Customer 3: KN Enterprises** ✅ Low Risk (but watch)
• **Currently owes:** ₹38K (20 days — within terms)
• **Payment history:** Paid on time 5 of 6 months. One delay of 5 days in December.
• **Recommendation:** No action needed. Continue current terms.

**Overall exposure:** Your top 3 debtors owe ₹2.14L (46% of total receivables). Concentration is acceptable for your business size but worth monitoring.`,

    'acc-rec-3': `💡 **Speed Up Collections — Action Plan**

**Current avg collection period: 32 days → Goal: 22 days (reduce by ~10 days)**

**This week — immediate actions:**

**1. Call Metro Distributors today (₹1.04L, 30 days)**
Script: "Hi [name], just following up on INV-0187 for ₹1.04L from Feb 12. Our records show it's due — could you confirm when the payment is scheduled?" Expected result: payment within 5 days.

**2. Send formal payment notice to Sunrise Retail (₹72K, 45 days)**
Template: "Dear [name], Invoice INV-0165 for ₹72,000 dated January 28 is now 45 days overdue. Please arrange payment by March 21. Going forward, we'll be updating payment terms to 50% advance for new orders."

**3. Send reminders on invoices in the 0-30 day bucket**
A simple WhatsApp message on day 20 (5 days before due date) reduces payment delays by 40%. Just: "Hi, friendly reminder that INV-[number] for ₹[amount] is due on [date]. Let us know if you need anything."

**Structural changes (implement this month):**
• **Add a 2% early payment discount (pay within 10 days)** — On a ₹1L invoice, you give up ₹2K but get paid 20 days sooner. At 18% OD rate, 20 days of ₹1L costs you ₹986 in interest. Net cost: ~₹1K — worth it for cash flow certainty.
• **Send invoices on the same day as delivery** — Currently there's a 2-3 day gap. This silently adds 3 days to your collection cycle.
• **Set up automated reminders** — Day 1 (invoice sent), Day 20 (5 days before due), Day 31 (1 day overdue), Day 45 (formal notice). This alone can reduce avg collection by 8-10 days.`,

    'acc-pay-1': `📊 **Upcoming Payments — Next 30 Days**

**Total payable: ₹13.1L | Current bank balance: ₹6.8L**

| Due Date | Payment | Amount | Type | Status |
|----------|---------|--------|------|--------|
| Apr 1 | Salaries (18 employees) | ₹4.9L | Recurring | Must pay |
| Apr 1 | Rent — office + warehouse | ₹1.2L | Recurring | Must pay |
| Apr 7 | TDS deposit (March) | ₹42K | Statutory | ⚠️ Penalty if late |
| Apr 10 | Mehta Traders — raw materials | ₹87K | Vendor | Can negotiate |
| Apr 12 | Raj Enterprises — packaging | ₹64K | Vendor | Can negotiate |
| Apr 15 | PF + ESI deposit | ₹62K | Statutory | ⚠️ Penalty if late |
| Apr 15 | HDFC loan EMI | ₹67K | Loan | Auto-debit |
| Apr 18 | KN Supplies — logistics | ₹1.1L | Vendor | Due on terms |
| Apr 20 | GST payment (GSTR-3B) | ₹1.4L | Statutory | ⚠️ Penalty if late |
| Apr 22 | Utility bills (electricity, internet) | ₹38K | Recurring | Must pay |
| Apr 25 | 3 other vendor invoices | ₹1.42L | Vendor | On terms |

**Can you cover everything?**
• Total outflows: ₹13.1L
• Bank balance + expected collections: ₹6.8L + ₹9.2L = ₹16.0L
• **Buffer after all payments: ₹2.9L** ✅

**The tight spot:** ₹6.1L is due in the first 7 days of April (salaries + rent + TDS). You need at least ₹3L in collections before April 5 to stay comfortable.`,

    'acc-pay-2': `📅 **Payment Priority Calendar — Next 4 Weeks**

**Priority 1: Statutory dues (penalties apply — pay on time, no exceptions)**
| Date | Payment | Amount | Penalty if Late |
|------|---------|--------|----------------|
| Apr 7 | TDS deposit | ₹42K | ₹200/day + 1.5% interest/month |
| Apr 15 | PF deposit | ₹44K | Up to 100% damages under EPF Act |
| Apr 15 | ESI deposit | ₹18K | 12% annual interest |
| Apr 20 | GST (GSTR-3B) | ₹1.4L | ₹50/day + 18% interest on tax |

**Priority 2: Loan EMIs (credit score impact)**
| Date | Payment | Amount | Impact if Missed |
|------|---------|--------|-----------------|
| Apr 15 | HDFC business loan | ₹67K | CIBIL score drops, future borrowing affected |

**Priority 3: Salaries & rent (people + operations)**
| Date | Payment | Amount | Notes |
|------|---------|--------|-------|
| Apr 1 | Salaries (net) | ₹4.9L | Employee trust — never delay |
| Apr 1 | Rent | ₹1.2L | Landlord agreement — 5 day grace |

**Priority 4: Vendors (negotiate timing if needed)**
| Date | Payment | Amount | Can Defer? |
|------|---------|--------|-----------|
| Apr 10 | Mehta Traders | ₹87K | ✅ Yes — they've accepted extensions before |
| Apr 12 | Raj Enterprises | ₹64K | ✅ Yes — good relationship |
| Apr 18 | KN Supplies | ₹1.1L | ⚠️ Risky — strict terms |
| Apr 25 | Other vendors (3) | ₹1.42L | ✅ Yes — spread across the week |

**If cash is tight:** Defer Mehta Traders and Raj Enterprises to Apr 18-20 (combined ₹1.51L). This buys 8-10 days. Never defer statutory dues or loan EMIs.`,

    'acc-pay-3': `💡 **Payment Optimisation — Save by Paying Differently**

**Early Payment Discounts Available:**

| Vendor | Invoice | Discount Offered | Condition | Annualised Return | Worth It? |
|--------|---------|-----------------|-----------|------------------|-----------|
| Mehta Traders | ₹87K | 2% (₹1,740) | Pay within 10 days (vs 30) | **36.5%** | ✅ Yes |
| Raj Enterprises | ₹64K | 1.5% (₹960) | Pay within 7 days (vs 30) | **23.7%** | ✅ Yes |
| KN Supplies | ₹1.1L | None offered | — | — | ❌ Pay on due date |

**How the math works (Mehta Traders example):**
• Normal terms: Pay ₹87K in 30 days
• Discount terms: Pay ₹85,260 in 10 days (save ₹1,740)
• You give up use of ₹85K for 20 extra days to save ₹1,740
• Annualised: (₹1,740 ÷ ₹85,260) × (365 ÷ 20) = **37.3% return**
• Your OD facility costs 16.5%. Paying early "earns" you 37% vs "costing" 16.5% — take the discount.

**Monthly savings if you take all available discounts: ₹2,700**
**Annual savings: ₹32,400**

**Recommendation:** Take the Mehta Traders and Raj Enterprises discounts every month — it's effectively free money. For vendors without discount terms, pay on the due date (not early, not late) to maximise your cash usage.

**What NOT to do:** Don't borrow on OD (16.5%) to pay vendors early for a 1% discount (~15% annualised). Only take discounts where annualised return exceeds your borrowing cost.`,

    'acc-ratio-1': `📊 **Financial Health Scorecard — March 2026**

| Ratio | Your Number | What It Means | Status |
|-------|------------|--------------|--------|
| **Current Ratio** | **1.36** | For every ₹1 you owe short-term, you have ₹1.36 to cover it. You can pay your bills. | ✅ Healthy |
| **Gross Margin** | **58.7%** | After direct costs, you keep ₹58.70 of every ₹100 earned. | ✅ Strong |
| **Net Profit Margin** | **14.7%** | After ALL expenses, you keep ₹14.70 of every ₹100. This is your real take-home. | ✅ Good |
| **Debt-to-Equity** | **0.35** | You owe ₹0.35 for every ₹1 of your own money in the business. | ✅ Conservative |
| **Receivable Days** | **32 days** | Customers take 32 days on average to pay you. | ⚠️ Slightly high |
| **Inventory Days** | **45 days** | You hold 45 days worth of stock. | ⚠️ High |

**Overall verdict:** Your business is financially healthy. Profitability is strong, debt is low, and you can cover short-term obligations. The two areas to improve are **collection speed** (32 → 25 days) and **inventory management** (45 → 35 days). Fixing just these two would free up ₹2.8L in working capital.`,

    'acc-ratio-2': `📊 **Industry Benchmark Comparison**

*Benchmarks for SMEs in your sector (₹15-25L monthly revenue range)*

| Ratio | Your Business | Industry Average | Gap | Assessment |
|-------|--------------|-----------------|-----|-----------|
| Gross Margin | **58.7%** | 50-55% | +3.7% to +8.7% | 🏆 Outperforming |
| Net Margin | **14.7%** | 10-15% | At top of range | ✅ Well-managed |
| Current Ratio | **1.36** | 1.3-1.8 | Within range | ✅ Adequate |
| Debt-to-Equity | **0.35** | 0.5-1.0 | Below average | ✅ Less leveraged |
| Receivable Days | **32 days** | 22-28 days | +4 to +10 days | ⚠️ Slower than peers |
| Inventory Days | **45 days** | 28-35 days | +10 to +17 days | 🔴 Too much stock |

**Where you're winning:**
• Gross margin (58.7%) is significantly above industry. Your pricing and supplier costs are better than most competitors. Protect this.
• Low debt (0.35 D/E) means you have significant borrowing capacity for expansion.

**Where you're losing money:**
• **Inventory days (45 vs 30):** ~₹2.5L more tied up in stock than necessary — earning 0% instead of sitting in your bank.
• **Receivable days (32 vs 25):** Extra 7 days locks up ₹1.3L. At 18% OD rate, this costs ₹19K/year.

**Combined cost of these gaps: ~₹3.8L in locked-up capital.** Fixing them is your biggest efficiency win.`,

    'acc-ratio-3': `🎯 **Priority Fix: Inventory Days (45 → 35 days)**

**Why this one matters most:**
Receivable days (32 → 25) would free up ₹1.3L. But inventory days (45 → 35) frees up **₹2.5L** — nearly double. Plus, excess inventory creates risk of obsolescence, spoilage, or markdowns.

**What "45 inventory days" means:**
You hold ₹8.3L in stock. At your sales rate, you'd only need ₹6.4L for 35 days. That's **₹1.9L on shelves** that could be in your bank.

**3 steps to fix this (60-day plan):**

**Step 1: Identify slow-moving SKUs (Week 1-2)**
Pull inventory sorted by last-sold date. Flag anything unsold for 60+ days. Typically 10-15% of inventory (₹83K–₹1.25L). Run clearance at 15-20% discount or return to supplier.

**Step 2: Reduce reorder quantities by 20% (Week 2-3)**
Order 20% less, 25% more frequently. Per-unit cost may rise 2-3%, but you save 15-20% on carrying costs. Net benefit: positive.

**Step 3: Set min/max stock levels per SKU (Week 3-4)**
For your top 20 SKUs (80% of sales), set reorder points and maximum stock. Prevents over-ordering and stockouts.

**Expected result:** Inventory drops from ₹8.3L to ~₹6.4L over 60 days. ₹1.9L freed up — enough to cover a full month of vendor payments or eliminate OD dependency entirely.`,

    // ─── Workspace / Task Management responses ──────────
    'ws-1': `🚨 **Overdue Tasks — Action Required**

**2 tasks are overdue:**

1. **"Reposition Social media as CONTENT MARKETING SERVICES"** — Due Tue, 11 Feb (Brego Business - Growth)
   → Assigned with Sufyan Q. & Mihir L. Consider a quick sync.

2. **"Complete front end design for BREGO product"** — Due Tue, 11 Feb (Operations & People)
   → This is blocking the final reports deliverable.

**Recommendation:** Focus on the front-end design task first as it has downstream dependencies. The social media repositioning can be broken into smaller subtasks.`,

    'ws-2': `🎯 **Priority Recommendations for Today**

**High Priority:**
1. **Complete front end design for BREGO product** — blocking final reports
2. **Reposition Social media content** — overdue, shared assignment

**Medium Priority:**
3. **Complete back-end designs** — due soon, pairs with front-end work
4. **Set up conversion tracking pixels** — client deliverable

**Can Wait:**
5. **Reconcile Q4 expense reports** — due Mon, 17 Feb

This ordering considers due dates, dependencies, and client impact.`,

    'ws-3': `📊 **Workload Distribution**

**By Project:**
• Brego Business - Growth: 3 tasks (30%)
• Brego Business - Operations & People: 3 tasks (30%)
• Client - AcmeCorp Growth: 2 tasks (20%)
• Client - RetailMax Finance: 2 tasks (20%)

**Completion Rate:** 3/10 tasks completed (30%)

**Observation:** You have 6 tasks due within the same week. Consider redistributing 1-2 Brego internal tasks to next week to ensure client deliverables aren't impacted.`,

    'ws-4': `🚧 **Potential Blockers Identified**

1. **"Complete front end design for BREGO product"**
   → Likely blocks the final reports deliverable for Operations & People
   → Sufyan Q. and Mihir L. are co-assigned

2. **"Set up conversion tracking pixels"**
   → Blocks campaign performance measurement for AcmeCorp
   → Marketing team can't validate ROI without this

**Suggestion:** Schedule a 15-min standup with Sufyan Q. to unblock the front-end design, and allocate 2 hours tomorrow morning for the tracking pixel setup.`,

    'ws-5': `📅 **Weekly Summary — Week of Feb 10**

**Completed (3 tasks):**
1. Finalize Q1 campaign strategy deck — AcmeCorp Growth
2. Prepare monthly tax compliance report — RetailMax Finance
3. Reposition Social media (partial) — Operations & People

**Carries Over (7 tasks):**
• 3 tasks from Brego Business - Growth
• 2 tasks from Operations & People
• 1 task each from AcmeCorp & RetailMax

**Completion Rate:** 30% — below your typical 45% weekly average. Consider time-boxing tasks into 90-min blocks.`,

    'ws-6': `💡 **Delegation Opportunities**

1. **"Reconcile Q4 expense reports"** → Kiran B. is already assigned solo. Could loop in a junior analyst for data gathering.

2. **"Complete back-end designs"** → If Mihir L. has bandwidth, this can be fully delegated since front-end is your priority.

3. **"Need to reposition Social media"** → This appears 3 times across projects. Consider creating a template and having Sufyan Q. lead the execution.

**Net impact:** Delegating these 3 items frees up ~8 hours this week.`,

    'ws-7': `📊 **Completion Forecast**

At your current pace of ~1.5 tasks/day:

**All 7 pending tasks → Completed by Wed, Feb 19**

However, factoring in complexity:
• Front-end design: ~2 days
• Social media repositioning (x3): ~1 day each
• Tracking pixels: ~0.5 days
• Expense reconciliation: ~1 day

**Realistic estimate:** All tasks done by **Thu, Feb 20** if no new assignments are added.

**Tip:** Batch the 3 social media tasks together for efficiency.`,

    'ws-8': `💡 **Productivity Optimization Tips**

1. **Batch Similar Tasks** — You have 3 "social media repositioning" tasks. Do them in one focused session.

2. **Front-load Client Work** — AcmeCorp and RetailMax tasks should be prioritized before noon when energy is highest.

3. **Use the 2-Minute Rule** — "Complete back-end designs" might have quick-win subtasks. Knock them out immediately.

4. **Set Task Time Limits** — Your average task takes 2.5 hours. Try 90-min blocks with breaks.

5. **Daily Standup Habit** — A 5-min self-review each morning of this assignments list keeps priorities aligned.`,
  };

  if (responses[promptId]) return responses[promptId];

  const contextLabel = context === 'workspace' ? 'task management' : context.includes('accounts') ? 'financial' : 'marketing';

  return `📊 **Analysis Complete**

Based on your current ${contextLabel} data, here's what I found:

**Key Highlights:**
• Overall performance is trending positively with a few areas needing attention
• Your strongest metrics are outperforming benchmarks by 8-12%
• There are 2-3 quick optimizations that could improve results by 15-20%

**Recommended Next Steps:**
1. Focus on the underperforming areas highlighted above
2. Double down on what's already working well
3. Set up automated alerts for metrics that cross threshold values

Would you like me to dive deeper into any specific area? I can provide detailed breakdowns, compare time periods, or suggest specific action plans.`;
};

const categoryColors = {
  insight: { bg: 'bg-brand-light', border: 'border-brand/20', text: 'text-brand', icon: 'bg-brand-light' },
  action: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  summary: { bg: 'bg-violet-50', border: 'border-violet-200/60', text: 'text-violet-600', icon: 'bg-violet-100' },
  alert: { bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-600', icon: 'bg-amber-100' },
};

const moduleLabels: Record<ModuleContext, string> = {
  'overview': 'Overview',
  'campaigns': 'Campaigns',
  'meta-ads': 'Meta Ads',
  'google-ads': 'Google Ads',
  'creatives': 'Creatives',
  'website': 'Website',
  'sales': 'Sales',
  'accounts-overview': 'Financial Overview',
  'accounts-sales': 'Sales & Revenue',
  'accounts-expenses': 'Expenses',
  'accounts-profit-loss': 'Profit & Loss',
  'accounts-balance-sheet': 'Balance Sheet',
  'accounts-cashflow': 'Cash Flow',
  'accounts-receivables': 'Receivables',
  'accounts-payables': 'Payables',
  'accounts-ratios': 'Financial Ratios',
  'workspace': 'Task Management',
};

const moduleColorDot: Record<string, string> = {
  overview: 'bg-brand', campaigns: 'bg-amber-500', creatives: 'bg-pink-500',
  website: 'bg-emerald-500', sales: 'bg-orange-500', workspace: 'bg-indigo-500',
};
function getModuleDot(ctx: ModuleContext) {
  if (ctx.startsWith('accounts-')) return 'bg-brand';
  return moduleColorDot[ctx] || 'bg-gray-400';
}

// ─── Inline toast component ─────────────────────────────────────────
function ActionToast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-gray-900 text-white text-xs rounded-full shadow-xl"
          style={{ fontWeight: 500 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function BregoGPTDrawer({ isOpen, onClose, moduleContext }: BregoGPTDrawerProps) {
  // ─── Core state ──────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [view, setView] = useState<DrawerView>('home');
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Action feedback ─────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // ─── Speech-to-Text (STT) ───────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const sttSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ─── Refs ────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompts = getModulePrompts(moduleContext);

  // ─── Derived data ────────────────────────────────────────────────
  const recentItems = [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);
  const favoriteItems = history.filter(h => h.isFavorite).sort((a, b) => b.timestamp - a.timestamp);
  const favoritePromptIds = new Set(favoriteItems.map(f => f.promptId).filter(Boolean));
  const inChat = messages.length > 0;

  // ─── Setup STT ───────────────────────────────────────────────────
  useEffect(() => {
    if (!sttSupported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => { recognition.abort(); };
  }, [sttSupported]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // ─── Reset on open ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setInputValue('');
      setIsTyping(false);
      setView('home');
      setShowClearConfirm(false);
      setHistory(loadHistory());
      setCopiedId(null);
      setSpeakingId(null);
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    }
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, [isOpen, moduleContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ─── Toast helper ────────────────────────────────────────────────
  const flash = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  }, []);

  // ─── History helpers ─────────────────────────────────────────────
  const recordUsage = useCallback((promptId: string | null, promptText: string, label: string, ctx: ModuleContext) => {
    setHistory(prev => {
      const existing = prev.find(h => h.promptText === promptText);
      let updated: HistoryEntry[];
      if (existing) {
        updated = prev.map(h =>
          h.id === existing.id ? { ...h, useCount: h.useCount + 1, timestamp: Date.now(), moduleContext: ctx } : h
        );
      } else {
        updated = [{ id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, promptId, promptText, label, moduleContext: ctx, timestamp: Date.now(), isFavorite: false, useCount: 1 }, ...prev].slice(0, 100);
      }
      saveHistory(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((entryId: string) => {
    setHistory(prev => {
      const entry = prev.find(h => h.id === entryId);
      const updated = prev.map(h => h.id === entryId ? { ...h, isFavorite: !h.isFavorite } : h);
      saveHistory(updated);
      if (entry) flash(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      return updated;
    });
  }, [flash]);

  const toggleFavoriteByPromptId = useCallback((promptId: string, promptText: string, label: string) => {
    setHistory(prev => {
      const existing = prev.find(h => h.promptId === promptId);
      let updated: HistoryEntry[];
      if (existing) {
        updated = prev.map(h => h.id === existing.id ? { ...h, isFavorite: !h.isFavorite } : h);
        flash(existing.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        updated = [{ id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, promptId, promptText, label, moduleContext, timestamp: Date.now(), isFavorite: true, useCount: 0 }, ...prev];
        flash('Added to favorites');
      }
      saveHistory(updated);
      return updated;
    });
  }, [moduleContext, flash]);

  const toggleFavoriteByPromptText = useCallback((promptText: string, label: string, promptId: string | null) => {
    setHistory(prev => {
      const existing = prev.find(h => h.promptText === promptText);
      let updated: HistoryEntry[];
      if (existing) {
        updated = prev.map(h => h.id === existing.id ? { ...h, isFavorite: !h.isFavorite } : h);
        flash(existing.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        updated = [{ id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, promptId, promptText, label, moduleContext, timestamp: Date.now(), isFavorite: true, useCount: 0 }, ...prev];
        flash('Added to favorites');
      }
      saveHistory(updated);
      return updated;
    });
  }, [moduleContext, flash]);

  const deleteHistoryItem = useCallback((entryId: string) => {
    setDeletingId(entryId);
    setTimeout(() => {
      setHistory(prev => { const u = prev.filter(h => h.id !== entryId); saveHistory(u); return u; });
      setDeletingId(null);
    }, 250);
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
    setShowClearConfirm(false);
    flash('History cleared');
  }, [flash]);

  // ─── TTS ─────────────────────────────────────────────────────────
  const handleSpeak = useCallback((messageId: string, content: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speakingId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const text = stripMarkdown(content);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  }, [speakingId]);

  // ─── Copy ────────────────────────────────────────────────────────
  const handleCopy = useCallback((messageId: string, content: string) => {
    const text = stripMarkdown(content);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId);
      flash('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [flash]);

  // ─── Prompt execution ────────────────────────────────────────────
  const executePrompt = useCallback((promptText: string, promptId: string | null, label: string) => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date(),
      promptId,
      promptLabel: label,
    };

    setMessages(prev => [...prev, userMessage]);
    setView('chat');
    setIsTyping(true);
    recordUsage(promptId, promptText, label, moduleContext);

    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: getSimulatedResponse(moduleContext, promptId || 'generic'),
        timestamp: new Date(),
        promptId,
        promptLabel: label,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }, [moduleContext, recordUsage, isListening]);

  const handlePromptClick = useCallback((prompt: SuggestedPrompt) => {
    executePrompt(prompt.prompt, prompt.id, prompt.label);
  }, [executePrompt]);

  const handleHistoryRerun = useCallback((entry: HistoryEntry) => {
    executePrompt(entry.promptText, entry.promptId, entry.label);
  }, [executePrompt]);

  const handleRegenerate = useCallback((msg: Message) => {
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: getSimulatedResponse(moduleContext, msg.promptId || 'generic'),
        timestamp: new Date(),
        promptId: msg.promptId,
        promptLabel: msg.promptLabel,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 600);
  }, [moduleContext]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    const label = text.length > 40 ? text.slice(0, 40) + '...' : text;
    setInputValue('');
    executePrompt(text, null, label);
  }, [inputValue, executePrompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ─── Navigate back ──────────────────────────────────────────────
  const navigateBack = useCallback(() => {
    if (view === 'recent' || view === 'favorites') {
      setView(inChat ? 'chat' : 'home');
    } else if (view === 'chat') {
      setView('home');
      setMessages([]);
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
    }
  }, [view, inChat]);

  // ─── Markdown renderer ──────────────────────────────────────────
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('|') && line.endsWith('|')) return null;
      if (line.startsWith('•') || line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-1 my-0.5">
            <span className="text-brand flex-shrink-0 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: boldProcessed.replace(/^[•\-]\s*/, '') }} />
          </div>
        );
      }
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-2 ml-1 my-1">
            <span className="text-brand flex-shrink-0 w-5 text-right">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: boldProcessed.replace(/^\d+\.\s*/, '') }} />
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: boldProcessed }} className="my-0.5" />;
    });
  };

  // ─── Is a prompt favorited? ──────────────────────────────────────
  const isPromptFavorited = useCallback((promptText: string) => {
    return history.some(h => h.promptText === promptText && h.isFavorite);
  }, [history]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] max-w-[90vw] bg-white/95 backdrop-blur-2xl border-l border-gray-200/60 z-50 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}
          >
            {/* ─────── HEADER ─────── */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                {/* Left: back + title */}
                <div className="flex items-center gap-2.5">
                  {view !== 'home' && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={navigateBack}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  )}
                  <motion.div
                    className="w-9 h-9 bg-brand rounded-2xl flex items-center justify-center shadow-sm"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>BregoGPT</h2>
                    <p className="text-[13px] text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                      {view === 'recent' ? 'Recent Prompts' : view === 'favorites' ? 'Favorites' : `Analyzing ${moduleLabels[moduleContext]}`}
                    </p>
                  </div>
                </div>

                {/* Right: action icons + close */}
                <div className="flex items-center gap-1">
                  {/* Recent */}
                  <motion.button
                    onClick={() => setView(view === 'recent' ? (inChat ? 'chat' : 'home') : 'recent')}
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      view === 'recent' ? 'bg-brand-light text-brand' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Recent prompts"
                    aria-label="Recent prompts"
                  >
                    <History className="w-4 h-4" />
                    {recentItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand text-white rounded-full text-[8px] flex items-center justify-center" style={{ fontWeight: 700 }}>
                        {recentItems.length > 9 ? '9+' : recentItems.length}
                      </span>
                    )}
                  </motion.button>

                  {/* Favorites */}
                  <motion.button
                    onClick={() => setView(view === 'favorites' ? (inChat ? 'chat' : 'home') : 'favorites')}
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      view === 'favorites' ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Favorites"
                    aria-label="Favorites"
                  >
                    <Star className={`w-4 h-4 ${view === 'favorites' ? 'fill-amber-400' : ''}`} />
                    {favoriteItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[8px] flex items-center justify-center" style={{ fontWeight: 700 }}>
                        {favoriteItems.length > 9 ? '9+' : favoriteItems.length}
                      </span>
                    )}
                  </motion.button>

                  {/* Separator */}
                  <div className="w-px h-5 bg-gray-200 mx-1" />

                  {/* Close */}
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close BregoGPT"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* ─────── CONTENT AREA ─────── */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* === HOME / Suggested prompts === */}
                {view === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.15 }}
                    className="px-5 py-5"
                  >
                    {/* Context badge */}
                    <div className="mb-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-xs" style={{ fontWeight: 500 }}>
                        {moduleContext === 'workspace' ? <List className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
                        {moduleContext === 'workspace' ? 'Task Management Workspace' : `${moduleLabels[moduleContext]} Dashboard`}
                      </div>
                    </div>

                    {/* Greeting */}
                    <div className="mb-6">
                      <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
                        What would you like to know?
                      </h3>
                      <p className="text-sm text-gray-500">
                        Pick a prompt or ask me anything about your {moduleLabels[moduleContext].toLowerCase()} data.
                      </p>
                    </div>

                    {/* Prompt cards */}
                    <div className="space-y-2.5">
                      {prompts.map((prompt, index) => {
                        const colors = categoryColors[prompt.category];
                        const isFav = favoritePromptIds.has(prompt.id);
                        return (
                          <motion.div
                            key={prompt.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + index * 0.05, duration: 0.25 }}
                            className="relative group"
                          >
                            <motion.button
                              onClick={() => handlePromptClick(prompt)}
                              className={`w-full text-left p-4 rounded-2xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200`}
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-xl ${colors.icon} ${colors.text} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                  {prompt.icon}
                                </div>
                                <div className="flex-1 min-w-0 pr-7">
                                  <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{prompt.label}</span>
                                  <p className="text-xs text-gray-500 mt-0.5">{prompt.description}</p>
                                </div>
                              </div>
                            </motion.button>
                            {/* Star */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavoriteByPromptId(prompt.id, prompt.prompt, prompt.label); }}
                              className={`absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                isFav ? 'bg-amber-100 text-amber-500' : 'bg-white/60 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-amber-50'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* === CHAT VIEW === */}
                {view === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-5 py-5"
                  >
                    <div className="space-y-5">
                      {messages.map((message, idx) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* User bubble */}
                          {message.role === 'user' && (
                            <div className="flex justify-end">
                              <div className="bg-brand text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[360px] text-sm leading-relaxed shadow-sm">
                                {message.content}
                              </div>
                            </div>
                          )}

                          {/* Assistant bubble + action bar */}
                          {message.role === 'assistant' && (
                            <div className="space-y-1.5">
                              <div className="flex gap-3 max-w-full">
                                <div className="w-7 h-7 bg-brand rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                  <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-gray-50/80 rounded-2xl rounded-tl-md px-4 py-3 max-w-[380px] text-sm text-gray-800 leading-relaxed border border-gray-100/80">
                                  {renderContent(message.content)}
                                </div>
                              </div>

                              {/* ── Response Action Bar ── */}
                              <div className="ml-10 flex items-center gap-0.5">
                                {/* Copy */}
                                <motion.button
                                  onClick={() => handleCopy(message.id, message.content)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200 ${
                                    copiedId === message.id
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                                  }`}
                                  style={{ fontWeight: 500 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === message.id ? 'Copied' : 'Copy'}
                                </motion.button>

                                {/* Read Aloud / TTS */}
                                <motion.button
                                  onClick={() => handleSpeak(message.id, message.content)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200 ${
                                    speakingId === message.id
                                      ? 'bg-brand-light text-brand'
                                      : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                                  }`}
                                  style={{ fontWeight: 500 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {speakingId === message.id ? (
                                    <>
                                      <VolumeX className="w-3 h-3" />
                                      <span>Stop</span>
                                      <motion.span
                                        className="w-1.5 h-1.5 rounded-full bg-brand ml-0.5"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                      />
                                    </>
                                  ) : (
                                    <><Volume2 className="w-3 h-3" />Read Aloud</>
                                  )}
                                </motion.button>

                                {/* Favorite the prompt */}
                                {message.promptLabel && (
                                  <motion.button
                                    onClick={() => {
                                      // Find the user message that preceded this response
                                      const userMsg = messages[idx - 1];
                                      if (userMsg) toggleFavoriteByPromptText(userMsg.content, message.promptLabel || userMsg.content.slice(0, 40), message.promptId || null);
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200 ${
                                      isPromptFavorited(messages[idx - 1]?.content || '')
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                                    style={{ fontWeight: 500 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Star className={`w-3 h-3 ${isPromptFavorited(messages[idx - 1]?.content || '') ? 'fill-amber-400' : ''}`} />
                                    {isPromptFavorited(messages[idx - 1]?.content || '') ? 'Saved' : 'Save'}
                                  </motion.button>
                                )}

                                {/* Share as PDF — A&T reports only */}
                                {message.promptId && pdfExportPromptIds.has(message.promptId) && (
                                  <motion.button
                                    onClick={() => exportReportAsPDF(
                                      message.content,
                                      message.promptLabel || 'Financial Report',
                                      moduleLabels[moduleContext] || 'Accounts & Taxation'
                                    )}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200 text-gray-500 hover:text-[#204CC7] hover:bg-blue-50"
                                    style={{ fontWeight: 500 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Download className="w-3 h-3" />
                                    Share as PDF
                                  </motion.button>
                                )}

                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="w-7 h-7 bg-brand rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-100">
                            <div className="flex items-center gap-1.5">
                              {[0, 0.2, 0.4].map((d, i) => (
                                <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Follow-up prompts */}
                      {messages.length >= 2 && !isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className="pt-1"
                        >
                          <p className="text-[13px] text-gray-500 mb-2 ml-10" style={{ fontWeight: 500 }}>Suggested follow-ups</p>
                          <div className="ml-10 flex flex-wrap gap-2">
                            {prompts
                              .filter(p => !messages.some(m => m.content === p.prompt))
                              .slice(0, 2)
                              .map(prompt => (
                                <motion.button
                                  key={prompt.id}
                                  onClick={() => handlePromptClick(prompt)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-brand-light hover:border-brand/20 hover:text-brand transition-all"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {prompt.icon}
                                  <span>{prompt.label}</span>
                                </motion.button>
                              ))}
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </motion.div>
                )}

                {/* === RECENT VIEW === */}
                {view === 'recent' && (
                  <motion.div
                    key="recent"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.15 }}
                    className="px-5 py-5"
                  >
                    {recentItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                          <History className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-900 mb-1" style={{ fontWeight: 600 }}>No recent prompts</p>
                        <p className="text-xs text-gray-500 max-w-[220px]">Your prompt history will appear here after you start asking questions.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                            {recentItems.length} recent prompt{recentItems.length !== 1 ? 's' : ''}
                          </p>
                          {!showClearConfirm ? (
                            <button onClick={() => setShowClearConfirm(true)} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                              Clear all
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                              <span className="text-xs text-red-600">Clear all?</span>
                              <button onClick={clearAllHistory} className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors">Yes</button>
                              <button onClick={() => setShowClearConfirm(false)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs hover:bg-gray-200 transition-colors">No</button>
                            </motion.div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <AnimatePresence mode="popLayout">
                            {recentItems.map((entry, index) => (
                              <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: deletingId === entry.id ? 0 : 1, y: 0, x: deletingId === entry.id ? 60 : 0, scale: deletingId === entry.id ? 0.95 : 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                                transition={{ duration: 0.25, delay: deletingId ? 0 : index * 0.025 }}
                                className="group relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
                              >
                                <button onClick={() => handleHistoryRerun(entry)} className="w-full text-left p-3.5 pr-20">
                                  <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                      <div className={`w-2 h-2 rounded-full ${getModuleDot(entry.moduleContext)}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{entry.label}</p>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 rounded text-[10px] text-gray-500">{moduleLabels[entry.moduleContext]}</span>
                                        <span className="text-[10px] text-gray-400">{relativeTime(entry.timestamp)}</span>
                                        {entry.useCount > 1 && (
                                          <span className="inline-flex items-center gap-0.5 text-[10px] text-brand">
                                            <RotateCcw className="w-2.5 h-2.5" />{entry.useCount}x
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                {/* Actions */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(entry.id); }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${entry.isFavorite ? 'bg-amber-50 text-amber-500' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-amber-50'}`}>
                                    <Star className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-amber-400' : ''}`} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(entry.id); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                    aria-label="Delete conversation">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* === FAVORITES VIEW === */}
                {view === 'favorites' && (
                  <motion.div
                    key="favorites"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.15 }}
                    className="px-5 py-5"
                  >
                    {favoriteItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                          <Star className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-sm text-gray-900 mb-1" style={{ fontWeight: 600 }}>No favorites yet</p>
                        <p className="text-xs text-gray-500 max-w-[220px]">Star any prompt to save it here for quick access.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-4" style={{ fontWeight: 500 }}>
                          {favoriteItems.length} favorite{favoriteItems.length !== 1 ? 's' : ''} — tap to re-run
                        </p>
                        <div className="space-y-2">
                          <AnimatePresence mode="popLayout">
                            {favoriteItems.map((entry, index) => (
                              <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.25, delay: index * 0.04 }}
                                className="group relative"
                              >
                                <motion.button
                                  onClick={() => handleHistoryRerun(entry)}
                                  className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-orange-50/40 border border-amber-100/80 hover:shadow-md hover:border-amber-200 transition-all duration-200"
                                  whileHover={{ scale: 1.01, y: -1 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Star className="w-4 h-4 fill-amber-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                      <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{entry.label}</p>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/60 rounded text-[10px] text-gray-500">
                                          <span className={`w-1.5 h-1.5 rounded-full ${getModuleDot(entry.moduleContext)}`} />
                                          {moduleLabels[entry.moduleContext]}
                                        </span>
                                        {entry.useCount > 0 && (
                                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                                            <RotateCcw className="w-2.5 h-2.5" />Used {entry.useCount}x
                                          </span>
                                        )}
                                      </div>
                                      {entry.promptText !== entry.label && (
                                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{entry.promptText}</p>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(entry.id); }}
                                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100/50 text-amber-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                                  title="Remove from favorites"
                                  aria-label="Remove from favorites"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─────── INPUT AREA ─────── */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100/80 bg-white/80 backdrop-blur-sm">
              <div className={`flex items-center gap-2 bg-gray-50 border rounded-2xl px-4 py-2.5 transition-all duration-200 ${
                isListening ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand-light'
              }`}>
                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening...' : moduleContext === 'workspace' ? 'Ask anything about your tasks...' : 'Ask anything about your data...'}
                  className={`flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500 transition-colors duration-200 ${
                    isListening ? 'placeholder:text-red-400' : ''
                  }`}
                  disabled={isTyping}
                />

                {/* Smart Mic / Send swap — same as Chat AI module */}
                <div className="relative flex-shrink-0 w-9 h-9">
                  <AnimatePresence mode="wait">
                    {inputValue.trim() ? (
                      <motion.button
                        key="send"
                        onClick={handleSendMessage}
                        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.8 }}
                        whileTap={{ scale: 0.85 }}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-brand text-white shadow-sm"
                      >
                        <ArrowUp className="w-[18px] h-[18px]" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="mic"
                        onClick={toggleListening}
                        disabled={!sttSupported || isTyping}
                        initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.8 }}
                        whileTap={{ scale: 0.85 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                          isListening
                            ? 'bg-red-50 text-red-500 ring-2 ring-red-200 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        title={isListening ? 'Stop listening' : 'Voice input'}
                      >
                        {isListening ? (
                          <span className="relative flex items-center justify-center">
                            <motion.span
                              className="absolute w-7 h-7 rounded-full bg-red-400/20"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.span
                              className="absolute w-5 h-5 rounded-full bg-red-400/30"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <Mic className="w-[18px] h-[18px] relative z-10" />
                          </span>
                        ) : (
                          <Mic className="w-[18px] h-[18px]" />
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                BregoGPT can make mistakes. Verify important data.
              </p>
            </div>

            {/* Toast */}
            <ActionToast message={toastMsg} show={showToast} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
