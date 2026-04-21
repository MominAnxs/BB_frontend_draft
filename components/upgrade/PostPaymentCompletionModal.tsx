'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, X, BarChart3, Users, Shield,
  MessageSquare, Zap, UserCheck,
} from 'lucide-react';

type BusinessType = 'leadgen' | 'ecommerce' | 'finance';

interface PostPaymentCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  businessType: BusinessType;
  /** Override headline — defaults to "Welcome to Brego Business" */
  headline?: string;
  /** Override subheadline — defaults to plan-active message */
  subheadline?: string;
  /** Override CTA label — defaults to "Setup your Dashboard" */
  ctaLabel?: string;
  /** If true, hide the close (X) button */
  hideClose?: boolean;
}

// ─── Canvas-based confetti — prominent multi-wave burst ────────────────
function ConfettiCanvas({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{
    x: number; y: number; vx: number; vy: number;
    w: number; h: number; color: string; rotation: number;
    rotSpeed: number; opacity: number; gravity: number;
    shape: 'rect' | 'circle' | 'strip';
  }[]>([]);

  const createBurst = useCallback(
    (canvas: HTMLCanvasElement, originY: number, count: number, spread: number) => {
      const realW = canvas.offsetWidth;
      const colors = [
        '#204CC7', '#6366F1', '#059669', '#F59E0B', '#EC4899',
        '#14B8A6', '#8B5CF6', '#3B82F6', '#F97316', '#10B981', '#EF4444',
      ];
      const shapes: ('rect' | 'circle' | 'strip')[] = ['rect', 'circle', 'strip'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * spread;
        particlesRef.current.push({
          x: realW / 2 + (Math.random() - 0.5) * 60,
          y: originY,
          vx: Math.cos(angle) * speed * (0.5 + Math.random()),
          vy: Math.sin(angle) * speed * 0.7 - Math.random() * 5,
          w: 3 + Math.random() * 7,
          h: 2 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 14,
          opacity: 1,
          gravity: 0.1 + Math.random() * 0.07,
          shape: shapes[Math.floor(Math.random() * 3)],
        });
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fire) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = 2;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    particlesRef.current = [];

    // Wave 1 — big burst
    createBurst(canvas, H * 0.32, 100, 9);
    // Wave 2 — follow-up 400ms later
    const t1 = setTimeout(() => createBurst(canvas, H * 0.3, 50, 7), 400);
    // Wave 3 — small sparkle at 800ms
    const t2 = setTimeout(() => createBurst(canvas, H * 0.28, 30, 5), 800);

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.006;

        if (p.opacity <= 0 || p.y > H + 20) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -1, p.w, 2.5);
        }
        ctx.restore();
      }

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fire, createBurst]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ─── Animated check ring ───────────────────────────────────────────────
function AnimatedCheckRing() {
  return (
    <div className="relative w-[68px] h-[68px]">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(32,76,199,0.10) 0%, transparent 70%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1.8 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      />
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r="29" fill="none" stroke="#E5E7EB" strokeWidth="2.5" opacity="0.2" />
        <motion.circle
          cx="34" cy="34" r="29" fill="none"
          stroke="url(#cGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 29}
          initial={{ strokeDashoffset: 2 * Math.PI * 29 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#204CC7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.65 }}
      >
        <div
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #204CC7 0%, #4F46E5 100%)',
            boxShadow: '0 6px 20px -3px rgba(32,76,199,0.35)',
          }}
        >
          <motion.svg width="20" height="15" viewBox="0 0 22 16" fill="none">
            <motion.path
              d="M2 8L8 14L20 2"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.85, ease: 'easeOut' }}
            />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Feature pill ──────────────────────────────────────────────────────
function FeaturePill({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-2.5 py-[7px] bg-white rounded-xl border border-gray-100/80"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-[11.5px] text-gray-600" style={{ fontWeight: 500 }}>{label}</span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
export function PostPaymentCompletionModal({
  isOpen,
  onClose,
  selectedPlan,
  businessType,
  headline = 'Welcome to Brego Business',
  subheadline,
  ctaLabel = 'Setup your Dashboard',
  hideClose = false,
}: PostPaymentCompletionModalProps) {

  const [fireConfetti, setFireConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Stage 1: brief pause so backdrop settles / dashboard renders behind
      const t1 = setTimeout(() => setShowModal(true), 200);
      // Stage 2: fire confetti right as modal card appears
      const t2 = setTimeout(() => setFireConfetti(true), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowModal(false);
      setFireConfetti(false);
    }
  }, [isOpen]);

  // ── Service-specific manager & team info (name, no photo) ──
  const teamInfo: Record<BusinessType, { name: string; role: string; message: string; teamLabel: string }> = {
    leadgen: {
      name: 'Rahul Sharma',
      role: 'Lead Gen Strategist',
      teamLabel: 'Your Growth Team is Ready',
      message: 'A dedicated strategist will connect within 24h to set up your business account and kick off campaigns.',
    },
    ecommerce: {
      name: 'Priya Mehta',
      role: 'Performance Manager',
      teamLabel: 'Your Performance Team is Ready',
      message: 'A dedicated manager will connect within 24h to set up your business account and optimise ROAS.',
    },
    finance: {
      name: 'Ankit Verma, CA',
      role: 'Accounts Manager',
      teamLabel: 'Your Finance Team is Ready',
      message: 'A dedicated CA will connect within 24h to set up your books and handle compliance.',
    },
  };

  const features: Record<BusinessType, { icon: React.ReactNode; label: string }[]> = {
    leadgen: [
      { icon: <BarChart3 className="w-3 h-3 text-blue-600" />, label: 'Lead Dashboard' },
      { icon: <MessageSquare className="w-3 h-3 text-indigo-600" />, label: 'BregoGPT' },
      { icon: <Users className="w-3 h-3 text-emerald-600" />, label: 'Dedicated Team' },
      { icon: <Zap className="w-3 h-3 text-amber-600" />, label: 'Automations' },
    ],
    ecommerce: [
      { icon: <BarChart3 className="w-3 h-3 text-blue-600" />, label: 'ROAS Dashboard' },
      { icon: <MessageSquare className="w-3 h-3 text-indigo-600" />, label: 'BregoGPT' },
      { icon: <Users className="w-3 h-3 text-emerald-600" />, label: 'Dedicated Team' },
      { icon: <Zap className="w-3 h-3 text-amber-600" />, label: 'ROAS Optimizer' },
    ],
    finance: [
      { icon: <BarChart3 className="w-3 h-3 text-blue-600" />, label: 'Finance Dashboard' },
      { icon: <Shield className="w-3 h-3 text-indigo-600" />, label: 'Compliance' },
      { icon: <Users className="w-3 h-3 text-emerald-600" />, label: 'Dedicated CA' },
      { icon: <Zap className="w-3 h-3 text-amber-600" />, label: 'Auto Filings' },
    ],
  };

  const team = teamInfo[businessType];
  const featureList = features[businessType];

  // Resolved subheadline
  const resolvedSub = subheadline || (
    <>
      Your{' '}
      <span style={{ fontWeight: 600, color: '#204CC7' }}>{selectedPlan || 'Growth'}</span>{' '}
      plan is active
    </>
  );

  // Graceful close — let exit animation play
  const handleClose = () => {
    setShowModal(false);
    setFireConfetti(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && showModal && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop — translucent so context peeks through */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.14)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!hideClose ? handleClose : undefined}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-[400px] mx-4"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Confetti canvas — extends well beyond card for visual impact */}
            <div className="absolute -inset-44 pointer-events-none z-30">
              <ConfettiCanvas fire={fireConfetti} />
            </div>

            <div
              className="relative bg-white rounded-[22px] overflow-hidden"
              style={{
                boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)',
              }}
            >
              {/* Close (X) — conditionally hidden */}
              {!hideClose && (
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50/80 hover:bg-gray-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}

              {/* ── Hero ── */}
              <div
                className="relative px-6 pt-7 pb-4 text-center"
                style={{ background: 'linear-gradient(180deg, #F7F9FF 0%, #FFFFFF 100%)' }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[100px] rounded-full opacity-40"
                  style={{ background: 'radial-gradient(ellipse, rgba(32,76,199,0.08) 0%, transparent 70%)' }}
                />

                <div className="flex justify-center mb-3 relative z-10">
                  <AnimatedCheckRing />
                </div>

                <motion.h2
                  className="text-gray-900 mb-0.5"
                  style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1.3 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {headline}
                </motion.h2>
                <motion.p
                  className="text-[12.5px] text-gray-500"
                  style={{ lineHeight: 1.5 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {resolvedSub}
                </motion.p>
              </div>

              {/* ── Content ── */}
              <div className="px-6 pb-6">

                {/* Manager card — team readiness, no personal names */}
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-2xl border border-gray-100/80 mb-4"
                  style={{ backgroundColor: '#FAFBFF' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #204CC7, #6366F1)',
                      boxShadow: '0 3px 10px -2px rgba(32,76,199,0.28)',
                    }}
                  >
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{ background: '#ECFDF5', fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', color: '#059669' }}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Ready to go
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1.5" style={{ fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.5 }}>
                      {team.message}
                    </p>
                  </div>
                </motion.div>

                {/* Unlocked features — 2×2 grid */}
                <motion.div
                  className="mb-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.78 }}
                >
                  <p
                    className="text-[9.5px] text-gray-400 uppercase tracking-[0.08em] mb-2 px-0.5"
                    style={{ fontWeight: 700 }}
                  >
                    Unlocked for you
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {featureList.map((f, i) => (
                      <FeaturePill key={f.label} icon={f.icon} label={f.label} delay={0.85 + i * 0.05} />
                    ))}
                  </div>
                </motion.div>

                {/* Single primary CTA */}
                <motion.button
                  onClick={handleClose}
                  className="w-full py-2.5 text-white rounded-2xl flex items-center justify-center gap-2 group"
                  style={{
                    background: 'linear-gradient(135deg, #204CC7 0%, #4338CA 100%)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px -2px rgba(32,76,199,0.32)',
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 6px 20px -2px rgba(32,76,199,0.42)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {ctaLabel}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
