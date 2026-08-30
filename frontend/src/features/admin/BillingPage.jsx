import { useCallback, useState } from 'react';
import { Search, Receipt, Plus } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { billingApi } from '../../api/billing.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import CreateInvoiceModal from './CreateInvoiceModal.jsx';

export default function AdminBillingPage() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchPatients = useCallback(
    () => (search ? patientsApi.list({ search, limit: 10 }) : Promise.resolve({ data: { data: null } })),
    [search]
  );
  const { data: patientResults } = useFetch(fetchPatients, [search]);

  const fetchInvoices = useCallback(() => {
    if (!selectedPatient) return Promise.resolve({ data: { data: null } });
    return billingApi.listByPatient(selectedPatient.id, { limit: 50 });
  }, [selectedPatient]);
  const { data, loading, refetch } = useFetch(fetchInvoices, [selectedPatient]);
  const invoices = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Billing
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Find a patient to view or create invoices — invoices are managed per patient.
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
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink-light dark:text-ink-dark">
              Invoices for {selectedPatient.fullName}
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New invoice
            </Button>
          </div>

          {loading && <p className="text-sm text-ink-light/50">Loading…</p>}

          {!loading && invoices.length === 0 && (
            <EmptyState icon={Receipt} title="No invoices for this patient yet" />
          )}

          <div className="flex flex-col gap-3">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize text-ink-light dark:text-ink-dark">
                    {inv.relatedTo.type}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="mt-2 flex items-center justify-between font-data text-sm">
                  <span className="text-ink-light/60 dark:text-ink-dark/60">
                    ₹{inv.paidAmount.toFixed(2)} / ₹{inv.totalAmount.toFixed(2)}
                  </span>
                  <span
                    className={
                      inv.balanceDue > 0 ? 'text-critical-500' : 'text-vital-500'
                    }
                  >
                    {inv.balanceDue > 0 ? `₹${inv.balanceDue.toFixed(2)} due` : 'Settled'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <CreateInvoiceModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            patientId={selectedPatient.id}
            onCreated={() => {
              setCreateOpen(false);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
