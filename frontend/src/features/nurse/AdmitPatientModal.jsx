import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { doctorsApi } from '../../api/doctors.api.js';
import { admissionsApi } from '../../api/admissions.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Modal from '../../components/common/Modal.jsx';
import Select from '../../components/common/Select.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function AdmitPatientModal({ open, onClose, patientId, onAdmitted }) {
  const [serverError, setServerError] = useState(null);

  const fetchDoctors = useCallback(() => doctorsApi.list({ limit: 100 }), []);
  const { data: doctorList } = useFetch(fetchDoctors, []);
  const doctors = doctorList?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  useEffect(() => {
    if (open) {
      reset({ doctorId: '', wardType: '', bedNumber: '', expectedDischargeAt: '' });
      setServerError(null);
    }
  }, [open, reset]);

  async function onSubmit(values) {
    setServerError(null);
    try {
      await admissionsApi.create({
        patientId,
        doctorId: values.doctorId,
        wardType: values.wardType,
        bedNumber: values.bedNumber,
        expectedDischargeAt: values.expectedDischargeAt
          ? new Date(values.expectedDischargeAt).toISOString()
          : undefined,
      });
      onAdmitted();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not admit this patient.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Admit patient">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          id="doctorId"
          label="Attending doctor"
          error={errors.doctorId?.message}
          {...register('doctorId', { required: 'Choose the attending doctor' })}
        >
          <option value="">Select a doctor…</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
              {d.specialization ? ` — ${d.specialization}` : ''}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="wardType"
            label="Ward"
            placeholder="General Ward"
            error={errors.wardType?.message}
            {...register('wardType', { required: 'Ward is required' })}
          />
          <TextField
            id="bedNumber"
            label="Bed number"
            error={errors.bedNumber?.message}
            {...register('bedNumber', { required: 'Bed number is required' })}
          />
        </div>

        <TextField
          id="expectedDischargeAt"
          label="Expected discharge (optional)"
          type="date"
          {...register('expectedDischargeAt')}
        />

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Admit patient
        </Button>
      </form>
    </Modal>
  );
}
