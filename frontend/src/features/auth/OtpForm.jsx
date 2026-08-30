import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function OtpForm({ email, purpose, onVerified, onBack }) {
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const [resent, setResent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    try {
      const user = await verifyOtp({ email, code: values.code, purpose });
      onVerified(user);
    } catch {
      // error already surfaced via the store
    }
  }

  async function handleResend() {
    setResent(false);
    try {
      await resendOtp();
      setResent(true);
    } catch {
      // error already surfaced via the store
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-clinical-50 px-3 py-2.5 text-sm text-clinical-700 dark:bg-clinical-800 dark:text-clinical-200">
        <MailCheck className="h-4 w-4 shrink-0" />
        <span>
          We emailed a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="code"
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          error={errors.code?.message}
          {...register('code', {
            required: 'Enter the code',
            pattern: { value: /^\d{6}$/, message: 'Enter all 6 digits' },
          })}
        />

        {error && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {error}
          </p>
        )}
        {resent && !error && (
          <p className="text-sm text-vital-500">A new code has been sent.</p>
        )}

        <Button type="submit" loading={status === 'loading'} className="w-full">
          Verify
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-light/60 hover:text-clinical-600 dark:text-ink-dark/60"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="font-medium text-clinical-600 dark:text-clinical-300"
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
