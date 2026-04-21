'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, PhoneOff, PhoneCall, PhoneMissed,
  Mic, MicOff, Volume2, VolumeX,
  Minimize2, Maximize2, X, Headphones,
  Signal,
  WifiOff, RefreshCw, Clock, Star,
  MessageSquare, ArrowRight, Check,
  Pause, Play, AlertTriangle, Info,
  CalendarDays, ChevronLeft, ChevronRight,
  Trash2, RotateCcw, Bell,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════ */

// ── Live audio waveform bars ──
function HuddleWaveform({ active, color = 'white', barCount = 5 }: { active: boolean; color?: string; barCount?: number }) {
  return (
    <div className="flex items-center gap-[2.5px] h-5">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full"
          style={{ backgroundColor: color, opacity: active ? 0.9 : 0.25 }}
          animate={
            active
              ? { height: [3, 10 + Math.random() * 10, 4, 14 + Math.random() * 6, 3] }
              : { height: 3 }
          }
          transition={
            active
              ? { duration: 0.7 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut', delay: i * 0.07 }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

// ── Connecting pulse ring ──
function PulseRing({ color = 'green' }: { color?: 'green' | 'amber' | 'blue' }) {
  const colors = {
    green: { outer: 'bg-green-400/20', inner: 'bg-green-400/30' },
    amber: { outer: 'bg-amber-400/20', inner: 'bg-amber-400/30' },
    blue: { outer: 'bg-blue-400/20', inner: 'bg-blue-400/30' },
  };
  const c = colors[color];
  return (
    <span className="relative flex items-center justify-center w-10 h-10">
      <motion.span className={`absolute w-10 h-10 rounded-full ${c.outer}`} animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.span className={`absolute w-7 h-7 rounded-full ${c.inner}`} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <Headphones className="w-5 h-5 text-white relative z-10" />
    </span>
  );
}

// ── Timer display ──
function CallTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="text-[13px] text-white/70 font-mono tabular-nums" style={{ fontWeight: 500 }}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// ── Countdown display ──
function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onEnd(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onEnd]);
  return <span className="font-mono tabular-nums">{remaining}s</span>;
}

// ── Star rating ──
function StarRating({ rating, onRate }: { rating: number; onRate: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onRate(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-5 h-5 transition-colors duration-150 ${
              n <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const SUPPORT_AGENTS = [
  { name: 'Priya S.', role: 'Customer Success', initials: 'PS', color: 'bg-violet-500' },
  { name: 'Arjun M.', role: 'Account Manager', initials: 'AM', color: 'bg-blue-500' },
  { name: 'Neha K.', role: 'Support Lead', initials: 'NK', color: 'bg-emerald-500' },
  { name: 'Rohan D.', role: 'Technical Support', initials: 'RD', color: 'bg-orange-500' },
];

/* ═══════════════════════════════════════════════════
   SCHEDULED CALLS PERSISTENCE
   ═══════════════════════════════════════════════════ */

interface ScheduledCall {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  note: string;
  createdAt: number;
  agentName: string;
}

const STORAGE_KEY = 'brego_scheduled_calls';

function loadScheduledCalls(): ScheduledCall[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const calls: ScheduledCall[] = JSON.parse(raw);
    // Filter out past calls
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return calls.filter(c => c.date > todayStr || (c.date === todayStr && c.time > nowTime));
  } catch {
    return [];
  }
}

function saveScheduledCalls(calls: ScheduledCall[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
    // Dispatch custom event so same-tab listeners can react
    window.dispatchEvent(new CustomEvent('scheduled-calls-updated'));
  } catch { /* ignore */ }
}

function formatDateLabel(dateStr: string): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

function formatTimeLabel(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h12}:${mStr} ${ampm}`;
}

/** Check if date is "today" */
function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

/** Check if date is "tomorrow" */
function isTomorrow(dateStr: string): boolean {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return dateStr === t.toISOString().slice(0, 10);
}

function getRelativeDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  return formatDateLabel(dateStr);
}

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

type CallState =
  | 'idle'            // Nothing happening
  | 'pre-call'        // Confirmation sheet before calling
  | 'schedule'        // Schedule a call picker
  | 'schedule-confirmed' // Schedule confirmed
  | 'manage-scheduled' // View/manage upcoming scheduled calls
  | 'ringing'         // Outbound ring, waiting for agent
  | 'queue'           // Placed in queue (all agents busy)
  | 'connecting'      // Agent accepted, establishing
  | 'connected'       // Active call
  | 'on-hold'         // Agent put user on hold
  | 'reconnecting'    // Connection dropped, auto-retry
  | 'declined'        // Agent/team declined
  | 'no-answer'       // Ring timed out
  | 'connection-failed' // Network error
  | 'call-dropped'    // Reconnection failed
  | 'ended'           // Normal end
  | 'feedback';       // Post-call rating

type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'critical';

interface HuddleCallProps {
  isOpen: boolean;
  onClose: () => void;
  teamStatus: { status: 'online' | 'away' | 'offline'; label: string; detail: string };
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export function HuddleCall({ isOpen, onClose, teamStatus }: HuddleCallProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [connectedAgent, setConnectedAgent] = useState(SUPPORT_AGENTS[0]);
  const [callStartTime, setCallStartTime] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('excellent');
  const [queuePosition, setQueuePosition] = useState(0);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [callEndedDuration, setCallEndedDuration] = useState('');

  // ── Schedule Call state ──
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [scheduleNote, setScheduleNote] = useState('');
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(() => loadScheduledCalls());
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const qualityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  // Show pre-call when opened
  useEffect(() => {
    if (isOpen && callState === 'idle') {
      setCallState('pre-call');
      setIsExpanded(true);
      setFeedbackRating(0);
      setFeedbackNote('');
      setFeedbackSubmitted(false);
    }
  }, [isOpen, callState]);

  // ── Simulate connection quality fluctuation ──
  const startQualitySimulation = useCallback(() => {
    setConnectionQuality('excellent');
    qualityIntervalRef.current = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.6) setConnectionQuality('excellent');
      else if (rand < 0.85) setConnectionQuality('good');
      else if (rand < 0.95) setConnectionQuality('poor');
      else setConnectionQuality('critical');
    }, 8000);
  }, []);

  // ── Initiate the call ──
  const startCall = useCallback(() => {
    const agent = SUPPORT_AGENTS[Math.floor(Math.random() * SUPPORT_AGENTS.length)];
    setConnectedAgent(agent);
    setIsMuted(false);
    setIsSpeakerOff(false);
    setReconnectAttempt(0);

    if (teamStatus.status === 'offline') {
      // Offline → simulate no-answer after ring
      setCallState('ringing');
      addTimeout(() => {
        // 70% no-answer, 30% lucky connect
        if (Math.random() < 0.7) {
          setCallState('no-answer');
        } else {
          setCallState('connecting');
          addTimeout(() => {
            setCallState('connected');
            setCallStartTime(Date.now());
            startQualitySimulation();
          }, 1500);
        }
      }, 6000);
    } else if (teamStatus.status === 'away') {
      // Away → queue first, then connect
      setCallState('ringing');
      addTimeout(() => {
        setQueuePosition(Math.floor(Math.random() * 3) + 1);
        setCallState('queue');
        // Simulate queue countdown
        let pos = Math.floor(Math.random() * 3) + 1;
        const queueTick = () => {
          pos--;
          if (pos > 0) {
            setQueuePosition(pos);
            addTimeout(queueTick, 2500);
          } else {
            setCallState('connecting');
            addTimeout(() => {
              setCallState('connected');
              setCallStartTime(Date.now());
              startQualitySimulation();
            }, 1500);
          }
        };
        addTimeout(queueTick, 3000);
      }, 3000);
    } else {
      // Online → normal flow with small chance of decline
      setCallState('ringing');
      addTimeout(() => {
        const outcome = Math.random();
        if (outcome < 0.08) {
          // 8% chance: declined
          setCallState('declined');
        } else if (outcome < 0.12) {
          // 4% chance: connection failed
          setCallState('connection-failed');
        } else {
          setCallState('connecting');
          addTimeout(() => {
            setCallState('connected');
            setCallStartTime(Date.now());
            startQualitySimulation();
          }, 1200);
        }
      }, 2500);
    }
  }, [teamStatus, addTimeout, startQualitySimulation]);

  // ── End call ──
  const endCall = useCallback(() => {
    clearAllTimeouts();
    if (callState === 'connected' || callState === 'on-hold') {
      const dur = Math.floor((Date.now() - callStartTime) / 1000);
      const m = Math.floor(dur / 60);
      const s = dur % 60;
      setCallEndedDuration(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      setCallState('feedback');
    } else {
      setCallState('ended');
      addTimeout(() => { setCallState('idle'); onClose(); }, 1500);
    }
  }, [callState, callStartTime, clearAllTimeouts, addTimeout, onClose]);

  // ── Cancel / dismiss ──
  const dismiss = useCallback(() => {
    clearAllTimeouts();
    setRescheduleId(null);
    setCancelConfirmId(null);
    setCallState('idle');
    onClose();
  }, [clearAllTimeouts, onClose]);

  // ── Retry call ──
  const retryCall = useCallback(() => {
    clearAllTimeouts();
    setCallState('idle');
    // Small delay then restart
    addTimeout(() => startCall(), 300);
  }, [clearAllTimeouts, addTimeout, startCall]);

  // ── Simulate on-hold toggle (for demo) ──
  const simulateHold = useCallback(() => {
    if (callState === 'connected') {
      setCallState('on-hold');
      // Agent comes back after 5-8 seconds
      addTimeout(() => setCallState('connected'), 5000 + Math.random() * 3000);
    }
  }, [callState, addTimeout]);

  // ── Simulate reconnection (when quality goes critical) ──
  useEffect(() => {
    if (callState === 'connected' && connectionQuality === 'critical') {
      const shouldDrop = Math.random() < 0.3;
      if (shouldDrop) {
        clearAllTimeouts();
        setReconnectAttempt(1);
        setCallState('reconnecting');
      }
    }
  }, [connectionQuality, callState, clearAllTimeouts]);

  // ── Handle reconnecting state ──
  useEffect(() => {
    if (callState !== 'reconnecting') return;
    const attempt = reconnectAttempt;
    if (attempt > 3) {
      setCallState('call-dropped');
      return;
    }
    const t = addTimeout(() => {
      if (Math.random() < 0.7) {
        // Success
        setCallState('connected');
        setConnectionQuality('good');
        startQualitySimulation();
      } else {
        // Fail, try again
        setReconnectAttempt((a) => a + 1);
      }
    }, 2000 + attempt * 500);
    return () => clearTimeout(t);
  }, [callState, reconnectAttempt, addTimeout, startQualitySimulation]);

  // ── Submit feedback ──
  const submitFeedback = useCallback(() => {
    setFeedbackSubmitted(true);
    addTimeout(() => { setCallState('idle'); onClose(); }, 2000);
  }, [addTimeout, onClose]);

  const skipFeedback = useCallback(() => {
    setCallState('idle');
    onClose();
  }, [onClose]);

  // ── Scheduled calls management ──
  const refreshScheduledCalls = useCallback(() => {
    setScheduledCalls(loadScheduledCalls());
  }, []);

  const addScheduledCall = useCallback((date: string, time: string, note: string) => {
    const agent = SUPPORT_AGENTS[Math.floor(Math.random() * SUPPORT_AGENTS.length)];
    const newCall: ScheduledCall = {
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date,
      time,
      note,
      createdAt: Date.now(),
      agentName: agent.name,
    };
    const updated = [...loadScheduledCalls(), newCall].sort((a, b) =>
      a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
    );
    saveScheduledCalls(updated);
    setScheduledCalls(updated);
    return newCall;
  }, []);

  const updateScheduledCall = useCallback((id: string, date: string, time: string, note: string) => {
    const calls = loadScheduledCalls();
    const updated = calls.map(c => c.id === id ? { ...c, date, time, note } : c)
      .sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date));
    saveScheduledCalls(updated);
    setScheduledCalls(updated);
  }, []);

  const cancelScheduledCall = useCallback((id: string) => {
    const calls = loadScheduledCalls().filter(c => c.id !== id);
    saveScheduledCalls(calls);
    setScheduledCalls(calls);
    setCancelConfirmId(null);
  }, []);

  // Refresh scheduled calls on mount / when panel opens
  useEffect(() => {
    if (isOpen) refreshScheduledCalls();
  }, [isOpen, refreshScheduledCalls]);

  // ── Connection quality data ──
  const qualityData: Record<ConnectionQuality, { label: string; color: string; icon: typeof Signal }> = {
    excellent: { label: 'Excellent', color: 'text-green-400/70', icon: Signal },
    good: { label: 'Good', color: 'text-green-400/50', icon: Signal },
    poor: { label: 'Unstable', color: 'text-amber-400/70', icon: Signal },
    critical: { label: 'Poor connection', color: 'text-red-400/70', icon: Signal },
  };
  const qData = qualityData[connectionQuality];
  const QualityIcon = qData.icon;

  // Don't render when idle
  if (!isOpen || callState === 'idle') return null;

  /* ═══════════════════════════════════════════════════
     PRE-CALL CONFIRMATION SHEET
     ═══════════════════════════════════════════════════ */
  if (callState === 'pre-call') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 400 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>Start a Huddle</p>
                  <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>Brego Customer Service</p>
                </div>
              </div>
              <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Team status banner */}
            <div className="px-5 pb-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                teamStatus.status === 'online'
                  ? 'bg-green-500/10 border-green-500/20'
                  : teamStatus.status === 'away'
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <span className={`relative flex h-2.5 w-2.5 flex-shrink-0`}>
                  {teamStatus.status === 'online' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    teamStatus.status === 'online' ? 'bg-green-400' : teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] text-white/80" style={{ fontWeight: 600 }}>
                    {teamStatus.status === 'online' ? 'Team is online' : teamStatus.status === 'away' ? 'Team is away' : 'Team is offline'}
                  </p>
                  <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {teamStatus.status === 'online'
                      ? 'Typically answers within seconds'
                      : teamStatus.status === 'away'
                      ? 'You may be placed in a short queue'
                      : 'You can try calling or schedule a call for business hours'}
                  </p>
                </div>
              </div>
            </div>

            {/* Offline warning */}
            {teamStatus.status === 'offline' && (
              <div className="px-5 pb-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <AlertTriangle className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300/80" style={{ fontSize: '13px', fontWeight: 500 }}>
                      The team is currently offline. Your call may not be answered. You can still try, or schedule a call for business hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons — single primary path: start the call.
                "Schedule a call for later" in the footer below covers the
                case where the user would rather not dial right now, so a
                separate "Request Callback" button was redundant. */}
            <div className="px-5 pb-5">
              <motion.button
                onClick={startCall}
                whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm" style={{ fontWeight: 600 }}>Start Call</span>
              </motion.button>
            </div>

            {/* Upcoming Scheduled Calls */}
            {scheduledCalls.length > 0 && (
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/25 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Upcoming Calls ({scheduledCalls.length})
                  </p>
                  {scheduledCalls.length > 1 && (
                    <button
                      onClick={() => setCallState('manage-scheduled')}
                      className="text-[#6b93e8] hover:text-[#8daff0] transition-colors"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      View all
                    </button>
                  )}
                </div>
                {scheduledCalls.slice(0, 2).map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 mb-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#204CC7]/15 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-3.5 h-3.5 text-[#6b93e8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {getRelativeDateLabel(call.date)} · {formatTimeLabel(call.time)} IST
                      </p>
                      {call.note && (
                        <p className="text-white/25 truncate" style={{ fontSize: '13px', fontWeight: 400 }}>{call.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setRescheduleId(call.id);
                          setSelectedDate(call.date);
                          setSelectedTime(call.time);
                          setScheduleNote(call.note);
                          setCallState('schedule');
                        }}
                        className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        aria-label="Reschedule"
                        title="Reschedule"
                      >
                        <RotateCcw className="w-3 h-3 text-white/30" />
                      </button>
                      <button
                        onClick={() => cancelScheduledCall(call.id)}
                        className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                        aria-label="Cancel"
                        title="Cancel call"
                      >
                        <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Schedule Call link */}
            <div className="px-5 pb-5">
              <button
                onClick={() => {
                  setRescheduleId(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setScheduleNote('');
                  setCallState('schedule');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-[13px] text-white/30 hover:text-white/50 hover:bg-white/5 rounded-xl transition-all"
                style={{ fontWeight: 500 }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Schedule a call for later
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     MANAGE SCHEDULED CALLS
     ═══════════════════════════════════════════════════ */
  if (callState === 'manage-scheduled') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 420 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#204CC7]/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-[#6b93e8]" />
                </div>
                <div>
                  <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>Scheduled Calls</p>
                  <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {scheduledCalls.length} upcoming {scheduledCalls.length === 1 ? 'call' : 'calls'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCallState('pre-call')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Back">
                  <ChevronLeft className="w-4 h-4 text-white/40" />
                </button>
                <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>

            {/* Calls list */}
            <div className="px-5 pb-3 max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {scheduledCalls.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CalendarDays className="w-8 h-8 text-white/10 mb-3" />
                  <p className="text-[13px] text-white/30" style={{ fontWeight: 500 }}>No scheduled calls</p>
                  <p className="text-white/15 mt-0.5" style={{ fontSize: '13px', fontWeight: 400 }}>Schedule one to speak with the team at a convenient time.</p>
                </div>
              ) : (
                scheduledCalls.map((call, i) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="mb-2"
                  >
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#204CC7]/15 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-[#6b93e8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white/80" style={{ fontWeight: 600 }}>
                            {getRelativeDateLabel(call.date)}
                          </p>
                          <p className="text-white/35" style={{ fontSize: '13px', fontWeight: 400 }}>
                            {formatTimeLabel(call.time)} IST · Brego Support
                          </p>
                        </div>
                        {/* Relative time badge */}
                        {isToday(call.date) && (
                          <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            Today
                          </span>
                        )}
                        {isTomorrow(call.date) && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 flex-shrink-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            Tomorrow
                          </span>
                        )}
                      </div>

                      {call.note && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-white/25" style={{ fontSize: '13px', fontWeight: 400 }}>
                            <span className="text-white/35" style={{ fontWeight: 600 }}>Note:</span> {call.note}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() => {
                            setRescheduleId(call.id);
                            setSelectedDate(call.date);
                            setSelectedTime(call.time);
                            setScheduleNote(call.note);
                            setCallState('schedule');
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-all border border-transparent hover:border-white/5"
                          style={{ fontSize: '13px', fontWeight: 500 }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reschedule
                        </button>

                        {cancelConfirmId === call.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => cancelScheduledCall(call.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-all"
                              style={{ fontWeight: 600 }}
                            >
                              Confirm cancel
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(null)}
                              className="px-2 py-1.5 rounded-lg text-white/25 hover:text-white/40 hover:bg-white/5 transition-all"
                              style={{ fontWeight: 500 }}
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirmId(call.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all"
                            style={{ fontWeight: 500 }}
                          >
                            <Trash2 className="w-3 h-3" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Schedule new */}
            <div className="px-5 pb-5">
              <motion.button
                onClick={() => {
                  setRescheduleId(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setScheduleNote('');
                  setCallState('schedule');
                }}
                whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#204CC7] hover:bg-[#1a3fa8] text-white transition-all duration-200 shadow-lg shadow-blue-500/20 text-sm"
                style={{ fontWeight: 600 }}
              >
                <CalendarDays className="w-4 h-4" />
                Schedule a New Call
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     SCHEDULE CALL PICKER
     ═══════════════════════════════════════════════════ */
  if (callState === 'schedule') {
    // Generate next 7 business days (Mon-Fri)
    const getBusinessDays = () => {
      const days: { key: string; label: string; dayName: string; dayNum: number; monthShort: string }[] = [];
      const now = new Date();
      let d = new Date(now);
      d.setDate(d.getDate() + 1); // Start from tomorrow
      while (days.length < 7) {
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          days.push({
            key: d.toISOString().slice(0, 10),
            label: `${dayNames[day]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
            dayName: dayNames[day],
            dayNum: d.getDate(),
            monthShort: monthNames[d.getMonth()],
          });
        }
        d = new Date(d);
        d.setDate(d.getDate() + 1);
      }
      return days;
    };

    // IST business hours time slots (10:00 AM – 6:30 PM, 30-min intervals)
    const getTimeSlots = () => {
      const slots: { key: string; label: string; period: 'morning' | 'afternoon' | 'evening' }[] = [];
      for (let h = 10; h <= 18; h++) {
        for (const m of [0, 30]) {
          if (h === 18 && m === 30) break;
          const hh = String(h).padStart(2, '0');
          const mm = String(m).padStart(2, '0');
          const h12 = h > 12 ? h - 12 : h;
          const ampm = h >= 12 ? 'PM' : 'AM';
          const period: 'morning' | 'afternoon' | 'evening' = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
          slots.push({ key: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}`, period });
        }
      }
      return slots;
    };

    const businessDays = getBusinessDays();
    const timeSlots = getTimeSlots();
    const canConfirm = selectedDate && selectedTime;
    const selectedDateInfo = businessDays.find(d => d.key === selectedDate);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 420 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#204CC7]/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-[#6b93e8]" />
                </div>
                <div>
                  <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>{rescheduleId ? 'Reschedule Call' : 'Schedule a Call'}</p>
                  <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>Pick a date & time (IST)</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setRescheduleId(null); setCallState('pre-call'); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Back">
                  <ChevronLeft className="w-4 h-4 text-white/40" />
                </button>
                <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>

            {/* Date selection */}
            <div className="px-5 pb-3">
              <p className="text-white/25 uppercase tracking-wider mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>Select Date</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {businessDays.map((day, i) => (
                  <motion.button
                    key={day.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedDate(day.key)}
                    className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all duration-200 ${
                      selectedDate === day.key
                        ? 'bg-[#204CC7]/20 border-[#204CC7]/40 text-white'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/8 hover:border-white/10'
                    }`}
                  >
                    <span className="uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>{day.dayName}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{day.dayNum}</span>
                    <span style={{ fontSize: '13px', fontWeight: 400 }}>{day.monthShort}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Time slot selection */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-3">
                    <p className="text-white/25 uppercase tracking-wider mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>Select Time (IST)</p>

                    {/* Morning */}
                    <div className="mb-2">
                      <p className="text-white/15 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Morning</p>
                      <div className="flex flex-wrap gap-1.5">
                        {timeSlots.filter(s => s.period === 'morning').map((slot) => (
                          <button
                            key={slot.key}
                            onClick={() => setSelectedTime(slot.key)}
                            className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                              selectedTime === slot.key
                                ? 'bg-[#204CC7]/20 border-[#204CC7]/40 text-white'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
                            }`}
                            style={{ fontSize: '13px', fontWeight: 500 }}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="mb-2">
                      <p className="text-white/15 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Afternoon</p>
                      <div className="flex flex-wrap gap-1.5">
                        {timeSlots.filter(s => s.period === 'afternoon').map((slot) => (
                          <button
                            key={slot.key}
                            onClick={() => setSelectedTime(slot.key)}
                            className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                              selectedTime === slot.key
                                ? 'bg-[#204CC7]/20 border-[#204CC7]/40 text-white'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
                            }`}
                            style={{ fontSize: '13px', fontWeight: 500 }}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Evening */}
                    <div>
                      <p className="text-white/15 mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>Evening</p>
                      <div className="flex flex-wrap gap-1.5">
                        {timeSlots.filter(s => s.period === 'evening').map((slot) => (
                          <button
                            key={slot.key}
                            onClick={() => setSelectedTime(slot.key)}
                            className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                              selectedTime === slot.key
                                ? 'bg-[#204CC7]/20 border-[#204CC7]/40 text-white'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
                            }`}
                            style={{ fontSize: '13px', fontWeight: 500 }}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Optional note */}
            <AnimatePresence>
              {canConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-3">
                    <textarea
                      value={scheduleNote}
                      onChange={(e) => setScheduleNote(e.target.value)}
                      placeholder="What would you like to discuss? (optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
                      style={{ fontWeight: 400 }}
                      rows={2}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm button */}
            <div className="px-5 pb-5">
              <motion.button
                onClick={() => {
                  if (rescheduleId) {
                    updateScheduledCall(rescheduleId, selectedDate, selectedTime, scheduleNote);
                  } else {
                    addScheduledCall(selectedDate, selectedTime, scheduleNote);
                  }
                  setCallState('schedule-confirmed');
                }}
                disabled={!canConfirm}
                whileTap={canConfirm ? { scale: 0.96 } : undefined}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  canConfirm
                    ? 'bg-[#204CC7] hover:bg-[#1a3fa8] text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
                style={{ fontWeight: 600 }}
              >
                <CalendarDays className="w-4 h-4" />
                {canConfirm
                  ? `Schedule for ${selectedDateInfo?.dayName} ${selectedDateInfo?.dayNum} ${selectedDateInfo?.monthShort} at ${timeSlots.find(s => s.key === selectedTime)?.label}`
                  : 'Select date & time to schedule'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     SCHEDULE CONFIRMED
     ═══════════════════════════════════════════════════ */
  if (callState === 'schedule-confirmed') {
    const businessDaysForConfirm = (() => {
      const days: { key: string; dayName: string; dayNum: number; monthShort: string }[] = [];
      const now = new Date();
      let d = new Date(now);
      d.setDate(d.getDate() + 1);
      while (days.length < 7) {
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          days.push({ key: d.toISOString().slice(0, 10), dayName: dayNames[day], dayNum: d.getDate(), monthShort: monthNames[d.getMonth()] });
        }
        d = new Date(d);
        d.setDate(d.getDate() + 1);
      }
      return days;
    })();
    const confirmedDate = businessDaysForConfirm.find(d => d.key === selectedDate);
    const timeSlots2 = (() => {
      const slots: { key: string; label: string }[] = [];
      for (let h = 10; h <= 18; h++) {
        for (const m of [0, 30]) {
          if (h === 18 && m === 30) break;
          const hh = String(h).padStart(2, '0');
          const mm = String(m).padStart(2, '0');
          const h12 = h > 12 ? h - 12 : h;
          const ampm = h >= 12 ? 'PM' : 'AM';
          slots.push({ key: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}` });
        }
      }
      return slots;
    })();
    const confirmedTime = timeSlots2.find(s => s.key === selectedTime);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 400 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10 p-6"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-14 h-14 rounded-full bg-[#204CC7]/20 flex items-center justify-center mb-4"
              >
                <CalendarDays className="w-7 h-7 text-[#6b93e8]" />
              </motion.div>
              <p className="text-sm text-white/90 mb-1" style={{ fontWeight: 600 }}>
                {rescheduleId ? 'Call Rescheduled' : 'Call Scheduled'}
              </p>
              <p className="text-[13px] text-white/40 mb-3" style={{ fontWeight: 400 }}>
                {rescheduleId
                  ? 'Your call has been moved to the new time.'
                  : 'Your call with Brego Support has been scheduled.'}
              </p>

              {/* Schedule details card */}
              <div className="w-full p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#204CC7]/15 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#6b93e8]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] text-white/80" style={{ fontWeight: 600 }}>
                      {confirmedDate?.dayName}, {confirmedDate?.dayNum} {confirmedDate?.monthShort}
                    </p>
                    <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>
                      {confirmedTime?.label} IST · Brego Customer Service
                    </p>
                  </div>
                </div>
                {scheduleNote && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-white/30" style={{ fontSize: '13px', fontWeight: 400 }}>
                      <span style={{ fontWeight: 600 }} className="text-white/40">Note:</span> {scheduleNote}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-white/25" style={{ fontSize: '13px', fontWeight: 400 }}>
                You'll receive a reminder before the call.
              </p>
            </div>

            {/* Done button */}
            <motion.button
              onClick={dismiss}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 transition-all duration-200 border border-white/5"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>Done</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     FEEDBACK SCREEN
     ═══════════════════════════════════════════════════ */
  if (callState === 'feedback') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 400 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {feedbackSubmitted ? (
              /* Thank you state */
              <div className="p-6 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-3"
                >
                  <Check className="w-7 h-7 text-green-400" />
                </motion.div>
                <p className="text-sm text-white/90 mb-1" style={{ fontWeight: 600 }}>Thank you for your feedback!</p>
                <p className="text-[13px] text-white/40" style={{ fontWeight: 400 }}>Your input helps us improve our service.</p>
              </div>
            ) : (
              /* Rating form */
              <>
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-full ${connectedAgent.color} flex items-center justify-center`}>
                      <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>{connectedAgent.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white/80" style={{ fontWeight: 600 }}>Call with {connectedAgent.name}</p>
                      <p className="text-white/35" style={{ fontSize: '13px', fontWeight: 400 }}>Duration: {callEndedDuration} · {connectedAgent.role}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-2">
                  <p className="text-[13px] text-white/60 mb-3" style={{ fontWeight: 500 }}>How was your experience?</p>
                  <StarRating rating={feedbackRating} onRate={setFeedbackRating} />
                </div>

                {feedbackRating > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-3 pt-2">
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder={feedbackRating >= 4 ? 'What did you like? (optional)' : 'How can we improve? (optional)'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
                        style={{ fontWeight: 400 }}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="px-5 pb-5 flex items-center gap-2.5">
                  <motion.button
                    onClick={submitFeedback}
                    disabled={feedbackRating === 0}
                    whileTap={{ scale: 0.96 }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      feedbackRating > 0
                        ? 'bg-[#204CC7] hover:bg-[#1a3fa8] text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    Submit Feedback
                  </motion.button>
                  <button onClick={skipFeedback} className="px-4 py-2.5 rounded-xl text-[13px] text-white/30 hover:text-white/50 hover:bg-white/5 transition-all" style={{ fontWeight: 500 }}>
                    Skip
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     FAILURE STATES (declined, no-answer, connection-failed, call-dropped)
     ═══════════════════════════════════════════════════ */
  if (['declined', 'no-answer', 'connection-failed', 'call-dropped'].includes(callState)) {
    const failureConfig: Record<string, { icon: typeof PhoneMissed; title: string; subtitle: string; iconBg: string; iconColor: string }> = {
      declined: {
        icon: PhoneOff,
        title: 'Call Declined',
        subtitle: 'The support team is currently unable to take calls. Please try again shortly.',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
      },
      'no-answer': {
        icon: PhoneMissed,
        title: 'No Answer',
        subtitle: 'Nobody was available to take your call. The team may be busy or offline.',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
      },
      'connection-failed': {
        icon: WifiOff,
        title: 'Connection Failed',
        subtitle: 'Unable to establish a connection. Please check your network and try again.',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
      },
      'call-dropped': {
        icon: WifiOff,
        title: 'Call Dropped',
        subtitle: 'The connection was lost and could not be restored after multiple attempts.',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
      },
    };
    const config = failureConfig[callState]!;
    const FailIcon = config.icon;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 400 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="p-5">
              {/* Failure icon + message */}
              <div className="flex items-start gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <FailIcon className={`w-5 h-5 ${config.iconColor}`} />
                </motion.div>
                <div>
                  <p className="text-sm text-white/90 mb-0.5" style={{ fontWeight: 600 }}>{config.title}</p>
                  <p className="text-[13px] text-white/40 leading-relaxed" style={{ fontWeight: 400 }}>{config.subtitle}</p>
                </div>
              </div>

              {/* Actions — retry is the single primary action; the footer
                  offers "Schedule instead" for anyone who'd rather not dial
                  again right now. */}
              <div>
                <motion.button
                  onClick={retryCall}
                  whileTap={{ scale: 0.96 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#204CC7] hover:bg-[#1a3fa8] text-white transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[13px]" style={{ fontWeight: 600 }}>Try Again</span>
                </motion.button>
              </div>

              {/* Schedule / Dismiss */}
              <div className="flex items-center justify-center gap-3 mt-2.5">
                <button
                  onClick={() => {
                    setRescheduleId(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setScheduleNote('');
                    setCallState('schedule');
                  }}
                  className="py-2 text-[13px] text-[#6b93e8] hover:text-[#8daff0] transition-colors flex items-center gap-1.5"
                  style={{ fontWeight: 500 }}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Schedule instead
                </button>
                <span className="text-white/10">·</span>
                <button onClick={dismiss} className="py-2 text-[13px] text-white/25 hover:text-white/40 transition-colors" style={{ fontWeight: 500 }}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ════════════════════════════════��══════════════════
     ENDED (brief flash)
     ═══════════════════════════════════════════════════ */
  if (callState === 'ended') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50"
          style={{ width: 280 }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10 px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-center gap-2.5">
              <PhoneOff className="w-4 h-4 text-white/40" />
              <p className="text-[13px] text-white/50" style={{ fontWeight: 500 }}>Call ended</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ═══════════════════════════════════════════════════
     MAIN CALL PANEL (ringing / queue / connecting / connected / on-hold / reconnecting)
     ═══════════════════════════════════════════════════ */
  const isActiveCall = callState === 'connected' || callState === 'on-hold';
  const panelWidth = isExpanded ? 420 : 300;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
        animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
        exit={{ x: '-50%', y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 left-1/2 z-50"
        style={{ width: panelWidth }}
      >
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              {/* Status dot */}
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                {callState === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  callState === 'connected' ? 'bg-green-400'
                    : callState === 'on-hold' ? 'bg-amber-400'
                    : callState === 'reconnecting' ? 'bg-red-400'
                    : 'bg-amber-400'
                }`} />
              </span>
              <div>
                <p className="text-[13px] text-white/90" style={{ fontWeight: 600 }}>
                  {callState === 'connected' ? 'Huddle'
                    : callState === 'on-hold' ? 'On Hold'
                    : callState === 'reconnecting' ? 'Reconnecting...'
                    : callState === 'queue' ? 'In Queue'
                    : 'Starting Huddle...'}
                </p>
                <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>Brego Customer Service</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label={isExpanded ? 'Minimize' : 'Expand'}>
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-white/50" /> : <Maximize2 className="w-3.5 h-3.5 text-white/50" />}
              </button>
              <button onClick={endCall} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>
          </div>

          {/* ─── Expanded Content ─── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                {/* ── Ringing ── */}
                {callState === 'ringing' && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <PulseRing color="green" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate" style={{ fontWeight: 600 }}>Brego Support</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>Connecting to available agent...</p>
                      </div>
                      <motion.div animate={{ rotate: [0, 15, -15, 10, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.8 }}>
                        <Phone className="w-4 h-4 text-green-400" />
                      </motion.div>
                    </div>
                    {/* Estimated wait */}
                    <div className="flex items-center gap-1.5 mt-2.5 px-1">
                      <Clock className="w-3 h-3 text-white/20" />
                      <span className="text-white/25" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Estimated wait: {teamStatus.status === 'online' ? '< 30 seconds' : '1–2 minutes'}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Queue ── */}
                {callState === 'queue' && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <PulseRing color="amber" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>You're in the queue</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>
                          Position <span className="text-amber-400" style={{ fontWeight: 700 }}>#{queuePosition}</span> · All agents are currently busy
                        </p>
                      </div>
                    </div>
                    {/* Queue info */}
                    <div className="flex items-center gap-3 mt-2.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/20" />
                        <span className="text-white/25" style={{ fontSize: '13px', fontWeight: 500 }}>
                          Est. ~{queuePosition * 2} min
                        </span>
                      </div>
                      <span className="text-white/10">·</span>
                      <button
                        onClick={() => {
                          setRescheduleId(null);
                          setSelectedDate('');
                          setSelectedTime('');
                          setScheduleNote('');
                          setCallState('schedule');
                        }}
                        className="text-[#6b93e8] hover:text-[#8daff0] transition-colors"
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      >
                        Schedule instead
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Connecting ── */}
                {callState === 'connecting' && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${connectedAgent.color} flex items-center justify-center`}>
                          <span className="text-white text-[13px]" style={{ fontWeight: 700 }}>{connectedAgent.initials}</span>
                        </div>
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-green-400/40"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate" style={{ fontWeight: 600 }}>{connectedAgent.name}</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>{connectedAgent.role} · Joining...</p>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <PhoneCall className="w-4 h-4 text-green-400" />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* ── Connected ── */}
                {callState === 'connected' && (
                  <div className="px-4 pb-3 space-y-2">
                    {/* Agent card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${connectedAgent.color} flex items-center justify-center`}>
                          <span className="text-white text-[13px]" style={{ fontWeight: 700 }}>{connectedAgent.initials}</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a1a2e]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate" style={{ fontWeight: 600 }}>{connectedAgent.name}</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>{connectedAgent.role}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <HuddleWaveform active={true} color="rgba(74, 222, 128, 0.8)" />
                        <CallTimer startTime={callStartTime} />
                      </div>
                    </div>

                    {/* You (mic status) */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03]">
                      <div className="w-7 h-7 rounded-full bg-[#204CC7] flex items-center justify-center">
                        <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>You</span>
                      </div>
                      <span className="text-[13px] text-white/60 flex-1" style={{ fontWeight: 500 }}>
                        {isMuted ? 'Muted' : 'Speaking'}
                      </span>
                      <HuddleWaveform active={!isMuted} color="rgba(96, 165, 250, 0.7)" />
                    </div>

                    {/* Connection quality */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <QualityIcon className={`w-3 h-3 ${qData.color}`} />
                        <span className={`${qData.color}`} style={{ fontSize: '13px', fontWeight: 500 }}>{qData.label}</span>
                      </div>
                      {connectionQuality === 'poor' && (
                        <span className="text-amber-400/50" style={{ fontSize: '13px', fontWeight: 500 }}>Connection may be unstable</span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── On Hold ── */}
                {callState === 'on-hold' && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${connectedAgent.color} flex items-center justify-center opacity-60`}>
                          <span className="text-white text-[13px]" style={{ fontWeight: 700 }}>{connectedAgent.initials}</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a1a2e]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>{connectedAgent.name} put you on hold</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>Please wait, they'll be right back...</p>
                      </div>
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Pause className="w-4 h-4 text-amber-400/70" />
                      </motion.div>
                    </div>
                    {/* Hold timer */}
                    <div className="flex items-center gap-1.5 mt-2 px-1">
                      <Clock className="w-3 h-3 text-amber-400/30" />
                      <span className="text-white/25" style={{ fontSize: '13px', fontWeight: 500 }}>On hold · Call duration: </span>
                      <CallTimer startTime={callStartTime} />
                    </div>
                  </div>
                )}

                {/* ── Reconnecting ── */}
                {callState === 'reconnecting' && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <PulseRing color="amber" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90" style={{ fontWeight: 600 }}>Connection lost</p>
                        <p className="text-white/40" style={{ fontSize: '13px', fontWeight: 400 }}>
                          Reconnecting... Attempt {reconnectAttempt} of 3
                        </p>
                      </div>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                        <RefreshCw className="w-4 h-4 text-amber-400/70" />
                      </motion.div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2.5 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-400/50 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 + reconnectAttempt * 0.5, ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Controls Bar ─── */}
          <div className="px-4 py-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              {/* Left — collapsed info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {!isExpanded && isActiveCall && (
                  <>
                    <div className={`w-6 h-6 rounded-full ${connectedAgent.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white" style={{ fontSize: '13px', fontWeight: 700 }}>{connectedAgent.initials}</span>
                    </div>
                    {callState === 'on-hold' ? (
                      <span className="text-amber-400/70" style={{ fontSize: '13px', fontWeight: 600 }}>On Hold</span>
                    ) : (
                      <HuddleWaveform active={!isMuted} color="rgba(74, 222, 128, 0.7)" />
                    )}
                    <CallTimer startTime={callStartTime} />
                  </>
                )}
                {!isExpanded && !isActiveCall && (
                  <p className="text-[13px] text-white/50 truncate" style={{ fontWeight: 500 }}>
                    {callState === 'ringing' ? 'Ringing...' : callState === 'queue' ? `Queue #${queuePosition}` : callState === 'connecting' ? 'Connecting...' : callState === 'reconnecting' ? `Reconnecting (${reconnectAttempt}/3)...` : ''}
                  </p>
                )}
              </div>

              {/* Center — action buttons */}
              <div className="flex items-center gap-2">
                {/* Mute */}
                <motion.button
                  onClick={() => setIsMuted((v) => !v)}
                  disabled={!isActiveCall}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                  } ${!isActiveCall ? 'opacity-40 cursor-not-allowed' : ''}`}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.button>

                {/* Speaker */}
                <motion.button
                  onClick={() => setIsSpeakerOff((v) => !v)}
                  disabled={!isActiveCall}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    isSpeakerOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                  } ${!isActiveCall ? 'opacity-40 cursor-not-allowed' : ''}`}
                  aria-label={isSpeakerOff ? 'Turn speaker on' : 'Turn speaker off'}
                >
                  {isSpeakerOff ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>

                {/* End Call */}
                <motion.button
                  onClick={endCall}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/25"
                  aria-label="End call"
                >
                  <PhoneOff className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   HUDDLE BUTTON (header trigger)
   ═══════════════════════════════════════════════════ */

export function HuddleButton({
  onClick,
  isActive,
  teamStatus,
  scheduledCount = 0,
}: {
  onClick: () => void;
  isActive: boolean;
  teamStatus: { status: 'online' | 'away' | 'offline'; label: string };
  scheduledCount?: number;
}) {
  const hasScheduled = !isActive && scheduledCount > 0;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
        isActive
          ? 'bg-green-50 border-green-200 text-green-700 shadow-sm shadow-green-100'
          : hasScheduled
          ? 'bg-blue-50/60 border-[#204CC7]/15 text-[#204CC7] hover:bg-blue-50 hover:border-[#204CC7]/25 shadow-[0_1px_3px_rgba(32,76,199,0.06)]'
          : 'bg-white border-gray-200/60 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}
      aria-label={isActive ? 'Huddle active' : hasScheduled ? `Start a huddle · ${scheduledCount} scheduled` : 'Start a huddle'}
      title={isActive ? 'Huddle in progress' : hasScheduled ? `Call Brego Support · ${scheduledCount} upcoming` : 'Call Brego Support'}
    >
      <Headphones className="w-4 h-4" />
      <span className="text-[13px]" style={{ fontWeight: 600 }}>Huddle</span>
      {isActive && (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      )}
      {!isActive && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            hasScheduled
              ? 'bg-[#204CC7]'
              : teamStatus.status === 'online' ? 'bg-green-500' : teamStatus.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
          }`}
        />
      )}
    </motion.button>
  );
}

/** Hook to get the current count of scheduled calls for the badge */
export function useScheduledCallsCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => setCount(loadScheduledCalls().length);
    refresh();
    // Listen for storage changes (cross-tab) and custom events (same-tab)
    window.addEventListener('storage', refresh);
    window.addEventListener('scheduled-calls-updated', refresh);
    // Poll every 30 seconds to auto-clean expired calls
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('scheduled-calls-updated', refresh);
      clearInterval(interval);
    };
  }, []);
  return count;
}
