import { Droplets, Type } from "lucide-react";
import { SettingsSection } from "../layout/SettingsSection";

export function AppearanceStyleSection({
  useTemplateStyles,
  onToggleUseTemplateStyles,
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
  colorPresets,
  fonts,
  selectedFont,
  onFontChange,
}) {
  return (
    <SettingsSection
      id="appearance-style"
      title="Estilo"
      description="Personaliza los colores y la tipografía de tu tienda."
      icon={Droplets}
    >
      <div className="p-4 bg-(--color-primary)/5 border border-(--color-primary)/20 rounded-xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-(--color-fg)">
            Usar estilos predeterminados del tema
          </p>
          <p className="text-xs text-(--color-fg-secondary)">
            Aplica automáticamente la fuente y colores recomendados para el tema
            seleccionado.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useTemplateStyles}
            onChange={(event) => onToggleUseTemplateStyles(event.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-(--color-primary)"></div>
        </label>
      </div>

      <div
        className={`space-y-6 transition-all duration-300 ${
          useTemplateStyles ? "opacity-40 grayscale pointer-events-none" : ""
        }`}
      >
        {/* Colors Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Droplets className="w-4 h-4 text-(--color-primary)" />
            Colores
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => onPrimaryChange(event.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-(--color-fg-secondary) block">
                  Color Primario
                </label>
                <span className="text-sm font-mono uppercase text-(--color-fg)">
                  {primaryColor}
                </span>
              </div>
            </div>

            <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(event) => onSecondaryChange(event.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-(--color-fg-secondary) block">
                  Color de Fondo
                </label>
                <span className="text-sm font-mono uppercase text-(--color-fg)">
                  {secondaryColor}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-(--color-fg-muted) block mb-2 font-medium">
              Presets sugeridos
            </span>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onPrimaryChange(preset.primary);
                    onSecondaryChange(preset.secondary);
                  }}
                  className="w-10 h-10 rounded-full border border-(--color-border) overflow-hidden relative group hover:scale-110 transition-transform"
                  title={preset.name}
                >
                  <div className="absolute inset-0 flex">
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-(--color-border)" />

        {/* Fonts Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Type className="w-4 h-4 text-(--color-primary)" />
            Tipografía
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fonts.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => onFontChange(font.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedFont === font.id
                    ? "border-(--color-primary) bg-(--color-primary)/5 ring-1 ring-(--color-primary)"
                    : "border-(--color-border) hover:border-(--color-border-hover) bg-(--color-bg)"
                }`}
              >
                <div
                  className={`text-xl font-medium mb-1 ${font.class || ""}`}
                  style={font.style}
                >
                  Agc
                </div>
                <div className="text-xs text-(--color-fg-secondary)">
                  {font.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
