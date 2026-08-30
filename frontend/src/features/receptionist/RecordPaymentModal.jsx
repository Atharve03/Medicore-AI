import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { billingApi } from '../../api/billing.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function RecordPaymentModal({ open, onClose, invoice, onPaid }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  async function onSubmit(values) {
    setServerError(null);
    try {
      await billingApi.pay(invoice.id, Number(values.amount));
      reset();
      onPaid();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not record this payment.');
    }
  }

  if (!invoice) return null;

  return (
    <Modal open={open} onClose={onClose} title="Record payment">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-sm text-ink-light/70 dark:text-ink-dark/70">
          Balance due: <span className="font-data font-semibold">₹{invoice.balanceDue.toFixed(2)}</span>
        </p>
        <TextField
          id="amount"
          label="Amount"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Enter an amount',
            min: { value: 0.01, message: 'Must be greater than 0' },
            max: { value: invoice.balanceDue, message: 'Cannot exceed the balance due' },
          })}
        />

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Record payment
        </Button>
      </form>
    </Modal>
  );
}
