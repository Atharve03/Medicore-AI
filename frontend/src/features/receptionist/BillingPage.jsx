import { useCallback, useState } from 'react';
import { Receipt, Plus, CreditCard } from 'lucide-react';

import { billingApi } from '../../api/billing.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import PatientSearch from '../../components/common/PatientSearch.jsx';
import CreateInvoiceModal from '../admin/CreateInvoiceModal.jsx';
import RecordPaymentModal from './RecordPaymentModal.jsx';

export default function ReceptionistBillingPage() {
  const [patient, setPatient] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);

  const fetchInvoices = useCallback(() => {
    if (!patient) return Promise.resolve({ data: { data: null } });
    return billingApi.listByPatient(patient.id, { limit: 50 });
  }, [patient]);
  const { data, loading, refetch } = useFetch(fetchInvoices, [patient]);
  const invoices = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Billing
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Find a patient to view, create, or pay their invoices.
        </p>
      </div>

      <div className="max-w-sm">
        <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />
      </div>

      {patient && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink-light dark:text-ink-dark">
              Invoices for {patient.fullName}
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
                  <span className={inv.balanceDue > 0 ? 'text-critical-500' : 'text-vital-500'}>
                    {inv.balanceDue > 0 ? `₹${inv.balanceDue.toFixed(2)} due` : 'Settled'}
                  </span>
                </div>
                {inv.balanceDue > 0 && (
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => setPayInvoice(inv)}
                  >
                    <CreditCard className="h-4 w-4" /> Record payment
                  </Button>
                )}
              </Card>
            ))}
          </div>

          <CreateInvoiceModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            patientId={patient.id}
            onCreated={() => {
              setCreateOpen(false);
              refetch();
            }}
          />

          <RecordPaymentModal
            open={Boolean(payInvoice)}
            onClose={() => setPayInvoice(null)}
            invoice={payInvoice}
            onPaid={() => {
              setPayInvoice(null);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
