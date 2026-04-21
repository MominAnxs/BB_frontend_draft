'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  TrendingUp,
  FileText,
  Check,
  ArrowRight,
  Star,
  Plus,
} from 'lucide-react';

interface ServiceSwitcherProps {
  currentService: 'marketing' | 'finance';
  onSwitch: (service: 'marketing' | 'finance') => void;
  hasBothServices: boolean;
  onActivateService?: (service: 'marketing' | 'finance') => void;
  onAddBusiness?: () => void;
}

const CROSS_SELL = {
  finance: {
    label: 'Accounts & Taxation',
    headline: 'Streamline your finances',
    stat: '12 hrs/week saved on avg.',
    accentColor: '#059669',
    accentLight: '#f0fdf8',
    cardBg: 'linear-gradient(145deg, #f0fdf8 0%, #ecfdf5 100%)',
    rating: 4.8,
    reviews: 340,
    benefits: [
      'GST filing & ITR compliance handled',
      'Real-time P&L and cash flow reports',
      'Dedicated CA-led finance team',
    ],
    cta: 'Explore Finance',
  },
  marketing: {
    label: 'Performance Marketing',
    headline: 'Scale your revenue',
    stat: '2.4× avg. ROAS in 90 days',
    accentColor: '#204CC7',
    accentLight: '#f0f3ff',
    cardBg: 'linear-gradient(145deg, #f0f3ff 0%, #eef1fb 100%)',
    rating: 4.9,
    reviews: 520,
    benefits: [
      'AI-optimised Meta & Google campaigns',
      'Real-time ROAS & conversion tracking',
      'Dedicated performance marketing team',
    ],
    cta: 'Explore Marketing',
  },
};

const SERVICES = [
  {
    id: 'marketing' as const,
    label: 'Performance Marketing',
    icon: TrendingUp,
    color: '#204CC7',
    lightBg: '#f0f3ff',
  },
  {
    id: 'finance' as const,
    label: 'Accounts & Taxation',
    icon: FileText,
    color: '#059669',
    lightBg: '#f0fdf8',
  },
];

export function ServiceSwitcher({
  currentService,
  onSwitch,
  hasBothServices,
  onActivateService,
  onAddBusiness,
}: ServiceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, triggerWidth: 0 });

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, triggerWidth: r.width });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [isOpen, updatePos]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        panelRef.current &&
        !panelRef.current.contains(t)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const cur = SERVICES.find((s) => s.id === currentService)!;
  const otherServiceId = currentService === 'marketing' ? 'finance' : 'marketing';
  const promo = CROSS_SELL[otherServiceId];

  const panelWidth = hasBothServices ? pos.triggerWidth : Math.max(pos.triggerWidth, 272);

  /* ─── portal dropdown ─── */
  const panel = isOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.4, 1] }}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: panelWidth,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow:
                  '0 10px 40px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* ── Active service row ── */}
              <div style={{ padding: '6px 6px 0' }}>
                {SERVICES.map((svc) => {
                  const Icon = svc.icon;
                  const isActive = svc.id === currentService;
                  const isAvailable = hasBothServices || isActive;
                  if (!isAvailable) return null;

                  return (
                    <button
                      key={svc.id}
                      onClick={() => {
                        if (!isActive && hasBothServices) onSwitch(svc.id);
                        setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '11px',
                        border: 'none',
                        cursor: isActive && !hasBothServices ? 'default' : 'pointer',
                        background: isActive ? svc.lightBg : 'transparent',
                        transition: 'background 0.15s',
                        fontFamily: 'Manrope, sans-serif',
                        marginBottom: hasBothServices ? 2 : 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isActive ? `${svc.color}12` : '#f3f4f6',
                        }}
                      >
                        <Icon
                          style={{
                            width: 14,
                            height: 14,
                            color: isActive ? svc.color : '#9ca3af',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#111827' : '#374151',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {svc.label}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: svc.color,
                              marginTop: 1,
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      {/* Checkmark for dual-service inactive row only */}
                      {isActive && hasBothServices && (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: svc.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Check style={{ width: 11, height: 11, color: '#fff' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Cross-sell card (single-service users only) ── */}
              {!hasBothServices && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background: '#f1f3f5',
                      margin: '6px 14px 0',
                    }}
                  />

                  <div style={{ padding: '10px 8px 8px' }}>
                    <div
                      style={{
                        borderRadius: '14px',
                        background: promo.cardBg,
                        border: `1px solid ${promo.accentColor}10`,
                        padding: '18px 16px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Subtle ambient glow */}
                      <div
                        style={{
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          background: promo.accentColor,
                          opacity: 0.035,
                          filter: 'blur(24px)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Headline */}
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          fontFamily: 'Manrope, sans-serif',
                          color: '#111827',
                          margin: 0,
                          lineHeight: 1.35,
                        }}
                      >
                        {promo.headline}
                      </p>

                      {/* Stat pill */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '8px',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: `${promo.accentColor}0c`,
                        }}
                      >
                        <TrendingUp
                          style={{ width: 10, height: 10, color: promo.accentColor }}
                        />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            fontFamily: 'Manrope, sans-serif',
                            color: promo.accentColor,
                          }}
                        >
                          {promo.stat}
                        </span>
                      </div>

                      {/* Benefits */}
                      <div
                        style={{
                          marginTop: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {promo.benefits.map((b, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '9px',
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: `${promo.accentColor}14`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              <Check
                                style={{
                                  width: 9,
                                  height: 9,
                                  color: promo.accentColor,
                                  strokeWidth: 3,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: 'Manrope, sans-serif',
                                color: '#374151',
                                lineHeight: 1.4,
                              }}
                            >
                              {b}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Service Rating */}
                      <div
                        style={{
                          marginTop: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              style={{
                                width: 11,
                                height: 11,
                                color: i < Math.floor(promo.rating) ? '#f59e0b' : '#e5e7eb',
                                fill: i < Math.floor(promo.rating) ? '#f59e0b' : 'none',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'Manrope, sans-serif',
                            color: '#1f2937',
                          }}
                        >
                          {promo.rating}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            fontFamily: 'Manrope, sans-serif',
                            color: '#9ca3af',
                          }}
                        >
                          ({promo.reviews}+ reviews)
                        </span>
                      </div>

                      {/* CTA */}
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          setIsOpen(false);
                          onActivateService?.(otherServiceId);
                        }}
                        style={{
                          marginTop: '18px',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 0',
                          borderRadius: '10px',
                          border: 'none',
                          color: '#fff',
                          background: promo.accentColor,
                          boxShadow: `0 2px 8px ${promo.accentColor}28`,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'Manrope, sans-serif',
                          transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${promo.accentColor}38`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 8px ${promo.accentColor}28`;
                        }}
                      >
                        {promo.cta}
                        <ArrowRight style={{ width: 14, height: 14 }} />
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Add New Business row — REMOVED, now in ProfileDropdown ── */}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '12px',
          border: isOpen ? `1.5px solid ${cur.color}35` : '1px solid #e5e7eb',
          background: isOpen ? cur.lightBg : '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'Manrope, sans-serif',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }
        }}
      >
        {/* Live dot */}
        <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: cur.color,
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              background: cur.color,
              opacity: 0.25,
              animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
        </span>

        <span
          style={{
            flex: 1,
            textAlign: 'left',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1f2937',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {cur.label}
        </span>

        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: '#9ca3af',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {panel}
    </>
  );
}
