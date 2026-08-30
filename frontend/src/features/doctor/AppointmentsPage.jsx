import { useCallback, useState } from 'react';
import { CalendarClock } from 'lucide-react';

import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

// Mirrors backend ALLOWED_TRANSITIONS (appointment.service.js) so the UI
// never offers a transition the API would reject.
const NEXT_ACTIONS = {
  requested: [
    { label: 'Confirm', status: 'confirmed', variant: 'primary' },
    { label: 'Decline', status: 'cancelled', variant: 'secondary' },
  ],
  confirmed: [
    { label: 'Mark completed', status: 'completed', variant: 'primary' },
    { label: 'No-show', status: 'noShow', variant: 'secondary' },
    { label: 'Cancel', status: 'cancelled', variant: 'secondary' },
  ],
};

export default function DoctorAppointmentsPage() {
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMine = useCallback(() => appointmentsApi.listMine({ limit: 50 }), []);
  const { data, loading, error, refetch } = useFetch(fetchMine, []);
  const appointments = (data?.items || []).slice().sort(
    (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
  );

  async function handleTransition(id, status) {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, status);
      refetch();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Appointments
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Your full schedule, oldest to newest.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No appointments"
          description="Appointments patients book with you will appear here."
        />
      )}

      <div className="flex flex-col gap-3">
        {appointments.map((appt) => (
          <Card key={appt.id} className="flex items-center justify-between">
            <div>
              <p className="font-data text-sm font-medium text-ink-light dark:text-ink-dark">
                {new Date(appt.scheduledAt).toLocaleString()}
              </p>
              {appt.reasonForVisit && (
                <p className="mt-0.5 text-sm text-ink-light/60 dark:text-ink-dark/60">
                  {appt.reasonForVisit}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={appt.status} />
              {(NEXT_ACTIONS[appt.status] || []).map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  loading={updatingId === appt.id}
                  onClick={() => handleTransition(appt.id, action.status)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
