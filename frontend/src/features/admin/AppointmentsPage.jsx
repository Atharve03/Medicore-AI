import { useCallback, useState } from 'react';
import { CalendarClock } from 'lucide-react';

import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Select from '../../components/common/Select.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

const STATUSES = ['requested', 'confirmed', 'completed', 'cancelled', 'noShow'];

export default function AdminAppointmentsPage() {
  const [status, setStatus] = useState('');

  const fetchAll = useCallback(
    () => appointmentsApi.listAll({ status: status || undefined, limit: 50 }),
    [status]
  );
  const { data, loading, error } = useFetch(fetchAll, [status]);
  const appointments = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Appointments
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          System-wide view. Status changes are made by the doctor or reception desk.
        </p>
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
        <EmptyState icon={CalendarClock} title="No appointments match" description="Try a different status filter." />
      )}

      <div className="flex flex-col gap-2">
        {appointments.map((appt) => (
          <Card key={appt.id} className="flex items-center justify-between py-3">
            <p className="font-data text-sm text-ink-light dark:text-ink-dark">
              {new Date(appt.scheduledAt).toLocaleString()}
            </p>
            <StatusBadge status={appt.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
