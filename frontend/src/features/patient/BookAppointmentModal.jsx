import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { doctorsApi } from '../../api/doctors.api.js';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Modal from '../../components/common/Modal.jsx';
import Select from '../../components/common/Select.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

const DAY_LABELS = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export default function BookAppointmentModal({ open, onClose, onBooked }) {
  const [serverError, setServerError] = useState(null);

  const fetchDoctors = useCallback(() => doctorsApi.list({ limit: 100 }), []);
  const { data: doctorList, refetch: refetchDoctors } = useFetch(fetchDoctors, []);
  const doctors = doctorList?.items || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  useEffect(() => {
    if (open) {
      refetchDoctors();
      reset({ doctorId: '', scheduledAt: '', reasonForVisit: '' });
      setServerError(null);
    }
  }, [open, reset, refetchDoctors]);

  const selectedDoctorId = watch('doctorId');
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  async function onSubmit(values) {
    setServerError(null);
    try {
      await appointmentsApi.create({
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
    <Modal open={open} onClose={onClose} title="Book an appointment">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        {selectedDoctor && (
          <p className="rounded-lg bg-clinical-50 px-3 py-2 text-xs text-clinical-700 dark:bg-clinical-800 dark:text-clinical-200">
            {selectedDoctor.availability?.length
              ? `Available: ${selectedDoctor.availability
                  .map((s) => `${DAY_LABELS[s.day]} ${s.startTime}–${s.endTime}`)
                  .join(', ')}`
              : "This doctor hasn't published their availability yet."}
          </p>
        )}

        <TextField
          id="scheduledAt"
          label="Date & time"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register('scheduledAt', {
            required: 'Pick a date and time',
            validate: (value) =>
              matchesAvailability(value, selectedDoctor) ||
              availabilityMessage(selectedDoctor),
          })}
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
          Request appointment
        </Button>
      </form>
    </Modal>
  );
}

function matchesAvailability(value, doctor) {
  if (!value || !doctor?.availability?.length) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return doctor.availability.some(
    (slot) => slot.day === day && time >= slot.startTime && time < slot.endTime
  );
}

function availabilityMessage(doctor) {
  if (!doctor?.availability?.length) return 'This doctor has not published availability.';
  return `Choose one of: ${doctor.availability
    .map((slot) => `${DAY_LABELS[slot.day]} ${slot.startTime}–${slot.endTime}`)
    .join(', ')}`;
}
