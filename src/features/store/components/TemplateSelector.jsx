/**
 * TemplateSelector Component
 *
 * Permite al usuario seleccionar un template para su tienda.
 * Muestra previews de cada template disponible.
 */

import { motion } from "motion/react";
import { Check, Layout, Store, Image } from "lucide-react";
import { getTemplateList } from "../../templates/registry";

/**
 * Iconos para cada template
 */
const TEMPLATE_ICONS = {
  minimal: Layout,
  storefront: Store,
  gallery: Image,
};

/**
 * @param {Object} props
 * @param {string} props.value - ID del template seleccionado
 * @param {Function} props.onChange - Handler cuando cambia la seleccion
 * @param {boolean} [props.disabled] - Si el selector esta deshabilitado
 */
export function TemplateSelector({ value, onChange, disabled = false }) {
  const templates = getTemplateList();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Template del catalogo
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = value === template.id;
          const Icon = TEMPLATE_ICONS[template.id] || Layout;

          return (
            <motion.button
              key={template.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(template.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              whileHover={!disabled ? { scale: 1.02 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-3
                ${
                  isSelected
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }
              `}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Info */}
              <h3 className="font-medium text-[var(--foreground)]">
                {template.name}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                {template.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Cambiar el template reiniciara las personalizaciones del editor visual
      </p>
    </div>
  );
}
