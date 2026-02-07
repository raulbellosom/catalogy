/**
 * Navigation for settings sections - solo visible en desktop.
 */
export function SettingsSectionNav({ sections, activeSection, onSelect }) {
  return (
    <nav className="flex flex-col gap-1">
      {sections.map(({ id, label, icon: Icon, hint }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={isActive ? "true" : undefined}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              isActive
                ? "bg-(--color-primary)/10 text-(--color-primary)"
                : "text-(--color-fg-secondary) hover:text-(--color-fg) hover:bg-(--color-bg-secondary)"
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 ${isActive ? "text-(--color-primary)" : "text-(--color-fg-muted)"}`}
              />
            )}
            <span className="text-sm font-medium">{label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-(--color-primary)" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
