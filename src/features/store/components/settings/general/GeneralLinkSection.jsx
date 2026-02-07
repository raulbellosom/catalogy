import { Globe, Copy, Share2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { SettingsSection } from "../layout/SettingsSection";

export function GeneralLinkSection({
  slug,
  initialSlug,
  onSlugChange,
  storeId,
  baseDomain,
  onCopyLink,
  onShare,
}) {
  const storeUrl = `https://${slug}.${baseDomain}`;

  return (
    <SettingsSection
      id="general-link"
      title="Link de tu tienda"
      description="Esta es la dirección pública de tu catálogo."
      icon={Globe}
    >
      <div className="space-y-6">
        <SlugInput
          value={slug}
          initialValue={initialSlug}
          onChange={(event) => onSlugChange(event.target.value)}
          excludeStoreId={storeId}
        />

        <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 bg-(--color-bg-secondary) border border-(--color-border) rounded-xl group hover:border-(--color-primary)/30 transition-colors">
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-(--color-fg-muted) font-medium uppercase tracking-wider mb-0.5">
              URL de la tienda
            </p>
            <p className="text-(--color-fg) font-semibold truncate">
              {slug}.{baseDomain}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-4 rounded-lg bg-(--color-card) shadow-sm hover:text-(--color-primary)"
              onClick={() => onCopyLink(storeUrl)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-4 rounded-lg bg-(--color-card) shadow-sm hover:text-(--color-primary)"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
