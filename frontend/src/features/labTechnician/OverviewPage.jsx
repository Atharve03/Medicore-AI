import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';

export default function LabTechnicianOverviewPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Test orders and result submission.
        </p>
      </div>

      <Link
        to="/lab/orders"
        className="flex items-center gap-3 rounded-xl border border-clinical-100 bg-white p-6 transition-colors hover:border-clinical-300 dark:border-clinical-800 dark:bg-clinical-900"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
          <FlaskConical className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-ink-light dark:text-ink-dark">Orders</p>
          <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
            Find a patient and submit results for their pending tests
          </p>
        </div>
      </Link>
    </div>
  );
}
