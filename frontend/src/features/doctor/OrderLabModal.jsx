import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { labApi } from '../../api/lab.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function OrderLabModal({ open, onClose, patientId, onCreated }) {
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
      await labApi.createOrder({ patientId, testType: values.testType });
      reset();
      onCreated();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not create this lab order.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Order a lab test">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="testType"
          label="Test type"
          placeholder="Complete Blood Count"
          error={errors.testType?.message}
          {...register('testType', { required: 'Test type is required' })}
        />

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Order test
        </Button>
      </form>
    </Modal>
  );
}
