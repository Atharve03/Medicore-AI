import { LayoutDashboard } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import EmptyState from '../../components/common/EmptyState.jsx';

/**
 * Rendered at each role's home route until Phase 17-20 build the real
 * dashboard for that role. Honest about its own state rather than faking
 * data — an empty screen is an invitation to act, not a mockup.
 */
export default function OverviewPlaceholder({ phaseLabel }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          You&apos;re signed in as {user?.role}.
        </p>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title={`${phaseLabel} dashboard is coming next`}
        description="The app shell, sign-in, and navigation are live. This role's dashboard content is built in a later phase of the project."
      />
    </div>
  );
}
