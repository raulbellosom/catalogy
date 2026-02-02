import { forwardRef } from "react";

/**
 * @typedef {'primary' | 'secondary' | 'ghost' | 'danger'} ButtonVariant
 * @typedef {'sm' | 'md' | 'lg'} ButtonSize
 */

const VARIANT_CLASSES = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98]",
  secondary:
    "bg-[var(--color-bg-tertiary)] text-[var(--color-fg)] hover:bg-[var(--color-border)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]",
  danger:
    "bg-[var(--color-error)] text-white hover:opacity-90 active:scale-[0.98]",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2 text-base min-h-[44px]",
  lg: "px-6 py-3 text-lg min-h-[52px]",
};

/**
 * Button component
 * @param {{
 *   variant?: ButtonVariant,
 *   size?: ButtonSize,
 *   isLoading?: boolean,
 *   disabled?: boolean,
 *   className?: string,
 *   children: React.ReactNode,
 *   [key: string]: any
 * }} props
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-xl
        transition-all duration-200
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
});
