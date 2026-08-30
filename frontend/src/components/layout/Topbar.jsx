import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { notificationsApi } from '../../api/notifications.api.js';

export default function Topbar({ title }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { darkMode, toggleDarkMode } = useUiStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    notificationsApi
      .listMine({ isRead: false, limit: 1 })
      .then(({ data }) => {
        if (!cancelled) setUnreadCount(data.data.unreadCount ?? 0);
      })
      .catch(() => {
        // A failed unread-count fetch shouldn't break the shell — the
        // badge just stays at its last known value.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-clinical-100 bg-white px-6 dark:border-clinical-800 dark:bg-clinical-900">
      <h1 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 text-ink-light/70 hover:bg-clinical-50 dark:text-ink-dark/70 dark:hover:bg-clinical-800"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pulse-400 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-ink-light/70 hover:bg-clinical-50 dark:text-ink-dark/70 dark:hover:bg-clinical-800"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="mx-1 h-6 w-px bg-clinical-100 dark:bg-clinical-800" />

        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clinical-100 text-clinical-700 dark:bg-clinical-800 dark:text-clinical-200">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden text-ink-light dark:text-ink-dark sm:inline">
            {user?.fullName}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-ink-light/70 hover:bg-critical-500/10 hover:text-critical-500 dark:text-ink-dark/70"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
