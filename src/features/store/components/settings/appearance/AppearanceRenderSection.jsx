import { SettingsSection } from "../layout/SettingsSection";
import { Globe } from "lucide-react";

export function AppearanceRenderSection({
  activeRenderer,
  onRendererChange,
  rendererLabel,
}) {
  return (
    <SettingsSection
      id="appearance-render"
      title="Render público"
      description="Decide qué se muestra en tu catálogo público. Cambiar esta opción no borra ni sobrescribe datos."
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
              Usa el template seleccionado para la vista pública.
            </p>
          </div>
        </label>

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
              Mostrar página del editor
            </p>
            <p className="text-xs text-(--color-fg-secondary) mt-1">
              Publica el layout creado en el editor Puck.
            </p>
          </div>
        </label>
      </div>

      <div className="text-xs text-(--color-fg-secondary)">
        Actualmente visible:{" "}
        <span className="font-semibold text-(--color-fg)">
          {rendererLabel}
        </span>
      </div>
    </SettingsSection>
  );
}
