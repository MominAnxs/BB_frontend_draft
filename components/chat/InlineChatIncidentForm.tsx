'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  X,
  Upload,
  Plus,
  FileText,
  Paperclip,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

// ── Constants ───────────────────────────────────────────────────────────
const BRAND = '#204CC7';
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ALLOWED_EXT_LABEL = 'PNG, JPG, GIF, WebP, PDF, CSV, XLSX';

interface IncidentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface InlineIncidentResult {
  id: string;
  title: string;
  description: string;
  service: 'Performance Marketing' | 'Accounts & Taxation';
  dateTime: string;
  attachmentCount: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function InlineChatIncidentForm({
  defaultService,
  initialDescription,
  onClose,
  onSubmit,
}: {
  defaultService: 'Performance Marketing' | 'Accounts & Taxation';
  /**
   * Optional seed for the Description field — used when the form opens
   * from the 3-dot "Raise incident" action on a specific chat bubble so
   * the quoted message lands in the description and the user can add
   * detail after it. Seeded only on the initial render.
   */
  initialDescription?: string;
  onClose: () => void;
  onSubmit: (result: InlineIncidentResult) => void;
}) {
  const [service, setService] = useState<'Performance Marketing' | 'Accounts & Taxation'>(defaultService);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [attachments, setAttachments] = useState<IncidentAttachment[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isValid = title.trim().length >= 10 && description.trim().length >= 20;

  // ── Focus trap ─────────────────────────────────────────────────────────
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      `button:not([disabled]), input:not([disabled]):not([type='hidden']), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !submitted) {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Move focus into the modal on mount
    titleRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting, submitted]);

  // ── File processing ────────────────────────────────────────────────────
  const processFiles = (files: FileList | File[]) => {
    setFileError('');
    const fileArr = Array.from(files);
    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      setFileError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }
    const toAdd = fileArr.slice(0, remaining);
    const rejected: string[] = [];
    const validFiles: IncidentAttachment[] = [];
    toAdd.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push(`"${file.name}" — unsupported format`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`"${file.name}" — exceeds 10 MB`);
        return;
      }
      const att: IncidentAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      if (file.type.startsWith('image/')) {
        att.previewUrl = URL.createObjectURL(file);
      }
      validFiles.push(att);
    });
    if (rejected.length > 0) setFileError(rejected[0]);
    if (fileArr.length > remaining)
      setFileError(`Only ${remaining} more file${remaining === 1 ? '' : 's'} can be added (max ${MAX_FILES})`);
    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
    setFileError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (!isValid) return;
    setSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now
        .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        .toUpperCase();

      const result: InlineIncidentResult = {
        id: `inc-chat-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        service,
        dateTime: `${dateStr}, ${timeStr}`,
        attachmentCount: attachments.length,
      };

      setSubmitting(false);
      setSubmitted(true);

      // Auto-close after showing success
      setTimeout(() => {
        onSubmit(result);
      }, 1400);
    }, 800);
  };

  const fieldError = (condition: boolean) => attempted && !condition;

  const serviceOptions = [
    { key: 'Performance Marketing' as const, label: 'Performance Marketing', color: '#204CC7', icon: '📈' },
    { key: 'Accounts & Taxation' as const, label: 'Accounts & Taxation', color: '#7C3AED', icon: '📊' },
  ];

  // Unique IDs for aria associations
  const titleErrorId = 'incident-title-error';
  const descErrorId = 'incident-desc-error';
  const fileErrorId = 'incident-file-error';
  const footerErrorId = 'incident-footer-error';

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting && !submitted) onClose();
        }}
        role="presentation"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.8 }}
          className="bg-white rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: 520,
            maxHeight: 'min(720px, 90vh)',
            boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="incident-modal-title"
          aria-describedby="incident-modal-desc"
        >
          {/* ── Success State ─── */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex flex-col items-center justify-center py-16 px-8"
              role="status"
              aria-live="assertive"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}
              >
                <CheckCircle2 size={28} style={{ color: '#059669' }} aria-hidden="true" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', textAlign: 'center', fontFamily: 'Manrope, sans-serif' }}
              >
                Incident Raised
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '14px', fontWeight: 400, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 1.5, fontFamily: 'Manrope, sans-serif' }}
              >
                Your team has been notified and will respond shortly.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mt-5 px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Sparkles size={13} style={{ color: BRAND }} aria-hidden="true" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', fontFamily: 'Manrope, sans-serif' }}>Confirmation added to chat</span>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* ── Header ─── */}
              <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' }}
                      aria-hidden="true"
                    >
                      <AlertTriangle size={17} style={{ color: '#DC2626' }} />
                    </div>
                    <div>
                      <p id="incident-modal-title" style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, fontFamily: 'Manrope, sans-serif' }}>
                        Raise an Incident
                      </p>
                      <p id="incident-modal-desc" style={{ fontSize: '13px', fontWeight: 400, color: '#64748B', marginTop: 1, fontFamily: 'Manrope, sans-serif' }}>
                        Report an issue without leaving chat
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                    type="button"
                  >
                    <X size={16} style={{ color: '#64748B' }} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* ── Form ─── */}
              <div
                className="flex-1 overflow-y-auto px-6 py-5"
                style={{ scrollbarWidth: 'none' }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col gap-5">
                  {/* Service Pills — Radio group */}
                  <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                    <legend style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: 'Manrope, sans-serif' }}>
                      Service
                    </legend>
                    <div className="flex gap-2.5" role="radiogroup" aria-label="Select service type">
                      {serviceOptions.map((s) => {
                        const isSelected = service === s.key;
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setService(s.key)}
                            role="radio"
                            aria-checked={isSelected}
                            className="flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all duration-200"
                            style={{
                              border: `1.5px solid ${isSelected ? s.color : 'rgba(0,0,0,0.06)'}`,
                              backgroundColor: isSelected ? s.color + '08' : '#FAFBFC',
                              boxShadow: isSelected ? `0 1px 4px ${s.color}12` : 'none',
                              cursor: 'pointer',
                              fontFamily: 'Manrope, sans-serif',
                            }}
                          >
                            <div
                              className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: `2px solid ${isSelected ? s.color : '#D1D5DB'}`,
                                backgroundColor: isSelected ? s.color : 'transparent',
                              }}
                              aria-hidden="true"
                            >
                              {isSelected && <Check size={10} style={{ color: '#FFFFFF' }} strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400, color: isSelected ? s.color : '#6B7280' }}>
                              {s.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="incident-title"
                      style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: 'Manrope, sans-serif' }}
                    >
                      Title <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
                      <span className="sr-only"> (required)</span>
                    </label>
                    <input
                      ref={titleRef}
                      id="incident-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of the issue"
                      maxLength={120}
                      autoFocus
                      required
                      aria-required="true"
                      aria-invalid={fieldError(title.trim().length >= 10) || undefined}
                      aria-describedby={fieldError(title.trim().length >= 10) ? titleErrorId : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0F172A',
                        fontFamily: 'Manrope, sans-serif',
                        border: `1.5px solid ${fieldError(title.trim().length >= 10) ? '#FCA5A5' : 'rgba(0,0,0,0.07)'}`,
                        backgroundColor: '#FAFBFC',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = BRAND;
                        e.target.style.boxShadow = '0 0 0 3px rgba(32,76,199,0.08)';
                        e.target.style.backgroundColor = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldError(title.trim().length >= 10) ? '#FCA5A5' : 'rgba(0,0,0,0.07)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#FAFBFC';
                      }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {fieldError(title.trim().length >= 10) ? (
                        <p id={titleErrorId} role="alert" style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626', fontFamily: 'Manrope, sans-serif' }}>
                          {title.trim().length === 0 ? 'Title is required' : 'Minimum 10 characters'}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p aria-live="polite" style={{ fontSize: '13px', fontWeight: 400, color: title.length > 100 ? '#D97706' : '#6B7280', fontFamily: 'Manrope, sans-serif' }}>
                        {title.length}/120
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="incident-description"
                      style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: 'Manrope, sans-serif' }}
                    >
                      Description <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
                      <span className="sr-only"> (required)</span>
                    </label>
                    <textarea
                      id="incident-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What happened? When did it start? Any error messages?"
                      rows={4}
                      maxLength={500}
                      required
                      aria-required="true"
                      aria-invalid={fieldError(description.trim().length >= 20) || undefined}
                      aria-describedby={fieldError(description.trim().length >= 20) ? descErrorId : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200 resize-none"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#0F172A',
                        fontFamily: 'Manrope, sans-serif',
                        lineHeight: 1.6,
                        border: `1.5px solid ${fieldError(description.trim().length >= 20) ? '#FCA5A5' : 'rgba(0,0,0,0.07)'}`,
                        backgroundColor: '#FAFBFC',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = BRAND;
                        e.target.style.boxShadow = '0 0 0 3px rgba(32,76,199,0.08)';
                        e.target.style.backgroundColor = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldError(description.trim().length >= 20) ? '#FCA5A5' : 'rgba(0,0,0,0.07)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#FAFBFC';
                      }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {fieldError(description.trim().length >= 20) ? (
                        <p id={descErrorId} role="alert" style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626', fontFamily: 'Manrope, sans-serif' }}>
                          {description.trim().length === 0 ? 'Description is required' : 'Minimum 20 characters'}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p aria-live="polite" style={{ fontSize: '13px', fontWeight: 400, color: description.length > 450 ? '#D97706' : '#6B7280', fontFamily: 'Manrope, sans-serif' }}>
                        {description.length}/500
                      </p>
                    </div>
                  </div>

                  {/* ── Attachments — always visible ─── */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="incident-file-upload"
                        style={{ fontSize: '13px', fontWeight: 600, color: '#374151', fontFamily: 'Manrope, sans-serif' }}
                      >
                        Attachments{' '}
                        <span style={{ fontSize: '13px', fontWeight: 400, color: '#6B7280' }}>(optional)</span>
                      </label>
                      <p
                        aria-live="polite"
                        style={{
                          fontSize: '13px',
                          fontWeight: 400,
                          fontFamily: 'Manrope, sans-serif',
                          color: attachments.length >= MAX_FILES ? '#D97706' : '#6B7280',
                        }}
                      >
                        {attachments.length}/{MAX_FILES}
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      id="incident-file-upload"
                      type="file"
                      multiple
                      accept={ALLOWED_TYPES.join(',')}
                      className="sr-only"
                      aria-label={`Upload attachments. Allowed types: ${ALLOWED_EXT_LABEL}. Maximum ${MAX_FILES} files, 10 MB each.`}
                      onChange={(e) => {
                        if (e.target.files) processFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />

                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => attachments.length < MAX_FILES && fileInputRef.current?.click()}
                      className="rounded-xl transition-all duration-200"
                      role="button"
                      tabIndex={attachments.length < MAX_FILES ? 0 : -1}
                      aria-label={attachments.length === 0
                        ? `Drop files or click to browse. Allowed: ${ALLOWED_EXT_LABEL}. Max ${MAX_FILES} files, 10 MB each.`
                        : `${attachments.length} file${attachments.length !== 1 ? 's' : ''} attached. Click to add more.`
                      }
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && attachments.length < MAX_FILES) {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      style={{
                        border: `1.5px dashed ${dragOver ? BRAND : fileError ? '#FCA5A5' : 'rgba(0,0,0,0.10)'}`,
                        backgroundColor: dragOver ? 'rgba(32,76,199,0.03)' : '#FAFBFC',
                        padding: attachments.length === 0 ? '20px 16px' : '12px',
                        cursor: attachments.length < MAX_FILES ? 'pointer' : 'default',
                      }}
                    >
                      {attachments.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: dragOver ? 'rgba(32,76,199,0.08)' : '#F1F5F9' }}
                            aria-hidden="true"
                          >
                            <Upload size={16} style={{ color: dragOver ? BRAND : '#94A3B8' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: dragOver ? BRAND : '#374151', fontFamily: 'Manrope, sans-serif' }}>
                              {dragOver ? 'Drop files here' : 'Drop files or click to browse'}
                            </p>
                            <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', marginTop: 2, fontFamily: 'Manrope, sans-serif' }}>
                              {ALLOWED_EXT_LABEL} — Max {MAX_FILES} files, 10 MB each
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {attachments.map((att) => (
                            <motion.div
                              key={att.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center gap-2.5 p-2 rounded-lg group"
                              style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {att.previewUrl ? (
                                <div
                                  className="w-8 h-8 rounded-md flex-shrink-0 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${att.previewUrl})`, border: '1px solid rgba(0,0,0,0.06)' }}
                                  role="img"
                                  aria-label={`Preview of ${att.name}`}
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center"
                                  style={{ backgroundColor: '#F1F5F9' }}
                                  aria-hidden="true"
                                >
                                  <FileText size={14} style={{ color: att.type.includes('pdf') ? '#DC2626' : '#64748B' }} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
                                  {att.name}
                                </p>
                                <p style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', fontFamily: 'Manrope, sans-serif' }}>
                                  {formatFileSize(att.size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAttachment(att.id);
                                }}
                                className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 transition-all"
                                aria-label={`Remove file ${att.name}`}
                              >
                                <X size={12} style={{ color: '#DC2626' }} aria-hidden="true" />
                              </button>
                            </motion.div>
                          ))}
                          {attachments.length < MAX_FILES && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                              style={{ border: '1px dashed rgba(0,0,0,0.08)' }}
                              aria-label="Add more files"
                            >
                              <Plus size={12} style={{ color: '#94A3B8' }} aria-hidden="true" />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', fontFamily: 'Manrope, sans-serif' }}>Add more</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {fileError && (
                      <p id={fileErrorId} className="mt-1" role="alert" style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626', fontFamily: 'Manrope, sans-serif' }}>
                        {fileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Footer ─── */}
              <div
                className="px-6 py-3.5 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#FAFBFC' }}
              >
                <div className="flex items-center gap-2">
                  {attempted && !isValid && (
                    <motion.p
                      id={footerErrorId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      role="alert"
                      aria-live="assertive"
                      style={{ fontSize: '13px', fontWeight: 400, color: '#DC2626', fontFamily: 'Manrope, sans-serif' }}
                    >
                      Please complete required fields
                    </motion.p>
                  )}
                  {!attempted && attachments.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      <Paperclip size={12} style={{ color: '#94A3B8' }} aria-hidden="true" />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', fontFamily: 'Manrope, sans-serif' }}>
                        {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-150"
                    style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', fontFamily: 'Manrope, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-white transition-all duration-200"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      backgroundColor: submitting ? '#93B4FF' : BRAND,
                      opacity: submitting ? 0.85 : 1,
                      boxShadow: submitting ? 'none' : '0 2px 10px rgba(32,76,199,0.25)',
                    }}
                    aria-busy={submitting}
                    aria-describedby={attempted && !isValid ? footerErrorId : undefined}
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                          className="rounded-full"
                          style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }}
                          aria-hidden="true"
                        />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} aria-hidden="true" />
                        Raise Incident
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
