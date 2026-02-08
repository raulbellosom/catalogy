import { Store } from "lucide-react";
import { Input } from "@/shared/ui/atoms/Input";
import { SettingsSection } from "../layout/SettingsSection";

export function GeneralBasicsSection({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  whatsapp,
  onWhatsappChange,
  whatsappError,
}) {
  return (
    <SettingsSection
      id="general-basics"
      title="Información Básica"
      description="Detalles principales de tu comercio."
      icon={Store}
    >
      <div className="space-y-4">
        <Input
          label="Nombre de la tienda"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
        <div>
          <label className="text-sm font-medium text-(--color-fg)">
            Descripción
          </label>
          <textarea
            className="w-full mt-1 px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none resize-none"
            rows={4}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            maxLength={500}
          />
        </div>
        <Input
          label="WhatsApp Business / Contacto"
          placeholder="+521234567890"
          value={whatsapp}
          onChange={(event) => onWhatsappChange(event.target.value)}
          error={whatsappError}
          hint="Incluye el código de país (ej. +52). Se usará para el botón de contacto flotante."
        />
      </div>
    </SettingsSection>
  );
}
