/**
 * Toggle row for catalog settings.
 */
export function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-4 p-4 rounded-2xl border border-(--color-border) bg-(--color-bg) hover:border-(--color-border-hover) transition-colors cursor-pointer"
    >
      {Icon && (
        <div className="p-2 rounded-xl bg-(--color-bg-secondary) text-(--color-primary)">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold text-(--color-fg)">{label}</p>
        {description && (
          <p className="text-xs text-(--color-fg-secondary) mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="pt-1">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-(--color-primary) relative"></div>
      </div>
    </label>
  );
}
