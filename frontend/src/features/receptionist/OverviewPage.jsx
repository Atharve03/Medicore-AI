import { Link } from 'react-router-dom';
import { CalendarClock, Users, Receipt } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';

const QUICK_LINKS = [
  { label: 'Appointments', to: '/receptionist/appointments', icon: CalendarClock },
  { label: 'Patients', to: '/receptionist/patients', icon: Users },
  { label: 'Billing', to: '/receptionist/billing', icon: Receipt },
];

export default function ReceptionistOverviewPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Front desk — bookings, patient lookup, and billing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl border border-clinical-100 bg-white p-6 text-center transition-colors hover:border-clinical-300 dark:border-clinical-800 dark:bg-clinical-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
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
