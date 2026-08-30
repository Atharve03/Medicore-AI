import { useCallback, useState } from 'react';
import { Pill, Plus, Pencil, AlertTriangle } from 'lucide-react';

import { pharmacyApi } from '../../api/pharmacy.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import MedicineModal from './MedicineModal.jsx';

export default function MedicinesPage() {
  const [search, setSearch] = useState('');
  const [modalMedicine, setModalMedicine] = useState(undefined); // undefined=closed, null=create, object=edit

  const fetchMedicines = useCallback(
    () => pharmacyApi.listMedicines({ search: search || undefined, limit: 100 }),
    [search]
  );
  const { data, loading, error, refetch } = useFetch(fetchMedicines, [search]);
  const medicines = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            Medicine Catalog
          </h2>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
            Prices and stock levels for dispensing.
          </p>
        </div>
        <Button onClick={() => setModalMedicine(null)}>
          <Plus className="h-4 w-4" /> Add medicine
        </Button>
      </div>

      <div className="max-w-sm">
        <TextField
          id="search"
          label="Search"
          placeholder="Name or generic name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && medicines.length === 0 && (
        <EmptyState icon={Pill} title="No medicines match" />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medicines.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink-light dark:text-ink-dark">{m.name}</p>
                {m.genericName && (
                  <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">{m.genericName}</p>
                )}
              </div>
              <button
                onClick={() => setModalMedicine(m)}
                className="rounded-lg p-1.5 text-ink-light/50 hover:bg-clinical-50 dark:text-ink-dark/50 dark:hover:bg-clinical-800"
                aria-label="Edit medicine"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-data text-lg font-semibold text-ink-light dark:text-ink-dark">
                ₹{m.unitPrice.toFixed(2)}
              </span>
              <span className="font-data text-sm text-ink-light/60 dark:text-ink-dark/60">
                {m.stockQuantity} in stock
              </span>
            </div>
            {m.lowStock && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-alert-500">
                <AlertTriangle className="h-3.5 w-3.5" /> Below reorder level ({m.reorderLevel})
              </p>
            )}
          </Card>
        ))}
      </div>

      <MedicineModal
        open={modalMedicine !== undefined}
        onClose={() => setModalMedicine(undefined)}
        medicine={modalMedicine}
        onSaved={() => {
          setModalMedicine(undefined);
          refetch();
        }}
      />
    </div>
  );
}
