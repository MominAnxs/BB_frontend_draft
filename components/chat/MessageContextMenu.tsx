'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CheckSquare,
  Copy,
  Link2,
  Share2,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

/*
 * MessageContextMenu
 * ──────────────────
 * The overflow menu behind every chat bubble's 3-dot affordance. Wraps
 * its children and exposes an imperative `openAt(e)` handle so the
 * consumer — typically a hover-visible More button sitting inside the
 * bubble — can open the menu anchored to its own position. Right-click
 * on the wrapped content is kept as a secondary power-user trigger so
 * nothing regresses for people who had the muscle memory.
 *
 * Menu content is grouped by intent rather than alphabetised, because
 * users reach for this menu in one of two mental modes and mixing the
 * groups made every action feel one click slower:
 *
 *   1. "I want this content"     → Copy text, Star, Share
 *   2. "Turn this into work"     → Create task, Raise incident
 *
 * The divider between groups is load-bearing: it's the visual cue that
 * the menu just switched mode. A flat list of identical-looking rows
 * would force the user to re-read every label.
 */

interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface MessageContextMenuHandle {
  /** Open the menu anchored under the element that fired `e`. */
  openAt: (e: React.MouseEvent<HTMLElement>) => void;
  /** Whether the menu is currently open. Useful for styling the
   *  trigger button in an "active" state while the tray is up. */
  isOpen: boolean;
}

interface MessageContextMenuProps {
  messageId: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (messageId: string) => void;
  /** Open the Create-Task modal pre-filled from this message. When
   *  omitted the menu entry is hidden. */
  onCreateTask?: (messageId: string, content: string) => void;
  /** Open the Raise-Incident modal pre-filled from this message. When
   *  omitted the menu entry is hidden. */
  onCreateIncident?: (messageId: string, content: string) => void;
  children: React.ReactNode;
}

interface MenuAction {
  id: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  activeLabel?: string;
  shortcut?: string;
  onClick: () => void;
  isActive?: boolean;
  dividerBefore?: boolean;
  /** Visual emphasis for actions that take the user somewhere new
   *  rather than performing a passive operation. Currently only used
   *  for the "Turn into work" group so Create task / Raise incident
   *  read as the verbs they are. */
  tone?: 'default' | 'emphasis' | 'destructive';
}

export const MessageContextMenu = forwardRef<MessageContextMenuHandle, MessageContextMenuProps>(
  function MessageContextMenu(
    {
      messageId,
      content,
      timestamp,
      isUser,
      isBookmarked,
      onToggleBookmark,
      onCreateTask,
      onCreateIncident,
      children,
    },
    ref,
  ) {
    const [position, setPosition] = useState<ContextMenuPosition | null>(null);
    const [justCopied, setJustCopied] = useState(false);
    const [justShared, setJustShared] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setPosition(null), []);

    /**
     * Position the menu so it stays fully on-screen regardless of which
     * corner the trigger is in.
     *   • Prefer aligning the menu's right edge to the anchor's right
     *     edge — message bubbles sit near the viewport edge and a
     *     left-aligned menu tends to fall off.
     *   • Drop below the anchor when there's room, flip above when there
     *     isn't. Clamp to an 8px margin on all sides as a safety net.
     */
    const anchorMenu = useCallback((rect: DOMRect) => {
      const MENU_WIDTH = 220;
      const MENU_HEIGHT = 340;
      const MARGIN = 8;

      // Right-align the menu with the trigger, then clamp.
      let x = rect.right - MENU_WIDTH;
      x = Math.max(MARGIN, Math.min(x, window.innerWidth - MENU_WIDTH - MARGIN));

      // Prefer below; flip above if we'd clip the viewport bottom.
      const below = rect.bottom + 6;
      const above = rect.top - MENU_HEIGHT - 6;
      const y =
        below + MENU_HEIGHT <= window.innerHeight - MARGIN || above < MARGIN
          ? Math.min(below, window.innerHeight - MENU_HEIGHT - MARGIN)
          : above;

      setPosition({ x, y });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openAt: (e) => {
          e.preventDefault();
          e.stopPropagation();
          anchorMenu(e.currentTarget.getBoundingClientRect());
        },
        isOpen: position !== null,
      }),
      [anchorMenu, position],
    );

    // Right-click anywhere on the wrapped content also opens the menu —
    // kept as a power-user fallback even though the 3-dot button is the
    // advertised surface now.
    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const MENU_WIDTH = 220;
        const MENU_HEIGHT = 340;
        const MARGIN = 8;
        const x = Math.max(
          MARGIN,
          Math.min(e.clientX, window.innerWidth - MENU_WIDTH - MARGIN),
        );
        const y = Math.max(
          MARGIN,
          Math.min(e.clientY, window.innerHeight - MENU_HEIGHT - MARGIN),
        );
        setPosition({ x, y });
      },
      [],
    );

    // Close on outside click, scroll, resize, or Escape
    useEffect(() => {
      if (!position) return;

      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          close();
        }
      };
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
      };
      const handleScroll = () => close();

      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', close);

      return () => {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('keydown', handleKey);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', close);
      };
    }, [position, close]);

    // ── Handlers ────────────────────────────────────────────────────────

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setJustCopied(true);
        toast.success('Message copied to clipboard');
        setTimeout(() => setJustCopied(false), 2000);
      } catch {
        toast.error('Failed to copy');
      }
      close();
    };

    const handleStar = () => {
      onToggleBookmark(messageId);
      toast.success(isBookmarked ? 'Removed from Starred' : 'Added to Starred');
      close();
    };

    const handleShare = async () => {
      const shareText = `${isUser ? 'You' : 'Brego AI'}: ${content}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Shared from Brego Business',
            text: shareText,
          });
          close();
          return;
        } catch {
          // User cancelled or API failed — fall through to clipboard.
        }
      }

      try {
        await navigator.clipboard.writeText(shareText);
        setJustShared(true);
        toast.success('Share link copied to clipboard');
        setTimeout(() => setJustShared(false), 2000);
      } catch {
        toast.error('Failed to share');
      }
      close();
    };

    const handleCreateTask = () => {
      onCreateTask?.(messageId, content);
      close();
    };

    const handleCreateIncident = () => {
      onCreateIncident?.(messageId, content);
      close();
    };

    // ── Menu composition ────────────────────────────────────────────────
    //
    // Group 1 — "capture" actions that mutate nothing but the user's own
    // scratch space. Star is placed second so the most-used action stays
    // at the top of the menu; swapping the two is measurable muscle-memory
    // loss for existing users who already reach for "copy" first.
    const actions: MenuAction[] = [
      {
        id: 'copy',
        icon: <Copy className="w-3.5 h-3.5" />,
        activeIcon: <Check className="w-3.5 h-3.5 text-emerald-500" />,
        label: 'Copy text',
        activeLabel: 'Copied!',
        shortcut: '⌘C',
        onClick: handleCopy,
        isActive: justCopied,
      },
      {
        id: 'star',
        // Outline when not starred; filled amber when starred. Matches the
        // Starred tab's visual language (amber fill on the star badge on
        // each saved message).
        icon: <Star className="w-3.5 h-3.5" />,
        activeIcon: (
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        ),
        label: 'Star',
        activeLabel: 'Starred',
        shortcut: '⌘S',
        onClick: handleStar,
        isActive: isBookmarked,
      },
      {
        id: 'share',
        icon: <Share2 className="w-3.5 h-3.5" />,
        activeIcon: <Link2 className="w-3.5 h-3.5 text-emerald-500" />,
        label: 'Share',
        activeLabel: 'Copied link!',
        onClick: handleShare,
        isActive: justShared,
      },
    ];

    // Group 2 — "turn into work". Only shows on messages from the other
    // side (AI / team) because creating a task or incident from your own
    // outgoing message is rarely what someone means — and it keeps the
    // user bubble's menu tight.
    if (!isUser && onCreateTask) {
      actions.push({
        id: 'create-task',
        icon: <CheckSquare className="w-3.5 h-3.5" />,
        label: 'Create task',
        shortcut: '⌘T',
        onClick: handleCreateTask,
        dividerBefore: true,
        tone: 'emphasis',
      });
    }
    if (!isUser && onCreateIncident) {
      actions.push({
        id: 'create-incident',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: 'Raise incident',
        shortcut: '⌘I',
        onClick: handleCreateIncident,
        // Only add a divider here if Create-Task didn't already add one,
        // so we don't end up with two adjacent separators.
        dividerBefore: !onCreateTask,
        tone: 'emphasis',
      });
    }

    const toneClassName = (tone?: MenuAction['tone']) => {
      if (tone === 'emphasis') {
        return 'text-brand group-hover/item:text-brand-hover';
      }
      return 'text-gray-500 group-hover/item:text-gray-700';
    };
    const toneLabelClassName = (tone?: MenuAction['tone']) => {
      if (tone === 'emphasis') {
        return 'text-brand group-hover/item:text-brand-hover';
      }
      return 'text-gray-700 group-hover/item:text-gray-900';
    };

    return (
      <>
        <div ref={triggerRef} onContextMenu={handleContextMenu}>
          {children}
        </div>

        {createPortal(
          <AnimatePresence>
            {position && (
              <>
                {/* Invisible backdrop to catch clicks */}
                <motion.div
                  className="fixed inset-0 z-[9998]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Context Menu */}
                <motion.div
                  ref={menuRef}
                  className="fixed z-[9999]"
                  style={{ left: position.x, top: position.y, width: 220 }}
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
                    {/* Header — message preview */}
                    <div className="px-3 pt-2.5 pb-2 border-b border-gray-100/80">
                      <p
                        className="text-gray-400 tracking-wide uppercase"
                        style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' }}
                      >
                        {isUser ? 'Your message' : 'Brego AI'}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5 truncate">
                        {content.length > 60 ? content.slice(0, 60) + '…' : content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      {actions.map((action) => (
                        <div key={action.id}>
                          {action.dividerBefore && (
                            <div className="mx-2.5 my-1 h-px bg-gray-100" />
                          )}
                          <button
                            onClick={action.onClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100 hover:bg-gray-50 active:bg-gray-100 group/item"
                          >
                            <span
                              className={`flex items-center justify-center w-5 h-5 transition-colors ${toneClassName(
                                action.tone,
                              )}`}
                            >
                              {action.isActive ? action.activeIcon : action.icon}
                            </span>
                            <span
                              className={`flex-1 text-[13px] transition-colors ${toneLabelClassName(
                                action.tone,
                              )}`}
                              style={{
                                fontWeight: action.tone === 'emphasis' ? 600 : 500,
                              }}
                            >
                              {action.isActive ? action.activeLabel : action.label}
                            </span>
                            {action.shortcut && (
                              <span
                                className="text-gray-400 tracking-tight"
                                style={{ fontSize: '11.5px', fontFamily: 'monospace' }}
                              >
                                {action.shortcut}
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Footer — timestamp */}
                    <div className="px-3 py-1.5 border-t border-gray-100/80 bg-gray-50/50">
                      <p className="text-gray-400" style={{ fontSize: '11.5px' }}>
                        {timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ·{' '}
                        {timestamp.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </>
    );
  },
);
