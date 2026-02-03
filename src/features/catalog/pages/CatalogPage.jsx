import { Store as StoreIcon, Loader2, Clock } from "lucide-react";
import { useSubdomainContext } from "@/app/providers";
import { useStoreBySlug, useProducts } from "@/shared/hooks";
import { getTemplate } from "@/templates/registry";
import { PuckRenderer } from "@/features/editor/components/PuckRenderer";
import { EmptyCatalog } from "../components/EmptyCatalog";
import { ProductCard } from "../components/ProductCard";

/**
 * Public catalog page
 * Renders store catalog for public viewing via subdomain
 */
export function CatalogPage({ previewSlug }) {
  const {
    slug: subdomainSlug,
    store: subdomainStore,
    user,
  } = useSubdomainContext();
  const slug = previewSlug || subdomainSlug;

  // Use store from context if on subdomain, otherwise fetch (for preview)
  const {
    data: previewStore,
    isLoading: loadingPreviewStore,
    error: storeError,
  } = useStoreBySlug(previewSlug ? previewSlug : null);

  const store = previewSlug ? previewStore : subdomainStore;
  const loadingStore = previewSlug ? loadingPreviewStore : false;

  // Fetch products if store exists
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
  );

  const products = productsData?.documents || [];

  if (loadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--color-error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-8 h-8 text-[var(--color-error)]" />
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
  const isOwner = user?.$id === store.profileId;
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
  const activeRenderer = store?.activeRenderer === "puck" ? "puck" : "template";

  // Theme override from store.settings (optional)
  const themeStyle = (() => {
    const settings =
      typeof store?.settings === "string"
        ? JSON.parse(store.settings || "{}")
        : store?.settings || {};

    const colors = settings.colors || {};
    const fontId = settings.font;

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
      style["--color-primary-hover"] = colors.secondary;
      style["--primary-hover"] = colors.secondary;
    }

    // Standard theme aliases
    style["--border"] = "var(--color-border)";
    style["--background"] = "var(--color-bg)";
    style["--foreground"] = "var(--color-fg)";
    style["--muted"] = "var(--color-bg-tertiary)";
    style["--muted-foreground"] = "var(--color-fg-muted)";

    if (fontId && FONT_MAP[fontId]) style["fontFamily"] = FONT_MAP[fontId];
    return style;
  })();

  return (
    <div
      className="bg-(--color-bg) transition-colors duration-300"
      style={themeStyle}
    >
      {activeRenderer === "puck" ? (
        <PuckRenderer store={store} products={products} />
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

// TODO: The following components were previously defined here but might be useful in templates directly or context
// ProductsGrid, ProductCard, EmptyProducts
// They have been extracted to components/ or are used inside TemplateComponents (which is distinct)
// The original CatalogPage rendered TemplateComponent which might USE these internally?
// Wait, TemplateComponent (like MinimalTemplate) takes `products` as prop.
// Does it use `ProductCard`?
// If `MinimalTemplate` imports `ProductCard` from somewhere, we should ensure it matches.
// In this refactor, I moved `ProductCard` to `src/features/catalog/components/ProductCard.jsx`.
// If existing templates are using a local version, they might need updates, or they have their own.
// But `CatalogPage` logic above does NOT render `ProductCard` directly.
// It renders `TemplateComponent`.
// The extracted components `EmptyCatalog` and `ProductCard` are valuable if `TemplateComponent` uses them.
// Let's check if I should have modified `TemplateComponent`?
// The user asked to refactor `CatalogPage`.
// The file `CatalogPage.jsx` *contained* `ProductCard` and `EmptyProducts` definitions at the bottom (lines 168+).
// But were they USED?
// Looking at lines 155-160 in original code:
// <TemplateComponent store={store} products={products} ... />
// The `ProductsGrid`, `ProductCard`, `EmptyProducts` defined at bottom of `CatalogPage.jsx` were NOT used in the `CatalogPage` component itself (lines 22-163).
// They seem to be unused exports or dead code in this file if `TemplateComponent` handles rendering?
// Or maybe they were exported for templates to use?
// The original code didn't export them.
// `function ProductsGrid`... `function ProductCard`... were not exported.
// So they were likely DEAD CODE in `CatalogPage.jsx`?
// Or maybe I missed something.
// Let's re-read line 22-163.
// `CatalogPage` returns `<TemplateComponent ... />`.
// It does NOT use `ProductCard` or `ProductsGrid`.
// So the code at the bottom of `CatalogPage.jsx` was likely vestigial or copied code that wasn't being used by `CatalogPage` itself.
// However, to be safe, I've extracted them.
// If they were truly unused, removing them is good cleanup.
// I will keep the extracted files just in case other templates import them (but they weren't exported).
// If they weren't exported, no one could import them.
// So they were local logic that was unused?
// Actually, `MinimalTemplate` might want to use them if we refactor it too.
// For now, `CatalogPage` is cleaned up.
