import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { SettingsSection } from "../layout/SettingsSection";
import { Image } from "lucide-react";

export function AppearanceLogoSection({
  logoPreviewUrl,
  onUpload,
  onRemove,
  isUploading,
}) {
  return (
    <SettingsSection
      id="appearance-logo"
      title="Logo"
      description="Sube un logo para personalizar tu tienda."
      icon={Image}
    >
      <ImageUpload
        currentImageUrl={logoPreviewUrl}
        onUpload={onUpload}
        onRemove={onRemove}
        isUploading={isUploading}
      />
    </SettingsSection>
  );
}
