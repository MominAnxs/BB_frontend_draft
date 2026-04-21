'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ChevronDown, ChevronRight, Plus, Folder, FolderOpen, MoreVertical,
  ArrowUpDown, MessageSquare, BarChart3, Briefcase, Database, Users, Clock,
  FileText, FileSpreadsheet, File, Upload, FolderPlus, Download, Trash2,
  Pencil, Star, StarOff, Copy, Move, Info, LayoutGrid, List, X, Check,
  Image as ImageIcon, ArrowUp, ArrowDown, HardDrive, Home, RotateCcw,
  AlertTriangle, Share2, CheckSquare, Square,
  Eye, ChevronLeft, Activity, ZoomIn, ZoomOut, History,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { UserInfo } from '../../types';
import { ProfileDropdown } from '../ProfileDropdown';
import { NotificationBell } from '../NotificationPanel';
import { BregoLogo } from '../BregoLogo';
import { NavTabs } from '../NavTabs';
import { useDataroom, FileVersion } from '../context/DataroomContext';
import { UploadDocumentModal } from '../upload/UploadDocumentModal';
import type { BusinessAccount } from '../business/BusinessAccountCard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DataroomProps {
  userInfo: UserInfo;
  onBack: () => void;
  onNavigateToChat: () => void;
  onNavigateToWorkspace?: () => void;
  onProfileSettings?: () => void;
  onInviteTeam?: () => void;
  onAddBusiness?: () => void;
  businessTypeLabel?: string;
  businessAccounts?: BusinessAccount[];
  activeAccountId?: string;
  onSwitchAccount?: (account: BusinessAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  notificationCounts?: Record<string, number>;
  /** Navigate directly to a folder on mount */
  initialFolderId?: string | null;
  initialService?: 'accounts' | 'performance';
}

type ItemType = 'folder' | 'pdf' | 'spreadsheet' | 'document' | 'image';

interface DriveItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  owner: string;
  ownerInitial: string;
  lastModified: string;
  fileSize: string;
  starred: boolean;
  service: 'accounts' | 'performance';
  sharedBy?: string;
  sharedByInitial?: string;
  versions?: FileVersion[];
}

interface TrashedItem extends DriveItem {
  deletedAt: string;
  originalParentId: string | null;
}

interface ActivityEntry {
  id: string;
  action: 'upload' | 'rename' | 'star' | 'unstar' | 'delete' | 'restore' | 'move' | 'create' | 'download' | 'share';
  itemName: string;
  itemType: ItemType;
  user: string;
  userInitial: string;
  timestamp: Date;
  detail?: string;
}

type SortField = 'name' | 'lastModified' | 'fileSize';
type SortDir = 'asc' | 'desc';
type ViewMode = 'list' | 'grid';
type SidebarView = 'drive' | 'starred' | 'recent' | 'trash' | 'shared';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRAND = '#204CC7';

let _uid = 0;
const uid = () => `dr-${++_uid}`;

function getFileIcon(type: ItemType) {
  switch (type) {
    case 'folder': return Folder;
    case 'pdf': return FileText;
    case 'spreadsheet': return FileSpreadsheet;
    case 'document': return File;
    case 'image': return ImageIcon;
    default: return File;
  }
}

function getFileIconColor(type: ItemType) {
  switch (type) {
    case 'folder': return 'text-gray-400';
    case 'pdf': return 'text-red-400';
    case 'spreadsheet': return 'text-green-500';
    case 'document': return 'text-blue-400';
    case 'image': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

function parseFileSize(s: string): number {
  if (s === '—') return 0;
  const n = parseFloat(s);
  if (s.includes('GB')) return n * 1024 * 1024;
  if (s.includes('MB')) return n * 1024;
  return n;
}

function nowDate() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildSharedItems(): DriveItem[] {
  return [
    { id: uid(), name: 'Q3 Tax Filing Summary.pdf', type: 'pdf', parentId: null, owner: 'Priya Sharma', ownerInitial: 'P', lastModified: 'Feb 18, 2026', fileSize: '1.4 MB', starred: false, service: 'accounts', sharedBy: 'Priya Sharma', sharedByInitial: 'P' },
    { id: uid(), name: 'GST Compliance Checklist.xlsx', type: 'spreadsheet', parentId: null, owner: 'Rahul Mehta', ownerInitial: 'R', lastModified: 'Feb 10, 2026', fileSize: '340 KB', starred: false, service: 'accounts', sharedBy: 'Rahul Mehta', sharedByInitial: 'R' },
    { id: uid(), name: 'Annual Financial Report FY25.pdf', type: 'pdf', parentId: null, owner: 'Anita Desai', ownerInitial: 'A', lastModified: 'Jan 28, 2026', fileSize: '4.2 MB', starred: true, service: 'accounts', sharedBy: 'Anita Desai', sharedByInitial: 'A' },
    { id: uid(), name: 'Vendor Payment Tracker.xlsx', type: 'spreadsheet', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Jan 15, 2026', fileSize: '890 KB', starred: false, service: 'accounts', sharedBy: 'Vikram Singh', sharedByInitial: 'V' },
    { id: uid(), name: 'Client Reports Archive', type: 'folder', parentId: null, owner: 'Priya Sharma', ownerInitial: 'P', lastModified: 'Dec 20, 2025', fileSize: '—', starred: false, service: 'accounts', sharedBy: 'Priya Sharma', sharedByInitial: 'P' },
    { id: uid(), name: 'Campaign ROI Analysis - Q4.xlsx', type: 'spreadsheet', parentId: null, owner: 'Neha Kapoor', ownerInitial: 'N', lastModified: 'Feb 14, 2026', fileSize: '2.1 MB', starred: false, service: 'performance', sharedBy: 'Neha Kapoor', sharedByInitial: 'N' },
    { id: uid(), name: 'Social Media Calendar 2026.xlsx', type: 'spreadsheet', parentId: null, owner: 'Arjun Patel', ownerInitial: 'A', lastModified: 'Feb 5, 2026', fileSize: '560 KB', starred: true, service: 'performance', sharedBy: 'Arjun Patel', sharedByInitial: 'A' },
    { id: uid(), name: 'Brand Guidelines v3.pdf', type: 'pdf', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Jan 22, 2026', fileSize: '8.5 MB', starred: false, service: 'performance', sharedBy: 'Neha Kapoor', sharedByInitial: 'N' },
    { id: uid(), name: 'Competitor Benchmark Report.pdf', type: 'pdf', parentId: null, owner: 'Arjun Patel', ownerInitial: 'A', lastModified: 'Jan 10, 2026', fileSize: '3.7 MB', starred: false, service: 'performance', sharedBy: 'Arjun Patel', sharedByInitial: 'A' },
  ];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ContextMenu({ x, y, item, onClose, onAction, isTrash }: {
  x: number; y: number; item: DriveItem; onClose: () => void;
  onAction: (action: string, item: DriveItem) => void; isTrash?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const adjustedY = Math.min(y, window.innerHeight - 320);
  const adjustedX = Math.min(x, window.innerWidth - 220);

  const trashMenu = [
    { id: 'restore', label: 'Restore', icon: RotateCcw },
    { id: 'divider', label: '', icon: null },
    { id: 'delete-forever', label: 'Delete forever', icon: Trash2 },
  ];
  const normalMenu = [
    ...(item.type === 'folder' ? [{ id: 'open', label: 'Open', icon: FolderOpen }] : []),
    ...(item.type !== 'folder' ? [{ id: 'preview', label: 'Preview', icon: Eye }] : []),
    ...(item.type !== 'folder' ? [{ id: 'download', label: 'Download', icon: Download }] : []),
    { id: 'rename', label: 'Rename', icon: Pencil },
    { id: 'star', label: item.starred ? 'Remove from Starred' : 'Add to Starred', icon: item.starred ? StarOff : Star },
    { id: 'divider', label: '', icon: null },
    { id: 'copy', label: 'Make a copy', icon: Copy },
    { id: 'move', label: 'Move to', icon: Move },
    { id: 'divider2', label: '', icon: null },
    { id: 'info', label: 'File information', icon: Info },
    { id: 'divider3', label: '', icon: null },
    { id: 'delete', label: 'Move to trash', icon: Trash2 },
  ];

  const menuItems = isTrash ? trashMenu : normalMenu;

  return createPortal(
    <div ref={ref} className="fixed bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 w-56 z-[9999]"
      style={{ top: adjustedY, left: adjustedX, animation: 'filterDropIn 0.15s ease-out' }}>
      {menuItems.map((mi, i) => {
        if (mi.id.startsWith('divider')) return <div key={i} className="my-1 border-t border-gray-100" />;
        const Icon = mi.icon!;
        const isDanger = mi.id === 'delete' || mi.id === 'delete-forever';
        return (
          <button key={mi.id} onClick={() => { onAction(mi.id, item); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Icon className="w-4 h-4 flex-shrink-0" /><span>{mi.label}</span>
          </button>
        );
      })}
    </div>, document.body
  );
}

function NewItemDropdown({ onClose, onCreate }: { onClose: () => void; onCreate: (type: 'folder' | 'upload') => void; }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 w-52 z-50" style={{ animation: 'filterDropIn 0.15s ease-out' }}>
      <button onClick={() => { onCreate('folder'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><FolderPlus className="w-4 h-4 text-gray-400" /><span>New folder</span></button>
      <div className="my-1 border-t border-gray-100" />
      <button onClick={() => { onCreate('upload'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Upload className="w-4 h-4 text-gray-400" /><span>File upload</span></button>
    </div>
  );
}

function RenameModal({ item, onClose, onRename }: { item: DriveItem; onClose: () => void; onRename: (id: string, n: string) => void; }) {
  const [value, setValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.select(); }, []);
  const submit = () => { if (value.trim() && value.trim() !== item.name) onRename(item.id, value.trim()); onClose(); };
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-[400px] overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100"><h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>Rename</h3></div>
        <div className="px-6 py-5"><input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" /></div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" style={{ fontWeight: 500 }}>Cancel</button>
          <button onClick={submit} className="px-5 py-2 text-sm text-white rounded-lg hover:opacity-90" style={{ backgroundColor: BRAND, fontWeight: 600 }}>OK</button>
        </div>
      </motion.div>
    </div>, document.body
  );
}

function NewFolderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void; }) {
  const [value, setValue] = useState('Untitled folder');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.select(); }, []);
  const submit = () => { if (value.trim()) onCreate(value.trim()); onClose(); };
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-[400px] overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100"><h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>New folder</h3></div>
        <div className="px-6 py-5"><input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" /></div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" style={{ fontWeight: 500 }}>Cancel</button>
          <button onClick={submit} className="px-5 py-2 text-sm text-white rounded-lg hover:opacity-90" style={{ backgroundColor: BRAND, fontWeight: 600 }}>Create</button>
        </div>
      </motion.div>
    </div>, document.body
  );
}

function ConfirmModal({ title, message, confirmLabel, danger, onClose, onConfirm }: {
  title: string; message: string; confirmLabel: string; danger?: boolean; onClose: () => void; onConfirm: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-[420px] overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          {danger && <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
          <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        </div>
        <div className="px-6 py-5"><p className="text-sm text-gray-600">{message}</p></div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" style={{ fontWeight: 500 }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`px-5 py-2 text-sm text-white rounded-lg hover:opacity-90 ${danger ? 'bg-red-600' : ''}`}
            style={danger ? { fontWeight: 600 } : { backgroundColor: BRAND, fontWeight: 600 }}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>, document.body
  );
}

function FileInfoPanel({ item, onClose, itemCount, locationPath }: { item: DriveItem; onClose: () => void; itemCount?: number; locationPath?: string; }) {
  const Icon = getFileIcon(item.type);
  return (
    <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg" aria-label="Close version history"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="w-full h-40 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
          <Icon className={`w-16 h-16 ${getFileIconColor(item.type)} opacity-50`} />
        </div>
        <div className="space-y-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Details</h4>
          <div className="space-y-3">
            {[
              ['Type', item.type === 'folder' ? 'Folder' : item.type.toUpperCase()],
              ...(item.type === 'folder' && itemCount !== undefined ? [['Items', String(itemCount)]] : []),
              ['Size', item.fileSize], ['Owner', item.owner], ['Modified', item.lastModified],
              ...(item.sharedBy ? [['Shared by', item.sharedBy]] : []),
              ['Location', locationPath || 'Dataroom'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 text-right max-w-[140px] truncate" style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version History */}
        {item.versions && item.versions.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Version History</h4>
              <span className="text-[10px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{item.versions.length + 1} versions</span>
            </div>

            {/* Current version */}
            <div className="flex items-start gap-3 px-3 py-2.5 bg-brand-light rounded-lg border border-brand/10">
              <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-900" style={{ fontWeight: 600 }}>Current version</p>
                <p className="text-[13px] text-gray-500">{item.fileSize} · {item.lastModified}</p>
                <p className="text-[10px] text-gray-400">by {item.owner}</p>
              </div>
            </div>

            {/* Previous versions */}
            {item.versions.map((ver, idx) => (
              <div key={idx} className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[8px] text-gray-500" style={{ fontWeight: 700 }}>{item.versions!.length - idx}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-600" style={{ fontWeight: 500 }}>Version {item.versions!.length - idx}</p>
                  <p className="text-[13px] text-gray-500">{ver.fileSize} · {ver.uploadedAt}</p>
                  <p className="text-[10px] text-gray-400">by {ver.uploadedBy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StorageMeter({ usedGB, totalGB }: { usedGB: number; totalGB: number }) {
  const pct = Math.min((usedGB / totalGB) * 100, 100);
  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : BRAND;
  return (
    <div className="px-4 py-4 border-t border-gray-200/40">
      <div className="flex items-center gap-2 mb-2.5"><HardDrive className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>Storage</span></div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
      <p className="text-[13px] text-gray-500"><span style={{ fontWeight: 600, color: '#1f2937' }}>{usedGB.toFixed(1)} GB</span> of {totalGB} GB used</p>
    </div>
  );
}

function DragOverlay({ itemName }: { itemName: string }) {
  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none" style={{ animation: 'filterDropIn 0.15s ease-out' }}>
      <div className="bg-gray-900/90 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-2">
        <Move className="w-3.5 h-3.5" /><span>Moving "<span style={{ fontWeight: 600 }}>{itemName}</span>" — drop on a folder</span>
      </div>
    </div>, document.body
  );
}

// ─── Batch Action Toolbar ────────────────────────────────────────────────────

function BatchToolbar({ count, onStar, onTrash, onDownload, onClear }: {
  count: number; onStar: () => void; onTrash: () => void; onDownload: () => void; onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-5 py-3 flex items-center gap-4"
        style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-400" />
          <span className="text-sm" style={{ fontWeight: 600 }}>{count} selected</span>
        </div>
        <div className="w-px h-5 bg-white/20" />
        <button onClick={onStar} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm" style={{ fontWeight: 500 }}>
          <Star className="w-4 h-4" /> Star
        </button>
        <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm" style={{ fontWeight: 500 }}>
          <Download className="w-4 h-4" /> Download
        </button>
        <button onClick={onTrash} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors text-sm" style={{ fontWeight: 500 }}>
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Clear selection"><X className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
}

// ─── Folder Tree ─────────────────────────────────────────────────────────────

function FolderTreeNode({ item, items, currentFolderId, depth, onNavigate, expandedIds, onToggle }: {
  item: DriveItem; items: DriveItem[]; currentFolderId: string | null;
  depth: number; onNavigate: (id: string) => void; expandedIds: Set<string>; onToggle: (id: string) => void;
}) {
  const children = items.filter(i => i.parentId === item.id && i.type === 'folder');
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isActive = currentFolderId === item.id;
  return (
    <div>
      <div onClick={() => onNavigate(item.id)} role="button" tabIndex={0}
        className={`w-full flex items-center gap-1 py-1 rounded-md text-xs transition-colors group cursor-pointer ${isActive ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50'}`}
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: '6px', fontWeight: isActive ? 500 : 400 }}>
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0">
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        ) : <span className="w-4 flex-shrink-0" />}
        <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand' : 'text-gray-400'}`} />
        <span className="truncate ml-0.5">{item.name}</span>
      </div>
      {isExpanded && hasChildren && children.sort((a, b) => a.name.localeCompare(b.name)).map(child => (
        <FolderTreeNode key={child.id} item={child} items={items} currentFolderId={currentFolderId}
          depth={depth + 1} onNavigate={onNavigate} expandedIds={expandedIds} onToggle={onToggle} />
      ))}
    </div>
  );
}

function FolderTree({ items, service, currentFolderId, onNavigate }: {
  items: DriveItem[]; service: 'accounts' | 'performance'; currentFolderId: string | null; onNavigate: (id: string) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!currentFolderId) return;
    const toExpand = new Set<string>();
    let id: string | null = currentFolderId;
    while (id) {
      const item = items.find(i => i.id === id);
      if (item) { toExpand.add(item.id); id = item.parentId; } else break;
    }
    if (toExpand.size > 0) setExpandedIds(prev => { const n = new Set(prev); toExpand.forEach(x => n.add(x)); return n; });
  }, [currentFolderId, items]);

  const onToggle = useCallback((id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const rootFolders = items.filter(i => i.parentId === null && i.type === 'folder' && i.service === service);
  if (rootFolders.length === 0) return null;
  return (
    <div className="space-y-0.5">
      {rootFolders.sort((a, b) => a.name.localeCompare(b.name)).map(f => (
        <FolderTreeNode key={f.id} item={f} items={items} currentFolderId={currentFolderId}
          depth={0} onNavigate={onNavigate} expandedIds={expandedIds} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ─── File Preview Modal ──────────────────────────────────────────────────────

const PDF_MOCK_LINES = [
  'FINANCIAL STATEMENT — FY 2025-26',
  '',
  '1. Overview',
  'This document contains the consolidated financial',
  'statements for the fiscal year ending March 2026.',
  '',
  '2. Revenue Summary',
  '   Q1 Revenue: ₹12,45,000',
  '   Q2 Revenue: ₹15,80,000',
  '   Q3 Revenue: ₹18,20,000',
  '   Q4 Revenue (Projected): ₹21,50,000',
  '',
  '3. Expense Breakdown',
  '   Operational Costs: ₹28,40,000',
  '   Marketing Spend: ₹8,60,000',
  '   Employee Compensation: ₹22,10,000',
  '',
  '4. Net Profit: ₹8,95,000',
  '',
  'Prepared by: Brego Business Accounts Team',
  'Date: Feb 24, 2026',
];

const SPREADSHEET_MOCK = [
  ['Month', 'Revenue', 'Expenses', 'Net Profit', 'Growth %'],
  ['April', '₹12,45,000', '₹9,80,000', '₹2,65,000', '—'],
  ['May', '₹13,10,000', '₹10,20,000', '₹2,90,000', '+9.4%'],
  ['June', '₹14,80,000', '₹11,50,000', '₹3,30,000', '+13.8%'],
  ['July', '₹15,20,000', '₹11,80,000', '₹3,40,000', '+3.0%'],
  ['August', '₹16,90,000', '₹12,40,000', '₹4,50,000', '+32.4%'],
  ['September', '₹18,20,000', '₹13,60,000', '₹4,60,000', '+2.2%'],
  ['October', '₹19,50,000', '₹14,20,000', '₹5,30,000', '+15.2%'],
  ['November', '₹20,10,000', '₹14,80,000', '₹5,30,000', '0%'],
  ['December', '₹21,50,000', '₹15,40,000', '₹6,10,000', '+15.1%'],
];

function FilePreviewModal({ item, onClose, siblings, onNavigate }: {
  item: DriveItem; onClose: () => void; siblings: DriveItem[]; onNavigate: (item: DriveItem) => void;
}) {
  const [zoom, setZoom] = useState(100);
  const currentIdx = siblings.findIndex(s => s.id === item.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < siblings.length - 1;
  const Icon = getFileIcon(item.type);
  const iconColor = getFileIconColor(item.type);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(siblings[currentIdx - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(siblings[currentIdx + 1]);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, hasPrev, hasNext, currentIdx, siblings, onNavigate]);

  const renderContent = () => {
    switch (item.type) {
      case 'pdf':
        return (
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto p-10 space-y-0" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            {PDF_MOCK_LINES.map((line, i) => (
              <p key={i} className={`${line === '' ? 'h-4' : ''} text-sm text-gray-800`}
                style={{ fontWeight: line.startsWith('FINANCIAL') ? 700 : line.match(/^\d\./) ? 600 : 400, fontSize: line.startsWith('FINANCIAL') ? '16px' : '13px' }}>
                {line}
              </p>
            ))}
          </div>
        );
      case 'spreadsheet':
        return (
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-auto overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 border-b border-green-200">
                  {SPREADSHEET_MOCK[0].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-green-800" style={{ fontWeight: 600, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPREADSHEET_MOCK.slice(1).map((row, ri) => (
                  <tr key={ri} className={`border-b border-gray-100 ${ri % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-gray-700" style={{ fontWeight: ci === 0 ? 500 : 400, fontSize: '12px' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'image':
        return (
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-auto p-1 overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <div className="aspect-video bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-purple-300 mx-auto mb-3" />
                <p className="text-sm text-purple-400" style={{ fontWeight: 500 }}>Image Preview</p>
                <p className="text-xs text-purple-300 mt-1">{item.name}</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto p-10" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-6" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        );
    }
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[9998] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close preview"><X className="w-5 h-5 text-white" /></button>
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="text-white text-sm" style={{ fontWeight: 500 }}>{item.name}</span>
          <span className="text-white/50 text-xs">{item.fileSize}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-lg">
            <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-1.5 hover:bg-white/10 rounded-l-lg transition-colors" aria-label="Zoom out"><ZoomOut className="w-4 h-4 text-white" /></button>
            <span className="text-xs text-white/70 px-2" style={{ fontWeight: 500 }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1.5 hover:bg-white/10 rounded-r-lg transition-colors" aria-label="Zoom in"><ZoomIn className="w-4 h-4 text-white" /></button>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => toast.success(`Downloading ${item.name}...`)}>
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center overflow-auto py-8 px-4 relative">
        {/* Prev */}
        {hasPrev && (
          <button onClick={() => onNavigate(siblings[currentIdx - 1])}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm z-10"
            aria-label="Previous file">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {renderContent()}
        {/* Next */}
        {hasNext && (
          <button onClick={() => onNavigate(siblings[currentIdx + 1])}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm z-10"
            aria-label="Next file">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Footer nav */}
      {siblings.length > 1 && (
        <div className="flex items-center justify-center py-3 bg-black/40 backdrop-blur-sm">
          <span className="text-xs text-white/50">{currentIdx + 1} of {siblings.length} files</span>
        </div>
      )}
    </motion.div>, document.body
  );
}

// ─── Activity Log Panel ──────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  upload: 'uploaded', rename: 'renamed', star: 'starred', unstar: 'unstarred',
  delete: 'deleted', restore: 'restored', move: 'moved', create: 'created',
  download: 'downloaded', share: 'shared',
};

const ACTION_COLORS: Record<string, string> = {
  upload: 'bg-green-100 text-green-600', rename: 'bg-blue-100 text-blue-600',
  star: 'bg-amber-100 text-amber-600', unstar: 'bg-gray-100 text-gray-600',
  delete: 'bg-red-100 text-red-600', restore: 'bg-emerald-100 text-emerald-600',
  move: 'bg-purple-100 text-purple-600', create: 'bg-cyan-100 text-cyan-600',
  download: 'bg-indigo-100 text-indigo-600', share: 'bg-pink-100 text-pink-600',
};

function ActivityLogPanel({ entries, onClose }: { entries: ActivityEntry[]; onClose: () => void }) {
  const formatTime = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Activity</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg" aria-label="Close activity log"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <Activity className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>No activity yet</p>
            <p className="text-xs text-gray-400 mt-1">Actions you take will appear here</p>
          </div>
        ) : (
          <div className="py-2">
            {entries.map(entry => {
              const Icon = getFileIcon(entry.itemType);
              const colorClass = ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-600';
              return (
                <div key={entry.id} className="px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span style={{ fontWeight: 600 }}>{entry.user}</span>
                        <span className="text-gray-500"> {ACTION_LABELS[entry.action] || entry.action} </span>
                        <span className="text-gray-900" style={{ fontWeight: 500 }}>"{entry.itemName}"</span>
                      </p>
                      {entry.detail && <p className="text-xs text-gray-400 mt-0.5">{entry.detail}</p>}
                      <p className="text-[13px] text-gray-500 mt-1">{formatTime(entry.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Initial activity entries ────────────────────────────────────────────────

function buildInitialActivity(): ActivityEntry[] {
  const now = Date.now();
  return [
    { id: 'a1', action: 'upload', itemName: 'GSTR-1 Filing.pdf', itemType: 'pdf', user: 'Brego Business', userInitial: 'B', timestamp: new Date(now - 3600000 * 2), detail: 'Uploaded to Tax > GST > April' },
    { id: 'a2', action: 'create', itemName: 'FY 2025-26', itemType: 'folder', user: 'Brego Business', userInitial: 'B', timestamp: new Date(now - 3600000 * 5) },
    { id: 'a3', action: 'share', itemName: 'Q3 Tax Filing Summary.pdf', itemType: 'pdf', user: 'Priya Sharma', userInitial: 'P', timestamp: new Date(now - 86400000) },
    { id: 'a4', action: 'upload', itemName: 'Meta Ads Report - Nov 2024.pdf', itemType: 'pdf', user: 'Brego Business', userInitial: 'B', timestamp: new Date(now - 86400000 * 2), detail: 'Uploaded to Stock Reports' },
    { id: 'a5', action: 'rename', itemName: 'Expense Report - Feb 2026.xlsx', itemType: 'spreadsheet', user: 'Brego Business', userInitial: 'B', timestamp: new Date(now - 86400000 * 3), detail: 'Renamed from "Expense Report.xlsx"' },
    { id: 'a6', action: 'star', itemName: 'Annual Financial Report FY25.pdf', itemType: 'pdf', user: 'You', userInitial: 'U', timestamp: new Date(now - 86400000 * 4) },
    { id: 'a7', action: 'download', itemName: 'Bank Reconciliation.xlsx', itemType: 'spreadsheet', user: 'You', userInitial: 'U', timestamp: new Date(now - 86400000 * 5) },
  ];
}

// ─── Main Component ────────────────────────────────────────────────────────

export function Dataroom({ userInfo, onBack, onNavigateToChat, onNavigateToWorkspace, onProfileSettings, onInviteTeam, onAddBusiness, businessTypeLabel, businessAccounts, activeAccountId, onSwitchAccount, onDeleteAccount, notificationCounts, initialFolderId = null, initialService }: DataroomProps) {
  const { items, setItems } = useDataroom();
  const [sharedItems] = useState<DriveItem[]>(() => buildSharedItems());
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([]);
  const [selectedService, setSelectedService] = useState<'performance' | 'accounts'>(initialService || 'accounts');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<'all' | 'me' | 'brego'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarView, setSidebarView] = useState<SidebarView>('drive');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: DriveItem } | null>(null);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [renameItem, setRenameItem] = useState<DriveItem | null>(null);
  const [infoItem, setInfoItem] = useState<DriveItem | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [showDeleteForeverConfirm, setShowDeleteForeverConfirm] = useState<DriveItem | null>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  // Drag-and-drop
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // File preview
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);

  // Activity log
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(() => buildInitialActivity());
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Upload Document Modal (unified system)
  const [showUploadModal, setShowUploadModal] = useState(false);

  const dragItem = dragItemId ? items.find(i => i.id === dragItemId) : null;
  const multiSelectActive = selectedIds.size > 1;

  const storageUsed = useMemo(() => items.reduce((sum, i) => sum + parseFileSize(i.fileSize), 0) / (1024 * 1024), [items]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) setShowServiceDropdown(false); };
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape to clear multi-select or close preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (previewItem) setPreviewItem(null); else setSelectedIds(new Set()); } };
    document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler);
  }, [previewItem]);

  const userDisplayName = `${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim();
  const userInitial = (userInfo.firstName?.charAt(0) || userInfo.lastName?.charAt(0) || 'U').toUpperCase();

  const addActivity = useCallback((action: ActivityEntry['action'], itemName: string, itemType: ItemType, detail?: string) => {
    setActivityLog(prev => [{
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action, itemName, itemType,
      user: userDisplayName || 'You',
      userInitial,
      timestamp: new Date(), detail,
    }, ...prev]);
  }, [userDisplayName, userInitial]);

  const getLocationPath = useCallback((itemId: string): string => {
    const parts: string[] = [];
    let id: string | null = items.find(i => i.id === itemId)?.parentId ?? null;
    while (id) { const item = items.find(i => i.id === id); if (item) { parts.unshift(item.name); id = item.parentId; } else break; }
    parts.unshift(selectedService === 'accounts' ? 'Accounts & Taxation' : 'Performance Marketing');
    return parts.join(' / ');
  }, [items, selectedService]);

  const breadcrumbs = useMemo(() => {
    const path: DriveItem[] = [];
    let id = currentFolderId;
    while (id) { const item = items.find(i => i.id === id); if (item) { path.unshift(item); id = item.parentId; } else break; }
    return path;
  }, [currentFolderId, items]);

  const serviceTrash = useMemo(() =>
    trashedItems.filter(i => i.service === selectedService).sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()),
    [trashedItems, selectedService]
  );

  // Visible items
  const visibleItems = useMemo(() => {
    if (sidebarView === 'trash') return [];

    if (sidebarView === 'shared') {
      let filtered = sharedItems.filter(i => i.service === selectedService);
      if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(i => i.name.toLowerCase().includes(q)); }
      filtered.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      return filtered;
    }

    if (sidebarView === 'starred') {
      let filtered = items.filter(i => i.starred && i.service === selectedService);
      if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(i => i.name.toLowerCase().includes(q)); }
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      return filtered;
    }

    if (sidebarView === 'recent') {
      let filtered = items.filter(i => i.type !== 'folder' && i.service === selectedService);
      if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(i => i.name.toLowerCase().includes(q)); }
      filtered.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      return filtered.slice(0, 25);
    }

    let filtered = items.filter(i => i.parentId === currentFolderId && i.service === selectedService);
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = items.filter(i => i.service === selectedService && i.name.toLowerCase().includes(q)); }
    if (selectedOwner === 'me') filtered = filtered.filter(i => i.owner !== 'Brego Business');
    else if (selectedOwner === 'brego') filtered = filtered.filter(i => i.owner === 'Brego Business');

    filtered.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'lastModified') cmp = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      else if (sortField === 'fileSize') cmp = parseFileSize(a.fileSize) - parseFileSize(b.fileSize);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return filtered;
  }, [items, sharedItems, currentFolderId, selectedService, searchQuery, selectedOwner, sortField, sortDir, sidebarView]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-brand" /> : <ArrowDown className="w-3 h-3 text-brand" />;
  };

  const clearSelection = () => { setSelectedIds(new Set()); setLastClickedId(null); };

  const navigateToFolder = (id: string | null) => {
    setCurrentFolderId(id); clearSelection(); setInfoItem(null); setSearchQuery(''); setSidebarView('drive');
  };

  // ─── Multi-select click handler ────────────────────────────────────────────

  const handleItemClick = useCallback((e: React.MouseEvent, item: DriveItem) => {
    const isCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    if (isCtrl) {
      // Toggle individual item
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
        return next;
      });
      setLastClickedId(item.id);
    } else if (isShift && lastClickedId) {
      // Range select
      const ids = visibleItems.map(i => i.id);
      const startIdx = ids.indexOf(lastClickedId);
      const endIdx = ids.indexOf(item.id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [lo, hi] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = ids.slice(lo, hi + 1);
        setSelectedIds(prev => {
          const next = new Set(prev);
          rangeIds.forEach(id => next.add(id));
          return next;
        });
      }
    } else {
      // Normal click — single select
      setSelectedIds(new Set([item.id]));
      setLastClickedId(item.id);
    }
  }, [lastClickedId, visibleItems]);

  const handleItemDoubleClick = (item: DriveItem) => {
    if (sidebarView === 'trash') return;
    if (item.type === 'folder') navigateToFolder(item.id);
    else setPreviewItem(item);
  };

  const handleContextMenu = (e: React.MouseEvent, item: DriveItem) => {
    e.preventDefault();
    // If right-clicking an unselected item, select just that item
    if (!selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
      setLastClickedId(item.id);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === visibleItems.length) clearSelection();
    else setSelectedIds(new Set(visibleItems.map(i => i.id)));
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, item: DriveItem) => {
    setDragItemId(item.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.id);
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
  }, []);
  const handleDragEnd = useCallback((e: React.DragEvent) => { setDragItemId(null); setDropTargetId(null); if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1'; }, []);
  const handleDragOver = useCallback((e: React.DragEvent, t: DriveItem) => { if (t.type !== 'folder' || t.id === dragItemId) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTargetId(t.id); }, [dragItemId]);
  const handleDragLeave = useCallback(() => setDropTargetId(null), []);

  const handleDrop = useCallback((e: React.DragEvent, targetFolder: DriveItem) => {
    e.preventDefault(); setDropTargetId(null);
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetFolder.id) return;
    const sourceItem = items.find(i => i.id === sourceId);
    if (!sourceItem) return;
    if (sourceItem.type === 'folder') {
      let cid: string | null = targetFolder.id;
      while (cid) { if (cid === sourceId) { toast.error("Can't move a folder into itself"); setDragItemId(null); return; } cid = items.find(i => i.id === cid)?.parentId ?? null; }
    }
    const oldP = sourceItem.parentId;
    setItems(prev => prev.map(i => i.id === sourceId ? { ...i, parentId: targetFolder.id, lastModified: nowDate() } : i));
    toast(`Moved "${sourceItem.name}" to "${targetFolder.name}"`, { action: { label: 'Undo', onClick: () => setItems(prev => prev.map(i => i.id === sourceId ? { ...i, parentId: oldP } : i)) } });
    addActivity('move', sourceItem.name, sourceItem.type, `Moved to "${targetFolder.name}"`);
    setDragItemId(null);
  }, [items, addActivity]);

  const handleDropOnBackground = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDropTargetId(null);
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId) return;
    const sourceItem = items.find(i => i.id === sourceId);
    if (!sourceItem || sourceItem.parentId === currentFolderId) return;
    const oldP = sourceItem.parentId;
    setItems(prev => prev.map(i => i.id === sourceId ? { ...i, parentId: currentFolderId, lastModified: nowDate() } : i));
    const fn = currentFolderId ? items.find(i => i.id === currentFolderId)?.name || 'current folder' : 'root';
    toast(`Moved "${sourceItem.name}" to ${fn}`, { action: { label: 'Undo', onClick: () => setItems(prev => prev.map(i => i.id === sourceId ? { ...i, parentId: oldP } : i)) } });
    setDragItemId(null);
  }, [items, currentFolderId]);

  // ─── Trash ────────────────────────────────────────────────────────────────

  const moveToTrash = useCallback((item: DriveItem) => {
    const ids = new Set<string>();
    const collect = (id: string) => { ids.add(id); items.filter(i => i.parentId === id).forEach(c => collect(c.id)); };
    collect(item.id);
    const removed = items.filter(i => ids.has(i.id));
    setItems(prev => prev.filter(i => !ids.has(i.id)));
    setTrashedItems(prev => [...prev, ...removed.map(i => ({ ...i, deletedAt: nowDate(), originalParentId: i.parentId }))]);
    toast(`"${item.name}" moved to trash`, { action: { label: 'Undo', onClick: () => { setTrashedItems(prev => prev.filter(t => !ids.has(t.id))); setItems(prev => [...prev, ...removed]); } } });
  }, [items]);

  const moveMultipleToTrash = useCallback(() => {
    const idsSet = new Set(selectedIds);
    // Expand to include descendants of selected folders
    const allIds = new Set<string>();
    const collect = (id: string) => { allIds.add(id); items.filter(i => i.parentId === id).forEach(c => collect(c.id)); };
    idsSet.forEach(id => collect(id));
    const removed = items.filter(i => allIds.has(i.id));
    setItems(prev => prev.filter(i => !allIds.has(i.id)));
    setTrashedItems(prev => [...prev, ...removed.map(i => ({ ...i, deletedAt: nowDate(), originalParentId: i.parentId }))]);
    toast(`${idsSet.size} items moved to trash`, { action: { label: 'Undo', onClick: () => { setTrashedItems(prev => prev.filter(t => !allIds.has(t.id))); setItems(prev => [...prev, ...removed]); } } });
    clearSelection();
  }, [selectedIds, items]);

  const restoreFromTrash = useCallback((item: TrashedItem) => {
    const ids = new Set<string>();
    const collect = (id: string) => { ids.add(id); trashedItems.filter(t => t.parentId === id).forEach(c => collect(c.id)); };
    collect(item.id);
    const restoring = trashedItems.filter(t => ids.has(t.id));
    const parentExists = item.originalParentId === null || items.some(i => i.id === item.originalParentId);
    setTrashedItems(prev => prev.filter(t => !ids.has(t.id)));
    setItems(prev => [...prev, ...restoring.map(t => {
      const { deletedAt, originalParentId, ...rest } = t;
      return t.id === item.id ? { ...rest, parentId: parentExists ? originalParentId : null } : rest;
    })]);
    toast.success(`"${item.name}" restored`);
  }, [trashedItems, items]);

  const deleteForever = useCallback((item: DriveItem) => {
    const ids = new Set<string>();
    const collect = (id: string) => { ids.add(id); trashedItems.filter(t => t.parentId === id).forEach(c => collect(c.id)); };
    collect(item.id);
    setTrashedItems(prev => prev.filter(t => !ids.has(t.id)));
    toast.success(`"${item.name}" permanently deleted`);
  }, [trashedItems]);

  const emptyTrash = useCallback(() => { setTrashedItems(prev => prev.filter(t => t.service !== selectedService)); toast.success('Trash emptied'); }, [selectedService]);

  // ─── Batch actions ────────────────────────────────────────────────────────

  const batchStar = useCallback(() => {
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, starred: true } : i));
    toast.success(`${selectedIds.size} items starred`);
    clearSelection();
  }, [selectedIds]);

  const batchDownload = useCallback(() => {
    toast.success(`Downloading ${selectedIds.size} items...`);
    clearSelection();
  }, [selectedIds]);

  // ─── Context Action ────────────────────────────────────────────────────────

  const handleContextAction = useCallback((action: string, item: DriveItem) => {
    switch (action) {
      case 'open': if (item.type === 'folder') navigateToFolder(item.id); break;
      case 'preview': setPreviewItem(item); break;
      case 'download':
        toast.success(`Downloading ${item.name}...`);
        addActivity('download', item.name, item.type);
        break;
      case 'rename': setRenameItem(item); break;
      case 'star':
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, starred: !i.starred } : i));
        toast.success(item.starred ? 'Removed from Starred' : 'Added to Starred');
        addActivity(item.starred ? 'unstar' : 'star', item.name, item.type);
        break;
      case 'copy': toast.success(`Copy of "${item.name}" created`); break;
      case 'move': toast('Drag and drop to move files between folders', { icon: '💡' }); break;
      case 'info': setInfoItem(item); break;
      case 'delete':
        moveToTrash(item);
        addActivity('delete', item.name, item.type);
        break;
      case 'restore':
        restoreFromTrash(item as TrashedItem);
        addActivity('restore', item.name, item.type);
        break;
      case 'delete-forever': setShowDeleteForeverConfirm(item); break;
    }
  }, [moveToTrash, restoreFromTrash, addActivity]);

  const handleRename = (id: string, newName: string) => {
    const item = items.find(i => i.id === id);
    const oldName = item?.name || '';
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: newName } : i));
    toast.success('Renamed successfully');
    addActivity('rename', newName, item?.type || 'document', `Renamed from "${oldName}"`);
  };

  const handleCreateFolder = (name: string) => {
    setItems(prev => [...prev, { id: uid(), name, type: 'folder' as ItemType, parentId: currentFolderId, owner: userDisplayName || 'Me', ownerInitial: userInitial, lastModified: nowDate(), fileSize: '—', starred: false, service: selectedService }]);
    toast.success(`Folder "${name}" created`);
    addActivity('create', name, 'folder');
  };

  const handleNewAction = (type: 'folder' | 'upload') => { if (type === 'folder') setShowNewFolderModal(true); else setShowUploadModal(true); };

  const switchService = (s: 'performance' | 'accounts') => { setSelectedService(s); setCurrentFolderId(null); clearSelection(); setInfoItem(null); setSearchQuery(''); setSidebarView('drive'); setShowServiceDropdown(false); };
  const switchSidebarView = (v: SidebarView) => { setSidebarView(v); setCurrentFolderId(null); setSearchQuery(''); setInfoItem(null); clearSelection(); };

  const childCount = (id: string) => items.filter(i => i.parentId === id).length;
  const starredCount = useMemo(() => items.filter(i => i.starred && i.service === selectedService).length, [items, selectedService]);
  const trashCount = useMemo(() => trashedItems.filter(t => t.service === selectedService).length, [trashedItems, selectedService]);
  const sharedCount = useMemo(() => sharedItems.filter(i => i.service === selectedService).length, [sharedItems, selectedService]);

  // ─── Row render helpers ────────────────────────────────────────────────────

  const renderListRow = (item: DriveItem, isTrashView = false, isSharedView = false) => {
    const Icon = getFileIcon(item.type);
    const iconColor = getFileIconColor(item.type);
    const isSelected = selectedIds.has(item.id);
    const isDropTarget = dropTargetId === item.id;
    const showCheckbox = multiSelectActive || isTrashView;
    const cols = isTrashView ? 'grid-cols-10' : isSharedView ? 'grid-cols-12' : 'grid-cols-12';

    return (
      <div key={item.id}
        draggable={!isTrashView && !isSharedView}
        onDragStart={!isTrashView && !isSharedView ? (e) => handleDragStart(e, item) : undefined}
        onDragEnd={!isTrashView && !isSharedView ? handleDragEnd : undefined}
        onDragOver={!isTrashView && !isSharedView ? (e) => handleDragOver(e, item) : undefined}
        onDragLeave={!isTrashView && !isSharedView ? handleDragLeave : undefined}
        onDrop={!isTrashView && !isSharedView ? (e) => handleDrop(e, item) : undefined}
        onClick={(e) => !isTrashView ? handleItemClick(e, item) : setSelectedIds(new Set([item.id]))}
        onDoubleClick={() => handleItemDoubleClick(item)}
        onContextMenu={(e) => handleContextMenu(e, item)}
        className={`grid gap-4 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all group ${cols} ${
          isDropTarget ? 'bg-brand-light ring-2 ring-brand/30 ring-inset'
            : isSelected ? 'bg-brand-light' : 'hover:bg-gray-50/80'
        }`}
      >
        {/* Name column */}
        <div className={`${isTrashView ? 'col-span-4' : isSharedView ? 'col-span-4' : 'col-span-5'} flex items-center gap-3 min-w-0`}>
          {/* Checkbox area */}
          {showCheckbox && !isTrashView ? (
            <button onClick={(e) => { e.stopPropagation(); setSelectedIds(prev => { const n = new Set(prev); if (n.has(item.id)) n.delete(item.id); else n.add(item.id); return n; }); }}
              className="flex-shrink-0">
              {isSelected ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4 text-gray-300" />}
            </button>
          ) : null}
          <Icon className={`w-5 h-5 ${isDropTarget && item.type === 'folder' ? 'text-brand' : iconColor} flex-shrink-0 transition-colors`} />
          <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{item.name}</span>
          {item.versions && item.versions.length > 0 && !isTrashView && (
            <span className="flex items-center gap-0.5 text-[9px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full flex-shrink-0 cursor-default" style={{ fontWeight: 600 }} title={`${item.versions.length + 1} versions`}>
              <History className="w-2.5 h-2.5" />
              v{item.versions.length + 1}
            </span>
          )}
          {item.starred && !isTrashView && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
        </div>

        {/* Owner / Shared by */}
        {!isTrashView && (
          <div className={`${isSharedView ? 'col-span-3' : 'col-span-3'} flex items-center gap-2 min-w-0`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.ownerInitial === 'B' ? BRAND : item.ownerInitial === 'P' ? '#8b5cf6' : item.ownerInitial === 'R' ? '#0ea5e9' : item.ownerInitial === 'N' ? '#ec4899' : item.ownerInitial === 'A' ? '#f59e0b' : item.ownerInitial === 'V' ? '#10b981' : '#22c55e' }}>
              <span className="text-[10px] text-white" style={{ fontWeight: 600 }}>{item.ownerInitial}</span>
            </div>
            <span className="text-sm text-gray-500 truncate">{item.owner}</span>
          </div>
        )}

        {/* Shared by column (shared view) */}
        {isSharedView && item.sharedBy && (
          <div className="col-span-2 flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.sharedByInitial === 'P' ? '#8b5cf6' : item.sharedByInitial === 'R' ? '#0ea5e9' : item.sharedByInitial === 'N' ? '#ec4899' : item.sharedByInitial === 'A' ? '#f59e0b' : item.sharedByInitial === 'V' ? '#10b981' : BRAND }}>
              <span className="text-[8px] text-white" style={{ fontWeight: 600 }}>{item.sharedByInitial}</span>
            </div>
            <span className="text-xs text-gray-500 truncate">{item.sharedBy}</span>
          </div>
        )}

        {/* Date trashed (trash view) */}
        {isTrashView && (
          <div className="col-span-3 flex items-center"><span className="text-sm text-gray-500">{(item as TrashedItem).deletedAt}</span></div>
        )}

        {/* Last modified */}
        <div className="col-span-2 flex items-center">
          <span className="text-sm text-gray-500">{isTrashView ? item.fileSize : item.lastModified}</span>
        </div>

        {/* File size + actions (non-trash) */}
        {!isTrashView && !isSharedView && (
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{item.fileSize}</span>
            <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e, item); }}
              className="p-1 hover:bg-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* File size (shared view) */}
        {isSharedView && (
          <div className="col-span-1 flex items-center justify-between">
            <span className="text-sm text-gray-500">{item.fileSize}</span>
            <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e, item); }}
              className="p-1 hover:bg-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Trash actions */}
        {isTrashView && (
          <div className="col-span-1 flex items-center justify-end gap-1">
            <button onClick={(e) => { e.stopPropagation(); restoreFromTrash(item as TrashedItem); }}
              className="p-1 hover:bg-green-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Restore" aria-label="Restore item"><RotateCcw className="w-4 h-4 text-green-600" /></button>
            <button onClick={(e) => { e.stopPropagation(); setShowDeleteForeverConfirm(item); }}
              className="p-1 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Delete forever" aria-label="Delete forever"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
        )}
      </div>
    );
  };

  const renderGridFolder = (item: DriveItem) => {
    const isSelected = selectedIds.has(item.id);
    const isDropTarget = dropTargetId === item.id;
    return (
      <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item)} onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, item)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, item)}
        onClick={(e) => handleItemClick(e, item)} onDoubleClick={() => handleItemDoubleClick(item)} onContextMenu={(e) => handleContextMenu(e, item)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all group relative ${
          isDropTarget ? 'bg-brand-light border-brand/40 ring-2 ring-brand/20'
            : isSelected ? 'bg-brand-light border-brand/20' : 'bg-white border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
        }`}>
        {multiSelectActive && (
          <div className="flex-shrink-0">{isSelected ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4 text-gray-300" />}</div>
        )}
        <Folder className={`w-5 h-5 flex-shrink-0 ${isDropTarget ? 'text-brand' : 'text-gray-400'} transition-colors`} />
        <span className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{item.name}</span>
        {item.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0 ml-auto" />}
        <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e, item); }}
          className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all ml-auto flex-shrink-0">
          <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    );
  };

  const renderGridFile = (item: DriveItem) => {
    const Icon = getFileIcon(item.type);
    const iconColor = getFileIconColor(item.type);
    const isSelected = selectedIds.has(item.id);
    return (
      <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item)} onDragEnd={handleDragEnd}
        onClick={(e) => handleItemClick(e, item)} onDoubleClick={() => handleItemDoubleClick(item)} onContextMenu={(e) => handleContextMenu(e, item)}
        className={`rounded-xl border cursor-pointer transition-all group overflow-hidden relative ${
          isSelected ? 'bg-brand-light border-brand/20' : 'bg-white border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
        }`}>
        {multiSelectActive && (
          <div className="absolute top-2 left-2 z-10">{isSelected ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}</div>
        )}
        <div className="h-28 bg-gray-50 flex items-center justify-center"><Icon className={`w-10 h-10 ${iconColor} opacity-40`} /></div>
        <div className="px-3 py-2.5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <span className="text-xs text-gray-900 truncate" style={{ fontWeight: 500 }}>{item.name}</span>
          </div>
          {item.versions && item.versions.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <History className="w-2.5 h-2.5 text-brand" />
              <span className="text-[9px] text-brand" style={{ fontWeight: 600 }}>v{item.versions.length + 1}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const viewTitle = sidebarView === 'starred' ? 'Starred' : sidebarView === 'recent' ? 'Recent' : sidebarView === 'trash' ? 'Trash' : sidebarView === 'shared' ? 'Shared with me' : 'My Drive';

  return (
    <div className="h-screen flex flex-col bg-white">
      <AnimatePresence>{dragItem && <DragOverlay itemName={dragItem.name} />}</AnimatePresence>

      {/* Batch toolbar */}
      <AnimatePresence>
        {multiSelectActive && sidebarView !== 'trash' && (
          <BatchToolbar count={selectedIds.size} onStar={batchStar} onTrash={moveMultipleToTrash} onDownload={batchDownload} onClear={clearSelection} />
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="nav-glass px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center"><BregoLogo size={36} variant="full" /></div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavTabs items={[
            { id: 'chat', label: 'Chat', icon: MessageSquare, isActive: false, onClick: onNavigateToChat },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: false, onClick: onBack },
            { id: 'workspace', label: 'Workspace', icon: Briefcase, isActive: false, onClick: onNavigateToWorkspace },
            { id: 'dataroom', label: 'Dataroom', icon: Database, isActive: true },
          ]} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell service={userInfo.selectedService === 'Accounts & Taxation' ? 'finance' : 'marketing'} />
          <ProfileDropdown userInfo={userInfo} onProfileSettingsClick={onProfileSettings} onInviteTeamClick={onInviteTeam} onAddBusiness={onAddBusiness} businessTypeLabel={businessTypeLabel} businessAccounts={businessAccounts} activeAccountId={activeAccountId} onSwitchAccount={onSwitchAccount} onDeleteAccount={onDeleteAccount} notificationCounts={notificationCounts} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left Sidebar ─── */}
        <div className="w-60 sidebar-glass flex flex-col overflow-hidden flex-shrink-0" style={{ boxShadow: 'none' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Service */}
            <div>
              
              <div className="relative" ref={serviceDropdownRef}>
                <button onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all" style={{ fontWeight: 500 }}>
                  <span className="truncate">{selectedService === 'performance' ? 'Performance Marketing' : 'Accounts & Taxation'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showServiceDropdown && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      {(['accounts', 'performance'] as const).map(s => (
                        <button key={s} onClick={() => switchService(s)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${selectedService === s ? 'bg-brand-light text-brand' : 'text-gray-700 hover:bg-gray-50'}`}
                          style={{ fontWeight: selectedService === s ? 600 : 400 }}>
                          <span>{s === 'accounts' ? 'Accounts & Taxation' : 'Performance Marketing'}</span>
                          {selectedService === s && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-gray-200/40" />

            {/* Quick Access */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block" style={{ fontWeight: 600 }}>Quick Access</label>
              <div className="space-y-0.5">
                {([
                  { key: 'drive' as SidebarView, icon: Home, label: 'My Drive', badge: null, badgeColor: '' },
                  { key: 'shared' as SidebarView, icon: Share2, label: 'Shared with me', badge: sharedCount > 0 ? sharedCount : null, badgeColor: 'bg-blue-100 text-blue-600' },
                  { key: 'starred' as SidebarView, icon: Star, label: 'Starred', badge: starredCount > 0 ? starredCount : null, badgeColor: 'bg-amber-100 text-amber-700' },
                  { key: 'recent' as SidebarView, icon: Clock, label: 'Recent', badge: null, badgeColor: '' },
                  { key: 'trash' as SidebarView, icon: Trash2, label: 'Trash', badge: trashCount > 0 ? trashCount : null, badgeColor: 'bg-red-100 text-red-600' },
                ]).map(item => (
                  <button key={item.key} onClick={() => switchSidebarView(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${sidebarView === item.key ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50'}`}
                    style={{ fontWeight: sidebarView === item.key ? 500 : 400 }}>
                    <item.icon className="w-4 h-4" /><span>{item.label}</span>
                    {item.badge !== null && <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor}`} style={{ fontWeight: 600 }}>{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {sidebarView === 'drive' && (
              <>
                <div className="border-t border-gray-200/40" />
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block" style={{ fontWeight: 600 }}>Folders</label>
                  <FolderTree items={items} service={selectedService} currentFolderId={currentFolderId} onNavigate={navigateToFolder} />
                </div>
              </>
            )}

            <div className="border-t border-gray-200/40" />

            {/* Owner Filter */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block" style={{ fontWeight: 600 }}>Owner</label>
              <div className="space-y-0.5">
                {[
                  { key: 'all' as const, label: 'All Owners', icon: <Users className="w-4 h-4" /> },
                  { key: 'me' as const, label: 'Me', icon: <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><span className="text-[8px] text-white" style={{ fontWeight: 700 }}>{userInitial}</span></div> },
                  { key: 'brego' as const, label: 'Brego Business', icon: <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND }}><span className="text-[8px] text-white" style={{ fontWeight: 700 }}>B</span></div> },
                ].map(o => (
                  <button key={o.key} onClick={() => setSelectedOwner(o.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${selectedOwner === o.key ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50'}`}
                    style={{ fontWeight: selectedOwner === o.key ? 500 : 400 }}>{o.icon}<span>{o.label}</span></button>
                ))}
              </div>
            </div>
          </div>
          <StorageMeter usedGB={0.2 + storageUsed} totalGB={15} />
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="px-8 py-5 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 600 }}>{viewTitle}</h1>
                {sidebarView === 'drive' && <button className="p-1 hover:bg-gray-100 rounded-lg" aria-label="File information"><Info className="w-4 h-4 text-gray-400" /></button>}
                {sidebarView === 'trash' && serviceTrash.length > 0 && (
                  <button onClick={() => setShowEmptyTrashConfirm(true)}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" style={{ fontWeight: 600 }}>
                    <Trash2 className="w-3.5 h-3.5" /> Empty trash
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder={sidebarView === 'trash' ? 'Search in Trash' : sidebarView === 'shared' ? 'Search shared files' : 'Search in Drive'}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-72 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full" aria-label="Clear search"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                </div>
                {sidebarView !== 'trash' && (
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`} aria-label="List view"><List className="w-4 h-4 text-gray-600" /></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`} aria-label="Grid view"><LayoutGrid className="w-4 h-4 text-gray-600" /></button>
                  </div>
                )}
                <button onClick={() => { setShowActivityLog(!showActivityLog); setInfoItem(null); }}
                  className={`p-2 rounded-lg transition-colors relative ${showActivityLog ? 'bg-brand-light text-brand' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Activity log">
                  <Activity className="w-4 h-4" />
                  {activityLog.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand rounded-full" />
                  )}
                </button>
                {sidebarView === 'drive' && (
                  <div className="relative">
                    <button onClick={() => setShowNewDropdown(!showNewDropdown)}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm hover:opacity-90 transition-all shadow-sm"
                      style={{ backgroundColor: BRAND, fontWeight: 600, boxShadow: '0 2px 8px rgba(32,76,199,0.3)' }}>
                      <Plus className="w-4 h-4" /><span>New</span>
                    </button>
                    {showNewDropdown && <NewItemDropdown onClose={() => setShowNewDropdown(false)} onCreate={handleNewAction} />}
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumb */}
            {sidebarView === 'drive' && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1 mt-3 text-sm">
                <button onClick={() => navigateToFolder(null)} className="text-gray-500 hover:text-brand transition-colors px-1.5 py-0.5 rounded hover:bg-gray-50" style={{ fontWeight: 500 }}>
                  {selectedService === 'accounts' ? 'Accounts & Taxation' : 'Performance Marketing'}
                </button>
                {breadcrumbs.map(bc => (
                  <span key={bc.id} className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    <button onClick={() => navigateToFolder(bc.id)} className={`px-1.5 py-0.5 rounded transition-colors ${bc.id === currentFolderId ? 'text-gray-900' : 'text-gray-500 hover:text-brand hover:bg-gray-50'}`}
                      style={{ fontWeight: bc.id === currentFolderId ? 600 : 500 }}>{bc.name}</button>
                  </span>
                ))}
              </div>
            )}

            {sidebarView === 'trash' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <Info className="w-3.5 h-3.5" /><span>Items in trash are deleted forever after 30 days</span>
              </div>
            )}
            {sidebarView === 'shared' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                <Share2 className="w-3.5 h-3.5 text-blue-500" /><span>Files and folders that others have shared with you</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto px-8 py-5"
              onDragOver={sidebarView === 'drive' ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } : undefined}
              onDrop={sidebarView === 'drive' ? handleDropOnBackground : undefined}
              onClick={(e) => { if (e.target === e.currentTarget) clearSelection(); }}>

              {/* Trash view */}
              {sidebarView === 'trash' ? (
                serviceTrash.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4"><Trash2 className="w-10 h-10 text-gray-300" /></div>
                    <p className="text-gray-500 text-sm mb-1" style={{ fontWeight: 500 }}>Trash is empty</p>
                    <p className="text-gray-400 text-xs">Items you delete will appear here</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                    <div className="bg-gray-50/80 border-b border-gray-200/60">
                      <div className="grid grid-cols-10 gap-4 px-4 py-2.5">
                        <div className="col-span-4 text-xs text-gray-500" style={{ fontWeight: 500 }}>Name</div>
                        <div className="col-span-3 text-xs text-gray-500" style={{ fontWeight: 500 }}>Date trashed</div>
                        <div className="col-span-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>File size</div>
                        <div className="col-span-1" />
                      </div>
                    </div>
                    <div>{(searchQuery ? serviceTrash.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())) : serviceTrash).map(item => renderListRow(item, true))}</div>
                  </div>
                )

              /* Normal / Shared views */
              ) : visibleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    {sidebarView === 'starred' ? <Star className="w-10 h-10 text-gray-300" />
                      : sidebarView === 'recent' ? <Clock className="w-10 h-10 text-gray-300" />
                        : sidebarView === 'shared' ? <Share2 className="w-10 h-10 text-gray-300" />
                          : <Folder className="w-10 h-10 text-gray-300" />}
                  </div>
                  <p className="text-gray-500 text-sm mb-1" style={{ fontWeight: 500 }}>
                    {searchQuery ? 'No results found' : sidebarView === 'starred' ? 'No starred items' : sidebarView === 'recent' ? 'No recent files' : sidebarView === 'shared' ? 'Nothing shared with you yet' : 'This folder is empty'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {searchQuery ? 'Try a different search term' : sidebarView === 'starred' ? 'Right-click any file and select "Add to Starred"' : sidebarView === 'shared' ? 'Files others share with you will appear here' : sidebarView === 'recent' ? 'Files you open will show up here' : 'Upload files or create a new folder'}
                  </p>
                  {!searchQuery && sidebarView === 'drive' && (
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => setShowNewFolderModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50" style={{ fontWeight: 500 }}><FolderPlus className="w-4 h-4" /> New folder</button>
                      <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm hover:opacity-90" style={{ backgroundColor: BRAND, fontWeight: 500 }}><Upload className="w-4 h-4" /> Upload</button>
                    </div>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                  <div className="bg-gray-50/80 border-b border-gray-200/60">
                    <div className={`grid gap-4 px-4 py-2.5 ${sidebarView === 'shared' ? 'grid-cols-12' : 'grid-cols-12'}`}>
                      <div className={`${sidebarView === 'shared' ? 'col-span-4' : 'col-span-5'} flex items-center gap-2`}>
                        {sidebarView !== 'shared' && (
                          <button onClick={handleSelectAll} className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0">
                            {selectedIds.size === visibleItems.length && visibleItems.length > 0
                              ? <CheckSquare className="w-3.5 h-3.5 text-brand" />
                              : <Square className="w-3.5 h-3.5 text-gray-400" />}
                          </button>
                        )}
                        <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors" style={{ fontWeight: 500 }}>
                          Name <SortIndicator field="name" />
                        </button>
                      </div>
                      <div className="col-span-3 text-xs text-gray-500" style={{ fontWeight: 500 }}>Owner</div>
                      {sidebarView === 'shared' && <div className="col-span-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>Shared by</div>}
                      <div className="col-span-2">
                        <button onClick={() => toggleSort('lastModified')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors" style={{ fontWeight: 500 }}>
                          Last modified <SortIndicator field="lastModified" />
                        </button>
                      </div>
                      <div className={`${sidebarView === 'shared' ? 'col-span-1' : 'col-span-2'}`}>
                        <button onClick={() => toggleSort('fileSize')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors" style={{ fontWeight: 500 }}>
                          File size <SortIndicator field="fileSize" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>{visibleItems.map(item => renderListRow(item, false, sidebarView === 'shared'))}</div>
                </div>
              ) : (
                <div>
                  {visibleItems.some(i => i.type === 'folder') && (
                    <div className="mb-6">
                      <h3 className="text-xs text-gray-500 mb-3 px-1" style={{ fontWeight: 600 }}>Folders</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{visibleItems.filter(i => i.type === 'folder').map(renderGridFolder)}</div>
                    </div>
                  )}
                  {visibleItems.some(i => i.type !== 'folder') && (
                    <div>
                      <h3 className="text-xs text-gray-500 mb-3 px-1" style={{ fontWeight: 600 }}>Files</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{visibleItems.filter(i => i.type !== 'folder').map(renderGridFile)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {infoItem && !showActivityLog && <FileInfoPanel item={infoItem} onClose={() => setInfoItem(null)} itemCount={infoItem.type === 'folder' ? childCount(infoItem.id) : undefined} locationPath={getLocationPath(infoItem.id)} />}
              {showActivityLog && <ActivityLogPanel entries={activityLog} onClose={() => setShowActivityLog(false)} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} item={contextMenu.item} onClose={() => setContextMenu(null)} onAction={handleContextAction} isTrash={sidebarView === 'trash'} />}

      <AnimatePresence>
        {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} onCreate={handleCreateFolder} />}
        {renameItem && <RenameModal item={renameItem} onClose={() => setRenameItem(null)} onRename={handleRename} />}
        {showEmptyTrashConfirm && <ConfirmModal title="Empty trash?" message={`All ${serviceTrash.length} item${serviceTrash.length === 1 ? '' : 's'} will be permanently deleted.`} confirmLabel="Empty trash" danger onClose={() => setShowEmptyTrashConfirm(false)} onConfirm={emptyTrash} />}
        {showDeleteForeverConfirm && <ConfirmModal title="Delete forever?" message={`"${showDeleteForeverConfirm.name}" will be permanently deleted.`} confirmLabel="Delete forever" danger onClose={() => setShowDeleteForeverConfirm(null)} onConfirm={() => deleteForever(showDeleteForeverConfirm)} />}
        {previewItem && (
          <FilePreviewModal
            item={previewItem}
            onClose={() => setPreviewItem(null)}
            siblings={visibleItems.filter(i => i.type !== 'folder')}
            onNavigate={(item) => setPreviewItem(item)}
          />
        )}
      </AnimatePresence>

      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'Manrope, sans-serif' } }} />

      {/* Unified Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        defaultService={selectedService === 'accounts' ? 'accounts' : 'performance'}
        defaultFolderId={currentFolderId}
        onBatchUploadComplete={(files) => {
          files.forEach(f => addActivity('upload', f.fileName, 'document', `Uploaded to ${f.folderPath}`));
          toast.success(`${files.length} file${files.length !== 1 ? 's' : ''} uploaded to Dataroom`);
        }}
      />
    </div>
  );
}
