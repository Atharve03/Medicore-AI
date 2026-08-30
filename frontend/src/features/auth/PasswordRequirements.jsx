const checks = [
  ['At least 8 characters', (value) => value.length >= 8],
  ['Uppercase letter', (value) => /[A-Z]/.test(value)],
  ['Lowercase letter', (value) => /[a-z]/.test(value)],
  ['Number', (value) => /[0-9]/.test(value)],
  ['Special character', (value) => /[^A-Za-z0-9]/.test(value)],
];

export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

export default function PasswordRequirements({ password = '' }) {
  return (
    <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
      {checks.map(([label, test]) => {
        const met = test(password);
        return (
          <li key={label} className={met ? 'text-vital-500' : 'text-ink-light/50 dark:text-ink-dark/50'}>
            {met ? '✓' : '○'} {label}
          </li>
        );
      })}
    </ul>
  );
}
