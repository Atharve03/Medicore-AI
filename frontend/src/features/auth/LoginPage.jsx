import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { ROLE_HOME } from '../../routes/roleNav.js';
import PulseLine from '../../components/common/PulseLine.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import OtpForm from './OtpForm.jsx';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const cancelOtp = useAuthStore((s) => s.cancelOtp);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const pendingOtp = useAuthStore((s) => s.pendingOtp);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    try {
      await login({ email: values.email, password: values.password });
    } catch {
      // error state already surfaced via the store
    }
  }

  function handleVerified(user) {
    const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.role] || '/';
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel — the signature moment: a continuous vitals waveform,
          the same visual language every status badge in the app echoes. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-clinical-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <Activity className="h-7 w-7" />
          <span className="font-display text-xl font-semibold">
            MediCore <span className="text-pulse-300">AI</span>
          </span>
        </div>

        <div>
          <p className="font-display text-3xl font-semibold leading-tight">
            Every patient journey,
            <br />
            tracked precisely.
          </p>
          <p className="mt-4 max-w-sm text-sm text-clinical-100">
            Appointments, records, prescriptions, and labs — one status
            language across the whole hospital, powered by hybrid AI that
            never sees more data than it needs to.
          </p>
        </div>

        <PulseLine className="h-16 text-pulse-300" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-clinical-600 dark:text-clinical-300">
              <Activity className="h-6 w-6" />
              <span className="font-display text-lg font-semibold">MediCore AI</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
            {pendingOtp ? 'Enter the code we emailed you.' : 'Enter your credentials to reach your dashboard.'}
          </p>

          <div className="mt-8">
            {pendingOtp ? (
              <OtpForm
                email={pendingOtp.email}
                purpose={pendingOtp.purpose}
                onVerified={handleVerified}
                onBack={cancelOtp}
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                />

                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm font-medium text-clinical-600 dark:text-clinical-300">
                    Forgot password?
                  </Link>
                </div>
                {error && (
                  <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={status === 'loading'} className="mt-2 w-full">
                  Login
                </Button>
              </form>
            )}
          </div>

          {!pendingOtp && (
            <p className="mt-6 text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
              New patient?{' '}
              <Link to="/register" className="font-medium text-clinical-600 dark:text-clinical-300">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
