/**
 * NoirGridTemplate
 *
 * Layout oscuro inspirado en catalogos premium.
 */

import {
  Heart,
  Image as ImageIcon,
  Store as StoreIcon,
  Share2,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import { CatalogControls, StorePurchaseInfo } from "../components";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";

const resolveSettings = (settings) => {
  if (!settings) return {};
  if (typeof settings === "string") {
    try {
      return JSON.parse(settings);
    } catch (error) {
      console.warn("Error parsing store.settings:", error);
      return {};
    }
  }
  return settings;
};

const resolveFontFamily = (settings) => {
  const id = settings?.font?.id;
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[id] || "'Inter', sans-serif";
};

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function NoirGridTemplate({ store, products }) {
  const settings = resolveSettings(store?.settings);
  const fontFamily = resolveFontFamily(settings);
  const primary = settings?.colors?.primary || "var(--color-primary)";
  const secondary = settings?.colors?.secondary || "var(--color-primary-hover)";
  const logoUrl = store?.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;
  const {
    categories,
    searchQuery,
    setSearchQuery,
    activeCategoryIds,
    toggleCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    priceBounds,
    filteredProducts,
  } = useCatalogFilters({ store, products });
  const { handleShare, sharedProductId } = useProductShare();

  return (
    <div
      className="min-h-screen bg-[var(--noir-bg)] text-[var(--noir-strong)]"
      style={{
        fontFamily,
        "--noir-bg": "#0d0f10",
        "--noir-surface": "#17191b",
        "--noir-surface-2": "#1f2326",
        "--noir-border": "rgba(255,255,255,0.08)",
        "--noir-muted": "rgba(255,255,255,0.6)",
        "--noir-strong": "#f4f4f5",
        "--noir-accent": primary,
        "--noir-accent-soft": secondary,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:flex flex-col gap-6 rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] p-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${store?.name || "Tienda"} logo`}
                  className="h-12 w-12 rounded-xl object-cover border border-[var(--noir-border)]"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[var(--noir-surface-2)] border border-[var(--noir-border)] flex items-center justify-center">
                  <StoreIcon className="h-6 w-6 text-[var(--noir-muted)]" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--noir-muted)]">
                  Catalogo
                </p>
                <h1 className="text-lg font-semibold">
                  {store?.name || "Tu tienda"}
                </h1>
              </div>
            </div>

            {store?.description && (
              <p className="text-sm text-[var(--noir-muted)] leading-relaxed">
                {store.description}
              </p>
            )}

            <div className="rounded-2xl border border-[var(--noir-border)] bg-[var(--noir-surface-2)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--noir-muted)]">
                Productos
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {products?.length || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--noir-border)] bg-[var(--noir-surface-2)] p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--noir-muted)]">
                Paleta
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-[var(--noir-border)]"
                  style={{ background: primary }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-[var(--noir-border)]"
                  style={{ background: secondary }}
                />
                <span className="text-xs text-[var(--noir-muted)]">
                  Colores del store
                </span>
              </div>
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            <header className="flex flex-col gap-4 rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${store?.name || "Tienda"} logo`}
                      className="h-11 w-11 rounded-xl object-cover border border-[var(--noir-border)]"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-xl bg-[var(--noir-surface-2)] border border-[var(--noir-border)] flex items-center justify-center">
                      <StoreIcon className="h-5 w-5 text-[var(--noir-muted)]" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--noir-muted)]">
                      Coleccion destacada
                    </p>
                    <h1 className="text-2xl font-semibold">
                      {store?.name || "Tu tienda"}
                    </h1>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-[var(--noir-border)] flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[var(--noir-muted)]" />
                </div>
              </div>
              {store?.description && (
                <p className="text-sm text-[var(--noir-muted)] max-w-2xl">
                  {store.description}
                </p>
              )}
            </header>

            <CatalogControls
              tone="noir"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              priceBounds={priceBounds}
              categories={categories}
              activeCategoryIds={activeCategoryIds}
              onToggleCategory={toggleCategory}
            />

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts?.map((product) => {
                // Handle both new imageFileIds array and legacy imageFileId
                const firstImageId =
                  Array.isArray(product.imageFileIds) &&
                  product.imageFileIds.length > 0
                    ? product.imageFileIds[0]
                    : product.imageFileId;
                const imageUrl = firstImageId
                  ? getProductImageUrl(firstImageId)
                  : null;

                return (
                  <article
                    key={product.$id}
                    className="group rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleShare(product)}
                        className="absolute right-4 top-4 h-9 w-9 rounded-full bg-[var(--noir-surface-2)] border border-[var(--noir-border)] flex items-center justify-center text-[var(--noir-muted)] hover:text-[var(--noir-accent)]"
                        aria-label="Compartir producto"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <div className="aspect-square bg-[var(--noir-surface-2)] flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-[var(--noir-muted)]" />
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-semibold text-[var(--noir-strong)] line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-[var(--noir-muted)] line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-[var(--noir-muted)]">
                          {product.currency || "MXN"}
                        </span>
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "var(--noir-accent)" }}
                        >
                          {formatPrice(
                            product.price,
                            product.currency || "MXN",
                          )}
                        </span>
                      </div>
                      {sharedProductId === product.$id && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--noir-muted)]">
                          Copiado
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>

            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] p-10 text-center">
                <p className="text-sm text-[var(--noir-muted)]">
                  No hay productos que coincidan con los filtros.
                </p>
              </div>
            )}

            <StorePurchaseInfo store={store} tone="noir" />
          </main>
        </div>
      </div>
    </div>
  );
}
