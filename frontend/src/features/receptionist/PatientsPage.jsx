import { useCallback, useState } from 'react';
import { Users } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import TextField from '../../components/common/TextField.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ReceptionistPatientsPage() {
  const [search, setSearch] = useState('');

  const fetchPatients = useCallback(
    () => patientsApi.list({ search: search || undefined, limit: 50 }),
    [search]
  );
  const { data, loading, error } = useFetch(fetchPatients, [search]);
  const patients = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Patients
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Every registered patient.
        </p>
      </div>

      <div className="max-w-sm">
        <TextField
          id="search"
          label="Search"
          placeholder="Name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && patients.length === 0 && (
        <EmptyState icon={Users} title="No patients match" />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((p) => (
          <Card key={p.id}>
            <p className="font-medium text-ink-light dark:text-ink-dark">{p.fullName}</p>
            <p className="mt-1 text-xs text-ink-light/50 dark:text-ink-dark/50">
              {p.contactNumber || 'No phone on file'}
            </p>
            {p.bloodGroup && (
              <p className="mt-2 text-xs text-ink-light/60 dark:text-ink-dark/60">
                Blood group: {p.bloodGroup}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
