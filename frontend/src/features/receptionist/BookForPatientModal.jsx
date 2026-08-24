import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { doctorsApi } from '../../api/doctors.api.js';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Modal from '../../components/common/Modal.jsx';
import Select from '../../components/common/Select.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';
import PatientSearch from '../../components/common/PatientSearch.jsx';

export default function BookForPatientModal({ open, onClose, onBooked }) {
  const [patient, setPatient] = useState(null);
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
      reset({ doctorId: '', scheduledAt: '', reasonForVisit: '' });
      setPatient(null);
      setServerError(null);
    }
  }, [open, reset]);

  async function onSubmit(values) {
    if (!patient) {
      setServerError('Select a patient first.');
      return;
    }
    setServerError(null);
    try {
      await appointmentsApi.create({
        patientId: patient.id,
        doctorId: values.doctorId,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        reasonForVisit: values.reasonForVisit,
      });
      onBooked();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not book this appointment.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Book for a patient">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />

        <Select
          id="doctorId"
          label="Doctor"
          error={errors.doctorId?.message}
          {...register('doctorId', { required: 'Choose a doctor' })}
        >
          <option value="">Select a doctor…</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
              {d.specialization ? ` — ${d.specialization}` : ''}
            </option>
          ))}
        </Select>

        <TextField
          id="scheduledAt"
          label="Date & time"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register('scheduledAt', { required: 'Pick a date and time' })}
        />

        <TextField
          id="reasonForVisit"
          label="Reason for visit (optional)"
          {...register('reasonForVisit')}
        />

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Book appointment
        </Button>
      </form>
    </Modal>
  );
}
