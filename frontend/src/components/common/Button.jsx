const VARIANTS = {
  primary:
    'bg-clinical-600 text-white hover:bg-clinical-700 focus-visible:ring-clinical-500 disabled:bg-clinical-300',
  secondary:
    'bg-transparent text-clinical-600 border border-clinical-300 hover:bg-clinical-50 dark:text-clinical-200 dark:border-clinical-600 dark:hover:bg-clinical-800',
  ghost: 'bg-transparent text-ink-light hover:bg-surface-light/60 dark:text-ink-dark',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
