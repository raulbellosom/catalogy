import { LayoutTemplate } from "lucide-react";
import { TemplateSelector } from "../../TemplateSelector";
import { SettingsSection } from "../layout/SettingsSection";

export function AppearanceTemplateSection({ templateId, onChange }) {
  return (
    <SettingsSection
      id="appearance-template"
      title="Plantilla"
      description="Elige la estructura base de tu tienda."
      icon={LayoutTemplate}
    >
      <TemplateSelector value={templateId} onChange={onChange} />
    </SettingsSection>
  );
}
