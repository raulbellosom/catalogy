import { Save } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";

export function StickySaveButton({ isSubmitting, hasChanges }) {
  return (
    <>
      {/* Spacer for mobile to prevent content being hidden behind the fixed button */}
      <div className="h-24 lg:hidden" aria-hidden="true" />

      {/* Mobile Fixed Button */}
      <div
        className={`
        lg:hidden
        fixed bottom-[80px] left-0 right-0 p-4 z-40
        bg-(--color-card)/80 backdrop-blur-md border-t border-(--color-border)
        safe-bottom
      `}
      >
        <div className="max-w-6xl mx-auto flex justify-end">
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

      {/* Desktop Static Button (parent handles stickiness) */}
      <div className="hidden lg:block lg:sticky lg:top-32 z-10">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!hasChanges}
        >
          <Save className="w-5 h-5 mr-2" /> Guardar Cambios
        </Button>
      </div>
    </>
  );
}
