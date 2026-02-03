import { useParams } from "react-router-dom";
import { CatalogPage } from "@/features/catalog/pages/CatalogPage";

/**
 * Preview page for store owners
 * Renders the catalog using the store slug from the URL
 */
export function StorePreviewPage() {
  const { slug } = useParams();

  return (
    <div className="store-preview-wrapper relative">
      {/* Preview Banner */}
      <div className="bg-[var(--color-primary)] text-white text-center py-2 text-sm font-medium sticky top-0 z-50">
        Modo Vista Previa - Solo visible para ti
      </div>
      <CatalogPage previewSlug={slug} />
    </div>
  );
}
