'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Chrome, Eye, EyeOff, ArrowLeft, Check, ShieldCheck, Lock, Key, User } from 'lucide-react';
import { BregoLogo } from '../BregoLogo';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import type { AuthResult } from '../../types';

interface AuthPageProps {
  onAuthSuccess: (result: AuthResult) => void;
}

type AuthView = 'login' | 'signup' | 'forgot' | 'otp' | 'reset' | 'reset-success';

/* ——— Reusable spinner ——— */
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

/* ——— Password strength ——— */
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-amber-400' };
  if (score === 3) return { score, label: 'Good', color: 'bg-emerald-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

const PASSWORD_REQS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/* ——— Card animation variants ——— */
// Cubic bezier tuple must be a 4-tuple (not `number[]`) for motion's Variants types.
const EASE_OUT_QUINT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const cardVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT_QUINT } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ——— Password requirements checklist ——— */
function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="rounded-xl bg-gray-50/80 p-3.5 space-y-1.5">
      <p className="text-[13px] text-gray-500 mb-1" style={{ fontWeight: 600 }}>PASSWORD REQUIREMENTS</p>
      {PASSWORD_REQS.map((req, i) => {
        const met = req.test(password);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
              {met && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-xs transition-colors ${met ? 'text-gray-700' : 'text-gray-400'}`}>{req.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ——— Password strength bar ——— */
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 flex items-center gap-2.5">
      <div className="flex-1 flex gap-1">
        {[1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= level ? strength.color : 'bg-gray-100'}`}
          />
        ))}
      </div>
      <span className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{strength.label}</span>
    </div>
  );
}

/* ——— Password input field ——— */
function PasswordField({
  value, onChange, placeholder, autoComplete, autoFocus, error, show, onToggle,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string;
  autoFocus?: boolean; error?: boolean; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Lock className="w-[18px] h-[18px] text-gray-400" />
      </div>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
}

/* ——— CTA button ——— */
function SubmitButton({ loading, label, loadingLabel, disabled }: { loading: boolean; label: string; loadingLabel: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-brand hover:bg-brand-hover active:scale-[0.985] text-white py-3 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2"><Spinner />{loadingLabel}</span>
      ) : label}
    </button>
  );
}

/* ——— Animated icon container ——— */
function AnimatedIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
      className="w-14 h-14 rounded-2xl bg-brand/[0.08] flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

/* ——— OTP Input Row ——— */
function OtpInputRow({
  otp, otpRefs, otpError, onChange, onKeyDown, onPaste,
}: {
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  otpError: string;
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}) {
  return (
    <>
      <div className="flex justify-center gap-2.5 mb-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={i === 0 ? onPaste : undefined}
            className={`w-11 h-12 text-center text-lg border rounded-xl outline-none transition-all ${
              otpError
                ? 'border-red-300 bg-red-50/30'
                : digit
                  ? 'border-brand bg-brand/[0.04] text-gray-900'
                  : 'border-gray-200 text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20'
            }`}
            style={{ fontWeight: 600 }}
          />
        ))}
      </div>
      {otpError && <p className="text-xs text-red-500 text-center mb-4">{otpError}</p>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AUTH PAGE — Version 1226
   ═══════════════════════════════════════════════════════════════════ */
export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  // ── State ──
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Login / Signup shared
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot/Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [resetError, setResetError] = useState('');
  const [otpError, setOtpError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Timers ──
  useEffect(() => {
    if (otpResendTimer > 0) {
      const t = setTimeout(() => setOtpResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpResendTimer]);

  // Auto-focus OTP inputs
  useEffect(() => {
    if (view === 'otp') setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [view]);

  // Auto-redirect on reset success
  useEffect(() => {
    if (view === 'reset-success') {
      const timeout = setTimeout(() => navigateTo('login'), 4000);
      return () => clearTimeout(timeout);
    }
  }, [view]);

  // ── Validation ──
  const validateEmail = (value: string) => {
    if (!value) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    return '';
  };

  const maskEmail = (em: string) => {
    const [user, domain] = em.split('@');
    if (!user || !domain) return em;
    return user[0] + '***' + (user.length > 1 ? user[user.length - 1] : '') + '@' + domain;
  };

  // ── Navigation ──
  const navigateTo = (newView: AuthView) => {
    setEmailError(''); setPasswordError(''); setResetError('');
    setNameError(''); setSignupPasswordError('');
    setOtpError('');
    setPassword(''); setSignupPassword('');
    setNewPassword(''); setConfirmPassword('');
    setOtp(['', '', '', '', '', '']);
    setShowPassword(false); setShowSignupPassword(false);
    setShowNewPassword(false); setShowConfirmPassword(false);
    setView(newView);
  };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }
    if (!password) { setPasswordError('Password is required'); return; }
    setEmailError(''); setPasswordError('');

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    onAuthSuccess({ email });
  };

  // ── Signup ──
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasErr = false;
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); hasErr = true; }
    if (!fullName.trim()) { setNameError('Full name is required'); hasErr = true; }
    if (!signupPassword) { setSignupPasswordError('Password is required'); hasErr = true; }
    else if (signupPassword.length < 8) { setSignupPasswordError('Minimum 8 characters'); hasErr = true; }
    if (hasErr) return;
    setEmailError(''); setNameError(''); setSignupPasswordError('');

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    onAuthSuccess({ email, fullName: fullName.trim() });
  };

  // ── Google Auth ──
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onAuthSuccess({ email: 'user@gmail.com', fullName: 'Sufyan' });
  };

  // ── Forgot password ──
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    setOtpResendTimer(30);
    setView('otp');
  };

  // ── OTP handlers ──
  const makeOtpChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, errSetter: React.Dispatch<React.SetStateAction<string>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) =>
    (index: number, value: string) => {
      if (value.length > 1) value = value.slice(-1);
      if (value && !/^\d$/.test(value)) return;
      setter(prev => {
        const newOtp = [...prev];
        newOtp[index] = value;
        return newOtp;
      });
      errSetter('');
      if (value && index < 5) refs.current[index + 1]?.focus();
    };

  const makeOtpKeyDown = (otpArr: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>) =>
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otpArr[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    };

  const makeOtpPaste = (setter: React.Dispatch<React.SetStateAction<string[]>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) =>
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      setter(prev => {
        const newOtp = [...prev];
        pasteData.split('').forEach((char, i) => { newOtp[i] = char; });
        return newOtp;
      });
      const nextIdx = Math.min(pasteData.length, 5);
      refs.current[nextIdx]?.focus();
    };

  // Forgot password OTP handlers
  const handleOtpChange = useCallback(makeOtpChange(setOtp, setOtpError, otpRefs), []);
  const handleOtpKeyDown = useCallback((i: number, e: React.KeyboardEvent) => makeOtpKeyDown(otp, otpRefs)(i, e), [otp]);
  const handleOtpPaste = useCallback(makeOtpPaste(setOtp, otpRefs), []);

  // Auto-verify forgot password OTP
  useEffect(() => {
    if (otp.every(d => d !== '') && view === 'otp' && !isLoading) {
      const timeout = setTimeout(async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setView('reset');
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [otp, view, isLoading]);

  const handleVerifyOtp = async () => {
    if (otp.some(d => !d)) { setOtpError('Please enter all 6 digits'); return; }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setView('reset');
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    setOtp(['', '', '', '', '', '']);
    setOtpResendTimer(30);
    otpRefs.current[0]?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPassword.length < 8) { setResetError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setResetError('Passwords do not match'); return; }
    const strength = getPasswordStrength(newPassword);
    if (strength.score < 2) { setResetError('Please choose a stronger password'); return; }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    setView('reset-success');
  };

  // ── Derived ──
  const otpFilled = otp.every(d => d !== '');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px]">
        <AnimatePresence mode="wait">

          {/* ═══ SIGN IN ═══════════════════════════════════════════ */}
          {view === 'login' && (
            <motion.div key="login" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <BregoLogo size={56} variant="full" />
                </div>
                <h1 className="text-center mb-1" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Welcome back</h1>
                <p className="text-center mb-6" style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  {/* Email */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-[18px] h-[18px] text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="Email address"
                        autoComplete="email"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm ${emailError ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      />
                    </div>
                    {emailError && <p className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <PasswordField
                      value={password}
                      onChange={(v) => { setPassword(v); setPasswordError(''); }}
                      placeholder="Password"
                      autoComplete="current-password"
                      error={!!passwordError}
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                    />
                    {passwordError && <p className="text-xs text-red-500 mt-1.5 ml-1">{passwordError}</p>}
                  </div>

                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigateTo('forgot')}
                      className="text-brand/80 hover:text-brand transition-colors"
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <SubmitButton loading={isLoading} label="Sign in" loadingLabel="Signing in..." />
                </form>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 border-t border-gray-100" />
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#9ca3af' }}>or</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.985] text-gray-700 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <Chrome className="w-[18px] h-[18px] text-brand" />
                  Sign in with Google
                </button>

                <div className="mt-5 text-center">
                  <button type="button" onClick={() => navigateTo('signup')} className="text-gray-500 hover:text-gray-700 transition-colors" style={{ fontSize: '14px', fontWeight: 400 }}>
                    Don't have an account?{' '}<span className="text-brand" style={{ fontWeight: 500 }}>Sign up</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ SIGN UP ═══════════════════════════════════════════ */}
          {view === 'signup' && (
            <motion.div key="signup" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <BregoLogo size={56} variant="full" />
                </div>
                <h1 className="text-center mb-1" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Create your account</h1>
                <p className="text-center mb-6" style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>Get started with Brego Business</p>
                <form onSubmit={handleSignup} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="w-[18px] h-[18px] text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
                        placeholder="Full name"
                        autoComplete="name"
                        autoFocus
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm ${nameError ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      />
                    </div>
                    {nameError && <p className="text-xs text-red-500 mt-1.5 ml-1">{nameError}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-[18px] h-[18px] text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="Work email address"
                        autoComplete="email"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm ${emailError ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      />
                    </div>
                    {emailError && <p className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <PasswordField
                      value={signupPassword}
                      onChange={(v) => { setSignupPassword(v); setSignupPasswordError(''); }}
                      placeholder="Create password"
                      autoComplete="new-password"
                      error={!!signupPasswordError}
                      show={showSignupPassword}
                      onToggle={() => setShowSignupPassword(!showSignupPassword)}
                    />
                    {signupPasswordError && <p className="text-xs text-red-500 mt-1.5 ml-1">{signupPasswordError}</p>}
                  </div>

                  <SubmitButton loading={isLoading} label="Create account" loadingLabel="Creating account..." />
                </form>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 border-t border-gray-100" />
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#9ca3af' }}>or</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.985] text-gray-700 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <Chrome className="w-[18px] h-[18px] text-brand" />
                  Sign up with Google
                </button>

                <div className="mt-5 text-center">
                  <button type="button" onClick={() => navigateTo('login')} className="text-gray-500 hover:text-gray-700 transition-colors" style={{ fontSize: '14px', fontWeight: 400 }}>
                    Already have an account?{' '}<span className="text-brand" style={{ fontWeight: 500 }}>Sign in</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ FORGOT PASSWORD ═══════════════════════════════════ */}
          {view === 'forgot' && (
            <motion.div key="forgot" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <AnimatedIcon>
                    <Key className="w-7 h-7 text-brand" />
                  </AnimatedIcon>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-gray-900 text-2xl sm:text-[26px] mb-1.5" style={{ fontWeight: 600 }}>Reset your password</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Enter the email associated with your account and we'll send a verification code.
                  </p>
                </div>
                <form onSubmit={handleForgotSubmit} className="space-y-3.5 mb-6">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-[18px] h-[18px] text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="Email address"
                        autoComplete="email"
                        autoFocus
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm ${emailError ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      />
                    </div>
                    {emailError && <p className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</p>}
                  </div>
                  <SubmitButton loading={isLoading} label="Send verification code" loadingLabel="Sending code..." />
                </form>
                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ FORGOT PASSWORD: OTP ══════════════════════════════ */}
          {view === 'otp' && (
            <motion.div key="otp" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <AnimatedIcon>
                    <ShieldCheck className="w-7 h-7 text-brand" />
                  </AnimatedIcon>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-gray-900 text-2xl sm:text-[26px] mb-1.5" style={{ fontWeight: 600 }}>Check your email</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We sent a 6-digit code to{' '}
                    <span className="text-gray-700" style={{ fontWeight: 500 }}>{maskEmail(email)}</span>
                  </p>
                </div>

                <OtpInputRow
                  otp={otp}
                  otpRefs={otpRefs}
                  otpError={otpError}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
                />

                {otpFilled && isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-brand py-3 mb-2"
                  >
                    <Spinner />
                    <span style={{ fontWeight: 500 }}>Verifying...</span>
                  </motion.div>
                )}

                {!isLoading && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!otpFilled}
                    className="w-full bg-brand hover:bg-brand-hover active:scale-[0.985] text-white py-3 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4 mb-5"
                  >
                    Verify code
                  </button>
                )}

                <div className="text-center text-sm text-gray-500 mt-4">
                  Didn't receive the code?{' '}
                  {otpResendTimer > 0 ? (
                    <span className="text-gray-400">Resend in {otpResendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-brand font-medium hover:text-brand-hover transition-colors">
                      Resend
                    </button>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => navigateTo('forgot')}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Try a different email
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ NEW PASSWORD ═══════════════════════════════════════ */}
          {view === 'reset' && (
            <motion.div key="reset" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <AnimatedIcon>
                    <Lock className="w-7 h-7 text-brand" />
                  </AnimatedIcon>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-gray-900 text-2xl sm:text-[26px] mb-1.5" style={{ fontWeight: 600 }}>Set new password</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Your new password must be different from your previous password.
                  </p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-0.5" style={{ fontWeight: 500 }}>New password</label>
                    <PasswordField
                      value={newPassword}
                      onChange={(v) => { setNewPassword(v); setResetError(''); }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      autoFocus
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                    />
                    <PasswordStrengthBar password={newPassword} />
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-0.5" style={{ fontWeight: 500 }}>Confirm password</label>
                    <PasswordField
                      value={confirmPassword}
                      onChange={(v) => { setConfirmPassword(v); setResetError(''); }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      error={!!(confirmPassword && confirmPassword !== newPassword)}
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    {confirmPassword && confirmPassword === newPassword && (
                      <p className="text-xs text-emerald-500 mt-1.5 ml-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                    )}
                  </div>

                  {resetError && (
                    <p className="text-xs text-red-500 ml-1">{resetError}</p>
                  )}

                  <PasswordRequirements password={newPassword} />

                  <SubmitButton loading={isLoading} label="Reset password" loadingLabel="Resetting password..." disabled={!newPassword || !confirmPassword} />
                </form>
              </div>
            </motion.div>
          )}

          {/* ═══ SUCCESS ═══════════════════════════════════════════ */}
          {view === 'reset-success' && (
            <motion.div key="success" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 8px 40px rgba(32, 76, 199, 0.18), 0 2px 12px rgba(32, 76, 199, 0.10)' }}>
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                    className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.35 }}
                    >
                      <Check className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-gray-900 text-2xl sm:text-[26px] mb-1.5" style={{ fontWeight: 600 }}>Password reset</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="w-full bg-brand hover:bg-brand-hover active:scale-[0.985] text-white py-3 rounded-xl font-medium shadow-sm transition-all text-sm"
                >
                  Back to sign in
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">Redirecting to sign in automatically...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center gap-5 text-[13px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
