'use client';

import { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, Key, Shield, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// ── Stagger animation wrapper (consistent with ProfileSettings) ──
function StaggerItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

// ── Password Strength Logic ──
function getPasswordStrength(password: string): { score: number; label: string; color: string; bgColor: string } {
  if (!password) return { score: 0, label: '', color: 'text-gray-400', bgColor: 'bg-gray-200' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-400' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'text-amber-500', bgColor: 'bg-amber-400' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'text-brand', bgColor: 'bg-brand' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-400' };
  return { score: 5, label: 'Very Strong', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
}

// ── Requirement Check Item ──
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={false}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          met ? 'bg-emerald-100' : 'bg-gray-100'
        }`}
        animate={{ scale: met ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {met ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        )}
      </motion.div>
      <span className={`text-xs transition-colors duration-200 ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </motion.div>
  );
}

// ── Password Input Field ──
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  badge,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: typeof Lock;
  badge?: React.ReactNode;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
        {label}
        {badge}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/80 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-all duration-200 ${
            error ? 'border-red-300 focus:ring-red-400/40 focus:border-red-300' : 'border-gray-200'
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ── Main Component ──
export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{ current?: string; confirm?: string }>({});

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const requirements = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[^a-zA-Z0-9]/.test(newPassword),
  }), [newPassword]);

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const canSubmit = currentPassword.length > 0
    && requirements.minLength
    && requirements.hasUppercase
    && requirements.hasLowercase
    && requirements.hasNumber
    && passwordsMatch;

  const hasInput = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  const handleUpdate = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) newErrors.current = 'Please enter your current password';
    if (passwordsMismatch) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setUpdateStatus('updating');
    setTimeout(() => {
      setUpdateStatus('success');
      toast.success('Password updated', {
        description: 'Your password has been changed successfully.',
        duration: 2500,
      });
      setTimeout(() => {
        setUpdateStatus('idle');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    }, 1400);
  };

  const handleDiscard = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setUpdateStatus('idle');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <StaggerItem index={0}>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Change Password</h1>
          <p className="text-sm text-gray-500">Keep your account secure by updating your password regularly</p>
        </div>
      </StaggerItem>

      {/* Security Status Card */}
      <StaggerItem index={1}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>Password Security</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Secure
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-gray-400" style={{ fontSize: '13px' }}>Last changed 45 days ago</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-400 uppercase tracking-wider" style={{ fontSize: '13px' }}>Recommendation</p>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>Update every 90 days</p>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Current Password Card */}
      <StaggerItem index={2}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Verify Identity</h3>
          </div>
          <div className="max-w-lg">
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={(val) => { setCurrentPassword(val); setErrors(prev => ({ ...prev, current: undefined })); }}
              placeholder="Enter your current password"
              icon={Lock}
              error={errors.current}
            />
          </div>
        </div>
      </StaggerItem>

      {/* New Password Card */}
      <StaggerItem index={3}>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
              <Key className="w-4 h-4 text-brand" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">New Password</h3>
          </div>
          <div className="space-y-4">
            <div className="max-w-lg">
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter a strong new password"
                icon={Key}
              />

              {/* Strength Bar */}
              {newPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-400 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 500 }}>Strength</span>
                    <span className={`${strength.color}`} style={{ fontSize: '13px', fontWeight: 600 }}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <motion.div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= strength.score ? strength.bgColor : 'bg-gray-200'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: level * 0.05, duration: 0.2 }}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
                    <RequirementItem met={requirements.minLength} label="At least 8 characters" />
                    <RequirementItem met={requirements.hasUppercase} label="One uppercase letter" />
                    <RequirementItem met={requirements.hasLowercase} label="One lowercase letter" />
                    <RequirementItem met={requirements.hasNumber} label="One number" />
                    <RequirementItem met={requirements.hasSpecial} label="One special character" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="max-w-lg pt-1">
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(val) => { setConfirmPassword(val); setErrors(prev => ({ ...prev, confirm: undefined })); }}
                placeholder="Re-enter your new password"
                icon={Key}
                badge={
                  passwordsMatch ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Match
                    </motion.span>
                  ) : undefined
                }
                error={errors.confirm || (passwordsMismatch ? 'Passwords do not match' : undefined)}
              />
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Sticky Update Bar */}
      <AnimatePresence>
        {hasInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="sticky bottom-6 z-10"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${canSubmit ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                <span className="text-sm text-white/80">
                  {canSubmit ? 'Ready to update your password' : 'Complete all fields to continue'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Discard
                </button>
                <motion.button
                  onClick={handleUpdate}
                  disabled={!canSubmit || updateStatus === 'updating'}
                  className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-xl text-sm font-medium shadow-sm hover:bg-brand-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={canSubmit ? { scale: 0.97 } : undefined}
                >
                  <AnimatePresence mode="wait">
                    {updateStatus === 'updating' ? (
                      <motion.div
                        key="updating"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      />
                    ) : updateStatus === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  {updateStatus === 'updating' ? 'Updating...' : updateStatus === 'success' ? 'Updated!' : 'Update Password'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}