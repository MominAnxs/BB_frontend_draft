'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bell, Mail, MessageCircle, Clock, Shield,
  MessageSquare, CheckSquare, Target, AlertTriangle, FolderOpen,
  CheckCircle2,
} from 'lucide-react';

// Toasts fire only on the on-transition — confirmation for an opt-in action.
// Toggling off is silent (users don't need an "off" announcement).
// position is overridden per-call so these land at top-center regardless of
// the parent Toaster's default placement (ProfileSettings uses bottom-right
// for other toasts; we don't want to fight that globally).
function announce(label: string) {
  toast.success(`${label} turned on`, {
    position: 'top-center',
    duration: 1600,
  });
}

// ── State model ──
// Topic keys mirror the NotificationType union in NotificationPanel.tsx so every
// preference maps 1:1 to a real signal the platform emits. No invented categories.
type TopicKey = 'chat' | 'task' | 'reports' | 'alerts' | 'dataroom';

interface NotificationState {
  channels: {
    email: boolean;
    sms: boolean;
  };
  topics: Record<TopicKey, boolean>;
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
  };
}

interface Topic {
  key: TopicKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Five topics, each mapped to one real NotificationType (or a natural pair:
// metric_achieved → "Reports & insights", metric_alert → "Alerts & warnings").
// "onboarding" is deliberately excluded — those are one-time setup nudges, not
// an ongoing preference worth cluttering the sheet with.
const TOPICS: readonly Topic[] = [
  {
    key: 'chat',
    label: 'Chat messages',
    desc: 'Messages, replies, and @mentions',
    icon: MessageSquare,
  },
  {
    key: 'task',
    label: 'Task updates',
    desc: 'Assignments, status changes, and deadlines',
    icon: CheckSquare,
  },
  {
    key: 'reports',
    label: 'Reports & insights',
    desc: 'Milestones, targets hit, and weekly summaries',
    icon: Target,
  },
  {
    key: 'alerts',
    label: 'Alerts & warnings',
    desc: 'Anomalies, budget alerts, and compliance deadlines',
    icon: AlertTriangle,
  },
  {
    key: 'dataroom',
    label: 'Dataroom activity',
    desc: 'New files and reports uploaded',
    icon: FolderOpen,
  },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationState>({
    channels: { email: true, sms: false },
    topics: {
      chat: true,
      task: true,
      reports: true,
      alerts: true,
      dataroom: true,
    },
    quietHours: { enabled: false, from: '22:00', to: '08:00' },
  });
  const [saved, setSaved] = useState(false);

  // ── Toggle ──
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer flex-shrink-0 w-11 h-6 ${
        checked ? 'bg-brand' : 'bg-gray-200'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );

  const CHANNEL_LABELS: Record<keyof NotificationState['channels'], string> = {
    email: 'Email',
    sms: 'SMS',
  };

  const setChannel = (key: keyof NotificationState['channels'], value: boolean) => {
    setSettings(prev => ({ ...prev, channels: { ...prev.channels, [key]: value } }));
    if (value) announce(CHANNEL_LABELS[key]);
  };

  const setTopic = (key: TopicKey, value: boolean) => {
    setSettings(prev => ({ ...prev, topics: { ...prev.topics, [key]: value } }));
    if (value) {
      const topic = TOPICS.find(t => t.key === key);
      if (topic) announce(topic.label);
    }
  };

  const setQuietHours = (patch: Partial<NotificationState['quietHours']>) => {
    setSettings(prev => ({ ...prev, quietHours: { ...prev.quietHours, ...patch } }));
    if (patch.enabled === true) announce('Quiet Hours');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notification Settings</h1>
        <p className="text-sm text-gray-600">Control what you get notified about, how, and when.</p>
      </div>

      {/* ─── How you're notified ─── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">How you're notified</h3>
          <p className="text-xs text-gray-500 mt-0.5">Where you'd like to receive notifications</p>
        </div>
        <div className="divide-y divide-gray-100">
          {/* In-App — non-toggleable, always on */}
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">In-App</p>
                <p className="text-xs text-gray-500">Bell icon alerts inside the platform</p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Always on</span>
          </div>

          {/* Email */}
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Mail className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-xs text-gray-500">Sent to your registered email</p>
              </div>
            </div>
            <Toggle
              checked={settings.channels.email}
              onChange={(v) => setChannel('email', v)}
            />
          </div>

          {/* SMS */}
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <MessageCircle className="w-4.5 h-4.5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">SMS</p>
                <p className="text-xs text-gray-500">Text alerts to your registered phone number</p>
              </div>
            </div>
            <Toggle
              checked={settings.channels.sms}
              onChange={(v) => setChannel('sms', v)}
            />
          </div>
        </div>
      </section>

      {/* ─── What you're notified about ─── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">What you're notified about</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pick the kinds of updates you want to hear about</p>
        </div>
        <div className="divide-y divide-gray-100">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const checked = settings.topics[topic.key];
            return (
              <div
                key={topic.key}
                className="px-6 py-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{topic.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{topic.desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={checked}
                  onChange={(v) => setTopic(topic.key, v)}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Quiet Hours ─── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Quiet Hours</p>
              <p className="text-xs text-gray-500 mt-0.5">Pause non-critical notifications overnight</p>
            </div>
          </div>
          <Toggle
            checked={settings.quietHours.enabled}
            onChange={(v) => setQuietHours({ enabled: v })}
          />
        </div>

        {settings.quietHours.enabled && (
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
                <input
                  type="time"
                  value={settings.quietHours.from}
                  onChange={(e) => setQuietHours({ from: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                />
              </div>
              <span className="pt-5 text-xs text-gray-400 font-medium">to</span>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Until</label>
                <input
                  type="time"
                  value={settings.quietHours.to}
                  onChange={(e) => setQuietHours({ to: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Security and billing alerts are always delivered.
            </p>
          </div>
        )}
      </section>

      {/* ─── Save ─── */}
      <div className="flex items-center justify-end pt-1 pb-2">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
            saved
              ? 'bg-green-600 text-white shadow-green-500/25'
              : 'bg-brand text-white shadow-sm hover:bg-brand-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            {saved && <CheckCircle2 className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save Preferences'}
          </span>
        </button>
      </div>
    </div>
  );
}
