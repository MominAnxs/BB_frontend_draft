'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

// Detect Mac vs Windows
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: isMac ? ['⌘', '⇧', '1-9'] : ['Ctrl', 'Shift', '1-9'], description: 'Switch between business accounts' },
      { keys: ['Esc'], description: 'Close active modal or panel' },
    ],
  },
  {
    title: 'Chat',
    shortcuts: [
      { keys: ['Enter'], description: 'Send message' },
      { keys: ['Shift', 'Enter'], description: 'New line in message' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: isMac ? ['⌘', '/'] : ['Ctrl', '/'], description: 'Open keyboard shortcuts' },
      { keys: ['?'], description: 'Open keyboard shortcuts (alternate)' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-[6px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200/60 overflow-hidden"
            style={{
              boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/15">
                    <Keyboard className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      Quick actions to navigate faster
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shortcut Groups */}
            <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    {group.title}
                  </h3>
                  <div className="space-y-1.5">
                    {group.shortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50/80 transition-colors group"
                      >
                        <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              <kbd
                                className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-gray-100 border border-gray-200/80 rounded-md text-[13px] font-medium text-gray-600"
                                style={{
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05), inset 0 -1px 0 rgba(0,0,0,0.05)',
                                }}
                              >
                                {key}
                              </kbd>
                              {ki < shortcut.keys.length - 1 && (
                                <span className="text-[10px] text-gray-300 mx-0.5">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100/80 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">
                Press <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-500 mx-0.5">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
