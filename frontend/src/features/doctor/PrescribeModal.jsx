import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { prescriptionsApi } from '../../api/prescriptions.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function PrescribeModal({ open, onClose, medicalRecordId, onCreated }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      medicines: [{ medicineId: '', dosage: '', frequency: '', durationDays: 5 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await prescriptionsApi.create({
        medicalRecordId,
        medicines: values.medicines.map((m) => ({
          ...m,
          durationDays: Number(m.durationDays),
        })),
      });
      reset();
      onCreated();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not create this prescription.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Prescribe medicines">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
          Medicine ID references the pharmacy catalog — ask your pharmacist for the
          catalog ID if you don&apos;t have it, since doctors don&apos;t have catalog
          browse access in this build.
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-clinical-100 p-3 dark:border-clinical-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
                Medicine {index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-critical-500"
                  aria-label="Remove medicine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField
                id={`medicineId-${index}`}
                label="Medicine ID"
                error={errors.medicines?.[index]?.medicineId?.message}
                {...register(`medicines.${index}.medicineId`, { required: true })}
              />
              <TextField
                id={`dosage-${index}`}
                label="Dosage"
                placeholder="500mg"
                error={errors.medicines?.[index]?.dosage?.message}
                {...register(`medicines.${index}.dosage`, { required: true })}
              />
              <TextField
                id={`frequency-${index}`}
                label="Frequency"
                placeholder="twice daily"
                error={errors.medicines?.[index]?.frequency?.message}
                {...register(`medicines.${index}.frequency`, { required: true })}
              />
              <TextField
                id={`durationDays-${index}`}
                label="Duration (days)"
                type="number"
                error={errors.medicines?.[index]?.durationDays?.message}
                {...register(`medicines.${index}.durationDays`, { required: true, min: 1 })}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            append({ medicineId: '', dosage: '', frequency: '', durationDays: 5 })
          }
          className="flex items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
        >
          <Plus className="h-4 w-4" /> Add another medicine
        </button>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Create prescription
        </Button>
      </form>
    </Modal>
  );
}
