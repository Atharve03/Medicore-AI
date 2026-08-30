import { useCallback } from 'react';
import { FlaskConical } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { labApi } from '../../api/lab.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

export default function LabReportsPage() {
  const fetchProfile = useCallback(() => patientsApi.getMe(), []);
  const { data: profile } = useFetch(fetchProfile, []);

  const fetchReports = useCallback(() => {
    if (!profile?.id) return Promise.resolve({ data: { data: null } });
    return labApi.listReportsByPatient(profile.id, { limit: 50 });
  }, [profile?.id]);
  const { data, loading, error } = useFetch(fetchReports, [profile?.id]);
  const reports = data?.items || [];

  if (!profile) return <p className="text-sm text-ink-light/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Lab Reports
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Test orders and results from the laboratory.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && reports.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="No lab reports yet"
          description="Test orders and results will appear here once your doctor orders one."
        />
      )}

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-light dark:text-ink-dark">
                  {report.testType}
                </p>
                <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                  Ordered {new Date(report.orderedAt).toLocaleDateString()}
                  {report.resultAt &&
                    ` · Results ${new Date(report.resultAt).toLocaleDateString()}`}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>

            {report.results?.length > 0 && (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-clinical-100 text-left text-xs uppercase tracking-wide text-ink-light/40 dark:border-clinical-700 dark:text-ink-dark/40">
                    <th className="pb-2 font-medium">Parameter</th>
                    <th className="pb-2 font-medium">Value</th>
                    <th className="pb-2 font-medium">Reference range</th>
                  </tr>
                </thead>
                <tbody className="font-data">
                  {report.results.map((r, i) => (
                    <tr key={i} className="border-b border-clinical-50 last:border-0 dark:border-clinical-800">
                      <td className="py-2 text-ink-light dark:text-ink-dark">{r.parameter}</td>
                      <td className="py-2 text-ink-light dark:text-ink-dark">
                        {r.value} {r.unit}
                      </td>
                      <td className="py-2 text-ink-light/60 dark:text-ink-dark/60">
                        {r.referenceRange || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {report.reportFileUrl && (
              <a
                href={report.reportFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs font-medium text-clinical-600 dark:text-clinical-300"
              >
                View scanned report →
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
