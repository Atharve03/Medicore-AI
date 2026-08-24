import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { adminApi } from '../../api/admin.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const ROLES = [
  'admin',
  'doctor',
  'patient',
  'receptionist',
  'nurse',
  'pharmacist',
  'labTechnician',
];

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({ defaultValues: { role: 'doctor' } });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await adminApi.createUser(values);
      reset();
      onCreated();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not create this account.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create account">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="fullName"
          label="Full name"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <TextField
          id="password"
          label="Temporary password"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Use at least 8 characters' },
          })}
        />
        <Select id="role" label="Role" {...register('role', { required: true })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </Modal>
  );
}
