export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-clinical-200 bg-white py-16 text-center dark:border-clinical-700 dark:bg-clinical-900">
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clinical-50 text-clinical-500 dark:bg-clinical-800 dark:text-clinical-300">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-light/60 dark:text-ink-dark/60">
          {description}
        </p>
      )}
    </div>
  );
}
