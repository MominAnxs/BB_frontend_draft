'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// ─── Types (shared with Dataroom) ────────────────────────────────────────────

export type ItemType = 'folder' | 'pdf' | 'spreadsheet' | 'document' | 'image';

export interface FileVersion {
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DriveItem {
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
  /** Previous versions of this file (newest first) */
  versions?: FileVersion[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

let _uid = 1000;
export const uid = () => `dr-${++_uid}`;

function randomDate(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const d = new Date(s + Math.random() * (e - s));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nowDate() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Data builder ────────────────────────────────────────────────────────────

function buildInitialData(): DriveItem[] {
  const items: DriveItem[] = [];

  const fyId = uid();
  items.push({ id: fyId, name: 'FY 2025-26', type: 'folder', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Dec 15, 2025', fileSize: '—', starred: false, service: 'accounts' });

  const boaId = uid();
  items.push({ id: boaId, name: 'BOA', type: 'folder', parentId: fyId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Dec 10, 2025', fileSize: '—', starred: false, service: 'accounts' });

  const boaCategories = ['Sales', 'Purchases', 'Expenses', 'Bank Statement', 'Card Statement', 'Other'];
  const boaSampleFiles: Record<string, { name: string; type: ItemType; size: string }[]> = {
    'Sales': [{ name: 'Sales Invoice #1042.pdf', type: 'pdf', size: '245 KB' }, { name: 'Sales Register.xlsx', type: 'spreadsheet', size: '1.2 MB' }],
    'Purchases': [{ name: 'Purchase Order #887.pdf', type: 'pdf', size: '180 KB' }, { name: 'Vendor Invoice - ABC Traders.pdf', type: 'pdf', size: '312 KB' }],
    'Expenses': [{ name: 'Expense Report - Feb 2026.xlsx', type: 'spreadsheet', size: '890 KB' }, { name: 'Utility Bill Receipt.pdf', type: 'pdf', size: '156 KB' }],
    'Bank Statement': [{ name: 'HDFC Current A/c Statement.pdf', type: 'pdf', size: '1.8 MB' }, { name: 'Bank Reconciliation.xlsx', type: 'spreadsheet', size: '450 KB' }],
    'Card Statement': [{ name: 'Credit Card Statement - AMEX.pdf', type: 'pdf', size: '220 KB' }],
    'Other': [{ name: 'Debit Notes.pdf', type: 'pdf', size: '98 KB' }],
  };

  boaCategories.forEach((cat) => {
    const catId = uid();
    items.push({ id: catId, name: cat, type: 'folder', parentId: boaId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2025-12-15'), fileSize: '—', starred: false, service: 'accounts' });
    MONTHS.forEach((month, mi) => {
      const monthId = uid();
      items.push({ id: monthId, name: month, type: 'folder', parentId: catId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2026-02-24'), fileSize: '—', starred: false, service: 'accounts' });
      if (mi < 3 && boaSampleFiles[cat]) {
        boaSampleFiles[cat].forEach(f => {
          items.push({ id: uid(), name: f.name, type: f.type, parentId: monthId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2026-02-24'), fileSize: f.size, starred: false, service: 'accounts' });
        });
      }
    });
  });

  const taxId = uid();
  items.push({ id: taxId, name: 'Tax', type: 'folder', parentId: fyId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Dec 12, 2025', fileSize: '—', starred: false, service: 'accounts' });

  const taxCategories = ['TDS', 'GST', 'Advance Tax', 'PT'];
  const taxSampleFiles: Record<string, { name: string; type: ItemType; size: string }[]> = {
    'TDS': [{ name: 'Form 26Q - Q3.pdf', type: 'pdf', size: '340 KB' }, { name: 'TDS Challan Receipt.pdf', type: 'pdf', size: '125 KB' }],
    'GST': [{ name: 'GSTR-1 Filing.pdf', type: 'pdf', size: '560 KB' }, { name: 'GSTR-3B Summary.xlsx', type: 'spreadsheet', size: '780 KB' }, { name: 'GST Reconciliation.xlsx', type: 'spreadsheet', size: '1.1 MB' }],
    'Advance Tax': [{ name: 'Advance Tax Challan - Q3.pdf', type: 'pdf', size: '210 KB' }, { name: 'Tax Computation Sheet.xlsx', type: 'spreadsheet', size: '450 KB' }],
    'PT': [{ name: 'PT Challan - Jan 2026.pdf', type: 'pdf', size: '88 KB' }],
  };

  taxCategories.forEach((cat) => {
    const catId = uid();
    items.push({ id: catId, name: cat, type: 'folder', parentId: taxId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2025-12-15'), fileSize: '—', starred: false, service: 'accounts' });
    MONTHS.forEach((month, mi) => {
      const monthId = uid();
      items.push({ id: monthId, name: month, type: 'folder', parentId: catId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2026-02-24'), fileSize: '—', starred: false, service: 'accounts' });
      if (mi < 3 && taxSampleFiles[cat]) {
        taxSampleFiles[cat].forEach(f => {
          items.push({ id: uid(), name: f.name, type: f.type, parentId: monthId, owner: 'Brego Business', ownerInitial: 'B', lastModified: randomDate('2025-04-01', '2026-02-24'), fileSize: f.size, starred: false, service: 'accounts' });
        });
      }
    });
  });

  // Performance Marketing
  const rawId = uid();
  items.push({ id: rawId, name: 'Raw Files', type: 'folder', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Dec 3, 2024', fileSize: '—', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Campaign Creatives - Q4.zip', type: 'document', parentId: rawId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Nov 28, 2024', fileSize: '45.2 MB', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Brand Assets.zip', type: 'document', parentId: rawId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Oct 15, 2024', fileSize: '120 MB', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Product Photography', type: 'folder', parentId: rawId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Nov 20, 2024', fileSize: '—', starred: false, service: 'performance' });

  const stockId = uid();
  items.push({ id: stockId, name: 'Stock Reports', type: 'folder', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Nov 16, 2024', fileSize: '—', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Meta Ads Report - Nov 2024.pdf', type: 'pdf', parentId: stockId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Nov 16, 2024', fileSize: '2.4 MB', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Google Ads Audit - Q3.pdf', type: 'pdf', parentId: stockId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Oct 8, 2024', fileSize: '3.1 MB', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Performance Dashboard Export.xlsx', type: 'spreadsheet', parentId: stockId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Nov 12, 2024', fileSize: '1.7 MB', starred: false, service: 'performance' });

  const miscId = uid();
  items.push({ id: miscId, name: 'Miscellaneous', type: 'folder', parentId: null, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Oct 14, 2024', fileSize: '—', starred: false, service: 'performance' });
  items.push({ id: uid(), name: 'Meeting Notes - Strategy Call.pdf', type: 'pdf', parentId: miscId, owner: 'Brego Business', ownerInitial: 'B', lastModified: 'Oct 14, 2024', fileSize: '345 KB', starred: false, service: 'performance' });

  return items;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface DataroomContextType {
  items: DriveItem[];
  setItems: React.Dispatch<React.SetStateAction<DriveItem[]>>;
  addFileToDataroom: (fileName: string, fileSize: string, folderId: string, service: 'accounts' | 'performance', ownerName?: string) => DriveItem;
  /** Upload a file that replaces an existing same-name file, pushing old metadata to versions */
  addFileAsVersion: (fileName: string, fileSize: string, folderId: string, service: 'accounts' | 'performance', ownerName?: string) => DriveItem;
  getFolderPath: (folderId: string) => string;
  getFolders: (service: 'accounts' | 'performance') => DriveItem[];
}

const DataroomContext = createContext<DataroomContextType | null>(null);

export function useDataroom() {
  const ctx = useContext(DataroomContext);
  if (!ctx) throw new Error('useDataroom must be used within DataroomProvider');
  return ctx;
}

export function DataroomProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DriveItem[]>(() => buildInitialData());

  const getFileType = useCallback((fileName: string): ItemType => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
    return 'document';
  }, []);

  const addFileToDataroom = useCallback((fileName: string, fileSize: string, folderId: string, service: 'accounts' | 'performance', ownerName: string = 'You') => {
    const newItem: DriveItem = {
      id: uid(),
      name: fileName,
      type: getFileType(fileName),
      parentId: folderId,
      owner: ownerName,
      ownerInitial: ownerName.charAt(0),
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileSize,
      starred: false,
      service,
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, [getFileType]);

  const addFileAsVersion = useCallback((fileName: string, fileSize: string, folderId: string, service: 'accounts' | 'performance', ownerName: string = 'You') => {
    const existingItem = items.find(i => i.name === fileName && i.parentId === folderId && i.service === service);
    if (existingItem) {
      const newItem: DriveItem = {
        id: uid(),
        name: fileName,
        type: getFileType(fileName),
        parentId: folderId,
        owner: ownerName,
        ownerInitial: ownerName.charAt(0),
        lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        fileSize,
        starred: false,
        service,
        versions: [
          {
            fileSize: existingItem.fileSize,
            uploadedAt: existingItem.lastModified,
            uploadedBy: existingItem.owner,
          },
          ...(existingItem.versions || []),
        ],
      };
      setItems(prev => prev.map(i => i.id === existingItem.id ? newItem : i));
      return newItem;
    }
    return addFileToDataroom(fileName, fileSize, folderId, service, ownerName);
  }, [items, getFileType, addFileToDataroom]);

  const getFolderPath = useCallback((folderId: string): string => {
    const parts: string[] = [];
    let id: string | null = folderId;
    while (id) {
      const item = items.find(i => i.id === id);
      if (item) { parts.unshift(item.name); id = item.parentId; } else break;
    }
    return parts.join(' / ');
  }, [items]);

  const getFolders = useCallback((service: 'accounts' | 'performance'): DriveItem[] => {
    return items.filter(i => i.type === 'folder' && i.service === service);
  }, [items]);

  const value = useMemo(() => ({
    items, setItems, addFileToDataroom, addFileAsVersion, getFolderPath, getFolders,
  }), [items, addFileToDataroom, addFileAsVersion, getFolderPath, getFolders]);

  return (
    <DataroomContext.Provider value={value}>
      {children}
    </DataroomContext.Provider>
  );
}
