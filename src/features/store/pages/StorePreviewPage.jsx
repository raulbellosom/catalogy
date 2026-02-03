import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
      <div className="bg-(--color-primary) text-white py-2 px-4 sticky top-0 z-50 flex items-center justify-between">
        <Link
          to="/app/store"
          className="flex items-center gap-2 text-sm font-medium hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la App
        </Link>
        <div className="text-sm font-medium absolute left-1/2 -translate-x-1/2 hidden sm:block">
          Modo Vista Previa - Solo visible para ti
        </div>
        <div className="w-24" /> {/* Spacer to balance the layout */}
      </div>
      <CatalogPage previewSlug={slug} />
    </div>
  );
}
