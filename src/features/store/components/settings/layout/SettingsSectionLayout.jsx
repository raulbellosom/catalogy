import { SettingsSectionNav } from "./SettingsSectionNav";

/**
 * Layout con sidebar fijo en desktop y contenido scrollable normal.
 * En móvil el sidebar se oculta y solo se muestra el contenido.
 */
export function SettingsSectionLayout({
  sections,
  activeSection,
  onSectionSelect,
  containerRef,
  sidebarTitle,
  sidebarSubtitle,
  sidebarFooter,
  children,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:gap-6">
      {/* Sidebar - Solo visible en desktop */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:self-start">
        <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-(--color-fg)">
              {sidebarTitle}
            </h2>
            {sidebarSubtitle && (
              <p className="text-xs text-(--color-fg-secondary) mt-1">
                {sidebarSubtitle}
              </p>
            )}
          </div>
          <SettingsSectionNav
            sections={sections}
            activeSection={activeSection}
            onSelect={onSectionSelect}
          />
        </div>
      </aside>

      {/* Footer para botones fijos (desktop y mobile) u otros elementos */}
      {sidebarFooter}

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
