import { useCallback } from 'react';
import { Pill } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { prescriptionsApi } from '../../api/prescriptions.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

export default function PrescriptionsPage() {
  const fetchProfile = useCallback(() => patientsApi.getMe(), []);
  const { data: profile } = useFetch(fetchProfile, []);

  const fetchPrescriptions = useCallback(() => {
    if (!profile?.id) return Promise.resolve({ data: { data: null } });
    return prescriptionsApi.listByPatient(profile.id, { limit: 50 });
  }, [profile?.id]);
  const { data, loading, error } = useFetch(fetchPrescriptions, [profile?.id]);
  const prescriptions = data?.items || [];

  if (!profile) return <p className="text-sm text-ink-light/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Prescriptions
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Medicines prescribed by your doctors.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && prescriptions.length === 0 && (
        <EmptyState
          icon={Pill}
          title="No prescriptions yet"
          description="Prescriptions from your visits will appear here."
        />
      )}

      <div className="flex flex-col gap-3">
        {prescriptions.map((rx) => (
          <Card key={rx.id}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                {new Date(rx.createdAt).toLocaleDateString()}
              </p>
              <StatusBadge status={rx.status} />
            </div>
            <ul className="flex flex-col gap-2">
              {rx.medicines.map((m, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-clinical-50 px-3 py-2 text-sm dark:bg-clinical-800"
                >
                  <span className="text-ink-light dark:text-ink-dark">
                    {m.dosage} · {m.frequency}
                  </span>
                  <span className="font-data text-ink-light/60 dark:text-ink-dark/60">
                    {m.durationDays} days
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
