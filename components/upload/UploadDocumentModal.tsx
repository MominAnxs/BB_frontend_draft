'use client';

import { useState, useRef, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Upload, FileText, FileSpreadsheet, File, Image as ImageIcon,
  Folder, FolderOpen, ChevronRight, Check, Database,
  BarChart3, CheckCircle2, Sparkles, Plus, AlertTriangle,
  MessageSquare, Users, User, AtSign,
} from 'lucide-react';
import { useDataroom, DriveItem } from '../context/DataroomContext';
import { toast, Toaster } from 'sonner';

const BRAND = '#204CC7';

// ─── Smart Folder Suggestion Rules ───────────────────────────────────────────

interface SuggestionRule {
  patterns: RegExp[];
  folderPath: string[];   // path segments to match in folder hierarchy
  service: 'accounts' | 'performance';
  label: string;
}

const SUGGESTION_RULES: SuggestionRule[] = [
  // Accounts & Taxation - BOA categories
  { patterns: [/gstr|gst[\s\-_]?[0-9rb]/i, /gst/i], folderPath: ['Tax', 'GST'], service: 'accounts', label: 'Tax / GST' },
  { patterns: [/tds|form\s?26|challan/i], folderPath: ['Tax', 'TDS'], service: 'accounts', label: 'Tax / TDS' },
  { patterns: [/advance\s?tax/i], folderPath: ['Tax', 'Advance Tax'], service: 'accounts', label: 'Tax / Advance Tax' },
  { patterns: [/\bpt\b|professional\s?tax/i], folderPath: ['Tax', 'PT'], service: 'accounts', label: 'Tax / PT' },
  { patterns: [/sales\s?(invoice|register|receipt|order)/i, /\bsales\b/i], folderPath: ['BOA', 'Sales'], service: 'accounts', label: 'BOA / Sales' },
  { patterns: [/purchase\s?(order|invoice|receipt)/i, /vendor\s?invoice/i, /\bpurchase/i], folderPath: ['BOA', 'Purchases'], service: 'accounts', label: 'BOA / Purchases' },
  { patterns: [/expense\s?(report|receipt|claim)/i, /utility\s?bill/i, /\bexpense/i], folderPath: ['BOA', 'Expenses'], service: 'accounts', label: 'BOA / Expenses' },
  { patterns: [/bank\s?statement|bank\s?reconcil|current\s?a\/c/i], folderPath: ['BOA', 'Bank Statement'], service: 'accounts', label: 'BOA / Bank Statement' },
  { patterns: [/card\s?statement|credit\s?card|amex|visa\s?statement/i], folderPath: ['BOA', 'Card Statement'], service: 'accounts', label: 'BOA / Card Statement' },
  { patterns: [/debit\s?note|credit\s?note/i], folderPath: ['BOA', 'Other'], service: 'accounts', label: 'BOA / Other' },
  // Performance Marketing
  { patterns: [/campaign|creative|ad\s?set|ad\s?copy/i], folderPath: ['Raw Files'], service: 'performance', label: 'Raw Files' },
  { patterns: [/brand\s?asset|logo|branding/i], folderPath: ['Raw Files'], service: 'performance', label: 'Raw Files' },
  { patterns: [/report|audit|dashboard\s?export|analytics/i], folderPath: ['Stock Reports'], service: 'performance', label: 'Stock Reports' },
  { patterns: [/meeting\s?note|strategy/i], folderPath: ['Miscellaneous'], service: 'performance', label: 'Miscellaneous' },
];

function findSuggestedFolder(fileNames: string[], items: DriveItem[]): { folderId: string; service: 'accounts' | 'performance'; label: string; confidence: number } | null {
  if (fileNames.length === 0) return null;

  // Score each rule by how many files match
  const scores: { rule: SuggestionRule; matches: number }[] = [];
  for (const rule of SUGGESTION_RULES) {
    let matches = 0;
    for (const name of fileNames) {
      if (rule.patterns.some(p => p.test(name))) matches++;
    }
    if (matches > 0) scores.push({ rule, matches });
  }

  if (scores.length === 0) return null;

  // Best match = most files matching
  scores.sort((a, b) => b.matches - a.matches);
  const best = scores[0];
  const confidence = best.matches / fileNames.length;

  // Find the folder in the item tree
  const serviceFolders = items.filter(i => i.service === best.rule.service);
  let currentParentId: string | null = null;

  for (const segment of best.rule.folderPath) {
    // Strict match: name + exact parentId
    const strictFolder = serviceFolders.find(i =>
      i.type === 'folder' && i.name === segment && i.parentId === currentParentId
    );
    // Relaxed: name matches, parent is a child of currentParent (handles FY wrapper)
    const childFolder = !strictFolder ? serviceFolders.find(i =>
      i.type === 'folder' && i.name === segment &&
      serviceFolders.some(p => p.id === i.parentId && p.parentId === currentParentId)
    ) : null;
    // Fallback: any folder with this name in the service
    const anyFolder = !strictFolder && !childFolder ? serviceFolders.find(i =>
      i.type === 'folder' && i.name === segment
    ) : null;

    const match = strictFolder || childFolder || anyFolder;
    if (match) {
      currentParentId = match.id;
    } else {
      break;
    }
  }

  if (!currentParentId) return null;

  return {
    folderId: currentParentId,
    service: best.rule.service,
    label: best.rule.label,
    confidence,
  };
}

// ─── Folder Tree for Picker ──────────────────────────────────────────────────

function PickerTreeNode({ item, items, selectedFolderId, suggestedFolderId, depth, onSelect, expandedIds, onToggle }: {
  item: DriveItem; items: DriveItem[]; selectedFolderId: string | null; suggestedFolderId?: string | null;
  depth: number; onSelect: (id: string) => void; expandedIds: Set<string>; onToggle: (id: string) => void;
}) {
  const children = items.filter(i => i.parentId === item.id && i.type === 'folder');
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isSelected = selectedFolderId === item.id;
  const isSuggested = suggestedFolderId === item.id && !isSelected;

  return (
    <div>
      <button
        onClick={() => onSelect(item.id)}
        className={`w-full flex items-center gap-1.5 py-1.5 rounded-lg text-[13px] transition-all group ${
          isSelected
            ? 'bg-[#EEF1FB] text-[#204CC7]'
            : isSuggested
              ? 'bg-amber-50/80 text-amber-700 ring-1 ring-amber-200/60'
              : 'text-gray-600 hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${10 + depth * 16}px`, paddingRight: '8px', fontWeight: isSelected ? 600 : isSuggested ? 500 : 400 }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0 cursor-pointer"
          >
            <ChevronRight className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
          </span>
        ) : <span className="w-4 flex-shrink-0" />}
        {isSelected ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-[#204CC7]" />
        ) : isSuggested ? (
          <Folder className="w-4 h-4 flex-shrink-0 text-amber-500" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
        )}
        <span className="truncate">{item.name}</span>
        {isSuggested && (
          <Sparkles className="w-3 h-3 ml-auto flex-shrink-0 text-amber-500" />
        )}
        {isSelected && (
          <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-[#204CC7]" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children.sort((a, b) => a.name.localeCompare(b.name)).map(child => (
              <PickerTreeNode key={child.id} item={child} items={items} selectedFolderId={selectedFolderId}
                suggestedFolderId={suggestedFolderId}
                depth={depth + 1} onSelect={onSelect} expandedIds={expandedIds} onToggle={onToggle} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FolderPicker({ items, service, selectedFolderId, suggestedFolderId, onSelect }: {
  items: DriveItem[]; service: 'accounts' | 'performance'; selectedFolderId: string | null;
  suggestedFolderId?: string | null; onSelect: (id: string) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Auto-expand paths to selected + suggested folder
  useEffect(() => {
    const toExpand = new Set<string>();
    for (const targetId of [selectedFolderId, suggestedFolderId]) {
      if (!targetId) continue;
      let id: string | null = targetId;
      while (id) {
        const item = items.find(i => i.id === id);
        if (item) { toExpand.add(item.id); id = item.parentId; } else break;
      }
    }
    if (toExpand.size > 0) setExpandedIds(prev => { const n = new Set(prev); toExpand.forEach(x => n.add(x)); return n; });
  }, [selectedFolderId, suggestedFolderId, items]);

  const onToggle = useCallback((id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const rootFolders = items.filter(i => i.parentId === null && i.type === 'folder' && i.service === service);

  return (
    <div className="space-y-0.5">
      {rootFolders.sort((a, b) => a.name.localeCompare(b.name)).map(f => (
        <PickerTreeNode key={f.id} item={f} items={items} selectedFolderId={selectedFolderId}
          suggestedFolderId={suggestedFolderId}
          depth={0} onSelect={onSelect} expandedIds={expandedIds} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ─── File Type Icon ──────────────────────────────────────────────────────────

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' };
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return { icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50' };
  if (['doc', 'docx', 'txt'].includes(ext)) return { icon: File, color: 'text-blue-500', bg: 'bg-blue-50' };
  return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Per-file progress item ──────────────────────────────────────────────────

interface FileUploadEntry {
  file: File;
  id: string;
  progress: number;
  status: 'queued' | 'uploading' | 'success' | 'error';
  /** Override name used when a duplicate rename is applied */
  displayName?: string;
}

/** Resolve the effective file name (displayName if renamed, else original) */
function entryName(entry: FileUploadEntry): string {
  return entry.displayName || entry.file.name;
}

const FileRow = forwardRef<HTMLDivElement, { entry: FileUploadEntry; onRemove: () => void; canRemove: boolean }>(function FileRow({ entry, onRemove, canRemove }, ref) {
  const name = entryName(entry);
  const wasRenamed = !!entry.displayName && entry.displayName !== entry.file.name;
  const { icon: Icon, color, bg } = getFileIcon(name);
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-white"
    >
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] text-gray-800 truncate" style={{ fontWeight: 500 }}>{name}</p>
          {wasRenamed && (
            <span
              className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0 cursor-default relative group/renamed"
              style={{ fontWeight: 600 }}
              title={`Originally: ${entry.file.name}`}
            >
              renamed
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/renamed:opacity-100 transition-opacity duration-150 z-50 shadow-lg" style={{ fontWeight: 500 }}>
                Originally: {entry.file.name}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-gray-500">
            {formatFileSize(entry.file.size)} &middot; {name.split('.').pop()?.toUpperCase()}
          </p>
          {entry.status === 'uploading' && (
            <span className="text-[10px] text-[#204CC7]" style={{ fontWeight: 600 }}>{Math.min(Math.round(entry.progress), 100)}%</span>
          )}
        </div>
        {(entry.status === 'uploading' || entry.status === 'success') && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1.5">
            <motion.div
              className={`h-full rounded-full ${entry.status === 'success' ? 'bg-green-500' : ''}`}
              style={entry.status === 'uploading' ? { backgroundColor: BRAND } : {}}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(entry.progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
      {entry.status === 'success' ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
          <CheckCircle2 className="w-4.5 h-4.5 text-green-500 flex-shrink-0" />
        </motion.div>
      ) : canRemove && entry.status === 'queued' ? (
        <button onClick={onRemove} className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" aria-label="Remove file">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      ) : null}
    </motion.div>
  );
});

// ─── Main Modal ──────────────────────────────────────────────────────────────

export interface UploadCompleteInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  folderId: string;
  folderPath: string;
  service: 'accounts' | 'performance';
  /** Optional note/context the user attached to the upload */
  note?: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType?: 'file' | 'image';
  onUploadComplete?: (fileInfo: UploadCompleteInfo) => void;
  /** Called when batch upload finishes with all file infos */
  onBatchUploadComplete?: (files: UploadCompleteInfo[]) => void;
  defaultService?: 'accounts' | 'performance';
  /** Pre-select a folder (e.g., from Dataroom's current folder) */
  defaultFolderId?: string | null;
}

export function UploadDocumentModal({
  isOpen, onClose, uploadType = 'file',
  onUploadComplete, onBatchUploadComplete,
  defaultService = 'accounts', defaultFolderId = null,
}: UploadDocumentModalProps) {
  const { items, addFileToDataroom, addFileAsVersion, getFolderPath } = useDataroom();

  const [selectedService, setSelectedService] = useState<'accounts' | 'performance'>(defaultService);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(defaultFolderId);
  const [fileEntries, setFileEntries] = useState<FileUploadEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string[] | null>(null);
  const [uploadNote, setUploadNote] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIdx, setMentionStartIdx] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  let _fid = useRef(0);
  const fid = () => `fentry-${++_fid.current}`;

  // Smart suggestion
  const suggestion = useMemo(() => {
    if (fileEntries.length === 0) return null;
    return findSuggestedFolder(fileEntries.map(f => f.file.name), items);
  }, [fileEntries, items]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setFileEntries([]);
      setIsUploading(false);
      setAllDone(false);
      setDuplicateWarning(null);
      setSelectedService(defaultService);
      setSelectedFolderId(defaultFolderId);
      setUploadNote('');
      _fid.current = 0;
      hasFinalized.current = false;
      isVersionUpload.current = false;
    }
  }, [isOpen, defaultService, defaultFolderId]);

  // Auto-apply suggestion if nothing selected yet
  useEffect(() => {
    if (suggestion && !selectedFolderId && !isUploading) {
      setSelectedService(suggestion.service);
      setSelectedFolderId(suggestion.folderId);
    }
  }, [suggestion, selectedFolderId, isUploading]);

  const acceptTypes = uploadType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx';

  const ALLOWED_DOC_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx'];
  const ALLOWED_IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  const MAX_FILE_SIZE = uploadType === 'image' ? 25 * 1024 * 1024 : 50 * 1024 * 1024; // 25MB images, 50MB docs

  const addFiles = (files: File[]) => {
    const allowedExts = uploadType === 'image' ? ALLOWED_IMG_EXTS : ALLOWED_DOC_EXTS;
    const accepted: File[] = [];
    const rejectedTypes: string[] = [];
    const rejectedSize: string[] = [];

    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExts.includes(ext)) {
        rejectedTypes.push(f.name);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        rejectedSize.push(f.name);
        continue;
      }
      accepted.push(f);
    }

    // Show validation errors
    if (rejectedTypes.length > 0) {
      toast.error(
        rejectedTypes.length === 1
          ? `"${rejectedTypes[0]}" is not a supported format`
          : `${rejectedTypes.length} files have unsupported formats`,
        { description: `Accepted: ${allowedExts.map(e => `.${e}`).join(', ')}` }
      );
    }
    if (rejectedSize.length > 0) {
      const maxLabel = uploadType === 'image' ? '25 MB' : '50 MB';
      toast.error(
        rejectedSize.length === 1
          ? `"${rejectedSize[0]}" exceeds the ${maxLabel} limit`
          : `${rejectedSize.length} files exceed the ${maxLabel} size limit`,
        { description: 'Try compressing or splitting the file' }
      );
    }

    if (accepted.length === 0) return;

    const newEntries: FileUploadEntry[] = accepted.map(f => ({
      file: f, id: fid(), progress: 0, status: 'queued' as const,
    }));
    setFileEntries(prev => [...prev, ...newEntries]);
    setAllDone(false);
  };

  const removeFile = (id: string) => {
    setFileEntries(prev => prev.filter(e => e.id !== id));
    setDuplicateWarning(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) addFiles(Array.from(files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) addFiles(Array.from(files));
  };

  const hasFinalized = useRef(false);
  /** Tracks whether this upload should use version-merging (Upload Anyway) */
  const isVersionUpload = useRef(false);

  // Detect all-done via useEffect — avoids closure/batching race conditions
  useEffect(() => {
    if (!isUploading || fileEntries.length === 0 || hasFinalized.current) return;
    if (!fileEntries.every(e => e.status === 'success')) return;

    // All files completed — finalize
    hasFinalized.current = true;
    const completedInfos: UploadCompleteInfo[] = [];
    const addFn = isVersionUpload.current ? addFileAsVersion : addFileToDataroom;
    for (const fe of fileEntries) {
      const name = entryName(fe);
      const fileSize = formatFileSize(fe.file.size);
      const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
      addFn(name, fileSize, selectedFolderId!, selectedService);
      const info: UploadCompleteInfo = {
        fileName: name, fileSize, fileType: ext,
        folderId: selectedFolderId!, folderPath: getFolderPath(selectedFolderId!), service: selectedService,
        note: uploadNote,
      };
      completedInfos.push(info);
      onUploadComplete?.(info);
    }
    onBatchUploadComplete?.(completedInfos);
    setAllDone(true);
    setTimeout(() => onClose(), 1200);
  }, [fileEntries, isUploading]);

  // Check for duplicate filenames in the target folder
  const checkDuplicates = (): string[] => {
    if (!selectedFolderId) return [];
    const existingNames = items
      .filter(i => i.parentId === selectedFolderId && i.type !== 'folder')
      .map(i => i.name.toLowerCase());
    return fileEntries
      .filter(e => existingNames.includes(e.file.name.toLowerCase()))
      .map(e => e.file.name);
  };

  // Compute a unique suffixed name: report.pdf → report (1).pdf, report (2).pdf, etc.
  const computeUniqueName = (originalName: string, existingNames: Set<string>): string => {
    const dotIdx = originalName.lastIndexOf('.');
    const base = dotIdx > 0 ? originalName.slice(0, dotIdx) : originalName;
    const ext = dotIdx > 0 ? originalName.slice(dotIdx) : '';
    let counter = 1;
    let candidate = `${base} (${counter})${ext}`;
    while (existingNames.has(candidate.toLowerCase())) {
      counter++;
      candidate = `${base} (${counter})${ext}`;
    }
    return candidate;
  };

  // Rename duplicate entries with auto-suffixed names, then start upload
  const renameAndUpload = () => {
    if (!selectedFolderId) return;
    const existingNames = new Set(
      items
        .filter(i => i.parentId === selectedFolderId && i.type !== 'folder')
        .map(i => i.name.toLowerCase())
    );
    // Also track names we've already assigned in this batch to avoid inter-batch collisions
    const assignedNames = new Set(existingNames);

    setFileEntries(prev => prev.map(entry => {
      const origName = entry.file.name;
      if (existingNames.has(origName.toLowerCase())) {
        const newName = computeUniqueName(origName, assignedNames);
        assignedNames.add(newName.toLowerCase());
        return { ...entry, displayName: newName };
      }
      assignedNames.add(origName.toLowerCase());
      return entry;
    }));

    // Start upload on next tick so state has been applied
    setTimeout(() => startUpload(), 0);
  };

  // Start the actual upload simulation
  const startUpload = () => {
    setIsUploading(true);
    setAllDone(false);
    setDuplicateWarning(null);
    hasFinalized.current = false;

    // Fast staggered upload simulation
    fileEntries.forEach((entry, idx) => {
      const stagger = idx * 300;

      // Start uploading
      setTimeout(() => {
        setFileEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'uploading' as const } : e));
      }, stagger);

      // Smooth progress: 4 ticks over ~800ms
      const ticks = 4;
      for (let t = 1; t <= ticks; t++) {
        setTimeout(() => {
          setFileEntries(prev => prev.map(e => {
            if (e.id !== entry.id || e.status === 'success') return e;
            return { ...e, progress: Math.min((t / ticks) * 95, 95) };
          }));
        }, stagger + t * 200);
      }

      // Mark complete
      const completionTime = stagger + (ticks + 1) * 200;
      setTimeout(() => {
        setFileEntries(prev => prev.map(e =>
          e.id === entry.id ? { ...e, progress: 100, status: 'success' as const } : e
        ));
      }, completionTime);
    });
  };

  const handleUpload = () => {
    if (fileEntries.length === 0 || !selectedFolderId || isUploading) return;

    // Check for duplicates first
    const dupes = checkDuplicates();
    if (dupes.length > 0 && !duplicateWarning) {
      setDuplicateWarning(dupes);
      return; // Show warning, don't upload yet
    }

    startUpload();
  };

  const selectedFolderPath = selectedFolderId ? getFolderPath(selectedFolderId) : null;
  const totalFiles = fileEntries.length;
  const completedFiles = fileEntries.filter(e => e.status === 'success').length;
  const canUpload = totalFiles > 0 && selectedFolderId && !isUploading;

  // ── @Mention system ──────────────────────────────────────────────────────
  // Roster mirrors ChatInterface CHAT_MENTION_OPTIONS / teamSeedMessages
  // TEAM_AUTHORS — Tejas is COO (cross-service), Zubear & Irshad own
  // Accounts & Taxation, Chinmay owns Performance Marketing.
  const MENTION_OPTIONS = useMemo(() => [
    { value: '@Bregoteam', label: 'Brego Team', description: 'Notify the entire Brego team', icon: Users, bgColor: '#EEF1FB', iconColor: BRAND, section: 'Teams' },
    { value: '@BregoGPT', label: 'BregoGPT', description: 'Tag the AI assistant for follow-up', icon: Sparkles, bgColor: '#FEF3C7', iconColor: '#D97706', section: 'AI' },
    { value: '@tejas', label: 'Tejas Atha', description: 'COO — cross-service strategic input', icon: User, bgColor: '#fff7ed', iconColor: '#ea580c', section: 'Leadership' },
    { value: '@zubear', label: 'Zubear Shaikh', description: 'Accounts & Taxation Lead', icon: User, bgColor: '#fdf4ff', iconColor: '#c026d3', section: 'Accounts & Taxation' },
    { value: '@irshad', label: 'Irshad Qureshi', description: 'Accounts & Taxation Specialist', icon: User, bgColor: '#eff6ff', iconColor: '#2563eb', section: 'Accounts & Taxation' },
    { value: '@chinmay', label: 'Chinmay Pawar', description: 'Performance Marketing Lead', icon: User, bgColor: '#f5f3ff', iconColor: '#7c3aed', section: 'Performance Marketing' },
  ], []);

  const filteredMentions = useMemo(() => {
    if (!showMentionDropdown) return [];
    return MENTION_OPTIONS.filter(m =>
      m.value.toLowerCase().includes(`@${mentionQuery}`) ||
      m.label.toLowerCase().includes(mentionQuery)
    );
  }, [showMentionDropdown, mentionQuery, MENTION_OPTIONS]);

  const insertMention = useCallback((mentionValue: string) => {
    const before = uploadNote.slice(0, mentionStartIdx);
    const after = uploadNote.slice(noteRef.current?.selectionStart || mentionStartIdx);
    const newNote = `${before}${mentionValue} ${after}`;
    if (newNote.length <= 500) {
      setUploadNote(newNote);
      setShowMentionDropdown(false);
      // Refocus and place cursor after mention
      setTimeout(() => {
        if (noteRef.current) {
          noteRef.current.focus();
          const pos = before.length + mentionValue.length + 1;
          noteRef.current.selectionStart = pos;
          noteRef.current.selectionEnd = pos;
        }
      }, 0);
    }
  }, [uploadNote, mentionStartIdx]);

  const hasBregoteamMention = /@bregoteam\b/i.test(uploadNote);
  const mentionedMemberNames = ['zubear', 'irshad', 'tejas', 'chinmay'].filter(n => new RegExp(`@${n}\\b`, 'i').test(uploadNote));
  const hasAnyTeamMention = hasBregoteamMention || mentionedMemberNames.length > 0;

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={onClose}
        >
          <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Manrope, sans-serif', zIndex: 99999 } }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl w-[700px] max-h-[88vh] overflow-hidden flex flex-col" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF1FB' }}>
                  <Upload className="w-5 h-5" style={{ color: BRAND }} />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {uploadType === 'image' ? 'Upload Images' : 'Upload Documents'}
                  </h3>
                  <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>
                    Upload & save to your Dataroom folder
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Close dialog">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Step 1: File Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: totalFiles > 0 ? '#22c55e' : BRAND, fontWeight: 700 }}>
                    {totalFiles > 0 ? <Check className="w-3 h-3" /> : '1'}
                  </div>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                    Select Files
                  </span>
                  {totalFiles > 0 && (
                    <span className="text-[13px] text-gray-500 ml-1" style={{ fontWeight: 500 }}>
                      {totalFiles} file{totalFiles !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                {/* Drop zone — always visible for adding more files */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 ${
                    totalFiles > 0 ? 'p-4' : 'p-8'
                  } ${
                    isDragOver
                      ? 'border-[#204CC7] bg-[#EEF1FB]/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept={acceptTypes}
                    onChange={handleInputChange}
                  />
                  {totalFiles === 0 ? (
                    <>
                      <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                        isDragOver ? 'bg-[#204CC7]/10' : 'bg-gray-100'
                      }`}>
                        <Upload className={`w-6 h-6 ${isDragOver ? 'text-[#204CC7]' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-1" style={{ fontWeight: 500 }}>
                        {isDragOver ? 'Drop your files here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-xs text-gray-400">
                        or <span className="text-[#204CC7]" style={{ fontWeight: 500 }}>browse from your computer</span>
                      </p>
                      <p className="text-[10px] text-gray-300 mt-2">
                        {uploadType === 'image' ? 'JPG, PNG, WEBP up to 25MB each' : 'PDF, DOC, XLS, CSV, PPT up to 50MB each'} · Multiple files supported
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs" style={{ fontWeight: 500 }}>
                        {isDragOver ? 'Drop to add more files' : 'Add more files'}
                      </span>
                    </div>
                  )}
                </div>

                {/* File list */}
                {totalFiles > 0 && (
                  <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    <AnimatePresence mode="popLayout">
                      {fileEntries.map(entry => (
                        <FileRow
                          key={entry.id}
                          entry={entry}
                          onRemove={() => removeFile(entry.id)}
                          canRemove={!isUploading}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Smart Suggestion */}
              <AnimatePresence>
                {suggestion && !isUploading && selectedFolderId !== suggestion.folderId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/50">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-amber-800" style={{ fontWeight: 600 }}>Smart suggestion</p>
                        <p className="text-[13px] text-amber-600">
                          Based on file names → <span style={{ fontWeight: 600 }}>{suggestion.label}</span>
                          {suggestion.confidence >= 0.8 && ' (high confidence)'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedService(suggestion.service);
                          setSelectedFolderId(suggestion.folderId);
                        }}
                        className="px-3 py-1.5 text-[13px] text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex-shrink-0"
                        style={{ fontWeight: 600 }}
                      >
                        Use this
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Choose Dataroom Folder */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: selectedFolderId ? '#22c55e' : (totalFiles > 0 ? BRAND : '#d1d5db'), fontWeight: 700 }}>
                    {selectedFolderId ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>Choose Dataroom Folder</span>
                  {suggestion && selectedFolderId === suggestion.folderId && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      <Sparkles className="w-2.5 h-2.5" /> AI suggested
                    </span>
                  )}
                </div>

                {/* Service Tabs */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-3">
                  <button
                    onClick={() => { if (!isUploading) { setSelectedService('accounts'); setSelectedFolderId(null); } }}
                    className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-md text-xs transition-all ${
                      selectedService === 'accounts'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${isUploading ? 'pointer-events-none' : ''}`}
                    style={{ fontWeight: selectedService === 'accounts' ? 600 : 400 }}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Accounts & Taxation
                  </button>
                  <button
                    onClick={() => { if (!isUploading) { setSelectedService('performance'); setSelectedFolderId(null); } }}
                    className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-md text-xs transition-all ${
                      selectedService === 'performance'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${isUploading ? 'pointer-events-none' : ''}`}
                    style={{ fontWeight: selectedService === 'performance' ? 600 : 400 }}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Performance Marketing
                  </button>
                </div>

                {/* Folder Tree */}
                <div className={`border border-gray-200 rounded-xl max-h-[220px] overflow-y-auto p-2 scrollbar-thin ${isUploading ? 'pointer-events-none opacity-60' : ''}`}>
                  <FolderPicker
                    items={items}
                    service={selectedService}
                    selectedFolderId={selectedFolderId}
                    suggestedFolderId={suggestion?.service === selectedService ? suggestion.folderId : null}
                    onSelect={(id) => { setSelectedFolderId(id); setDuplicateWarning(null); }}
                  />
                </div>

                {/* Selected Path */}
                <AnimatePresence>
                  {selectedFolderPath && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-[#EEF1FB]/60 rounded-lg border border-[#204CC7]/10">
                        <FolderOpen className="w-3.5 h-3.5 text-[#204CC7] flex-shrink-0" />
                        <span className="text-xs text-[#204CC7] truncate" style={{ fontWeight: 500 }}>
                          {selectedService === 'accounts' ? 'Accounts & Taxation' : 'Performance Marketing'} / {selectedFolderPath}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Upload Note — inline composer that slides in when ready */}
              <AnimatePresence>
                {totalFiles > 0 && selectedFolderId && !isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0 relative">
                          <textarea
                            ref={noteRef}
                            value={uploadNote}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.length > 500) return;
                              setUploadNote(val);

                              // @ mention detection
                              const cursorPos = e.target.selectionStart || 0;
                              const textBefore = val.slice(0, cursorPos);
                              const atMatch = textBefore.match(/@(\w*)$/);
                              if (atMatch) {
                                setShowMentionDropdown(true);
                                setMentionQuery(atMatch[1].toLowerCase());
                                setMentionStartIdx(cursorPos - atMatch[0].length);
                              } else {
                                setShowMentionDropdown(false);
                                setMentionQuery('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (showMentionDropdown && filteredMentions.length > 0) {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                  e.preventDefault();
                                  insertMention(filteredMentions[0].value);
                                } else if (e.key === 'Escape') {
                                  setShowMentionDropdown(false);
                                }
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on dropdown
                              setTimeout(() => setShowMentionDropdown(false), 200);
                            }}
                            onInput={(e) => {
                              const el = e.target as HTMLTextAreaElement;
                              el.style.height = 'auto';
                              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                            }}
                            placeholder="Add a note for your team... Type @ to mention"
                            rows={1}
                            className="w-full px-3 py-2.5 text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#204CC7]/20 focus:border-[#204CC7]/40 focus:bg-white transition-all placeholder:text-gray-400/70"
                            style={{ minHeight: '40px', fontFamily: 'Manrope, sans-serif' }}
                          />

                          {/* @Mention Dropdown */}
                          <AnimatePresence>
                            {showMentionDropdown && filteredMentions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute left-0 right-0 bottom-full mb-1.5 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                              >
                                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-2">
                                  <AtSign className="w-3 h-3 text-gray-400" />
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide" style={{ fontWeight: 600 }}>Mention</p>
                                </div>
                                {(() => {
                                  let lastSection = '';
                                  return filteredMentions.map(m => {
                                    const showSection = m.section !== lastSection;
                                    lastSection = m.section;
                                    return (
                                      <div key={m.value}>
                                        {showSection && (
                                          <div className="px-3 pt-2 pb-1">
                                            <p className="text-[9px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>{m.section}</p>
                                          </div>
                                        )}
                                        <button
                                          onMouseDown={(e) => { e.preventDefault(); insertMention(m.value); }}
                                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#EEF1FB]/60 transition-colors text-left group/mention"
                                        >
                                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.bgColor }}>
                                            <m.icon className="w-4 h-4" style={{ color: m.iconColor }} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{m.label}</p>
                                            <p className="text-[10px] text-gray-400">{m.description}</p>
                                          </div>
                                          <span className="text-[10px] text-gray-300 group-hover/mention:text-[#204CC7] transition-colors" style={{ fontWeight: 500 }}>
                                            Tab / Enter
                                          </span>
                                        </button>
                                      </div>
                                    );
                                  });
                                })()}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Note with rendered @mention preview */}
                          {uploadNote.length > 0 && (
                            <div className="flex items-center justify-between mt-1.5 px-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {hasBregoteamMention && (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                                    <Users className="w-2.5 h-2.5" />
                                    Brego Team will be notified
                                  </span>
                                )}
                                {!hasBregoteamMention && mentionedMemberNames.length > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                                    <User className="w-2.5 h-2.5" />
                                    {mentionedMemberNames.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ')} will be notified
                                  </span>
                                )}
                                {!hasAnyTeamMention && (
                                  <p className="text-[10px] text-gray-400">
                                    This note will appear in the chat alongside your upload
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] ${uploadNote.length > 450 ? 'text-amber-500' : 'text-gray-300'}`} style={{ fontWeight: 500 }}>
                                {uploadNote.length}/500
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duplicate Warning Banner */}
            <AnimatePresence>
              {duplicateWarning && duplicateWarning.length > 0 && !isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-orange-100"
                >
                  <div className="px-6 py-3 bg-orange-50/80">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-orange-800" style={{ fontWeight: 600 }}>
                          {duplicateWarning.length === 1
                            ? 'A file with this name already exists in this folder'
                            : `${duplicateWarning.length} files already exist in this folder`}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {duplicateWarning.slice(0, 3).map((name, i) => (
                            <p key={i} className="text-[13px] text-orange-600 truncate">{name}</p>
                          ))}
                          {duplicateWarning.length > 3 && (
                            <p className="text-[10px] text-orange-500">+{duplicateWarning.length - 3} more</p>
                          )}
                        </div>
                        <p className="text-[13px] text-orange-500 mt-1.5">Choose <span style={{ fontWeight: 600 }}>Rename</span> to keep both, or <span style={{ fontWeight: 600 }}>Upload Anyway</span> to update as a new version.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 ml-6.5">
                      <button
                        onClick={() => setDuplicateWarning(null)}
                        className="px-3 py-1.5 text-[13px] text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={renameAndUpload}
                        className="px-3 py-1.5 text-[13px] text-white rounded-lg transition-colors"
                        style={{ fontWeight: 600, backgroundColor: BRAND }}
                      >
                        Rename & Upload
                      </button>
                      <button
                        onClick={() => {
                          isVersionUpload.current = true;
                          startUpload();
                        }}
                        className="px-3 py-1.5 text-[13px] text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        Upload Anyway
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                {isUploading && !allDone && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#204CC7] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                      Uploading {completedFiles}/{totalFiles}...
                    </span>
                  </div>
                )}
                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs" style={{ fontWeight: 500 }}>
                      {totalFiles} file{totalFiles !== 1 ? 's' : ''} saved to Dataroom
                    </span>
                  </motion.div>
                )}
              </div>
              {!isUploading && (
                <button
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className={`px-5 py-2 text-sm text-white rounded-lg transition-all flex items-center gap-2 ${
                    canUpload
                      ? 'hover:opacity-90 shadow-sm'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: BRAND, fontWeight: 600 }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload {totalFiles > 1 ? `${totalFiles} Files` : totalFiles === 1 ? '1 File' : ''}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}