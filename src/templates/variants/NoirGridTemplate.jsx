import {
  Heart,
  Image as ImageIcon,
  Store as StoreIcon,
  Share2,
  ExternalLink,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  CatalogControls,
  StorePurchaseInfo,
  ProductImageCarousel,
} from "../components";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";

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
      className="min-h-screen flex flex-col bg-(--noir-bg) text-(--noir-strong)"
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
      {/* Navbar Minimalista Integrado */}
      <nav className="sticky top-0 z-50 bg-(--noir-bg)/80 backdrop-blur-md border-b border-(--noir-border)">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={store?.name}
                className="h-8 w-8 rounded-lg object-cover border border-(--noir-border)"
              />
            ) : (
              <Logo className="h-6 w-auto" />
            )}
            <span className="font-bold tracking-tight">
              {store?.name || "Catalogy"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Espacio para acciones futuras del template */}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <main className="flex flex-col gap-8">
          {/* Header de la tienda */}
          <header className="flex flex-col gap-6 rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${store?.name || "Tienda"} logo`}
                    className="h-16 w-16 rounded-2xl object-cover border border-[var(--noir-border)]"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-[var(--noir-surface-2)] border border-[var(--noir-border)] flex items-center justify-center">
                    <StoreIcon className="h-8 w-8 text-[var(--noir-muted)]" />
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--noir-muted)] mb-1">
                    Colección Oficial
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {store?.name || "Tu tienda"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border border-[var(--noir-border)] bg-[var(--noir-surface-2)] flex items-center justify-center">
                  <Heart className="h-6 w-6 text-[var(--noir-muted)]" />
                </div>
              </div>
            </div>

            {store?.description && (
              <p className="text-base text-(--noir-muted) max-w-3xl leading-relaxed">
                {store.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="px-4 py-2 rounded-xl border border-(--noir-border) bg-(--noir-surface-2)">
                <p className="text-[10px] uppercase tracking-[0.2em] text-(--noir-muted)">
                  Productos
                </p>
                <p className="text-xl font-semibold">{products?.length || 0}</p>
              </div>
              <div className="px-4 py-2 rounded-xl border border-[var(--noir-border)] bg-[var(--noir-surface-2)] flex items-center gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--noir-muted)]">
                    Estilo
                  </p>
                  <div className="flex gap-1.5">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: primary }}
                    />
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: secondary }}
                    />
                  </div>
                </div>
              </div>
            </div>
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

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => {
              const imageFileIds = Array.isArray(product.imageFileIds)
                ? product.imageFileIds
                : [];
              const legacyImageFileId = product.imageFileId;

              return (
                <article
                  key={product.$id}
                  className="group rounded-3xl bg-[var(--noir-surface)] border border-[var(--noir-border)] overflow-hidden transition-all duration-300 hover:border-[var(--noir-accent)] hover:-translate-y-1"
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleShare(product)}
                      className="absolute right-4 top-4 h-10 w-10 z-10 rounded-full bg-[var(--noir-surface-2)]/80 backdrop-blur-sm border border-[var(--noir-border)] flex items-center justify-center text-[var(--noir-muted)] hover:text-white transition-colors"
                      aria-label="Compartir producto"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <ProductImageCarousel
                      imageFileIds={imageFileIds}
                      legacyImageFileId={legacyImageFileId}
                      alt={product.name}
                      className="aspect-square bg-[var(--noir-surface-2)]"
                      tone="noir"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--noir-strong)] line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-[var(--noir-muted)] line-clamp-2 leading-relaxed h-10">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--noir-border)]">
                      <span className="text-xs font-medium uppercase tracking-wider text-[var(--noir-muted)]">
                        {product.currency || "MXN"}
                      </span>
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--noir-accent)" }}
                      >
                        {formatPrice(product.price, product.currency || "MXN")}
                      </span>
                    </div>
                    {sharedProductId === product.$id && (
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-[var(--noir-accent)] text-black text-[10px] text-center font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                        Enlace Copiado
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {(!filteredProducts || filteredProducts.length === 0) && (
            <div className="rounded-3xl bg-(--noir-surface) border border-(--noir-border) p-16 text-center">
              <ImageIcon className="h-12 w-12 text-(--noir-muted) mx-auto mb-4 opacity-20" />
              <p className="text-(--noir-muted) font-medium">
                No encontramos productos con esos filtros.
              </p>
            </div>
          )}

          <StorePurchaseInfo store={store} tone="noir" />
        </main>
      </div>

      {/* Footer Personalizado */}
      <footer className="mt-12 bg-[var(--noir-surface)] border-t border-[var(--noir-border)] py-12">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-xl font-bold">{store?.name}</h4>
            <p className="text-sm text-[var(--noir-muted)] max-w-md">
              Gracias por visitar nuestro catálogo oficial.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--noir-surface-2)] border border-[var(--noir-border)] max-w-lg w-full">
            <h5 className="font-semibold mb-2">
              ¿Quieres crear tu propio catálogo?
            </h5>
            <p className="text-sm text-[var(--noir-muted)] mb-6">
              Únete a cientos de emprendedores que ya usan Catalogy para vender
              más.
            </p>
            <a
              href={`${appConfig.baseUrl}/auth/register`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              Comenzar Gratis
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-4 text-[var(--noir-muted)]">
            <div className="flex items-center gap-2 text-sm">
              <span>Powered by</span>
              <a
                href={appConfig.baseUrl}
                className="hover:text-white transition-colors"
              >
                <Logo className="h-4 w-auto grayscale brightness-200" />
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-widest opacity-50">
              © {new Date().getFullYear()} {store?.name}. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
