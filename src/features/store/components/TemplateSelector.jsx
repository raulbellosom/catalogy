/**
 * TemplateSelector Component
 *
 * Permite al usuario seleccionar un template para su tienda.
 * Muestra previews visuales estilo "mini-website" de cada template.
 */

import { motion } from "motion/react";
import { Check, Info } from "lucide-react";
import { getTemplateList } from "@/templates/registry";

/**
 * Preview visual simplificado para cada template
 * Renderiza una representación abstracta del layout
 */
/**
 * Preview visual simplificado para cada template
 */
function TemplatePreview({ type }) {
  const baseClass =
    "aspect-video bg-gray-100 dark:bg-gray-800 relative w-full h-full";
  const innerCardClass =
    "absolute inset-4 bg-white dark:bg-gray-900 shadow-sm rounded-lg flex flex-col overflow-hidden";

  if (type === "minimal") {
    return (
      <div className={baseClass}>
        <div className={innerCardClass}>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div className="p-2 space-y-2">
            <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "storefront") {
    return (
      <div className={baseClass}>
        <div className={innerCardClass}>
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-2"></div>
          <div className="p-2 space-y-2">
            <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-sm" />
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "gallery") {
    return (
      <div className={baseClass}>
        <div className={innerCardClass}>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-1"></div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "noir") {
    return (
      <div className="aspect-video bg-[#0f1113] relative w-full h-full">
        <div className="absolute inset-4 bg-[#17191b] shadow-sm rounded-lg flex flex-col overflow-hidden border border-white/10">
          <div className="h-6 w-full bg-[#1f2326] border-b border-white/10"></div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-[#22262a] rounded-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className={baseClass}></div>;
}

/**
 * @param {Object} props
 * @param {string} props.value - ID del template seleccionado
 * @param {Function} props.onChange - Handler cuando cambia la seleccion
 * @param {boolean} [props.disabled] - Si el selector esta deshabilitado
 */
export function TemplateSelector({ value, onChange, disabled = false }) {
  const templates = getTemplateList();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-(--color-fg)">
          Diseño del catálogo
        </label>
        <div className="text-xs text-(--color-fg-secondary) flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>Elige la estructura base de tu tienda</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = value === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={!disabled ? { y: -4 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              className={`
                relative group rounded-2xl border-2 text-left transition-all overflow-hidden flex flex-col h-full
                ${
                  isSelected
                    ? "border-(--color-primary) bg-(--color-card) shadow-md ring-1 ring-(--color-primary)/50"
                    : "border-(--color-border) bg-(--color-card) hover:border-(--color-border-hover) hover:shadow-sm"
                }
                ${disabled ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => !disabled && onChange(template.id)}
            >
              {/* Visual Preview */}
              <TemplatePreview type={template.id} />

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-(--color-primary) text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Info Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold mb-1">{template.name}</h3>
                <p className="text-xs text-(--color-fg-secondary) mb-3">
                  {template.description}
                </p>

                {/* Tags features */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {template.id === "minimal" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-secondary) text-(--color-fg-secondary) border border-(--color-border)">
                      Lista
                    </span>
                  )}
                  {template.id === "storefront" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-secondary) text-(--color-fg-secondary) border border-(--color-border)">
                      Banner
                    </span>
                  )}
                  {template.id === "gallery" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-secondary) text-(--color-fg-secondary) border border-(--color-border)">
                      Galería
                    </span>
                  )}
                  {template.id === "noir" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-secondary) text-(--color-fg-secondary) border border-(--color-border)">
                      Oscuro
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-secondary) text-(--color-fg-secondary) border border-(--color-border)">
                    Responsive
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
