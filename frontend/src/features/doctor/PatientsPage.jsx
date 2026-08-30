import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

import { appointmentsApi } from '../../api/appointments.api.js';
import { patientsApi } from '../../api/patients.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function PatientsPage() {
  const fetchAppointments = useCallback(
    () => appointmentsApi.listMine({ limit: 100 }),
    []
  );
  const { data, loading: apptsLoading } = useFetch(fetchAppointments, []);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    if (!data?.items) return;

    const lastVisitByPatient = new Map();
    for (const appt of data.items) {
      const existing = lastVisitByPatient.get(appt.patientId);
      if (!existing || new Date(appt.scheduledAt) > new Date(existing)) {
        lastVisitByPatient.set(appt.patientId, appt.scheduledAt);
      }
    }

    const uniqueIds = [...lastVisitByPatient.keys()];
    if (uniqueIds.length === 0) {
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    setLoadingPatients(true);
    Promise.all(
      uniqueIds.map((id) =>
        patientsApi
          .getById(id)
          .then((res) => ({ ...res.data.data, lastVisit: lastVisitByPatient.get(id) }))
          .catch(() => null)
      )
    ).then((results) => {
      setPatients(results.filter(Boolean));
      setLoadingPatients(false);
    });
  }, [data]);

  const loading = apptsLoading || loadingPatients;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Your Patients
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Based on your appointment history.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

      {!loading && patients.length === 0 && (
        <EmptyState
          icon={Users}
          title="No patients yet"
          description="Once you have appointments, your patients will appear here."
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((p) => (
          <Link key={p.id} to={`/doctor/patients/${p.id}`}>
            <Card className="h-full transition-colors hover:border-clinical-300">
              <p className="font-medium text-ink-light dark:text-ink-dark">{p.fullName}</p>
              <p className="mt-1 font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                Last visit {new Date(p.lastVisit).toLocaleDateString()}
              </p>
              {p.bloodGroup && (
                <p className="mt-2 text-xs text-ink-light/60 dark:text-ink-dark/60">
                  Blood group: {p.bloodGroup}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
