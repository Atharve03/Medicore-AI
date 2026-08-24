import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';

import { notificationsApi } from '../../api/notifications.api.js';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await notificationsApi.listMine({ limit: 50 });
      setNotifications(data.data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkRead(id) {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  if (loading) {
    return <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">Loading…</p>;
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="Updates about appointments, billing, and lab results will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mb-2 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
        Notifications
      </h2>
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => !n.isRead && handleMarkRead(n.id)}
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
            n.isRead
              ? 'border-clinical-100 bg-white dark:border-clinical-800 dark:bg-clinical-900'
              : 'border-clinical-200 bg-clinical-50 dark:border-clinical-600 dark:bg-clinical-800'
          }`}
        >
          <BellRing
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              n.isRead ? 'text-ink-light/40 dark:text-ink-dark/40' : 'text-pulse-400'
            }`}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-light dark:text-ink-dark">
              {n.title}
            </p>
            <p className="mt-0.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
              {n.message}
            </p>
            <p className="mt-1 font-data text-xs text-ink-light/40 dark:text-ink-dark/40">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
