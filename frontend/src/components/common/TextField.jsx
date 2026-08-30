import React, { forwardRef } from "react";

const TextField = forwardRef(
  ({ label, error, id, className = "", ...inputProps }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-ink-light dark:text-ink-dark"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={`rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-light shadow-sm outline-none transition-colors focus-visible:border-clinical-500 dark:bg-clinical-900 dark:text-ink-dark ${error
            ? "border-critical-500"
            : "border-clinical-200 dark:border-clinical-700"
            } ${className}`}
          {...inputProps}
        />

        {error && (
          <p className="text-sm text-critical-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;