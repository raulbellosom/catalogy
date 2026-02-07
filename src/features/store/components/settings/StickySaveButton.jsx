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

      {/* Mobile - Fijo abajo full width, sobre bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] pt-2 px-4 pb-[calc(64px+env(safe-area-inset-bottom,0px))] bg-(--color-card) border-t border-(--color-border) shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg"
            isLoading={isSubmitting}
            disabled={!hasChanges}
          >
            <Save className="w-5 h-5 mr-2" /> Guardar Cambios
          </Button>
        </div>
      </div>
    </>
  );
}
