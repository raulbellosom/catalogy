import { useEffect } from "react";
import { Store as StoreIcon, Loader2, Clock } from "lucide-react";
import { useSubdomainContext } from "@/app/providers";
import { useStoreBySlug, useProducts, useTrackVisit } from "@/shared/hooks";
import { featureFlags } from "@/shared/lib/env";
import { getTemplate, resolveThemeSettings } from "@/templates/registry";
import { PuckRenderer } from "@/features/editor/components/PuckRenderer";

/**
 * Public catalog page
 * Renders store catalog for public viewing via subdomain
 */
export function CatalogPage({ previewSlug, forcedRenderer = null }) {
  const {
    store: subdomainStore,
    user,
  } = useSubdomainContext();

  // Use store from context if on subdomain, otherwise fetch (for preview)
  const {
    data: previewStore,
    isLoading: loadingPreviewStore,
    error: storeError,
  } = useStoreBySlug(previewSlug ? previewSlug : null);

  const store = previewSlug ? previewStore : subdomainStore;
  const loadingStore = previewSlug ? loadingPreviewStore : false;

  // Fetch products if store exists
  const { data: productsData } = useProducts(store?.$id);

  const products = productsData?.documents || [];

  // Track store view for analytics
  const trackVisit = useTrackVisit();
  const isOwner = user?.$id === store?.profileId;

  useEffect(() => {
    // Only track if:
    // 1. Store exists and is loaded
    // 2. Not a preview mode
    // 3. Store is published
    // 4. User is not the owner
    if (store?.$id && !previewSlug && store.published && !isOwner) {
      trackVisit.mutate(store.$id);
    }
  }, [store?.$id, store?.published, previewSlug, isOwner]);

  if (loadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
        <Loader2 className="w-8 h-8 text-(--color-primary) animate-spin" />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-bg) px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-(--color-error-bg) rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-8 h-8 text-(--color-error)" />
          </div>
          <h1 className="text-2xl font-bold text-(--color-fg) mb-2">
            Catálogo no encontrado
          </h1>
          <p className="text-(--color-fg-secondary)">
            Esta tienda no existe o no está disponible públicamente.
          </p>
        </div>
      </div>
    );
  }

  // Security check: If not published and not the owner, don't show products
  // (AppRoutes should prevent this, but this is an extra layer)
  const isAvailable = store.published || isOwner || !!previewSlug;

  if (!isAvailable) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-(--color-warning-bg) rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-(--color-warning)" />
        </div>
        <h1 className="text-3xl font-bold text-(--color-fg) mb-2">
          Catálogo no disponible
        </h1>
        <p className="text-(--color-fg-secondary) mb-8 max-w-md">
          Este catálogo aún no ha sido publicado. Vuelve pronto para ver los
          productos.
        </p>
      </div>
    );
  }

  const template = getTemplate(store.templateId);
  const TemplateComponent = template.component;
  const puckEnabled = featureFlags.enablePuck;
  const rendererFromStore =
    puckEnabled && store?.activeRenderer === "puck" ? "puck" : "template";
  const forcedRendererSafe =
    forcedRenderer === "template"
      ? "template"
      : forcedRenderer === "puck" && puckEnabled
        ? "puck"
        : null;
  const activeRenderer =
    forcedRendererSafe || rendererFromStore;

  /** @type {Record<string, string> | undefined} */
  let themeStyle;
  if (activeRenderer === "template") {
    const theme = resolveThemeSettings(store);
    const { colors, font: fontId } = theme;
    const FONT_MAP = {
      inter: '"Inter", sans-serif',
      merriweather: '"Merriweather", serif',
      jetbrains: '"JetBrains Mono", monospace',
      roboto: '"Roboto", sans-serif',
      playfair: '"Playfair Display", serif',
      montserrat: '"Montserrat", sans-serif',
    };

    /** @type {Record<string, string>} */
    const style = {};
    if (colors.primary) {
      style["--color-primary"] = colors.primary;
      style["--primary"] = colors.primary;
    }
    if (colors.secondary) {
      style["--color-bg"] = colors.secondary;
      style["--background"] = colors.secondary;
    }

    style["--border"] = "var(--color-border)";
    style["--foreground"] = "var(--color-fg)";
    style["--muted"] = "var(--color-bg-tertiary)";
    style["--muted-foreground"] = "var(--color-fg-muted)";
    if (fontId && FONT_MAP[fontId]) style["fontFamily"] = FONT_MAP[fontId];
    themeStyle = style;
  }

  return (
    <div
      className={`transition-colors duration-300 ${activeRenderer === "template" ? "bg-(--color-bg)" : ""}`}
      style={themeStyle}
    >
      {activeRenderer === "puck" ? (
        <PuckRenderer
          store={store}
          products={products}
          isPreview={!!previewSlug}
          previewOffset={previewSlug ? 40 : 0}
        />
      ) : (
        <TemplateComponent
          store={store}
          products={products}
          isPreview={!!previewSlug}
        />
      )}
    </div>
  );
}
