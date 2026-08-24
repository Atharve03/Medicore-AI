import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { medicalRecordsApi } from '../../api/medicalRecords.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function AddRecordModal({ open, onClose, patientId, onCreated }) {
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
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('diagnosis', values.diagnosis);
      if (values.notes) formData.append('notes', values.notes);
      if (values.symptoms) {
        values.symptoms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => formData.append('symptoms', s));
      }

      await medicalRecordsApi.create(formData);
      reset();
      onCreated();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not save this record.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add medical record">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="diagnosis"
          label="Diagnosis"
          error={errors.diagnosis?.message}
          {...register('diagnosis', { required: 'Diagnosis is required' })}
        />
        <TextField
          id="symptoms"
          label="Symptoms (comma-separated)"
          placeholder="fever, headache"
          {...register('symptoms')}
        />
        <TextField id="notes" label="Notes (optional)" {...register('notes')} />

        <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
          File attachments (scans, reports) aren&apos;t supported from this form yet — the
          API supports them, but the upload UI is a follow-up.
        </p>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Save record
        </Button>
      </form>
    </Modal>
  );
}
