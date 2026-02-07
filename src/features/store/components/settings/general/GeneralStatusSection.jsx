import { Globe } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { SettingsSection } from "../layout/SettingsSection";

export function GeneralStatusSection({ store, onPublishClick }) {
  const isPublished = !!store?.published;

  return (
    <SettingsSection
      id="general-status"
      title="Estado de la tienda"
      description="Controla la visibilidad de tu catálogo."
      icon={Globe}
    >
      <div
        className={`flex flex-col gap-4 p-4 rounded-xl border ${
          isPublished
            ? "bg-green-500/5 border-green-500/20"
            : "bg-(--color-bg-secondary) border-(--color-border)"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isPublished
                ? "bg-green-500/10 text-green-600"
                : "bg-(--color-bg-tertiary) text-(--color-fg-muted)"
            }`}
          >
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`font-semibold text-lg block ${
                isPublished
                  ? "text-green-700 dark:text-green-400"
                  : "text-(--color-fg)"
              }`}
            >
              {isPublished ? "Tienda Pública" : "Tienda Privada"}
            </span>
            <p className="text-sm text-(--color-fg-secondary)">
              {isPublished
                ? "Cualquiera con el link puede ver tu tienda."
                : "Solo tú puedes ver tu tienda."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={isPublished ? "outline" : "primary"}
          className={`w-full ${
            isPublished
              ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10"
              : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
          }`}
          onClick={onPublishClick}
        >
          {isPublished ? "Despublicar Tienda" : "Publicar Tienda"}
        </Button>
      </div>
    </SettingsSection>
  );
}
