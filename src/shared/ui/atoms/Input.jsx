import { forwardRef } from "react";

/**
 * Input component
 * @param {{
 *   label?: string,
 *   error?: string,
 *   hint?: string,
 *   className?: string,
 *   [key: string]: any
 * }} props
 */
export const Input = forwardRef(function Input(
  { label, error, hint, className = "", ...props },
  ref,
) {
  const id = props.id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-3
          bg-[var(--color-bg-secondary)]
          border border-[var(--color-border)]
          rounded-xl
          text-[var(--color-fg)]
          placeholder:text-[var(--color-fg-muted)]
          transition-colors duration-200
          focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary)]/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">{hint}</p>
      )}
    </div>
  );
});
