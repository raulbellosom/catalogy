import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/atoms/Input";
import { useSlugAvailability } from "@/shared/hooks";
import { validateSlug } from "@/shared/services/storeService";

/**
 * Slug input with real-time validation
 * @param {Object} props
 * @param {string} props.value - Current slug value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.excludeStoreId] - Store ID to exclude from availability check
 * @param {boolean} [props.required] - Whether field is required
 */
export function SlugInput({
  value,
  onChange,
  excludeStoreId = null,
  required = true,
}) {
  const [slugError, setSlugError] = useState("");
  const [debouncedSlug, setDebouncedSlug] = useState(value);

  // Debounce slug for availability check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Check slug availability
  const {
    data: isAvailable,
    isLoading: checkingAvailability,
    isFetching,
  } = useSlugAvailability(debouncedSlug, excludeStoreId);

  // Validate slug format on change
  useEffect(() => {
    if (!value) {
      setSlugError("");
      return;
    }

    const validation = validateSlug(value);
    if (!validation.valid) {
      setSlugError(validation.error);
    } else {
      setSlugError("");
    }
  }, [value]);

  const isChecking =
    (checkingAvailability || isFetching) && debouncedSlug === value;
  const showSuccess =
    !slugError && isAvailable && debouncedSlug === value && value.length >= 3;
  const showError =
    !slugError && isAvailable === false && debouncedSlug === value;

  return (
    <div className="relative">
      <Input
        type="text"
        label="Slug (URL de tu catálogo)"
        placeholder="mi-tienda"
        value={value}
        onChange={onChange}
        required={required}
        pattern="[a-z0-9-]+"
        minLength={3}
        maxLength={50}
      />

      {/* Status indicator */}
      <div className="absolute right-4 top-[38px]">
        {isChecking && (
          <Loader2 className="w-5 h-5 text-[var(--color-fg-muted)] animate-spin" />
        )}
        {showSuccess && (
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        )}
        {showError && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
      </div>

      {/* Validation messages */}
      <div className="mt-2 space-y-1">
        {slugError && (
          <p className="text-sm text-[var(--color-error)]">{slugError}</p>
        )}
        {showError && (
          <p className="text-sm text-[var(--color-error)]">
            Este slug ya está en uso
          </p>
        )}
        {showSuccess && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ¡Slug disponible!
          </p>
        )}
        {!slugError && value && (
          <p className="text-xs text-[var(--color-fg-secondary)]">
            Tu catálogo estará en:{" "}
            <strong>{value}.catalog.racoondevs.com</strong>
          </p>
        )}
      </div>
    </div>
  );
}
