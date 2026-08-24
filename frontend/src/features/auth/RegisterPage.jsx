import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { ROLE_HOME } from '../../routes/roleNav.js';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';

export default function RegisterPage() {
  const registerUser = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    try {
      const user = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      navigate(ROLE_HOME[user.role] || '/', { replace: true });
    } catch {
      // error state already surfaced via the store
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-clinical-600 dark:text-clinical-300">
          <Activity className="h-6 w-6" />
          <span className="font-display text-lg font-semibold">MediCore AI</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Create your patient account
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Doctor and staff accounts are provisioned by hospital admins.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <TextField
            id="fullName"
            label="Full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required', minLength: 2 })}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Use at least 8 characters' },
            })}
          />
          <TextField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />

          {error && (
            <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
              {error}
            </p>
          )}

          <Button type="submit" loading={status === 'loading'} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-clinical-600 dark:text-clinical-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
