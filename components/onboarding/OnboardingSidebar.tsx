'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, Wallet, TrendingUp, Layers, Quote, Star,
  ArrowUpRight, Users, BarChart3, Zap, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { BregoLogo } from '../BregoLogo';
import { motion, AnimatePresence } from 'motion/react';

/* ─────────────────────────────────────────────
   Constants & Data
   ───────────────────────────────────────────── */
const SLIDE_COUNT = 5;
const AUTO_SCROLL_INTERVAL = 6000; // 6 s per slide

// Slide 2 — Client logos
const clientLogos = [
  'Swiggy', 'Zomato', 'PharmEasy', 'Lenskart',
  'boAt', 'Mamaearth', 'Sugar', 'Nykaa',
  'Bewakoof', 'The Souled Store', 'CaratLane', 'Pepperfry',
];

// Slide 3 — Testimonials
const testimonials = [
  {
    quote: "Brego helped us cut our CAC by 40% in just 3 months. Their AI-driven insights are genuinely game-changing for our D2C brand.",
    name: 'Arjun Mehta',
    title: 'Founder & CEO',
    company: 'NovaSkin Beauty',
    rating: 5,
    metric: '40% lower CAC',
  },
  {
    quote: "From GST compliance chaos to perfect filings — Brego's finance team handles everything so we can focus on scaling.",
    name: 'Priya Sharma',
    title: 'Co-founder',
    company: 'FreshBasket Foods',
    rating: 5,
    metric: '100% compliant',
  },
];

// Slide 4 — Aggregate stats
const stats = [
  { value: '200+', label: 'Brands trust us', icon: Users },
  { value: '₹50Cr+', label: 'Ad spend managed', icon: BarChart3 },
  { value: '3.2×', label: 'Avg. ROAS delivered', icon: TrendingUp },
  { value: '98%', label: 'Client retention', icon: Zap },
];

// Slide 5 — Before / After case-study results
const caseStudies = [
  {
    brand: 'D2C Skincare Brand',
    results: [
      { label: 'ROAS', before: '1.4×', after: '3.8×' },
      { label: 'CAC', before: '₹680', after: '₹290' },
      { label: 'Monthly Revenue', before: '₹18L', after: '₹52L' },
    ],
    timeline: '90 days',
  },
  {
    brand: 'B2B SaaS Company',
    results: [
      { label: 'Qualified Leads', before: '45/mo', after: '180/mo' },
      { label: 'CPL', before: '₹1,200', after: '₹420' },
      { label: 'Pipeline Value', before: '₹22L', after: '₹85L' },
    ],
    timeline: '60 days',
  },
];

/* ─────────────────────────────────────────────
   Direction tracker for swipe feel
   ───────────────────────────────────────────── */
type Dir = 1 | -1;

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */
export function OnboardingSidebar() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<Dir>(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerKey = useRef(0); // forces animation-reset on slide change

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > activeSlide ? 1 : -1);
      setActiveSlide(index);
      timerKey.current += 1;
    },
    [activeSlide],
  );

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
    timerKey.current += 1;
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(nextSlide, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused, nextSlide]);

  /* ---- slide variants (direction-aware) ---- */
  const variants = {
    enter: (d: Dir) => ({ opacity: 0, x: d * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (d: Dir) => ({ opacity: 0, x: d * -28 }),
  };

  const slides = [
    <SlideValueProps key="s0" />,
    <SlideClientLogos key="s1" />,
    <SlideTestimonials key="s2" />,
    <SlideStats key="s3" />,
    <SlideTransformations key="s4" />,
  ];

  return (
    <div
      className="hidden lg:flex lg:w-[420px] bg-brand p-10 flex-col justify-between relative overflow-hidden flex-shrink-0 z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full -mr-36 -mt-36" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.04] rounded-full -ml-48 -mb-48" />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/[0.03] rounded-full -mr-20 -translate-y-1/2" />

      {/* ── Top: Logo ── */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-10">
          <BregoLogo size={32} variant="full" />
        </div>

        {/* Carousel viewport */}
        <div className="relative min-h-[360px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              {slides[activeSlide]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom: Dots + Copyright ── */}
      <div className="relative z-10 mt-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="relative p-1 group outline-none"
              aria-label={`Slide ${i + 1}`}
            >
              <div
                className={`h-[6px] rounded-full transition-all duration-500 ease-out ${
                  i === activeSlide
                    ? 'w-7 bg-white'
                    : 'w-[6px] bg-white/25 group-hover:bg-white/45'
                }`}
              />
              {/* progress sweep on active dot */}
              {i === activeSlide && !isPaused && (
                <div
                  key={timerKey.current}
                  className="absolute inset-0 flex items-center justify-center p-1 pointer-events-none"
                >
                  <div
                    className="h-[6px] rounded-full bg-white/40 animate-dot-progress"
                    style={{ animationDuration: `${AUTO_SCROLL_INTERVAL}ms` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-white/40 text-[13px] text-center tracking-wide">
          © Brego Business 2026
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 1 — Value Propositions (Attention)
   "What we do for you"
   ═══════════════════════════════════════════════ */
function SlideValueProps() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI + Human, built for growth',
      desc: 'Smarter decisions, faster delivery — your AI-powered growth engine.',
    },
    {
      icon: Wallet,
      title: 'Control costs & cash',
      desc: 'Real-time numbers, due-date checklists, CFO-level guidance.',
    },
    {
      icon: TrendingUp,
      title: 'More sales, less juggling',
      desc: 'Strategy → creatives → ads — planned and tracked end-to-end.',
    },
    {
      icon: Layers,
      title: 'Streamline your process',
      desc: 'Bring your content, data, and teams together.',
    },
  ];

  return (
    <div>
      <h2 className="text-white text-[22px] font-medium leading-snug mb-8">
        Your growth,
        <br />
        under one roof.
      </h2>
      <div className="space-y-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.32 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mt-0.5 ring-1 ring-white/[0.08]">
              <f.icon className="w-[17px] h-[17px] text-white/90" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white/95 font-medium text-[13px] mb-0.5 leading-snug">
                {f.title}
              </h3>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 2 — Client Logos (Interest / Social Proof)
   "Who trusts us"
   ═══════════════════════════════════════════════ */
function SlideClientLogos() {
  return (
    <div>
      <p className="text-white/45 text-[10px] tracking-[0.16em] uppercase mb-1.5">
        Trusted by leading brands
      </p>
      <h2 className="text-white text-[22px] font-medium leading-snug mb-6">
        200+ brands scale
        <br />
        with Brego.
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {clientLogos.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.035, duration: 0.28 }}
            className="bg-white/[0.07] backdrop-blur-sm rounded-xl py-2.5 px-2 flex items-center justify-center ring-1 ring-white/[0.06] hover:bg-white/[0.12] transition-colors group"
          >
            <span className="text-white/75 text-[13px] font-medium tracking-wide group-hover:text-white transition-colors truncate">
              {name}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-4 flex items-center gap-1.5 text-white/40 text-[13px]"
      >
        <ArrowUpRight className="w-3 h-3" />
        And many more across 15+ industries
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 3 — Testimonials (Desire / Emotional Proof)
   "What they say"
   ═══════════════════════════════════════════════ */
function SlideTestimonials() {
  return (
    <div>
      <p className="text-white/45 text-[10px] tracking-[0.16em] uppercase mb-1.5">
        Client Stories
      </p>
      <h2 className="text-white text-[22px] font-medium leading-snug mb-5">
        Hear from our clients.
      </h2>

      <div className="space-y-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.36 }}
            className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/[0.06]"
          >
            <Quote className="w-3.5 h-3.5 text-white/20 mb-1.5" />
            <p className="text-white/80 text-[13px] leading-relaxed mb-3">
              "{t.quote}"
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white/90 text-[13px] font-medium truncate">{t.name}</p>
                <p className="text-white/40 text-[10px] truncate">
                  {t.title}, {t.company}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg px-2 py-0.5 flex-shrink-0">
                <span className="text-white/90 text-[10px] font-semibold whitespace-nowrap">
                  {t.metric}
                </span>
              </div>
            </div>
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 4 — Aggregate Stats (Credibility)
   "Numbers that speak"
   ═══════════════════════════════════════════════ */
function SlideStats() {
  return (
    <div>
      <p className="text-white/45 text-[10px] tracking-[0.16em] uppercase mb-1.5">
        Proven Results
      </p>
      <h2 className="text-white text-[22px] font-medium leading-snug mb-6">
        Numbers that speak
        <br />
        for themselves.
      </h2>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09, duration: 0.36 }}
            className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-3.5 ring-1 ring-white/[0.06] hover:bg-white/[0.10] transition-colors"
          >
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center mb-2.5">
              <s.icon className="w-3.5 h-3.5 text-white/65" />
            </div>
            <p className="text-white text-xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-white/45 text-[10px] leading-snug mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-4 bg-white/[0.06] rounded-xl p-3 ring-1 ring-white/[0.05]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white/85 text-[13px] font-medium">
              Avg. client sees ROI in 45 days
            </p>
            <p className="text-white/40 text-[10px]">
              Across marketing & finance services
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 5 — Client Transformations (Action Trigger)
   "Imagine this for YOUR business"
   Before → After case-study metrics
   ═══════════════════════════════════════════════ */
function SlideTransformations() {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const activeCase = caseStudies[activeCaseIdx];

  return (
    <div>
      <p className="text-white/45 text-[10px] tracking-[0.16em] uppercase mb-1.5">
        Real Outcomes
      </p>
      <h2 className="text-white text-[22px] font-medium leading-snug mb-5">
        Results you can expect.
      </h2>

      {/* Case study toggle pills */}
      <div className="flex gap-1.5 mb-4">
        {caseStudies.map((cs, idx) => (
          <button
            key={cs.brand}
            onClick={() => setActiveCaseIdx(idx)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 outline-none ${
              idx === activeCaseIdx
                ? 'bg-white/20 text-white ring-1 ring-white/15'
                : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10] hover:text-white/70'
            }`}
          >
            {cs.brand}
          </button>
        ))}
      </div>

      {/* Before / After card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCaseIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/[0.06]"
        >
          {/* Metric rows */}
          <div className="space-y-3">
            {activeCase.results.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <p className="text-white/40 text-[10px] mb-1 tracking-wide">{r.label}</p>
                <div className="flex items-center gap-2.5">
                  <span className="text-white/50 text-[13px] line-through decoration-white/25">
                    {r.before}
                  </span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 text-[15px] font-semibold">
                    {r.after}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeline badge */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-white/60 text-[13px]">
              Achieved in <span className="text-white/90 font-medium">{activeCase.timeline}</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CTA nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 flex items-center gap-2 text-white/45 text-[13px]"
      >
        <Sparkles className="w-3 h-3 text-white/35" />
        <span>Your personalised growth plan is just one step away</span>
      </motion.div>
    </div>
  );
}
