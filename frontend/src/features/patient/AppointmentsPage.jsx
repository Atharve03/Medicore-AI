import { useCallback, useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';

import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import BookAppointmentModal from './BookAppointmentModal.jsx';

export default function AppointmentsPage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  const fetchMine = useCallback(() => appointmentsApi.listMine({ limit: 50 }), []);
  const { data, loading, error, refetch } = useFetch(fetchMine, []);
  const appointments = data?.items || [];

  async function handleCancel(id) {
    setCancelingId(id);
    try {
      await appointmentsApi.cancel(id);
      refetch();
    } finally {
      setCancelingId(null);
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
            Book, track, and cancel your visits.
          </p>
        </div>
        <Button onClick={() => setBookOpen(true)}>
          <Plus className="h-4 w-4" /> Book appointment
        </Button>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No appointments yet"
          description="Book your first appointment to see it here."
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
            <div className="flex items-center gap-3">
              <StatusBadge status={appt.status} />
              {['requested', 'confirmed'].includes(appt.status) && (
                <Button
                  variant="secondary"
                  onClick={() => handleCancel(appt.id)}
                  loading={cancelingId === appt.id}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <BookAppointmentModal
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
