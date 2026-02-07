/**
 * SettingsSection
 * Bloque visual reutilizable para secciones de configuración.
 */
export function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-(--color-primary)/10 text-(--color-primary)">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-(--color-fg)">{title}</h3>
              {description && (
                <p className="text-sm text-(--color-fg-secondary) mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}
