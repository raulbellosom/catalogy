import { ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { SettingsSection } from "../layout/SettingsSection";

export function GeneralDangerSection({ onDeleteClick, isDeleting = false }) {
  return (
    <SettingsSection
      id="general-danger"
      title="Eliminar tienda"
      description="Acciones destructivas para borrar todo el catálogo."
      icon={ShieldAlert}
    >
      <div className="p-4 rounded-xl border border-(--color-error)/30 bg-(--color-error)/5 flex flex-col gap-4">
        <div className="space-y-2 text-(--color-fg-secondary)">
          <p className="text-(--color-fg)">
            Esta acción elimina permanentemente tu tienda y no se puede
            deshacer.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Productos y sus imágenes del almacenamiento.</li>
            <li>Configuración, categorías y la tienda en Appwrite.</li>
            <li>Métricas y analíticas almacenadas.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-(--color-fg-muted)">
            Para continuar deberás confirmar con tu contraseña.
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={onDeleteClick}
            isLoading={isDeleting}
            className="min-w-[190px]"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar tienda
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
