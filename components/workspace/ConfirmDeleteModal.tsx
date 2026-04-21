'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';

const BRAND = '#204CC7';

interface ConfirmDeleteModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ count, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  // Escape key to cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-[6px] flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <Trash2 className="w-4.5 h-4.5 text-red-600" />
            </div>
            <h3 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
              Confirm Deletion
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            You're about to permanently delete <span style={{ fontWeight: 600, color: '#111827' }}>{count} task{count > 1 ? 's' : ''}</span>. 
            This action can be undone using the undo button in the notification, but it's best to confirm you meant to do this.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-150"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 text-sm text-white rounded-xl hover:opacity-90 transition-all duration-150"
            style={{ backgroundColor: '#DC2626', fontWeight: 500, boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}
          >
            Delete {count} Task{count > 1 ? 's' : ''}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
