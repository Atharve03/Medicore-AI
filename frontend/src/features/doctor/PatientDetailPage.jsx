import { useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FilePlus, Pill, FlaskConical } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { medicalRecordsApi } from '../../api/medicalRecords.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AddRecordModal from './AddRecordModal.jsx';
import PrescribeModal from './PrescribeModal.jsx';
import OrderLabModal from './OrderLabModal.jsx';

export default function PatientDetailPage() {
  const { id: patientId } = useParams();
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [orderLabOpen, setOrderLabOpen] = useState(false);
  const [prescribeForRecordId, setPrescribeForRecordId] = useState(null);

  const fetchPatient = useCallback(() => patientsApi.getById(patientId), [patientId]);
  const { data: patient } = useFetch(fetchPatient, [patientId]);

  const fetchRecords = useCallback(
    () => medicalRecordsApi.listByPatient(patientId, { limit: 50 }),
    [patientId]
  );
  const { data, loading, refetch } = useFetch(fetchRecords, [patientId]);
  const records = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/doctor/patients"
        className="flex w-fit items-center gap-1 text-sm text-ink-light/60 hover:text-clinical-600 dark:text-ink-dark/60"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            {patient?.fullName || 'Loading…'}
          </h2>
          {patient && (
            <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
              {patient.bloodGroup ? `${patient.bloodGroup} · ` : ''}
              {patient.allergies?.length
                ? `Allergies: ${patient.allergies.join(', ')}`
                : 'No known allergies on file'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOrderLabOpen(true)}>
            <FlaskConical className="h-4 w-4" /> Order lab test
          </Button>
          <Button onClick={() => setAddRecordOpen(true)}>
            <FilePlus className="h-4 w-4" /> Add record
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading records…</p>}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={FilePlus}
          title="No records yet"
          description="Add the first medical record for this patient."
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
              <Button
                variant="secondary"
                onClick={() => setPrescribeForRecordId(record.id)}
              >
                <Pill className="h-4 w-4" /> Prescribe
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AddRecordModal
        open={addRecordOpen}
        onClose={() => setAddRecordOpen(false)}
        patientId={patientId}
        onCreated={() => {
          setAddRecordOpen(false);
          refetch();
        }}
      />

      <OrderLabModal
        open={orderLabOpen}
        onClose={() => setOrderLabOpen(false)}
        patientId={patientId}
        onCreated={() => setOrderLabOpen(false)}
      />

      <PrescribeModal
        open={Boolean(prescribeForRecordId)}
        onClose={() => setPrescribeForRecordId(null)}
        medicalRecordId={prescribeForRecordId}
        onCreated={() => setPrescribeForRecordId(null)}
      />
    </div>
  );
}
