import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarClock, Receipt, Boxes } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { adminApi } from '../../api/admin.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';

const QUICK_LINKS = [
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarClock },
  { label: 'Billing', to: '/admin/billing', icon: Receipt },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
];

export default function AdminOverviewPage() {
  const user = useAuthStore((s) => s.user);

  const fetchOverview = useCallback(() => adminApi.getOverview(), []);
  const { data: overview, loading } = useFetch(fetchOverview, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Hospital-wide account overview.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={overview.totalUsers} />
          <StatCard label="Active" value={overview.active} tone="resolved" />
          <StatCard label="Inactive" value={overview.inactive} tone="stopped" />
          <StatCard
            label="Doctors"
            value={overview.byRole?.find((r) => r.role === 'doctor')?.count || 0}
          />
        </div>
      )}

      {overview?.byRole && (
        <Card title="Users by role">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {overview.byRole.map(({ role, count }) => (
              <div
                key={role}
                className="rounded-lg bg-clinical-50 px-3 py-2 text-center dark:bg-clinical-800"
              >
                <p className="font-data text-lg font-semibold text-ink-light dark:text-ink-dark">
                  {count}
                </p>
                <p className="text-xs capitalize text-ink-light/60 dark:text-ink-dark/60">
                  {role}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl border border-clinical-100 bg-white p-5 text-center transition-colors hover:border-clinical-300 dark:border-clinical-800 dark:bg-clinical-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink-light dark:text-ink-dark">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneClass =
    tone === 'resolved'
      ? 'text-vital-500'
      : tone === 'stopped'
        ? 'text-critical-500'
        : 'text-ink-light dark:text-ink-dark';

  return (
    <Card>
      <p className={`font-data text-2xl font-semibold ${toneClass}`}>{value ?? '—'}</p>
      <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">{label}</p>
    </Card>
  );
}
