import { useState, useEffect } from "react";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import { appConfig } from "@/shared/lib/env";
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
  initialValue = "",
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

  // Only show success if it's different from initial value and valid
  const hasChanged = value !== initialValue;
  const showSuccess =
    hasChanged &&
    !slugError &&
    isAvailable &&
    debouncedSlug === value &&
    value.length >= 3;

  const showError =
    !slugError && isAvailable === false && debouncedSlug === value;

  return (
    <div className="relative">
      <Input
        type="text"
        label={
          <div className="flex justify-between items-center w-full">
            <span>Editar link de la tienda</span>
            <div className="flex items-center gap-2 font-normal">
              <span className="text-xs text-(--color-fg-secondary)">
                {value.length}/50
              </span>
              <div className="relative w-4 h-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-(--color-border)"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={37.7}
                    strokeDashoffset={
                      37.7 - (37.7 * Math.min(value.length, 50)) / 50
                    }
                    className={`transition-all duration-300 ${
                      value.length >= 50
                        ? "text-red-500"
                        : "text-(--color-primary)"
                    }`}
                  />
                </svg>
              </div>
            </div>
          </div>
        }
        placeholder="mi-tienda"
        value={value}
        onChange={(e) => {
          const sanitized = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");

          e.target.value = sanitized;
          onChange(e);
        }}
        required={required}
        pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
        minLength={3}
        maxLength={50}
      />

      {/* Status indicator */}
      <div className="absolute right-4 top-[38px]">
        {isChecking && (
          <Loader2 className="w-5 h-5 text-(--color-fg-muted) animate-spin" />
        )}
        {showSuccess && (
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        )}
        {showError && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
      </div>

      {/* Validation messages */}
      <div className="mt-2 space-y-1">
        {slugError && (
          <p className="text-sm text-(--color-error)">{slugError}</p>
        )}
        {showError && (
          <p className="text-sm text-(--color-error)">
            Esta dirección ya está en uso
          </p>
        )}
        {showSuccess && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ¡Dirección disponible!
          </p>
        )}
      </div>
    </div>
  );
}
