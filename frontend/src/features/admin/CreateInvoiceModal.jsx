import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { billingApi } from '../../api/billing.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const RELATED_TYPES = ['appointment', 'admission', 'pharmacyOrder', 'lab'];

export default function CreateInvoiceModal({ open, onClose, patientId, onCreated }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      relatedType: 'appointment',
      refId: '',
      lineItems: [{ description: '', amount: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await billingApi.createInvoice({
        patientId,
        relatedTo: { type: values.relatedType, refId: values.refId },
        lineItems: values.lineItems.map((li) => ({
          description: li.description,
          amount: Number(li.amount),
        })),
      });
      reset();
      onCreated();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not create this invoice.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create invoice">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Select id="relatedType" label="Related to" {...register('relatedType', { required: true })}>
            {RELATED_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <TextField
            id="refId"
            label="Reference ID"
            error={errors.refId?.message}
            {...register('refId', { required: 'Reference id is required' })}
          />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <div className="flex-1">
              <TextField
                id={`desc-${index}`}
                label="Description"
                {...register(`lineItems.${index}.description`, { required: true })}
              />
            </div>
            <div className="w-28">
              <TextField
                id={`amount-${index}`}
                label="Amount"
                type="number"
                step="0.01"
                {...register(`lineItems.${index}.amount`, { required: true, min: 0 })}
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mb-0.5 rounded-lg p-2 text-critical-500 hover:bg-critical-500/10"
                aria-label="Remove line item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ description: '', amount: '' })}
          className="flex w-fit items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
        >
          <Plus className="h-4 w-4" /> Add line item
        </button>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Create invoice
        </Button>
      </form>
    </Modal>
  );
}
