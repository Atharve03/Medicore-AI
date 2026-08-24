export default function Card({ title, action, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-clinical-100 bg-white p-5 shadow-card dark:border-clinical-800 dark:bg-clinical-900 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
