import { useCallback, useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';

import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import BookForPatientModal from './BookForPatientModal.jsx';

const STATUSES = ['requested', 'confirmed', 'completed', 'cancelled', 'noShow'];

// Mirrors backend ALLOWED_TRANSITIONS — receptionist can confirm/cancel
// like a doctor can, but has no "completed"/"noShow" clinical judgment call.
const NEXT_ACTIONS = {
  requested: [
    { label: 'Confirm', status: 'confirmed', variant: 'primary' },
    { label: 'Cancel', status: 'cancelled', variant: 'secondary' },
  ],
  confirmed: [{ label: 'Cancel', status: 'cancelled', variant: 'secondary' }],
};

export default function ReceptionistAppointmentsPage() {
  const [status, setStatus] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAll = useCallback(
    () => appointmentsApi.listAll({ status: status || undefined, limit: 50 }),
    [status]
  );
  const { data, loading, error, refetch } = useFetch(fetchAll, [status]);
  const appointments = data?.items || [];

  async function handleTransition(id, next) {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, next);
      refetch();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            Appointments
          </h2>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
            Book, confirm, and manage the schedule.
          </p>
        </div>
        <Button onClick={() => setBookOpen(true)}>
          <Plus className="h-4 w-4" /> Book for patient
        </Button>
      </div>

      <div className="max-w-xs">
        <Select id="status" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState icon={CalendarClock} title="No appointments match" />
      )}

      <div className="flex flex-col gap-2">
        {appointments.map((appt) => (
          <Card key={appt.id} className="flex items-center justify-between py-3">
            <p className="font-data text-sm text-ink-light dark:text-ink-dark">
              {new Date(appt.scheduledAt).toLocaleString()}
            </p>
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

      <BookForPatientModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={() => {
          setBookOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
