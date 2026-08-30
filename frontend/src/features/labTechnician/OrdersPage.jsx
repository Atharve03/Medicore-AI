import { useCallback, useState } from 'react';
import { Search, FlaskConical } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { labApi } from '../../api/lab.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import SubmitResultsModal from './SubmitResultsModal.jsx';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const fetchPatients = useCallback(
    () => (search ? patientsApi.list({ search, limit: 10 }) : Promise.resolve({ data: { data: null } })),
    [search]
  );
  const { data: patientResults } = useFetch(fetchPatients, [search]);

  const fetchReports = useCallback(() => {
    if (!selectedPatient) return Promise.resolve({ data: { data: null } });
    return labApi.listReportsByPatient(selectedPatient.id, { limit: 50 });
  }, [selectedPatient]);
  const { data, loading, refetch } = useFetch(fetchReports, [selectedPatient]);
  const reports = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Lab Orders
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Find a patient to see their pending and completed test orders.
        </p>
      </div>

      <div className="max-w-sm">
        <TextField
          id="patientSearch"
          label="Search patients"
          placeholder="Name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPatient(null);
          }}
        />
      </div>

      {search && !selectedPatient && (
        <div className="flex flex-col gap-2">
          {(patientResults?.items || []).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className="flex items-center gap-2 rounded-lg border border-clinical-100 px-3 py-2 text-left text-sm hover:bg-clinical-50 dark:border-clinical-700 dark:hover:bg-clinical-800"
            >
              <Search className="h-3.5 w-3.5 text-ink-light/40" />
              {p.fullName}
            </button>
          ))}
        </div>
      )}

      {selectedPatient && (
        <>
          <p className="font-medium text-ink-light dark:text-ink-dark">
            Orders for {selectedPatient.fullName}
          </p>

          {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

          {!loading && reports.length === 0 && (
            <EmptyState icon={FlaskConical} title="No orders for this patient yet" />
          )}

          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <Card key={report.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-light dark:text-ink-dark">
                    {report.testType}
                  </p>
                  <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                    Ordered {new Date(report.orderedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={report.status} />
                  {report.status !== 'completed' && (
                    <Button variant="secondary" onClick={() => setActiveReport(report)}>
                      Submit results
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SubmitResultsModal
        open={Boolean(activeReport)}
        onClose={() => setActiveReport(null)}
        report={activeReport}
        onSubmitted={() => {
          setActiveReport(null);
          refetch();
        }}
      />
    </div>
  );
}
