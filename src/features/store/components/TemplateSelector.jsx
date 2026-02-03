/**
 * TemplateSelector Component
 *
 * Permite al usuario seleccionar un template para su tienda.
 * Muestra previews visuales estilo "mini-website" de cada template.
 */

import { motion } from "motion/react";
import { Check, Info } from "lucide-react";
import { getTemplateList } from "../../templates/registry";

/**
 * Preview visual simplificado para cada template
 * Renderiza una representación abstracta del layout
 */
function TemplatePreview({ type, isSelected }) {
  const baseClass = `w-full h-32 rounded-t-lg border-b relative overflow-hidden transition-colors ${
    isSelected
      ? "bg-[var(--primary)]/5 border-[var(--primary)]/20"
      : "bg-[var(--muted)]/30 border-[var(--border)]"
  }`;

  if (type === "minimal") {
    return (
      <div className={baseClass}>
        {/* Header simple */}
        <div className="h-4 w-full border-b border-dashed border-gray-300 dark:border-gray-700 flex items-center px-2 gap-1">
          <div className="w-8 h-1.5 rounded-full bg-[var(--foreground)]/20"></div>
        </div>
        {/* List */}
        <div className="p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 rounded bg-[var(--foreground)]/10 shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="w-16 h-1.5 rounded-full bg-[var(--foreground)]/20"></div>
                <div className="w-8 h-1.5 rounded-full bg-[var(--foreground)]/10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "storefront") {
    return (
      <div className={baseClass}>
        {/* Banner Header */}
        <div className="h-12 w-full bg-[var(--foreground)]/10 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-1.5 rounded-full bg-[var(--foreground)]/40"></div>
          <div className="w-20 h-1 rounded-full bg-[var(--foreground)]/20"></div>
        </div>
        {/* Grid */}
        <div className="p-2 grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="aspect-square rounded bg-[var(--foreground)]/10"></div>
              <div className="w-full h-1 rounded bg-[var(--foreground)]/20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "gallery") {
    return (
      <div className={baseClass}>
        {/* Big Hero */}
        <div className="h-full w-full p-2 grid grid-cols-1 gap-2">
          <div className="flex-1 rounded bg-[var(--foreground)]/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--foreground)]/10"></div>
          </div>
          <div className="h-8 grid grid-cols-3 gap-1">
            <div className="rounded bg-[var(--foreground)]/10"></div>
            <div className="rounded bg-[var(--foreground)]/10"></div>
            <div className="rounded bg-[var(--foreground)]/10"></div>
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
        <label className="text-sm font-medium text-[var(--foreground)]">
          Diseño del catálogo
        </label>
        <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>Elige la estructura base de tu tienda</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = value === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={!disabled ? { y: -4 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              className={`
                relative group rounded-xl border-2 text-left transition-all overflow-hidden flex flex-col h-full
                ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--card)] shadow-md shadow-[var(--primary)]/10 ring-1 ring-[var(--primary)]/50"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-sm"
                }
                ${disabled ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => !disabled && onChange(template.id)}
            >
              {/* Visual Preview */}
              <TemplatePreview type={template.id} isSelected={isSelected} />

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Info Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-bold ${isSelected ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}
                  >
                    {template.name}
                  </h3>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] mb-3 flex-1">
                  {template.description}
                </p>

                {/* Tags features */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {template.id === "minimal" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      Lista
                    </span>
                  )}
                  {template.id === "storefront" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      Banner
                    </span>
                  )}
                  {template.id === "gallery" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      Imágenes
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
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
