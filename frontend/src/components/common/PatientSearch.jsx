import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import TextField from './TextField.jsx';

export default function PatientSearch({ onSelect, selected, onClear }) {
  const [search, setSearch] = useState('');

  const fetchPatients = useCallback(
    () => (search ? patientsApi.list({ search, limit: 10 }) : Promise.resolve({ data: { data: null } })),
    [search]
  );
  const { data } = useFetch(fetchPatients, [search]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-clinical-200 bg-clinical-50 px-3 py-2 dark:border-clinical-700 dark:bg-clinical-800">
        <span className="text-sm font-medium text-ink-light dark:text-ink-dark">
          {selected.fullName}
        </span>
        <button
          onClick={onClear}
          className="text-xs font-medium text-clinical-600 dark:text-clinical-300"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TextField
        id="patientSearch"
        label="Search patients"
        placeholder="Name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (data?.items?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-1">
          {data.items.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex items-center gap-2 rounded-lg border border-clinical-100 px-3 py-2 text-left text-sm hover:bg-clinical-50 dark:border-clinical-700 dark:hover:bg-clinical-800"
            >
              <Search className="h-3.5 w-3.5 text-ink-light/40" />
              {p.fullName}
            </button>
          ))}
        </div>
      )}
      {search && data && data.items?.length === 0 && (
        <p className="text-xs text-ink-light/50">No patients match &quot;{search}&quot;.</p>
      )}
    </div>
  );
}
