import { Save } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";

export function StickySaveButton({ isSubmitting, hasChanges }) {
  return (
    <>
      {/* Desktop - Fijo en esquina inferior derecha, sobre el footer (h-12) */}
      <div className="hidden lg:block fixed bottom-14 right-6 z-50">
        <Button
          type="submit"
          size="lg"
          className="shadow-xl shadow-(--color-primary)/25"
          isLoading={isSubmitting}
          disabled={!hasChanges}
        >
          <Save className="w-5 h-5 mr-2" /> Guardar Cambios
        </Button>
      </div>

      {/* Mobile - Botón flotante sobre el bottom nav */}
      <div className="lg:hidden fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-60">
        <Button
          type="submit"
          size="lg"
          className="w-full shadow-xl shadow-(--color-primary)/25"
          isLoading={isSubmitting}
          disabled={!hasChanges}
        >
          <Save className="w-5 h-5 mr-2" /> Guardar Cambios
        </Button>
      </div>
    </>
  );
}
