import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CatalogPage } from "@/features/catalog/pages/CatalogPage";
import { featureFlags } from "@/shared/lib/env";

/**
 * Preview page for store owners
 * Renders the catalog using the store slug from the URL
 */
export function StorePreviewPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const rendererParam = searchParams.get("renderer");
  const forcedRenderer =
    rendererParam === "template" ||
    (rendererParam === "puck" && featureFlags.enablePuck)
      ? rendererParam
      : null;

  return (
    <div className="store-preview-wrapper relative">
      {/* Preview Banner */}
      <div className="bg-(--color-primary) text-white h-10 px-4 fixed top-0 left-0 right-0 z-[60] flex items-center justify-between">
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
      <CatalogPage previewSlug={slug} forcedRenderer={forcedRenderer} />
    </div>
  );
}
