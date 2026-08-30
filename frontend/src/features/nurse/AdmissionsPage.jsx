import { useCallback, useState } from 'react';
import { BedDouble, Plus } from 'lucide-react';

import { admissionsApi } from '../../api/admissions.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import PatientSearch from '../../components/common/PatientSearch.jsx';
import AdmitPatientModal from './AdmitPatientModal.jsx';

export default function AdmissionsPage() {
  const [patient, setPatient] = useState(null);
  const [admitOpen, setAdmitOpen] = useState(false);

  const fetchAdmissions = useCallback(() => {
    if (!patient) return Promise.resolve({ data: { data: null } });
    return admissionsApi.listByPatient(patient.id, { limit: 50 });
  }, [patient]);
  const { data, loading, refetch } = useFetch(fetchAdmissions, [patient]);
  const admissions = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Admissions
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Find a patient to view or start an admission. Discharge is handled by the
          attending doctor.
        </p>
      </div>

      <div className="max-w-sm">
        <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />
      </div>

      {patient && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink-light dark:text-ink-dark">
              Admission history for {patient.fullName}
            </p>
            <Button onClick={() => setAdmitOpen(true)}>
              <Plus className="h-4 w-4" /> Admit patient
            </Button>
          </div>

          {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

          {!loading && admissions.length === 0 && (
            <EmptyState icon={BedDouble} title="No admission history" />
          )}

          <div className="flex flex-col gap-3">
            {admissions.map((a) => (
              <Card key={a.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-light dark:text-ink-dark">
                    {a.wardType} · Bed {a.bedNumber}
                  </p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                  Admitted {new Date(a.admittedAt).toLocaleDateString()}
                  {a.dischargedAt &&
                    ` · Discharged ${new Date(a.dischargedAt).toLocaleDateString()}`}
                </p>
              </Card>
            ))}
          </div>

          <AdmitPatientModal
            open={admitOpen}
            onClose={() => setAdmitOpen(false)}
            patientId={patient.id}
            onAdmitted={() => {
              setAdmitOpen(false);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
