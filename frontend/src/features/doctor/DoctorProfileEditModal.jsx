import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { doctorsApi } from '../../api/doctors.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function DoctorProfileEditModal({ open, onClose, profile, onSaved }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({ defaultValues: { availability: [] } });

  const { fields, append, remove } = useFieldArray({ control, name: 'availability' });

  useEffect(() => {
    if (open && profile) {
      reset({
        specialization: profile.specialization || '',
        department: profile.department || '',
        consultationFee: profile.consultationFee ?? '',
        qualifications: profile.qualifications?.join(', ') || '',
        availability: profile.availability?.length
          ? profile.availability
          : [{ day: 'mon', startTime: '09:00', endTime: '13:00' }],
      });
    }
  }, [open, profile, reset]);

  async function onSubmit(values) {
    const payload = {
      specialization: values.specialization || undefined,
      department: values.department || undefined,
      consultationFee: values.consultationFee ? Number(values.consultationFee) : undefined,
      qualifications: values.qualifications
        ? values.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
        : undefined,
      availability: values.availability?.length ? values.availability : undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    await doctorsApi.updateMe(payload);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit your profile">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField id="specialization" label="Specialization" {...register('specialization')} />
          <TextField id="department" label="Department" {...register('department')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="consultationFee"
            label="Consultation fee"
            type="number"
            step="0.01"
            {...register('consultationFee')}
          />
          <TextField
            id="qualifications"
            label="Qualifications (comma-separated)"
            {...register('qualifications')}
          />
        </div>

        <fieldset className="rounded-lg border border-clinical-100 p-3 dark:border-clinical-700">
          <legend className="px-1 text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
            Weekly availability
          </legend>
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                <Select id={`day-${index}`} label="Day" {...register(`availability.${index}.day`)}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <TextField
                  id={`start-${index}`}
                  label="Start"
                  type="time"
                  error={errors.availability?.[index]?.startTime?.message}
                  {...register(`availability.${index}.startTime`, { required: true })}
                />
                <TextField
                  id={`end-${index}`}
                  label="End"
                  type="time"
                  error={errors.availability?.[index]?.endTime?.message}
                  {...register(`availability.${index}.endTime`, { required: true })}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-0.5 rounded-lg p-2 text-critical-500 hover:bg-critical-500/10"
                  aria-label="Remove slot"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ day: 'mon', startTime: '09:00', endTime: '13:00' })}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
          >
            <Plus className="h-4 w-4" /> Add slot
          </button>
        </fieldset>

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Save changes
        </Button>
      </form>
    </Modal>
  );
}
