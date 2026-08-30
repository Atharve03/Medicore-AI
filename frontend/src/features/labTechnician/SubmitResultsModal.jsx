import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { labApi } from '../../api/lab.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function SubmitResultsModal({ open, onClose, report, onSubmitted }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      results: [{ parameter: '', value: '', unit: '', referenceRange: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'results' });

  if (!report) return null;

  async function onSubmit(values) {
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append('results', JSON.stringify(values.results));
      await labApi.submitResults(report.id, formData);
      onSubmitted();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not submit these results.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Submit results — ${report.testType}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
          Scanned report upload isn&apos;t wired into this form yet — the API supports
          an optional file, but this UI only submits structured values for now.
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2">
            <TextField
              id={`parameter-${index}`}
              label="Parameter"
              error={errors.results?.[index]?.parameter?.message}
              {...register(`results.${index}.parameter`, { required: true })}
            />
            <TextField
              id={`value-${index}`}
              label="Value"
              error={errors.results?.[index]?.value?.message}
              {...register(`results.${index}.value`, { required: true })}
            />
            <TextField id={`unit-${index}`} label="Unit" {...register(`results.${index}.unit`)} />
            <TextField
              id={`range-${index}`}
              label="Reference range"
              {...register(`results.${index}.referenceRange`)}
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mb-0.5 rounded-lg p-2 text-critical-500 hover:bg-critical-500/10"
                aria-label="Remove result"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ parameter: '', value: '', unit: '', referenceRange: '' })}
          className="flex w-fit items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
        >
          <Plus className="h-4 w-4" /> Add parameter
        </button>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Submit results
        </Button>
      </form>
    </Modal>
  );
}
