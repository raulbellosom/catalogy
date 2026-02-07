import { Link as LinkIcon } from "lucide-react";
import { Input } from "@/shared/ui/atoms/Input";
import { SettingsSection } from "../layout/SettingsSection";

export function GeneralPurchaseSection({
  paymentLink,
  onPaymentLinkChange,
  paymentLinkError,
  purchaseInstructions,
  onPurchaseInstructionsChange,
}) {
  return (
    <SettingsSection
      id="general-purchase"
      title="Instrucciones de compra"
      description="Explica cómo comprar y agrega un link de pago si aplica."
      icon={LinkIcon}
    >
      <Input
        label="Link de pago (opcional)"
        placeholder="https://..."
        value={paymentLink}
        onChange={(event) => onPaymentLinkChange(event.target.value)}
        error={paymentLinkError}
      />

      <div>
        <label className="text-sm font-medium text-(--color-fg)">
          Instrucciones (opcional)
        </label>
        <textarea
          className="w-full mt-1 px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none resize-none"
          rows={4}
          value={purchaseInstructions}
          onChange={(event) => onPurchaseInstructionsChange(event.target.value)}
          maxLength={2000}
          placeholder="Ej. Haz tu pedido por WhatsApp y completa el pago con el link de arriba."
        />
      </div>
    </SettingsSection>
  );
}
