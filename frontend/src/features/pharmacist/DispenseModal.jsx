import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { pharmacyApi } from '../../api/pharmacy.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function DispenseModal({ open, onClose, prescription, onDispensed }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm();

  if (!prescription) return null;

  async function onSubmit(values) {
    setServerError(null);
    try {
      const items = prescription.medicines.map((m, i) => ({
        medicineId: m.medicineId,
        quantity: Number(values[`quantity_${i}`]),
      }));
      await pharmacyApi.dispense({ prescriptionId: prescription.id, items });
      onDispensed();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not dispense this prescription.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Dispense prescription">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {prescription.medicines.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-lg border border-clinical-100 p-3 dark:border-clinical-700"
          >
            <div className="text-sm">
              <p className="font-data text-ink-light/60 dark:text-ink-dark/60">
                Medicine ID: {m.medicineId}
              </p>
              <p className="text-ink-light dark:text-ink-dark">
                {m.dosage} · {m.frequency} · {m.durationDays} days
              </p>
            </div>
            <div className="w-24">
              <TextField
                id={`quantity_${i}`}
                label="Qty"
                type="number"
                error={errors[`quantity_${i}`]?.message}
                {...register(`quantity_${i}`, { required: true, min: 1 })}
              />
            </div>
          </div>
        ))}

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Dispense
        </Button>
      </form>
    </Modal>
  );
}
