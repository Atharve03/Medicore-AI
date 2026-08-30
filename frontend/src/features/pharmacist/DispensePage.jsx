import { useCallback, useState } from 'react';
import { FlaskConical, Pill } from 'lucide-react';

import { prescriptionsApi } from '../../api/prescriptions.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import PatientSearch from '../../components/common/PatientSearch.jsx';
import DispenseModal from './DispenseModal.jsx';

export default function DispensePage() {
  const [patient, setPatient] = useState(null);
  const [dispensingRx, setDispensingRx] = useState(null);

  const fetchPrescriptions = useCallback(() => {
    if (!patient) return Promise.resolve({ data: { data: null } });
    return prescriptionsApi.listByPatient(patient.id, { status: 'active', limit: 50 });
  }, [patient]);
  const { data, loading, refetch } = useFetch(fetchPrescriptions, [patient]);
  const prescriptions = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Dispense
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Find a patient to fulfill their active prescriptions.
        </p>
      </div>

      <div className="max-w-sm">
        <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />
      </div>

      {patient && (
        <>
          <p className="font-medium text-ink-light dark:text-ink-dark">
            Active prescriptions for {patient.fullName}
          </p>

          {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

          {!loading && prescriptions.length === 0 && (
            <EmptyState icon={FlaskConical} title="No active prescriptions" />
          )}

          <div className="flex flex-col gap-3">
            {prescriptions.map((rx) => (
              <Card key={rx.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </p>
                  <StatusBadge status={rx.status} />
                </div>
                <ul className="flex flex-col gap-1 text-sm">
                  {rx.medicines.map((m, i) => (
                    <li key={i} className="text-ink-light/70 dark:text-ink-dark/70">
                      {m.dosage} · {m.frequency} · {m.durationDays} days
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => setDispensingRx(rx)}
                >
                  <Pill className="h-4 w-4" /> Dispense
                </Button>
              </Card>
            ))}
          </div>

          <DispenseModal
            open={Boolean(dispensingRx)}
            onClose={() => setDispensingRx(null)}
            prescription={dispensingRx}
            onDispensed={() => {
              setDispensingRx(null);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
