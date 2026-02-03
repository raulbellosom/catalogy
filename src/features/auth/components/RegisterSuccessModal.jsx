import { Info } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Modal, ModalFooter } from "@/shared/ui/molecules";

export function RegisterSuccessModal({ isOpen, onClose, onNavigate }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="¡Cuenta creada exitosamente!"
      description="Te hemos enviado un correo de verificación."
      size="md"
      footer={
        <ModalFooter>
          <Button onClick={onNavigate} className="w-full sm:w-auto">
            Ir a iniciar sesión
          </Button>
        </ModalFooter>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-fg-secondary)]">
            Por favor verifica tu correo antes de iniciar sesión. Revisa tu
            bandeja de entrada y haz clic en el enlace de verificación.
          </p>
        </div>

        <p className="text-sm text-[var(--color-fg-muted)]">
          Si no recibes el correo en los próximos minutos, revisa tu carpeta de
          spam.
        </p>
      </div>
    </Modal>
  );
}
