import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { authApi } from '../../api/auth.api.js';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import PasswordRequirements, { STRONG_PASSWORD_PATTERN } from './PasswordRequirements.jsx';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function run(action) {
    setLoading(true);
    setError('');
    try { await action(); } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  function submitEmail(values) {
    run(async () => {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setCooldown(60);
      setStep('otp');
      reset();
    });
  }

  function submitOtp(values) {
    run(async () => {
      const { data } = await authApi.verifyForgotPasswordOtp(email, values.otp);
      setResetToken(data.data.resetToken);
      setStep('password');
      reset();
    });
  }

  function submitPassword(values) {
    run(async () => {
      await authApi.resetPassword({
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setResetToken('');
      setStep('success');
      reset();
    });
  }

  function resend() {
    if (cooldown) return;
    run(async () => {
      await authApi.forgotPassword(email);
      setCooldown(60);
    });
  }

  const password = watch('newPassword') || '';

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-clinical-600 dark:text-clinical-300">
          <Activity className="h-6 w-6" />
          <span className="font-display text-lg font-semibold">MediCore AI</span>
        </div>

        {step === 'success' ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-vital-500" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">Password reset successfully</h2>
            <p className="mt-2 text-sm text-ink-light/60 dark:text-ink-dark/60">Sign in normally with your new password.</p>
            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
              {step === 'email' && 'Forgot password'}
              {step === 'otp' && 'Verify reset code'}
              {step === 'password' && 'Create new password'}
            </h2>
            <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
              {step === 'email' && 'Enter your account email to request a secure reset code.'}
              {step === 'otp' && `Enter the 6-digit code sent to ${email}.`}
              {step === 'password' && 'Choose a strong password you have not used for this account.'}
            </p>

            <form
              className="mt-8 flex flex-col gap-4"
              onSubmit={handleSubmit(step === 'email' ? submitEmail : step === 'otp' ? submitOtp : submitPassword)}
            >
              {step === 'email' && (
                <TextField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message}
                  {...register('email', { required: 'Email is required' })} />
              )}
              {step === 'otp' && (
                <>
                  <TextField id="otp" label="Reset code" inputMode="numeric" maxLength={6} error={errors.otp?.message}
                    {...register('otp', { required: 'Enter the code', pattern: { value: /^\d{6}$/, message: 'Enter all 6 digits' } })} />
                  <button type="button" disabled={cooldown > 0} onClick={resend}
                    className="text-right text-sm font-medium text-clinical-600 disabled:opacity-50 dark:text-clinical-300">
                    {cooldown ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </>
              )}
              {step === 'password' && (
                <>
                  <TextField id="newPassword" label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message}
                    {...register('newPassword', { required: 'Password is required', pattern: { value: STRONG_PASSWORD_PATTERN, message: 'Password does not meet all requirements' } })} />
                  <PasswordRequirements password={password} />
                  <TextField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message}
                    {...register('confirmPassword', { required: 'Confirm your password', validate: (value) => value === password || 'Passwords do not match' })} />
                </>
              )}
              {error && <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                {step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Reset password'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm"><Link to="/login" className="text-clinical-600 dark:text-clinical-300">← Back to login</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
