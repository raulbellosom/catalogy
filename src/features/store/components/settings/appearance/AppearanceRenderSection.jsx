import { Globe } from "lucide-react";
import { SettingsSection } from "../layout/SettingsSection";

export function AppearanceRenderSection({
  activeRenderer,
  onRendererChange,
  rendererLabel,
  puckEnabled = true,
}) {
  return (
    <SettingsSection
      id="appearance-render"
      title="Render publico"
      description="Decide que se muestra en tu catalogo publico. Cambiar esta opcion no borra ni sobrescribe datos."
      icon={Globe}
    >
      <div className="grid gap-3">
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
            activeRenderer === "template"
              ? "border-(--color-primary) bg-(--color-primary)/5"
              : "border-(--color-border) hover:border-(--color-border-hover)"
          }`}
        >
          <input
            type="radio"
            name="activeRenderer"
            value="template"
            checked={activeRenderer === "template"}
            onChange={() => onRendererChange("template")}
            className="mt-1"
          />
          <div>
            <p className="font-semibold text-(--color-fg)">Mostrar template</p>
            <p className="text-xs text-(--color-fg-secondary) mt-1">
              Usa el template seleccionado para la vista publica.
            </p>
          </div>
        </label>

        {puckEnabled && (
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              activeRenderer === "puck"
                ? "border-(--color-primary) bg-(--color-primary)/5"
                : "border-(--color-border) hover:border-(--color-border-hover)"
            }`}
          >
            <input
              type="radio"
              name="activeRenderer"
              value="puck"
              checked={activeRenderer === "puck"}
              onChange={() => onRendererChange("puck")}
              className="mt-1"
            />
            <div>
              <p className="font-semibold text-(--color-fg)">
                Mostrar pagina del editor
              </p>
              <p className="text-xs text-(--color-fg-secondary) mt-1">
                Publica el layout creado en el editor Puck.
              </p>
            </div>
          </label>
        )}
      </div>

      <div className="text-xs text-(--color-fg-secondary)">
        Actualmente visible:{" "}
        <span className="font-semibold text-(--color-fg)">{rendererLabel}</span>
      </div>
    </SettingsSection>
  );
}
