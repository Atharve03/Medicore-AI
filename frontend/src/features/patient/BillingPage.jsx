import { useCallback } from 'react';
import { Receipt } from 'lucide-react';

import { patientsApi } from '../../api/patients.api.js';
import { billingApi } from '../../api/billing.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

export default function BillingPage() {
  const fetchProfile = useCallback(() => patientsApi.getMe(), []);
  const { data: profile } = useFetch(fetchProfile, []);

  const fetchInvoices = useCallback(() => {
    if (!profile?.id) return Promise.resolve({ data: { data: null } });
    return billingApi.listByPatient(profile.id, { limit: 50 });
  }, [profile?.id]);
  const { data, loading, error } = useFetch(fetchInvoices, [profile?.id]);
  const invoices = data?.items || [];

  if (!profile) return <p className="text-sm text-ink-light/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Billing
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Invoices for appointments, admissions, pharmacy, and lab work.
        </p>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && invoices.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices from your visits will appear here."
        />
      )}

      <div className="flex flex-col gap-3">
        {invoices.map((inv) => (
          <Card key={inv.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm capitalize text-ink-light dark:text-ink-dark">
                  {inv.relatedTo.type}
                </p>
                <p className="font-data text-xs text-ink-light/50 dark:text-ink-dark/50">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={inv.status} />
            </div>

            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {inv.lineItems.map((item, i) => (
                <li key={i} className="flex justify-between text-ink-light/70 dark:text-ink-dark/70">
                  <span>{item.description}</span>
                  <span className="font-data">₹{item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-clinical-100 pt-3 font-data text-sm dark:border-clinical-700">
              <span className="text-ink-light/60 dark:text-ink-dark/60">
                Paid ₹{inv.paidAmount.toFixed(2)} of ₹{inv.totalAmount.toFixed(2)}
              </span>
              <span
                className={
                  inv.balanceDue > 0
                    ? 'font-semibold text-critical-500'
                    : 'font-semibold text-vital-500'
                }
              >
                {inv.balanceDue > 0 ? `₹${inv.balanceDue.toFixed(2)} due` : 'Settled'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
