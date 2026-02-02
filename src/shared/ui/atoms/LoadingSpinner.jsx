import { Loader2 } from "lucide-react";

/**
 * @typedef {'sm' | 'md' | 'lg'} SpinnerSize
 */

const SIZE_CLASSES = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

/**
 * Loading spinner component
 * @param {{ size?: SpinnerSize, className?: string }} props
 */
export function LoadingSpinner({ size = "md", className = "" }) {
  return (
    <Loader2
      className={`animate-spin text-[var(--color-primary)] ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
