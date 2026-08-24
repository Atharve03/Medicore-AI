import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { patientsApi } from '../../api/patients.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const GENDERS = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileEditModal({ open, onClose, profile, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  // Re-seed the form whenever a fresh profile loads or the modal reopens.
  useEffect(() => {
    if (open && profile) {
      reset({
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
        gender: profile.gender || '',
        bloodGroup: profile.bloodGroup || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
        emergencyContactName: profile.emergencyContact?.name || '',
        emergencyContactPhone: profile.emergencyContact?.phone || '',
        emergencyContactRelation: profile.emergencyContact?.relation || '',
        allergies: profile.allergies?.join(', ') || '',
      });
    }
  }, [open, profile, reset]);

  async function onSubmit(values) {
    const payload = {};
    if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
    if (values.gender) payload.gender = values.gender;
    if (values.bloodGroup) payload.bloodGroup = values.bloodGroup;
    if (values.contactNumber) payload.contactNumber = values.contactNumber;
    if (values.address) payload.address = values.address;
    if (values.emergencyContactName && values.emergencyContactPhone) {
      payload.emergencyContact = {
        name: values.emergencyContactName,
        phone: values.emergencyContactPhone,
        relation: values.emergencyContactRelation || 'Not specified',
      };
    }
    if (values.allergies) {
      payload.allergies = values.allergies
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
    }

    await patientsApi.updateMe(payload);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit your profile">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="dateOfBirth"
            label="Date of birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
          <Select id="gender" label="Gender" {...register('gender')}>
            <option value="">Select…</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select id="bloodGroup" label="Blood group" {...register('bloodGroup')}>
            <option value="">Select…</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <TextField
            id="contactNumber"
            label="Contact number"
            {...register('contactNumber')}
          />
        </div>

        <TextField id="address" label="Address" {...register('address')} />

        <TextField
          id="allergies"
          label="Allergies (comma-separated)"
          placeholder="penicillin, peanuts"
          {...register('allergies')}
        />

        <fieldset className="rounded-lg border border-clinical-100 p-3 dark:border-clinical-700">
          <legend className="px-1 text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
            Emergency contact
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="emergencyContactName"
              label="Name"
              {...register('emergencyContactName')}
            />
            <TextField
              id="emergencyContactPhone"
              label="Phone"
              {...register('emergencyContactPhone')}
            />
          </div>
          <div className="mt-3">
            <TextField
              id="emergencyContactRelation"
              label="Relation"
              {...register('emergencyContactRelation')}
            />
          </div>
        </fieldset>

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Save changes
        </Button>
      </form>
    </Modal>
  );
}
