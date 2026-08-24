import { useCallback } from 'react';
import { Stethoscope, Paperclip } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { medicalRecordsApi } from '../../api/medicalRecords.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function RecordsPage() {
  const fetchProfile = useCallback(() => patientsApi.getMe(), []);
  const { data: profile } = useFetch(fetchProfile, []);

  const fetchRecords = useCallback(() => {
    if (!profile?.id) return Promise.resolve({ data: { data: null } });
    return medicalRecordsApi.listByPatient(profile.id, { limit: 50 });
  }, [profile?.id]);
  const { data, loading, error } = useFetch(fetchRecords, [profile?.id]);
  const records = data?.items || [];

  if (!profile) return <p className="text-sm text-ink-light/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Medical Records
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Visit notes and diagnoses from your care team.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={Stethoscope}
          title="No medical records yet"
          description="Records from your visits will appear here once a doctor adds them."
        />
      )}

      <div className="flex flex-col gap-3">
        {records.map((record) => (
          <Card key={record.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                  {new Date(record.visitDate).toLocaleDateString()}
                </p>
                <p className="mt-1 font-medium text-ink-light dark:text-ink-dark">
                  {record.diagnosis}
                </p>
                {record.symptoms?.length > 0 && (
                  <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
                    Symptoms: {record.symptoms.join(', ')}
                  </p>
                )}
                {record.notes && (
                  <p className="mt-2 text-sm text-ink-light/70 dark:text-ink-dark/70">
                    {record.notes}
                  </p>
                )}
              </div>
            </div>
            {record.attachments?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {record.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-clinical-200 px-2.5 py-1 text-xs text-clinical-600 hover:bg-clinical-50 dark:border-clinical-700 dark:text-clinical-300"
                  >
                    <Paperclip className="h-3 w-3" /> Attachment {i + 1}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
